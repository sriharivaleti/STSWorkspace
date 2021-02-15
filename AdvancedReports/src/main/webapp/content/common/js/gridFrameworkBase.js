//# sourceURL=GridFrameworkBase
var GFB = (function() {

  return {

    options: {},

    MOD_COLUMN: {
      INSERT: 'insert',
      COPY: 'copy',
      DELETE: 'delete'
    },
    
    init: function(options) {
      GFB.options = options;
      GFB.columnMapping = options.columnMapping;
      GFB.headerMapping = options.headerMapping;
      GFB.footerMapping = options.footerMapping;
      GFB.resetMappingFunction = options.resetMappingFunction;
      GFB.hideModColumn = options.hideModColumn;
      GFB.modColumnMapping = GFB.loadModColumnMapping(options.modColumnMapping);
      GFB.onModColumnClick = options.onModColumnClick;
      GFB.insertRow = options.insertRow;
      GFB.copyRow = options.copyRow;
      GFB.deleteRow = options.deleteRow;
      GFB.showUnsavedColumn = options.showUnsavedColumn;
      GFB.deleteAltType = options.deleteAltType;
      GFB.externalDropDownTypes = options.externalDropDownTypes;
      GFB.previousTabControlSelectorParent = options.previousTabControlSelectorParent;
      GFB.previousTabControlSelector = options.previousTabControlSelector;
      GFB.checkExtentPermissionForDisplay = options.checkExtentPermissionForDisplay;
      GFB.checkForDropDownParameters();
      GFB.initDateFormat();
    },

    initDateFormat: function() {
      GFB.dateFormat = Content.general.dFTypes[1];
    },

    getDropDownColumnNames: function() {
      var columnNames = [];
      $(GFB.columnMapping).each(function(i, o) {
        if (o.displayType == 'lookup' && o.show && o.dropDownType != null && o.dropDownType != '') {
          columnNames.push(o.name);
        }
      });
      if (GFB.externalDropDownTypes != null) {
        $(GFB.externalDropDownTypes).each(function(i, o) {
          if ($.inArray(o, columnNames) == -1) {
            columnNames.push(o);
          }
        });
      }
      return columnNames;
    },

    checkForDropDownParameters: function() {
      var udfFieldData = [{ name:'payrollUdf1', dropDownType:'payrollUDF1' },
                          { name:'payrollUdf2', dropDownType:'payrollUDF2' },
                          { name:'payrollUdf3', dropDownType:'payrollUDF3' },
                          { name:'payrollUdf4', dropDownType:'payrollUDF4' }];

      $(GFB.getDropDownColumnNames()).each(function(i, o) {
        var columnMap = null;
        $(GFB.columnMapping).each(function(i, columnMapping) {
          if (columnMapping.name == o) {
            columnMap = columnMapping;
            return false;
          }
        });
        if (columnMap == null) {
          $(udfFieldData).each(function(i, mapping) {
            if (mapping.name == o) {
              columnMap = mapping;
              return false;
            }
          });
        }
        Search2.getDropDownValues(columnMap.dropDownType, GFB.loadDropDownValues);

      });
    },

    loadDropDownValues: function(dropDownType, values) {
      if (GFB.dropDownValues == null) {
        GFB.dropDownValues = {};
      }
      GFB.dropDownValues[dropDownType] = values;
    },

    getColumnMapping: function(name, exclusive) {
      if (GFB.options.getColumnMappingFunction == null)
      {
        throw "There is no getColumnMappingFunction in the GFB.options defined.";
      }
      else {
        return GFB.options.getColumnMappingFunction(name, exclusive);
      }
    },

    getInstanceSelector: function() {
      if (GFB.options.getInstanceSelectorFunction == null)
      {
        throw Content.general.GFBInstanceSelectorFunctionNeeded;
      }
      else {
        return GFB.options.getInstanceSelectorFunction();
      }
    },

    getDataContext: function(cRow) {
      if (GFB.options.getDataContextFunction == null)
      {
        throw Content.general.GFBDataContextFunctionNeeded;
      }
      else {
        return eval(GFB.options.getDataContextFunction(cRow));
      }
    },

    selectCell: function(obj) {
      if (GFB.options.selectCellFunction == null)
      {
        throw "There is no selectCellFunction in the GFB.options defined.";
      }
      else {
        return GFB.options.selectCellFunction(obj);
      }
    },

    lockedClass: 'isLocked',
    manualCalcClass: 'manualCalc',

    scrollToObject: function(success) {
      if (GFB.scrollToSelector != null) {
        if(success){
          $.scrollTo($(GFB.scrollToSelector),10, success);
        }
        else{
          $.scrollTo($(GFB.scrollToSelector),10);
        }
        GFB.scrollToSelector = null;
      }
    },

    setScrollToObj: function(obj) {
      GFB.scrollToSelector = GFB.getSelector(obj);
      //alert(Detail.scrollToSelector)
    },

    getSelector: function(obj) {
      var o = $(obj);
      var str = o.prop('tagName');
      if (o.prop('id') != '') {
        str += '#' + o.attr('id');
      }
      if (o.prop('className') != null && o.prop('className') != '') {
        str += '.' + o.prop('className').replace(' hov', '').replace(/\s/g, '.');
      }
      str += GFB.formatAttrValue('lang', o);
      str += GFB.formatAttrValue('name', o);
      var parentCountLimit = 5;
      var parentCount = 0;
      if (parentCountLimit >= GFB.getSelector_parentCount && o.parent() != null) {
        GFB.getSelector_parentCount++;
        str = GFB.getSelector(o.parent()) + ' ' + str;
      }
      else {
        GFB.getSelector_parentCount = 0;
      }
      return str;

    },

    getSelector_parentCount: 0,

    formatAttrValue: function(attr, o) {
      var str = '';
      if (o.attr(attr) != null && o.prop(attr) != '') {
        str = '[' + attr + '="' + o.attr(attr) + '"]';
      }
      return str;
    },

    scrollToSelector: null,

    disableLockedRecords: function() {
      var sel = '.' + GFB.lockedClass;
      $(sel + ' *').not('div, textarea').prop('disabled', true);
      $(sel + ' textarea').prop('readonly', 'true');

      $(sel + ' *').not('div.expander div.header').not('div.expander div.header span.showhide').not('td.multiselect').unbind('click');
      $(sel + ' *').not('div.expander div.header').not('div.expander div.header span.showhide').not('td.multiselect').unbind('mouseover');
      $(sel + ' *').not('div.expander div.header').not('div.expander div.header span.showhide').not('td.multiselect').unbind('mouseout');
      $(sel + ' .editable').removeClass('editable');
      $(sel + ' .lookup').removeClass('lookup');
      $(sel + ' .unlocked').removeClass('unlocked');
      
      $('.' + GFB.manualCalcClass).prop('disabled', false);
      $('.' + GFB.manualCalcClass).closest('td').addClass('unlocked');
      
    },

    buildPath: function(path) {
      if (path.indexOf('{date}') != -1) {
        path = path.replace('{date}', Dates.format($('#cDate').datepicker('getDate'), 'YYYY-MM-DD'));
      }
      if (path.indexOf('{startDate}') != -1) {
        path = path.replace('{startDate}', Dates.format($('#cStartDate').datepicker('getDate'), 'YYYY-MM-DD'));
      }
      if (path.indexOf('{endDate}') != -1) {
        path = path.replace('{endDate}', Dates.format($('#cEndDate').datepicker('getDate'), 'YYYY-MM-DD'));
      }
      if (path.indexOf('{afterLastHyphen}') != -1) {
        var who = $('#cEmployee').val();
        who = who.split('-');
        who = who[who.length-1];
        path = path.replace('{afterLastHyphen}', who);
      }
      return path;
    },

    isTimeEditable: function(type) {
      type = parseInt(type);
      var r = false;
      switch(type) {
      case 0:
      case 7:
      case 8:
      case 5:
        r = true;
        break;
      case 1:
      case 2:
        if (ScreenPrefs.TimepairBasedAbsenceEnabled) {
          r = true;
        }
        break;
      default:
        break;
      }
      //return 'edit';
      return r;
    },

    getValue: function(cCol, cRow) {

      if (cCol == null) { cCol = GFB.cCol; }
      if (cRow == null) { cRow = GFB.cRow; }
      var cell = $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + cCol + '"]');
      var o = GFB.getDataContext(cRow);

      var returnValue = null;

      var cm = GFB.getColumnMapping(cCol);
      if (cm != null) {
        switch (cm.displayType) {
        case ('lookup'):
          var val = '';
          try {
            var lookupObj = eval('o.' + cm.mapping);
            if (lookupObj != null) {
              if (cm.reverseIdValue) {
                val = lookupObj.name;
              }
              else {
                val = lookupObj.id;
              }

            }
          }
          catch (ex) {

          }
          returnValue = val;
          break;
        case ('note'):
        case ('checkbox'):
          returnValue = eval('o.' + cm.mapping);
          break;
        case ('display'):
        case ('editable'):
          var ev = null;
          if(cm.fieldCanBeEmpty && (eval('o.' + cm.mapping) == '')) {
            ev = o[cm.mapping];
          }
          else{
            switch (cm.mask) {
            case 'militaryTime':
              returnValue = eval('Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[5])');
              break;
            case 'date':
              returnValue = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]) : "")');
              break;
            case 'dateTime':
              returnValue = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]) : "")');
              break;
            case 'day':
              returnValue = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]).toUpperCase() : "")');
              break;
            case 'duration':
            case 'duration24':
            case 'duration546':
            case 'durationNegative':
              var durationValue = Dates.getDurationDisplay(eval('o.' + cm.mapping));
              returnValue = durationValue;
              break;
            case 'durationDay':
              var durationValue = Dates.getDurationDisplay(eval('o.' + cm.mapping), 'duration_format_D', eval('o.' + cm.dayDurationMapping));
              returnValue = durationValue;
              break;
            case 'rate':
            case 'decimal':
            case 'decimalHour':
              returnValue = eval('o.' + cm.mapping);
              if (cm.roundTo != null && !isNaN(parseInt(cm.roundTo))) {
                returnValue = CSMath.round(returnValue, cm.roundTo, true);
              }
              else if (parseInt(returnValue) == parseFloat(returnValue)) {
                returnValue = CSMath.round(returnValue, 1, true);
              }
              else {
                returnValue = CSMath.round(returnValue, 3);
              }
              break;
            default:
              returnValue = eval('o.' + cm.mapping);
              break;
            }
          }
          break;
        case ('multiselect'):
          var obj = eval('o.' + cm.mapping);
          returnValue = obj.itemsSelected;
          break;
        default:
          break;
        }
      }


      return returnValue;



    },

    dateFormat: Content.general.dFTypes[1],

    getLookupObject: function(cCol, cRow) {
      if (cCol == null) { cCol = GFB.cCol; }
      if (cRow == null) { cRow = GFB.cRow; }
      var cell = $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + cCol + '"]');
      var o = GFB.getDataContext(cRow);
      var returnValue = null;
      var cm = GFB.getColumnMapping(cCol);
      if (cm.displayType == 'lookup') {
        returnValue = eval('o.' + cm.mapping);
        if (returnValue == '') {
          returnValue = null;
        }
      }

      return returnValue;
    },

    getDisplayCell: function(cm, o, isAlt) {
      var c = '';
      if (cm.show) {
        var colSpan = (cm.colSpan != null ? cm.colSpan : 1);
        var isLocked = cm.displayType == 'display' || (cm.isLocked != null && cm.isLocked);
        var addLockClass = (!isLocked ? ' orig_unlocked ' : ' orig_locked ');
        if (cm.checkLockedFunction != null) {
          isLocked = cm.checkLockedFunction(o);
        }
        var isLockedClass = (isLocked ? ' locked ' : ' unlocked ') + addLockClass;
        var cellTooltip = '';
        if (cm.tooltip != null) {
          if (Utils.isString(cm.tooltip)) {
            cellTooltip = Global.cleanText(cm.tooltip);
          } else if (Utils.isFunction(cm.tooltip)) {
            cellTooltip = Global.cleanText(cm.tooltip(eval(o)));
          }
        }
        var isAltCell = (isAlt != null ? isAlt : GFB.useAlt(cm.headerWrap));
        var altClass = GFB.getAltClass(isAltCell);
        var addClass = cm.addClass != null ? (' ' + cm.addClass + ' ') : '';
        cm.isAlt = isAltCell;
        switch (cm.displayType) {
        case ('lookup'):
          var val = '';
          var title = '';
          var lookupObj = null;
          try {
            lookupObj = eval('o.' + cm.mapping);
            if (lookupObj == '') {
              lookupObj = null;
            }
          }
          catch (Exception) {

          }
          if (lookupObj != null) {
            if (cm.reverseIdValue) {
              val = (lookupObj.name !== null && lookupObj.name !== undefined) ? lookupObj.name : '';
              title = (lookupObj.id !== null && lookupObj.id !== undefined) ? lookupObj.id : '';
            }
            else {
              if ((typeof lookupObj) == 'string') {
                val = lookupObj;
                title = lookupObj;
              }
              else {
                val = (lookupObj.id !== null && lookupObj.id !== undefined) ? lookupObj.id : '';
                title = (lookupObj.name !== null && lookupObj.name !== undefined) ? lookupObj.name : '';
              }
            }
          }
          if(cm.hideTitle) {
            title = '';
          }
          c = '<td colspan="' + colSpan + '" class="c ' + addClass + isLockedClass + ((isLocked) ? '' : cm.displayType) + ' ' + altClass + ' ' +
            GFB.getHWClass(cm.headerWrap) + '" title="' + (title || "") + '" lang="' + cm.name + '" ' + ((cm.parent != null && cm.parent != '') ? ('name="' + cm.parent + '"') : '') + '>' + val + '</td>';
          break;
        case ('checkbox'):
          var disabledText = (isLocked ? ' disabled="disabled" ' : '');
          var isDisabled = (typeof (cm.isDisabled) === 'function') ? cm.isDisabled(o) : cm.isDisabled;
          if (isDisabled) {
            disabledText = ' disabled="disabled" ';
            isLockedClass = isLockedClass.replace(' unlocked ', ' locked ');
          }
          if (cm.mask != null && disabledText == '') {
            switch (cm.mask) {
            case 'uteWhoMe':
              if (!Criteria.isUteWhoMe(GFB.selectedEmpId)) {
                disabledText = ' disabled="disabled" ';
              }
              break;
            case '!uteWhoMe':
              if (Criteria.isUteWhoMe(GFB.selectedEmpId)) {
                disabledText = ' disabled="disabled" ';
              }
              break;
            default:
              break;
            }
          }
          var checkedStatus = '';
          try {
            checkedStatus = (eval('o.' + cm.mapping) ? 'checked="checked"' : '');
          }
          catch (Exception) {
          }
          var checkContent = '<input type="checkbox" ' + checkedStatus + disabledText + ' />';
          if (cm.extraField != null) {
            checkContent += '<span class="additionalCheckField" >' + eval('(o.' + cm.extraField.mapping + ' != null ? o.' + cm.extraField.mapping + ' : "")') + '</span>';
            checkContent = '<div class="additionalCheckFieldContainer" lang="' + cm.name + '">' + checkContent + '</div>';
          }
          c = '<td colspan="' + colSpan + '" title="' + cellTooltip + '" class="c ' + addClass + isLockedClass + cm.displayType + ' ' + altClass + ' ' + GFB.getHWClass(cm.headerWrap) + '" lang="' + cm.name + '" >' + checkContent + '</td>';
          break;
        case ('editable'):
        case ('display'):
          if (cm.checkIfEditable == true) {
            if (!cm.checkIfEditableFunction(o)) {
              isLockedClass = isLockedClass.replace(' unlocked ', ' locked ');
            }
          }
          if (cm.name == 'startTime' || cm.name == 'endTime' || cm.inOutTime == true) {
            if (o.code != null) {
              var codeType = (o.code.type != null ? o.code.type : null);
              if (codeType != null && !GFB.isTimeEditable(codeType)) {
                isLockedClass = isLockedClass.replace(' unlocked ', ' hideCellText ');
              }
            }
          }
          var ev = null;
          if(cm.fieldCanBeEmpty && (eval('o.' + cm.mapping) == '')) {
            ev = '';
          }
          else {
            try {
              switch (cm.mask) {
              case 'militaryTime':
                ev = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]) : "")');
                break;
              case 'date':
                ev = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]) : "")');
                break;
              case 'dayDate':
                ev = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]) : "")');
                break;
              case 'dateTime':
                ev = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]) : "")');
                break;
              case 'day':
                ev = eval('(o.' + cm.mapping + ' != null ? Dates.format(o.' + cm.mapping + ', Content.general.dFTypes[cm.dFKey]) : "").toUpperCase()');
                break;
              case 'duration':
              case 'duration24':
              case 'duration546':
              case 'durationNegative':
                var dayDuration = (cm.dayDurationMapping)? eval('o.' + cm.dayDurationMapping) : null;
                var durationValue = Dates.getDurationDisplay(eval('o.' + cm.mapping));
                ev = durationValue;
                break;
              case 'durationDay':
                var durationValue = Dates.getDurationDisplay(eval('o.' + cm.mapping), 'duration_format_D', eval('o.' + cm.dayDurationMapping));
                ev = durationValue;
                break;
              case 'rate':
                ev = eval('(o.' + cm.mapping + ' != null ? o.' + cm.mapping + ' : "")');
                ev = $.formatNumber(ev, {format: Content.general.rateFormat, locale:Content.general.localeCountry});
                break;
              case 'decimal':
              case 'decimalHour':
                ev = eval('(o.' + cm.mapping + ' != null ? o.' + cm.mapping + ' : "")');

                if (cm.roundTo != null && !isNaN(parseInt(cm.roundTo))) {
                  ev = CSMath.round(parseFloat(ev), cm.roundTo, true);
                }
                else {
                  if (parseInt(ev) == parseFloat(ev)) {
                    ev = CSMath.round(parseFloat(ev), 1, true);
                  }
                }
                break;
              default:
                ev = eval('(o.' + cm.mapping + ' != null ? o.' + cm.mapping + ' : "")');
                break;
              }
            }
            catch (Exception) {
              ev = '';
            }
          }
          var displayValue = ev;
          if (cm.valuePrefix != null) {
            if (displayValue == null) {
              if (cm.mask == 'decimal' || cm.mask == 'int') {
                displayValue = 0;
                if (cm.roundTo != null && !isNaN(parseInt(cm.roundTo))) {
                  displayValue = CSMath.round(parseFloat(displayValue), cm.roundTo, true);
                }
                else {
                  if (parseInt(displayValue) == parseFloat(displayValue)) {
                    displayValue = CSMath.round(parseFloat(displayValue), 1, true);
                  }
                }
              }
              else {
                displayValue = '';
              }
            }
            displayValue = cm.valuePrefix + displayValue;
          }

          if(addClass == ' textwrap ') {
            c = '<td colspan="' + colSpan + '" title="' + cellTooltip + '" class="c ' + isLockedClass + ((isLocked) ? '' : cm.displayType) + ' ' +
            altClass + ' ' + GFB.getHWClass(cm.headerWrap) + '" lang="' + cm.name + '"' + (cm.mask != null ? (' name="' + cm.mask + '"') : '') + '>';
            c += '<div class="'+ addClass + '">' + displayValue + '</div></td>';
          } else {
            c = '<td colspan="' + colSpan + '" title="' + cellTooltip + '" class="c ' + addClass + isLockedClass + ((isLocked) ? '' : cm.displayType) + ' ' +
            altClass + ' ' + GFB.getHWClass(cm.headerWrap) + '" lang="' + cm.name + '"' + (cm.mask != null ? (' name="' + cm.mask + '"') : '') + '>' + displayValue + '</td>'; 
          }
          
          break;
        case ('note'):
          var noteClass = 'no-note';
          var iconClass = 'fa-comment-o';
          var val  = eval('o.' + cm.mapping);
          if (val != null && val != '') {
            noteClass = 'has-note';
            iconClass = 'fa-comment';
          }
          var title = eval('o.' + cm.mapping) != null ? eval('Global.cleanText(o.' + cm.mapping + ')') : '';
          var noteMaxLength = (cm.maxFieldLength != null)? ' note-maxlength="' + cm.maxFieldLength + '" ' : '';
          c = '<td colspan="' + colSpan + '" class="c note ' + addClass + isLockedClass + altClass + ' ' + GFB.getHWClass(cm.headerWrap) + '" title="' + title + '" lang="' + cm.name + '" note-type="' + cm.noteType + '" ' + noteMaxLength + '>';
          c += '<div class="' + noteClass + '"><i class="fa ' + iconClass + ' fa-lg" aria-hidden="true"></i></div>';
          c += '</td>';
          break;
        case ('multiselect'):
          var obj = eval('o.' + cm.mapping);
          var options = {
              setValueFunction: GFB.setValue,
              itemsSelected: obj.itemsSelected,
              selectType: cm.selectType,
              multiselectUrl: cm.multiselectUrl,
              multiselectPostObj: cm.multiselectPostObj,
              orchestrateObj: cm.orchestrateObj
          };
          obj['multiSelectInstance'] = new MultiSelectCell(options);
          var cellContent = obj['multiSelectInstance'].getMultiSelectContent(obj.itemsSelected); 
          
          c = '<td class="c ' + addClass + cm.displayType + ' ' + altClass + ' ' + GFB.getHWClass(cm.headerWrap) + '" lang="' + cm.name + '" ><div class="multiselect-content">' + cellContent
          + '</div><div class="multiselect-wrapper"><i class="fa fa-pencil fa-lg multiselect-edit" aria-hidden="true"></i></div></td>';
          break;
        case ('icon'):
          var clickClass = cm.onClickFunction? ' icon-clickable ' : ''; 
          // avoid 'unlocked' class so icon is not included in tabbing flow
          isLockedClass = isLocked? GFB.lockedClass : '';
          c = '<td title="' + cellTooltip + '" class="c ' + clickClass + addClass + isLockedClass + cm.displayType + ' ' + altClass + ' ' + GFB.getHWClass(cm.headerWrap) + '" lang="' + cm.name + '">';
          var wrapperClass = 'icon-wrapper ';
          var iconHtmlStr = '';
          if (cm.iconType === 'lookup') {
            wrapperClass += 'lookupIndicator';
            iconHtmlStr += '<i class="fa fa-search lookupButton fa-lg" aria-hidden="true"></i>';
          } else if (cm.iconType === 'edit') {
            iconHtmlStr += '<i class="fa fa-pencil icon-edit fa-lg" aria-hidden="true"></i>';
          } else if (cm.iconType === 'custom') {
            wrapperClass += cm.wrapperClass || '';
            if(cm.iconHtmlStrFunction){
              iconHtmlStr = cm.iconHtmlStrFunction(o, cm.mapping);
            } else {
              iconHtmlStr += cm.iconHtmlStr || '';
            }
          }
          c += '<div class="' + wrapperClass + '">';
          c += iconHtmlStr;
          c += '</div>';
          c += '</td>';
          break;
        }

      }
      return c;
    },

    setNoteValue: function(obj, direction) {
      GFB.setValue(obj);
      GFB.refreshCellDisplay();
      if (direction == 'left') {
        GFB.moveToPreviousCell();
      }
      else {
        GFB.moveToNextCell();
      }

    },

    setLookupValue: function(obj) {
      if (GFB.setValue(obj)) {
        GFB.hideEdit();
      }
    },

    isValid: true,
    isChange: false,

    setValue: function(value, cRow, cCol) {

      if (cRow == null) { cRow = GFB.cRow; };
      if (cCol == null) { cCol = GFB.cCol; };
      if (isNaN(cRow)) { cRow = 0; }
      //alert('cRow: ' + cRow + '; cCol: ' + cCol + '; Value: ' + value);
      var selector = GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + cCol + '"]';

      var cell = $(selector);
      var o = null;
      var objStr = null;
      var previousValue = GFB.getValue();

      GFB.isValid = true;
      if (value.useOldValue != null && value.useOldValue) {
        return GFB.isValid;
      }
      GFB.isChange = false;

      var cm = GFB.getColumnMapping(cCol);

      if (cm != null) {
        if (cRow != -1 ) {
          o = GFB.getDataContext(cRow);
          objStr = 'o.' + cm.mapping;
        }
        else {
          o = cm.mapping;
          objStr = o;
        }

        if (cm.onSetOverrideFunction != null) {
          GFB.isChange = cm.onSetOverrideFunction(value, cm);
        }
        else {
          //alert('value: ' + value + '; cRow: ' + cRow + '; cCol: ' + cCol + '; objStr: ' + objStr);
          GFB.setInnerValue(value, cRow, cCol, cm, objStr, o);
        }

        if (GFB.isValid && GFB.isChange) {
          if(!cm.doNotSetChangedData) {
            Navigation.setChangedData(true);
            var data = GFB.getDataContext(cRow);
            data.isModified = true;
            
            if (GFB.showUnsavedColumn) {
              if ((GFB.getColumnMapping(cm.name, true) != null)) {
                GFB.showUnsavedColumnFunction(cRow);
              }
            }
          }
          if (cm.onChangeFunction != null) {
            cm.onChangeFunction(value, o, previousValue);
          }
          GFB.refreshClearOnChangeFields(cm, previousValue, value);
          
        }
      }
      else {
        GFB.isValid = false;
      }
      return GFB.isValid;

    },

    showUnsavedColumnFunction: function(cRow) {
      var $unsavedCol = $(GFB.getInstanceSelector() + ' .unsavedCol');
      if ($unsavedCol.length > 0) {
        if (!$unsavedCol.is(":visible")) {
          $unsavedCol.show();
          GFB.onShowNewColumn();
        }
        $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td .unsavedIcon').show();
      }
    },
    
    //currently only support single table
    onShowNewColumn: function() {
      // update footerRow label colspan
      var currentColspan = parseInt($(GFB.getInstanceSelector() + ' .r').attr('colspan'), 10);
      $(GFB.getInstanceSelector() + ' .r').attr('colspan', currentColspan + 1);
      
      GFB.resetGridAlt();
    },
    
    resetGridAlt: function() {
      var headerRows = $(GFB.getInstanceSelector() + ' thead tr');
      headerRows.each(function(i, headerRow){
        $(headerRow).find('th').filter(function(i,o){ return $(o).css('display') !== 'none'; }).removeClass('alt').filter(':odd').addClass('alt');
      });
      var rows = $(GFB.getInstanceSelector() + ' tbody tr');
      rows.each(function(i, row){
        var displayCells = $(row).find('td.c').filter(function(i,o){ return $(o).css('display') !== 'none'; });
        displayCells.removeClass('alt');
        
        var altCells;
        if ($(row).hasClass('footerRow')) {
          var colspan = parseInt($(row).find('.r').attr('colspan'));
          if (colspan % 2 === 0){
            altCells = displayCells.filter(':odd');
          } else {
            altCells = displayCells.filter(':even');
          }
        } else {
          altCells = displayCells.filter(':odd');
        }
        altCells.addClass('alt');
      });
    },
    
    deleteAltType: false,

    checkLookupPathingExists: function(objStr, o) {

      var elements = objStr.split('.');
      var baseStr = objStr[0];
      var isValid = true;
      try {
        if (eval(baseStr) == null && elements.length > 1) { isValid = false; }
        if (isValid) {
          for (var i = 1; i < elements.length; i++) {
            baseStr += '.' + elements[i];
            if (eval(baseStr) == null) {
              eval(baseStr + ' = {}');
            }
          }
        }
      }
      catch (ex) { }

    },

    setInnerValue: function(value, cRow, cCol, cm, objStr, o) {

      switch (cm.displayType) {
      case ('lookup'):
			  if(cm.onSelectFunction != null) {
				  cm.onSelectFunction(o);
			  }

        GFB.checkLookupPathingExists(objStr, o);
        GFB.isChange = eval(objStr + '.id != value.code;');
        var useType = (cm.name != 'code' && value.type != null);
        var idVal = (useType ? value.type : value.code);

        eval(objStr + '.id = "' + idVal + '";');
        eval(objStr + '.name = value.description;');
        if (value.type != null) {
          eval(objStr + '.type = value.type;');
        }
        
        if (cm.name == 'code' || cm.lookupType == 'codesAndBonusCodes') {
          try {
            var codeObj = eval(objStr);
            if (codeObj != null) {
              if (codeObj.typeName != null) {
                delete codeObj.typeName;
                delete codeObj.typeDesc;
                //codeObj.altType = value.altType;
              }
              if(!GFB.deleteAltType && value.altType != null) {
                codeObj.altType = value.altType;
              }
              if (GFB.deleteAltType) {
                delete codeObj.altType;
              }
            }

          }
          catch (e) {

          }

        }

        $(GFB.columnMapping).each(function(ci, cColMap) {
          if (cColMap.parent == cm.name) {
            GFB.checkLookupPathingExists('o.' + cColMap.mapping, o);
            var prevVal = GFB.getValue(cColMap.name);
            var fieldChanged = prevVal != "AUTO";
            eval('o.' + cColMap.mapping + '.id = "AUTO";');
            eval('o.' + cColMap.mapping + '.name = "AUTO";');
            eval('delete o.' + cColMap.mapping + '.type');
            var childCell = $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + cColMap.name + '"]');
            var str = GFB.getValue(cColMap.name);
            childCell.html(str);
            if(fieldChanged) {
              if (cColMap.onChangeFunction != null) {
                cColMap.onChangeFunction(str, o, prevVal);
              }
            }
            return false;
          }
        });
        break;
      case ('checkbox'):
      case ('note'):
        GFB.isChange = eval(objStr + ' != value;');
        eval(objStr + ' = value;');
        if (cm.extraField != null) {
          var clearValue = '';
          if (cm.extraField.onClearValue != null) {
            clearValue = cm.extraField.onClearValue;
          }
          // WFM-37067 Fix: Corected on change event scope when duration value changes
          GFB.isChange = GFB.isChange  || eval('o.' + cm.extraField.mapping + ' != "' + clearValue + '";');

          eval('o.' + cm.extraField.mapping + ' = "' + clearValue + '";');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + cm.name + '"] span.additionalCheckField').html(clearValue);
        }
        break;
      case ('editable'):
        var ev = null;
        if (cm.mask != null || cm.mask == null) {
          var validationType = cm.mask;
          if (ScreenPrefs.AmPm && validationType == 'militaryTime') {
            validationType = 'clockTime';
          }
          //validateMaxLength: function(jqueryfield, maxLength, showAlert, displayName, value) {
          var headerText = (cm.headerText != null ? cm.headerText : (locale[cm.name] == null ? cm.name : locale[cm.name]));

          if (cm.fieldCanBeEmpty && value == '') {
            eval(objStr + ' = value;');
          }
          else if (Validation.validate(validationType, null, null, value) && (cm.maxFieldLength == null || Validation.validateMaxLength(null, cm.maxFieldLength, null, headerText, value))) {
            if(cm.validationFunction) {
              GFB.isValid = cm.validationFunction('#dValue', value);
              if(!GFB.isValid) { return; }
            }
            switch (validationType) {
            case ('date'):
              value = Dates.revertForJSON(value);
              GFB.isChange = eval('!Dates.isDateEqual(' + objStr + ', value);');
              var tempDate = eval(objStr);
              value = tempDate? Dates.setDateOnly(tempDate, value) : value;
              eval(objStr + ' = value;');
              break;
            case ('militaryTime'):
            case ('clockTime'):
              var cVal = eval('Dates.copyDate(' + objStr + ')');
              if(cVal.length == 0 && o.date) {
                cVal = Dates.copyDate(o.date);
              }
              value = Dates.convertTimeDisplay(value);
              cVal[3] = value.hours;
              cVal[4] = value.minutes;
              if (eval(objStr) != null) {
                GFB.isChange = eval(objStr + '.toString() != cVal.toString();');
              }
              eval(objStr + ' = cVal;');
              break;
            case ('duration'):
            case ('duration24'):
            case ('duration546'):
            case ('durationNegative'):
              var dayDuration = (cm.dayDurationMapping)? eval('o.' + cm.dayDurationMapping) : null;
              var durationValue = Dates.convertDurationDisplay(value, null, validationType);
              GFB.isChange = eval(objStr + ' != durationValue;');
              eval(objStr + ' = durationValue;');
              break;
            case ('durationDay'):
              var durationValue =  Dates.convertDurationDisplay(value, 'duration_format_D', validationType, eval('o.' + cm.dayDurationMapping));
              GFB.isChange = eval(objStr + ' != durationValue;');
              eval(objStr + ' = durationValue;');
              break;
            case ('int'):
              value = parseInt(value);
              GFB.isChange = eval(objStr + ' != value;');
              eval(objStr + ' = value;');
              break;
            case ('rate'):
            case ('decimal'):
            case ('decimalHour'):
            case ('percent'):
              value = parseFloat(value);
              if (cm.roundTo != null && !isNaN(parseInt(cm.roundTo))) {
                value = CSMath.round(value, cm.roundTo);
              }

              GFB.isChange = eval(objStr + ' != value;');
              eval(objStr + ' = value;');
              break;
            case ('dateTime'):
              value = Dates.revertForJSON(Dates.convertStringToDateTimeArray(value, Content.general.dFTypes[cm.dFKey]));
              GFB.isChange = eval(objStr + ' != value;');
              eval(objStr + ' = value;');
              break;
            default:
              GFB.isChange = eval(objStr + ' != value;');
              eval(objStr + ' = value;');
              break;
            }

          }
          else {
            GFB.isValid = false;
          }
        }
        else {
          GFB.isChange = eval(objStr + ' != value;');
          eval(objStr + ' = value;');
        }
        break;
      case 'multiselect':
        var obj = eval(objStr);
        GFB.isChange = true;
        obj.itemsSelected = value;
        break;

      }

    },

    headerWrapData: {},

    getAltClass: function(alt) {
      return (alt ? 'alt' : '');
    },

    isAlt: false,
    useAlt: function(headerWrap) {
      var value = false;
      if (headerWrap != null) {
        value = GFB.headerWrapData[headerWrap.name].isAlt;
      }
      else {
        value = GFB.isAlt;
      }

      GFB.isAlt = !value;
      return value;
    },

    columnMapping: [],
    headerMapping: [],
    footerMapping: [],

    getHWClass: function(headerWrap) {
      return (headerWrap != null ? 'wrappedHeaderCol' : '');
    },
    refreshClearOnChangeFields: function(changedFieldColumnMapping, previousValue, newValue) {
      $(GFB.columnMapping).each(function(i,cm) {
        GFB.clearColumnMappingIfOnChange(cm, changedFieldColumnMapping, previousValue, newValue);
      });
      $(GFB.footerMapping).each(function(i, fr) {
        $(fr).each(function(fmi, fm) {
          try {
            GFB.clearColumnMappingIfOnChange(fm, changedFieldColumnMapping, previousValue, newValue);
          }
          catch (ex) {
            //alert(ex + ' : ' + JSON.stringify(fm))
          }

        });
      });
      if (GFB.additionalChangeFunction != null) {
        GFB.additionalChangeFunction();
      }
    },

    clearColumnMappingIfOnChange: function(cm, changedFieldColumnMapping, previousValue, newValue) {
      if (cm != null && cm.clearOnChange != null && cm.clearOnChange && 
          ((cm.clearOnChangeFunction != null &&
            cm.clearOnChangeFunction(changedFieldColumnMapping, previousValue, newValue)) ||
           cm.clearOnChangeFunction == null)) {
        var o = GFB.getDataContext();
        var isExclusion = false;
        if (cm.clearOnChangeExclusions != null) {
          $(cm.clearOnChangeExclusions).each(function(i,o) {
            if (GFB.cCol == o) {
              isExclusion = true;
              return false;
            }
          });
        }
        if (isExclusion) { return true; }
        if (cm.changeMonitorFields != null) {

          var found = false;
          $(cm.changeMonitorFields).each(function(i,o) {
            if (changedFieldColumnMapping.name == o) {
              found = true;
              return false;
            }
          });
          isExclusion = (!found);
        }
        if (isExclusion) { return true; }
        
        $(GFB.getInstanceSelector() +' tbody tr[lang="' + GFB.cRow + '"] td[lang="' + cm.name + '"]').attr('title', '');
        var rowIndex = (cm.rIndex != null ? cm.rIndex : null);

        if (cm.changeMonitorOverride != null) {
          isExclusion = cm.changeMonitorOverride(cm);
        }
        if (isExclusion) { return true; }
        if (cm.onClearValue != null) {

          GFB.setValue(cm.onClearValue, rowIndex, cm.name);
          GFB.refreshCellDisplay(cm.name);
        }
      }
    },

    getGridParent: function(input) {
      var stop = false;
      var gridParent = null;
      while (!stop && input != null) {
        if ($(input).attr('id') == 'Grid' || $(input).hasClass('GridContainer')) {
          gridParent = input;
          stop = true;
          break;
        }
        if ($(input).is('body')) {
          stop = true;
        }
        input = $(input).parent();
      }
      return gridParent;
    },

    lockedDays: [],
    manualCalcDays: [],

    refreshCellMovementVariables: function(obj) {
      if (obj == null) {
        GFB.actualIndex = 0;
        GFB.isLastCellFooterCell = false;
      }
      else {
        GFB.isLastCellFooterCell = $(obj).parent('tr').hasClass('footerRow');
        // Check if in gridFramework2 with no footers
        if ($('#dayRepeatingTemplate').length > 0) {
          GFB.actualIndex = $(obj).parent('tr').index();
        }
        else {
          if(GFB.options.lockedColumn) {
            var paneName = ($(obj).parent().parent().parent().parent().hasClass('pane1')) ? '.pane1' : '.pane2';
            GFB.actualIndex = GFB.isLastCellFooterCell ? $(obj).parent('tr').index(GFB.getInstanceSelector() + paneName + ' tr.footerRow') : $(obj).parent('tr').index(GFB.getInstanceSelector() + paneName + ' tr.data');
          }
          else {
            GFB.actualIndex = GFB.isLastCellFooterCell ? $(obj).parent('tr').index('tr.footerRow') : $(obj).parent('tr').index('tr.data');
          }
        }
      }
    },

    moveCell: function(offset) {
      var row = GFB.actualIndex;
      var classFilter = GFB.isLastCellFooterCell ? '.footerRow' : '';
      var cell = -1;
      var rowName = "";
      var paneName = "";
      
      var loopSelector = GFB.getInstanceSelector() + ' tbody';
      var innerLoopSelector = 'tr.data' + classFilter + ':eq(' + row + ') td.unlocked:visible';
      
      $(loopSelector).each(function(outerIndex, outerObj) {
        $(outerObj).find(innerLoopSelector).each(function(i, o){
          if ($(o).attr('lang') == GFB.cCol) {
            cell = i;
            rowName = $(o).parent().attr('name') != null ? $(o).parent().attr('name') : "";
            if(GFB.options.lockedColumn) {
              paneName = ($(o).parent().parent().parent().parent().hasClass('pane1')) ? '.pane1' : '.pane2';
            }
            return false;
          }
        });
      });
      
      var colCount = $(GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + row + ') td.unlocked:visible').length;
      var newCell = cell + offset;

      if (newCell >= colCount) {
        if (!GFB.isLastCellFooterCell && $(GFB.getInstanceSelector() + paneName + ' tbody tr.data').not('.footerRow').length <= (row + 1) && (paneName == '.pane2' || paneName == "")) {
          classFilter = '.footerRow';
          row = 0;
          rowName = 'footerRow';
          newCell = 0;
        }
        
        else {
          if(paneName == '.pane1') {
            paneName = '.pane2';
          }
          else if(paneName == '.pane2') {
            if(!GFB.isLastCellFooterCell) {
              paneName = '.pane1';
            }
            row++;
          }
          else if(paneName == "") {
            row++;
          }
          if ($(GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + row + ') td.unlocked:visible').length == 0) {
            for (var i = row; i < $(GFB.getInstanceSelector() + paneName + ' tbody tr.data').length; i++) {
              if ($(GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + i + ') td.unlocked:visible').length > 0) {
                row = i;
                break;
              }
            }
          }
          newCell = 0;
        }
      }
      else if (newCell < 0) {
        if (GFB.isLastCellFooterCell && row <= 0) {
          classFilter = '';
          row = $(GFB.getInstanceSelector() + paneName + ' tbody tr.data').not('.footerRow').length - 1;
          rowName = 'dataRow';
          newCell = $(GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + row + ') td.unlocked:visible').length - 1;
        }
        else {
          if(paneName == '.pane2') {
            if(!GFB.isLastCellFooterCell) {
              paneName = '.pane1';
            }
            else {
              row--;
            }
          }
          else if(paneName == '.pane1') {
            paneName = '.pane2';
            row--;
          }
          else if(paneName == "") {
            row--;
          }
          
          if ($(GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + row + ') td.unlocked:visible').length == 0 || newCell == -1) {
            for (var i = row; i >= 0; i--) {
              if ($(GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + i + ') td.unlocked:visible').length > 0) {
                row = i;
                break;
              }
            }
          }
          newCell = newCell == -1 ? newCell : 
            $(GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + row + ') td.unlocked:visible').length - 1;
        }
      }

      var selectCellSelector = GFB.getInstanceSelector() + paneName + ' tbody tr.data' + classFilter + '[name^="' + rowName.substring(0, 5) + '"]:eq(' + row + ') td.unlocked:visible:eq(' + (newCell) + ')';
      GFB.removeCurrentFocus();

      if (newCell == -1 && row == -1) {
        if (GFB.previousTabControlSelectorParent != null && GFB.previousTabControlSelector != null) {
          $(GFB.getInstanceSelector()).parents(GFB.previousTabControlSelectorParent).find(GFB.previousTabControlSelector).select().focus();
        }
      }
      if ($(selectCellSelector).length == 0 && offset > 0) {
        if(paneName == "") {
          var focusObj = $(GFB.getInstanceSelector()).parent().next().find('input,textarea');
          $(focusObj).each(function(i,o){
            if(o.disabled == false){
              setTimeout(function() { o.select(); o.focus(); }, 50);
              return false;
            }
          });

          var pagingTargetSelector = $(GFB.getInstanceSelector()).parent().find('div.pagingTarget a').first();
          if ($(pagingTargetSelector).length > 0) {
            $(pagingTargetSelector).focus();
            return false;
          }
        }
        else {
          var focusObj = $(GFB.getInstanceSelector()).parent().next().find('input,textarea');
          $(focusObj).each(function(i,o){
            if(o.disabled == false){
              setTimeout(function() { o.select(); o.focus(); }, 50);
              return false;
            }
          });
        }
      }
      if(row >= 0 || newCell != -1) {
        GFB.selectCell($(selectCellSelector));
      }
    },

    removeCurrentFocus: function() {
      //GFB.refreshCellMovementVariables();
      $('.currentFocus').removeClass('currentFocus');
    },

    moveToNextCell: function() {
      GFB.moveCell(1);
    },

    moveToPreviousCell: function() {
      GFB.moveCell(-1);
    },

    refreshCellDisplay: function(name) {
      if (name == null) { name = GFB.cCol; }
      var cm = GFB.getColumnMapping(name);

      if (cm.onRefreshOverride != null) {
        cm.onRefreshOverride(name);
        return;
      }
      var cRow = (cm != null && cm.rIndex != null ? cm.rIndex : GFB.cRow);
      var o = GFB.getDataContext(cRow);
      var cell = $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"]');
      var str = GFB.getValue(name);
      if(cm.mask == 'rate'){
        str = $.formatNumber(str, {format: Content.general.rateFormat, locale:Content.general.localeCountry});
      }     
      if (cm.valuePrefix != null) {
        if (str == null) {
          if (cm.mask == 'decimal' || cm.mask == 'int') {
            str = 0;
            if (cm.roundTo != null && !isNaN(parseInt(cm.roundTo))) {
              str = CSMath.round(parseFloat(str), cm.roundTo, true);
            }
            else {
              if (parseInt(str) == parseFloat(str)) {
                displayValue = CSMath.round(parseFloat(str), 1, true);
              }
            }
          }
          else {
            str = '';
          }
        }
        str = cm.valuePrefix + str;
      }


      if (cell.hasClass('checkbox')) {
        if (str) {
          cell.find('input[type="checkbox"]').prop('checked', true);
        }
        else {
          cell.find('input[type="checkbox"]').prop('checked', false);
        }
        if (cm.extraField != null) {
          var extraFieldValue = eval('o.' + cm.extraField.mapping);
          cell.find('span.additionalCheckField').html(extraFieldValue);
        }
      }
      else if (cell.hasClass('lookup')) {
        var lookupObj = GFB.getLookupObject(name, cRow);
        if (lookupObj != null) {
          var id = '';
          var name = '';
          if ((typeof lookupObj) == 'string') {
            id = lookupObj;
            name = lookupObj;
          }
          else {
            id = lookupObj.id;
            name = lookupObj.name;
          }
          var title;
          if(name){
            title = Global.cleanText(name);
          }
          var val = id;
          if (cm.reverseIdValue) {
            title = Global.cleanText(id);
            val = name;
          }
          if(cm.hideTitle) {
            title = '';
          }
          cell.attr('title', title);
          cell.html(val);
        }
        else if ((name.length == 4 && name.indexOf('udf') == 0) || (name.length == 9 && name.indexOf('udf') == 5) || cm.lookupCanBeEmpty) {
          cell.attr('title', '');
          cell.html('');
        }
      }
      else if (cell.hasClass('note')) {
        if (str != null && str != '') {
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div').addClass('has-note');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div').removeClass('no-note');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div').attr('title', Global.cleanText(str));
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div i').removeClass('fa-comment-o');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div i').addClass('fa-comment');
        }
        else {
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div').removeClass('has-note');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div').addClass('no-note');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div').attr('title', '');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div i').addClass('fa-comment-o');
          $(GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + name + '"] div i').removeClass('fa-comment');
        }

      }
      else {
        if (cm.addClass == 'textwrap') {
          str = '<div class="'+ cm.addClass +'" >' + str + '</div>';
        }
        cell.html(str);
      }
      Global.formatTooltips();
    },
    isDatePickerSelection: false,
    calledSetValue: false,

    displayEdit: function() {
      // Check if the parent lookup has a value otherwise dont display an edit box
      var parentValue = null;
      var colMapping = GFB.getColumnMapping(GFB.cCol);
      if (colMapping != null) {
        parentValue = GFB.getValue(colMapping.parent);
      }

      var cell = $(GFB.getInstanceSelector() + ' tbody tr[lang="' + GFB.cRow + '"] td[lang="' + GFB.cCol + '"]');
      if (cell.hasClass('lookup') && colMapping.parent != null && (parentValue == null || parentValue == '')) {
        MessageDisplay.error('Please first select a value for: ' + locale[colMapping.parent]);
        return;
      }

      var v = "";
      if (colMapping.displayEditValueOverride != null) {
        v = colMapping.displayEditValueOverride(GFB.cCol);
      }
      else {
        v = GFB.getValue();
      }
      if (v == null) {
        v = '';
      }

      var dValueLang = (colMapping.lookupType != null ? colMapping.lookupType : GFB.cCol);
      var widthClass = '';
      if (colMapping.mask == 'date') {
        widthClass = 'dateExpand';
      }

    var str = '';
    if (colMapping.addClass == 'textwrap') {
        str = '<textarea id="dValue" rows="4" cols="60" lang="' + dValueLang + '" name="' + cell.attr('name') + '" value="' + v + '" type="text"' + (colMapping.maxFieldLength != null ? (' maxlength=' + colMapping.maxFieldLength) : '') + '/>';
      } else {
        str = '<input id="dValue" class="' + widthClass + '" lang="' + dValueLang + '" name="' + cell.attr('name') + '" value="' + v + '" type="text"' + (colMapping.maxFieldLength != null ? (' maxlength=' + colMapping.maxFieldLength) : '') + '/>';
    }

      cell.html(str);
      $('#dValue').val(v);
      $('#dValue').focus();
      $('#dValue').select();
      $('#dValue').scrollTop(0);
      $('#dValue').bind({

        click: function(event) {


          event.stopPropagation();

        }


      });
      if (cell.hasClass('lookup')) {

        var lookupType = null;
        var parentType = null;
        if (colMapping != null) {
          lookupType = (colMapping.lookupType != null ? colMapping.lookupType : colMapping.name);
          parentType = (colMapping.parentLookupType != null ? colMapping.parentLookupType : colMapping.parent);
          if(colMapping.parentLookupName != null) {
            parentType = colMapping.parentLookupName;
            parentValue = GFB.getValue(colMapping.parentLookupName);
          }
        }
        var successFunction = (colMapping.lookupSelectOverride != null ? colMapping.lookupSelectOverride :  GFB.setLookupValue);
        var failureFunction = (colMapping.lookupFailureOverride != null ? colMapping.lookupFailureOverride :  GFB.hideEdit);
        Search2.initialize('#dValue', lookupType, parentValue, parentType, successFunction,  failureFunction, (GFB.staticLookupData != null ? GFB.staticLookupData[lookupType] : null) ,
            false, GFB.moveToNextCell, GFB.moveToPreviousCell, colMapping.filterFunction, false, colMapping.dropDownType, colMapping.showEmptyRow, colMapping.customLookupOptions);
      }
      else if (colMapping.mask == 'date') {
        $('#dValue').bind({
          keydown: function(event) {
            if (event.keyCode == 9) {
              event.preventDefault();
            }
            if ((event.keyCode == 13 || (event.keyCode == 9 && !event.shiftKey)) ||
                (event.keyCode == 9 && event.shiftKey)) {
              GFB.isDatePickerSelection = true;
            }
          }
        });
        var setDate = (colMapping.setDate) ? colMapping.setDate(colMapping.minDate, colMapping.maxDate) : colMapping.minDate;
        Criteria.initializeDatePicker('#dValue', {
          setDate: setDate,
          minDate: colMapping.minDate,
          maxDate: colMapping.maxDate,
          dateFormat: Dates.getDatepickerFormat(Content.general.dFTypes[1]),
          onSelect: function(dateText, inst) {
            GFB.isDatePickerSelection = true;
            if (GFB.setValue(dateText)) {
              $('#dValue').select();
              GFB.hideEdit();
            }
          },
          onClose: function(dateText, inst) {
            if (!GFB.isDatePickerSelection) {
              GFB.setValue($(this).val());
              GFB.hideEdit();
            }
            GFB.isDatePickerSelection = false;

          }
        });
        if(colMapping.beforeShowDay != null) {
          $('#dValue').datepicker('option', 'beforeShowDay', colMapping.beforeShowDay);
        }
        // This must be after the datepicker code due to errors.
        $('#dValue').bind({
          keyup: function(event) {
            if (event.keyCode == 13 || (event.keyCode == 9 && !event.shiftKey)) {
              if (GFB.setValue($(this).val())) {
                $('#dValue').select();
                GFB.hideEdit();
                GFB.moveToNextCell();
              }
            }
            if ((event.keyCode == 9 && event.shiftKey)) {
              if (GFB.setValue($(this).val())) {
                $('#dValue').select();
                GFB.hideEdit();
                GFB.moveToPreviousCell();
              }
            }
            if (event.keyCode == 27) {
              GFB.hideEdit();
            }
          }
        });

      }
      else {
        $('#dValue').bind({
          keydown: function(event) {
            if (event.keyCode == 9) {
              event.preventDefault();
            }
            if(event.target.type == 'textarea') {
              if(event.keyCode == 37 || event.keyCode == 39) {
                event.stopPropagation();
              }
            }
          },

          keyup: function(event) {
            GFB.calledSetValue = false;
            if (event.keyCode == 13 || (event.keyCode == 9 && !event.shiftKey)) {
              GFB.calledSetValue = true;
              if (GFB.setValue($(this).val())) {
                $('#dValue').select();
                GFB.hideEdit();
                GFB.moveToNextCell();
              }
            }
            if ((event.keyCode == 9 && event.shiftKey)) {
              GFB.calledSetValue = true;
              if (GFB.setValue($(this).val())) {
                $('#dValue').select();
                GFB.hideEdit();
                GFB.moveToPreviousCell();
              }
            }
            if (event.keyCode == 27) {
              GFB.hideEdit();
            }
            if(event.target.type == 'textarea') {
              if(event.keyCode == 37 || event.keyCode == 39) {
                event.stopPropagation();
              }
            }
          },

          focusout: function(e){
            if(!GFB.calledSetValue) {
              GFB.setValue($(this).val());
            }
            GFB.hideEdit();
          }
        });
      }
      $('#dValue').select();
      $('#dValue').focus();
    },
    hideEdit: function() {
      GFB.removeCurrentFocus();
      GFB.refreshCellDisplay();
      if (GFB.options.lockedColumn) {
        GFB.options.paneHeightSyncFunction();
      }
    },

    orchestrateColumnMapping: function() {
      if (GFB.footerMapping != null && GFB.footerMapping.length > 0) {
        $(GFB.columnMapping).each(function(cmi, cm) {
          var colIndex = 0;
          $(GFB.columnMapping).each(function(ccmi, ccm) {
            if (ccmi < cmi && ccm.show) {
              colIndex++;
            }
          });

          var colSpan = 0;
          var found = false;
          $(GFB.footerMapping).each(function(fri, fr) {
            $(fr).each(function(fmi, fm) {
              if (fm.parentCol == cm.name) {
                colSpan++;
                fm.parentColIndex = colIndex;
                found = true;
              }
            });
          });
          if (!found) {
            colSpan = 1;
          }
          //cm.colSpan = colSpan;
        });
      }

      if (GFB.headerMapping != null && GFB.headerMapping.length > 0) {
        $(GFB.columnMapping).each(function(cmi, cm) {
          var colIndex = 0;
          $(GFB.columnMapping).each(function(ccmi, ccm) {
            if (ccmi < cmi && ccm.show) {
              colIndex++;
            }
          });

          var colSpan = 0;
          var found = false;
          $(GFB.headerMapping).each(function(fri, fr) {
            $(fr).each(function(fmi, fm) {
              if (fm.parentCol == cm.name) {
                colSpan++;
                fm.parentColIndex = colIndex;
                found = true;
              }
            }) ;
          });
          if (!found) {
            colSpan = 1;
          }
          //cm.colSpan = colSpan;
        });
      }
    },
    
    getParentColspanOffset: function() {
      var offset = 0;
      offset += (GFB.hideModColumn ? 0 : 1);
      if (GFB.showUnsavedColumn) {
        var $unsavedCol = $(GFB.getInstanceSelector() + ' .unsavedCol');
        if ($unsavedCol.length > 0 && $unsavedCol.is(':visible')) {
          offset += 1;
        }
      }
      return offset;
    },

    toggleEnabledForCellInRow: function(cellName, isEnabled) {

      var cm = GFB.getColumnMapping(cellName);
      var cRow = (cm != null && cm.rIndex != null ? cm.rIndex : GFB.cRow);
      var sel = GFB.getInstanceSelector() + ' tbody tr[lang="' + cRow + '"] td[lang="' + cellName + '"]';
      var isFirstTime = !$(sel).hasClass('orig_unlocked') && !$(sel).hasClass('orig_locked');
      var origClass = $(sel).hasClass('unlocked') ? 'unlocked' : 'locked';
      if (isFirstTime) {
        $(sel).addClass('orig_' + origClass);
      }
      if ($(sel).hasClass('unlocked')) {
        $(sel).each(function(i, o) {
          if (jQuery.data(o, 'value') == null || jQuery.data(o, 'value') == '') {
            jQuery.data(o, 'value',  $(o).html());
          }
        });
      }

      $(sel).html('');
      $(sel).removeClass('unlocked');
      if (isEnabled && $(sel).hasClass('orig_unlocked')) {
        $(sel).addClass('unlocked');
        $(sel).each(function(i, o) {
          $(o).html(jQuery.data(o, 'value'));
        });
        $(sel).removeClass('hideCellText');
      }

    },
    
    multiSelectEvents: function() {

      $('td.multiselect').unbind('click');
      $('td.multiselect').bind({
        click: function(event) {
          GFB.removeCurrentFocus();
          $(this).addClass('currentFocus');
          GFB.cRow = parseInt($(this).parent('tr').attr('lang'));
          GFB.cCol = $(this).attr('lang');
          var extentObject= GFB.getDataContext();
          var columnMapping = GFB.getColumnMapping(GFB.cCol);
          var cellObject = extentObject[columnMapping.mapping];
          var cellSelector = GFB.getInstanceSelector() + ' tbody tr[lang="' + GFB.cRow + '"] td[lang="' + GFB.cCol + '"]';
          cellObject.multiSelectInstance.setCellSelector(cellSelector, GFB.cRow, GFB.cCol);
          cellObject.multiSelectInstance.get();
        }
      });

    },
    
    iconEvents: function() {
      
      $('td.icon').off('click');
      $('td.icon').on('click', function() {
        GFB.removeCurrentFocus();
        var iconCell = $(this);
        if (!iconCell.hasClass(GFB.lockedClass)) {
          GFB.cRow = parseInt(iconCell.parent('tr').attr('lang'));
          GFB.cCol = iconCell.attr('lang');
          var columnMapping = GFB.getColumnMapping(GFB.cCol);
          if (columnMapping.onClickFunction) {
            columnMapping.onClickFunction(GFB.getDataContext());
          }          
        }
      });
      
    },
    
    modColumnEvents: function(targetRow) {
      var modColIcon = targetRow? $(targetRow).find('td.modCol div i') : $('tr.data:not(.isLocked) td.modCol div i'); 
      
      modColIcon.unbind('click');
      modColIcon.bind({

        click: function(event) {
          GFB.onModColumnClick.call(this, event);
        },

       });
    },
    
    onModColumnIconClick: function(event) {
      var modCol = $(event.target).parent();
      if (modCol.hasClass(GFB.MOD_COLUMN.INSERT)) {
        GFB.modColumnMapping[GFB.MOD_COLUMN.INSERT].onClick(event);
        return;
      }

      if (modCol.hasClass(GFB.MOD_COLUMN.COPY)) {
        GFB.modColumnMapping[GFB.MOD_COLUMN.COPY].onClick(event);
        return;
      }

      if (modCol.hasClass(GFB.MOD_COLUMN.DELETE)) {
        GFB.modColumnMapping[GFB.MOD_COLUMN.DELETE].onClick(event);
        return;
      }
    },
    
    loadModColumnMapping: function(mappingOverride) {
      var defaults = {};
      defaults[GFB.MOD_COLUMN.INSERT] = {
        show: true,
        checkIsLocked: function() { return false; },
        onClick: function() {
          GFB.insertRow();
        }
      };
      defaults[GFB.MOD_COLUMN.COPY] = {
        show: true,
        checkIsLocked: function() { return false; },
        onClick: function() {
          GFB.copyRow({
            onBeforeRowChange: this.onBeforeRowChange
          });
        }
      };
      defaults[GFB.MOD_COLUMN.DELETE] = {
        show: true,
        checkIsLocked: function() { return false; },
        onClick: function() {
          GFB.deleteRow({
            onBeforeRowChange: this.onBeforeRowChange
          });
        }
      };
      
      return $.extend(true, {}, defaults, mappingOverride);
    },
    
    toggleModColumn: function(shouldEnable, targetRow, modColumnType) {
      for (var key in GFB.MOD_COLUMN) {
        if(GFB.MOD_COLUMN.hasOwnProperty(key) && GFB.MOD_COLUMN[key] === modColumnType) {
          var modCol = $(targetRow).find('td.modCol .' + modColumnType);
          var modColIcon = modCol.find('i');
          
          if (shouldEnable) {
            modCol.removeClass(GFB.lockedClass);
            GFB.modColumnEvents(targetRow);
          } else {
            modCol.addClass(GFB.lockedClass);
            modColIcon.off();
          }
        } 
      }
    },
    
    getModColumnHtml: function(alt, extent) {
      var mapping = GFB.modColumnMapping;
      
      var htmlStr = '';
      htmlStr += '<td class="modCol c ' + GFB.getAltClass(alt) + '">';
      
      if (mapping[GFB.MOD_COLUMN.INSERT].show) {
        var classes = GFB.MOD_COLUMN.INSERT + ' ';
        if (mapping[GFB.MOD_COLUMN.INSERT].checkIsLocked) {
          classes += (mapping[GFB.MOD_COLUMN.INSERT].checkIsLocked(extent))? GFB.lockedClass + ' ' : '';
        }
        htmlStr += '<div class="' + classes + '" title="' + Content.general.addRowBelow + '"><i class="fa fa-plus-circle fa-lg" aria-hidden="true"></i></div>';
      }
      if (mapping[GFB.MOD_COLUMN.COPY].show) {
        var classes = GFB.MOD_COLUMN.COPY+ ' ';
        if (mapping[GFB.MOD_COLUMN.COPY].checkIsLocked) {
          classes += (mapping[GFB.MOD_COLUMN.COPY].checkIsLocked(extent))? GFB.lockedClass + ' ' : '';
        }
        htmlStr += '<div class="' + classes + '" title="' + Content.general.copyRow + '"><i class="fa fa-copy fa-lg" aria-hidden="true"></i></div>';
      }
      if (mapping[GFB.MOD_COLUMN.DELETE].show) {
        var classes = GFB.MOD_COLUMN.DELETE+ ' ';
        if (mapping[GFB.MOD_COLUMN.DELETE].checkIsLocked) {
          classes += (mapping[GFB.MOD_COLUMN.DELETE].checkIsLocked(extent))? GFB.lockedClass + ' ' : '';
        }
        htmlStr += '<div class="' + classes + '" title="' + Content.general.deleteRow + '"><i class="fa fa-times fa-lg" aria-hidden="true"></i></div></td>';
      }
      
      htmlStr += '</td>';
      return htmlStr;
    },
    
    cRow: -1,
    cCol: null,
    eof: 0
  }
}) ();



var MultiSelectCell = (function($) {
  "use strict";
  
  var multiSelectObj = function(options) {
    this.attributes = $.extend(true, {}, this.defaultOptions);
    $.extend(true, this.attributes, options);
  }
  
  multiSelectObj.prototype = {
      constructor: multiSelectObj,
      
      defaultOptions: {
        setValueFunction: null,
        itemsSelected: [],
        jsonData: null,
        selectType: '',
        cellSelector: '',
        orchestrateObj: null
      },
      
      url: '/wfm/controldata/dynamic/userId',
      dropdownOpen: false,
      mouseOnOverlay: false,
      $select2Containter: null,
      $select2Element: null,
      multiselectInputSelector: '',
      
      setCellSelector: function (selector, row, column) {
        this.attributes.cellSelector = selector;
        this.multiselectInputSelector = 'multiselectInput_' + row + '_' + column;
      },

      getParams: function() {
        var params = {};
        params[this.attributes.selectType] = '';
        return params;
      },
      
      get: function() {
        var params = this.getParams();
        params.userId = ServerVars.userId;
        
        if(this.attributes.jsonData == null) {
          var that = this;
          $.getJSON(that.url, params, function(json) {
            that.attributes.jsonData = json;
            that.renderMultiSelect();
            that.events();
          });
        }
        else {
          this.renderMultiSelect();
          this.events();
        }
      },
      
      getMultiSelectContent: function(selectedItems) {
        var len = selectedItems.length;
        var content = "";
        if( len < 4 && len > 0) { 
          content = selectedItems.map(function(o) {
            return o.empGrpDesc;
          }).join(", ");
        }else {
          content = len + ' ' + Content.general.selected;
        }
        return content; 
      },
      
      addNonExistentItemInDropdown: function(selectedObj) {
        var obj = this.attributes.jsonData;
        if(!(_.findWhere(obj.list, {id: selectedObj.id.toString()}))) {
          var objToAdd = this.attributes.orchestrateObj(selectedObj);
          objToAdd.nonExistentItem = true;
          obj.list.push(objToAdd);
        }
      },
      
      removeNonExistentItemFromDropdown: function(selectedId) {
        var obj = this.attributes.jsonData;
        var that = this;
        $(obj.list).each(function(i, o) {
          if(o.id == selectedId && o.nonExistentItem) {
            obj.list.pop(i);
            that.refreshDropdown(selectedId);
            return true;
          }
        })
      },
      
      refreshDropdown: function(selectedId) {
        $('#' + this.multiselectInputSelector).find('option[value="' + selectedId + '"]').remove();
        this.$select2Element.trigger('change');
      },
      
      renderMultiSelect: function() {
        this.close();
        var selectedCollection = this.orchestrate();
        var that = this;
        $(selectedCollection.selectedItems).each(function(i, o) {
          that.addNonExistentItemInDropdown(o);
        }) 
        var markup = this.getMarkup();
        Overlay.show('multiselect', $(this.attributes.cellSelector), null, markup, null, false, false, false, this.onClose);
        
        var $select2 = $('#' + this.multiselectInputSelector).select2();
        this.$select2Container = $select2.data('select2').$container;
        this.$select2Element = $select2.data('select2').$element;

        this.$select2Element.val(selectedCollection.selectedIds).trigger('change');
        this.$select2Element.select2('focus');
        this.changeContentWidth();
        
        if($(this.attributes.cellSelector).hasClass('disableMultiselect')) {
          $('#' + this.multiselectInputSelector).prop('disabled', true);
          $("#overlayBox.multiselect").focus();
        }
      },

      getMarkup: function() {
        var str = '<select id="' + this.multiselectInputSelector + '" class="multiselectInput" multiple="multiple">';
        $(this.attributes.jsonData.list).each(function(index, item) {
          str += '<option value = ' + item.id + '>' + item.code + '-' + item.description + '</option>';
        });
        str += '</select>';
        return str;
      },
      
      orchestrate: function() {
        var selectedIds = [], selectedItems = [];
        _.each(this.attributes.itemsSelected, function(o, i) {
          selectedIds.push(o.id);
          selectedItems.push(o);
        });
        return {selectedIds: selectedIds, selectedItems: selectedItems};
      },

      events: function() {
        var that = this;
        this.$select2Element.off('change.overlayMultiselect').on('change.overlayMultiselect', function() {
          that.changeContentWidth.apply(that);
          that.attributes.itemsSelected.length = 0;
          var dataSelected = that.$select2Element.select2('data');
          $(dataSelected).each(function(i,o) {
            var index = o.element.index;
            if(that.attributes.jsonData.list[index]) { 
                that.attributes.itemsSelected.push({id: o.id, empGrpName: that.attributes.jsonData.list[index].code, empGrpDesc: that.attributes.jsonData.list[index].description});
            } 
          });
          
          if(that.attributes.setValueFunction != null){
            that.attributes.setValueFunction(that.attributes.itemsSelected);
          }
          var content = that.getMultiSelectContent(that.attributes.itemsSelected); 
          $(that.attributes.cellSelector).find('.multiselect-content').html(content);
        });
        
        this.$select2Element.off('select2:unselect').on('select2:unselect', function(e) {
          that.removeNonExistentItemFromDropdown(e.params.data.id);
        });
        
        $(document).off('click.overlayMultiselect').on('click.overlayMultiselect', function(e){
          // this check on document is needed because select2:unselect fires prior and will remove target selection elm from document, making overlay contains false
          if ($.contains(document, e.target)) {
            var cell = $(that.attributes.cellSelector).get(0);
            var isOnCell = (cell === e.target) || ($.contains(cell, e.target));
            
            var overlayBox = $('#overlayBox.multiselect').get(0);
            var isOnOverlayBox = (overlayBox === e.target) || ($.contains(overlayBox, e.target));
            
            // check for dropdown is not needed because select2 stops event propagation
            if (!isOnCell && !isOnOverlayBox){
              that.close();
            }
          }
        });
      },
      
      getNoOfItemsSelected: function() {
        return this.attributes.itemsSelected.length + 1;
      },
      
      changeContentWidth: function() {
        if(this.$select2Container.outerHeight() > 200) {
          $('#overlayBox.multiselect .overlayContent').width(this.$select2Container.outerWidth() + 20);
        }
      },
      
      close: function() {
        Overlay.close('multiselect', this.onClose);
      },
      
      onClose: function() {
        $(document).off('click.overlayMultiselect');
      }
        
  }
  
  return multiSelectObj;  
  
}(jQuery));
