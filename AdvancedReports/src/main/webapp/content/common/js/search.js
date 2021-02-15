//# sourceURL=Search
/* globals Content, MessageDisplay */

var Search = (function() {
  "use strict";
  
  return {

    json : { list: [ ] },
    
    current : 0,
    
    focusIndex: 0,
    
    isFocusKeydown: false,
    
    events: {
      input: {
        keydown: function(e){
          Search.checkTab(e);
          
          if(e.which === 9){
            var focusItem = Search.getListItemAt(Search.focusIndex);
            Search.loadSelection(focusItem.code, focusItem.description, null, focusItem.type, focusItem.duration, true, false, false);
          } else if (e.which === 38 || e.which === 40){
            e.preventDefault();
            Search.isFocusKeydown = true;
            
            if (e.which === 38) {
              if (Search.isMenuOpen()) {
                Search._moveFocusUp();
              }
            } else if (e.which === 40) {
              if (Search.isMenuOpen()) {
                Search._moveFocusDown();
              }
            }
          }
          
        },
        
        keyup: function(e){
          Search.isFocusKeydown = false;
          if (e.keyCode == 16 || e.keyCode == 38 || e.keyCode == 40) { return; }
          //if enter or click on the lookup we do not want the delay.
          if(e.keyCode == 13 || e.keyCode == undefined){
            if(Search.timer) {
              clearTimeout(Search.timer);
            }
            Search.input(e, Search.getSearchFilter($(e.target).parent().parent().attr('id')));
          } else if(e.keyCode == 9){
            //if tab is hit, we don't want to kill an existing search timer here, but also do not want the delay in case
            //a search has already returned
            Search.input(e, Search.getSearchFilter($(e.target).parent().parent().attr('id')));  
          }
          else { 
            //for all other chars, kill the existing search timer
            if(Search.timer) {
              clearTimeout(Search.timer);
            }
            //When we set the timer, we want to start showing the loading icon to avoid the scenario where the page appears frozen
            //after inputting a search but prior to the get function being called
            Search.target = e.target;
            Search.entity = $(e.target).attr('lang');
            Search.results.css("height","");
            Search.results.html('<div><img src="../common/images/ajax-loader.gif"/></div></div>');

            Search.timer = setTimeout(function(){
              Search.input(e, Search.getSearchFilter($(e.target).parent().parent().attr('id'))); 
            }, parseInt(ScreenPrefs.lookupSearchDelay, 10));
          }
          
        },
        
        focus: function(e){
          if(Search.timer) {
            clearTimeout(Search.timer);
          }
          Search.setEntity(e.target.lang);
        },
        
        documentClick: function(e){
          $('input.search').each(function(i, input) {
            var searchContainer = $(input).parent();
            if (searchContainer.has(e.target).length === 0){
              searchContainer.find('.results').html("");
              searchContainer.find('.results').css("height","0");
            }  
          });

          $('input.multiSelectSearch').each(function(i, input) {
            var searchContainer = $(input).parent();
            if(!jQuery.contains(searchContainer[0],e.target) && $(searchContainer).find("div.multiSelectResults").children().length !== 0){
               $(searchContainer).find("div.multiSelectResults").hide();
            }else{
               $(searchContainer).find("div.multiSelectResults").show();
            } 
          });
        }
      },
      
      resultItems: {
        click : function() {
          var listItem = Search.getListItemAt(Search.focusIndex);
          Search.loadSelection(listItem.code, listItem.description, null, listItem.type, listItem.duration, true, false);
        },

        mouseover : function(e) {
          if (!Search.isFocusKeydown){
            Search._setFocusTo(Search.results.children().index(this));
          }
        }
      }, 
      
      resultScrollItems: {
        scroll: function() {
          if(($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && !Search.gettingNextPage) {
            if(Search.json.pagingResponse && Search.pagesDisplayed < Search.json.pagingResponse.totalPages){
              Search.gettingNextPage = true;
              Search.pagesDisplayed++;
              Search.get(Search.filterFunction); 
            }          
          }
        }
      }
      
    },
    
    getSingleMatch: function(params, successFunction) {
      $.getJSON(Search.url, params, function( json ) {
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
    get: function(filter) {

      $(".results").unbind();
      if (prevSrch) {
        prevSrch.abort();
      }
      
      Search.parms["pageNumber"] = Search.pagesDisplayed;
      Search.results.css("height","");
      Search.results.append('<div><img src="../common/images/ajax-loader.gif"/></div></div>');
      
      var prevSrch = $.getJSON(Search.url, Search.parms, function( json ) {
        Search.json.newPageList = json.list;
        if(Search.pagesDisplayed > 1){             
          Search.json.list = $.merge(Search.json.list,json.list);
        } else {
          Search.json = json;
        }
        if (filter != null) {
          Search.json.list = eval(filter + '(Search.json.list)');
          if(Search.pagesDisplayed > 1){
            Search.json.newPageList = eval(filter + '(Search.json.newPageList)');
          }          
        }
        Search.results.data("resultsList", Search.json.list);
        
        Search.render();
      });

    },

    getAllForCategory: function(category, onfinish) {
      var obj = {};
      obj[category] = "*";
      var prevSrch = $.getJSON(Search.url, obj, function( json ) {

        if (onfinish != null) {
          onfinish(json);
        }

      });
    },

    render: function() {
      Search._closeMenu();
      
      Search.results.children().last().remove();
      Search.results.css("height","");
      if(Search.pagesDisplayed > 1){
        Search.renderNextPage();
      } else {
        if (Search.json.list.length === 0) {
          Search.results.append('<div class="noResults">' + Content.general.noRecordsFound + '</div>');
          return;
        }

        $(Search.json.list).each(function(i, o) {
          var modClass = (o["modClass"] != null ? ' class="' + o["modClass"] + '"' : '');
          var typeValue = (o.type != null ? (' lang="' + o.type + '"') : '' );
          Search.results.append('<dl' + modClass + '><dt' + typeValue + '>' + o.code + '</dt>' + '<dd>' + (o.description || "") + '</dd>' + '</dl>');
        });
        
        Search._isMenuOpen = true;
        
        Search.setCurrent(Search.getCurrentFromField());
        Search._setFocusTo(Search.current, false);

        var resultItems = Search.results.find("dl");
        resultItems.bind(Search.events.resultItems);
      }
            
      $(".results").bind(Search.events.resultScrollItems);
      Search.gettingNextPage = false;
    },

    renderNextPage: function() {
      
      $(Search.json.list).each(function(i, o) {
        var modClass = (o["modClass"] != null ? ' class="' + o["modClass"] + '"' : '');
        var typeValue = (o.type != null ? (' lang="' + o.type + '"') : '' );
        Search.results.append('<dl' + modClass + '><dt' + typeValue + '>' + o.code + '</dt>' + '<dd>' + (o.description || "") + '</dd>' + '</dl>');
      });
      
      Search._isMenuOpen = true;
      
      Search.setCurrent(Search.getCurrentFromField());
      Search._setFocusTo(Search.current, false);

      var resultItems = Search.results.find("dl");
      resultItems.bind(Search.events.resultItems);
           
    },

    allSearchesValid: function(selector, hideAlerts, addErrorClass, canBeEmpty) {

      var isValid = true;
      var sel = (selector != null ? (selector + ' td.data div.results') : 'td.data div.results');

      $(sel).each(function(i, o) {
        $(o).parent().find('input.search').removeClass('errorClass');
        
        isValid = Search.validate($(o), canBeEmpty);
        if (!isValid){
          if(addErrorClass) {
            $(o).parent().find('input.search').addClass('errorClass');
          }
          return false;
        }
      });
      if (!isValid && (hideAlerts == null || !hideAlerts))
      {
        MessageDisplay.error(Content.alerts.searchFieldsInvalid);
      }
      return isValid;

    },

    isSearchValid : function(entity) {

      var sel = 'td.data div#results_' + entity;
      var isValid = true;
      $(sel).each(function(i, o) {
        isValid = Search.validate($(o));
        if (!isValid){
          return false;
        }
      });
      return isValid;
    },
    
    validate: function(searchResultsElm, canBeEmpty){
      var isValid = false;
      
      var results = $(searchResultsElm);
      var searchInput = results.parent().find('input.search');
      
      if (results.parent().parent().css('display') != 'none'){
        if (canBeEmpty && searchInput.val() === ''){
          isValid = true;
        } else if (!canBeEmpty && searchInput.val() === ''){
          isValid = false;
        } else {
          var resultsList = results.data('resultsList');
          $(resultsList).each(function(i, listItem){
            if (listItem.code === searchInput.val()){
              isValid = true;
              return false;
            }
          });
        }
      } else {
        isValid = true;
      }
      
      return isValid;
    },

    clearSelection: function(entity, setToSelection) {
      if (setToSelection !== false){
        Search.setEntity(entity);
  
        Search.field.val('');
        Search.results.html("");
        Search.results.css("height","0px");
        Search.description.text('');
        Search.field.removeData('companionCodes');
      } else {
        var field = $( "#search_" + entity );                         
        var results = $( "#results_" + entity );                      
        var description = $( "#results_" + entity + "Description" );  
        field.val("");
        results.html("");
        description.text("");
        field.removeData("companionCodes");
      }

    },

    loadSelection: function(code, desc, entity, type, duration, clearResults, setToChild, setCurrent) {
     
      if (code == '' || code == null) {
        return;
      }
      
      if(!duration){
      duration = 0;
      }
      
      Search.setEntity(entity);

      if (clearResults !== false) {
        Search._closeMenu();
      }

      Search.field.val(code);
      Search.description.text(desc);
      if (type != null) {
        Search.description.attr('lang', type);
      }
      Search.field.removeData('companionCodes');
      if (Search.json != null && Search.json.list != null) {
        $(Search.json.list).each(function(i, listItem) {
          if (listItem.code == code) {
            if (listItem.companionCodes != null) {
              Search.field.data('companionCodes', listItem.companionCodes);
              return false;
            }
          }
        });
      }

      var id; 
      if (setCurrent !== false){
        Search.setCurrent(Search.getCurrentFromField());
        if(Search.json.list[Search.current]){
          id = Search.json.list[Search.current].id;
        }
      }
      
      Search.results.data('resultsList', [{code: code, description: desc, duration: duration, id: id}]);
      Search.clearChild(setToChild);

      if (Search.fireOnLoad != null) {
        Search.fireOnLoad({code: code, description: desc, duration: duration});
      }
      
      //after making selection we need to clear variables so they don't spill over into other lookup
      Search.focusIndex = 0;
      Search.json.list = [];      

    },

    clearChild: function(setToChild) {
      $('input.search[name="' + Search.entity + '"]').each(function(i, o) {
        Search.clearSelection($(o).attr('lang'), setToChild);
      });
    },

    input: function(e, filter) {
      if (Search.entity !== e.target.lang){
        Search._closeMenu();
      }

      Search.setEntity(e.target.lang);

      var focusItem = Search.getListItemAt(Search.focusIndex);
      switch (e.which) {
        case (9): // tab
          return;
        case (13): // enter
          if (Search.isMenuOpen()) {
            Search.loadSelection(focusItem.code, focusItem.description, null, focusItem.type, focusItem.duration, true, false);
          } else {
            var currentItem = Search.getListItemAt(Search.current);
            Search.loadSelection(currentItem.code, currentItem.description, null, currentItem.type, currentItem.duration, true, false);
          }
          return;
        case (38): // up
        case (40): // down
          return;
        case (37): // left
        case (39): // right
          e.stopPropagation();
          break;
        case (46): // delete
          e.target.value = '';
          break;
      }

      Search._closeMenu();
      Search.parms = {};
      Search.parms[Search.entity] = e.target.value;
      
      if (Search.entity == 'code' || Search.entity == 'bonusCode' || Search.entity == 'codesAndBonusCodes') {
        Search.parms['employeeId'] = $('#cEmployee').val();
      }

      var isParentSet = true;
      var parent = (e.target.name) ? e.target.name : null;
      if (parent != null) {
        isParentSet = Search.isSearchValid(parent);
        Search.parms[parent] = $("#search_" + parent).val();
      }
      if (Search.additionalParameters != null) {
        for ( var key in Search.additionalParameters) {
          Search.parms[key] = Search.additionalParameters[key];
        }
      }
      if (isParentSet) {
        Search.pagesDisplayed = 1;
        Search.get(filter);
      }

    },

    initialize: function(sel, searchFilter, fireOnLoad, additionalParameters) {
      if (sel != null) {
        sel += ' input.search';
      } else {
        sel = '#Fields input.search';
      }
      
      var searchType = $(sel).parent().parent().attr('id');
      if (searchFilter != null) {
        Search.setSearchFilter(searchType, searchFilter);
      }
      
      Search.timer = null;

      $(sel).off('keydown');
      $(sel).off('keyup');
      $(sel).off('focus');

      $(sel).on('keydown', Search.events.input.keydown);
      $(sel).on('keyup', Search.events.input.keyup);
      $(sel).on('focus', Search.events.input.focus);
      
      $(document).off('click.search').on('click.search', Search.events.input.documentClick);
      
      Search.loadLookupIndicators(sel);
      
      Search.fireOnLoad = fireOnLoad;
      Search.additionalParameters = additionalParameters;
    },

    loadLookupIndicators: function(sel) {
      $(sel).each(function(i, o) {
        if ($(o).siblings('div.lookupIndicator').length === 0) {
          $(sel).addClass('lookupInputBox');
          $(sel).after('<div  class="lookupIndicator search">'+'<i class="fa fa-search lookupButton" aria-hidden="true"></i></div>');
        }
      });
      Search.bindLookupIndicator();
    },

    bindLookupIndicator: function() {
      $('div.lookupIndicator.search').off().on({
        click: function(event) {
          var input = $(this).prev('input[type="text"]');
          input.focus();
          input.keyup();
        }
      });
    },

    searchFilters: [],

    setSearchFilter: function(sel, searchFilter) {
      if (searchFilter == null) { return; }
      var found = false;
      $(Search.searchFilters).each(function(i, o) {
        if (o.selector == sel) {
          o.searchFilter = searchFilter;
          found = true;
          return false;
        }
      });
      if (!found) {
        Search.searchFilters.push({ selector:sel, searchFilter:searchFilter });
      }
    },

    getSearchFilter: function(sel) {
      var searchFilter = null;
      $(Search.searchFilters).each(function(i, o) {
        if (o.selector == sel) {
          searchFilter = o.searchFilter;
          return false;
        }
      });

      return searchFilter;
    },

    checkTab: function(e) {
      Search.entity = e.target.lang;
      Search.results = $( "#results_" + Search.entity );
      if (Search.results.html() !== "" && e.keyCode == 9) {
        e.preventDefault();
      }
    },

    disableSearch: function(entity) {
      if (entity != null) {
        var $obj = $( "#search_"  + entity );
        var $searchObj = $obj.siblings("div.lookupIndicator.search");
        $obj.prop('disabled', true);
        $searchObj.removeClass('disableSearchIcon');
        $searchObj.addClass('disableSearchIcon');
        $searchObj.off('click');
      }
    },
    enableSearch: function(entity) {
      if (entity != null) {
        var $obj = $( "#search_"  + entity );
        var $searchObj = $obj.siblings("div.lookupIndicator.search");
        $obj.prop('disabled', false);
        $searchObj.removeClass('disableSearchIcon');
        Search.bindLookupIndicator(null, $obj);
      }
    },
    
    getCurrentFromField: function(){
      var currentIndex = 0;
      if (Search.field && Search.field.val()) {
        $.each(Search.json.list, function(i, o) {
          if (Search.field.val() == o.code) {
            currentIndex = i;
            return false;
          }
        });
      }
      return currentIndex;
    },
    
    getListItemAt: function(index){
      var listItem = {};
      if (Search._isIndexWithinRange(index, Search.json.list)){
        listItem = Search.json.list[index];
      }
      return listItem;
    },
    
    setCurrent : function(index) {
      if (Search._isIndexWithinRange(index, Search.json.list)){
        Search.current = index;
      } else {
        Search.current = 0;
      }
      Search.focusIndex = Search.current;
    },

    setEntity : function(entity){
      if (entity != null){
        Search.entity = entity;
        Search.field = $( "#search_" + Search.entity );
        Search.results = $( "#results_" + Search.entity );
        Search.description = $( "#results_" + Search.entity + "Description" );
      }
    },
    
    isMenuOpen : function() {
      return Search._isMenuOpen || false;
    },
    
    getCentreAndPosLookupDescription: function(options) {
      Search.initialize('#Fields', null);
      var chainedAjaxLookup = function chainAjax(lookupChain) {
        var chainLength = lookupChain.length;
        var currentLookup = lookupChain.shift();
        if (chainLength > 1) {
          Search.getSingleMatch(currentLookup.params, function() {
            currentLookup.success(arguments[0].description);
            chainAjax(lookupChain);
          });
        }
        else if (chainLength === 1) {
          options.onComplete.call(options.onCompleteContext, options.onCompleteParams);
        }
      };
      
      var lookupChain = [];
      var costCentre = options.centre;
      var position = options.position;
      if (costCentre && costCentre != '') {
        $('#Fields #search_center').val(costCentre);
        lookupChain.push({params: {'center': costCentre},
                          success: function(desc) {
                            Search.loadSelection(costCentre, desc, 'center');
                          }});

        if (position && position != '') {
          $('#Fields #search_position').val(position);
          lookupChain.push({params: {'center': costCentre,
                                     'position': position},
                            success: function(desc) {
                              Search.loadSelection(position, desc, 'position');
                            }});
        }
        else {
          $('#Fields #search_position').val('');
          $('#Fields #results_positionDescription').text('');
        }
      }
      else {
        $('#Fields #search_center').val('');
        $('#Fields #results_centerDescription').text('');
        $('#Fields #search_position').val('');
        $('#Fields #results_positionDescription').text('');
      }

      lookupChain.push({success:options.onComplete});
      chainedAjaxLookup(lookupChain);
    },
    
    _closeMenu: function(){
      Search.gettingNextPage = false;
      Search._isMenuOpen = false;
      if (Search.results){
        Search.results.html("");
        Search.results.css("height","0px");
      }
    },
    
    _moveFocusUp : function() {
      var index = 0;
      if (Search.focusIndex === 0) {
        index = Search.results.children().length - 1;
      } else {
        index = Search.focusIndex - 1;
      }
      Search._setFocusTo(index, true);
    },

    _moveFocusDown : function() {
      var index = 0;
      if (Search.focusIndex === Search.json.list.length - 1) {
        index = 0;
      } else {
        index = Search.focusIndex + 1;
      }
      Search._setFocusTo(index, true);
    },

    _setFocusTo: function(resultItemIndex, shouldScrollToFocus){
      Search._setFocusIndex(resultItemIndex);
      var items = Search.results.children();
      items.removeClass("hov");
      items.eq(Search.focusIndex).addClass("hov");
      
      if (shouldScrollToFocus){
        var isWindowTopAboveResults = $(window).scrollTop() < Search.results.offset().top;
        
        var bottomOfResults = Search.results.offset().top + Search.results.outerHeight();
        var bottomOfWindow = $(window).height() + $(window).scrollTop();
        var isWindowBottomBelowResults = bottomOfResults < bottomOfWindow;
        
        var isAllResultsVisible = isWindowTopAboveResults && isWindowBottomBelowResults; 
        if (!isAllResultsVisible){
          var middleOfWindow = Search.results.children(".hov").offset().top - $(window).height() / 2;
          $("html, body").scrollTop(middleOfWindow);
        }
      }
    },
    
    _setFocusIndex : function(index) {
      var min = 0;
      var numResultItems = Search.results.children().length;
      var max = numResultItems ? numResultItems : 0;

      if (index < min) {
        Search.focusIndex = min;
      } else if (index > max) {
        Search.focusIndex = max;
      } else {
        Search.focusIndex = index;
      }
    },
    
    _isIndexWithinRange: function(index, array){
      return (0 <= index && index < array.length);
    },
    
    url : '/wfm/controldata/dynamic',
    
    eof : 0


  };

})();
