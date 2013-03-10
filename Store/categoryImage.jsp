<%@ include file="/includes/taglibs.jspf"%>
<%@ page import="atg.servlet.*"%>
<dsp:droplet name="/atg/commerce/catalog/CategoryLookup">
	<dsp:param param="itemId" name="id" />
	<dsp:param value="category" name="elementName"/>
	<dsp:oparam name="output">
		<dsp:getvalueof param="category.thumbnailImage.url" var="imgUrl"/>
		<img src="/mas${imgUrl}"/>
	</dsp:oparam>
</dsp:droplet>


