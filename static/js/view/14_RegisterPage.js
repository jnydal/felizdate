var RegisterPage = new Class({
    Extends: Page,
    getClassHierarchy: function() {
        return this.parent().append(["RegisterPage"]);
    },
    initialize: function(model) {
        this.parent();
        this.model = model;
        this.model.addObserver(this);
        this.model.getUserSessionModel().addObserver(this);
        this.wizard = new Wizard();
        
        // bind buttons
        this.wizard.handleNextPageButtonClick = this.handleNextPageButtonClick.bind(this);
        this.wizard.handlePreviousPageButtonClick = this.handlePreviousPageButtonClick.bind(this);
        
        // create account form
        this.accountForm = new AccountForm(model);
        this.reCaptchaWrapper = new Element("div");
        this.reCaptchaWrapper.set("id", "reCaptchaWrapper");
        this.accountForm.addElement(this.reCaptchaWrapper);
        
        // create upload form
        this.uploadImageField = new UploadField(gettext("Image"), "image");
        /*this.uploadImageField.setRequired(true);*/
        this.uploadImageForm = new UploadForm(this.uploadImageField);
        this.uploadImageForm.setSourceName(this.getClassName());
        this.uploadImageForm.setAction("uploadImageDraft");
        this.cropDialogWindow = null;
        
        // create profile form
        this.profileForm = new ProfileForm(model);
        
        // create form for complete wizard page
        this.completedForm = new Form(true);
        this.completedForm.setSubmitButtonLabel(gettext("Search"));
        this.completedForm.handleSubmit = function() {
        	this.parentComponent.showPage(this.searchPage);
        };
        
        // create wrappers for forms
        this.registerAccountWizardPage = new WizardPage(gettext("1. Account"));
        this.registerProfileWizardPage = new WizardPage(gettext("2. Profile"));
        this.completedWizardPage = new WizardPage(gettext("3. Enjoy"));
        
        // set wizard pages
        this.registerAccountWizardPage.addForm(this.accountForm);
        this.registerAccountWizardPage.setHeaderText(gettext("Account information"));
        this.registerAccountWizardPage.setHeaderStrongText(gettext("Step 1: "));
        this.registerAccountWizardPage.setHeaderEmphasisText(gettext("Create new login account, or use your facebook account to authorize at this site."));
        
        this.registerProfileWizardPage.addForm(this.uploadImageForm);
        this.registerProfileWizardPage.addForm(this.profileForm);
        this.registerProfileWizardPage.setHeaderText(gettext("Set up your profile basics"));
        this.registerProfileWizardPage.setHeaderStrongText(gettext("Step 2: "));
        this.registerProfileWizardPage.setHeaderEmphasisText(gettext("Advanced profile setup can be done later."));
        
        this.completedWizardPage.addForm(this.completedForm);
        this.completedWizardPage.setHeaderText(gettext("Find a friend"));
        this.completedWizardPage.setHeaderStrongText(gettext("Step 3: "));
        this.completedWizardPage.setHeaderEmphasisText(gettext("Meet people with your interests."));
        
        this.wizard.addPage(this.registerAccountWizardPage);
        this.wizard.addPage(this.registerProfileWizardPage);
        this.wizard.addPage(this.completedWizardPage);
        this.wizard.renderTo(this.getHtmlElement());

        // bind upload form with custom handler... this can maybe be improved...
        this.uploadImageForm.handleSubmit = function() {
        	application.controller.submitForm(this);
        };
    },
    initCaptcha: function() {
    	var self = this;
    	this.reCaptchaScript = Asset.javascript('http://www.google.com/recaptcha/api/js/recaptcha_ajax.js', {
    	    id: 'reCaptcha',
    	    onLoad: function() {
	    	  Recaptcha.create("6LcYTNgSAAAAACzKp7nvZ3i7KcWV08-z_oQVDfO3",
			    "reCaptchaWrapper",
			    {
			      theme: "red",
			      callback: Recaptcha.focus_response_field
			    }
			  );
    	    }
    	});
    },
    handleNextPageButtonClick: function() {
    	this.wizard.nextPageButton.setInProgress(true);
    	var currentPage = this.wizard.getCurrentPage();
    	var payload, request;
    	switch (currentPage) {
    		case this.registerAccountWizardPage:
    			payload = this.accountForm.getData();
    			payload.reCaptchaChallenge = Recaptcha.get_challenge();
    			payload.reCaptchaResponse = Recaptcha.get_response();
    			request = new ActionRequest("saveAccount", payload);
    			request.setContext(this);
    			application.controller.performAction(request);
    			break;
    		case this.registerProfileWizardPage:
    			payload = this.profileForm.getData();
    			request = new ActionRequest("saveProfile", payload);
    			request.setContext(this);
    			application.controller.performAction(request);
    			break;
    		case this.completedWizardPage:
    			this.getParentComponent().setLoggedInState(true);
    			break;
    			default:
    	}
    },
    handlePreviousPageButtonClick: function() {
    	var currentPage = this.wizard.getCurrentPage();
    	switch (currentPage) {
    		case this.registerAccountWizardPage:
    			
    			break;
    		case this.registerProfileWizardPage:
    			
    			break;
    			default:
    	}
    },
    handleCropImage: function(coordinates) {
    	var payload = coordinates;
    	payload.temporaryImagePathFile = this.model.getUserSessionModel().getDraftImage().pathfilename;
    	var request = new ActionRequest("cropImage", payload);
    	request.setContext(this);
    	application.controller.performAction(request);
    },
	handleModelEvent: function(event) {
    	if (!event instanceof ModelEvent) {
			throw new Exception("event is not of type ModelEvent!");
		}
    	switch (event.type) {
	    	case "CSRF_TOKEN_LOADED":
	    		this.uploadImageForm.setCsrfToken(event.payload.csrfToken);
	    		break;
			case "ACCOUNT_CREATED":
				var email = event.payload.email;
				this.wizard.goToWizardPage(this.registerProfileWizardPage);
				application.performAction(new ActionRequest("getOptions", {}));
				this.wizard.nextPageButton.setInProgress(false);
				break;
			case "PROFILE_CREATED":
				if (event.payload.request.context === this) {
					this.wizard.goToWizardPage(this.completedWizardPage);
					this.wizard.nextPageButton.setInProgress(false);
				}
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
				}
				break;
			case "SAVE_ACCOUNT_FAILED":
				if (event.payload.request.context === this) {
					this.wizard.nextPageButton.setInProgress(false);
					application.view.showErrorDialog(event.payload.payload);
				}
				break;
			case "SAVE_PROFILE_FAILED":
				if (event.payload.request.context === this) {
					this.wizard.nextPageButton.setInProgress(false);
					application.view.showErrorDialog(event.payload.payload);
				}
				break;
			default: // ignore other...
		}
    }
});
