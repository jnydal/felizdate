var Label = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Label"]);
    },
    initialize: function(text) {
        this.parent();
        this.text = (typeOf(text) !== "string") ? "" : text;
        this.setText(text);
    },
    setText : function(text) {
    	this.text = text;
    	this.getHtmlElement().set("text", text);
    },
    getText : function() {
    	return this.text;
    },
	getRootElementTypeName: function() {
        return "span";
    }
});
