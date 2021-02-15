//# sourceURL=Tabs
/* globals Global */

var Tabs = (function($) {
  "use strict";
  
  var tabs = function(options) {
    this.attributes = $.extend(true, {}, this.defaultOptions);
    $.extend(true, this.attributes, options);
    
    this.setUp();
  };
  
  tabs.TAB_STYLES = {
    PILL: 'tab-pill',
    STACKED: 'tab-stacked',
    JUSTIFIED: 'tab-justified'
  };
  
  tabs.prototype = {
  
    constructor: tabs,
    
    defaultOptions: {
      tabStyle: tabs.TAB_STYLES.PILL,
      tabs: [],
      activeTabIndex: 0,
      tabContainer: '#mainContainer',
    },
    
    setUp: function() {
      var tabStyle = this.attributes.tabStyle;
      var htmlStr = '';
      htmlStr += '<div id="navTabContainer" class="' + this.attributes.tabStyle +  '">';
      htmlStr += '<div id="tabNav"></div>';
      if (tabStyle === tabs.TAB_STYLES.STACKED) {
        htmlStr += '<div id="tabNavContentSeparator"></div>';
      }
      htmlStr += '<div id="tabContent"></div>';
      htmlStr += '<div class="loadingDiv"></div>';
      htmlStr += '</div>';
      $(this.attributes.tabContainer).html(htmlStr);
      
      this.render();
    },
    
    render: function() {
      this.renderNav();
      this.renderTabContent();
      
      this.events();
    },
    
    renderNav: function() {
      var navListClass = 'tabs nav ';
      var tabStyle = this.attributes.tabStyle;
      if (tabStyle === tabs.TAB_STYLES.PILL) {
        navListClass += ' nav-pills ';
      }
      else if (tabStyle === tabs.TAB_STYLES.STACKED) {
        navListClass += ' nav-pills nav-stacked ';
      }
      else if (tabStyle === tabs.TAB_STYLES.JUSTIFIED) {
        navListClass += ' nav-tabs nav-justified ';
      }
      
      var htmlStr = '';
      htmlStr += '<ul class="' + navListClass + '">';
      htmlStr += this.renderNavTabs(this.attributes.tabs);
      htmlStr += '</ul>';
      
      $(this.attributes.tabContainer).find('#tabNav').html(htmlStr);
    },
    
    renderNavTabs: function(tabs) {
      var htmlStr = '';
      $.each(tabs, function(i, tab) {
        var id = tab.tabId || '';
        var tabClass = 'tab ';
        if (i === this.attributes.activeTabIndex) {
          tabClass += ' active ';
        }
        htmlStr += '<li id="' + id + '" class="' + tabClass + '" role="presentation">';
        htmlStr += '<a href="#">';
        htmlStr += tab.tabLabel;
        htmlStr += '</a>';
        htmlStr += '</li>';
      }.bind(this));
      return htmlStr;
    },
    
    renderTabContent: function() {
      var targetTab = this.attributes.tabs[this.attributes.activeTabIndex];
      if (targetTab) {
        this.showLoading();
        targetTab.render($('#tabContent'), function(){
          this.hideLoading();
          this.onRenderTabContent();
        }.bind(this));
      }
    },
    
    onRenderTabContent: function() {
      this.adjustSeparatorSize();
    },
    
    showLoading: function() {
      Global.toggleElements($(this.attributes.tabContainer).find('.loadingDiv'), $('#tabContent'));
      this.adjustSeparatorSize();
    },
    
    hideLoading: function() {
      Global.toggleElements($('#tabContent'), $(this.attributes.tabContainer).find('.loadingDiv'));
      this.adjustSeparatorSize();
    },
    
    adjustSeparatorSize: function() {
      if (this.attributes.tabStyle === tabs.TAB_STYLES.STACKED) {
        var height;
        if ($('#tabContent').is(':visible')) {
          height = $('#tabContent').height();
        } else {
          height = $(this.attributes.tabContainer).find('.loadingDiv').height();
        }
        $('#tabNavContentSeparator').height(height);
      }
    },
    
    events: function() {
      var that = this;
      var $tabContainer = $(this.attributes.tabContainer);
      $tabContainer.find('.tab').off('click').on('click', function() {
        that.selectTab($(this).attr('id'));
      });
      $tabContainer.find('.tab a').off('click').on('click', function(e) {
        e.preventDefault();
      });
    },
    
    selectTab: function(tabId) {
      $.each(this.attributes.tabs, function(i, tab) {
        if (tab.tabId === tabId) {
          this.attributes.activeTabIndex = i;
          
          var $tabs = $(this.attributes.tabContainer).find('.tab');
          $tabs.removeClass('active');
          $tabs.eq(this.attributes.activeTabIndex).addClass('active');
          
          if (tab.onSelectTab) {
            tab.onSelectTab();
          }
          this.renderTabContent();
          return false;
        }
      }.bind(this));
    }
    
  };
  
  return tabs;
  
}(jQuery));