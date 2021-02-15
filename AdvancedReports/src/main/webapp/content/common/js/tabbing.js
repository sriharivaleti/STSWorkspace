var Tabbing = (function($) {
  "use strict";
  
  return {
    init: function(options) {
      
      if (options != null) {        
        
        if (options.container != null && options.container != "") {
          var option = Tabbing.getTabbingOptions(options.container);
          if (option == null) {
            Tabbing.options.push(options);
          }
          else {
            option.tabMapping = options.tabMapping;
          }         
        }
        Tabbing.render(options.container);
      }
      
    },
    
    getTabbingOptions: function(container) {
      var option = null;
      $(Tabbing.options).each(function(i, o) {
        if (o.container == container) {
          option = o;
          return false;
        }
      });
      return option;
    },
    
    removeOption: function(container) {
      var index = -1;    
      $(Tabbing.options).each(function(i, o) {
        if (o.container == container) {
          index = i;
          return false;
        }
      });
      
      if (index !== -1) {
        Tabbing.options.splice(index, 1);
      }
    },
    
    render: function(container) {
      var option = Tabbing.getTabbingOptions(container);
      if (option != null) {
        if (option.tabMapping == null || option.tabMapping.length === 0) {
          Tabbing.clearTabbing(container);
          return;
        }
        var tabContainer = $(container);
        if (tabContainer.length > 0) {
          tabContainer.addClass('tabContainer');
          tabContainer.html(Tabbing.getTabStrip(container));
          tabContainer.append(Tabbing.getTabContentHolder());
          Tabbing.loadSelectedTab(container);
          Tabbing.events(container);
        }
      }
            
    },
    
    clearTabbing: function(container) {      
      $(container).html('');
    },
    
    getTabMappingObj: function(name, displayName, content, getContentFunction) {
      var obj = { name: name, displayName: displayName, content:content, getContentFunction:getContentFunction};
      return obj;
    },
    
    loadSelectedTab: function(container) {
      $(container + ' ' + Tabbing.tabContent).html('<div class="tabLoadingDiv" style="display:block"></div>');
      var option = Tabbing.getTabbingOptions(container);
      var tabMapping = Tabbing.getTabMapping(option, option.selectedItem);
      if (tabMapping != null && (tabMapping.getContentFunction != null || tabMapping.content != null)) {
        if (tabMapping.getContentFunction != null) {
          tabMapping.getContentFunction($(container + ' ' + Tabbing.tabContent), container + ' ' + Tabbing.tabContent);
        }
        else {
          $(container + ' ' + Tabbing.tabContent).html(tabMapping.content);
        }
      }
      else {
        $(container + ' ' + Tabbing.tabContent).html('');
      }
      // to cater for the delay in filling the html, we put the resizing of the dialog on a timeOut (if there is one)
      setTimeout(function() {
        Tabbing.checkDialogPositioning(option);
      }, 500);
    },
    
    events: function() {
      $('div.tabbingTabStrip div.tabStripItem').unbind().bind('click', function(event) {        
        var name = '';
        var element = $(this);        
        name = element.attr('lang');
        while (name === '' && !$(element).hasClass('tabbingTabStrip')) {          
          element = $($(element).parent());
          name = element.attr('lang');
        }        
        Tabbing.selectTab(element);
      });
    },
    
    checkDialogPositioning: function(option) {      
      if (option.dialog != undefined && option.dialog.selector != null) {
        $(option.dialog.selector).dialog('option', 'position', {my:"center", at:"center", of: window});
      }
    },
    
    getTabbingContainer: function(element) {
      return '#' + $(element).parent().parent().attr('id');
    },
    
    getTabMapping: function(option, name) {
      var tabMapping = null;
      $(option.tabMapping).each(function(i, o) {
        if (o.name == name) {
          tabMapping = o;
          return false;
        }
      });
      return tabMapping;
    },
    element : null,
    selectTab: function(element) {      
      var container = Tabbing.getTabbingContainer(element);
      $(container).find('.tabStripItem').removeClass(Tabbing.selectedTabClass);
      $(element).addClass(Tabbing.selectedTabClass);
      var name = $(element).attr('lang');
      var option = Tabbing.getTabbingOptions(container);      
      option.selectedItem = name;
      Tabbing.loadSelectedTab(container);
    },
    
    getTabStrip: function(container) {
      var option = Tabbing.getTabbingOptions(container);
      var str = '<div class="tabbingTabStrip">';
      if (option.selectedItem != null) {
        var found = false;
        $(option.tabMapping).each(function(i, o) {
          if (option.selectedItem == o.name) {
            found = true;
            return false;
          }
        });
        if (!found) {
          option.selectedItem = null;
        }
      }
      
      $(option.tabMapping).each(function(i, o) {
        var name = o.name;
        var display = o.displayName != null ? o.displayName : name;
        var tabSelected = option.selectedItem == o.name || (option.selectedItem == null && i === 0) ? (' ' + Tabbing.selectedTabClass) : '';
        if (tabSelected != "") {
          option.selectedItem = o.name;
        }
        var isFirst = i === 0 ? ' first' : '';
        str += '<div class="tabStripItem' + tabSelected + isFirst + '" lang="' + name + '"><span>' + display + '</span></div>';
      });
      str += '</div>';
      
      return str;
    },
    
    getTabContentHolder: function() {
      var str = '<div class="tabbingTabContent"></div>';
      return str;
    },
    
    tabMapping: [],
    selectedTabClass: 'tabSelected',
    tabContent: 'div.tabbingTabContent',
    container: '#tabContainer',  
    options: [],
    eof:0
  };
}) (jQuery);