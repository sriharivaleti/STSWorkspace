//# sourceURL=AdvancedReports

var AdvancedReports = (function() {
  "use strict"

  return {

    dateSelector : null,
    reports : [],
    requireWho : true,
    requireDate : true,
    who : "",
    startDate : "",
    endDate : "",
    selectedReportKey: "",

    init : function() {
//      AdvancedReports.dateSelector = Criteria.loadDateSelector();
//      Global.localize();

      //$("#advancedReportsPanel").hide();
      AdvancedReports.getReportsList();
      AdvancedReports.pageEvents();
      //Navigation.changedData = false;
     // Global.postHelpMessageToPortal();
      AdvancedReports.get();
    },
    
    dynamicReportHeight : function(){
      if(!( window.location.href.search("TenantKey") != -1 || window.self !== window.top)) {//$location.search().Portal || $location.search().TenantKey ||
        //$("#advancedReportsPanel").css("height", "520px");
      }
    },

    get : function() {

      //Criteria.showUnhighlightedButton();
      //Global.showLoading();
      AdvancedReports.dynamicReportHeight();
    },

    loadWhoEmployees: function() {
      /*Criteria.loadWhoSelector({
        mustShowGroups : true,
        mustShowEmployees : true,
        mustShowMe : true,
        employeePrefix : 'P#',
        getFunction:AdvancedReports.get,
        isChangeFunction : Criteria.onCriteriaSelectionChange
      });*/
    },

    getReportsList : function() {
//      $.getJSON('/wfm/analytics/advancedReports/listDefinitions', "", function(json) {
//        AdvancedReports.createReportDropdown(json);
//      });
    },

    loadReportTypes : function() {
//      $("#advancedReportSelect").selectmenu({
//        width : '250'
//      }).unbind('selectmenuchange').bind('selectmenuchange', function(event, ui) {
//        AdvancedReports.selectedReportKey = ui.item.value;
//        AdvancedReports.showHideSelectors();
//        Criteria.onCriteriaSelectionChange();
//      });
    },

    createReportDropdown : function(json) {
//      var standardReportTemplate = _.template($('#standardReportTemplate').html());
//      var adhocReportTemplate = _.template($('#adhocReportTemplate').html());
      var markup = '';
      var list = json.list;
      if (list.length > 0) {
        var noReportSelectedObj = {
            reportKey : 'noReportSelected',
            description : locale.pleaseSelectReport,
            path:null,
            requireWho : false,
            requireDate : false,
            extraParams:'sumtotalDecorate=no'
        };
        list.unshift(noReportSelectedObj);
        AdvancedReports.reports = list;
        for (var i = 0; i < list.length; i++) {
          if(list[i].path != null && list[i].path.indexOf("/Reports/") == -1 && list[i].path.indexOf("mode=library") == -1 ) {
            markup += adhocReportTemplate(list[i]);
          }
          else { 
            markup += standardReportTemplate(list[i]);
          }
        }
      } else {
        var noReportList = [ {
          reportKey : 'noReport',
          description : locale.noReportCreated,
          path:null,
          requireWho : false,
          requireDate : false,
          extraParams:'sumtotalDecorate=no'
        } ];
        AdvancedReports.reports = noReportList;
        markup += standardReportTemplate(AdvancedReports['reports'][0]);
      }
     // $('#advancedReportSelect').html(markup);
      AdvancedReports.loadReportTypes();
      AdvancedReports.showHideSelectors();
    },

    createIframe : function() {
      var Iframe = '<iframe src=""></iframe>';
      var url = AdvancedReports.getIframeURL();
//      $("#advancedReportsPanel").html(Iframe);
//      $("#advancedReportsPanel").show();
//      $("iframe").attr('src', url);
    },

    getIframeURL: function() {
      var url = locale.url + 'reportserver/flow.html?_flowId=';
      url += AdvancedReports.selectedReportKey;
      if (AdvancedReports.requireWho) {
        var who = AdvancedReports.getWho();
        who = encodeURIComponent(who);
        url += '&who=' + who;
      }
      if (AdvancedReports.requireDate) {
        var dateRange = AdvancedReports.getDates();
        url += '&whenFrom=' + dateRange.startDate + '&whenTo=' + dateRange.endDate;
      }
      if(AdvancedReports.extraParams) {
        url += AdvancedReports.extraParams;
      }
      return url;
    },

    getWho : function() {
      //var who = $("#cEmployee").val();
      /*var isUteWhoMe = Criteria.isUteWhoMe(who);
      if (isUteWhoMe) {
        who = Criteria.uteWhoMeEmployeeId;
      }
      return who;*/
    },

    getDates : function() {
      var dateEntry = AdvancedReports.dateSelector.getSelectedDateEntry();
      var fromDate = dateEntry.dateValue.from;
      var toDate = dateEntry.dateValue.to;
      if (dateEntry.dateOption.name == 'weekOf') {
        toDate = Dates.getEndOfWeek(toDate);
        fromDate = Dates.getStartOfWeek(fromDate);
      }
      var dateRange = {startDate : Dates.format(fromDate, Content.general.dFTypes[0]), endDate : Dates.format(toDate, Content.general.dFTypes[0])};
      return dateRange;
    },

    pageEvents : function() {
      /*Criteria.bindPageGetEvents(function() {
        AdvancedReports.refreshIframe();
      });*/
//      $("#cEmployee").unbind('selectmenuchange').bind('selectmenuchange', function(event, ui) {
//        AdvancedReports.refreshIframe();
//      });

//      $("#adhocReportSchedule").off().on("click", function() {
//        AdvancedReports.loadEmployeesAndNavigateToLink('analytics', 'adhocreportschedule');
//      });

//      if(ServerVars.permissions.canViewAdhocReportSchedule){
//        $("#adhocReportSchedule").show();
//      }
//      else{
//        $("#adhocReportSchedule").hide();
//      }
    },



    loadEmployeesAndNavigateToLink: function(moduleName, linkName){

//      var empId = $('#cEmployee').val().replace('P#', '');
      /*if (empId != null) {
        var module = Navigation.getModuleData(moduleName);
        var link = Navigation.getLinkData(linkName, moduleName);
        AjaxLoader.redirectOrLoad(link, module);
      }
      else {
        MessageDisplay.error(Content.general.pleaseSelectAnEmployee);
      }*/

    },

    refreshIframe: function() {
  //    var reportKeyValue = $('#advancedReportSelect option:selected').attr('lang');
      if (reportKeyValue === 'noReportSelected' || reportKeyValue === 'noReport') {
        MessageDisplay.error(locale.youMustSelectReport);
      } else {
        AdvancedReports.createIframe();
      }
      //Criteria.showUnhighlightedButton();
    },

    showHideSelectors: function() {
    //  var reportKeyValue = $('#advancedReportSelect option:selected').attr('lang');
      var listOption = _.findWhere(AdvancedReports.reports, {reportKey: reportKeyValue});
//      listOption.requireDate ? $('#dateSelect').show() : $('#dateSelect').hide();
//      listOption.requireWho ? $('#whoSelect, div.employeeSearchBox').show() : $('#whoSelect, div.employeeSearchBox').hide();
//      $("#navButtons").hide();

      AdvancedReports.requireWho = listOption.requireWho;
      AdvancedReports.requireDate = listOption.requireDate;
      AdvancedReports.extraParams = listOption.extraParams;
      AdvancedReports.loadWhoEmployees();
    },
  }
})();

AdvancedReports.init();