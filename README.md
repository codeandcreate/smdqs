# smdQS
A minimalistic javascript wrapper for the jquery babied...

Examples:

- ajax-Call:
``` js
smdQS().ajax("/testscript.php", function( returnData ) {
	console.log(returnData);					
}
```

- working with classes and selectors:
``` js
var myNode = smdQS("#idOfMyNode");
if (myNode.hasClass("aNiceClass")) {
	myNode.removeClass("aNiceClass");
}
```

- working with lists of nodes:
``` js
var aListOfNodes = smdQS(".btn");
if (aListOfNodes.isDomObject && aListOfNodes.isList) {
	aListOfNodes.forEach(function(index, oneOfThisNodes) 
	{
		oneOfThisNodes.removeAttribute("onclick");
		oneOfThisNodes.addEventListener("click", function() 
		{
			console.log("You have clicked on the button with the index " + index);
		});
	});
} 
```

I recommend docReady() as replacement for "$( document ).ready(function() {});" with smdQS.
https://github.com/jfriend00/docReady


Matthias Weiß / Schwäbisch Media Digital
