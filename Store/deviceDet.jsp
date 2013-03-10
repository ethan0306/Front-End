
<%@page import="java.util.Enumeration"%>

<%


	

	Enumeration<String> enumerator = request.getHeaderNames();
	String userAgentHeaderName = "User-Agent";
	String userAgentHeaderValue = null;

	for (; enumerator.hasMoreElements(); ) {

	String name = enumerator.nextElement();
	String value = request.getHeader(name);

	

	if (userAgentHeaderName.equals(name)) {
	userAgentHeaderValue = value.toLowerCase();
	if(userAgentHeaderValue.length() > 200){
	userAgentHeaderValue = userAgentHeaderValue.substring(0, 201);
	}
	break;
	}

	}

	
%>

<%=userAgentHeaderValue%>