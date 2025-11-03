var ResultBrowser = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["ResultBrowser"]);
    },
    initialize: function(result) {
    	this.parent();
    	this.profiles = [];
    	this.visibleResults = new Element("div");
    	this.visibleResults.addClass("results");
    	this.prevButton = new Element("div").addClass("prevButton browseButton hidden");
    	this.prevButton.set("events", {"click": this.prevClick.bind(this) });
    	this.nextButton = new Element("div").addClass("nextButton browseButton hidden");
    	this.nextButton.set("events", {"click": this.nextClick.bind(this) });
    	this.backToSearchButton = new SubmitButton();
    	this.backToSearchButton.setLabel(gettext("back"));
    	this.backToSearchButton.handleClick = function() {
    		this.handleBackToSearch();
    	}.bind(this);
    	var searchResultProfile = null;
    	this.getHtmlElement().adopt(this.prevButton);
    	this.getHtmlElement().adopt(this.visibleResults);
    	this.getHtmlElement().adopt(this.nextButton);
    	this.backToSearchButton.renderTo(this.getHtmlElement());
    	this.showStatus = true;
    },
    prevClick: function() {
    	this.requestResultPage(this.prevPageNo);
    },
    nextClick: function() {
    	this.requestResultPage(this.nextPageNo);
    },
    beforeUnrender: function() {
    	this.prevButton.removeEvent("click", this.prevClick);
    	this.nextButton.removeEvent("click", this.nextClick);
    	this.backToSearchButton.unrender();
    },
    hideBackToSearchButton: function() {
    	this.backToSearchButton.hide();
    },
    hideLoginStatus: function() {
    	this.showStatus = false;
    },
    loadResults: function(result, showProfileImage, showLocation) {
    	showLocation = showLocation || false;
    	this.visibleResults.set("html", "");
    	if (result.pageInfo.prevPageNo) {
    		this.prevPageNo = result.pageInfo.prevPageNo;
    		this.prevButton.removeClass("hidden");
    	} else {
    		this.prevPageNo = null;
    		this.prevButton.addClass("hidden");
    	}
    	if (result.pageInfo.nextPageNo) {
    		this.nextPageNo = result.pageInfo.nextPageNo;
    		this.nextButton.removeClass("hidden");
    	} else {
    		this.nextPageNo = null;
    		this.nextButton.addClass("hidden");
    	}
    	for (var i = 0; i<result.profiles.length; i++) {
    		searchResultProfile = new SearchResultProfile(this, result.profiles[i], showProfileImage, this.showStatus, showLocation);
    		this.addProfile(searchResultProfile);
    	}
    	if (result.pageInfo.total > 3) {
    		this.visibleResults.addClass("center");
    	} else {
    		this.visibleResults.removeClass("center");
    	}
    },
    requestResultPage: function(pageNo) {
    	// overrride on searchpage
    },
    addProfile: function(searchResultProfile) {
    	this.profiles.push(searchResultProfile);
    	searchResultProfile.renderTo(this.visibleResults);
    },
    handleBackToSearch: function() {
    	// override
    },
    handleInternalShowDetails: function(searchResultProfile) {
    	this.handleShowDetails(searchResultProfile.getId());
    },
    handleShowDetails: function(id) {
    	// override
    }
});

var SearchResultProfile = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["SearchResultProfile"]);
    },
    initialize: function(parentComponent, profile, showImage, showStatus, showLocation) {
    	this.parent();
    	this.parentComponent = parentComponent;
    	this.imageElement = new Element("img");
    	var image, siluette;
    	if (Utilities.isMobile()) {
    		this.imageElement.addClass("tumb");
        	this.imageElement.set("width", "80px");
        	this.imageElement.set("height", "100px");
        	image = profile.thumbnail;
        	siluette = Utilities.getDefaultTumbImageUrl(profile.gender);
    	} else {
    		image = profile.image;
    		siluette = Utilities.getDefaultImageUrl(profile.gender);
    	}
    	if (showImage && profile.thumbnail !== "") {
    		this.imageElement.set("src", image);
    	} else {
    		this.imageElement.set("src", siluette);
    	}
    	var location = "";
    	if (showLocation) {
    		location = " (" + profile.cityname + ")";
    	}
    	this.profileNameElement = new Element("span").addClass("text");
    	this.profileNameElement.set("text", profile.text + location);
    	this.gender = profile.gender;
    	this.profileId = profile.id
    	this.getHtmlElement().adopt(this.imageElement);
    	
    	if (showStatus) {
	    	this.statusIcon = new Element("span");
	    	switch (profile.status) {
	    		case ProfileStatus.GEOONLINE:
	    			this.statusIcon.addClass("geoOnline");
	    			break;
	    		case ProfileStatus.ONLINE:
	    			this.statusIcon.addClass("online");
	    			break;
	    		case ProfileStatus.AWAY:
	    			this.statusIcon.addClass("away");
	    			break;
	    		case ProfileStatus.INVISIBLE:
	    			this.statusIcon.addClass("invisible");
	    			break;
	    			default:
	    	}
	    	this.statusIcon.addClass("statusIcon");
	    	this.getHtmlElement().adopt(this.statusIcon);
    	}
    	
    	this.getHtmlElement().adopt(this.profileNameElement);
    	this.getHtmlElement().set("events", {"click": function() {
    		this.parentComponent.handleInternalShowDetails(this);
    	}.bind(this)});
    },
    getId: function() {
    	return this.profileId;
    }
});

