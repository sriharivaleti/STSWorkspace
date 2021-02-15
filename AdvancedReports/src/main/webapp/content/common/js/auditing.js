//# sourceURL=Auditing
/* globals Dates, Navigation, Paging, CSTimeEntry, Criteria, Content, ScreenPrefs */
/* exported Auditing */

var Auditing = (function() {
  "use strict";

  return {
    dateOptions: {
      WEEK_OF: 'weekOf',
      DATE_RANGE: 'dateRange'
    },
    
    json: null,
    target: null,

    previousRequestData: {},
    previousPostData: {},
    wasFilterChange: true,
    paging: null,

    get: function(options) {
      var opts = $.extend({}, {
        target: Auditing.target, employeeId: null,
        date:null, endDate:null, startTime: null, endTime: null,
        dateOption: '', dontSetTotalItems:false, 
        columnConfigs:null
      }, options);
      Auditing.lastEmployeeId = opts.employeeId;
      Auditing.lastDate = opts.date;
      Auditing.lastEndDate = opts.endDate;
      Auditing.lastDateOption = opts.dateOption;
      Auditing.lastColumnConfigs = opts.columnConfigs;
      Auditing.searchWholeEmpId = opts.searchWholeEmpId;
      
      Auditing.lastStartTime = opts.startTime;
      Auditing.lastEndTime = opts.endTime;     
      
      var target = opts.target;
      if (target == null) {
        target = Auditing.target;
      }
      else {
        Auditing.target = target;
      }
      if ($(target).find('.auditWrapper').length === 0) {
        var wrapper = '<div class="tabLoadingDiv"></div><div class="auditWrapper" style="display:none"></div>';
        $(target).html(wrapper);
      }

      $(target).find('.auditWrapper').hide();
      $(target).find('.tabLoadingDiv').show();

      if (Auditing.wasFilterChange) {
        Auditing.previousPostData = Auditing.getPostData({
          employeeId: opts.employeeId,
          startTime: opts.startTime,
          endTime: opts.endTime
        });
        Auditing.wasFilterChange = false;
      }

      var o = Auditing.previousPostData;

      var url = '/wfm/auditing/byFilter';
      if (Auditing.lastDateOption){
        if (Auditing.lastDateOption === Auditing.dateOptions.DATE_RANGE){
          url += '/start/' + Dates.format(opts.date, 'YYYY-MM-DD') + '/end/' + Dates.format(opts.endDate, 'YYYY-MM-DD');
        }
        else if (Auditing.lastDateOption === Auditing.dateOptions.WEEK_OF){
          url += '/weekof/' + Dates.format(opts.date, 'YYYY-MM-DD');
        }        
      }

      if (!opts.dontSetTotalItems && Auditing.paging != null) {
        Auditing.paging.currentPage = 1;
      }

      o.searchWholeEmpId = Auditing.searchWholeEmpId;

      if(Auditing.paging != null) {
        o.pagingRequest = Auditing.paging.getPagingRequest();
      }
      else {
        o.pagingRequest = {pageNumber: 1, resourceLink: Navigation.currentScreen };
      }
      
      o.pagingRequest.sortingRequest = {
          sortColumn: Auditing.sortColumn,
          sortOrder: Auditing.sortOrder
      };

      $.postJSON(url, o, function(json) {
        Auditing.json = json;
        Auditing.render(target, o);
      });
    },

    getPostData: function(filters) {
      var filterData = Auditing.getFilter();
      if (filters.startTime){
        filterData.push({type: 'startTime', value: filters.startTime});
      }
      if (filters.endTime){
        filterData.push({type: 'endTime', value: filters.endTime});
      }
      
      Auditing.previousFilter = {};
      $(filterData).each(function(i, o) {
        Auditing.previousFilter[o.type] = o;
      });
      
      var postData =  {};
      $(filterData).each(function(i, o) {
        var isComplexFilter = (o.parentColumnMappingType != null);
        var type = isComplexFilter ? o.parentColumnMappingType : o.type;
        var cm = Auditing.getColumnMapping(type);
        if (cm != null) {
          var mapping = cm.mapping;
          if (isComplexFilter) {
            if (cm.filterOptions == null) {
              return true;
            }
            $(cm.filterOptions.values).each(function(i, fo) {
              if (fo.name == o.type) {
                mapping = fo.name;
                return false;
              }
            });
          }

          var filterValueObj = Auditing.getFilterValueObj(mapping, o.value);
          postData[o.type] = o.value;
          if (o.operator != null) {
            filterValueObj = Auditing.getFilterValueObj(mapping, o.operator);
            postData[o.type + 'Operator'] = o.operator;
          }
        }
        else if (type == 'startTime' || type == 'endTime') {
          postData[o.type] = o.value;
        }


      });

      if (filters.employeeId != null) {
        postData['employeeId'] = filters.employeeId;
      }

      return postData;
    },

    getFilterValueObj: function(mapping, value) {
      var lastIndex = mapping.lastIndexOf(".");
      if (lastIndex != -1) {
        var type = mapping.substr(lastIndex + 1);
        var tempObj = {};
        tempObj[type] = value;
        value = tempObj;
        mapping = mapping.substring(0, lastIndex);
        return Auditing.getFilterValueObj(mapping, value);
      }
      else {
        return { type:mapping, value:value };
      }
    },

    lastEmployeeId: -1,
    lastDate: -1,
    minPageSize: 10,

    render: function(target, postData) {
      Auditing.loadColumns(Auditing.lastColumnConfigs);
      var str = '';

      str += '<div class="GridContainer">';

      str += '<table cellpadding="0" cellspacing="1" border="0">';
      str += '<thead>';
      str += Auditing.getHeaderRow();

      str += Auditing.getHeaderFilterRow();

      str += '</thead>';
      str += '<tbody>';

      $(Auditing.json.auditRecords).each(function(i, o) {
        str += Auditing.getRow(o);
      });

      str += '</tbody>';
      str += '</table>';
      str += '</div><div class="auditPagingTarget"></div>';

      $(target).find('.auditWrapper').html(str);

      if (Auditing.paging == null || (Auditing.paging != null && !Auditing.paging.isLoaded())) {
        Auditing.paging = Paging.create(Auditing.basePagingTarget, Auditing.auditingPageGet, null, Navigation.currentScreen);
      }
      Auditing.bindSortHeaderEvents();
      //str += '<div style="clear:both"></div>';

      if (Auditing.paging != null && postData.pagingRequest) {
        Auditing.paging.currentPage = postData.pagingRequest.pageNumber;
      }

      if (Auditing.json.pagingResponse && Auditing.json.pagingResponse.totalRecords != null && Auditing.paging != null) {
        Auditing.paging.setTotalItems(Auditing.json.pagingResponse.totalRecords);
      }
      Auditing.bindFilterHeaderEvents();
      Auditing.refreshDatePickerValues();

      $(target).find('.tabLoadingDiv').hide();
      $(target).find('.auditWrapper').show();
    },

    getFilter: function() {
      var filter = [];
      $(Auditing.target + ' tr.filterRow th').each(function(i, o) {
        if ($(o).find('input.filter').length > 0 && $(o).find('input.filter').val() !== '') {

          var type = $(o).attr('lang');
          var cm = Auditing.getColumnMapping(type);

          if (cm != null) {
            var mask = cm.mask;
            if (cm.filterOptions != null) {
              $(cm.filterOptions.values).each(function(i, fo) {
                var innerFilterType = fo.name;
                var filterElement = $(o).find('input.filter[lang="' + fo.name + '"]');
                var value = $(filterElement).val();
                if (value !== '') {
                  filter.push(Auditing.getFilterInnerObject(innerFilterType, value, mask, filterElement, o, type));
                }
              });
            }
            else {
              var filterElement = $(o).find('input.filter');
              var value = $(filterElement).val();

              filter.push(Auditing.getFilterInnerObject(type, value, mask, filterElement, o));
            }
          }
        }
      });
      return filter;
    },

    getFilterInnerObject: function(type, value, mask, filterElement, headerCell, parentColumnMappingType) {

      var filterObj = {};
      filterObj.type = type;
      filterObj.value = value;
      if (mask != null) {
        if (mask == 'duration' || mask == 'duration24' || mask == 'duration546') {
          filterObj.value = Dates.convertDurationDisplay(filterObj.value);
        }
        if (mask == 'date' && filterElement.hasClass('dateFilter')) {
          var dateTimeValue = Dates.revertForJSON(filterElement.datepicker('getDate'));
          filterObj.value = [dateTimeValue[0], dateTimeValue[1], dateTimeValue[2]];
        }
      }

      if ($(headerCell).find('select.operator[lang="' + type + '"]').length > 0) {
        filterObj.operator = $(headerCell).find('select.operator[lang="' + type + '"] option:selected').val();
      }
      if (parentColumnMappingType != null) {
        filterObj['parentColumnMappingType'] = parentColumnMappingType;
      }
      return filterObj;
    },

    bindFilterHeaderEvents: function() {

      $(Auditing.target + ' tr.filterRow input.dateFilter').unbind();
      Criteria.initializeDatePicker(Auditing.target + ' tr.filterRow input.dateFilter', {
        firstDay: Dates.getStartOfWeekNumber() - 1,
        dateFormat: Dates.getDatepickerFormat(Content.general.dFTypes[1]),
        onSelect: function(dateText, inst, input) {
          $(input).datepicker('hide');
          
          Auditing.wasFilterChange = true;
          Auditing.get({
            employeeId: Auditing.lastEmployeeId,
            date: Auditing.lastDate,
            endDate: Auditing.lastEndDate,
            dateOption: Auditing.lastDateOption,
            columnConfigs: Auditing.lastColumnConfigs,
            startTime: Auditing.lastStartTime,
            endTime: Auditing.lastEndTime,           
            dontSetTotalItems: false
          });
        }
      });

      $(Auditing.target + ' tr.filterRow input[type="text"].filter').not('.dateFilter').unbind('keyup.filter').bind('keyup.filter', function(event) {
        if (event.keyCode == 13) {
          Auditing.wasFilterChange = true;
          Auditing.get({
            employeeId: Auditing.lastEmployeeId,
            date: Auditing.lastDate,
            endDate: Auditing.lastEndDate,
            dateOption: Auditing.lastDateOption,
            columnConfigs: Auditing.lastColumnConfigs,
            startTime: Auditing.lastStartTime,
            endTime: Auditing.lastEndTime,           
            dontSetTotalItems: false
          });
        }
      });
      $(Auditing.target + ' tr.filterRow input[type="text"].filter').prop('disabled',true).prop('disabled', false);
    },

    refreshDatePickerValues: function() {
      $('.dateFilter').each(function(i, o) {
        if ($(o).attr('name') !== '') {
          $(o).datepicker('setDate', $(o).attr('name'));
        }
      });

    },

    auditingPageGet: function(isItemChange) {
      var reloadTotal = isItemChange == null || !isItemChange;
      Auditing.get({
        employeeId: Auditing.lastEmployeeId,
        date: Auditing.lastDate,
        endDate: Auditing.lastEndDate,
        startTime: Auditing.lastStartTime,
        endTime: Auditing.lastEndTime, 
        dateOption: Auditing.lastDateOption,
        columnConfigs: Auditing.lastColumnConfigs,
        dontSetTotalItems: reloadTotal
      });
    },

    basePagingTarget: 'div.auditPagingTarget',

    isViewAuditingEnabled: function() {
      return ScreenPrefs.isAuditEnabled;
    },

    clearAuditing: function(target) {
      if (target == null) { target = Auditing.target; }
      $(target).html('');
    },

    loadAuditing: function(options) {
      Auditing.target = options.target;
      Auditing.wasFilterChange = true;
      Auditing.get(options);
    },

    getHeaderCell: function(content, isAlt, name, notSortable) {
      var alt = isAlt ? "alt" : "";
      var sortIndicator = '';
      var sortClass = notSortable !== null && !notSortable ? 'sortable' : '';
      if (sortClass !== '' && Auditing.sortColumn != null && Auditing.sortOrder != null && Auditing.sortColumn == name) {
        sortIndicator += '<div class="sortIndicator"><i class="fa fa-arrow-' + (Auditing.sortOrder == 'ascending' ? 'up' : 'down') + '"></i></div>';
      }

      return '<th class="' + alt + ' ' + sortClass + '" lang="' + name + '">' + content + sortIndicator + '</th>';
    },

    bindSortHeaderEvents: function() {
      $('.auditWrapper thead tr').not('.filterRow').find('th.sortable').unbind('click');
      $('.auditWrapper thead tr').not('.filterRow').find('th.sortable').bind({
        click: function(event) {
          var colName = $(this).attr('lang');
          if (Auditing.sortColumn == null || Auditing.sortColumn != colName) {
            Auditing.sortColumn = colName;
            Auditing.sortOrder = 'ascending';
          }
          else {
            if (Auditing.sortColumn == colName) {
              if (Auditing.sortOrder == 'descending') {
                Auditing.sortOrder = null;
                Auditing.sortColumn = null;
              }
              else {
                Auditing.sortOrder = 'descending';
              }
            }
          }
          Auditing.fireSort();
        }
      });
    },

    fireSort: function() {
      Auditing.get({
        employeeId: Auditing.lastEmployeeId,
        date: Auditing.lastDate,
        endDate: Auditing.lastEndDate,
        startTime: Auditing.lastStartTime,
        endTime: Auditing.lastEndTime, 
        dateOption: Auditing.lastDateOption,
        columnConfigs: Auditing.lastColumnConfigs,
        dontSetTotalItems: false
      });
    },

    getHeaderFilterCell: function(filterObj, oldFilterObj, isAlt) {
      var alt = isAlt ? "alt" : "";
      var col = '<th class="' + alt + '" lang="' + filterObj.name + '">';
      var isFilterable = (filterObj.isFilterable == null || filterObj.isFilterable);
      if (isFilterable && filterObj.displayType === 'display'){
        col += Auditing.getFilterControl(filterObj.mask, filterObj.dFKey, filterObj.name, oldFilterObj);
      }
      col += '</th>';
      return col;
    },

    getCell: function(content, isAlt, additionalClass, alignClass, mask, dFKey) {
      var alt = isAlt ? "alt" : "";
      alignClass = alignClass == null ? "c" : alignClass;
      additionalClass = additionalClass == null ? "" : additionalClass;
      if (mask != null && content != null) {
        switch (mask) {
        case 'dateTime':
          content = Dates.format(content, Content.general.dFTypes[dFKey]);
          break;
        case 'date':
          content = Dates.format(content, Content.general.dFTypes[dFKey]);
          break;
        default:
          break;
        }
      }
      if (content == null) {
        content = "";
      }
      return '<td class="' + alt + ' ' + alignClass + ' ' + additionalClass + '">' + content + '</td>';
    },

    getFilterControl: function(mask, dFKey, filterName, oldFilterObj) {

      var inClass = '';
      var col = '';
      var oldValue = (oldFilterObj[filterName] != null ? oldFilterObj[filterName].value : "");
      if (mask == 'duration' || mask == 'militaryTime' || mask == 'decimal' || mask == 'decimalHour') {
        var oldOperator = "";
        if (oldFilterObj[filterName] != null && oldFilterObj[filterName].operator != null) {
          oldOperator = oldFilterObj[filterName].operator;
        }
        col += '<select class="operator" lang="' + filterName + '">';
        col += '<option value=">" ' + (oldOperator == '>' ? 'selected="selected"' : "") + '>&gt;</option>';
        col += '<option value=">=" ' + (oldOperator == '>=' ? 'selected="selected"' : "") + '>&gt;=</option>';
        col += '<option value="=" ' + (oldOperator == '=' ? 'selected="selected"' : "") + '>=</option>';
        col += '<option value="<=" ' + (oldOperator == '<=' ? 'selected="selected"' : "") + '>&lt;=</option>';
        col += '<option value="<" ' + (oldOperator == '<' ? 'selected="selected"' : "") + '>&lt;</option>';
        col += '</select>';
        inClass = 'filterSmall';
        if (mask == 'duration' && oldValue != "") {
          oldValue = Dates.getDurationDisplay(oldValue);
        }

      }
      var nameVal = '';
      if (mask == 'date') {
        inClass += ' dateFilter';
        if (oldValue != "") {
          nameVal = Dates.format(oldValue, Content.general.dFTypes[dFKey]);
          oldValue = Dates.format(oldValue, Content.general.dFTypes[dFKey]);
        }
      }
      col += '<input type="text" lang="' + filterName + '" name="' + nameVal + '" class="filter ' + inClass + '" value="' + oldValue + '"/>';
      return col;
    },

    loadColumns: function(configs) {
      var defaults = [
        { name:'applicationName', mapping:'applicationName', display:Content.auditing.applicationName, show:true, displayType:'display' },
        { name:'userId', mapping:'userId', display:Content.auditing.userId, show:true, displayType:'display' },
        { name:'timestamp', mapping:'timestamp', display:Content.auditing.timestamp, show:true, displayType:'display', mask:'dateTime',dFKey:10, isFilterable:false },
        { name:'employeeId', mapping:'employeeId', display:Content.auditing.targetEmployeeId, show:true, displayType:'display' },
        { name:'pdate', mapping:'pdate', display:Content.auditing.payrollDate, show:true, displayType:'display', mask:'date', dFKey:1 },
        { name:'type', mapping:'type', display:Content.auditing.type, show:true, displayType:'display' },
        { name:'id', mapping:'id', display:Content.auditing.id, show:true, displayType:'display' },
        { name:'action', mapping:'difference.action', display:Content.auditing.action, show:true, displayType:'display' },
        { name:'field', mapping:'difference.field', display:Content.auditing.name, show:true, displayType:'display' },
        { name:'after', mapping:'difference.after', display:Content.auditing.value, show:true, displayType:'display' },
        { name:'before', mapping:'difference.before', display:Content.auditing.previousValue, show:true, displayType:'display' }
      ];
      
      if (configs){
        Auditing.columnMapping = $.map(defaults, function(col, i){
          return configs[col.name]? $.extend({}, col, configs[col.name]) : col;
        });  
      } else {
        Auditing.columnMapping = defaults;
      }
      
    },

    getColumnMapping: function(name) {
      var cm = null;
      $(Auditing.columnMapping).each(function(i, o) {
        if (o.name == name) {
          cm = o;
          return false;
        }
      });
      return cm;
    },

    getHeaderRow: function() {
      var str = '';
      str += '<tr>';
      var isAlt = false;

      $(Auditing.columnMapping).each(function(i, o) {
        if (o.show) {
          str += Auditing.getHeaderCell(o.display, isAlt, o.name);
          isAlt = !isAlt;
        }
      });


      str += '</tr>';
      return str;
    },

    getHeaderFilterRow: function() {
      var str = '';
      str += '<tr class="filterRow">';
      var isAlt = false;
      var oldFilterObj = Auditing.previousFilter != null ? Auditing.previousFilter : {};

      $(Auditing.columnMapping).each(function(i, o) {
        if (o.show) {
          str += Auditing.getHeaderFilterCell(o, oldFilterObj, isAlt);
          isAlt = !isAlt;
        }
      });

      str += '</tr>';
      return str;
    },

    getRow: function(o) {
      var str = '';
      str += '<tr class="data">';
      var isAlt = false;

      $(Auditing.columnMapping).each(function(i, cm) {
        if (cm.show) {
          var value = null;
          try {
            value = eval('o.' + cm.mapping);
          }
          catch (ex) {

          }
          str += Auditing.getCell(value, isAlt, null, null, cm.mask, cm.dFKey);
          isAlt = !isAlt;
        }
      });


      str += '</tr>';
      return str;
    },

    eof: 0

  };

})();
