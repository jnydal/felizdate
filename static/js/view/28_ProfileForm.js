var ProfileForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["ProfileForm"]);
    },
    initialize: function(model, init) {
    	this.userSessionModel = model.getUserSessionModel();
    	this.optionModel = model.getOptionModel();
    	this.userSessionModel.addObserver(this);
    	this.model = model;
        model.addObserver(this);
        init = init || false;
    	this.parent(init);
		this.geoCodes = null;
    	
    	// declare fields
    	this.profileName = new InputField(gettext("Profile name"), "profileName");
    	this.profileName.setRequired(true);
    	this.profileName.setMinLength(4);
    	this.profileName.setMaxLength(9);
        this.yearOfBirth = new SelectBox(gettext("Year of birth"), "yearOfBirth");
        this.yearOfBirth.setRequired(true);
    	this.gender = new SelectBox(gettext("Gender"), "gender");
    	this.gender.setRequired(true);
    	this.maritalStatus = new SelectBox(gettext("Marital status"), "maritalStatus");
    	this.maritalStatus.setRequired(true);
    	this.partnerGender = new SelectBox(gettext("Seeking gender"), "partnerGender");
    	this.partnerGender.setRequired(true);
		this.country = new SelectBox(gettext("Country"), "country");
		this.country.handleChange = this.handleCountryChange.bind(this);
		this.city = new SelectBox(gettext("City"), "cityId");
		this.city.setRequired(true);
    	this.lookingFor = new CheckboxGroup("Looking for", "lookingFor");
    	this.lookingFor.setGrid(Grid.HEXA);
		this.tempImagePath = new InputField("", "temporaryImagePathFile", FieldType.HIDDEN);
		this.tempImageTumbPath = new InputField("", "temporaryImageTumbPathFile", FieldType.HIDDEN);
		this.tempImageMicroPath = new InputField("", "temporaryImageMicroPathFile", FieldType.HIDDEN);
		this.tempImagePath.addCssClass("hidden");
		this.tempImageTumbPath.addCssClass("hidden");
		this.tempImageMicroPath.addCssClass("hidden");
		var imageDataFieldGroup = new FieldGroup();
		imageDataFieldGroup.addField(this.tempImagePath);
		imageDataFieldGroup.addField(this.tempImageTumbPath);
		imageDataFieldGroup.addField(this.tempImageMicroPath);
    	this.addGroup(imageDataFieldGroup);
		
    	// create basics field group
    	var basicsfieldGroup = new FieldGroup();
	    	basicsfieldGroup.addField(this.profileName);
	    	basicsfieldGroup.addField(this.yearOfBirth);
	    	basicsfieldGroup.addField(this.gender);
	    	basicsfieldGroup.addField(this.maritalStatus);
	    	basicsfieldGroup.setGrid(Grid.QUAD);
    	this.addGroup(basicsfieldGroup);

    	// country & city field froup
    	var locationFieldGroup = new FieldGroup();
    		locationFieldGroup.addField(this.country);
    		locationFieldGroup.addField(this.city);
	    	locationFieldGroup.setGrid(Grid.QUAD);
    	this.addGroup(locationFieldGroup);

    	// description
    	this.description = new TextAreaField(gettext("Description"), "description");
    	this.description.setRequired(true);
    	this.description.setMinLength(20);
    	/*this.description.setMaxLength(2000);*/
    	this.addField(this.description);
    	
    	// other
    	this.addField(this.partnerGender);
    	this.addGroup(this.lookingFor);
    },
    registerInterest: function(interest, category) {
    	application.performAction(new ActionRequest("saveInterest", {interest: interest, category: category}));
    },
    refresh: function() {
    	var userProfile = this.userSessionModel.getUserProfile();
    	if (typeOf(userProfile) !== "null") {
	    	this.profileName.setValue(userProfile.getProfileName());
	    	this.gender.setSelected(userProfile.getGender());
	    	this.maritalStatus.setSelected(userProfile.getMaritalStatus(userProfile.getMaritalStatus()));
	    	this.partnerGender.setSelected(userProfile.getPartnerGender());
	    	this.country.setSelected(userProfile.getCountryId());
	    	this.yearOfBirth.setSelected(userProfile.getBirthYear());
	    	this.description.setText(userProfile.getDescription());
	    	this.lookingFor.setData(userProfile.getLookingForTypes());
    	}
    },
	handleModelEvent: function(event) {
	    if (!instanceOf(event, ModelEvent)) {
	        throw new Exception("event parameter is not a ModelEvent instance.");
	    }
	    switch (event.getType()) {
	    	case "OPTIONS_LOADED":
	    		this.gender.populate(this.optionModel.getGenders());
	    		this.maritalStatus.populate(this.optionModel.getMaritalStatuses());
	    		this.country.populate(this.optionModel.getCountries());
	    		this.country.setSelected(this.optionModel.getDefaultCountry().id);
	    		this.yearOfBirth.populate(this.optionModel.getYears());
	    		this.partnerGender.populate(this.optionModel.getGenders());
	    		this.lookingFor.populate(this.optionModel.getLookingForTypes());
	    		this.refresh();
	    		break;
	    	case "USER_SESSION_LOADED":
	    		if (this.userSessionModel.domestic) {
	    			this.country.disable();
	    		}
	    		break;
	        case "LOGIN":
				break;
	        case "LOGOUT":
	            break;
	            default:
	    }
	},
	setProfileImages: function(imagePathFiles) {
		this.tempImagePath.setValue(imagePathFiles.large);
		this.tempImageTumbPath.setValue(imagePathFiles.tumb);
		this.tempImageMicroPath.setValue(imagePathFiles.micro);
	},
	handleCountryChange: function(option) {
		var cities = this.optionModel.getCities(option.getId());
		var cityId = null;
		if (typeOf(this.userSessionModel.getUserProfile()) !== "null") {
			cityId = this.userSessionModel.getUserProfile().getCityId();
		}
		if (typeOf(cities) === "null") {
			application.performAction(new ActionRequest("getCities", {"countryId": option.getId()}, function(cities) {
	    		this.city.populate(cities);
	    		if (typeOf(this.userSessionModel.getUserProfile()) !== "null") {
	    			if (cityId) {
	    				this.city.setSelected(cityId);
	    			} else {
	    				this.setCityByName(this.getCityName(this.geoCodes), cities);
	    			}
	    		}
			}.bind(this)));
		} else {
			this.city.populate(cities);
			// if city is conciously set earlier
			if (cityId) {
				this.city.setSelected(cityId);
			} else {
				this.setCityByName(this.getCityName(this.geoCodes), cities);
			}
		}
	},
	setCityByName: function(cityName, cities) {
		var cityPattern = new RegExp("^(\w*)" + cityName + "(\w*)$", "i");
		for (var i = 0; i<cities.length; i++) {
			if (cityPattern.test(cities[i].text)) {
				this.city.setSelected(cities[i].id);
			}
		}
	},
	getGeoCode: function(successFunction) {
		var position = this.model.getLastPosition();
		if (typeOf(position) !== "null") {
			var geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(position.latitude, position.longitude);
		    geocoder.geocode({'latLng': latlng}, function(results, status) {
		      if (status == google.maps.GeocoderStatus.OK) {
		        successFunction(results);
		      } else {
		        Utilities.log("Geocoder failed due to: " + status);
		      }
		    });
		} else {
			successFunction(null);
		}
	},
	getGoogleCountryCode: function(geoCodes) {
		for (var i = geoCodes.length - 1; i>=0; i--) {
			if (geoCodes[i].types.contains('country')) {
				return geoCodes[i].address_components[0].short_name;
			}
		}
	},
	getCityName: function(geoCodes) {
		for (var i = geoCodes.length - 1; i>=0; i--) {
			if (geoCodes[i].types.contains('locality')) {
				return geoCodes[i].address_components[0].short_name;
			}
		}	
	},
	/* DEPRICATED - is done serverside */
	loadProfile: function(user, type) {
		if (type === UserType.FACEBOOK) {
    		if (user.gender === "male") {
    			this.gender.setSelected("M");
    			this.partnerGender.setSelected("F");
    		} else {
    			this.gender.setSelected("F");
    			this.partnerGender.setSelected("M");
    		}
    		
    		// set birthyear
    		var year = user.birthday.substr(6,user.birthday.length);
    		this.yearOfBirth.setSelected(year);

    		// load location details
    		this.getGeoCode(function(results) {
    			if (typeOf(results) !== "null") {
	    			this.geoCodes = results;
	    			this.country.setSelected(CountryCode[this.getGoogleCountryCode(results)]);
    			}
    		}.bind(this));
    	}
		// set single status by default
		this.maritalStatus.setSelected(0);
		
		this.profileName.setValue(this.optionModel.getNickName(user.gender, year.substr(2,year.length)));
	},
	showAdvancedFields: function(flag) {
		if (flag) {
    		this.yearOfBirth.show();
    		this.gender.show();
    		this.country.show();
    		this.city.show();
    		this.professionSection.show();
    		this.politicalSection.show();
    		this.interestsSection.show();
    		this.partnerOccupation.show();
    		this.partnerEducationalDegree.show();
    		this.partnerReligion.show();
    		this.partnerPolitical.show();
    		this.partnerBody.show();
    		this.partnerEyes.show();
    		this.partnerHair.show();
    		this.partnerSkin.show();
		} else {
    		this.yearOfBirth.hide();
    		this.gender.hide();
    		this.country.hide();
    		this.city.hide();
    		this.professionSection.hide();
    		this.politicalSection.hide();
    		this.interestsSection.hide();
    		this.partnerOccupation.hide();
    		this.partnerEducationalDegree.hide();
    		this.partnerReligion.hide();
    		this.partnerPolitical.hide();
    		this.partnerBody.hide();
    		this.partnerEyes.hide();
    		this.partnerHair.hide();
    		this.partnerSkin.hide();
		}
	}
});
