var AdvancedForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["AdvancedForm"]);
    },
    initialize: function(model, init) {
    	this.userSessionModel = model.getUserSessionModel();
    	this.optionModel = model.getOptionModel();
    	this.userSessionModel.addObserver(this);
        model.addObserver(this);
        init = init || false;
    	this.parent(init);
		this.geoCodes = null;
	    var appearanceSection = new FormSection(gettext("Appearance"));
		    var appearanceGroup = new FieldGroup();
	    	this.body = new SelectBox(gettext("Body"), "body");
	    	this.hair = new SelectBox(gettext("Hair"), "hair");
	    	this.skin = new SelectBox(gettext("Skin"), "skin");
	    	this.eyes = new SelectBox(gettext("Eyes"), "eyeColor");
	    	/*this.body.setRequired(true);
	    	this.hair.setRequired(true);
	    	this.skin.setRequired(true);
	    	this.eyes.setRequired(true);*/
	    	appearanceGroup.addField(this.body);
	    	appearanceGroup.addField(this.hair);
	    	appearanceGroup.addField(this.skin);
	    	appearanceGroup.addField(this.eyes);
	    	appearanceGroup.setGrid(Grid.QUAD);
	    appearanceSection.addGroup(appearanceGroup);
    	this.professionSection = new FormSection(gettext("Profession"));
	    	var educationGroup = new FieldGroup();
	    	this.occupation = new SelectBox(gettext("Occupation"), "occupation");
	    	this.educationalDegree = new SelectBox(gettext("Educational degree"), "education");
	    	/*this.occupation.setRequired(true);
	    	this.educationalDegree.setRequired(true);*/
	    	educationGroup.addField(this.occupation);
	    	educationGroup.addField(this.educationalDegree);
	    	educationGroup.setGrid(Grid.QUAD);
	    	this.professionSection.addGroup(educationGroup);
	    this.politicalSection = new FormSection(gettext("Political"));
		    var politicalGroup = new FieldGroup();
	    	this.political = new SelectBox(gettext("Political alignment"), "political");
	    	this.religion = new SelectBox(gettext("Religion"), "religion");
	    	/*this.political.setRequired(true);
	    	this.religion.setRequired(true);*/
	    	politicalGroup.addField(this.political);
	    	politicalGroup.addField(this.religion);
	    	politicalGroup.setGrid(Grid.QUAD);
	    	this.politicalSection.addGroup(politicalGroup);
		var partnerPreferencesSection = new FormSection(gettext("Partner preferences"));
		    var partnerBasics = new FieldGroup();
	    	this.partnerOccupation = new SelectBox(gettext("Occupation"), "partnerOccupation");
	    	this.partnerEducationalDegree = new SelectBox(gettext("Educational degree"), "partnerEducation");
	    	//this.partnerGender.setRequired(false);
	    	//this.partnerOccupation.setRequired(false);
	    	//this.partnerEducationalDegree.setRequired(false);
	    	partnerBasics.addField(this.partnerOccupation);
	    	partnerBasics.addField(this.partnerEducationalDegree);
	    	partnerBasics.setGrid(Grid.QUAD);
		    
	    	var partnerPolitical = new FieldGroup();
	    	this.partnerPolitical = new SelectBox(gettext("Political alignment"), "partnerPolitical");
	    	this.partnerReligion = new SelectBox(gettext("Religion"), "partnerReligion");
	    	//this.partnerPolitical.setRequired(false);
	    	//this.partnerReligion.setRequired(false);
	    	partnerPolitical.addField(this.partnerPolitical);
	    	partnerPolitical.addField(this.partnerReligion);
	    	partnerPolitical.setGrid(Grid.QUAD);
	    	
	    	this.partnerBody = new CheckboxGroup(gettext("Body"), "partnerBody");
	    	this.partnerBody.setGrid(Grid.HEXA);
	    	this.partnerSkin = new CheckboxGroup(gettext("Skin"), "partnerSkin");
	    	this.partnerSkin.setGrid(Grid.HEXA);
	    	this.partnerHair = new CheckboxGroup(gettext("Hair"), "partnerHair");
	    	this.partnerHair.setGrid(Grid.HEXA);
	    	this.partnerEyes = new CheckboxGroup(gettext("Eyes"), "partnerEyes");
	    	this.partnerEyes.setGrid(Grid.HEXA);
	    this.interestsSection = new InterestSection(gettext("Interests"));
	    this.interestsSection.registerInterest = this.registerInterest.bind(this);
	    
	    partnerPreferencesSection.addGroup(partnerBasics);
	    partnerPreferencesSection.addGroup(partnerPolitical);
	    partnerPreferencesSection.addGroup(this.partnerBody);
	    partnerPreferencesSection.addGroup(this.partnerSkin);
	    partnerPreferencesSection.addGroup(this.partnerHair);
	    partnerPreferencesSection.addGroup(this.partnerEyes);
	    
	    var otherSection = new FormSection(gettext("Other"));
	    var otherFieldGroup = new FieldGroup();
	    
    	this.withoutChildren = new CheckBoxField(gettext("Have children"), "haveChildren");
    	this.withoutChildren.setRequired(false);
    	otherFieldGroup.addField(this.withoutChildren);
    	otherSection.addGroup(otherFieldGroup);
	    
	    this.addSection(appearanceSection);
    	this.addSection(this.professionSection);
    	this.addSection(this.politicalSection);
    	this.addSection(partnerPreferencesSection);
    	this.addSection(this.interestsSection);
    	this.addSection(otherSection);
    },
    registerInterest: function(interest, category) {
    	application.performAction(new ActionRequest("saveInterest", {interest: interest, category: category}));
    },
    refresh: function() {
    	var userProfile = this.userSessionModel.getUserProfile();
    	if (typeOf(userProfile) !== "null") {
	    	this.body.setSelected(userProfile.getBodyTypeId());
	    	this.hair.setSelected(userProfile.getHairTypeId());
	    	this.skin.setSelected(userProfile.getSkinTypeId());
	    	this.eyes.setSelected(userProfile.getEyeColorId());
	    	
	    	this.occupation.setSelected(userProfile.getOccupationId());
	    	this.educationalDegree.setSelected(userProfile.getEducationalDegreeId());
	    	this.religion.setSelected(userProfile.getReligionId());
	    	this.political.setSelected(userProfile.getPoliticalId());
	    	
	    	this.partnerBody.setData(userProfile.getPartnerBodyTypes());
	    	this.partnerHair.setData(userProfile.getPartnerHairTypes());
	    	this.partnerSkin.setData(userProfile.getPartnerSkinTypes());
	    	this.partnerEyes.setData(userProfile.getPartnerEyeColors());
	    	
	    	this.partnerOccupation.setSelected(userProfile.getPartnerOccupationId());
	    	this.partnerEducationalDegree.setSelected(userProfile.getPartnerEducationalDegreeId());
	    	this.partnerReligion.setSelected(userProfile.getPartnerReligionId());
	    	this.partnerPolitical.setSelected(userProfile.getPartnerPoliticalId());
	    	this.interestsSection.populate(userProfile.getInterests());
	    	
	    	this.withoutChildren.setChecked(userProfile.haveChildren);
    	}
    },
	handleModelEvent: function(event) {
	    if (!instanceOf(event, ModelEvent)) {
	        throw new Exception("event parameter is not a ModelEvent instance.");
	    }
	    switch (event.getType()) {
	    	case "OPTIONS_LOADED":
	    		this.occupation.populate(this.optionModel.getOccupations());
	    		this.educationalDegree.populate(this.optionModel.getEducationalDegrees());
	    		this.political.populate(this.optionModel.getPolitical());
	    		this.religion.populate(this.optionModel.getReligions());
	    		this.body.populate(this.optionModel.getBodyTypes());
	    		this.hair.populate(this.optionModel.getHairTypes());
	    		this.skin.populate(this.optionModel.getSkinTypes());
	    		this.eyes.populate(this.optionModel.getEyeColors());
	    		this.partnerOccupation.populate(this.optionModel.getOccupations());
	    		this.partnerEducationalDegree.populate(this.optionModel.getEducationalDegrees());
	    		this.partnerPolitical.populate(this.optionModel.getPolitical());
	    		this.partnerReligion.populate(this.optionModel.getReligions());
	    		this.partnerBody.populate(this.optionModel.getBodyTypes());
	    		this.partnerHair.populate(this.optionModel.getHairTypes());
	    		this.partnerSkin.populate(this.optionModel.getSkinTypes());
	    		this.partnerEyes.populate(this.optionModel.getEyeColors());
	    		this.refresh();
	    		break;
	    	case "INTEREST_SAVED":
	    		var suggestion = new Suggestion(this, event.payload.id, event.payload.text, event.payload.category);
	    		this.interestsSection.addInterest(suggestion);
	    		break;
	        case "LOGIN":
				break;
	        case "LOGOUT":
	            break;
	            default:
	    }
	},
	loadProfile: function(user, type) {

	}
});
