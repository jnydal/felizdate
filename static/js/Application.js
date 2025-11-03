/**
 * Singleton application instance.
 */
var application = new (new Class({
	Extends: AbstractObject,
	initialize: function(model) {
		this.isStarted = false;
		this.model = new Model();
		this.controller = new Controller(this.model);
		this.view = new View(this.model, this.controller);
	},
	getClassName: function() {
		return "Application";
	},
	start: function() {
		if (this.isStarted) {
			throw new Exception("Application is already started.");
		}
		this.isStarted = true;
		this.view.render();
		this.controller.start();
	},
	publish: function(topic, data) {
		publisher.publish(topic, data)
	},
	subscribe: function(topic, cb) {
		publisher.subscribe(topic, cb);
	},
	performAction: function(request) {
		return this.controller.performAction(request);
	},
	getDomain: function() {
		return this.controller.getServerHandler().getDomain();
	}
}))();
