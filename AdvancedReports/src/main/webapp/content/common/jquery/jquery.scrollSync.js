(function($){

  $.fn.scrollSync = function() {

    var settings = {
      selector: null,
      interval_id: null
    };

    var init = function($selector) {
      settings.selector = $selector;
      $selector.each(function(i, o){
        $(o).data('canScroll', true);
      });
      bindEvents($selector);
    };

    var lockSync = function(exception) {
      settings.selector.not(exception).each(function(i, o){
        $(o).data('canScroll', false);
      });
    };

    var unLockSync = function() {
      settings.selector.each(function(i, o){
        $(o).data('canScroll', true);
      });
    };

    var sync = function(percent, exception) {
      settings.selector.not(exception).each(function(i, o){
        var child = $($(o).children()[0]);
        var scrollPos = (percent / 100) * child.width();
        $(o).scrollLeft(scrollPos);
      });
    };

    var scrollEvent = function(event) {
      var scrollBar = $(event.target);
      if (scrollBar.data('canScroll')) {
        // get percentage
        var scrollPos = scrollBar.scrollLeft();
        var child = $(scrollBar.children()[0]);
        var scrollWidth = child.width();
        var percent = (scrollPos / scrollWidth) * 100;

        // move other scrollbars
        sync(percent, scrollBar);
      }
    };

    var scrollStartEvent = function(event) {
      if ($(event.target).data('canScroll')) {
        lockSync($(event.target));
        settings.interval_id = setInterval(function() { scrollEvent(event); }, 1);
      }
    };

    var scrollEndEvent = function(event) {
      if ($(event.target).data('canScroll')) {
        unLockSync();
        clearInterval(settings.interval_id);
      }
    };

    var bindEvents = function(scrolls) {
      scrolls.unbind('scrollstart').bind('scrollstart', scrollStartEvent);
      scrolls.unbind('scrollstop').bind('scrollstop', scrollEndEvent);
    };

    var special = jQuery.event.special;
    var uid1 = 'D' + (+new Date());
    var uid2 = 'D' + (+new Date() + 1);

    special.scrollstart = {
      setup: function() {

        var timer;
        var handler =  function(evt) {
          var _self = this;
          var _args = arguments;

          if (timer) {
            clearTimeout(timer);
          } else {
            evt.type = 'scrollstart';
            jQuery.event.handle.apply(_self, _args);
          }

          timer = setTimeout( function(){
            timer = null;
          }, special.scrollstop.latency);

        };

        jQuery(this).bind('scroll', handler).data(uid1, handler);

      },
      teardown: function(){
        jQuery(this).unbind( 'scroll', jQuery(this).data(uid1) );
      }
    };

    special.scrollstop = {
      latency: 300,
      setup: function() {

        var timer;
        var handler = function(evt) {
          var _self = this;
          var _args = arguments;

          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout( function(){
            timer = null;
            evt.type = 'scrollstop';
            jQuery.event.handle.apply(_self, _args);
          }, special.scrollstop.latency);
        };

        jQuery(this).bind('scroll', handler).data(uid2, handler);

      },
      teardown: function() {
        jQuery(this).unbind( 'scroll', jQuery(this).data(uid2) );
      }
    };

    init($(this));
  };
})(jQuery);
