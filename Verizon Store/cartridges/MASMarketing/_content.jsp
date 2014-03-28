<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  <div class="marketBanner">
  	<div class="bannerWrapper" style="left: 0px;">
		<c:forEach var="element" items="${content.content}">
   			<dsp:renderContentItem contentItem="${element}"/>
		</c:forEach> 
  	</div>
       <div class="glassDiv"></div> 
   </div>	
</dsp:page>