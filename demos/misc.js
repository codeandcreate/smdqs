sQS("#debugOutput").insertAdjacentHTML('beforeend', "starting misc.js\n");

var cssLoaderButtons = sQS("button.cssLoader");
if (cssLoaderButtons !== null) {
	cssLoaderButtons.forEach(function(element, index) 
	{
		var cssFileToLoad = element.getAttribute("data-css");
		if (cssFileToLoad !== "") {
			sQS("#debugOutput").insertAdjacentHTML('beforeend', "found css loader button for " + cssFileToLoad  + "\n");
			element.addEventListener("click", function() {
				sQS().requireCSS(cssFileToLoad, function()
				{
					var countRequiredCSSLoaders = 0;
					var requiredCSSLoaders = sQS("head link[id^='sQS']");
					if (requiredCSSLoaders !== null) {
						countRequiredCSSLoaders = requiredCSSLoaders.items.length;
					}
					sQS("#debugOutput").insertAdjacentHTML('beforeend', "loaded " + cssFileToLoad + "; count with requiredCSS loaded files: " + countRequiredCSSLoaders + "\n");
				});
			});
		}
	});
}

var cssLoaderButtons = sQS("button.ajaxLoader");
if (cssLoaderButtons !== null) {
	cssLoaderButtons.forEach(function(element, index) 
	{
		var fileToLoad = element.getAttribute("data-ajax");
		if (fileToLoad !== "") {
			sQS("#debugOutput").insertAdjacentHTML('beforeend', "found ajax loader button for " + fileToLoad  + "\n");
			element.addEventListener("click", function() {
				sQS().ajax({
					url: fileToLoad,
					callback: function(data)
					{
						sQS("#debugOutput").insertAdjacentHTML('beforeend', "loaded following data with ajax: '" + data  + "'\n");
					}
				});
			});
		}
	});
}