/* globals Navigation, CMS, locale, Content, ServerVars, Dates, ScreenPrefs, MessageDisplay, PortletContainer, Paging, escape, unescape */
//# sourceURL=Global

var Global = (function() {
  "use strict";

  return {
    init : function() {
      if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
          position = position || 0;
          return this.indexOf(searchString, position) === position;
        };
      }
          
      if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
          'use strict';
          if (typeof start !== 'number') {
            start = 0;
          }

          if (start + search.length > this.length) {
            return false;
          } else {
            return this.indexOf(search, start) !== -1;
          }
        };
      }

      Global.set();
      Navigation.init();
      CMS.init();
    },

    localize: function() {
      $('td.localize, th.localize, option.localize, dt.localize, span.localize, label.localize, div.localize, li.localize').each(function(i,o) {
        $(o).html(locale[$(o).attr('lang')]);
      });
      $('td.localize_date, th.localize_date, option.localize_date, dt.localize_date, span.localize_date, label.localize_date, div.localize_date, li.localize_date').each(function(i,o) {
        $(o).html(Content.dates[$(o).attr('lang')]);
      });
      $('input[type="button"].localize').each(function(i,o) {
        $(o).val(locale[$(o).attr('lang')]);
      });
      $('button.localize').each(function(i,o){
        $(o).text(locale[$(o).attr('lang')]);
      });
      //$('#loadingDiv').html(locale.loading);
    },

    toCamelCase: function(str){
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    },

    formatTooltips : function(){
      $('.formatTooltip').each(function(i,o){
        $(o).attr('title', Global.toCamelCase($(o).attr('title')));
      });
    },

    jsonObjectsEqual: function(obj1, obj2, propertyExcludes) {
      var isEqual = true;
      for (var baseKey in obj1) {
        if (propertyExcludes != null && jQuery.inArray(baseKey, propertyExcludes) >= 0) {
          continue;
        }
        if (obj1.hasOwnProperty(baseKey)) {
            if ((typeof obj1[baseKey]) == 'object') {
              isEqual = Global.jsonObjectsEqual(obj1[baseKey], obj2[baseKey]);
            }
            else {
              isEqual = obj1[baseKey] === obj2[baseKey];
            }
        }
        if (!isEqual) {
          break;
        }
      }
      if (isEqual) {
        for (var baseKey in obj2) {
          if (propertyExcludes != null && jQuery.inArray(baseKey, propertyExcludes) >= 0) {
            continue;
          }
          if (obj2.hasOwnProperty(baseKey)) {
              if ((typeof obj2[baseKey]) == 'object') {
                isEqual = Global.jsonObjectsEqual(obj2[baseKey], obj1[baseKey]);
              }
              else {
                isEqual = obj1[baseKey] === obj2[baseKey];
              }
          }
          if (!isEqual) {
            break;
          }
        }
      }

      return isEqual;
    },

    set : function() {
      $("#globalUser").append(ServerVars.clientName);
      $("#globalUser").append(" - ");
      $("#globalUser").append(ServerVars.userId);

      $("#breadCrumbs dt").html( Dates.format( new Date(), Content.general.dFTypes[6]+", "+Content.general.dFTypes[16] ) + " ~ " );
      Global.setTime();
      setInterval(Global.setTime, 15000);

      $("#footerNav .ver").text(ServerVars.version);
      $("#footerNav .ver").attr('title', ServerVars.versionFull);

      Global.loadBranding();
      $("#copyright").text(ServerVars.copyright.replace('{0}', new Date().getFullYear()));
    },

    loadBranding: function(){
      $('.globalLogo').css('background-image', 'url("' + ServerVars.branding.logo + '")');
    },

    setTime : function() {
      $("#breadCrumbs dd").html( Dates.format( new Date(), Content.general.dFTypes[5] ) );
      if ( $('#gadgetWC') ) {

        $('#gadgetWCTime .time').text( $('#breadCrumbs .r dd').text().split(" ")[0] );
        $('#gadgetWCTime .mer').text( $('#breadCrumbs .r dd').text().split(" ")[1] );
      }
    },

    keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    encode64: function(input) {
      input = escape(input);
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
                 Global.keyStr.charAt(enc1) +
                 Global.keyStr.charAt(enc2) +
                 Global.keyStr.charAt(enc3) +
                 Global.keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },

    decode64: function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {

      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = Global.keyStr.indexOf(input.charAt(i++));
        enc2 = Global.keyStr.indexOf(input.charAt(i++));
        enc3 = Global.keyStr.indexOf(input.charAt(i++));
        enc4 = Global.keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return unescape(output);
    },

    mainContainer: '#mainContainer',

    showLoading: function() {
      $('#loadingDiv').html('');
      Global.toggleElements('#loadingDiv', Global.mainContainer);
    },

    toggleElements: function(elementToShow, elementToHide) {
      $(elementToHide).stop().hide();
      if ($(elementToShow).is(':hidden')) {
        $(elementToShow).stop().fadeTo(500,1);
      }
    },

    toggleLoadingCursor: function(isLoading) {
      if (isLoading){
        $('body').css('cursor', 'progress');
      } else {
        $('body').css('cursor', 'default');
      }
    },

    hideLoading: function() {
      Global.toggleElements(Global.mainContainer, '#loadingDiv');
    },

    cleanText:function(str) {
      str = str.toString();
      return str.replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;');
    },

    postHelpMessageToPortal: function () {
      if (ServerVars.portalIntegrated === '1') {
        var help = {
            pillarKey: "WFM",
            action: "LAUNCH_HELP",
            parameters: {helpUrl: '/wfm/help'}
          };

        window.top.postMessage(JSON.stringify(help), "*");
      }
    }
  };
})();

CMS = (function() {
  "use strict";

  return {

    init : function() {
      CMS.setText();
    },

    setText : function() {

      $("#utilNav .home").text(Content.homeModuleName);
      $("#utilNav .menu").text(Content.menuModuleName);
      $("#utilNav .help").text(Content.helpModuleName);
      $("#utilNav .signOut").text(Content.utilNavSignOut);

    }
  };
})();

Navigation = (function() {
  "use strict";

  return {
    changedData: false,
    currentScreen: null,
    confirmParams: null,

    init : function() {
      Navigation.loadLinkMapping();
      Navigation.setSection();
      if (ServerVars.embedPage == 'true') {
        $('.globalHeader').remove();
        $('#menuTabs').remove();
        $('#menuSubNav').remove();
        $('#breadCrumbs').remove();
        $('.globalFooter').remove();
        $('#copyright').remove();

      }
      else {
        Navigation.renderNavigation(false);
      }
    },

    renderNavigation: function(reloadLinkMapping) {
      if (reloadLinkMapping) {
        $.getJSON('/wfm/admin/resourceLinkManager/rootLink', {}, function(json) {
          ServerVars.appContext.rootLink.links = json.links;
          Navigation.loadLinkMapping();
          Navigation.buildHeader();
          Navigation.events();
          Navigation.setTab();
        });
      }
      else {
        Navigation.buildHeader();
        Navigation.events();
        Navigation.setTab();
      }
    },

    addTitleBar: function(link) {
      var str = '<h2 class="addedTitle">';
      str += link.name;
      str += '</h2>';
      $('#globalContent').before(str);
    },

    addTitleBarDesc: function(link) {
      var str = '<h3 class="addedTitleDesc">';
      str += link.description;
      str += '</h3>';
      $('#globalContent').before(str);
    },

    loadLinkMapping: function() {
      var json  = { modules: ServerVars.appContext.rootLink.links};
      Navigation.linkMapping = json;
    },

    tempMapping: null,
    linkMapping: null,

    setSection : function() {
      $(Navigation.linkMapping.modules).each(function(i, o) {
        if (ServerVars.servlet.indexOf('/' + o.id + '/') > -1 ) {
          ServerVars.module.value = o.id;
          ServerVars.module.show = (o.links != null && o.links.length > 0);
          return false;
        }
      });
    },

    buildHeader: function() {
      $('.globalContainer #menuTabs div.ulContainer ul li').remove();
      var headerStr = '';
      var footerStr = '';
      $(Navigation.linkMapping.modules).each(function(i, o) {
        var isFirst = (i === 0) ? ' isFirst' : '';
        var url = o.url;
        headerStr += '<li class="dynamic" lang="' + o.id + '"><a href="' + url + '"><div class="borderWrap' + isFirst + '"><span class="' + o.id + '">' + o.name + '</span></div></a></li>';
        footerStr += '<li lang="' + o.id + '"><a href="' + url + '" lang="' + o.id + '"><span class="' + o.id + '">' + o.name + '</span></a></li>';
        if (i < Navigation.linkMapping.modules.length - 1) {
          footerStr += '<li class="sep">::</li>';
        }
      });
      headerStr += '<li><a href="javascript:void(0)" class="void"></a></li>';
      $('.globalContainer #menuTabs div.ulContainer ul').html(headerStr);
      $('.globalContainer #footerNav ul').html(footerStr);
      $('.globalContainer #menuTabs div.ulContainer ul li a').click(function() { $(this).attr('href', Navigation.loadQueryString($(this).attr('href')));});
      if (ServerVars.date !== '' && ServerVars.date !== 'null') {
        ServerVars.date = Dates.object(Dates.convertStringToDateArray(ServerVars.date,Content.general.dFTypes[0]));
      }
      if (ServerVars.startDate !== '' && ServerVars.startDate !== 'null') {
        ServerVars.startDate = Dates.object(Dates.convertStringToDateArray(ServerVars.startDate,Content.general.dFTypes[0]));
      }
      if (ServerVars.endDate !== '' && ServerVars.endDate !== 'null') {
        ServerVars.endDate = Dates.object(Dates.convertStringToDateArray(ServerVars.endDate,Content.general.dFTypes[0]));
      }
    },

    loadQueryString: function(link) {
      var hash = '';
      if (link.indexOf('#') != -1) {
        hash = link.substr(link.indexOf('#'));
      }
      if (hash.length > 0) {
        link = link.substring(0, link.indexOf('#'));
      }
      var queryString = '';
      if (link.indexOf('?') != -1) {
        queryString = link.substr(link.indexOf('?'));
      }
      if (queryString.length > 0) {
        link = link.substring(0, link.indexOf('?'));
      }

      /*
       * We used to append additional parameters to query string as a way
       * to pass properties from one /wfm module to another. This
       * mechanism for passing properties works OK when the /wfm
       * application is running in stand-alone mode, but does not work at
       * all when /wfm application running in portal mode. We now prefer
       * to store these properties in the user http session (via propstore
       * class) as this makes for an overall better user experience
       * especially when /wfm app pages are requested via the sumtotal
       * portal.
       */

      return link + queryString + hash;
    },

    addToQueryString: function(queryString, key, value) {
      if (queryString == null) {
        queryString = '';
      }
      if (queryString.indexOf(key + '=') === 0 ||
        queryString.indexOf('&' + key + '=') >= 0 ||
        queryString.indexOf('?' + key + '=') >= 0 ) {
        return queryString;
      }
      if (queryString.indexOf('?') == -1) {
          queryString = '?' + queryString;
      }
      if (queryString.length > 1) {
        queryString += '&';
      }
      queryString += key + '=' + value;
      return queryString;
    },

    setTab : function() {
      if (!ServerVars.module.show) {
        $("#menuSubNav").hide();
      }

      $("#menuTabs span[class='" + ServerVars.module.value + "']").parent().parent().addClass("sel");

      if (ServerVars.module.show) {
        Navigation.buildSubNav();
      }
    },


    events : function() {
      $('#menuTabs .ulContainer li a, #utilNav ul li.lastItem a').click(function(e){
        e.preventDefault();
        var targetUrl = $(this).attr("href");
        if(ScreenPrefs.ShowUnsavedWarning && Navigation.changedData == true){
            MessageDisplay.confirm(Content.general.alertConfirmDiscardChanges, function(){
              //default action
              Navigation.setChangedData(false);
              window.location.href = targetUrl;
            }, null, null, function(){
               //close dialog and stay on screen
            });
        }
        else{
          //default action
          window.location.href = targetUrl;
        }
      });

      $("#utilNav .help").click(function() {
        window.open('/wfm/help','','scrollbars=yes,status=no,resizable=yes,width=750,height=500',true);
      });
    },

    getModuleData: function(id) {
      var moduleData = null;
      $(Navigation.linkMapping.modules).each(function(i, o) {
        if (o.id == id) {
          moduleData = o;
          return false;
        }
      });
      return moduleData;
    },

    getLinkData: function(id, moduleId) {
      var linkData = null;
      var moduleData = Navigation.getModuleData(moduleId);
      $(moduleData.links).each(function(i, o) {
        if (o.id == id) {
          linkData = o;
          return false;
        }
      });
      if ( linkData == null ) {
        //linkData = moduleData;
        //alert("Link not found: "+moduleId+"/"+id)
      }
      return linkData;
    },

    buildModuleBreadCrumbs: function(module, link) {
      var homeModule = Navigation.getModuleData('home');

      $("#breadCrumbs span._1").html('&nbsp;/&nbsp;');
      $("#breadCrumbs span._h").html( homeModule.name.toLowerCase() );
      $("#breadCrumbs span._h").attr( 'id', homeModule.id );

      $("#breadCrumbs span._2").html('&nbsp;/&nbsp;');
      $("#breadCrumbs span._m").html( module.name.toLowerCase() );
      $("#breadCrumbs span._m").attr( 'id', module.id );

      if ( link ) {
        $("#breadCrumbs span._3").html('&nbsp;/&nbsp;');
        $("#breadCrumbs span._c").html( link.name );
        $("#breadCrumbs span._c").addClass('active');
        $("#breadCrumbs span._c").attr( 'id', link.id );
      }

      if (!ServerVars.module.show) {
        $("#breadCrumbs span._2").html('');
        $("#breadCrumbs span._m").html('');
      }

      $("#breadCrumbs span._h")
        .hover(
          function () { $(this).addClass("hov"); },
          function () { $(this).removeClass("hov"); }
        )
        .click(function() {
          location.href=homeModule.url;
        }
      );

      $("#breadCrumbs span._m")
        .hover(
          function () { $(this).addClass("hov"); },
          function () { $(this).removeClass("hov"); }
        )
        .click(function() {
          location.href= ( module.url );
        }
      );
    },

    buildSubNav : function() {
      var x = '<ul>';

      var moduleData = Navigation.getModuleData(ServerVars.module.value);
      $(moduleData.links).each(function(i, o) {
        if ( i > 0 ) {
          x += '<li class="sep">|</li>';
        }
        x += '<li class="' + o.id + '" lang="' + o.id + '" name="' + moduleData.id + '">' + o.name + '</li>';
      });

      x += '</ul>';

      $("#menuSubNav").html(x);

      $("#menuSubNav li, .moduleLinkMask").not('.sep').off().on({
        click: function() {
          if (Navigation.onClickMenuSubNav) {
            Navigation.onClickMenuSubNav();
            delete Navigation.onClickMenuSubNav;
          }

          var link = Navigation.getLinkData($(this).attr('lang'), $(this).attr('name'));
          var module = Navigation.getModuleData($(this).attr('name'));

          AjaxLoader.redirectOrLoad(link, module);
        },
        mouseenter: function() {
          $( this ).addClass('hov');
        },
        mouseleave: function() {
          $( this ).removeClass('hov');
        }
      });

      $("#menuSubNav").show();
    },

    buildBreadCrumbs : function(_c) {
      var homeModule = Navigation.getModuleData('home');
      var _m = Content[ServerVars.module.value + "ModuleName"];
      _m = ( _c ) ? _m.toLowerCase() : _m;

      $("#breadCrumbs span._1").html('&nbsp;/&nbsp;');
      $("#breadCrumbs span._h").html( homeModule.name.toLowerCase() );

      $("#breadCrumbs span._2").html('&nbsp;/&nbsp;');
      $("#breadCrumbs span._m").html( _m );

      if ( _c ) {
        $("#breadCrumbs span._3").html('&nbsp;/&nbsp;');
        $("#breadCrumbs span._c").html( _c );
      }

      if (!ServerVars.module.show) {
        $("#breadCrumbs span._2").html('');
        $("#breadCrumbs span._m").html('');
      }

      $("#breadCrumbs span._h")
        .hover(
          function () { $(this).addClass("hov"); },
          function () { $(this).removeClass("hov"); }
        )
        .click(function() {
          location.href='/wfm/home';
        }
      );

      $("#breadCrumbs span._m")
        .hover(
          function () { $(this).addClass("hov"); },
          function () { $(this).removeClass("hov"); }
        )
        .click(function() {
          location.href= ( '/wfm/' + ServerVars.module.value );
        }
      );
    },

    getQueryParams: function() {
      var queryParams = {};
      // MySideNOTE: do not use unescape() for URI, use decodeURI()
      var urlParams = decodeURI( window.location.search.substring(1) );
      // if no querystring, return null
      if(urlParams == false | urlParams == ''){
        return queryParams;
      }
      // get key/value pairs
      var pairs = urlParams.split("&");

      for (var i = 0; i < pairs.length; i++) {
        var value = pairs[i];
        var equalsignPosition = value.indexOf("=");
        if (equalsignPosition != -1) {
          var splitValue = value.split('=');
          queryParams[splitValue[0]] = splitValue[1];
        }// in case there's only the key, e.g: http://7php.com/?niche
      }
      return queryParams;
    },

    navigateToModule: function(link, module, queryOptions, anchorObj) {
      if(ScreenPrefs.ShowUnsavedWarning && Navigation.changedData == true) {
        if(ServerVars.portalIntegrated === '1') {
          var url = Navigation.getUrl(link, module, queryOptions, true);
          var message = {action:"PROMPT_UNSAVED_WARNING", pillarKey:"WFM", parameters:{navigateUrl:url}};
          window.top.postMessage(JSON.stringify(message), "*");
        }
        else {
          MessageDisplay.confirm(Content.general.alertConfirmDiscardChanges, function() {
            Navigation.setChangedData(false);
            Navigation.loadModule(link, module, queryOptions, anchorObj);
          });
        }
      }
      else{
        Navigation.loadModule(link, module, queryOptions, anchorObj);
      }
    },

    loadModule: function(link, module, queryOptions, anchorObj) {
      var url = Navigation.getUrl(link, module, queryOptions);
      if(anchorObj) {
        $(anchorObj).attr('href', url);
      }
      else {
        window.location.href = url;
      }
    },

    getUrl: function(link, module, queryOptions, targetPageParam) {
      var queryString = '';
      if(targetPageParam) {
        queryOptions = queryOptions || {};
        queryOptions.targetPage = link.id;
      }
      $.each(queryOptions, function(key, value) {
        if(value instanceof Date){
          value = Dates.format(value,Content.general.dFTypes[0]);
        }
        queryString = Navigation.addToQueryString(queryString, key, escape(value));
      });
      var linkHash = (targetPageParam) ? '' : '#' + link.id;
      var url = module.url + '/' + queryString + linkHash;
      url = Navigation.loadQueryString(url);
      return url;
    },

    setChangedData: function(isChange) {
      if(Navigation.changedData != isChange) {
        Navigation.changedData = isChange;
        if(ServerVars.portalIntegrated === '1' && ScreenPrefs.ShowUnsavedWarning) {
          var message = {action:"UPDATE_UNSAVED_WARNING_STATUS", pillarKey:"WFM", parameters:{showUnsavedWarning:Navigation.changedData}};
          window.top.postMessage(JSON.stringify(message), "*");
        }
      }
    },

    confirmIfChangesMade: function(onConfirmFunction, params, cancelFunction, cancelParams) {
      if (Navigation.changedData && ScreenPrefs.ShowUnsavedWarning) {
        MessageDisplay.confirm(Content.general.alertConfirmDiscardChanges, onConfirmFunction, params, null, cancelFunction, cancelParams);
      }
      else {
        onConfirmFunction(params);
      }
    },
  };
})();

AjaxLoader = (function() {
  "use strict";

  return {
    init : function() {
      AjaxLoader.checkHash();
    },

    get : function(o) {
      o = $(o);
      var x = o.attr('lang');
      this.load(x);
    },

    refresh : function(str) {
      this.load(str);
    },

    checkHash: function() {
      var hash = window.location.hash;
      if (hash !== '') {
        var module = Navigation.getModuleData(ServerVars.module.value);
        var link = Navigation.getLinkData(hash.replace('#', ''), ServerVars.module.value);
        AjaxLoader.redirectOrLoad(link, module);
        // AjaxLoader.load(hash.replace('#', ''))
      } else {
        var url = 'home/index.htm';
        $("#globalContent").hide().load(url, function() {
          $(this).fadeIn();
        });
      }
    },

    redirectOrLoad: function(link, module) {
      if(ScreenPrefs.ShowUnsavedWarning && Navigation.changedData == true){
        if(ServerVars.portalIntegrated === '1') {
          var queryOptions = Navigation.getQueryParams();
          var url = Navigation.getUrl(link, module, queryOptions, true);
          var message = {action:"PROMPT_UNSAVED_WARNING", pillarKey:"WFM", parameters:{navigateUrl:url}};
          window.top.postMessage(JSON.stringify(message), "*");
        }
        else {
          MessageDisplay.confirm(Content.general.alertConfirmDiscardChanges, function(){
            Navigation.setChangedData(false);
            AjaxLoader.loadScreen(link, module);
          });
        }
      }
      else{
        AjaxLoader.loadScreen(link, module);
      }
    },

    loadScreen: function(link, module) {
      var url = link.url.trim();

      var dispatchMode = false;
      var ssoMode = false;
      var windowMode = false;
      var iframeMode = false;
      while (true) {
        if ( url.startsWith("window:") ) {
          url = url.substr('window:'.length).trim();
          windowMode = true;
          iframeMode = false;
        } else if ( url.startsWith("iframe:") ) {
          url = url.substr('iframe:'.length).trim();
          if ( !windowMode ) {
            iframeMode = true;
          }
        } else if ( url.startsWith("sso:") ) {
          url = url.substr('sso:'.length).trim();
          ssoMode = true;
        } else {
          break;
        }
      }

      if ( !dispatchMode && url.startsWith('/wfm/dispatch') ) {
        dispatchMode = true;
        ssoMode = false;
      } else if ( !ssoMode && url.startsWith('/wfm/sso') ) {
        ssoMode = true;
        dispatchMode = false;
      } else if ( ssoMode && url.startsWith('http') ) {
          ssoMode = false;
      } else if ( !ssoMode && !dispatchMode && !url.startsWith('http') && !url.startsWith('/wfm') ) {
          ssoMode = true;
      }

      if ( dispatchMode && ssoMode ) {
        alert('Illegal state: dispatch and sso modes cannot both be enabled');
        return;
      } else if ( dispatchMode && !url.startsWith('/wfm/dispatch') ) {
        url = "/wfm/dispatch?target=" + url
      } else if ( ssoMode && !url.startsWith('/wfm/sso') ) {
        url = '/wfm/sso?target=' + encodeURIComponent(url);
      }

      if ( !windowMode && !iframeMode && ( url.startsWith('http') || ssoMode) ) {
        iframeMode = true;
      }

      if ( windowMode && iframeMode ) {
        alert('Illegal state: window and iframe modes cannot both be enabled');
        return;
      }

      //alert("link.url="+link.url+"\n"+"url="+url+"\n"+"iframeMode="+iframeMode+"\n"+"windowMode="+windowMode+"\n"+"dispatchMode="+dispatchMode)
      if ( windowMode ) {
        if ( dispatchMode ) {
          url = Navigation.loadQueryString(url);
        }
        window.open(url);
        return;
      }

      $("#globalContent").hide();
      $("h2.addedTitle").remove();
      $("h3.addedTitleDesc").remove();
      $("body>.ui-dialog").remove();
      $("body>div#Fields").remove();
      $("body>div.isDialog").remove();
      $("#globalContent").css('height','');
      Navigation.currentScreen = link.key;
      if (module == null) {
        module = Navigation.getModuleData(ServerVars.module.value);
      }
      //alert("link.url="+link.url+"\n"+"url="+url+"\n"+"iframeMode="+iframeMode+"\n"+"dispatchMode="+dispatchMode)

      if ( !iframeMode ) {
        Paging.getPagingPref(Navigation.currentScreen, function() {
            $("#globalContent").load(url, function() {
              $(this).fadeIn();
            });
          });
      } else {
        if ( dispatchMode ) {
          url = Navigation.loadQueryString(url);
        }
        //alert("link.url="+link.url+"\n"+"url="+url)
        $("#globalContent").hide().html(PortletContainer.getIframe(url)).fadeIn();
      }

      window.location.hash = link.id;
      Navigation.buildModuleBreadCrumbs(module, link);
      if (ServerVars.embedPage == 'true') {
        Navigation.addTitleBar(link);
        Navigation.addTitleBarDesc(link);
      }
    },

    iframeFixInterval: null,

    iframeFixIntervalTimer: 2000,

    fixIframe: function() {
      if ($('iframe#portletContainer').css('position') == 'absolute') {
        $('iframe#portletContainer').css('position', '');
        $('iframe#portletContainer').css('top', '');
        $('iframe#portletContainer').css('left', '');
        $('iframe#portletContainer').css('width', '');
        $('iframe#portletContainer').css('height', '');
      }
      if (AjaxLoader.iframeFixInterval == null) {
        //AjaxLoader.iframeFixInterval = setInterval(AjaxLoader.fixIframe, AjaxLoader.iframeFixIntervalTimer);
      }
    },

    load : function(x) {
      if(x=="") {
        $('#systemError').html('Invalid target parameter.').show();
        return;
      }

      $.clearError();

      var screenName = x;
      if (screenName.indexOf('?') != -1) {
        screenName = screenName.substr(0, screenName.indexOf('?'));
      }

      Navigation.buildBreadCrumbs( Content[ screenName + "Name"] );

      this.url = ServerVars.contextPath + "/" + ServerVars.module.value + "/" + x + "/";

      if ( ServerVars.module.value == "analytics" ) {
        this.url += "index.htm";
      }

      // Clears the additional Dialogs that are loaded into the body because of
      // jquery
      // $("div.ui-dialog, #Fields").remove();
      $("body>.ui-dialog").remove();
      $("body>div#Fields").remove();
      $("body>div.isDialog").remove();
      // AjaxLoader.getQueryParams();
      // ServerVars.loadServerVarsFromQueryString();


      $("#globalContent").hide().load(this.url).fadeIn();

      window.location.hash = x;

      // window.scrollTo(0,174)
    }
  };
})();

/* Disable selection of text on selected elements */
(function($){
  "use strict";

  $.fn.disableSelection = function() {
      return this.each(function() {
          $(this).attr('unselectable', 'on')
                 .css({
                     '-moz-user-select':'none',
                     '-webkit-user-select':'none',
                     'user-select':'none',
                     '-ms-user-select':'none'
                 })
                 .each(function() {
                     this.onselectstart = function() { return false; };
                 });
      });
  };

  $.fn.enableSelection = function() {
    return this.each(function() {
        $(this).removeAttr('unselectable')
               .css({
                   '-moz-user-select':'',
                   '-webkit-user-select':'',
                   'user-select':'',
                   '-ms-user-select':''
               })
               .each(function() {
                   this.onselectstart = function() {  };
               });
    });
};

})(jQuery);
