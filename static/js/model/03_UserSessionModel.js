var UserType = new Enum([
    "INTERNAL",
	"FACEBOOK",
	"GOOGLE"
]);

var UserSessionModel = new Class({
    Extends: ObservableModelObject,
    initialize: function() {
        this.email = "";
        this.userType = null;
        this.userProfile = null;
        this.draftImage = null;
        this.tempImages = {
        	large: null,
        	tumb: null,
        	micro: null,
        	tumbUrl: null
        };
        this.authenticated = false;
    },
    getClassName: function() {
    	return "UserSessionModel";
    },
    addInterest: function(interest) {
    	this.notifyObservers("INTEREST_SAVED", interest);
    },
	isAuthenticated: function() {
		return this.authenticated;
    },
    reset: function() {
    	this.authenticated = false;
    	this.tempImages = {};
    	this.draftImage = null;
    	if (typeOf(this.userProfile) !== "null") {
    		this.userProfile.stopPositionUpdater();
    	}
    	this.userProfile = null;
    	this.email = "";
    	this.notifyObservers("WIPE_VIEW_DATA");
    },
    getEmail: function() {
    	return this.email;
    },
    setEmail: function(email) {
    	this.email = email;
    	this.authenticated = true;
    },
    setMessages: function(messages) {
    	this.notifyObservers("MESSAGES_LOADED", messages);
    },
    setLatestMessages: function(messages) {
    	this.notifyObservers("LATEST_MESSAGES_RECIEVED", messages);
    },
    setPushMessage: function(message) {
    	this.notifyObservers("MESSAGE_RECIEVED", message);
    },
    setOpenProfileMessages: function(messages) {
    	this.notifyObservers("PROFILE_MESSAGES_LOADED", messages);
    },
    setOpenProfile: function(profile) {
    	this.notifyObservers("PROFILE_LOADED", profile);
    },
    setSearchResults: function(searchResults) {
    	this.notifyObservers("SEARCH_RESULTS_LOADED", searchResults);
    },
    setUserProfile: function(userprofile) {
    	this.userProfile = new UserProfile(userprofile);
    },
    setDomestic: function(flag) {
    	this.domestic = flag;
    },
    setUserSession: function(userSession) {
    	if (typeOf(userSession) !== "null") {
	    	this.authenticated = true;
	    	this.email = userSession.email;
	    	this.userType = userSession.userType;
	    	this.domestic = userSession.domestic;
	    	if (typeOf(userSession.profile) !== "null") {
	    		this.userProfile = new UserProfile(userSession.profile);
	    	}
    	}
    },
    getUserType: function() {
    	return this.userType;
    },
    getUserProfile: function() {
    	return this.userProfile;
    },
    getTemporaryImages: function() {
    	return this.tempImages;
    },
    setTemporaryImages: function(data) {
    	this.tempImages.large = data.temporaryImagePathFile;    	
    	this.tempImages.micro = data.temporaryMicroImagePathFile;
    	this.tempImages.tumb = data.temporaryTumbImagePathFile;
    	this.tempImages.tumbUrl = data.temporaryTumbImagePathFileUrl;
    },
    setDraftImage: function(data, cb) {
    	this.draftImage = new Image();
    	this.draftImage.pathfilename = data.pathfilename;
    	this.draftImage.width = data.width;
    	this.draftImage.height = data.height;
    	this.draftImage.onload = cb;
    	this.draftImage.src = data.resizedImageDraftPath;
    },
    getDraftImage: function() {
    	return this.draftImage;
    },
    handleServerError: function(errorResponse) {
    	 switch (errorResponse.failureType) {
	    	 case "CONCURRENT_UPDATE":
	    		 this.notifyObservers("CONCURRENT_UPDATE_EXCEPTION", errorResponse);
	         break;
	    	 case "ALREADY_DELETED_ITEM":
	    		 this.notifyObservers("DELETE_ON_CONCURRENT_UPDATE",errorResponse);
	    	 break;	 
	    	 default:
	    		 this.notifyObservers("SERVER_ERROR", errorResponse);
    	 }
    }
});

