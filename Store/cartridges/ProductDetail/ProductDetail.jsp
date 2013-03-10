<%--
  ProductDetail
  
  Example product detail page. Currently only renders the record attributes.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  
  <div class="RecordDetails">
    <c:forEach var="attribute" items="${content.record.attributes }">
      <c:out value="${attribute}"/> <br/>
    </c:forEach>
  </div>

</dsp:page>