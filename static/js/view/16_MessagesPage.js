var MessagesPage = new Class({
    Extends: Page,
    getClassHierarchy: function() {
        return this.parent().append(["MessagesPage"]);
    },
    initialize: function(model) {
        this.parent();
        model.getUserSessionModel().addObserver(this);
        this.header = new Element("div");
        this.content = new Element("ul");
        this.header.addClass("header");
        this.content.addClass("content");
        this.messages = [];
        /*this.newMessageButton = new SubmitButton();
        this.newMessageButton.addCssClass("searchButton");
        this.newMessageButton.setLabel(gettext("New message"));
        this.newMessageButton.renderTo(this.header);*/
        this.initSearchField();
        this.getHtmlElement().adopt(this.header);
        this.getHtmlElement().adopt(this.content);
    },
    initSearchField: function() {
    	this.searchForm = new Form(true, "searchMessagesForm");
        this.searchField = new InputField();
        this.searchForm.addField(this.searchField);
        this.searchForm.setSubmitButtonLabel(gettext("search"));
        this.searchForm.hideGeneralErrorMessageField();
        this.searchForm.renderTo(this.header);
        this.searchForm.hideHeader();
        this.searchForm.setInProgress(false);
    },
    removeMessages: function() {
    	for (var i = this.messages.length - 1; i>=0; i--) {
    		this.messages[i].unrender();
    		this.messages.erase(this.messages[i]);
    	}
    },
    addMessage: function(messageJson) {
    	var message = new Message(messageJson.microImageUrl, messageJson.text, messageJson.timestamp, messageJson.fromProfileName, messageJson.gender, messageJson.fromProfileId);
    	this.messages.push(message);
    	message.setParentComponent(this);
    	message.renderTo(this.content);
    },
    handleOpenMessage: function(message) {
    	this.parentComponent.handleShowProfileDetails(message.getSenderId());
    },
    handleModelEvent: function(event) {
    	switch (event.getType()) {
    		case "MESSAGES_LOADED":
    			this.removeMessages();
    			for (var i = 0; i<event.payload.length; i++) {
    				this.addMessage(event.payload[i]);
    			}
    			break;
    	}
    },
    reset: function() {
    	this.removeMessages();
    }
});

var Message = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Message"]);
    },
    initialize: function(imageUrl, text, timestamp, from, gender, senderId) {
    	this.parent();
    	this.anchor = new Element("a");
    	this.anchor.set("events", {"mousedown": function(e) {
    		e.preventDefault();
    		this.parentComponent.handleOpenMessage(this);
    	}.bind(this)});
    	this.senderId = senderId;
    	this.image = new Element("img");
    	this.sender = new Element("span");
    	this.text = new Element("span");
    	this.timestamp = new Element("span");
    	this.timestamp.addClass("timestamp");
    	this.sender.set("text", from);
    	this.sender.addClass("sender");
    	if (imageUrl === "") {
    		imageUrl = Utilities.getDefaultMicroImageUrl(gender);
    	}
    	this.image.set("src", imageUrl);
    	this.image.set("width", "25px");
    	this.image.set("height", "32px");
    	this.text.set("text", Utilities.getTruncated(text, 100));
    	this.text.addClass("text");
    	this.timestamp.set("text", Utilities.formatTime(timestamp));
    	this.anchor.adopt(this.image);
    	this.anchor.adopt(this.sender);
    	this.anchor.adopt(this.text);
    	this.anchor.adopt(this.timestamp);
    	this.getHtmlElement().adopt(this.anchor);
    },
    getSenderId: function() {
    	return this.senderId;
    },
	getRootElementTypeName: function() {
        return "li";
    }
});
