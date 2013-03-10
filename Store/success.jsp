 <!DOCTYPE html>

<html lang="en">
<dsp:page>
<head>
	<%@include file="_header.jsp" %>
</head>

	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter" />
	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter" />
	<dsp:importbean bean="/atg/commerce/ShoppingCart" />
	<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty"/>
	<dsp:importbean bean="/atg/dynamo/droplet/ForEach"/>
	<dsp:importbean bean="/atg/dynamo/droplet/Switch"/>
<body>
<dsp:getvalueof id="orderId" bean="ShoppingCart.last.id">
<dsp:getvalueof id="locationId" bean="ShoppingCart.last.posLocationId">
<div id="order_info" data-role="page"
		data-theme="c"
		data-title="Order Review">
 <div data-role="header"
			data-theme="c"
			data-position="fixed"
			data-id="vs_header">
			<h1>Confirmation # ${orderId} </h1>
		</div><!-- header -->
        <div class="contentArea">
        		<div class="item"> 
			<p>Dear Test User, </p>
            <p class="text">Thank you for your recent order <strong>
				<a href='<%="orderTrack.jsp?orderId=" + orderId + "&code=" + locationId%>' ><strong><%=orderId%></strong></a>
			</strong>. We will send you the confirmation email shortly. </p>                    
		</div>
	    <div class="item">
        <div class="desc">Bill/Ship To: </div>
        <div class="detail"> 
         <dsp:droplet name="ForEach">
		  <dsp:param bean="ShoppingCart.last.ShippingGroups" name="array"/>
		  <dsp:param name="elementName" value="ShippingGroup"/>
		  <!-- First output all of the address information for this shipping group -->
		  <dsp:oparam name="output">
			<dsp:droplet name="Switch">
				<dsp:param name="value" param="ShippingGroup.shippingGroupClassType"/>
				<dsp:oparam name="hardgoodShippingGroup"> 
				    <div class="row">
				    	<span>Customer: </span>
						<span><dsp:valueof param="ShippingGroup.shippingAddress.firstName"/>&nbsp;<dsp:valueof param="ShippingGroup.shippingAddress.middleName"/>&nbsp;<dsp:valueof param="ShippingGroup.shippingAddress.lastName"/></span>
				    </div>
					<div class="row">
					    <span>Address:</span> 
						<span><dsp:valueof param="ShippingGroup.shippingAddress.address1"/>
							<dsp:droplet name="IsEmpty">
								<dsp:param name="value" param="ShippingGroup.shippingAddress.address2"/>
								<dsp:oparam name="false">
									<dsp:valueof param="ShippingGroup.shippingAddress.address2"/>
								</dsp:oparam>
							</dsp:droplet>,&nbsp;
							<dsp:valueof param="ShippingGroup.shippingAddress.city"/>,&nbsp;<dsp:valueof param="ShippingGroup.shippingAddress.state"/>&nbsp;<dsp:valueof param="ShippingGroup.shippingAddress.postalCode"/></span> 
					</div>
					<div class="row">
						 <span>Phone:</span> 
						 <span><dsp:valueof param="ShippingGroup.shippingAddress.phoneNumber"/></span> 
					</div>
					<div class="row">
						<span>Email:</span> 
						 <span><dsp:valueof param="ShippingGroup.shippingAddress.email"/></span> 
					</div>
				</dsp:oparam>
			</dsp:droplet>
		  </dsp:oparam>
		</dsp:droplet>
        </div>
      </div>
	
      <div class="item">
        <div class="desc">Payment: </div>
        <div class="detail"> 
			  	<dsp:droplet name="ForEach">
				<dsp:param name="array" bean="ShoppingCart.last.paymentGroups"/>
				<dsp:param name="elementName" value="pGroup"/>
				<dsp:oparam name="outputStart">
				</dsp:oparam>
				<dsp:oparam name="output">
					<dsp:droplet name="Switch">
						<dsp:param name="value" param="pGroup.paymentMethod"/>
						<dsp:oparam name="creditCard">
						<div class="row">
							Customer: <dsp:valueof param="pGroup.billingAddress.firstName"/>&nbsp; <dsp:valueof param="pGroup.billingAddress.lastName"/>
						</div>
						<div class="row">
							<div><dsp:valueof param="pGroup.creditCardType"/>&nbsp;<dsp:valueof converter="creditcard" maskcharacter="*" numcharsunmasked="4" param="pGroup.creditCardNumber"/></div>
						</div>
						<div class="row">Zip:
							<dsp:valueof param="pGroup.billingAddress.postalCode"/>
						</div>
						<div class="row">Email:
							<dsp:valueof param="pGroup.billingAddress.phoneNumber"/>
						</div>
						<div class="row">Phone:
							<dsp:valueof param="pGroup.billingAddress.email"/>
						</div>
						</dsp:oparam>
					</dsp:droplet>
				</dsp:oparam>
			</dsp:droplet>
		</div>
	 </div>
   
  <%--
	 <div class="item">
	 	    <div class="desc">Shipping: </div>
         	<div class="detail"><dsp:valueof bean="ShoppingCart.last.masOrderInfo.shippingDesc"/></div>
     </div>		
	
       	<div class="items">
       			<div class="item">
         				<div class="desc">Order Subtotal</div>
         				<div class="price"><dsp:valueof bean="ShoppingCart.last.masOrderInfo.amount" converter="currency"/></div>
       			</div>
       
       			<div class="item">
        				<div class="desc">Taxes</div>
         				<div class="price"><dsp:valueof bean="ShoppingCart.last.masOrderInfo.taxAmount" converter="currency"/></div>
       			</div>
       
       			<div class="item">
        				<div class="desc">Shipping</div>
         				<div class="price"><dsp:valueof bean="ShoppingCart.last.masOrderInfo.shippingAmount" converter="currency"/></div>
      	 			</div>
       
       			<div class="item">
        				<div class="desc">Prmomotion Discount</div>
         				<div class="price discount"> 
						   <dsp:valueof bean="ShoppingCart.last.masOrderInfo.discountAmount" converter="currency"/>
						</div>
       			</div>
       
       			<div class="total">
      					<div class="desc">Total Due</div>
         				<div class="detail"> <dsp:valueof bean="ShoppingCart.last.orderTotal"  converter="currency" /></div>
    				</div>  
 		</div> 
	--%>
	
 </div> 
		<div class="clear25"></div>
                    <a data-theme="d" data-role="button" href="/mas/categories?deviceId=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&Ntt=${sessionScope.selectedDeviceId}" >Continue Shopping</a>
	    <div class="clear50"></div>	
 </div>
 </dsp:getvalueof>
  </dsp:getvalueof>
</body>
</dsp:page>
</html>
