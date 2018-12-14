/**
 * sQS - A minimalistic javascript object for the jquery babied
 *
 * @version 1.2 - based on smdQS 2.0
 * @author Matthias Weiß <info@codeandcreate.de>
 *
 * @url https://github.com/codeandcreate/smdQS
 */
(function (funcName, baseObj)
{
	funcName = funcName || "sQS";
	baseObj  = baseObj || window;

	var __readyList                   = [];
	var __readyFired                  = false;
	var __readyEventHandlersInstalled = false;

	/**
	 * jQuery.ajax() Equivalent
	 *
	 * @param urlOrObject   URL which will be called (without GET params!)
	 * @param callback      Callback function, that gets the responseText if status 200 or 201 is returned
	 * @param data          data as array or string (...=...&...=...)
	 * @param method        GET (default), POST, PUT, DELETE
	 * @private
	 */
	function _ajax(urlOrObject, callback, data, method)
	{
		var errorCallback, headers, withCredentials;

		if (typeof urlOrObject === "object") {
			data            = urlOrObject.data || "";
			method          = urlOrObject.method || "GET";
			callback        = urlOrObject.callback || undefined;
			errorCallback   = urlOrObject.errorCallback || undefined;
			headers         = urlOrObject.headers || undefined;
			withCredentials = urlOrObject.withCredentials || undefined;

			urlOrObject = urlOrObject.url || undefined;
		}

		if (typeof urlOrObject === "undefined" || typeof callback === "undefined") {
			return false;
		}

		var xmlHttp = null;

		if (typeof window.sQS_jsHost !== "undefined" && urlOrObject.indexOf("://") === -1) {
			urlOrObject = window.sQS_jsHost + urlOrObject;
		}

		xmlHttp = new XMLHttpRequest();
		if (withCredentials === true) {
			xmlHttp.withCredentials = true;
		}

		if (xmlHttp !== null) {

			xmlHttp.onload = function(e) 
			{
				if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 201)) {
					callback(xmlHttp.responseText);
				} else if (typeof errorCallback === "function") {
					errorCallback(xmlHttp);
				}
			};

			if (typeof data === "undefined") {
				data = "";
			}

			if (method !== "GET" && method !== "POST") {
				method = "GET";
			}

			if (typeof data === "object") {
				var dataObject = data;
				data           = "";
				for (var key in dataObject) {
					data = data + "&" + key + "=" + encodeURIComponent(dataObject[key]);
				}
			}

			if (method === "POST" || method === "PUT" || method === "DELETE") {
				xmlHttp.open(method, urlOrObject, true);
				xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				if (typeof headers === "object") {
					for (var i in headers) {
						xmlHttp.setRequestHeader(i, headers[i]);
					}
				}
				xmlHttp.send(data);
			} else {
				if (data !== "") {
					data = "?" + data;
				}
				xmlHttp.open("GET", urlOrObject + data, true);
				if (typeof headers === "object") {
					for (var i in headers) {
						xmlHttp.setRequestHeader(i, headers[i]);
					}
				}
				xmlHttp.send();
			}
			return true;
		}
		return false;
	}

	/**
	 * Simple hashing function for uniq ids (_requireElement)
	 *
	 * Source: http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
	 *
	 * @param s
	 * @returns {*}
	 * @private
	 */
	function __hashString(s)
	{
		var hash = 0, i, chr;
		if (s.length === 0) {
			return hash;
		}
		for (i = 0; i < s.length; i++) {
			chr  = s.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0;
		}
		return hash;
	}

	/**
	 * Based on loadJS;
	 * inserts a script tag or a link (css) tag  and executes an optional callback onload
	 *
	 * @param type      type of the script (stylesheet or javascript)
	 * @param source    URL of a script
	 * @param callback  optional callback function
	 * @param clear     drops an existing tag before (re)insert
	 * @private
	 */
	function __requireElement(type, source, callback, clear)
	{
		if (
			typeof source === "undefined" ||
			typeof type === "undefined"
		) {
			return false;
		}

		if (typeof window.sQS_jsHost !== "undefined" && source.indexOf("://") === -1) {
			source = window.sQS_jsHost + source;
		}

		var existingElement = document.querySelector("#sQS" + __hashString(source));

		if (existingElement !== null && clear === true) {
			existingElement.parentNode.removeChild(existingElement);
			existingElement = null;
		}

		if (existingElement === null) {
			"use strict";

			var ref        = null;
			var newElement = null;

			switch (type) {
				case 'javascript':
					ref              = window.document.getElementsByTagName("script")[0];
					newElement       = window.document.createElement("script");
					newElement.src   = source;
					newElement.async = true;
					newElement.id    = "sQS" + __hashString(source);
					break;
				case 'stylesheet':
					ref             = window.document.getElementsByTagName("link")[0];
					newElement      = window.document.createElement("link");
					newElement.href = source;
					newElement.type = "text/css";
					newElement.rel  = "stylesheet";
					newElement.id   = "sQS" + __hashString(source);
					break;
			}

			if (newElement === null) {
				return false;
			}

			if (callback && typeof(callback) === "function") {
				newElement.onload = callback;
			}
			
			if (ref === null || typeof ref === "undefined") {
				window.document.querySelector("head").appendChild(newElement);
			} else {
				ref.parentNode.insertBefore(newElement, ref);
			}
		} else if (typeof(callback) === "function") {
			callback();
		}

	}

	/**
	 * Loads a javascript from scriptSource
	 *
	 * @param scriptSource
	 * @param callback
	 * @param clear
	 * @returns {*}
	 * @private
	 */
	function _requireJS(scriptSource, callback, clear)
	{
		return __requireElement("javascript", scriptSource, callback, clear);
	}

	/**
	 * Loads a stylesheet from sheetSource
	 *
	 * @param sheetSource
	 * @param callback
	 * @param clear
	 * @returns {*}
	 * @private
	 */
	function _requireCSS(sheetSource, callback, clear)
	{
		return __requireElement("stylesheet", sheetSource, callback, clear);
	}

	/**
	 * a $( document ).ready({});-alike
	 * Forked from https://github.com/jfriend00/docReady
	 *
	 * @param callback   that will be fired if document is ready
	 * @param context    optional context
	 */
	function _docReady(callback, context)
	{
		if (__readyFired) {
			setTimeout(function ()
			{
				callback(context);
			}, 1);
			return;
		} else {
			__readyList.push({fn: callback, ctx: context});
		}
		if (document.readyState === "complete") {
			setTimeout(_documentIsReady, 1);
		} else if (!__readyEventHandlersInstalled) {
			if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", _documentIsReady, false);
				window.addEventListener("load", _documentIsReady, false);
			} else {
				document.attachEvent("onreadystatechange", _readyStateChange);
				window.attachEvent("onload", _documentIsReady);
			}
			__readyEventHandlersInstalled = true;
		}
	}

	/**
	 * Belongs to _docReady
	 */
	function _documentIsReady()
	{
		if (!__readyFired) {
			__readyFired = true;
			for (var i = 0; i < __readyList.length; i++) {
				__readyList[i].fn.call(window, __readyList[i].ctx);
			}
			__readyList = [];
		}
	}

	/**
	 * Belongs to _docReady
	 */
	function _readyStateChange()
	{
		if (document.readyState === "complete") {
			_documentIsReady();
		}
	}

	/**
	 * Main function that returns one ore more DOM Objects
	 */
	function _sQSMain(selector, baseObj, element)
	{
		if (!baseObj || typeof baseObj === "undefined" || typeof baseObj.querySelectorAll === "undefined") {
			baseObj = document;
		}

		var domObjects, _usesQS = true;

		if (selector.substr(0,1) === "#" && selector.indexOf(" ") === -1 && selector.indexOf(".") === -1) {
			_usesQS = false;
			domObjects = document.getElementById(selector.substr(1));
		} else {
			domObjects = baseObj.querySelectorAll(selector);
		}

		if (typeof domObjects === "object" && domObjects !== null) {
			if (!_usesQS) {
				element         = domObjects;
				element.items   = [domObjects];
				element.isList  = false;
			} else if (domObjects.length === 1) {
				element         = domObjects[0];
				element.items   = [domObjects[0]];
				element.isList  = false;
			} else if (domObjects.length > 0) {
				element         = {};
				element.items   = domObjects;
				element.isList  = true;
			} else {
				return null;
			}

			/**
			 * Wraps forEach for all types of returns
			 *
			 * @param callback
			 * @param scope
			 */
			element.forEach = function(callback, scope)
			{
				this.items.forEach(function(element, index, array) {
					callback.call(scope, element, index, array);
				});
			};
		} else {
			return null;
		}

		return element;
	}

	/**
	 * sQS
	 *
	 * Subfunctions and Unterfunktionen und properties:
	 *
	 * ajax()        -    jQuery.ajax() Equivalent (doesn't need a valid DOM node)
	 * requireJS()   -    Inserts a script tag and runs an callback onload (doesn't need a valid DOM node)
	 * requireCSS()  -    Inserts a link tag (css) and runs an callback onload (doesn't need a valid DOM node)
	 * docReady()    -    jQuery.ready equicalent (
	 * forEach()     -    go through a list of nodes
	 * isList        -    true / false: If more than one nodes are found, this is "true" and you have to use "forEach()"
	 *
	 * @param selector    CSS/jQuery like Selektor (uses querySelectorAll)
	 * @param baseObj     base node. if none is given, "document" is used
	 * @returns {{}} | null
	 */
	baseObj[funcName] = function (selector, baseObj)
	{
		var element = {};

		if (selector !== "" && selector !== null && typeof selector === "string") {
			element = _sQSMain(selector, baseObj, element);
		}

		if (element !== null) {
			element.ajax       = _ajax;
			element.requireJS  = _requireJS;
			element.requireCSS = _requireCSS;
			element.ready      = _docReady;
			element.version    = 1.2;
		}

		return element;
	}
})("sQS", window);
