//# sourceURL=Criteria
/* globals ScreenPrefs, Content, Overlay, TmIntegration, ServerVars, Global, locale, Dates, MessageDisplay */

var Criteria = (function() {
  "use strict";

  return {

    contextPath: '/wfm',

    previousDelegateRole: '',

    dateOptions: {
      // match locale keys in Content.general
      DATE: "date",
      WEEK_OF: "weekOf",
      DATE_RANGE: "dateRange",
      PAY_PERIOD: "payPeriod"
    },

    DATE_FORMAT: Content.general.dFTypes[1],

    isLoaded: false,
    prevStartDate: null,
    prevEndDate: null,

    autoloadSelectedWho : function(getFunction){
      if (!Criteria.isSelectedWhoMyTeam()){
        getFunction();
        return;
      }
      if (ScreenPrefs.enableMyTeamAutoload) {
        confirmLoadWarning(getFunction);
      }
    },

    loadSelectedWho : function(getFunction){
      if (!Criteria.isSelectedWhoMyTeam()){
        getFunction();
        return;
      }
      confirmLoadWarning(getFunction);
    },

    clearSearchInput: function(){
      $('#employeeSearchInput').val('');
      $('#employeeSearchLabel').show();
    },

    removeSearchBox: function() {
      $('div.employeeSearchBox').remove();
    },

    loadNavButtons: function() {
      if ($('#navButtons').length === 0) {
        var str = '';
        str += '<div id="navButtons">';
        str += '<span><input id="buttonPrev" type="button"' + 'title="' + Content.general.previousEmployee + '" class="localize btn btn-default sumt-btn-default" lang="back" value="Back"></span>';
        str += '<span><input id="buttonNext" type="button"' + 'title="' + Content.general.nextEmployee + '"  class="localize btn btn-default sumt-btn-default" lang="next" value="Next"></span>';
        str += '</div>';
        $('#Criteria').children("div:first").after(str);
        $('#Criteria').after('<div class="clearBoth"></div>');
      }
    },

    loadSearchBox: function(mustShowEmployees, dropDownSelector) {
      if ((!mustShowEmployees || !ScreenPrefs.showSearchWhoList || ($(dropDownSelector).find('option').length <= 1) && !Criteria.exceedsMaxWhoSize) || ServerVars.lockWhoSelection) {
        Criteria.removeSearchBox();
        Criteria.filteredEmployees = null;
        if (!ScreenPrefs.showSearchWhoList && mustShowEmployees && $(dropDownSelector).find('option').length > 1 && !ServerVars.lockWhoSelection) {
          Criteria.loadNavButtons();
        }
        return;
      }
      var options = { dropDownSelector: dropDownSelector, current: 0 };
      if ($('div.employeeSearchBox').length === 0) {
        var str = '';
        str += '<div class="employeeSearchBox">';
        str += '<div id="employeeSearchBoxGroup">';
        str += '<table cellpadding="0" cellspacing="0" border="0"><tr>';
        str += '<td class="right form-inline clearBoth">';
        str += '<div class="input-group">';
        str += '<label id="employeeSearchLabel" for="employeeSearchInput" class="localize" lang="searchUser">Search User</label>';
        str += '<input id="employeeSearchInput" type="text" class="form-control" aria-describedby="basic-addon2">';
        str += '<span class="input-group-addon integratedButton"><i class="fa fa-search lookupButton" aria-hidden="true"></i></span>';
        str += '</div>';
        str += '</td>';
        str += '</tr></table>';
        str += '</div>';
        str += '<div id="navButtons">';
        str += '<span><input id="buttonPrev" type="button"' + 'title="' + Content.general.previousEmployee + '" class="localize btn btn-default sumt-btn-default" lang="back" value="Back"></span>';
        str += '<span><input id="buttonNext" type="button"' + 'title="' + Content.general.nextEmployee + '"  class="localize btn btn-default sumt-btn-default" lang="next" value="Next"></span>';
        str += '</div>';
        str += '</div>';
        str += '<div class="clearBoth"></div>';
        $('#Criteria').after(str);
      }
      var empSearchBox = $('div.employeeSearchBox');

      empSearchBox.data('options', options);
      var input = empSearchBox.find('input');

      input.data('options', options);
      input.unbind('keyup.searchBox').unbind('keydown.searchBox');
      var bindOptions = {};
      bindOptions['keydown.searchBox'] = function(event) {
        if (event.keyCode == 9 && $(this).val() !== '') {
          event.preventDefault();
        }
      };
      bindOptions['keyup.searchBox'] = function(event) {
        var inputBox = $(this);
        var keyCode = event.keyCode;
        var value = inputBox.val();
        var options = inputBox.data('options');

        jQuery.data(inputBox, 'isValid', 0);

        if (inputBox.val() === ''){
          $('#employeeSearchLabel').show();
        } else {
          $('#employeeSearchLabel').hide();
        }

        if (keyCode == 27 ) {
          Overlay.close();
          Criteria.filteredEmployees = null;
          return;
        }

        if ( (keyCode == 13 || keyCode == 9) && value !== '') {
          if (!ScreenPrefs.useIncrementalSearch && (Criteria.filteredEmployees == null || Criteria.filteredEmployees.length === 0)) {
            options.current = -1;
            Criteria.getSearchedEmployees(inputBox);
          }
          else {
            if (Criteria.filteredEmployees != null && Criteria.filteredEmployees.length > 0) {
              if (options.current < 0) { options.current = 0; }
              var obj = Criteria.filteredEmployees != null && Criteria.filteredEmployees.length > options.current ? jQuery.extend(true, {}, Criteria.filteredEmployees[options.current]) : null;
              Criteria.setSelectedEmployee(inputBox, obj );
              return;
            }
          }
        }
        if (keyCode == 16) { return; }

        if ( keyCode == 40 ) {
          if (((Criteria.filteredEmployees != null && Criteria.filteredEmployees.length > 0) || (Criteria.filteredGroups != null && Criteria.filteredGroups.length > 0))
              && options.current < ( Criteria.filteredEmployees.length + Criteria.filteredGroups.length - 1) ) {
            Criteria.moveCurrent(options, 1);
          }
          return;
        }

        if ( keyCode == 38 ) {
         if ( Criteria.filteredEmployees != null && Criteria.filteredGroups != null && (Criteria.filteredEmployees.length + Criteria.filteredGroups.length > 0) && options.current > 0 ) {
           Criteria.moveCurrent(options, -1);
          }
          return;
        }

        if (ScreenPrefs.useIncrementalSearch) {
          options.current = -1;
          Criteria.getSearchedEmployees(inputBox);
        }


      };
      input.bind(bindOptions);
      var isValidBlur = true;
      $('div.employeeSearchBox').find('i.lookupButton').parent().unbind('click.searchBox', 'mouseover.searchBox', 'mouseleave.searchBox')
      .bind({
        'click.searchBox': function(event) {
          var empSearchBox = $('div.employeeSearchBox');
          var input = empSearchBox.find('input');
          var options = input.data('options');
          options.current = -1;
          Criteria.getSearchedEmployees(input);
        },
        'mouseover.searchBox': function(event) {
          isValidBlur = false;
        },
        'mouseleave.searchBox': function(event) {
          isValidBlur = true;
        }
      });
      $(input).unbind('blur.searchBox').bind('blur.searchBox', function(event) {
        if (!Overlay.isHovered && isValidBlur) {
          Overlay.close('employeeSearch');
          Criteria.clearSearchInput();
          Criteria.filteredEmployees = null;
        }
      });
    },

    lastSearchCall: null,

    getSearchedEmployees: function(inputBox) {
      if (Criteria.lastSearchCall) {
        Criteria.lastSearchCall.abort();
        Criteria.lastSearchCall = null;
      }
      if($.trim(inputBox.val()) === '') {
        Criteria.clearSearchInput();
        Overlay.close('employeeSearch');
        return;
      }
      
      var searchTerm = inputBox.val();
      
      Criteria.filteredGroups = [];
      if(Criteria.whoOptions.mustShowGroups && ScreenPrefs.includeEmpGroupsInSearch){
        $(Criteria.groups).each(function(i, group) {
          var groupUpper = group.name.toUpperCase();
          var idUpper = group.id.toUpperCase();
          if(groupUpper.includes(searchTerm.toUpperCase()) || idUpper.includes(searchTerm.toUpperCase())){
            Criteria.filteredGroups.push(group);
          }
        });
      }

      var offset = {top: 9};
      Overlay.showOrModContent("employeeSearch", inputBox, offset, '<div id="searchContent"><div><img src="../common/images/ajax-loader.gif"/></div></div>', null, null, true);
      var url = '/wfm/who/search' ;
      var params = {};
      params.searchTerm = searchTerm;
      if(Criteria.delegateRole && Criteria.delegateRole != 'null'){
        params.getDelegateRole = Criteria.delegateRole;
      }
      Criteria.lastSearchCall = $.getJSON(url, params, function(json) {
        if (json == null) {
          return;
        }

        var str = '<div id="searchContent">';
        Criteria.filteredEmployees = json;
        if ((Criteria.filteredEmployees == null || Criteria.filteredEmployees.length === 0) &&  
            (Criteria.filteredGroups == null || Criteria.filteredGroups.length === 0)) {
          str += '<div class="noResults">' + Content.general.noRecordsFound + '</div>';
        }
        else {
          $(Criteria.filteredGroups).each(function(i, o) {
            var value = '<span class="code">' + o.name + '</span>';
            str += '<div class="record" lang="group' + i + '">' + value + '</div>';
          });
          $(Criteria.filteredEmployees).each(function(i, o) {
            var value = '<span class="code">' + o.name + '</span>';
            str += '<div class="record" lang="' + i + '">' + value + '</div>';
          });
        }
        str += '</div>';

        Overlay.showOrModContent("employeeSearch", inputBox, offset, str, null, null, true);

        $("#searchContent div.noResults").click(function() {
          Overlay.close();
        });

        $("#searchContent div.record").bind({
          click: function() {
            var index = $(this).attr('lang');
            if(index.includes('group')){
              index = index.substring(5);
              if (Criteria.filteredGroups != null) {
                Criteria.setSelectedGroup($('#employeeSearchInput'), jQuery.extend(true, {}, Criteria.filteredGroups[parseInt(index)]));
              }
            } else {
              if (Criteria.filteredEmployees != null) {
                Criteria.setSelectedEmployee($('#employeeSearchInput'), jQuery.extend(true, {}, Criteria.filteredEmployees[parseInt(index)]));
              }
            }
          },

           mouseover: function() {
             $(this).addClass('hov');
           },

           mouseout:  function() {
             $(this).removeClass('hov');
           }
         });
         $(inputBox).focus();
      },
      function() {
        var str = '<div id="searchContent"><div class="noResults">' + Content.general.noRecordsFound + '</div></div>';
        Overlay.showOrModContent("employeeSearch", inputBox, offset, str, null, null, true);

        $("#searchContent div.noResults").click(function() {
          Overlay.close();
        });
      });

    },

    moveCurrent: function(options, inc) {
      options.current += inc;
      Overlay.setSelectedListItem(options.current);
    },

    setSelectedEmployee: function(inputBox, obj) {
      if(Criteria.exceedsMaxWhoSize){
        Criteria.employees = [obj];
        Criteria.loadWhoSelectorOptions(Criteria.selector, Criteria.whoOptions.employeePrefix, Criteria.whoOptions.mustShowGroups, Criteria.whoOptions.mustShowEmployees, Criteria.whoOptions.mustShowMe);
      }

      var options = $(inputBox).data('options');
      var dropDown = $(options.dropDownSelector);
      $(dropDown).find('option:selected').prop('selected', false);
      $(dropDown).find('option').each(function(i,o) {
        if ($(o).attr('name') == obj.employeeId) {
          $(o).prop('selected', true);
          $(dropDown).selectmenu("refresh");
          $(dropDown).trigger('selectmenuchange');
        }
      });

      if(Criteria.exceedsMaxWhoSize){
        var selectorWidth = $(Criteria.selector).innerWidth();
        $(Criteria.selector).selectmenu({
          width: selectorWidth + 40
        })
      }

      Criteria.clearSearchInput();
      Overlay.close();
      Criteria.filteredEmployees = null;
    },
    
    setSelectedGroup: function(inputBox, obj) {

      var options = $(inputBox).data('options');
      var dropDown = $(options.dropDownSelector);
      $(dropDown).find('option:selected').prop('selected', false);
      $(dropDown).find('option').each(function(i,o) {
        if ($(o).val() == obj.id) {
          $(o).prop('selected', true);
          $(dropDown).selectmenu("refresh");
          $(dropDown).trigger('selectmenuchange');
        }
      });

      Criteria.clearSearchInput();
      Overlay.close();
      Criteria.filteredEmployees = null;
    },

    previousWhoListCall: null,

    init: function(successFunction, delegateRole) {
      Criteria.delegateRole = delegateRole;
      ServerVars.lockWhoSelection = (ServerVars.lockWhoSelection == 'true' || ServerVars.lockWhoSelection == true);
      if (!Criteria.isLoaded || Criteria.previousDelegateRole != delegateRole) {

        Criteria.previousDelegateRole = delegateRole;

        if (Criteria.previousWhoListCall) {
          Criteria.previousWhoListCall.abort();
          Criteria.previousWhoListCall = null;
        }
        // url: /wfm/who
        var url = Criteria.contextPath + "/who";
        var selectedEmployees = [];
        if (Criteria.employees != null && Criteria.employees.length > 0) {
          $(Criteria.employees).each(function(i, employee) {
            if (employee.selected != null && employee.selected) {
              selectedEmployees.push(employee.employeeId);
            }
          });
        }
        Criteria.previousWhoListCall = $.getJSON(url, {getDelegateRole: delegateRole}, function(o) {
          Criteria.groups = o.whoGroupList;
          Criteria.employees = o.whoEmpList;
          Criteria.exceedsMaxWhoSize = o.exceedsMaxWhoSize;

          $(Criteria.employees).each(function(i, o) {

            if (o.id == 'uteWhoMe') {
              Criteria.uteWhoMeEmployeeId = o.employeeId;
              if (selectedEmployees.length === 0) {
                return false;
              }
            }

            if (selectedEmployees.length > 0) {
              o.selected = (jQuery.inArray(o.employeeId, selectedEmployees) != -1);
            }

          });
          Criteria.isLoaded = true;
          Criteria.previousSelectedIndex = -1;
          if (successFunction != null) { successFunction(); }

        });
      }
      else {
        if (successFunction != null) { successFunction(); }
      }
    },

    getEmployeeObject: function(employeeId) {
      var emp = null;
      $(Criteria.employees).each(function(i, o) {
        if (o.employeeId == employeeId) {
          emp = o;
          return false;
        }
      });
      return emp;
    },

    getEmployeeDefaultHours: function(employeeId) {
      var empObj = Criteria.getEmployeeObject(employeeId);
      return (empObj && empObj.defaultHours != null)? empObj.defaultHours : null;
    },

    getSelectedWhoDefaultHours: function() {
      var defaultHours;
      if (Criteria.isSelectedWhoGroup()) {
        defaultHours = (ServerVars.appContext.employeeId)? Criteria.getEmployeeDefaultHours(ServerVars.appContext.employeeId) : parseInt(ScreenPrefs.absCalSummaryDefaultDay, 10);
      }
      else {
        var selectedEmpId = Criteria.selectedName();
        defaultHours = Criteria.getEmployeeDefaultHours(selectedEmpId);
      }
      return defaultHours;
    },

    getEmployeesInCustomList: function(list, successFunction) {
      $.getJSON(Criteria.contextPath + "/who/getWhoList", {who: list}, function(json) {
        if (successFunction != null) {
          successFunction(json.whoEmpList);
        }
      });
    },

    bindEmployeeProfileLink: function() {
      if (TmIntegration.enabled) {
        $('#employeeProfileLink').unbind('click');
        $('#employeeProfileLink').click(function() {
          var value = $('#cEmployee option:selected').attr('name');
          TmIntegration.showEmployeeProfile(value);
        });
      }
    },

    injectEmployeeProfileLink: function() {
      if (TmIntegration.enabled) {
        if ($('#cEmployee option:selected').attr('name') != 'group') {
          TmIntegration.loadEmployeeProfileLinkStyle();
          if ($('#employeeProfileLink').length === 0) {
            var str = '<span id="employeeProfileLink"><i class="fa fa-user" aria-hidden="true"></i></span>';
            $('#cEmployee-button').after(str);
          }
          Criteria.bindEmployeeProfileLink();
        }
        else {
          if ($('#employeeProfileLink').length > 0) {
            $('#employeeProfileLink').remove();
          }
        }
      }
    },

    uteWhoMeEmployeeId: null,

    isUteWhoMe: function(employeeId) {
      return (Criteria.uteWhoMeEmployeeId != null && Criteria.uteWhoMeEmployeeId == employeeId);
    },

    isSelectedWhoMyTeam: function() {
      return Criteria.selectedId() == "uteWhoTeam";
    },

    isSelectedWhoGroup: function() {
      return Criteria.selectedName() === "group";
    },

    isExemptEmployee: function(payroll) {
      var val = false;
      $(Criteria.employees).each(function(i,o) {
        if (o.employeeId == payroll) {
          val = o.isPayToSchedule;
          return false;
        }
      });
      return val;
    },

    groups: [],

    employees: [],

    filtered: [],

    updateSelection: function() {
      Criteria.previousSelectedIndex = $(Criteria.selector)[0].selectedIndex;

      Criteria.refreshNavButtons();

      $('#buttonPrev').blur();
      $('#buttonNext').blur();

      ServerVars.who = $(Criteria.selector).find('option:selected').val();
      $(Criteria.selector).selectmenu("refresh");
      //Criteria.injectEmployeeProfileLink();
      if (Criteria.getFunction != null) {
        Criteria.getFunction();
      }
    },

    refreshNavButtons: function() {
      var $whoSelector = $(Criteria.selector);
      var selectedWhoIndex = $whoSelector[0].selectedIndex;
      if (selectedWhoIndex == 0) {
        $('#buttonPrev').prop('disabled',true);
      }
      else {
        $('#buttonPrev').prop('disabled', false);
      }
      if (selectedWhoIndex == $whoSelector.find('option').length - 1) {
        $('#buttonNext').prop('disabled',true);
      }
      else {
        $('#buttonNext').prop('disabled', false);
      }
    },

    resetSelection: function() {
      var $selector = $(Criteria.selector);
      $selector.find('option').each(function(i, o) {
        if (i != Criteria.previousSelectedIndex) {
          $(o).prop('selected', false);
        }
        else {
          $(o).prop('selected', true);
        }
      });
      $selector.selectmenu("refresh");
    },

    getDateOptionsByScreenPref: function(dateOptions){
      var screenPrefDateOptions = [
        Criteria.dateOptions.WEEK_OF,
        Criteria.dateOptions.DATE_RANGE,
        Criteria.dateOptions.PAY_PERIOD
      ];
      if (dateOptions && dateOptions.length > 0) {
        screenPrefDateOptions = $.grep(screenPrefDateOptions, function(screenPrefOption, i) {
          return (dateOptions.indexOf(screenPrefOption) > -1)? true : false;
        });
      }

      var optionArray = [];
      var obj = [];
      var defaultIsSet = false;

      $.each(screenPrefDateOptions, function(i, dateOption) {
        var name = dateOption;
        var screenPrefName = "riaDateEntry" + name[0].toUpperCase() + name.substring(1);
        if(ScreenPrefs[screenPrefName]) {
          var isDefault = (ScreenPrefs.riaDateEntryDefault == screenPrefName) ? true : false;
          obj = {"name" : name, "label" : Content.general[name], "isDefault" : isDefault};
          defaultIsSet = defaultIsSet ? true : isDefault;
          optionArray.push(obj);
        }
        else {
          if(ServerVars.dateSelected == name) {
            ServerVars.setDateSelected(null);
          }
        }
      });

      if(optionArray.length === 0) {
        obj = {"name" : Criteria.dateOptions.WEEK_OF, "label" : Content.general.weekOf, "isDefault" : true};
        defaultIsSet = true;
        optionArray.push(obj);
      }

      if(!defaultIsSet) {
        if(ScreenPrefs.riaDateEntryDateRange) {
          for(var k = 0; k < optionArray.length; k++) {
            obj = optionArray[k];
            if(obj.name == Criteria.dateOptions.DATE_RANGE) {
              obj.isDefault = true;
            }
          }
        }
        else {
          obj = {"name" : Criteria.dateOptions.DATE_RANGE, "label" : Content.general.dateRange, "isDefault" : true};
          optionArray.push(obj);
        }
      }

      return optionArray;
    },

    loadDateSelector: function(options) {
      options = options || {};
      var dateOptions = options.dateOptions;

      var optionArray;
      if (dateOptions && dateOptions.length === 1){
        var dateOption = dateOptions[0];
        optionArray = [{"name" : dateOption, "label" : Content.general[dateOption], "isDefault" : true}];
      } else {
        optionArray = Criteria.getDateOptionsByScreenPref(dateOptions);
      }

      var str = "";

      if(optionArray.length == 1) {
        if(optionArray[0].name != Criteria.dateOptions.DATE_RANGE) {
          str = '<label id="dateLabel" class="whoBarlabel">' +optionArray[0].label+ '</label>';
        }
        str = str + Criteria.renderDateSelector(optionArray[0].name);
        $('#dateSelector').html(str);
        $('#dateSelector').attr('data-dateOption', optionArray[0].name);
        Criteria.initDateEntryDatePickers(optionArray[0].name, options);
      }
      else {
        str = '<span> <select id="dateLabel">';
        for(var i = 0; i < optionArray.length; i++) {
          var isSelected = null;
          if (ServerVars.dateSelected && ServerVars.dateSelected != 'null') {
            isSelected = (ServerVars.dateSelected == optionArray[i].name) ? 'selected' : '';
          }
          else {
            isSelected = optionArray[i].isDefault ? 'selected' : '';
          }
          str = str + '<option class="localize" lang="' + optionArray[i].name + '"' + isSelected + '>' +optionArray[i].label+ '</option>';
        }
        str = str + '</select> </span>';
        $('#dateSelector').html(str);
        $('#dateLabel').selectmenu({
            width: 'auto'
        });

        var selectedDateOptName = $('#dateLabel option:selected').attr('lang');
        ServerVars.setDateSelected(selectedDateOptName);
        $('#dateSelector').attr('data-dateOption', selectedDateOptName);
        str = Criteria.renderDateSelector(selectedDateOptName);
        $('#dateLabel').parent().after(str);
        Criteria.initDateEntryDatePickers($('#dateLabel option:selected').attr('lang'), options);
      }

      $('#dateLabel').off('selectmenuchange').on('selectmenuchange', function() {
        Criteria.onCriteriaSelectionChange();

        var selectedDateOptName = $('#dateLabel option:selected').attr('lang');
        ServerVars.setDateSelected(selectedDateOptName);
        $('#dateSelector').attr('data-dateOption', selectedDateOptName);
        var str = Criteria.renderDateSelector(selectedDateOptName);
        $('#dateLabel').parent().nextAll().html('');
        $('#dateLabel').parent().nextAll().remove();
        $('#dateLabel').parent().after(str);
        Criteria.initDateEntryDatePickers($('#dateLabel option:selected').attr('lang'), options);
        Global.localize();
      });

      var dateSelector = {
        dateOptions: optionArray,
        payPeriodDefinitions: ServerVars.appContext.dateTypeDefinitions.dateTypeDefinitions,

        getSelectedDateEntry: function() {
          var selectedDateOption = this.getSelectedDateOption();
          var selectedDateOptionValue = this.getSelectedDateOptionValue(selectedDateOption.name);
          return {
            dateOption: selectedDateOption,
            dateValue: selectedDateOptionValue
          };
        },

        setSelectedDateOptionAndValue: function(dateOptionName, from, to, payPeriod) {
          var dateEntry = {};
          dateEntry.dateOption = {name: dateOptionName};
          dateEntry.dateValue = { payPeriod: payPeriod,
                                  from: from,
                                  to: to
                                };
          this.setSelectedDateEntry(dateEntry);
        },

        setSelectedDateEntry: function(currentDateEntry) {
          this.setSelectedDateOption(currentDateEntry.dateOption.name);
          this.setSelectedDateOptionValue(currentDateEntry.dateOption.name, currentDateEntry.dateValue);
        },

        getSelectedDateOption: function() {
          var dateOptions = this.dateOptions;
          var dateOption = null;
          if (dateOptions.length === 1) {
            dateOption = $.extend(true, {}, dateOptions[0]);
          }
          else {
            var selectedOption = $('#dateLabel').attr('lang');
            for (var i = 0; i < dateOptions.length; i++) {
              if (selectedOption === dateOptions[i].name) {
                dateOption = $.extend(true, {}, dateOptions[i]);
                break;
              }
            }
          }
          return dateOption;
        },

        getSelectedDateOptionValue: function(selectedDateOptionName) {
          var payPeriodDefinitions;
          var payPeriodId;

          var dateOptionValue = { payPeriod: null,
                                  from: null,
                                  to: null };

          if (selectedDateOptionName === Criteria.dateOptions.DATE){
            dateOptionValue.from = $('#cDate').datepicker('getDate');
          }
          else if (selectedDateOptionName === Criteria.dateOptions.WEEK_OF) {
            dateOptionValue.from = $('#cDate').datepicker('getDate');
            dateOptionValue.weekFrom = Dates.object(Dates.getStartOfWeek(dateOptionValue.from));
            dateOptionValue.weekTo = Dates.object(Dates.getEndOfWeek(dateOptionValue.from));
          }
          else if (selectedDateOptionName === Criteria.dateOptions.DATE_RANGE) {
            dateOptionValue.from = $('#cStartDate').datepicker('getDate');
            dateOptionValue.to = $('#cEndDate').datepicker('getDate');
          }
          else if (selectedDateOptionName === Criteria.dateOptions.PAY_PERIOD) {
            payPeriodId = $('#payPeriodOptions option:selected').attr('lang');
            payPeriodDefinitions = this.payPeriodDefinitions;
            for(var i = 0; i < payPeriodDefinitions.length; i++) {
              if(payPeriodDefinitions[i].id === payPeriodId) {
                dateOptionValue.from = Dates.object(payPeriodDefinitions[i].startDate);
                dateOptionValue.to =  Dates.object(payPeriodDefinitions[i].endDate);
                dateOptionValue.payPeriod = payPeriodDefinitions[i];
                break;
              }
            }
          }
          return dateOptionValue;
        },

        setSelectedDateOption: function(dateOptionName) {
          if($('#dateLabel').is("select")) {
            $('#dateLabel option[lang="'+ dateOptionName +'"]').prop('selected', true);
            $('#dateLabel').change();
          }
        },

        setSelectedDateOptionValue: function(dateOptionName, dateOptionValue) {
          if (dateOptionName === Criteria.dateOptions.DATE){
            $('#cDate').datepicker('setDate', dateOptionValue.from);
            ServerVars.date = dateOptionValue.from;
          }
          if (dateOptionName === Criteria.dateOptions.WEEK_OF) {
            $('#cDate').datepicker('setDate', dateOptionValue.from);
            ServerVars.date = dateOptionValue.from;
          }
          if (dateOptionName === Criteria.dateOptions.DATE_RANGE) {
            $('#cStartDate').datepicker('setDate', dateOptionValue.from);
            $('#cEndDate').datepicker('setDate', dateOptionValue.to);
            ServerVars.startDate = dateOptionValue.from;
            ServerVars.endDate = dateOptionValue.to;
          }
          if (dateOptionName === Criteria.dateOptions.PAY_PERIOD) {
            $('#payPeriodOptions option[lang="'+ dateOptionValue.payPeriod.id +'"]').prop('selected', true);
            ServerVars.payPeriodId = dateOptionValue.payPeriod.id;
          }
        },

        hasDateOption: function(dateOptionName) {
          var dateOptions = this.dateOptions;
          var hasDateOption = false;
          for(var i = 0; i < dateOptions.length; i++) {
            if (dateOptionName === dateOptions[i].name) {
              hasDateOption = true;
              break;
            }
          }
          return hasDateOption;
        }
      };

      return dateSelector;
    },

    renderDateSelector: function(lang) {
      var str = "";
      str = $('#' + lang).html();
      if(lang == Criteria.dateOptions.PAY_PERIOD) {
        var dateTypeDefinitions = ServerVars.appContext.dateTypeDefinitions.dateTypeDefinitions;
        str += '<select id = "payPeriodOptions">';

        var isShown = { currentPayPeriod: ScreenPrefs.showPayPeriod,
                        previousPayPeriod: ScreenPrefs.showPreviousPayPeriod,
                        nextPayPeriod: ScreenPrefs.showNextPayPeriod
                      };

        var defaultSelection = Criteria.getDefaultPayPeriodSelection(isShown, dateTypeDefinitions);
        ServerVars.payPeriodId = defaultSelection;

        var selectionStr = '';
        for(var i = 0; i < dateTypeDefinitions.length; i++) {
          if(isShown[dateTypeDefinitions[i].id]) {
            selectionStr = (defaultSelection == dateTypeDefinitions[i].id) ? 'selected' : '';

            var start = Dates.format(dateTypeDefinitions[i].startDate, Criteria.DATE_FORMAT);
            var end = Dates.format(dateTypeDefinitions[i].endDate, Criteria.DATE_FORMAT);
            var payPeriod = dateTypeDefinitions[i].label + ': ' + start + ' | ' + end;
            str += '<option class="localize" lang="' + dateTypeDefinitions[i].id + '"' + selectionStr + '>' +payPeriod+ '</option>';
          }
        }
        str += '</select> </span>';
      }
      return str;
    },

    getDefaultPayPeriodSelection: function(payPeriodPrefs, dateTypeDefinitions) {
      var defaultSelection = null;
      var startDateParam = null;
      var endDateParam =  null;

      if(ServerVars.startDate != null && ServerVars.startDate != 'null'){
        startDateParam = Dates.object(ServerVars.startDate);
      }
      if(ServerVars.endDate != null  && ServerVars.endDate != 'null'){
        endDateParam = Dates.object(ServerVars.endDate);
      }

      var payPeriodDates = {};

      for(var i = 0; i < dateTypeDefinitions.length; i++) {
        var dateTypeDefinition = dateTypeDefinitions[i];
        var dateTypeDefinitionId = dateTypeDefinition.id;

        if (dateTypeDefinitionId === 'currentPayPeriod') {
          payPeriodDates.currentPayPeriod = {};
          payPeriodDates.currentPayPeriod.from =  Dates.object(dateTypeDefinition.startDate);
          payPeriodDates.currentPayPeriod.to = Dates.object(dateTypeDefinition.endDate);
        }
        else if (dateTypeDefinitionId === 'previousPayPeriod') {
          payPeriodDates.previousPayPeriod = {};
          payPeriodDates.previousPayPeriod.from = Dates.object(dateTypeDefinition.startDate);
          payPeriodDates.previousPayPeriod.to = Dates.object(dateTypeDefinition.endDate);
        }
        else if (dateTypeDefinitionId === 'nextPayPeriod') {
          payPeriodDates.nextPayPeriod = {};
          payPeriodDates.nextPayPeriod.from = Dates.object(dateTypeDefinition.startDate);
          payPeriodDates.nextPayPeriod.to =  Dates.object(dateTypeDefinition.endDate);
        }
      }

      for (var selection in payPeriodPrefs) {
        if(payPeriodPrefs[selection] == true) {
          defaultSelection = selection;
          break;
        }
      }

      if (ScreenPrefs.showPayPeriod &&
          startDateParam >= payPeriodDates.currentPayPeriod.from &&
          endDateParam <= payPeriodDates.currentPayPeriod.to) {
        defaultSelection = 'currentPayPeriod';
      }
      else if (ScreenPrefs.showPreviousPayPeriod &&
               startDateParam >= payPeriodDates.previousPayPeriod.from &&
               endDateParam <= payPeriodDates.previousPayPeriod.to) {
        defaultSelection = 'previousPayPeriod';
      }
      else if (ScreenPrefs.showNextPayPeriod &&
               startDateParam >= payPeriodDates.nextPayPeriod.from &&
               endDateParam <= payPeriodDates.nextPayPeriod.to) {
        defaultSelection = 'nextPayPeriod';
      }

      defaultSelection = (ServerVars.payPeriodId && ServerVars.payPeriodId != 'null' &&
                          payPeriodPrefs[ServerVars.payPeriodId]) ? ServerVars.payPeriodId : defaultSelection;

      if(defaultSelection == null) {
        defaultSelection = 'currentPayPeriod';
        payPeriodPrefs.currentPayPeriod = true;
      }
      return defaultSelection;
    },

    initDateEntryDatePickers: function (sel, options) {
      options = options || {};

      if(sel == Criteria.dateOptions.DATE) {
        Criteria.initializeDatePickers('#cDate', null, null, options.onChange, true);
      }
      else if(sel == Criteria.dateOptions.WEEK_OF) {
        Criteria.initializeDatePickers('#cDate', null, null, options.onChange, true);
      }
      else if(sel == Criteria.dateOptions.DATE_RANGE) {
        if (options.isValidateOnly) {
          Criteria.initializeDateRange('cStartDate', 'cEndDate', options.onChange, null, Criteria.DATE_FORMAT, true, true);
        } else {
          Criteria.initializeDateRange('cStartDate', 'cEndDate', options.onChange, null, Criteria.DATE_FORMAT, true);
        }
      }
      else{
        $('#payPeriodOptions').selectmenu({
          width: 'auto'
        });
        Criteria.initializePayPeriod();
      }

      $('#dateLabel').attr('lang', sel);

      $('#cDate, #cStartDate, #cEndDate').unbind('change.criteriaDate').bind('change.criteriaDate', function() {
        Criteria.onCriteriaSelectionChange();
      });
    },

    loadWhoSelector: function(options) {
      options = $.extend({
        mustShowGroups: false, mustShowEmployees: false, mustShowMe: false, skipDocumentKeyupBind: false,
        getFunction: null, isChangeFunction: null,
        employeePrefix: '',
        employeeId:'',
        // Temporary for WFM-37130 only
        shouldValidate: false
      }, options);
      var getFunction = options.getFunction;
    var selector ='';
    if(options.employeeId == '' || options.employeeId == null ){
     selector = Criteria.defaultSelector;
    }
    else{
       selector = options.employeeId;
    }

      if ($(selector).length === 0) {
        MessageDisplay.error('who selector object is not found');
        return;
      }
      Criteria.isChangeFunction = options.isChangeFunction;
      Criteria.whoOptions = options;
      Criteria.getFunction = function(){
        Criteria.loadSelectedWho(getFunction);
      };
      Criteria.selector = selector;

      Criteria.loadWhoSelectorOptions(selector, options.employeePrefix, options.mustShowGroups, options.mustShowEmployees, options.mustShowMe, options.isBatchSelector);

      Criteria.loadSearchBox(options.mustShowEmployees, selector);

      if(ServerVars.who == 'uteWhoMe'){
        ServerVars.who = ServerVars.appContext.employeeId;
      }

      if(Criteria.exceedsMaxWhoSize && ServerVars.who != 'null' && ServerVars.who.indexOf('EG#') == -1 && ServerVars.who.indexOf('uteWhoCustom') == -1){
        var url = '/wfm/who/getSingleWhoViaPayroll' ;
        var whoHolder = ServerVars.who;
        whoHolder = whoHolder.replace('P#', '');
        var params = {};
        params.searchPayroll = whoHolder;
        if(Criteria.delegateRole && Criteria.delegateRole != 'null'){
          params.getDelegateRole = Criteria.delegateRole;
        }
        $.getJSON(url, params, function(json) {
          if (json == null) {
            return;
          }
          Criteria.employees = [json];
          Criteria.loadWhoSelectorOptions(Criteria.selector, Criteria.whoOptions.employeePrefix, Criteria.whoOptions.mustShowGroups, Criteria.whoOptions.mustShowEmployees, Criteria.whoOptions.mustShowMe, Criteria.whoOptions.isBatchSelector);

          var selectorWidth = $(Criteria.selector).innerWidth();
          $(Criteria.selector).selectmenu({
            width: selectorWidth + 40
          });
         $(selector).find('option:selected').prop('selected', false);
         $(selector).find('option[value="'+Criteria.whoOptions.employeePrefix+whoHolder+'"]').prop("selected", true);
         $(selector).selectmenu("refresh");
         $(selector).trigger('selectmenuchange');
        }, function() {
          var message = Content.validation.invalidWhoSelection;
          message = message.replace('{0}', ServerVars.who);
          MessageDisplay.error(message);
        });
      }

      var prevSelectedWho = $(selector).find('option[value="'+ServerVars.who+'"]');
      prevSelectedWho.prop("selected", true);
      Criteria.previousSelectedIndex = prevSelectedWho.index();
      if (ServerVars.who != 'null' && ServerVars.who != null && $(selector).find('option:selected').index() === 0) {
        var who = ServerVars.who;
        if (who.indexOf('P#') != -1) {
          who = who.replace('P#', '');
        }
        else {
          who = 'P#' + who;
        }

        $(selector).find('option[value="'+who+'"]').prop("selected", true);
      }
      if(ServerVars.who && ServerVars.who != 'null' && Criteria.previousSelectedIndex < 0 && $(selector).find('option[value="'+who+'"]').index() < 0 &&
        ((!ServerVars.who.indexOf('EG#')==-1 && !ServerVars.who.indexOf('uteWhoCustom')==-1 )|| options.mustShowGroups) && !Criteria.exceedsMaxWhoSize) {
          var message = Content.validation.invalidWhoSelection;
          message = message.replace('{0}', ServerVars.who);
          MessageDisplay.error(message);
      }

      Criteria.refreshNavButtons();

      $(document).unbind('.TSarrows');
      $(selector).unbind();

      if (options.skipDocumentKeyupBind == null || !options.skipDocumentKeyupBind) {
        $(document).bind('keyup.TSarrows', function(e){
          if ( e.target.tagName == "SELECT" || e.target.tagName == "INPUT" || $(e.target).hasClass('ui-selectmenu-button')) {
            return;
          }
          if ( e.keyCode == 37 ) {
            Criteria.prevSelection(options.shouldValidate);
          }
          if ( e.keyCode == 39 ) {
            Criteria.nextSelection(options.shouldValidate);
          }
        });
      }

      Criteria.bindSelectionButtons(options.shouldValidate);

      var selectorWidth = $(selector).innerWidth();
      $(selector).selectmenu({
        width: selectorWidth + 40
      }).unbind('selectmenuchange').bind('selectmenuchange',function(event,ui) {
        var isValid = true;
        if (options.shouldValidate) {
          isValid = Criteria.validateCriteria({validateDateEntry:true});
        }

        if (!isValid) {
          Criteria.resetSelection();
        } else {
          confirmLoadWarning(function(){
            Criteria.checkChangeOrFire(Criteria.updateSelection);
          });
        }
      });

      ServerVars.lockWhoSelection = false;
    },

    loadWhoSelectorOptions: function(selector, employeePrefix, mustShowGroups, mustShowEmployees, mustShowMe, isBatchSelector){
      var options = '';
      if (mustShowGroups) {
        $(Criteria.groups).each(function(i, o) {
          options += '<option value="'+o.id+'" lang="' + o.isPayToSchedule + '" name="group">'+o.name+'</option>';
        });
      }

      if (mustShowEmployees || mustShowMe){
        Criteria.selectedEmployees = $.grep(Criteria.employees, function(employee, i){
          var isSelected = employee.selected;
          if (isSelected){
            delete employee.selected;
          }
          return isSelected;
        });
        var employeesToLoad = (Criteria.selectedEmployees.length > 0)? Criteria.selectedEmployees : Criteria.employees;
        $.each(employeesToLoad, function(i,o){
          if (o.id == 'uteWhoMe'){
            if (!mustShowMe){
              return true;
            }
          } else {
            if (!mustShowEmployees){
              return true;
            }
          }
          options += '<option value="' + employeePrefix + o.employeeId +'" lang="' + o.isPayToSchedule + '"  name="' + o.employeeId + '">'+o.name+'</option>';
        });
      }

    //fix for FF - width of hidden select returns -2.
      $('#globalContent').show();
      $(selector).html(options);

      if ($(selector).find("option").length <= 1 || ServerVars.lockWhoSelection || (isBatchSelector && Criteria.exceedsMaxWhoSize)) {
        $(selector).prop( "disabled", true );
        $('#buttonPrev, #buttonNext').hide();
      } else {
        $(selector).prop("disabled", false);
        $('#buttonPrev, #buttonNext').show();
      }
    },

    bindPageGetEvents: function(successFunction, validationOpts) {
      $('#pageGetButton').unbind().click(function() {
        if (Criteria.validateCriteria(validationOpts)) {
          Criteria.loadSelectedWho(function(){
            Navigation.confirmIfChangesMade(successFunction);
          });
          if ($('#dateSelector').attr('data-dateOption') === Criteria.dateOptions.DATE_RANGE) {
            Criteria.prevStartDate = $('#cStartDate').datepicker('getDate');
            Criteria.prevEndDate = $('#cEndDate').datepicker('getDate');
          }
        }
      });
    },

    validateCriteria: function(validationOpts) {
      var opts = $.extend({}, {
        validateDateEntry: false,
        restrictDateRange : false
      }, validationOpts);

      var isValid = true;

      var hasDateSelector = $('#dateSelector').length > 0;
      if (isValid && hasDateSelector) {
        isValid = Criteria.validateDateSelection(opts.validateDateEntry, opts.restrictDateRange);
      }

      return isValid;
    },

    validateDateSelection: function(validateDateEntry, restrictDateRange) {
      var isValid = true;
      var selectedDateOption = $('#dateSelector').attr('data-dateOption');

      if (validateDateEntry) {
        var dateFieldName = '';
        if (selectedDateOption === Criteria.dateOptions.DATE) {
          isValid = Validation.validateDateStr($('#cDate').val(), Criteria.DATE_FORMAT);
          dateFieldName = Content.general.date;
        }
        else if (selectedDateOption === Criteria.dateOptions.WEEK_OF) {
          isValid = Validation.Validation.validateDateStr($('#cDate').val(), Criteria.DATE_FORMAT);
          dateFieldName = Content.general.weekOf;
        }
        else if (selectedDateOption === Criteria.dateOptions.DATE_RANGE) {
          var isStartDateValid = Validation.validateDateStr($('#cStartDate').val(), Criteria.DATE_FORMAT);
          var isEndDateValid = Validation.validateDateStr($('#cEndDate').val(), Criteria.DATE_FORMAT);

          isValid = isStartDateValid && isEndDateValid;

          if (!isStartDateValid && !isEndDateValid) {
            dateFieldName = Content.general.startDate + ' / ' + Content.general.endDate;
          } else if (!isStartDateValid) {
            dateFieldName = Content.general.startDate;
          } else if (!isEndDateValid) {
            dateFieldName = Content.general.endDate;
          }
        }

        if (!isValid) {
          var msg = Content.alerts.invalidDateEntry.replace('{0}', dateFieldName);
          MessageDisplay.error(msg);
        }
      }

      if (restrictDateRange) {
        if (isValid && selectedDateOption === Criteria.dateOptions.DATE_RANGE) {
          var fromDate = $('#cStartDate').datepicker('getDate');
          var toDate = $('#cEndDate').datepicker('getDate');

          if (Dates.getDifferenceInDays(fromDate, toDate) + 1 > ScreenPrefs.maximumAllowableDateRange) {
            MessageDisplay.message(Content.alerts.dateRangeExceedsMaxDays, function() {
              $('#cStartDate').datepicker('setDate',Criteria.prevStartDate);
              $('#cEndDate').datepicker('setDate',Criteria.prevEndDate);
              ServerVars.startDate = Criteria.prevStartDate;
              ServerVars.endDate = Criteria.prevEndDate;
            });
            isValid = false;
          }
        }
      }

      return isValid;
    },

    checkChangeOrFire: function(getFunction) {
      var isChange = false;
      if (Criteria.isChangeFunction != null) {
        isChange = Criteria.isChangeFunction();
      }
      if (isChange) {
        MessageDisplay.confirm(Content.general.alertConfirmDiscardChanges, getFunction, null, null, Criteria.resetSelection);
      }
      else {
        getFunction();
      }
    },

    getIdsOnPage: function() {
      var arr = [];
      $('*').each(function(i, o) {
        if ($(o).prop('id') !== "") {
          arr.push($(o).attr('id'));
        }
      });
      return arr;
    },


    previousSelectedIndex: -1,

    defaultSelector: '#cEmployee',

    bindSelectionButtons: function(shoudValidate) {
      if ($(Criteria.defaultSelector).length === 0) { return; }

      $('#buttonPrev').unbind();
      $('#buttonPrev').bind({
       click: function() {
         Criteria.prevSelection(shoudValidate);
       }
     });

     $('#buttonNext').unbind();
     $('#buttonNext').bind({
       click: function() {
         Criteria.nextSelection(shoudValidate);
       }
     });
    },

    executePrevSelection: function() {
      if ( $(Criteria.selector)[0].selectedIndex == 0 ) {
        return;
      }
      $(Criteria.selector)[0].selectedIndex--;
      ServerVars.who = $(Criteria.selector).find('option:eq(' + $(Criteria.selector)[0].selectedIndex + ')').val();
      Criteria.updateSelection();
    },

    prevSelection: function(shouldValidate) {
      var isValid = true;
      if (shouldValidate) {
        isValid = Criteria.validateCriteria({validateDateEntry:true});
      }
      if (isValid) {
        Criteria.checkChangeOrFire(Criteria.executePrevSelection);
      }
    },

    executeNextSelection: function() {
      if ( $(Criteria.selector)[0].selectedIndex == ( $(Criteria.selector)[0].length - 1 ) ) {
        return;
      }
      $(Criteria.selector)[0].selectedIndex++;
      ServerVars.who = $(Criteria.selector).find('option:eq(' + $(Criteria.selector)[0].selectedIndex + ')').val();
      Criteria.updateSelection();
    },

    nextSelection: function(shouldValidate) {
      var isValid = true;
      if (shouldValidate) {
        isValid = Criteria.validateCriteria({validateDateEntry:true});
      }
      if (isValid) {
        Criteria.checkChangeOrFire(Criteria.executeNextSelection);
      }
    },

    initializeDatePicker: function(selector, options){
      var datePickerOptions = $.extend({}, options);
      datePickerOptions.onSelect = function(dateText, instance){
        onSelectDatePicker(selector);
        if (options.onSelect){
          options.onSelect(dateText, instance, this);
        }
        $(this).trigger('change');
      };
      $(selector).datepicker(datePickerOptions);
    },


    initializeDatePickers: function(dpSelector, removePrevious, excludeServerVarDateSet, onChange, hasCalendarButton) {

      if (dpSelector == null) { dpSelector = 'input.date'; }
      if (removePrevious != null && removePrevious) {
        $(dpSelector).removeClass('hasDatepicker');
      }
      var options = {
        firstDay: Dates.getStartOfWeekNumber() - 1,
        dateFormat: Dates.getDatepickerFormat(Criteria.DATE_FORMAT),
        dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        showOtherMonths: true,
        selectOtherMonths: true,
        onSelect: function(){
          onSelectDatePicker(dpSelector);
          $(this).trigger('change');
          $(this).trigger('blur.dpFieldBlur');
        }
      };
      $(dpSelector).datepicker(options);

      $(dpSelector).off('blur.dpFieldBlur').on('blur.dpFieldBlur', function(){
        if (!Validation.validate('date', null, false, $(this).val())) {
          $(this).datepicker('setDate', new Date());
        }

        if (!excludeServerVarDateSet) {
          ServerVars.date = Dates.getDateValue($(this));
        }

        if (onChange != null) {
          onChange();
        }
      });

      if (!excludeServerVarDateSet) {
        if ((ServerVars.date == null || ServerVars.date === '' || ServerVars.date == 'null') &&
           ServerVars.startDate != null && ServerVars.startDate !== '' && ServerVars.startDate != 'null' &&
            ServerVars.endDate != null && ServerVars.endDate !== '' && ServerVars.endDate != 'null') {
          var startOfWeekFrom = Dates.object(Dates.getStartOfWeek(ServerVars.startDate)).getTime();
          var startOfWeekTo = Dates.object(Dates.getStartOfWeek(ServerVars.endDate)).getTime();
          if (startOfWeekFrom === startOfWeekTo) {
            ServerVars.date = Dates.object(Dates.getStartOfWeek(ServerVars.startDate));
          }
        }
        ServerVars.date = (ServerVars.date == null || ServerVars.date === '' || ServerVars.date == 'null') ? new Date() : ServerVars.date;
        $('input.date').datepicker('setDate', Dates.object(ServerVars.date));
      }

      if(hasCalendarButton) {
        $(dpSelector).parent().find('.hasCalendar').off().on('click', function() {
          $(dpSelector).datepicker('show');
        });
      }

    },

    initializeDateRange: function(from, to, onChange, excludeServerVarDateSet, dateFormat, hasCalendarButton, isValidateOnly) {
      var dates = $( '#' + from + ', #' + to ).datepicker({
        firstDay: Dates.getStartOfWeekNumber() - 1,
        dateFormat: dateFormat != null ? Dates.getDatepickerFormat(dateFormat) : Dates.getDatepickerFormat(Content.general.dFTypes[1]),
        dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        showOtherMonths: true,
        selectOtherMonths: true,
        defaultDate: "+1w",
        beforeShowDay: function(date) {
          var fromDate = $('#' + from).datepicker('getDate');
          var toDate = $('#' + to).datepicker('getDate');
          if ((this.id == from && date > toDate && toDate != null) || (this.id == to && date < fromDate && fromDate != null)){
            return [true, "ui-state-disabled"];
          }
          return [true];
        },
        onSelect: function(){
          onSelectDatePicker('#' + from + ', #' + to);
          $(this).trigger('change');
          $(this).trigger('blur.dpFieldBlur');
        }
      });

      $( '#' + from + ', #' + to ).off('blur.dpFieldBlur').on('blur.dpFieldBlur', function(){
        // TODO: isValidateOnly is here temporary for WFM-37130
        var addErrorClass = isValidateOnly? true : false;
        var value = Dates.format($(this).datepicker('getDate'), Content.general.dFTypes[1]);
        if(value == null){
          value = Dates.format(new Date(), Content.general.dFTypes[1]);
        }
        var isValid = Validation.validate('date', $(this), false, value, false, addErrorClass);
        if (!isValid) {
          if (isValidateOnly) {
            return;
          }
          else {
            var date = dates.not(this).datepicker('getDate') || new Date();
            $(this).datepicker('setDate', date);
          }
        }

        var fromDate = $('#' + from).datepicker('getDate');
        var toDate = $('#' + to).datepicker('getDate');
        if (fromDate && toDate && Dates.getDifferenceInDays(fromDate, toDate) < 0) {
          if (this.id == from) {
            dates.not( this ).datepicker( "setDate", fromDate);
          }
          else{
            dates.not( this ).datepicker( "setDate", toDate);
          }
        }

        if(!excludeServerVarDateSet) {
          if (this.id == from) {
            ServerVars.startDate = $(this).val();
            if (Dates.getDifferenceInDays(fromDate, toDate) < 0) {
              ServerVars.endDate = ServerVars.startDate;
            }
          }
          else {
            ServerVars.endDate = $(this).val();
            if (Dates.getDifferenceInDays(fromDate, toDate) < 0) {
              ServerVars.startDate = ServerVars.endDate;
            }
          }
        }

        if (onChange != null) {
          onChange();
        }
      });


      if(!excludeServerVarDateSet) {
        var startDate = (ServerVars.startDate == null || ServerVars.startDate === '' || ServerVars.startDate == 'null') ? Dates.getStartOfWeek(Dates.object(new Date())) : ServerVars.startDate;
        ServerVars.startDate = startDate;
        $('#' + from).datepicker('setDate', Dates.object(ServerVars.startDate));
        ServerVars.endDate = (ServerVars.endDate == null || ServerVars.endDate === '' || ServerVars.endDate == 'null') ? Dates.getEndOfWeek(Dates.object(startDate)) : ServerVars.endDate;
        $('#' + to).datepicker('setDate', Dates.object(ServerVars.endDate));
        Criteria.prevStartDate = (Criteria.prevStartDate != null) ? Criteria.prevStartDate : ServerVars.startDate;
        Criteria.prevEndDate = (Criteria.prevEndDate != null) ? Criteria.prevEndDate : ServerVars.endDate;
      }

      if(hasCalendarButton) {
        $('#' + from).parent().find('.hasCalendar').off().on('click', function() {
          $('#' + from).datepicker('show');
        });
        $('#' + to).parent().find('.hasCalendar').off().on('click', function() {
          $('#' + to).datepicker('show');
        });
      }

    },

    initializePayPeriod: function() {
      $('#payPeriodOptions').off('selectmenuchange').on('selectmenuchange', function() {
        var payPeriodName = $(this).val();
        for(var i = 0; i < $(this).context.length; i++) {
          if(($(this).context[i].value) === payPeriodName) {
            ServerVars.payPeriodId = $(this).context[i].lang;
          }
        }

        Criteria.onCriteriaSelectionChange();
      });
    },

    selectedId: function() {
      return $(Criteria.selector + " option:selected").val();
    },

    selectedText: function() {
      return $(Criteria.selector + " option:selected").html();
    },

    selectedName: function() {
      return $(Criteria.selector + " option:selected").attr('name');
    },

    showHighlightedButton: function() {
      ServerVars.isDateSelectionChanged = true;
      var $pageGet = $('#pageGetButton button');
      $pageGet.removeClass('btn-primary');
      $pageGet.removeClass('btn-warning');
      $pageGet.addClass('btn-warning');
      $('.dateWarning').remove();
      $('#pageGetButton .criteriaBtnGroup').append($('#warningIcon').html());
    },

    showUnhighlightedButton: function() {
      ServerVars.isDateSelectionChanged = false;
      var $pageGet = $('#pageGetButton button');
      $pageGet.removeClass('btn-primary');
      $pageGet.removeClass('btn-warning');
      $pageGet.addClass('btn-primary');
      $('.dateWarning').remove();
    },

    onCriteriaSelectionChange: function() {
      Criteria.showHighlightedButton();
    }
  };

  function confirmLoadWarning(getFunction){
    if (!Criteria.isSelectedWhoMyTeam()){
      getFunction();
      return;
    }
    if (ScreenPrefs.showMyTeamLoadWarning && ServerVars.getTeamWarn() != "false"){
      var onSuccess = function(){
        ServerVars.setTeamWarn('false')
        getFunction();
      };
      MessageDisplay.confirm(locale.myTeamLoadWarning, onSuccess, null, null, Criteria.resetSelection);
    } else {
      getFunction();
    }
  }

  // WFM-38784, custom fix for datepicker issue with jQuery ui dialog in IE
  // Refer to open bug http://bugs.jqueryui.com/ticket/9125
  function onSelectDatePicker(selector){
    var dialog = $(selector).closest('.ui-dialog');
    if (dialog.length > 0){
      dialog.focus();
    }
  }
}) ();


// Criteria.init()