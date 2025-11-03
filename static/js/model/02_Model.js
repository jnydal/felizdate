var Model = new Class({
	Extends: ObservableModelObject,
    getClassName: function() {
        return "Model";
    },
	initialize: function() {
		this.userSessionModel = new UserSessionModel();
		this.optionModel = new OptionModel();
		this.lastPosition = null;
	},
	start: function() {
		application.view.start();
	},
	getUserSessionModel: function() {
		return this.userSessionModel;
	},
	getUserProfile: function() {
		return this.userSessionModel.getUserProfile();
	},
	setCities: function(cities) {
		this.optionModel.setCities(cities);
	},
	getOptionModel: function() {
		return this.optionModel;
	},
	setTemporaryImages: function(response) {
		this.getUserSessionModel().setTemporaryImages(response.payload);
    	this.notifyObservers("PROFILE_IMAGE_UPLOADED", response);
	},
	setDraftImage: function(response) {
		this.getUserSessionModel().setDraftImage(response.payload, function() {
    		this.notifyObservers("DRAFT_IMAGE_LOADED", response.payload);
    	}.bind(this));
	},
	addMedia: function(media) {
		this.getUserProfile().media.push(media);
		this.notifyObservers("MEDIA_UPLOADED", media);
	},
	deleteMedia: function(mediaId) {
		var medias = this.getUserProfile().media;
		for (var i = 0; i<medias.length; i++) {
			if (medias[i].id == mediaId) {
				medias.erase(medias[i]);
			}
		}
		this.notifyObservers("MEDIA_DELETED", mediaId);
	},
	setPosition: function(position) {
		this.lastPosition = position;
		this.notifyObservers("POSITION_UPDATED", position);
	},
	getLastPosition: function() {
		return this.lastPosition;
	},
	messageSent: function(message) {
		this.notifyObservers("MESSAGE_SENT", message);
	},
	loadOptions: function(options) {
		this.optionModel.load(options);
    	this.notifyObservers("OPTIONS_LOADED");
	},
	setErrors: function(errors) {
		this.notifyObservers("SERVER_ERROR", { errors: errors });
	},
	setUserSession: function(userSession) {
		this.userSessionModel.setUserSession(userSession);
		this.notifyObservers("USER_SESSION_LOADED");
	},
	loginFailed: function(message) {
		this.notifyObservers("LOGIN_FAILED", { message: message });
	},
	setStatus: function(status) {
		this.getUserSessionModel().getUserProfile().setProfileStatus(status);
		this.notifyObservers("STATUS_CHANGED", { data: status });
	},
	logout: function() {
		//this.userSessionModel = new UserSessionModel();
		this.userSessionModel.reset();
		this.notifyObservers("LOGOUT_SUCCESS", {});
	},
	getUserType: function() {
		return this.userSessionModel.getUserType();
	},
	setCsrfToken: function(token) {
		Cookie.write("csrftoken", token);
		this.notifyObservers("CSRF_TOKEN_LOADED", { csrfToken: token });
	},
	invalidateConversations: function() {
		this.notifyObservers("INVALIDATE_CONVERSATIONS");
	},
	
	/**
	 * essentials: create/update userprofile and account
	 * 
	 */
	createUserProfile: function(response) {
		this.userSessionModel.setUserProfile(response.payload.profile);
		this.notifyObservers("PROFILE_CREATED", response);
	},
	saveUserProfile: function(response) {
		this.userSessionModel.setUserProfile(response.payload.profile);
		this.notifyObservers("PROFILE_UPDATED", response);
	},
	createAccount: function(data) {
    	this.email = data.email;
    	var payload = {
    		email: this.email
    	};
    	this.notifyObservers("ACCOUNT_CREATED", payload);
	},
	saveAccount: function(data) {
    	this.userSessionModel.setEmail(data.email);
    	var payload = {
    		email: this.email
    	};
    	this.notifyObservers("ACCOUNT_UPDATED", payload);
	}
});
