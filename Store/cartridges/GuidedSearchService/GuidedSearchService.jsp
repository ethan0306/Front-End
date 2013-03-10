<%--
  GuidedSearchService
  
  Renders the GuidedSearchService page
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  
  <div>
    <div class="header" style="position:absolute; width:100%">
      <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
      <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>
      
      <div>
          <c:out value="Assembler Search Results Sample"/>
      </div>
  
      <div class="mainSearch">
        <form action="${contextPath}/guidedsearch" method="GET">
          <input type="hidden" name="Dy" value="1"/>
          <input type="hidden" name="Nty" value="1"/>
          <input id="searchText" type="text" name="Ntt"/>
    
          <span>
            <input type="submit" value="Search"/>
          </span>
        </form>
      </div>
    </div>
    
    <div class="filter_panels" style="position:absolute; width:100%;top:140px">
      <dsp:include page="/cartridges/Breadcrumbs/Breadcrumbs.jsp">
        <dsp:param name="contentItem" value="${content.breadcrumbs}"/>
      </dsp:include>
      <dsp:include page="/cartridges/GuidedNavigation/GuidedNavigation.jsp">
        <dsp:param name="contentItem" value="${content.navigation}"/>
      </dsp:include>
    </div>
    
    <div class="marquee_panels" style="position:absolute;left:20%;width:100%;top:140px">
      <dsp:include page="/cartridges/ResultsList/ResultsList.jsp">
        <dsp:param name="contentItem" value="${content.resultsList}"/>
      </dsp:include>
    </div>
    
  </div>
</dsp:page>