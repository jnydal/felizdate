var GeoMap = new Class({
    Extends: Component,
    getClassHierarchy: function() {
        return this.parent().append(["GeoMap"]);
    },
    initialize: function() {
    	this.parent();
		var mapStyles = [{
			featureType: "all",
			stylers: [{
				saturation: -80
			}]
		},{
			featureType: "poi.park",
			stylers: [{
				hue: "#00ff23"
			},{
				saturation: 40
			}]
		}];

		this.markers = [];
		
		if (typeOf(google) === "null") {
			alert("google map lib is not loaded!");
		}
		
    	var mapType = new google.maps.StyledMapType(mapStyles, {name: "Map"});
    	this.map = new google.maps.Map(this.getHtmlElement(), {
    		zoom: 13,
    		mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'feliz_map']
    	});
    	this.map.mapTypes.set('map', mapType);
    	this.map.setMapTypeId('map');
    },
    setCurrentPosition: function(position) {
    	var pos = new google.maps.LatLng(position.latitude, position.longitude);		
    	var marker = new google.maps.Marker({
	    	position: pos,
	        map: this.map,
	        title: gettext('Your position')
	    });
		this.map.setCenter(pos);
    },
    deleteAllMarkers: function() {
    	for (var i = this.markers.length - 1; i>=0; i--) {
    		google.maps.event.clearListeners(this.markers[i]);
    		this.markers[i].setMap(null);
    		this.markers.erase(this.markers[i]);
    	}
    },
    addMarker: function(position, icon, text, data, clickFunction) {          
    	var position = new google.maps.LatLng(position[1], position[0]);	
    	var marker = new google.maps.Marker({
	    	position: position,
	        map: this.map,
	        icon: icon,
	        data: data,
	        title: text
	    });
    	google.maps.event.addListener(marker, "click", function() {
    		clickFunction(marker);
    	});
    	this.markers.push(marker);
    	return marker;
    },
    deleteMarker: function(marker) {
    	google.maps.event.clearListeners(marker);
    	this.markers.erase(marker);
    },
    refresh: function() {
    	google.maps.event.trigger(this.map,'resize');
    	this.map.setZoom(this.map.getZoom());
    },
    getGoogleMap: function() {
    	return this.map;
    }
});
