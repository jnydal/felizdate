var DropDownMenu = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["DropDownMenu"]);
    },
    initialize: function(htmlId) {
		this.parent(htmlId);
        this.items = [];
        this.open = false;
        this.selected = null;
    },
    isSelected: function(option) {
    	return option === this.selected;
    },
    setTogglable: function(flag) {
    	this.togglable = flag;
    },
    setSingleMode: function(flag) {
    	this.singlemode = flag;
    },
	getRootElementTypeName: function() {
        return "ul";
    },
	addMenuItem: function(menuItem) {
        if (!instanceOf(menuItem, MenuItem)) {
			throw new Exception("menuItem parameter is not a MenuItem instance.");
		}
		this.items.push(menuItem);
		menuItem.setParentComponent(this);
		menuItem.renderTo(this.getHtmlElement());
    },
    handleInternalSelect: function(menuItem) {
    	if (this.open === true) {
    		for (var i = 0; i<this.items.length; i++) {
        		if (typeOf(this.items[i].close) === "function") {
        			this.items[i].close();
        		}
        	}
    		this.open = false;
    	}
    	if (this.togglable) {
	    	if (typeOf(this.selected) === "null") {
	    		// case firsttime/nothing is selected
	    		menuItem.select();
	    		this.selected = menuItem;
	    		this.handleSelect(menuItem);
	    	} else if (menuItem === this.selected) {
				// case deselect
				this.selected.unSelect();
				this.selected = null;
				this.handleSelect();
			} else {
				// case other is selected
				this.selected.unSelect();
				menuItem.select();
		    	this.selected = menuItem;
		    	this.handleSelect(menuItem);
			}
    	} else if (this.singlemode) {
	    	if (typeOf(this.selected) !== "null") {
	    		// case firsttime/nothing is selected
	    		this.selected.unSelect();
	    	}
	    	this.selected = menuItem;
	    	menuItem.select();
	    	this.handleSelect(menuItem);
    	} else {
    		this.handleSelect(menuItem);
    	}
    },
	handleSelect: function(menuItem) {
		// to be overridden
	},
	closeAll: function() {
		if (this.open === true) {
    		for (var i = 0; i<this.items.length; i++) {
        		if (typeOf(this.items[i].close) === "function") {
        			this.items[i].close();
        		}
        	}
    		this.open = false;
    	}
	}
});

var MenuItem = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["MenuItem"]);
    },
    initialize: function(label, imageClass) {
	    if (typeOf(label) !== "string") {
            throw new Exception("label parameter is not a string.");
        }
		this.parent();
		this.enabled = true;
		this.parentComponent;
		this.label = label;
		this.addCssClass("full");
		this.icon = new Element("span");
		this.icon.addClass("icon");
		this.text = new Element("span");
		this.text.addClass("text");
		this.overlay = new Element("div");
		this.overlay.addClass("overlay");
		this.anchor = new Element("a");
		this.anchor.adopt(this.icon);
		this.anchor.adopt(this.text);
		this.getHtmlElement().adopt(this.overlay);
        this.getHtmlElement().adopt(this.anchor);
		this.text.set("text", label);
		var events = {};
		events[Utilities.getMainEventName()] = function(e) {
			e.preventDefault();
			this.handleInternalSelect(this);
		}.bind(this);
		this.anchor.set("events", events);
		if (typeOf(imageClass) === "string") {
			this.addImageClass(imageClass);
		}
    },
    unSelect: function() {
    	this.removeCssClass("selected");
    },
    select: function() {
    	this.addCssClass("selected");
    },
    enable: function() {
    	this.enabled = true;
    	this.removeCssClass("disabled");
    },
    disable: function() {
    	this.enabled = false;
    	this.addCssClass("disabled");
    },
    addImageClass: function(imageClass) {
    	this.getHtmlElement().addClass(imageClass);
    },
    setLabel: function(text) {
    	this.label = text;
    	this.text.set("text", text);
    },
    setHandleMousedown: function(handler) {
    	if (typeOf(handler) !== "function") {
    		throw new Exception("handler is not a function.");
    	}
    	var events = {};
    	events[Utilities.getMainEventName()] = function(e) {
    		e.preventDefault();
    		handler(this);
		}.bind(this);
    	this.anchor.set("events", events);
    },
	setParentComponent: function(component) {
		if (!instanceOf(component, Component)) {
			throw new Exception("component parameter is not a Component instance.");
		}
		this.parentComponent = component;
	},
	setSimpleMode: function(flag) {
		if (flag) {
			this.removeCssClass("full");
		} else {
			this.addCssClass("full");
		}
	},
	handleInternalSelect: function() {
		if (this.enabled) {
			this.parentComponent.handleInternalSelect(this);
		}
	},
	getRootElementTypeName: function() {
        return "li";
    },
    setSelected: function(flag) {
    	if (flag) {
    		this.handleInternalSelect(this);
    	} else {
    		//
    	}
    }
});

var SubMenu = new Class({
    Extends: MenuItem,
    getClassHierarchy: function() {
        return this.parent().append(["SubMenu"]);
    },
    initialize: function(label, imageClass) {
		this.parent(label, imageClass);
		this.subMenu = new Element("<ul></ul>");
		this.getHtmlElement().adopt(this.subMenu);
		this.items = [];
		this.visible = false;
		this.subMenu.addClass("hidden");
    },
    addMenuItem: function(menuItem) {
        if (!instanceOf(menuItem, MenuItem)) {
            throw new Exception("menuItem parameter is not a MenuItem instance.");
        }
		this.items.push(menuItem);
		menuItem.setParentComponent(this.parentComponent);
		menuItem.renderTo(this.getHtmlElement().getElement("ul"));
    },
    close: function() {
    	if (this.visible) {
			this.subMenu.addClass("hidden");
			this.visible = false;
		}
    },
	handleInternalSelect: function(subMenu) {
		if (this.enabled) {
			if (this.visible) {
				this.subMenu.addClass("hidden");
				this.visible = false;
				this.parentComponent.open = false;
			} else {
				this.subMenu.removeClass("hidden");
				this.visible = true;
				this.parentComponent.handleInternalSelect(subMenu);
				this.parentComponent.open = true;
			}
		}
	}
});

var NotificationSubMenu = new Class({
    Extends: SubMenu,
    getClassHierarchy: function() {
        return this.parent().append(["NotificationSubMenu"]);
    },
    initialize: function(label, imageClass) {
		this.parent(label, imageClass);
		this.countElement = new Element("div");
		this.countElement.addClass("count");
		this.countElement.addClass("hidden");
		this.notifications = {};
		this.getHtmlElement().adopt(this.countElement);
		this.count = null;
		this.addCssClass("SubMenu");
    },
    addNotification: function(id) {
    	if (!this.notifications[id]) {
    		this.notifications[id] = true;
        	if (typeOf(this.count) === "null") {
        		this.count = 1;
        	} else {
        		this.count++;
        	}
    	}
    	this.countElement.removeClass("hidden");
    	this.countElement.set("html", this.count);
    },
    removeNotifications: function() {
    	this.notifications = {};
    	this.countElement.addClass("hidden");
    	this.countElement.erase("html");
    	this.count = null;
    }
});

var MessageMenuItem = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["MessageMenuItem"]);
    },
    initialize: function(imageUrl, text, gender, fromProfileName, senderId) {
    	this.parent();
    	if (imageUrl === "") {
    		imageUrl = Utilities.getDefaultMicroImageUrl(gender);
    	}
    	this.imageElement = new Element("img"); 
    	this.imageElement.set("src", imageUrl);
    	this.imageElement.set("width", "25px");
    	this.imageElement.set("height", "32px");
    	this.senderId = senderId;
    	this.sender = new Element("span");
    	this.sender.addClass("sender");
    	this.sender.set("text", fromProfileName);
		this.text = new Element("span");
		this.text.addClass("text");
		this.text.set("text", text);
    	this.getHtmlElement().adopt(this.imageElement);
    	this.getHtmlElement().adopt(this.sender);
    	this.getHtmlElement().adopt(this.text);
		var events = {};
		events[Utilities.getMainEventName()] = function(e) {
    		e.preventDefault();
    		this.handleInternalSelect(this);
		}.bind(this);
    	this.getHtmlElement().set("events", events);
    },
	getRootElementTypeName: function() {
        return "a";
    },
    getSenderId: function() {
    	return this.senderId;
    },
	setParentComponent: function(component) {
		if (!instanceOf(component, Component)) {
			throw new Exception("component parameter is not a Component instance.");
		}
		this.parentComponent = component;
	},
    handleInternalSelect: function(messageMenuItem) {
		this.parentComponent.closeAll();
    	this.handleSelect(messageMenuItem.getSenderId());
    },
    handleSelect: function(senderId) {
    	// override
    }
});

var MessagesSubMenu = new Class({
    Extends: NotificationSubMenu,
    getClassHierarchy: function() {
        return this.parent().append(["MessagesSubMenu"]);
    },
    initialize: function(parentComponent) {
    	this.setParentComponent(parentComponent);
		this.parent(gettext("Messages"));
		this.latestMessagesElement = new Element("li");
		this.latestMessagesElement.addClass("hidden");
		this.latestMessagesElement.addClass("latestMessages");
		this.allMessagesOption = new MenuItem(gettext("View all messages"));
		this.allMessagesOption.setHandleMousedown(function() {
			this.handleShowAllMessages();
		}.bind(this));
		this.subMenu.adopt(this.latestMessagesElement);
		this.addMenuItem(this.allMessagesOption);
		this.messages = [];
		this.addCssClass("NotificationSubMenu");
    },
    addMessage: function(message) {
    	if (!instanceOf(message, MessageMenuItem)) {
    		throw new Exception("message parameter is not a MessageMenuItem instance.");
    	}
    	this.messages.push(message);
    	this.latestMessagesElement.removeClass("hidden");
    	message.renderTo(this.latestMessagesElement);
    },
    removeLatestMessages: function() {
    	for (var i = this.messages.length - 1; i>=0; i--) {
    		this.messages[i].unrender();
    		this.messages.erase(this.messages[i]);
    	}
    	this.latestMessagesElement.addClass("hidden");
    },
	handleInternalSelect: function(messagesSubMenu) {
		this.parent(messagesSubMenu);
		this.removeNotifications();
		this.removeLatestMessages();
	},
	handleShowAllMessages: function() {
		// override
	}
});
