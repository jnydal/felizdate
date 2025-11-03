var StatusMenu = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["StatusMenu"]);
    },
    initialize: function() {
    	this.parent();
        this.statusMenu = new DropDownMenu();
        this.statusMenu.handleSelect = this.handleMenuOption.bind(this);
        this.statusSubMenu = new SubMenu("");
        this.statusMenu.addMenuItem(this.statusSubMenu);
        this.profileStatus = null;
        
        // define statuses & add to menu
        if (Utilities.isOnGeoAcceptableDevice()) {
        	this.geoOnlineOption = new MenuItem(gettext("GeoOnline"), "statusGeoonline");
        	this.statusSubMenu.addMenuItem(this.geoOnlineOption);
        }
        this.onlineOption = new MenuItem(gettext("Online"), "statusOnline");
        this.awayOption = new MenuItem(gettext("Away"), "statusAway");
        this.invisibleOption = new MenuItem(gettext("Invisible"), "statusInvisible");
        this.statusSubMenu.addMenuItem(this.onlineOption);
        this.statusSubMenu.addMenuItem(this.awayOption);
        this.statusSubMenu.addMenuItem(this.invisibleOption);
        this.statusMenu.renderTo(this.getHtmlElement());
    },
    setStatus: function(profileStatus) {
    	this.statusSubMenu.removeClasses();
    	switch (profileStatus) {
    		case ProfileStatus.GEOONLINE:
    			this.statusSubMenu.addImageClass("statusGeoonline");
    	    	this.statusSubMenu.setLabel(gettext("GeoOnline"));
    			break;
    		case ProfileStatus.ONLINE:
    			this.statusSubMenu.addImageClass("statusOnline");
    			this.statusSubMenu.setLabel(gettext("Online"));
    			break;
    		case ProfileStatus.AWAY:
    			this.statusSubMenu.addImageClass("statusAway");
    			this.statusSubMenu.setLabel(gettext("Away"));
    			break;
    		case ProfileStatus.INVISIBLE:
    			this.statusSubMenu.addImageClass("statusInvisible");
    			this.statusSubMenu.setLabel(gettext("Invisible"));
    			break;
    			default:
    	}
    	this.profileStatus = profileStatus;
    },
    handleMenuOption: function(option) {
    	switch (option) {
    		case this.geoOnlineOption:
    			application.performAction(new ActionRequest("setStatus", { status: ProfileStatus.GEOONLINE }));
    			break;
    		case this.onlineOption:
    			application.performAction(new ActionRequest("setStatus", { status: ProfileStatus.ONLINE }));
    			break;
    		case this.awayOption:
    			application.performAction(new ActionRequest("setStatus", { status: ProfileStatus.AWAY }));
    			break;
    		case this.invisibleOption:
    			application.performAction(new ActionRequest("setStatus", { status: ProfileStatus.INVISIBLE }));
    			break;
    			default:
    	}
    },
	closeAll: function() {
		this.statusMenu.closeAll();
	}
});
