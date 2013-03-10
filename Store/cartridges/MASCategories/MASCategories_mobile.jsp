
<dsp:page>

  <dsp:importbean bean="/atg/dynamo/droplet/TableForEach"/>
  <dsp:droplet name="TableForEach">

  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  <dsp:param name="numColumns" value="3"/>

  	<c:set var="emptyList" value="true"/>

	<c:forEach var="element" items="${content.navigation}">
    		<c:if test="${not empty element.refinements}">
      			<c:set var="emptyList" value="false"></c:set>
    		</c:if>
  	</c:forEach>

	<c:if test="${(not empty content.navigation) && !emptyList}">
      		<c:forEach var="element" items="${content.navigation}" varStatus="rowCounter">
          		<dsp:renderContentItem contentItem="${element}"/>
      		</c:forEach>
	</c:if>
  	

  </dsp:droplet>

</dsp:page>