<%--
  RecordDetailsService
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/>   
  
  <div>
    <div class="header" style="position:absolute; width:100%">
      <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
      <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>
      
      <div style="position:absolute;left:35%">
        <h1 style="color:orange">
          <c:out value="Assembler Search Results Sample"/>
        </h1>
      </div>
  
      <div style="position:absolute; background-color:orange;width:100%;top:60px;">
        &nbsp;
      </div>
  
      <div class="mainSearch">
        <form action="${contextPath}/guidedsearch" method="GET" style="position:absolute; left:42.5%; top:80px;">
          <input type="hidden" name="Dy" value="1"/>
          <input type="hidden" name="Nty" value="1"/>
          <input id="searchText" type="text" name="Ntt"/>
    
          <span>
            <input type="submit" value="Search"/>
          </span>
        </form>
      </div>
  
      <div style="position:absolute; background-color:orange;width:100%;top:105px;">
        &nbsp;
      </div>
    </div>
    <div class="main" style="position:absolute;left:20%;width:100%;top:140px">
      <dsp:include page="/cartridges/ProductDetail/ProductDetail.jsp">
        <dsp:param name="contentItem" value="${content.recordDetails}"/>
      </dsp:include>
    </div>
  </div>
</dsp:page>