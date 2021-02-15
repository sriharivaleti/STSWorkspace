/* globals MessageDisplay, locale */

var Accordion = (function($) {
  "use strict";
  
  return {
    init: function(options) {
      
      if (options != null) {        
        
        if (options.container != null && options.container != "") {
          var option = Accordion.getOptions(options.container);
          if (option == null) {
            Accordion.options.push(options);
          }
          else {
            option.mapping = options.mapping;
          }         
        }
        Accordion.render(options.container);
      }
      
    },
    
    // Get Options for the selected Instance
    getOptions: function(container) {
      var option = null;
      $(Accordion.options).each(function(i, o) {
        if (o.container == container) {
          option = o;
          return false;
        }
      });
      return option;
    },
    
    // Remove Options for the selected Instance
    removeOption: function(container) {
      var index = -1;    
      $(Accordion.options).each(function(i, o) {
        if (o.container == container) {
          index = i;
          return false;
        }
      });
      
      if (index !== -1) {
        Accordion.options.splice(index, 1);
      }
    },
    
    // Render Instance
    render: function(container) {
            
      var option = Accordion.getOptions(container);
      if (option != null) {
        // Validate Options
        if (option.mapping == null || option.mapping.length === 0) {
          Accordion.clearContainer(container);
          return;
        }
        // Build Instance
        var objContainer = $(container);
        if (objContainer.length > 0) {
          objContainer.addClass(Accordion.containerClass);
          objContainer.html(Accordion.getGroups(container));
          
          Accordion.loadSelected(container);
          Accordion.events(container);
        }
      }
            
    },
    
    clearContainer: function(container) {      
      $(container).html('');
    },
    
    getMappingObj: function(name, displayName, content, getContentFunction) {
      var obj = { name: name, displayName: displayName, content:content, getContentFunction:getContentFunction};
      return obj;
    },
    
    getSelectedContent: function(container) {
      return $(container + ' .' + Accordion.selectedClass + ' .' + Accordion.contentClass);
    },
    
    getSelectedGroup: function(container) {
      return $(container + ' .' + Accordion.selectedClass + ' .' + Accordion.headerClass).find('span.title').attr('lang');
    },
    
    loadSelected: function(container) {
     
      var selectedContent = Accordion.getSelectedContent(container);
      var selectedGroup = Accordion.getSelectedGroup(container);
      $.scrollTo($(selectedContent).parent(), 200);
      var option = Accordion.getOptions(container);
      var mapping = Accordion.getMapping(option, option.selectedItem);         
      selectedContent.animate({height:80},500).html('<div class="tabLoadingDiv" style="display:block"></div>');
      
      
      if (selectedContent.length > 0) {
        
        if (mapping != null && (mapping.getContentFunction != null || mapping.content != null)) {
          if (mapping.getContentFunction != null) {
            mapping.getContentFunction(selectedContent, selectedGroup);
          }
          else {
            selectedContent.html(mapping.content);
          }
        }
        else {
          selectedContent.html('');
        }
      
      }
      
    },
    
    fireChange: function(container, group, content) {
      // reset all to collapsed        
      container.find('div.' + Accordion.contentClass + '.expanded').not(content).addClass('collapsed').removeClass('expanded').slideToggle(400);
      // set new selectedTab class early on for smooth css changes
      container.find('.' + Accordion.groupClass).removeClass(Accordion.selectedClass);
      $(group).addClass(Accordion.selectedClass);
      
      // Set the Selected item and localization
      if (content.hasClass('collapsed')) {       
        content.html('<div class="tabLoadingDiv" style="display:block"></div>');
        content.removeClass('collapsed').addClass('expanded').slideToggle(500, function(){
          Accordion.selectTab(group);
        });
      } else {
        content.animate({height:80},500).html('<div class="tabLoadingDiv" style="display:block"></div>');
        Accordion.selectTab(group);
      }
    },
    
    events: function() {
      $('div.' + Accordion.headerClass).unbind().bind('click', function(event) {
        var obj = $(this);
        var group = obj.parent('div.' + Accordion.groupClass + ':first');
        var container = group.parent('div:first');
        var content = group.find('div.' + Accordion.contentClass + ':first');
        var options = Accordion.getOptions('#' + container.attr('id'));         
        
        if ($(group).find('span.title').attr('lang') != options.selectedItem) {
          // check for changes
          if (options != null && options.checkChangeFunction()) {          
            MessageDisplay.confirm(locale.alertConfirmDiscardChanges, function(){Accordion.fireChange(container, group, content);});
          } else {
            Accordion.fireChange(container, group, content);
          }
        }
        
                
      });
      
      /*$('.handle, .title').unbind().bind('click', function(event){        
          $(this).parent('div.' + Accordion.headerClass).click();        
      });*/
    },
        
    getContainer: function(element) {
      return '#' + $(element).parent().attr('id');
    },
    
    getMapping: function(option, name) {
      var mapping = null;
      $(option.mapping).each(function(i, o) {
        if (o.name == name) {
          mapping = o;
          return false;
        }
      });
      return mapping;
    },
    
    element : null,
    selectTab: function(element) {
      var container = Accordion.getContainer(element);
      var name = $(element).find('span.title').attr('lang');
      var option = Accordion.getOptions(container);
      option.selectedItem = name;
      Accordion.loadSelected(container);
    },
    
    getGroups: function(container) {
      var option = Accordion.getOptions(container);
      var str = '';
      
      // Validate / Clean the Selected Option Value
      if (option.selectedItem != null) {
        var found = false;
        $(option.mapping).each(function(i, o) {
          if (option.selectedItem == o.name) {
            found = true;
            return false;
          }
        });
        if (!found) {
          option.selectedItem = null;
        }
      }      
      
      $(option.mapping).each(function(i, o) {
        var name = o.name;
        var display = (o.displayName != null && o.displayName != '') ? o.displayName : name;
        var objSelected = option.selectedItem == o.name || (option.selectedItem == null && i === 0) ? (' ' + Accordion.selectedClass) : '';
        if (objSelected != "") {
          option.selectedItem = o.name;
        }
        
        var firstExpanded = ' collapsed',
            isFirst = '';
        
        if (i === 0) {
          firstExpanded = ' expanded'; 
          isFirst = ' style="display: block;"';
        }
        
        str += '<div id="group_' + i + '" class="' + Accordion.groupClass + objSelected + '">';
        str += ' <div class="' + Accordion.headerClass + '">';
        str += ' <span class="handle"></span><span class="title" lang="' + name + '">' + display + '</span>';
        str += ' </div>';
        str += ' <div class="' + Accordion.contentClass + firstExpanded + '" ' + isFirst + '></div>';
        str += '</div>';
      });
      
      return str;
    },

    container: '#accordionContainer',
    containerClass: 'accordionContainer',
    selectedClass: 'selectedAccordion',
    groupClass: 'accordionExpander',
    headerClass: 'accordionHeader',
    contentClass: 'accordionContent',
    content: 'div.accordionContent',
    options: [], 
    mapping: [],
    eof:0
  };
}) (jQuery);