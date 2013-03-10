<!DOCTYPE html>
<dsp:page>
<%@ include file="/includes/taglibs.jspf" %>
<%@ page import="atg.servlet.*"%>

<html lang="en">
	<dsp:importbean bean="/atg/dynamo/droplet/Switch"/>
	<dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet"/>
	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter"/>
	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter"/>
	<dsp:importbean bean="/atg/userprofiling/Profile"/>
	<dsp:importbean bean="/atg/commerce/order/ShoppingCartModifier"/> 
	<dsp:importbean bean="/atg/commerce/order/purchase/CreateHardgoodShippingGroupFormHandler"/> 
	<dsp:importbean bean="/atg/commerce/pricing/UserPricingModels"/>
	<dsp:importbean bean="/atg/dynamo/droplet/ForEach"/>
	<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty"/>
	<dsp:importbean bean="/atg/commerce/ShoppingCart" />
	<dsp:importbean bean="/atg/commerce/order/purchase/RepriceOrderDroplet"/>
	<dsp:importbean bean="/store/beans/CustomerBean" />
<head>
	<%@include file="_header.jsp" %>
</head>
<body>

 <div id="guest_review" data-role="page"
		data-theme="c"
		data-title="Order Review">
 		<div data-role="header"
			data-theme="c"
			data-position="fixed"
			data-id="vs_header">
			<h1>Guest Checkout</h1>
			<a href="/mas/shipInfo.jsp"
				data-icon="back"
				data-theme="d"
				data-iconpos="notext"
				>Back</a>
			<a class="openMiniCart" href="#miniCart"
				data-theme="d"
				data-rel="popup" 
				data-transition="slide"
				data-role="button"
				data-position-to="window"
				>Cart</a>
		</div><!-- header -->
		
		<div id="contentArea">
		<dsp:droplet name="Switch">
		<dsp:param name="value" bean="ShoppingCart.currentEmpty" />
		<dsp:oparam name="true">
		<div class="content empty" data-role="content">
			<div class="cart">Your cart is empty.</div>
			<a data-theme="d" data-role="button" href="categories?deviceId=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&Ntt=${sessionScope.selectedDeviceId}" >Continue Shopping</a>
		</div>					
		</dsp:oparam>
		<dsp:oparam name="default">
        <dsp:droplet name="IsEmpty">
        	<dsp:param bean="ShoppingCartModifier.order.commerceItems" name="value"/>
			<dsp:oparam name="false"> 		
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
								<span class="price"><dsp:valueof param="item.priceInfo.amount"  converter="currency"/></span>
							</div>
						</div>
					</div>	
				</dsp:oparam>
			</dsp:droplet>
			<div class="clear25"></div>

       	<div class="items">
       			<div class="item">
         				<div class="desc">Order Subtotal</div>
         				<div class="price"><dsp:valueof bean="ShoppingCart.current.priceInfo.amount" converter="currency"/></div>
       			</div>
       
       			<div class="item">
        				<div class="desc">Taxes</div>
         				<div class="price"> <dsp:valueof bean="ShoppingCart.current.masOrderInfo.taxAmount" converter="currency"/>  </div>
       			</div>
       
       			<div class="item">
        				<div class="desc">Shipping</div>
         				<div class="price">
         					<div><dsp:valueof bean="ShoppingCart.current.masOrderInfo.shippingDesc"/>  </div>
         				</div>
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
		</dsp:oparam>
    </dsp:droplet> 

		</div><!--end of content-->
   		
		<%@include file="_miniCart.jsp" %>
 
   		<div data-role="footer"
			data-position="fixed"
			data-theme="d"
			data-id="vs_footer">
			<div data-role="navbar">
				<a class="checkoutButton"  href="/mas/creditCard.jsp" data-role="button">CONTINUE CHECKOUT</a>
			</div><!-- navbar -->
		</div><!-- footer -->
	  </dsp:oparam>
    </dsp:droplet> 
 </div>

</body>
</dsp:page>
</html>