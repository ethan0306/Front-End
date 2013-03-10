<%@ include file="/includes/taglibs.jspf"%>
<%@ page import="atg.servlet.*"%>
<dsp:page>
<%-- c:out value="${sessionScope.selectedDeviceId}" / --%>
<dsp:droplet name="/atg/commerce/catalog/ProductLookup">
	<dsp:param name="id" value="${sessionScope.selectedDeviceId}" />
	<dsp:param name="itemDescriptor" value="device" />
	<dsp:param value="device" name="elementName"/>
	<dsp:oparam name="output">
		<dsp:getvalueof param="device.miniImage.url" var="imgUrl"/>
		<dsp:getvalueof param="device.displayName" var="deviceName"/>
		<img src="${imgUrl}" alt="${deviceName}" height="25px;"/>
		<c:set var="selectedDeviceImgURL" value="${imgUrl}" scope="session"/>
        <c:set var="selectedDeviceName" value="${deviceName}" scope="session"/>
	</dsp:oparam>
</dsp:droplet>
</dsp:page>

