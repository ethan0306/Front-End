<%--
  PageSlot_mobile.jsp
  
  Passes the contents of the PageSlot to a renderer JSP that knows how to
  handle the contents particular type.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" param="contentItem"/>
    <c:forEach var="element" items="${content.contents}">
    <dsp:renderContentItem contentItem="${element}"/>
  </c:forEach>
</dsp:page>