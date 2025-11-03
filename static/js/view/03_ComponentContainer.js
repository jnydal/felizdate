var ComponentContainer = new Class({
	Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["ComponentContainer"]);
    },
	initialize: function(id) {
	    this.parent();
	    this.units = {};
	    
	    if (typeOf(id) !== "null") {
	    	this.parent(id);
	    }
	},
	/**
	 * Component specific API.
	 * 
	 * 
	 */
    addComponent: function(component, key) {
    	if (instanceOf(component, Component)) {
	    	if (key) {
	        	this.units[key] = component;
	    	} else {
	    		this.units[Object.getLength(this.units)] = component;
	    	}
	    	component.renderTo(this.getHtmlElement());
    	}
    },
    removeComponent: function(component) {
    	for (c in this.units) {
    		if (c === component) {
    			this.units[c] = undefined;
    		}
    	}
    	component.unrender();
    },
    removeComponentByKey: function(key) {
    	this.units[key].unrender();
    	this.units[key] = undefined;
    },
    showOnlyComponent: function(key) {
    	this.hideAll();
    	this.units[key].show();
    },
    hideAllComponents: function() {
    	for (c in this.units) {
    		if (instanceOf(this.units[key], Component)) {
        		this.units[key].hide();
        	}
    	}
    },
    showAllComponents: function() {
    	for (c in this.units) {
    		if (instanceOf(this.units[key], Component)) {
        		this.units[key].show();
        	}
    	}
    },
    getComponentByKey: function(key) {
    	return this.units[key];
    },
    /**
     * Element specific API.
     * 
     * 
     */
    addElement: function(element, key) {
    	if (instanceOf(element, Element)) {
	    	if (key) {
	        	this.units[key] = element;
	    	} else {
	    		this.units[Object.getLength(this.units)] = element;
	    	}
	    	this.getHtmlElement().adopt(element);
    	}
    },
    removeElement: function(element) {
    	for (c in this.units) {
    		if (c === element) {
    			this.units[c] = undefined;
    		}
    	}
    	element.destroy();
    },
    /**
     * General API.
     * 
     * 
     */
    add: function(element, key) {
    	if (instanceOf(element, Component)) {
	    	this.addComponent(element, key);
    	} else if (instanceOf(element, Element)) {
    		this.addElement(element, key);
    	}
    },
    remove: function(element) {
    	if (instanceOf(element, Component)) {
	    	this.removeComponent(element);
    	} else if (instanceOf(element, Element)) {
    		this.removeElement(element);
    	}
    },
    removeByKey: function(key) {
    	if (instanceOf(this.units[key], Component)) {
    		this.units[key].unrender();
    	} else if (instanceOf(this.units[key], Element)) {
    		this.units[key].destroy();
    	}
    	this.units[key] = undefined;
    },
    hideAll: function() {
    	for (c in this.units) {
    		if (instanceOf(this.units[c], Component)) {
        		this.units[c].hide();
        	} else if (instanceOf(this.units[c], Element)) {
        		this.units[c].addClass("hidden");
        	}
    	}
    },
    showAll: function() {
    	for (c in this.units) {
    		if (instanceOf(this.units[c], Component)) {
        		this.units[c].show();
        	} else if (instanceOf(this.units[c], Element)) {
        		this.units[c].removeClass("hidden");
        	}
    	}
    },
    showOnly: function(key) {
    	this.hideAll();
		if (instanceOf(this.units[key], Component)) {
    		this.units[key].show();
    	} else if (instanceOf(this.units[key], Element)) {
    		this.units[key].removeClass("hidden");
    	}
    },
    getByKey: function(key) {
    	return this.units[key];
    },
    getAll: function() {
    	var result = [];
    	for (c in this.units) {
    		result.push(this.units[c]);
    	}
    	return result;
    },
    /**
     * Other
     * 
     * 
     */
    beforeUnrender: function() {
        for (c in this.units) {
    		if (instanceOf(this.units[key], Component)) {
    			this.units[c].unrender();
        	} else if (instanceOf(this.units[key], Element)) {
        		this.units[key].destroy();
        	}
        }
        this.units[c] = null;
    },
    getFirst: function() {
        for (c in this.units) {
            return this.units[c];
        }
    },
    toString: function() {
    	return this.getClassName() + ':<htmlId="' + this.htmlId + '",size=' + this.units.length + '>';
    },
    /**
     * This is a special case override function for setting width as attributes like width usually is handled via css.
     * Use with awareness.
     */
    setWidth: function(newWidth) {
    	this.getHtmlElement().set('styles', {
    	    width: newWidth
    	});
    }
});
