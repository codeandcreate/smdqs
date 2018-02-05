# smdQS
A minimalistic javascript for the jquery babied...  
It uses querySelectorAll or getElementById to get a DOM-Node.

## Changes

|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;Version&nbsp;&nbsp;&nbsp;| Info |
|---|---|---|
| some day 2015 | 1.0 | initial version |
| 28.02.2017 | 2.0-testing | new structure and two new functions: requreJS and ready   |
| 20.04.2017 | 2.0-testing | dropped "isDomObject", added requireCSS |
| 24.04.2017 | 2.0-testing | avoid double adding of CSS/JS with requireCSS/-JS |
| 11.07.2017 | 2.0-testing | requireElement now has an option to ignore if reinsert an css/js |
| 14.07.2017 | 2.0-testing | errorHandler for ajax() and optimizing |
| 08.09.2017 | 2.0-testing | support for using .ajax() inside a Android/iOS app with native os interface |
| 04.11.2017 | 2.0-testing | smdQS_jsHost |
| 24.11.2017 | 2.0-testing | edited nativeOS workflow |
| 09.01.2018 | 2.0-testing | withCredentials added to .ajax() |
| 05.02.2018 | 2.0-testing | clean up & new forEach workflow |

## Examples

- ajax() call:
``` js
smdQS().ajax({
	url:		"/testscript.php", 		//required
	method:		"GET",
	data:		{},
	callback:	function( returnData ) {	//required
				console.log(returnData);					
			},
	errorCallback:	function( XMLHttpRequest ) {
				console.log(XMLHttpRequest);
			}
});	
```

- ready() - Execute something on document ready:
``` js
smdQS().ready(function() {
	console.log("document is ready");					
}
```

- requireJS() - load an other js:
``` js
smdQS().requireJS("/js/somejsfile.js", function() {
	console.log("js file is loaded.");					
}
```

- requireCSS() - load an other css:
``` js
smdQS().requireCSS("/css/somecssfile.css", function() {
	console.log("css file is loaded.");					
}
```

- working with classes and selectors:
``` js
var myNode = smdQS("#idOfMyNode");
if (myNode.hasClass("aNiceClass")) {
	myNode.removeClass("aNiceClass");
}
```

- working with a array of nodes:
``` js
var aListOfNodes = smdQS(".btn");
if (aListOfNodes !== null) {
	var isAList = aListOfNodes.isList;

	//...

	aListOfNodes.forEach(function(oneOfThisNodes, index, array) 
	{
		oneOfThisNodes.removeAttribute("onclick");
		oneOfThisNodes.addEventListener("click", function() 
		{
			console.log("You have clicked on the button with the index " + index);
		});
	});
} 
```

## nativeOS Interface

smdQS().ajax() detects if there is a native interface available and uses it. The interface must be implemented with following specs:

- nativeOS must be callable from Javascript
- nativeOS.ajax() must be callable with a string as first param contains a JSON.stringify()-ed object with following content:
``` js
{
  data: "...", 
  method: "...", 
  headers: "...", 
  url: "..."
  callback: function() {
    //...
  },
  errorCallback: function() {
    //...
  }
}
```

(see nativeOS_example_for_iOS.js)

## smdQS_jsHost

If the javascript variable smdQS_jsHost is set, smdQS().ajax() uses it as hostname to call all requests to. If a url has already a hostname the variable is ignored.

## Misc

This version includes a forked version of docReady (https://github.com/jfriend00/docReady)

Matthias Weiß / Schwäbisch Media Digital
