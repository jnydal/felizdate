/**
 * 
 * jValidate plugin v1.0
 * 
 * Requires TooltipHandler.
 * 
 * Licenced under MIT, GPL2
 * 
 * 2011 Jørund Nydal
 */
(function($) {

	/** 
	 * entry method
	 * 
	 * @param onFieldErrorRemoved(element) : callback function after error state has been removed from field.
	 */
	$.fn.jvalidate = function(options) {
		// executed on validation
		debug(this);
		// build main options before element iteration
		var opts = $.extend({ onFieldErrorRemoved : function(e) {}},$.fn.jvalidate.defaults, options);
		// iterate and reformat each matched element
		var result = true;
		var context = $(this);
		var inputElements = $(this).find("input[required],select[required],textarea");

		function removeErrorState(e) {
			$(e.target).removeClass("error");
			TooltipHandler.remove(e)
			opts.onFieldErrorRemoved(e.target);
		};

		function clearOnWrite(e) {
			if (e.keyCode !== 13) {
				removeErrorState(e);
			}
		};

		inputElements.each(function() {
			$this = $(this);

			// reset states to default
			removeErrorState({ target : $this });

			if (!$this.jvalidate.validate(context)) {
				result = false;
			}

			// bind event handlers if not bound.
			$this.unbind('keyup', clearOnWrite).keyup(clearOnWrite);
			$this.unbind('mousedown', removeErrorState).mousedown(removeErrorState);
		});
		return result;
	};

	/**
	 * for debug
	 * 
	 * @param $obj
	 */
	function debug($obj) {
		if (window.console && window.console.log) {
			window.console.log('elements: ' + $obj);
		}
	};

	/**
	 * main validation
	 */
	$.fn.jvalidate.validate = function(context) {
		var result = true;
		// validate passwords
		if ($this.is("input") && ($this.attr('type') === "password")) {
			if ($this.val().length < $this.attr('minlength')) {
				result = false;
			}
			if (String($this.attr('data-equals')) != "undefined") {
				if (!$this.jvalidate.verifyPassword(context)) {
					result = false;
				}
			}
		}
		// validate inputs
		if ($this.is("input") && ($this.attr('type') === "text")
				&& ($this.val().length < $this.attr('minlength'))) {
			result = false;
		}
		if ($this.is("input") && ($this.attr('type') === "text") && $this.val().length === 0) {
			result = false;
		}
		if ($this.is("input") && ($this.attr('type') === "File") && $this.val().length === 0) {
			result = false;
		}
		// validate email
		if (($this.is("input") && ($this.attr('type') === "email"))) {
			if (!$this.jvalidate.validateEmail()) {
				result = false;
			}
		}
		// validate checkboxes
		if ($this.is("input") && ($this.attr('type') === "checkbox")) {
			if (!$this.is(":checked")) {
				result = false;
			}
		}
		// validate selectboxes
		if ($this.is("select")) {
			var value = $this.val();
			if (value == "-1") {
				result = false;
			}
		}
		if ($this.is("textarea") && $this.val().length < $this.attr('minlength')) {
			result = false;
		}
		if ($this.is("textarea")) {
			var value = $this.val();
			if (value === "") {
				result = false;
			}
		}
		// update status of element
		if (result === true) {
			$this.removeClass('error');
		} else {
			$this.addClass('error');
		}
		return result;
	};

	/**
	 * validate email
	 */
	$.fn.jvalidate.validateEmail = function() {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		return $this.val().match(re)
	};

	/**
	 * verify password
	 */
	$.fn.jvalidate.verifyPassword = function(context) {
		var passwordField = String($this.attr("data-equals"));
		var password = $(context).find("input[name=" + passwordField + "]").val();
		var validatePassword = $this.val();
		return (validatePassword === password);
	};
})(jQuery);

(function($){
	
	/**
	 * jQuery Password strength plugin v1.0
	 * 
	 * Licenced under MIT, GPL2
	 * 
	 * 2011 Jørund Nydal
	 */
	$.fn.pwStrength = function(options) {  

		var CLASS_NAME = "testresult";
		
		var defaults = {
			weak: 	{
				text : gettext("Weak"),
				className : "weak"
			},
			ok:		{
				text : gettext("Ok"),
				className : "ok"
			},
			strong:	{
				text : gettext("Strong"),
				className : "strong"
			}
			
		};

		var opts = $.extend(defaults, options);  

		function eventHandler(e) {
			var field = $(e.target);
			if (field.val().length > 0) {
				// check strength
				var result = $.fn.pwStrength.teststrength($(this).val(), opts);
				
				// remove old
				$(this).next("." + CLASS_NAME).remove();
				
				// insert new
				$(this).after("<span class=\""+CLASS_NAME+" " + result.className + "\">" + result.text + "</span>");
			} else {
				// remove old
				$(this).next("." + CLASS_NAME).remove();
			}
		};
		
		return this.each(function() { 
			var field = $(this);
			$(field).unbind("keyup",eventHandler).keyup(eventHandler);
		});
	};
	
	$.fn.pwStrength.teststrength = function(password, opts) {
		var score = 0; 

		// password < 4
		if (password.length < 4 ) { return opts.weak; }

		// password length
		score += password.length * 4;
		score += ( $.fn.pwStrength.checkRepetition(1,password).length - password.length ) * 1;
		score += ( $.fn.pwStrength.checkRepetition(2,password).length - password.length ) * 1;
		score += ( $.fn.pwStrength.checkRepetition(3,password).length - password.length ) * 1;
		score += ( $.fn.pwStrength.checkRepetition(4,password).length - password.length ) * 1;

		// password has 3 numbers
		if (password.match(/(.*[0-9].*[0-9].*[0-9])/)){ score += 5;} 

		// password has 2 symbols
		if (password.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)){ score += 5 ;}

		// password has Upper and Lower chars
		if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)){  score += 10;} 

		// password has number and chars
		if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)){  score += 15;} 
		//
		// password has number and symbol
		if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)){  score += 15;} 

		// password has char and symbol
		if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)){score += 15;}

		// password is just a numbers or chars
		if (password.match(/^\w+$/) || password.match(/^\d+$/) ){ score -= 10;}

		// verifying 0 < score < 100
		if ( score < 0 ){score = 0;} 
		if ( score > 100 ){  score = 100;} 

		if (score < 34 ){ return opts.weak;} 
		if (score < 68 ){ return opts.ok;}

		return opts.strong;
	};
	
	$.fn.pwStrength.checkRepetition = function(pLen,str) {
		var res = "";
		for (var i=0; i<str.length ; i++ ) 
		{
			var repeated=true;

			for (var j=0;j < pLen && (j+i+pLen) < str.length;j++){
				repeated=repeated && (str.charAt(j+i)==str.charAt(j+i+pLen));
			}
			if (j<pLen){repeated=false;}
			if (repeated) {
				i+=pLen-1;
				repeated=false;
			}
			else {
				res+=str.charAt(i);
			}
		}
		return res;
	};
	
})(jQuery); 