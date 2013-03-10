<%--
  Renders action links. recordAction is an endeca RecordAction.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>
  <dsp:getvalueof var="recordAction" vartype="com.endeca.infront.cartridge.model.RecordAction" param="recordAction"/> 
  <dsp:getvalueof var="linkText" param="text"/> 

  <c:choose>
    <c:when test="${not empty recordAction.contentPath}">
      <dsp:a href="${contextPath}${recordAction.contentPath}${recordAction.recordState}">
        <c:out value="${linkText}"/> <br/>
      </dsp:a>
    </c:when>
    <c:otherwise>
      <dsp:a href="${contextPath}${recordAction.recordState}">
        <c:out value="${linkText}"/> <br/>
      </dsp:a>
    </c:otherwise>
  </c:choose>
</dsp:page>