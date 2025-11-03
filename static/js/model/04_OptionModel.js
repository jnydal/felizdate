var OptionModel = new Class({
    Extends: ObservableModelObject,
    initialize: function() {
        this.countries = [];
        this.genders = [];
        this.maritalStatuses = [];
        this.years = [];
        this.lookingForTypes = [];
        this.bodyTypes = [];
        this.hairTypes = [];
        this.skinTypes = [];
        this.eyeColors = [];
        this.occupations = [];
        this.educationalDegrees = [];
        this.political = [];
        this.religions = [];
    },
    getClassName: function() {
    	return "OptionModel";
    },
    load: function(data) {
    	this.countries = data.countries;
    	this.genders = data.genders;
    	this.maritalStatuses = data.maritalStatuses;
    	this.years = data.years;
    	this.bodyTypes = data.bodyTypes;
    	this.hairTypes = data.hairTypes;
    	this.skinTypes = data.skinTypes;
    	this.eyeColors = data.eyeColors;
    	this.occupations = data.occupations;
    	this.educationalDegrees = data.educationalDegrees;
    	this.political = data.politicalAlignments;
    	this.religions = data.religions;
    	this.lookingForTypes = data.lookingForTypes;
    	this.defaultCountry = null;
    },
    getDefaultCountry: function() {
    	var suffix = Utilities.getDomainSuffix();
    	var result = this.countries[0];
    	for (var i = 0; i<this.countries.length; i++) {
    		if (this.countries[i].code2 === suffix) {
    			result = this.countries[i];
    		}
    	}
    	return result;
    },
    getCountries: function() {
    	return this.countries;
    },
    getCities: function(countryId) {
    	for (var i = 0; i<this.countries.length; i++) {
    		if (this.countries[i].id === countryId) {
    			return this.countries[i].cities;
    		}
    	}
    },
    setCities: function(countryId, cities) {
    	for (var i = 0; i<this.countries.length; i++) {
    		if (this.countries[i].id === countryId) {
    			this.countries[i].cities = cities;
    		}
    	}
    	this.notifyObservers("CITIES_LOADED", { id: countryId });
    },
    getGenders: function() {
    	return this.genders;
    },
    getLookingForTypes: function() {
    	return this.lookingForTypes;
    },
    getYears: function() {
    	return this.years;
    },
    getOccupations: function() {
    	return this.occupations;
    },
    getEducationalDegrees: function() {
    	return this.educationalDegrees;
    },
    getPolitical: function() {
    	return this.political;
    },
    getReligions: function() {
    	return this.religions;
    },
    getBodyTypes: function() {
    	return this.bodyTypes;
    },
    getHairTypes: function() {
    	return this.hairTypes;
    },
    getSkinTypes: function() {
    	return this.skinTypes;
    },
    getEyeColors: function() {
    	return this.eyeColors;
    },
    getMaritalStatuses: function() {
    	return this.maritalStatuses;
    },
    getMaritalStatusText: function(id) {
    	for (var i = 0; i<this.maritalStatuses.length; i++) {
    		if (this.maritalStatuses[i].id === id) {
    			return this.maritalStatuses[i].text;
    		}
    	}
    	return "";
    },
    getBodyTypeText: function(id) {
    	for (var i = 0; i<this.bodyTypes.length; i++) {
    		if (this.bodyTypes[i].id === id) {
    			return this.bodyTypes[i].text;
    		}
    	}
    	return "";
    },
    getSkinTypeText: function(id) {
    	for (var i = 0; i<this.skinTypes.length; i++) {
    		if (this.skinTypes[i].id === id) {
    			return this.skinTypes[i].text;
    		}
    	}
    	return "";
    },
    getHairTypeText: function(id) {
    	for (var i = 0; i<this.hairTypes.length; i++) {
    		if (this.hairTypes[i].id === id) {
    			return this.hairTypes[i].text;
    		}
    	}
    	return "";
    },
    getEyeColorText: function(id) {
    	for (var i = 0; i<this.eyeColors.length; i++) {
    		if (this.eyeColors[i].id === id) {
    			return this.eyeColors[i].text;
    		}
    	}
    	return "";
    },
    getOccupationText: function(id) {
    	for (var i = 0; i<this.occupations; i++) {
    		if (this.occupations[i].id === id) {
    			return this.occupations[i].text;
    		}
    	}
    	return "";
    },
    getEducationalDegreeText: function(id) {
    	for (var i = 0; i<this.educationalDegrees.length; i++) {
    		if (this.educationalDegrees[i].id === id) {
    			return this.educationalDegrees[i].text;
    		}
    	}
    	return "";
    },
    getPoliticalText: function(id) {
    	for (var i = 0; i<this.political.length; i++) {
    		if (this.political[i].id === id) {
    			return this.political[i].text;
    		}
    	}
    	return "";
    },
    getReligionText: function(id) {
    	for (var i = 0; i<this.religions.length; i++) {
    		if (this.religions[i].id === id) {
    			return this.religions[i].text;
    		}
    	}
    	return "";
    },
    getLookingForText: function(id) {
    	for (var i = 0; i<this.lookingForTypes.length; i++) {
    		if (this.lookingForTypes[i].id === id) {
    			return this.lookingForTypes[i].text;
    		}
    	}
    	return "";
    },
    handleServerError: function(errorResponse) {
    	 switch (errorResponse.failureType) {
	    	 case "CONCURRENT_UPDATE":
	    		 this.notifyObservers("CONCURRENT_UPDATE_EXCEPTION", errorResponse);
	         break;
	    	 case "ALREADY_DELETED_ITEM":
	    		 this.notifyObservers("DELETE_ON_CONCURRENT_UPDATE",errorResponse);
	    	 break;	 
	    	 default:
	    		 this.notifyObservers("SERVER_ERROR", errorResponse);
    	 }
    }
});
