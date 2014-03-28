<!DOCTYPE html>
	<html lang="en">
<dsp:page>
<dsp:importbean bean="/atg/dynamo/droplet/Switch"/>
<dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet"/>
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter"/>
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter"/>
<dsp:importbean bean="/atg/userprofiling/Profile"/>
<dsp:importbean bean="/atg/commerce/order/ShoppingCartModifier"/> 
<dsp:importbean bean="/atg/commerce/order/purchase/CreateHardgoodShippingGroupFormHandler"/> 
<dsp:importbean bean="/atg/commerce/pricing/UserPricingModels"/>
<dsp:importbean bean="/atg/commerce/pricing/AvailableShippingMethods"/>
<dsp:importbean bean="/atg/dynamo/droplet/ForEach"/>
<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty"/>
<dsp:importbean bean="/atg/commerce/ShoppingCart" />
<dsp:importbean bean="/atg/commerce/order/purchase/PaymentGroupFormHandler"/>
<dsp:importbean bean="/atg/commerce/order/purchase/PaymentGroupDroplet"/>
<dsp:importbean bean="/atg/dynamo/droplet/ErrorMessageForEach"/>
<dsp:importbean bean="/atg/commerce/util/MapToArrayDefaultFirst"/>
<dsp:droplet name="PaymentGroupDroplet">
  <dsp:param value="true" name="clear"/>
  <dsp:param value="creditCard" name="paymentGroupTypes"/>
  <dsp:param value="true" name="initPaymentGroups"/>
  <dsp:param value="true" name="initItemPayment"/>
  <dsp:param value="true" name="initTaxPayment"/>
  <dsp:param value="true" name="initShippingPayment"/>
  <dsp:param value="true" name="initOrderPayment"/>
  <dsp:oparam name="output"/>
</dsp:droplet>
<dsp:importbean bean="/atg/commerce/order/purchase/RepriceOrderDroplet"/>
<dsp:droplet name="RepriceOrderDroplet">
  <dsp:param value="ORDER_TOTAL" name="pricingOp"/>
</dsp:droplet>

<head>
	<%@include file="_header.jsp" %>
  </head>
  
<body> 

<div id="credit_info" data-role="page"
		data-theme="c"
		data-title="Checkout">
   <div data-role="header"
			data-theme="c"
			data-position="fixed"
			data-id="vs_header">
			<h1>Payment Information</h1>
			<a href="/mas/guestReview.jsp"
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


<dsp:form id="credit_form"  method="post">
  <div class="contentArea">
  	 <dsp:droplet name="ErrorMessageForEach">
						<dsp:param bean="PaymentGroupFormHandler.formExceptions" name="exceptions" />
						<dsp:oparam name="output">
							<li><dsp:valueof param="message" /></li>
						</dsp:oparam>
	</dsp:droplet>

    <dsp:getvalueof var="creditCards" vartype="java.lang.Object" bean="Profile.creditCards"/>
    <c:if test="${not empty creditCards}">
      <dsp:droplet name="MapToArrayDefaultFirst">
        <dsp:param name="map" bean="Profile.creditCards"/>
        <dsp:param name="defaultId" bean="Profile.defaultCreditCard.repositoryId"/>
        <dsp:param name="sortByKeys" value="true"/>
        <dsp:oparam name="output">
          <dsp:getvalueof var="sortedArray" vartype="java.lang.Object" param="sortedArray"/>
          <dsp:getvalueof var="defaultCardId" vartype="java.lang.String" bean="Profile.defaultCreditCard.repositoryId"/>
          defaultCardId: ${defaultCardId}
		  <div class="cardoption">
               <div class="val_row">
	            <label for="CreditCard">Select Account</label><span class="red">*</span><br />
	            <select id="cardOption" bean="PaymentGroupFormHandler.creditCard.creditCardNumber">
		          <c:forEach var="userCard" items="${sortedArray}" varStatus="status">
		          	    <dsp:param name="creditCard" value="${userCard.value}"/>
		          	    <dsp:getvalueof var="cardNumber" vartype="java.lang.String" param="creditCard.creditCardNumber"/>
		 				<option>${cardNumber}  --${userCard.key}</option>
		          </c:forEach>
				        <option>Use a new CARD</option>
						     </select>
             </div>  
        </div>
        </dsp:oparam>  
	 </dsp:droplet>
	 </c:if>
     
	 <div class="cardinfo">
       <div class="val_row">
            <label for="CardType">Card Type<span class="red">*</span><br />
           	<dsp:select  id="CardType" name="CardType" bean="PaymentGroupFormHandler.creditCard.creditCardType" required="<%=true%>">
					<dsp:option value="Visa"/>Visa
					<dsp:option value="MasterCard"/>Master Card
					<dsp:option value="American Express"/>American Express
					<dsp:option value="Discover"/>Discover
			</dsp:select></label>
      </div>  
     <div class="val_row">
        <label for="bFirstName">First Name<span class="red">*</span><br />
		<dsp:input id="bFirstName" name="bFirstName"
				bean="PaymentGroupFormHandler.address.firstName"
				beanvalue="Profile.firstName" size="30" type="text"/></label>
    </div>
    
    <div class="val_row">
        <label for="bLastName">Last Name<span class="red">*</span><br />
        <dsp:input id="bLastName" name="bLastName"
				bean="PaymentGroupFormHandler.address.lastName"
				beanvalue="Profile.lastName" size="30" type="text"/></label>
    </div>
    
    <div class="val_row">
        <label for="CardNumber">Card Number<span class="red">*</span><br />
        <dsp:input id="CardNumber" name="CardNumber"
				bean="PaymentGroupFormHandler.creditCard.creditCardNumber"
				maxsize="20" size="20" type="text" value=""/></label>
    </div>
    
    <div class="val_row">
        <div class="val_col">
            <label for="Month">Month<span class="red">*</span><br />
            <dsp:select id="Month" name="Month" data-mini="true"
					bean="PaymentGroupFormHandler.creditCard.expirationMonth">
				        <dsp:option value="01"/>January
					<dsp:option value="02"/>February
					<dsp:option value="03"/>March
					<dsp:option value="04"/>April
					<dsp:option value="05"/>May
					<dsp:option value="06"/>June
					<dsp:option value="07"/>July
					<dsp:option value="08"/>August
					<dsp:option value="09"/>September
					<dsp:option value="10"/>October
					<dsp:option value="11"/>November
					<dsp:option value="12"/>December
					</dsp:select></label>
       </div>
	   <div class="val_col">
            <label for="Year">Year<span class="red">*</span><br />
            <dsp:input id="Year" name="Year" bean="PaymentGroupFormHandler.creditCard.expirationYear" size="6" type="text"/></label>
        </div>
		<div class="clear"></div>
   </div>
   
   <div class="val_row">
    	  <label for="_Email">Email<span class="red">*</span>
        			<dsp:input id="_Email" name="_Email"
						 bean="PaymentGroupFormHandler.address.email"
					 size="30" type="email"/></label>
   </div> 
   
   <div class="val_row">
        <label for="bPhoneNumber">Phone<span class="red">*</span>
		<dsp:input id="bPhoneNumber" name="bPhoneNumber"
					bean="PaymentGroupFormHandler.address.phoneNumber"
				   size="20" type="tel"/></label>
   </div>
  </div>
  
  
    <div class="val_row">
      <div class="val_col">
           <label for="Gift">Gift Certificate<br/>
           <input type="text" id="Gift" name="Gift" bean="PaymentGroupFormHandler.giftCards[0].giftCardNumber" size="30" type="text" /></label>
      </div>
        <div class="val_col">
            <label for="PIN">PIN<br />
            <input id="PIN" name="PIN" type="text" bean="PaymentGroupFormHandler.giftCards[0].giftCardPin" size="30" type="text" /></label>
         </div>
		<div class="clear"></div>
     </div>
  
  
     <div class="val_row">
      <div class="val_col">
           <label for="Gift">Gift Certificate<br/>
           <input type="text" id="Gift" name="Gift" bean="PaymentGroupFormHandler.giftCards[1].giftCardNumber" size="30" type="text" /></label>
      </div>
        <div class="val_col">
            <label for="PIN">PIN<br />
            <input id="PIN" name="PIN" type="text" bean="PaymentGroupFormHandler.giftCards[1].giftCardPin" size="30" type="text" /></label>
         </div>
		<div class="clear"></div>
     </div>
 
		<dsp:input bean="PaymentGroupFormHandler.applyPaymentGroupsSuccessURL"
			           type="hidden" value="/mas/confirmation.jsp?init=false"/>
			    <dsp:input bean="PaymentGroupFormHandler.applyPaymentGroupsErrorURL"
			           type="hidden" value="/mas/creditCard.jsp"/>
			     <dsp:input bean="PaymentGroupFormHandler.applyPaymentGroups" type="submit"
			           data-theme="d" value="Review your order"/>
  </div> 
	
	<%@include file="_miniCart.jsp" %> 

   <!-- 	<div data-role="footer"
			data-position="fixed"
			data-theme="d"
			data-id="vs_footer">
			<div data-role="navbar">
				
			</div>
		</div>footer -->
     </dsp:form>
 </div>
 
 
</body>
</dsp:page>
</html>
