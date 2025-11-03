var IconLabel = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["IconLabel"]);
    },
    setText: function(text) {
    	this.text.set("text", text);
    },
    getText: function() {
    	return this.text;
    },
    initialize: function(iconClass, text) {
        this.parent();
        this.text = (typeOf(text) !== "string") ? "" : text;
    	this.icon = new Element("span");
    	this.icon.addClass("icon");
    	this.icon.addClass(iconClass);
    	this.text = new Element("span");
    	this.text.addClass("text");
    	this.text.set("text", text);
    	this.getHtmlElement().adopt(this.icon);
    	this.getHtmlElement().adopt(this.text);
    },
	getRootElementTypeName: function() {
        return "span";
    }
});
