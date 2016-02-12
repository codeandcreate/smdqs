/**
 *
 * smdQS - A minimalistic javascript wrapper for the jquery babied
 *
 * @version 1.0
 * @author Matthias Weiß <m.weiss@smdigital.de>
 *
 * @changes		20150000	MW	:	- Initialversion
 *
 */

/**
 * Initializer for prototype funktions hasClass, addClass, removeClass, toggleClass
 */
function smdQSinitHtmLElements()
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
}

/**
 * smdQS
 *
 * Subfunctions and Unterfunktionen und properties:
 *
 * ajax()		-	jQuery.ajax() Equivalent (doesn't need a valid DOM node)
 * forEach()	-	go through a list of nodes
 * isDomObject	-	true / false: Shows, if one or more nodes are found
 * isList		- 	true / false: If more than one nodes are found, this is "true" and you have to use "forEach()"
 *
 * @param selector		CSS/jQuery like Selektor (uses querySelectorAll)
 * @param baseObj		base node. if none is given, "document" is used
 * @returns {{}}
 */
var smdQS = function(selector, baseObj)
{
	/**
	 * jQuery.ajax() Equivalent
	 *
	 * @param url			URL which will be called (without GET params!)
	 * @param callback		Callback function, that gets the responseText if status 200 or 201 is returned
	 * @param data			data as array or string (...=...&...=...)
     * @param method		GET (default), POST, PUT, DELETE
     */
	function ajax(url, callback, data, method)
	{
		var xmlHttp = null;

		if (window.XMLHttpRequest) {
			xmlHttp = new XMLHttpRequest();
		} else
			if (window.ActiveXObject) {
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
				var tmp = data;
				data    = "";
				for (var key in tmp) {
					data = data + "&" + key + "=" + encodeURIComponent(tmp[key]);
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
	}

	var element         = {};
	element.isDomObject = false;
	element.isList      = false;

	if (selector != "" && selector != null && typeof selector == "string") {
		if (!baseObj) {
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
	}
	element.ajax = ajax;
	return element;
};

smdQSinitHtmLElements();
