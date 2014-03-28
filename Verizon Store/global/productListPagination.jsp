<%--  
  Render page links.
--%>
<dsp:page>
  <dsp:importbean bean="/atg/store/droplet/ArraySubsetHelper"/>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
    
  <dsp:getvalueof var="contentItem" vartype="com.endeca.infront.assembler.ContentItem" param="contentItem"/>
  <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>

  <c:set var="totalNumRecs" value="${contentItem.totalNumRecs}" />
  <c:set var="recsPerPage" value="${contentItem.recsPerPage}"/>
  <c:set var="startRec" value="${contentItem.firstRecNum}"/>
  
  <c:if test="${totalNumRecs > recsPerPage}">
    <div class="atg_store_pagination">
      <ul style="list-style:none;">
        
        <%-- Determine the total number of pages --%>
        <c:choose>
          <c:when test="${totalNumRecs % recsPerPage == 0}">
            <c:set var="totalNumPages" value="${totalNumRecs/recsPerPage}"/>
          </c:when>
          <c:otherwise>
            <c:set var="totalNumPages" value="${(totalNumRecs/recsPerPage) + 1}"/>
          </c:otherwise>
        </c:choose>
        
        <%-- Determine the current page number --%>
        <c:set var="currentPageNum" value="${(contentItem.firstRecNum/contentItem.recsPerPage) + 1}"/>
        
        <%-- Display the pagination links --%>
        <c:forEach var="i" begin="1" end="${totalNumPages}" step="1" varStatus ="status">
       
          <li style="display:inline; margin-right: 5px">
            <dsp:getvalueof id="startValue" value="${(i - 1) * recsPerPage}"/> 
          
            <%-- RENDER PAGE LINKS --%>
            <c:set var="pageLink" value="${fn:replace(contentItem.pagingActionTemplate.navigationState, '%7Boffset%7D', startValue)}"/>
            <c:set var="pageLink" value="${fn:replace(pageLink, '%7BrecordsPerPage%7D', recsPerPage)}"/>
            <a href="${contextPath}${contentItem.pagingActionTemplate.contentPath}${pageLink}">
              <c:out value="${i}"/>
            </a>
          </li>
        </c:forEach>
      </ul>
    </div>
  </c:if>
</dsp:page>

