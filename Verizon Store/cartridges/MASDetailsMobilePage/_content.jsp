<%@ include file="/includes/taglibs.jspf"%>
<%@ page import="atg.servlet.*"%>
<dsp:page>
<dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
<dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/>    
  
<!DOCTYPE html>
<html lang="en">
    <head>
	  <dsp:droplet name="/atg/commerce/catalog/SKULookup">
		  <dsp:param param="id" name="id" />
		  <dsp:oparam name="output">
		  	<dsp:getvalueof param="element.displayName" var="title" vartype="java.lang.String" />
		  </dsp:oparam>
	  </dsp:droplet>
	  	
      <dsp:include page="../../_header.jsp">
		<dsp:param name="title" value="${title}"/>
	  </dsp:include>
    </head>
    <body>

<div id="accessDetail"
    data-role="page"
	data-dom-cache="true"
    data-fullscreen="true"
    data-theme="c"
    data-title="Mobile Acessories Store">
    <div data-role="header"
        data-theme="c"
        data-id="vs_header">
        <div class="vzwLogo"><img src="/mas/css/images/vzwLogo.png"/></div>
             <a href="#" 
                  data-rel="back" 
                  data-icon="back"
                  data-theme="d"
                >Back</a>
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
            <div class="clearFooter"></div>
        </div>

    <div data-role="footer"
        data-position="fixed"
        data-theme="d"
        data-id="vs_footer">
        <div data-role="navbar">
            <ul>
		  <li><a href="/mas/categories?deviceId=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&Ntt=${sessionScope.selectedDeviceId}"
                data-role="button"
                data-icon="home"
                >Home</a></li>
                <li><a href="orderTrack.jsp?userId=100023"
                data-role="button"
                data-icon="info"
                >Track</a></li>
                <dsp:include page="../../_footerCartLink.jsp"></dsp:include>
            </ul>
        </div><!-- navbar -->
    </div><!-- footer -->

        
    </div><!-- #home page -->
</body>
</html>

</dsp:page>
