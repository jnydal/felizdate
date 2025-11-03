/**
 * PubSub implementation.
 * 
 * Use as general/global transient content update strategy.
 */
var publisher = new (new Class({
	Extends: AbstractObject,
    getClassName: function() {
        return "Publisher";
    },
	initialize: function() {
		this.subscriptors = {};
	},
	publish: function(topic, data) {
		try {
			var callbacks = this.subscriptors[topic];
			for (cb in callbacks) {
				callbacks[cb](data)
			}
		} catch(e) {
			Utilities.log("Publisher: delivery of content to subscriber failed.");
		}
	},
	subscribe: function(topic, cb) {
		if (!this.subscriptors[topic]) {
			this.subscriptors[topic] = [];
		}
		this.subscriptors[topic].push(cb);
		return [topic, cb];
	},
	unsubscribe: function(handle) {
		var topic = handle[0];
		if (this.subscriptors[topic]) {
			for (cb in this.subscriptors[topic]) {
				if (this == handle[1]) {
				    this.subscriptors[topic].splice(idx, 1);
				}
			}
		}
	}
}))();
