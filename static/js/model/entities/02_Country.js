var Country = new Class({
    Extends: Entity,
    initialize: function() {
        this.name = null;
    },
    getClassName: function() {
    	return "Country";
    },
    setName: function(name) {
    	if (typeOf(name) !== "string") {
    		throw new Exceptionb("name parameter is not a string.");
    	}
    	this.name = name;
    }
});

