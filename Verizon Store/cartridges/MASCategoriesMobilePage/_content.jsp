<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/>    
  <dsp:getvalueof param="deviceId" var="deviceId"/>

  <c:set var="selectedDeviceId" value="${deviceId}" scope="session"/>
<!DOCTYPE html>
<html lang="en">
    <head>
		<c:forEach var="element" items="${content.mainContent}">
			<c:forEach var="obj" items="${element.navigation}">
				<c:forEach var="inner" items="${obj.refinements}">
					<c:set var="title" scope="request" value="${title}${inner.label}"/>  
				</c:forEach>  
			</c:forEach>  
		</c:forEach>
		<dsp:include page="../../_header.jsp">
			<dsp:param name="title" value="${title}"/>
		</dsp:include>
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
            <div class="vzwLogo"><img src="/mas/css/images/vzwLogo.png"/></div>
            
            <a class="searchIcon ui-btn-right"
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
        
        <div class="clearFooter"></div>
        
        <div class="homeFooter"
	     data-role="footer"
            data-position="fixed"
            data-theme="d"
            data-id="vs_footer">
            <div data-role="navbar">
                <ul>
                    <li><a href="/mas/selectedDevice.jsp" class="selectDevice"
                    data-role="button"
		      data-rel="dialog"
                    data-icon="false">
				        <div class="deviceImageDiv"><dsp:include page="../../deviceDetails.jsp"></dsp:include></div>
                		<span>Device</span>
            		</a></li>
                    <li><a href="/mas/orderTrack.jsp?userId=100023"
                    data-role="button"
                    data-icon="info"
                    >Track</a></li>
                   <dsp:include page="../../_footerCartLink.jsp"></dsp:include>
                </ul>
            </div><!-- navbar -->
        </div><!-- footer --> 
    </div><!-- #home page -->
    


    <!-- not used for now -->
    <%-- div id="selectedDevice" data-role="dialog">
          <div data-role="header"
            data-theme="c"
            data-id="vs_header">
            <h1>Selected Device</h1>
           </div>
           
        <div class="popupMenu" data-role="content"> 
            <p>You are shopping for device ${selectedDeviceName}</p>
            <img class="prodMarquee" src="${selectedDeviceImgURL}" alt="${selectedDeviceName}" height="60px;"/>
    
            <a href="/mas/deviceChange.jsp" data-role="button">Change Device</a>
            <a data-rel="back" data-theme="d" data-role="button">Cancel</a>
        </div>              
    </div --%>
    
    <!-- #selectedDevice -->
    
    
    
    
</body>
</html>

</dsp:page>
