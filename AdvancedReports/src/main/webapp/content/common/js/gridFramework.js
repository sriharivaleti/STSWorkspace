//# sourceURL=GF
/* globals GFB, Paging, Navigation, Global, Dates, ScreenPrefsController, Overlay, locale, Content, Criteria, Validation */

var GF = (function() {
  "use strict";
  
  return {

    init: function(options) {

      GF.localize();

      GF.isFromFocus = false;

      if (options != null) {
        var baseOptions = {};
        baseOptions.columnMapping = options.columnMapping;
        baseOptions.footerMapping = options.footerMapping;
        baseOptions.headerMapping = options.headerMapping;
        baseOptions.resetMappingFunction = options.resetMappingFunction;
        baseOptions.showUnsavedColumn = options.showUnsavedColumn;
        baseOptions.globalChangeFunction = options.globalChangeFunction;
        baseOptions.hideModColumn = options.hideModColumn;
        baseOptions.modColumnMapping = options.modColumnMapping;
        baseOptions.onModColumnClick = GF.onModColumnClick;
        baseOptions.insertRow = GF.insertRow;
        baseOptions.copyRow = GF.copyRow;
        baseOptions.deleteRow = GF.deleteRow;
        baseOptions.getColumnMappingFunction = GF.getColumnMapping;
        baseOptions.getInstanceSelectorFunction = GF.getInstanceSelector;
        baseOptions.getDataContextFunction = GF.getDataContext;
        baseOptions.selectCellFunction = GF.selectCell;
        baseOptions.previousTabControlSelectorParent = options.previousTabControlSelectorParent;
        baseOptions.previousTabControlSelector = options.previousTabControlSelector;
        baseOptions.checkExtentPermissionForDisplay = options.checkExtentPermissionForDisplay;

        GFB.init(baseOptions);
        GFB.orchestrateColumnMapping();
        GF.options = options;
        GF.orchestrateFunction = options.orchestrateFunction;
        GF.getPath = options.getPath;
        GF.postPath = options.postPath;
        GF.includeWho = options.includeWho;
        GF.dateOption = options.dateOption;
        GF.dateEntry = options.dateEntry;
        GF.getPostDataFunction = options.getPostDataFunction;
        GF.getGetDataFunction = options.getGetDataFunction;
        GF.highlightFunction = options.highlightFunction;
        GF.isAltRowFunction = options.isAltRowFunction;
        GF.onFilterChange = options.onFilterChange;
        GF.emptyRecord = options.emptyRecord;
        GF.additionalPageEvents = options.additionalPageEvents;
        GF.additionalEvents = options.additionalEvents;
        GF.additionalRender = options.additionalRender;
        GF.isFilterable = options.isFilterable;
        GF.returnFilterObj = options.returnFilterObj;
        GF.isSortable = options.isSortable;
        GF.isPaged = options.isPaged;
        GF.setPreferredPageSize = options.setPreferredPageSize;
        GF.onBeforePaging = options.onBeforePaging;
        GF.pagingValidationFunction = options.pagingValidationFunction;
        GF.clearChanges = options.clearChanges;
        GF.sortOverrideFunction = options.sortOverrideFunction;
        GF.staticLookupData = options.staticLookupData;
        GF.setEmptyRecord = options.setEmptyRecord;
        GF.renderSplitPanes = options.renderSplitPanes;
        GF.lockedColumn = options.lockedColumn;

      }
      if (GF.isPaged) {
        if ($(GF.basePagingTarget).length === 0) {
          $('#Grid').after('<div class="pagingTarget"></div>');
        }
        
        var setPreferredPageSize = false;
        if(GF.setPreferredPageSize) {
          setPreferredPageSize = true;
        }
        GF.paging = Paging.create(GF.basePagingTarget, GF.pagingGet,
                                  GF.pagingValidationFunction, Navigation.currentScreen, GF.setPreferredPageSize);
      }
      GF.pageEvents();

    },

    pagingGet: function() {
      if (GF.onBeforePaging != null) {
        GF.onBeforePaging();
      }
      GF.get(null, true);
    },

    // This is used as an override for the base, access the base function but pass this through to the init of the base (GFB)
    getColumnMapping: function(name, exclusive) {
      var returnValue = null;
      $(GFB.columnMapping).each(function(i,o) {
        if (o.name == name) {
          returnValue = o;
          return false;
        }
      });
      if (returnValue == null && !exclusive) {
        $(GFB.footerMapping).each(function(i,fr) {
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
      return '#Grid';
    },

    // This must be passed to the base (GFB)
    getDataContext: function(cRow) {
      if (cRow == null) { cRow = GFB.cRow; }
      return 'GF.json.extents[' + cRow + ']';
    },

    getPath: null,
    orchestrateFunction: null,
    options: null,

    localize: function() {

    },

    pageEvents: function() {


      $('#buttonAddRow').unbind('click');
      $('#buttonAddRow').bind({
        click: function() {
          var count = -1;
          if (GF.json.extents.length > 0) {
            count = GF.json.extents.length - 1;
          }
          GFB.cRow = count;
          GF.insertRow();
          GF.events();
          GFB.disableLockedRecords();
        }
      });

      if (GF.additionalPageEvents != null) {
        GF.additionalPageEvents();
      }

    },





    json: {},

    get: function(data, keepPaging) {
      Global.showLoading();
      GF.deletedRows = [];
      if (!keepPaging && GF.isPaged) {
        GF.paging.setAllCurrentPages(1);
      }
      if (GF.getPath != null) {
        if (GF.options.dummyData != null) {
          data = GF.options.dummyData;
        }
        if (data != null) {

          GF.initialJson = jQuery.extend(true, {}, data);

          if (GF.orchestrateFunction != null) {
            if (data.pagingResponse && data.pagingResponse.totalRecords != null) {
              GF.paging.setTotalItems(data.pagingResponse.totalRecords);
            }
            if (GFB.resetMappingFunction) {
              GFB.resetMappingFunction(data);
              GFB.orchestrateColumnMapping();
            }
            GF.orchestrateFunction(data);
          }
          if (GF.isSortable) {
            GF.sortExtents();
          }
          GF.render();
          Navigation.setChangedData(false);
          return;
        }

        if ($("#cDate").length > 0) {
          GF.selectedDate = Dates.object($("#cDate").val());
        }

        GF.selectedEmpId = $("#cEmployee").val();

        var url = GFB.buildPath(GF.getPath);
        
        var getData = {};
        
        if (GF.getGetDataFunction != null) {
        	getData = GF.getGetDataFunction();
          }

        $.getJSON(url, getData, function( json ) { 

          GF.initialJson = jQuery.extend(true, {}, json);
          if (GF.orchestrateFunction != null) {
            if (json.pagingResponse && json.pagingResponse.totalRecords != null) {
              GF.paging.setTotalItems(json.pagingResponse.totalRecords);
            }
            if (GFB.resetMappingFunction) {
              GFB.resetMappingFunction(json);
              GFB.orchestrateColumnMapping();
            }
            GF.orchestrateFunction(json);
          }
          if (GF.isSortable) {
            GF.sortExtents();
          }
          GF.render();

        });

      }
      else {

        if ($("#cDate").length > 0) {
          GF.selectedDate = $('#cDate').datepicker('getDate');
        }

        GF.selectedEmpId = $("#cEmployee").val();

        var url = GFB.buildPath(GF.postPath);
        var postObj = {};

        if (GF.getPostDataFunction != null) {
          postObj = GF.getPostDataFunction();
        }
        else {
          postObj = GF.getPostData();
        }
        if(GF.isPaged){
          postObj.pagingRequest = GF.paging.getPagingRequest();

          if (GF.isSortable) {
              postObj.pagingRequest.sortingRequest = {sortColumn: GF.sortColumn, 
                    sortOrder: GF.sortOrder};
          }
        }
        $.postJSON(url, postObj, function( json ) {

          GF.initialJson = jQuery.extend(true, {}, json);
          if (GF.orchestrateFunction != null) {
            if (json.pagingResponse && json.pagingResponse.totalRecords != null) {
              GF.paging.setTotalItems(json.pagingResponse.totalRecords);
            }
            if (GFB.resetMappingFunction) {
              GFB.resetMappingFunction(json);
              GFB.orchestrateColumnMapping();
            }
            GF.orchestrateFunction(json);
          }
          if (GF.isSortable && GF.isFrontEndSort) {
            GF.sortExtents();
          }
          GF.render();

        });

      }
      Navigation.setChangedData(false);
    },

    getFilterValueObj: function(mapping, value) {
      var lastIndex = mapping.lastIndexOf(".");
      if (lastIndex != -1) {
        var type = mapping.substr(lastIndex + 1);
        var tempObj = {};
        tempObj[type] = value;
        value = tempObj;
        mapping = mapping.substring(0, lastIndex);
        return GF.getFilterValueObj(mapping, value);
      }
      else {
        return { type:mapping, value:value };
      }
    },

    getPostData: function() {
      var postData =  {};
      var filterObj = {};
      postData.postRequest = {};

      if (GF.isFilterable) {
        var filter = GF.getFilter();
        $(filter).each(function(i, o) {
          var isComplexFilter = (o.parentColumnMappingType != null);
          var type = isComplexFilter ? o.parentColumnMappingType : o.type;
          var cm = GF.getColumnMapping(type);
          if (cm != null) {
            var mapping = cm.mapping;
            if (isComplexFilter) {
              if (cm.filterOptions == null) {
                return true;
              }
              $(cm.filterOptions.values).each(function(i, fo) {
                if (fo.name == o.type) {
                  mapping = fo.name;
                  return false;
                }
              });
            }

            var filterOperator = null;
            var filterValueObj = GF.getFilterValueObj(mapping, o.value);
            var filterName = filterValueObj.type;
            var filterValue = filterValueObj.value;
            if (o.operator != null) {
              if(cm.isComplexFilterObject){
                filterValueObj = GF.getFilterValueObj(mapping, o.operator);
                filterOperator = filterValueObj.value; 
              } else {
                filterOperator = o.operator;
              }
            }

            if(GF.returnFilterObj) {
              var obj = { value: filterValue };
              if(filterOperator != null) {
                obj.operator = filterOperator;
              }
              filterObj[filterName] = obj;
            }
            else {
              postData[filterName] = filterValue;
              if (filterOperator != null) {
                postData[filterName + 'Operator'] = filterOperator;
              }
            }
          }

        });
        if(GF.returnFilterObj){
          postData.filter = filterObj;
        }       
      }
      
      if(GF.includeWho){
        postData.postRequest.who = $("#cEmployee").val();	   	  
      }
      
      if(GF.dateOption === 'dateRange'){       	
        postData.postRequest.startDate = Dates.format($('#cStartDate').datepicker('getDate'), 'YYYY-MM-DD');	  
        postData.postRequest.endDate = Dates.format($('#cEndDate').datepicker('getDate'), 'YYYY-MM-DD');
      }
        
      if(GF.dateOption === 'weekOf'){       	
        postData.postRequest.date = Dates.format($('#cDate').datepicker('getDate'), 'YYYY-MM-DD');	  
      } 
      
      if(GF.dateOption === 'payPeriod'){
        postData.postRequest.startDate = Dates.format(GF.dateEntry.dateValue.from, 'YYYY-MM-DD');	  
        postData.postRequest.endDate = Dates.format(GF.dateEntry.dateValue.to, 'YYYY-MM-DD');
      }

      return postData;
    },

    emptyRecord: null,

    insertRow: function(doNotRender) {
      if(GF.setEmptyRecord) {
        GF.setEmptyRecord();
      }
      if (GF.emptyRecord != null) {
        var newExtent = jQuery.extend(true, {}, GF.emptyRecord);
        newExtent.newRow = true;
        
        var index = GFB.cRow != -1 ? GFB.cRow + 1 : GF.json.extents.length;
        GF.json.extents.splice(index, 0, newExtent);
        if(!doNotRender) {
          GF.render();
        }
        Navigation.setChangedData(true);
      }

    },

    copyRow: function(options) {
      options = options || {};
      var onBeforeRowChange = options.onBeforeRowChange;
      
      var newExtent = jQuery.extend(true, {}, GF.json.extents[GFB.cRow]);
      newExtent.newRow = true;

      // Fix for WFM-37976 : Assumed Off value for target week will always be FALSE in all Copy Actions even though source week has Assumed Off TRUE.
      newExtent.assumedOff = 'F';

      if(onBeforeRowChange) {
        onBeforeRowChange(newExtent);
      }
      GF.json.extents.splice(GFB.cRow + 1, 0, newExtent);
      GF.render();
      Navigation.setChangedData(true);
    },

    deleteRow: function(options) {
      options = options || {};
      var onBeforeRowChange = options.onBeforeRowChange;
      
      if (GF.deletedRows == null) {
        GF.deletedRows = [];
      }
      GF.deletedRows.push(GF.json.extents[GFB.cRow]);

      if (onBeforeRowChange) {
        onBeforeRowChange(GF.json.extents[GFB.cRow]);
      }

      GF.lastDataBeforeDelete = jQuery.extend(true, {}, GF.json);
      
      GF.json.extents.splice(GFB.cRow, 1);
      GF.render();
      Navigation.setChangedData(true);
    },

    getUnsavedColumnHtml: function(classes, showColumnCell, showUnsavedIcon) {
      var unsavedIcon = '<div class="unsavedIcon" ' + (showUnsavedIcon ? '' : ' style="display:none;" ') + '>'; 
      unsavedIcon += '<span title="' + Content.alerts.rowHasUnsavedChanges + '" class="fa-stack ">';
      unsavedIcon += '<i class="unsavedOuterIcon fa-stack-2x fa fa-circle"></i>';
      unsavedIcon += '<i class="unsavedInnerIcon fa-stack-1x fa fa-exclamation fa-inverse"></i>';
      unsavedIcon += '</span>';
      unsavedIcon += '</div>';
      
      return '<td class="unsavedCol c ' + classes + '"' + (showColumnCell ? '' : ' style="display:none;" ') + '>' + unsavedIcon +'</td>';
    },
    
    getUnsavedColumnFilterHtml: function(classes, showFilter) {
      return '<th class="unsavedCol ' + classes + '"' + (showFilter? '' : ' style="display:none;" ') + '></th>';
    },
    
    getUnsavedColumnHeaderHtml: function(rowSpan, classes, showHeader) {
      return '<th rowspan="' + rowSpan + '" class="unsavedCol c ' + classes + '"' + (showHeader? '' : ' style="display:none;" ') + '></th>';
    },

    render: function() {
      if(GF.renderSplitPanes){
        GF.multiPaneViews = [];  
                
        var multiPaneSelector = $('#Grid').find('.gridContainer');
        multiPaneSelector.html('');

        var multiPaneView = new MultiPaneView({ multiPaneSelector : multiPaneSelector,
                                                lockedColumn      : GF.lockedColumn,
                                                columnMappings    : GFB.columnMapping,
                                                records           : GF.json.extents,
                                                syncWidths        : GF.multiPaneViews.length > 0
                                              });
        GF.multiPaneViews.push(multiPaneView);
        multiPaneView.render();   
        $(document).ready(function() {
          setTimeout(function() {
            GF.syncTableHeights();
          }, 0);
        });
       
      } else {
        GF.renderTableHeader();
        var bodyStr = [];

        var hasUnsaved = GFB.showUnsavedColumn? GF.hasUnsavedRecord() : false;
        var isAltRow = false;
        $(GF.json.extents).each(function(i, o) {
          if (GFB.checkExtentPermissionForDisplay == null || !GFB.checkExtentPermissionForDisplay || ScreenPrefsController.checkPermissionForRowDisplay(o)) {
            var rowStr = [];
            var mustHighlight = GF.highlightFunction != null ? GF.highlightFunction(o) : false;
            var lockedRowClass = o.lockedByControllable ? ' isLocked ' : '';
            if (GF.isAltRowFunction && i > 0) {
              isAltRow = GF.useAltRow(isAltRow, GF.isAltRowFunction(GF.json.extents[i-1], o));
            }
            var customClass = o.customClass;
            rowStr.push('<tr class="data ' + (customClass ? customClass : '' ) + (mustHighlight ? ' highlightRow ' : '') + (isAltRow ? ' alt ' : '') + lockedRowClass +'" lang="' + i + '" name="dataRow' + i + '">');
            GFB.isAlt = false;

            if (!GFB.hideModColumn) {
              rowStr.push(GFB.getModColumnHtml(GFB.getAltClass(GFB.useAlt()), o));
            }
            
            if (GFB.showUnsavedColumn) {
              var classes = '';
              if (hasUnsaved) {
                classes += GFB.getAltClass(GFB.useAlt());
              }
              rowStr.push(GF.getUnsavedColumnHtml(classes, hasUnsaved, GF.isRecordUnsaved(o)));
            }
            
            $(GFB.columnMapping).each(function(i, cm) {
              if(cm.show && cm.visualCue) {
                var tooltip = (cm.visualCue.visualCueTooltip) ? Global.cleanText(cm.visualCue.visualCueTooltip) : '';
                rowStr.push('<td class = "visualCue ' + cm.visualCue.visualCueClass + '" title="' + tooltip + '" style = "display: none;"></td>');
              }
              else {
                rowStr.push(GFB.getDisplayCell(cm, o));
              }
            });
            rowStr.push('</tr>');
            bodyStr.push(rowStr.join(''));
          }

        });
        var str = [];
        if (GF.headerMapping && GF.json.extents.length > 0) {

          $(GF.headerMapping).each(function(i, hr) {
            var isFirst = true;
            $(hr).each(function(hmi, hm) {
              if (hm.show) {
                var parentColMapping = GFB.getColumnMapping(hm.parentCol);
                if (isFirst && hm.parentColIndex != 0) {
                  str.push('<tr class="data" lang="0">');
                  str.push('<td class="r" colspan="' + (hm.parentColIndex + GFB.getParentColspanOffset()) + '">' + hm.headerText + '</td>');
                  isFirst = false;
                }
                str.push(GFB.getDisplayCell(hm, GF.json.extents[0], parentColMapping.isAlt));
              }
            });
            if (!isFirst) {
              str.push('</tr>');
              str.push('<tr></tr>');
              str.push('<tr></tr>');
              str.push('<tr></tr>');
            }

          });

        }
        $(bodyStr).each(function(i, o) {
          str.push(o);
        });
        if (GFB.footerMapping && GF.json.extents.length > 0) {

          var isFirstFooterRow = true;
          $(GFB.footerMapping).each(function(i, fr) {
            var isFirst = true;
            var fAlt = false;
            $(fr).each(function(fmi, fm) {
              if (fm.show) {
                if (isFirstFooterRow) {
                  str.push('<tr></tr>');
                  str.push('<tr></tr>');
                  str.push('<tr></tr>');
                  isFirstFooterRow = false;
                }
                var parentColMapping = GFB.getColumnMapping(fm.parentCol);
                if (isFirst && fm.parentColIndex != 0) {
                  str.push('<tr class="data footerRow" lang="0" name="footerRow' + i + '">');
                  str.push('<td class="r" colspan="' + (fm.parentColIndex + GFB.getParentColspanOffset()) + '">' + fm.headerText + '</td>');
                  isFirst = false;
                }
                fAlt = parentColMapping.isAlt != null ? parentColMapping.isAlt : fAlt;
                str.push(GFB.getDisplayCell(fm, GF.json.extents[0], fAlt));
                fAlt = !fAlt;
              }
            });
            if (!isFirst) {
              str.push('</tr>');
            }

          });

        }

        $('#Grid tbody').html(str.join(''));
        
      }
      
      if (GF.additionalRender != null) {
        GF.additionalRender();
      }
      GF.clearHiddenText();
      GF.events();
      GFB.disableLockedRecords();

      Global.hideLoading();
      Global.formatTooltips();
      GF.refreshPreviousScroll();
    },

    refreshPreviousScroll: function() {
      if (GF.isSortable && GF.sortFiredColumn != null) {
        var column = $('thead tr th.sortable[lang="' + GF.sortFiredColumn + '"]');
        var gridParent = GFB.getGridParent($(column));
        if (gridParent != null) {
          $(gridParent).scrollLeft(GF.sortFiredScroll);
          GF.sortFiredScroll = null;
          GF.sortFiredColumn = null;
        }
      }
    },

    selectCell: function(obj) {
      if (!Overlay.isModalOverlayOpen() && $('#dValue').length === 0) {
      
        if (isNaN(parseInt($(obj).parent('tr').attr('lang')))) {
          return;
        }
        $('#Grid').scrollTo($(obj), 0, { offset:{top:0, left:-1*($(obj).parent().parent().parent().parent().width()-($(obj).width() + 40))}});
        GF.cGrid = parseInt($(obj).parent('tr').parent('tbody').parent('table').attr('lang'));
        GFB.cRow = parseInt($(obj).parent('tr').attr('lang'));
        GFB.refreshCellMovementVariables(obj);
        GFB.cCol = $(obj).attr('lang');

        $('#Grid tbody td').removeClass('currentFocus');
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

    events: function() {
      $('tr.data td.lookup.unlocked, tr.data td.editable.unlocked, tr.data td.unlocked.checkbox').unbind('click');
      $('tr.data td.lookup.unlocked, tr.data td.editable.unlocked, tr.data td.unlocked.checkbox').click(function(event) {
        if(event.target.className.includes('textwrap')) {
          GF.selectCell(event.target.parentElement);
        } else {
          GF.selectCell(event.target);
        }
      });

      $('tr.data td.unlocked.checkbox .additionalCheckFieldContainer').unbind('click').click(function(event) {
        GF.selectCell($(this).parent());
      });

      $('tr.data td.checkbox.unlocked input[type="checkbox"]').unbind('change');
      $('tr.data td.checkbox.unlocked input[type="checkbox"]').change(function(event) {

        var cell = $(event.target).parent('td');
        GFB.cRow = parseInt($(event.target).parent('td').parent('tr').attr('lang'));
        if (isNaN(GFB.cRow)) {
          GFB.cRow = parseInt($(event.target).parent().parent('td').parent('tr').attr('lang'));
          cell = $(event.target).parent().parent('td');
        }
        GFB.removeCurrentFocus();
        $(cell).addClass('currentFocus');
        GFB.refreshCellMovementVariables(cell);
        GFB.cCol = $(event.target).parent().attr('lang');
        GFB.setValue($(event.target).is(':checked'));

      });
      $('tr.data td.checkbox.unlocked input[type="checkbox"]').unbind('focus.setCurrent').bind('focus.setCurrent', function(event) {

        GF.isFromFocus = true;
        var cell = $(event.target).parent('td');

        GFB.cRow = parseInt($(event.target).parent('td').parent('tr').attr('lang'));
        GFB.cCol = $(event.target).parent().attr('lang');
        if (isNaN(GFB.cRow)) {
          GFB.cRow = parseInt($(event.target).parent().parent('td').parent('tr').attr('lang'));
          cell = $(event.target).parent().parent('td');
        }
        GFB.removeCurrentFocus();
        $(cell).addClass('currentFocus');
        GFB.refreshCellMovementVariables(cell);

      });

       $('td.note.unlocked div i').unbind('click');
       $('td.note.unlocked div i').unbind('mouseover');
       $('td.note.unlocked div i').unbind('mouseout');
       $('td.note.unlocked div i').bind({
         click: function(event) {
           GFB.removeCurrentFocus();
           var noteCell = $(this).parent().parent();
           noteCell.addClass('currentFocus');
           GFB.cRow = parseInt($(event.target).parent().parent('td').parent('tr').attr('lang'));
           GFB.cCol = $(event.target).parent().parent('td').attr('lang');
           var scrollDiv = (GF.options.scrollDivId != null ? $('#' + GF.options.scrollDivId) : null);
           
           var charLimitType = (noteCell.attr('note-type') === 'note') ? locale.charLimitNote : locale.charLimitReason;
           var limitError = charLimitType + "</br>" + "[[max]]" + locale.charLimitMax + "</br>" + "[[current]]" + locale.charLimitCurrent;
           var maxLength;
           if (noteCell.attr('note-maxlength') != null) {
             maxLength = parseInt(noteCell.attr('note-maxlength'), 10);
           } 
           else {
             maxLength = (noteCell.attr('note-type') === 'note') ? 128 : 255;
           }
           Overlay.textInput($(event.target).parent(), GFB.setNoteValue, $(event.target).parent().attr('lang'), GFB.getValue(), null, 4, 15, scrollDiv, maxLength, limitError, function() { GFB.removeCurrentFocus();} );
         },
         mouseover: function() {
           $(this).parent().addClass('hov');
         },

         mouseout: function() {
           $(this).parent().removeClass('hov');
         }
       });

       $('#Grid tbody input[type="checkbox"]').unbind('keydown');
       $('#Grid tbody input[type="checkbox"]').unbind('keyup');
       $('#Grid tbody input[type="checkbox"]').unbind('blur');
       $('#Grid tbody input[type="checkbox"]').bind({
         keydown: function(e) {
            GF.isFromFocus = false;
            if (e.keyCode == 9) {
              e.preventDefault();
            }
          },
          keyup: function(e) {
            if (e.keyCode == 9 && !e.shiftKey && !GF.isFromFocus) {
              GFB.moveToNextCell();
            }
            if (e.keyCode == 9 && e.shiftKey && !GF.isFromFocus) {
              GFB.moveToPreviousCell();
            }
            GF.isFromFocus = false;
          },
          blur: function() {
           $(this).parent().removeClass("currentFocus"); 
          }
       });

       GFB.modColumnEvents();

       GFB.multiSelectEvents();
       
       GFB.iconEvents();

       $(GFB.columnMapping).each(function(i, cm) {
         if(cm.show && cm.visualCue) {
           $('th.'+cm.visualCue.columnsClass).off().on({
             click: GF.hideColumn(cm),
             mouseenter: GF.onHover(cm),
             mouseleave: GF.offHover(cm),
           });
           $('.' + cm.visualCue.visualCueClass).off().on({
             click: GF.showColumn(cm),
             mouseenter: GF.onCueHover(cm),
             mouseleave: GF.offCueHover(cm),
           });
         }
       });

       if (GF.additionalEvents != null) {
         GF.additionalEvents();
       }

    },
    
    onModColumnClick: function(event) {
      GFB.removeCurrentFocus();

      GFB.cRow = parseInt($(event.target).parent().parent('td').parent('tr').attr('lang'));

      GFB.onModColumnIconClick(event);
    },
    
    hideColumn: function(cm) {
      return function() {
        $('.' + cm.visualCue.columnsClass).hide();
        $('.' + cm.visualCue.visualCueClass).show();
        if(cm.additionalColumnHideEvents) {
          cm.additionalColumnHideEvents(cm);
        }
      };
    },

    onHover: function(cm) {
      return function() {
        $('th.' + cm.visualCue.columnsClass).addClass('addBorderHighlight');
      };
    },

    offHover: function(cm) {
      return function() {
        $('th.' + cm.visualCue.columnsClass).removeClass('addBorderHighlight');
      };
    },

    showColumn: function(cm) {
      return function() {
        $('.' + cm.visualCue.columnsClass).show();
        $('.' + cm.visualCue.visualCueClass).hide();
        if(cm.additionalColumnShowEvents) {
          cm.additionalColumnShowEvents(cm);
        }
      };
    },

    onCueHover: function(cm) {
      return function() {
        $('.' + cm.visualCue.visualCueClass).addClass('cueHighlight');
      };
    },

    offCueHover: function(cm) {
      return function() {
        $('.' + cm.visualCue.visualCueClass).removeClass('cueHighlight');
      };
    },

    renderTableHeader: function() {
      var str = [];
      str.push('<tr>');
      var filterRow = [];
      if (GF.isFilterable) {
        filterRow.push('<tr class="filterRow">');
      }
      GFB.headerWrapData = {};

      var doubleHeader = false;
      $(GFB.columnMapping).each(function(i, cm) {
        if (cm.show && cm.headerWrap != null) {
          doubleHeader = true;
          if (GFB.headerWrapData[cm.headerWrap.name] == null) {
            GFB.headerWrapData[cm.headerWrap.name] = jQuery.extend(true, {}, cm.headerWrap);
            GFB.headerWrapData[cm.headerWrap.name].count = 1;
          }
          else {
            GFB.headerWrapData[cm.headerWrap.name].count++;
          }
        }
      });

      var rowSpan = (doubleHeader ? 2 : 1);
      GFB.isAlt = false;
      
      if (!GFB.hideModColumn) {
        var alt = GFB.getAltClass(GFB.useAlt());
        str.push('<th rowspan="' + rowSpan + '" class="modCol ' + alt + '" lang="modCol"></th>');
        filterRow.push('<th class="modCol ' + alt + '"></th>');
      }
      
      if (GFB.showUnsavedColumn) {
        var hasUnsaved = GF.hasUnsavedRecord();
        var classes = '';
        if (hasUnsaved) {
          classes += GFB.getAltClass(GFB.useAlt());
        }
        str.push(GF.getUnsavedColumnHeaderHtml(rowSpan, classes, hasUnsaved));
        filterRow.push(GF.getUnsavedColumnFilterHtml(classes, hasUnsaved));
      }
      
      var oldFilterObj = {};
      if (GF.isFilterable) {
        $(GF.previousFilter).each(function(i, filter) {
          oldFilterObj[filter.type] = filter;
        });
      }
      $(GFB.columnMapping).each(function(i, cm) {
        if (cm.show) {
          var altClass = GFB.getAltClass(GFB.useAlt());
          if (cm.headerWrap == null) {
            var headerText = (cm.headerText != null ? cm.headerText : (locale[cm.name] == null ? cm.name : locale[cm.name]));
            var sortDetail = GF.getSortDetail(cm.name);
            var sortIndicator = '';
            if (sortDetail != null) {
              sortIndicator += '<div class="sortIndicator"><i class="fa fa-arrow-' + (sortDetail.order == 'asc' ? 'up' : 'down') + '"></i></div>';
            }
            var sortable = GF.isSortable && !cm.notSortable ? ' sortable' : '';
            var columnsClass = cm.columnsClass ? ' ' + cm.columnsClass : '';
            if(cm.visualCue) {
              var tooltip = (cm.visualCue.visualCueTooltip) ? Global.cleanText(cm.visualCue.visualCueTooltip) : '';
              str.push('<th class = "visualCue ' + cm.visualCue.visualCueClass + '" title="' + tooltip + '" style = "display: none;"></th>');
            }
            else {
              var headerTooltip = (cm.headerTooltip) ? Global.cleanText(cm.headerTooltip) : '';
              str.push('<th colspan="' + cm.colSpan + '" rowspan="' + rowSpan + '" class="' + altClass + sortable + columnsClass + '" lang="' + cm.name + '" title="' + headerTooltip + '"><span class="headerText">' + headerText + '</span>' +  sortIndicator + '</th>');
            }
            if (GF.isFilterable) {
              var filterName = (cm.filterName != null ? cm.filterName : cm.name);
              var col = '<th colspan="' + cm.colSpan + '" class="' + altClass + '" lang="' + filterName + '">';
              if (cm.isFilterable == null || cm.isFilterable) {
                if (cm.filterOptions != null) {
                  var customFilter = '';
                  $(cm.filterOptions.values).each(function(i, o) {
                    if (customFilter !== '') {
                      customFilter += cm.filterOptions.separator != null ? cm.filterOptions.separator : '&nbsp;/&nbsp;';
                    }
                    customFilter += GF.getFilterControl(cm, o.name, oldFilterObj);
                  });
                  col += customFilter;
                }
                else if (cm.displayType == 'display') {
                  col += GF.getFilterControl(cm, filterName, oldFilterObj);
                }
                else if (cm.displayType == 'checkbox' && cm.customFilterFunction != null) {
                  col += cm.customFilterFunction();
                }
                else if(cm.isFilterRowEditable) {
                  col += GF.getFilterControl(cm, filterName, oldFilterObj);
                }
              }

              col += '</th>';
              filterRow.push(col);
            }
          }
          else {
            var hwData = GFB.headerWrapData[cm.headerWrap.name];
            if (!hwData.isRendered) {
              var headerText = (hwData.description != null ? hwData.description : (locale[hwData.name] == null ? hwData.name : locale[hwData.name]));
              var isAlt = GFB.useAlt();
              str.push('<th colspan="' + hwData.count + '" class="' + GFB.getAltClass(isAlt) + ' headerWrapColumn">' + headerText + '</th>');
              hwData.isRendered = true;
              hwData.isAlt = isAlt;
            }

          }
        }
      });
      str.push('</tr>');
      if (GF.isFilterable) {
        filterRow.push('</tr>');
      }
      if (doubleHeader) {
        str.push('<tr>');
        $(GFB.columnMapping).each(function(i, cm) {
          if (cm.show) {
            if (cm.headerWrap != null) {
              var headerText = (cm.headerText != null ? cm.headerText : (locale[cm.name] == null ? cm.name : locale[cm.name]));
              str.push('<th class="' + GFB.getAltClass(GFB.useAlt(cm.headerWrap)) + ' wrappedHeaderCol">' + headerText + '</th>');
            }
          }
        });
        str.push('</tr>');
      }
      var headerContent = str.join('');
      if (GF.isFilterable) {
        headerContent += filterRow.join('');
      }

      $('#Grid thead').html(headerContent);
      if (GF.isFilterable) {
        GF.bindFilterHeaderEvents();
      }

      if (GF.isSortable) {
        GF.bindSortHeaderEvents();
      }
    },

    getFilterControl: function(cm, filterName, oldFilterObj) {
      var inClass = '';
      var col = '';
      var oldValue = (oldFilterObj[filterName] != null ? oldFilterObj[filterName].value : "");
      if (cm.mask == 'integer' || cm.mask == 'duration' || cm.mask == 'duration24' || cm.mask == 'duration546' || cm.mask == 'durationDay' || cm.mask == 'militaryTime' || cm.mask == 'decimal' || cm.mask == 'decimalHour') {
        var oldOperator = "";
        if (oldFilterObj[filterName] != null && oldFilterObj[filterName].operator != null) {
          oldOperator = oldFilterObj[filterName].operator;
        }
        col += '<select class="operator" lang="' + filterName + '">';
        col += '<option value=">" ' + (oldOperator == '>' ? 'selected="selected"' : "") + '>&gt;</option>';
        col += '<option value=">=" ' + (oldOperator == '>=' ? 'selected="selected"' : "") + '>&gt;=</option>';
        col += '<option value="=" ' + (oldOperator == '=' ? 'selected="selected"' : "") + '>=</option>';
        col += '<option value="<=" ' + (oldOperator == '<=' ? 'selected="selected"' : "") + '>&lt;=</option>';
        col += '<option value="<" ' + (oldOperator == '<' ? 'selected="selected"' : "") + '>&lt;</option>';
        col += '</select>';
        inClass = 'filterSmall';
        
        if (oldValue != "") {
          if ((cm.mask == 'duration' || cm.mask == 'duration24' || cm.mask == 'duration546')) {
            oldValue = Dates.getDurationDisplay(oldValue);
          }
          
          if (cm.mask == 'durationDay') {
            oldValue = Dates.getDurationDisplay(oldValue, 'duration_format_D', cm.getFilterDayDuration());
          }
        }

      }
      if (cm.mask == 'date' || cm.mask == 'dateTime') {
        inClass += ' dateFilter';
        if (oldValue != "") {
          oldValue = Dates.format(oldValue, Content.general.dFTypes[1]);
        }
      }
      if (cm.mask == 'militaryTime') {
        inClass += ' timeFilter';
        if (oldValue != "") {
          oldValue = Dates.format(oldValue, Content.general.dFTypes[5]);
        }
      }
      col += '<input type="text" lang="' + filterName + '" class="filter ' + inClass + '" value="' + oldValue + '"/>';
      return col;
    },

    sortExtents: function() {
    //if a screen is to be sorted, but does not have paging, a sortOverrideFunction must be defined.    
      if (GF.sortOverrideFunction != null) {
        GF.sortOverrideFunction(GF.sortDetails);
      }
      else if (GF.isPaged) {
        GF.sortColumn = null;
        GF.sortOrder = null;
        if (GF.sortDetails != null && GF.sortDetails.length > 0) {
          GF.sortColumn = GF.sortDetails[0].colName;
          GF.sortOrder = GF.sortDetails[0].order == 'asc' ? 'ascending' : 'descending';
        }
        GF.get();
      }
    },

    getSortDetail: function(colName) {
      var sortDetail = null;
      $(GF.sortDetails).each(function(i, o) {
        if (o.colName == colName) {
          sortDetail = o;
        }
      });
      return sortDetail;
    },

    sortDetails: [],

    bindSortHeaderEvents: function() {
      $('thead tr').not('.filterRow').find('th.sortable').unbind('click');
      $('thead tr').not('.filterRow').find('th.sortable').bind({
        click: function(event) {
          var colName = $(this).attr('lang');
          var found = false;
          var indexToRemove = -1;
          $(GF.sortDetails).each(function(i, o) {
            if (o.colName == colName) {
              if (o.order == 'desc') {
                indexToRemove = i;
              }
              else {
                o.order = 'desc';
              }
              found = true;
            }
          });
          if (!found) {
            var cm = GF.getColumnMapping(colName);
            if (cm != null) {
              var sortObj = { colName: colName, property:cm.mapping, order:'asc'};
              GF.sortDetails = [ sortObj ];
              //GF.sortDetails.splice(0, 0, sortObj);

            }
          }
          if (indexToRemove != -1) {
            GF.sortDetails.splice(indexToRemove, 1);
          }
          var gridParent = GFB.getGridParent($(event.target));
          if (gridParent != null && $(gridParent).scrollLeft() !== 0) {
            GF.sortFiredScroll = $(gridParent).scrollLeft();
            GF.sortFiredColumn = colName;
          }
          GF.sortExtents();
        }
      });
    },

    bindFilterHeaderEvents: function() {
      Criteria.initializeDatePicker('tr.filterRow input.dateFilter', {
        firstDay: Dates.getStartOfWeekNumber() - 1,
        dateFormat: Dates.getDatepickerFormat(Content.general.dFTypes[1]),
        onSelect: function(dateText, inst) {
          $('tr.filterRow input.dateFilter').datepicker('hide');
          GF.fireFilter();
        }
      });
      

      $('tr.filterRow input.timeFilter').unbind('blur').bind('blur', function(event){
        var timeEntry = $(this).val();
        if (timeEntry){
          var time = Dates.formatTimeDisplay(timeEntry, Content.general.dFTypes[5]);        
          $(this).val(time);
        }
      });

      $('tr.filterRow').find('input[type="text"].filter').not('.dateFilter').on('keyup', function(event) {

        if (event.keyCode == 13) {
          $('tr.filterRow input.dateFilter').datepicker('hide');
          if (GF.pagingValidationFunction == null) {
            GF.fireFilter();
          }
          else {
            GF.pagingValidationFunction(GF.fireFilter);
          }
        }
      });
      $('tr.filterRow th .operator').selectmenu({
        width: $('tr.filterRow th .operator').width() + 15
      });
    },

    validateFilter: function() {
      var isValid = true;
      $('tr.filterRow th').each(function(i, o) {
        if ($(o).find('input.filter').length > 0) {

          var type = $(o).attr('lang');
          var cm = GF.getColumnMapping(type);

          if (cm.filterOptions != null) {
            $(cm.filterOptions.values).each(function(i, fo) {
              var innerFilterType = fo.name;
              var filterElement = $(o).find('input.filter[lang="' + innerFilterType + '"]');

              var value = $(filterElement).val();
              if (value !== '') {
                var filterObj = GF.getFilterInnerObject(innerFilterType, value, cm, filterElement, o, type);
                if (filterObj.isValid != null && !filterObj.isValid) {
                  isValid = false;
                  return false;
                }
              }
            });
          }
          else {
            var filterElement = $(o).find('input.filter');
            var value = $(filterElement).val();
            if (value !== '') {
              var filterObj = GF.getFilterInnerObject(type, value, cm, filterElement, o);
              if (filterObj.isValid != null && !filterObj.isValid) {
                isValid = false;
              }
            }
          }


        }
        if (!isValid) {
          return false;
        }
      });
      return isValid;
    },

    fireFilter: function() {
      if (GF.validateFilter()) {
        if (GF.clearChanges != null) {
          GF.clearChanges();
        }
        if (GF.onFilterChange != null) {
          GF.onFilterChange(GF.getFilter());
        }
        else {
          GF.get();
        }
      }
    },

    getFilter: function() {
      var filter = [];
      $('tr.filterRow th').each(function(i, o) {
        if ($(o).find('input.filter').length > 0) {

          var type = $(o).attr('lang');
          var cm = GF.getColumnMapping(type);

          if (cm.filterOptions != null) {
            $(cm.filterOptions.values).each(function(i, fo) {
              var innerFilterType = fo.name;
              var filterElement = $(o).find('input.filter[lang="' + innerFilterType + '"]');

              var value = $(filterElement).val();
              if (value !== '') {
                filter.push(GF.getFilterInnerObject(innerFilterType, value, cm, filterElement, o, type));
              }
            });
          }
          else {
            var filterElement = $(o).find('input.filter');
            var value = $(filterElement).val();
            if (value !== '') {
              filter.push(GF.getFilterInnerObject(type, value, cm, filterElement, o));
            }
          }


        }
      });
      GF.previousFilter = filter;
      return filter;
    },

    getFilterInnerObject: function(type, value, cm, filterElement, headerCell, parentColumnMappingType) {

      var filterObj = {};
      filterObj.type = type;
      filterObj.value = value;
      
      var mask = cm.mask;
      if (mask != null) {
        if(mask == 'dateTime' && value.indexOf(' ') == -1){
           //currently filters on dateTime columns have no timestamp - this adds that in. May be 
           //removed during future refactoring 
           var temp = Dates.format(filterElement.val(),Content.general.dFTypes[1]);
           if(!temp || temp == null || temp.indexOf('NaN')>-1){
             temp = Dates.format(filterElement.datepicker('getDate'),Content.general.dFTypes[1]);
           }           
           temp = temp + ' 00:00:00';
           filterElement.val(temp);
        }
        if (Validation.validate(mask, filterElement)) {
          if (mask == 'duration' || mask == 'duration24' || mask == 'duration546') {
            filterObj.value = Dates.convertDurationDisplay(filterObj.value, null, mask);
          }
          if (mask == 'durationDay') {
            filterObj.value = Dates.convertDurationDisplay(filterObj.value, 'duration_format_D', null, cm.getFilterDayDuration());
          }
          if (mask == 'date' && filterElement.hasClass('dateFilter')) {
            var dateTimeValue = Dates.revertForJSON(filterElement.datepicker('getDate'));
            filterObj.value = [dateTimeValue[0], dateTimeValue[1], dateTimeValue[2]];
          }
          if (mask == 'dateTime' && filterElement.hasClass('dateFilter')) {
              var dateTimeValue = Dates.revertForJSON(filterElement.datepicker('getDate'));
              filterObj.value = [dateTimeValue[0], dateTimeValue[1], dateTimeValue[2], dateTimeValue[3], dateTimeValue[4], dateTimeValue[5]];
          }
          if (mask == 'militaryTime' && filterElement.hasClass('timeFilter')) {
            var timeValue = Dates.convertTimeDisplay(filterObj.value);
            filterObj.value = [1970, 1, 1, timeValue.hours, timeValue.minutes, 0, 0];
          }
        }
        else {
          filterObj.isValid = false;
        }

      }

      if ($(headerCell).find('select.operator[lang="' + type + '"]').length > 0) {
        filterObj.operator = $(headerCell).find('select.operator[lang="' + type + '"] option:selected').val();
      }
      if (parentColumnMappingType != null) {
        filterObj['parentColumnMappingType'] = parentColumnMappingType;
      }
      return filterObj;
    },

    reloadHiddenText: function(row, selector) {
      var rowSelector = row != null ? row : $('#Grid tbody tr');
      selector = selector != null ? selector : 'td.hideCellText';
      $(rowSelector).find(selector).each(function(i, o) {
        if(jQuery.data(o, 'value') == undefined) {
          jQuery.data(o, 'value', $(o).html());
        }
        else if($(o).html() === '') {
          $(o).html(jQuery.data(o, 'value'));
          jQuery.data(o, 'value', '');
        }
      });
    },

    clearHiddenText: function(row, selector) {
      var rowSelector = row != null ? row : $('#Grid tbody tr');
      selector = selector != null ? selector : 'td.hideCellText';
      $(rowSelector).find(selector).each(function(i, o) {
        if (jQuery.data(o, 'value') == null || jQuery.data(o, 'value') == '') {
          jQuery.data(o, 'value',  $(o).html());
        }
      });
      $(rowSelector).find(selector).html('');
    },
    
    highlightAltRows: function(isAltRowFunction){
      if (GF.json && GF.json.extents) {
        var $rows = $('#Grid tbody tr.data');
        if ($rows.length > 0) {
          var isAltRow = false;
          $.each(GF.json.extents, function(i, o) {
            var $row = $rows.filter('[name=dataRow' + i + ']');
            $row.removeClass('alt');
            if (i > 0) {
              isAltRow = GF.useAltRow(isAltRow, isAltRowFunction(GF.json.extents[i-1], o));
            }
            if (isAltRow) {
              $row.addClass('alt');
            }
          });
        }
      }
    },
    
    useAltRow: function(isAltRow, shouldAltRow) {
      return shouldAltRow? !isAltRow : isAltRow;
    },
    
    hasUnsavedRecord: function(){
      var unsavedRecords = [];
      if (GF.json && GF.json.extents) {
        unsavedRecords = GF.json.extents.filter(function(o){
          return GF.isRecordUnsaved(o);
        }); 
      }
      return unsavedRecords.length > 0;
    },
    
    isRecordUnsaved: function(record){
      return record.isModified || record.newRow;
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
    
    previousFilter: [],
    basePagingTarget: 'div.pagingTarget',
    eof: 0

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
      
      var oldFilterObj = {};
      if (GF.isFilterable) {
        $(GF.previousFilter).each(function(i, filter) {
          oldFilterObj[filter.type] = filter;
        });
      }
      
      var headerMarkup = [];
      headerMarkup.push('<tr>');
      GFB.isAlt = false;

      
      var filterRow = [];
      if (GF.isFilterable) {
        filterRow.push('<tr class="filterRow">');
      }
      
      if (!hideModColumn) {
        headerMarkup.push('<th rowspan="1"></th>');
      }

      if(footerRowHeaderOnly) {
        GFB.isAlt = !hideModColumn;
      }

      for (var i = 0, columnMappingsLength = columnMappings.length; i < columnMappingsLength; i++) {
        var columnMap = columnMappings[i];
        var isAlt = GFB.getAltClass(GFB.useAlt());
        if (columnMap.show) {
          var headerText = (columnMap.headerText != null ? columnMap.headerText :
                            (locale[columnMap.name] == null ? columnMap.name : locale[columnMap.name]));
          var columnClass = columnMap.columnsClass != null ? columnMap.columnsClass : '';
          headerMarkup.push('<th colspan="' + columnMap.colSpan + '" rowspan="1" class="' +
                            isAlt + ' ' + columnClass + '">' + headerText + '</th>');
        }
       
        if (GF.isFilterable) {
          var filterName = (columnMap.filterName != null ? columnMap.filterName : columnMap.name);
          var col = '<th colspan="' + columnMap.colSpan + '" class="' + isAlt + '" lang="' + filterName + '">';
          if (columnMap.isFilterable == null || columnMap.isFilterable) {
            if (columnMap.filterOptions != null) {
              var customFilter = '';
              $(columnMap.filterOptions.values).each(function(i, o) {
                if (customFilter !== '') {
                  customFilter += columnMap.filterOptions.separator != null ? columnMap.filterOptions.separator : '&nbsp;/&nbsp;';
                }
                customFilter += GF.getFilterControl(columnMap, o.name, oldFilterObj);
              });
              col += customFilter;
            }
            else if (columnMap.displayType == 'display') {
              col += GF.getFilterControl(columnMap, filterName, oldFilterObj);
            }
            else if (columnMap.displayType == 'checkbox' && columnMap.customFilterFunction != null) {
              col += columnMap.customFilterFunction();
            }
            else if(columnMap.isFilterRowEditable) {
              col += GF.getFilterControl(columnMap, filterName, oldFilterObj);
            }
          }

          col += '</th>';
          filterRow.push(col);
        }
        
      }  
      
      headerMarkup.push('</tr>');    
      
      if (GF.isFilterable) {
        filterRow.push('</tr>');
      }


      if (GF.isFilterable) {
        headerMarkup = headerMarkup.concat(filterRow);
      }

      if (GF.isFilterable) {
        GF.bindFilterHeaderEvents();
      }

      if (GF.isSortable) {
        GF.bindSortHeaderEvents();
      }
               
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

        if (columnMapping.name === GF.lockedColumn) {
          leftPane = false;
        }
      }
    }

    function initTables() {

      $multiPaneSelector.append($('#tableTemplate').html());
      $leftPaneSelector = $multiPaneSelector.find('.pane1');
      $rightPaneSelector = $multiPaneSelector.find('.pane2');

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

                  GF.syncTableHeights();
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
