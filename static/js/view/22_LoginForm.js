var LoginForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["LoginForm"]);
    },
    initialize: function(model) {
        this.parent(true);
        var group = new FieldGroup();
        
        var emailField = new InputField(gettext("E-mail"), "email", FieldType.EMAIL);
        group.addField(emailField);
        
        var passwordField = new InputField(gettext("Password"), "password", FieldType.PASSWORD);
        passwordField.setMinLength(3);
		group.addField(passwordField);
		
		this.addGroup(group);
		
		this.addCssClass("Form");
		this.submitButton.setLabel(gettext("Login"));
		
		var registerButton = new SubmitButton();
		registerButton.addCssClass("registerButton");
		registerButton.setLabel(gettext("Register"));
		registerButton.handleClick = function() {
			this.handleRegisterButtonClick();
		}.bind(this);
		registerButton.renderTo(this.footerElement);
		
		this.fbLoginButton = new SubmitButton();
		this.fbLoginButton.addCssClass("fbLogin");
		this.setMobileView(Utilities.isMobile());
		this.fbLoginButton.handleClick = function() {
			this.handlefbLoginClick();
		}.bind(this);
		this.fbLoginButton.renderTo(this.footerElement);
		
		this.hideHeader();
		model.addObserver(this);
    },
    setMobileView: function(flag) {
    	if (flag) {
    		this.fbLoginButton.setLabel("Login/register with Facebook");
    	} else {
    		this.fbLoginButton.setHtmlLabel("&nbsp;");
    	}
    },
    handleSubmit: function() {
    	var payload = this.getData();
    	this.submitButton.setInProgress(true);
    	application.performAction(new ActionRequest("login", payload));
    },
    handleRegisterButtonClick: function() {
    	// override
    },
    handlefbLoginClick: function() {
    	// override
    },
    handleModelEvent: function(event) {
    	switch (event.getType()) {
    		case "LOGIN_FAILED":
    	    	var domain = null;
    	    	try {
    	    		domain = dns_domain;
    	    	} catch (e) {}
    	    	var app_d = (typeOf(domain) == "string") ? domain : document.domain;
    	    	var message = event.payload.message + "<br><a target='_blank' href='http://" + app_d + "/action/passwordReset'>" + gettext("forgotten password?") + "</a>";
    			this.setGeneralErrorHtml(message); // TODO: fix hardcoding
    			this.setInProgress(false);
    			break;
    		case "USER_SESSION_LOADED":
    			this.setInProgress(false);
    			break;
    	}
    }
});
