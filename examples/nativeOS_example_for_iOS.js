/**
 * nativeOS Wrapper for iOS type link bridge example.
 *
 * It generates an special designed link and adds the callback function to the window-object,
 * so it can be called from a native part of an app.
 *
 * @type {{ajax: nativeOS.ajax, userSettings: nativeOS.userSettings}}
 */
var nativeOS = {
	_hash                    : function (s)
	{
		var returnHash = "";
		if (typeof s === "string" && s !== "") {
			returnHash = s.split("").reduce(function (a, b)
			{
				a = ((a << 5) - a) + b.charCodeAt(0);
				return a & a
			}, 0);
		}
		if (typeof returnHash !== "string") {
			returnHash = returnHash.toString();
		}
		if (returnHash === "") {
			returnHash = Math.floor(Math.random() * 9999999999);
		} else if (returnHash.substring(0,1) === "-") {
			returnHash = returnHash.substring(1);
		}

		return returnHash;
	},
	_replaceAmpersandAndEqual: function (str)
	{
		return String(str).replace(/&/g, '%26').replace(/=/g, '%3D');
	},
	ajax                     : function (data)
	{
		var appLink = "myfancyApp://ajax?";

		var linkData = {
			data   : data.data || {},
			headers: data.headers || {},
			method : data.method || "GET",
			url    : data.url
		};

		if (typeof linkData.data === "string") {
			linkData.data = nativeOS._replaceAmpersandAndEqual(linkData.data)
		}

		linkData = encodeURI(JSON.stringify(linkData));
		appLink  = appLink + "data=" + linkData;

		var dynamicFunctionName                = nativeOS._hash(linkData);
		window["smdcb_" + dynamicFunctionName] = data.callback;
		appLink                                = appLink + "&callback=" + "smdcb_" + dynamicFunctionName;

		if (typeof data.errorCallback === "function") {
			window["smdecb_" + dynamicFunctionName] = data.errorCallback;
			appLink                                 = appLink + "&errorCallback=" + "smdecb_" + dynamicFunctionName;
		}

		location.href = appLink;
	}
};
