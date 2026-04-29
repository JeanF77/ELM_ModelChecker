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

// ---- Pour GUI :
// ----     - ROOT + TARGET
// ----     - ROOT = racine de l'objet graphique
// ----     - TARGET = "Btn", "BtnContent", "Selector" ...
// ----     - ROOT + STATUS
// ----     - ROOT = racine de l'objet graphique
// ----     - STATUS = "Loading", "Failed", "Success" ...

// ---- Status

const GUI_STATUS_LOADING                     = "Loading";
const GUI_STATUS_SUCESS                      = "Success";
const GUI_STATUS_FAILED                      = "Failed";
const GUI_STATUS_WARNING                     = "Warning";
const GUI_STATUS_ERROR                       = "Error";

// ---- GUI Objects and Objects Root

const GUI_TARGET_DETAILS = "Details";
const GUI_TARGET_SUCESS = "Success";

const GUI_BTN_REFPROJECT                     = "gui_refProject";
const GUI_BTN_REFCOMPONENT                   = "gui_refComponent";
const GUI_BTN_REFCONFIGURATION               = "gui_refConfiguration";

const GUI_DIV_REFPROJECTSELECTOR             = GUI_BTN_REFPROJECT + GUI_TARGET_SELECTOR;
const GUI_DIV_REFCOMPONENTSELECTOR           = GUI_BTN_REFCOMPONENT + GUI_TARGET_SELECTOR;
const GUI_DIV_REFCONFIGURATIONSELECTOR       = GUI_BTN_REFCONFIGURATION + GUI_TARGET_SELECTOR;

const GUI_BTN_EXPORTDATAMODELREPORT          = "gui_exportDataModelReportBtn";

const GUI_BTN_CHKPROJECT                     = "gui_chkProject";
const GUI_BTN_CHKCOMPONENT                   = "gui_chkComponent";

const GUI_DIV_CHKPROJECTSELECTOR             = GUI_BTN_CHKPROJECT + GUI_TARGET_SELECTOR;
const GUI_DIV_CHKCOMPONENTSELECTOR           = GUI_BTN_CHKCOMPONENT + GUI_TARGET_SELECTOR;
const GUI_DIV_REPORTSUMMARY                  = "gui_reportSummary";
const GUI_DIV_REPORTDETAILS                  = "gui_reportDetails";
const GUI_DIV_REPORTGENERATION               = "hidden_report_generation";

const GUI_DIV_MSG_ERROR_01                   = "gui_msg_error-01";
const GUI_DIV_MSG_ERROR_02                   = "gui_msg_error-02";
const GUI_DIV_MSG_WARNING_01                 = "gui_msg_warning-01";

const GUI_TAB_REPORTDETAILS                  = "gui_reportTabDetails";

const GUI_CHK_COMPONENTSEL_ROOT              = "gui_componentSelect_";

const GUI_BTN_CHKSTART                       = "gui_chkStartBtn";
const GUI_BTN_EXPORTCOMPAREREPORT            = "gui_exportCompareReportBtn";

const GUI_ACC_REFDM_DATATYPE                 = "gui_refDataModelDataType";
const GUI_ACC_REFDM_ATTRIBUTE                = "gui_refDataModelAttribute";
const GUI_ACC_REFDM_ARTIFACTTYPE             = "gui_refDataModelArtifact";
const GUI_ACC_REFDM_LINKTYPE                 = "gui_refDataModelLinkType";

const GUI_ACC_REFDM_DATATYPESUCCESS          = GUI_ACC_REFDM_DATATYPE + GUI_TARGET_SUCESS;
const GUI_ACC_REFDM_ATTRIBUTESUCCESS         = GUI_ACC_REFDM_ATTRIBUTE + GUI_TARGET_SUCESS;
const GUI_ACC_REFDM_ARTIFACTTYPESUCCESS      = GUI_ACC_REFDM_ARTIFACTTYPE + GUI_TARGET_SUCESS;
const GUI_ACC_REFDM_LINKTYPESUCCESS          = GUI_ACC_REFDM_LINKTYPE + GUI_TARGET_SUCESS;

const GUI_ACC_REFDM_DATATYPELIST             = GUI_ACC_REFDM_DATATYPE + GUI_TARGET_DETAILS;
const GUI_ACC_REFDM_ATTRIBUTELIST            = GUI_ACC_REFDM_ATTRIBUTE + GUI_TARGET_DETAILS;
const GUI_ACC_REFDM_ARTIFACTTYPELIST         = GUI_ACC_REFDM_ARTIFACTTYPE + GUI_TARGET_DETAILS;
const GUI_ACC_REFDM_LINKTYPELIST             = GUI_ACC_REFDM_LINKTYPE + GUI_TARGET_DETAILS;

// ---- Other

const RM_STREAM   = "stream";
const RM_BASELINE = "baseline";

// ---- Icons

const GUI_ICON_SUCCESS                       = "./resources/icon_success.png";
const GUI_ICON_FAILED                        = "./resources/icon_failed.png";
const GUI_ICON_WARNING                       = "./resources/icon_warning.png";
const GUI_ICON_LOADING                       = "./resources/loading.gif";

const GUI_ICON_RMSTREAM                      = "./resources/rm_stream_icon.png";
const GUI_ICON_RMBASELINE                    = "./resources/rm_baseline_icon.png";

const GUI_ICON_LIST                          = "./resources/icon_list.png";
const GUI_ICON_HELP                          = "./resources/icon_help.png";
const GUI_ICON_INFO                          = "./resources/icon_info.png";

// ---- Templates

const HB_TEMPLATE_DATATYPE                   = "templ-datamodel-datatype";
const HB_TEMPLATE_ATTRIBUTE                  = "templ-datamodel-attribute";
const HB_TEMPLATE_ARTIFACTTYPE               = "templ-datamodel-artifact";
const HB_TEMPLATE_LINKTYPE                   = "templ-datamodel-linktype";
const HB_TEMPLATE_COMPONENTTOCKH             = "templ-datamodel-componenttochk";

const HB_TEMPLATE_DATAMODEL_EXPORT           = "templ-datamodel-export";
const HB_TEMPLATE_COMPARE_EXPORT             = "templ-compare-export";

const HB_TEMPLATE_REPORT_SUMMARY             = "templ-report-summary";
const HB_TEMPLATE_REPORT_EVTLIST             = "templ-report-eventlist";

/* ------------------------------------------------------------------------------
   ---- Core Functions
   --------------------------------------------------------------------------- */

/**
 * Build project "Ref" and "Check" buttons
 * @param {Array} projectList - Array of ELMProject objects
 * @param {String} projectBtnRoot - GUI Button Id
 */

function gui_BuildProjectBtn (projectList, projectBtnRoot) {
   let myHtmlContent = [];

   gui_mgtButtonSplitDrop (projectBtnRoot, ACTION_INIT);

   if (projectList.length > 1) { // ---- Sort if necessary
      projectList.sort((a, b) => (a.get_name() > b.get_name()) ? 1 : -1);
   }

   for (let myProject of projectList) { // ---- Button construction
      switch (projectBtnRoot) {
         case GUI_BTN_REFPROJECT:
            myHtmlContent.push('<li id="ref-' + myProject.get_shortid() + '" onclick="gui_SelectRefProject (this); return false;"><a class="dropdown-item" href="#">'+ myProject.get_name() + '</a></li>');
            break;

         case GUI_BTN_CHKPROJECT:
            myHtmlContent.push('<li id="chk-' + myProject.get_shortid() + '" onclick="gui_SelectChkProject (this); return false;"><a class="dropdown-item" href="#">'+ myProject.get_name() + '</a></li>');
            break;

         default:
            // ---- Do nothing
      }
   }

   gui_mgtButtonSplitDrop (projectBtnRoot, ACTION_SETCONTENT, myHtmlContent);
   
   // ---- Activer le bouton 

   gui_mgtButtonSplitDrop (projectBtnRoot, ACTION_ACTIVE_ON);
}

/**
 * Display "Reference" project Name
 * @param {Object} object - GUI Object
 */

function gui_SelectRefProject (object) {
   g_refProject = g_projectList.find(project => object.id.indexOf(project.get_shortid()) > -1);

   $("#" + GUI_DIV_REFPROJECTSELECTOR).html(g_refProject.get_name());

   // ---- Init dependancies

   gui_Init (GUI_BTN_REFCOMPONENT);
   gui_Init (GUI_BTN_REFCONFIGURATION);

   empty_AllObjectTypes();

   $('#' + GUI_BTN_EXPORTDATAMODELREPORT).prop('disabled', true);
   
   // ---- Get components list

   get_refComponentList (g_refProject);
}

/**
 * Display "Check" project Name
 * @param {Object} object - GUI Object
 */

function gui_SelectChkProject (object) {
   g_chkProject = g_projectList.find(project => object.id.indexOf(project.get_shortid()) > -1);

   if (g_refProject !== null && g_chkProject.get_shortid() !== g_refProject.get_shortid()) {
      $("#" + GUI_DIV_MSG_WARNING_01).hide();
      
      // ---- Get components list

      get_chkComponentList(g_chkProject);
   } else { // ---- If project to check is same than reference project, display warning message !
      $("#" + GUI_DIV_MSG_WARNING_01).show();
   }

   $('#' + GUI_DIV_CHKPROJECTSELECTOR).html(g_chkProject.get_name());
}

/* --------------------------------------------------------------------------- */

/**
 * Build component "Ref" button
 * @param {Array} componentList - Array of ELMComponent objects
 * @param {String} componentBtnRoot - GUI Button Id
 */

function gui_BuildRefComponentBtn (componentList, componentBtnRoot) {
   let myHtmlContent = [];

   gui_mgtButtonSplitDrop (componentBtnRoot, ACTION_INIT);

   if (componentList.length > 1) { // ---- Sort if necessary
      componentList.sort((a, b) => (a.get_name() > b.get_name()) ? 1 : -1);
   }

   for (let myComponent of componentList) { // ---- Button construction
      myHtmlContent.push('<li id="' + myComponent.get_shortid() + '" onclick="gui_SelectRefComponent (this); return false;"><a class="dropdown-item" href="#">'+ myComponent.get_name() + '</a></li>');
   }

   gui_mgtButtonSplitDrop (componentBtnRoot, ACTION_SETCONTENT, myHtmlContent);
   
   // ---- Activer le bouton 

   gui_mgtButtonSplitDrop (componentBtnRoot, ACTION_ACTIVE_ON);
}

/**
 * Display "Reference" component Name
 * @param {Object} object - GUI Object
 */

function gui_SelectRefComponent (object) {
   let myGuiObj = $("#" + GUI_DIV_REFCOMPONENTSELECTOR);

   g_refComponent = g_refProject.get_componentbyId(object.id);

   myGuiObj.html(g_refComponent.get_name());

   // ---- Init dependancies

   gui_Init (GUI_BTN_REFCONFIGURATION);

   empty_AllObjectTypes();
   
   // ---- Get Configuration list

   get_refConfigurationList(g_refComponent);
}

/* --------------------------------------------------------------------------- */

/**
 * Build configuration "Ref" button
 * @param {Array} configurationList - Array of ELMConfiguration objects
 * @param {String} configurationBtnRoot - GUI Button Id
 */

function gui_BuildRefConfigurationBtn (configurationList, configurationBtnRoot) {
   let myHtmlContent = [];

   gui_mgtButtonSplitDrop (configurationBtnRoot, ACTION_INIT);

   for (let myConfiguration of configurationList) { // ---- Button construction
      myHtmlContent.push('<li id="' + myConfiguration.get_shortid() + '" onclick="gui_SelectRefConfiguration (this); return false;"><a class="dropdown-item" href="#">'+ myConfiguration.get_shortid() + '</a></li>');
   }

   gui_mgtButtonSplitDrop (configurationBtnRoot, ACTION_SETCONTENT, myHtmlContent);
   
   // ---- Activer le bouton 

   gui_mgtButtonSplitDrop (configurationBtnRoot, ACTION_ACTIVE_ON);
}

/**
 * Update configuration "Ref" button
 * @param {Object} configuration - ELMConfiguration object
 * @param {String} configurationBtnRoot - GUI Button Id
 */

function gui_UpdateRefConfigurationBtn (configuration) {
   let myGuiItem = $("#" + configuration.get_shortid());

   if (configuration.get_isarchived()) { // ---- Configuration is archived, remove it from button !
      myGuiItem.remove();
   } else { // ---- Configuration is not archived, update the button !
      let myConfIcon;

      if (configuration.get_type() === RM_STREAM) {
         myConfIcon = '<img src="' + GUI_ICON_RMSTREAM + '" alt="Stream"> ';
      } else {
         myConfIcon = '<img src="' + GUI_ICON_RMBASELINE + '" alt="Baseline"> ';
      }

      myGuiItem.html('<a class="dropdown-item" href="#">' + myConfIcon + configuration.get_name() + '</a>');
   }
}

/**
 * Display "Reference" configuration Name
 * @param {Object} object - GUI Object
 */

function gui_SelectRefConfiguration (object) {
   let myConfIcon;
   let myGuiObj = $("#" + GUI_DIV_REFCONFIGURATIONSELECTOR);

   g_refConfiguration = g_refComponent.get_configurationbyId(object.id);

   if (g_refConfiguration.get_type() === RM_STREAM) {
      myConfIcon = '<img src="' + GUI_ICON_RMSTREAM + '" alt="Stream"> ';
   } else {
      myConfIcon = '<img src="' + GUI_ICON_RMBASELINE + '" alt="Baseline"> ';
   }

   myGuiObj.html(myConfIcon + g_refConfiguration.get_name());

   // ---- Init dependancies

   empty_AllObjectTypes();

   // ---- Get Reference Data Model

   get_refELMDataModel (g_refProject, g_refConfiguration);
}

/* --------------------------------------------------------------------------- */

/**
 * Display object types by list
 * @param {Array} objectList - Array of ELMDataTypeDefinition, ELMAttributeDefinition or ELMArtifactTypeDefinition objects
 * @param {String} guiItemId - Root GUI Id to display objects definistions
 * @param {String} guiTemplate - GUI Template Id to display objects definistions
 */

function display_ObjectTypes (objectList, guiItemId, guiTemplate) {
   let myHtmlContent;
   let myContext = {
      'object_list'   : objectList,
      'object_nbitem' : objectList.length
   };

   myHtmlContent = gui_htmlfromtemplate (guiTemplate, myContext);

   $('#' + guiItemId + GUI_TARGET_DETAILS).empty();
   $('#' + guiItemId + GUI_TARGET_DETAILS).html(myHtmlContent);

   $('#' + guiItemId + GUI_TARGET_SUCESS).show();
}

/**
 * Empty object types area
 */

function empty_AllObjectTypes () {
   $('#' + GUI_ACC_REFDM_DATATYPELIST).empty();
   $('#' + GUI_ACC_REFDM_DATATYPELIST).text("Data Types not yet loaded ! ");
   $('#' + GUI_ACC_REFDM_ATTRIBUTELIST).empty();
   $('#' + GUI_ACC_REFDM_ATTRIBUTELIST).text("Attributes not yet loaded ! ");
   $('#' + GUI_ACC_REFDM_ARTIFACTTYPELIST).empty();
   $('#' + GUI_ACC_REFDM_ARTIFACTTYPELIST).text("Artifact Types not yet loaded ! ");
   $('#' + GUI_ACC_REFDM_LINKTYPELIST).empty();
   $('#' + GUI_ACC_REFDM_LINKTYPELIST).text("Link Definitions not yet loaded ! ");

   $('#' + GUI_ACC_REFDM_DATATYPESUCCESS).hide();
   $('#' + GUI_ACC_REFDM_ATTRIBUTESUCCESS).hide();
   $('#' + GUI_ACC_REFDM_ARTIFACTTYPESUCCESS).hide();
   $('#' + GUI_ACC_REFDM_LINKTYPESUCCESS).hide();
}

/* --------------------------------------------------------------------------- */

/**
 * Display compare report
 * @param {*} refProject - Reference Project (ELMProject object)
 * @param {*} refComponent - Reference Project (ELMComponent object)
 * @param {*} refConfiguration - Reference Project (ELMConfiguration object)
 * @param {*} chkReport - Report (RMCheckerReport object)
 */

function display_compareReport (refProject, refComponent, refConfiguration, chkReport) {
   let myHtmlContent = "";
   let myContext;

   // ---- Display reference summary (Reference project, component et configuration name)

   myContext = {
      'ref_project' : refProject.get_name(),
      'ref_component' : refComponent.get_name(),
      'ref_configuration' : refConfiguration.get_name(),
      'chk_project' : chkReport.get_project().get_name()
   };

   $('#' + GUI_DIV_REPORTSUMMARY).empty();

   myHtmlContent = gui_htmlfromtemplate(HB_TEMPLATE_REPORT_SUMMARY, myContext);

   $('#' + GUI_DIV_REPORTSUMMARY).html(myHtmlContent);
   $('#' + GUI_DIV_REPORTSUMMARY).show();

   // ---- Display report contents

   myContext = {
      'even_list' : chkReport.get_eventList(true)
   };

   myHtmlContent = gui_htmlfromtemplate(HB_TEMPLATE_REPORT_EVTLIST, myContext);

   $('#' + GUI_DIV_REPORTDETAILS).empty();
   $('#' + GUI_DIV_REPORTDETAILS).html(myHtmlContent);

   mgt_datatable(GUI_TAB_REPORTDETAILS);

   $('#' + GUI_DIV_REPORTDETAILS).show();
}

/**
 * Manage Data Table to display formated results
 * @param {String} tabId : GUI Id to display the DataTable
 */

function mgt_datatable (tabId) {
   const RPT_COL_EVENTTYPE   = 0;
   const RPT_COL_CONFIGNAME  = 1;
   const RPT_COL_OBJCATEGORY = 2;
   const RPT_COL_OBJNAME     = 3;
   const RPT_COL_EVENTDESC   = 4;

   new DataTable ("#" + tabId, {
      autoWidth: true,
      order: [
         [RPT_COL_CONFIGNAME, 'asc'],
         [RPT_COL_OBJCATEGORY, 'asc'],
         [RPT_COL_OBJNAME, 'asc'],
      ],
      pagingType: 'simple_numbers',
      initComplete: function () { // ---- Filter on each column
         this.api()
             .columns()
             .every(function () {
                 let column = this;
                 let title = column.footer().textContent;
  
                 // ---- Create input element
                 let input = document.createElement('input');
                 input.placeholder = title;
                 column.footer().replaceChildren(input);
  
                 // ---- Event listener for user input
                 input.addEventListener('keyup', () => {
                     if (column.search() !== this.value) {
                         column.search(input.value).draw();
                     }
                 });
             });
      },
      fixedHeader: {
         footer: true
      }
   });

   $("#" + tabId).show();
}

/* --------------------------------------------------------------------------- */

/**
 * Export Reference Data Model Definition
 */

function event_exportDataModelReport () {
   let myHtmlContent = "";
   let myHtmlContent_DataType     = "";
   let myHtmlContent_Attribute    = "";
   let myHtmlContent_ArtifactType = "";
   let myHtmlContent_LinkType     = "";
   let myContext;

   // ---- Export Data Types

   myContext = {
      'object_list'   : g_refDataModel.get_dataTypeList(true),
      'object_nbitem' : g_refDataModel.get_dataTypeList(true).length,
      'is_exportable' : true
   };

   myHtmlContent_DataType = gui_htmlfromtemplate (HB_TEMPLATE_DATATYPE, myContext);

   // ---- Export Attributes

   myContext = {
      'object_list'   : g_refDataModel.get_attributeList(true),
      'object_nbitem' : g_refDataModel.get_attributeList(true).length,
      'is_exportable' : true
   };

   myHtmlContent_Attribute = gui_htmlfromtemplate (HB_TEMPLATE_ATTRIBUTE, myContext);

   // ---- Export Artifact Types

   myContext = {
      'object_list'   : g_refDataModel.get_artifacttypeList(true),
      'object_nbitem' : g_refDataModel.get_artifacttypeList(true).length,
      'is_exportable' : true
   };

   myHtmlContent_ArtifactType = gui_htmlfromtemplate (HB_TEMPLATE_ARTIFACTTYPE, myContext);

   // ---- Export Link Definitions

   myContext = {
      'object_list'   : g_refDataModel.get_linktypeList(true),
      'object_nbitem' : g_refDataModel.get_linktypeList(true).length,
      'is_exportable' : true
   };

   myHtmlContent_LinkType = gui_htmlfromtemplate (HB_TEMPLATE_LINKTYPE, myContext);

   // ---- Generate Report

   myContext = {
      'project_name'        : g_refProject.get_name(),
      'component_name'      : g_refComponent.get_name(),
      'configuration_name'  : g_refConfiguration.get_name(),
      'export_datatype'     : new Handlebars.SafeString(myHtmlContent_DataType),
      'export_attribute'    : new Handlebars.SafeString(myHtmlContent_Attribute),
      'export_artifacttype' : new Handlebars.SafeString(myHtmlContent_ArtifactType),
      'export_linktype'     : new Handlebars.SafeString(myHtmlContent_LinkType)
   };

   myHtmlContent = gui_htmlfromtemplate (HB_TEMPLATE_DATAMODEL_EXPORT, myContext);

   download (myHtmlContent, g_refProject.get_name() + '.html', 'text/html');
}

/**
 * Export Check Report
 */

function event_exportCheckReport () {
   let myHtmlContent = "";
   let myHtmlContentCompare = "";
   let myContext;

   // ---- Generate compare report

   myContext = {
      'even_list' : g_RMCheckerReport.get_eventList(true)
   };

   myHtmlContentCompare = gui_htmlfromtemplate(HB_TEMPLATE_REPORT_EVTLIST, myContext);

   // ---- Generate Report

   myContext = {
      'projectRef_name'       : g_refProject.get_name(),
      'componentRef_name'     : g_refComponent.get_name(),
      'configurationRef_name' : g_refConfiguration.get_name(),
      'projectChk_name'       : g_chkProject.get_name(),
      'componentChk_name'     : g_chkProject.get_componentList().filter(obj => obj.get_scanstatus()).map(obj => obj.get_name()).join(' | '),
      'compare_Report'        : new Handlebars.SafeString(myHtmlContentCompare)
   };

   myHtmlContent = gui_htmlfromtemplate (HB_TEMPLATE_COMPARE_EXPORT, myContext);

   download (myHtmlContent, g_chkProject.get_name() + '.html', 'text/html');
}

/**
 * Do something when check operation on all selected components, is finished
 */

function event_checkerFinised () {
   $('#' + GUI_BTN_EXPORTCOMPAREREPORT).prop('disabled', false);
}

/* --------------------------------------------------------------------------- */

/**
 * Init selector button
 * @param {String} guiRoot - Selector root Id
 */

function gui_Init (guiRoot) {
   $("#" + guiRoot + "Selector").empty();

   gui_mgtButtonSplitDrop (guiRoot, ACTION_ACTIVE_OFF);
   gui_mgtButtonSplitDrop (guiRoot, ACTION_INIT);
}