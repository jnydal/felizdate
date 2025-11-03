var PageNumber = {
	FIRST: 0,
	SECOND: 1,
	THIRD: 2
};

/**
 * Is dependent on jValidate plugin.
 */
var Wizard = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Wizard"]);
    },
    initialize: function() {
        this.parent();
		this.currentPage = null;
		this.currentPageNo = null;
		this.previousPageButton = new SubmitButton(gettext("Previous"));
		this.nextPageButton = new SubmitButton(gettext("Next"));
		this.previousPageButton.addCssClass("previousButton");
		this.nextPageButton.addCssClass("nextButton");
		this.pages = [];
		this.getHtmlElement().set('html', '<ul class="status"></ul><div class="items"></div><div class="footer"></div>');
		this.previousPageButton.renderTo(this.getHtmlElement().getElement(".footer"));
		this.nextPageButton.renderTo(this.getHtmlElement().getElement(".footer"));
		this.previousPageButton.handleClick = function() {
			this.handlePreviousPageButtonClick();
		}.bind(this)
		this.nextPageButton.handleClick = function() {
			this.nextPage();
		}.bind(this)
		this.previousPageButton.addCssClass("hidden");
    },
    getCurrentPage: function() {
    	return this.currentPage;
    },
    currentPageIsValid: function() {
    	// use some third party validation here
    	return jQuery(this.currentPage.getHtmlElement()).jvalidate();
    },
	addPage: function(wizardPage) {
		if (!instanceOf(wizardPage, WizardPage)) {
			throw new Exception("wizardPage parameter is not a WizardPage instance.");
		}
		this.pages.push(wizardPage);
		wizardPage.handleNextPageRequest = this.nextPage.bind(this)
		wizardPage.addCssClass("hidden");
		wizardPage.renderTo(this.getHtmlElement().getElement(".items"));
		this.getHtmlElement().getElement(".status").adopt(wizardPage.getStatusElement());
		this.showPageNo(PageNumber.FIRST);
	},
	onLastPage: function() {
		if (this.currentPageNo === this.pages.length - 1) {
			return true;
		}
		return false;
	},
	goToWizardPage: function(wizardPage) {
		if (!instanceOf(wizardPage, WizardPage)) {
			throw new Exception("wizardPage parameter is not a WizardPage instance.");
		}
		for (var i = 0; i<this.pages.length; i++) {
			if (this.pages[i] === wizardPage) {
				this.showPageNo(i);
			}
		}
		if (this.onLastPage()) {
			this.nextPageButton.addCssClass("hidden");
		}
	},
	showPageNo: function(pageNo) {
		if (typeOf(this.currentPage) !== "null") {
			this.currentPage.addCssClass("hidden");
			this.currentPage.getStatusElement().removeClass("active");
		}
		if (typeOf(this.pages[pageNo]) !== "null") {
			this.pages[pageNo].removeCssClass("hidden");
			this.pages[pageNo].getStatusElement().addClass("active");
			this.currentPage = this.pages[pageNo]; 
			this.currentPageNo = pageNo;
		}
	},
	nextPage: function() {
		if (this.currentPageIsValid()) {
			this.handleNextPageButtonClick();
		}
	},
	previousPage: function() {
		if (typeOf(this.pages[this.currentPageNo - 1]) !== "null") {
			this.showPageNo(this.currentPageNo--);
		}
	},
	lockButtons: function() {
		this.previousPageButton.disable();
		this.nextPageButton.disable();
	},
	unLockButtons: function() {
		this.previousPageButton.enable();
		this.nextPageButton.enable();
	},
	handleNextPageButtonClick: function() {
		// override
	},
	handlePreviousPageButtonClick: function() {
		// override
	}
});
