var FailureServerResponse = new Class({
	Extends: ServerResponse,
	initialize: function(request, failureType, responsePayload) {
		this.parent(request, responsePayload);
		if (typeof failureType !== "string") {
			throw new Exception("Expected string value for failure type, but was: <" + failureType + ">.");
		}
		this.failureType = failureType;
	},
	getClassName: function() {
		return "FailureServerResponse";
	},
	getFailureType: function() {
		return this.failureType;
	},
	toString: function() {
		return this.getClassName() + ":<request=" + this.request + ',failureType="' + this.failureType + '">';
	}
});
