/* globals Global */

var GlobalExporter = (function() {
  "use strict";

  return {
    exportToCleanHtml: function(contentToLoad, overridePrintStyle, additionalRender, additionalPrintStyle, gridSelector) {
      var $styles = $('style, link[type="text/css"]');
      var element = $("<span/>");
      // Create a copy of the element to print
      var copy = $(contentToLoad).clone(true, true);
      copy.addClass('toPrint');
      GlobalExporter.copySelectedOption($(contentToLoad), copy);
      //  addedTitle is to display the current screen title in portal and breadCrumbs is to display navigation path in standalone
      if($("#breadCrumbs").length > 0) {
        var breadCrumbsNavPath = $("#breadCrumbs ul li span.bc").clone();
        breadCrumbsNavPath = breadCrumbsNavPath.append("<style type='text/css'>span.bc { font-size: 10pt; white-space: nowrap; float: left; color: #337ab7; } span.bc span._c { color: #333; }</style><br></br>");
        element.append(breadCrumbsNavPath);
       }
      else {
        var addedTitle = $(".addedTitle").clone();
        addedTitle = addedTitle.append("<style type='text/css'>.addedTitle { white-space: nowrap; float: left; } </style>");
        element.append(addedTitle);
      }

      // Wrap it in a span to get the HTML markup string
      copy = $("<span/>").append(copy);

      // Add in the styles
      copy.append($styles.clone());

      // Append Print styles
      if (overridePrintStyle != null && overridePrintStyle != 'undefined') {
        copy.append(overridePrintStyle);
      } 
      else {
        gridSelector = gridSelector || '#Grid'
        var tableWidth = parseInt($(gridSelector + ' table').width());  
        var parentWidth = parseInt($(gridSelector + ' table').parent().width());
        var ratio = 1.0;
        if (parentWidth > 0.0) {
          ratio = tableWidth / parentWidth;
        }
        copy.append(GlobalExporter.getPrintStyle(ratio));
        
        //Append Additional Print styles
        if (additionalPrintStyle != null && additionalPrintStyle != 'undefined') {
          copy.append(additionalPrintStyle);
        } 
      }

      copy.find("input, textarea").each(function () {
        var $field = $(this);
        if ($field.is("[type='radio']") || $field.is("[type='checkbox']")) {
          if ($field.prop("checked")) {
              $field.attr("checked", "checked");
          }
          else {
            $field.removeAttr("checked");
          }
        }
        else {
          $field.attr("value", $field.val());
        }
      });
      copy.find(".checkbox").each(function () {
        var $field = $(this);
        $field.removeClass("checkbox");
      });

      copy = element.append(copy);
      // Get the HTML markup string
      var content = '<!DOCTYPE html><html>' + copy.html() + '</html>';

      // Destroy the copy
      copy.remove();      

      GlobalExporter.createIframeForPrint(content, additionalRender);
    },

    getPrintStyle: function(ratio) {
      var minFontsize = 5;
      var maxFontsize = 9;

      var fontsize = maxFontsize;
      if (ratio != null && ratio != 'undefined') {
        fontsize = fontsize / ratio;
        if (fontsize < minFontsize){
          fontsize = minFontsize;
        } else if (fontsize > maxFontsize){
          fontsize = maxFontsize;
        }
      }

      var s = '<style type="text/css" media="print">';
      s += " #Grid table *,.payrollDetails, .GridContainer table *, .gridContainer table * {font-size: " + fontsize + "pt; line-height: normal; } ";
      s += " .pane td.note div i {font-size: 8pt;} ";
      s += " table.payrollDetailsContent *, .payrollDetailContent table * { font-size: 6pt; } ";
      s += " #Grid tr td.edit, #Grid tr td.editable.unlocked, #Grid tr td.lookup.unlocked, ";
      s += " .GridContainer tr td.edit, .GridContainer tr td.editable, .GridContainer tr td.lookup.unlocked ";
      s += " .gridContainer tr td.edit, .gridContainer tr td.editable, .gridContainer tr td.lookup.unlocked ";
      s += " { min-width: 2pt; color: #000000; } ";
      s += " #Grid th, .GridContainer th, .gridContainer th { min-width: 2pt; } ";
      s += " #Grid td.modCol, .GridContainer td.modCol, .gridContainer td.modCol { width:2pt } ";
      s += " #Grid td.modCol div.insert, .GridContainer td.modCol div.insert, .gridContainer td.modCol div.insert { display:none; } ";
      s += " #Grid td.modCol div.copy, .GridContainer td.modCol div.copy, .gridContainer td.modCol div.copy { visibility: hidden; width: 2pt;} ";
      s += " #Grid td.modCol div.delete, .GridContainer td.modCol div.delete, .gridContainer td.modCol div.delete { display:none; } ";
      s += " .shiftActions { display:none; } ";
      s += " div.paging div.pageShowing { white-space : nowrap;} ";
      s += " div.dayHeader input.addShiftButton_day:lang(addShift),input.viewClockData:lang(viewClockData) { display:none; } ";
      s += " div.payrollDetailContent input.applyDefaultButton:lang(applyDefault), div.payrollDetailContent div.lookupIndicator { display:none; } ";
      s += " div.tabbingTabStrip div.tabStripItem { border : 1px solid #b2babc; }";
      s += " #tabContainer { page-break-before: always; }";
      s += " .pagingControls, .pageRecordsPerPage { display: none; }";
      s += " #Grid tr.filterRow input.filterSmall { width:50px; }";
      s += " #Grid td div.additionalCheckFieldContainer input { margin-right:5px;} ";
      s += " #Grid td div.additionalCheckFieldContainer span {  padding-left:0px; white-space:nowrap;} ";
      s += '</style>';

      return s;
    },

    createIframeForPrint: function(content, additionalRender) {
      // Use an iframe for printing
      var $iframe = $("iframeForPrint");
      var iframeCount = $iframe.length;
      if (iframeCount === 0) {
         // Create a new iFrame if none is given
         $iframe = $('<iframe id="iframeToPrint" height="0" width="0" border="0" wmode="Opaque"/>')
             .prependTo('body')
             .css({
                   "position": "absolute",
                   "top": -999,
                   "left": -999
              });
      }
      var w, wdoc;
      w = $iframe.get(0);
      w = w.contentWindow || w.contentDocument || w;
      $iframe.get(0).onload = function(){
        if(additionalRender != null) {
          additionalRender();
        }
        GlobalExporter.printFrame(w)
          .always(function(){
            Global.toggleLoadingCursor(false);
          })
          .done(function () {
            // Success
            setTimeout(function () {
              // Wait for IE
              if (iframeCount === 0) {
                // Destroy the iframe if created here
                $iframe.remove();
              }
            }, 100);
          })
          .fail(function (err) {
            // log the error if iframe fails for some reason
            console.error("Failed to print from iframe", err);
          });
      };
      Global.toggleLoadingCursor(true);
      wdoc = w.document || w.contentDocument || w;
      wdoc.open();
      wdoc.write(content);
      wdoc.close();
    },

    printFrame: function(frameWindow) {
      // Print the selected window/iframe
      var def = $.Deferred();
      try {
          // Fix for IE : Allow it to render the iframe
          frameWindow.focus();
          try {
              // Fix for IE11 - printng the whole page instead of the iframe content
              if (!frameWindow.document.execCommand('print', false, null)) {
                  // document.execCommand returns false if it failed
                  frameWindow.print();
              }
          } catch (e) {
              frameWindow.print();
          }
          frameWindow.close();
          def.resolve();
      } catch (err) {
          def.reject(err);
      }
      return def;
    },
    
    copySelectedOption: function(original, clone) {
      //clone does not copy selected property. This is a jQuery bug.
      $(original).find('select').each(function(i, obj) {
        var selectedOptionHtml = $(obj).find('option:selected').html();
        $(clone).find('select').eq(i).html('<option>' + selectedOptionHtml + '</option>');
      });
    },

    eof:0
  };

})();