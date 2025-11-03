var ObservableModelObject = new Class({
	Extends: AbstractObject,
	getClassName: function() {
		return "ObservableModelObject";
	},
	addObserver: function(observer) {
		if (typeof observer !== "object") {
			throw new Exception("Expected observer to be an object, but was: <" + observer + ">.");
		} else if (typeof observer.handleModelEvent !== "function") {
			throw new Exception("Observer does not implement handleModelEvent: <" + observer + ">.");
		} else if (this.observers === undefined) {
			this.observers = [];
		}
		this.observers.push(observer);
	},
	removeObserver: function(observer) {
		this.observers.erase(observer);
	},
	notifyObservers: function(eventType, payload) {
		if (typeOf(this.observers) !== "null") {
			var event = new ModelEvent(this, eventType, payload);
			for (var i = 0; i < this.observers.length; ++i) {
				this.observers[i].handleModelEvent(event);
			}
		}
	},
	destroy: function() {
		beforeDestroy();
		notifyObservers("destroyed");
		this.observers.empty();
	},
	beforeDestroy: function() {
	}
});
