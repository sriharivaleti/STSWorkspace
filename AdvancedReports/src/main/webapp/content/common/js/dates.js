//# sourceURL=Dates
/* globals Content, ScreenPrefs, CSMath, CSTimeEntry, moment */

var Dates = (function () {
  "use strict";

  return {

    daysOfTheWeek: [Content.dates.sunday, Content.dates.monday, Content.dates.tuesday, Content.dates.wednesday, Content.dates.thursday, Content.dates.friday, Content.dates.saturday],
    monthsOfTheYear: [Content.dates.january, Content.dates.february, Content.dates.march, Content.dates.april, Content.dates.may, Content.dates.june, Content.dates.july, Content.dates.august, Content.dates.september, Content.dates.october, Content.dates.november, Content.dates.december],
    daysOfTheWeekShort: [Content.dates.sundayShort, Content.dates.mondayShort, Content.dates.tuesdayShort, Content.dates.wednesdayShort, Content.dates.thursdayShort, Content.dates.fridayShort, Content.dates.saturdayShort],
    monthsOfTheYearShort: [Content.dates.januaryShort, Content.dates.februaryShort, Content.dates.marchShort, Content.dates.aprilShort, Content.dates.mayShort, Content.dates.juneShort, Content.dates.julyShort, Content.dates.augustShort, Content.dates.septemberShort, Content.dates.octoberShort, Content.dates.novemberShort, Content.dates.decemberShort],
    defaultDateFormat: 'YYYY-MM-DD',
    defaultTimeFormat: 'HH:mm',

    zeroPad: function (v, l) {
      var s = '' + v;
      var isNegative = false;
      if (s.indexOf('-') === 0){
        isNegative = true;
        s = s.substr(1);
      }
      while (s.length < l) { s = '0' + s; }
      s = isNegative? '-' + s : s;
      return s;
    },

    getDayLocale: function(index, externalArray) {
      Dates.startOfWeek = Dates.getStartOfWeekNumber();
      var startOfWeek = Dates.startOfWeek;
      index = index + startOfWeek - 1;
      var dayArray = Dates.daysOfTheWeek;
      if (externalArray != null) {
        dayArray = externalArray;
      }
      if (index >= dayArray.length) {
        index = index - 7;
      }
      return dayArray[index];
    },

    getStartOfWeek: function(d) {
      if (d == null) {
        d = Dates.getDateValue($("#cDate"));
      }
      var workingDate = Dates.object(Dates.revertForJSON(d));
      var originalWorkingDate = new Date(workingDate.getTime());
      var newDay = workingDate.getDate() - workingDate.getDay() + Dates.getStartOfWeekNumber() - 1;
      var startOfWeek = new Date(workingDate.setDate(newDay));
      newDay = startOfWeek.getDate();
      if (startOfWeek > originalWorkingDate) {
        newDay -= 7;
        startOfWeek = new Date(workingDate.setDate(newDay));
      }

      return Dates.revertForJSON(startOfWeek);
    },

    getEndOfWeek: function(d) {
      var startOfWeek = Dates.getStartOfWeek(d);
      return Dates.revertForJSON(Dates.addDay(startOfWeek, 6));
    },

    getDateValue: function(obj, format) {
      var date = null;
      if ($(obj).hasClass('hasDatepicker')) {
        date = $(obj).datepicker('getDate');
      }
      else {
        date = $(obj).val();
      }
      if (date != null) {
        date = Dates.object(date);
      }
      if (format != null) {
        date = Dates.format(date, format);
      }
      return date;
    },

    getDatepickerFormat: function(format) {
      if(format.indexOf('yyyy') > -1){
      format = format.replace('yyyy', 'yy');
      } else {
        format = format.replace('yy', 'y');  
      }
      
      if(format.indexOf('MMM') > -1){
        format = format.replace('MMM', 'M');
        } else if(format.indexOf('MM') > -1){
          format = format.replace('MM', 'mm');  
        }
      
      return format;
    },


    getStartOfWeekNumber: function() {
      return parseInt(ScreenPrefs.calStartDay);
    },

    format: function (date, pattern) {
      if(date == null || date == 'null'){
        return null;
      }
      date = Dates.object(date);
      var output = (pattern != null ? pattern : Dates.defaultDateFormat);

      if (output.indexOf('a') > -1) {
        output = output.replace('a', 'AP');
      }
      output = output.replace(/\bEEEEEE\b/gi, getFullDay(date));
      output = output.replace(/\bEE\b/gi, getShortDay(date));
      output = output.replace(/\bYYYY\b/gi, date.getFullYear());
      output = output.replace(/\bYY\b/gi, date.getFullYear().toString().substr(2, 2));
      output = output.replace(/\bMMMM\b/g, getFullMonth(date));
      output = output.replace(/\bMMM\b/g, getShortMonth(date));
      output = output.replace(/\bMM\b/g, Dates.zeroPad((date.getMonth() + 1), 2));
      output = output.replace(/\bM\b/g, (date.getMonth() + 1));
      output = output.replace(/\bDDDD\b/g, getFullDay(date));
      output = output.replace(/\bDDD\b/g, getShortDay(date));
      output = output.replace(/\bDD\b/gi, Dates.zeroPad(date.getDate(), 2));
      output = output.replace(/\bD\b/gi, date.getDate());

      var hourVal = date.getHours();

      if (output.search(/\bAP\b/gi) != -1) {
        var m = (hourVal >= 12) ? "pm" : "am";
        output = output.replace(/\bAP\b/g, m.toUpperCase());
      }
      if (output.search('hh') != -1 || output.search('h') != -1) {
        hourVal = (hourVal > 12) ? (hourVal - 12) : (hourVal === 0 ? 12 : hourVal);
        output = output.replace(/\bhh\b/gi, Dates.zeroPad(hourVal, 2));
        output = output.replace(/\bh\b/gi, hourVal);
      }
      if (output.search('KK') != -1 || output.search('K') != -1) {
        hourVal = (hourVal > 12) ? (hourVal - 12) : hourVal;
        output = output.replace(/\bKK\b/gi, Dates.zeroPad(hourVal, 2));
        output = output.replace(/\bK\b/gi, hourVal);
      }
      if (output.search('kk') != -1 || output.search('k') != -1) {
        hourVal = (hourVal === 0 ? 24 : hourVal);
        output = output.replace(/\bkk\b/gi, Dates.zeroPad(hourVal, 2));
        output = output.replace(/\bk\b/gi, hourVal);       
      }
      output = output.replace(/\bHH\b/gi, Dates.zeroPad(hourVal, 2));
      output = output.replace(/\bH\b/gi, hourVal);
      output = output.replace(/\bmm\b/g, Dates.zeroPad(date.getMinutes(), 2));
      output = output.replace(/\bm\b/g, date.getMinutes());
      output = output.replace(/\bSS\b/gi, Dates.zeroPad(date.getSeconds(), 2));
      output = output.replace(/\bS\b/gi, date.getSeconds());
      output = output.replace(/\bMS\b/gi, Dates.zeroPad(date.getMilliseconds(), 3));

      return output;
    },

    sanitizeDateArray: function (a) {
      var d = [0, 0, 0, 0, 0, 0, 0];
      for (var i = 0; i < a.length; i++) {
        d[i] = a[i] - 0;
      }
      return d;
    },

    object: function (a) {

      if(a == null || a == 'null'){
        return null;
      }

      if (!(a instanceof Date) && !(a instanceof Array)) {        
        a = Dates.convertStringToDateArray(a, Content.general.dFTypes[1]);
      }

      if(a instanceof Array){
        var d = Dates.sanitizeDateArray(a);
        d = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5], d[6]);
        return d;
      }
      
      return a;
    },
    
    // use only for validation (avoid input str sanitation by parseInt)
    parseDateTimeArray: function(str, format) {
      var formatDate = format.substring(0,format.indexOf(' '));
      var formatTime = format.substring(format.indexOf(' '));

      var aDate = str.substring(0,str.indexOf(' '));
      var aTime = str.substring(str.indexOf(' '));
      
      var dateArr = parseDateArray(aDate, formatDate);
      var timeArr = parseTimeArray(aTime, formatTime);

      return dateArr.concat(timeArr);
    },

    convertStringToDateTimeArray: function(a, format){
      var formatDate = format.substring(0,format.indexOf(' '));
      var formatTime = format.substring(format.indexOf(' '));

      var aDate = a.substring(0,a.indexOf(' '));
      var aTime = a.substring(a.indexOf(' '));

      var dateArr = Dates.convertStringToDateArray(aDate, formatDate);
      var timeArr = convertStringToTimeArray(aTime, formatTime);

      return dateArr.concat(timeArr);
    },

    convertStringToDateArray: function(str, format){
      if(str == null || str == 'null'){
        return null;
      }

      var a = $.map(parseDateArray(str, format), function(element, i) {
        return parseInt(element, 10);
      });
      
      var year = a[0];
      if (year < 100) {
        // Y2K issue
        var today = new Date();
        var yearToday = today.getFullYear();
        var century = yearToday - yearToday % 100;
        year = century + year;
        if (year >= yearToday) {
          if (year-yearToday > 20) {
            year = year - 100;
          }
        } else {
          if (yearToday-year >= 80) {
            year = year + 100;
          }
        }
      }
      a[0] = year;
      
      return a;
    },
    
    convertTimeStringToTimeArray: function(a){
      var timeArray = [];
      var timeObj = Dates.convertTimeDisplay(a);
      timeArray[0] = timeObj.hours;
      timeArray[1] = timeObj.minutes;
      timeArray[2] = 0;
      timeArray[3] = 0;
      return timeArray;
    },

    mergeDateAndTimeStringsToArray: function(dateString, timeString, dateFormat, timeFormat) {
      if(!dateFormat) {
        dateFormat = Dates.defaultDateFormat;
      }
      if(!timeFormat) {
        timeFormat = Content.general.dFTypes[5];
      }
      var dateArray = Dates.convertStringToDateArray(dateString, dateFormat);
      var timeArray = Dates.convertTimeStringToTimeArray(timeString, timeFormat);
      var dateTimeArray = dateArray.concat(timeArray);
      return dateTimeArray;
    },
    
    convertUnitsToTimeArray: function(units) {
      var time = $.extend({}, {
        hours:0, minutes:0, seconds:0, milliseconds:0
      }, units);
      return [time.hours, time.minutes, time.seconds, time.milliseconds];
    },

    convertDateObjToTimeArray: function(date) {
      var dateTimeArray = Dates.revertForJSON(date);
      var timeArray = [];
      timeArray[0] = dateTimeArray[3];
      timeArray[1] = dateTimeArray[4];
      timeArray[2] = dateTimeArray[5];
      timeArray[3] = dateTimeArray[6];
      return timeArray;
    },
    
    convertTimeArrayToUnits: function(timeArray) {
      return {
        hours: timeArray[0],
        minutes: timeArray[1],
        seconds: timeArray[2],
        milliseconds: timeArray[3]
      };
    },
    
    convertDateObjToUnits: function(dateObj) {
      return {
        years: dateObj.getFullYear(),
        months: dateObj.getMonth(),
        days: dateObj.getDate(),
        hours: dateObj.getHours(),
        minutes: dateObj.getMinutes(),
        seconds: dateObj.getSeconds(),
        milliseconds: dateObj.getMilliseconds()
      };
    },
    
    addMinutes: function(date, minutes) {
      var tempDate = Dates.object(Dates.revertForJSON(Dates.object(date)));
      tempDate.setMinutes(tempDate.getMinutes() + minutes);
      return tempDate;
    },

    revertForJSON: function (baseDate, units) {
      baseDate = Dates.object(baseDate);
      var date = $.extend({
        years : baseDate.getFullYear(),
        months : baseDate.getMonth(),
        days : baseDate.getDate(),
        hours: baseDate.getHours(),
        minutes: baseDate.getMinutes(),
        seconds: baseDate.getSeconds(),
        milliseconds: baseDate.getMilliseconds()
      }, units);
      return [date.years, date.months + 1, date.days, date.hours, date.minutes, date.seconds, date.milliseconds];
    },

    copyDate: function(d) {
      var rArr = [];
      for (var i = 0; i < d.length; i++) {
        rArr[i] = d[i];
      }
      return rArr;
    },

    getDuration: function (startTime, endTime, baseDate) {
      var duration = Dates.object(endTime) - Dates.object(startTime);
      duration = (duration / 1000) / 60;
      var nd = new Date();
      if (baseDate != null) { nd = Dates.object(baseDate); }
      var hours = Math.floor(duration / 60);
      var minutes = duration - (Math.floor(duration / 60) * 60);
      nd.setHours(hours, minutes, 0, 0);
      return nd;
    },

    getDurationMinutes: function (startTime, endTime) {
      var duration = Dates.object(endTime) - Dates.object(startTime);
      duration = (duration / 1000) / 60;
      return duration;
    },
    
    getDurationHours: function (startTime, endTime) {
      return Dates.getDurationMinutes(startTime, endTime) / 60;
    },
    
    getDurationGreaterOrEqualToOneDay: function (startTime, endTime) {
      var hours = Dates.getDurationMinutes(startTime, endTime) / 60;
      
      if(Dates.doDatesCrossSpringDST(startTime,endTime)){
    	 return hours >= 23
      } else if (Dates.doDatesCrossFallDST(startTime,endTime)){
    	 return hours >= 25
      } else {
    	 return hours >= 24
      }
    },
    
    doDatesCrossSpringDST: function(startTime, endTime){
    	return Dates.object(startTime).getTimezoneOffset() > Dates.object(endTime).getTimezoneOffset();
    },
    
    doDatesCrossFallDST: function(startTime, endTime){
    	return Dates.object(startTime).getTimezoneOffset() < Dates.object(endTime).getTimezoneOffset();
    },
    
    displayDuration: function(minutes) {
      var h = parseInt((minutes - (minutes % 60)) / 60);
      var m = Math.abs(minutes % 60);
      var returnVal = Dates.zeroPad(h,2) + ':' + Dates.zeroPad(m,2);
      if (minutes < 0 && returnVal.indexOf('-') == -1) {
        returnVal = '-' + returnVal;
      }
      return returnVal;
    },

    getDurationDisplay: function(durationValue, durationFormatOverride, dayDurationLength) {
      if (durationValue == null) {
        durationValue = 0;
      }
      var durationFormat = ScreenPrefs.durFormat;
      if (durationFormatOverride != null) {
        durationFormat = durationFormatOverride;
      }
      // Possible options for durFormat : duration_format_H, duration_format_HM, duration_format_M, duration_format_D(through override)
      switch (durationFormat) {
      case ('duration_format_H'):
        durationValue = parseFloat(durationValue) / parseFloat(60);
        durationValue = CSMath.round(durationValue, 3, true);
        break;
      case ('duration_format_HM'):
        durationValue = Dates.displayDuration(durationValue);
        break;
      case ('duration_format_D'):
        durationValue = CSMath.round(durationValue / dayDurationLength, 3, true);
        break;
      }

      return durationValue;
    },

    getTimeDisplay: function(hourMinute, timeFormatOverride){
      hourMinute = hourMinute || {};
      var date = new Date();
      date.setHours(hourMinute.hours, hourMinute.minutes);
      timeFormatOverride = timeFormatOverride || Dates.defaultTimeFormat;
      return Dates.format(date, timeFormatOverride);
    },

    convertDurationDisplay: function(durationValue, durationFormatOverride, durationMask, dayDurationLength) {
      if (durationValue == null || durationValue === '') {
        durationValue = "0";
      }
      var durationFormat = ScreenPrefs.durFormat;
      if (durationFormatOverride != null) {
        durationFormat = durationFormatOverride;
      }
      // Possible options for durFormat : duration_format_H, duration_format_HM, duration_format_M, duration_format_D(through override)
      switch (durationFormat) {
      case ('duration_format_H'):
        durationValue = CSMath.round(durationValue, 3, true) * 60;
        break;
      case ('duration_format_HM'):
        var durationObj = CSTimeEntry.convertDurationString(durationValue, durationFormatOverride, durationMask);
        durationValue = durationObj.isValid ? durationObj.totalMinutes : 0;
        break;
      case ('duration_format_D'):
        durationValue = parseFloat(durationValue) * dayDurationLength;
        break;
      }
      return parseInt(CSMath.round(durationValue, 0));
    },

    convertTimeDisplay: function(timeValue){
      if (timeValue == null){
        timeValue = "0";
      }
      timeValue = CSTimeEntry.convertTimeString(timeValue);
      return timeValue;
    },
    
    formatTimeDisplay: function(timeString, timeFormat){
      timeFormat = timeFormat || Dates.defaultTimeFormat;
      
      var timeValue = Dates.convertTimeDisplay(timeString);
      return Dates.getTimeDisplay(timeValue, timeFormat);
    },

    setDateOnly: function(oldDateTimeObj, newDateTimeObj) {
      oldDateTimeObj = Dates.revertForJSON(oldDateTimeObj);
      newDateTimeObj = Dates.revertForJSON(newDateTimeObj);
      newDateTimeObj[3] = oldDateTimeObj[3];
      newDateTimeObj[4] = oldDateTimeObj[4];
      newDateTimeObj[5] = oldDateTimeObj[5];
      return newDateTimeObj;
    },

    setTime: function (oldDateArr, hours, minutes, seconds, milliseconds) {
      oldDateArr[3] = hours;
      oldDateArr[4] = minutes;
      if (seconds != null && !isNaN(seconds)) {
        oldDateArr[5] = seconds;
      }
      if (milliseconds != null && !isNaN(milliseconds)) {
        oldDateArr[6] = milliseconds;
      }
    },

    convertToDate: function(date, time) {
      var minuteValue = isNaN(time) ? getMinuteValue(time) : time;
      var dateVal = Dates.copyDate(Dates.revertForJSON(Dates.object(date)));
      var hVal = Math.floor(minuteValue / 60);
      var mVal = minuteValue - (hVal * 60);
      dateVal[3] = hVal;
      dateVal[4] = mVal;
      return dateVal;
    },

    isDateEqual: function (date, compareDate) {
      var date1 = Dates.format(date, "YYYY-MM-DD");
      var date2 = Dates.format(compareDate, "YYYY-MM-DD");
      return date1 == date2;
    },

    isTimeEqual: function (date, compareDate) {
      var date1 = Dates.format(date, "HH:mm:SS");
      var date2 = Dates.format(compareDate, "HH:mm:SS");
      return date1 == date2;
    },

    isDateTimeEqual: function (date, compareDate) {
      var date1 = Dates.format(date, 'YYYY-MM-DD HH:mm');
      var date2 = Dates.format(compareDate, 'YYYY-MM-DD HH:mm');
      return date1 == date2;
    },
    
    isDateInTheFuture: function (date) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today;
    },    

    tomorrow: function (v) {

      var day = new Date(Dates.object(v).getTime());
      day.setDate(day.getDate() + 1);

      return day;

    },

    yesterday: function (v) {

      var day = new Date(Dates.object(v).getTime());
      day.setDate(day.getDate() - 1);

      return day;

    },

    addDay: function(date, increment) {
      date = Dates.object(date);
      date = new Date(new Date(date.getTime()).setDate(date.getDate()+increment));
      return date;
    },

    addMonth: function(date, increment) {
      date = Dates.object(date);
      date = new Date(new Date(date.getTime()).setMonth(date.getMonth()+increment));
      return date;
    },

    addYear: function(date, increment) {
      date = Dates.object(date);
      date = new Date(new Date(date.getTime()).setYear(date.getFullYear() + increment));
      return date;
    },

    getDifferenceInDays: function(a, b) {
      var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

      return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    },

    dateRangeOverlap: function(start1, end1, start2, end2) {
      start1 = Dates.object(start1);
      end1 = Dates.object(end1);
      start2 = Dates.object(start2);
      end2 = Dates.object(end2);
      
      var start1Between = moment(start1).isSameOrAfter(start2) && moment(start1).isSameOrBefore(end2);
      var start2Between = moment(start2).isSameOrAfter(start1) && moment(start2).isSameOrBefore(end1);
      
      return start1Between || start2Between;
    },
    
  };

  function convertStringToTimeArray(str, format){
    var a = parseTimeArray(str, format);
    return $.map(a, function(element, i) {
      return parseInt(element, 10);
    });
  }
  
  function parseTimeArray(str, format) {
    if(str == null || str == 'null'){
      return null;
    }

    var a = $.trim(str).split(':');
    
    var isFormatAmPm = false;
    var formatArr = format.split(':');
    if(formatArr[formatArr.length-1].toUpperCase().indexOf('A') > -1){
      isFormatAmPm = true;
    }
    
    if(isFormatAmPm){
      if(a[a.length-1].toUpperCase().indexOf('P') > -1){
        if((parseInt(a[0], 10) + 12) == 24){
          a[0] = 12;
        }
      } else {
        if(a[0] == 12){
          a[0] = 0;
        }
      }
    } else {
      if(a[0] == 24){
        a[0] = 0;
      }
    }
    
    return a;
  }
  
  function parseDateArray(str, format) {
    if(str == null || str == 'null'){
      return null;
    }

    var formatArr = '';
    
    var a = [];
    if(str.toString().indexOf('/') > -1) {
      a = str.split('/');
      formatArr = format.split('/');
    } else if (str.toString().indexOf('-') > -1) {
      a = str.split('-');
      formatArr = format.split('-');
    } else if (str.toString().indexOf('.') > -1){
      a = str.split('.');
      formatArr = format.split('.');          
    } else {
      a = str.split(' ');
      formatArr = format.split(' ');          
    }
    
    //default to 'YYYY-MM-DD' in case of mismatch
    if(formatArr.length != 3) {
      format = 'YYYY-MM-DD';
      formatArr = format.split('-');
    }
    
    var year = 0;
    var month = 1;
    var day = 2;
    for (var i = 0; i < 3; i++) {
      if(formatArr[i].indexOf('m') > -1 || formatArr[i].indexOf('M') > -1){
        month = i;
      } else if (formatArr[i].indexOf('d') > -1 || formatArr[i].indexOf('D') > -1){
        day = i;
      } else {
        year = i;
      }
    }
    a[month] = convertMonthShortNameToNum(a[month]);
    a[month] = convertMonthNameToNum(a[month]);
    
    return [a[year], a[month], a[day]];
  }

  function convertMonthShortNameToNum(monthName){
    for (var i = 0; i < Dates.monthsOfTheYearShort.length; i++) {
      if(monthName == Dates.monthsOfTheYearShort[i]){
        return i+1;
      }
    }
    return monthName;
  }

  function convertMonthNameToNum(monthName){
    for (var i = 0; i < Dates.monthsOfTheYear.length; i++) {
      if(monthName == Dates.monthsOfTheYear[i]){
        return i+1;
      }
    }
    return monthName;
  }

  function getMinuteValue(str) {

    if (str.indexOf(':') > -1) {
      var vArr = str.split(':');
      var h = parseInt(vArr[0], 10);
      var m = 0;
      if (ScreenPrefs.AmPm) {
        vArr = vArr[1].split(' ');
        m = parseInt(vArr[0], 10);
        var ap = vArr[1];
        var ampm = 0;
        if (ap.toLowerCase() == 'pm') {
          ampm = 12;
        }
        if (h == 12) {
          if (ampm == 12) {
            ampm = 0;
          }
          else {
            ampm = 12;
          }
        }
        h += ampm;

        if (h >= 24) {
          h = 0;
        }
      }
      else {
        m = parseInt(vArr[1], 10);
      }
      var v = (h * 60) + m;
      return v;
    }
    else {
      return parseInt(str) * 60;
    }
  }

  function getFullDay(dateObj) {
    return Dates.daysOfTheWeek[dateObj.getDay()];
  }

  function getShortDay(dateObj) {
    return Dates.daysOfTheWeekShort[dateObj.getDay()];
  }

  function getFullMonth(dateObj) {
    return Dates.monthsOfTheYear[dateObj.getMonth()];
  }

  function getShortMonth(dateObj) {
    return Dates.monthsOfTheYearShort[dateObj.getMonth()];
  }

})();

