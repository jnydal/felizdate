var ModelEvent = new Class({
	Extends: AbstractObject,
	initialize: function(source, type, payload) {
		if (!instanceOf(source, ObservableModelObject)) {
			throw new Exception("Expected source to be an instance of ObservableModelObject.");
		} else if (typeOf(type) !== "string") {
			throw new Excetion("Expected type to be an instance of string.");
		}
		this.source = source;
		this.type = type;
		this.payload = payload;
	},
	getClassName: function() {
		return "ModelEvent";
	},
	getSource: function() {
		return this.source;
	},
	getType: function() {
		return this.type;
	},
	getPayload: function() {
		return this.payload;
	},
	toString: function() {
		return this.getClassName() + ':<type="' + this.type + '",source=<' + this.source + '>,payload=<' + this.payload	+ '>>';
	}
});
