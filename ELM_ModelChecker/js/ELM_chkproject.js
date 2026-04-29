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

const GUI_TD_NBCOMPONENT         = "gui_nbchkcomponent";
const GUI_TD_NBSTREAM            = "gui_nbchkstream";
const GUI_TD_NBBASELINE          = "gui_nbchkbaseline";
const GUI_TD_NBARCCONF           = "gui_nbchkarchivedconf";

/* ------------------------------------------------------------------------------
	---- Classes
   --------------------------------------------------------------------------- */

class RMCheckerReport {
   constructor () {
      this.project            = null;     // ---- Project to be checked (ELMProject object)
      this.componentList      = [];       // ---- Components List to be checked (Array of ELMComponent objects)
      this.configurationList  = [];       // ---- Configurations List to be checked (Array of ELMConfiguration objects)
      this.eventList          = [];       // ---- Compare Events List (Array of CHKEvent objects)
   }
   
   reset () { // ---- Reset the data structure
      this.project = null;
      this.componentList.splice(0);
      this.configurationList.splice(0);
      this.eventList.splice(0);   
   }

   push_ELMObject (element) { // ---- Add a new element to the data structure
      switch (element.constructor.name) {
         case "ELMProject": // ---- Set the checked project
            this.reset();
            this.project = element;
            break;

         case "ELMComponent": // ---- Push checked component
            this.componentList.push(element);
            this.componentList.sort((a,b) => (a.get_name() > b.get_name()) ? 1 : -1);
            break;

         case "ELMConfiguration": // ---- Push configuration
            this.configurationList.push(element);
            this.configurationList.sort((a,b) => (a.get_name() > b.get_name()) ? 1 : -1);
            break;
         
         default:
            mgt_Console ("Contructor name not found !" + element.constructor.name, CONSOLE_WARNING);
      };
   }

   /**
    * Add a new event or list of events
    * @param {Object} element - CHKEvent object or array of CHKEvent objects
    */

   push_event (element) { // ---- Add a new CHKEvent object or list of CHKEvent objects
      if (Array.isArray(element)) {
         this.eventList = this.eventList.concat(element);
      } else {
         this.eventList.push(element);
      }

      return this.eventList;
   }

   get_project () { // ---- Get checked project
      return this.project;
   }

   get_componentList () { // ---- Get component list
      return this.componentList;
   }

   /**
    * Get configuration list
    * @param {Boolean} isAchived - Configuration archive state (if not provided, all configurations are returned)
    */

   get_configurationList(isAchived) { // ---- Get configuration list
      if (isAchived === undefined) {
         return this.configurationList;
      } else if (isAchived) {
         return this.configurationList.filter((configuration) => configuration.get_isarchived() === true);
      } else {
         return this.configurationList.filter((configuration) => configuration.get_isarchived() === false);
      }
   }

   /**
    * Get configuration list by type
    * @param {String} type - Configuration type (CFG_STREAM or CFG_BASELINE, optional, if not provided, all configurations are returned)
    */

   get_configurationListbyType(type) {
      const CFG_STREAM = "stream";
      const CFG_BASELINE = "baseline";

      let myConfigurationList = [];

      if (type === undefined) {
         return this.get_configurationList();
      } else {
         switch (type) {
            case CFG_STREAM:
               myConfigurationList = this.get_configurationList().filter((configuration) => configuration.get_type().toLowerCase() === CFG_STREAM);
               break;
            
            case CFG_BASELINE:
               myConfigurationList = this.get_configurationList().filter((configuration) => configuration.get_type().toLowerCase() === CFG_BASELINE);
               break;

            default: // ---- Bad type specified, so return all !
               myConfigurationList = this.get_configurationList();
         }

         return myConfigurationList;
      }
   }

   /**
    * Get report events list
    * @param {Boolean} filtered - Remove duplicated objets ("true", remove duplicated objects, "false", keep the original list)
    * @returns - Array of CHKEvent objects
    */

   get_eventList (filtered) {
      function generateKey (event) { // ---- Create uniq key for each object
         const eventTarget = event.get_targetName();
         const eventMsg    = event.get_message();
         const eventObject = event.get_impactedObjectName();

         return `${eventTarget}_${eventMsg}_${eventObject}`;
      }

      function removeDuplicates (arr) { // ---- Remove duplicated objects
         const seen = new Set();

         return arr.filter(event => {
             const key = generateKey(event); // ---- Create a uniq key

             if (seen.has(key)) {
                 return false; // ---- If key is in Set, filter object
             } else {
                 seen.add(key); // ---- Else, add key in Set and keep object
                 return true;
             }
         });
      }

      if (filtered === undefined && filtered !== true) {
         return this.eventList;
      } else {
         return removeDuplicates(this.eventList);
      }
   }

   /**
    * Get report events by type
    * @param {String} type - Event type (EVENT_INFO, EVENT_WARNING or EVENT_ERROR, optional, if not provided, all events are returned)
    */

   get_eventListbyType (type) {
      if (type === undefined) {
         return this.get_eventList();
      } else {
         return this.get_eventList().filter(event => event.get_type() === type);
      }
   }
}
 
/* ------------------------------------------------------------------------------
   ---- Variables globales
   --------------------------------------------------------------------------- */

var g_RMCheckerReport = new RMCheckerReport ();

/* ------------------------------------------------------------------------------
   ---- Core Fonctions
   --------------------------------------------------------------------------- */

/**
 * The "Start Checker" button is pressed
 */

function get_chkComponentList (project) {
   let myRMRequest = {
      'rest_method'     : "GET",
      'rest_url'        : project.get_componentListURL(),
      'successCallback' : success_chkComponentList,
      'successArg'      : project,
      'errorCallback'   : failed_chkComponentList
   };

   project.clear_componentList();

   $('#' + GUI_DIV_CHKCOMPONENTSELECTOR).empty();

   // ---- Start with list of all project's components

   queueManager.addToQueue (myRMRequest);
}

/**
 * Get Components List
 * @param {Object} project - ELMProject object
 * @param {String} data - XML REST Response
 */

function success_chkComponentList (project, data) {
   let xmlData = $.parseXML(data);

   $(xmlData).find(JP06_PROJECTAREA).each(function() { // ---- Loop on each component
      let myComponent = new ELMComponent ($(this).attr(JP060_NAME));

      myComponent.init ($(this).children());

      project.add_component(myComponent);
   });

   display_ObjectTypes(project.get_componentList(), GUI_DIV_CHKCOMPONENTSELECTOR, HB_TEMPLATE_COMPONENTTOCKH);

   // ---- Add event on component selectors

   for (let myComponent of project.get_componentList()) {
      $("#" + GUI_CHK_COMPONENTSEL_ROOT + myComponent.get_shortid()).prop('checked', false);

      myComponent.toscan_off();

      $("#" + GUI_CHK_COMPONENTSEL_ROOT + myComponent.get_shortid()).change (function () { // ---- Get event each component selector
         if ($(this).is(':checked')) {
            myComponent.toscan_on();

            mgt_Console("Scan set 'on' for : " + myComponent.get_name(), CONSOLE_INFO);
         } else {
            myComponent.toscan_off();
         }
      });
   }

   // ---- Ready to scan selected components

   $('#' + GUI_BTN_CHKSTART).prop('disabled', false);
}

/**
 * Get Components List (failed)
 */

function failed_chkComponentList () {
   const INFOMSG = "Get check components List request has failed !";

   mgt_Console(INFOMSG, CONSOLE_ERROR);

   $('#' + GUI_DIV_MSG_ERROR_02).show();
}

/* --------------------------------------------------------------------------- */

/**
 * Request to get RM Configurations List from a selected component
 * @param {Object} component - ELMComponent object
 */

function get_chkConfigurationList (component) {
   let myRMRequest = {
      'rest_method'     : "GET",
      'rest_url'        : component.get_configurationListURL(),
      'successCallback' : success_chkConfigurationList,
      'successArg'      : component,
      'errorCallback'   : failed_chkConfigurationList
   };

   component.clear_configurationList();

   chkqueueManager.addToQueue (myRMRequest);
}

/**
 * Get Configurations List
 * @param {Object} component - ELMComponent object
 * @param {String} data - XML REST Response
 */

function success_chkConfigurationList (component, data) {
   let xmlData = $.parseXML(data);

   $(xmlData).find(RDF_DESCRIPTION).children(RDFS_MEMBER).each(function() { // ---- Loop on each configuration
      let myConfiguration = new ELMConfiguration ();
      
      myConfiguration.init ($(this));

      component.add_configuration(myConfiguration);
   });

   // ---- Update configuration (because first call does not return all configuration details !)

   update_cgkConfigurationList (component.get_configurationList());
}

/**
 * Get Configurations List (failed)
 */

function failed_chkConfigurationList () {
   const INFOMSG = "Get check configurations List request has failed !";
   
   mgt_Console(INFOMSG, CONSOLE_ERROR);

   $('#' + GUI_DIV_MSG_ERROR_02).show();
}

/**
 * Request to update RM Configurations List
 * @param {Object} configurationList - Array of ELMConfiguration object
 */

function update_cgkConfigurationList (configurationList) {
   for (let myConfiguration of configurationList) {
      let myRMRequest = {
         'rest_method'     : "GET",
         'rest_url'        : myConfiguration.get_uri(),
         'successCallback' : success_updatechkConfiguration,
         'successArg'      : myConfiguration,
         'errorCallback'   : failed_updatechkConfiguration,
         'errorArg'        : myConfiguration
      };

      chkqueueManager.addToQueue (myRMRequest);
   }
}

/**
 * Update Configuration Details
 * @param {Object} configuration - ELMConfiguration Object
 * @param {String} data - XML REST Response
 */

function success_updatechkConfiguration (configuration, data) {
   let myRMRequest = {
      'rest_method'     : "GET",
      'rest_url'        : g_chkProject.get_hostname() + "/rm/types?accept=*&private=true&refreshTypeFeedCacheFromJFS=true&resourceContext=" + g_chkProject.get_hostname() + "/rm/process/project-areas/" + g_chkProject.get_shortid() + "&vvc.configuration=" + configuration.get_uri(),
      'cache'           : false,
      'successCallback' : success_chkELMDataModel,
      'successArg'      : configuration,
      'errorCallback'   : failed_chkELMDataModel
   };

   configuration.update(data);

   g_RMCheckerReport.push_ELMObject(configuration);

   $("#" + GUI_TD_NBSTREAM).text(g_RMCheckerReport.get_configurationListbyType(CFG_STREAM).length);
   $("#" + GUI_TD_NBBASELINE).text(g_RMCheckerReport.get_configurationListbyType(CFG_BASELINE).length);

   $("#" + GUI_TD_NBARCCONF).text(g_RMCheckerReport.get_configurationList(true).length);

   // ---- Get configuration Data Model (for stream, only !!)

   if (configuration.get_type() === CFG_STREAM) {
      chkqueueManager.addToQueue (myRMRequest);
   }
}

/**
 * Update Configurations List (failed)
 * @param {Object} configuration - ELMConfiguration object
 * @param {BigInteger} httpCode - HTTP code
 */

function failed_updatechkConfiguration (configuration, httpCode) {
   if (httpCode != 404) { // ---- For archived stream or baseline, return code = 404 !
      const INFOMSG = "Update check configurations List request has failed !";

      mgt_Console(INFOMSG, CONSOLE_ERROR);

      $('#' + GUI_DIV_MSG_ERROR_02).show();
   } else {
      configuration.set_isarchived();

      g_RMCheckerReport.push_ELMObject(configuration);

      $("#" + GUI_TD_NBARCCONF).text(g_RMCheckerReport.get_configurationList(true).length);

      mgt_Console ("Archived Steam or Baseline found !", CONSOLE_WARNING);
   }
}

/* --------------------------------------------------------------------------- */

/**
  * Get RM Data Model
  * @param {Object} configuration - ELMConfiguration Object
  * @param {String} data - REST response
  */

function success_chkELMDataModel (configuration, data) {
   let myEventList = [];
   let chkDataModel = new DMAggregator (configuration);
   let xmlData = $.parseXML(data);

   mgt_Console("Check configuration : " + configuration.get_name(), CONSOLE_INFO);

   // ---- Get Data Types

   chkDataModel.init(get_ELMDataTypeDefinition(xmlData));
   
   // ---- Get Attributes

   chkDataModel.init(get_ELMAttributeDefinition(xmlData));

   // ---- Get Artifact Types

   chkDataModel.init(get_ELMArtifactTypeDefinition(xmlData));

   // ---- Get Link Definition

   chkDataModel.init(get_ELMLinkTypeDefinition(xmlData));

   // ---- Compare Data Models

   myEventList = compare_ELMDataModel (g_refDataModel, chkDataModel);

   // ---- Store compare events in report object

   g_RMCheckerReport.push_event(myEventList);

   display_compareReport(g_refProject, g_refComponent, g_refConfiguration, g_RMCheckerReport);
}

/**
 * RM Data Model request has failed !
 */

function failed_chkELMDataModel () {
   mgt_Console ("Failed to get Data Model to check !", CONSOLE_ERROR);

   $('#' + GUI_DIV_MSG_ERROR_02).show();
}

/* --------------------------------------------------------------------------- */

/**
 * Start Data Model Compare Operation
 */

function event_startChecker () {
   
   mgt_Console ("Start Checker is pressed !", CONSOLE_INFO);

   // ---- Clear Report

   $("#" + GUI_TD_NBCOMPONENT).empty();
   $("#" + GUI_TD_NBSTREAM).empty();
   $("#" + GUI_TD_NBBASELINE).empty();
   $("#" + GUI_TD_NBARCCONF).empty();

   $('#' + GUI_DIV_REPORTSUMMARY).hide();
   $('#' + GUI_DIV_REPORTDETAILS).hide();

   $('#' + GUI_DIV_MSG_ERROR_02).hide();

   if (g_refConfiguration === undefined) {
      $('#' + GUI_DIV_MSG_ERROR_01).show();
   } else {
      $('#' + GUI_DIV_MSG_ERROR_01).hide();
   }

   $('#' + GUI_BTN_EXPORTCOMPAREREPORT).prop('disabled', true);

   // ---- Init compare report with project to check

   g_RMCheckerReport.push_ELMObject(g_chkProject);

   // ---- Loop on selected project's components to check

   for (let mychkComponent of g_chkProject.get_componentList()) {
      if (mychkComponent.get_scanstatus() && g_refConfiguration !== undefined) {
         g_RMCheckerReport.push_ELMObject(mychkComponent);

         $("#" + GUI_TD_NBCOMPONENT).text(g_RMCheckerReport.get_componentList().length);

         get_chkConfigurationList(mychkComponent);

         mgt_Console("Check component : " + mychkComponent.get_name(), CONSOLE_INFO);
      }
   }
}
