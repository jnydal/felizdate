var CustomSearchForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["CustomSearchForm"]);
    },
    initialize: function(model) {
        this.parent(true);
        this.userSessionModel = model.getUserSessionModel();
        this.optionModel = model.getOptionModel();
        model.addObserver(this);

        // basics
        //this.ageSelector = new SliderField(gettext("Age"), "age");
        this.minAge = new SelectBox(gettext("Min age"), "minAge");
        this.minAge.setRequired(true);
        this.maxAge = new SelectBox(gettext("Max age"), "maxAge");
        this.maxAge.setRequired(true);
    	this.gender = new SelectBox(gettext("Gender"), "gender");
    	this.gender.setRequired(true);
		this.country = new SelectBox(gettext("Country"), "country");
		this.country.handleChange = this.handleCountryChange.bind(this);
		this.city = new SelectBox(gettext("City"), "cityId");
		this.city.setRequired(true);
    	
    	// create basics field group
    	var basicsfieldGroup = new FieldGroup();
	    	basicsfieldGroup.addField(this.minAge);
	    	basicsfieldGroup.addField(this.maxAge);
	    	basicsfieldGroup.addField(this.gender);
	    	basicsfieldGroup.addField(this.country);
	    	basicsfieldGroup.addField(this.city);
	    	basicsfieldGroup.setGrid(Grid.PENTA);
    	this.addGroup(basicsfieldGroup);

    	// advanced section
	    var partnerBasics = new FieldGroup();
    	this.partnerOccupation = new SelectBox(gettext("Occupation"), "occupation");
    	this.partnerEducationalDegree = new SelectBox(gettext("Educational degree"), "educationalDegree");
    	this.partnerPolitical = new SelectBox(gettext("Political alignment"), "political");
    	this.partnerReligion = new SelectBox(gettext("Religion"), "religion");
    	this.lookingFor = new SelectBox(gettext("Looking for"), "lookingFor");
    	
    	partnerBasics.addField(this.partnerOccupation);
    	partnerBasics.addField(this.partnerEducationalDegree);
    	partnerBasics.addField(this.partnerPolitical);
    	partnerBasics.addField(this.partnerReligion);
    	partnerBasics.addField(this.lookingFor);
    	partnerBasics.setGrid(Grid.PENTA);
    	
    	this.partnerBody = new CheckboxGroup(gettext("Body"), "body");
    	this.partnerBody.setGrid(Grid.PENTA);
    	this.partnerSkin = new CheckboxGroup(gettext("Skin"), "skin");
    	this.partnerSkin.setGrid(Grid.PENTA);
    	this.partnerHair = new CheckboxGroup(gettext("Hair"), "hair");
    	this.partnerHair.setGrid(Grid.PENTA);
    	this.partnerEyes = new CheckboxGroup(gettext("Eyes"), "eyes");
    	this.partnerEyes.setGrid(Grid.PENTA);

    	this.online = new CheckBoxField(gettext("Logged in"), "loggedIn");
    	this.online.setRequired(false);
    	
    	this.hasImage = new CheckBoxField(gettext("Has image"), "hasImage");
    	this.hasImage.setRequired(false);
    	
    	this.withoutChildren = new CheckBoxField(gettext("Without children"), "withoutChildren");
    	this.withoutChildren.setRequired(false);
    	
	    this.addGroup(partnerBasics);
    	this.addField(this.online);
    	this.addField(this.hasImage);
    	this.addField(this.withoutChildren);
	    this.addGroup(this.partnerBody);
	    this.addGroup(this.partnerSkin);
	    this.addGroup(this.partnerHair);
	    this.addGroup(this.partnerEyes);
		
		this.handleSubmit = function() {
			this.handleSearchRequest();
		}.bind(this);
		this.setSubmitButtonLabel(gettext("search"));
		
		this.initAgeSelectors();
    },
    initAgeSelectors: function() {
    	var minAge = 18;
    	var maxAge = 100;
    	for (var i = minAge; i<maxAge; i++) {
    		this.minAge.addOption(i, i);
    		this.maxAge.addOption(i, i);
    	}
    },
    handleSearchRequest: function() {
    	// override
    },
    lockCountrySelector: function() {
    	this.country.disable();
    },
    handleCountryChange: function(option) {
		if (option) {
			var cities = this.optionModel.getCities(option.getId());
			if (typeOf(cities) === "null") {
				application.controller.performAction(new ActionRequest("getCities", {"countryId": option.getId()}, function(cities) {
					this.city.populate(cities);				
				}.bind(this)));
			} else {
				this.city.populate(cities);
			}
		}
	},
	refresh: function() {
		var userprofile = this.userSessionModel.getUserProfile();
		if (typeOf(userprofile) !== "null") {
			this.gender.setSelected(userprofile.getPartnerGender());
			var countryId = userprofile.getCountryId();
			this.country.setSelected(countryId);
			var cities = this.optionModel.getCities(countryId);
			if (typeOf(cities) === "null") {
				application.controller.performAction(new ActionRequest("getCities", {"countryId": countryId}, function(cities) {
					this.city.populate(cities);
					this.city.setSelected(userprofile.getCityId());
				}.bind(this)));
			} else {
				this.city.populate(cities);
				this.city.setSelected(userprofile.getCityId());
			}
			this.minAge.setSelected(Utilities.getMinAge(userprofile));
			this.maxAge.setSelected(Utilities.getMaxAge(userprofile));
		}
	},
    handleModelEvent: function(event) {
	    if (!instanceOf(event, ModelEvent)) {
	        throw new Exception("event parameter is not a ModelEvent instance.");
	    }
	    switch (event.getType()) { // TODO: consider transient loading of options.
	    	case "OPTIONS_LOADED":
	    		this.gender.populate(this.optionModel.getGenders());
	    		this.country.populate(this.optionModel.getCountries());
	    		this.country.setSelected(this.optionModel.getDefaultCountry().id);
	    		this.partnerOccupation.populate(this.optionModel.getOccupations());
	    		this.partnerEducationalDegree.populate(this.optionModel.getEducationalDegrees());
	    		this.partnerPolitical.populate(this.optionModel.getPolitical());
	    		this.partnerReligion.populate(this.optionModel.getReligions());
	    		this.partnerBody.populate(this.optionModel.getBodyTypes());
	    		this.partnerHair.populate(this.optionModel.getHairTypes());
	    		this.partnerSkin.populate(this.optionModel.getSkinTypes());
	    		this.partnerEyes.populate(this.optionModel.getEyeColors());
	    		this.lookingFor.populate(this.optionModel.getLookingForTypes());

	    		break;
		    	default:
	    }
    }
});
