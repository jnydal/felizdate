var GeoMatchesFinder = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["GeoMatchesFinder"]);
    },
    initialize: function() {
        this.parent();
        this.REFRESH_INTERVAL = 10000;
        this.activated = false;
        this.errorMessage = new Element("span").addClass("errorMessage hidden");
        this.geoMap = new GeoMap();
        this.loadingSpinner = new Element("img");
        this.loadingSpinner.set("src", "/static/images/spinner3-bluey.gif");
        this.loadingSpinner.set("width", "36px");
        this.loadingSpinner.set("height", "36px");
        this.loadingSpinner.addClass("loadingSpinner");
        this.getHtmlElement().adopt(this.errorMessage);
        this.getHtmlElement().adopt(this.loadingSpinner);
        this.geoMap.renderTo(this.getHtmlElement());
        this.updateInterval = null;
		this.profileIcon = "http://dg1h6uvotkrdh.cloudfront.net/s/images/position.png";
    },
    markerClick: function(marker) {
    	application.view.handleShowProfileDetails(marker.data.id);
    },
    setState: function(status) {
    	if (Utilities.isOnGeoAcceptableDevice()) {
	    	switch (status) {
				case ProfileStatus.GEOONLINE:
					this.activate();
					break;
				default:
					this.deactivate(gettext("GeoMatcher is only available in GeoOnline mode."));
	    	}
    	} else {
    		this.deactivate(gettext("GeoMatcher is only available for handheld devices."));
    	}
    },
    setCurrentPosition: function(position) {
    	this.geoMap.setCurrentPosition(position);
    },
    refresh: function() {
    	this.geoMap.refresh();
    },
    activate: function() {
    	if (Utilities.isOnGeoAcceptableDevice()) {
	    	this.errorMessage.addClass("hidden");
	    	//this.geoMap.refresh();
	    	var self = this;
	    	if (typeOf(this.updateInterval) === "null") {
	    		this.updateInterval = setInterval(function() {
	    			self.geoMap.deleteAllMarkers();
	    			if (typeOf(application.model.getLastPosition()) !== "null") {
		    			application.performAction(new ActionRequest("getCloseByProfiles", {}, function(profiles) {
		    				for (var i = 0; i<profiles.length; i++) {
		    					self.geoMap.addMarker(profiles[i].lastPosition, self.profileIcon, profiles[i].text, profiles[i], self.markerClick.bind(this));
		    				}
		    				self.activated = true;
		    				self.hideLoading();
		    			}));
	    			} else {
	    				self.showLoading();
	    			}
	    		}, this.REFRESH_INTERVAL);
	    	}
    	}
    },
    showLoading: function() {
    	this.loadingSpinner.removeClass("hidden");
    },
    hideLoading: function() {
    	this.loadingSpinner.addClass("hidden");
    },
    deactivate: function(errorText) {
    	this.setErrorMessage(errorText);
    	clearInterval(this.updateInterval);
    	this.updateInterval = null;
    	this.activated = false;
    	this.hideLoading();
    },
    setErrorMessage: function(text) {
    	this.errorMessage.removeClass("hidden");
    	this.errorMessage.set("text", text);
    },
    getGeoMap: function() {
    	return this.geoMap;
    }
});
