<%--
  TwoColumnPage
  
  Renders a two column page ContentItem. A two column page consists of a header
  section with a left column and a main column. In this instance the header
  consists of a search box. The left column consists of a list of dimensions, 
  and the main column consists of search results.
--%>

	<dsp:page>
  		<dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  		<dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  		    <div class="shopInfo">
			<dsp:include page="../../botBar.jsp" flush="true"></dsp:include>
		    </div>
    		    <div class="header">
      			<c:forEach var="element" items="${content.headerContent}">
        			<dsp:renderContentItem contentItem="${element}"/>
      			</c:forEach>
   		    </div>
    		    <div class="sideBar">
			<div class="content">
      				<c:forEach var="element" items="${content.secondaryContent}">
        				<dsp:renderContentItem contentItem="${element}"/>
      				</c:forEach>
			</div>
    		    </div>
    		    <div class="mainContent">
      			<c:forEach var="element" items="${content.mainContent}">
        			<dsp:renderContentItem contentItem="${element}"/>
      			</c:forEach>
    		    </div>
  		    <div class="clear50"></div>
	</dsp:page>
	

