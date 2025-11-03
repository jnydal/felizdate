var BestMatchesForm = new Class({
    Extends: Form,
    getClassHierarchy: function() {
        return this.parent().append(["BestMatchesForm"]);
    },
    initialize: function() {
        this.parent(true);
        //this.basicsMatching = new CheckBoxField(gettext("Basic preferences"), "basics");
        //this.basicsMatching.setRequired(false);
        //this.includeInterests = new CheckBoxField(gettext("Include interests"), "interests");
        //this.includeInterests.setRequired(false);
        //this.addField(this.basicsMatching);
        //this.addField(this.includeInterests);
		this.submitButton.handleClick = function() {
			this.handleSearchRequest();
		}.bind(this);
		this.submitButton.setLabel(gettext("search"));
    },
    handleSearchRequest: function() {
    	// override
    }
});
