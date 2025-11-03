var ServerResponse = new Class({
	Extends: AbstractObject,
	initialize: function(request, responsePayload) {
		if (!instanceOf(request, ActionRequest)) {
			throw new Exception("request parameter is not a ActionRequest instance.");
		}
		this.request = request;
		this.payload = responsePayload;
	},
	getClassName: function() {
		return "ServerResponse";
	},
	getRequest: function() {
		return this.request;
	},
	getPayload: function() {
		return this.payload;
	},
	toString: function() {
		return this.getClassName() + ":<request=" + this.request + ">";
	}
});
