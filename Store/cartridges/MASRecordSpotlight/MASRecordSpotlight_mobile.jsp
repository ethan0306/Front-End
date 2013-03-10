<%--
  ResultsList
  
  Display a list of search results. The product name will be a clickable link 
  that will take the user to a simple product page.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
	
	
    	<c:choose>
      	<%-- No Results --%>
      		<c:when test="${empty content.records}">
        		<div class="zeroResults"></div>
        		<div class="zeroResultsAdvice"></div>
      		</c:when>
      
      		<%-- Results --%>
      		<c:otherwise>
			<div class="bannerWrapper" style="left: 0px;">
				<div class="wrapper" style="left: 0px;">
					<div class="glassDiv">
						<div class="dot"></div>
						<div class="dot"></div>
						<div class="dot selected"></div>
					</div>
					<img class="banner" src="css/images/banner.jpg"></img>
				</div>
				<div class="wrapper" style="left: 0px;">
					<div class="glassDiv">
						<div class="dot"></div>
						<div class="dot selected"></div>
						<div class="dot"></div>
					</div>
					<img class="banner" src="css/images/banner2.jpg"></img>
				</div>
				<div class="wrapper" style="left: 0px;">
					<div class="glassDiv">
						<div class="dot selected"></div>
						<div class="dot"></div>
						<div class="dot"></div>
					</div>
					<img class="banner" src="css/images/banner3.jpg"></img>
				</div>
			</div>
      		</c:otherwise>
    </c:choose>
</dsp:page>