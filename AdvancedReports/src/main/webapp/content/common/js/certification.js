//# sourceURL=Certification
Certification = (function() {
  'use strict'

  return {

    employeeObj : null,
    isLearningException : false,
    checkCertificationOnLoad : function(obj) {
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        var warning = '<span class="warning" title><i class="fa fa-warning" aria-hidden="true"></i></span>';
        Certification.employeeObj = obj;
        var isComplete = true;
        $(obj).each(function(i, o) {
          $("#employee_" + o.employeeId + " .mainTitleColumn .employeeName .warning").remove();
          var incompleteCert = [];
          $(o.schedules).each( function(index, schedule) {
            $(schedule.workExtents).each( function(j, workExtent) {
              isComplete = true;
              $(workExtent.empJobActivities).each( function(k, activity) {
                if (activity.assignmentType == "Required" && activity.status != "Completed") {
                  isComplete = false;
                }
              });
              if (!isComplete) {
                incompleteCert.push(workExtent.position.name);
              }
            });
          });
          incompleteCert = jQuery.unique(incompleteCert).join();
          if (!isComplete) {
            $("#employee_" + o.employeeId + " .mainTitleColumn .employeeName .employeeSpan").before(warning);
            $("#employee_" + o.employeeId + " .mainTitleColumn .employeeName .warning").attr( "title", ServerVars.lmPermissions.incompleteCertifications+": " + incompleteCert);
          }
        });
      }

    },

    checkValidCertification : function(options, successFunction) {
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible ) {
        var data = {
            employeeId : options.emp.employeeId,
            center : options.center ? (options.center.id ? options.center.id : options.center) : null,
            position : options.position ? (options.position.id ? options.position.id : options.position)  : null,
            startDate : options.startdate,
            endDate : (options.enddate != null) ? options.enddate : options.startdate
        };
        var empName = "";
        if(options.emp.firstName && options.emp.lastName) {
          empName =  options.emp.lastName + "," + options.emp.firstName;
        }else {
          empName = options.emp.employeeName;
        }
        $.getJSON('/wfm/empjobactivity', data, function(obj) {
          var inCompleteObj = [];
          var isComplete = true;
          if (obj.activities.length > 0) {
            $(obj.activities).each(function(i, o) {
              if (o.assignmentType == "Required" && o.status != "Completed") {
                isComplete = false;
                inCompleteObj.push(o);
              }
            });
            if (ServerVars.lmPermissions.isExceptionOverride || isComplete) {
              if (successFunction != null) {
                successFunction(obj);
                Certification.refreshEmployeeGrid(Certification.employeeObj)
              }
            } else {
              var errorMsg = ServerVars.lmPermissions.learningActivitiesException
              + "<br><br><div><span class='expand' onClick='Certification.expandIncomplteCertifications(this)' title>"
              errorMsg += "<i class='fa fa-caret-down' aria-hidden='true'></i></span><label>" + empName + " - " + options.position.name +"</label><ul>";

              $(inCompleteObj).each(function(i, o) {
                errorMsg += "<li>" + o.activityName + "</li>";
              });
              errorMsg += "</ul></div>";
              $($(".messageContent")[0]).parent().remove();
              MessageDisplay.error(errorMsg);
            }
          } else {
            if (successFunction != null) {
              successFunction(obj);
              Certification.refreshEmployeeGrid(Certification.employeeObj)
            }
          }
        });
      }
      else {
        if(successFunction != null) { successFunction() };
      }


    },

    checkValidCertificationOnReplace : function(employee, oldEmp, successFunction) {
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        var currDate = $('#cDate').datepicker('getDate');
        var errorMsg = locale.learningActivitiesException + "<br><br>";
        var error = true;
        $(oldEmp.schedules).each( function(index, schedule) {
          var l = schedule.workExtents.length - 1;
          $(schedule.workExtents).each(function(j, workExtent) {
            var options = {
                emp : employee,
                center : workExtent.costCenter,
                position : workExtent.position,
                startdate : Dates.format(currDate, 'YYYY-MM-DD'),
                enddate : null
            }
            Certification.checkValidCertification(options, successFunction)
          });
        });
      }
      else {
        if(successFunction != null) { successFunction() };
      }
    },

    checkValidCertificationOnSave : function(obj, successFunction) {
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        var id = "", name = "", position = "", posId = "", activities = [], isComplete = true;
        var empObj = {
            "employees" : []
        };

        $(obj)
        .each(
            function(i, o) {
              if (o.employeeId.indexOf("blankRow_") == -1) {
                id = o.employeeId;
                name = o.lastName + "," + o.firstName;
                $(o.schedules)
                .each(
                    function(index, schedule) {
                      $(schedule.workExtents)
                      .each(
                          function(j, workExtent) {
                            position = (workExtent.position.name != null) ? workExtent.position.name
                                : workExtent.position;
                            posId = (workExtent.position != null) ? workExtent.position
                                : workExtent.position.id;
                            activities = [];
                            $(workExtent.empJobActivities)
                            .each(
                                function(k, activity) {
                                  if (activity.assignmentType == "Required"
                                      && activity.status != "Completed") {
                                    activities
                                    .push({
                                      "activityId" : activity.activityId,
                                      "activityName" : activity.activityName
                                    });
                                    isComplete = false;
                                  }
                                });
                            empObj.employees.push({
                              "id" : id,
                              "name" : name,
                              "position" : position,
                              "posId" : posId,
                              "activities" : activities
                            });
                          });
                    });
              }
            });
        if (ServerVars.lmPermissions.isExceptionOverride || isComplete) {
          if (successFunction != null) {
            successFunction()
          }
          ;
        } else {
          var errorMsg = ServerVars.lmPermissions.learningActivitiesException + "<br/><br/>";
          var l = empObj.employees.length, count = 0;

          for (var i = 0; i < l; i++) {
            var emp = empObj.employees[i];
            var push = true;
            if (i > 0 && i <= l) {
              if (emp.id == empObj.employees[i - 1].id &&  emp.posId == empObj.employees[i - 1].posId) {
                push = false;
              } else {
                push = true;
              }
            }
            if (push && emp.activities.length > 0) {
              errorMsg += "<div><span class='expand' onClick='Certification.expandIncomplteCertifications(this)' title>"
                if(count == 0)  { errorMsg += "<i class='fa fa-caret-down' aria-hidden='true'></i></span><label>" + emp.name + " - " + emp.position +"</label><ul>"; }
                else { errorMsg += "<i class='fa fa-caret-right' aria-hidden='true'></i></span><label>" + emp.name + " - " + emp.position +"</label><ul style='display: none'>"; }

              var empActivities = Certification.uniqueJson(emp.activities);
              $(empActivities).each(function(j, a) {
                errorMsg += "<li>" + a.activityName + "</li>";
              });
              errorMsg += "</ul></div>";
              count ++;
            }

          }
          ;
          MessageDisplay.error(errorMsg);
        }
      }else {
        if(successFunction != null) { successFunction() };
      }

    },

    checkValidCertificationOnCopy : function(obj, successFunction) {
      Certification.checkValidCertificationOnSave(obj, successFunction);
    },

    refreshEmployeeGrid : function(obj) {
      Certification.closeDialog();
      Certification.checkCertificationOnLoad(obj);
    },

    closeDialog : function() {
      $("#Fields").dialog("close");
    },

    uniqueJson: function(data) {
      var uniqueValues = [];
      var uniqueIds = [];
      for(var i = 0; i< data.length; i++){
        if(uniqueIds.indexOf(data[i].activityId) === -1){
          uniqueIds.push(data[i].activityId);
          uniqueValues.push(data[i]);
        }
      }
      return uniqueValues;
    },

    checkCertificationOnCopyWeekly: function(obj, successFunction) {
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        var isComplete = true;
        var inCompleteObj = [];
        $(obj.costCenters).each(function(i, center){
          var positionObj = [];
          $(center.positions).each(function(i, pos) {
            positionObj.push({"id": pos.id, "description": pos.description});
          })
          if(center.roles) {
            $(center.roles).each(function(i, role) {
              $(role.employees).each(function(j, employee) {
                $(positionObj).each(function(k, pos) {
                  isComplete = true;
                  if(employee.empJobActivities[pos.id]) {
                    $(employee.empJobActivities[pos.id]).each(function(a, activity) {
                      if(activity.assignmentType == "Required" && activity.status != "Completed") {
                        isComplete = false;
                      }
                    })
                  }
                  if(!isComplete) {
                    inCompleteObj.push({"position":pos.description, "empName": employee.name, "activities": employee.empJobActivities[pos.id]});
                  }
                })
              })
            });
          }else {
            $(center.positions).each(function(j, pos) {
              var posId = pos.id;
              if(pos.employees.length > 0) {
                $(pos.employees).each(function(k, employee) {
                  isComplete = true;
                  $(employee.empJobActivities[posId]).each(function(e, activity) {
                    if(activity.assignmentType == "Required" && activity.status != "Completed") {
                      isComplete = false;
                    }
                  })
                  if(!isComplete) {
                    inCompleteObj.push({"position":pos.description, "empName": employee.name, "activities": employee.empJobActivities[posId]});
                  }
                })
              }
            })
          }
        })
        if(ServerVars.lmPermissions.isExceptionOverride || inCompleteObj.length == 0) {
          if(successFunction != null) { successFunction() };
        }else {
          var errorMsg = ServerVars.lmPermissions.learningActivitiesException + "<br><br>";

          $(inCompleteObj).each(function(i, o) {
            errorMsg +=  "<div><span class='expand' onClick='Certification.expandIncomplteCertifications(this)' title>";

            if(i == 0)  { errorMsg += "<i class='fa fa-caret-down' aria-hidden='true'></i></span><label>" + o.empName + " - " + o.position + "</label><ul>"; }
            else { errorMsg += "<i class='fa fa-caret-right' aria-hidden='true'></i></span><label>" + o.empName + " - " + o.position + "</label><ul style='display: none'>"; }
            $(o.activities).each(function(j, activity) {
              errorMsg += "<li>"+activity.activityName + "</li>";
            })
            errorMsg += "</ul></div>";
          });

          $($(".messageContent")[0]).parent().remove();
          MessageDisplay.error(errorMsg);
        }
      }else {
        if(successFunction != null) {
          successFunction();
        }
      }
    },

    showWarningOnLoad: function(activities, positionId, positions) {

      var incompleteCert = [], isComplete = true, warning = "", posName = positionId;
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        for(var i = 0; i < positions.length; i++) {
          if(positionId == positions[i].id) {
            posName = positions[i].description;
          }
        }
        for(var i = 0; i < activities.length; i++ ) {
          if(activities[i].assignmentType == "Required" && activities[i].status != "Complete") {
            isComplete = false;
          }
        }
        if(!isComplete) {
          incompleteCert.push(posName);
        }
        if(incompleteCert.length > 0) {
          warning = '<span class="warning" title="'+ServerVars.lmPermissions.incompleteCertifications+': '+jQuery.unique(incompleteCert).join()+'"><i class="fa fa-warning" aria-hidden="true"></i>';
        }
      }
      return warning;
    },

    showWarningOnLoadCalender: function(positions, employee) {
      var incompleteCert = [], warning = "";
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        $(positions).each(function(i, pos) {
          var isComplete = true;
          if(employee.empJobActivities) {
            $(employee.empJobActivities[pos.id]).each(function(j, activity) {
              if(activity.assignmentType == "Required" && activity.status != "Completed") {
                isComplete = false;
              }
            });
          }

          if(!isComplete) {
            incompleteCert.push(pos.name);
          }
          if(incompleteCert.length > 0) {
            warning = '<span class="warning" title="'+ServerVars.lmPermissions.incompleteCertifications+': '+jQuery.unique(incompleteCert).join()+'"><i class="fa fa-warning" aria-hidden="true"></i>';
          }
        });
      }
      return warning;

    },

    checkScheduleOverrideCerttification: function(data, successFunction) {
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible && data.ccpChecked) {

        var url = '/wfm/empjobactivity/who';

        $.putJSON(url, data, function(result) {
          var isComplete = true;
          var inCompleteObj = [], count = 0;
          var errorMsg = ServerVars.lmPermissions.learningActivitiesException + "<br/><br/>";
          $(result).each(function(i,obj) {
            $(obj).each(function(j, o) {
              isComplete = true;
              $(o.activities).each(function(k, activity) {
                if(activity.assignmentType == "Required" && activity.status != "Completed") {
                  isComplete = false;
                }
              });
              if(!isComplete) {
                inCompleteObj.push(o.activities);
                errorMsg +=  "<div><span class='expand' onClick='Certification.expandIncomplteCertifications(this)' title>";
                if(count == 0)  { errorMsg += "<i class='fa fa-caret-down' aria-hidden='true'></i></span><label>" + Certification.getEmployeeName(o.employeeId) + " - " + o.position + "</label><ul>"; }
                else { errorMsg += "<i class='fa fa-caret-right' aria-hidden='true'></i></span><label>" + Certification.getEmployeeName(o.employeeId) + " - " + o.position + "</label><ul style='display: none'>"; }
                $(o.activities).each(function(j, activity) {
                  errorMsg += "<li>"+activity.activityName + "</li>";
                })
                errorMsg += "</ul></div>";
                count++;
              }
            });
          })
          if(ServerVars.lmPermissions.isExceptionOverride || inCompleteObj.length == 0) {
            if(successFunction != null) { successFunction() };
          }        else {
            MessageDisplay.error(errorMsg);
          }


        });
      }else {
        if(successFunction != null) {
          successFunction();
        }
      }
    },

    getEmployeeName: function(empId) {
      var empName = empId;
      if(Criteria.employees) {
        $(Criteria.employees).each(function(i, o) {
          if(empId == o.employeeId) {
            var empNameArr = (o.name).split("-");
            empName = (empNameArr[1] == " Me") ? empNameArr[1].trim() : empNameArr[0];
          }
        })
      }
      return empName;
    },

    checkCertificationOnAcceptBid: function(options, successFunction) {
      if(ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        var errorMsg = ServerVars.lmPermissions.learningActivitiesException + "<br/><br/>";;
        var isComplete = true, inCompleteObj = [];
        $(options.bidsPlaced).each(function(i, o) {

          $(o.bidsSummary).each(function(j, bid) {
            isComplete = true, count = 0;
            $(options.bidIds).each(function(k, bidId) {
              if(bidId == bid.bidId) {
                $(bid.empJobActivities).each(function(j, activity){
                  if (activity.assignmentType == "Required" && activity.status != "Completed") {
                    isComplete = false;
                  }
                });
                var posName = "";
                $(options.offerSummary.offersSummary).each(function(o, offer) {
                  if(bid.offerId == offer.offerId) {
                    posName = offer.pos;
                  }
                })
                if(!isComplete) {
                  inCompleteObj.push(bid.empJobActivities);
                  errorMsg +=  "<div><span class='expand' onClick='Certification.expandIncomplteCertifications(this)' title>";
                  if(count == 0)  { errorMsg += "<i class='fa fa-caret-down' aria-hidden='true'></i></span><label>" + bid.lastName + "," + bid.firstName + " - " + $("#results_positionDescription").text() + "</label><ul>"; }
                  else { errorMsg += "<i class='fa fa-caret-right' aria-hidden='true'></i></span><label>" + bid.lastName + "," + bid.firstName + " - " + $("#results_positionDescription").text() + "</label><ul style='display: none'>"; }
                  $(bid.empJobActivities).each(function(j, activity) {
                    errorMsg += "<li>"+activity.activityName + "</li>";
                  })
                  errorMsg += "</ul></div>";
                  count++;
                }
              }
            })
          })

        })
        if(ServerVars.lmPermissions.isExceptionOverride || inCompleteObj.length == 0) {
          if(successFunction != null) { successFunction() };
        }else {
          MessageDisplay.error(errorMsg);
        }
      }else {
        if(successFunction != null) {
          successFunction();
        }
      }
    },

    expandIncomplteCertifications: function(obj) {
      console.log(obj);
      $(".messageContent ul").hide();
      $(".messageContent").find("i").removeClass("fa-caret-down");
      $(".messageContent").find("i").addClass("fa-caret-right");
      if($(obj).find("i").hasClass("fa-caret-right")) {
        $(obj).find("i").removeClass("fa-caret-right");
        $(obj).find("i").addClass("fa-caret-down");
        $(obj).next().next("ul").show();
      }else {
        $(obj).find("i").removeClass("fa-caret-down");
        $(obj).find("i").addClass("fa-caret-right");
        $(obj).next().next("ul").hide();
      }

    },

    checkCertificationOnBid : function(data, successFunction) {
      if (ServerVars.lmPermissions.isLMEnabled && ServerVars.lmPermissions.isActivitiesVisible) {
        Certification.checkScheduleOverrideCerttification(data, successFunction);
      }else {
        if(successFunction != null) {
          successFunction();
        }
      }
    }


  };
})();