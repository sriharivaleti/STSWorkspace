/* globals _, Content, Dates, Global, locale */
/* exported Calendar */

//# sourceURL=Calendar

var Calendar = (function($) {
  "use strict";
  
  var calendar = function(options) {
    this.container = $(options.container);
    this.headerRowTemplate = options.headerRowTemplate;
    this.startDate = options.startDate;
    this.endDate = options.endDate;
    this.json = options.json;
    this.calendarData = options.calendarData;
    this.orchestrateCalendarData = options.orchestrateCalendarData;
    this.orchestrateEmployeeData = options.orchestrateEmployeeData;
    this.renderDynamicFilters = options.renderDynamicFilters;
    this.dataOptions = options.dataOptions;
    this.screenPrefs = options.screenPrefs;
    };
  
  calendar.prototype = {
    duration: 0,
    totalDuration : 0,

    totalRow: function(count,duration) {
      var str = '<td class="weekSummaryBlock"><div class="weekSummaryTitle"></div>';
      str += '<div class="weekSummaryContentBlock"> <div class="calendarWeekSummaryContent">';
      str += '<span class="rowDuration" lang="'+duration+'">'+Dates.getDurationDisplay(duration)+'</span>';
      str += '</div>';
      str += '</div>';
      str += '</td>';
      return str;
    },
    
    totalDateRangeHours: function(dur) {
      var str = '<tr class="calendarSummaryRow"><td colspan="8"><div class="calendarSummaryContent">';
      str += '<label class="calendarSummaryLabel">'+locale.totalScheduledHours+'</label>';
      str += '<span class="totalDuration" lang="'+dur+'">'+Dates.getDurationDisplay(dur)+'</span>';
      str += '</div>';
      str += '</td>';
      str += '</tr>';

      return str;
    },
    
    dayInfoRow: function(leftCol, rightCol, indicatorClass, isFirst, additionalClass) {
      var colspan = rightCol == null ? 1 : 1;
      var str = '<div class="calendarDayInfo ' + indicatorClass + ' ' + (isFirst ? 'first' : '') + (additionalClass != null ? (' ' + additionalClass) : '') + '" >';
      str += '<div class="leftColVal" colspan="' + colspan + '">' + leftCol + '</div>';
      if (rightCol != null) {
        str += '<div>';
        str += rightCol;
        str += '</div>';
      }
      str += '</div>';
      return str;
    },
    
    getIndicatorValues: function(dayInfo) {
      var indicator = "";
      var indicatorClass = ""; 
      if (dayInfo.worked) {
        indicator += (indicator.length > 0 ? ', ' : '') + 'W';
        indicatorClass += ' dayType_worked ';
      }
      if (dayInfo.dayOff) {
        indicator += (indicator.length > 0 ? ', ' : '') + 'O';
        indicatorClass += ' dayType_dayOff ';
      }
      if (dayInfo.holiday) {
        indicator += (indicator.length > 0 ? ', ' : '') + 'H';
        indicatorClass += ' dayType_holiday ';
      }
      if (dayInfo.absence ) {
        indicator += (indicator.length > 0 ? ', ' : '') + 'A';
        indicatorClass += ' dayType_absence ';
      }
      if (dayInfo.tempShiftChange) {
        indicator += (indicator.length > 0 ? ', ' : '') + 'T';
        indicatorClass += ' dayType_tempShiftChange ';
      }
      if (dayInfo.permShiftChange) {
        indicator += (indicator.length > 0 ? ', ' : '') + 'P';
        indicatorClass += ' dayType_permShiftChange ';
      }
      return {indicator: indicator, indicatorClass: indicatorClass};
    },
    
    getRosterStr: function(dayInfo, indicatorClass) {
      var str = "";
      if (dayInfo.roster != null) {
        if(this.screenPrefs.showRoster && this.dataOptions.showRosterStr) {
          str += this.dayInfoRow(locale.roster + ': <span title="' + dayInfo.roster.id + '">' + dayInfo.roster.id + '</span>', null, indicatorClass,null,"rosterInfo");
        }
        if(this.screenPrefs.showRosterDesc && this.dataOptions.showRosterDescStr) {
          str += this.dayInfoRow(dayInfo.roster.desc, null, indicatorClass, null, "rosterInfo");
        }
      }
      
      return str;
    },
    
    getShiftStr: function(dayInfo, indicatorClass) {
      var self = this;
      var str = "";
      if (dayInfo.shifts != null && dayInfo.shifts.length > 0 && this.dataOptions.showShiftStr) {
        $(dayInfo.shifts).each(function(i, o) {
          if (o.shift != 0) {
            var isFirst = false;
            if (i == 0) {
              isFirst = true;
            }
            
            
            if(self.screenPrefs.showShift) {
              str += self.dayInfoRow(locale.shift + ': <span title="' + o.description + '">' + o.shift + '</span>', null, indicatorClass, isFirst, "shiftInfo");
            }
            
            if(self.screenPrefs.showShiftCodes) {
              str += self.dayInfoRow(locale.code + ': <span title="' + o.code + '">' + o.code + '</span>', null, indicatorClass, isFirst, "shiftInfo padLeft");
            }

            if(self.screenPrefs.showShiftTimes) {
              str += self.dayInfoRow(locale.time + ': ' + Dates.format(o.start, Content.general.dFTypes[5]) + ' - ' + Dates.format(o.end, Content.general.dFTypes[5]), null, indicatorClass, null, "shiftInfo padLeft");
            }

            if(self.screenPrefs.showShiftDuration) {
              str += self.dayInfoRow(locale.duration + ': <span class="duration" lang="'+o.duration+'">' + Dates.getDurationDisplay(o.duration)+'</span>', null, indicatorClass, null, "shiftInfo padLeft");
            }
            var shiftReasonStr = "";
            if (o.reason != null && o.reason != "" && self.screenPrefs.showShiftReason && self.dataOptions.showShiftReasonStr) {
              str += self.dayInfoRow(locale.reason + ': ', null, indicatorClass, null, "shiftInfo");
              str += self.dayInfoRow('<div>' + o.reason + '</div>', null, indicatorClass, null, 'padLeft shiftInfo');
              
            }
            str += "<div class='borderBottom'></div>"
            self.duration += o.duration;
            self.totalDuration += o.duration;
          }
        });
      }
      return str;
    },
    
    getAbsenceStr: function(dayInfo, indicatorClass, indicator) {
      var str = "";
      var self = this;
      if (dayInfo.absences != null && dayInfo.absences.length > 0 && this.screenPrefs.showAbsenceInfo && this.dataOptions.showAbsenceStr) {
        $(dayInfo.absences).each(function(i, o) {
          var isFirst = false;
          if (i == 0) {
            isFirst = true;
          }
          if(self.dataOptions.showAbsRosterStr) {
            str += "<div class='codeDescription'>"+indicator+"</div>";
            str += self.getRosterStr(dayInfo, indicatorClass);
          }
          str += self.dayInfoRow(locale.absence + ': ' + o.code, null, indicatorClass, isFirst, "absenceInfo");
          str += self.dayInfoRow(locale.time + ': ' + Dates.format(o.start, Content.general.dFTypes[5]) + ' - ' + Dates.format(o.end, Content.general.dFTypes[5]), null, indicatorClass, null, "absenceInfo padLeft");
          str += self.dayInfoRow(locale.duration + ': <span class="duration" lang="'+o.duration+'">' + Dates.getDurationDisplay(o.duration) +'</span>', null, indicatorClass, null, "absenceInfo padLeft duration" );
          str += "<div class='borderBottom'></div>"

          if (o.attachments != null && o.attachments.files != null && o.attachments.files.length > 0) {
            str += self.dayInfoRow(locale.attachment + ': ', null, indicatorClass, null, "absenceInfo");
            var attachments = "";
            $(o.attachments.files).each(function(ai, ao) {
              if (ai == 0) {
                attachments = "";
              }
              attachments += '&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="ScheduleCalendar.downloadFile(' + ao.id + ')" href="#">' + ao.name + '</a>';
              if (ai != o.attachments.length - 1) {
                attachments += "<br/>";
              }
            });
            str += self.dayInfoRow(attachments, null, indicatorClass, null, "absenceInfo");
          }
          self.duration += o.duration;
          self.totalDuration += o.duration;
        });
      }
      return str;
    },
    
    getPositionStr: function(dayInfo,indicatorClass) {
      var str = "";
      var self = this;
      if (dayInfo.positions != null && dayInfo.positions.length > 0 && this.screenPrefs.showCCPInfo && this.dataOptions.showCCPStr) {
        $(dayInfo.positions).each(function(i, o) {
          var isFirst = false;
          if (i == 0) {
            isFirst = true;
          }
          str += self.dayInfoRow(locale.ccp + ': ' + o.costCenter.id + ' - ' + o.name, null, indicatorClass, isFirst, "ccpInfo");
        });
      }
      return str;
    },
    
    render: function() { 
      this.events();
      this.renderCalendarContainer();
    },
    
    renderCalendarContainer: function(){
      var $tableBody = $(this.container);
      $tableBody.html('');   
      
      var curDate = this.startDate;
      var headerRowTemplate = _.template($(this.headerRowTemplate).html());
      var dates = [];
      for (var temp = 0; temp < 7; temp++) {
        dates.push(Dates.format(curDate, "DDDD"));
        curDate = Dates.tomorrow(curDate);
      }
      var record = {
          date : dates
      }
      var $rowMarkup = $(headerRowTemplate(record));
      $rowMarkup.appendTo($tableBody);
      Global.localize();
      
      this.renderCalendar(this.json.employees[0]);
      this.events();
    },
    
    renderCalendar: function(currentEmployee) {
      var self = this;
      currentEmployee.days = this.orchestrateEmployeeData(currentEmployee);
      var str = '';
      var isAlt = false;
      var startDate = Dates.format(this.startDate,Content.general.dFTypes[0]);
      var endDate = Dates.format(this.endDate,Content.general.dFTypes[0])
      var dayInfo = "";
      var count = 0;
      this.totalDuration = 0;
      $(this.calendarData).each(function(i,o){
        if (currentEmployee != null) {
          dayInfo = currentEmployee.days[i]; 
          var indicatorVals = self.getIndicatorValues(dayInfo);
          var indicator = indicatorVals.indicator;
          var indicatorClass = indicatorVals.indicatorClass;
        }

        if (i == 0 || i % 7 == 0) {
          str += '<tr class="tableRow">';
          count++;
          self.duration = 0
        }
        var isOddMonth = (Dates.object(o.date).getMonth() + 1) % 2 != 0;
        var className = (isOddMonth ? (isAlt ? 'oddMAlt' : 'oddM') : (isAlt ? 'alt' : '')); 
        var isToday = (Dates.object(o.date).toDateString() == new Date().toDateString() ? ' isToday' : '');
        var dayOf = Dates.object(o.date).getDate();
        var monthSep = ((dayOf >= 1 && dayOf <= 7 && (i > 6)) ? ' monthSep' : '');
        var firstDaySep = ((dayOf == 1 && i != 0 && i % 7 != 0) ? ' firstDaySep' : '');
        var titleFormat = ((Dates.format(o.date, 'D') == '1' || (i == 0)) ? 'DD MMM' : 'DD');
        titleFormat = (Dates.format(o.date, 'D') == '1' && Dates.format(o.date, 'M') == '1' ? Content.general.dFTypes[17] : titleFormat);
        var warning = Certification.showWarningOnLoadCalender(dayInfo.positions, currentEmployee);
        
        str += '<td class="' + className + ' ' + indicatorClass + '">';
        str += '<div class="dayBlock newDayBlock' + isToday + monthSep + firstDaySep + '" lang="' + Dates.format(o.date, Content.general.dFTypes[0]) + '">'; 
        str += '<div class="title' + (isOddMonth ? ' oddMonth' : '') + '" title="' + Dates.format(o.date, Content.general.dFTypes[16]) +  '">' + Dates.format(o.date, titleFormat);
        str += warning + '</div>';
        str += '<div class="content" lang="' + i + '">';
        str += '<div class="cellContent">';
        var date = Dates.format(dayInfo.date,Content.general.dFTypes[0]);

        if(date >= startDate && date <= endDate) {
          str += "<div class='codeDescription'>"+indicator+"</div>";
          str += self.getRosterStr(dayInfo, indicatorClass);
          str += self.getShiftStr(dayInfo, indicatorClass);
          str += self.getAbsenceStr(dayInfo, indicatorClass, indicator);
          str += self.getPositionStr(dayInfo, indicatorClass)
        }
        str += '</div>';
        str += '</div>';
        str += '</div>';
        str += '</td>';
        isAlt = !isAlt;

        if ((i + 1) % 7 == 0) {
          if(self.screenPrefs.showTotals && self.dataOptions.showTotalStr) {
            str += self.totalRow(count,self.duration);
          }
          str += '</tr>';
          isAlt = false;
        }
      });
      str += '</tr>';
      if(self.screenPrefs.showTotals && self.dataOptions.showTotalStr) {
        str += self.totalDateRangeHours(self.totalDuration);
      }
      $(this.container).find('div.GridContainer table tbody').html(str);
      
      this.retainFilterRows();
    },
    
    retainFilterRows: function() {
      var self = this;
      $(".calendarFilter").each(function() {
        self.showHideCalendarFilterRows(this);
      });
      
      $(".dynamicFilter").each(function() {
        self.showHideDynamicFiltersRows(this);
      });  
    },
    
    events: function() {
      var self = this;
      
      $("input#buttonCalendarShowAll").off().on("click", function() {
        $("#calendarContent .content, #calendarContent .content .calendarDayInfo").show();
        $(".calendarFilter, .dynamicFilter").prop('checked', true);
        self.calcTotalShownHrs();
      });
      
      $("input#buttonCalendarHideAll").off().on("click", function() {
        $("#calendarContent .content, #calendarContent .content .calendarDayInfo").hide();
        $(".calendarFilter, .dynamicFilter").prop('checked', false)
        self.calcTotalHiddenHrs();
      });
      
      $("input[type=checkbox].calendarFilter").off().on("click", function() { 
        self.showHideCalendarFilterRows(this);
      });
      
      $("input[type=checkbox].dynamicFilter").off().on("click", function() { 
        self.showHideDynamicFiltersRows(this);
      });
      
    },
    
    showHideCalendarFilterRows: function(obj) {
      var className = $(obj).attr("lang");
      className = "."+className+" .content"; 
      var self = this;
      var len = $("#calendarContent .content").length;

      if($(obj).is(":checked")) {
        $(className).show();
        self.calcTotalShownHrs();
      }else {
        $(className).hide();
        $(".calendarFilter").each(function(i,o){
          var lang = $(o).attr("lang");
          var str = "."+lang+" .content";
          if($(o).is(":checked")) {
            $(str).show();
          }  
        });
       self.calcTotalHiddenHrs();
      }  
    },

    showHideDynamicFiltersRows: function(obj) {
      var className = $(obj).attr("lang");
      className = "."+className;
      
      if($(obj).is(":checked")) {
        $(className).show();
      }else {
        $(className).hide();
      }
    },

    calcTotalHiddenHrs: function() {
      var totalHiddenHrs = 0;
      $("#calendarContent tr.tableRow").each(function() {
        var rowTotal = 0;
        $(this).find(".content").each(function() {
          if($(this).css("display") == "none") {
            $(this).find("span.duration").each(function() {
              rowTotal += parseInt($(this).attr('lang'));  
            });

          }
        });  
        totalHiddenHrs += rowTotal;
        var total = parseInt($(this).find("span.rowDuration").attr("lang"));
        total = total - rowTotal;
        $(this).find("span.rowDuration").html(Dates.getDurationDisplay(total));
      });

      var totalDuration = parseInt($("span.totalDuration").attr("lang"));
      totalDuration = totalDuration - totalHiddenHrs;
      $("span.totalDuration").html(Dates.getDurationDisplay(totalDuration))
    },

    calcTotalShownHrs: function() {
      var totalHiddenHrs = 0;
      $("#calendarContent tr.tableRow").each(function() {
        var rowTotal = 0;
        $(this).find(".content").each(function() {
          if($(this).css("display") == "block") {
            $(this).find("span.duration").each(function() {
              rowTotal += parseInt($(this).attr('lang'));  
            });

          }
        });  
        totalHiddenHrs += rowTotal;
        $(this).find("span.rowDuration").html(Dates.getDurationDisplay(rowTotal));
      });
      $("span.totalDuration").html(Dates.getDurationDisplay(totalHiddenHrs));
    }
  }
  return calendar;
})(jQuery);