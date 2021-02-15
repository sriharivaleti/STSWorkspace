/* globals Global, MessageDisplay, Content */

(function($){
  "use strict";
  
  $.ajaxSetup({

    cache: false,
    contentType : 'application/json',
    dataType : 'json',
    error : function(xhr, ajaxOptions, thrownError) {
      if (ajaxOptions != "abort") {
        $.displayError(xhr);
      }
      Global.hideLoading();
    }
  });

  $.getJSON = function(url, data, success, error, dontEscape) {

    $.clearError();

    var options = {
      type : 'GET',
      url : escape(url),
      data : data || JSON.stringify(data)
    };
    if (dontEscape) {
      options.url = url;
    }
    if (success) {
      options.success = success;
    }
    if (error) {
      options.error = function(xhr, ajaxOptions, thrownError) {
        error(xhr, ajaxOptions, thrownError);
        Global.hideLoading();
      };
    }
    return $.ajax(options);
  };

  $.postJSON = function(url, data, success, error, dontEscape) {

    $.clearError();

    var options = {
      type : 'POST',
      url : escape(url),
      data : JSON.stringify(data)
    };
    if (dontEscape) {
      options.url = url;
    }
    if (success) {
      options.success = success;
    }
    if (error) {
      options.error = function(xhr, ajaxOptions, thrownError) {
        error(xhr, ajaxOptions, thrownError);
        Global.hideLoading();
      };
    }
    return $.ajax(options);
  };

  $.putJSON = function(url, data, success, error, dontEscape) {

    $.clearError();

    var options = {
      type : 'PUT',
      url : escape(url),
      data : JSON.stringify(data)
    };
    if (dontEscape) {
      options.url = url;
    }
    if (success) {
      options.success = success;
    }
    if (error) {
      options.error = function(xhr, ajaxOptions, thrownError) {
        error(xhr, ajaxOptions, thrownError);
        Global.hideLoading();
      };
    }
    return $.ajax(options);
  };

  $.deleteJSON = function(url, data, success, error, dontEscape) {

    $.clearError();

    var options = {
      type : 'DELETE',
      url : escape(url),
      data : JSON.stringify(data)
    };
    if (dontEscape) {
      options.url = url;
    }
    if (success) {
      options.success = success;
    }
    if (error) {
      options.error = function(xhr, ajaxOptions, thrownError) {
        error(xhr, ajaxOptions, thrownError);
        Global.hideLoading();
      };
    }
    return $.ajax(options);
  };

  $.clearError = function() {
    $('#systemError').html("").hide();
  };

  var showStackTrace = false;
  $.displayError = function(xhr) {
    if (showStackTrace) {
      var x = '';
      x+= 'System Error ' + xhr.status + ' has occurred.';
      x+= '<br><br>';
      x+= xhr.statusText;
      x+= '<br><br>';
      x+= '<div class="msg">';
      x+= xhr.responseText;
      x+= '</div>';
      $('#systemError').html(x).show();
    }
    else {
      try {
        var data = $.parseJSON(xhr.responseText);
        MessageDisplay.error(data.message);
      }
      catch(e) {
        MessageDisplay.error(Content.general.errorString);
      }
    }
  };
  
}(jQuery));

