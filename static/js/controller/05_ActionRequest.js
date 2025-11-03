/**
 * Action Request
 * 
 * Use explicit actionnames for server actions. CRUD types for internal.
 * If cb is provided, action request is transient.
 * Set id (actionId) if request is part of transaction.
 * 
 */
var ActionRequest = new Class({
	Extends: AbstractObject,
	initialize: function(actionName, payload, cb, id) {
		if (typeOf(actionName) !== "string") {
			throw new Exception("actionName parameter is not a string.");
		} else if (typeOf(payload) !== "object") {
		    throw new Exception("payload parameter is not a objeect.");
		}
		this.actionName = actionName;
		this.payload = payload;
		this.cb = cb;
		this.context = null;
		this.method = "GET";
		this.invalidate = false;
		if (typeOf(this.payload) === null) {
		    this.payload = {};
		}
		if (typeOf(id) === null) {
		    this.id = actionIdGenerator.generateId();
		} else {
		    this.id = id;
		}
	},
	getClassName: function() {
		return "ActionRequest";
	},
	getContext: function() {
		return this.context;
	},
	setContext: function(context) {
		this.context = context;
	},
	getActionName: function() {
		return this.actionName;
	},
	setInvalidateCurrent: function(flag) {
		if (flag) {
			this.invalidate = true;
		} else {
			this.invalidate = false;
		}
	},
	getInvalidateCurrent: function() {
		return this.invalidate;
	},
	getMethod: function() {
		if (typeOf(this.method) === "null") {
			this.method = "POST";
		}
		return this.method;
	},
	loadCsrfToken: function() {
		if (this.method === "POST") {
			var token = Cookie.read("csrftoken");
			this.payload = Object.append(this.payload, {csrfmiddlewaretoken: token});
		}
	},
	setMethod: function(method) {
		this.method = method;
		if (method === "POST") {
			this.loadCsrfToken();
		}
	},
	getPayload: function() {
		return this.payload;
	},
	getId: function() {
	    return this.id;
	},
	getCallback: function() {
		return this.cb;
	},
	toString: function() {
		return this.getClassName() + ': action: "' + this.actionName;
	}
});

/**
 * Singleton for generating action identifiers.
 */
var actionIdGenerator = new (new Class({
    Extends: AbstractObject,
    initialize: function() {
        this.nextId = 0;
    },
    getClassName: function() {
        return "ActionIdGenerator";
    },
    generateId: function() {
        return this.nextId++;
    }
}))();
