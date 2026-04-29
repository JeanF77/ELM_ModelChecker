/*******************************************************************************/
/*                    (C) Copyright 2019 by Safran Aircraft Engines            */
/*                             All rights reserved                             */
/*******************************************************************************/
/*
+-------------------------------------------------------------------------------+
| Revision |    Date    |     Author     |                Issue                 |
+-------------------------------------------------------------------------------+
|     1    | 28/01/2021 |   Safran       | Initial version                      |
+-------------------------------------------------------------------------------+
*/

/* ------------------------------------------------------------------------------
	---- Constantes
   --------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------- */
// ---- Constantes multi-usages

const IS_SUCCESS                             = "isSuccess";
const IS_ERROR                               = "isError";
const IS_WARNING                             = "isWarning";
const IS_INPROGRESS                          = "isInProgress";

/* --------------------------------------------------------------------------- */
// ---- Console messages management

const CONSOLE_INFO                           = "--- INFO : ";
const CONSOLE_WARNING                        = "§§§ WARN : ";
const CONSOLE_ERROR                          = "### ERROR : ";

/* ------------------------------------------------------------------------------
	---- Classes
   --------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------
	---- Variables globales
   --------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------
	---- Core Fonctions
   --------------------------------------------------------------------------- */

/**
 * Manage console messages
 * @param {String} consMsg - Console message
 * @param {String} status - Message type (optional, CONSOLE_INFO, CONSOLE_WARNING, CONSOLE_ERROR)
 */

function mgt_Console (msgText, msgType) {
	switch (msgType) {
		case CONSOLE_INFO:
			console.info(msgType + msgText);
		break;
		
		case CONSOLE_WARNING:
			console.warn(msgType + msgText);
		break;

		case CONSOLE_ERROR:
			console.error(msgType + msgText);
		break;
			
		default: // ---- Option
			console.info(CONSOLE_INFO + msgText);
	}
}

/**
 * Recuperer les parametres <UserPref> d'un widget Jazz
 * @param {String} sUserPrefName - Nom du parametre
 */

function widget_get_UserPref (sUserPrefName) {
	let sValue = '';
	let prefs  = new gadgets.Prefs();
 
	sValue = prefs.getString (sUserPrefName);
 
	return sValue;
 }

/**
 * Generate HTML from HTML template
 * @param {String} templName - Template Name
 * @param {Object} context - Template Parameters
 * @returns - HTML Content
 */

function gui_htmlfromtemplate (templName, context) {
	let myHtmlTemplate = $("#" + templName);
	let myTemplate;
	let myTemplSrc;
	let myHtmlContent;
 
	myTemplSrc = myHtmlTemplate.html();
	myTemplate = Handlebars.compile(myTemplSrc);
 
	myHtmlContent = myTemplate (context);
 
	return myHtmlContent;
}

/**
 * Compare property "title" from array of objects
 */

function compareTitle (a, b) {
	// ---- Use toUpperCase() to ignore character casing
 
	const nameA = a.title.toUpperCase();
	const nameB = b.title.toUpperCase();
 
	// ---- Compare

	if (nameA > nameB) { // ---- Greater
		return 1;
	} else if (nameA < nameB) { // ---- Lower
		return -1;
	} else { // ---- Equal
		return 0;
	}

 }
