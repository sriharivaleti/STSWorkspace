/* globals UiUtils, MessageDisplay */

var Overlay = (function() {
  "use strict";
  
  return {
        
    show: function(type, target, offset, content, title, showExit, isModal, isDialogOverlay, onClose) {
      //alert('showing overlay');
      if ($('#overlayBox').not('.' + type).length > 0) {
        if ($('#overlayBox').not('.' + type).hasClass('isModal')) {
          // Add animation to flicker current overlay
          return false;
        }
        else {          
          $('#overlayBox').not('.' + type).remove();
        }
      }
      Overlay.loadCSS();
      if(isDialogOverlay) {
        var pos = $(target).position();
        pos.top += $(target).height() + 38;
        $(target).parents('.ui-dialog').append(Overlay.getContainer(type, pos, content, title, showExit, isModal));
      }
      else {
        var pos = $(target).offset();
        if (offset != null) {
          if (offset.top != null) {
            pos.top += offset.top;
          }
          if (offset.left != null) {
            pos.left += offset.left;
          }
        }
        pos.top += $(target).height() - $('#globalTarget').offset().top + 4;
        $('#globalContent').append(Overlay.getContainer(type, pos, content, title, showExit, isModal));
      }
      Overlay.events({
        onClose: onClose
      });
      return true;
    },

    showList: function(type, target, data, clickAction, isDialogOverlay) {
      if (Overlay.isModalOverlayOpen()) {
        Overlay.close();
        return;
      }
      var str = '<div id="searchContent">';
      $(data).each(function(i, o) {    
        var value = '<span class="displayName" lang="' + o.id + '">' + o.displayName + '</span>';        
        str += '<div class="record' + (o.selected ? ' selected' : '') + '" lang="' + o.id + '">' + value + '</div>';
      });

      str += '</div>';
      
      Overlay.showOrModContent(type, target, null, str, null, null, true, isDialogOverlay);
      if (clickAction != null) {
        $('#overlayBox.' + type + ' #searchContent div.record').click(function(event) {
          var id = $(event.target).attr('lang');
          clickAction(id);
          Overlay.close();
        });
      }
      $('#overlayBox').unbind('mouseenter.showList');
      $('#overlayBox').unbind('mouseleave.showList');
      $('#overlayBox').bind({
        'mouseenter.showList': function() {            
          clearTimeout(Overlay.hideListTimeout);
        },
        'mouseleave.showList': function() {
          Overlay.close();          
        }
      });
      
      Overlay.hideListTimeout = setTimeout(Overlay.close, 5000);
      
    },
    
    hideListTimeout: -1,
    
    showOrModContent: function(type, target, offset, content, title, showExit, isModal, isDialogOverlay) {      
      if ($('#overlayBox.' + type).length > 0) {       
        $('#overlayBox.' + type + ' div.overlayContent').html(content);
        return true;
      }
      else {             
        return Overlay.show(type, target, offset, content, title, showExit, isModal, isDialogOverlay);
      }
    },
    
    isModalOverlayOpen: function() {
      return (($('#overlayBox').length > 0 && $('#overlayBox').hasClass('isModal')));
    },
    
    setSelectedListItem: function(index) {
      var $records = $('#searchContent div.record');
      if ($records[index]) {
        var prevIndex = $records.filter('.selected').index();
        $records.removeClass('selected');
        var $selected = $records.eq(index).addClass('selected');
        
        var $box = $("#overlayBox .overlayContent");
        var boxTop = $box.scrollTop();
        var boxBottom = boxTop + $box.height();
        $box.scrollTop(0); //set to top so cellTop is correctly calculated
        
        var cellTop = $selected.position().top;
        var cellHeight = $selected.outerHeight();
        var cellBottom = cellTop + cellHeight;

        var currentIndex = index;
        if (currentIndex <= 0) { // move to top
          scrollTo = 0;
        } 
        else if (currentIndex >= $records.length - 1) { // move to bottom
          scrollTo = $box[0].scrollHeight;
        }
        else if(cellTop >= boxTop && cellBottom <= boxBottom) {
          scrollTo = boxTop;
        }
        else {
          if(prevIndex < currentIndex) { // move down
            scrollTo = cellBottom - $box.height();
          }
          if(prevIndex > currentIndex) { // move up
            scrollTo = cellTop;
          }
        }
        $box.scrollTop(scrollTo);
      }
    },
    
    firstInput: function() {
      return ($('#overlayBox input').length > 0 ? $('#overlayBox input')[0] : null);
    },
    
    getContainer: function(type, pos, content, title, showExit, isModal) {
      
      var isModalClass = (isModal ? ' isModal' : '');
      var str = '<div id="overlayBox" tabindex="0" class="' + type + isModalClass + '" style="position:absolute; top:' + pos.top + 'px; left:' + pos.left + 'px;">';
      if (showExit != null && showExit || title != null) {
        str += '<div class="titleBar">';
        if (title != null) {
          str += '<div class="titleText">' + title + '</div>';
        }
        if (showExit != null && showExit) {
          str += '<span class="ui-button-icon-primary ui-icon ui-icon-closethick exitButton"></span>';
        }
        str += '</div>';
      }
      str += '<div class="overlayContent">';
      str += content;
      str += '</div>';
      str += '</div>';
      return str;
    },
    
    events: function(callbacks) {
      callbacks = callbacks || {};
      
      $('#overlayBox div.titleBar span.exitButton').click(function(e) {
        Overlay.close(null, callbacks.onClose);
      });
      $('#overlayBox').unbind('mouseenter');
      $('#overlayBox').unbind('mouseleave');
      $('#overlayBox').bind({
        'mouseenter': function() {
          Overlay.isHovered = true;         
        },
        'mouseleave': function() {
          Overlay.isHovered = false;          
        }
      });
    },
    
    loadCSS: function() {
      $("head").append("<link>");
      var css = $("head").children(":last");
      css.attr({
        rel:  "stylesheet",
        type: "text/css",
        href: "../common/css/overlay.css"
      });
    },
    
    close: function(type, closeFunction) {
      if (closeFunction != null) {
        closeFunction();
      }
      var selector = '#overlayBox'; 
      if (type != null) {
        selector += '.' + type;
      }
      $(selector).remove();
      Overlay.isHovered = false;      
    },    
    
    isHovered: false,
    
    setFocusForTextInput: function() {
      $('.textAreaInput').focus();
    },
    
    textInput: function(target, successFunction, type, value, offset, rows, cols, scrollParent, maxLen, errMsg, closeFunction, isDialogOverlay) {
      maxLen = (maxLen == null) ? 128 : maxLen;
      var str = '<textarea class="textAreaInput" lang="' + type + '" rows="' + rows + '" cols="' + cols + '" maxlength="'+ maxLen +'" id="textInputOverlay" >' + (value != null ? value : '') + '</textarea>';
      Overlay.show('textInput', target, offset, str, null, false, true, isDialogOverlay);
      setTimeout(Overlay.setFocusForTextInput, 50);
      $('.textAreaInput').bind({
        keydown: function(e) {
          Overlay.isTabPressed = (e.keyCode == 9 && !e.shiftKey);
          Overlay.isTabShiftPressed = (e.keyCode == 9 && e.shiftKey);
          if (e.keyCode == 9 || e.keyCode == 13) {
            e.preventDefault(); 
          }
        },
        keyup: function(e) {          
          if (e.keyCode == 16) {
            return;
          }
          if (e.keyCode == 37 || e.keyCode == 39) {
            e.stopPropagation();
          }
          else if (e.keyCode == 27) {           
            Overlay.close(null, closeFunction);
          } 
          else {          
            var curLength = $(e.target).val().length;
            if (curLength > maxLen && errMsg != null) {
                if (e.keyCode != 13 && e.keyCode != 8) {
                  var s = errMsg;
                  s = s.replace("[[max]]{0}", maxLen);
                  s = s.replace("[[current]]{0}", curLength);
                  Overlay.close(null, closeFunction);
                  MessageDisplay.error(s, $(e.target));
                }
            } else {              
              if (e.keyCode == 13 || Overlay.isTabPressed || Overlay.isTabShiftPressed) {            
                var value = $(e.target).val();
                var direction = Overlay.isTabShiftPressed ? 'left' : 'right';
                Overlay.close();
                if (successFunction != null) {                  
                  successFunction(value, direction);              
                }              
              }
              Overlay.isTabPressed = false;
              Overlay.isTabShiftPressed = false;
            }
          }
        },
        blur: function(e) {
           var curLength = $(e.target).val().length;
          if (curLength > maxLen) {
              var s = errMsg;
              s = s.replace("[[max]]{0}",maxLen);
              s = s.replace("[[current]]{0}",curLength);
              if (!MessageDisplay.isOpen()){
                Overlay.close(null, closeFunction);
                MessageDisplay.error(s,$(e.target));
              }
          } else { 
            if (successFunction != null) {              
              successFunction($(e.target).val());              
            }
            Overlay.close(null, closeFunction);        
            Overlay.isTabPressed = false;
            Overlay.isTabShiftPressed = false;
          }
        }
        
        
      });
      if (scrollParent != null) {
        $(scrollParent).unbind('.overlayScroll');
        $(scrollParent).bind('scroll.overlayScroll', function() {
          Overlay.close(null, closeFunction);
          $(scrollParent).unbind('.overlayScroll');
        });
      }
    },
    
    eof: 0
  };
  
}) ();