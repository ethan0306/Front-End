<%--
  Breadcrumbs
  
  Renders refinement that have been selected. Selected refinements can consist
  of search refinements, dimension refinements or range filter refinements.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  <div class="filterType">
  	<%-- Clear All Link --%>
  	<c:if test="${not empty content.searchCrumbs || not empty content.refinementCrumbs }">
		<h3>Shop Category</h3>
    		<div class="clearAll">
      			<dsp:include page="/global/renderNavLink.jsp">
        			<dsp:param name="navAction" value="${content.removeAllAction}"/>
				<dsp:param name="navLabel" value="Clear All"/>
      			</dsp:include>
    		</div>
  	</c:if>

   	<c:if test="${not empty content.refinementCrumbs}">  
    		<c:forEach var="dimCrumb" items="${content.refinementCrumbs}">
	                    <li class="checked">
	     
                    			<c:forEach var="ancestor" items="${dimCrumb.ancestors}">
                                		<dsp:include page="/global/renderNavLink.jsp">
                                			<dsp:param name="navAction" value="${ancestor}"/>
                                			<dsp:param name="label" value="${ancestor.label}"/>
                         			</dsp:include>
                   			</c:forEach>
                   
            				<%-- Dimension refinement value e.g "Red" --%>
            				<dsp:include page="/global/renderNavLink.jsp">
              				<dsp:param name="navAction" value="${dimCrumb.removeAction}"/>
              				<dsp:param name="navLabel" value="${dimCrumb.label}"/>
            				</dsp:include>
	        		</li>
	       </c:forEach>
		<div class="clear20"></div>
	 </c:if>
  
  	<%-- Display searched terms if there are any --%>
  	<c:if test="${not empty content.searchCrumbs}">
    		<div class="typeValue clear">
      			<span class="dimensionName">
				<c:out value="Searched Text"/>:
			</span>	
      			<c:forEach var="searchCrumb" items="${content.searchCrumbs}">
	    			<span class="label">
		  			<c:out value="${searchCrumb.terms}" escapeXml="true"/>
	    			</span>
				<%-- Spell corrected text --%>
				<c:if test="${searchCrumb.correctedTerms != null}">
					<span class="dimensionName">Corrected to:</span>
					<span class="label">
		      				<c:out value="${searchCrumb.correctedTerms}"/>
					</span>
				</c:if>
      			</c:forEach>
    		</div>
		<div class="clear20"></div>
  	</c:if>
	
  </div>
  <%-- Display currently selected refinements if there are any --%>
  
</dsp:page>