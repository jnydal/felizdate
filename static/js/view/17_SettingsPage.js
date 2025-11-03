var SettingsPage = new Class({
    Extends: Page,
    getClassHierarchy: function() {
        return this.parent().append(["SettingsPage"]);
    },
    initialize: function(model) {
        this.parent();
        this.model = model;
        this.model.addObserver(this);
        this.tabPanel = new TabPanel();
        this.accountForm = new AccountForm(model, true);
        this.accountForm.removeAcceptPolicy();
        this.accountForm.handleSubmit = this.handleSubmitAccountForm.bind(this);
        
        // wrapup for profileimage
        this.imageWrapper = new Element("div");
        this.imageWrapper.addClass("profileImageWrapper");
        this.image = new Element("img");
        this.imageDescriptor = new Element("h4");
        this.imageWrapper.adopt(this.imageDescriptor);
        this.imageWrapper.adopt(this.image);
        
        // create upload form
        this.uploadImageField = new UploadField(gettext("Image"), "image");
        /*this.uploadImageField.setRequired(true);*/
        this.uploadImageForm = new UploadForm(this.uploadImageField);
        this.uploadImageForm.setAction("uploadImageDraft");
        this.uploadImageForm.setSourceName(this.getClassName());
        this.cropDialogWindow = null;
        
        this.profileForm = new ProfileForm(model, true); 
        this.profileForm.handleSubmit = this.handleSubmitProfileForm.bind(this);
        this.profileSection = new ComponentContainer();
        this.profileSection.addElement(this.imageWrapper);
        this.profileSection.addComponent(this.uploadImageForm);
        this.profileSection.addComponent(this.profileForm);
        
        this.advancedForm = new AdvancedForm(model, true);
        this.advancedForm.handleSubmit = this.handleSubmitAdvancedForm.bind(this);
        
        this.media = new MediaManager(model, true);
        
        this.reportSection = new ComponentContainer();
        this.type = new SelectBox(gettext("Type"), "type");
        this.type.addOption("BUG", gettext("Bug"));
        this.type.addOption("IMPROVEMENT", gettext("Improvement"));
        this.type.addOption("USER", gettext("User"));
        this.description = new TextAreaField(gettext("Description"), "description");
        this.reportForm = new Form(true);
        this.reportForm.addField(this.type);
        this.reportForm.addField(this.description);
        this.reportForm.handleSubmit = this.handleSubmitIssue.bind(this);
        this.reportSection.addComponent(this.reportForm);

        this.tabPanel.add(this.accountForm, gettext("Account"));
        this.tabPanel.add(this.profileSection, gettext("Profile"));
        this.tabPanel.add(this.advancedForm, gettext("Advanced"));
        this.tabPanel.add(this.media, gettext("Media"));
        this.tabPanel.add(this.reportSection, gettext("Report"));
        this.tabPanel.show(this.accountForm);
        this.tabPanel.renderTo(this);
        
        // bind upload form with custom handler... this can maybe be improved...
        this.uploadImageForm.handleSubmit = function() {
        	application.controller.submitForm(this);
        };
        
        publisher.subscribe("ISSUE_SUBMITTED", function() {
    		this.reportForm.setInProgress(false);
    	}.bind(this));
    },
    handleSubmitIssue: function() {
    	var request = new ActionRequest("reportIssue", this.reportForm.getData());
    	request.setMethod("POST");
		application.performAction(request);
    },
    handleSubmitAccountForm: function() {
    	var request = new ActionRequest("saveAccount", this.accountForm.getData());
    	request.setContext(this);
		application.performAction(request);
    },
    handleSubmitProfileForm: function() {
    	var request = new ActionRequest("saveProfile", this.profileForm.getData());
    	request.setContext(this);
		application.performAction(request);
    },
    handleSubmitAdvancedForm: function() {
    	var request = new ActionRequest("saveAdvanced", this.advancedForm.getData());
    	request.setContext(this);
		application.performAction(request);
    },
    refreshAccountForm: function() {
      	this.accountForm.refresh();
    },
    refreshProfileForm: function() {
      	this.profileForm.refresh();
    },
    refreshAdvancedForm: function() {
      	this.advancedForm.refresh();
    },
    refreshProfileImage: function() {
    	var userProfile = this.model.getUserProfile();
    	if (typeOf(userProfile) !== "null") {
    		if (!userProfile.getHasProfileImage()) {
    			this.imageDescriptor.set("text", gettext("No image uploaded."));
    		} else {
    			this.imageDescriptor.set("text", gettext("Active Image:"));
    			this.image.set("src", userProfile.profileImageUrl);
    			this.image.set("width", "240px");
    			this.image.set("height", "300px");
    		}
    	}
    },
    refreshMedia: function() {
    	this.media.refresh();
    },
    refresh: function() {
    	this.refreshAccountForm();
    	this.refreshProfileImage();
    	this.refreshProfileForm();
    	this.refreshAdvancedForm();
    	this.refreshMedia();
    },
    setAccountTabEnabled: function(flag) {
    	if (flag) {
    		this.tabPanel.enable(this.accountForm);
    		this.tabPanel.show(this.accountForm);
    	} else {
    		this.tabPanel.show(this.profileSection);
        	this.tabPanel.disable(this.accountForm);
    	}
    },
    loadProfile: function(user, type) {
    	this.profileForm.loadProfile(user, type);
    	this.advancedForm.loadProfile(user, type);
    },
    reset: function() {
    	this.accountForm.reset();
    	this.profileForm.reset();
    	this.advancedForm.reset();
    	this.uploadImageForm.reset();
    },
	handleModelEvent: function(event) {
    	if (!event instanceof ModelEvent) {
			throw new Exception("event is not of type ModelEvent!");
		}
    	switch (event.type) {
	    	case "CSRF_TOKEN_LOADED":
	    		this.uploadImageForm.setCsrfToken(event.payload.csrfToken);
	    		break;
	    	case "ACCOUNT_UPDATED":
	    		this.accountForm.refresh();
	    		this.accountForm.setInProgress(false);
	    		break;
			case "PROFILE_CREATED":
			case "PROFILE_UPDATED":
				this.profileForm.refresh();
				this.advancedForm.refresh();
				this.refreshProfileImage();
				this.profileForm.setInProgress(false);
				this.advancedForm.setInProgress(false);
				this.uploadImageField.setAppendixText("");
				this.uploadImageField.setValid(false);
				break;
			case "DRAFT_IMAGE_LOADED":
				if (event.payload.sourceName === this.getClassName()) {
			        this.cropDialogWindow = new CropDialogWindow();
			        this.cropDialogWindow.handleCrop = this.handleCropImage.bind(this);
					this.cropDialogWindow.load(this.model.getUserSessionModel().getDraftImage());
				}
				break;
			case "PROFILE_IMAGE_UPLOADED":
				if (event.payload.request.context === this) {
					this.profileForm.setProfileImages(this.model.getUserSessionModel().getTemporaryImages());
					this.cropDialogWindow.hide();
					this.uploadImageField.setValid(true);
					this.uploadImageField.setAppendixText(gettext("Image uploaded. Save profile to submit choice."));
				}
				break;
			case "SAVE_ACCOUNT_FAILED":
				if (event.payload.request.context === this) {
					this.accountForm.setInProgress(false);
					application.view.showErrorDialog(event.payload.payload);
				}
				break;
			case "SAVE_PROFILE_FAILED":
				if (event.payload.request.context === this) {
					this.profileForm.setInProgress(false);
					application.view.showErrorDialog(event.payload.payload);
				}
				break;
			case "SAVE_ADVANCED_FAILED":
				if (event.payload.request.context === this) {
					this.advancedForm.setInProgress(false);
					application.view.showErrorDialog(event.payload.payload);
				}
				break;
			default: // ignore other...
		}
    },
    handleCropImage: function(coordinates) {
    	var payload = coordinates;
    	payload.temporaryImagePathFile = this.model.getUserSessionModel().getDraftImage().pathfilename;
    	var request = new ActionRequest("cropImage", payload);
    	request.setContext(this);
    	application.controller.performAction(request);
    },
});
