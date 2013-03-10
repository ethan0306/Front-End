<%--
  ResultsList
  
  Display a list of search results. The product name will be a clickable link 
  that will take the user to a simple product page.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
	
	
   <c:if test="${not empty content.seeAllLink}">
    <div class="clearAllLink">
      <dsp:include page="/global/renderNavLink.jsp">
        <dsp:param name="navAction" value="${content.seeAllLink}"/>
        <dsp:param name="text" value="See All"/>
      </dsp:include>
    </div>
  </c:if>
	
  <div class="resultsListContainer">
    <c:choose>
      <%-- No Results --%>
      <c:when test="${empty content.records}">
        <div class="zeroResults">We're Sorry no results were found.</div>
        <div class="zeroResultsAdvice">Please try another search.</div>
      </c:when>
      
      <%-- Results --%>
      <c:otherwise>
        <%-- Pagination 
        <div class="pagination">
          <c:if test="${content.totalNumRecs / content.recsPerPage > 1}">
            <div>
              <dsp:include page="/global/productListPagination.jsp">
                <dsp:param name="contentItem" value="${content}"/>
              </dsp:include>
            </div>
          </c:if>
          <c:if test="${content.totalNumRecs == 1}">
            <div class="count">1 item</div>
          </c:if>
          <c:if test="${content.totalNumRecs > 1}">
            <div class="count">Showing ${content.firstRecNum} - ${content.lastRecNum} of ${content.totalNumRecs} items</div>
          </c:if>
        </div> --%>
                
        <%-- Render each result --%>    
        <div class="resultList">
          <c:forEach var="record" items="${content.records}" varStatus="status">
            <div class="Record">
              <br/>
              <div class="basicProductInfo">
                <%-- Product display name --%>
                <dsp:include page="/global/renderActionLink.jsp">
                  <dsp:param name="recordAction" value="${record.detailsAction}"/>
                  <dsp:param name="text" value="${record.attributes['product.displayName'][0]}"/>
                </dsp:include>
                                  
                <%-- 
                  Price. 
                  Real simple for now we should check all the skus prices!
                --%>
                <c:choose> 
                  <c:when test="${not empty record.attributes['sku.price_salePrices'][0]}">
                    <fmt:formatNumber value="${record.attributes['sku.price_salePrices'][0]}" type="currency"/>
                    <c:out value="was"/>
                    <fmt:formatNumber value="${record.attributes['sku.price_listPrices'][0]}" type="currency"/>
                  </c:when>
                  <c:otherwise>
                    <fmt:formatNumber value="${record.attributes['sku.price_listPrices'][0]}" type="currency"/>
                  </c:otherwise>
                </c:choose>        
              </div>
                
              <%-- Product Description --%>
              <div style="background-color:orange;">
	            <c:out value="${record.attributes['product.longDescription'][0]}"/>
	          </div>
            </div>
          </c:forEach>
        </div>
      </c:otherwise>
    </c:choose>
  </div>
</dsp:page>