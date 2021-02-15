/* globals ServerVars, Content */
//# sourceURL=PortletContainer
var PortletContainer = (function() {
  "use strict";

  return {

    init: function() {
      $('#homeContent').html('<div class=""></div>');
    },
    
    adjustHeightInterval: null,

    getIframe: function(urlOverride) {
      var str = '';
      str += '<iframe marginheight="0" marginwidth="0" frameborder="0" onload="PortletContainer.adjustHeight()" id="portletContainer" src="';
      if (urlOverride != null) {
        str += urlOverride;
      }
      else {
        str += PortletContainer.getUrl();
      }

      str += '" width="100%" height="500" ></iframe>';
      if (PortletContainer.adjustHeightInterval == null) {
        PortletContainer.adjustHeightInterval = setInterval(PortletContainer.adjustHeight, 2000);
      }
      return str;
    },

    adjustHeight: function() {
      var parentHeight = ($("#portletContainer").height()) > 500 ? ($("#portletContainer").height()) : 500;
      $("#portletContainer").parent().css('height', parentHeight);
      $("#portletContainer").attr('height', parentHeight + "px");
    },


    hasPortletContainer: function() {
      return ($('#globalContent iframe#portletContainer').length > 0);
    },

    getUrl: function() {
      // Get URL according to module
      PortletContainer.temp = ServerVars.module.value;
      var url = "/wfm/security/tpi/login/?module="+ServerVars.module.value;

      return url;
    },

    temp: null,


    eof: 0

  };

}) ();