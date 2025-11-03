var Exception = new Class({
	Extends: AbstractObject,
	getClassName: function() {
	    return "Exception";
	},
	initialize: function(message) {
		this.message = message;
	},
	getMessage: function() {
		return this.message;
	},
	getCause: function() {
		return this.cause;
	},
	toString: function() {
	   return this.message;
	}
});
