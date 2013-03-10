<%--
  Renders menu search navigation links. --- leftNav --- navAction is an endeca NavigationAction.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>
  <dsp:getvalueof var="navAction" vartype="com.endeca.infront.cartridge.model.NavigationAction" param="navAction"/> 
  <dsp:getvalueof var="labelText" param="navLabel"/> 
  <dsp:getvalueof var="countText" param="navCount"/> 
  <dsp:getvalueof var="categoryId" param="navId"/> 
  <c:choose>
    <c:when test="${not empty navAction.contentPath}">
      <dsp:a class="ui-block-a category" href="${contextPath}${navAction.contentPath}${navAction.navigationState}">
		<div class="imgWrapper">
			<c:if test="${not empty categoryId}">
			<dsp:include page="/categoryImage.jsp"><dsp:param name="itemId" value="${categoryId}"/></dsp:include>
			</c:if>
			<div class="name"><dsp:valueof value="${labelText}" valueishtml="true"/></div>
		</div>
      </dsp:a>
    </c:when>
    <c:otherwise>
      <dsp:a href="${contextPath}${navAction.navigationState}">
        <span class="label"><c:out value="${labelText}"/></span>
	 <span class="count">(<c:out value="${countText}"/>)</span>
      </dsp:a>
    </c:otherwise>
  </c:choose>
</dsp:page>