# sQS
A minimalistic javascript for the jquery babied... 

It uses querySelectorAll or getElementById to get a DOM-Node.

## Changes

|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;Version&nbsp;&nbsp;&nbsp;| Info |
|---|---|---|
| 08.03.2018 | 1.1 | merged changes from smdQS, added demo files |
| 15.01.2018 | 1.0 | initial fork of smdQS, dropped nativeOS code |

## Examples

- ajax() call:

``` js
sQS().ajax({
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
sQS().ready(function() {
	console.log("document is ready");					
}
```

- requireJS() - load an other js:

``` js
sQS().requireJS("/js/somejsfile.js", function() {
	console.log("js file is loaded.");					
}
```

- requireCSS() - load an other css:

``` js
sQS().requireCSS("/css/somecssfile.css", function() {
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

## sQS_jsHost

If the javascript variable sQS_jsHost is set, sQS().ajax() uses it as hostname to call all requests to. If a url has already a hostname the variable is ignored.

## Misc

It's a fork of (https://github.com/jfriend00/docReady)

This version includes a forked version of docReady (https://github.com/jfriend00/docReady)

Matthias Weiß
