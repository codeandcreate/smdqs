/**
 *
 * smdQS - A minimalistic javascript object for the jquery babied
 *
 * @version 2.0-testing
 * @author Matthias Weiß <m.weiss@smdigital.de>
 *
 * @changes		20150000	MW	:	- Initialversion
 * @changes		20170300	MW	:	- New structure and tools (docReady and loadJS)
 *
 */
(function(funcName, baseObj) {
	funcName = funcName || "smdQS";
	baseObj = baseObj || window;
	
	var __init = false;
	var __readyList = [];
	var __readyFired = false;
	var __readyEventHandlersInstalled = false;
	
	/**
	 * Initializer for prototype funktions hasClass, addClass, removeClass, toggleClass
	 */
	function _smdQSinitHtmLElements()
	{
		var elementPrototype = typeof HTMLElement !== "undefined" ? HTMLElement.prototype : (typeof Element !== "undefined" ? Element.prototype : null);
	
		if (elementPrototype != null) {
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
				if (this.className.indexOf(add) == -1) {
					this.className = this.className + " " + add;
				}
			};
			elementPrototype.toggleClass = function (toggle)
			{
				if (this.className.indexOf(toggle) == -1) {
					this.addClass(toggle);
				} else {
					this.removeClass(toggle);
				}
			};
			elementPrototype.hasClass    = function (classToCheck)
			{
				return (this.className.indexOf(classToCheck) != -1);
			};
		}
	};
	
	/**
	 * jQuery.ajax() Equivalent
	 *
	 * @param url           URL which will be called (without GET params!)
	 * @param callback      Callback function, that gets the responseText if status 200 or 201 is returned
	 * @param data          data as array or string (...=...&...=...)
	 * @param method        GET (default), POST, PUT, DELETE
	 */
	function _ajax(url, callback, data, method)
	{	
		if (typeof url === "object") {
			var ajaxCallObject = url;
			url                = ajaxCallObject.url || undefined;
			callback           = ajaxCallObject.callback || undefined;
			data               = ajaxCallObject.data || "";
			method             = ajaxCallObject.method || "GET";
		}
		
		if (typeof url == "undefined" || typeof callback == "undefined") {
			return false;
		}
	
		var xmlHttp = null;
	
		if (window.XMLHttpRequest) {
			xmlHttp = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		if (xmlHttp != null) {
			function readyStateHandler(e)
			{
				if (xmlHttp.readyState === 4) {
					if (xmlHttp.status === 200 || xmlHttp.status === 201) {
						callback(xmlHttp.responseText);
					}
				}
			}

			xmlHttp.onload = readyStateHandler;

			if (typeof data == "undefined") {
				data = "";
			}
			if (method != "GET" && method != "POST") {
				method = "GET";
			}

			if (typeof data == "object") {
				var dataObject = data;
				data           = "";
				for (var key in dataObject) {
					data = data + "&" + key + "=" + encodeURIComponent(dataObject[key]);
				}
			}

			if (method == "POST" || method == "PUT" || method == "DELETE") {
				xmlHttp.open(method, url, true);
				xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xmlHttp.send(data);
			} else {
				if (data != "") {
					data = "?" + data;
				}
				xmlHttp.open("GET", url + data, true);
				xmlHttp.send();
			}
		}
	};
	
	/**
	 * Based on loadJS; 
	 * inserts a script-tag and executes an optional callback onload
	 *
	 * @param scriptSource	URL of a js-script
	 * @param callback		optional callback function
	 */
	function _requireJS(scriptSource, callback)
	{	
		if (typeof scriptSource == "undefined") {
			return false;
		}
	
		"use strict";
		var ref = window.document.getElementsByTagName( "script" )[ 0 ];
		var script = window.document.createElement( "script" );
		script.src = scriptSource;
		script.async = true;
		ref.parentNode.insertBefore( script, ref );
		if (callback && typeof(callback) === "function") {
			script.onload = callback;
		}
	};
	
	/**
	 * a $( document ).ready({});-like 
	 * Forked from https://github.com/jfriend00/docReady
	 *
	 * @param callback	that will be fired if document is ready
	 * @param context	optional context
	 */
	function _docReady(callback, context)
	{
		if (__readyFired) {
			setTimeout(function() {callback(context);}, 1);
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
				document.attachEvent("onreadystatechange", readyStateChange);
				window.attachEvent("onload", _documentIsReady);
			}
			__readyEventHandlersInstalled = true;
		}
	};
	
	/**
	 * Belongs to _docReady
	 */
	function _documentIsReady() {
		if (!__readyFired) {
			__readyFired = true;
			for (var i = 0; i < __readyList.length; i++) {
				__readyList[i].fn.call(window, __readyList[i].ctx);
			}
			__readyList = [];
		}
	};
	
	/**
	 * Belongs to _docReady
	 */
	function _readyStateChange()
	{
		if ( document.readyState === "complete" ) {
			_documentIsReady();
		}
	};
	
	/**
	 * Main function that returns one ore more DOM Objects
	 */
	function _smdQSMain(selector, baseObj, element) 
	{	
		if (!baseObj || typeof baseObj == "undefined" || typeof baseObj.querySelectorAll == "undefined") {
			baseObj = document;
		}

		var domObjects = baseObj.querySelectorAll(selector);
		if (typeof domObjects === "object" && domObjects != null) {
			if (domObjects.length == 1) {
				element             = domObjects[0];
				element.isList      = false;
				element.isDomObject = true;
			} else {
				if (domObjects.length > 0) {
					var nodeList   = {};
					nodeList.items = domObjects;

					/**
					 * function, to go through all found nodes
					 *
					 * @param callback
					 * @param scope
					 */
					nodeList.forEach = function (callback, scope)
					{
						for (var i = 0; i < this.items.length; i++) {
							callback.call(scope, i, this.items[i]); // passes back stuff we need
						}
					};
					element             = nodeList;
					element.isList      = true;
					element.isDomObject = true;
				}
			}
		}
		return element;
	};
	
	/**
	 * smdQS
	 *
	 * Subfunctions and Unterfunktionen und properties:
	 *
	 * ajax()		-	jQuery.ajax() Equivalent (doesn't need a valid DOM node)
	 * requireJS()	-	Inserts a script-Tag and runs an callback onload (doesn't need a valid DOM node)
	 * docReady()	-	
	 * forEach()	-	go through a list of nodes
	 * isDomObject	-	true / false: Shows, if one or more nodes are found
	 * isList		- 	true / false: If more than one nodes are found, this is "true" and you have to use "forEach()"
	 *
	 * @param selector		CSS/jQuery like Selektor (uses querySelectorAll)
	 * @param baseObj		base node. if none is given, "document" is used
	 * @returns {{}}
	 */
	baseObj[funcName] = function(selector, baseObj) 
	{
		var element 		= {};
		element.isDomObject = false;
		element.isList      = false;
		
		if (!__init) {
			_smdQSinitHtmLElements();
			__init = true;
		}
		
		if (selector != "" && selector != null && typeof selector == "string") {
			element = _smdQSMain(selector, baseObj, element);
		}
		
		element.ajax 		= _ajax;
		element.requireJS	= _requireJS;
		element.ready		= _docReady;

		return element;
	};
})("smdQS", window);