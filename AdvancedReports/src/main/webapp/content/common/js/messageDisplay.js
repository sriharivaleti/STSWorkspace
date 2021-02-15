/* globals Content */

var MessageDisplay = (function() {
  "use strict";
  
  return {

    _numOpenDisplay: 0,
  
    message: function(message, onClose) {
      var msgDisplay = $(MessageDisplay.getContent(message));
      var options = {
        close: function(event, ui) {
          $(this).remove();
          if (onClose != null) {
            onClose();
          }
        },
        autoOpen: false,
        resizable: false,
        modal: true,
        buttons: {    }
      };
      options.buttons['OK'] = {
        text: Content.general.okString,
        'class': 'btn-primary',
        click: function () {
          MessageDisplay._closeDisplay(msgDisplay);
        }
      };
      msgDisplay.dialog(options);
      MessageDisplay._openDisplay(msgDisplay);
    },

    error: function(message,focusObj) {
      focusObj = (focusObj == null) ? null : focusObj;
      var errorDisplay = $(MessageDisplay.getContent(message));
      var options = {
        close: function(event, ui) { $(this).remove(); },
        autoOpen: false,
        width: 350,
        resizable: false,
        modal: true,
        title: Content.general.errorString,
        buttons: {
          "OK": {
            click: function () {
              MessageDisplay._closeDisplay(errorDisplay);
              if (focusObj != null) { $(focusObj).focus(); }
            },
            text: Content.general.okString,
            'class': 'btn-primary'
          }
        }
      };
      errorDisplay.dialog(options);
      MessageDisplay._openDisplay(errorDisplay);
    },

    confirm: function(message, successFunction, params, additionalContent, cancelFunction, cancelParams, prevDialog) {

      var confirmDisplay = $(MessageDisplay.getContent(message, additionalContent));
      var options = {
        close: function(event, ui) {
          $(this).remove();
          if(prevDialog != null) {
            prevDialog.dialog('widget').focus();
          }
        },
        width: 350,
        autoOpen: false,
        resizable: false,
        modal: true,
        title: Content.general.confirmString,
        buttons: {
          "Cancel": {
            click: function () {
              MessageDisplay._closeDisplay(confirmDisplay);
              if (cancelFunction != null) {
                cancelFunction.apply(null, cancelParams);
              }
            },
            text: Content.general.cancelString,
          },
          "OK": {
            click: function () {
              if (successFunction != null) {
                var paramValue = params != null ? params : null;
                var additionalContentValue = additionalContent != null ? MessageDisplay.getControlValues() : null;
                MessageDisplay._closeDisplay(confirmDisplay);
                successFunction(paramValue, additionalContentValue);
              }
              else {
                MessageDisplay._closeDisplay(confirmDisplay);
              }
            },
            text: Content.general.okString,
            'class': 'btn-primary'
          },
        },
        open: function(event, ui) {
          $(this).parent().find(".btn-primary").focus();
        },
      };
     
      $([document, window]).unbind('.dialog-overlay');
      confirmDisplay.dialog(options);
      MessageDisplay._openDisplay(confirmDisplay);
    },

    getControlValues: function() {
      var obj = {};
      $('div.messageControls input[type="text"], div.messageControls textarea').each(function(i, o) {
        obj[$(o).attr('name')] = $(o).val();
      });
      return obj;
    },

    getContent: function(message, additionalContent) {
      var str = '<div id="Fields">';
      if (additionalContent != null) {
        str += '<div class="messageControls">';
        str += additionalContent;
        str += '</div>';
      }
      str += '<div class="messageContent">';

      str += message;
      str += '</div>';
      str += '</div>';
      return str;
    },
    
    isOpen: function(){
      return MessageDisplay._numOpenDisplay > 0? true : false;
    },
    
    _openDisplay: function(displayElement){
      MessageDisplay._numOpenDisplay +=1;
      $(displayElement).dialog('open');
    },
    
    _closeDisplay: function(displayElement){
      if (MessageDisplay._numOpenDisplay > 0){
        MessageDisplay._numOpenDisplay -= 1;
      } else {
        MessageDisplay._numOpenDisplay = 0;
      }
      $(displayElement).dialog('close');
    }
  };

})();
