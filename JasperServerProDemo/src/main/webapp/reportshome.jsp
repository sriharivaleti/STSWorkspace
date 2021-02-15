<html>
<head>
<title>Sample JasperView</title>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
<script>

function getReportName(){
	var value = document.getElementById("reportName").value;
	document.getElementById("reportUnit").value = value;
	
}


function prepareFrame() {
    var ifrm = document.getElementById("frame");
    ifrm.style.display="block";
}

</script>
</head>
<body id="body" leftmargin="20" topmargin="0"
	rightmargin="20" bottommargin="0" marginwidth="0" marginheight="0">
	<div>
	<form action="http://localhost:9797/jasperserver-pro/flow.html" target="my-iframe">

		<table class="table">
			<tr>
				<td>ReportName:</td>
				<td><select id="reportName" onchange="getReportName()">
						<option value="/Reports/ActiveUser">ActiveUser</option>
						<option value="/Reports/TopSpenders_755">TopSpenders_755</option>
						<option value="/Reports/Connector_Logs_by_Batch_755/Connector_Logs_by_Batch_755">Connector_Logs_by_Batch_755</option>
						<option value="/Reports/CorporateCardListbyEmployee_755/CorporateCardListbyEmployee_755">CorporateCardListbyEmployee_755</option>
						<option value="/Reports/Submitted_Reports_by_Org_755/Submitted_Reports_by_Org_755">Submitted_Reports_by_Org_755</option>
						<option value="/Reports/User_Detail_List_755/User_Detail_List_755">User_Detail_List_755</option>
						<option value="/Reports/ApprovedExpenseReport/ApprovedExpenseReport">ApprovedExpenseReport</option>
				</select></td>
			</tr>
			<tr style="display:none">
				<td>PP:</td>
				<td><input type='text' name='pp'
					value=${pp}>
				</td>
			</tr>
			<tr style="display:none">
				<td>screenPrefNsNames :</td>
				<td><input type="text" name='screenPrefNsNames'
					value='screenPrefs'></td>

			</tr>
			<tr style="display:none">
				<td>userLocale:</td>
				<td><input type='text' name='userLocale' value='en_US'>
				</td>
			</tr>
			<tr style="display:none">
				<td>showTerminatedEmployees:</td>
				<td><input type='text' name='showTerminatedEmployees'
					value='false'></td>
			</tr>
			<tr style="display:none">
				<td>durFormat:</td>
				<td><input type='text' name='durFormat'
					value='duration_format_HM'></td>
			</tr>

			<tr style="display:none">
				<td>_flowId:</td>
				<td><input type='text' name='_flowId' value='viewReportFlow'>
				</td>
			</tr>

			<tr>
				<td>reportUnit:</td>
				<td><input type='text' name='reportUnit' id='reportUnit'
					value='/Reports/ActiveUser'></td>
			</tr>

			<tr style="display:none">
				<td>who:</td>
				<td><input type='text' name='who' value='EG#AP'></td>
			</tr>

		<!-- 	<tr>
				<td>whenFrom:</td>
				<td><input type='text' name='whenFrom' value='2020-12-20'>
				</td>
			</tr>

			<tr>
				<td>whenTo:</td>
				<td><input type=text name='whenTo' value='2020-12-26'>
				</td>
			</tr> -->

			<tr style="display:none">
				<td>sumtotalDecorate:</td>
				<td><input type='text' name='sumtotalDecorate' value='no'>
				</td>
			</tr>

			<tr>
				<td colspan=2><input type="Submit" value="Submit" onclick="prepareFrame()" class="btn btn-primary"></td>
			</tr>

		</table>
	</form>
	</div>
		
	<div width="100%" height="100%" style="display:none" id="frame">
	 <iframe name="my-iframe" width="100%" height="100%"></iframe>
	 </div>
	
</body>
</html>