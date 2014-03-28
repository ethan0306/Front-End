<!DOCTYPE html>
<%@ include file="/includes/taglibs.jspf"%>
<%@ page import="atg.servlet.*"%>
<dsp:importbean bean="/mas/commerce/order/MASOrderTrackingFormHandler" />
<dsp:importbean bean="/atg/dynamo/droplet/ErrorMessageForEach" />
<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty" />
<html lang="en">
<head>
	<%@include file="_header.jsp" %>
</head>
<body>

<div id="trackOrder"
	data-role="page"
	data-theme="c"
	data-title="Order Tracking">

	<div data-role="header"
		data-theme="c"
		data-id="vs_header">
		<h1>Order Tracking</h1>
		 <a  class="historyBack"
		     data-icon="back"
			 data-theme="d"
			 data-iconpos="notext" 
		>Back</a>
	</div><!-- header -->

	<div class="content" data-role="content">
		<!-- <select class="prodQty" name="prodQty" data-native-menu="false">
			<option value="one">Order: 012289</option>
			<option value="two">Order: 012489</option>
			<option value="three">Order: 013289</option>
			<option value="four">Order: 015289</option>
		</select> -->
		<dsp:form id='test' action="" method="post" name="testForm">
		<dsp:droplet name="ErrorMessageForEach">
						<dsp:param bean="MASOrderTrackingFormHandler.formExceptions" name="exceptions" />
						<dsp:oparam name="output">
							<li><dsp:valueof param="message" /></li>
						</dsp:oparam>
					</dsp:droplet>
		<span class="trackInput">Order Number:</span><a href="#helpPanel1" data-rel="popup" ><span class="help">How to find?</span></a><dsp:input type="text"    bean="MASOrderTrackingFormHandler.orderNumber" paramvalue="orderId"/>
		<span class="trackInput">Location:</span><a href="#helpPanel2" data-rel="popup" ><span class="help">How to find? </span></a><dsp:input type="text"   bean="MASOrderTrackingFormHandler.locationCode" paramvalue="code"/>
		<dsp:input class="trackButton" bean="MASOrderTrackingFormHandler.tracking" type="submit" value="Tracking" />
		<dsp:input bean="MASOrderTrackingFormHandler.successUrl" type="hidden" value="/mas/orderTrack.jsp" />
		<dsp:input bean="MASOrderTrackingFormHandler.errorUrl" type="hidden" value="/mas/orderTrack.jsp" />
        <a data-theme="c" data-role="button" href="categories?deviceId=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&Ntt=${sessionScope.selectedDeviceId}" >Continue Shopping</a>
				
					
		<ul data-role="listview">

		<dsp:droplet name="/atg/dynamo/droplet/ForEach">
        <dsp:param name="array" bean="MASOrderTrackingFormHandler.orderTrackingResponseTO.serviceLine"/>
        <dsp:param name="elementName" value="serviceLine"/>
        <dsp:oparam name="output">
		
		
			<li class="trackDetails">
				<div class="orderDetails">
					<div class="statusImg"><img src="css/images/box.jpg" /></div>
					<div class="orderInfo">
						<h2>Order Number:</h2>
						<div class="number"><dsp:valueof bean="MASOrderTrackingFormHandler.orderNumber"/></div>
						<div class="date"><dsp:valueof param="serviceLine.shipmentTrackingNumber"/></div>
					</div>
				</div>
				<div class="shipDetails">
					<div class="status">Status:<dsp:valueof param="serviceLine.shipmentMessage"/></div>
					<div class="date">Date:<dsp:valueof param="serviceLine.shipmentDate"/></div>
				</div>
				<div class="trackNum">Courier: <dsp:valueof param="serviceLine.shipmentCourier"/></div>
				<div class="trackNum">Tracking: <dsp:valueof param="serviceLine.shipmentTrackingNumber"/></div>
				<!--<div class="updateDate">Last Updated: 17:18:00 Dec 8th, 2012</div>  -->
			</li>

			</dsp:oparam>
		</dsp:droplet>

		</ul>

	</div><!-- content -->
 <div data-role="popup" data-theme="e" id="helpPanel1" data-corners="false" data-theme="none" data-shadow="false" data-tolerance="100,15,0,15">
 	<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>
        <div class="tooltip">
                  In your Order Confirmation or Receipt
                   <br>
				<div>ORDER#: 123456789</div>
				or
				<br>
				Order Details
				<br>
				Order Location: D771001
				<br>
				<div>Order Number: 0000123456780000</div>
				Application Number: 123456987
				<br>
				or
				<br>
				<div>
				Preorder Confirmation:
				<br>
				1234123412341234
               </div>
        </div>
  </div> 
	
  <div data-role="popup" id="helpPanel2" data-theme="e" data-corners="false" data-theme="none" data-shadow="false" data-tolerance="180,15,0,15">
  	<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>
          <div class="tooltip">
			In your Confirmation Email or Receipt
			<br>
			Order Details
			<br>
			<div>
			<b>Order Location: D7710-01</b>
              </div>
			Order Number: 0000123456780000
			<br>
			Application Number: 241019495
			<br>
			</div>
			</div>
  </div> 
</dsp:form>
</div><!-- #viewCart -->
</body>
</html>




