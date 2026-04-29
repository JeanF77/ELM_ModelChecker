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

const EVENT_INFO     = "isInfo";
const EVENT_WARNING  = "isWarning";
const EVENT_ERROR    = "isError";

/* ------------------------------------------------------------------------------
	---- Classes
   --------------------------------------------------------------------------- */

/* ---- Data Types */

class ELMDataModel {
   static isDataType     = "Data Type";
   static isAttribute    = "Attribute";
   static isArtifactType = "Artifact Type";
   static isLinkType     = "Link Type";

   constructor (id)  {
      this.aboutid         = id;          // ---- Object internal Id
      this.title           = null;        // ---- Object Name
      this.description     = null;        // ---- Object Description
      this.sameAs          = null;        // ---- Object URI
      this.actionId        = null;        // ---- Object permission Id
      this.typeAlias       = null;        // ---- Object Type Alias (Artifact Type, Attribute ...)
   }

   set_property (property, value) { // ---- Set object property
      if (property in this) { // ---- Set only if property exists !
         this[property] = value;
      } else {
         mgt_Console ("Property '" + property + "' does not exist !", CONSOLE_WARNING);
      }
   }

   init (xml_data) { // ---- Init object
      let mySelf = this;

      xml_data.children().each (function() {
         switch ($(this).prop('nodeName')) {
            case DCTERMS0_TITLE: // ---- Object Title
               mySelf.title = $(this).text();
               break;

            case DCTERMS0_DESCRIPTION: // ---- Object Description
               mySelf.description = $(this).text();
               break;

            case OWL0_SAMEAS:  // ---- Object URI
               mySelf.sameAs = $(this).attr(RDF0_RESOURCE);
               break;

            case RM0_ACTIONID:  // ---- Object permission Id
               mySelf.actionId = $(this).text();
               break;

            default:
               // ---- Do nothing
         };
      });
   }

   reset () { // ---- Reset object
      this.aboutid         = null;
      this.title           = null;
      this.description     = null;
      this.sameAs          = null;
      this.actionId        = null;
      this.typeAlias       = null;
   }

   get_className () { // ---- Return Class Name
      return this.constructor.name;
   }

   get_name () { // ---- Get Title
      return this.title;
   }

   get_description () { // ---- Get Description
      return this.description;
   }

   get_uri () { // ---- Get object URI
      return this.sameAs;
   }

   get_id () { // ---- Get object ID
      return this.aboutid;
   }

   get_typeAlias () { // ---- Get object type alias
      return this.typeAlias;
   }

   is_custom () { // ---- Test if is custom or system object
      const OBJECT_IBM  = "http://www.ibm.com";
      const OBJECT_W3   = "http://www.w3.org";
      const OBJECT_PURL = "http://purl.org";
      const OBJECT_JAZZ = "http://jazz.net";

      let isCustom;

      if (this.sameAs === null) { // ---- If URI is not defined, so it is custom object (because system objects have always an URI !)
         isCustom = true;
      } else {
         isCustom = (this.sameAs.indexOf(OBJECT_IBM) === -1) && (this.sameAs.indexOf(OBJECT_W3) === -1) && (this.sameAs.indexOf(OBJECT_PURL) === -1) && (this.sameAs.indexOf(OBJECT_JAZZ) === -1);
      }

      return isCustom;
   }
}

/* ---- Data Types Definitions */

class ELMDataTypeDefinition extends ELMDataModel {
   constructor (id) {
      super (id);

      this.valueType    = null;        // ---- Type (int, string ...)
      this.workflow     = false;       // ---- Is a workflow type ?
      this.isenum       = false;       // ---- Is an "enum" type ?
      this.enumEntries  = [];          // ---- Values list, if type is "enum"
      this.typeAlias    = ELMDataModel.isDataType;
   }

   init (xml_data) { // ---- Init object
      let mySelf = this;

      super.init (xml_data);

      xml_data.children().each (function() {
         switch ($(this).prop('nodeName')) {
            case RM0_VALUETYPE: // ---- Type
               mySelf.valueType = $(this).attr(RDF0_RESOURCE);
               break;

            case RM0_WORKFLOW: // ---- Is a workflow type ?
               mySelf.workflow = ($(this).text().toLowerCase() === "true" ? true : false);
               break;

            case RM0_ENUMENTRIES: // ----  Is an "enum" type ?
               mySelf.isenum = true;

               mySelf.set_enumValues(xml_data);
               break;

            default:
               // ---- Do nothing
         };
      });
   }

   reset () { // ---- Reset object
      super.reset();

      this.valueType    = null;
      this.workflow     = false;
      this.isenum       = false;
      this.enumEntries  = [];
   }

   set_enumValues (xml_data) { // ---- Get "enum" values
      let mySelf = this;

      xml_data.find(RM_ENUMENTRY).each (function() {
         let myEnumValue = {
            'value'  : $(this).find(RDF_VALUE).text(),               // ---- Enum rank
            'title'  : $(this).find(DCTERMS_TITLE).text(),           // ---- Enum value
            'sameAs' : $(this).find(OWL_SAMEAS).attr(RDF0_RESOURCE)  // ---- Enum value URI
         };
   
         mySelf.enumEntries.push(myEnumValue);
      });
   }

   get_enumValuesList (isSorted) { // ---- Get enumeration values list
      let myEnumList = [];

      if (isSorted !== undefined && isSorted) { // ---- Return sorted by Title array ?
         myEnumList = this.enumEntries;
         
         myEnumList.sort(compareTitle);

         return myEnumList;
      } else {
         return this.enumEntries;
      }
   }

   get_enumValueByName (title) { // ---- Get enumeration value by name
      return this.enumEntries.find(value => value.title === title);
   }

   get_valueType () { // ---- Get Type
      return this.valueType;
   }

   is_enum () { // ---- Is an enumeration ?
      return this.isenum;
   }
}

/* ---- Attributes Definitions */

class ELMAttributeDefinition extends ELMDataModel {
   constructor (id) {
      super (id);

      this.workflow     = false;       // ---- Is a workflow attribute ?
      this.multiValued  = false;       // ---- Is an "enum" and multi valued attribute ?
      this.mandatory    = false;       // ---- IS mandatory ?
      this.range        = null;        // ---- Attribute Data Type
      this.typeAlias    = ELMDataModel.isAttribute;
   }

   init (xml_data) { // ---- Init object
      let mySelf = this;

      super.init (xml_data);

      xml_data.children().each (function() {
         switch ($(this).prop('nodeName')) {
            case RM0_MULTIVALUED: // ---- Is a multi valued attribute ?
               mySelf.multiValued = ($(this).text().toLowerCase() === "true" ? true : false);
               break;

            case RM0_WORKFLOW: // ---- Is a workflow attribute ?
               mySelf.workflow = ($(this).text().toLowerCase() === "true" ? true : false);
               break;

            case RM0_MANDATORY: // ---- Is mandatory ?
               mySelf.mandatory = ($(this).text().toLowerCase() === "true" ? true : false);
               break;

            case RM0_RANGE: // ----  Attribute Data Type
               mySelf.range = $(this).attr(RDF0_RESOURCE);
               break;

            default:
               // ---- Do nothing
         };
      });
   }

   reset () { // ---- Reset object
      super.reset();

      this.workflow     = false;
      this.multiValued  = false;
      this.mandatory    = false;
      this.range        = null;
   }

   get_title () { // ---- Get attribute name
      return this.title;
   }

   get_range () { // ---- Get attribute type
      return this.range;
   }

   is_multiValued () { // ---- Test if is multi valued
      return this.multiValued;
   }
}

/* ---- Artifacts Definitions */

class ELMArtifactTypeDefinition extends ELMDataModel {
   constructor (id) {
      super (id);

      this.defaultFormat        = null;      // ---- Default format
      this.hasWorkflowAttribute = null;      // ---- Is attached to a workflow ? (Workflow attribute URI)
      this.attributeList        = [];        // ---- Attribute list (Array of attribute Id (internal "aboutid"))
      this.typeAlias            = ELMDataModel.isArtifactType;
   }

   init (xml_data) { // ---- Init object
      let mySelf = this;

      super.init (xml_data);

      xml_data.children().each (function() {
         switch ($(this).prop('nodeName')) {
            case RM0_DEFAULTFORMAT: // ---- Artifact default format
               mySelf.defaultFormat = $(this).attr(RDF0_RESOURCE);
               break;

            case RM0_HASWORKFLOWATTRIBUTE: // ---- Is attached to a workflow ?
               mySelf.hasWorkflowAttribute = $(this).attr(RDF0_RESOURCE);
               break;

            case RM0_HASATTRIBUTE: // ---- Set Attribute List
            case RM0_HASSYSTEMATTRIBUTE:
               mySelf.attributeList.push($(this).attr(RDF0_RESOURCE));
               break;

            default:
               // ---- Do nothing
         };
      });
   }

   reset () { // ---- Reset object
      super.reset();

      this.defaultFormat        = null;
      this.hasWorkflowAttribute = null;
      this.attributeList        = [];
   }

   get_format () { // ---- Get default format
      return this.defaultFormat;
   }

   get_workflowAttribute () { // ---- Get Workflow Attribute URI
      return this.hasWorkflowAttribute;
   }

   get_workflowAttributeName () { // ---- Get Workflow Attribute
      let myMatch;

      if (this.hasWorkflowAttribute === null) {
         return null;
      } else {
         myMatch = this.hasWorkflowAttribute.match(/^https.+\/(.+)/)

         return myMatch[1];
      }
   }

   get_attributeList () { // ---- Return attributes list
      return this.attributeList;
   }
}

/* ---- Link Definitions */

class ELMLinkTypeDefinition extends ELMDataModel {
   constructor (id) {
      super (id);

      this.subjectToObjectLabel  = null;     // ---- Out
      this.objectToSubjectLabel  = null;     // ---- In
      this.typeAlias             = ELMDataModel.isLinkType;
   }

   init (xml_data) { // ---- Init object
      super.init (xml_data);

      let mySelf = this;

      xml_data.children().each (function() {
         switch ($(this).prop('nodeName')) {
            case RM0_OBJECTTOSUBJECTLABEL: // ---- Object Label (Out)
               mySelf.objectToSubjectLabel = $(this).text();
               break;

            case RM0_SUBJECTTOOBJECTLABEL: // ---- Object Label (In)
               mySelf.subjectToObjectLabel = $(this).text();
               break;

            default:
               // ---- Do nothing
         };
      });
   }

   get_incomingLabel () { // ---- Get  outgoing link label
      return this.objectToSubjectLabel;
   }

   get_outgoingLabel () { // ---- Get  incoming link label
      return this.subjectToObjectLabel;
   }
}

/* ---- Data Model Aggregator */

class DMAggregator {
   /**
    * Constructor
    * @param {Object} configuration - ELMConfiguration object (can be optional)
    */
   constructor (configuration) {
      this.configuration     = (configuration !== undefined ? configuration : null);
      this.datatypeList      = [];    // ---- Data Types list - Array of ELMDataTypeDefinition objects
      this.attributeList     = [];    // ---- Attributes list - Array of ELMAttributeDefinition objects
      this.artifacttypeList  = [];    // ---- Artifact Types list - Array of ELMArtifactTypeDefinition objects
      this.linkdefList       = [];    // ---- Link Definitions list - Array of ELMLinkTypeDefinition objects
   }
   
   /**
    * Initiator
    * @param {Array} objectList - Array of ELMDataTypeDefinition, ELMAttributeDefinition, ELMArtifactTypeDefinition or ELMLinkTypeDefinition objects
    * @param {Object} configuration - ELMConfiguration object
    */
   init (objectList, configuration) {
      this.configuration = (configuration !== undefined && this.configuration === null ? configuration : this.configuration);

      if (Array.isArray(objectList) && objectList.length > 0) { // ---- An array is mandatory !
         switch (objectList[0].get_className()) {
            case 'ELMDataTypeDefinition': // ---- Store Data Types
               this.datatypeList = objectList;
               break;

            case 'ELMAttributeDefinition': // ---- Store Attribute Definitions
               this.attributeList = objectList;
               break;

            case 'ELMArtifactTypeDefinition': // ---- Store Artifact Types
               this.artifacttypeList = objectList;
               break;

            case 'ELMLinkTypeDefinition': // ---- Store Link Definitions
               this.linkdefList = objectList;
               break;

            default:
               // ---- Do nothing
         }
      }
   }

   reset () {
      this.configuration = null;
      this.datatypeList.splice(0);
      this.attributeList.splice(0);
      this.artifacttypeList.splice(0);
      this.linkdefList.splice(0);
   }

   get_configuration () { // ---- Get header configuration
      return this.configuration;
   }

   get_dataTypeList (isSorted) { // ---- Get Data Type List
      let myObjectList = [];

      if (isSorted !== undefined && isSorted) { // ---- Return sorted by Title array ?
         myObjectList = this.datatypeList;
         
         myObjectList.sort(compareTitle);

         return myObjectList;
      } else {
         return this.datatypeList;
      }
   }

   get_dataTypebyId (id) { // ---- Get Data Type by Id
      return this.datatypeList.find(datatype => datatype.get_id() === id);
   }

   get_dataTypeNamebyId (id) { // ---- Get Data Type Name by Id
      let myDataType = this.get_dataTypebyId(id);
      
      return (myDataType !== undefined ? myDataType.get_name() : null);
   }

   get_dataTypebyName (title) { // ---- Get Data Type by name
      return this.datatypeList.find(datatype => datatype.get_name() === title);
   }

   get_AttributebyId (id) { // ---- Get Attribute by Id
      return this.attributeList.find(attribute => attribute.get_id() === id);
   }

   get_AttributebyName (title) { // ---- Get Attribute by name
      return this.attributeList.find(attribute => attribute.get_name() === title);
   }

   get_ArtifactTypebyName (title) { // ---- Get Artifact Type by name
      return this.artifacttypeList.find(artifact => artifact.get_name() === title);
   }

   get_attributeList (isSorted) { // ---- Get Attributes list
      let myObjectList = [];

      if (isSorted !== undefined && isSorted) { // ---- Return sorted by Title array ?
         myObjectList = this.attributeList;
         
         myObjectList.sort(compareTitle);

         return myObjectList;
      } else {
         return this.attributeList;
      }
   }

   /**
    * Get attribute definition list for a givent artifact type
    * @param {Object} artifactType - ELMArtifactTypeDefinition object
    * @returns - Arry of ELMAttributeDefinition objects
    */

   get_artifactAttributeDefList (artifactType) {
      let myAttributeDefList = [];

      for (let myAttributeId of artifactType.get_attributeList()) {
         myAttributeDefList.push(this.get_AttributebyId(myAttributeId));
      }

      return myAttributeDefList;
   }

   /**
    * Get Artifact types list
    * @param {*} isSorted - Sort the list by Artifact name (true, false by default)
    * @returns - Array of ELMArtifactTypeDefinition objects
    */

   get_artifacttypeList (isSorted) {
      let myObjectList = [];

      if (isSorted !== undefined && isSorted) { // ---- Return sorted by Title array ?
         myObjectList = this.artifacttypeList;
         
         myObjectList.sort(compareTitle);

         return myObjectList;
      } else {
         return this.artifacttypeList;
      }
   }

   get_linktypeList (isSorted) { // ---- Get Link Types
      let myObjectList = [];

      if (isSorted !== undefined && isSorted) { // ---- Return sorted by Title array ?
         myObjectList = this.linkdefList;
         
         myObjectList.sort(compareTitle);

         return myObjectList;
      } else {
         return this.linkdefList;
      }
   }

   get_LinkTypebyName (title) { // ---- Get Link Type by name
      return this.linkdefList.find(link => link.get_name() === title);
   }
}

/* ---- Check Events */

class CHKEvent {
   /**
    * Event recorder
    * @param {Object} target - Checked configuration (ELMConfiguration object)
    * @param {String} type - Type : Info, Warning or Error ?
    * @param {String} message - Message
    * @param {Object} dmobject - Checked object name (ELMDataModel object)
    */

   constructor (target, type, message, dmobject) {
      this.eventTarget = target;
      this.eventType   = type;
      this.eventMsg    = message;
      this.eventObject = dmobject;
   }

   get_type() { // ---- Get event type
      return this.eventType;
   }

   get_target() { // ---- Get the target configuration object
      return this.eventTarget;
   }

   get_targetName() { // ---- Get impacted configuration name
      return this.eventTarget.get_name();
   }

   get_message() { // ---- Get event message
      return this.eventMsg;
   }

   get_impactedObjectName() { // ---- Get impacted object name
      return this.eventObject.get_name();
   }

   get_impactedObjectTypeAlias() { // ---- Get impacted object type alias
      return this.eventObject.get_typeAlias();
   }
}

/* ------------------------------------------------------------------------------
	---- Core Fonctions
   --------------------------------------------------------------------------- */

/**
 * Request to get the RM Data Model
 * @param {String} project - ELMProject object
 * @param {String} configuration - ELMConfiguration object
 */

function get_refELMDataModel (project, configuration) {
   let myRMRequest = {
      'rest_method'     : "GET",
      'rest_url'        : project.get_hostname() + "/rm/types?accept=*&private=true&refreshTypeFeedCacheFromJFS=true&resourceContext=" + project.get_hostname() + "/rm/process/project-areas/" + project.get_shortid() + "&vvc.configuration=" + configuration.get_uri(),
      'cache'           : false,
      'successCallback' : success_refELMDataModel,
      'successArg'      : configuration,
      'errorCallback'   : failed_refELMDataModel
   };

   queueManager.addToQueue (myRMRequest);
}

/**
  * Get RM Data Model
  * @param {Object} configuration - ELMConfiguration Object
  * @param {String} data - REST response
  */

function success_refELMDataModel (configuration, data) {
   let xmlData = $.parseXML(data);

   g_refDataModel.reset();

   // ---- Get Data Types

   g_refDataModel.init(get_ELMDataTypeDefinition(xmlData), configuration);
   
   // ---- Get Attributes

   g_refDataModel.init(get_ELMAttributeDefinition(xmlData), configuration);

   // ---- Get Artifact Types

   g_refDataModel.init(get_ELMArtifactTypeDefinition(xmlData), configuration);

   // ---- Get Link Definition

   g_refDataModel.init(get_ELMLinkTypeDefinition(xmlData), configuration);

   // ---- Display Reference Data Model Details

   display_ObjectTypes(g_refDataModel.get_dataTypeList(true), GUI_ACC_REFDM_DATATYPE, HB_TEMPLATE_DATATYPE);
   display_ObjectTypes(g_refDataModel.get_attributeList(true), GUI_ACC_REFDM_ATTRIBUTE, HB_TEMPLATE_ATTRIBUTE);
   display_ObjectTypes(g_refDataModel.get_artifacttypeList(true), GUI_ACC_REFDM_ARTIFACTTYPE, HB_TEMPLATE_ARTIFACTTYPE);
   display_ObjectTypes(g_refDataModel.get_linktypeList(true), GUI_ACC_REFDM_LINKTYPE, HB_TEMPLATE_LINKTYPE);

   // ---- Export button = ON
   
   $('#' + GUI_BTN_EXPORTDATAMODELREPORT).prop('disabled', false);
}

/**
 * RM Data Model request has failed !
 */

function failed_refELMDataModel () {
   mgt_Console ("Failed to get Data Model !", CONSOLE_ERROR);
}

/**
 * Get Data Type Definitions
 * @param {Object} xmlData - XML REST Response
 * @returns  - List of data types (Array of ELMDataTypeDefinition objects)
 */

function get_ELMDataTypeDefinition (xmlData) {
   let myDataTypeList = [];

   $(xmlData).find(RM_ATTRIBUTETYPE).each(function() { // ---- Loop on each type definition
      let myDataType = new ELMDataTypeDefinition ($(this).attr(RDF0_ABOUT));

      myDataType.init($(this));

      myDataTypeList.push(myDataType);
   });

   mgt_Console ("Get " + myDataTypeList.length + " data types", CONSOLE_INFO);

   return myDataTypeList;
}

/**
 * Get Attribute Definitions
 * @param {Object} xmlData - XML REST Response
 * @returns  - List of attributes (Array of ELMAttributeDefinition objects)
 */

function get_ELMAttributeDefinition (xmlData) {
   let myAttributeDefList = [];

   $(xmlData).find(RM_ATTRIBUTEDEFINITION).each(function() { // ---- Loop on each attribute definition
      let myAttributeDef = new ELMAttributeDefinition ($(this).attr(RDF0_ABOUT));

      myAttributeDef.init($(this));

      myAttributeDefList.push(myAttributeDef);
   });

   mgt_Console ("Get " + myAttributeDefList.length + " attribute definitions", CONSOLE_INFO);

   myAttributeDefList.sort(compareTitle);

   return myAttributeDefList;
}

/**
 * Get Artifact Definitions
 * @param {Object} xmlData - XML REST Response
 * @returns  - List of artifact types ELMArtifactTypeDefinition
 */

function get_ELMArtifactTypeDefinition (xmlData) {
   let myArtifactDefList = [];

   $(xmlData).find(RM_OBJECTTYPE).each(function() { // ---- Loop on each artifact definition
      let myArtifactDef = new ELMArtifactTypeDefinition ($(this).attr(RDF0_ABOUT));

      myArtifactDef.init($(this));

      myArtifactDefList.push(myArtifactDef);
   });

   mgt_Console ("Get " + myArtifactDefList.length + " artifact definitions", CONSOLE_INFO);

   myArtifactDefList.sort(compareTitle);

   return myArtifactDefList;
}

/**
 * Get Link Definitions
 * @param {Object} xmlData - XML REST Response
 * @returns - List of link definitions ELMLinkTypeDefinition
 */

function get_ELMLinkTypeDefinition (xmlData) {
   let myLinkDefinitionList = [];

   $(xmlData).find(RM_LINKTYPE).each(function() { // ---- Loop on each link definition
      let myLinkDefinition = new ELMLinkTypeDefinition ($(this).attr(RDF0_ABOUT));

      myLinkDefinition.init($(this));

      myLinkDefinitionList.push(myLinkDefinition);
   });

   mgt_Console ("Get " + myLinkDefinitionList.length + " link definitions", CONSOLE_INFO);

   myLinkDefinitionList.sort(compareTitle);

   return myLinkDefinitionList;
}

/* --------------------------------------------------------------------------- */

/**
 * Check object description
 * @param {Object} refDataModel - Reference Data Model (DMAggregator object)
 * @param {Object} chkDataModel - Checked Data Model (DMAggregator object)
 * @param {Object} refObject - Reference object (ELM)
 * @param {Object} chkObject - Checked object (ELMDataTypeDefinition, ELMAttributeDefinition, ELMArtifactTypeDefinition or ELMLinkTypeDefinition)
 * @returns - Array of CHKEvent objects
 */

function check_description (refDataModel, chkDataModel, refObject, chkObject) {
   const EVT_MSG07 = "Description does not match";
   const EVT_MSG08 = "Reference description is empty";
   const EVT_MSG09 = "Description is empty";

   let myEventList = [];

   // ---- Check Description
   // ---- System attribute description is always empty !

   if (refObject.is_custom() && refObject.get_description().length === 0) { // ---- Check Eeference Description
      myEventList.push(new CHKEvent (refDataModel.get_configuration(), EVENT_WARNING, EVT_MSG08, refObject));
   }

   if (chkObject.is_custom() && chkObject.get_description().length === 0) { // ---- Description is empty
      myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_WARNING, EVT_MSG09, chkObject));
   }

   if (chkObject.get_description() !== chkObject.get_description()) { // ---- Description is not same
      myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_WARNING, EVT_MSG07, chkObject));
   }

   return myEventList;
}

/**
 * Check object URI
 * @param {Object} refDataModel - Reference Data Model (DMAggregator object)
 * @param {Object} chkDataModel - Checked Data Model (DMAggregator object)
 * @param {Object} refObject - Reference object (ELM)
 * @param {Object} chkObject - Checked object (ELMDataTypeDefinition, ELMAttributeDefinition, ELMArtifactTypeDefinition or ELMLinkTypeDefinition)
 * @returns - Array of CHKEvent objects
 */

function check_URI (refDataModel, chkDataModel, refObject, chkObject) {
   const EVT_MSG02 = "URI not defined";
   const EVT_MSG03 = "URI does not match";
   const EVT_MSG17 = "Reference URI not defined";

   let myEventList = [];

   if (refObject.get_uri() === null) { // ---- Check Reference URI
      myEventList.push(new CHKEvent (refDataModel.get_configuration(), EVENT_ERROR, EVT_MSG17, refObject));
   }

   if (chkObject.get_uri() === null) { // ---- URI is not define !
      myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG02, chkObject));
   } else if (chkObject.get_uri() !== refObject.get_uri()) { // ---- URI is not same
      myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG03, chkObject));
   }

   return myEventList;
}

/* --------------------------------------------------------------------------- */

/**
 * Compare 2 RM Data Models
 * @param {Object} refDataModel - Reference Data Model (DMAggregator object)
 * @param {Object} chkDataModel - Data Model to check (DMAggregator object)
 * @returns - Array of CHKEvent objets
 */

function compare_ELMDataModel (refDataModel, chkDataModel) {
   let myEventList = [];

   mgt_Console ("Compare Data Models", CONSOLE_INFO);

   // ---- Compare Data Types

   myEventList = compare_ELMDataModel_DataTypes (refDataModel, chkDataModel);

   // ---- Compare Attributes

   myEventList = myEventList.concat(compare_ELMDataModel_Attributes (refDataModel, chkDataModel));

   // ---- Compare Artifact Types

   myEventList = myEventList.concat(compare_ELMDataModel_ArtifactTypes (refDataModel, chkDataModel));

   // ---- Compare Link Types

   myEventList = myEventList.concat(compare_ELMDataModel_LinkTypes (refDataModel, chkDataModel));

   return myEventList;
}

/**
 * Compare 2 RM Data Models - Compare Data Types
 * @param {Object} refDataModel - Reference Data Model (DMAggregator object)
 * @param {Object} chkDataModel - Data Model to check (DMAggregator object)
 */

function compare_ELMDataModel_DataTypes (refDataModel, chkDataModel) {
   const EVT_MSG01 = "Data Type not found";
   const EVT_MSG10 = "Base Data Type does not match";
   const EVT_MSG11 = "Number of values does not match";
   const EVT_MSG12 = "Kind of value does not match";
   const EVT_MSG13 = "Enumeration value not found";
   const EVT_MSG14 = "Reference Enumeration URI not defined";
   const EVT_MSG15 = "Enumeration URI not defined";
   const EVT_MSG16 = "Enumeration URI does not match";

   let myEventList = [];

   for (let myRefDataType of refDataModel.get_dataTypeList(true)) {
      let myChkDataType = chkDataModel.get_dataTypebyName(myRefDataType.get_name());

      if (myChkDataType === undefined) { // ---- Reference not found !
         myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG01, myRefDataType));

         mgt_Console (EVT_MSG01, CONSOLE_ERROR);
      } else { // ---- Check consistency
         // ---- Check URI

         myEventList = myEventList.concat(check_URI(refDataModel, chkDataModel, myRefDataType, myChkDataType));

         // ---- Check Base type

         if (myChkDataType.get_valueType() !== myRefDataType.get_valueType()) { // ---- Base type is not same
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG10, myChkDataType));
         }

         // ---- Check Simple or Enum ?

         if (myChkDataType.is_enum() !== myRefDataType.is_enum()) { // ---- Kind of value does not match
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG12, myChkDataType));
         } else if (myChkDataType.is_enum() && myRefDataType.is_enum()) { // ---- For enum, check values and URI
            if (myChkDataType.get_enumValuesList().length > myRefDataType.get_enumValuesList().length) { // ---- Check number of values in the enumeration
               // ---- Chk = Label : Blabla-1 and Ref = Label : Blabla-1
               // ---- Chk = Label : Blabla-2 and Ref = Label : Blabla-2
               // ---- Chk = Label : Blabla-3 (<- Extra value !)
               myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_WARNING, EVT_MSG11, myChkDataType));
            }

            for (let myRefEnumValue of myRefDataType.get_enumValuesList(true)) {
               let myChkEnumValue = myChkDataType.get_enumValueByName(myRefEnumValue.title);

               if (myChkEnumValue === undefined) { // ---- Value not found
                  // ---- Chk = Label : Blabla-1 and Ref = Label : Blabla-1
                  // ---- Chk = Label : Blabla-2 and Ref = Label : Blabla-2
                  // ----                            Ref = Label : Blabla-3 (<- Missing value !)
                  myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG13 + " : " + myRefEnumValue.title, myChkDataType));
               } else { // ---- If value exists, check the URI
                  let myRefURIisDefined = true;

                  if (myRefEnumValue.sameAs === undefined || myRefEnumValue.sameAs.length === 0) { // ---- Reference URI not defined
                     // ---- Ref = Label : Blabla | RDF URI : <empty>
                     myRefURIisDefined = false;

                     myEventList.push(new CHKEvent (refDataModel.get_configuration(), EVENT_ERROR, EVT_MSG14 + " : " + myRefEnumValue.title, myRefDataType));
                  }

                  if (myChkEnumValue.sameAs === undefined || myChkEnumValue.sameAs.length === 0) { // ---- URI is not defined
                     // ---- Chk = Label : Blabla | RDF URI : <empty>
                     myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG15 + " : " + myChkEnumValue.title, myChkDataType));
                  } else if (!myRefURIisDefined || myChkEnumValue.sameAs !== myRefEnumValue.sameAs) { // ---- URI is not same
                     // ---- Chk = Label : Blabla | RDF URI : URI-1 and Ref = Label : Blabla | RDF URI : URI-2
                     // ---- or
                     // ---- Chk = Label : Blabla | RDF URI : URI-1 and Ref = Label : Blabla | RDF URI : <empty>
                     myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG16 + " : " + myChkEnumValue.title, myChkDataType));
                  }
               }
            }
         }

         // ---- Check Description
         // ---- System attribute description is always empty !

         myEventList = myEventList.concat(check_description(refDataModel, chkDataModel, myRefDataType, myChkDataType));
      }
   }

   return myEventList;
}

/**
 * Compare 2 RM Data Models - Compare Attributes
 * @param {Object} refDataModel - Reference Data Model (DMAggregator object)
 * @param {Object} chkDataModel - Data Model to check (DMAggregator object)
 */

function compare_ELMDataModel_Attributes (refDataModel, chkDataModel) {
   const EVT_MSG01 = "Attribute not found";
   const EVT_MSG10 = "Data Type does not match";
   const EVT_MSG11 = "Number of values does not match";

   let myEventList = [];

   for (let myRefAttribute of refDataModel.get_attributeList(true)) {
      let myChkAttribute = chkDataModel.get_AttributebyName(myRefAttribute.get_name());

      if (myChkAttribute === undefined) { // ---- Reference not found !
         myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG01, myRefAttribute));

         mgt_Console (EVT_MSG01, CONSOLE_ERROR);
      } else { // ---- Check consistency
         // ---- Check URI

         myEventList = myEventList.concat(check_URI(refDataModel, chkDataModel, myRefAttribute, myChkAttribute));

         // ---- Check Base Type

         if (chkDataModel.get_dataTypeNamebyId(myChkAttribute.get_range()) !== refDataModel.get_dataTypeNamebyId(myRefAttribute.get_range())) {
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_WARNING, EVT_MSG10, myChkAttribute));
         }

         // ---- Check if multi-valued

         if (myChkAttribute.is_multiValued() !== myRefAttribute.is_multiValued()) {
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_WARNING, EVT_MSG11, myChkAttribute));
         }

         // ---- See if necessary to check initial value ?

         // ---- Check Description
         // ---- System attribute description is always empty !

         myEventList = myEventList.concat(check_description(refDataModel, chkDataModel, myRefAttribute, myChkAttribute));
      }
   }

   return myEventList;
}

/**
 * Compare 2 RM Data Models - Compare Artifact Types
 * @param {Object} refDataModel - Reference Data Model (DMAggregator object)
 * @param {Object} chkDataModel - Data Model to check (DMAggregator object)
 */

function compare_ELMDataModel_ArtifactTypes (refDataModel, chkDataModel) {
   const EVT_MSG01 = "Artifact type not found";
   const EVT_MSG04 = "Default format does not match";
   const EVT_MSG05 = "Workflow attribute does not match";
   const EVT_MSG06 = "Attribute not found";

   let myEventList = [];

   for (let myRefArtifactType of refDataModel.get_artifacttypeList(true)) {
      let myChkArtifactType = chkDataModel.get_ArtifactTypebyName(myRefArtifactType.get_name());
      let myChkArtifactAttrDefList = [];

      // ---- Data Model to check contains reference artifact type

      if (myChkArtifactType === undefined) { // ---- Reference not found !
         myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG01, myRefArtifactType));

         mgt_Console (EVT_MSG01, CONSOLE_ERROR);
      } else { // ---- Check consistency
         // ---- Check URI

         myEventList = myEventList.concat(check_URI(refDataModel, chkDataModel, myRefArtifactType, myChkArtifactType));

         // ---- Check format

         if (myChkArtifactType.get_format() !== myRefArtifactType.get_format()) { // ---- Default format is not same
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG04, myChkArtifactType));
         }

         // ---- Check workflow

         if (myChkArtifactType.get_workflowAttributeName() !== myRefArtifactType.get_workflowAttributeName()) { // ---- Workflow attribute is not same
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG05, myChkArtifactType));
         }

         // ---- Check attributes list
         // ---- Get Artifact Type Attributes Definition List

         myChkArtifactAttrDefList = chkDataModel.get_artifactAttributeDefList(myChkArtifactType);

         for (let myAttributeId of myRefArtifactType.get_attributeList()) {
            let myRefAttribute = refDataModel.get_AttributebyId(myAttributeId);

            if (myChkArtifactAttrDefList.find(attribute => attribute.get_name() === myRefAttribute.get_name()) === undefined) { // ---- Ref attribute not found !
               myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG06 + " : " + myRefAttribute.get_name(), myChkArtifactType));
            }
         }

         // ---- Check Description

         myEventList = myEventList.concat(check_description(refDataModel, chkDataModel, myRefArtifactType, myChkArtifactType));
      }
   }

   return myEventList;
}

/**
 * Compare 2 RM Data Models - Compare Link Types
 * @param {Object} refDataModel - Reference Data Model (DMAggregator object)
 * @param {Object} chkDataModel - Data Model to check (DMAggregator object)
 */

function compare_ELMDataModel_LinkTypes (refDataModel, chkDataModel) {
   const EVT_MSG01 = "Link type not found";
   const EVT_MSG02 = "Outgoing label does not match";
   const EVT_MSG03 = "Incoming label does not match";

   let myEventList = [];

   for (let myRefLinkType of refDataModel.get_linktypeList(true)) {
      let myChkLinkType = chkDataModel.get_LinkTypebyName(myRefLinkType.get_name());

      if (myChkLinkType === undefined) { // ---- Reference not found !
         myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG01, myRefLinkType));

         mgt_Console (EVT_MSG01, CONSOLE_ERROR);
      } else { // ---- Check consistency
         // ---- Check URI

         myEventList = myEventList.concat(check_URI(refDataModel, chkDataModel, myRefLinkType, myChkLinkType));

         // ---- Check Outgoing Label

         if (myChkLinkType.get_outgoingLabel() !== myRefLinkType.get_outgoingLabel()) {
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG02, myChkLinkType));
         }

         // ---- Check Incoming Label

         if (myChkLinkType.get_incomingLabel() !== myRefLinkType.get_incomingLabel()) {
            myEventList.push(new CHKEvent (chkDataModel.get_configuration(), EVENT_ERROR, EVT_MSG03, myChkLinkType));
         }

         // ---- Check Description

         myEventList = myEventList.concat(check_description(refDataModel, chkDataModel, myRefLinkType, myChkLinkType));
      }
   }

   return myEventList;
}

