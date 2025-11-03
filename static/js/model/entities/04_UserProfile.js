var ProfileStatus = new Enum([
    "GEOONLINE",
	"ONLINE",
	"AWAY",
	"INVISIBLE"
]);

var MediaType = new Enum([
     "IMAGE",
     "VIDEO",
     "AUDIO"
]);

var UserProfile = new Class({
    Extends: Entity,
    initialize: function(profile) {
    	this.POSITION_UPDATE_INTERVAL = 60000;
    	this.id = profile.id;
        this.profileName = profile.text;
        this.gender = profile.gender;
        this.maritalStatus = profile.maritalStatus;
        this.description = profile.description;
        this.countryId = profile.countryId;
        this.cityId = profile.cityId;
        this.profileImageUrl = profile.image;
        this.pendingImage = profile.pendingImage;
        this.birthyear = profile.birthyear;
        this.occupationId = profile.occupation ? profile.occupation.id : null;
        this.educationalDegreeId = profile.educationalDegree ? profile.educationalDegree.id : null;
        this.religionId = profile.religion ? profile.religion.id : null;
        this.politicalId = profile.political ? profile.political.id : null;
        this.partnerOccupationId = profile.partnerOccupationId || 0;
        this.partnerEducationalDegreeId = profile.partnerEducationalDegreeId || 0;
        this.partnerReligionId = profile.partnerReligionId || 0;
        this.partnerPoliticalId = profile.partnerPoliticalId || 0;
        this.partnerGender = profile.partnerGender;
        this.bodyTypeId = profile.bodyType ? profile.bodyType.id : null;
        this.hairTypeId = profile.hairType ? profile.hairType.id : null;
        this.skinTypeId = profile.skinType ? profile.skinType.id : null;
        this.eyeColorId = profile.eyeColor ? profile.eyeColor.id : null;
        this.lookingForTypes = profile.lookingForTypes;
        this.partnerBodyTypes = profile.partnerBodyTypes;
        this.partnerHairTypes = profile.partnerHairTypes;
        this.partnerSkinTypes = profile.partnerSkinTypes;
        this.partnerEyeColors = profile.partnerEyeColors;
        this.interests = profile.interests;
        this.profileStatus = profile.status;
        this.positionUpdaterInterval = null;
        this.hasProfileImage = (profile.image !== "") ? true : false;
        this.haveChildren = profile.haveChildren;
        this.media = profile.media;
        if (this.profileStatus === ProfileStatus.GEOONLINE) {
        	if (Utilities.isOnGeoAcceptableDevice()) {
        		this.startPositionUpdater();
        	} else {
        		application.performAction(new ActionRequest("setStatus", {status: ProfileStatus.ONLINE}));
        	}        	
        } else {
        	this.stopPositionUpdater();
        }
    },
    getClassName: function() {
    	return "UserProfile";
    },
    setId: function(id) {
    	this.id = id;
    },
    getId: function() {
    	return this.id;
    },
    hasPendingImage: function() {
    	return this.pendingImage;
    },
    getHasProfileImage: function() {
    	return this.hasProfileImage;
    },
    getDescription: function() {
    	return this.description;
    },
    getProfileName: function() {
    	return this.profileName;
    },
    getLookingForTypes: function() {
    	return this.lookingForTypes;
    },
    setProfileStatus: function(profileStatus) {
    	if (profileStatus === ProfileStatus.GEOONLINE) {
    		this.startPositionUpdater();
    	} else {
    		this.stopPositionUpdater();
    	}
    	this.profileStatus = profileStatus;
    },
    getProfileStatus: function() {
    	return this.profileStatus;
    },
    setProfileName: function(name) {
    	if (typeOf(name) !== "string") {
    		throw new Exception("name parameter is not a string.");
    	}
    	this.profileName = name;
    },
    setGender: function(gender) {
    	if (typeOf(gender) !== "string") {
    		throw new Exception("gender parameter is not a string.");
    	}
    	this.gender = gender;
    },
    getGender: function() {
    	return this.gender;
    },
    getMaritalStatus: function() {
    	return this.maritalStatus;
    },
    setCountry: function(country) {
    	if (!instanceOf(country, Country)) {
    		throw new Exception("country parameter is not a Country instance.");
    	}
    	this.country = country;
    },
    getCountryId: function() {
    	return this.countryId;
    },
    setCity: function(city) {
    	if (!instanceOf(city, City)) {
    		throw new Exception("city parameter is not a City instance.");
    	}
    	this.city = city;
    },
    getCityId: function() {
    	return this.cityId;
    },
    getOccupationId: function() {
    	return this.occupationId;
    },
    getEducationalDegreeId: function() {
    	return this.educationalDegreeId;
    },
    getReligionId: function() {
    	return this.religionId;
    },
    getPoliticalId: function() {
    	return this.politicalId;
    },
    getPartnerBodyTypes: function() {
    	return this.partnerBodyTypes;
    },
    getPartnerHairTypes: function() {
    	return this.partnerHairTypes;
    },
    getPartnerSkinTypes: function() {
    	return this.partnerSkinTypes;
    },
    getPartnerEyeColors: function() {
    	return this.partnerEyeColors;
    },
    getPartnerOccupationId: function() {
    	return this.partnerOccupationId;
    },
    getPartnerEducationalDegreeId: function() {
    	return this.partnerEducationalDegreeId;
    },
    getPartnerReligionId: function() {
    	return this.partnerReligionId;
    },
    getPartnerPoliticalId: function() {
    	return this.partnerPoliticalId;
    },
    getPartnerGender: function() {
    	return this.partnerGender;
    },
    getBodyTypeId: function() {
    	return this.bodyTypeId;
    },
    getHairTypeId: function() {
    	return this.hairTypeId;
    },
    getSkinTypeId: function() {
    	return this.skinTypeId;
    },
    getEyeColorId: function() {
    	return this.eyeColorId;
    },
    getInterests: function() {
    	return this.interests;
    },
    setBirthyear: function(birthyear) {
    	if (typeOf(birthyear) !== "string") {
    		throw new Exception("birthyear parameter is not a string.");
    	}
    	this.birthyear = birthyear;
    },
    getBirthYear: function() {
    	return this.birthyear;
    },
    setProfileImage: function(url) {
    	if (typeOf(url) !== "string") {
    		throw new Exception("url parameter is not a string.");
    	}
    	this.profileImageUrl = url;
    },
    getRandomPosition: function(basis) {
    	var latSpan = 0.04088821669049736;
  		var lngSpan = 0.0858306884765625;
  		return { longitude: position.coords.longitude + lngSpan * Math.random(), latitude: position.coords.latitude + latSpan * Math.random() };
    },
    startPositionUpdater: function() {
    	if (typeOf(this.positionUpdaterInterval) === "null") {
    	  	this.positionUpdaterInterval = setInterval(function() {
    	  		Utilities.getCurrentPosition(function(position) {
    	  			var point = { longitude: position.coords.longitude, latitude: position.coords.latitude };
    	  			application.controller.performAction(new ActionRequest("setPosition", {
        	  			longitude: point.longitude,
        	  			latitude: point.latitude
        	  		}));
    	  		});
    	  	}, this.POSITION_UPDATE_INTERVAL);
    	}
    },
    stopPositionUpdater: function() {
    	clearInterval(this.positionUpdaterInterval);
    	this.positionUpdaterInterval = null;
    }
});
