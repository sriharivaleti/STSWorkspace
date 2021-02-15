/* globals Dates, Content, ScreenPrefs */

var ClockData = (function() {
  "use strict";
  
  return {
    json: null,
    target: null,
    get: function(employeeId, startDate, endDate, target, scrollTo, postLoadFunction, isSingleDate) {
      var url; 
      var data;
      if (endDate !== null) {
        url = '/wfm/time/clock/dateRange';
        data = {employeeId: employeeId, start: Dates.format(startDate, 'YYYY-MM-DD'), end: Dates.format(endDate, 'YYYY-MM-DD')};
      }
      else {
        var datePart = isSingleDate ? 'date' : 'weekOf';
        url = '/wfm/time/clock/' + datePart;
        data = {employeeId: employeeId, date: Dates.format(startDate, 'YYYY-MM-DD')};
      }

      $.getJSON(url, data, function(json) {
        ClockData.json = json;
        ClockData.render(target, scrollTo);
        if (postLoadFunction != null) {          
          postLoadFunction();
        }
      });
    },   
    
    render: function(target, scrollTo) {
      var str = '';
      if (ClockData.json != null && ClockData.json.events != null && ClockData.json.events.length > 0) {
        str += '<div class="GridContainer">';
        str += '<table cellpadding="0" cellspacing="1" border="0">';
        str += '<thead>';
        str += ClockData.getHeaderRow();
        str += '</thead>';
        str += '<tbody>';
        
          $(ClockData.json.events).each(function(i, o) {
            str += ClockData.getRow(o);
          });
        
        str += '</tbody>';
        str += '</table>';
        
        str += '</div>';
      }
      else {
        str += '<div class="noClockData">' + Content.clockData.noClockData + '</div>';
      }
      if (target == null) {
        target = ClockData.target;
      }
      $(target).html(str);
      if (scrollTo != null && scrollTo) {
        var offset = ($(window).height()-$(target).height())-10;
        
        $.scrollTo($(target), 10, { offset:{top:-offset}});
      }
    },
    
    isViewClockDataEnabled: function() {
      return  (ScreenPrefs.showClockData_Status || ScreenPrefs.showClockData_ClockDate || ScreenPrefs.showClockData_ClockTime ||
              ScreenPrefs.showClockData_Type || ScreenPrefs.showClockData_Center || ScreenPrefs.showClockData_Position || 
              ScreenPrefs.showClockData_Terminal || ScreenPrefs.showClockData_WorkOrder || ScreenPrefs.showClockData_WorkItem || 
              ScreenPrefs.showClockData_Operation || ScreenPrefs.showClockData_Data || ScreenPrefs.showClockData_ProxyId || 
              ScreenPrefs.showClockData_Code || ScreenPrefs.showClockData_EndTime || ScreenPrefs.showClockData_Duration ||
              ScreenPrefs.showClockData_Comments || ScreenPrefs.showClockData_Amount || ScreenPrefs.showClockData_Udf1 ||
              ScreenPrefs.showClockData_Udf2 || ScreenPrefs.showClockData_Udf3 || ScreenPrefs.showClockData_Udf4 ||
              ScreenPrefs.showClockData_Udf5) && ServerVars.permissions.canViewClockData;
    },
    
    clearClockData: function(target) {
      if (target == null) { target = ClockData.target; }
      $(target).html('');
    },
    
    loadClockData: function(target, employeeId, date, isSingleDate, scrollTo, postLoadFunction) {
      ClockData.target = target;
      ClockData.get(employeeId, date, null, target, scrollTo, postLoadFunction, isSingleDate);
    },
    
    loadClockDataForDateRange: function(target, employeeId, startDate, endDate, scrollTo, postLoadFunction) {
      ClockData.target = target;
      ClockData.get(employeeId, startDate, endDate, target, scrollTo, postLoadFunction, false);
    },

    getHeaderCell: function(content, isAlt) {
      var alt = isAlt ? "alt" : "";
      return '<th class="' + alt + '">' + content + '</th>';
    },
    
    getCell: function(content, isAlt, additionalClass, alignClass) {
      var alt = isAlt ? "alt" : "";
      alignClass = alignClass == null ? "c" : alignClass;
      additionalClass = additionalClass == null ? "" : additionalClass;
      if (content == null) { content = ''; }
      return '<td class="' + alt + ' ' + alignClass + ' ' + additionalClass + '">' + content + '</td>';
    },
    
    getHeaderRow: function() {
      var str = '';
      str += '<tr>';
      var isAlt = false;
      if (ScreenPrefs.showClockData_Status) {
        str += ClockData.getHeaderCell(Content.clockData.status, isAlt);
        isAlt = !isAlt;
      }      
      if (ScreenPrefs.showClockData_ClockDate) {
        str += ClockData.getHeaderCell(Content.clockData.clockDate, isAlt);
        isAlt = !isAlt;    
      }
      if (ScreenPrefs.showClockData_ClockTime) {
        str += ClockData.getHeaderCell(Content.clockData.clockTime, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Type) {
        str += ClockData.getHeaderCell(Content.clockData.type, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Center) {
        str += ClockData.getHeaderCell(Content.clockData.center, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Position) {
        str += ClockData.getHeaderCell(Content.clockData.position, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Terminal) {
        str += ClockData.getHeaderCell(Content.clockData.terminal, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_WorkOrder) {
        str += ClockData.getHeaderCell(Content.clockData.workOrder, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_WorkItem) {
        str += ClockData.getHeaderCell(Content.clockData.workItem, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Operation) {
        str += ClockData.getHeaderCell(Content.clockData.operation, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Data) {
        str += ClockData.getHeaderCell(Content.clockData.data, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_ProxyId) {
        str += ClockData.getHeaderCell(Content.clockData.proxyId, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Code) {
        str += ClockData.getHeaderCell(Content.clockData.code, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_EndTime) {
        str += ClockData.getHeaderCell(Content.clockData.endTime, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Duration) {
        str += ClockData.getHeaderCell(Content.clockData.duration, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Comments) {
        str += ClockData.getHeaderCell(Content.clockData.comments, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Amount) {
        str += ClockData.getHeaderCell(Content.clockData.amount, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf1) {
        str += ClockData.getHeaderCell(Content.clockData.udf1, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf2) {
        str += ClockData.getHeaderCell(Content.clockData.udf2, isAlt);
        isAlt = !isAlt;    
      }
      if (ScreenPrefs.showClockData_Udf3) {
        str += ClockData.getHeaderCell(Content.clockData.udf3, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf4) {
        str += ClockData.getHeaderCell(Content.clockData.udf4, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf5) {
        str += ClockData.getHeaderCell(Content.clockData.udf5, isAlt);
        isAlt = !isAlt;
      }      
      str += '</tr>';
      return str;
    },
    
    getRow: function(o) {      
      var str = '';
      str += '<tr class="data">';
      var isAlt = false;
      if (ScreenPrefs.showClockData_Status) {
        str += ClockData.getCell(o.status == null ? "null" : o.status, isAlt);
        isAlt = !isAlt;
      }      
      if (ScreenPrefs.showClockData_ClockDate) {
        str += ClockData.getCell(Dates.format(o.time, Content.general.dFTypes[1]), isAlt);
        isAlt = !isAlt;  
      }
      if (ScreenPrefs.showClockData_ClockTime) {
        str += ClockData.getCell(Dates.format(o.time, Content.general.dFTypes[5]), isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Type) {
        str += ClockData.getCell(o.type, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Center) {
        var centerValue = o.position != null ? (o.position.costCenter.id) : '';  
        str += ClockData.getCell(centerValue, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Position) {
        var positionValue = o.position != null ? (o.position.id) : '';  
        str += ClockData.getCell(positionValue, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Terminal) {
        str += ClockData.getCell(o.terminal, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_WorkOrder) {
        var workOrderValue = o.workItem != null ? (o.workItem.workOrder.id) : '';  
        str += ClockData.getCell(workOrderValue, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_WorkItem) {
        var workItemValue = o.workItem != null ? (o.workItem.id) : '';  
        str += ClockData.getCell(workItemValue, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Operation) {
        str += ClockData.getCell(o.operation, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Data) {
        str += ClockData.getCell(o.data, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_ProxyId) {
        str += ClockData.getCell(o.proxyId, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Code) {
        str += ClockData.getCell(o.code, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_EndTime) {
        var endTime = o.endTime != null ? Dates.format(o.endTime, Content.general.dFTypes[5]) : '';
        str += ClockData.getCell(endTime, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Duration) {
        var duration = o.duration != null ? Dates.getDurationDisplay(o.duration) : '';
        str += ClockData.getCell(duration, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Comments) {
        str += ClockData.getCell(o.comments, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Amount) {
        str += ClockData.getCell(o.amount, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf1) {
        str += ClockData.getCell(o.udf1, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf2) {
        str += ClockData.getCell(o.udf2, isAlt);
        isAlt = !isAlt;    
      }
      if (ScreenPrefs.showClockData_Udf3) {
        str += ClockData.getCell(o.udf3, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf4) {
        str += ClockData.getCell(o.udf4, isAlt);
        isAlt = !isAlt;
      }
      if (ScreenPrefs.showClockData_Udf5) {
        str += ClockData.getCell(o.udf5, isAlt);
        isAlt = !isAlt;
      }      
      str += '</tr>';
      return str;
    },
    
    eof: 0

  };

})();
