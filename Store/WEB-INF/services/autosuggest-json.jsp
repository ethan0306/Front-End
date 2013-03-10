<%@page language="java" contentType="text/html; charset=UTF-8" %>
<dsp:importbean bean="/atg/endeca/assembler/droplet/InvokeAssembler"/>
<dsp:droplet name="InvokeAssembler">
	<dsp:param name="contentCollection" value="${param.collection}"/>
	<dsp:param name="ruleLimit" value="2"/>
	<dsp:oparam name="output">
	  <dsp:getvalueof var="contentItem" vartype="com.endeca.infront.assembler.ContentItem" param="contentItem" />
	  <dsp:renderContentItem contentItem="${contentItem}" format="json"/>
	</dsp:oparam>
</dsp:droplet>