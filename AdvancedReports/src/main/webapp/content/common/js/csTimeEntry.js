//# sourceURL=CSTimeEntry
/* globals ScreenPrefs, Dates, Content, Validation, Utils */
/* exported CSTimeEntry, TimeInput */

var CSTimeEntry = (function() {
  "use strict";
  
  return {
    convertDurationString: function(str, durationFormatOverride, durationMask, hideAlerts) {
      if (durationMask == null) {
        durationMask = 'duration';
      }
      var validationClass = durationMask;
      var skipDurationCheck = false;
      switch (durationFormatOverride) {
        case ('duration_format_H'):
          validationClass = 'decimal';
          break;
        case ('duration_format_HM'):
          validationClass = durationMask;
          skipDurationCheck = true;
          break;
        case ('duration_format_M'):
          validationClass = 'int';
          break;      
      }   
      
      var isValid = Validation.validate(validationClass, null, (hideAlerts != null ? !hideAlerts : null), str, skipDurationCheck);
      var h = 0;
      var m = 0;     
      if (durationFormatOverride == null) {
        switch (ScreenPrefs.durFormat) {
          case ('duration_format_H'):
            validationClass = 'decimal';
            break;
          case ('duration_format_HM'):
            validationClass = durationMask;          
            break;
          case ('duration_format_M'):
            validationClass = 'int';
            break;      
        }
      }
      if (isValid) {
        var isNegative = false;
        if (str.indexOf('-') === 0){
          str = str.substr(1);
          isNegative = true;
        }
        
        if (validationClass == durationMask) {
          var hourMinute = interpretDuration(str);
          h = hourMinute.hours;
          m = hourMinute.minutes;
        }
        else if (validationClass == 'decimal') {
          h = Math.floor(parseFloat(str));
          m = (parseFloat(str) - h) * 60;          
        }
        else if (validationClass == 'int') {
          h = Math.floor(parseFloat(str) / 60);
          m = parseFloat(str) % 60;
        }
        
        if (isNegative){
          h = h * -1;
          m = m * -1;
        }
      }
      
      return { hours:h, minutes:m, totalMinutes:((h*60)+m), isValid:isValid };
    },
    
    convertTimeString: function(timeStr){
      return interpretTime(timeStr);
    },
    
    eof: 0
  };
  
    function sanitizeLeadingZeros(val) {
      while (val.charAt(0) == '0' && val.length > 1) {
        val = val.substring(1, val.length);
      }        

      return parseInt(val, 10);
    }
  
	function interpretDuration(durationStr){
	  return parseHourMinute(durationStr);
	}
	
	function interpretTime(timeStr){
	  var hourMinute = "";
	  var isAmPm = Validation.validate("amPmTime", null, false, timeStr);
	  if (isAmPm){
	    hourMinute = interpretAmPmTime(timeStr);
	  } else {
	    hourMinute = interpretMilitaryTime(timeStr);
	  } 
	  return hourMinute;
	}
	
	function interpretAmPmTime(amPmTimeStr){
	  var isAm = false;
	  if (amPmTimeStr.toLowerCase().indexOf("a") > -1){
	    isAm = true;
	  }
	
	  var hourMinute = parseHourMinute(amPmTimeStr);	
	  var hour = hourMinute.hours;
	  var minute = hourMinute.minutes;
		
	  if (isAm){
	    if (hour == 12){
	      hour = 0;
	    }
	  } else {
	    if (hour != 12){
	      hour = hour + 12;
	    }
	  }
		
	  return {hours: hour, minutes: minute};
	}
	
	function interpretMilitaryTime(timeStr){		
	  var hourMinute = parseHourMinute(timeStr);
	  if (ScreenPrefs.AmPm) {
	    if (hourMinute.hours == 12){
	      hourMinute.hours = hourMinute.hours - 12;
	    }
	  }
	  return hourMinute;
	}
	
	function parseHourMinute(timeStr){
	  if (typeof timeStr == "string"){
	    var nonNumericColon = /[^\d:]/g;
	    timeStr = timeStr.replace(nonNumericColon, "");
	  }
		
	  var hour = 0;
	  var minute = 0;
	  if (timeStr.indexOf(":") > -1){
	    var hourMinute = timeStr.split(":");
	    hour = hourMinute[0];
	    minute = hourMinute[1]? hourMinute[1] : "0"; 
	    minute = (minute.length == 1)? minute+"0" : minute;
	  } 
	  else {
	    var numOfDigit = timeStr.length;
	    if (numOfDigit == 1 || numOfDigit == 2){
	      hour = timeStr;
	    } else if (numOfDigit > 2){
	      hour = timeStr.substring(0,numOfDigit-2);
	      minute = timeStr.substring(numOfDigit-2);
	    }
	  }	
	  return {hours: parseInt(hour, 10), minutes: parseInt(minute, 10)};
	}
  
}) ();

var TimeInput = (function($){
  "use strict";

  var timeInput = function(options){
    this.template = options.template || '<input type="text" class="timeInput">';
    this.$container = options.container;
    this.initialValue = options.initialValue;
    this.timeFormat = Content.general.dFTypes[5];
    this.required = (options.required != null)? options.required : true;
    this.showErrorOnEmpty = (options.showErrorOnEmpty != null)? options.showErrorOnEmpty : true;
  };

  timeInput.prototype = {
    constructor: timeInput,
    

    parse: function(timeToSet){
      var time;
      if (timeToSet instanceof Date) {
        time = Dates.convertDateObjToUnits(timeToSet);
      }
      else if (Utils.isString(timeToSet)) {
        time = Dates.convertTimeDisplay(timeToSet);
      }
      else if (Utils.isArray(timeToSet)) {
        if (timeToSet.length === 2 || timeToSet.length === 4){
          time = Dates.convertTimeArrayToUnits(timeToSet); 
        } else {
          time = Dates.convertDateObjToUnits(Dates.object(timeToSet));
        }
      }
      else if (Utils.isObject(timeToSet)) {
        time = timeToSet;
      } 
      else {
        time = null;
      }
      return time;
    },
    
    serializeTime: function(time){
      return time? Dates.getTimeDisplay(time, this.timeFormat) : "";
    },

    setTime: function(time) {
      this.$container.find(".timeInput").val(this.serializeTime(this.parse(time)));
      this.validate();
    },

    events: function() {
      var self = this;
      this.$container.find(".timeInput").off('keyup.autoformat').on('keyup.autoformat', function(e) {
        if (e.which === 13) {
          self.refresh();
        }
      });
      this.$container.find(".timeInput").off('blur.autoformat').on('blur.autoformat', function(e) {
        self.refresh();
      });
    },
    
    refresh: function(){
      var timeInput = this.$container.find(".timeInput");
      
      var ignoreError = !this.showErrorOnEmpty && (timeInput.val() === "");
      if (this.validate(ignoreError)){
        var timeEntry = timeInput.val();
        if (timeEntry === "") {
          return;
        }
        this.setTime(timeEntry);
      }
    },

    validate: function(ignoreError){
      var timeInput = this.$container.find(".timeInput");
      
      var isValid = this.isValid();
      if (!ignoreError) {
        if (!isValid){
          timeInput.removeClass('errorClass').addClass('errorClass');
        } else {
          timeInput.removeClass('errorClass');
        }
      }
      
      return isValid;
    },
    
    isValid: function(){
      var isValid = false;
      var timeInput = this.$container.find(".timeInput");
      var isEmpty = (timeInput.val() === "");
      if (!this.required && isEmpty){
        isValid = true;
      } else if (this.required && isEmpty) {
        isValid = false;
      } else {
        var validationType = (ScreenPrefs.AmPm) ? "clockTime" : "militaryTime";
        isValid = Validation.validate(validationType, timeInput, false, null, false, false);
      }
      
      return isValid;
    },

    render: function(){
      this.$container.html(this.template);
      this.$container.find(".timeInput").val(this.serializeTime(this.parse(this.initialValue)));
      
      this.events();
    },

    disable: function(){
      this.$container.find(".timeInput").prop("disabled", true);
    },

    enable: function(){
      this.$container.find(".timeInput").prop("disabled", false);
    },
    
    clear: function(){
      var input = this.$container.find(".timeInput");
      input.removeClass("errorClass");
      input.val("");
    },
    
    toDateObject: function(baseDateObj){
      var units = this.toUnits();
      return new Date(baseDateObj.setHours(units.hours, units.minutes));
    },
    
    toDateArray: function(baseDateObj){
      baseDateObj = baseDateObj || new Date();
      return Dates.revertForJSON(baseDateObj, this.toUnits());
    },
    
    toUnits: function(){
      var time = this.parse(this.$container.find(".timeInput").val());
      return {
        hours: time.hours,
        minutes: time.minutes,
        seconds: 0,
        milliseconds: 0
      };
    }, 
    
    getInputVal: function() {
      return this.$container.find(".timeInput").val();
    },
    
    setValue: function(value) {
      var input = this.$container.find(".timeInput");
      var selectorVal = (value != null && value != undefined && value !== "") ? this.serializeTime(this.parse(value)) : "";
      this.$container.find(".timeInput").val(selectorVal);
    }
    
  };

  return timeInput;
}(jQuery));
  
var DurationInput = (function($){
  "use strict";

  var durationInput = function(options){
    this.template = options.template || '<input type="text" class="durationInput">';
    this.$container = options.container;
    this.initialValue = options.initialValue;
    this.mask = options.mask;
    
    this.required = (options.required != null)? options.required : true;
    this.showErrorOnEmpty = (options.showErrorOnEmpty != null)? options.showErrorOnEmpty : true;

    //selector set on render
    this.$selector = '';
  };

  durationInput.prototype = {
    constructor: durationInput,
    
    displayDuration: function(durationString){
      var totalMinutes =  this.toMinutes(durationString);
      return Dates.getDurationDisplay(totalMinutes);
    },

    setDuration: function(durationString) {
      this.$selector.val(this.displayDuration(durationString));
      this.validate();
    },

    events: function() {
      var self = this;
      this.$selector.off('keyup.autoformat').on('keyup.autoformat', function(e) {
        if (e.which === 13) {
          self.refresh();
        }
      });
      this.$selector.off('blur.autoformat').on('blur.autoformat', function(e) {
        self.refresh();
      });
    },
    
    refresh: function(){
      var durationInput = this.$selector;
      
      var ignoreError = !this.showErrorOnEmpty && (durationInput.val() === "");
      if (this.validate(ignoreError)){
        var durationVal = durationInput.val();
        if (durationVal === "") {
          return;
        }
        this.setDuration(durationVal);
      }
    },

    validate: function(ignoreError){
      var durationInput = this.$selector;
      
      var isValid = this.isValid();
      if (!ignoreError) {
        if (!isValid){
          durationInput.removeClass('errorClass').addClass('errorClass');
        } else {
          durationInput.removeClass('errorClass');
        }
      }
      
      return isValid;
    },
    
    isValid: function(){
      var isValid = false;
      var durationInput = this.$selector;
      var durationValue = durationInput.val();
      var isEmpty = (durationValue === "");
      if (!this.required && isEmpty){
        isValid = true;
      } else if (this.required && isEmpty) {
        isValid = false;
      } else {
        var validationType = this.mask;
        isValid = Validation.validate(validationType, null, null, durationValue);
      }
      
      return isValid;
    },

    render: function(){
      this.$container.html(this.template);
      this.$selector = this.$container.find(".durationInput");
      
      var selectorVal = (this.initialValue !== null && this.initialValue !== undefined) ? 
                           Dates.getDurationDisplay(this.initialValue) : "";
      this.$selector.val(selectorVal);
      this.events();
    },

    disable: function(){
      this.$selector.prop("disabled", true);
    },

    enable: function(){
      this.$selector.prop("disabled", false);
    },
    
    clear: function(){
      var input = this.$selector;
      input.removeClass("errorClass");
      input.val("");
    },
    
    toMinutes: function(durationString){
      //will return 0 for null or "" durationString
      var validationType = this.mask;
      durationString = (durationString) ? durationString : this.$selector.val();
      return Dates.convertDurationDisplay(durationString, null, validationType);
    },

    getInputVal: function() {
      return this.$selector.val();
    },
    
    setValue: function(value) {
      var selectorVal = (value != null && value != undefined && value !== "") ? Dates.getDurationDisplay(value) : "";
      this.$selector.val(selectorVal);
    }

  };

  return durationInput;
}(jQuery));