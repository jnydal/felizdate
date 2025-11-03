var Component = new Class({
    Extends: AbstractObject,
    getClassName: function() {
        return this.getClassHierarchy().getLast();
    },
    getClassHierarchy: function() {
        return this.parent();
    },
    initialize: function(htmlId) {
        if (typeOf(htmlId) === "string") {
            this.htmlId = htmlId;
        } else if (typeOf(htmlId) === "null") {
            this.htmlId = htmlIdGenerator.generateId();            
        } else {
            throw new Exception("Invalid HTML id: " + htmlId);
        }
        this.htmlElement = new Element(this.getRootElementTypeName(), {"id": this.htmlId, "class": this.getClassHierarchy().toString().replace(/,/gi, " ") });
        this.rendered = false;
        this.scrollable = null;
    },
    removeClasses: function() {
    	this.getHtmlElement().set("class", this.getClassHierarchy().toString().replace(/,/gi, " "));    	
    },
    getRootElementTypeName: function() {
        return "div";
    },
    setScrollable: function(flag) {
    	if (flag) {
    		if (!Browser.ie && !Utilities.isPortable()) {
    			this.scrollable = new Scrollable(this.getHtmlElement());
    		} else {
    			this.getHtmlElement().set("style", "overflow:hidden;overflow-y:auto");
    		}
    	} else {
    		if (!Browser.ie && !Utilities.isPortable()) {
    			this.scrollable = null;
    		} else {
    			this.getHtmlElement().set("style", "overflow:hidden");
    		}
    	}
    },
    hide: function() {
    	this.addCssClass("hidden");
    },
    show: function() {
    	this.removeCssClass("hidden");
    },
    getHtmlElement: function() {
        if (typeOf(this.htmlElement) === "null") {
            throw new Exception("Component is not rendered.");
        }
        return this.htmlElement;
    },
    getHtmlId: function() {
        return this.htmlId;
    },
    setParentComponent: function(parentComponent) {
    	if (!instanceOf(parentComponent, Component)) {
    		throw new Exception("parentComponent parameter is not a Component instance.");
    	}
    	this.parentComponent = parentComponent;
    },
    getParentComponent: function() {
    	return this.parentComponent;
    },
    renderTo: function(target) {
    	if (this.rendered) {
            throw new Exception("Element is already rendered.");
        }
    	if (instanceOf(target, Component)) {
    		target.getHtmlElement().adopt(this.htmlElement);
    	} else if (instanceOf(target, Element)) {
    		target.adopt(this.htmlElement);
    	} else if (!instanceOf(target, Element)) {
        	// we're probably dealing with ie7/8. Trying to render.
        	if (typeOf(target) !== "element") {
        		throw new Exception("Target element is not a DOM element.");
        	}
        	target.adopt(this.htmlElement);
        }
        this.rendered = true;
    },
    isRendered: function() {
        return this.rendered;
    },
    isVisiblyRendered: function() {
        return $(this.htmlId) !== null;
    },
    beforeUnrender: function() {
    },
    unrender: function() {
        if (!this.rendered) {
            throw new Exception("Component is not rendered.");
        }
        var element = this.getHtmlElement();
        this.beforeUnrender();
        this.rendered = false;
        element.destroy();
        this.htmlElement = null;
    },
    addCssClass: function(cssClassName) {
        this.validateCssClassName(cssClassName);
        this.getHtmlElement().addClass(cssClassName);
    },
    removeCssClass: function(cssClassName) {
        this.validateCssClassName(cssClassName);
        this.getHtmlElement().removeClass(cssClassName);
    },
    hasCssClass: function(cssClassName) {
        return this.getHtmlElement().hasClass(cssClassName);
    },
    validateCssClassName: function(cssClassName) {
        if (typeOf(cssClassName) != "string") {
            throw new Exception("Expected string value for CSS class name, but was: <" + cssClassName + ">.");
        } else if (this.getClassName() === cssClassName) {
            throw new Exception("Reserved CSS class name: <" + cssClassName + ">.");
        }
    }.protect(),
    toString: function() {
        return this.getClassName() + ":" + this.htmlId;
    },
    getCalculatedWidth: function() {
    	return this.getHtmlElement().getSize().x;
    },
    getCalculatedHeight: function() {
    	return this.getHtmlElement().getSize().y;
    }
});

/**
 * Singleton for generating unique HTML identifiers.
 */
var htmlIdGenerator = new (new Class({
    Extends: AbstractObject,
    initialize: function() {
        this.nextId = 0;
    },
    getClassName: function() {
        return "HtmlIdGenerator";
    },
    generateId: function() {
        return "item" + this.nextId++;
    }
}))();
