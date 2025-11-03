var AbstractObject = new Class({
	getClassName: function() {
	    return this.getClassHierarchy().getLast(); 
	},
	getClassHierarchy: function() {
	    return new Array();
	},
	toString: function() {
		return this.getClassName();
	},
	throwException: function(errorText) {
		throw new Exception(this.toString() + ": throwed exception " + errorText);
	}
});
