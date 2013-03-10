<%--
  ContentSlot
  
  Used when directly retriving a ContentSlot
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  
  <c:forEach var="element" items="${content.contents}">
    <dsp:renderContentItem contentItem="${element}"/>
  </c:forEach>
</dsp:page>