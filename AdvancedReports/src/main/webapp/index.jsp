<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Testing Jasper Reports</title>
</head>

<body style="position: static; -ms-overflow-style: scrollbar;">


	<div style="display: block;">


		<div >

			<div>
				<table cellspacing="0" cellpadding="0" class="reportSelect">
					<tbody>
						<tr>
							<td>
								<div>
									<div>
										<select id="advancedReportSelect">
											<option value="null" lang="noReportSelected">Please
												select report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/AbsenceAnalysis"
												lang="absenceAnalysis_dashboard">Advanced Absence
												Analysis Dashboard</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/AbsencesByDayOfWeek"
												lang="absencesByDayOfWeek_report">Advanced Absences
												by Day of Week Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/AccrualHistory"
												lang="accrualHistory_report">Advanced Accrual
												History Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/AccrualLiability"
												lang="accrualLiability_report">Advanced Accrual
												Liability Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/AffordableCareAct"
												lang="affordableCareAct_report">Advanced Affordable
												Care Act Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ApproachingWeeklyOvertime"
												lang="approachingWeeklyOvertime_report">Advanced
												Approaching Weekly Overtime Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ETL/ApproachingWeeklyOvertime2"
												lang="approachingWeeklyOvertime_report_2">Advanced
												Approaching Weekly Overtime Report 2</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ClockData"
												lang="clockData_report">Advanced Clock Data Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/EmployeeBadge"
												lang="employeeBadge_report">Advanced Employee Badge
												Number Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/GHPPayrollHours"
												lang="ghpPayrollHours_report">Advanced GHP Payroll
												Hours Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/HoursDistributionDashboard"
												lang="hoursDistribution_dashboard">Advanced Hours
												Distribution Dashboard</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ETL/HoursDistributionDashboard2"
												lang="hoursDistribution_dashboard_2">Advanced Hours
												Distribution Dashboard 2</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/JobScheduleAudit"
												lang="jobScheduleAudit_Report">Advanced Job
												Schedule Audit Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/MissedMeals"
												lang="missedMeals_report">Advanced Missed Meals
												Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ETL/MissedMeals2"
												lang="missedMeals_report_2">Advanced Missed Meals
												Report 2</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/MissingTime"
												lang="missingTime_report">Advanced Missing Time
												Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/NonWorkedDays"
												lang="nonWorkedDays_report">Advanced Non-Worked
												Days Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/PayPolicyInfo"
												lang="payPolicyInfo_report">Advanced Pay Policy
												Info Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/PayrollHoursByDivDept"
												lang="payrollHoursByCostCenter_report">Advanced
												Payroll Hours By Cost Center Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/PayrollHoursByShift"
												lang="payrollHoursByShift_report">Advanced Payroll
												Hours By Shift Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/PayrollHoursByShiftVertical"
												lang="payrollHoursByShiftVertical_report">Advanced
												Payroll Hours By Shift Vertical Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/PayrollHours"
												lang="payrollHours_report">Advanced Payroll Hours
												Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ProjectWOHoursAndPay"
												lang="projectWOHoursAndPay_report">Advanced Project
												(WO) Hours and Pay Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ProjectHours"
												lang="projectWOHours_report">Advanced Project (WO)
												Hours Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ScheduledvsActualHours"
												lang="scheduledVsActualHours_report">Advanced
												Scheduled vs. Actual Hours Report</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/ETL/ScheduledvsActualHours2"
												lang="scheduledVsActualHours_report_2">Advanced
												Scheduled vs. Actual Hours Report 2</option>

											<option
												value="viewReportFlow&amp;reportUnit=/Reports/UnapprovedTimeByEmployeeGroup"
												lang="unapprovedTimeByEmployeeGroup_report">Advanced
												Unapproved Time by Employee Group Report</option>

											<option value="searchFlow&amp;mode=library"
												lang="reportsLibrary">Library</option>
										</select> 
										
										
										
									</div>
									<div id="whoSelect"
										style="display: inline-block;">
										<select id="cEmployee" ><option
												value="EG#AP" lang="undefined" name="group">-- AP</option>
											<option value="EG#AR" lang="undefined" name="group">--
												AR</option>
											<option value="EG#HR" lang="undefined" name="group">--
												HR</option>
											<option value="EG#IT_DEPT" lang="undefined" name="group">--
												IT_DEPT</option>
											<option value="EG#MANUFACTURING" lang="undefined"
												name="group">-- MANUFACTURING</option>
											<option value="EG#PAYROLL" lang="undefined" name="group">--
												PAYROLL</option>
											<option value="P#13874" lang="true" name="13874">-
												Me</option></select><span
											class="ui-selectmenu-button ui-widget ui-state-default ui-corner-all"
											tabindex="0" id="cEmployee-button" role="combobox"
											aria-expanded="false" aria-autocomplete="list"
											aria-owns="cEmployee-menu" aria-haspopup="true"
											style="width: 174px;"><span
											class="ui-icon ui-icon-triangle-1-s"></span></span>
									</div>
									<div id="dateSelect" class="criteriaInputGroup"
										style="display: inline-block;">
										<span id="dateSelector" class="form-inline"
											data-dateoption="dateRange"> <label
											class="localize whoBarlabel" lang="start">Start</label>
											<div class="form-group">
												<div class="input-group">
													<input type="text" aria-describedby="basic-addon2"
														id="cStartDate"
														class="vAlignMid form-control hasDatepicker" value="">
													<span
														class="input-group-addon integratedButton hasCalendar">
														<i aria-hidden="true" class="fa fa-calendar"></i>
													</span>
												</div>
											</div> <label class="localize whoBarlabel" lang="end">End</label>
											<div class="form-group">
												<div class="input-group">
													<input type="text" aria-describedby="basic-addon2"
														id="cEndDate" class="vAlignMid form-control hasDatepicker"
														value=""> <span
														class="input-group-addon integratedButton hasCalendar">
														<i aria-hidden="true" class="fa fa-calendar"></i>
													</span>
												</div>
											</div>
										</span>
									</div>
									<div id="pageGetButton" class="criteriaInputGroup">
										<div class="criteriaBtnGroup">
											<button type="button" class="localize btn btn-primary"
												lang="goButton">Go</button>








										</div>
									</div>
								</div>

							</td>
							
						</tr>
					</tbody>
				</table>

			</div>

		</div>
		<!--  Criteria -->

		<div id="advancedReportsPanel" style="display: block; height: 520px;">
			<!-- <iframe src="https://wqa16web05-vmh:7136/wfm/analytics/reportserver/flow.html?_flowId=viewReportFlow&amp;reportUnit=/Reports/JobScheduleAudit&amp;who=EG%23AP&amp;whenFrom=2020-12-20&amp;whenTo=2020-12-26&amp;sumtotalDecorate=no"></iframe>
 -->
		</div>