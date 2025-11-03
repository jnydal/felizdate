var TabPanel = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["TabPanel"]);
    },
    initialize: function() {
        this.parent();
        this.tabTitles = new Element("ul");
        this.tabContent = new Element("div");
        this.tabContent.addClass("content");
        this.getHtmlElement().adopt(this.tabTitles);
        this.getHtmlElement().adopt(this.tabContent);
        this.tabs = {};
        this.openTabComponent = null;
    },
    add: function(component, text) {
    	var self = this;
    	var flick = new Element("li");
    	var anchor = new Element("a");
    	flick.store("component", component);
    	anchor.set("text", text);
    	flick.adopt(anchor);
    	var events = {};
		events[Utilities.getMainEventName()] = function(e) {
    		e.preventDefault();
    		self.show(this.getParent().retrieve("component"));
		};
    	anchor.set("events", events);
    	this.tabs[component] = { content: component, flick: flick };
    	this.tabTitles.adopt(flick);
   		component.renderTo(this.tabContent);
   		component.hide();
    },
    show: function(component) {
    	if (this.openTabComponent !== null) {
        	this.tabs[this.openTabComponent].flick.removeClass("selected");
    		this.openTabComponent.hide();
    	}
    	this.tabs[component].flick.addClass("selected");
    	this.openTabComponent = component;
    	this.openTabComponent.show();
    	this.handleAfterShow(component);
    },
    disable: function(component) {
    	this.tabs[component].flick.addClass("disabled");
    	this.tabs[component].content.hide();
    },
    enable: function(component) {
    	this.tabs[component].flick.removeClass("disabled");
    	this.tabs[component].content.show();
    },
    handleAfterShow: function(component) {
    	// override
    }
});
