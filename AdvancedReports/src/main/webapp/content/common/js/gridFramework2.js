//# sourceURL=GF2
var GF2 = (function() {

  return {

    init: function(options) {
      GF2.localize();

      if (options != null) {

        var baseOptions = {};
        baseOptions.columnMapping = options.columnMapping;
        baseOptions.footerMapping = options.footerMapping;
        baseOptions.headerMapping = options.headerMapping;
        baseOptions.resetMappingFunction = options.resetMappingFunction;
        baseOptions.hideModColumn = options.hideModColumn;
        baseOptions.modColumnMapping = options.modColumnMapping;
        baseOptions.onModColumnClick = GF2.onModColumnClick;
        baseOptions.insertRow = GF2.insertRow;
        baseOptions.copyRow = GF2.copyRow;
        baseOptions.deleteRow = GF2.deleteRow;
        baseOptions.deleteAltType = options.deleteAltType != null ? options.deleteAltType : true;
        baseOptions.externalDropDownTypes = options.externalDropDownTypes;
        baseOptions.getColumnMappingFunction = GF2.getColumnMapping;
        baseOptions.getInstanceSelectorFunction = GF2.getInstanceSelector;
        baseOptions.getDataContextFunction = GF2.getDataContext;
        baseOptions.selectCellFunction = GF2.selectCell;
        baseOptions.previousTabControlSelectorParent = options.previousTabControlSelectorParent;
        baseOptions.previousTabControlSelector = options.previousTabControlSelector;
        baseOptions.lockedColumn = options.lockedColumn;
        baseOptions.paneHeightSyncFunction = GF2.syncTableHeights;
        GFB.init(baseOptions);
        GFB.orchestrateColumnMapping();

        GF2.options = options;
        GF2.orchestrateFunction = options.orchestrateFunction;
        GF2.getPath = options.getPath;
        GF2.parentMapping = options.parentMapping;

        GF2.emptyRecord = options.emptyRecord;
        GF2.setEmptyRecord = options.setEmptyRecord;
        GF2.additionalPageEvents = options.additionalPageEvents;
        GF2.additionalEvents = options.additionalEvents;
        GF2.additionalRender = options.additionalRender;
        GF2.hideModColumn = options.hideModColumn;
        GF2.staticLookupData = options.staticLookupData;
        GFB.additionalChangeFunction = options.additionalChangeFunction;
        GF2.onRowCountChangeFunction = options.onRowCountChangeFunction;
        GF2.lockedColumn = options.lockedColumn;
        GF2.checkExtentPermissionForDisplay = options.checkExtentPermissionForDisplay;
        GF2.addRowFunction = options.addRowFunction;
      }

      GF2.pageEvents();

    },

    // This is used as an override for the base, access the base function but pass this through to the init of the base (GFB)
    getColumnMapping: function(name) {
      var returnValue = null;
      var columnMappings = GF2.cPM != null ? GF2.cPM.columnMapping : GFB.columnMapping;
      $(columnMappings).each(function(i,o) {
        if (o.name == name) {
          returnValue = o;
          return false;
        }
      });
      if (returnValue == null && GF2.cPM != null) {
        $(GF2.cPM.footerMapping).each(function(i,fr) {
          $(fr).each(function(fmi, fm) {
            if (fm.name == name) {
              returnValue = fm;
              return false;
            }
          });
        });
      }
      return returnValue;
    },

    // This must be passed to the base (GFB)
    getInstanceSelector: function() {
      return GF2.getElementInstanceSelector(GF2.cPM);
    },

    // This must be passed to the base (GFB)
    getDataContext: function(pm) {
      if (pm == null || !$.isPlainObject(pm)) { pm = GF2.cPM; }
      
      var mapping = '';
      if(pm) {
        var parentPM = GF2.getParentMapping(pm.parentName);
        mapping = '.' + pm.mapping;
        if (GF2.cpd[pm.name] != null) {
          mapping += '[' + GF2.cpd[pm.name] + ']';
        }
        if (parentPM != null) {
          return GF2.getDataContext(parentPM) + mapping;
        }
      }
      return 'GF2' + mapping;
    },


    loadColumnMapping: function(mapping) {
      GFB.columnMapping = mapping;
      GFB.options.columnMapping = mapping;
    },

    getPath: null,
    orchestrateFunction: null,
    options: null,

    localizeValuesNeeded: {},

    localize: function() {

      $('td.localize, th.localize, option.localize, dt.localize, span.localize, label.localize').each(function(i,o) {
        if (locale[$(o).attr('lang')] == null) {
          GF2.localizeValuesNeeded[$(o).attr('lang')] = $(o).html();
        }
        $(o).html(locale[$(o).attr('lang')]);
      });
      $('input[type="button"].localize').each(function(i,o) {
        if (locale[$(o).attr('lang')] == null) {
          GF2.localizeValuesNeeded[$(o).attr('lang')] = $(o).val();
        }
        $(o).val(locale[$(o).attr('lang')]);
      });
    },

    pageEvents: function() {

      $('#buttonAddRow').unbind('click')
      $('#buttonAddRow').bind({
        click: function(event) {
          if(GF2.addRowFunction) {
            GF2.addRowFunction(event);
          }
        }
      });

      if (GF2.additionalPageEvents != null) {
        GF2.additionalPageEvents();
      }

    },

    json: {},

    get: function(data) {
      /* Load json from get */
      Global.showLoading();
      if (GF2.options.dummyData != null) {
        data = GF2.options.dummyData;
      }
      if (data != null) {
        GF2.initialJson = jQuery.extend(true, {}, data);
        if (GF2.options.orchestrateFunction != null) {
          if (GFB.resetMappingFunction) {
            GFB.resetMappingFunction(data);
            GFB.orchestrateColumnMapping();
          }
          GF2.options.orchestrateFunction(data);
          GF2.lastDataBeforeDelete = jQuery.extend(true, [], GF2.json);
        }
        GF2.render();
        Navigation.setChangedData(false);
        return;
      }
      if ($("#cDate").length > 0) {
        GF2.selectedDate = Dates.getDateValue($("#cDate"));
      }

      GF2.selectedEmpId = $("#cEmployee").val();


      var url = GFB.buildPath(GF2.getPath);
      
      var getData = {};
      
      if (GF2.getGetDataFunction != null) {
      	getData = GF2.getGetDataFunction();
        }

      $.getJSON(url, getData, function( json ) {

        GF2.initialJson = jQuery.extend(true, {}, json);
        if (GF2.options.orchestrateFunction != null) {
          if (GFB.resetMappingFunction) {
            GFB.resetMappingFunction(json);
            GFB.orchestrateColumnMapping();
          }
          GF2.options.orchestrateFunction(json);
          GF2.lastDataBeforeDelete = jQuery.extend(true, [], GF2.json);
        }

        GF2.render();

      });


      Navigation.setChangedData(false);
    },

    refreshExpanderDetail: function() {
      $('.expander').each(function(i, o) {
        GF2.expanderDetail.push({selector:$(o).attr('selector'), isExpanded:$(o).find('div.content').css('display') != 'none'});
      });
    },

    expanderDetail: [],


    emptyRecord: null,

    insertRow: function() {
      if(GF2.setEmptyRecord) {
        GF2.setEmptyRecord();
      }
      //alert("inserting row!");
      if (GF2.emptyRecord != null) {
        
        var newExtent = jQuery.extend(true, {}, GF2.emptyRecord);
        GF2.cpd[GF2.cPM.name] = null;
        var d = eval(GF2.getDataContext());
        //alert(JSON.stringify(d[GFB.cRow]));
        if(d[GFB.cRow] != null) {
          newExtent.position = jQuery.extend(true, {}, d[GFB.cRow].position);
          newExtent.workItem = jQuery.extend(true, {}, d[GFB.cRow].workItem);
          newExtent.department = jQuery.extend(true, {}, d[GFB.cRow].department);
          newExtent.hourType = jQuery.extend(true, {}, d[GFB.cRow].hourType);
        }

        if ('startTime' in newExtent) {
          var dateValue = '';
          var record = d[GFB.cRow] != null ? d[GFB.cRow].endTime : null;
          if(record != null ){
            dateValue = [record[0],record[1],record[2],0,0,0,0];
          } else {
            var pmDay = GF2.getParentMapping('day');
            var context = eval(GF2.getDataContext(pmDay));
            dateValue = Dates.revertForJSON(Dates.format(context.date, Content.general.dFTypes[1]));
          }
          newExtent.startTime = Dates.revertForJSON(Dates.object(dateValue));
          newExtent.endTime = Dates.revertForJSON(Dates.object(dateValue));  
        }
        d.splice(GFB.cRow + 1, 0, newExtent);

        GF2.render();
        Navigation.setChangedData(true);
      }

    },

    copyRow: function(options) {
      options = options || {};
      var onBeforeRowChange = options.onBeforeRowChange;
      
      var rowId = GF2.cpd[GF2.cPM.name];
      GF2.cpd[GF2.cPM.name] = null;
      var d = eval(GF2.getDataContext());

      var newExtent = jQuery.extend(true, {}, d[rowId]);

      if (onBeforeRowChange) {
        onBeforeRowChange(newExtent);
      }
      
      d.splice(GFB.cRow + 1, 0, newExtent);
      GF2.render();
      Navigation.setChangedData(true);
    },

    deleteRow: function(options) {
      options = options || {};
      var onBeforeRowChange = options.onBeforeRowChange;
      
      var parentIndex = GF2.cpd[GF2.cPM.parentName];

      if (onBeforeRowChange) {
        onBeforeRowChange();
      }
      
      if (GF2.json[parentIndex] != null){
      	GF2.lastDataBeforeDelete[parentIndex].extents = jQuery.extend(true, [], GF2.json[parentIndex].extents);
      }
      GF2.cpd[GF2.cPM.name] = null;
      var d = eval(GF2.getDataContext());
      d.splice(GFB.cRow, 1);
      GF2.render();
      Navigation.setChangedData(true);
    },

    cElementIndex: -1,

    getParentMapping: function(name) {
      var returnValue = null;
      $(GF2.parentMapping).each(function(i, o) {
        if (o.name == name) {
          returnValue = o;
          return false;
        }
      })
      return returnValue;
    },

    cpd: {},
    instancePrefix: 'templateInstance_',

    getElementInstanceSelector: function(pm) {
      var parentPM = GF2.getParentMapping(pm.parentName);
      var selector = (pm.isTargetTable ? pm.tableSelector : '.' + GF2.instancePrefix + pm.name + '[lang="' + GF2.cpd[pm.name] + '"]');
      if (parentPM != null) {
        return GF2.getElementInstanceSelector(parentPM) + ' ' + selector;
      }
      return selector;
    },

    renderParentMapping: function(pm) {
      if (!pm.isTargetTable) {
        GF2.cpd[pm.name] = null;
        var dataContext = eval(GF2.getDataContext(pm));
        var parentMapping = GF2.parentMapping;
        for (var i = 0, length = dataContext.length; i < length; i++) {
          var o = dataContext[i];
          GF2.cpd[pm.name] = i;
          var cElement = $('#' + pm.templateId).html();
          cElement = $(cElement);
          cElement.removeClass(pm.templateClass);
          cElement.addClass(GF2.instancePrefix + pm.name);
          if (pm.cssClass != null) {
            cElement.addClass(pm.cssClass);
          }
          cElement.attr('lang', i);
          if (o.isLocked) {
            cElement.addClass('isLocked');
          }
          if (pm.parentName != null) {
            $(GF2.getElementInstanceSelector(GF2.getParentMapping(pm.parentName))).find(pm.target).append(cElement);
          }
          else {
            $(pm.target).append(cElement);
          }
          for (var j = 0, parentMappingLength = parentMapping.length; j < parentMappingLength; j++) {
            var o = parentMapping[j];
            if (o.parentName == pm.name) {
              GF2.renderParentMapping(o);
            }
          }
        }

      }
      else {
        if(GF2.parentMapping.length == 1) {
          GF2.cPM = null;
        }
        var records = eval(GF2.getDataContext(GF2.getParentMapping(pm.parentName)) + '.' + pm.mapping);
        
        var instanceSelector = (pm.parentName) ? GF2.getElementInstanceSelector(GF2.getParentMapping(pm.parentName)) : '#mainContainer';
        var multiPaneSelector = $(instanceSelector).find(pm.target);
        multiPaneSelector.attr('lang', pm.name);

        var multiPaneView = new MultiPaneView({ multiPaneSelector : multiPaneSelector,
                                                lockedColumn      : GF2.lockedColumn,
                                                columnMappings    : pm.columnMapping,
                                                footerMappingRows : pm.footerMapping,
                                                records           : records,
                                                parentMappingName : pm.name,
                                                syncWidths        : GF2.multiPaneViews.length > 0
                                              });
        GF2.multiPaneViews.push(multiPaneView);
        multiPaneView.render();
      }
    },

    render: function() {
      if (GF2.json != null) {
        $('.gridFrameworkContent').html('');
        GF2.multiPaneViews = [];
        $(GF2.parentMapping).each(function(i, ro) {
          if (ro.parentName == null) {
            $(ro.target).html('');
            GF2.renderParentMapping(ro);
          }
        });

        if (GF2.additionalRender != null) {
          GF2.additionalRender();
        }
        $('.gridFrameworkContentShifts td.hideCellText').each(function(i, o) {
          jQuery.data(o, 'value',  $(o).html());
          $(o).html('');
        });
        GF2.events();
        GFB.disableLockedRecords();
        GF2.localize();
        Global.hideLoading();
        Global.formatTooltips();
        GF2.refreshExpanderDetail();
        $(document).ready(function() {
          GFB.scrollToObject();
          setTimeout(function() {
            GF2.syncTableHeights();
          }, 0);
        });
      }
    },

    selectCell: function(obj) {

      if (GF2.canMoveSelection()) {
        if (isNaN(parseInt($(obj).parent('tr').attr('lang')))) {
          return;
        }
        if($(obj).closest('table').parent('div').hasClass('pane1')) {
          $('.pane1').scrollTo($(obj), 0, { offset:{top:0, left:-1*($(obj).closest('table').parent('div').width()-($(obj).width() + 40))}});
        }
        else if($(obj).closest('table').parent('div').hasClass('pane2')) {
          $('.pane2').scrollTo($(obj), 0, { offset:{top:0, left:-1*($(obj).closest('table').parent('div').width()-($(obj).width() + 40))}});
        }

        GF2.loadCPD($(obj).closest('table').parent('div'));
        GFB.refreshCellMovementVariables(obj);
        GFB.cRow = parseInt($(obj).parent('tr').attr('lang'));
        GFB.cCol = $(obj).attr('lang');
        GF2.cPM = GF2.getParentMapping($(obj).closest('table').parent('div').attr('lang'));
        GF2.cpd[GF2.cPM.name] = GFB.cRow;
        $(GF2.getElementInstanceSelector(GF2.cPM) + ' tbody td').removeClass('currentFocus');
        $(obj).addClass("currentFocus");

        if ($(obj).hasClass('editable') || $(obj).hasClass('lookup')) {
          GFB.displayEdit();
        }
        else if ($(obj).hasClass('note')) {
          $(obj).find('i').click();
        }
        else {
          var inputControl = $(obj).find('input');
          inputControl.focus();
       }
       
      }
    },

    loadCPD: function(gridObj) {
      var mappingId = gridObj;
      if (typeof gridObj != 'string') {
        mappingId = $(gridObj).attr('lang');
      }
      var pm = GF2.getParentMapping(mappingId);
      if (pm != null) {
        GF2.getParentElementToLoadCPD(pm, gridObj);
      }

    },

    getParentElementToLoadCPD: function(pm, obj) {
      var ppm = GF2.getParentMapping(pm.parentName);
      if (ppm != null) {
        var pObj = GF2.getParentElementWithClass(obj, GF2.instancePrefix + ppm.name);
        if (pObj != null) {

          GF2.cpd[ppm.name] = parseInt($(pObj).attr('lang'));

          if (ppm.parentName != null) {
            GF2.getParentElementToLoadCPD(ppm, pObj);
          }
        }

      }
    },

    getParentElementWithClass: function(obj, c) {
      var returnVal = null;
      var parent = $(obj).parent();
      if (parent != null) {
        if (parent.hasClass(c)) {
          returnVal = parent;
        }
        else {
          returnVal = GF2.getParentElementWithClass(parent, c);
        }
      }
      return returnVal;
    },

    canMoveSelection: function(event) {
      var value = (!Overlay.isModalOverlayOpen() && $('#dValue').length == 0);
      if (!value) {
        var firstInput = Overlay.firstInput();
        if (firstInput != null) {
          $(firstInput).select();
        }
        else {
          $('#dValue').select();
        }
        if (event != null) {
          event.preventDefault();
        }
      }
      return value;
    },

    events: function() {

      $('tr.data td.lookup, tr.data td.editable').click(function(event) {
        if ($(event.target).hasClass('unlocked')) {
          GFB.selectCell(event.target);
          GF2.syncTableHeights();
        }
        if ($(event.target.parentElement).hasClass('unlocked')) {
          GFB.selectCell(event.target.parentElement);
          GF2.syncTableHeights();
        }
      });

      
      $('tr.data td.checkbox input[type="checkbox"]').unbind().change(function(event) {
        var cell = $(event.target).closest('td');
        GFB.cRow = parseInt($(event.target).closest('tr').attr('lang'));
        if ($(cell).hasClass('unlocked')) {
          if (GF2.canMoveSelection(event)) {
            GFB.removeCurrentFocus();
            $(cell).addClass('currentFocus');
            GF2.loadCPD($(cell).closest('table').parent('div'));
            GFB.cCol = $(cell).attr('lang');
            GFB.refreshCellMovementVariables(cell);
            GF2.cPM = GF2.getParentMapping($(cell).closest('table').parent('div').attr('lang'));
            GF2.cpd[GF2.cPM.name] = GFB.cRow;
            GFB.setValue($(event.target).is(':checked'));
          }
        }
      });

      $('td.note div i').bind({
             click: function(event) {
               var cell = $(event.target).closest('td');
               GFB.cRow = parseInt($(event.target).closest('tr').attr('lang'));
               if ($(cell).hasClass('unlocked')) {
                 if (GF2.canMoveSelection(event)) {
                   GFB.removeCurrentFocus();
                   $(cell).addClass('currentFocus');
                   GF2.loadCPD($(cell).closest('table').parent('div'));
                   GFB.cCol = $(cell).attr('lang');
                   GFB.refreshCellMovementVariables(cell);
                   GF2.cPM = GF2.getParentMapping($(cell).closest('table').parent('div').attr('lang'))
                   GF2.cpd[GF2.cPM.name] = GFB.cRow;
                   var scrollDiv = (GF2.options.scrollDivId != null ? $('#' + GF2.options.scrollDivId) : null);
                   var noteCell = $(this).parent().parent();
                   var charLimitType = (noteCell.attr('note-type') === 'note') ? locale.charLimitNote : locale.charLimitReason;
                   var limitError = charLimitType + "</br>" + "[[max]]" + locale.charLimitMax + "</br>" + "[[current]]" + locale.charLimitCurrent;
                   var maxLength;
                   if (noteCell.attr('note-maxlength') != null) {
                     maxLength = parseInt(noteCell.attr('note-maxlength'), 10);
                   } 
                   else {
                     maxLength = (noteCell.attr('note-type') === 'note') ? 128 : 255;
                   }
                   Overlay.textInput($(event.target).parent(), GFB.setNoteValue, $(event.target).parent().attr('lang'), GFB.getValue(), null, 4, 15, scrollDiv, maxLength, limitError, function() { GFB.removeCurrentFocus(); } );

                 }
               }
             },
             
         
        
         mouseover: function(event) {
           if ($(event.target).closest('td').hasClass('unlocked')) {
             $(this).parent('div').addClass('hov')
           }
         },

         mouseout: function(event) {
           if ($(event.target).closest('td').hasClass('unlocked')) {
             $(this).parent('div').removeClass('hov')
           }
         }
       });

       $('.pane tbody input[type="checkbox"]').unbind('keydown').unbind('keyup').unbind('blur').bind({
          keydown: function(e) {
            if (e.keyCode == 9) {
              e.preventDefault();
            }
          },
          keyup: function(e) {
            if (e.keyCode == 9 && !e.shiftKey) {
              GFB.moveToNextCell();
            }
            if (e.keyCode == 9 && e.shiftKey) {
              GFB.moveToPreviousCell();
            }
          },
          blur: function() {
            $(this).parent().removeClass("currentFocus");
          }
       });
       
       GFB.modColumnEvents();
       
       GFB.multiSelectEvents();

       GFB.iconEvents();
       
       $(window).unbind('resize.multiPane').bind('resize.multiPane', function() {
         if (GF2.syncTableHeights) {
           GF2.syncTableHeights();
         }
       });

       if (GF2.additionalEvents != null) {
         GF2.additionalEvents();
       }

    },
    
    onModColumnClick: function(event) {
      if (GF2.canMoveSelection(event)) {
        GF2.loadCPD($(event.target).closest('table').parent('div'));
        GFB.cRow = parseInt($(event.target).closest('tr').attr('lang'));

        GF2.cPM = GF2.getParentMapping($(event.target).closest('table').parent('div').attr('lang'));
        GF2.cpd[GF2.cPM.name] = GFB.cRow;
        var day = GF2.cpd.day;
        var shift = GF2.cpd.shift;

        GFB.setScrollToObj($(this).closest('.gridContainer').parent());
        
        GFB.onModColumnIconClick(event);
        
        if (GF2.onRowCountChangeFunction != null) {
          GF2.onRowCountChangeFunction(day, shift);
        }
        return;
        
      }
    },

    syncTableHeights: function(leftPanesSelector, rightPanesSelector) {
      
      var $leftPanes  = leftPanesSelector || $('.pane1');
      var $rightPanes = rightPanesSelector || $('.pane2');

      for(var i = $leftPanes.length - 1; i >= 0; i--) {
        var $leftPane = $($leftPanes[i]);
        var $rightPane = $($rightPanes[i]);

        var $leftSelector = $leftPane.find('tbody tr.data td:first-child');
        var $rightSelector = $rightPane.find('tbody tr.data td:first-child');

        for(var j = $leftSelector.length - 1; j >= 0; j--) {
          var $leftCell = $($leftSelector[j]);
          var $rightCell = $($rightSelector[j]);
          $leftCell.css('height', '');
          $rightCell.css('height', '');

          var leftCellHeight = $leftCell.height();
          var rightCellHeight = $rightCell.height();

          if(leftCellHeight > rightCellHeight) {
            $rightCell.height(leftCellHeight);
          }
          else if (leftCellHeight < rightCellHeight) {
            $leftCell.height(rightCellHeight);
          }
        }

        var $leftHeaderCell = $leftPane.find('thead th:eq(0)');
        var $rightHeaderCell = $rightPane.find('thead th:eq(0)');

        if($leftHeaderCell.height() != $rightHeaderCell.height()) {
          $rightHeaderCell.height($leftHeaderCell.height());
        }
      }
    },
    
  };
}) ();

var TableView = function() {
  function TableView(options) {
    var records             = options.records;
    var columnMappings      = options.columnMappings;
    var $containerSelector  = options.containerSelector;
    var hideModColumn       = options.hideModColumn;
    var footerMappingRows   = options.footerMappingRows;
    var footerRowHeaderOnly = options.footerRowHeaderOnly;

    this.render = function () {
      renderTable();
    };

    function renderTable() {
      var tableMarkup = '';
      tableMarkup = renderHeader().join('');
      $containerSelector.find('thead').html(tableMarkup);

      tableMarkup = renderBody().join('');
      tableMarkup += renderFooter().join('');
      $containerSelector.find('tbody').html(tableMarkup);
    }

    function renderHeader() {
      var headerMarkup = [];
      headerMarkup.push('<tr>');

      if (!hideModColumn) {
        headerMarkup.push('<th rowspan="1"></th>');
      }

      if(footerRowHeaderOnly) {
        GFB.isAlt = !hideModColumn;
      }

      for (var i = 0, columnMappingsLength = columnMappings.length; i < columnMappingsLength; i++) {
        var columnMap = columnMappings[i];
        if (columnMap.show) {
          var headerText = (columnMap.headerText != null ? columnMap.headerText :
                            (locale[columnMap.name] == null ? columnMap.name : locale[columnMap.name]));
          headerMarkup.push('<th colspan="' + columnMap.colSpan + '" rowspan="1" class="' +
                            GFB.getAltClass(GFB.useAlt()) + '">' + headerText + '</th>');
        }
      }
      headerMarkup.push('</tr>');
      return headerMarkup;
    }

    function renderBody() {
      var bodyMarkup = [];
      for (var i = 0, paneDataLength = records.length; i < paneDataLength; i++) {
        if (!GFB.checkExtentPermissionForDisplay || ScreenPrefsController.checkPermissionForRowDisplay(records[i])) {
          var lockedRowClass = records[i].lockedByControllable ? ' isLocked ' : '';
          bodyMarkup.push('<tr class="data' + lockedRowClass +'" lang="' + i + '" name="dataRow' + i + '">');
          GFB.isAlt = false;

          if (!hideModColumn) {
            bodyMarkup.push(GFB.getModColumnHtml(GFB.getAltClass(GFB.useAlt()), records[i]));
          }

          for (var j = 0, cmLength = columnMappings.length; j < cmLength; j++) {
            var columnMapping = columnMappings[j];
            bodyMarkup.push(GFB.getDisplayCell(columnMapping, records[i]));
          }
          bodyMarkup.push('</tr>');
        }
      }
      return bodyMarkup;
    }

    function renderFooter() {
      var footerMarkup = [];

      if (footerMappingRows && records.length > 0) {

        footerMarkup.push('<tr></tr>');
        footerMarkup.push('<tr></tr>');
        footerMarkup.push('<tr></tr>');

        for(var i = 0, fmrLength = footerMappingRows.length; i < fmrLength; i++) {
          var footerColumnMappings = footerMappingRows[i];
          var isFirst = true;
          for(var j = 0, fmcLength = footerColumnMappings.length; j < fmcLength ; j++) {
            var footerColumnMapping = footerColumnMappings[j];
            if (footerColumnMapping.show) {
              var parentColMapping = GFB.getColumnMapping(footerColumnMapping.parentCol);
              if (footerRowHeaderOnly) {
                footerMarkup.push('<tr class="data footerRow" lang="0" name="footerRow' + i + '">');
                footerMarkup.push('<td class="r" colspan="' + (footerColumnMapping.parentColIndex + GFB.getParentColspanOffset()) + '">' + '<div class="footerRowContent">' + footerColumnMapping.headerText + '</div>'+ '</td>');
                break;
              }
              else {
                if(isFirst) {
                  footerMarkup.push('<tr class="data footerRow" lang="0" name="footerRow' + i + '">');
                  isFirst = false;
                }
                footerMarkup.push(GFB.getDisplayCell(footerColumnMapping, records[0], parentColMapping.isAlt));
              }
            }
          }
          footerMarkup.push('</tr>');
        }
      }
      return footerMarkup;
    }
  }
  return TableView;
}();

var MultiPaneView = function() {
  function MultiPaneView(options) {
    var $multiPaneSelector      = options.multiPaneSelector;
    var lockedColumn            = options.lockedColumn;
    var columnMappings          = options.columnMappings;
    var footerMappingRows       = options.footerMappingRows;
    var records                 = options.records;
    var syncWidths              = options.syncWidths;
    var leftPaneColumnMappings  = [];
    var rightPaneColumnMappings = [];
    var tables                  = [];
    var $leftPaneSelector;
    var $rightPaneSelector;
    var $draggableSeparatorSelector;

    init();

    function init() {
      splitColumnMappings();
      initTables();
    }

    this.render = function render() {
      for (var i = 0, tableLength = tables.length; i < tableLength; i++) {
        tables[i].render();
      }
      $draggableSeparatorSelector = $('.draggableSeparator');

      setTimeout(function() {
        setInitialPaneWidths();
        events();
      });
    };


    function setInitialPaneWidths() { 
      
        var leftPaneWidth = $leftPaneSelector.width();
        if (syncWidths) {
          var leftPanes = $('.pane1');
          leftPaneWidth = $(leftPanes[0]).width();
        }
        else {
          leftPaneWidth = $leftPaneSelector.width();
        }
        $leftPaneSelector.css({'max-width':'100%'});
        $leftPaneSelector.width(leftPaneWidth);

        var containerWidth = $multiPaneSelector.width();
        var draggableWidthPercent = 0.25;
        var leftPaneWidthPercent = CSMath.round(((100 * leftPaneWidth) / containerWidth), 2);

        var rightPaneWidthPercent = CSMath.round(100 - (draggableWidthPercent + leftPaneWidthPercent), 2);
        var rightPaneLeftPosition = CSMath.round(draggableWidthPercent + leftPaneWidthPercent, 2);

        $leftPaneSelector.width(leftPaneWidthPercent + '%');
        $rightPaneSelector.width(rightPaneWidthPercent + '%');
        $rightPaneSelector.css('left', (rightPaneLeftPosition - 0.005) + '%');
        $draggableSeparatorSelector.css('left', leftPaneWidthPercent + '%');

    }

    function splitColumnMappings() {
      var leftPane = true;
      for (var i = 0, cmLength = columnMappings.length; i < cmLength; i++) {
        var columnMapping = columnMappings[i];
        if (leftPane) {
          leftPaneColumnMappings.push(columnMapping);
        }
        else {
          rightPaneColumnMappings.push(columnMapping);
        }

        if (columnMapping.name === GF2.lockedColumn) {
          leftPane = false;
        }
      }
    }

    function initTables() {

      $multiPaneSelector.append($('#tableTemplate').html());
      $leftPaneSelector = $multiPaneSelector.find('.pane1');
      $rightPaneSelector = $multiPaneSelector.find('.pane2');

      //for future refactoring
      $leftPaneSelector.attr('lang', options.parentMappingName);
      $rightPaneSelector.attr('lang', options.parentMappingName);

      var leftTableView = new TableView({ records             : records,
                                          columnMappings      : leftPaneColumnMappings,
                                          containerSelector   : $leftPaneSelector,
                                          hideModColumn       : GFB.hideModColumn,
                                          footerMappingRows   : footerMappingRows,
                                          footerRowHeaderOnly : true
                                        });

      var rightTableView = new TableView({ records             : records,
                                           columnMappings      : rightPaneColumnMappings,
                                           containerSelector   : $rightPaneSelector,
                                           hideModColumn       : true,
                                           footerMappingRows   : footerMappingRows,
                                           footerRowHeaderOnly : false
                                         });

      tables[0] = leftTableView;
      tables[1] = rightTableView;
    }

    function events() {
      var $draggableSeparator = $('.draggableSeparator');
      var $leftPanes           = $('.pane1');
      var $rightPanes          = $('.pane2');
      var $footerRowContent   = $('.pane1 .footerRow .footerRowContent');
      
      $leftPanes.scroll(function(){
        var leftPaneWidth = $(this).width();
        var scrollerEndPoint = $(this).find('table').width() - leftPaneWidth;
        var scrollLeft = $(this).scrollLeft();
        if(scrollLeft > scrollerEndPoint) { scrollLeft = scrollerEndPoint }; 
        $footerRowContent.css('left', function(){
          return leftPaneWidth + scrollLeft - $(this).outerWidth() - 5;
        });
      });
      
      $draggableSeparator.draggable({ axis: "x", containment: "parent", cursor: "col-resize",

                drag: function(event, ui) {
                  var parentWidth = $multiPaneSelector.width();

                  var draggableWidth = $draggableSeparator.width();

                  var newLeftWidth = ui.position.left;

                  var newRightWidth = parentWidth - (newLeftWidth + draggableWidth);

                  var newLeft = newLeftWidth + draggableWidth;

                  $leftPanes.width(newLeftWidth);
                  $rightPanes.width(newRightWidth);
                  $draggableSeparator.width(draggableWidth);
                  $rightPanes.css({left: newLeft});

                  $draggableSeparator.css({left: newLeftWidth});
                  
                  var leftPanesScrollLeft = $leftPanes.scrollLeft();
                  $footerRowContent.css('left', function(){
                    var contentWidth = $(this).outerWidth();
                    return newLeftWidth + leftPanesScrollLeft - contentWidth - draggableWidth;
                  });

                  GF2.syncTableHeights();
                },
                stop: function(event, ui) {
                  var parentWidth = $multiPaneSelector.width();

                  var newLeftPercent = CSMath.round(((ui.position.left / parentWidth) * 100), 2);

                  var draggableWidthPercent = 0.25;

                  var newRightWidthPercent = CSMath.round(100 - (newLeftPercent + draggableWidthPercent), 2);

                  var newLeft = CSMath.round(newLeftPercent + draggableWidthPercent, 2);

                  $leftPanes.width(newLeftPercent + '%');
                  $rightPanes.width(newRightWidthPercent + '%');
                  $draggableSeparator.width('0.25%');
                  $rightPanes.css({left: (newLeft - 0.005) + '%'});

                  $draggableSeparator.css({left: newLeftPercent + '%'});
                }});
      
      $leftPanes.scroll();
    }
  }
  return MultiPaneView;
}();
