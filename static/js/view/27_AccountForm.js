var AccountForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["AccountForm"]);
    },
    initialize: function(model, init) {
    	init = init || false;
    	this.parent(init);
        this.userSessionModel = model.getUserSessionModel();
        this.emailField = new InputField(gettext("E-mail"), "email", FieldType.EMAIL);
        this.emailField.setHelpText(gettext("Your password will be sent to this address. Your address will not be made public."));
        this.emailField.setRequired(true);
		this.addField(this.emailField);
		
		var passwordField = new InputField(gettext("Password"), "password", FieldType.PASSWORD, null, 3); 
		passwordField.setRequired(true);
		passwordField.setElementId("password");

		var confirmField = new InputField(gettext("Confirm password"), "confirm", FieldType.CONFIRM, "password"); 
		confirmField.setRequired(true);

		var passwordFieldGroup = new FieldGroup();
		passwordFieldGroup.addField(passwordField);
		passwordFieldGroup.addField(confirmField);
		passwordFieldGroup.setGrid(Grid.DOUBLE);
		this.addGroup(passwordFieldGroup);
		
		this.acceptCheckbox = new InputField(gettext("Agree to service conditions"), "accept", FieldType.CHECKBOX);
		this.acceptCheckbox.setHelpText(gettext("I agree to the terms and conditions of use and the privacy policy"));
		this.addField(this.acceptCheckbox);
		
		this.addCssClass("Form");
    },
    getEmailField: function() {
    	return this.emailField;
    },
    refresh: function() {
    	this.emailField.setValue(this.userSessionModel.getEmail());
    },
    removeAcceptPolicy: function() {
    	this.removeField(this.acceptCheckbox);
    }
});
