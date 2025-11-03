var SearchPage = new Class({
    Extends: Page,
    getClassHierarchy: function() {
        return this.parent().append(["SearchPage"]);
    },
    initialize: function(model) {
        this.parent();
        this.model = model;
        this.model.getUserSessionModel().addObserver(this); // TODO: make usersessionmodel internal. model in general should be public api
        this.model.addObserver(this);
        this.searchResult = null;
        this.initStructure();
    	this.countPrPage;
    	if (Utilities.isMobile()) {
    		this.countPrPage = 12;
    	} else {
    		this.countPrPage = 12;
    	}
    },
    initStructure: function() {
    	this.tabPanel = new TabPanel();
    	this.tabPanel.handleAfterShow = this.handleChangeTab.bind(this);
    	this.geoMatchesFinder = new GeoMatchesFinder();
    	this.geoMatchesTab = new ComponentContainer();
    	this.geoMatchesTab.addComponent(this.geoMatchesFinder);
    	
    	this.bestMatchesForm = new BestMatchesForm();
    	this.bestMatchesForm.handleSearchRequest = this.handleBestMatchesSearchRequest.bind(this);
    	this.bestMatchesTab = new ComponentContainer();
    	this.bestMatchesTab.addComponent(this.bestMatchesForm);
    	
    	this.customSearchForm = new CustomSearchForm(this.model);
    	this.customSearchForm.handleSearchRequest = this.handleCustomSearchRequest.bind(this);
    	this.customSearchFormTab = new ComponentContainer();
    	this.customSearchFormTab.addComponent(this.customSearchForm);
    	
    	this.tabPanel.add(this.geoMatchesTab, gettext("GeoMatch"));
    	this.tabPanel.add(this.bestMatchesTab, gettext("Best matches"));
    	this.tabPanel.add(this.customSearchFormTab, gettext("Custom"));
    	this.tabPanel.renderTo(this);
    	this.tabPanel.show(this.bestMatchesTab);
    },
    refresh: function() {
    	this.customSearchForm.refresh();
    },
    handleChangeTab: function(component) {
    	if (component === this.geoMatchesTab) {
    		this.geoMatchesFinder.activate();
    		this.geoMatchesFinder.refresh();
    	} else {
    		this.geoMatchesFinder.deactivate();
    	}
    },
    showCustomSearchForm: function() {
    	this.customSearchForm.show();
    	this.customSearchResult.hide();
    },
    showBestMatchesSearchForm: function() {
    	this.bestMatchesForm.show();
    	this.bestMatchesSearchResult.hide();
    },
    getGeoMatchesFinder: function() {
    	return this.geoMatchesFinder;
    },
    assertHasProfileImage: function() {
    	if (!this.model.getUserSessionModel().getUserProfile().getHasProfileImage()) {
    		TooltipHandler.showNotification(gettext("Service quality suggestion: Upload profileimage to see profileimages of other users."), {top: application.view.TOP_OFFSET});	    			
		}
    },
    handleCustomSearchRequest: function(pageNo) {
    	pageNo = pageNo || 1;
    	if (this.customSearchForm.isValid()) {
    		var data = this.customSearchForm.getData();
    		application.performAction(new ActionRequest("searchProfiles", Object.append(data, {countPrPage: this.countPrPage, pageNo: pageNo}), function(data) {
		    	if (typeOf(this.customSearchResult) !== "null") {
		    		this.customSearchResult.unrender();
		    	}
	    		this.assertHasProfileImage();
	    		this.customSearchResult = new ResultBrowser();
		    	this.customSearchResult.handleShowDetails = this.parentComponent.handleShowProfileDetails.bind(this);
		    	this.customSearchResult.handleBackToSearch = this.showCustomSearchForm.bind(this);
		    	this.customSearchResult.requestResultPage = this.handleCustomSearchRequest.bind(this);
		    	this.customSearchResult.renderTo(this.customSearchFormTab.getHtmlElement());
		    	this.customSearchForm.hide();
		    	var hasProfileImage = application.model.getUserProfile().getHasProfileImage();
		    	this.customSearchResult.loadResults(data, hasProfileImage);
        		this.customSearchForm.setInProgress(false);
    		}.bind(this)));
    		this.customSearchForm.setInProgress(true);
    	}
    },
    handleBestMatchesSearchRequest: function(pageNo) {
    	pageNo = pageNo || 1;
    	if (this.bestMatchesForm.isValid()) {
    		application.performAction(new ActionRequest("getBestMatches", Object.append(this.bestMatchesForm.getData(), {countPrPage: this.countPrPage, pageNo: pageNo}), function(data) {
		    	if (typeOf(this.bestMatchesSearchResult) !== "null") {
		    		this.bestMatchesSearchResult.unrender();
		    	}
		    	this.assertHasProfileImage();
	    		this.bestMatchesSearchResult = new ResultBrowser();
	    		this.bestMatchesSearchResult.handleShowDetails = this.parentComponent.handleShowProfileDetails.bind(this);
		    	this.bestMatchesSearchResult.handleBackToSearch = this.showBestMatchesSearchForm.bind(this);
		    	this.bestMatchesSearchResult.requestResultPage = this.handleBestMatchesSearchRequest.bind(this);
		    	this.bestMatchesSearchResult.renderTo(this.bestMatchesTab.getHtmlElement());
		    	this.bestMatchesForm.hide();
		    	var hasProfileImage = application.model.getUserProfile().getHasProfileImage();
		    	this.bestMatchesSearchResult.loadResults(data, hasProfileImage);
		    	this.bestMatchesForm.setInProgress(false);
    		}.bind(this)));
    		this.bestMatchesForm.setInProgress(true);
    	}
    },
    handleModelEvent: function(event) {
	    if (!instanceOf(event, ModelEvent)) {
	        throw new Exception("event parameter is not a ModelEvent instance.");
	    }
	    switch (event.getType()) {
	    	case "USER_SESSION_LOADED":
	    		var userSessionModel = this.model.getUserSessionModel();
	    		if (typeOf(userSessionModel.getUserProfile()) !== "null") {
	    			this.geoMatchesFinder.setState(this.model.getUserSessionModel().getUserProfile().getProfileStatus());
	    			this.customSearchForm.refresh();
	    		}
	    		if (userSessionModel.domestic) {
	    			this.customSearchForm.lockCountrySelector();
	    		}
	    		break;
	    	case "STATUS_CHANGED":
	    		this.geoMatchesFinder.setState(this.model.getUserSessionModel().getUserProfile().getProfileStatus());
	    		break;
	    	case "POSITION_UPDATED":
	    		this.geoMatchesFinder.setCurrentPosition(event.payload);
	    		break;
		    case "LOGOUT":
		    	this.geoMatchesFinder.deactivate();
		    	break;
		    	default:
	    }
    },
    reset: function() {
    	this.customSearchForm.reset();
    }
});
