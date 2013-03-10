<%--
  GuidedNavigation
  
  If there are dimension refinements pass them on to a JSP that knows how to 
  render them. 
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 

  <c:set var="emptyList" value="true"/>
  <c:forEach var="element" items="${content.navigation}">
    <c:if test="${not empty element.refinements}">
      <c:set var="emptyList" value="false"></c:set>
    </c:if>
  </c:forEach>

  <c:if test="${(not empty content.navigation) && !emptyList}">
    <c:forEach var="element" items="${content.navigation}">
      <dsp:renderContentItem contentItem="${element}"/>
    </c:forEach>
  </c:if>
</dsp:page>