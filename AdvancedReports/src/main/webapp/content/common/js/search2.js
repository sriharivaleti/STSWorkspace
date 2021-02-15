//# sourceURL=Search2
/* globals Overlay, Dates, ScreenPrefsController, ServerVars, Content */

var Search2 = (function() {
  "use strict";
  
  return {

    url: '/wfm/controldata/dynamic',
    staticUrl: '/wfm/controldata/static',

    prevSearch: null,

    shouldShowEmptyRow: function() {
      return Search2.dropDownType != null || Search2.showEmptyRow;
    },
    
    get: function(filter) {

      $(".overlayContent").unbind();
      if (Search2.prevSearch) {
        Search2.prevSearch.abort();
      }
      if(Search2.pagesDisplayed == 1){
        Overlay.showOrModContent(Search2.entity, Search2.target, null, '<div id="searchContent"><div><img src="../common/images/ajax-loader.gif"/></div></div>', null, null, true);
      } else {       
        $("#searchContent").append('<div><img src="../common/images/ajax-loader.gif"/></div></div>');
      }
      
      if (Search2.staticLookupTypes.indexOf(Search2.entity) > -1) {
        if (Search2.staticLookup == null) {
          Search2.getStaticData(filter);
        }
        else {
          Search2.returnStaticList(filter);
        }
      }
      else {
        if(Search2.entity == 'customLookup') {
          Search2.json = {};
          if (Search2.customLookupOptions.url) {
            var parms = {};
            if (Search2.customLookupOptions.getParms) {
              parms = Search2.customLookupOptions.getParms(Search2.target);
            }
            Search2.prevSearch = $.getJSON(Search2.customLookupOptions.url, parms, function( json ) {
              Search2.json = Search2.customLookupOptions.orchestrateFunction(json);
              Search2.showDescriptionOnly =  Search2.customLookupOptions.onlyDescription;
              if (Search2.shouldShowEmptyRow()) {
                Search2.json.list.splice(0, 0, {code:"", description:""});
              }
              Search2.render(filter);
            });
          } else {
            Search2.showDescriptionOnly =  Search2.customLookupOptions.onlyDescription;
            Search2.json.list = Search2.filterStaticList(Search2.parms[Search2.entity], Search2.customLookupOptions.list);
            Search2.render(filter);
          }
        }
        else {
          var url = Search2.buildUrl();
          Search2.setParms();
          if (Search2.entity == 'whoEntry') {
        	  Search2.parms["who"] = $('#cEmployee').val();
          }
          Search2.prevSearch = $.getJSON(url, Search2.parms, function( json ) {            
            if(Search2.pagesDisplayed > 1){
              Search2.currentResultsCount = Search2.json.list.length;
              Search2.json.list = $.merge(Search2.json.list,json.list);
              Search2.json.newPageList = json.list;
            } else {
              Search2.json = json;
            }          
            
            if (Search2.shouldShowEmptyRow() && Search2.pagesDisplayed == 1) {
              Search2.json.list.splice(0, 0, {code:"", description:""});
            }
            if (Search2.entity == 'code' || Search2.entity == 'codesAndBonusCodes' || Search2.entity == 'bonusCode') {
              if (Search2.json != null) {
                var list = [];
                $(Search2.json.list).each(function(i, o) {
                  if (ScreenPrefsController.checkPermissionForRowDisplay({code:{type:parseInt(o.type), typeName:o.altType}})) {
                    list.push(o);
                  }
                });
                Search2.json.list = list;
              }
              if (Search2.pagesDisplayed > 1 && Search2.json.newPageList != null) {
                var list = [];
                $(Search2.json.newPageList).each(function(i, o) {
                  if (ScreenPrefsController.checkPermissionForRowDisplay({code:{type:parseInt(o.type), typeName:o.altType}})) {
                    list.push(o);
                  }
                });
                Search2.json.newPageList = list;
              }
            }
            if (Search2.entity == 'whoEntry') {
              if (Search2.json.list) {
                Search2.json.list = Search2.json.list.map(function(entry) {
                  return {
                    code: entry.id,
                    description: entry.description
                  };
                });
              }
              if (Search2.pagesDisplayed > 1 && Search2.json.newPageList) {
                Search2.json.newPageList = Search2.json.newPageList.map(function(entry) {
                  return {
                    code: entry.id,
                    description: entry.description
                  };
                });
              }
            }
            Search2.render(filter);
          });
        }
      }
    },
    
    buildUrl: function() {
      var url = Search2.url;
      if (Search2.entity == 'whoEntry') {
        url += '/getWho';
      }
      return url;
    },
    
    setParms: function() {
      if (Search2.entity == 'shift') {
        Search2.parms['employeeId'] = $('#cEmployee').val();
        var shiftDateHolder = $(Search2.target).closest('.hasShiftDate');
        var shiftDatesHolder = $(Search2.target).closest('.hasShiftDates');
        if (shiftDateHolder != null && shiftDateHolder.length > 0) {
          Search2.parms['effectiveFromDate'] = Dates.format(shiftDateHolder.data('shiftDate'), 'YYYY-MM-DD');
        }
        else if (shiftDatesHolder != null && shiftDatesHolder.length > 0) {
          var dates = shiftDatesHolder.data('shiftDates');
          Search2.parms['effectiveFromDate'] = Dates.format(dates.from, 'YYYY-MM-DD');
          Search2.parms['effectiveToDate'] = Dates.format(dates.to, 'YYYY-MM-DD');
        }

      } else if (Search2.entity == 'code' || Search2.entity == 'bonusCode' || Search2.entity == 'codesAndBonusCodes') {
        Search2.parms['employeeId'] = $('#cEmployee').val();

        var codeDatesHolder = $(Search2.target).closest('.hasCodeDates');
        if (codeDatesHolder != null && codeDatesHolder.length > 0) {
          var dates = codeDatesHolder.data('codeDates');
          Search2.parms['effectiveFromDate'] = Dates.format(dates.from, 'YYYY-MM-DD');
          Search2.parms['effectiveToDate'] = Dates.format(dates.to, 'YYYY-MM-DD');
        }
      } else if (Search2.entity == 'manualRefundCode') {
        Search2.parms['employeeId'] = $('#cEmployee').val();
      } else if (Search2.entity == 'whoEntry') {
        Search2.parms['userId'] = ServerVars.userId;
      }
      if (Search2.dropDownType != null) {
        Search2.parms["dropDown"] = Search2.dropDownType;
      }
      Search2.parms["pageNumber"] = Search2.pagesDisplayed;
    },

    getWhoEntry: function(whoType, whoEntryFilter, onSuccess) {
      var url = Search2.url + '/getWho';
      var params = {
        who: whoType,
        userId: ServerVars.userId, 
        whoEntry: whoEntryFilter || ''
      };
      $.getJSON(url, params, function(json) {
        var whoList = $.map(json.list, function(who){
          return {
            id: who.id,
            name: who.description
          };
        });
        onSuccess(whoList);
      });
    },
    
    getDropDownValues: function(dropDownType, successFunction) {
      var obj = {};
      obj["dropDown"] = dropDownType;
      if (Search2.entity == 'whoEntry') {
    	  obj["who"] = $('#cEmployee').val();
      }
      $.getJSON(Search2.buildUrl(), obj, function( json ) {
        if (json != null && json.list != null) {
          if (successFunction != null) {
            successFunction(dropDownType, json.list);
          }
        }
        else {
          if (successFunction != null) {
            successFunction();
          }
        }
      });
    },

    getDropDownMatch: function(dropDownType, value, successFunction) {
      var obj = {};
      obj["dropDown"] = dropDownType;
      obj["dropDownDescFilter"] = '';
      obj["dropDownValFilter"] = value;
      if (Search2.entity == 'whoEntry') {
    	  obj["who"] = $('#cEmployee').val();
      }
      $.getJSON(Search2.buildUrl(), obj, function( json ) {
        if (json != null && json.list != null && json.list.length > 0) {

          if (successFunction != null) {
            successFunction(json.list[0]);
          }
        }
        else {
          if (successFunction != null) {
            successFunction();
          }
        }
      });
    },

    getExactStaticItemMatch: function(options) {

      var obj = null;
      if (options.attempts != null && options.attempts > 4) {
        obj = null;
        if (options.successFunction != null) {
          options.successFunction(obj);
        }
        options.attempts = 0;
      }
      else if (Search2.staticLookup == null) {
        if (options.attempts == null) {
          options.attempts = 0;
        }
        options.attempts += 1;
        Search2.getStaticData(null, true, Search2.getExactStaticItemMatch, options);
      }
      else {
        var fieldToUse = (options.type != null ? 'type' : 'code');
        $(Search2.staticLookup[options.entity + 's']).each(function(i, o) {
          if (options[fieldToUse] == o[fieldToUse]) {
            obj = o;
            return false;
          }
        });
        if (options.successFunction != null) {
          options.successFunction(obj, options.params);
        }
      }
    },

    getStaticData: function(filter, stopRender, additionalGetFunction, additionalGetFunctionOptions) {
      if (ServerVars.date == 'null') {
        ServerVars.date = new Date();
      }
      var url = (Search2.staticUrl + '/' + Dates.format(ServerVars.date, 'YYYY-MM-DD'));
      $.getJSON(url, Search2.parms, function( json ) {
        Search2.staticLookup = json;
        if (stopRender == null || !stopRender) {
          Search2.returnStaticList();
        }
        if (additionalGetFunction != null) {
          additionalGetFunction(additionalGetFunctionOptions);
        }

      });
    },

    returnStaticList: function(filter) {
      Search2.json = {
        list: Search2.filterStaticList(Search2.parms[Search2.entity], Search2.staticLookup[Search2.entity + 's'])
      };
      Search2.render(filter);
    },

    staticLookupTypes: ['otType', 'hourType', 'rateType'],
    
    filterStaticList: function(searchVal, staticList) {
      var list = [];
      if (searchVal === '*' || searchVal === '') {
        list = staticList;
      } else {
        list = $.grep(staticList, function(lookupObj, i) {
          var displayObj = Search2.getDisplayObj(lookupObj);
          
          var isCodeMatch = displayObj.code? (searchVal.toLowerCase() === displayObj.code.substr(0, searchVal.length).toLowerCase()) : false;
          var isDescriptionMatch = displayObj.description? (searchVal.toLowerCase() === displayObj.description.substr(0, searchVal.length).toLowerCase()) : false;
          if (isCodeMatch || isDescriptionMatch) {
            return true;
          } 
          else {
            return false;
          }
        });
      }
      return list;
    },
    
    getDisplayObj: function(lookupObj) {
      var obj = {};
      
      var codeValue = (Search2.entity != 'code' && Search2.entity != 'codesAndBonusCodes' && Search2.entity != 'bonusCode' && lookupObj.type != null ? lookupObj.type : lookupObj.code);
      var descValue = lookupObj.description || '';
      if (Search2.showOnlyId != null && Search2.showOnlyId) {
        obj.code = codeValue;
      } else if (Search2.showDescriptionOnly) {
        obj.description = descValue;
      } else {
        obj.code = codeValue;
        obj.description = descValue;
      }
      
      return obj;
    },

    render: function(filter) {
      
      if(Search2.pagesDisplayed > 1){
        Search2.renderNextPage(filter);
      } else {
        Search2.current = -1;
        if (filter != null) {
          if (Search2.json != null) {
            Search2.json.list = filter(Search2.json.list);
          }
        }

        var str = '<div id="searchContent">';

        if (Search2.json == null || Search2.json.list == null || Search2.json.list.length === 0 || ( Search2.shouldShowEmptyRow() && Search2.json.list.length === 1) ) {
          str += '<div class="noResults">' + Content.general.noRecordsFound + '</div>';
        } else {
          $(Search2.json.list).each(function(i, o) {
            var value;
            
            var displayObj = Search2.getDisplayObj(o);
            var code = displayObj.code;
            var description = displayObj.description;
            if (code && description) {
              value = '<span class="code">' + code + '</span> - <span class="desc">' + description + '</span>';
            } else if (code) {
              value = '<span class="code">' + code + '</span>';
            } else if (description) {
              value = '<span class="desc">' + description + '</span>';
            } else {
              value = '';
            }

            str += '<div class="record" lang="' + i + '">' + value + '</div>';
          });
        }
        
        str += '</div>';

        Search2.gettingNextPage = false;
        
        Overlay.showOrModContent(Search2.entity, Search2.target, null, str, null, null, true);
      }
      
      Search2.events();
    },
    
    events: function() {
      
      $("#searchContent div.noResults, #searchContent div.resultsPaging").unbind().bind({

        click: function() {
          if (Search2.failureFunction != null) {
            Search2.failureFunction();
          }
          Search2.gettingNextPage = false;
          Overlay.close();
        }

      });

      $("#searchContent div.record").unbind().bind({

        click: function() {

          var index = parseInt($(this).attr('lang'));

          if (Search2.json != null) {
            Search2.loadSelection(jQuery.extend(true, {}, Search2.json.list[index]));
          }
          Search2.gettingNextPage = false;

        },

         mouseover: function() {
           $(this).addClass('hov');
         },

         mouseout:  function() {
           $(this).removeClass('hov');
         }


       });
      
      $(".overlayContent").unbind().bind({

        scroll: function() {
          if(($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && !Search2.gettingNextPage) {
            if(Search2.json.pagingResponse && Search2.pagesDisplayed < Search2.json.pagingResponse.totalPages){
              Search2.gettingNextPage = true;
              Search2.pagesDisplayed++;
              Search2.get(Search2.filterFunction); 
            }          
          }
        }
       });
    },

    renderNextPage: function(filter) {
  
      Search2.current = -1;
      if (filter != null) {
        if (Search2.json != null) {
          Search2.json.newPageList = filter(Search2.json.newPageList);
        }
      }

      var str = '';

      $(Search2.json.newPageList).each(function(i, o) {
        var value;
        
        var displayObj = Search2.getDisplayObj(o);
        var code = displayObj.code;
        var description = displayObj.description;
        if (code && description) {
          value = '<span class="code">' + code + '</span> - <span class="desc">' + description + '</span>';
        } else if (code) {
          value = '<span class="code">' + code + '</span>';
        } else if (description) {
          value = '<span class="desc">' + description + '</span>';
        } else {
          value = '';
        }
        var count = Search2.currentResultsCount + i;
        str += '<div class="record" lang="' + count + '">' + value + '</div>';
      });      

      Search2.gettingNextPage = false;
      $("#searchContent").children().last().remove();
      $("#searchContent").append(str);

    },
    
    loadSelection: function(obj) {

      if (Search2.json == null) { Search2.json = {}; }

      jQuery.data(document.getElementById($(Search2.target).attr('id')), 'isValid', 1);
      Search2.isChange = false;
      if (Search2.selectFunction != null) {
        Search2.selectFunction( obj, Search2.target );
      }
      Overlay.close();
      if (Search2.isTabShiftPressed && Search2.tabShiftFunction != null) {
        Search2.tabShiftFunction();
      }
      if ((Search2.isTabPressed || Search2.isEnterPressed) && Search2.tabFunction != null) {
        Search2.tabFunction();
      }
      Search2.json.list = [];
    },

    isValid: function(objId) {
      return jQuery.data(document.getElementById(objId), 'isValid') == 1;
    },

    moveCurrent: function(inc) {
      Search2.current += inc;
      Overlay.setSelectedListItem(Search2.current);
    },

    input: function(e, filter) {
      try {
        Search2.event = e;
        Search2.keyCode = e.keyCode;

        Search2.target = e.target;
        jQuery.data(Search2.target, 'isValid', 0);

        if (!Search2.loadSearchObj($(Search2.target).attr('lang'), $(Search2.target))) { return; }

        filter = Search2.filterFunction;
        Search2.value = e.target.value;
        if (Search2.value.toUpperCase() == 'AUTO' ) {
          Search2.value = '';
        }
        if (Search2.entity == null) {
          Search2.entity = $(e.target).attr('lang');
        }
        if (Search2.parent == null) {
          Search2.parent = ( e.target.name ) ? e.target.name : null;
        }


        if ( this.keyCode == 27 ) {
          Search2.json = null;
          if (Search2.failureFunction != null) {
            Search2.failureFunction();
          }
          Overlay.close();
          return;
        }

        if ( this.keyCode == 13 || this.keyCode == 9 ) {
          Search2.current = (Search2.current < 0)? Search2.getIndexForFirstRecord() : Search2.current;
          $('#dValue').select();
          var obj = Search2.json != null && Search2.json.list.length > Search2.current && Search2.current > -1 ? jQuery.extend(true, {}, Search2.json.list[Search2.current]) : { useOldValue: true };
          if (Search2.prevSearch) {
            Search2.prevSearch.abort();
          }
          Search2.loadSelection( obj );          
          
          return; 
        }
        if (e.keyCode == 16) { return; }
        Search2.isChange = true;
        if ( this.keyCode == 40 ) {
          if ( Search2.json != null && Search2.json.list != null && Search2.json.list.length > 0 && Search2.current < ( Search2.json.list.length - 1 ) ) {
           Search2.moveCurrent(1);
          }
          return;
        }

        if ( this.keyCode == 38 ) {
         if ( Search2.json != null && Search2.json.list != null && Search2.json.list.length > 0 && Search2.current > 0 ) {
           Search2.moveCurrent(-1);
          }
          return;
        }

        this.parms = {};

        eval('this.parms.' + this.entity + ' = "' + this.value + '"');



        if (this.parent != null && this.parent != 'null' && this.parent != '' && this.parent != 'undefined') {
          var val = (Search2.parentValue) ? Search2.parentValue : Search2.getParentValue($(Search2.target));
          eval('this.parms.' + this.parent + ' = "' + val + '"');
        }

        if (Search2.entity == 'code') {
          // Search2.parms["codesAndBonusCodes"] = true;
        }
        
        Search2.pagesDisplayed = 1;
        this.get(filter);
      }
      catch (ex) {

      }


    },

    parentValue: null,
    initialize: function(sel, lookupType, parentValue, parentType, selectFunction, failureFunction, staticLookup, showOnlyId, tabFunction, tabShiftFunction, filterFunction, showOnInit, dropDownType, showEmptyRow, customLookupOptions) {

      var obj = {};
      obj.failureFunction = failureFunction;
      obj.selectFunction = selectFunction;
      obj.staticLookup = staticLookup;
      obj.parentValue = parentValue;
      obj.entity = lookupType;
      obj.parent = parentType;
      obj.showOnlyId = showOnlyId;
      obj.tabFunction = tabFunction;
      obj.tabShiftFunction = tabShiftFunction;
      obj.filterFunction = filterFunction;
      obj.dropDownType = dropDownType;
      obj.showEmptyRow = showEmptyRow;
      obj.customLookupOptions = customLookupOptions;
      var searchDetailKey = lookupType;
      if (obj.dropDownType != null) {
        jQuery.data(document.getElementById($(sel).attr('id')), 'dropDownType', obj.dropDownType);
        searchDetailKey += '_' + obj.dropDownType;
      }

      Search2.searchDetails[searchDetailKey] = obj;
      Search2.json = null;
      Search2.pagesDisplayed = 1;
      Search2.timer = null;
      $(sel).unbind('keydown');
      $(sel).unbind('keyup');
      $(sel).unbind('focusout');
      $(sel).bind('keydown', function(e) { 
        Search2.checkTab(e); 
      });
      $(sel).bind('keyup', function(e) { 

        //if enter we do not want the delay.
        if(e.keyCode == 9 || e.keyCode == 13 ){
          if(Search2.timer) {
            clearTimeout(Search2.timer);
          }
          Search2.input(e, filterFunction); 
        } else if(e.keyCode == 16 || e.keyCode == 38 || e.keyCode == 40){
          //if up or down is hit, we don't want to kill an existing search timer here, but also do not want the delay in case
          //a search has already returned
          Search2.input(e, filterFunction);  
        }
        else { 
          //for all other chars, kill the existing search timer
          if(Search2.timer) {
            clearTimeout(Search2.timer);
          }
          //When we set the timer, we want to start showing the loading icon to avoid the scenario where the page appears frozen
          //after inputting a search but prior to the get function being called
          Search2.target = e.target;
          Search2.entity = $(e.target).attr('lang');
          Overlay.showOrModContent(Search2.entity, Search2.target, null, '<div id="searchContent"><div><img src="../common/images/ajax-loader.gif"/></div></div>', null, null, true);

          Search2.timer = setTimeout(function(){
            Search2.input(e, filterFunction); 
          }, parseInt(ScreenPrefs.lookupSearchDelay, 10));
        }
      });
      $(sel).bind('focusout', function(e) { 
        if(Search2.timer) {
          clearTimeout(Search2.timer);
        }
        Search2.focusoutInput(e); 
      });
      $(sel).bind('focus', function(e) { /* Search2.json = null; */ });
      Search2.isChange = false;
      if(Search2.timer) {
        clearTimeout(Search2.timer);
      }
      if (showOnInit) {
        Search2.loadSearchObj(lookupType, $(sel));
        Search2.target = $(sel);
        Search2.parms = {};
        Search2.parms[lookupType] = $(sel).val();
        if (parentType != null && parentType != 'null' && parentType != '' && parentType != 'undefined') {
          Search2.parms[parentType] = (parentValue) ? parentValue : Search2.getParentValue($(sel));
        }
        Search2.get(filterFunction);
      }
      if ($(sel).siblings('div.lookupIndicator').length === 0) {
        $(sel).addClass('lookupInputBox');
        $(sel).after('<div  class="lookupIndicator search2"  lang="' + lookupType + '">'+'<i class="fa fa-search lookupButton" aria-hidden="true"></i></div>');
      }
      Search2.bindLookupIndicator();
    },

    bindLookupIndicator: function(lookupIndicator) {
      var selector = lookupIndicator || 'div.lookupIndicator.search2';
      $(selector).unbind().bind({
        click: function(event) {
          var lookupType = $(this).attr('lang');
          var input = $(this).prev('input[type="text"]');

          Search2.loadSearchObj(lookupType, $(input));

          Search2.target = input;
          Search2.parms = {};
          var value = input.val();
          if (value.toUpperCase() == 'AUTO' ) {
            value = '';
          }
          Search2.parms[lookupType] = value;
          var parentType = Search2.parent;
          if (parentType != null && parentType != 'null' && parentType != '' && parentType != 'undefined') {
            Search2.parms[parentType] = (Search2.parentValue) ? Search2.parentValue : Search2.getParentValue(input);
          }

          Search2.pagesDisplayed = 1;
          Search2.get(Search2.filterFunction);
          Search2.target.focus();
        },
        mouseover: function(event) {
          var lookupType = $(this).attr('lang');
          var input = $(this).prev('input[type="text"]');
          var searchDetail = Search2.getLookupDetail(lookupType, input);
          searchDetail.isValidBlur = false;
        },
        mouseleave: function(event) {
          var lookupType = $(this).attr('lang');
          var input = $(this).prev('input[type="text"]');
          var searchDetail = Search2.getLookupDetail(lookupType, input);
          searchDetail.isValidBlur = true;
        }
      });
    },

    getLookupDetail: function(lookupType, input) {
      var dropDownType = jQuery.data(document.getElementById($(input).attr('id')), 'dropDownType');
      if (dropDownType != null) {
        lookupType = lookupType + '_' + dropDownType;
      }
      return Search2.searchDetails[lookupType];
    },

    loadSearchObj: function(lookupType, input) {
      var searchDetail = Search2.getLookupDetail(lookupType, input);
      if (searchDetail != null) {
        Search2.failureFunction = searchDetail.failureFunction;
        Search2.selectFunction = searchDetail.selectFunction;
        // Search2.staticLookup = searchDetail.staticLookup;
        Search2.parentValue = searchDetail.parentValue;
        Search2.entity = searchDetail.entity;
        Search2.parent = searchDetail.parent;
        Search2.showOnlyId = searchDetail.showOnlyId;
        Search2.tabFunction = searchDetail.tabFunction;
        Search2.tabShiftFunction = searchDetail.tabShiftFunction;
        Search2.filterFunction = searchDetail.filterFunction;
        Search2.dropDownType = searchDetail.dropDownType;
        Search2.showEmptyRow = searchDetail.showEmptyRow;
        Search2.customLookupOptions = searchDetail.customLookupOptions;
        // $('#globalContent').prepend(JSON.stringify(searchDetail))
        return true;
      }
      return false;
    },

    searchDetails: {},

    focusoutInput: function(e) {
        var lookupType = $(e.target).attr('lang');
        var searchDetail = Search2.getLookupDetail(lookupType, $(e.target));
        if (searchDetail.isValidBlur == null || searchDetail.isValidBlur) {
          Search2.loadSearchObj(lookupType, $(e.target));
          try {
            if (!Overlay.isHovered) {
              if (Search2.json != null && ( (Search2.json.list.length === 1 && !Search2.shouldShowEmptyRow()) || (Search2.json.list.length === 2 && Search2.shouldShowEmptyRow()) )) {
                Search2.current = Search2.getIndexForFirstRecord();
                $(e.target).select();
                Search2.loadSelection( jQuery.extend(true, {}, Search2.json.list[Search2.current]) );
              }
              else {
                if (Search2.failureFunction != null) {
                  Search2.failureFunction();
                }
              }
              Overlay.close();
            }
            else {
              $('#dValue').select();
            }
          }
          catch (ex) {
  
          }
        }
        if (Search2.prevSearch) {
          Search2.prevSearch.abort();
        }
    },

    loadInput: function(obj, value) {
      obj.val(value);
      jQuery.data(obj[0], 'isValid', 1);
    },

    clearInput: function(obj) {
      $(obj).val('');
      jQuery.data(obj[0], 'isValid', 0);
    },

    staticLookup: null,
    selectFunction: null,
    failureFunction: null,

    checkTab: function(e) {
      Search2.isTabPressed = (e.keyCode == 9 && !e.shiftKey);
      Search2.isTabShiftPressed = (e.keyCode == 9 && e.shiftKey);
      Search2.isEnterPressed = (e.keyCode == 13);

      if (e.keyCode == 9 && (Search2.isGridSearchInput(e.target) || Search2.isChange || $(e.target).val() === '')) {
        e.preventDefault();
      }
    },

    isGridSearchInput: function(input) {
      var stop = false;
      var isGridSearchInput = false;
      while (!stop && input != null) {
        if ($(input).attr('id') == 'Grid' || $(input).hasClass('GridContainer') || $(input).hasClass('pane')) {
          isGridSearchInput = true;
          stop = true;
        }
        if ($(input).is('body')) {
          stop = true;
        }
        input = $(input).parent();
      }
      return isGridSearchInput;
    },
    
    getParentValue: function($selector) {
      var parentId = $selector.attr('name');
      return $('#' + parentId).val();
    },
    
    disableSearch: function(searchInput) {
      var input = $(searchInput);
      input.prop('disabled', true);
      
      var lookupIndicator = input.siblings('.lookupIndicator.search2');
      lookupIndicator.addClass('disableSearchIcon');
      lookupIndicator.off();
    },
    
    enableSearch: function(searchInput) {
      var input = $(searchInput);
      input.prop('disabled', false);
      
      var lookupIndicator = input.siblings('.lookupIndicator.search2');
      lookupIndicator.removeClass('disableSearchIcon');
      Search2.bindLookupIndicator(lookupIndicator);
    },
    
    getIndexForFirstRecord: function() {
      var index = -1;
      
      if (Search2.json && Search2.json.list && Search2.json.list.length > 0) {
        index = (Search2.shouldShowEmptyRow())? 1 : 0;
      }
      
      return index;
    },
    
    isTabPressed: false,
    isTabShiftPressed: false
  };

}) ();
