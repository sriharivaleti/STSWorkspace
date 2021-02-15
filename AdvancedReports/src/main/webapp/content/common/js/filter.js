/* globals Dates, Content, ServerVars, MessageDisplay */

var Filter = (function($, undefined) {
  "use strict";
  
  return {

    getPageFilter: function() {
      if (Filter.getPageFilterOverride != null) {
        return Filter.getPageFilterOverride();
      }
      else {
        return null;
      }
    },

    getPageFilterOverride: null,

    loadControl: function(filterOptions) {
      Filter.screenType = filterOptions.screenType;
      Filter.onChangeFunction = filterOptions.onChangeFunction;
      Filter.orchestrateFunction = filterOptions.orchestrateFunction;
      Filter.serializeFunction = filterOptions.serializeFunction;
      Filter.clearFilterFunction = filterOptions.clearFilterFunction;
      Filter.canUpdateFilterFunction = filterOptions.canUpdateFilterFunction;
      $(filterOptions.target).html(Filter.getControl());
      Filter.get(filterOptions.onFilterLoad);
      Filter.applyPermissions();
      Filter.bindFilterEvents();
    },

    getFilterValueObj: function(key, value, operator) {
      var filterValue = {key:key, operator:operator};
      if ($.isArray(value)) {
        filterValue.elements = value;
      }
      else {
        filterValue.value = value;
      }
      return filterValue;
    },

    getFilterDate: function(filter) {
      var filterDateObj = { dateValue:"", isValid:false };
      var dateAttr = "dateAttr";
      var previousWeekOption = "previousWeek";
      if (filter != null && filter[dateAttr] == previousWeekOption) {
        filterDateObj.isValid = true;
        filterDateObj.dateValue = Dates.format(Dates.addDay(new Date(), -7), Content.general.dFTypes[1]);
      }
      return filterDateObj;
    },

    getControl: function() {
      var isCurrentUser = false;
      var currentFilter = Filter.getSelectedFilter();
      if (currentFilter.isValid) {
        isCurrentUser = currentFilter.filter.createdBy == ServerVars.userId;
      }

      var str = '<div class="filterContainer" align="left">';
      str += '  <div class="filterControl">';
      str += '    <div class="filterInputs">';
      str += '      <span class="filterTitle">' + Content.filter.filter + '</span>';
      str += '      <select class="filterSelect"></select>';
      str += '    </div>';
      str += '    <div class="buttonBox">';
      
      var saveIcon = '<div class="save filterButton ' + (currentFilter.isValid && isCurrentUser && currentFilter.canUpdate ? 'enabled' : '') + '" title="' + Content.filter.save + '">';
      saveIcon += '<i class="fa fa-save fa-lg"></i>';
      saveIcon += '</div>';
      str += saveIcon;
      
      var saveAsIcon = '<div class="saveAs filterButton ' + (currentFilter.canUpdate ? 'enabled' : '') + '" title="' + Content.filter.saveAs + '">';
      saveAsIcon += '<span class="fa-stack">';
      saveAsIcon += '<i class="fa fa-save fa-stack-2x saveAsBaseIcon"></i>';
      saveAsIcon += '<i class="fa fa-pencil fa-stack-1x saveAsPencilIcon"></i>';
      saveAsIcon += '</span></div>';
      str += saveAsIcon;
      
      var deleteIcon = '<div class="delete filterButton ' + (currentFilter.isValid && isCurrentUser ? 'enabled' : '') + '" title="' + Content.filter['delete'] + '">';
      deleteIcon += '<i class="fa fa-remove fa-lg"></i>';
      deleteIcon += '</div>';
      str += deleteIcon;
      
      var clearIcon = '<div class="clear filterButton enabled"' + '" title="' + Content.filter['clear'] + '">';
      clearIcon += '<i class="fa fa fa-minus-circle fa-lg"></i>';
      clearIcon += '</div>';
      str += clearIcon;
      
      str += '    </div>';
      str += '  </div>';
      str += '  <div class="filterDisplay">';
      str += '  </div>';
      str += '</div>';
      return str;
    },

    refreshButtonBox: function() {
      var currentFilter = Filter.getSelectedFilter();
      var isCurrentUser = false;
      var isEnabled;
      if (currentFilter.isValid) {
        isCurrentUser = currentFilter.filter.createdBy == ServerVars.userId;
      }
      $('div.filterContainer div.filterControl div.buttonBox .filterButton').each(function(i, o) {

        if ($(o).hasClass('save') || $(o).hasClass('delete')) {
          isEnabled = currentFilter.isValid && currentFilter.canUpdate && isCurrentUser;
          $(o).removeClass('enabled');
          if (isEnabled) {
            $(o).addClass('enabled');
          }
        }
        else if ($(o).hasClass('saveAs')) {
          if (!currentFilter.canUpdate) {
            $(o).removeClass('enabled');
          }
          else {
            $(o).addClass('enabled');
          }
        }
      });
      
      $('div.filterControl select.filterSelect').selectmenu("refresh");
    },

    applyPermissions: function() {
      $('div.filterContainer div.filterControl div.buttonBox').toggle(ServerVars.permissions.screenFilters);
    },

    showSaveAsDialog: function() {
      var additionalContent = '<span style="margin-right:8px">' + Content.filter.filterName + '</span><input type="text" name="filterName" />';
      MessageDisplay.confirm('', Filter.saveAs, null, additionalContent);
    },

    doesFilterExist: function(filterName) {
      var found = false;
      $(Filter.filters).each(function(i, o) {
        if (o.filterName == filterName) {
          found = true;
          return false;
        }
      });
      return found;
    },

    saveAs: function(params, data) {
      if (Filter.doesFilterExist(data.filterName)) {
        Filter.showSaveAsDialog();
        MessageDisplay.error(Content.filter.filterAlreadyExists);
        return;
      }
      var pageFilter = null;
      if (Filter.serializeFunction != null) {
        pageFilter = Filter.serializeFunction();
      }
      pageFilter.filterName = data.filterName;

      if (pageFilter != null) {
        var url = '/wfm/screenFilter/savefilter';
        Filter.loadInitialValues({ filterName:data.filterName, screenType:pageFilter.screenType, createdBy:ServerVars.userId });
        $.putJSON(url, pageFilter, function(json) {
          Filter.get();
        });
      }
    },

    save: function(currentFilter) {
      var pageFilter = null;
      if (Filter.serializeFunction != null) {
        pageFilter = Filter.serializeFunction();
      }


      pageFilter.filterName = currentFilter.filterName;
      pageFilter.createdBy = ServerVars.userId;
      Filter.lastSavedFilter = pageFilter;
      if (pageFilter != null) {
        var url = '/wfm/screenFilter/updatefilter';
        // Include the save as name
        Filter.loadInitialValues(currentFilter);
        $.putJSON(url, pageFilter, function(json) {
          Filter.get();
        });
      }
    },

    loadInitialValues : function(filter) {
      Filter.selectInitialId = filter.filterId;
      Filter.selectInitialName = filter.filterName;
      Filter.selectInitialScreenType = filter.screenType;
      Filter.selectInitialCreatedBy = filter.createdBy;
    },

    clearInitialValues: function() {
      Filter.selectInitialId = null;
      Filter.selectInitialName = null;
      Filter.selectInitialScreenType = null;
      Filter.selectInitialCreatedBy = null;
    },

    deleteFilter: function(filter) {
      if (filter != null) {
        var url = '/wfm/screenFilter/deletefilter';
        $.deleteJSON(url, filter, function(json) {
          Filter.clearFilter(false);
          Filter.get();
        });
      }
    },

    populateFilterSelect: function() {
      var str = [];
      if (Filter.filters.length === 0) {
        str.push('<option value="null">' + Content.filter.noFiltersAvailable + '</option>');
      }
      else {
        str.push('<option value="null">' + Content.filter.selectFilter + '</option>');
      }
      var found = false;
      $(Filter.filters).each(function(i, o) {
        var isInitial = ((o.filterId != null && o.filterId == Filter.selectInitialId) || (o.filterName == Filter.selectInitialName && o.screenType == Filter.selectInitialScreenType && o.createdBy == Filter.selectInitialCreatedBy));
        if (isInitial) {
          found = true;
        }
        var selectString = isInitial ? ' selected="selected" ' : '';
        str.push('<option value="' + o.filterName + '" lang="' + i + '" ' + selectString + '>' + o.filterName + '</option>');
      });

      $('div.filterControl select.filterSelect').html(str.join(''));
      $('div.filterControl select.filterSelect').selectmenu({
      	width: "auto",
      	change: Filter.loadCurrentFilter
      });
      Filter.bindFilterEvents();
      Filter.refreshButtonBox();
      if (found) {
        Filter.loadCurrentFilter();
        Filter.clearInitialValues();
      }
    },

    get: function(onComplete) {
      var url = '/wfm/screenFilter/screenType/' + Filter.screenType;
      // Debug code
      //url = '/wfm/screenPref/getAll';
      $.getJSON(url, {}, function(json) {
        if (json == null) {
          json = {"screenFilters":[{"filterValues":[{"key":"firstName","operator":null,"value":"O"}, {"key":"absenceHrs","operator":"<","value":"240"}],"filterName":"test name","screenName":"Payroll Summary","screenTypeId":1}]};
        }

        Filter.filters = json.screenFilters;
        Filter.populateFilterSelect();
        if (onComplete != null) {
          onComplete();
        }
      });
    },

    loadFieldMapping: function() {
      var map = {};
      var fieldName = '';
      // Always set field name after copy/paste
      fieldName = 'name';
      map[fieldName] = Filter.getFieldMapObj(fieldName, Filter.getFieldDisplay(fieldName, 'Name'));
      fieldName = 'firstName';
      map[fieldName] = Filter.getFieldMapObj(fieldName, Filter.getFieldDisplay(fieldName, 'First Name'));
      fieldName = 'lastName';
      map[fieldName] = Filter.getFieldMapObj(fieldName, Filter.getFieldDisplay(fieldName, 'Last Name'));
      Filter.fieldMapping = map;
    },

    getFieldMapObj: function(name, display, isDuration) {
      return {
        name:name,
        display:display,
        isDuration:isDuration
      };
    },

    displayFilter: function(filter) {
      /*if (Filter.fieldMapping == null) {
        Filter.loadFieldMapping();
      }
      var str = [];

      $(filter.filterValues).each(function(i, o) {
        var tempStr = '';
        if (i > 0) {
          tempStr = ', ';
        }

        if (Filter.fieldMapping[o.key] != null) {
          var map = Filter.fieldMapping[o.key];
          tempStr += Filter.getFilterDisplayIfNotNull(o, map.display, map.isDuration);
        }
        else {
          tempStr += Filter.getFilterDisplayIfNotNull(o, o.key);
        }
        str.push(tempStr);
      });

      $('div.filterContainer div.filterDisplay').html(str.join(''));*/
    },

    displayFilterString: function(filter) {
      $('div.filterContainer div.filterDisplay').html(filter);
    },

    fieldMapping: null,

    getFieldDisplay: function(field, defaultValue) {
      if (defaultValue == null) { defaultValue = field; }
      if (Content.filter.fields[field] != null) {
        return Content.filter.fields[field];
      }
      return defaultValue;
    },

    getFilterDisplayIfNotNull: function(filterValue, display, isDuration) {
      var value = filterValue.value;
      if (value != null) {
        if (isDuration) {
          value = Dates.getDurationDisplay(value);
        }
        if (filterValue.operator != null) {
          value = filterValue.operator + ' ' + value;
        }

        return Filter.getFilterDisplayRow(display, value);
      }
      return '';
    },

    getFilterDisplayRow: function(display, value, count) {
      var str = '';

      str += '<span>' + display + '</span>';
      str += '<span>:</span>';
      str += '<span>' + value + '</span>';
      return str;

    },

    getFilterById: function(filterId) {
      var filterToReturn = null;
      $(Filter.filters).each(function(i, filter) {
        if (filter.filterId == filterId) {
          filterToReturn = $.extend(true, {}, filter);
          return false;
        }
      });
      return filterToReturn;
    },

    getFilterByName: function(filterName) {
      var filterToReturn = null;
      $(Filter.filters).each(function(i, filter) {
        if (filter.filterName == filterName) {
          filterToReturn = $.extend(true, {}, filter);
          return false;
        }
      });
      return filterToReturn;
    },

    getSelectedFilter: function() {
      var selectedFilter = $('div.filterControl div.filterInputs select.filterSelect option:selected');
      var filterIndex = parseInt(selectedFilter.attr('lang'));
      var isValid = false;
      var canUpdate = true;
      var filter = null;
      if (!isNaN(filterIndex) && Filter.filters.length > filterIndex && filterIndex >= 0) {
        filter = Filter.filters[filterIndex];
        canUpdate = Filter.canUpdateFilterFunction ? Filter.canUpdateFilterFunction(filter) : true;
        isValid = true;
      }
      var filterObj = { filter: filter, isValid:isValid, canUpdate: canUpdate };
      return filterObj;
    },

    setSelectedFilterByName: function(filterName) {
      var filter = {};
      filter.filterName = filterName;
      Filter.setSelectedFilter(filter);
    },

    setSelectedFilterById: function(filterId) {
      var filter = Filter.getFilterById(ServerVars.filterDetails.filterId);
      Filter.setSelectedFilter(filter);
    },

    setSelectedFilter: function(filter) {
      var $select = $('div.filterControl div.filterInputs select.filterSelect');
      $select.val(filter.filterName);
      $select.change();
    },

    clearSelectedFilter: function() {
      var $select = $('div.filterControl div.filterInputs select.filterSelect option[value="null"]');
      $select.prop('selected', true);
    },

    bindFilterEvents: function() {
      if (ServerVars.permissions.screenFilters) {
        $('div.filterControl div.buttonBox .filterButton').unbind('click');
        $('div.filterControl div.buttonBox .filterButton.saveAs').bind('click', function(event) {
          if ($(this).hasClass('enabled')) {
            Filter.showSaveAsDialog();
          }
        });

        $('div.filterControl div.buttonBox .filterButton.delete').bind('click', function(event) {
          if ($(this).hasClass('enabled')) {
            var currentFilter = Filter.getSelectedFilter();
            if (currentFilter.isValid) {
              var message = Content.filter.confirmDelete;
              MessageDisplay.confirm(message, Filter.deleteFilter, currentFilter.filter);
            }
          }
        });
        $('div.filterControl div.buttonBox .filterButton.save').bind('click', function(event) {
          if ($(this).hasClass('enabled')) {
            var currentFilter = Filter.getSelectedFilter();
            if (currentFilter.isValid) {
              Filter.save(currentFilter.filter);
            }
          }
        });

        $('div.filterControl div.buttonBox .filterButton.clear').bind('click', function(event) {
          if ($(this).hasClass('enabled')) {
            var message = Content.filter.confirmClearFilter;
            MessageDisplay.confirm(message, Filter.clearFilter);
          }
        });

      }

      $('div.filterControl div.filterInputs select.filterSelect').unbind('change').bind('change', function(event) {
        Filter.loadCurrentFilter();
      });
    },

    loadCurrentFilter: function() {
      var currentFilter = Filter.getSelectedFilter();
      if (currentFilter.isValid) {
        Filter.clearFilter(true);
        currentFilter = currentFilter.filter;
        var filter = jQuery.extend(true, {}, currentFilter);
        if (Filter.orchestrateFunction != null) {
          filter = Filter.orchestrateFunction(filter);
        }

        if (Filter.onChangeFunction != null) {
          Filter.onChangeFunction(filter);
        }

        Filter.refreshButtonBox();
      }
      else {
        Filter.clearFilter();
      }
    },

    clearFilter: function(hideClear) {
      if (Filter.clearFilterFunction != null) {
        Filter.clearFilterFunction(!hideClear);
      }
      if (!hideClear) {
        var currentFilter = {"filterValues":[],"filterName":""};
        var filter = jQuery.extend(true, {}, currentFilter);
        if (Filter.orchestrateFunction != null) {
          filter = Filter.orchestrateFunction(filter);
        }
        Filter.clearSelectedFilter();
        Filter.refreshButtonBox();
      }
    }
  };
}) (jQuery);
