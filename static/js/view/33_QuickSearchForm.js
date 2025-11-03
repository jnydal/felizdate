var QuickSearchForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["QuickSearchForm"]);
    },
    initialize: function() {
        this.parent(true);
        
		this.gender = new SelectBox(gettext("Gender"), "gender");
		this.gender.addOption("M", gettext("male"));
		this.gender.addOption("F", gettext("female"));
		this.gender.setRequired(true);
		
        this.agerange = new SelectBox(gettext("Age"), "agerange");
        this.agerange.addOption(0, gettext("18-25"));
        this.agerange.addOption(1, gettext("25-32"));
        this.agerange.addOption(2, gettext("32-39"));
        this.agerange.addOption(3, gettext("39-46"));
        this.agerange.addOption(4, gettext("46-53"));
        this.agerange.addOption(5, gettext("53-60"));
        this.agerange.addOption(6, gettext("60-67"));
        this.agerange.setRequired(true);
        
        this.gender.setSelected("F");
        this.agerange.setSelected(0);
    	
		var basicsfieldGroup = new FieldGroup();
		
		basicsfieldGroup.addField(this.gender);
		basicsfieldGroup.addField(this.agerange);
		
		this.addGroup(basicsfieldGroup);
		
		this.handleSubmit = function() {
			this.handleSearchRequest();
		}.bind(this);
		this.setSubmitButtonLabel(gettext("Search"));
    },
    handleSearchRequest: function() {
    	// override
    }
});
