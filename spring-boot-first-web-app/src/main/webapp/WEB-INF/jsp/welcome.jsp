<html>
<head>
<title>Welcomepage</title>
</head>
<body>

<%
String username =request.getParameter("username");
String pass =request.getParameter("password");
%>

<h1> Welcome <%=username %>. <a href='/list-todos'>Click Here</a> For Your Todos List </h1>
</body>


</html>