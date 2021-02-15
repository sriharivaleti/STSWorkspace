//# sourceURL=QuestionWizard

(function($) {

  var selector = null;
  var isCompleted = null;

  $.fn.QuestionWizard = function(options) {
    var dataObj = data.obj;
    selector = $(this);
    dataObj.getUrl = options.getUrl;
    dataObj.postUrl = options.postUrl;
    dataObj.cancelUrl = options.cancelUrl;
    custom.orchestrate = (options.orchestrate !== undefined) ? options.orchestrate : custom.orchestrate;
    custom.serialize = (options.serialize !== undefined) ? options.serialize : custom.serialize;
    custom.onComplete = (options.onComplete !== undefined) ? options.onComplete : custom.onComplete;
    custom.onClose = (options.onClose !== undefined) ? options.onClose : custom.onClose;
    custom.onCancel = (options.onCancel !== undefined) ? options.onCancel : custom.onCancel;
    data.setInstance(dataObj);
    isCompleted = false;
    getQuestion();
  };

  // Data Containers and Functions
  var timeSelector = {};
  var display = [];
  var datetimeDate = [];
  var data = {
    template: {id: '', text: '', answerType: '', answers: [], selectedAnswer: {}, result: {complete: false, result: null}},
    templateHistory: {id: '', text: '', answerType: '', answers: [], selectedAnswer: {}},
    templateAnswer: {id: '', text: ''},
    obj: {
      getUrl: 'http://',
      postUrl: 'http://',
      cancelUrl: 'http://',
      response: null,
      current: null,
      history: []
    },
    getInstance: function() {
      return $(selector).data('data');
    },
    setInstance: function(instance) {
      instance = (instance === null) ? data.obj : instance;
      $(selector).data('data', instance);
    },
    purgeLastHistoryItem: function() {
      var dataObj = data.getInstance();
      if (dataObj.history.length !== 0) {
        dataObj.history.pop();
        // Disabling the Previous button for First Follow up question on first load or navigating from other follow up questions
        if (dataObj.history.length === 0 || dataObj.history[dataObj.history.length-1].isFirst == true) {
          ui.togglePrevious('disable');
        }
      }
      data.setInstance(dataObj);
    },
    addNewHistoryItem: function() {
      var dataObj = data.getInstance();
      if (dataObj.current !== null) {
        dataObj.history.push(dataObj.current);
      }
      data.setInstance(dataObj);
    }
  };

  // Custom Functions
  var custom = {
    orchestrate: function(json) {
      return json;
    }, // Must return an array (complete:false, currentData: {}) NOTE: data based on QuestionWizard.data.template & templateAnswer
    serialize: function(currentData) {
      return currentData.current;
    }, // Will be using QuestionWizard.data.current
    onComplete: function(response) {
      return true;
    },
    onCancel: function() {
    },
    onClose: function() {
    }
  };

  var validation = {
    manipulateDate: function(date, input) {
      var selectDate = $(input).datepicker('getDate');
      if (selectDate != null) {
        $(input).datepicker('setDate', selectDate);
        selectDate = $(input).datepicker('getDate');
      }
    },
    validateAnswer: function() {
      var dataObj = data.getInstance();
      var isValid = true;
      var errorMessage = '';

      if (dataObj.current.answerType == 'datetime') {
        var selectDate = $('#dateSelector_qw').datepicker('getDate');
        var dateValue = $('#dateSelector_qw').val();
        $('#dateSelector_qw').datepicker('setDate', dateValue);
        var dateOfVal = $('#dateSelector_qw').datepicker('getDate');
        if (timeSelector.isValid() && (selectDate != null && (Dates.format(dateOfVal, Content.general.dFTypes[1]) == Dates.format(selectDate, Content.general.dFTypes[1])))) {
          var time = timeSelector.toDateArray(selectDate);
          dataObj.current.selectedAnswer = { value: JSON.stringify(time) };
          display [dataObj.history.length] = time;
          datetimeDate [dataObj.history.length] = Dates.format(selectDate, Content.general.dFTypes[1]);
        }
        else {
          $('#dateSelector_qw').val(dateValue);
          isValid = false;
        }
      }
      else if (dataObj.current.answerType == 'time') {
        if (timeSelector.isValid()) {
          var time = timeSelector.toDateArray(new Date());
          dataObj.current.selectedAnswer = { value: JSON.stringify(time) };
          display [dataObj.history.length] = time;
        }
        else {
          isValid = false;
        }
      }
      else if (dataObj.current.answerType == 'date') {
        var selectDate = $('#dateSelector_qw').datepicker('getDate');
        var dateValue = $('#dateSelector_qw').val();
        $('#dateSelector_qw').datepicker('setDate', dateValue);
        var dateOfVal = $('#dateSelector_qw').datepicker('getDate');
        if (selectDate != null && (Dates.format(dateOfVal, Content.general.dFTypes[1]) == Dates.format(selectDate, Content.general.dFTypes[1]))) {
          dataObj.current.selectedAnswer = { value: JSON.stringify(Dates.revertForJSON(selectDate)) };
          display [dataObj.history.length] = Dates.format(selectDate, Content.general.dFTypes[1]);
        }
        else {
          $('#dateSelector_qw').val(dateValue);
          isValid = false;
        }
      }
      else if (dataObj.current.answerType == 'duration') {
        if (Validation.validate('duration546', $('#durationSelector'), false)) {
          var duration = $('#durationSelector').val();
          display [dataObj.history.length] = duration.toString();
          duration = Dates.convertDurationDisplay(duration, null, 'duration546');
          dataObj.current.selectedAnswer = { value: duration.toString() };
        }
        else {
          isValid = false;
          MessageDisplay.error(locale.enterValidDuration);
        }
      }
      else if (dataObj.current.answerType == 'singleoption') {
        var selector_id = $(selector).attr('id');
        var answer = $('input[id^="' + selector_id + '_answer_"]:checked');
        if (answer.val() != null) {
          answer = answer.attr('id').split("_");
          display [dataObj.history.length] = answer[2];
          dataObj.current.selectedAnswer = {value: dataObj.current.answers[answer[2]].id, valueFull:dataObj.current.answers[answer[2]].value};
        }
        else {
          isValid = false;
        }
      }
      else if (dataObj.current.answerType == 'boolean') {
        dataObj.current.selectedAnswer = { value: 'false'};
        if($("#booleanSelector").is(":checked")){
          dataObj.current.selectedAnswer = { value: 'true'};
        }
        display [dataObj.history.length] = dataObj.current.selectedAnswer.value;
      }
      else if (dataObj.current.answerType == 'text') {
        var selector_id = $(selector).attr('id');
        var text = $('input[id^="' + selector_id + '_answer_"]').val();
        if (text !== "" ) {
          display [dataObj.history.length] = text;
          dataObj.current.selectedAnswer = { value: text };
        }
        else {
          isValid = false;
        }
      }
      else if(dataObj.current.answerType == 'integer'){
        var integerValue = $(selector).find('#integerSelector').val();
        if(Validation.validate('int', $('#integerSelector'), false)) {
          dataObj.current.selectedAnswer = { value:integerValue.toString() };
          display [dataObj.history.length] = integerValue;
        }
        else {
          isValid = false;
        }
      }
      else if (dataObj.current.answerType == 'integerrange') {
        var integerRange = $(selector).find('#integerRangeSelector').val();
        if(integerRange !== "-1") {
          dataObj.current.selectedAnswer = { value:integerRange.toString() };
          display [dataObj.history.length] = integerRange;
        }
        else {
          isValid = false;
        }
      }
      if (dataObj.current.selectedAnswer == null) {
        isValid = false;
      }
      return { isValid: isValid, errorMessage: errorMessage };
    }
  };

  var orchestrate = function(dataObj) {

    // orchestrate response into the QuestionWizard.data.current
    var responseObj = custom.orchestrate(dataObj.response);
    //console.log(JSON.stringify(responseObj));
    // orchestrate validation
    if (responseObj.result != null) {
      // TODO: show result
      isCompleted = true;
      $(selector).dialog('close');
      custom.onComplete(responseObj.result);
    } else {
      delete responseObj.result;
      // orchestrate validation
      if (responseObj.id !== undefined && responseObj.text !== undefined &&
          responseObj.answers !== undefined && responseObj.answerType !== undefined) {
        if (responseObj.history !== undefined) {
          dataObj.history = responseObj.history;
          delete responseObj.history;
        }
        dataObj.current = responseObj;
        data.setInstance(dataObj);
        dialog.update();
      } else {
        isCompleted = true;
        custom.onComplete(responseObj);
        $(selector).dialog('close');
        console.log('INVALID Orchestrate Data: Unknown Data List');
      }
    }
  };

  var serialize = function(currentData) {
    return custom.serialize(currentData);
  };

  // This function will handle getting each question
  // and when you answer a question, it will be passed as data
  var getQuestion = function() {
    ui.toggleLoading('enable');

    // Handle Next Question Logic
    var dataObj = data.getInstance();

    dataObj.response = null;
    dataObj.current = null;
    dataObj.history = [];

    $.getJSON(dataObj.getUrl, {employeeId: ARForm.details.payroll}, function(json) {
      if (json != null) {
        dialog.open();
        dataObj.response = json;
        orchestrate(dataObj);
      }
    });
  };

  var postQuestion = function() {
    ui.toggleLoading('enable');
    var dataObj = data.getInstance();
    var postData = serialize(dataObj);

    dataObj.response = null;
    dataObj.current = null;

    $.postJSON(dataObj.postUrl, postData, function(json) {
      dataObj.response = json;
      orchestrate(dataObj);
    });
  };

  var ui = {
    base: "<div class='wizard-container'><div class='question-text'></div><div class='answer-box'></div></div><div class='wizard-loader'><img src='../common/images/ajax-loader.gif'/></div>",
    renderType: function(answerIndex, answer, answerType, selected, possibleAnswers) {
      var selector_id = $(selector).attr('id');
      switch (answerType) {
      case 'singleoption':
        var str = '<div class="answer-group">';
        str += '<div class="answer-label">';
        var isChecked = (selected !== undefined && selected.value == answer.id ? 'checked' : '');
        str += '<input type="radio" id="' + selector_id + '_answer_' + answerIndex + '" name="' + selector_id + '_answer_radio" ' + isChecked  + '/>';
        str += answer.value;
        str += '</div>';
        var linkLabel = answer.linkLabel;
        var linkUrl = answer.linkUrl;
        if (linkLabel && linkUrl){
          str += '<span class="answer-link"' + '"><a href="' + linkUrl + '">'+ linkLabel + '</a></span>';
        }
        str += '</div>';
        return str;
        break;
      case 'multiSelect':
        var checkboxSelected = '';
        for (var ans in selected) {
          if (ans.id === answer.id) {
            checkboxSelected = 'checked';
            return false;
          }
        }
        return '<div><input type="checkbox" id="' + selector_id + '_answer_' + answerIndex + '" name="' + selector_id + '_answer_check" ' + checkboxSelected  + '/>' + answer.text + '</div>';
        break;
      case 'boolean':
        return '<div><input type="checkbox" id="booleanSelector"/></div>';
        break;
      case 'integer':
        return '<div><input type="text" style="width:80px" id="integerSelector" /></div>';
        break;
      case 'integerrange':
        var str = '<div><select id="integerRangeSelector">';
        str += '<option value="' + -1 + '"></option>';
        if (possibleAnswers != null && possibleAnswers.length > 0) {
          var min = possibleAnswers[0][0];
          var max = possibleAnswers[possibleAnswers.length-1][0];
          for (var i = min; i <= max; i++) {
            var isSelected = (selected !== undefined && selected.value == i) ? ' selected="selected"' : '';
            str += '<option value="' + i + '"' + isSelected + '>' + i + '</option>';
          }
        }
        str += '</select></div>';
        return str;
        break;
      case 'duration':
        return '<div><input type="text" style="width:80px" id="durationSelector" /></div>';
        break;
      case 'date':
        return '<div><input type="text" style="width:80px" id="dateSelector_qw" /></div>';
        break;
      case 'time':
        return '<div id="timeSelector" style="display:inline" class="timeEntryCS"></div>';
        break;
      case 'datetime':
        return '<div><input type="text" style="width:80px" id="dateSelector_qw" /><div id="timeSelector" style="display:inline" class="timeEntryCS"></div></div>';
        break;
      case 'text':
        return '<div><input type="text" id="' + selector_id + '_answer_' + answerIndex + '" name="' + selector_id + '_answer_text" value="'+(selected !== undefined && compare(selected, answer) ? selected : '')+'"/></div>';
        break;
      case 'lookup':
        return '<div><input type="text" id="' + selector_id + '_answer_' + answerIndex + '" name="' + selector_id + '_answer_lookup" value="'+(selected !== undefined && compare(selected, answer) ? selected : '')+'"/></div>';
        break;
      default:
        return '<div>Undefined Question Type</div>';
      }
    },
    updateBody: function(question, answers) {
      $(selector).find('.question-text').html(question);
      $(selector).find('.answer-box').html(answers);
    },
    toggleLoading: function(toggle) {
      if (toggle === 'enable') {
        $(selector).find('.wizard-container').stop().hide();
        $(selector).find('.wizard-loader').stop().fadeTo(300,1);
      } else {
        $(selector).find('.wizard-loader').stop().hide();
        $(selector).find('.wizard-container').stop().fadeTo(500,1);
      }

    },
    togglePrevious: function(toggle) {
      $(selector).siblings('.ui-dialog-buttonpane').find('button:contains("'+locale.previousQuestion+'")').button(toggle);
    }
  };

  var dialog = {
    open: function() {
      var opts = {
        autoOpen: true,
        width: 500,
        modal: true,
        buttons: {},
        close: events.close,
        closeOnEscape: true
      };

      opts.buttons[locale.cancel] = function() {$(this).dialog('close'); };

      opts.buttons[locale.nextQuestion] = events.next;
      opts.buttons[locale.previousQuestion] = events.previous;
      $(selector).html(ui.base).dialog(opts);
      $([document, window]).unbind('.dialog-overlay');
      ui.togglePrevious('disable');
    },
    update: function() {
      // TODO: update dialog - hide loading text
      var dataObj = data.getInstance();
      var question = dataObj.current;
      var types = [ 'text', 'datetime', 'date', 'time', 'boolean', 'duration', 'integerrange', 'integer' ];
      var answerBody = '';
      if ($.inArray(question.answerType, types) == -1) {
        $(question.answers).each(function(i, obj) {
          answerBody += (obj !== null) ? ui.renderType(i, obj, question.answerType, question.selectedAnswer) : '';
        });
      } else {
        answerBody += ui.renderType(null, null, question.answerType, question.selectedAnswer, question.answers);
      }

      ui.updateBody(question.text, answerBody);
      events.bindSelected();
      events.bindAnswerLink();
      dialog.displayData(dataObj);
      ui.toggleLoading('disable');
    },
    displayData: function(dataObj) {
      var selector_id = $(selector).attr('id');
      if (dataObj.current.answerType == 'time') {
        var initialTime = (display [dataObj.history.length] === undefined)? {hours:8, minutes:0} : display [dataObj.history.length];
        timeSelector = new TimeInput({container: $('#timeSelector'), initialValue: initialTime});
        timeSelector.render();
      }
      else if (dataObj.current.answerType == 'date') {
        Criteria.initializeDatePickers('#' + selector_id + ' #dateSelector_qw', true, true);
        var lastdate = display [dataObj.history.length];
        if (lastdate === undefined) {lastdate = new Date();}
        $('#' + selector_id + ' #dateSelector_qw').datepicker('setDate', lastdate);
      }
      else if (dataObj.current.answerType == 'datetime') {
        Criteria.initializeDatePickers('#' + selector_id + ' #dateSelector_qw', true, true);
        var lastdate = datetimeDate [dataObj.history.length];
        if (lastdate === undefined) {lastdate = new Date();}
        $('#' + selector_id + ' #dateSelector_qw').datepicker('setDate', lastdate);
        
        var initialTime = (display [dataObj.history.length] === undefined)? {hours:8, minutes:0} : display [dataObj.history.length];
        timeSelector = new TimeInput({container: $('#timeSelector'), initialValue: initialTime});
        timeSelector.render();
      }
      else if (dataObj.current.answerType == 'duration') {
        var lastduration = display[dataObj.history.length];
        if (lastduration == null) {lastduration = Dates.getDurationDisplay(0);}
        $('#' + selector_id + ' #durationSelector').val(lastduration);
      }
      else if (dataObj.current.answerType == 'singleoption') {
        if(display [dataObj.history.length] !== undefined){
          var answerIndex = display[dataObj.history.length];
          $('input[id^="' + selector_id + '_answer_' + answerIndex + '"]').prop('checked', true);
        }        
      }
      else if (dataObj.current.answerType == 'text') {
        if(display [dataObj.history.length] !== undefined){
          var text = display[dataObj.history.length];
          $('input[id^="' + selector_id + '_answer_"]').val(text);
        }
      }
      else if (dataObj.current.answerType == 'integerrange') {
        if(display [dataObj.history.length] !== undefined ){
          var prevIntValue = display[dataObj.history.length];
          $('#' + selector_id + ' #integerRangeSelector').val(prevIntValue);
        }
      }
      else if (dataObj.current.answerType == 'integer') {
        if(display [dataObj.history.length] !== undefined ){
          var prevIntValue = display[dataObj.history.length];
          $('#' + selector_id + ' #integerSelector').val(prevIntValue);
        }
      }
      else if (dataObj.current.answerType == 'boolean') {
        if(display [dataObj.history.length] === 'true'){
          $('#booleanSelector').prop('checked',true);
        }
      }
    }
  };

  var events = {
    bindSelected: function() {
      var selector_id = $(selector).attr('id');
      var dataObj = data.getInstance();
      $('input[id^="' + selector_id + '_answer_"]').unbind('change.QuestionWizard').bind('change.QuestionWizard', function() {
        var id = $(this).attr('id').split("_");
        switch (dataObj.current.answerType) {
        case 'singleoption':
          dataObj.current.selectedAnswer = {value: dataObj.current.answers[id[2]].id, 
                                            valueFull:dataObj.current.answers[id[2]].value};
          break;
        case 'multiSelect':
          var tmpAns = [];
          $('input[id^="' + selector_id + '_answer_"]:checked').each(function(i, obj) {
            var tmpId = $(this).attr('id').split("_");
            tmpAns.push(dataObj.current.answers[id[2]]);
          });
          dataObj.current.selectedAnswer = tmpAns;
          break;
        case 'text':
          dataObj.current.selectedAnswer = { value: $(this).val() };
          break;
        default:
          break;
        }
        data.setInstance(dataObj);
      });
    },
    bindAnswerLink: function(){
      $(selector).find('.answer-link a').click(function(){
        window.open($(this).attr('href'),'','scrollbars=yes,status=no,resizable=yes,width=750,height=500'); 
        return false;
      });
    },
    previous: function() {
      var dataObj = data.getInstance();
      if (dataObj.history !== undefined && dataObj.history.length !== 0) {
        ui.toggleLoading('enable');
        data.purgeLastHistoryItem();
        var cur = $.extend(true, {}, dataObj.current);

        dataObj.current.answers = [];
        dataObj.current = $.extend(true, dataObj.current, dataObj.history[dataObj.history.length-1]);
        data.setInstance(dataObj);

        dialog.update();
      }
    },
    next: function() {
      var dataObj = data.getInstance();

      // Validate Answers
      $(selector).find('.answer-box div').removeClass('answer-box-error');

      var validationResponse = validation.validateAnswer();

      if (validationResponse.isValid) {
        data.setInstance(dataObj);
        ui.togglePrevious('enable');
        postQuestion();
      } else {
        $(selector).find('.answer-box div').addClass('answer-box-error');
      }
    },
    close: function() {
      var dataObj;
      var postData;

      if (!isCompleted) {
        dataObj = data.getInstance();
        postData = serialize(dataObj);
        $.postJSON(dataObj.cancelUrl, postData);
        custom.onCancel();
      }

      data.setInstance();
      selector = null;
      display = [];
      datetimeDate = [];

      if (custom.onClose != null) {
        custom.onClose();
      }
    }
  };

  var compare = function(obj1, obj2) {
    function _equals(obj1, obj2) {
      return JSON.stringify(obj1) === JSON.stringify($.extend(true, {}, obj1, obj2));
    }
    return _equals(obj1, obj2) && _equals(obj2, obj1);
  };

})(jQuery);
