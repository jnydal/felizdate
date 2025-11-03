var Entity = new Class({
    Extends: AbstractObject,
    getClassName: function() {
        return "Entity";
    },
    initialize: function() {
        this.id = null;
    },
    setProperties: function(changes) {
    	for (property in changes) {
    		this.setProperty(property, changes[property]);
    	}
    },
    setProperty: function(property, value) {
		eval("this.set" + property.capitalize() + "(value)");
	},
    setId: function(id) {
        if (id == null) {
            this.id = null;
            return;
        } else if (typeOf(id) !=  "string") {
            throw new Exception("Expected id to be null or a string, but was: <" + id + ">.");
        }
        this.id = id;
    },
    getId: function() {
        return this.id;
    },
    toString: function() {
        return this.getClassName() + ":[id=" + this.id + "]";
    }
});
