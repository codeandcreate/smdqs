/**
 *
 * smdQS - A minimalistic javascript object for the jquery babied
 *
 * @function smdQS
 * @version 2.0
 * @author Matthias Weiß <m.weiss@smdigital.de>
 *
 * @changes     20150000    MW    :   - initialversion
 *              20170300    MW    :   - new structure and tools (docReady and requireJS)
 *              20170420    MW  :   - dropped "isDomObject", added requireCSS
 *              20170424    MW  :   - avoid double adding of CSS/JS with requireCSS/-JS
 *              20170711    MW  :   - __requireElement now has an option to ignore if reinsert an css/js
 *              20170714    MW  :   - errorHandler for ajax() and optimizing
 *              20170908    MW  :   - support for using .ajax() inside a Android/iOS app with native os interface
 *              20171004    MW  :   - smdQS_jsHost
 *              20171124    MW  :   - edited nativeOS workflow
 *              20180109    MW  :   - withCredentials added to .ajax()
 *              20180105    MW  :   - clean up
 *
 * @url https://github.com/schwaebischmediadigital/smdqs/tree/testing
 */
(function (funcName, baseObj)
{
	funcName = funcName || "smdQS";
	baseObj  = baseObj || window;

	var __init                        = false;
	var __readyList                   = [];
	var __readyFired                  = false;
	var __readyEventHandlersInstalled = false;

	/**
	 * Initializer for prototype funktions hasClass, addClass, removeClass, toggleClass
	 *
	 * @private
	 */
	function _smdQSinitHtmLElements()
	{
		var elementPrototype = typeof HTMLElement !== "undefined" ? HTMLElement.prototype : (typeof Element !== "undefined" ? Element.prototype : null);

		if (elementPrototype !== null) {
			elementPrototype.removeClass = function (remove)
			{
				var newClassName = "";
				var i;
				var classes      = this.className.split(" ");
				for (i = 0; i < classes.length; i++) {
					if (classes[i] !== remove) {
						newClassName += classes[i] + " ";
					}
				}
				this.className = newClassName.trim();
			};
			elementPrototype.addClass    = function (add)
			{
				if (this.className.indexOf(add) === -1) {
					this.className = this.className + " " + add;
				}
			};
			elementPrototype.toggleClass = function (toggle)
			{
				if (this.className.indexOf(toggle) === -1) {
					this.addClass(toggle);
				} else {
					this.removeClass(toggle);
				}
			};
			elementPrototype.hasClass    = function (classToCheck)
			{
				return (this.className.indexOf(classToCheck) !== -1);
			};
		}
	}

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

		if (typeof nativeOS !== "undefined" && typeof nativeOS.ajax !== "undefined") {
			nativeOS.ajax({
				data         : data,
				method       : method,
				headers      : headers,
				url          : urlOrObject,
				callback     : callback,
				errorCallback: errorCallback
			});
			return true;
		} else {
			var xmlHttp = null;

			if (typeof window.smdQS_jsHost !== "undefined" && urlOrObject.indexOf("://") === -1) {
				urlOrObject = window.smdQS_jsHost + urlOrObject;
			}

			if (window.XMLHttpRequest) {
				xmlHttp = new XMLHttpRequest();
				if (withCredentials === true) {
					xmlHttp.withCredentials = true;
				}
			} else if (window.ActiveXObject) {
				xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			if (xmlHttp !== null) {
				function readyStateHandler()
				{
					if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 201)) {
						callback(xmlHttp.responseText);
					} else if (typeof errorCallback === "function") {
						errorCallback(xmlHttp);
					}
				}

				xmlHttp.onload = readyStateHandler;

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

		if (typeof window.smdQS_jsHost !== "undefined" && source.indexOf("://") === -1) {
			source = window.smdQS_jsHost + source;
		}

		var existingElement = document.querySelector("#smdQS" + __hashString(source));

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
					newElement.id    = "smdQS" + __hashString(source);
					break;
				case 'stylesheet':
					ref             = window.document.getElementsByTagName("link")[0];
					newElement      = window.document.createElement("link");
					newElement.href = source;
					newElement.type = "text/css";
					newElement.rel  = "stylesheet";
					newElement.id   = "smdQS" + __hashString(source);
					break;
			}

			if (newElement === null) {
				return false;
			}

			if (callback && typeof(callback) === "function") {
				newElement.onload = callback;
			}

			if (ref === null) {
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
	function _smdQSMain(selector, baseObj, element)
	{
		if (!baseObj || typeof baseObj === "undefined" || typeof baseObj.querySelectorAll === "undefined") {
			baseObj = document;
		}

		var domObjects, _usesQS = true;

		if (selector.substr(0, 1) === "#" && selector.indexOf(" ") === -1 && selector.indexOf(".") === -1) {
			_usesQS    = false;
			domObjects = baseObj.getElementById(selector.substr(1));
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
	 * smdQS
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

		if (!__init) {
			_smdQSinitHtmLElements();
			__init = true;
		}

		if (selector !== "" && selector !== null && typeof selector === "string") {
			element = _smdQSMain(selector, baseObj, element);
		}

		if (element !== null) {
			element.ajax       = _ajax;
			element.requireJS  = _requireJS;
			element.requireCSS = _requireCSS;
			element.ready      = _docReady;
		}

		return element;
	}
})("smdQS", window);
