<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>Enter User Details</title>
</head>
<body>
<form action="/reports">

<table>
<tr><td>JapserServerUrl:</td><td><input type="Text" name="url" value="http://localhost:9797/jasperserver-pro/flow.html" size="50"/></tr>
<tr><td>PassPhrase:</td><td><input type="Text" name="key" value="Provide your own pass phrase" size="50"/></tr>
<tr><td>UserName:</td><td><input type="Text" name="username"/></tr>
<tr><td>Organization:</td><td><input type="Text" name="org" value="Expense"/></tr>
<tr><td colspan="2"><input type="submit" value="getReport"></td></tr>
</table>

</form>

</body>
</html>