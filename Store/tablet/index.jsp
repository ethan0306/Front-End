<!DOCTYPE html>

<html lang="en">
<head>
<%@include file="_header.jsp" %>
</head>

<div id="accessList" data-role="page">
	<div data-role="panel" id="categoryList" data-theme="a">
		<ul data-role="listview" data-theme="a">
			 <li data-icon="delete"><a href="#home_header" data-rel="close">Close</a></li>
			 <li><a>Cables and Adapters</a></li>
			 <li><a>Cases, Cover and Holsters</a></li>
			 <li><a>Chargers and Docks</a></li>
		        <li><a>Display Protection</a></li>
			 <li><a>Memory Cards and Readers</a></li>
			 <li><a>Mounts</a></li>
			 <li><a>Network Extender</a></li>
			 <li><a>Other</a></li>
			 <li><a>Sale</a></li>
		</ul>
	</div>

	
	<div data-role="header"
		data-theme="a"
		data-id="home_header">
		<div class="navTop"><%@include file="_marketBanner.jsp" %></div>
		<a data-role="button" 
		   data-icon="bars" 
		   href="#categoryList" 
		   data-iconpos="notext"
		   data-rel="panel">Open</a>
		<h1>Mobile Acessories Store</h1>
	</div>
	
	<div class="content" data-role="content">
		<div class="main_panels">
			<%@include file="_accessoryList.jsp" %>
		</div>
	</div>

</div>

