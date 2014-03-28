<%--
  Media Banner - displaying media.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
<c:if test="${not empty content.link}">
    <c:url value="${content.link.path}" var="hrefUrl"></c:url>
    <c:url value="${content.link.queryString}" var="queryString"></c:url>
    <c:if test="${not empty content.link.queryString}">
      <c:url value="${hrefUrl}?${content.link.queryString}" var="hrefUrl"></c:url>
    </c:if>
</c:if>


<c:url value="${content.media['uri']}" var="mediaSrc"></c:url>
<c:url value="${content.media['uri']}" var="videoSrc"></c:url>
<c:url value="${content.media['contentHeight']}" var="mediaHeight"></c:url>
<c:url value="${content.media['contentWidth']}" var="mediaWidth"></c:url>
<c:url value="${content.media['contentType']}" var="contentType"></c:url>
<c:url value="${content.imageAlt}" var="imageAlt"></c:url>

<c:set value="<%=java.lang.System.nanoTime()%>" var="randomNumber"></c:set>	
	
<c:if test="${not empty mediaSrc}">
        <div class="wrapper" style="left: 0px;">
        	<c:if test="${not empty hrefUrl}">
            		<a href="<c:out value='${hrefUrl}'/>">
        	</c:if>
        	<c:choose>
            		<c:when test="${contentType eq 'Video'}">
                		<div id="theSwffer${randomNumber}"></div>
            		</c:when>
            		<c:otherwise>
                		<img class="banner" src="<c:out value='/mas/${mediaSrc}' />" alt="<c:out value='${imageAlt}' />" />
            		</c:otherwise>
        	</c:choose>
        	<c:if test="${not empty hrefUrl}">
            		</a>
        	</c:if>
    	  </div>
</c:if>    	
</dsp:page>