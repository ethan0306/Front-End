<%--
  ResultsList
  
  Display a list of search results. The product name will be a clickable link 
  that will take the user to a simple product page.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 

    <c:choose>
      <%-- No Results --%>
      <c:when test="${empty content.records}">
        <div class="zeroResults">We're Sorry no results were found.</div>
        <div class="zeroResultsAdvice">Please try another search.</div>
      </c:when>
      
      <%-- Results --%>
      <c:otherwise>
         
       <%-- Render each result --%>    
       <div class="main_panels">
      <ul data-role="listview">
          <c:forEach var="record" items="${content.records}" varStatus="status">
        <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>
        <dsp:getvalueof var="recordAction" vartype="com.endeca.infront.cartridge.model.RecordAction" value="${record.detailsAction}"/> 
                <li>
         <c:choose>
                <c:when test="${not empty recordAction.contentPath}">
			<c:set var="urlFlag" value="?"/>
			<c:if test="${not empty recordAction.recordState}">
				<c:if test="${fn:indexOf(recordAction.recordState,'?') > 0}"> 
					<c:set var="urlFlag" value="&"/>
				</c:if>
			</c:if>
			<dsp:a href="${contextPath}/details${recordAction.contentPath}${recordAction.recordState}${urlFlag}id=${record.attributes['sku.repositoryId'][0]}">                        <img src="${record.attributes['sku.miniImage.url'][0]}" alt="No Image"/>      
                            <div class="infoWrapper"><h2>${record.attributes['accessory.displayName'][0]}</h2>
                            <div class="devicePrice">
                                <c:choose> 
                                    <c:when test="${not empty record.attributes['sku.salePrice'][0]}">
                                        <div class="CurrentPrice">
                                            <c:choose> 
                                                <c:when test="${record.attributes['sku.salePrice'][0] == 0.0}">FREE</c:when>
                                                <c:otherwise>
                                                        <fmt:formatNumber value="${record.attributes['sku.salePrice'][0]}" type="currency"/>
                                                </c:otherwise>
                                            </c:choose> 
                                        </div>
                                        <div class="oldPrice">
                                                <c:out value="was "/>
                                            <fmt:formatNumber value="${record.attributes['sku.listPrice'][0]}" type="currency"/>
                                        </div>
                                    </c:when>
                                    <c:otherwise>
                                        <div class="CurrentPrice">
                                                <fmt:formatNumber value="${record.attributes['sku.listPrice'][0]}" type="currency"/>
                                            </div>
                                    </c:otherwise>
                                </c:choose> 
                            </div>
				<div class="starRating">
					<div class="rate_<fmt:formatNumber value="${record.attributes['sku.rating'][0]}" />"></div>
				  </div>
				</div>
                    </dsp:a>
                </c:when>
                <c:otherwise>
                    <dsp:a href="${contextPath}/details?id=${record.attributes['sku.repositoryId'][0]}">
                        <img src="${record.attributes['sku.miniImage.url'][0]}" alt="No Image"/>      
                           <div class="infoWrapper"> <h2>${record.attributes['accessory.displayName'][0]}</h2>
                            <div class="devicePrice">
                                <c:choose> 
                                    <c:when test="${not empty record.attributes['sku.salePrice'][0]}">
                                        <div class="CurrentPrice">
                                            <c:choose> 
                                                <c:when test="${record.attributes['sku.salePrice'][0] == 0.0}">FREE</c:when>
                                                <c:otherwise>
                                                        <fmt:formatNumber value="${record.attributes['sku.salePrice'][0]}" type="currency"/>
                                                </c:otherwise>
                                            </c:choose> 
                                        </div>
                                        <div class="oldPrice">
                                                <c:out value="was "/>
                                            <fmt:formatNumber value="${record.attributes['sku.listPrice'][0]}" type="currency"/>
                                        </div>
                                    </c:when>
                                    <c:otherwise>
                                        <div class="CurrentPrice">
                                                <fmt:formatNumber value="${record.attributes['sku.listPrice'][0]}" type="currency"/>
                                            </div>
                                    </c:otherwise>
                                </c:choose> 
                            </div>
				<div class="starRating">
					<div class="rate_<fmt:formatNumber value="${record.attributes['sku.rating'][0]}" />"></div>
				  </div>

			</div>
                    </dsp:a>
                </c:otherwise>
        </c:choose>
            </li>
          </c:forEach>
      </ul>
        </div>
      </c:otherwise>
    </c:choose>
</dsp:page>