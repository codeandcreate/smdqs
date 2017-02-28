/**
 * A small localStorage wrapper with automatic object/array strigify.
 */
var smdLocalStorage = {

    prefix 					: 'smd_',

    set : function(key, value, noprefix)
    {    
        if(typeof value == "array" || typeof value == "object"){
           var value = JSON.stringify(value);
        }
        var prefix = (noprefix == true) ? '' : this.prefix;
        localStorage.setItem(prefix + key, value);
    },

    get : function(key, noprefix)
    {
        var data = (noprefix == true) ? localStorage.getItem(key) : localStorage.getItem(this.prefix + key);
        try{
            var json = JSON.parse(data);
            return json;
        }
        catch(e){
            return data;
        }
    },

    del : function(key, noprefix)
    {
        var prefix = (noprefix == true) ? '' : this.prefix;
		localStorage.removeItem(prefix +key);
    },

    setPrefix : function(value)
    {
        smdLocalStorage.prefix = value;
    }
};