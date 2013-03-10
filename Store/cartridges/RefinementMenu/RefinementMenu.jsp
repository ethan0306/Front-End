<%--
   Categories List
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  
    <div class="filterType">
	<c:forEach var="refinement" items="${content.refinements}">
		<dsp:include page="/global/renderNavLink.jsp">
          		<dsp:param name="navAction" value="${refinement}"/>
			<dsp:param name="navLabel" value="${refinement.label}"/>
			<dsp:param name="navCount" value="${refinement.count}"/>
			<dsp:param name="navId" value="${refinement.properties['category.repositoryId']}" />
		</dsp:include>
      	</c:forEach>
	
         
      	<%-- More Link --%>
      	<c:if test="${!empty(content.moreLink.navigationState)}">
        	<dsp:include page="/global/renderNavLink.jsp">
          		<dsp:param name="navAction" value="${content.moreLink}"/>
          		<dsp:param name="navLabel" value="${content.moreLink.label}"/>
        	</dsp:include>
      	</c:if>
        
      	<%-- Less Link --%>
      	<c:if test="${!empty(content.lessLink.navigationState)}">
        	<dsp:include page="/global/renderNavLink.jsp">
          		<dsp:param name="navAction" value="${content.lessLink}"/>
          		<dsp:param name="navLabel" value="${content.lessLink.label}"/>
       	 </dsp:include>
      	</c:if>
    </div>


</dsp:page>