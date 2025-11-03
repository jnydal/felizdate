var View = new Class(
		{
			Extends : AbstractObject,
			getClassHierarchy : function() {
				return this.parent().append([ "View" ]);
			},
			initialize : function(model, controller) {
				this.TOP_OFFSET = 36;
				this.SPINNER_PATH = "/static/images/spinner3-bluey_micro.gif";
				this.SPINNER_WIDTH = 15;
				this.SPINNER_HEIGHT = 15;
				if (!instanceOf(model, Model)) {
					throw new Exception(
							"model parameter is not a Model instance.");
				} else if (!instanceOf(controller, Controller)) {
					throw new Exception(
							"controller parameter is not a Controller instance.");
				}

				this.model = model;
				this.controller = controller;
				this.model.addObserver(this);
				this.model.getUserSessionModel().addObserver(this);

				this.profileDialogs = [];
				this.initStructure();
				this.initLoginForm();
				this.initUserMenu();
				this.initPages();
				this.initFooterInfo();
			},
			/**
			 * View initialization functions
			 * 
			 */
			initStructure : function() {
				this.main = new ComponentContainer();
				this.main.addCssClass("main");
				this.headerWrapper = new Element("div");
				this.headerWrapper.addClass("headerWrapper");
				this.header = new ComponentContainer();
				this.headerWrapper.adopt(this.header.getHtmlElement());
				this.pageNavigator = new PageNavigator();
				this.footer = new Element("div").addClass("footer");
				this.header.addCssClass("header");
				this.main.addComponent(this.pageNavigator);
				this.main.getHtmlElement().adopt(this.footer);
				this.logo = new Element("div");
				this.logo.addClass("logo");
				this.spinner = new Element("img");
				this.spinnerImage = new Image();
				this.spinnerImage.src = this.SPINNER_PATH;
				this.spinnerImage.width = this.SPINNER_WIDTH;
				this.spinnerImage.height = this.SPINNER_HEIGHT;
				this.spinnerImage.onload = function() {
					this.spinner.set("src", this.SPINNER_PATH);
				}.bind(this);
				this.header.getHtmlElement().adopt(this.logo);
				this.header.getHtmlElement().adopt(this.spinner);
			},
			initLoginForm : function() {
				this.loginForm = new LoginForm(this.model);
				this.loginForm.addCssClass("hidden");
				this.loginForm.handleRegisterButtonClick = this.showRegisterPage
						.bind(this);
				this.loginForm.handlefbLoginClick = this.fbLogin;
				this.header.addComponent(this.loginForm);
				if (Utilities.isMobile() && !Utilities.isCordova()) {
					// if mobile show classic view selector
					this.classicSelector = new Element("a");
					this.classicSelector.addClass("classicSwitcher");
					this.classicSelector.set("href", "#");
					this.classicSelector.set("events", {
						click : function() {
							$(document.body).removeClass('resp');
							this.loginForm.setMobileView(false);
							this.initLandingPage();
							this.pageNavigator.showPage(this.landingPage);
							this.classicSelector.dispose();
							return false;
						}.bind(this)
					});
					this.classicSelector.set("text",
							gettext("Switch to classic view"));
					this.header.getHtmlElement().adopt(this.classicSelector);
				}
			},
			initUserMenu : function() {
				this.userMenu = new DropDownMenu("userMenu");
				this.userMenu.setTogglable(false);
				this.userMenu.handleSelect = this.handleMenuOption.bind(this);

				this.messagesOption = new MessagesSubMenu(this.userMenu);
				this.messagesOption.handleShowAllMessages = this.handleShowAllMessages
						.bind(this);
				this.searchOption = new MenuItem(gettext("Search"), "search");
				this.settingsOption = new MenuItem(gettext("Settings"),
						"settings");
				this.logoutOption = new MenuItem(gettext("Logout"), "logout");

				this.userMenu.addMenuItem(this.searchOption);
				this.userMenu.addMenuItem(this.messagesOption);
				this.userMenu.addMenuItem(this.settingsOption);
				this.userMenu.addMenuItem(this.logoutOption);

				this.userMenu.addCssClass("hidden");
				this.statusMenu = new StatusMenu();
				this.statusMenu.hide();
				this.header.addComponent(this.statusMenu);
				this.header.addComponent(this.userMenu);
			},
			initPages : function() {
				this.searchPage = new SearchPage(this.model);
				this.settingsPage = new SettingsPage(this.model);
				this.registerPage = new RegisterPage(this.model);
				this.messagesPage = new MessagesPage(this.model);

				this.searchPage.setParentComponent(this);
				this.settingsPage.setParentComponent(this);
				this.registerPage.setParentComponent(this);
				this.messagesPage.setParentComponent(this);

				// add to navigator
				this.pageNavigator.addPage(this.searchPage);
				this.pageNavigator.addPage(this.settingsPage);
				this.pageNavigator.addPage(this.registerPage);
				this.pageNavigator.addPage(this.messagesPage);

				if (!Utilities.isMobile()) {
					this.initLandingPage();
				}
			},
			initLandingPage : function() {
				this.landingPage = new LandingPage(this.model);
				this.landingPage.handlefbRegisterClick = this.fbLogin;
				this.landingPage.setParentComponent(this);
				this.landingPage.handleRegisterClick = this.showRegisterPage
						.bind(this);
				this.landingPage.handleFbRegisterClick = this.fbLogin
						.bind(this);
				this.pageNavigator.addPage(this.landingPage);
			},
			initFooterInfo : function() {
				this.footer
						.set(
								"html",
								"<span id='footerText'>&nbsp;&nbsp;&nbsp;&nbsp;Felizdate &copy; 2013</span><span id='footerLinks'><a href='http://dg1h6uvotkrdh.cloudfront.net/s/Terms_and_conditions_of_use_rev_080712.docx'>"
										+ gettext("Terms of use")
										+ "</a> | <a href='http://dg1h6uvotkrdh.cloudfront.net/s/Privacy_policy_rev_080712.docx'>"
										+ gettext("Privacy policy")
										+ "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>");
			},
			render : function() {
				$(document.body).addClass("resp");
				$(document.body).adopt(this.headerWrapper);
				this.main.renderTo($(document.body));
				this.initFacebookAuth();
				// this.initWebAds();
				window.addEvent('resize', this.handleResize.bind(this));
				this.start();
			},
			start : function() {
				this.setLoading(true);
				if (Utilities.hasCookieSession()) {
					this.setLoading(true);
				} else {
					this.pageNavigator.showPage(this.landingPage);
				}
				publisher.publish("VIEW_READY", {});
			},
			handleResize : function() {

			},
			setLoading : function(flag) {
				if (flag) {
					this.spinner.removeClass("hidden");
					this.pageNavigator.hide();
					this.footer.addClass("hidden");
				} else {
					this.spinner.addClass("hidden");
					this.pageNavigator.show();
					this.footer.removeClass("hidden");
				}
			},
			handleShowAllMessages : function() {
				if (Utilities.isMobile()) {
					this.closeDialogs();
				}
				application.performAction(new ActionRequest("getMessages", {}));
				this.pageNavigator.showPage(this.messagesPage);
			},
			handleMenuOption : function(option) {
				switch (option) {
				case this.logoutOption:
					application.performAction(new ActionRequest("logout", {}));
					break;
				case this.messagesOption:
					application.performAction(new ActionRequest(
							"getLatestMessages", {}));
					break;
				case this.searchOption:
					this.pageNavigator.showPage(this.searchPage);
					break;
				case this.settingsOption:
					this.pageNavigator.showPage(this.settingsPage);
					this.settingsPage.refresh();
					break;
				}
				if (Utilities.isMobile() && this.messagesOption !== option) {
					this.closeDialogs();
				}
			},
			registerDialogWindow : function(profileId, dialogWindow) {
				if (!this.profileDialogExist(profileId)) {
					this.profileDialogs.push(dialogWindow);
				}
			},
			profileDialogExist : function(profileId) {
				var exist = false;
				for ( var i = 0; i < this.profileDialogs.length; i++) {
					if (this.profileDialogs[i].getProfile().id === profileId) {
						exist = true;
					}
				}
				return exist;
			},
			showProfileDialog : function(profileId) {
				for ( var i = 0; i < this.profileDialogs.length; i++) {
					if (this.profileDialogs[i].getProfile().id === profileId) {
						this.profileDialogs[i].show();
					}
				}
			},
			showErrorDialog : function(message) {
				if (typeOf(this.errorDialog) === "null"
						|| this.errorDialog.destroyed === true) {
					this.errorDialog = new ErrorDialogWindow();
				}
				this.errorDialog.setMessage(Utilities.getErrorMessage(message));
			},
			showRegisterPage : function() {
				this.loginForm.addCssClass("mobileHidden");
				this.pageNavigator.showPage(this.registerPage);
				this.registerPage.initCaptcha();
			},
			showStatusMenu : function() {
				this.statusMenu.show();
			},
			hideStatusMenu : function() {
				this.statusMenu.hide();
			},
			closeDialogs : function() {
				for ( var i = this.profileDialogs.length - 1; i >= 0; i--) {
					if (typeOf(this.profileDialogs[i]) !== "null") {
						this.profileDialogs[i].close();
						this.profileDialogs.erase(this.profileDialogs[i]);
					}
				}
			},
			setLoggedInState : function(flag) {
				// if logged in
				if (flag) {
					this.loginForm.hide();
					this.settingsPage.refreshAccountForm();
					// if userprofile is present
					if (typeOf(this.model.getUserSessionModel()
							.getUserProfile()) !== "null") {
						this.showStatusMenu();
						this.statusMenu.setStatus(this.model
								.getUserSessionModel().getUserProfile()
								.getProfileStatus());
						this.setHasProfileState(true);
						this.searchPage.refresh();
					} else {
						this.setHasProfileState(false);
					}
					this.userMenu.show();
					this.setUserType(this.model.getUserSessionModel()
							.getUserType());
				} else {
					this.loginForm.show();
					this.hideStatusMenu();
					this.userMenu.hide();
					this.closeDialogs();
					this.searchPage.reset();
					this.settingsPage.reset();
					this.messagesPage.reset();
					this.pageNavigator.showPage(this.landingPage);
				}
			},
			setView : function(user) {
				// todo: implement
			},
			setUserType : function(userType) {
				if (userType === UserType.FACEBOOK) {
					this.settingsPage.setAccountTabEnabled(false);
				}
			},
			setHasProfileState : function(flag) {
				if (flag) {
					this.messagesOption.enable();
					this.searchOption.enable();
					this.pageNavigator.showPage(this.searchPage);
				} else {
					this.messagesOption.disable();
					this.searchOption.disable();
					this.pageNavigator.showPage(this.settingsPage);
					var userType = this.model.getUserSessionModel()
							.getUserType();
					if (userType === UserType.FACEBOOK) {
						FB.api('/me', function(user) {
							/*
							 * if (typeOf(user.error) === "null") {
							 * this.settingsPage.loadProfile(user, userType); }
							 */
						}.bind(this));
					}
				}
			},
			handleShowProfileDetails : function(id) {
				application.performAction(new ActionRequest("getProfile", {
					id : id
				}));
			},
			/**
			 * called when user sends message or when user recieves.
			 * 
			 */
			processMessage : function(event) {
				var visibleProfileDialog = null;
				// find visible dialog
				for ( var i = 0; i < this.profileDialogs.length; i++) {
					if (typeOf(this.profileDialogs[i]) !== "null") {
						if ((this.profileDialogs[i].getProfile().id === event.payload[0].fromProfileId)
								|| (this.profileDialogs[i].getProfile().id === event.payload[0].toProfileId)) {
							if (this.profileDialogs[i]
									&& !this.profileDialogs[i].isHidden()) {
								visibleProfileDialog = this.profileDialogs[i];
							}
						}
					}
				}
				if (typeOf(visibleProfileDialog) === "null") {
					this.messagesOption
							.addNotification(event.payload[0].fromProfileId);
				} else {
					for ( var i = 0; i < event.payload.length; i++) {
						var fromProfileId = event.payload[i].fromProfileId;
						if (visibleProfileDialog.profile.id === fromProfileId
								|| this.model.getUserSessionModel()
										.getUserProfile().getId() === fromProfileId) {
							// add message to message content
							visibleProfileDialog.addMessage(event.payload[i]);
						}
					}
				}
			},
			invalidateConversations : function() {
				for ( var i = 0; i < this.profileDialogs.length; i++) {
					if (typeOf(this.profileDialogs[i]) !== "null") {
						this.profileDialogs[i].refreshConversation();
					}
				}
			},

			/**
			 * Should be main handler of view/window events
			 * 
			 */
			handleModelEvent : function(event) {
				if (!instanceOf(event, ModelEvent)) {
					throw new Exception(
							"event parameter is not a ModelEvent instance.");
				}
				switch (event.getType()) {
				case "INVALIDATE_CONVERSATIONS":
					this.invalidateConversations();
					break;
				case "USER_SESSION_LOADED":
					if (this.model.getUserSessionModel().isAuthenticated()) {
						// show profile page
						this.setLoggedInState(true);
					} else {
						// show landing/register/login page
						this.setLoggedInState(false);
					}
					this.setLoading(false);
					if (window.location.search.indexOf("reg=1") !== -1) {
						// redirect to register page
						this.pageNavigator.showPage(this.registerPage);
					}
					break;
				case "LATEST_MESSAGES_RECIEVED":
					var item;
					for ( var i = 0; i < event.payload.length; i++) {
						item = new MessageMenuItem(
								event.payload[i].microImageUrl,
								Utilities.getTruncated(event.payload[i].text,
										10), event.payload[i].gender,
								event.payload[i].fromProfileName,
								event.payload[i].fromProfileId);
						item.setParentComponent(this.userMenu);
						item.handleSelect = this.handleShowProfileDetails;
						this.messagesOption.addMessage(item);
					}
					break;
				case "MESSAGE_SENT":
				case "MESSAGE_RECIEVED":
					this.processMessage(event);
					break;
				case "PROFILE_LOADED":
					if (!this.profileDialogExist(event.payload.id)) {
						var profileDialogWindow = new ProfileDialogWindow(
								this.model.getUserSessionModel(), event.payload);
						this.registerDialogWindow(event.payload.id,
								profileDialogWindow);
					}
					this.showProfileDialog(event.payload.id);
					break;
				case "SEARCH_RESULTS_LOADED":
					break;
				case "ACCOUNT_CREATED":
					this.loginForm.hide();
					break;
				case "LOGOUT_SUCCESS":
					this.setLoggedInState(false);
					break;
				case "PROFILE_CREATED":

					break;
				case "PROFILE_UPDATED":
					break;
				case "STATUS_CHANGED":
					this.statusMenu.setStatus(this.model.getUserSessionModel()
							.getUserProfile().getProfileStatus());
					break;
				case "SERVER_ERROR":
					this.showErrorDialog(event.payload);
				default:

				}
			},
			/**
			 * Initialize advertisements
			 * 
			 * 
			 */
			initFacebookAuth : function() {
				if (!Utilities.isAndroid()) {
					var fbRoot = new Element("div");
					fbRoot.set("id", "fb-root");
					$(document.body).adopt(fbRoot);
					window.fbAsyncInit = function() {
						FB.init({
							appId : '461684797192269',
							status : true,
							cookie : true,
							xfbml : true,
							oauth : true,
						});
						if (!Utilities.hasCookieSession()
								&& window.location.search.indexOf("regfb=1") !== -1) {
							// redirect to fb registration
							this.fbLogin();
						}
					}.bind(this);
					(function(d) {
						var js, id = 'facebook-jssdk';
						if (d.getElementById(id)) {
							return;
						}
						js = d.createElement('script');
						js.id = id;
						js.async = true;
						js.src = "//connect.facebook.net/en_US/all.js";
						d.getElementsByTagName('head')[0].appendChild(js);
					}(document));
				}
			},
			getAd : function(id, keywords, size) {
				var tradeDoublerVariables = new Element("script");
				tradeDoublerVariables.set("html", "" + "var td_id = '2134737';"
						+ "var td_format = '4,6,7';" + "var td_epi = '';"
						+ "var td_size = '" + size.width + "x" + size.height
						+ "';" + "var td_lang = '';"
						+ "var td_method = 'manual';" + "var td_keywords = '"
						+ keywords.join(",") + "';" + "var td_exclude = '';");
				var tradeDoublerScript = new Element("script");
				tradeDoublerScript
						.set("src",
								"http://hst.tradedoubler.com/file/20649/contextual/cx2.js");
				tradeDoublerScript.set("id", "td_ads");
				var iframeHtml = new Element("html");
				var iframeBody = new Element("body");
				iframeBody.adopt(tradeDoublerVariables);
				iframeBody.adopt(tradeDoublerScript);
				iframeHtml.adopt(iframeBody);
				var adIframe = new IFrame(iframeHtml, {
					id : id,
					style : {
						'width' : size.width + "px",
						'height' : size.height + "px",
					},
					events : {
						load : function() {

						}
					}
				});
				adIframe.addClass("ad");
				return adIframe;
			},
			initWebAds : function() {
				this.rightAd = this.getAd("rightAd", [ "dance", "rock" ], {
					width : 160,
					height : 600
				});
				this.rightAd.inject(this.pageNavigator.getHtmlElement(),
						'after');
			},
			initMobileAds : function() {
				this.mobileAd = this.getAd("bottomAd", [ "ski", "music" ], {
					width : 234,
					height : 60
				});
				this.mobileAd.inject(this.footer);
			},
			getGoogleMap : function() {
				return this.searchPage.getGeoMatchesFinder().getGeoMap()
						.getGoogleMap();
			},
			fbLogin : function() {
				FB
						.login(
								function(response) {
									if (response.authResponse) {
										application
												.performAction(new ActionRequest(
														"login",
														{
															usertype : UserType.FACEBOOK,
															accessToken : response.authResponse.accessToken
														}));
									} else {
										this
												.showErrorDialog(gettext("Facebook login failed."));
									}
								}.bind(this),
								{
									scope : 'user_birthday, user_religion_politics, user_likes, user_interests'
								});
			}
		});
