var ScreenPrefsController = (function () {

  return {
    
    json: {},
    
    get: function() {
      var url = '/wfm/screenPref/getAll';

      $.getJSON(url, {}, function(json) {
        ScreenPrefsController.json = json;
        ScreenPrefsController.orchestrate();
      });
    },
    
    orchestrate: function() {
      $(ScreenPrefsController.json.screenPrefs).each(function(i, o) {
        ScreenPrefs[o.name] = (o.value == 'true' ? true : (o.value == 'false' ? false : o.value));       
      });
      //ScreenPrefs.AmPm = true;
      
    },
    
    checkPermissionForRowDisplay: function(extent) {
      var codeType = extent.code.type;
      var bonusType = extent.code.typeName;
      
      var isShown = true;
      var showAbsenceData = ScreenPrefs.showAbsences;
      var showBonusData = ScreenPrefs.showBonuses;
      var showAdjustmentData = ScreenPrefs.showAdjustments;
      var showEntitlementData = ScreenPrefs.showEntitlements;
      var showMissingData = ScreenPrefs.showSystemUnpaid;
      // Check if the extent is an absence
      if (codeType == 1 || codeType == 2) {
        isShown = isShown && showAbsenceData;
      }
      // Check if the extent is a bonus
      if (codeType == 4 && bonusType != "A") {
        isShown = isShown && showBonusData;
      }
      // Check if the extent is an adjustment
      if (codeType == 4 && bonusType == "A") {
        isShown = isShown && showAdjustmentData;
      }
      // Check if the extent is an entitlement
      if (codeType == 10) {
        isShown = isShown && showEntitlementData;
      }
      // Check if the extent is missing data
      if (codeType == 5) {
        isShown = isShown && showMissingData;
      }
      return isShown;
    },
    
    canShow: function(field) {
      var v = false;
      switch (field) {
        case 'center':
          v = (ScreenPrefs.showCcPosMulti == 'both' || ScreenPrefs.showCcPosMulti == 'single');
          break;
        case 'position':
          v = (ScreenPrefs.showCcPosMulti == 'both');
          break;
        case 'workOrder':
          v = (ScreenPrefs.showWorkOrdersMulti == 'both' || ScreenPrefs.showWorkOrdersMulti == 'single');
          break;
        case 'workItem':
          v = (ScreenPrefs.showWorkOrdersMulti == 'both');
          break;    
        case 'center1':
          v = (ScreenPrefs.showWorkedCcPos1Multi == 'both' || ScreenPrefs.showWorkedCcPos1Multi == 'single');
          break;
        case 'position1':
          v = (ScreenPrefs.showWorkedCcPos1Multi == 'both');
          break;
      }
      return v;
    },
    
    eof: 0

  };
}) ();

