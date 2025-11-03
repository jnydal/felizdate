var MediaManager = new Class({
    Extends: ComponentContainer,
    getClassHierarchy: function() {
        return this.parent().append(["MediaManager"]);
    },
    initialize: function(model) {
    	this.userSessionModel = model.getUserSessionModel();
    	this.optionModel = model.getOptionModel();
    	this.userSessionModel.addObserver(this);
        model.addObserver(this);
    	this.parent();
    	
    	// create upload related components
        this.uploadMediaField = new UploadField(gettext("Upload"), "media");
    	this.uploadMediaField.setHelpText(gettext("Supports PNG, GIF, JPG, MP4 and OGG (max 10mb)"));
        this.uploadForm = new UploadForm(this.uploadMediaField);
        this.uploadForm.setAction("uploadMedia");
        this.uploadForm.setSourceName(this.getClassName());
        this.uploadForm.handleSubmit = function() {
        	application.controller.submitForm(this);
        };
        
        // create browser
    	this.mediabrowser = new MediaBrowser(model);
    	this.deleteButton = new SubmitButton(gettext("Delete"));
    	this.deleteButton.addCssClass("deleteButton");
    	this.deleteButton.handleClick = function() {
    		application.performAction(new ActionRequest("deleteMedia", { mediaId : this.mediabrowser.getSelectedId() }));
    	}.bind(this);
    	this.addComponent(this.uploadForm);
    	this.addComponent(this.mediabrowser);
    	this.addComponent(this.deleteButton);
    },
    refresh: function() {
    	this.mediabrowser.refresh();
    },
	handleModelEvent: function(event) {
	    if (!instanceOf(event, ModelEvent)) {
	        throw new Exception("event parameter is not a ModelEvent instance.");
	    }
	    switch (event.getType()) {
	    	case "MEDIA_DELETED":
	    		this.mediabrowser.deleteMedia(event.payload);
	    		break;
	    	case "MEDIA_UPLOADED":
	    		this.mediabrowser.addMedia(event.payload);
	    		break;
	    	case "OPTIONS_LOADED":
	    		break;
	    	case "INTEREST_SAVED":
	    		break;
	        case "LOGIN":
				break;
	        case "LOGOUT":
	            break;
	            default:
	    }
	},
	loadProfile: function(user, type) {
		
	}
});
