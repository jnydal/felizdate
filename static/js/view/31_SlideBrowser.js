var SlideBrowser = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["SlideBrowser"]);
    },
    initialize: function() {
    	this.currentElement = null;
    	this.parent();
    	this.mediaElements = new Element("div");
    	this.mediaElements.set("class", "slidyContainer");
    	this.mediaElements.set("html", "<div class='slidySlides'></div>");
    	this.getHtmlElement().adopt(this.mediaElements);
    	publisher.subscribe("VIEW_READY", function() {
    		this.initSlidy();
    	}.bind(this));
    },
    getSelectedId: function() {
    	var elementId = jQuery(this.currentElement).attr("id");
    	var id = elementId.split('_')[1];
    	return id;
    },
    setSlides: function(elementArray) {
    	var slidyWrapper = this.mediaElements.getElement(".slidySlides");
    	for (var i = 0; i<elementArray.length; i++) {
    		if (i === 0) {
    			elementArray[i].addClass("slidyCurrent");
    		}
    		slidyWrapper.adopt(elementArray[i]);
    	}
    	if (this.isRendered()) {
    		this.initSlidy();
    	}
    },
    removeControls: function() {
    	this.mediaElements.getElement(".movePrev").dispose();
    	this.mediaElements.getElement(".moveNext").dispose();
    },
    handleChange: function() {
    	// override
    },
    initSlidy: function() {
    	var self = this;
    	var ref = '#' + this.getHtmlId() + " > .slidyContainer";
    	var controls = true;
        if (Browser.ie8) {
        	controls = false;
        }
    	jQuery(ref).slidy({
            // Options go here, see slidy.js
            // These the defaults so don't only need to be specified if they are changed

            throttle: false, // Set to true, and include jQuery throttle plugin (http://benalman.com/projects/jquery-throttle-debounce-plugin/)
            throttleTime: 500, // number of ms to wait for throttling
            showArrows: controls, // Show arrows for next/prev image
            movePrev: 'movePrev', // Div id to use for previous button
            moveNext: 'moveNext', // Div id to use for next button
            useKeybord: true, // use keys defined below to expand / collapse sections
            auto: false,       // Start slideshow automatically
            interval: 6000,     // Time between each slide
            initialInterval: 10000,  // Initial interval when page loads
            afterChange: function(element) {
            	self.currentElement = element;
            	self.handleChange();
            }
        });
    	this.currentElement = this.mediaElements.getElement(".slidyCurrent");
    }
});
