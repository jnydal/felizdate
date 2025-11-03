// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Capitalize first letter of string. This one is used to create property names.
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function Enum(constantsList) {
    for (var i = 0; i<constantsList.length; i++) {
        this[constantsList[i]] = i;
    }
};

if (typeof gettext !== "function") {
	gettext = function(key) {
		return key;
	}
}

var Utilities = new function() {
	
	this.getAge = function(userProfile) {
		var now = new Date();
	    return now.getFullYear() - userProfile.birthyear;
	}
	
	this.getMinAge = function(userprofile) {
	    var age = this.getAge(userprofile);
	    if (age < 25) {
	        return 18;
	    }
	    else {
	    	return age - 7;
	    }
	};

	this.getMaxAge = function(userprofile) {
	    var age = this.getAge(userprofile);
	    return age + 7;
	};
	
	this.getDomain = function(url, depth) {
		var parts = url.split(".");
		parts.reverse();
		var result = "";
		for (var i = depth - 1 ; i>=0; i--) {
			if (i == depth) {
				break;
			}
			result = result + "." + parts[i];
		}
		return result;
	};
	
	this.getDomainSuffix = function() {
		var parts = document.domain.split(".");
		parts.reverse();
		if (parts[0] !== 'com') {
			return parts[0].toUpperCase(); 
		}
		return 'EN';
	};
	
	this.getCsrfToken = function() {
		return Cookie.read("csrfmiddlewaretoken");
	};
	
	this.log = function(text) {
		var c = null;
		try {
			c = console;
		} catch (e) {
			
		}
		if (typeOf(c) !== "null") {
			c.log(text);
		}
	}
	var urlRE = /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g;

	this.getDefaultMicroImageUrl = function(gender) {
		if (gender === "F") {
			return "http://dg1h6uvotkrdh.cloudfront.net/s/images/no_image_f_micro.jpg";
		} else {
			return "http://dg1h6uvotkrdh.cloudfront.net/s/images/no_image_m_micro.jpg";
		}
	};
	
	this.getDefaultTumbImageUrl = function(gender) {
		if (gender === "F") {
			return "http://dg1h6uvotkrdh.cloudfront.net/s/images/no_image_f.jpg";
		} else {
			return "http://dg1h6uvotkrdh.cloudfront.net/s/images/no_image_m.jpg";
		}
	};

	this.getDefaultImageUrl = function(gender) {
		if (gender === "F") {
			return "http://dg1h6uvotkrdh.cloudfront.net/s/images/no_image_f_big.jpg";
		} else {
			return "http://dg1h6uvotkrdh.cloudfront.net/s/images/no_image_m_big.jpg";
		}
	};
	
	this.getTruncated = function(text, count) {
		if (text.length > count) {
			return text.substr(0, count) + "...";
		}
		return text;
	};

	// html sanitizer
	this.toStaticHTML = function(inputHtml) { // DEPRICATED use mootools .set("text"
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
				/>/g, "&gt;");
	};

	// pads n with zeros on the left,
	// digits is minimum length of output
	// zeroPad(3, 5); returns "005"
	// zeroPad(2, 500); returns "500"
	this.zeroPad = function(digits, n) {
		n = n.toString();
		while (n.length < digits) {
			n = '0' + n;
		}
		return n;
	};

	// it is almost 8 o'clock PM here
	// timeString(new Date); returns "19:49"
	this.timeString = function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	};
	
	this.formatTime = function(timestamp) {
		var now = new Date();
		var date = new Date(parseInt(timestamp * 1000));
		var difference = (now - date) / 1000;
		if (difference < 60) {
			return ""; //Math.round(difference) + " " + gettext('seconds ago');
		} else if (difference < 3600) {
			return ""; //Math.round(difference / 60) + " " + gettext('minutes ago');
		} else if (difference < 86400) {
			return Math.round(difference / 3600) + " " + gettext('hours ago');
		} else {
			var day = date.getUTCDay();
			var month = date.getUTCMonth();
			var year = date.getUTCFullYear();
			return day + "." + month + "." + year;
		}
	};

	// does the argument only contain whitespace?
	this.isBlank = function(text) {
		var blank = /^\s*$/;
		return (text.match(blank) !== null);
	};

	this.getHtmlMessage = function(text, time, fromYourself) {
		// sanitize
		text = this.toStaticHTML(text);

		// replace URLs with links
		text = text.replace(this.urlRE, '<a target="_blank" href="$&">$&</a>');

		if (fromYourself) {
			return "<div class=\"message recieved\">" + text + "</div>";
		} else {
			return "<div class=\"message\"><span class=\"text\">" + text
					+ "</span><span class=\"date\">" + time + "</span></div>";
		}
	};

	// we want to show a count of unread messages when the window does not have
	// focus
	this.updateTitle = function() {
		if (Async.CONFIG.unread) {
			document.title = "(" + Async.CONFIG.unread.toString() + ") chat";
		} else {
			document.title = "chat";
		}
	};
	
	this.getCurrentPosition = function(successHandler, errorHandler) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				successHandler(position);
			}.bind(this), function() {
				this.log("there were some problems with fetching the position.");
				errorHandler("there were some problems with fetching the position.");
			}.bind(this))
		}
	};
	
	this.getCurrentUTMPosition = function(successHandler, errorHandler) {
		var result = null;
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
		        var xy = [];
				var zone = Math.floor ((position.coords.longitude + 180.0) / 6) + 1;
		        zone = LatLonToUTMXY (DegToRad (position.coords.latitude), DegToRad (position.coords.longitude), zone, xy);
		        successHandler({ x: xy[0], y: xy[1], zone: zone })
			}.bind(this), function() {
				this.log("there were some problems with fetching the position.");
				errorHandler("there were some problems with fetching the position.");
			}.bind(this))
		}
	};
	
	this.getAd = function(gender, keywords, successHandler) {
		var myJSONP = new Request.JSONP({
		    url: 'http://localhost:8080/getAd',
		    callbackKey: 'jsoncallback',
		    data: {
		        gender: gender,
		        keywords: keywords
		    },
		    onSuccess: successHandler
		}).send();
	};
	
	this.isOnGeoAcceptableDevice = function() {
		if (Browser.Platform.ios || Browser.Platform.android || Browser.Platform.webos || Browser.Platform.other) {
			return true;
		}
		return false;
	};
	
	this.isCordova = function() {
	  var r = false;
	  try {
		  r = (typeOf(CordovaAPI) !== "null") ? true : false; 
	  } catch (e) {}
	  return r;
	};
	
	this.isMobile = function() {
	  var index = navigator.appVersion.indexOf("Mobile");
	  return (index > -1);
	};
	
	this.isIPhone = function() {
	  return navigator.userAgent.match(/iPhone/i);
	};
	
	this.isIPad = function() {
		return navigator.userAgent.match(/iPad/i);
	};
	
	this.isAndroid = function() {
	  var isAndroid = navigator.userAgent.match(/android/i); 
	  return isAndroid;
	};
	
	this.isPortable = function() {
	  return this.isMobile() || this.isIPad() || this.isIPhone();
	};
	
	this.getMainEventName = function() {
		if (typeOf(this.mainEventName) === "null") {
			this.mainEventName = "mousedown";
			if (Utilities.isPortable()) {
				this.mainEventName = "touchstart";
			}
		}
		return this.mainEventName;
	};
	
	this.hasCookieSession = function() {
		var sessionId = Cookie.read("sessionid");
		if (typeOf(sessionId) !== "null") {
			return true;
		}
		return false;
	};
	
	this.getErrorMessage = function(messageData) {
		if (typeOf(messageData) === 'string') {
    		return messageData;
    	} else if (typeOf(messageData.message) !== "string") {
        	var message = "";
        	if (typeOf(messageData.errors) === "array") {
        		for (var i = 0; i<messageData.errors.length; i++) {
        			message += messageData.errors[i];
        		}
        		return message;
        	} else {
        		return messageData.errors;
        	}
    	} else if (typeOf(messageData.message) === "string") {
    		return messageData.message;
    	}
	};
	
	this.getExtension = function(url) {
		return url.substr(url.length - 3, url.length).toLowerCase();
	};
	
	this.getMediaWrapper = function(media, first) {
		var result = "";
		var optional = "";
		if (first) {
			optional = " class='slidyCurrent'";
		}
		switch (parseInt(media.type)) {
			case MediaType.IMAGE:
				result = "<figure" + optional + " id='mediaId_" + media.id + "'><img src='" + media.url + "'></figure>";
				break;
			case MediaType.VIDEO:
				var type = "";
				var extension = this.getExtension(media.url);
				if (extension === "mp4") {
					type = "video/mp4";
				} else if (extension === "ogg") {
					type = "video/ogg";
				} else {
					result = gettext("Video is not supported.");
				}
				result = "<figure" + optional + " id='mediaId_" + media.id + "'><video id='video_" + media.id + "' class='video-js vjs-default-skin' controls preload='auto' width='320' height='240' poster='/static/images/my_video_poster.png' data-setup='{}'><source src='" + media.url + "' type='" + type + "'></video></figure>";
				break;
				default:
		}
		return result;
	}
};

/**
 * Class for handling tooltips.
 * 
 */
var TooltipHandler = new function() {
	this.PADDING_COMPENSATION = 23; // to compansate for padding
	this.BOTTOM_RIGHT = 0;
	this.TOP_LEFT = 1;
	this.BOTTOM_LEFT = 2;
	this.TOP_RIGHT = 3;
	this.TOP = 4;
	this.LEFT = 5;
	this.RIGHT = 6;
	this.BOTTOM = 7;
	this.tooltip;
	this.tooltipContext = {};

	var Handler = this;
	
	this.showError = function(element, text, orientation) {
		this._show(element, text, orientation, false, "error");
	};
	
	this.showFieldError = function(element, text) {
		this._show(element, text, this.RIGHT, false, "error");
	};
	
	this.showInfo = function(element, text, orientation) {
		this._show(element, text, orientation, false, "info");
	};
	
	this.showNotification = function(text, offset) {
		this._show(jQuery("#view"), text, this.TOP_RIGHT, true, "notification", offset);
	};
	
	this.isPresent = function(element, text) {
		if (this.tooltipContext.element && this.tooltipContext.text) {
			if (this.tooltipContext.element[0] === element[0] && this.tooltipContext.text === text) {
				return true;
			}
		}
		return false;
	};
	
	this.remove = function(element) {
		var instance;
		if (element) {
			// implement
		} else {
			if (typeOf(this.tooltip) !== "null") {
				jQuery(this.tooltip).animate({marginTop : "-30px", opacity : "0.0"}, "slow", function() {
					jQuery(this).remove();
				});
				this.tooltipContext = {};
			}
		}
	};

	var tooltipRemove = function() {
		jQuery(this).unbind("click", tooltipRemove);
		Handler.remove();
		return false;
	};
	
	this._show = function(element, text, orientation, inset, className, offset) {		
		if (!this.isPresent(element, text)) {

			// remove old tooltip
			this.remove();
	
			this.tooltipContext.element = element;
			this.tooltipContext.text = text;
			
			// show new
			var elementPosition = jQuery(element).offset();
			
			this.tooltip = jQuery("<div class=\"tooltip " + className + "\"><a href=\"#\" class=\"close ui-icon ui-icon-closethick\"></a><span>" + text + "</span></div>");
			this.tooltip.find("a.close").bind("click", tooltipRemove);
			this.tooltip.css('visibility', 'hidden');
			this.tooltip.css('top', '0');
			this.tooltip.css('left', '0');
			jQuery("body").append(this.tooltip);
			var initialTooltipCss = { marginTop : "10px", opacity : "0.4", visibility: "visible" };
			
			if (orientation === this.BOTTOM_RIGHT) {
				var top = elementPosition.top + jQuery(element).height();
				var left = elementPosition.left + jQuery(element).width();
				if (inset) {
					top = top - this.tooltip.height();
					left = left - this.tooltip.width();
				}
				initialTooltipCss['top'] = top;
				initialTooltipCss['left'] = left;
			} else if (orientation === this.TOP_LEFT) {
				var top = elementPosition.top - jQuery(element).height();
				var left = elementPosition.left - jQuery(element).width();
				if (inset) {
					left = left - this.tooltip.width();
				}
				initialTooltipCss['top'] = top;
				initialTooltipCss['left'] = left;
			} else if (orientation === this.BOTTOM_LEFT) {
				var top = elementPosition.top + jQuery(element).height();
				var left = elementPosition.left - jQuery(element).width();
				if (inset) {
					top = top - this.tooltip.height();
					left = left + this.tooltip.width();
				}
				initialTooltipCss['top'] = top;
				initialTooltipCss['left'] = left;
			} else if (orientation === this.TOP_RIGHT) {
				var top = elementPosition.top;
				var left = jQuery(element).width();
				if (inset) {
					left = left - this.tooltip.width() - this.PADDING_COMPENSATION;
				}
				initialTooltipCss['top'] = top;
				initialTooltipCss['left'] = left;
			} else if (orientation === this.TOP) {
				var top = elementPosition.top - jQuery(element).height();
				var left = elementPosition.left;
			} else if (orientation === this.LEFT) {
				var top = elementPosition.top;
				var left = elementPosition.left - jQuery(element).width();
				initialTooltipCss['top'] = top;
				initialTooltipCss['left'] = left;
			} else if (orientation === this.BOTTOM) {
				var top = elementPosition.top + jQuery(element).height();
				var left = elementPosition.left;
			} else if (orientation === this.RIGHT) {
				var top = elementPosition.top;
				var left = elementPosition.left + jQuery(element).width();
			}
			var topOffset = (offset && offset.top) ? offset.top : 0;
			var leftOffset = (offset && offset.left) ? offset.left : 0;
			initialTooltipCss['top'] = initialTooltipCss['top'] + topOffset;
			initialTooltipCss['left'] = initialTooltipCss['left'] + leftOffset;
			
			this.tooltip.css(initialTooltipCss);
			this.tooltip.animate({ marginTop : 0, opacity : "1.0"}, "fast");
		}
	};
};

var Debug = new function() {
	// just a namespace for keeping debug variables so they dont pollute the global namespace...
};

/**
 * Set operation utilities
 */
var SetUtilities = new function() {
	
	function copyInto(s, copy) {
	    for (var item in s) {
	        if (s[item] === true) {
	            copy[item] = true;
	        }
	    }
	};
	
	this.makeSet = function(items) {
	    var set = {};
	    for (var i = 0; i < items.length; i++) {
	        set[items[i]] = true;
	    }
	    return set;
	};
	
	this.union = function(s1, s2) {
	    var u = {};
	    copyInto(s1, u);
	    copyInto(s2, u);
	    return u;
	};
	
	this.intersection = function(s1, s2) {
	    var i = {};
	    for (var item in s1) {
	        if (s1[item] === true && s2[item] === true) {
	            i[item] = true;
	        }
	    }
	    return i;
	};
	
	this.difference = function(s1, s2) {
	    var diff = {};
	    copyInto(s1, diff);
	    for (var item in s2) {
	        if (s2[item] === true) {
	            delete diff[item];
	        }
	    }
	    return diff;
	};
};

/**
 * Utility method to open new window with POST method.
 */
function openWindowWithPost(url, name, payload) {
	var newWindow = window.open(url, name);
	if (!newWindow) return false;	
	
	var htmlRootElem = new Element('html');
	var headElem = new Element('head');
	var bodyElem = new Element('body');
	var formElem = new Element('form', {id: 'formid', method: 'POST', action: url});
	var scriptElem = new Element('script', {type: 'text/javascript', 'html': 'document.getElementById(\"formid\").submit()'});
	//set up the document of elements
	headElem.inject(htmlRootElem);
	bodyElem.inject(htmlRootElem);
	formElem.inject(bodyElem);
	scriptElem.inject(bodyElem);	
	for (var key in payload) {
	    var value = payload[key];
	    var stringValue;
	    if ((typeOf(value) == "array") || (typeOf(value) == "object")) {
	    	stringValue = JSON.encode(value);
	    } else {
	    	stringValue = value;		        
	    }	    
	    var inputElem = new Element('input', {type: 'hidden', name:  key, value: stringValue});
	    inputElem.inject(formElem);	    
	}
	
	newWindow.document.write(htmlRootElem.get('html'));
	return newWindow;
}

/**
 * Class for handling tooltips.
 * 
 */
/*
var TooltipHandler = new function() {
	var HORIZONTAL_FIELD_OFFSET = 20;

	function remove(element) {
		var tooltipId = $(element).data("tooltipId");
		if (typeof tooltipId === "string") {
			$("#" + tooltipId).animate({marginTop : "-30px", opacity : "0.0"}, "slow", function() {
				$(this).remove();
				$(element).data("tooltipId",undefined)
			});
		}
	};

	this.showFieldError = function(element, text) {
		remove(element); // remove old first
		var tooltipId = $(element).attr("name") + "_tooltip";
		var tooltip = $("<div id=\"" + tooltipId + "\" class=\"tooltip fielderror\"><span>" + text + "</span></div>");
		$(element).data("tooltipId", tooltipId);
		
		var pos = $(element).offset();
		pos.left += $(element).width();
		pos.left += HORIZONTAL_FIELD_OFFSET;
		
		var initialTooltipStyle = { 
									left : pos.left,
									top : pos.top,
									marginTop : "10px",
									opacity : "0.4"
								};
		
		var tooltipStyle = { marginTop : 0, opacity : "1.0"};

		$(tooltip).css(initialTooltipStyle);
		$("body").append(tooltip);
		$("#" + tooltipId).animate(tooltipStyle, "fast");
	};
	
	this.remove = function(element) {
		remove(element);
	};
};
*/
/*
* Returns a description of this past date in relative terms.
* Takes an optional parameter (default: 0) setting the threshold in ms which
* is considered "Just now".
*
* Examples, where new Date().toString() == "Mon Nov 23 2009 17:36:51 GMT-0500 (EST)":
*
* new Date().toRelativeTime()
* --> 'Just now'
*
* new Date("Nov 21, 2009").toRelativeTime()
* --> '2 days ago'
*
* // One second ago
* new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime()
* --> '1 second ago'
*
* // One second ago, now setting a now_threshold to 5 seconds
* new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime(5000)
* --> 'Just now'
*
*/
Date.prototype.toRelativeTime = function(now_threshold) {
 var delta = new Date() - this;

 now_threshold = parseInt(now_threshold, 10);

 if (isNaN(now_threshold)) {
   now_threshold = 0;
 }

 if (delta <= now_threshold) {
   return 'Just now';
 }

 var units = null;
 var conversions = {
   millisecond: 1, // ms    -> ms
   second: 1000,   // ms    -> sec
   minute: 60,     // sec   -> min
   hour:   60,     // min   -> hour
   day:    24,     // hour  -> day
   month:  30,     // day   -> month (roughly)
   year:   12      // month -> year
 };

 for (var key in conversions) {
   if (delta < conversions[key]) {
     break;
   } else {
     units = key; // keeps track of the selected key over the iteration
     delta = delta / conversions[key];
   }
 }

 // pluralize a unit when the difference is greater than 1.
 delta = Math.floor(delta);
 if (delta !== 1) { units += "s"; }
 return [delta, units].join(" ");
};

/*
* Wraps up a common pattern used with this plugin whereby you take a String
* representation of a Date, and want back a date object.
*/
Date.fromString = function(str) {
 return new Date(Date.parse(str));
};
