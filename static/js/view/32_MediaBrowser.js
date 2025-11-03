var MediaBrowser = new Class({
    Extends: SlideBrowser,
    getClassHierarchy: function() {
        return this.parent().append(["MediaBrowser"]);
    },
    initialize: function(model) {
    	this.model = model;
    	this.parent();
    },
    refresh: function() {
    	if (typeOf(this.model.getUserProfile()) !== "null") {
	    	this.setMedia(this.model.getUserProfile().media);
    	}
    },
    deleteMedia: function(id) {
    	var element = this.mediaElements.getElement("#mediaId_" + id);
    	var slidySlides = this.mediaElements.getElement(".slidySlides");
    	var nextSelected = element.getPrevious();
    	if (typeOf(nextSelected) === "null") {
    		// no previous elements, try next
    		nextSelected = element.getNext();
    	}
    	this.currentElement = nextSelected;
    	if (typeOf(this.currentElement) !== "null") {
    		this.currentElement.addClass("slidyCurrent");
    	}
    	element.destroy();
    },
    addMedia: function(media) { 
    	var jQelement = jQuery(Utilities.getMediaWrapper(media, false))
    	var e = new Element("figure");
    	e.set("id", "mediaId_" + media.id);
    	if (this.model.getUserProfile().media.length === 1) {
    		e.addClass("slidyCurrent");
    	}
    	e.set("html", jQelement.html());
    	var slidySlides = this.mediaElements.getElement(".slidySlides");
    	slidySlides.adopt(e);
    	this.initSlidy();
    },
    setMedia: function(media) {
    	var slidyWrapper = this.mediaElements.getElement(".slidySlides");
    	var html = "";
    	for (var i = 0; i<media.length; i++) {
    		if (i === 0) {
    			html += Utilities.getMediaWrapper(media[i], true);
    		} else {
    			html += Utilities.getMediaWrapper(media[i], false);
    		}
    	}
    	slidyWrapper.set("html", html);
		this.initSlidy();
    },
	handleModelEvent: function(event) {
	    if (!instanceOf(event, ModelEvent)) {
	        throw new Exception("event parameter is not a ModelEvent instance.");
	    }
	    switch (event.getType()) {
	    	case "OPTIONS_LOADED":
	    		break;
	    	case "INTEREST_SAVED":
	    		break;
	        case "LOGIN":
				break;
	        case "LOGOUT":
	            break;
	            default:
	    }
	}
});
