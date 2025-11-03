var Page = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["Page"]);
    },
    initialize: function() {
        this.parent();
        this.parentComponent = null;
        this.addCssClass("Page");
    },
    getName: function() {
        return gettext(this.getClassName());
    },
    getNumberOfOpenItems: function() {
        return this.numberOfOpenItems;
    },
    getIconClass: function() {
        return this.getClassName() + "Icon";
    },
    showCropDialogWindow: function(image, local) {
    	new CropDialogWindow(image);
    },
    showErrorDialogWindow: function(text, local) {
    	application.view.showErrorDialog(text);
    },
    showProfileDialogWindow : function(profile, local) {
    	new ProfileDialogWindow();
    },
    setParentComponent: function(parentComponent) {
        this.parentComponent = parentComponent;
    },
    getParentComponent: function() {
        return this.parentComponent;
    },
    refreshSize: function(width, height) {
    }
});
