<html>

<head>
<title>Login</title>
</head>
<body>
<form method='Post' action="/login">
	<table>
	<tr>
	<td>UserName :</td>
	<td><input type='text' name='username'/></td>
	</tr>
	<tr>
	<td>password :</td>
	<td><input type='password' name='password'/></td>
	</tr>
	<tr>
	<td colspan=2 align='center'><input type='submit'></td>
	</tr>
	<tr>
	<td colspan=2 align='center'>
	<font color='red'> ${errorMessage}</font>
	</td>
	</tr>
	</table>

</form>
</body>
</html>