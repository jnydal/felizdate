/**
 * Profile dialog window.
 */
var ProfileDialogWindow = new Class({
	Extends: DialogWindow,
    initialize: function(userSessionModel, profile) {
    	// set options
    	this.parent(false);
    	this.model = application.model;
    	this.optionModel = this.model.getOptionModel();
    	this.profile = profile;
    	this.userSessionModel = userSessionModel;
    	
    	// dialog specific
    	this.options.width = 'auto';
    	this.options.title = profile.text;
    	this.options.close = function() {
    		this.hide();
    	}.bind(this);
    	this.options.beforeClose = function() {
    		this.hide();
    		return false;
    	}.bind(this);
    	this.options.closeText = gettext("Close");
    	this.options.buttons = {};
    	this.options.buttons[gettext("Close")] = function() {
			this.hide();
		}.bind(this);
		this.setupDialog();
    	this.dialogHandle.parent().addClass("ProfileDialogWindow");
    	this.DEFAULT_IMAGE_WIDTH = 160;
    	this.DEFAULT_IMAGE_HEIGHT = 200;
    	this.statusIcon = new Element("span");
    	this.statusIcon.addClass("statusIcon");
    	this.setStatus(profile.status);
    	this.titleElement = jQuery(this.dialogHandle).parent().find('.ui-dialog-titlebar')[0];
    	this.statusIcon.inject(this.titleElement, 'top');
    	this.setHeaderText(gettext(this.profile.text));
    	
    	// content related
    	this.sectionContainer = new ComponentContainer();
    	this.sectionContainer.addCssClass("contentWrapper");
    	this.initGeneralLeftColumn();
    	this.initGeneralContent();
		this.generalInfo = new Element("div").addClass("generalInfo");
		this.generalInfo.adopt(this.leftElement);
		this.generalInfo.adopt(this.contentElement);
    	this.initAdvancedInfo();
    	this.initMedia();
    	this.visbileMessagesPanel = false;
    	
    	// setup menu
    	this.menuWrapper = new Element("div").addClass("menuWrapper");
    	this.messagesMenu = new DropDownMenu();
    	this.messagesMenu.setTogglable(true);
    	this.messagesOption = new MenuItem(gettext("Messages"), "messages");
    	this.messagesMenu.addMenuItem(this.messagesOption);
    	this.messagesMenu.handleSelect = function(item) {
			this.handleMenuOption(item);
		}.bind(this);
		
    	this.mainMenu = new DropDownMenu();
    	this.mainMenu.setSingleMode(true);
    	this.mainMenu.handleSelect = function(item) {
			this.handleMenuOption(item);
		}.bind(this);
    	
    	this.menu = new DropDownMenu();
		this.menu.handleSelect = function(item) {
			this.handleMenuOption(item);
		}.bind(this);
		
		this.generalOption = null;
		if (profile.gender === "M") {
			this.generalOption = new MenuItem(gettext("General"), "general male");
		} else {
			this.generalOption = new MenuItem(gettext("General"), "general female");
		}
		this.advancedOption = new MenuItem(gettext("Details"), "advanced");
		this.mediaOption = new MenuItem(gettext("Media"), "media");
		this.cheersOption = new MenuItem(gettext("Cheer!"), "cheers");
		this.blockOption = new MenuItem(gettext("Block"), "block");
		this.mainMenu.addMenuItem(this.generalOption);
		this.mainMenu.addMenuItem(this.advancedOption);
		this.mainMenu.addMenuItem(this.mediaOption);
		this.mainMenu.handleSelect = this.handleMenuOption.bind(this);
		//this.menu.addMenuItem(this.cheersOption);
		this.menu.addMenuItem(this.blockOption);
		this.mainMenu.renderTo(this.menuWrapper);
		this.menu.renderTo(this.menuWrapper);
		this.messagesMenu.renderTo(this.menuWrapper);
    	if (profile.blocked) {
    		this.blockOption.select();
    	}
    	
		// setup messages panel
		this.messagesPanel = new Element("div");
		this.messagesPanel.addClass("hidden");
		this.messagesPanel.addClass("messagesPanel");
		this.messagesContent = new Element("div");
		this.messagesContent.addClass("content");
		this.body.adopt(this.menuWrapper);
		// ie does not support fancy scrollable
		if (!Browser.ie && !Utilities.isPortable()) {
			this.messagesScroller = new Scrollable(this.messagesContent);
		} else {
			this.messagesContent.set("style", "overflow:hidden;overflow-y:auto");
		}
    	this.currentOption = this.generalOption;
		this.textArea = new Element("textarea");
		this.textArea.set("events", {
			"keydown": function(e) {
				if (e.code === 13 && this.textArea.value.trim() != "") {
					this.sendMessage(this.textArea.value);
				}
			}.bind(this),
			"keyup": function(e) {
				if (e.code === 13) {
					this.textArea.value = "";
				}
			}.bind(this)
		});
		this.sendButton = new SubmitButton();
		this.sendButton.handleClick = function() {
			if (this.textArea.value.trim() != "") {
				this.sendMessage(this.textArea.value);
				this.textArea.value = "";
			}
		}.bind(this);
		this.sendButton.setLabel(gettext("send"));
		this.messagesPanel.adopt(this.messagesContent);
		this.messagesPanel.adopt(this.textArea);
		this.sendButton.renderTo(this.messagesPanel);
		
		// init section container
		this.sectionContainer.add(this.generalInfo, this.generalOption);
		this.sectionContainer.add(this.advancedInfo, this.advancedOption);
		this.sectionContainer.add(this.mediaInfo, this.mediaOption);
		this.sectionContainer.renderTo(this.body);
		this.sectionContainer.addCssClass("full");
		
		// set general section as selected by default
		this.generalOption.setSelected(true);
		this.sectionContainer.showOnly(this.generalOption);
		this.body.adopt(this.messagesPanel);
		this.loadedGallery = false;
		// init media player
		this.initMediaPlayer();
    },
    initMediaPlayer: function() {
    	if (!this.loadedGallery) { // TODO: replace with MediaBrowser
    		var id = this.mediaInfo.getHtmlId();
    		var content = jQuery("#" + id);
            content.slidy();
            this.loadedGallery = true;
    	}
    },
    /**
     * general section
     * 
     */
    initGeneralLeftColumn: function() {
    	// structure
    	this.leftElement = new Element("div");
    	this.leftElement.addClass("leftColumn");
    	this.shortFactsElement = new Element("ul");
    	this.shortFactsElement.addClass("shortFacts");
    	
    	// data elements
    	this.imageElement = new Element("img");
    	//this.imageElement.set("width", this.DEFAULT_IMAGE_WIDTH + "px");
    	//this.imageElement.set("height", this.DEFAULT_IMAGE_HEIGHT + "px");
    	
    	if (this.model.getUserSessionModel().getUserProfile().getHasProfileImage() && this.profile.image) {
    		this.imageElement.set("src", this.profile.image);
    	} else {
    		this.imageElement.set("src", Utilities.getDefaultImageUrl(this.profile.gender));
    	}

    	// build short facts
    	this.initGeneralShortFacts()
    	
    	// insert
    	this.leftElement.adopt(this.imageElement);
    	this.leftElement.adopt(this.shortFactsElement);
    },
    initGeneralShortFacts: function() {
    	var gender = (this.profile.gender === "F") ? gettext("female") : gettext("male");
    	this.shortFactsElement.set("html", "<li><span>" + gettext("Gender") + "</span><span>" + gender + "</span></li>" +
    	"<li><span>" + gettext("Age") + "</span><span>" + (new Date().getFullYear() - this.profile.birthyear) + "</span>" +
    	"<li><span>" + gettext("Marital status") + "</span><span>" + gettext(this.optionModel.getMaritalStatusText(this.profile.maritalStatus)) + "</span>" +
    	"<li><span>" + gettext("Looking for") + "</span><span>" + this.getLookingForText() + "</span>");
    },
    getLookingForText: function() {
    	var result = "";
    	for (var i = 0; i<this.profile.lookingForTypes.length; i++) {
    		result += gettext(this.profile.lookingForTypes[i].text) + ", ";
    	}
    	return result.substr(0, result.length - 2);
    },
    initGeneralContent: function() {
    	this.contentElement = new Element("div");
    	this.contentElement.addClass("content");
    	var descriptionHeader = new Element("h3");
    	descriptionHeader.set("text", gettext("Description"));
    	this.descriptionElement = new Element("div");
    	this.descriptionElement.addClass("description");
    	this.interestsElement = new Element("div");
    	this.interestsElement.addClass("interests");
       	this.descriptionElement.set("text", this.profile.description);
       	this.initGeneralInterests(this.profile.interests);
       	this.contentElement.adopt(descriptionHeader);
       	this.contentElement.adopt(this.descriptionElement);
       	this.leftElement.adopt(this.interestsElement);
    },
    initGeneralInterests: function(interests) {
    	var interestHeader = new Element("h3");
    	interestHeader.set("text", gettext("Interests"));
    	this.interestsElement.adopt(interestHeader);
    	var interest;
    	for (var i = 0; i<interests.length; i++) {
    		interest = new Interest(this, interests[i].id, interests[i].text, "");
    		interest.renderTo(this.interestsElement);
    	}
    },
    /**
     * advanced section
     */
    initAdvancedInfo: function() {
    	this.advancedInfo = new Element("div");
    	this.advancedInfo.set("html", "<ul class=\"shortFacts\">" +
    	"<li class=\"header\">" + gettext("Basics") + "</li>" + 
    	"<li><span>" + gettext("Body") + "</span><span>" + gettext(this.profile.bodyType.text) + "</span></li>" +
    	"<li><span>" + gettext("Hair") + "</span><span>" + gettext(this.profile.hairType.text) + "</span></li>" +
    	"<li><span>" + gettext("Skin") + "</span><span>" + gettext(this.profile.skinType.text) + "</span></li>" + 
    	"<li><span>" + gettext("Eyes") + "</span><span>" + gettext(this.profile.eyeColor.text) + "</span></li>" +
    	"<li><span>" + gettext("Occupation") + "</span><span>" + gettext(this.profile.occupation.text) + "</span></li>" +
    	"<li><span>" + gettext("Educational degree") + "</span><span>" + gettext(this.profile.educationalDegree.text) + "</span></li>" +
		"<li><span>" + gettext("Political") + "</span><span>" + gettext(this.profile.political.text) + "</span></li>" +
		"<li><span>" + gettext("Religion") + "</span><span>" + gettext(this.profile.religion.text) + "</span></li>" +
		"<li class=\"header\">" + gettext("Partner preferences") + "</li>" + 
		"<li><span>" + gettext("Partner occupation") + "</span><span>" + gettext(this.optionModel.getOccupationText(this.profile.partnerOccupation)) + "</span></li>" +
		"<li><span>" + gettext("Partner educational degree") + "</span><span>" + gettext(this.optionModel.getEducationalDegreeText(this.profile.partnerEducationalDegree)) + "</span></li>" +
		"<li><span>" + gettext("Partner political") + "</span><span>" + gettext(this.optionModel.getPoliticalText(this.profile.partnerPolitical)) + "</span></li>" +
		"<li><span>" + gettext("Partner religion") + "</span><span>" + gettext(this.optionModel.getReligionText(this.profile.partnerReligion)) + "</span></li></ul>");
    	this.advancedInfo.addClass("advancedInfo");
    },
    /**
     * media section
     */
    initMedia: function() {
    	this.mediaInfo = new ComponentContainer();
    	this.mediaInfo.addCssClass("slidyContainer");
    	this.mediaInfo.addCssClass("mediaInfo");
    	var html = "";
    	for (var i = 0; i<this.profile.media.length; i++) {
    		if (i === 0) {
    			html += Utilities.getMediaWrapper(this.profile.media[i], true);
    		} else {
    			html += Utilities.getMediaWrapper(this.profile.media[i], false);"<figure><img src='" + this.profile.media[i] + "'></figure>";
    		}
    	}
    	this.mediaInfo.getHtmlElement().set("html", "<div class='slidySlides'>" + html + "</div>");
    },
    setStatus: function(profileStatus) {
    	switch (profileStatus) {
			case ProfileStatus.GEOONLINE:
				this.statusIcon.addClass("geoOnline");
				break;
			case ProfileStatus.ONLINE:
				this.statusIcon.addClass("online");
				break;
			case ProfileStatus.AWAY:
				this.statusIcon.addClass("away");
				break;
			case ProfileStatus.INVISIBLE:
				this.statusIcon.addClass("invisible");
				break;
				default:
		}
    },
    getProfile: function() {
    	return this.profile;
    },
    sendMessage: function(message) {
    	application.performAction(new ActionRequest("sendMessage", { fromProfileId: this.userSessionModel.userProfile.id, toProfileId: this.profile.id, message: message }));
    },
    loadConversation: function(messages) {
    	this.messagesContent.set("html", "");
    	var messageElement;
    	this.visbileMessagesPanel = true;
    	this.messagesPanel.removeClass("hidden");
    	for (var i = 0; i<messages.length; i++) {
    		this.addMessage(messages[i]);
    	}
    },
    refreshConversation: function() {
    	if (this.messagesMenu.isSelected(this.messagesOption)) {
			var request = new ActionRequest("getConversation", { profileId: this.profile.id }, function(conversation) {
	    		this.loadConversation(conversation);
	    		this.messagesContent.scrollTop = this.messagesContent.scrollHeight;
			}.bind(this));
			request.setInvalidateCurrent(true); // due to front end caching in nginx we need to force nocache.
			application.performAction(request);
    	}
    },
    addMessage: function(message) {
    	if (this.visbileMessagesPanel) {
    		var userProfile = this.userSessionModel.getUserProfile();
    		messageElement = new Element("div");
    		messageElement.addClass("message");
    		messageElement.set("html", "<span class=\"sender\">" + message.fromProfileName + "</span><span class=\"date\">" + Utilities.formatTime(message.timestamp) + "</span><span class=\"text\">" + Utilities.toStaticHTML(message.text) + "</span>");
    		this.messagesContent.adopt(messageElement);
    		this.messagesContent.scrollTop = this.messagesContent.scrollHeight;
    	} else {
    		application.performAction(new ActionRequest("getConversation", { profileId: this.profile.id }, function(conversation) {
	    		this.loadConversation(conversation);
	    		this.messagesContent.scrollTop = this.messagesContent.scrollHeight;
    		}.bind(this)));
    	}
    },
    handleMenuOption: function(menuOption) {
    	if (menuOption === this.messagesOption) {
    		var request = new ActionRequest("getConversation", { profileId: this.profile.id }, function(conversation) {
	    		this.loadConversation(conversation);
	    		this.messagesContent.scrollTop = this.messagesContent.scrollHeight;
    		}.bind(this));
    		request.setInvalidateCurrent(true);
    		application.performAction(request);
    		this.generalInfo.addClass("mobileHidden");
    		this.advancedInfo.addClass("mobileHidden");
    		this.mediaInfo.addCssClass("mobileHidden");
    		this.sectionContainer.removeCssClass("full");
    	} else if (typeOf(menuOption) === "null") {
    		this.generalInfo.removeClass("mobileHidden");
    		this.advancedInfo.removeClass("mobileHidden");
    		this.mediaInfo.removeCssClass("mobileHidden");
    		this.messagesPanel.addClass("hidden");
    		this.sectionContainer.addCssClass("full");
    	} else if (menuOption === this.blockOption) {
    		var request = new ActionRequest("toggleBlock", { profileId: this.profile.id }, function(response) {
    			if (response.blocked) {
    				this.blockOption.select();
    			} else {
    				this.blockOption.unSelect();
    			}
    		}.bind(this));
    		request.setMethod("POST");
    		application.performAction(request);
    	} else {
    		this.sectionContainer.showOnly(menuOption);
    	}
    },
    destroy: function() {
    	if (typeOf(this.messagesScroller) !== "null") {
    		this.messagesScroller.terminate();
    	}
    	this.parent();
    },
    close: function() {
    	this.parent();
    },
    handleInternalClose: function() {
    	this.hide();
    }
});