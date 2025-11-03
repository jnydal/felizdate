var LandingPage = new Class({
    Extends: Page,
    getClassHierarchy: function() {
        return this.parent().append(["LandingPage"]);
    },
    initialize: function(model) {
        this.parent();
		this.assetsLoaded = false;
		
        // if not on mobile load promo sections
	    this.initGraphicalAssets();
	        
        // if ie8 - just activate all assets as slider browser is not supported for the moment
        if (Browser.ie8) {
        	this.activatePromoAssets();
        }
        
		// default register button
		this.registerButton = new SubmitButton();
        this.registerButton.setLabel(gettext("Sign-up"));
        this.registerButton.handleClick = function() {
        	this.handleRegisterClick();
        }.bind(this);
        this.registerButton.renderTo(this.getHtmlElement());
		
		// fb register button
		this.fbRegisterButton = new SubmitButton();
		this.fbRegisterButton.addCssClass("fb");
        this.fbRegisterButton.setLabel(gettext("Sign-up via facebook (*)"));
        this.fbRegisterButton.handleClick = function() {
        	this.handleFbRegisterClick();
        }.bind(this);
        this.fbRegisterButton.renderTo(this.getHtmlElement());
        
		// disclamier & terms of use and conditions
		this.fbNote = new Element("div").addClass("fbNote");
		this.fbNote.set("html", gettext("* By signing-up via Facebook&copy; account you don't need to create a<br>login account. Interests is copied to your Felizdate profile which<br>you can change anytime. Your privacy is our main concern."));
		this.getHtmlElement().adopt(this.fbNote);
        
		// android app link
        this.androidLink = new Element("a");
        this.androidLink.set("href", "https://play.google.com/store/search?q=felizdate&c=apps");
        this.androidLink.set("target", "android_app");
        this.androidLink.addClass("androidLink");
        this.androidLink.set("html", "<img width=147 height=40 src=\"/static/images/google_playlogo.png\"/>");
        
        // iphone app link
        this.iphoneLink = new Element("a");
        this.iphoneLink.addClass("iphoneLink");
        this.iphoneLink.set("html", "<img width=190 height=40 src=\"/static/images/i_ready.png\"/>");
        
        this.getHtmlElement().adopt(this.androidLink);
        this.getHtmlElement().adopt(this.iphoneLink);
    },
    initGraphicalAssets: function() {
    	// init promo browser
        this.promoBrowser = new SlideBrowser();
        this.promoBrowser.handleChange = this.activatePromoAssets.bind(this);

        // init promo slides
        this.general = new Element("figure");
        this.initGeneralPromo();
        
        // create lazy slide references
        this.interestFeature = new Element("figure");
    	this.gps = new Element("figure");
    	this.album = new Element("figure");
    	this.chat = new Element("figure");
        this.portability = new Element("figure");
        
        this.promoBrowser.setSlides([this.general, this.interestFeature, this.gps, this.album, this.chat, this.portability]);
        
        // create navigator
        this.navigator = new TabPanel();
        this.resultContainer = new ComponentContainer();
        this.quickSearch = new QuickSearchForm();
        this.quickSearch.handleSearchRequest = this.searchRequest.bind(this);
        this.resultContainer.addComponent(this.quickSearch);
    	this.navigator.add(this.promoBrowser, gettext("Information"));
    	this.navigator.add(this.resultContainer, gettext("See selection"));
    	
    	this.navigator.renderTo(this);
    	this.navigator.show(this.promoBrowser);
    	
    	this.countPrPage = 12;
    },
    searchRequest: function(pageNo) {
    	pageNo = pageNo || 1;
    	var minage,maxage;
    	var data = this.quickSearch.getData();
    	switch (data.agerange) {
    		case "0":
    			minage = 18;
    			maxage = 25;
    			break;
    		case "1":
    			minage = 25;
    			maxage = 32;
    			break;
    		case "2":
    			minage = 32;
    			maxage = 39;
    			break;
    		case "3":
    			minage = 39;
    			maxage = 46;
    			break;
    		case "4":
    			minage = 46;
    			maxage = 53;
    			break;
    		case "5":
    			minage = 53;
    			maxage = 60;
    			break;
    		case "6":
    			minage = 60;
    			maxage = 67;
    			break;
    		default:
    	}
    	var payload = {
    		minage: minage,
    		maxage: maxage,
    		gender: data.gender,
    		countPrPage: this.countPrPage,
    		pageNo: pageNo
    	}
		application.performAction(new ActionRequest("quickSearch", payload, function(data) {
	    	if (typeOf(this.results) !== "null") {
	    		this.results.unrender();
	    	}
    		this.results = new ResultBrowser();
    		this.results.hideLoginStatus();
	    	this.results.requestResultPage = this.searchRequest.bind(this);
	    	this.results.renderTo(this.resultContainer);
	    	this.results.hideBackToSearchButton();
	    	this.results.loadResults(data, true, true);
    		this.quickSearch.setInProgress(false);
		}.bind(this)));
		this.quickSearch.setInProgress(true);
    },
    initGeneralPromo: function() {
		this.dateImage = new Element("div").addClass("dateImage");
		this.general.adopt(this.dateImage);
		this.points = new Element("div").addClass("points");
		this.customInterestsIconLabel = new IconLabel(null, gettext("Match based on custom interests"));
		this.locationIconLabel = new IconLabel(null, gettext("Location based match feature"));
		this.chatIconLabel = new IconLabel(null, gettext("Realtime chat"));
		this.mediaLabel = new IconLabel(null, gettext("Media album"));
		this.reportBlockIconLabel = new IconLabel(null, gettext("Report/blocking feature"));
		this.availableIconLabel = new IconLabel(null, gettext("Available on web, pads and mobiles"));
		this.secure = new IconLabel(null, gettext("100% anonymity"));
		this.openSubscription = new IconLabel(null, gettext("Open subscription"));
		this.customInterestsIconLabel.renderTo(this.points);
		this.locationIconLabel.renderTo(this.points);
		this.chatIconLabel.renderTo(this.points);
		this.mediaLabel.renderTo(this.points);
		this.reportBlockIconLabel.renderTo(this.points);
		this.availableIconLabel.renderTo(this.points);
		this.secure.renderTo(this.points);
		this.openSubscription.renderTo(this.points);
		this.general.adopt(this.points);
		this.stickers = new Element("div").addClass("stickers");
		/*this.secureSticker = new Element("div").addClass("secureSticker sticker stroke");
		this.secureSticker.set('html', gettext("<span>100% anonymity</span>"));*/
		this.freeSticker = new Element("div").addClass("freeSticker sticker stroke");
		this.freeSticker.set('html', gettext("<span>FREE premium membership until July 2013</span>"));
		//this.stickers.adopt(this.secureSticker);
		this.stickers.adopt(this.freeSticker);
		this.general.adopt(this.stickers);
    },
    initInterestsPromo: function() {
		var interestWrapper = new Element("div");
		interestWrapper.addClass("interestWrapper");
        this.cookingInterest = new Element("div");
        this.cookingInterest.set("html", gettext("<span>cooking</span>"));
        interestWrapper.adopt(this.cookingInterest);
        this.skiingInterest = new Element("div");
        this.skiingInterest.set("html", gettext("<span>skiing</span>"));
        interestWrapper.adopt(this.skiingInterest);
        this.travelInterest = new Element("div");
        this.travelInterest.set("html", gettext("<span>travel</span>"));
        interestWrapper.adopt(this.travelInterest);
        this.pokerInterest = new Element("div");
        this.pokerInterest.set("html", gettext("<span>poker</span>"));
        interestWrapper.adopt(this.pokerInterest);
        this.moviesInterest = new Element("div");
        this.moviesInterest.set("html", gettext("<span>movies</span>"));
        var interestPromotext = new Element("div");
        interestPromotext.addClass("promoText");
        interestPromotext.set("html", gettext("<h2>Match based on custom interests</h2><p>Let the system find perfect matches based on your custom interests.</p>"));
        interestWrapper.adopt(this.moviesInterest);
        this.interestsRef = new Element("div");
        this.interestExampleHeader = new Element("span");
        this.interestExampleHeader.addClass("exampleInterestHeader");
        this.interestExampleHeader.set("text", gettext("Interests"));
        this.interestExampleAdd = new Element("span");
        this.interestExampleAdd.addClass("exampleInterestAdd");
        this.interestExampleAdd.set("text", gettext("add"));
        this.interestExampleSubmit = new Element("span");
        this.interestExampleSubmit.addClass("exampleInterestSubmit");
        this.interestExampleSubmit.set("text", gettext("submit"));
        this.interestExampleText = new Element("span");
        this.interestExampleText.addClass("exampleInterestText");
        this.interestExampleText.set("text", gettext("private journalism|"));
        this.interestExample = new Element("span");
        this.interestExample.addClass("interestExample");
        this.interestExample.set("text", gettext("dancing"));
        this.interestFeature.adopt(interestPromotext);
        this.interestFeature.adopt(this.interestsRef);
        this.interestFeature.adopt(this.interestExampleHeader);
        this.interestFeature.adopt(this.interestExampleAdd);
        this.interestFeature.adopt(this.interestExampleSubmit);
        this.interestFeature.adopt(this.interestExampleText);
        this.interestFeature.adopt(this.interestExample);
        this.interestFeature.adopt(interestWrapper);
        this.cookingInterest.addClass("promoInterest");
		this.cookingInterest.addClass("cookingInterest");
		this.cookingInterest.addClass("match");
		this.skiingInterest.addClass("promoInterest");
		this.skiingInterest.addClass("skiingInterest");
		this.skiingInterest.addClass("match");
		this.travelInterest.addClass("promoInterest");
		this.travelInterest.addClass("travelInterest");
		this.travelInterest.addClass("match");
		this.pokerInterest.addClass("promoInterest");
		this.pokerInterest.addClass("pokerInterest");
		this.pokerInterest.addClass("match");
		this.moviesInterest.addClass("promoInterest");
		this.moviesInterest.addClass("moviesInterest");
		this.moviesInterest.addClass("match");
		this.interestsRef.addClass("interestsRef");
    },
    initGpsPromo: function() {
    	this.gpsRef = new Element("div");
    	this.gpsRef.addClass("gpsRef");
    	this.iphoneImage = new Element("div");
    	this.iphoneImage.addClass("iphoneImage");
        var gpsPromotext = new Element("div");
        gpsPromotext.addClass("promoText");
        gpsPromotext.set("html", gettext("<h2>Location based match feature</h2><p>Felizdate provides a location match feature for finding potential dates nearby. You are maybe in a cafe or restaurant and want to see if any girls are close to you.</p>"));
        this.gps.adopt(gpsPromotext);
        this.gps.adopt(this.gpsRef);
        this.gps.adopt(this.iphoneImage);
    },
    initAlbumPromo: function() {
    	this.albumImage = new Element("div");
    	this.albumImage.addClass("mediaSnapshot1");
    	this.albumImage2 = new Element("div");
    	this.albumImage2.addClass("mediaSnapshot2");
        var albumPromotext = new Element("div");
        albumPromotext.addClass("promoText");
        albumPromotext.set("html", gettext("<h2>Media album</h2><p>Show more of yourself via the media album, Upload MP4 and OGG videos, in addition to images.</p>"));
        this.album.adopt(albumPromotext);
        this.album.adopt(this.albumImage);
        this.album.adopt(this.albumImage2);
    },
    initChatPromo: function() {
    	var chatimage = new Element("div");
    	chatimage.addClass("chatshot1");
    	var chatimage2 = new Element("div");
    	chatimage2.addClass("chatshot2");
        var chatPromotext = new Element("div");
        chatPromotext.addClass("promoText");
        chatPromotext.set("html", gettext("<h2>Realtime chat</h2><p>Chat with multiple persons at the same time via the unique dialog system. The extension chat panel allows you to read profiles at the same time as your in a active dialog.</p>"));
        this.chat.adopt(chatPromotext);
        this.chat.adopt(chatimage);
        this.chat.adopt(chatimage2);
    },
    initPortabilityPromo: function() {
    	this.portabilityImage = new Element("div");
    	this.portabilityImage.addClass("portableImage");
        var portabilityPromotext = new Element("div");
        portabilityPromotext.addClass("promoText");
        portabilityPromotext.set("html", gettext("<h2>Portability</h2><p>Felizdate supports most newer browsers in desktops, laptops, pads and mobiles. Our aim is to create the ultimate online dating experience.</p>"));
        this.portability.adopt(portabilityPromotext);
        this.portability.adopt(this.portabilityImage);
    },
    /**
     * because assets are heavy in images, this function exists
     */
    activatePromoAssets: function() {
    	if (!this.assetsLoaded) {
	        this.initInterestsPromo();
	        this.initGpsPromo();
	        this.initChatPromo();
	        this.initAlbumPromo();
	        this.initPortabilityPromo();
            this.assetsLoaded = true;
    	}
    },
    handleRegisterClick: function() {
    	// override
    },
    handleFbRegisterClick: function() {
    	// override
    }
});
