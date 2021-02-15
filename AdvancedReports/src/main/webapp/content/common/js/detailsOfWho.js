//# sourceURL=DetailsOfWho

var DetailsOfWho = (function(){
  return {

    showDialog : function(){
      $('#mainContainer').append('<div id="tabContainer"></div>');
      var $dialog = $("#tabContainer");
      
      $dialog.dialog({
        open: function(event, ui) {
          $(this).html('<div class="tabLoadingDiv" style="display:block"></div>');
          DetailsOfWho.getWhoDetails($(this),DetailsOfWho.who);
        },
        close: function(event, ui) {
          $(this).dialog('destroy');
          $('#tabContainer').remove();
        },
        buttons : {
          "Ok" : {
            'class': 'btn-primary',
            text: locale.ok,
            click: function () {
              $(this).dialog('destroy');
              $('#tabContainer').remove();
            }
          } 
        },
        title: Content.detailsOfWho.detailsOfWho,
        width : '1000px',
        autoOpen : true,
        resizable : true,
        modal : true
      });
    },

    getDetailsOfWhoIcon : function(){
      var str = '';
      str += '<div class="export" title>';
      str += '<i class="fa fa-search fa-lg" aria-hidden="true"></i>';
      str += '<span  class="localize" lang = "detailsOfWho"  >';
      str += Content.detailsOfWho.detailsOfWho;
      str += '</span>';
      str += '</div>';
      $('#detailsOfWho').html(str);
    },
    
    getAlt: function(isAlt) {
      return isAlt ? ' alt' : '';
    },
 
    hasValue: function(value) {
      if(value){
        return value;
      } 
      return '';
    },
       
    getWhoDetails: function(target, employeeId) {

      var postData = {};
      var payroll = employeeId;
      if(!employeeId.startsWith('P#')){
        employeeId = 'P#' +employeeId;
      }
      postData.postRequest = {who:employeeId};

      $.postJSON("/wfm/admin/viewDetailsOfWho/", postData, function(json) {
        DetailsOfWho.loadWhoDetails(target, json.employees[0]);
      }, null, true);
    },
    
    loadWhoDetails: function(target, data) {
      
      var str = '';
      str += '<div id="extendedDetails" class="GridContainer">';
      str += '<table cellspacing="1" cellpadding="0" style="width:100%;">';
      str += '<thead>';
      str += '<tr>';
      var isAlt = false;
      if(ScreenPrefs.showProName) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.name + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProFName) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.firstName + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProLName) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.lastName + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProStreet) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.street + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCity) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.city + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProState) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.state + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProZip) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.zip + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProPhone) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.phone + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProPayroll) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.payroll + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProBadge) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.badge + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProClass) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.className + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCrew) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.crew + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDeptGroup) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.deptGroup + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDeptGroupDesc) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.deptGroupDesc + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDepartment) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.department + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDepartmentDesc) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.departmentDesc + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProHireDate) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.hire + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProPayGroup) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.payGroup + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDefaultRoster) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.defaultRoster + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDefaultRosterDesc) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.defaultRosterDescription + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProEffectiveRoster) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.effectiveRoster + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProEffectiveRosterDesc) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.effectiveRosterDescription + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCostPos) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.defaultCostCenter + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCostPos) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.defaultPosition + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProWorkOrderItem) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.defaultWorkOrder + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProWorkOrderItem) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.defaultWorkItem + '</th>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDefShiftRule) {
        str += '<th class="' + DetailsOfWho.getAlt(isAlt) + '" colspan="1">' + Content.detailsOfWho.shiftRule + '</th>';
        isAlt = !isAlt;
      }
      str += '</tr>';
 
      isAlt = false;
      str += '</thead>';
      str += '<tbody>';

      str += '<tr class="data">';
      if(ScreenPrefs.showProName) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.fullName) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProFName) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.firstName) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProLName) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.lastName) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProStreet) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.street) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCity) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.city) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProState) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.province) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProZip) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.zip) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProPhone) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.phone) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProPayroll) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.id) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProBadge) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.badge) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProClass) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.empClass) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCrew) {
        value = '';
        if(data.crew){
          value = DetailsOfWho.hasValue(data.crew.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDeptGroup) {
        value = '';
        if(data.department && data.department.departmentGroup){
          value = DetailsOfWho.hasValue(data.department.departmentGroup.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDeptGroupDesc) {
        value = '';
        if(data.department && data.department.departmentGroup){
          value = DetailsOfWho.hasValue(data.department.departmentGroup.name);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDepartment) {
        value = '';
        if(data.department){
          value = DetailsOfWho.hasValue(data.department.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDepartmentDesc) {
        value = '';
        if(data.department){
          value = DetailsOfWho.hasValue(data.department.name);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProHireDate) {
        var value = '';
        if(data.hireDate){
          value = Dates.format(data.hireDate,Content.general.dFTypes[0])
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProPayGroup) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.payGroup) + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDefaultRoster) {
        value = '';
        if(data.defaultRoster){
          value = DetailsOfWho.hasValue(data.defaultRoster.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDefaultRosterDesc) {
        value = '';
        if(data.defaultRoster){
          value = DetailsOfWho.hasValue(data.defaultRoster.desc);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProEffectiveRoster) {
        value = '';
        if(data.effectiveRoster){
          value = DetailsOfWho.hasValue(data.effectiveRoster.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProEffectiveRosterDesc) {
        value = '';
        if(data.effectiveRoster){
          value = DetailsOfWho.hasValue(data.effectiveRoster.desc);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCostPos) {
        value = '';
        if(data.position && data.workItem.costCenter){
          value = DetailsOfWho.hasValue(data.position.costCenter.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProCostPos) {
        value = '';
        if(data.position){
          value = DetailsOfWho.hasValue(data.position.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProWorkOrderItem) {
        value = '';
        if(data.workItem && data.workItem.workOrder){
          value = DetailsOfWho.hasValue(data.workItem.workOrder.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProWorkOrderItem) {
        value = '';
        if(data.workItem){
          value = DetailsOfWho.hasValue(data.workItem.id);
        }
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + value + '</td>';
        isAlt = !isAlt;
      }
      if(ScreenPrefs.showProDefShiftRule) {
        str += '<td class="c' + DetailsOfWho.getAlt(isAlt) + '">' + DetailsOfWho.hasValue(data.shiftRule) + '</td>';
        isAlt = !isAlt;
      }
      str += '</tr>';
      
      str += '</tbody>';
      str += '</table>';
      str += '</div>';
      
      $(target).html(str);
    },

  };

})();