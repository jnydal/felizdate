var Controller = new Class({
	Extends: AbstractObject,
    getClassName: function() {
        return "Controller";
    },
	initialize: function(model) {
		if (!instanceOf(model, Model)) {
			throw new Exception("model parameter is not a Model instance.");
		}
		this.model = model;
		this.serverHandler = new ServerHandler();
		this.serverHandler.handleResponse = this.handleServerResponse.bind(this);
		this.serverHandler.handlePushResponse = this.handlePushResponse.bind(this);
		this.pendingRequests = {};
	},
	start: function() {
		this.performAction(new ActionRequest("getUserSession", {}));
		this.performAction(new ActionRequest("getOptions", {}));
	},
    submitForm: function(form) {
		if (!instanceOf(form, Form)) {
			throw new Exception("form parameter is not a Form instance.");
		}
		this.serverHandler.nativeSubmitForm(form);
    },
    getServerHandler: function() {
    	return this.serverHandler;
    },
    initPushClient: function() {
    	this.serverHandler.initPushClient();
    },
	performAction: function(request) {
		if (!request.getClassName() === "ActionRequest") {
			throw new Exception("request parameter is not a ActionRequest instance.");
		}

		var actionName = request.getActionName();	

		switch (actionName) {
			case "invalidateConversations":
				this.model.invalidateConversations();
				break;
			case "setStatus":
				request.setMethod("POST");
				this.sendServerRequest(request);
				break;
			case "setPosition":
				request.setMethod("POST");
				this.sendServerRequest(request);
				break;
			case "getUserSession":
				request.setInvalidateCurrent(true); // due to front end caching in nginx we need to force nocache. TODO: change to post
				this.sendServerRequest(request);
				break;
			case "getConversation":
				this.sendServerRequest(request);
				break;
			case "getLatestMessages":
				request.setInvalidateCurrent(true); // due to front end caching in nginx we need to force nocache. TODO: change to post
				this.sendServerRequest(request);
				break;
			case "sendMessage":
				if (Utilities.isAndroid()) {
					request.payload.pushMessage = true;
				} else {
					this.serverHandler.sendAsync(request);
				}
	    		request.setMethod("POST");
				this.sendServerRequest(request);
				break;
			case "getMessages":
				request.setInvalidateCurrent(true); // due to front end caching in nginx we need to force nocache. TODO: change to post
				this.sendServerRequest(request);
				break;
			case "getProfile":
	    		this.sendServerRequest(request);
				break;
	    	case "cropImage":
	    		request.setMethod("POST");
	    		this.sendServerRequest(request);
	    		break;
	    	case "searchProfiles":
	    		request.setMethod("POST");
	    		this.sendServerRequest(request);
	    		break;
	    	case "getOptions":
	    		this.sendServerRequest(request);
	    		break;
	    	case "getCities":
	    		this.sendServerRequest(request);
	    		break;
	    	case "saveAccount":
	    		request.setMethod("POST");
	    		this.sendServerRequest(request);
	    		break;
	    	case "saveInterest":
	    		request.setMethod("POST");
	    		this.sendServerRequest(request);
	    		break;
			case "saveProfile":
	    		request.setMethod("POST");
	    		this.sendServerRequest(request);
				break;
			case "saveAdvanced":
	    		request.setMethod("POST");
	    		this.sendServerRequest(request);
				break;
		    case "login":
		    	request.setMethod("POST");
		    	this.sendServerRequest(request);
		        break;
		    case "authenticate":
	    		request.setMethod("POST");
		        this.sendServerRequest(request);
		        break;
		    case "logout":
		        this.sendServerRequest(request);
		        break;
		    case "getInterests":
		    	this.sendServerRequest(request);
		    	break;
		    default:
		    	this.sendServerRequest(request);
		}
		this.addPendingRequest(request);
	},
	/**
	 * to keep requests tidy
	 * 
	 */
	addPendingRequest: function(request) {
		if (typeOf(this.pendingRequests[request.getActionName()] === "null")) {
			this.pendingRequests[request.getActionName()] = [];
		}
		this.pendingRequests[request.getActionName()].push(request);
	},
	removePendingRequest: function(request) {
		var store = this.pendingRequests[request.getActionName()];
		if (store && typeOf(store === "array")) {
			for (var i = store.length - 1; i>=0; i--) {
				if (store[i] === request) {
					store.erase(store[i]);
				}
			}
		}
	},
	hasPendingAction: function(actionName) {
		if (this.pendingRequests[actionName] && this.pendingRequests[actionName].length > 0) {
			return true;
		}
		return false;
	},
	/**
	 * server handler api
	 * 
	 * 
	 */
	sendServerRequest: function(request) {
	    if (!instanceOf(request, ActionRequest)) {
            throw new Exception("request parameter is not a ActionRequest instance.");
        }
		this.serverHandler.performAction(request);
	}.protect(),
	handleServerResponse: function(response) {
		this.removePendingRequest(response.request);
        if (instanceOf(response, FailureServerResponse)) {
            this.handleFailureResponse(response);
        } else {
            this.handleSuccessResponse(response);
        }
	},
	handleSuccessResponse: function(response) {
        var actionName = response.getRequest().getActionName();
        var cb = response.getRequest().getCallback();
        if (typeOf(cb) !== "null") {
        	// transient action response handling
        	cb(response.getPayload());
        } else {
        	// default handling
	        switch (actionName) { /* simplify, let this.model set all model data, and let it notify observers. */
	        	case "setStatus":
	        		this.model.setStatus(response.payload);
	        		break;
	        	case "reportIssue":
	        		publisher.publish("ISSUE_SUBMITTED", {});
	        		break;
	        	case "login":
				case "getUserSession":
					if (typeOf(response.payload.email) !== "null") {
						this.model.setUserSession(response.payload);
						if (response.payload.profile) {
							this.initPushClient();
						}
					} else {
						this.model.getUserSessionModel().setDomestic(response.payload.domestic);
						this.model.setUserSession(null);
					}
					var sessionid = Cookie.read("sessionid");
					var wsDomain = "devsocket" + Utilities.getDomain(document.domain, 2);
					Cookie.write("sessionid", sessionid, {domain: wsDomain});
					this.model.setCsrfToken(response.payload.csrfToken);
					break;
				case "setPosition":
					this.model.setPosition(response.payload);
					break;
				case "saveInterest":
					this.model.getUserSessionModel().addInterest(response.payload);
					break;
				case "sendMessage":
					this.model.messageSent(response.payload);
					break;
				case "getMessages":
					this.model.getUserSessionModel().setMessages(response.payload);
					break;
				case "getLatestMessages":
					this.model.getUserSessionModel().setLatestMessages(response.payload);
					break;
				case "getConversation":
					this.model.getUserSessionModel().setOpenProfileMessages(response.payload);
					break;
		    	case "searchProfiles":
		    		this.model.getUserSessionModel().setSearchResults(response.payload);
		    		break;
		    	case "cropImage":
		    		this.model.setTemporaryImages(response);
		    		break;
	        	case "uploadImageDraft":
	        		this.model.setDraftImage(response);
	        		break;
	        	case "uploadMedia":
	        		this.model.addMedia(response.payload);
	        		break;
	        	case "deleteMedia":
	        		this.model.deleteMedia(response.getRequest().getPayload().mediaId);
	        		break;
	        	case "getCities":
					this.model.setCities(response.getRequest().getPayload().countryId, response.payload);
					break;
	        	case "getProfile":
	        		this.model.getUserSessionModel().setOpenProfile(response.payload.profile);
	        		break;
				case "getOptions":
					this.model.loadOptions(response.payload);
					break;
				case "saveAccount":
					if (response.payload['newAccount']) {
						this.model.createAccount(response.payload);
					} else {
						this.model.saveAccount(response.payload);
					}
					break;
				case "saveProfile":
				case "saveAdvanced":
					if (response.payload['newProfile']) {
						this.model.createUserProfile(response);
					} else {
						this.model.saveUserProfile(response);
					}
					break;
				case "logout":
					this.model.logout();
	                break;
	            default:
	        }
        }
	},
	handlePushResponse: function(response) {
		this.model.getUserSessionModel().setPushMessage(response.payload);
	},
	handleFailureResponse: function(response) {
        var actionName = response.getRequest().getActionName();
        switch (actionName) {
			case "login":
				this.model.loginFailed(response.payload.errors);
				break;
			case "saveAccount":
				this.model.notifyObservers("SAVE_ACCOUNT_FAILED", response);
				try {
					if (Recaptcha ) {
						Recaptcha.reload();
					}
				} catch (e) {} 
				break;
			case "saveProfile":
				this.model.notifyObservers("SAVE_PROFILE_FAILED", response);
				break;
			case "saveAdvanced":
				this.model.notifyObservers("SAVE_ADVANCED_FAILED", response);
				break;
            default:
            	application.view.showErrorDialog(response.payload);
        }
	}.protect()
});
