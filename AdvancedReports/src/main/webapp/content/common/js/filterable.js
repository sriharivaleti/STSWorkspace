//# sourceURL=Filterable
var Filterable = function(options) {

  var filterableInstance = {
    options : options,
    tableSelector : options.tableSelector,
    filterGet : options.filterGet,
    filterObjs : options.filterObjs || [],

    bindFilterEvents: function() {
      var instance = this;

      $(this.tableSelector + ' tr.filterRow input.timeFilter').off('blur').on('blur', function(event) {
        var timeEntry = $(this).val();
        if (timeEntry){
          var time = Dates.formatTimeDisplay(timeEntry, Content.general.dFTypes[5]);
          $(this).val(time);
        }
      });
      
      $(this.tableSelector + ' tr.filterRow input[type="text"].filter, ' + this.tableSelector + ' tr.filterRow input[type="text"].operator').not('.dateFilter').off('keyup.filter')
      .on('keyup.filter', function(event) {
        if (event.keyCode == 13) {
          if(instance.validateRowFilters()) {
            instance.filterGet();
          }
        }
      });
      $(this.tableSelector + ' tr.filterRow input[type="text"].filter, ' + this.tableSelector + ' tr.filterRow input[type="text"].operator').prop('disabled',true).prop('disabled', false);
    },
    
    additionalRender: function() {
      var instance = this;
      var filterDatePickerOptions = {
        firstDay: Dates.getStartOfWeekNumber() - 1,
        dateFormat: Dates.getDatepickerFormat(Content.general.dFTypes[1]),
        onSelect: function(dateText, inst, input) {
          $(input).datepicker('hide');
          if(instance.validateRowFilters()) {
            instance.filterGet();
          }
        }
      };
      Criteria.initializeDatePicker(this.tableSelector + ' tr.filterRow input.dateFilter', filterDatePickerOptions);
      
      this.refreshRowFilters();
    },
    
    getFilters: function() {
      return this.filterObjs;
    },

    getRowFilters: function() {
      var filters = [];
      $(this.tableSelector + ' tr.filterRow th').each(function(i, o) {
        var $filterField = $(o).find('input.filter');
        if ($filterField.length > 0 && $filterField.val() != '') {
          if($filterField.hasClass('dateFilter')) {
            filters.push({name: $filterField.prop('name'), value: Dates.format($filterField.val(), Content.general.dFTypes[0])});
          }
          else {
            filters.push({name: $filterField.prop('name'), value: $filterField.val()});
          }
        }
        var $operatorField = $(o).find('input.operator');
        if($operatorField.length > 0 && $operatorField.val() != '') {
          filters.push({name: $operatorField.prop('name'), value: $operatorField.val()});
        }
      });
      this.filterObjs = filters;
      return filters;
    },
    
    clearRowFilters: function() {
      $(this.tableSelector + ' tr.filterRow th').each(function(i, o) {
        var $filterField = $(o).find('input.filter');
        $filterField.val('');
        $filterField.removeClass('errorClass');
        var $operatorField = $(o).find('input.operator');
        $operatorField.val('>');
      });
    },
    
    validateRowFilters: function() {
      var isValid = true;
      $(this.tableSelector + ' tr.filterRow th input.filter').each(function(i, o) {
        var $filterField = $(o);
        if($filterField.val() != '') {
          if($filterField.hasClass('timeFilter')) {
            var validationType = ScreenPrefs.AmPm ? 'clockTime' : 'militaryTime';
            isValid = isValid && Validation.validate(validationType, $filterField);
          }
          if($filterField.hasClass('dateFilter')) {
            isValid = isValid && Validation.validate('date', $filterField);
          }
        }
      });
      return isValid;
    },
    
    refreshRowFilters: function() {
      var instance = this;
      $(this.filterObjs).each(function(i, o) {
        $(instance.tableSelector + ' tr.filterRow th input.filter[name="' + o.name + '"]').not('.dateFilter, .timeFilter').val(o.value);
        $(instance.tableSelector + ' tr.filterRow input[type="text"].operator[name="' + o.name + '"]').val(o.value);
        if($(instance.tableSelector + ' tr.filterRow th input.filter.dateFilter[name="' + o.name + '"]').length > 0
            || $(instance.tableSelector + ' tr.filterRow th input.filter.timeFilter[name="' + o.name + '"]').length > 0 ){
          var dateObj = Dates.object(Dates.convertStringToDateArray(o.value, Content.general.dFTypes[0]));
          $(instance.tableSelector + ' tr.filterRow th input.filter.dateFilter[name="' + o.name + '"]').datepicker('setDate', dateObj);
          $(instance.tableSelector + ' tr.filterRow th input.filter.timeFilter[name="' + o.name + '"]').val(Dates.formatTimeDisplay(o.value, Content.general.dFTypes[5]));        
        }
      });
    }
    
  };

  return filterableInstance;
};