/*******************************************************************************/
/*                    (C) Copyright 2019 by Safran Aircraft Engines            */
/*                             All rights reserved                             */
/*******************************************************************************/
/*
+-------------------------------------------------------------------------------+
| Revision |    Date    |     Author     |                Issue                 |
+-------------------------------------------------------------------------------+
|     1    | JJ/MM/AAAA |   Safran       | Initial version                      |
|                                                                               |
| https://jazz.net/wiki/bin/view/Main/RMExtensions6061                          |
+-------------------------------------------------------------------------------+
*/

/* ------------------------------------------------------------------------------
	---- Constantes
   --------------------------------------------------------------------------- */

// ---- Templates

/* ------------------------------------------------------------------------------
	---- Classes
   --------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------
   ---- Variables globales
   --------------------------------------------------------------------------- */

var g_projectList = [];          // ---- RM Projects List

var g_refProject        = null;  // ---- Reference Project (ELMProject object)
var g_refComponent      = null;  // ---- Reference Component (ELMComponent object)
var g_refConfiguration  = null;  // ---- Reference Configuration (ELMConfiguration object)

var g_refDataModel = new DMAggregator ();
var g_chkDataModel = new DMAggregator ();

var g_chkProject        = null;  // ---- Project to check

/* ------------------------------------------------------------------------------
	---- Core Fonctions
   --------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------- */

/**
 * Request to get RM Projects List
 * @param {String} hostname - RM Hostname
 */

function get_projectList (hostname) {
   let myRMRequest = {
      'rest_method'     : "GET",
      'rest_url'        : hostname + "/rm/process/project-areas",
      'successCallback' : success_projectList,
      'errorCallback'   : failed_projectList
   };

   $('#' + GUI_DIV_MSG_ERROR_02).hide();

   queueManager.addToQueue (myRMRequest);
}

/**
 * Get Projects List
 * @param {String} data - XML REST Response
 */

function success_projectList (data) {
   let xmlData = $.parseXML(data);

   g_projectList.splice(0);

   $(xmlData).find(JP06_PROJECTAREA).each(function() { // ---- Loop on each project area
      let myProject = new ELMProject ($(this).attr(JP060_NAME));

      myProject.init ($(this).children());

      g_projectList.push(myProject);
   });

   // ---- Set project buttons

   gui_BuildProjectBtn (g_projectList, GUI_BTN_REFPROJECT);
   gui_BuildProjectBtn (g_projectList, GUI_BTN_CHKPROJECT);

   // ---- Init dependancies

   gui_Init (GUI_BTN_REFCOMPONENT);
   gui_Init (GUI_BTN_REFCONFIGURATION);
}

/**
 * Get Projects List (failed)
 */

function failed_projectList () {
   g_projectList.splice(0);

   gui_mgtButtonSplitDrop (GUI_BTN_REFPROJECT, ACTION_ACTIVE_OFF);
   gui_mgtButtonSplitDrop (GUI_BTN_REFCOMPONENT, ACTION_ACTIVE_OFF);
   gui_mgtButtonSplitDrop (GUI_BTN_REFCONFIGURATION, ACTION_ACTIVE_OFF);

   gui_mgtButtonSplitDrop (GUI_BTN_CHKPROJECT, ACTION_ACTIVE_OFF);

   mgt_Console ("Get projects List request has failed.", CONSOLE_ERROR);

   $('#' + GUI_DIV_MSG_ERROR_02).show();
}

/* --------------------------------------------------------------------------- */

/**
 * Request to get RM Components List from a selected project
 * @param {Object} project - ELMProject object
 */

function get_refComponentList (project) {
   let myRMRequest = {
      'rest_method'     : "GET",
      'rest_url'        : project.get_componentListURL(),
      'successCallback' : success_refComponentList,
      'successArg'      : project,
      'errorCallback'   : failed_refComponentList,
      'errorArg'        : project
   };

   project.clear_componentList();

   queueManager.addToQueue (myRMRequest);
}

/**
 * Get Components List
 * @param {Object} project - ELMProject object
 * @param {String} data - XML REST Response
 */

function success_refComponentList (project, data) {
   let xmlData = $.parseXML(data);

   $(xmlData).find(JP06_PROJECTAREA).each(function() { // ---- Loop on each component
      let myComponent = new ELMComponent ($(this).attr(JP060_NAME));

      myComponent.init ($(this).children());

      project.add_component(myComponent);
   });

   gui_BuildRefComponentBtn (project.get_componentList(), GUI_BTN_REFCOMPONENT);

   // ---- Init dependancies

   gui_Init (GUI_BTN_REFCONFIGURATION);
}

/**
 * Get Components List (failed)
 * @param {Object} project - ELMProject object
 */

function failed_refComponentList (project) {
   project.clear_componentList();

   gui_mgtButtonSplitDrop (GUI_BTN_REFCOMPONENT, ACTION_ACTIVE_OFF);
   gui_mgtButtonSplitDrop (GUI_BTN_REFCONFIGURATION, ACTION_ACTIVE_OFF);

   mgt_Console ("Get components List request has failed.", CONSOLE_ERROR);

   $('#' + GUI_DIV_MSG_ERROR_02).show();
}

/* --------------------------------------------------------------------------- */

/**
 * Request to get RM Configurations List from a selected component
 * @param {Object} component - ELMComponent object
 */

function get_refConfigurationList (component) {
   let myRMRequest = {
      'rest_method'     : "GET",
      'rest_url'        : component.get_configurationListURL(),
      'successCallback' : success_refConfigurationList,
      'successArg'      : component,
      'errorCallback'   : failed_refConfigurationList,
      'errorArg'        : component
   };

   component.clear_configurationList();

   queueManager.addToQueue (myRMRequest);
}

/**
 * Get Configurations List
 * @param {Object} component - ELMComponent object
 * @param {String} data - XML REST Response
 */

function success_refConfigurationList (component, data) {
   let xmlData = $.parseXML(data);

   $(xmlData).find(RDF_DESCRIPTION).children(RDFS_MEMBER).each(function() { // ---- Loop on each configuration
      let myConfiguration = new ELMConfiguration ();
      
      myConfiguration.init ($(this));

      component.add_configuration(myConfiguration);
   });

   // ---- Create draft button (Configuration real name not known !)

   gui_BuildRefConfigurationBtn (component.get_configurationList(), GUI_BTN_REFCONFIGURATION);

   // ---- Update configuration (because first call does not return all configuration details !)

   update_refConfigurationList (component.get_configurationList());
}

/**
 * Get Configurations List (failed)
 * @param {Object} component - ELMComponent object
 */

function failed_refConfigurationList (component) {
   component.clear_configurationList();

   gui_mgtButtonSplitDrop (GUI_BTN_REFCONFIGURATION, ACTION_ACTIVE_OFF);

   mgt_Console ("Get configurations List request has failed.", CONSOLE_ERROR);

   $('#' + GUI_DIV_MSG_ERROR_02).show();
}

/**
 * Request to update RM Configurations List
 * @param {Object} configurationList - Array of ELMConfiguration object
 */

function update_refConfigurationList (configurationList) {
   for (let myConfiguration of configurationList) {
      let myRMRequest = {
         'rest_method'     : "GET",
         'rest_url'        : myConfiguration.get_uri(),
         'successCallback' : success_updateRefConfiguration,
         'successArg'      : myConfiguration,
         'errorCallback'   : failed_updateRefConfiguration,
         'errorArg'        : myConfiguration
      };

      queueManager.addToQueue (myRMRequest);
   }
}

/**
 * Update Configuration Details
 * @param {Object} configuration - ELMConfiguration Object
 * @param {String} data - XML REST Response
 */

function success_updateRefConfiguration (configuration, data) {
   configuration.update(data);

   gui_UpdateRefConfigurationBtn (configuration);
}

/**
 * Update Configurations List (failed)
 * @param {Object} configuration - ELMConfiguration object
 * @param {BigInteger} httpCode - HTTP code
 */

function failed_updateRefConfiguration (configuration, httpCode) {
   if (httpCode != 404) { // ---- For archived stream or baseline, return code = 404 !
      gui_mgtButtonSplitDrop (GUI_BTN_REFCONFIGURATION, ACTION_ACTIVE_OFF);

      mgt_Console ("Update configurations List request has failed.", CONSOLE_ERROR);

      $('#' + GUI_DIV_MSG_ERROR_02).show();
   } else {
      configuration.set_isarchived();

      gui_UpdateRefConfigurationBtn (configuration);

      mgt_Console ("Archived Steam or Baseline found !", CONSOLE_WARNING);
   }
}

/* --------------------------------------------------------------------------- */

/** Initialisation de l'IHM du widget */

function view_init () {

   // ---- Init GUI

   gui_mgtButtonSplitDrop (GUI_BTN_REFPROJECT, ACTION_ACTIVE_OFF);
   gui_mgtButtonSplitDrop (GUI_BTN_CHKPROJECT, ACTION_ACTIVE_OFF);

   $('#' + GUI_BTN_CHKSTART).prop('disabled', true);
   $('#' + GUI_BTN_EXPORTCOMPAREREPORT).prop('disabled', true);
   $('#' + GUI_BTN_EXPORTDATAMODELREPORT).prop('disabled', true);

   // ---- Bootstrap : initialisation "popover"

   $(function () {
      $('[data-bs-toggle="popover"]').popover()
   });

   // ---- Init Handlerbars Helpers
   // ---- Helpers are used to extract and display data from complex objects

   Handlebars.registerHelper("dmItem_getname", function () {
      return this.get_name();
   });

   Handlebars.registerHelper("dmItem_geturi", function () {
      let myURI = this.get_uri();

      return (myURI !== null ? myURI : "Not Defined");
   });

   Handlebars.registerHelper("dmItem_getdescription", function () {
      let myDescription = this.get_description();

      return (myDescription !== null ? myDescription : "No Description !");
   });

   Handlebars.registerHelper("rmItem_getid", function () {
      return this.get_shortid();
   });

   Handlebars.registerHelper("datatype_getbasetype", function () { // ---- To display Data Types values
      let myTypeList = [];

      if (this.is_enum()) {
         for (let myEnumValue of this.get_enumValuesList(true)) {
            myTypeList.push(myEnumValue.title);
         }

         return new Handlebars.SafeString(myTypeList.join('<br>'));
      } else {
         return this.get_valueType();
      }
   });

   Handlebars.registerHelper("attribute_gettype", function () { // ---- To display attribute Data Type
      let myDataType;

      myDataType = g_refDataModel.get_dataTypebyId(this.get_range());

      return myDataType.get_name();
   });

   Handlebars.registerHelper("attribute_ismultivalued", function () { // ---- To display attribute Multi Value status
      return this.get_multiValuedText();
   });

   Handlebars.registerHelper("artifact_getattribute", function () { // ---- To display artifact type attributes list
      let myHtmlContent   = "";
      let myAttributeList = [];
      let mySortedAttributeList;

      for (let myAttributeId of this.get_attributeList()) {
         let myAttribute = g_refDataModel.get_AttributebyId(myAttributeId);

         myAttributeList.push(myAttribute.get_name());
      }

      mySortedAttributeList = myAttributeList.sort();

      myHtmlContent = mySortedAttributeList.join('<br>');

      return new Handlebars.SafeString(myHtmlContent);
   });

   Handlebars.registerHelper("linktype_getincoming", function () { // ---- To display Incoming link definition
      return this.get_incomingLabel();
   });

   Handlebars.registerHelper("linktype_getoutgoing", function () { // ---- To display Outgoing link definition
      return this.get_outgoingLabel();
   });

   Handlebars.registerHelper("event_getType", function () { // ---- To display compare event type
      let myHtmlContent = "";

      switch (this.get_type()) {
         case EVENT_INFO:
            myHtmlContent = '<img src="' + GUI_ICON_INFO + '" alt="Information" width="25px">';
            break;

         case EVENT_WARNING:
            myHtmlContent = '<img src="' + GUI_ICON_WARNING + '" alt="Warning" width="25px">';
            break;

         case EVENT_ERROR:
            myHtmlContent = '<img src="' + GUI_ICON_FAILED + '" alt="Error" width="25px">';
            break;
         
         default:
            myHtmlContent = '<img src="' + GUI_ICON_HELP + '" alt="What is that ?" width="25px">';
      };

      return new Handlebars.SafeString(myHtmlContent);
   });

   Handlebars.registerHelper("event_getConfiguration", function () { // ---- To display checked configuration name
      let myHtmlContent = "";
      let myTargetConfiguration = this.get_target();

      myHtmlContent = '<a href="' + myTargetConfiguration.get_uri() + '" target="_blank">' + myTargetConfiguration.get_name() + '</a>';

      return new Handlebars.SafeString(myHtmlContent);
   });

   Handlebars.registerHelper("event_getDescription", function () { // ---- To display compare event title
      return this.get_message();
   });

   Handlebars.registerHelper("event_getTarget", function () { // ---- To display impacted object
      return this.get_impactedObjectName();
   });

   Handlebars.registerHelper("event_getTargetAlias", function () { // ---- To display impacted object
      return this.get_impactedObjectTypeAlias();
   });

   // ---- Set event handlers

   $('#' + GUI_BTN_CHKSTART).on('click', event_startChecker);
   $('#' + GUI_BTN_EXPORTDATAMODELREPORT).on('click', event_exportDataModelReport);
   $('#' + GUI_BTN_EXPORTCOMPAREREPORT).on('click', event_exportCheckReport);

   // ---- Let's go ...

   get_projectList (RM_HOSTNAME);
}

