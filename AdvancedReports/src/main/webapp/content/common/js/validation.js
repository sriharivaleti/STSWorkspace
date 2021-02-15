/* globals Content, MessageDisplay, ScreenPrefs, Dates */

var Validation = (function () {
	"use strict";
  
	///^([0-9]{1,2})$|^([1-4]{1}[0-9]{1}[0-9]{1})$|^([5]{1}[0-3]{1}[0-9]{1})$|^([5]{1}[4]{1}[0-6]{1})$|^([0-9]{1,2}(:[0-5]{1}[0-9]{1}))$|^([1-4]{1}[0-9]{1}[0-9]{1}(:[0-5]{1}[0-9]{1}))$|^([5]{1}[0-3]{1}[0-9]{1}(:[0-5]{1}[0-9]{1}))$|^([5]{1}[4]{1}[0-5]{1}(:[0-5]{1}[0-9]{1}))$|^(546:0[0-6]{1})$/
	var durationOneTwoDigit = "^([0-9]{1,2})$|^([0-9]{1,2}:[0-5]?)$";
	var durationThreeFourDigit = "^([0-9]|[0-9][0-9])[0-5][0-9]$";
	var durationColon = "^([0-9]{1,2}:[0-5][0-9]?)$";
	var fiveDigit546 = "^([1-4][0-9][0-9]|5[0-3][0-9])[0-5][0-9]$|^54[0-5][0-5][0-9]$|^(5460[0-6])$";
	var fiveDigit546Colon = "^([1-4][0-9][0-9]|5[0-3][0-9]|5[0-4][0-5]):([0-5]?|[0-5][0-9]?)$|^54[0-6]:(0?|0[0-6]?)$";

	var duration546RegEx = new RegExp(durationOneTwoDigit+"|"+durationThreeFourDigit+"|"+durationColon+"|"+fiveDigit546+"|"+fiveDigit546Colon);
	
	var durationOneTwoDigitNegative = "^-?([0-9]{1,2})$|^-?([0-9]{1,2}:[0-5]?)$";
    var durationThreeFourDigitNegative = "^-?([0-9]|[0-9][0-9])[0-5][0-9]$";
    var durationColonNegative = "^-?([0-9]{1,2}:[0-5][0-9]?)$";
    var fiveDigit546Negative = "^-?([1-4][0-9][0-9]|5[0-3][0-9])[0-5][0-9]$|^-?54[0-5][0-5][0-9]$|^-?(5460[0-6])$";
    var fiveDigit546ColonNegative = "^-?([1-4][0-9][0-9]|5[0-3][0-9]|5[0-4][0-5]):([0-5]?|[0-5][0-9]?)$|^-?54[0-6]:(0?|0[0-6]?)$";

    var duration546RegExNegative = new RegExp(durationOneTwoDigitNegative+"|"+durationThreeFourDigitNegative+"|"+durationColonNegative+"|"+fiveDigit546Negative+"|"+fiveDigit546ColonNegative);
	
	var militaryTimeOneTwoDigit = "^[0-9]$|^[0-1][0-9]$|^2[0-3]$";
	var militaryTimeThreeFourDigit = "^([0-9]|[0-1][0-9]|2[0-3])[0-5][0-9]$";
	var militaryTimeColon = "^[0-1]?[0-9]:([0-5]?|[0-5][0-9]?)$|^2[0-3]:([0-5]|[0-5][0-9]?)$";

	var militaryTimeRegEx = new RegExp(militaryTimeOneTwoDigit + "|" + militaryTimeThreeFourDigit + "|" + militaryTimeColon);
	
	var clockTimeOneTwoDigit = "^([0-9]|[0-1][0-2])";
	var clockTimeThreeFourDigit = "^([0-9]|1[0-2]|0[0-9])[0-5][0-9]";
	var clockTimeColon = "^([0-9]|1[0-2]|0[0-9]):([0-5]?|[0-5][0-9]?)";
	
	var amPmRegEx = "\\s*[AaPp]([Mm])?$";
	var amPmTimeOneTwoDigit = clockTimeOneTwoDigit + amPmRegEx;
	var amPmTimeThreeFourDigit = clockTimeThreeFourDigit + amPmRegEx;
	var amPmTimeColon = clockTimeColon + amPmRegEx;
	
	var amPmTimeRegEx = new RegExp(amPmTimeOneTwoDigit + "|" + amPmTimeThreeFourDigit + "|" + amPmTimeColon);
	
	var timeRegEx = new RegExp(militaryTimeRegEx.source + "|" + amPmTimeRegEx.source);
	
	var decimalRegEx = /^\d+\.?\d*$/;
	
  return {

    validationDetails: [
      // these can be loaded from server side if need be and can be added to on runtime, current values are for P.O.C. purposes
      { type: "percent", expression: /^100(\.0+)? *$|^\d{1,2}(\.\d+)? *$/, errorMessage:  Content.validation.percent, className: "validate_percent" },
      { type: "int", expression: /^[-+]?\d+$/, errorMessage:  Content.validation.integer, className: "validate_int" },
      { type: "positiveInt", expression: /^[1-9]\d*$/, errorMessage:  Content.validation.positiveInteger, className: "validate_positiveInt" },
      { type: "intHour", expression: /^([0-9]){1}$|^([0-9][0-9]){1}$|^([0-9][0-9][0-9]){1}$|^([1][0-3][0-9][0-9]){1}$|^([1][4][0-3][0-9]){1}$|^(1440){1}$/, errorMessage:  Content.validation.integerHour, className: "validate_intHour" },
      { type: "rate", expression: decimalRegEx, errorMessage:  Content.validation.decimal, className: "validate_decimal" },
      { type: "decimal", expression: decimalRegEx, errorMessage:  Content.validation.decimal, className: "validate_decimal" },
      { type: "decimalHour", expression: /^(\d{1}|1[0-9]|2[0-3])(\.\d{1,3})?$|^24$/, errorMessage:  Content.validation.decimalHour, className: "validate_decimalHour" },      
      { type: "militaryTime", expression: timeRegEx, errorMessage:  Content.validation.militaryTime, className: "validate_militarytime" },
      { type: "amPmTime", expression: amPmTimeRegEx, errorMessage:  Content.validation.clockTime, className: "validate_clocktime" },
      { type: "clockTime", expression: timeRegEx, errorMessage:  Content.validation.clockTime, className: "validate_clocktime" },
      { type: "duration", expression: duration546RegEx, errorMessage:  Content.validation.duration, className: "validate_duration" },
      { type: "durationNegative", expression: duration546RegExNegative, errorMessage:  Content.validation.duration, className: "validate_duration" },
      { type: "durationDay", expression: decimalRegEx, errorMessage:  Content.validation.duration, className: "validate_durationDay" },
      { type: "duration999", expression: /^(([0-9]{1,3})|(([0-9]){1,3}(:[0-5][0-9]){1}))?$/, errorMessage:  Content.validation.duration, className: "validate_duration999" },
      { type: "duration546", expression: duration546RegEx, errorMessage:  Content.validation.duration, className: "validate_duration" },
      { type: "duration24", expression: /^(([0-1]?[0-9])|([2][0-3]))(:([0-5]?[0-9]))?$/, errorMessage:  Content.validation.duration24, className: "validate_duration24" },      
      { type: "hasInput", expression: /^.+$/, errorMessage: Content.validation.hasInput, className: "validate_hasInput" },
      { type: "stringLen50", expression: /^[\s\S]{0,50}$/, errorMessage: Content.validation.stringLen50, className: "validate_stringLen50" }
      ],

    defaultShowAlert: true,

    validateMaxLength: function(jqueryfield, maxLength, showAlert, displayName, value) {
      
      var isValid = true;
      var errorMessage = '';
      if (jqueryfield != null) {
        value = $(jqueryfield).val();
        displayName = displayName != null ? displayName : $(jqueryfield).prop('lang');
      }
      if(value == undefined) {
        value = "";
      }
      isValid = value.length <= maxLength;
      
      if (!isValid && (showAlert != null ? showAlert : Validation.defaultShowAlert)) {
        displayName = displayName != null ? displayName : "";    
        errorMessage = Content.validation.maxFieldLengthExceeded;
        errorMessage = errorMessage.replace('{0}', displayName).replace('{1}', maxLength).replace('{2}', value.length);
        MessageDisplay.error(errorMessage);
        if (jqueryfield != null) {
          jqueryfield.focus();
        }
        
      }
      if (jqueryfield != null) {
        if (isValid) {
          jqueryfield.removeClass('errorClass');
        }
        else {
          jqueryfield.addClass('errorClass');
        }
      }
      
      return isValid;
    },
    
    validate: function (type, jqueryfield, showAlert, value, skipDurationOverride, addErrorClass) {
      type = type != null ? type : '';
      addErrorClass = (addErrorClass != null)? addErrorClass : true;
      
      var isValid = true;
      var errorMessage = "";
      
      if (value == null && jqueryfield != null) {
        value = jqueryfield.val();
      }
      var initialType = type;
      
      if ((skipDurationOverride == null || !skipDurationOverride) && (type.toUpperCase() == 'DURATION' || type.toUpperCase() == 'DURATION24' || type.toUpperCase() == 'DURATION546' || type.toUpperCase() == 'DURATION999')) {        
        switch (ScreenPrefs.durFormat) {
          case ('duration_format_H'):           
            if (type.toUpperCase() == 'DURATION24') {
              type = 'decimalHour';
            }
            else {
              type = 'decimal';
            }
            break;
          case ('duration_format_HM'):            
            if (type.toUpperCase() == 'DURATION24') {
              type = 'duration24';
            }
            else if (type.toUpperCase() == 'DURATION546') {
              type = 'duration546';
            }
            else if (type.toUpperCase() == 'DURATION999') {
              type = 'duration999';
            }
            else {
              type = 'duration';
            }
            break;
          case ('duration_format_M'):            
            if (type.toUpperCase() == 'DURATION24') {
              type = 'intHour';
            }
            else {
              type = 'int';
            }
            break;
        }    
      }
      if (value == null) {
        value = '';
      }
      
      if (initialType.toUpperCase() == 'DURATION546') {
        
        switch (type) {
        case 'int':
          if (isNaN(value) || parseInt(value) != parseFloat(value) || parseInt(value) > 32767) {
            isValid = false;
            errorMessage = Content.validation.integer;
          }          
          break;
        case 'decimal':
          if (isNaN(value) || parseFloat(value) > 546.06) {
            isValid = false;
            errorMessage = Content.validation.decimal;
          } 
          break;
        }
        
      }
      
      if(isValid && type.toUpperCase() == 'date'.toUpperCase()){
        if (!Validation.validateDateStr(value, Content.general.dFTypes[1])) {
          isValid = false;
          errorMessage = Content.validation.date;
        }
      }
      
      if(isValid && type.toUpperCase() == 'dateTime'.toUpperCase()){
        var a = Dates.parseDateTimeArray(value, Content.general.dFTypes[10]);
        var temp = Dates.revertForJSON(a);
        $(temp).each(function(i,o) {
          if(o.toString().toUpperCase() == 'NAN' || o == null || o == 'null'){
          isValid = false;
          errorMessage = Content.validation.datetime;
          return false;
          }
        });
      }
      
      if(isValid && type.toUpperCase() === 'decimal'.toUpperCase()){
        if (!Utils.isNumeric(value) || parseFloat(value) < 0 || parseFloat(value) >= 1000000000000.0) {
          isValid = false;
          errorMessage = Content.validation.decimal;
        }
      }
      
      if (isValid) {
        $(Validation.validationDetails).each(function (i, o) {

          if (o.type.toUpperCase() == type.toUpperCase()) {
            var r = o.expression;
            isValid = (value.search(r) != -1);
            errorMessage = o.errorMessage;
            return false;
          }

        }); // end loop: Validation.validationDetails

      }
      
      if (!isValid && (showAlert != null ? showAlert : Validation.defaultShowAlert)) {
        MessageDisplay.error(errorMessage, jqueryfield);
      }
      if (jqueryfield != null) {
        if (isValid) {
          jqueryfield.removeClass('errorClass');
        }
        else {
          if (addErrorClass !== false) {
            jqueryfield.addClass('errorClass');
          }
        }
      }
      return isValid;
    },

    dateSelectorValidate: function(selector, canBeEmpty) {
      var isValid = false;
      var dateValue = $(selector).val();
      if(canBeEmpty && dateValue === '') {
        isValid = true;
      }
      else {
        var selectDate = $(selector).datepicker('getDate');
        $(selector).datepicker('setDate', dateValue);
        var dateOfVal = $(selector).datepicker('getDate');
        if (selectDate != null && (Dates.isDateEqual(dateOfVal,selectDate))) {
          isValid = Validation.validateDateStr(dateValue, Content.general.dFTypes[1]);
        } else {
          isValid = false;
        } 
      }
      if (isValid) {
        $(selector).removeClass('errorClass');
      }
      else {
        $(selector).addClass('errorClass');
      }
      return isValid;
    },
    
    validateDateStr: function(dateStr, format) {
      var isValid = true;
      format = Dates.getDatepickerFormat(format);
      if (dateStr === '') {
        isValid = false;
      } 
      else {
        try {
          $.datepicker.parseDate(format, dateStr);
        } catch (ex) {
          isValid = false;
        }        
      }
      return isValid;
    },

    eof: 0

  };
})();

