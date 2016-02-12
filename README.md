# smdQS
A minimalistic javascript wrapper for the jquery babied...

Examples:

- ajax-Call:
```
smdQS().ajax("/testscript.php", function( returnData ) {
	console.log(returnData);					
}
```

- working with classes and selectors:
```
var myNode = smdQS("#idOfMyNode");
if (myNode.hasClass("aNiceClass")) {
	myNode.removeClass("aNiceClass");
}
```

- working with lists of nodes:
```
var aListOfNodes = smdQS(".btn");
if (aListOfNodes.isDomObject && aListOfNodes.isList) {
	aListOfNodes.forEach(function(index, oneOfThisNodes) 
	{
		oneOfThisNodes.removeAttribute("onclick");
		oneOfThisNodes.addEventListener("click", function() 
		{
			console.log("You have clicked on button with index " + index);
		});
	});
} 
```

i recommend docReady() to use this smdQS as replacement for $( document ).ready(function() {}); => https://github.com/desandro/doc-ready


Matthias Weiß / Schwäbisch Media Digital
