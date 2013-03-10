<%@page language="java" pageEncoding="UTF-8" contentType="text/html;charset=UTF-8"%>

<dsp:page>
<dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
<dsp:getvalueof var="content" vartype="com.endeca.infront.assembler.ContentItem" value="${originatingRequest.contentItem}"/> 
	<dsp:include page="${content.includePath}" flush="true">
		<dsp:param param="id" name="id" />
	</dsp:include>
</dsp:page>

</html>