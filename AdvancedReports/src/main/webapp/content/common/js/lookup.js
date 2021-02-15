//# sourceURL=Lookup
var Lookup = (function($, undefined) {
  "use strict";

  var lookupUtils = {
    containsLookupItem: function(lookupItem, lookupItems) {
      var found = false;
      for(var i = 0, length = lookupItems.length; i < length && !found; i++) {
        if (lookupItem.code ===  lookupItems[i].code) {
          found = true;
        }
      }
      return found;
    },

    getItemsAndDescriptions: function (lookupItems) {
      var itemsAndDescriptions = {items:[], descriptions:[]};
      for(var i = 0, length = lookupItems.length; i < length; i++) {
        var lookupItem = lookupItems[i];
        itemsAndDescriptions.items.push(lookupItem.code);
        itemsAndDescriptions.descriptions.push(lookupItem.description);
      }
      return itemsAndDescriptions;
    },

    getLookupItems: function(filterMap, handler) {
      $.getJSON('/wfm/controldata/dynamic', filterMap, function(json) {
        handler(json.list);
      });
    }
  };

  /* 
   * Listens for resultsItemChange and filterClear
   * Fires selectedItemChange when a selected item is checked/unchecked
   */
  var SelectedLookupItemsView = (function() {
    function SelectedLookupItems(initialSelectedLookupItems, $selectedLookupItemsSelector, $eventSelector) {
      var selectedLookupItems = initialSelectedLookupItems;
      var allLookupItemsInView = [];
      allLookupItemsInView.push.apply(allLookupItemsInView, selectedLookupItems);
      events();
      render();

      //begin public instance methods
      this.getSelectedLookupItems = function() {
        return selectedLookupItems;
      };

      this.setSelectedLookupItems = function(newSelectedLookupItems) {
        selectedLookupItems = newSelectedLookupItems;
        updateAllItems();
        updateAndRender();
      };

      this.clearAllLookupItems = function() {
        selectedLookupItems = [];
        allLookupItemsInView = [];
        updateAndRender();
      };

      this.clearSelectedLookupItems = function() {
        selectedLookupItems = [];
        updateAndRender();
      };

      this.clearUnselectedLookupItems = function() {
        allLookupItemsInView = [];
        for(var i = 0; i < selectedLookupItems.length; i++) {
          allLookupItemsInView.push(selectedLookupItems[i]);
        }
        updateAndRender();
      };

      //begin private instance methods
      function updateAndRender() {
        $eventSelector.trigger('selectedItemsChange', [selectedLookupItems]);
        render();
      }

      function render() {
        var markup = '';
        for (var i = 0; i < allLookupItemsInView.length; i++) {
          markup += addLookupItemToSelectedView(allLookupItemsInView[i]);
        }
        $selectedLookupItemsSelector.html(markup);
        associateLookupDataWithSelectedItems();
        initializeSelectedItemsEvents();
      }

      function addLookupItemToSelectedView(lookupItem) {
        var checked = lookupUtils.containsLookupItem(lookupItem, selectedLookupItems) ? 'checked': '';
        return ('<dl><dt> <input type="checkbox" ' + checked + '/>' +
                lookupItem.code + '</dt><dd>' + lookupItem.description + '</dd></dl>');
      }

      function updateAllItems() {
        for(var i = 0; i < selectedLookupItems.length; i++) {
          if (!lookupUtils.containsLookupItem(selectedLookupItems[i], allLookupItemsInView)) {
            allLookupItemsInView.push(selectedLookupItems[i]);
          }
        }
      }

      function events() {
        $eventSelector.bind('resultsItemChange', function(event, newSelectedItems) {
          selectedLookupItems = newSelectedItems;
          updateAllItems();
          render();
        });

        $eventSelector.bind('filterClear', function(event) {
          selectedLookupItems = [];
          allLookupItemsInView = [];
          render();
        });
      }

      function associateLookupDataWithSelectedItems() {
        var dlResults = $selectedLookupItemsSelector.find('dl');
        for (var i = 0; i < dlResults.length; i++) {
          $.data(dlResults[i], 'code', allLookupItemsInView[i]);
        }
      }

      function initializeSelectedItemsEvents() {
        $selectedLookupItemsSelector.find('input').bind({
          click: function(e) {
            $(this).prop('checked', !$(this).prop('checked'));
          }
        });
        $selectedLookupItemsSelector.find('dl').bind({
          click: function() {
            var checkBox = $(this).find('input');
            var isChecked = !checkBox.prop('checked');
            checkBox.prop('checked', isChecked);

            if (isChecked) {
              selectedLookupItems.push($(this).data('code'));
            }
            else {
              var itemToRemove = $(this).data('code');
              selectedLookupItems = $.grep(selectedLookupItems, function(selectedLookupItem, i) {
                return (selectedLookupItem.code !== itemToRemove.code);
              });
            }
            $eventSelector.trigger('selectedItemsChange', [selectedLookupItems]);
          },
          mouseover: function() {
            $(this).addClass('hov');
          },
          mouseout: function() {
            $(this).removeClass('hov');
          }
        });
      }
    }
    return SelectedLookupItems;
  })();

  /*
   * Listsn for filterChange, filterClear and selectedItemsChange
   * Fires resultsItemChange when a selected item is checked/unchecked
   */
  var ResultView = (function() {
    function ResultView($resultsSelector, initialSelectedItems, $eventSelector, filterOn, additionalFilters) {
      var lookupItems = [];
      var selectedItems = initialSelectedItems;
      var resultsMarkup = '';
      var focusKeydown = false;
      var focusItemIndex = 0;
      lookupItems.push.apply(lookupItems, selectedItems);
      events();

      //begin private instance methods
      function render(renderFlags) {
        var currentLookupItem;
        resultsMarkup = '';
        $resultsSelector.html(resultsMarkup);
        if (lookupItems.length === 0 && renderFlags.filterChange) {
          resultsMarkup = '<div class="noResults">' + Content.general.noRecordsFound + '</div>';
        }
        for (var i = 0; i < lookupItems.length; i++) {
          currentLookupItem = lookupItems[i];
          if (i === focusItemIndex){
            currentLookupItem.isFocused = true;
          } else {
            currentLookupItem.isFocused = false;
          }
          resultsMarkup += addLookupItemToResults(currentLookupItem);
        }

        //make the change visible to the user by delaying render
        if (renderFlags.doNotDelayRender === true) {
          setMarkupAndEvents();
        }
        else {
          setTimeout(setMarkupAndEvents, 20);
        }
      }

      function setMarkupAndEvents() {
        $resultsSelector.html(resultsMarkup);
        associateLookupDataWithResults();
        initializeResultsEvents();
      }

      function addLookupItemToResults(lookupItem) {
        var checked = lookupUtils.containsLookupItem(lookupItem, selectedItems) ? 'checked': '';
        var isFocused = lookupItem.isFocused? 'hov' : '';
        return ('<dl class="' + isFocused + '" ><dt> <input type="checkbox" tabindex="-1" ' + checked + '/>' +
                lookupItem.code + '</dt><dd>' + lookupItem.description + '</dd></dl>');
      }

      function associateLookupDataWithResults() {
        var dlResults = $resultsSelector.find('dl');
        for (var i = 0; i < dlResults.length; i++) {
          $.data(dlResults[i], 'code', lookupItems[i]);
        }
      }

      function initializeResultsEvents() {
        $resultsSelector.find('input').bind({
          click: function(e) {
            $(this).prop('checked', !$(this).prop('checked'));
          }
        });
        $resultsSelector.find('dl').bind({
          click: function() {
            onItemSelected(this);
          },
          mouseover: function() {
            if (!focusKeydown){
              $resultsSelector.find('dl.hov').removeClass('hov');
              $(this).addClass('hov');
              setFocusItemIndex($resultsSelector.find('dl').index(this));
            }
          }
        });
        
        $(document).off('click', onDocumentClick);
        $(document).on('click', onDocumentClick);
      }

      function events() {
        $eventSelector.bind('filterClear', function() {
          selectedItems = [];
          lookupItems = [];
          render({});
        });

        $eventSelector.bind('filterChange', function(event, filterValue) {
          var filter = {};
          filter[filterOn] = filterValue;
          $.extend(true, filter, additionalFilters);
          if (filterOn == 'code' || filterOn == 'bonusCode' || filterOn == 'codesAndBonusCodes') {
            filter['employeeId'] = $('#cEmployee').val();
          }
          lookupUtils.getLookupItems(filter, onFilterChange);
        });

        $eventSelector.bind('selectedItemsChange', function(event, newSelectedItems) {
          selectedItems = newSelectedItems;
          render({ doNotDelayRender:true });
        });
        
        $eventSelector.bind('resultItemFocusPrev', function(){
          var resultItems = $resultsSelector.find('dl');
          if (resultItems.length === 0){
            return;
          }
          if (focusItemIndex <= 0){
            setFocusItemIndex(resultItems.length - 1);
          } else {
            setFocusItemIndex(focusItemIndex - 1);
          }
          resultItems.removeClass('hov');
          resultItems.eq(focusItemIndex).addClass('hov');
          
          scrollToFocusedItem();
        });
        
        $eventSelector.bind('resultItemFocusNext', function(){
          var resultItems = $resultsSelector.find('dl');
          if (resultItems.length === 0){
            return;
          }
          if (focusItemIndex >= (resultItems.length - 1)){
            setFocusItemIndex(0);
          } else {
            setFocusItemIndex(focusItemIndex + 1);
          }
          resultItems.removeClass('hov');
          resultItems.eq(focusItemIndex).addClass('hov');
          
          scrollToFocusedItem();
        });
        
        $eventSelector.bind('resultItemSelected', function(){
          onItemSelected($resultsSelector.find('dl').eq(focusItemIndex));
        });
        
        $eventSelector.bind('resultsFocusKeydown', function(){
          focusKeydown = true;
        });
        
        $eventSelector.bind('resultsFocusKeyup', function(){
          focusKeydown = false;
        });
        
        $eventSelector.bind('resultsClear', function(){
          clearResults();
        });
        
        
      }
      
      function onFilterChange(newLookupItems) {
        lookupItems = newLookupItems;
        if (!isIndexWithinRange(focusItemIndex, lookupItems) ){
          setFocusItemIndex(0);
        }
        render({ filterChange: true });
      }
      
      function onItemSelected(itemSelected){
        var checkBox = $(itemSelected).find('input');
        var isChecked = !checkBox.prop('checked');
        checkBox.prop('checked', isChecked);

        if (isChecked) {
          selectedItems.push($(itemSelected).data('code'));
        }
        else {
          var itemToRemove = $(itemSelected).data('code');
          selectedItems = $.grep(selectedItems, function(selectedLookupItem, i) {
            return (selectedLookupItem.code !== itemToRemove.code);
          });
        }
        $eventSelector.trigger('resultsItemChange', [selectedItems]);
      }
      
      function onDocumentClick(event){
        if ($resultsSelector.parent().has(event.target).length === 0){
          clearResults();
          $(document).off('click', onDocumentClick);
        }
      }
      
      function clearResults(){
        $resultsSelector.html('');
      }
      
      function setFocusItemIndex(index){
        if (isIndexWithinRange(index, lookupItems)){
          focusItemIndex = index;
        } else {
          focusItemIndex = 0;
        }
      }
      
      function isIndexWithinRange(index, array){
        return (0 <= index && index < array.length);
      }
      
      function scrollToFocusedItem(){
        if ($resultsSelector.children(".hov").length === 0){
          return;
        }
        
        var isWindowTopAboveResults = $(window).scrollTop() < $resultsSelector.offset().top;
        
        var bottomOfResults = $resultsSelector.offset().top + $resultsSelector.outerHeight();
        var bottomOfWindow = $(window).height() + $(window).scrollTop();
        var isWindowBottomBelowResults = bottomOfResults < bottomOfWindow;
        
        var isAllResultsVisible = isWindowTopAboveResults && isWindowBottomBelowResults; 
        if (!isAllResultsVisible){
          var middleOfWindow = $resultsSelector.children(".hov").offset().top - $(window).height() / 2;
          $("html, body").scrollTop(middleOfWindow);
        }
      }
      
    }
    return ResultView;
  })();

  /*
   * Fires filterClear event when clearInputField method is called
   * Fires filterChange when a keyup is detected for keys other than left and right arrow
   */
  var InputHandler = (function() {
    function InputHandler($inputSelector, $inputIndicatorSelector, $eventSelector) {
      events();

      this.clearInputField = function() {
        $inputSelector.val('');
        $eventSelector.trigger('filterClear');
      };

      function events() {
        $inputSelector.bind({
          'keyup': handleKeyup,
          'keydown': handleKeydown
        });

        $inputIndicatorSelector.bind('click', function() {
          $inputSelector.trigger('keyup');
        });
      }

      function handleKeydown(event){
        switch(event.which){
        case 9: // tab key
          $eventSelector.trigger('resultsClear');
          break;
        case 38: // up arrow
          event.preventDefault();
          $eventSelector.trigger("resultItemFocusPrev");
          $eventSelector.trigger("resultsFocusKeydown");
          break;
        case 40: // down arrow
          event.preventDefault();
          $eventSelector.trigger("resultItemFocusNext");
          $eventSelector.trigger("resultsFocusKeydown");
          break;
        }
      }
      
      function handleKeyup(event) {
        switch(event.which) {
        case 13: // enter key
          $eventSelector.trigger('resultItemSelected');
          break;
        case 37: // left arrow
        case 39: // right arrow
          event.stopPropagation();
          break;
        case 38: // up arrow
        case 40: // down arrow
          event.stopPropagation();
          $eventSelector.trigger("resultsFocusKeyup");
          break;
        default:
          $eventSelector.trigger('filterChange', [$inputSelector.val()]);
          break;
        }
      }
    }
    return InputHandler;
  })();

  function Lookup(options) {
    var filterOn = options.filterOn;
    var additionalFilters = options.additionalFilters || {};

    var $inputSelector = $('#' + options.inputId);
    var $resultsSelector = $('#' + options.resultsId);
    var $selectedLookupItemsSelector = $('#' + options.selectedItemsId);
    var $inputIndicatorSelector = $('#' + options.inputIndicatorId);
    var $eventSelector = $($inputSelector.parent());

    var initialSelectedLookupItems = options.initialSelectedLookupItems || [];

    var inputHandler = new InputHandler($inputSelector, $inputIndicatorSelector, $eventSelector);
    var selectedLookupItemsView = new SelectedLookupItemsView(initialSelectedLookupItems,
                                                              $selectedLookupItemsSelector,
                                                              $eventSelector);

    var resultView = new ResultView($resultsSelector, initialSelectedLookupItems,
                                    $eventSelector, filterOn, additionalFilters);
    
    //begin public methods
    this.getSelectedLookupItems = function() {
      return selectedLookupItemsView.getSelectedLookupItems();
    };

    this.setSelectedLookupItems = function(lookupItems) {
      selectedLookupItemsView.setSelectedLookupItems(lookupItems);
    };

    this.clearInputField = function() {
      inputHandler.clearInputField();
    };

    this.clearAll = function() {
      this.clearInputField();
    };

    this.clearUnselectedLookupItems = function() {
      selectedLookupItemsView.clearUnselectedLookupItems();
    };

    this.getSelectedLookupItemsAndDescriptions = function() {
      return lookupUtils.getItemsAndDescriptions(this.getSelectedLookupItems());
    };
  }

  //expose getLookupItems utility method
  Lookup.getLookupItems = function(filterMap, handler) {
    lookupUtils.getLookupItems(filterMap, handler);
  };
  return Lookup;
})(jQuery);
