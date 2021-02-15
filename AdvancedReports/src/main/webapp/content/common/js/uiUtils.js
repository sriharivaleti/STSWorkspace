var UiUtils = (function() {
  "use strict";
  
  return {
    
    getHighestZIndex: function getMaxZIndex() {
      var zIndexMax = 0;
      $('div').each(function () {
          var z = parseInt($(this).css('z-index'));
          if (z > zIndexMax) {
            zIndexMax = z;
          }
      });
      return zIndexMax;
    },
    

    setPlaceholder : function() {
      $('[placeholder]').focus(function() {
        var input = $(this);
        if (input.val() === input.attr('placeholder')) {
          input.val('');
          input.removeClass('placeholder');
        }
      }).blur(function() {
        var input = $(this);
        if (input.val() === '' || input.val() === input.attr('placeholder')) {
          input.addClass('placeholder');
          input.val(input.attr('placeholder'));
        }
      }).blur().parents('form').submit(function() {
        $(this).find('[placeholder]').each(function() {
          var input = $(this);
          if (input.val() === input.attr('placeholder')) {
            input.val('');
          }
        });
      });
    },

    fileChangeTrigger: function() {
      $("#file").off('change').on('change', function() {
        var fileName = $("#file").val();
        $('#uploadFileLabel').hide();
        $("#uploadFile").val(fileName);
        $("#uploadFile").attr("title",fileName);
        $(".upload ").attr("title",fileName);
        $('#uploadButton').prop('disabled',false);
      });

      $("#file").off('click').on('click', function() {
        $("#file").val(null);
        $("#buttonBrowseFile").focus();
        var fileName = $("#file").val();
        $("#uploadFile").val(fileName);	
        if(fileName === "") {
          $('#uploadFileLabel').show().removeAttr( 'style' );
          $('#uploadButton').prop('disabled',true);
        }
      });

      var browser = true;
      browser = (navigator.appVersion.indexOf("MSIE 9")==-1);	
      if (browser) {
        $("#buttonBrowseFile").off('click').on('click', function() {
          $("#file").trigger("click");
        }); 
      }

      $("#file").mousemove(function(e) {
        var x = e.offsetX;
        var y = e.offsetY;
        var wdth = $("#buttonBrowseFile").width();
        var ht = $("#buttonBrowseFile").height();
        if(x>=0 && x<= wdth && y>=0 && y<=ht) {
          $("#buttonBrowseFile").removeClass("hov");
          $("#buttonBrowseFile").addClass("hov");
        }else {
          $("#buttonBrowseFile").removeClass("hov");
        }
      });
  
      $("#file").mouseout(function(e) {
        $("#buttonBrowseFile").removeClass("hov");
      });
    },
    
    initExpander: function(options) {
      $('div.expander div.header').unbind();
      $('div.expander div.header').click(function(event) {
        var obj = $(event.target);
        if($(obj).hasClass("text") || $(obj).hasClass("fa")) {
          obj = $(event.target).parent().parent();
        }
        if($(obj).hasClass("showhide")) {
          obj = $(event.target).parent();
        }
        expandCollapseControl(obj);
      });

      var expandCollapseControl = function(obj) {
        var content = $(obj).parent('.expander').find('div.content');
        if ($(content).hasClass('collapsed')) {
          $(content).show('slide', { direction: 'up' }, 300);
          setTimeout(function() {
            if(options && options.beforeInitCollapse) {
                options.beforeInitCollapse();
            }
          }, 300);
          $(content).removeClass('collapsed');
          $(content).addClass('expanded');
          $(obj).find('span.text').html(locale.hide);
          $(obj).find('span.text').attr('lang', 'lang').removeClass('localize');
          $(obj).find('i').attr('class', 'fa fa-caret-up' );
        }
        else {
          $(content).hide('slide', { direction: 'up' }, 300);
          $(content).removeClass('expanded');
          $(content).addClass('collapsed');
          $(obj).find('span.text').html(locale.show);
          $(obj).find('span.text').attr('lang', 'lang').removeClass('localize');
          $(obj).find('i').attr('class', 'fa fa-caret-down' );
        }
      };

      var content = $('div.expander div.header').parent('.expander').find('div.content');
      if(options && options.beforeInitCollapse) {
        options.beforeInitCollapse();
      }
      if($(content).hasClass('collapsed')){
        $(content).hide();
      }
    },
    
    refreshTableCellAlt: function(tableSelector) {
      var headerRows = $(tableSelector + " thead tr");
      headerRows.each(function(i, headerRow){
        $(headerRow).find('th').filter(function(i,o){ return $(o).css('display') !== 'none'; }).removeClass('alt').filter(':odd').addClass('alt');
      });
      var rows = $(tableSelector + " tbody tr");
      rows.each(function(i, row){
        $(row).find('td').filter(function(i,o){ return $(o).css('display') !== 'none'; }).removeClass("alt").filter(":odd").addClass("alt");
      });
    },
    
    // Temporary for WFM-37130 only, will require additional param 
    on: function(selector, event) {
      var args = Array.prototype.slice.call(arguments).slice(1);
      if (event === 'click') {
        var handler = args[args.length - 1];
        args[args.length - 1] = function(){
          if (Criteria.validateCriteria({validateDateEntry: true})) {
            handler();
          }
        }
      }
      var $selector = $(selector);
      $selector.on.apply($selector, args);
    }

  };
    
}) ();  