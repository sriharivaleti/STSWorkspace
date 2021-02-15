//# sourceURL=ExtendedDetails

/* globals ScreenPrefs, Utils, Content, Dates */

var ExtendedDetails = (function() {
  "use strict";
  
  return {
    loadExtendedDetails: function(target, data) {

      if(ScreenPrefs.codeSortMethodInRIA == 'codeType'){      
        data.sort(function(a, b) {
          var aRank = parseFloat(a.codeType);
          var bRank = parseFloat(b.codeType);        
          return Utils.sortByCodeType(aRank,bRank);
        });
      }
     
      var doubleHeader = (ScreenPrefs.showExtDetRegHours || ScreenPrefs.showExtDetOT1Hours || ScreenPrefs.showExtDetOT2Hours || 
          ScreenPrefs.showExtDetOT3Hours || ScreenPrefs.showExtDetOT4Hours) && ScreenPrefs.showExtDetPaidUnpaidByHourType;
      $(target).html(ExtendedDetails.getExtendedDetailTable(data, doubleHeader));
      ExtendedDetails.setHeaderHeight(target, doubleHeader);
    },
    
    clearExtendedDetails: function(target) {
      if (target == null) { target = $('#extendedDetailsTarget'); }
      $(target).html('');
    },
    
    getAlt: function(isAlt) {
      return isAlt ? ' alt' : '';
    },
    
    canShow: function(option) {
      var value = false;
      switch (option.toLowerCase()) {
      case 'page':
        value = ScreenPrefs.showExtDetSumTotByPage;
        break;
      case 'grandtotal':
        value = ScreenPrefs.showExtDetSumTotGrandTotal;
        break;
      case 'employee':
        value = ScreenPrefs.showExtDetSumTotByEmployee;
        break;
      }
      return value;
    },
    
    
    getExtendedDetailTable: function(data, doubleHeader) {
      var tempEx = data;
      /*[{ code:'(W)', description:'WORKED', reg:2400, ot1:0, ot2:0, ot3:0, ot4:0, paid:2400, unpaid:0 },
                    { code:'BRK', description:'BREAK', reg:120, ot1:0, ot2:0, ot3:0, ot4:0, paid:120, unpaid:0 }];
      */
      var rowspan = (doubleHeader) ? 2 : 1;
      var colspan = (ScreenPrefs.showExtDetPaidUnpaidByHourType) ? 2 : 1;
      var str = '';
      str += '<div id="extendedDetails" class="GridContainer">';
      str += '<table cellspacing="1" cellpadding="0" style="width:100%;">';
      str += '<thead>';
      str += '<tr>';
      var isAlt = false;
      str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" rowspan="' + rowspan + '">' + Content.extendedDetails.code + '</th>';
      isAlt = !isAlt;
      str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" rowspan="' + rowspan + '">' + Content.extendedDetails.description + '</th>';
      isAlt = !isAlt;
      if(ScreenPrefs.showExtDetRegHours) {
        str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" colspan="' + colspan + '">' + Content.extendedDetails.exDetReg + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT1Hours) {
        str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" colspan="' + colspan + '">' + Content.extendedDetails.exDetOT1 + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT2Hours) {
        str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" colspan="' + colspan + '">' + Content.extendedDetails.exDetOT2 + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT3Hours) {
        str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" colspan="' + colspan + '">' + Content.extendedDetails.exDetOT3 + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT4Hours) {
        str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" colspan="' + colspan + '">' + Content.extendedDetails.exDetOT4 + '</th>';
        isAlt = !isAlt;
      }
      str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" rowspan="' + rowspan + '">' + Content.extendedDetails.exDetPaid + '</th>';
      isAlt = !isAlt;
      str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '" rowspan="' + rowspan + '">' + Content.extendedDetails.exDetUnpaid + '</th>';
      isAlt = !isAlt;
      str += '</tr>';
      if(doubleHeader) {
        isAlt = false;
        str += '<tr>';
        if(ScreenPrefs.showExtDetRegHours) {
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetPaid + '</th>';
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetUnpaid + '</th>';
          isAlt = !isAlt;
        }
        if(ScreenPrefs.showExtDetOT1Hours) {
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetPaid + '</th>';
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetUnpaid + '</th>';
          isAlt = !isAlt;
        }
        if(ScreenPrefs.showExtDetOT2Hours) {
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetPaid + '</th>';
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetUnpaid + '</th>';
          isAlt = !isAlt;
        }
        if(ScreenPrefs.showExtDetOT3Hours) {
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetPaid + '</th>';
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetUnpaid + '</th>';
          isAlt = !isAlt;
        }
        if(ScreenPrefs.showExtDetOT4Hours) {
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetPaid + '</th>';
          str += '<th class="' + ExtendedDetails.getAlt(isAlt) + '">' + Content.extendedDetails.exDetUnpaid + '</th>';
          isAlt = !isAlt;
        }
        str += '</tr>';
      }
      isAlt = false;
      str += '</thead>';
      str += '<tbody>';
      
      var totalObj = { paidReg:0, unPaidReg:0, paidOT1:0, unPaidOT1:0, paidOT2:0, unPaidOT2:0, paidOT3:0, unPaidOT3:0, paidOT4:0, unPaidOT4:0,
          paid:0, unpaid:0 };
      if (tempEx != null) {
        $(tempEx).each(function(i,o) {
          isAlt = false;
          str += '<tr class="data">';
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + o.code + '</td>';
          isAlt = !isAlt;
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + o.codeDescription + '</td>';
          isAlt = !isAlt;
          if(ScreenPrefs.showExtDetRegHours) {
            str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.paidReg) + '</td>';
            totalObj.paidReg += o.paidReg;
            if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
              str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.unPaidReg) + '</td>';
              totalObj.unPaidReg += o.unPaidReg;
            }
            isAlt = !isAlt;
          }
          if(ScreenPrefs.showExtDetOT1Hours) {
            str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.paidOT1) + '</td>';
            totalObj.paidOT1 += o.paidOT1;
            if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
              str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.unPaidOT1) + '</td>';
              totalObj.unPaidOT1 += o.unPaidOT1;
            }
            isAlt = !isAlt;
          }
          if(ScreenPrefs.showExtDetOT2Hours) {
            str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.paidOT2) + '</td>';
            totalObj.paidOT2 += o.paidOT2;
            if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
              str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.unPaidOT2) + '</td>';
              totalObj.unPaidOT2 += o.unPaidOT2;
            }
            isAlt = !isAlt;
          }
          if(ScreenPrefs.showExtDetOT3Hours) {
            str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.paidOT3) + '</td>';
            totalObj.paidOT3 += o.paidOT3;
            if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
              str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.unPaidOT3) + '</td>';
              totalObj.unPaidOT3 += o.unPaidOT3;
            }
            isAlt = !isAlt;
          }
          
          if(ScreenPrefs.showExtDetOT4Hours) {
            str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.paidOT4) + '</td>';
            totalObj.paidOT4 += o.paidOT4;
            if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
              str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.unPaidOT4) + '</td>';
              totalObj.unPaidOT4 += o.unPaidOT4;
            }
            isAlt = !isAlt;
          }
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.paid) + '</td>';
          isAlt = !isAlt;
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(o.unpaid) + '</td>';
          isAlt = !isAlt;
          str += '</tr>'; 
          totalObj.paid += o.paid;
          totalObj.unpaid += o.unpaid;
          
        });
      }
      
      str += '<tr></tr>';
      str += '<tr></tr>';
      str += '<tr></tr>';
      str += '<tr></tr>';
      isAlt = true;
      str += '<tr class="data">';
      str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '" colSpan="2">' + Content.extendedDetails.total + '</td>';
      isAlt = !isAlt;
      
      if(ScreenPrefs.showExtDetRegHours) {
        str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.paidReg) + '</td>';
        if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.unPaidReg) + '</td>';
        }
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT1Hours) {
        str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.paidOT1) + '</td>';
        if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.unPaidOT1) + '</td>';
        }
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT2Hours) {
        str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.paidOT2) + '</td>';
        if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.unPaidOT2) + '</td>';
        }
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT3Hours) {
        str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.paidOT3) + '</td>';
        if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.unPaidOT3) + '</td>';
        }
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showExtDetOT4Hours) {
        str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.paidOT4) + '</td>';
        if(ScreenPrefs.showExtDetPaidUnpaidByHourType) {
          str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.unPaidOT4) + '</td>';
        }
        isAlt = !isAlt;
      }
      str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.paid) + '</td>';
      isAlt = !isAlt;
      str += '<td class="c' + ExtendedDetails.getAlt(isAlt) + '">' + Dates.getDurationDisplay(totalObj.unpaid) + '</td>';
      isAlt = !isAlt;
      str += '</tr>';
      
      str += '</tbody>';
      str += '</table>';
      str += '</div>';
      return str;
    },
    
    setHeaderHeight: function(target, doubleHeader) {
      if(doubleHeader) {
        $(target).find('tr th').addClass('reducedHeaderHeight');
      }
    },
    
    eof: 0
  };
}) ();