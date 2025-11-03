var WizardPage = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["WizardPage"]);
    },
    initialize: function(name) {
        this.parent();
    	this.name = name;
    	this.header = new Element("div");
    	this.header.addClass("header");
    	this.header.set('html', "<h2><strong>" + name + "</strong><span></span><em></em></h2>");
    	this.statusElement = new Element("li");
    	this.statusElement.set("text", name);
    	this.getHtmlElement().adopt(this.header);
        this.forms = [];
    },
    addForm: function(form, name) {
    	if (!instanceOf(form, Form)) {
    		throw new Exception("form parameter is not a Form instance.");
    	}
    	form.handleSubmit = function() {
    		this.handleNextPageRequest();
    	}.bind(this);
    	this.forms.push(form);
    	form.renderTo(this.getHtmlElement());
    },
    setHeaderText: function(text) {
    	this.header.getElement("span").set("text", text);
    },
    setHeaderStrongText: function(text) {
    	this.header.getElement("strong").set("text", text);
    },
    setHeaderEmphasisText: function(text) {
    	this.header.getElement("em").set("text", text);
    },
    getStatusElement: function() { 
		return this.statusElement;
	},
    getForm: function() {
    	return this.form;
    },
    setParentComponent: function(parentComponent) {
        this.parentComponent = parentComponent;
    },
    getParentComponent: function() {
        return this.parentComponent;
    },
    refreshSize: function(width, height) {
    },
    handleNextPageRequest: function() {
    	// override
    }
});
