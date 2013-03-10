<!DOCTYPE html>
<html lang="en">
<head>
	<%@include file="_header.jsp" %>
</head>
<body>

<div id="user_opt" data-role="page"
		data-theme="c"
		data-title="Order Review">
 <div data-role="header"
			data-theme="c"
			data-position="fixed"
			data-id="vs_header">
			<h1>Guest Checkout</h1>
			<a href="${pageContext.request.contextPath}/login.jsp"
				data-icon="back"
				data-theme="d"
				data-iconpos="notext"
				>Back</a>
			<a href="${pageContext.request.contextPath}/shoppingCart.jsp"
				data-theme="d"
				data-role="button"
				>Cart</a>
		</div><!-- header -->
  <div id="contentArea">

<%--
   <dsp:importbean bean="/atg/userprofiling/Profile"/>
   <dsp:importbean bean="/atg/commerce/ShoppingCart" />
   
   <dsp:droplet name="/mas/commerce/order/purchase/droplet/BTADroplet">
	   <dsp:param bean="ShoppingCart.current" name="order"/>
	   <dsp:param bean="Profile" name="profile"/>
	   <dsp:oparam name="true">
	      <a href="confirmation.jsp" >
	         <div class="block">
	            Bill to account
	         </div>
	       </a>
	   </dsp:oparam>
	   <dsp:oparam name="false">
	   	Not eligible for Bill to account
	   </dsp:oparam>
   </dsp:droplet>
--%>      


	<dsp:importbean bean="/atg/commerce/order/purchase/ShippingGroupFormHandler"/>
	<dsp:importbean bean="/atg/dynamo/droplet/ErrorMessageForEach"/>

	<dsp:form action="confirmationBTA.jsp" method="post">
		<dsp:droplet name="ErrorMessageForEach">
			<dsp:param bean="ShippingGroupFormHandler.formExceptions" name="exceptions" />
			<dsp:oparam name="output">
				<li><dsp:valueof param="message" /></li>
			</dsp:oparam>
		</dsp:droplet>
		<dsp:input bean="ShippingGroupFormHandler.btaErrorURL" type="hidden" value="userOpt.jsp"/>
		<dsp:input bean="ShippingGroupFormHandler.btaSuccessURL" type="hidden" value="confirmationBTA.jsp"/>
		<dsp:input bean="ShippingGroupFormHandler.billToAccount" type="submit" value="Bill to account"/>
	</dsp:form>

<%--
       <a href="confirmation.jsp" >
         <div class="block">
            Bill to account
         </div>
       </a>
 --%>       
       <a href="/mas/shipInfo.jsp">
         <div class="block">
           Checkout with credit card
         </div>
       </a>
  </div>
 </div>	

</body>
</html>