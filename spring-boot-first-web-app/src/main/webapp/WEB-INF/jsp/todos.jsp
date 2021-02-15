<%@page import="com.in28minutes.springboot.web.model.Todo"%>
<html>
<head>
<title>TodosPage</title>
</head>
<body>

<h1> Here Are your todos: </h1>
<p>
<%
Todo[] obj  = (Todo[])request.getAttribute("todos");

%>
</p>
</body>


</html>