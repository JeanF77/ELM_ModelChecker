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

const CFG_STREAM = "stream";
const CFG_BASELINE = "baseline";
const CFG_CHANGESET = "changeset";

/* ------------------------------------------------------------------------------
    ---- Classes
   --------------------------------------------------------------------------- */

class ELMObject {
    constructor(name) {
        this.id = null;                                      // ---- Object Short ID
        this.uri = null;                                     // ---- Object URI
        this.name = (name === undefined ? null : name);      // ---- Object Name
        this.isarchived = false;                             // ---- Object is archived
        this.creator = null;                                 // ---- Object Creator URL
        this.creatorname = null;                             // ---- Object Creator Name
        this.createdon = null;                               // ---- Object Date and Time
        this.toscan = false;                                 // ---- Object can be examined
    }

    init(xml_data) { // ---- Init Object
        let mySelf = this;

        xml_data.each(function () {
            switch ($(this).prop('nodeName')) {
                case JP060_URL:               // ---- Get Project URI
                case OSLCCONFIG0_COMPONENT:   // ---- Get Component URI
                    mySelf.uri = $(this).text();
                    mySelf.id = mySelf.get_shortid();
                    break;

                case JP060_ARCHIVED:  // ---- Get Object state
                    mySelf.isarchived = $(this).text();
                    break;

                default:
                // ---- Do nothing
            };
        });
    }

    reset() { // ---- Reset object
        this.id = null;
        this.uri = null;
        this.name = null;
        this.isarchived = false;
        this.creator = null;
        this.creatorname = null;
        this.createdon = null;
        this.toscan = false;
    }

    get_type() { // ---- Return object type (for component, configurations and changeset only !)
        let myMatch = this.uri.match(/^https.+\/rm\/cm\/(.+)\/.+/);

        return myMatch[1];
    }

    get_shortid() { // ---- Return object Short ID
        let myMatch = this.uri.match(/^https.+\/(.+)/);

        return myMatch[1];
    }

    get_uri() { // ---- Return object URI
        return this.uri;
    }

    get_name() { // ---- Return object Name
        return this.name;
    }

    get_hostname() { // ---- Return object Hostname
        const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/\?#:]+(?::\d+)?)/;

        if (this.uri !== null) {
            let myMatch = this.uri.match(regex);

            if (myMatch) {
                return myMatch[0];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    get_isarchived() { // ---- Get archive status
        return this.isarchived;
    }

    set_isarchived() { // ---- Configuration is archived
        this.isarchived = true;
    }

    get_creator() { // ---- Get creator URL
        return this.creator;
    }

    get_creatorId() { // ---- Get creator Id
        let myMatch = this.creator.match(/^https.+\/(.+)/);

        return myMatch[1];
    }

    get_creatorname() { // ---- Get creator Name
        return this.creatorname;
    }

    get_createdon() { // ---- Get creation date
        const isoString = this.createdon;
        const dateObj = new Date(isoString);

        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0'); // ---- Months are 0 to 11, so add +1
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    get_userURL() { // ---- REST request to get user details
        return this.get_hostname() + "/jts/users/" + this.get_creator();
    }

    toscan_on() { // ---- Object can be examined
        this.toscan = true;
    }

    toscan_off() { // ---- Object can not be examined
        this.toscan = false;
    }

    get_scanstatus() { // ---- Object project scan status
        return this.toscan;
    }
}

/* --------------------------------------------------------------------------- */

class ELMProject extends ELMObject {
    constructor(name) {
        super(name);

        this.compList = [];         // ---- Project components list (Array of ELMComponent objects)
    }

    init(xml_data) {
        super.init(xml_data);
    }

    reset() { // ---- Reset project
        super.reset();

        this.compList.splice(0);
    }

    get_componentListURL() { // ---- REST request to get components list
        return this.get_hostname() + "/rm/rm-projects/" + this.get_shortid() + "/components";
    }

    get_componentList() { // ---- Get components list
        return this.compList;
    }

    get_componentbyId(id) { // ---- Get component by short Id
        return this.compList.find(component => component.get_shortid() === id)
    }

    clear_componentList() { // ---- Clear components list
        this.compList.splice(0);
    }

    get_configurationList(type) { // ---- Get configurations list (if type is set, only active configurations are returned)
        let myConfigurationList = [];

        for (let myComponent of this.compList) { // ---- Concat all configurations of all components
            if (type !== undefined) { // ---- Filtered List (return only active configuration !)
                let myFilteredList = myComponent.get_configurationList(type);

                if (myFilteredList.length > 0) {
                    myConfigurationList = myConfigurationList.concat(myFilteredList);
                }
            } else { // ---- Return all, even if archived !
                myConfigurationList = myConfigurationList.concat(myComponent.get_configurationList());
            }
        }

        return myConfigurationList;
    }

    add_component(component) { // ---- Add component in component list
        this.compList.push(component);

        return this.compList;
    }
}

/* --------------------------------------------------------------------------- */

class ELMComponent extends ELMObject {
    constructor(name) {
        super(name);

        this.parentprjid = null;        // ---- Component Parent Project short ID
        this.configList = [];           // ---- Component configuration list (Array of ELMConfiguration objects)
    }

    init(xml_data) { // ---- Init component
        let mySelf = this;

        super.init(xml_data);

        xml_data.each(function () {
            let myPrjId = [];

            switch ($(this).prop('nodeName')) {
                case JP060_URL: // ---- Get parent project ID
                    mySelf.parentprjid = $(this).text();
                    myPrjId = mySelf.parentprjid.match(/^https.+\/rm-projects\/(.+)\/components\/.+/);
                    mySelf.parentprjid = myPrjId[1];
                    break;

                default:
                // ---- Do nothing
            };
        });
    }

    reset() { // ---- Reset component
        super.reset();

        this.parentprjid = null;
        this.configList.splice(0);
    }

    get_parent() { // ---- Get the parent project
        return this.parentprjid;
    }

    get_configurationListURL() { // ---- REST request to get configurations list
        return this.get_hostname() + "/rm/cm/component/" + this.get_shortid() + "/configurations";
    }

    get_configurationList(type) { // ---- Get component's configurations list (if type is set, only active configurations are returned)
        if (type !== undefined) {
            return this.configList.filter(configuration => configuration.get_type() === type && configuration.get_isarchived() === false)
        } else {
            return this.configList;
        }
    }

    get_configurationbyId(id) { // ---- Get configuration by short Id
        return this.configList.find(configuration => configuration.get_shortid() === id)
    }

    clear_configurationList() { // ---- Clear configurations list
        this.configList.splice(0);
    }

    add_configuration(configuration) { // ---- Add configuration in configuration list
        this.configList.push(configuration);

        return this.configList;
    }
}

/* ---------------------------------------------------------------------------

"update(data)" parses :

<oslc_config:Configuration rdf:about="https://elm702/rm/cm/stream/_z5lRYHAgEe6smu7YsPqVqQ">
        <dcterms:created rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime"
    >2023-10-21T14:47:51.931Z</dcterms:created>
        <dcterms:creator rdf:resource="https://elm702/jts/users/s018642a"/>
        <j.0:changesets rdf:resource="https://elm702/rm/cm/stream/_z5lRYHAgEe6smu7YsPqVqQ/changesets"/>
        <process:projectArea rdf:resource="https://elm702/rm/process/project-areas/_W3gP0FwfEe2HWui_AGn9sQ"/>
        <oslc_config:acceptedBy rdf:resource="http://open-services.net/ns/config#Configuration"/>
        <oslc_config:overrides rdf:resource="https://elm702/rm/cm/baseline/_yCv6gNtSEe2dTMbg_TbVBQ"/>
        <oslc_config:component rdf:resource="https://elm702/rm/cm/component/_W4yCMFwfEe2HWui_AGn9sQ"/>
        <acc:accessContext rdf:resource="https://elm702/rm/acclist#_W3gP0FwfEe2HWui_AGn9sQ"/>
        <dcterms:title rdf:parseType="Literal">SD - Find Replace</dcterms:title>
        <oslc_config:previousBaseline rdf:resource="https://elm702/rm/cm/baseline/_ATXhQJcgEe62yNmb3QSnwg"/>
        <prov:wasDerivedFrom rdf:resource="https://elm702/rm/cm/baseline/_yCv6gNtSEe2dTMbg_TbVBQ"/>
        <rdf:type rdf:resource="http://open-services.net/ns/config#Stream"/>
        <oslc:serviceProvider rdf:resource="https://elm702/rm/oslc_rm/_W3gP0FwfEe2HWui_AGn9sQ/services.xml"/>
        <oslc_config:selections rdf:resource="https://elm702/rm/configSelections/stream/_z5lRYHAgEe6smu7YsPqVqQ"/>
        <oslc_config:baselines rdf:resource="https://elm702/rm/cm/stream/_z5lRYHAgEe6smu7YsPqVqQ/baselines"/>
        <dcterms:description></dcterms:description>
        <dcterms:identifier>_z5lRYHAgEe6smu7YsPqVqQ</dcterms:identifier>
    </oslc_config:Configuration>

*/

class ELMConfiguration extends ELMObject {
    constructor(name) {
        super(name);

        this.creator = null;                                   // ---- Configuration Creator
        this.type = null;                                      // ---- Configuration Type
        this.parentcompid = null;                              // ---- Configuration Parent Component short ID
        this.moduleList = [];                                  // ---- Configuration Module List
        this.overrideList = [];                                // ---- Changeset List
    }

    init(xml_data) { // ---- Init configuration
        this.uri = xml_data.attr(RDF0_RESOURCE);
        this.id = this.get_shortid();
        this.type = this.get_type();
    }

    update(data) { // ---- Update configuration
        let mySelf = this;
        let myConf;
        let xmlData = $.parseXML(data);

        mySelf.isarchived = false;

        myConf = $(xmlData).find(OSLCCONFIG_STREAM); // ---- 1ere forme de la reponse

        if (myConf.length === 0) {
            myConf = $(xmlData).find(OSLCCONFIG_CONFIGURATION); // ---- 2sde forme de la reponse

            if (myConf.length === 0) {
                myConf = $(xmlData).find(OSLCCONFIG_CONFIGURATION2); // ---- 3ieme forme de la reponse

                if (myConf.length === 0) {
                    myConf = $(xmlData).find(OSLCCONFIG_BASELINE); // ---- 4ieme forme de la reponse
                }
            }
        }

        myConf.children().each(function () {
            let myMatch = [];

            switch ($(this).prop('nodeName')) {
                case DCTERMS0_TITLE:  // ---- Get configuration name
                    mySelf.name = $(this).text();
                    break;

                case DCTERMS0_CREATOR: // ---- Get configuration creator
                    mySelf.creator = $(this).attr(RDF0_RESOURCE);
                    break;

                case OSLCCONFIG0_COMPONENT: // ---- Get parent component ID
                    myMatch = $(this).attr(RDF0_RESOURCE).match(/^https.+\/(.+)/);
                    mySelf.parentcompid = myMatch[1];
                    break;

                default:
                // ---- Do nothing
            };
        });
    }

    reset() { // ---- Reset configuration
        super.reset();

        this.creator = null;
        this.type = null;
        this.parentcompid = null;
        this.moduleList.splice(0);
        this.overrideList.splice(0);
    }

    get_parent() { // ---- Get the parent component
        return this.parentcompid;
    }

    add_children(id) { // ---- Add module in module list
        this.moduleList.push(id);

        return this.moduleList;
    }

    add_overrides(id) { // ---- Add changeset in ovverides list
        this.overrideList.push(id);

        return this.overrideList;
    }

    get_overrides() { // ---- Get override configurations list (as Changeset, for example)
        return this.overrideList;
    }

    get_changeSetURL() { // ---- REST request to get changeset list (only for stream !)
        if (this.type === CFG_STREAM) {
            return this.uri + "/changesets";
        } else {
            return null;
        }
    }
}

/* ---------------------------------------------------------------------------

"init(xml_data)" parses :

<oslc_config:ChangeSet rdf:about="https://elm702/rm/cm/changeset/_idWVUBQGEe-jla1D4_LwoQ">
    <dcterms:title rdf:parseType="Literal">Create second changeset</dcterms:title>
    <dcterms:created rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime"
    >2024-05-17T04:32:58.661Z</dcterms:created>
    <oslc:serviceProvider rdf:resource="https://elm702/rm/oslc_rm/_W3gP0FwfEe2HWui_AGn9sQ/services.xml" />
    <oslc_config:acceptedBy rdf:resource="http://open-services.net/ns/config#Configuration" />
    <rdf:type rdf:resource="http://open-services.net/ns/config#Configuration" />
    <dcterms:identifier>_idWVUBQGEe-jla1D4_LwoQ</dcterms:identifier>
    <process:projectArea rdf:resource="https://elm702/rm/process/project-areas/_W3gP0FwfEe2HWui_AGn9sQ" />
    <oslc_config:component rdf:resource="https://elm702/rm/cm/component/_W4yCMFwfEe2HWui_AGn9sQ" />
    <dcterms:creator rdf:resource="https://elm702/jts/users/s018642a" />
    <rdf:type rdf:resource="http://open-services.net/ns/config#Stream" />
    <acc:accessContext rdf:resource="https://elm702/rm/acclist#_W3gP0FwfEe2HWui_AGn9sQ" />
    <oslc_config:overrides rdf:resource="https://elm702/rm/cm/stream/_z5lRYHAgEe6smu7YsPqVqQ" />
</oslc_config:ChangeSet>

*/

class ELMChangeset extends ELMObject {
    constructor(name) {
        super(name);

        this.type = null;                                      // ---- Changeset Type
        this.parentstreamid = null;                            // ---- Changeset Parent Stream short ID
    }

    init(xml_data) { // ---- Init Changeset
        let mySelf = this;
        this.uri = xml_data.attr(RDF0_ABOUT);
        this.id = this.get_shortid();
        this.type = this.get_type();

        xml_data.children().each(function () {
            switch ($(this).prop('nodeName')) {
                case DCTERMS0_TITLE:  // ---- Get Changeset name
                    mySelf.name = $(this).text();
                    break;

                case DCTERMS0_CREATOR: // ---- Get Changeset creator
                    mySelf.creator = $(this).attr(RDF0_RESOURCE);
                    break;

                case DCTERMS0_CREATED: // ---- Get Changeset creation date
                    mySelf.createdon = $(this).text();
                    break;

                case OSLCCONFIG0_OVERRIDES: // ---- Get parent stream
                    mySelf.parentstreamid = $(this).attr(RDF0_RESOURCE);
                    break;

                default:
                // ---- Do nothing
            };
        });
    }

    reset() { // ---- Reset Changeset
        super.reset();

        this.creator = null;
        this.creatorname = null;
        this.createdon = null;
        this.type = null;
        this.parentstreamid = null;
    }
}