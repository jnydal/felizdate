var FieldType = {
	EMAIL: 0,
	PASSWORD: 1,
	CONFIRM: 2,
	CHECKBOX: 3,
	TEXT: 4,
	HIDDEN: 6
};

var Grid = {
	DOUBLE: "double",
	TRIPLE: "triple",
	QUAD: "quad",
	PENTA: "penta",
	HEXA: "hexa"
};

var Form = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Form"]);
    },
    initialize: function(init, htmlId) {
    	this.parent(htmlId);
        
		this.fieldGroups = [];
		this.formSections = [];
        
        this.header = null;
        this.generalErrorElement = new Element("span");
        this.generalErrorElement.addClass("generalError");
        this.headerElement = new Element("h3");
        this.bodyElement = new Element("div");
        this.bodyElement.addClass("body");
        this.footerElement = new Element("div");
        this.footerElement.addClass("footer");
        this.footerElement.adopt(this.generalErrorElement);
        
        this.getHtmlElement().adopt(this.headerElement);
        this.getHtmlElement().adopt(this.bodyElement);
        this.getHtmlElement().adopt(this.footerElement);
        
        this.getHtmlElement().set("events", {"keydown": function(e) {
        	this.generalErrorElement.set("html", "");
        	if (e.target.type !== "textarea" && e.code === 13) {
        		e.preventDefault();
        		this.handleInternalSubmit();
        	}
        }.bind(this)});
        
        var initialize = init || false;
        if (initialize) {
			this.submitButton = new SubmitButton(gettext("Submit"));
			this.submitButton.handleClick = this.handleInternalSubmit.bind(this);
			this.submitButton.renderTo(this.footerElement);
        }
    },
    hideGeneralErrorMessageField: function() {
    	this.generalErrorElement.addClass("hidden");
    },
    hideHeader: function() {
    	this.headerElement.addClass("hidden");
    },
    setSubmitButtonLabel: function(text) {
    	this.submitButton.setLabel(text);
    },
    setInProgress: function(flag) {
    	if (typeOf(this.submitButton) !== "null") {
    		this.submitButton.setInProgress(flag);
    	}
    },
    isValid: function() {
    	// use some third party validation here
    	return jQuery(this.getHtmlElement()).jvalidate();
    },
    handleInternalSubmit: function() {
    	if (this.isValid()) {
    		this.setInProgress(true);
			this.handleSubmit();
		}
    },
    handleSubmit: function() {
    	// override
    },
    setGeneralErrorMessage: function(message) {
    	if (typeOf(message) !== "string") {
    		throw new Exception("message parameter is not a string.");
    	}
    	this.generalErrorElement.set("text", message);
    },
    setGeneralErrorHtml: function(html) {
    	if (typeOf(html) !== "string") {
    		throw new Exception("html parameter is not a string.");
    	}
    	this.generalErrorElement.set("html", html);
    },
    getData: function() {
    	var result = {};
    	if (typeOf(this.fieldGroups) !== "null") {
	    	for (var i = 0; i<this.fieldGroups.length; i++) {
	    		result = Object.append(result, this.fieldGroups[i].getData());
	    	}
    	}
    	if (typeOf(this.formSections) !== "null") {
    		for (var i = 0; i<this.formSections.length; i++) {
    			result = Object.append(result, this.formSections[i].getData());
    		}
    	}
    	return result;
    },
    showSubmitButton: function() {
    	this.submitButton.removeCssClass("hidden");
    },
    hideSubmitButton: function() {
    	this.submitButton.addCssClass("hidden");
    },
    addElement: function(element) {
    	this.bodyElement.adopt(element);
    },
	addGroup: function(fieldGroup) {
		if (!instanceOf(fieldGroup, FieldGroup)) {
			throw new Exception("fieldGroup parameter is not a FieldGroup instance.");
		}
		fieldGroup.renderTo(this.bodyElement);
		this.fieldGroups.push(fieldGroup);
	},
	addSection: function(formSection) {
		if (!instanceOf(formSection, FormSection)) {
			throw new Exception("formSection parameter is not a FieldSection instance.");
		}
		formSection.renderTo(this.bodyElement);
		this.formSections.push(formSection);
	},
	addField: function(field) {
		if (!instanceOf(field, Field)) {
			throw new Exception("field parameter is not a Field instance.");
		}
		var newFieldGroup = new FieldGroup();
		newFieldGroup.addField(field);
		newFieldGroup.renderTo(this.bodyElement);
		this.fieldGroups.push(newFieldGroup);
	},
	removeField: function(field) {
		if (!instanceOf(field, Field)) {
			throw new Exception("field parameter is not a Field instance.");
		}
		for (var i = 0; i<this.fieldGroups.length; i++) {
			this.fieldGroups[i].removeField(field);
		}
	},
	setHeader: function(text) {
		if (typeOf(text) !== "string") {
			throw new Exception("text parameter is not a string.");
		}
		this.header = text;
		this.headerElement.set("text", text);
	},
	getRootElementTypeName: function() {
        return "form";
    },
    reset: function() {
    	this.getHtmlElement().reset();
    }
});

/**
 * "Ajax" upload implementation done with iframe.
 * 
 */
var IframeUploadForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["UploadForm"]);
    },
    initialize: function(field) {
    	if (!instanceOf(field, UploadField)) {
    		throw new Exception("field parameter must be a UploadField instance.");
    	}
    	this.parent(false);
    	
    	var targetName = "uploadIframe";
    	
    	// set csrf token
    	this.csrfField = new HiddenField("csrfmiddlewaretoken", Cookie.read("csrftoken"));
    	this.sourceField = new HiddenField("sourceName", "");
        this.uploadField = field;
        this.addField(this.csrfField);
        this.addField(this.sourceField);
        this.addField(this.uploadField);
        this.uploadField.setParentUploadForm(this);
        
        // implement via iframe
        this.target = new Element("iframe");
        this.target.set("name", targetName)
        this.target.set("width", 0)
        this.target.set("height", 0)
        
        // setup form details
        this.getHtmlElement().set("enctype", "multipart/form-data");        
        this.getHtmlElement().set("method", "post");
        this.getHtmlElement().set("target", targetName);
        this.getHtmlElement().adopt(this.target);
        this.addCssClass("Form");
    },
    setCsrfToken: function(csrfToken) {
    	this.csrfField.setValue(csrfToken);
    },
    setSourceName: function(name) {
    	this.sourceField.setValue(name);
    },
    setAction: function(action) {
    	var domain = null;
    	try {
    		domain = dns_domain;
    	} catch (e) {}
    	var app_d = (typeOf(domain) === "string") ? domain : document.domain;
    	var actionString = "http://" + app_d + "/action/" + action + "/";
    	this.getHtmlElement().set("action", actionString); // TODO: fix hardcoding...
    },
    handleChange: function(item) {
    	item.getParentUploadForm().handleSubmit();
    },
    handleSubmit: function() {
    	// override
    }
});

var UploadForm = IframeUploadForm; // connect UploadForm interface to IframeUploadForm implementation.

var FormSection = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["FormSection"]);
    },
    initialize: function(name) {
        this.parent();
		this.fieldGroups = [];
		this.name = name;
		this.getHtmlElement().set('html', '<h3>' + name + '</h3>');
		//this.addCssClass("clearfix");
    },
	addGroup: function(fieldGroup) {
		if (!instanceOf(fieldGroup, FieldGroup)) {
			throw new Exception("fieldGroup parameter is not a FieldGroup instance.");
		}
		fieldGroup.renderTo(this.getHtmlElement());
		this.fieldGroups.push(fieldGroup);
	},
    getData: function() {
    	var result = {};
    	for (var i = 0; i<this.fieldGroups.length; i++) {
    		result = Object.append(result, this.fieldGroups[i].getData());
    	}
    	return result;
    }
});

var FieldGroup = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["FieldGroup"]);
    },
    initialize: function(label) {
        this.parent(label);
		this.fields = [];
		this.label = null;
		if (typeOf(label) === "string") {
			this.label = new Element("h4");
			this.label.set("text", label);
			this.getHtmlElement().adopt(this.label);
		}
		//this.addCssClass("clearfix");
    },
    getData: function() {
    	var result = {};
    	var field;
    	for (var i = 0; i<this.fields.length; i++) {
    		field = this.fields[i].getData()
    		if (typeOf(field) !== "null") {
    			result = Object.append(result, field);
    		}
    	}
    	return result;
    },
    setGrid: function(grid) {
    	this.addCssClass(grid);
    },
    addField: function(field) {
    	if (!instanceOf(field, Field)) {
    		throw new Exception("field parameter is not a Field instance.");
    	}
    	this.fields.push(field);
    	field.renderTo(this.getHtmlElement());
    	//this.refreshInformation();
    },
    removeField: function(field) {
    	if (!instanceOf(field, Field)) {
    		throw new Exception("field parameter is not a Field instance.");
    	}
    	for (var i = 0; i<this.fields.length; i++) {
    		if (this.fields[i] === field) {
    			this.fields[i].unrender();
    			this.fields.remove(i);
    		}
    	}
    	return false;
    },
    hasField: function(field) {
    	if (!instanceOf(field, Field)) {
    		throw new Exception("field parameter is not a Field instance.");
    	}
    	for (var i = 0; i<this.fields.length; i++) {
    		if (this.fields[i] === field) {
    			return true;
    		}
    	}
    	return false;
    },
    refreshInformation: function() {
    	var fieldslength = this.fields.length;
    	switch (fieldslength) {
    		case 2:
    			this.getHtmlElement().set('class', 'double');
    			break;
    		case 3:
    			this.getHtmlElement().set('class', 'triple');
    			break;
    		case 4:
    			this.getHtmlElement().set('class', 'quatro');
    			break;
    		default:
    			this.getHtmlElement().erase('class');
    	}
    },
    populate: function(data) {
    	for (var i = 0; i<data.length; i++) {
    		var field = new CheckBoxField(data[i].text, data[i].name);
    		field.setValue(data[i].id);
    		field.setRequired(false);
    		this.addField(field);
    	}
    }
});

var CheckboxGroup = new Class({
    Extends: FieldGroup,
    getClassHierarchy: function() {
        return this.parent().append(["CheckboxGroup"]);
    },
    initialize: function(label, name) {
        this.parent(label);
        this.addCssClass("FieldGroup");
        this.name = name;
    },
    hasValue: function(value) {
    	var fieldValue = null;
    	for (var i = 0; i<this.fields.length; i++) {
    		fieldValue = parseInt(this.fields[i].getValue());
    		if (fieldValue === value) {
    			return true;
    		}
    	}
    	return false;
    },
    populate: function(data) {
    	for (var i = 0; i<data.length; i++) {
	    	if (!this.hasValue(data[i].id)) {
	    		var field = new CheckBoxField(gettext(data[i].text), this.name);
	    		field.setValue(data[i].id);
	    		field.setRequired(false);
	    		this.addField(field);
    		}
    	}
    },
    addField: function(field) {
    	if (!instanceOf(field, CheckBoxField)) {
    		throw new Exception("inputField parameter is not a CheckboxField instance.");
    	}
    	this.fields.push(field);
    	field.renderTo(this.getHtmlElement());
    },
    setFieldData: function(fieldData) {
    	for (var i = 0; i<this.fields.length; i++) {
    		if (this.fields[i].getValue().toInt() === fieldData.id) {
    			this.fields[i].setChecked(true);
    		}
    	}
    },
    clearAll: function() {
    	for (var i = 0; i<this.fields.length; i++) {
    		this.fields[i].setChecked(false);
    	}
    },
    setData: function(data) {
    	this.clearAll();
    	for (var i = 0; i<data.length; i++) {
    		this.setFieldData(data[i]);
    	}
    },
    getData: function() {
    	var result = {};
    	var options = "";
    	var field;
    	var hasResults = false;
    	for (var i = 0; i<this.fields.length; i++) {
    		field = this.fields[i];
    		if (typeOf(field) !== "null" && field.isChecked()) {
    			options += field.getValue() + ",";
    			hasResults = true;
    		}
    	}
    	if (hasResults) {
    		result[this.name] = options.substring(0, options.length - 1);
    	}
    	return result;
    }
});

var Field = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Field"]);
    },
    initialize: function(label, name) {
        this.parent();
		this.label = label;
		this.name = name;
		this.field = null;
		this.labelElement = new Element("span");
		this.labelElement.set("text", label);
		this.requiredMarker = new Element("span");
		this.requiredMarker.addClass("requiredMarker");
		this.requiredMarker.addClass("hidden");
		this.requiredMarker.set("text", "*");
		this.helpText = new Element("em");
		this.appendixText = new Element("span");
		this.labelElement.adopt(this.requiredMarker);
		this.getHtmlElement().adopt(this.labelElement);
		this.getHtmlElement().adopt(this.helpText);
		this.getHtmlElement().adopt(this.appendixText);
		this.addCssClass("Field");
    },
    getField: function() {
    	return this.field;
    },
    setValid: function(flag) {
    	if (flag) {
    		this.helpText.addClass("valid");
    	} else {
    		this.helpText.removeClass("valid");
    	}
    },
    getData: function() {
    	if (this.field.value !== "-1") {
	    	var result = {};
	    	result[this.name] = this.field.value
	    	return result;
    	}
    	return null;
    },
	getRootElementTypeName: function() {
        return "label";
    },
    setElementId: function(id) {
    	this.field.set('id', id);
    },
    setHelpText: function(text) {
    	if (typeOf(text) === "string") {
    		this.helpText.set("text", text);
    	}
    },
    setAppendixText: function(text) {
    	if (typeOf(text) === "string") {
    		this.appendixText.set("text", text);
    	}
    },
    getValue: function() {
    	if (typeOf(this.field) !== "null") {
    		return this.field.get("value");
    	}
    },
    setRequired: function(flag) {
    	if (flag) {
    		this.field.set('required', 'required');
    		this.requiredMarker.removeClass("hidden");
    	} else {
    		this.field.erase('required');
    		this.requiredMarker.addClass("hidden");
    	}
    },
    removeHelpText: function() {
    	this.helpText.destroy();
    }
});

var UploadField = new Class({
    Extends: Field,
    getClassHierarchy: function() {
        return this.parent().append(["UploadField"]);
    },
    initialize: function(label, name) {
        this.parent(label, name);
        this.parentUploadForm = null;
        this.field = new Element("input");
        this.field.set('name', name);
        this.field.set('type', 'File');
        this.field.inject(this.helpText, 'before');
        var self = this;
        this.field.set("events", {"change": function() {
        	self.handleChange(self);
        }});
    },
    getParentUploadForm: function() {
    	return this.parentUploadForm;
    },
    setParentUploadForm: function(uploadForm) {
    	if (!instanceOf(uploadForm, UploadForm)) {
    		throw new Exception("uploadForm parameter must be a UploadForm instance.");
    	}
    	this.parentUploadForm = uploadForm;
    	this.handleChange = this.parentUploadForm.handleChange;
    },
    handleChange: function(item) {
    	// to be overridden
    }
});

var TextAreaField = new Class({
    Extends: Field,
    getClassHierarchy: function() {
        return this.parent().append(["TextAreaField"]);
    },
    initialize: function(label, name, initstring) {
        this.parent(label, name);
        this.field = new Element("textarea");
        this.field.set('name', name);
        this.field.set('text', typeOf(initstring) === "string" ? initstring : "");
        this.field.inject(this.helpText, 'before');
    },
    setMinLength: function(number) {
    	if (typeOf(number) === "number") {
    		this.field.set('minlength', number);
    	}
    },
    setMaxLength: function(number) {
    	if (typeOf(number) === "number") {
    		this.field.set('maxlength', number);
    	}
    },
    setText: function(text) {
    	this.field.set("value", text);
    }
});

var InputField = new Class({
    Extends: Field,
    getClassHierarchy: function() {
        return this.parent().append(["InputField"]);
    },
    initialize: function(label, name, type, id, minlength) {
        this.parent(label, name);
		this.field = new Element("input");
		this.field.set('required', 'required');
		this.field.set('name', name);
		this.field.set('minlength', minlength);
		if (typeOf(type) !== "null") {
			this.setType(type, id);
		} else {
			this.field.set('type', "text");
		}
		this.field.inject(this.helpText, 'before');
    },
    setValue: function(value) {
    	this.field.set('value', value);
    },
    setMinLength: function(number) {
    	if (typeOf(number) === "number") {
    		this.field.set('minlength', number);
    	}
    },
    setMaxLength: function(number) {
	    if (typeOf(number) === "number") {
	    	this.field.set('maxlength', number);
	    }
    },
    setType: function(type, id) {
    	switch (type) {
    		case FieldType.EMAIL:
    			this.field.setAttribute('type', "email");
    			break;
    		case FieldType.PASSWORD:
    			this.field.setAttribute('type', "password");
    			jQuery(this.field).pwStrength(); // use third party lib for now
    			break;
    		case FieldType.CONFIRM:
    			this.field.setAttribute('data-equals', id);
    			this.field.setAttribute('type', "password");
    			break;
    		case FieldType.TEXT:
    			this.field.setAttribute('type', "");
    			break;
    		case FieldType.CHECKBOX:
    			this.field.setAttribute('type', "checkbox");
    			break;
    		case FieldType.HIDDEN:
    			this.field.setAttribute('type', "hidden");
    			break;
    		default:
    	}
    }
});

var SliderField = new Class({
    Extends: Field,
    getClassHierarchy: function() {
        return this.parent().append(["SliderField"]);
    },
    options: {
		MIN: 18,
		MAX: 50
    },
    initialize: function(label, name) {
        this.parent(label, name);
        this.gutter = new Element("div");
        this.gutter.addClass("gutter");
        this.minKnob = new Element("div");
        this.minKnob.addClass("minKnob");
        this.minKnob.addClass("knob");
        this.maxKnob = new Element("div");
        this.maxKnob.addClass("maxKnob");
        this.maxKnob.addClass("knob");
        this.panel = new Element("div");
        this.minLabel = new Element("div");
        this.minLabel.addClass("minLabel");
        this.maxLabel = new Element("div");
        this.maxLabel.addClass("maxLabel");
        
        this.slider = new Slider(this.gutter, this.minKnob, this.panel, {
        	start: this.options.MIN,
        	end: this.options.MAX,
        	offset: 1,
        	snap: true,
        	onChange: function(pos){
        		this.minLabel.set('html', pos.minpos);
        		this.maxLabel.set('html', pos.maxpos);
        	}.bind(this)
        }, this.maxKnob);
        this.slider.setMin(this.options.MIN).setMax(this.options.MAX)
        this.getHtmlElement().adopt(this.minLabel);
        this.getHtmlElement().adopt(this.gutter);
        this.getHtmlElement().adopt(this.panel);
        this.getHtmlElement().adopt(this.minKnob);
        this.getHtmlElement().adopt(this.maxKnob);
        this.getHtmlElement().adopt(this.maxLabel);
    },
    getData: function() {
    	return {
    		min: this.slider.getMin(),
    		max: this.slider.getMax()
    	}
    }
});

var CheckBoxField = new Class({
    Extends: InputField,
    getClassHierarchy: function() {
        return this.parent().append(["CheckBoxField"]);
    },
    initialize: function(label, name) {
        this.parent(label, name, FieldType.CHECKBOX);
    },
    setChecked: function(flag) {
    	if (flag) {
    		this.field.set("checked", "checked");	
    	} else {
    		this.field.erase("checked");
    	}
    },
    getValue: function() {
    	return this.field.value;
    },
    getData: function() {
    	var result = {};
    	var value;
    	if (this.field.checked) {
	    	value = "on";
    	} else {
    		value = "off";
    	}
    	result[this.name] = value;
    	return result;
    },
    isChecked: function() {
    	return this.field.checked;
    }
});

var HiddenField = new Class({
    Extends: InputField,
    getClassHierarchy: function() {
        return this.parent().append(["HiddenField"]);
    },
    initialize: function(name, value) {
    	this.parent("", name, FieldType.HIDDEN);
		this.field.set("value", value);
		this.addCssClass("hidden");
    }
});

var LookupField = new Class({
    Extends: InputField,
    MIN_TRIGGER_LENGTH: 2,
    getClassHierarchy: function() {
        return this.parent().append(["LookupField"]);
    },
    initialize: function(name) {
    	this.parent("", name);
    	var self = this;
    	this.field.set("events", {"keyup": function(e) {
    		self.handleKeyUp();
    	}});
    	this.suggestionsWrapper = new Element("ul");
    	this.suggestions = [];
    	this.suggestionsWrapper.addClass("suggestions");
    	this.getHtmlElement().adopt(this.suggestionsWrapper);
    	this.suggestionsWrapper.addClass("hidden");
    	this.selectedSuggestion = null;
    	this.actionName = null;
    },
    setActionName: function(text) {
    	this.actionName = text;
    },
    getActionName: function() {
    	return this.actionName;
    },
    getSelectedSuggestion: function() {
    	return this.selectedSuggestion;
    },
    removeAllSuggestions: function() {
    	for (var i = 0; i<this.suggestions.length; i++) {
    		this.suggestions[i].unrender();
    		this.suggestions.remove(i);
    	}
    	this.suggestionsWrapper.set("html", "");
    },
    clear: function() {
    	this.removeAllSuggestions();
    	this.setValue("");
    	this.selectedSuggestion = null;
    },
    handleInternalSelect: function(suggestion) {
    	this.removeAllSuggestions();
    	this.suggestionsWrapper.addClass("hidden");
    	this.field.set("value", suggestion.getText());
    	this.selectedSuggestion = suggestion;
    	this.handleSelect(suggestion);
    },
    handleSelect: function(suggestion) {
    	// override
    },
    handleKeyUp: function() {
    	var keyword = this.field.value;
    	if (keyword.length > this.MIN_TRIGGER_LENGTH) {
    		this.removeAllSuggestions();
    		this.selectedSuggestion = null;
        	application.performAction(new ActionRequest(this.actionName, { keyword: keyword }, function(suggestions) {
        		var suggestion = null;
        		if (suggestions.length > 0) {
        			this.suggestionsWrapper.removeClass("hidden");
        		} else {
        			this.suggestionsWrapper.addClass("hidden");
        		}
        		for (var i = 0; i<suggestions.length; i++) {
        			suggestion = new Suggestion(this, suggestions[i].id, suggestions[i].text, suggestions[i].category);
    				this.suggestions.push(suggestion);
        			suggestion.renderTo(this.suggestionsWrapper);
        		}
        	}.bind(this)));
    	} else {
    		this.removeAllSuggestions();
    		this.suggestionsWrapper.addClass("hidden");
    	}
    }
});

var Suggestion = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Suggestion"]);
    },
    initialize: function(parentComponent, id, text, category) {
    	this.parent();
    	this.parentComponent = parentComponent;
    	this.id = id;
    	this.text = text;
    	this.category = category;
    	this.getHtmlElement().set("html", "<span class=\"text\">" + this.text + "</span><span class=\"category\">" + this.category + "</span>");
        this.getHtmlElement().set("events", {"click": function() {
        	this.parentComponent.handleInternalSelect(this)
        }.bind(this)});
    },
    getText: function() {
    	return this.text;
    },
    getId: function() {
    	return this.id;
    },
    getCategory: function() {
    	return this.category;
    },
	getRootElementTypeName: function() {
        return "li";
    }
});

var SelectBox = new Class({
    Extends: Field,
    getClassHierarchy: function() {
        return this.parent().append(["SelectBox"]);
    },
    initialize: function(label, name) {
        this.parent(label, name);
        this.field = new Element("select");
		this.field.inject(this.helpText, 'before');
		this.options = [];
		this.addOption("-1", "---" + gettext("select") + "---");
		this.selectedOption = null;
		this.field.set("events", {"change": this.internalHandleChange.bind(this)});
    },
    internalHandleChange: function(event) {
    	event.preventDefault();
		this.selectedOption = this.field.options[this.field.selectedIndex].retrieve("item");
		this.handleChange(this.selectedOption);
    },
    addOption: function(id, text) {
    	var newOption = new SelectOption(id, text);
    	this.options.push(newOption);
    	newOption.renderTo(this.field);    	
    },
    setSelected: function(id) {
    	if (typeOf(id) !== "null") {
	    	for (var i = 0; i<this.options.length; i++) {
	    		if (this.options[i].getId() == id) {
	    			this.options[i].getHtmlElement().set("selected", "selected");
	    			this.selectedOption = this.options[i]; 
	    		}
	    	}
	    	this.handleChange(this.selectedOption);
    	}
    },
    populate: function(data) {
    	if (typeOf(data) !== "null") {
	    	this.removeAll();
	    	this.addOption("-1", "---" + gettext("select") + "---");
	    	for (var i = 0; i<data.length; i++) {
	    		this.addOption(data[i].id, gettext(data[i].text))
	    	}
    	}
    },
    removeAll: function() {
    	for (var i = 0; i<this.options.length; i++) {
    		this.options[i].unrender();
    		this.options.remove(i);
    	}
    	this.options = [];
    	this.field.set('html',''); // TODO: improve this
    },
    enable: function() {
    	this.field.removeProperty("disabled");
    },
    disable: function() {
    	this.field.set("disabled", "disabled");
    },
    handleClick: function() {
    	// override
    },
    handleChange: function() {
    	// override
    }
});

var SelectOption = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["SelectOption"]);
    },
    initialize: function(id, label) {
        this.parent();
        this.id = id;
        this.label = label;
		this.getHtmlElement().set("value", id);
		this.getHtmlElement().set("text", label);
		this.getHtmlElement().store("item", this);
    },
	getRootElementTypeName: function() {
        return "option";
    },
    getId: function() {
    	return this.id;
    },
    getLabel: function() {
    	return this.label;
    }
});

var SubmitButton = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["SubmitButton"]);
    },
    initialize: function(label) {
        this.parent();
		this.label = label;
		this.locked = false;
		this.text = new Element("span");
		this.text.set("text", this.label);
		this.spinner = new Element("img");
		this.spinner.addClass("spinner");
		this.spinner.addClass("invisible");
		this.spinner.set("src", "http://dg1h6uvotkrdh.cloudfront.net/s/images/spinner3-bluey_micro.gif");
		this.spinner.set("width", "15px");
		this.spinner.set("height", "15px");
		this.enabled = true;
		var self = this;
		this.getHtmlElement().set({
			'events': {
				'click': function(e) {
					e.preventDefault();
					if (!this.locked) {
						this.locked = true;
						setTimeout(function() {
							this.locked = false;
						}.bind(this), 50);
						if (self.enabled) {
							self.handleClick();
						}
					}
				}
			}
		});
		this.getHtmlElement().adopt(this.text);
		this.getHtmlElement().adopt(this.spinner);
    },
    setInProgress: function(flag) {
    	if (flag) {
    		this.disable();
    	} else {
    		this.enable();
    	}
    	this.showSpinner(flag);
    },
    showSpinner: function(flag) {
    	if (flag) {
    		this.spinner.removeClass("invisible");
    	} else {
    		this.spinner.addClass("invisible");
    	}
    },
    enable: function() {
    	this.enabled = true;
    	this.getHtmlElement().removeAttribute("disabled");
    },
    disable: function() {
    	this.enabled = false;
    	this.getHtmlElement().set("disabled", "disabled");
    },
	getRootElementTypeName: function() {
        return "button";
    },
    setLabel: function(label) {
    	if (typeOf(label) !== "string") {
    		throw new Exception("label parameter is not a string.");
    	}
    	this.label = label;
		this.text.set({
			'text': label
		});
    },
    setHtmlLabel: function(label) {
    	if (typeOf(label) !== "string") {
    		throw new Exception("label parameter is not a string.");
    	}
    	this.label = label;
		this.text.set({
			'html': label
		});
    },
    handleClick: function() {
    	// override
    }
});

var InterestSection = new Class({
    Extends: FormSection,
    getClassHierarchy: function() {
        return this.parent().append(["InterestSection"]);
    },
    initialize: function(name) {
    	publisher.subscribe("VIEW_READY", function() {
    		this.initAutocomplete();
    	}.bind(this));
        this.parent(name);
        this.group = new FieldGroup();
        this.interests = [];
        this.selected = null;
        this.interestLookup = new InputField();
        this.interestLookup.removeHelpText();
        this.interestLookup.setRequired(false);
        this.addButton = new SubmitButton(gettext("add"));
        this.addButton.handleClick = this.handleAddInterest.bind(this);
        this.category = new InputField("");
        this.category.setRequired(false);
        this.category.hide();
        this.group.addField(this.interestLookup);
        this.group.addField(this.category);
        this.addGroup(this.group);
        this.addButton.renderTo(this.getHtmlElement());
		this.addCssClass("FormSection");
		this.interestsWrapper = new Element("ul");
		this.interestsWrapper.addClass("interestsWrapper");
		this.getHtmlElement().adopt(this.interestsWrapper);
    },
    getLookupField: function() {
    	return this.interestLookup;
    },
    initAutocomplete: function() {
		jQuery(this.interestLookup.getField()).autocomplete({
			source: function(request, response) {
				application.performAction(new ActionRequest("getInterests", {keyword: request.term}, function(payload) {
					var a = 0;
					response(jQuery.map(payload, function(item) {
						return {
							id: item.id,
							label: item.text,
							category: item.category,
							value: item.text
						}
					}));
				}));
			},
			minLength: 3,
			select: function(event, ui) {
				this.selected = ui.item;
			},
			open: function() {
				$(this).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			},
			close: function() {
				$(this).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			}
		});
    },
    populate: function(interestsData) {
    	this.clearAll();
    	var interest;
    	for (var i = 0; i<interestsData.length; i++) {
    		interest = new Interest(this, interestsData[i].id, interestsData[i].text, interestsData[i].category);
    		this.interests.push(interest);
        	interest.renderTo(this.interestsWrapper);
    	}
    },
    hasInterest: function(interest) {
    	for (var i = 0; i<this.interests.length; i++) {
    		if (this.interests[i].getId() === interest.getId()) {
    			return true;
    		}
    	}
    	return false;
    },
    addInterest: function(data) {
    	var interest = null;
    	if (instanceOf(data, Suggestion)) {
			interest = new Interest(this, data.getId(), data.getText(), data.getCategory());
    	} else {
    		interest = new Interest(this, data.value, data.label, data.category);
    	}
    	if (!this.hasInterest(interest)) {
			this.interests.push(interest);
	    	interest.renderTo(this.interestsWrapper);
			this.clear();
		}
    },
    handleSuggestionSelect: function(suggestion) {
    	this.category.setValue(suggestion.getCategory());
    },
    validInterest: function() {
    	if (this.interestLookup.getValue().length > 3) {
    		return true;
    	}
    	return false;
    },
    validCategory: function() {
    	return true;
    	/*if (this.category.getValue().length > 3) {
    		return true;
    	}
    	return false;*/
    },
    clearAll: function() {
    	this.clear();
    	for (var i = this.interests.length - 1; i>=0 ; i--) {
    		this.interests[i].unrender();
    		this.interests.remove(i);
    	}
    },
    clear: function() {
    	//this.interestLookup.clear();
    	//this.category.setValue("");
    },
    handleAddInterest: function() {
    	if (typeOf(this.selected) !== "null") {
    		if (this.selected.category === this.category.getValue()) {
    			this.addInterest(this.selected);
    		} else if (this.validCategory()) {
    			// register interest string with other category
    			this.registerInterest(this.interestLookup.getValue(), "");
    		}
    	} else if (this.validInterest() && this.validCategory()) {
    		this.registerInterest(this.interestLookup.getValue(), this.category.getValue());
    	}
    },
    registerInterest: function(interest, category) {
    	// override
    },
    handleDelete: function(interest) {
    	for (var i = 0; i<this.interests.length; i++) {
    		if (this.interests[i] === interest) {
    			this.interests[i].unrender();
    			this.interests.remove(i);
    		}
    	}
    },
    getData: function() {
    	var result = "";
    	for (var i = 0; i<this.interests.length; i++) {
    		result += this.interests[i].getId() + ",";
    	}
    	return { interests: result.substring(0, result.length - 1) };
    }
});

var Interest = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Interest"]);
    },
    initialize: function(parentComponent, id, text, category) {
    	this.parent();
    	this.parentComponent = parentComponent;
    	this.id = id;
    	this.text = text;
    	this.category = category;
    	this.getHtmlElement().set("html", "<span class=\"text\">" + this.text + "</span><span class=\"remove\">X</span>");
        this.getHtmlElement().getElement(".remove").set("events", {"click": function() {
        	this.parentComponent.handleDelete(this);
        }.bind(this)});
    },
    getText: function() {
    	return this.text;
    },
    getId: function() {
    	return this.id;
    },
    getCategory: function() {
    	return this.category;
    },
	getRootElementTypeName: function() {
        return "li";
    }
});
