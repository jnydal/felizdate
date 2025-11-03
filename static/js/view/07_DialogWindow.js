/**
 * Dialog window base class.
 * 
 * Requires jQuery UI
 */
var DialogWindow = new Class({
	initialize: function(noInit) {
	    this.options = {
	    	dialogClass: 'DialogWindow',
	    	resizable: false,
	    	close: function() {
	    		this.destroy()
	    	}.bind(this),
	    	open: function(event, ui) {
	    		this.ready();
	    	}.bind(this),
	    	focus: function() {
	    		this.focus();
	    	}.bind(this),
	    	closeText: gettext("Ok")
	    };
    	this.options.buttons = {};
    	this.options.buttons[gettext("Ok")] = function() {
			this.destroy();
		}.bind(this);
		noInit = noInit || false;
		this.body = new Element("div");
        this.hidden = false;
    	if (!noInit) {
			this.setupDialog();
    	}
    },
    ready: function() {
    	// override
    },
    focus: function() {
    	// override    	
    },
    destroy: function() {
    	jQuery(this.dialogHandle).dialog("destroy");
		jQuery(this.dialogHandle).remove();
		this.destroyed = true;
    },
    setupDialog: function() {
    	this.dialogHandle = jQuery(this.body).dialog(this.options);
    },
    setMessage: function(message) {
    	if (typeOf(message) !== "string" ) {
    		throw new Exception("message parameter is not a string.");
    	}
    	this.body.set("text", message);
    },
    setHeaderText:function(headerText) {
    	if (typeOf(headerText) !== "string" ) {
    		throw new Exception("headerText parameter is not a string.");
    	}
    	jQuery(this.dialogHandle).dialog("option", "title", headerText);
    },
    setSize: function(width, height) {
    	//this.getHtmlElement().setStyles({'height': height+'px','width': width+'px'});
    },
    setCloseHandler: function(handler) {
    	if (typeOf(handler) !== "function" ) {
    		throw new Exception("handler parameter is not a function.");
    	}
    	//this.handleClose = handler;
    },
    handleInternalClose: function() {
    	//this.unrender();
    },
    handleClose: function() {
    	// this one is meant to be overridden
    },
    show: function() {
    	//this.removeCssClass("hidden");
    	this.hidden = false;
    	jQuery(this.dialogHandle).parent().show();
    },
    hide: function() {
    	//this.addCssClass("hidden");
    	this.hidden = true;
    	jQuery(this.dialogHandle).parent().hide();
    },
    close: function() {
    	this.destroy();
    },
    isHidden: function() {
    	return this.hidden;
    }
});

/**
 * Crop dialog window.
 * 
 * jCrop implementation.
 */
var CropDialogWindow = new Class({
	Extends: DialogWindow,
	IMG_ID: "imageToBeCropped",
    initialize: function() {
    	this.parent(false);
    	this.options.width = 'auto';
    	this.options.closeText = gettext("Close");
    	this.options.buttons = {};
    	this.options.buttons[gettext("Close")] = function() {
			this.hide();
		}.bind(this);
    	this.options.buttons[gettext("Crop")] = function() {
    		this.handleCrop({
    			x: parseInt(this.currentCoordinates.x),
    			y: parseInt(this.currentCoordinates.y),
    			w: parseInt(this.currentCoordinates.w),
    			h: parseInt(this.currentCoordinates.h)
    		});
		}.bind(this);
		this.setupDialog();
    	this.dialogHandle.parent().addClass("CropDialogWindow");
    	this.currentCoordinates = {
    		x: 0,
    		y: 0,
    		w: 0,
    		h: 0
    	};
    	this.cropperElement = new Element("img");
    	this.cropperElement.set("id", this.IMG_ID);
    	this.body.adopt(this.cropperElement);
    },
    load: function(image) {
    	var self = this;
    	this.cropperElement.set('src', image.src);

    	// init cropper
    	if (typeOf(this.cropper) === "null") {
			this.cropper = jQuery("#" + this.IMG_ID).Jcrop({
				aspectRatio	:	0.8,
				setSelect	:	[0, 0, 389, 485],
				bgOpacity	:	0.6,
				bgColor		:	'black',
				onSelect	:	self.setCoordinates.bind(self)
			});
    	}
    	this.show();
    },
    setCoordinates: function(coordinates) {
    	this.currentCoordinates.x = coordinates.x;
    	this.currentCoordinates.y = coordinates.y;
    	this.currentCoordinates.w = coordinates.w;
    	this.currentCoordinates.h = coordinates.h
    },
    getCoordinates: function() {
    	return this.currentCoordinates;
    },
    hide: function() {
    	jQuery(this.dialogHandle).dialog("close");
    },
    show: function() {
    	jQuery(this.dialogHandle).dialog("open");
    },
    handleCrop: function(coordinates) {
    	// override
    }
});

/**
 * Information dialog window.
 */
var InfoDialogWindow = new Class({
	Extends: DialogWindow,
    getClassHierarchy: function() {
        return this.parent().append(["InfoDialogWindow"]);
    },
    initialize: function() {
    	this.parent();
    	this.header.set("html", gettext("popup.info.header.title"));
    	
        this.closeButton = new SubmitButton();
    	this.closeButton.setLabel(gettext("common.close"));
    	this.closeButton.addCssClass("dialogWindowCloseButton");
    	this.closeButton.handleButtonPressed = this.handleInternalClose.bind(this);
    	this.closeButton.renderTo(this.footerButtonsDiv);
    },
    setButtonLabel: function(label){
    	if (typeOf(label) !== "string" ) {
    		throw new Exception("Button label parameter is not a string.");
    	}
    	this.closeButton.setLabel(label);
    }
    
});

/**
 * User input dialog window
 */
var InputDialogWindow = new Class({
	Extends: DialogWindow,
    getClassHierarchy: function() {
        return this.parent().append(["InputDialogWindow"]);
    },
    initialize: function(){
    	this.parent();

    	this.promptMessage = new TextLabel();
    	this.promptMessage.renderTo(this.body);
    	
    	this.inputWrapper = new Element("div");
    	this.inputWrapper.addClass("dialogElement");
    	this.inputField = new Element('input', {"id": "dialogInput", "type": "text" ,"class": "dialogWindowInput"});
    	this.inputField.set("events", {"keydown": function(event){
    		if (event.key == 'enter') {
    			var input = this.inputField.get("value");
        		if (this.validateInput(input)) {
        			this.submitHandler(input);
        			this.handleInternalClose();
        		}
    		}
    	}.bind(this)});
    	this.inputField.inject(this.inputWrapper);
    	this.inputWrapper.inject(this.body);
    	
    	this.doneButton = new Element('div', {"class": "SubmitButton actionButton"});
    	this.doneButton.set("html", '<a href="#"><span class="left"></span><span class="center"></span><span class="right"></span></a>');
    	this.doneButton.set("events", {"click": function() {
    		var input = this.inputField.get("value");
    		if (this.validateInput(input)) {
    			this.submitHandler(input);
    			this.handleInternalClose();
    		}
        }.bind(this)});
    	this.doneButton.getElement(".center").set("text", gettext("common.done"));
    	this.doneButton.inject(this.footerButtonsDiv);
    	
    	this.cancelButton = new SubmitButton();
    	this.cancelButton.setLabel(gettext("common.cancel"));
    	this.cancelButton.addCssClass("dialogWindowCloseButton");
    	this.cancelButton.handleButtonPressed = this.handleInternalClose.bind(this);
    	this.cancelButton.renderTo(this.footerButtonsDiv);
    },
    validateInput: function(input) {
		if (typeOf(input) !== "null" && input !== "") {
			return true;
		}
		return false;
    },
    setPromptMessage: function(promptMessage) {
    	if (typeOf(promptMessage) !== "string" ) {
    		throw new Exception("promptMessage parameter is not a string.");
    	}
    	this.promptMessage.setText(promptMessage);
    },
    setSubmitHandler: function(submitFunction) {
    	if (typeOf(submitFunction) !== "function" ) {
    		throw new Exception("submitFunction parameter is not a function.");
    	}
    	this.submitHandler = submitFunction;
    },
    setCancelButtonLabel: function(buttonLabel){
    	if (typeOf(buttonLabel) !== "string" ) {
    		throw new Exception("Button label parameter is not a string.");
    	}
    	this.cancelButton.setLabel(buttonLabel);
    },
    setDoneButtonLabel: function(buttonLabel){
    	if (typeOf(buttonLabel) !== "string" ) {
    		throw new Exception("Button label parameter is not a string.");
    	}
    	this.doneButton.getElement(".center").set("text", buttonLabel);
    },
    setDefaultValue : function(defaultValue){
    	if (typeOf(defaultValue) !== "string" ) {
    		throw new Exception("defaultValue parameter is not a string.");
    	}
    	this.inputField.set('value', defaultValue);
    },
    setFocus : function(){
    	this.inputField.fireEvent('focus').focus();
    },
    hideInputField: function(){
    	this.inputWrapper.set('class','hidden');
    },
    submitHandler: function(inputValue) {
    	// this one is meant to be overridden
    }
});

/**
 * Confirmation dialog window.
 */
var ConfirmDialogWindow = new Class ({
	Extends: DialogWindow,
    getClassHierarchy: function() {
        return this.parent().append(["ConfirmDialogWindow"]);
    },
    initialize: function() {
    	this.parent();
    	this.confirmButton = new SubmitButton();
    	this.confirmButton.setLabel(gettext("common.ok"));
    	this.confirmButton.addCssClass("dialogWindowCloseButton");
    	this.confirmButton.handleButtonPressed = function() { this.confirmHandler(); this.handleInternalClose(); }.bind(this);
    	this.confirmButton.renderTo(this.footerButtonsDiv);
    	
    	this.cancelButton = new SubmitButton();
    	this.cancelButton.setLabel(gettext("common.cancel"));
    	this.cancelButton.addCssClass("dialogWindowCloseButton");
    	this.cancelButton.handleButtonPressed = this.handleInternalClose.bind(this);
    	this.cancelButton.renderTo(this.footerButtonsDiv);
    },
    setConfirmButtonLabel: function(buttonLabel) {
    	if (typeOf(buttonLabel) !== "string" ) {
    		throw new Exception("buttonLabel parameter is not a string.");
    	}
    	this.confirmButton.setLabel(confirmTxt);
    },
    setConfirmHandler: function(confirmFunction) {
    	if (typeOf(confirmFunction) !== "function" ) {
    		throw new Exception("confirmFunction parameter is not a function.");
    	}
    	this.confirmHandler = confirmFunction;
    },
    setCancelButtonLabel: function(buttonLabel){
    	if (typeOf(buttonLabel) !== "string" ) {
    		throw new Exception("Button label parameter is not a string.");
    	}
    	this.cancelButton.setLabel(buttonLabel);
    },
    confirmHandler: function() {
    	// this one is meant to be overridden
    }
});

/**
 * Error dialog window.
 */
var ErrorDialogWindow = new Class({
	Extends: DialogWindow,
    initialize: function(text) {
    	this.parent();
    	this.setHeaderText(gettext("Error"));
    	if (text) {
    		this.setMessage(text);
    	}
    }
});
