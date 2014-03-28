<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/>    

<!DOCTYPE html>
<html lang="en">
	<head>
		<dsp:include page="../../_header.jsp"></dsp:include>
	</head>
	<body>
		<div id="home"
		data-role="page"
		data-fullscreen="true"
		data-theme="c"
		data-title="Mobile Acessories Store">

		<div data-role="header"
			data-theme="c"
			data-id="vs_header">
			<div class="vzwLogo"><img src="css/images/vzwLogo.png"/></div>
			<a href="deviceList.jsp"
			data-icon="plus"
			data-theme="d"
			data-iconpos="notext"
			>Select a Device</a>
			<a class="searchIcon"
			data-icon="search"
			data-theme="d"
			data-iconpos="notext"
			>Search</a>
		</div><!-- header -->

		<div class="content" data-role="content">

			<!------------------- SearchBox Cartridge !------------------->
			<c:forEach var="element" items="${content.headerContent}">
        			<dsp:renderContentItem contentItem="${element}"/>
     			</c:forEach>

			<!------------------- MASCategories Cartridge !------------------->
    			<c:forEach var="element" items="${content.mainContent}">
        			<dsp:renderContentItem contentItem="${element}"/>
    			</c:forEach>
		</div>
		
	</div><!-- #home page -->
</body>
</html>

</dsp:page>
