<%--
  SearchBox
  Renders a search box which allows the user to query for search results.
--%>
<dsp:page>
  <dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
  
  <dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
  <dsp:getvalueof var="contextPath" vartype="java.lang.String" value="${originatingRequest.contextPath}"/>

  <div class="search">
    	<form action="${contextPath}/browse" method="GET">
      		<input type="hidden" name="Dy" value="1"/>
      		<input type="hidden" name="Nty" value="1"/>
      		<input type="search" id="searchText" type="text" name="Ntt"/>
        	<a class="cancelSearch" data-role="button" data-mini="true">Cancel</a>
    	</form>
  </div>

<c:if test="${content.contentCollection != ''}">
    <script language="javascript">
			var endeca_autosuggest_value={
                                 minAutoSuggestInputLength: <c:out value="${content.minAutoSuggestInputLength}"/>,
                                 autoSuggestServiceUrl: '<c:url value="/autosuggest.json/overview"/>',
                                 collection: "${content.contentCollection}",
                                 searchUrl: '${request.contextRoot}',
                                 containerClass:'dimSearchSuggContainer',
                                 defaultImage:'<c:url value="/images/no_image_auto_suggest.gif"/>'
                    };
    </script>
</c:if> 

</dsp:page>