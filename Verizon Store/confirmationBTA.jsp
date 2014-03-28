 <!DOCTYPE html>

<html lang="en">
<dsp:page>
<head>
	<%@include file="_header.jsp" %>
</head>
<%--<dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet" />--%>
	<dsp:importbean bean="/atg/commerce/order/purchase/CommitOrderFormHandler"/>
    <dsp:importbean bean="/atg/commerce/order/purchase/CancelOrderFormHandler"/>
	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter" />
	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter" />
	<dsp:importbean bean="/atg/dynamo/droplet/ErrorMessageForEach" />
	<%--<dsp:importbean bean="/atg/userprofiling/Profile" />
	<dsp:importbean bean="/mas/commerce/order/purchase/CartFormHandler" />
	<dsp:importbean bean="/atg/dynamo/Configuration" />--%>
	<dsp:importbean bean="/atg/commerce/ShoppingCart" />
	<%--<dsp:importbean bean="/atg/commerce/order/purchase/RepriceOrderDroplet" />
	<dsp:importbean bean="/atg/commerce/order/purchase/CartModifierFormHandler"/>--%>
	<dsp:importbean bean="/atg/commerce/order/ShoppingCartModifier"/>
	<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty"/>
	<dsp:importbean bean="/atg/dynamo/droplet/ForEach"/>
	<dsp:importbean bean="/atg/dynamo/droplet/Switch"/>
<body>
	

<div id="order_info" data-role="page"
		data-theme="c"
		data-title="Order Review">
 <div data-role="header"
			data-theme="c"
			data-position="fixed"
			data-id="vs_header">
			<h1>Review Order</h1>
			<a href="/mas/creditCard.jsp"
				data-icon="back"
				data-theme="d"
				data-iconpos="notext"
				>Back</a>
		</div><!-- header -->
		<div class="reminder"> You have not been charged until you tap place order.</div>
		<dsp:form id="reviewOrderForm" name="reviewOrderForm" action="/mas/confirmationBTA.jsp" method="post">	
           <div class="contentArea">
 	<div class="error">
 	                <dsp:droplet name="ErrorMessageForEach">
						<dsp:param bean="CommitOrderFormHandler.formExceptions" name="exceptions" />
						<dsp:oparam name="output">
							<li><dsp:valueof param="message" /></li>
						</dsp:oparam>
					</dsp:droplet>
	</div>
	    <div class="item">
        <div class="desc">Bill/Ship To: </div>
        <div class="detail"> 
         <dsp:droplet name="ForEach">
		  <dsp:param bean="ShoppingCart.current.ShippingGroups" name="array"/>
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
				<dsp:param name="array" bean="ShoppingCart.current.paymentGroups"/>
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
						<div class="row">Phone:
							<dsp:valueof param="pGroup.billingAddress.phoneNumber"/>
						</div>
						<div class="row">Email:
							<dsp:valueof param="pGroup.billingAddress.email"/>
						</div>
						</dsp:oparam>
					</dsp:droplet>
				</dsp:oparam>
			</dsp:droplet>
		</div>
	 </div>
	 
	 
	 
	 <div class="item">
	 	    <div class="desc">Shipping: </div>
         	<div class="detail"><dsp:valueof bean="ShoppingCart.current.masOrderInfo.shippingDesc"/></div>
     </div>		
	 <div class="product">
			<dsp:droplet name="ForEach">
				<dsp:param bean="ShoppingCartModifier.order.commerceItems" name="array"/>
           			<dsp:param name="elementName" value="item"/>
                  		<dsp:oparam name="output">
					<div class="cartItem off">
						<img src='<dsp:valueof param="item.auxiliaryData.catalogRef.thumbnailImage.url"/>'/>
						<div class="info">
							<div class="title"><dsp:valueof param="item.auxiliaryData.catalogRef.displayName" valueishtml="true"/></div>
							<div class="count"> 
								<span class="quantity">Qty:<dsp:valueof param='item.quantity'/></span>
								<span class="price"><dsp:valueof param="item.priceInfo.amount" converter="currency" /></span>
							</div>
						</div>
					</div>	
				</dsp:oparam>
			</dsp:droplet>
     </div>
	 
      <div class="items">
       			<div class="item">
         				<div class="desc">Order Subtotal</div>
         				<div class="price"><dsp:valueof bean="ShoppingCart.current.priceInfo.amount" converter="currency"/></div>
       			</div>
       
       			<div class="item">
        				<div class="desc">Taxes</div>
         				<div class="price"><dsp:valueof bean="ShoppingCart.current.masOrderInfo.taxAmount" converter="currency"/></div>
       			</div>
       
       			<div class="item">
        				<div class="desc">Shipping</div>
         				<div class="price"><dsp:valueof bean="ShoppingCart.current.masOrderInfo.shippingAmount" converter="currency"/></div>
      	 			</div>
       
       			<div class="item">
        				<div class="desc">Promotion Discount</div>
         				<div class="price discount"> 
						   <dsp:valueof bean="ShoppingCart.current.masOrderInfo.discountAmount" converter="currency"/>
						</div>
       			</div>
       
       			<div class="total">
      					<div class="desc">Total Due</div>
         			        <div class="detail"> <dsp:valueof bean="ShoppingCart.current.orderTotal"  converter="currency" /></div>
    				</div>  
 		</div> 
	
 
		 <dsp:input bean="CommitOrderFormHandler.orderId" beanvalue="ShoppingCart.current.id" type="hidden"/>
				<dsp:input bean="CommitOrderFormHandler.btaPayment" type="hidden"  data-theme="d"  value="true"/>
				<dsp:input bean="CommitOrderFormHandler.commitOrderSuccessURL" type="hidden" value="/mas/success.jsp"/>
				<dsp:input bean="CommitOrderFormHandler.commitOrderErrorURL" type="hidden" value="/mas/confirmationBTA.jsp"/>
				<dsp:input bean="CommitOrderFormHandler.commitOrder" type="Submit"  data-theme="d"  value="Place Order"/>
		</dsp:form>
      
 </div>

</body>
</dsp:page>
</html>