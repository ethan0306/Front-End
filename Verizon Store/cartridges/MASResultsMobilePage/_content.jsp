<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/>    

<!DOCTYPE html>
<html lang="en">
    <head>
        <dsp:include page="../../_header.jsp"></dsp:include>
    </head>
    <body>

<div id="accessList"
    data-role="page"
    data-fullscreen="true"
    data-theme="c"
    data-title="Mobile Acessories Store">
    <div data-role="header"
        data-theme="c"
        data-id="vs_header">
        <div class="vzwLogo"><img src="/mas/css/images/vzwLogo.png"/></div>
        <a class="switchView"
            data-icon="grid"
            data-theme="d"
            data-iconpos="notext"
            >Grid View</a>
        <a href="#filterPanel"
            class='filterIcon'
            data-role="button"
            data-theme="d"
            data-rel="popup" 
            data-transition="slide"
            data-role="button"
            data-position-to="window"
            >Sort</a>
            
    </div><!-- header -->

        <div class="content listView" data-role="content">

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

    <div data-role="popup" id="filterPanel" data-corners="false" data-theme="none" data-shadow="false" data-tolerance="0,0">
        <!-- div class="filterItem">Most Popular</div -->     	
        <div class="filterItem"><a href='/mas/browse?Ns=sku.listPrice|0&N=${param.N}&Ntk=${param.Ntk}&Ntt=${param.Ntt}&deviceId=${param.deviceId}'>Price: Low to High</a></div>    
        <div class="filterItem"><a href="/mas/browse?Ns=sku.listPrice|1&N=${param.N}&Ntk=${param.Ntk}&Ntt=${param.Ntt}&deviceId=${param.deviceId}">Price: High to Low</a></div>    
        <div class="filterItem"><a href="/mas/browse?Ns=accessory.creationDate|1&N=${param.N}&Ntk=${param.Ntk}&Ntt=${param.Ntt}&deviceId=${param.deviceId}">Latest Item</a></div>   
	 <div class="filterItem"><a href="/mas/browse?Ns=sku.rating|1&N=${param.N}&Ntk=${param.Ntk}&Ntt=${param.Ntt}&deviceId=${param.deviceId}">Rating: High to Low</a></div>
    </div> 

    <div data-role="footer"
        data-position="fixed"
        data-theme="d"
        data-id="vs_footer">
        <div data-role="navbar">
            <ul>
                <!-- li><a href="#" data-rel="back" data-icon="back"
                >Back</a></li -->
                <li><a href="/mas/categories?deviceId=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&Ntt=${sessionScope.selectedDeviceId}"
                data-role="button"
                data-icon="home"
                >Home</a></li>
                <li><a href="/mas/orderTrack.jsp?userId=100023"
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
