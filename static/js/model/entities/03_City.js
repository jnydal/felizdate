var City = new Class({
    Extends: Entity,
    initialize: function() {
        this.name = null;
        this.country = null;
    },
    getClassName: function() {
    	return "City";
    },
    setName: function(name) {
    	if (typeOf(name) !== "string") {
    		throw new Exceptionb("name parameter is not a string.");
    	}
    	this.name = name;
    },
    setCountry: function(country) {
    	if (!instanceOf(country, Country)) {
    		throw new Exceptionb("country parameter is not a Country instance.");
    	}
    	this.country = country;
    }
});

