var ServerHandler = new Class({
	Extends: AbstractObject,
	getClassName: function() {
		return "ServerHandler";
	},
	initialize: function() {
		this.SERVER_RETRY_LIMIT = 10000;
		this.transmissionErrors = 0;
		this.firstPoll = true;
		
		// try read custom set service address
		var domain = null;
		try {
			domain = dns_domain;
		} catch (e) {}
		this.domain = (typeOf(domain) !== "null") ? domain : document.domain;
		this.AsyncConfig = {
			id: null,    // set in onConnect
			lastMessageTime: 1,
			focus: true, //event listeners bound in onConnect
			unread: 0, //updated in the message-processing loop
			domain: this.domain
		};
	},
	isDebugging: function() {
    	var isDebug = false;
    	try {
    		isDebug = DEBUG_MODE;
    	} catch (e) {}
    	return isDebug;
	},
	getDomain: function() {
		return this.domain;
	},
	initPushClient: function() {
		// init websocket
		var address = "ws://" + this.AsyncConfig.domain; // default
		if (Utilities.isIPhone()) { // custom connection channel for draft/hixie76
			wsPort = "8080";
			wsPath = "/socket";
		}
		// look for custom ws connection overrides
		try {
			if (wsHost) {
				address = "ws://" + wsHost;
			}
		} catch (e) {}
		try {
			if (wsPort) {
				address += ":" + wsPort;
			}
		} catch (e) {}
		try {
			if (wsPath) {
				address += wsPath;
			}
		} catch (e) {}
		try {
			this.websocket = new WebSocket(address);
	        var self = this;
	        if (self.isDebugging()) {
	        	alert("attepmting to connecto to " + address);
	        }
	        this.websocket.onopen = function () {
	        	// do nothing
	        	if (self.isDebugging()) {
	        		alert("ws connection was opened.");
	        	}
	        };
	        this.websocket.onmessage = function(event) {
	        	var message = {
	        		payload: [JSON.parse(event.data)]
	        	};
	        	self.handlePushResponse(message);
	        };
	        this.websocket.onclose = function(e) {
	        	// do nothing
	        	if (self.isDebugging()) {
	        		alert("bubbles: " + e.bubbles + " code: " + e.code + " reason: " + e.reason + " returnValue: " + e.returnValue + " wasClean: " + e.wasClean);
	        	}
	        	if (!application.controller.hasPendingAction("logout")) {
	        		// ios 4.3 closes ws connection on hibernate... close event is fired on wake... if client has userprofile it means user is still "online" so connection needs to be restored...
	        		// TODO: close all profiledialog message panels
	        		self.initPushClient();
	        		// as IOS 4.2 hibernates without notifying server, server thinks ws connection is up... what happends is that it looks fine for server but iphone is sleeping and does not retrieve messages.
	        		// this clausule is called when iphone is aware of closing ws connection, and when it has not inqueried logout action.
	        		application.performAction(new ActionRequest("invalidateConversations", {}));
	        	}
	        };
	        this.websocket.onerror = function(error) {
	        	if (self.isDebugging()) {
	        		alert("ws error: " + error);
	        	}
	        	self.initPushClient();
	        };
		} catch (e) {
			//this.longPoll();
		}    
	},
	nativeSubmitForm: function(form) {
		if (!instanceOf(form, Form)) {
			throw new Exception("form parameter is not a Form instance.");
		}
		form.getHtmlElement().submit();
	},
	/**
	 * AJAX push / longpolling initialization goes here.
	 * 
	 */
	longPoll: function(data) {
		if (this.transmissionErrors > 2) {
			return;
		}

		// on recieved data
		if (data && data.payload) {
			this.handlePushResponse(data);
			if (this.firstPoll) {
				this.firstPoll = false;
			}
		}
		
		// called on any errors
		var failure = function() {
			this.transmissionErrors += 1;
			this.longPoll();
		}.bind(this);
		
		var longpollRequest = new Request.JSON({
			url: "/async/recv/",
			method: "GET",
			data: { since: this.AsyncConfig.lastMessageTime },
			onRequest: function() {
			},
			onSuccess: function(data) {
				this.transmissionErrors = 0;
				this.longPoll(data);
			}.bind(this),
			onFailure: failure,
			onTimeout: failure
			
		}).send();
	},
	sendAsync: function(request) {
		// send via ws connection
		this.websocket.send(JSON.encode(request.payload));
	},
	performAction: function(request) {
		if (!instanceOf(request, ActionRequest)) {
			throw new Exception("request parameter is not a ActionRequest instance.");
		}
		
		var payload = request.getPayload();
		var self = this;
		var serverRequest = new Request.JSON({
			url: "http://" + self.domain + "/action/" + request.actionName + "/",
			method: request.getMethod() || 'post',
			noCache: request.getInvalidateCurrent(),
			data: payload,
			onRequest: function(){
			},
			onSuccess: function(responseData){
				if (responseData.success) {
					this.handleResponse(new ServerResponse(request, responseData.payload));
				} else {
					if (responseData.fielderrors) {
						this.handleResponse(new FailureServerResponse(request, "FIELD_ERRORS", {"fields": responseData.fielderrors }));
					} else if (responseData.code) {
						this.handleResponse(new FailureServerResponse(request, code, {"message": responseData.message }));
					} else {
						this.handleResponse(new FailureServerResponse(request, "SERVER_ERROR", {"errors": responseData.errors }));
					}
				}
			}.bind(this),
			onFailure: function(xhr) {
				this.handleResponse(new FailureServerResponse(request, "REQUEST_ERROR", {"message": gettext("Server did not respond. Try again later.")}));
			}.bind(this),
			onTimeout:function() {
				this.handleResponse(new FailureServerResponse(request, "TIMEOUT", {"message": gettext("Server did not respond. Try again later.")}));
			}.bind(this)
			
		}).send();
	},
	handleResponse: function(response) { // this method is expected to be overriden
		if (response instanceof FailureServerResponse) {
            alert("Failed to execute " + response.request.actionName + " action.");
        } else {
            alert("Execution of " + response.request.actionName + " action was successful.");
        }
	},
	handlePushResponse: function(response) {
		// to be overridden
	}
});
