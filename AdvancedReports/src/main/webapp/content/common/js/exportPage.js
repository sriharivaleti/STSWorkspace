/* globals ScreenPrefs, _, locale, Dates */

var ExportPage = function(options) {
  "use strict";
  
  var exportInstance = {
    options : options,
    exportBaseUrl : options.exportBaseUrl,
    hasWho : options.hasWho,
    hasDate : options.hasDate,
    urlHasWeekOf : options.urlHasWeekOf,
    postParams : options.postParams,
    getCurrentDateEntry : options.getCurrentDateEntry,
    selector: options.selector || '#exportPage',
    showExportIcon: options.showExportIcon != null ? options.showExportIcon : ScreenPrefs.showExport2ExcelButton,
    customExport : options.customExport,

    exportSetup: function() {
      if (this.showExportIcon == true) {
        this.insertExportIcon();
      } else {
        this.removeExportIcon();
      }
    },

    insertExportIcon : function() {
      var buttonTemplate = _.template($('#exportIcon').html());
      $(this.selector).html(buttonTemplate);
      $(this.selector).find('span').html(Content.general['export']);
      this.bindClickEvent();
    },

    removeExportIcon : function() {
      $(this.selector).html('');
    },

    bindClickEvent : function() {
      $(this.selector).find('.export').off().on({
        click: function() {
          exportInstance.customExport ? exportInstance.customExport() : exportInstance.exportData();
        }
      });
      $(this.selector).find('.export').attr('title', Content.general['export']);
    },

    exportData : function() {
      if (this.showExportIcon == true) {
        var url = this.exportBaseUrl;
        var currentDateEntry = this.getCurrentDateEntry();

        if(this.hasWho) {
          url += 'who/' + encodeURIComponent($("#cEmployee").val()) + '/export';
        }

        if(this.hasDate) {
          var fromDate = currentDateEntry.dateValue.from;
          var toDate = currentDateEntry.dateValue.to;

          if (this.urlHasWeekOf && currentDateEntry.dateOption.name == 'weekOf') {
            url += '/weekof/' + Dates.format(fromDate, 'YYYY-MM-DD');
          }
          else {
            if(currentDateEntry.dateOption.name == 'weekOf') {
              fromDate = currentDateEntry.dateValue.weekFrom;
              toDate = currentDateEntry.dateValue.weekTo;
            }
            url += '/start/' + Dates.format(fromDate, 'YYYY-MM-DD') + '/end/' + Dates.format(toDate, 'YYYY-MM-DD');
          }
        }

        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", url);
        form.setAttribute("target", "_parent");

        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("id", this.postParams.id);
        hiddenField.setAttribute("name", this.postParams.name);
        hiddenField.setAttribute("value", JSON.stringify(this.postParams.get()));
        form.appendChild(hiddenField);

        document.body.appendChild(form);
        form.submit();
      }
    }
    
  };

  exportInstance.exportSetup();
  return exportInstance;
};