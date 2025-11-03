var PageNavigator = new Class({
    Extends: ComponentContainer,
    getClassHierarchy: function() {
        return this.parent().append(["PageNavigator"]);
    },
    initialize: function() {
        this.parent();
		this.background = new Element("div").addClass("bg");
		this.getHtmlElement().adopt(this.background);
		this.openPage = null;
    },
	addPage: function(page) {
		this.addComponent(page);
		page.hide();
	},
	showPage: function(page) {
		if (typeOf(this.openPage) !== "null") {
			this.openPage.hide();
		}
		for (pagekey in this.units) {
			if (this.units[pagekey] === page) {
				page.show();
				this.openPage = page;
			}
		}
	},
	showFirstPage: function() {
		if (instanceOf(this.units[0], Page)) {
			var first = this.getFirst(); 
			first.show();
			this.openPage = first; 
		}
	},
	hideAllPages: function() {
		if (typeOf(this.openPage) !== "null") {
			this.openPage.hide();
		}
	}
});
