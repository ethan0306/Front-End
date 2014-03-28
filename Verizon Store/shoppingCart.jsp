<!DOCTYPE html>
<dsp:page>
<%@ include file="/includes/taglibs.jspf" %>
<%@ page import="atg.servlet.*"%>
<% String ua = request.getHeader( "User-Agent" );
   boolean isChrome = ( ua != null && ua.indexOf( "CriOS/" ) != -1 );
%>

<html lang="en">
<head>
	<%@include file="_header.jsp" %>
</head>
<body>
	<dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet" />
	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter" />
	<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter" />
	<dsp:importbean bean="/atg/userprofiling/Profile" />
	<dsp:importbean bean="/mas/commerce/order/purchase/CartFormHandler" />
	<dsp:importbean bean="/atg/dynamo/Configuration" />
	<dsp:importbean bean="/atg/commerce/ShoppingCart" />

	
	<dsp:importbean bean="/atg/commerce/order/purchase/RepriceOrderDroplet" />
	<dsp:importbean bean="/atg/commerce/order/purchase/CartModifierFormHandler"/>
	<dsp:importbean bean="/atg/dynamo/droplet/IsNull"/>
	<dsp:importbean bean="/atg/commerce/ShoppingCart" />
	<dsp:importbean bean="/atg/commerce/order/ShoppingCartModifier"/>
	<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty"/>
	<dsp:importbean bean="/atg/commerce/ShoppingCart"/>
	<dsp:importbean bean="/atg/dynamo/droplet/ForEach"/>
	<dsp:importbean bean="/atg/dynamo/droplet/Switch"/>
	<dsp:droplet name="RepriceOrderDroplet">
  		<dsp:param name="pricingOp" value="ORDER_TOTAL" />
	</dsp:droplet>

	<div id="viewCart"
	data-role="page"
	data-theme="c"
	data-title="Shopping Cart">

	<div data-role="header"
		data-theme="c"
		data-id="vs_header">
		<div class="vzwLogo"><img src="/mas/css/images/vzwLogo.png"/></div>
		<!-- a href="#" 
            data-rel="back" 
            data-icon="back"
            data-theme="d"
        >Back</a -->
		<a href="categories?Ntt=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&deviceId=${sessionScope.selectedDeviceId}"
                data-role="button"
		        data-theme="d"
                data-icon="home"
                >Home</a>
		<a class="onEditList"
			data-theme="d"
			data-role="button"
			data-icon="edit"
			>Edit</a>
	</div><!-- header -->
	
	<dsp:droplet name="Switch">
		<dsp:param name="value" bean="ShoppingCart.currentEmpty" />
		<dsp:oparam name="true">
		<div class="content empty" data-role="content">

			<div class="cart">Your cart is empty.</div>
			<a data-theme="d" data-role="button" href="categories?deviceId=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&Ntt=${sessionScope.selectedDeviceId}" >Continue Shopping</a>

		</div>					
		</dsp:oparam>

		<dsp:oparam name="default">
			
			<div class="content uneditLists" data-role="content">
				<dsp:getvalueof id="formAction" bean="/OriginatingRequest.requestURI" idtype="java.lang.String">
				<dsp:form action="<%=formAction%>" method="post">
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
									<dsp:getvalueof id="itemQty" param='item.quantity'>

									<span class="quantity">Qty:<%=itemQty%></span>
								<span class="select" >                      		 				
									<dsp:getvalueof var="cqty"  param="item.quantity"/>  
									
									<select class="prodQty" name="<dsp:valueof param='item.id'/>" data-mini="true" data-native-menu="<%=isChrome%>">
									   
											<option value="0" <c:if test="${cqty == '0'}">selected</c:if>/>0</option>
											<option value="1" <c:if test="${cqty == '1'}">selected</c:if>/>1</option>
											<option value="2" <c:if test="${cqty == '2'}">selected</c:if>/>2</option>
											<option value="3" <c:if test="${cqty == '3'}">selected</c:if>/>3</option>
				  					</select>
				    				</span>

									</dsp:getvalueof>
									<dsp:input class="removeCheckbox" type="checkbox" bean="CartFormHandler.removalCommerceIds" paramvalue="item.id" />
									<div class="removeButton swipeOut">
										<dsp:input data-theme="d" data-mini="true" data-role="button" type="submit" bean="CartFormHandler.removeItemFromOrder" value="Delete"/>
									</div>
									<dsp:input bean="CartFormHandler.setCheckForChangedQuantity" type="hidden" value="true"/>
						 			<dsp:input type="checkbox" class="updateCheckbox" bean="CartFormHandler.removalCatalogRefIds" value='<dsp:valueof param="item.auxiliaryData.catalogRef.repositoryId"/>'/>
									<span class="price"><dsp:valueof param="item.priceInfo.amount" converter="currency"/></span>
								</div>
							</div>
						</div>	
					</dsp:oparam>
					</dsp:droplet>
					<div class="totalDue"><b><dsp:valueof bean="ShoppingCart.current.priceInfo.amount" converter="currency"/></b></div>		
					<div class="errorMsg"></div>
					<div class="totalDue">Shipping Cost will reflect during checkout.</div>
					
					<div class="orderAddl">
						<label for="promoInput">Promo Code:</label>
           					<input type="text" id="promoInput" name="promoInput" value="" />
					</div>
					<div class="totalDue">Promo discount will reflect during checkout.</div>
                    
					<div class="editButton">
						<dsp:input bean="CartFormHandler.setOrderSuccessURL" type="hidden" value="/mas/shoppingCart.jsp"/>
						<div class="updateButton ui-disabled">
							<dsp:input data-theme="d" bean="CartFormHandler.setOrderByCommerceId" type="submit" value="Update"/>
						</div>
						<a data-role="button" class="cancelButton">Cancel</a>
					</div>
					
					<div class="clear25"></div>
                    <a data-theme="c" data-role="button" data-mini="true" href="categories?Ntt=${sessionScope.selectedDeviceId}&Ntk=accessory.compatibleDevices.repositoryId&deviceId=${sessionScope.selectedDeviceId}" >Continue Shopping</a>
					<div class="clear50"></div>	
			</div>

		

	<div class="cartFooter" data-role="footer"
		data-position="fixed"
		data-theme="d"
		data-id="vs_footer">
		<div id="total_price">Total Price:<dsp:valueof bean="ShoppingCart.current.priceInfo.amount" converter="currency"/></div>
		<div data-role="navbar">
			<a class="checkoutButton" href="/mas/login.jsp" data-role="button">SECURE CHECKOUT</a>
			<!--<ul>
				<li><a class="removeButton ui-disabled" data-role="button">
					
				</a></li>
				
				<li>
					
				</li>
			</ul>-->
		
		</div><!-- navbar -->
	</div><!-- footer -->

	</div><!-- #viewCart -->
	</dsp:oparam>
</dsp:droplet> 
</dsp:form>
</dsp:getvalueof>

</dsp:oparam>
	</dsp:droplet> 


</body>
</html>

</dsp:page>
