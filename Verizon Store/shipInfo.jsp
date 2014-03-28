<!DOCTYPE html>
<html lang="en">
<dsp:importbean bean="/atg/dynamo/droplet/Switch"/>
<dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet"/>
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter"/>
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter"/>
<dsp:importbean bean="/atg/userprofiling/Profile"/>
<dsp:importbean bean="/mas/commerce/order/purchase/CartFormHandler" />
<dsp:importbean bean="/atg/commerce/order/purchase/CartModifierFormHandler"/>
<dsp:importbean bean="/atg/commerce/order/purchase/ShippingGroupFormHandler"/>
<dsp:importbean bean="/atg/commerce/order/purchase/ShippingGroupDroplet"/>
<dsp:importbean bean="/atg/dynamo/Configuration" />
<dsp:importbean bean="/atg/dynamo/droplet/ErrorMessageForEach"/>
<dsp:importbean bean="/atg/commerce/order/ShoppingCartModifier"/>
<dsp:importbean bean="/atg/commerce/pricing/UserPricingModels"/>
<dsp:importbean bean="/atg/commerce/pricing/AvailableShippingMethods"/>
<dsp:importbean bean="/atg/dynamo/droplet/ForEach"/>
<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty"/>
<dsp:importbean bean="/atg/commerce/ShoppingCart" />
<dsp:importbean bean="/atg/commerce/order/purchase/RepriceOrderDroplet"/>



<head>
	<%@include file="_header.jsp" %>
</head>
<body>

<div id="ship_info" data-role="page"
	data-theme="c"
	data-title="Checkout">
		
 	 <div data-role="header"
		data-theme="c"
		data-position="fixed"
		data-id="vs_header">
		<h1>Guest Checkout</h1>
		<a href="login.jsp"
			data-icon="back"
			data-role="button"
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
<dsp:page>
	<dsp:form id="ship_form" action="guestReview.jsp?init=false"  method="post">
 		<div class="contentArea">	
 			    <div class="errors">
 			    	<dsp:droplet name="ErrorMessageForEach">
						<dsp:param bean="ShippingGroupFormHandler.formExceptions" name="exceptions" />
						<dsp:oparam name="output">
							<li><dsp:valueof param="message" /></li>
						</dsp:oparam>
					</dsp:droplet>
 			    </div>  
				
    			<div class="val_row">
    		    		<label for="_Email">Email<span class="red">*</span>
        			    <dsp:input id="_Email" name="_Email" bean="ShippingGroupFormHandler.address.email" size="30" type="email"/></label>
    			</div> 
    			<div class="val_row">
        			<label for="sFirstName">First Name<span class="red">*</span>
        			<dsp:input id="sFirstName" name="sFirstName"
					      bean="ShippingGroupFormHandler.address.firstName" beanvalue="Profile.firstName" size="30" type="text"/></label>
    			</div>
    			<div class="val_row">
       	 		<label for="sLastName">Last Name<span class="red">*</span>
       	 		<dsp:input id="sLastName" name="sLastName" 
                    bean="ShippingGroupFormHandler.address.lastName" beanvalue="Profile.lastName" size="30" type="text"/></label>
   			  </div>
    			<div class="val_row">
        			<label for="sAddress1">Street Address 1<span class="red">*</span>
        			<dsp:input id="sAddress1" name="sAddress1"
                         bean="ShippingGroupFormHandler.address.address1" beanvalue="Profile.shippingAddress.address1"
                         size="30" type="text"/></label>
    			</div>
    			<div class="val_row">
       	 		<label for="sAddress2">Street Address 2
       	 		<dsp:input id="sAddress2" name="sAddress2"
       	 		      bean="ShippingGroupFormHandler.address.address2" beanvalue="Profile.shippingAddress.address2"
                      size="30" type="text"/></label>
    			</div>
    			<div class="val_row">
      				<div class="val_col">
           				<label for="sCity_">City<span class="red">*</span>
           				<dsp:input id="sCity" name="sCity"
                              bean="ShippingGroupFormHandler.address.city" beanvalue="Profile.shippingAddress.city" size="30"
                              type="text"/></label>
        			</div>
        			<div class="val_col" >
           	 			State<span class="red">*</span><br />
            				<dsp:select id="sState" name="sState" data-mini="true"
                              bean="ShippingGroupFormHandler.address.state" beanvalue="Profile.shippingAddress.state">
                                		<dsp:option value="AK"/>AK
				 						<dsp:option value="AL"/>AL
										<dsp:option value="AR"/>AR
										<dsp:option value="AZ"/>AZ
										<dsp:option value="CA"/>CA
										<dsp:option value="CO"/>CO
										<dsp:option value="CT"/>CT
										<dsp:option value="DC"/>DC
										<dsp:option value="DE"/>DE
										<dsp:option value="FL"/>FL
										<dsp:option value="GA"/>GA
										<dsp:option value="HI"/>HI
										<dsp:option value="IA"/>IA
										<dsp:option value="ID"/>ID
										<dsp:option value="IL"/>IL
										<dsp:option value="IN"/>IN
										<dsp:option value="KS"/>KS
										<dsp:option value="KY"/>KY
										<dsp:option value="LA"/>LA
										<dsp:option value="MA"/> MA
										<dsp:option value="MD"/>MD
										<dsp:option value="ME"/>ME
										<dsp:option value="MI"/>MI
										<dsp:option value="MN"/>MN
										<dsp:option value="MO"/>MO
										<dsp:option value="MS"/>MS
										<dsp:option value="MT"/>MT
										<dsp:option value="NC"/>NC
										<dsp:option value="ND"/>ND
										<dsp:option value="NE"/>NE
										<dsp:option value="NH"/>NH
										<dsp:option value="NJ"/>NJ
										<dsp:option value="NM"/>NM
										<dsp:option value="NV"/>NV
										<dsp:option value="NY"/>NY
										<dsp:option value="OH"/>OH
										<dsp:option value="OK"/>OK
										<dsp:option value="OR"/>OR
										<dsp:option value="PA"/>PA
										<dsp:option value="RI"/>RI
										<dsp:option value="SC"/>SC
										<dsp:option value="SD"/>SD
										<dsp:option value="TN"/>TN
										<dsp:option value="TX"/>TX
										<dsp:option value="UT"/>UT
										<dsp:option value="VA"/>VA
										<dsp:option value="VT"/>VT
										<dsp:option value="WA"/>WA
										<dsp:option value="WI"/>WI
										<dsp:option value="WV"/>WV
										<dsp:option value="WY"/>WY
				             		</dsp:select>
        			   </div>
				   <div class="clear"></div>
			</div>
			
			<dsp:input id="sCountry" name="sCountry" 
       	 		    bean="ShippingGroupFormHandler.address.country" maxsize="2"
                    value="US" size="2" type="hidden"
                    />
			
			<div class="val_row">
            				<label for="sZip">Zip<span class="red">*</span><br />
            				<dsp:input id="sZip" name="sZip"
                                 bean="ShippingGroupFormHandler.address.postalCode" beanvalue="Profile.shippingAddress.postalCode"
                                 size="10" type="number"/></label>
    		</div>
			
	
 
			<div class="val_row">
						<label for="sPhoneNumber">Phone<span class="red">*</span><br />
						<dsp:input id="sPhoneNumber" name="sPhoneNumber" bean="ShippingGroupFormHandler.address.phoneNumber"  size="30" type="tel"/></label>
    		</div>
    		
    			<div class="val_row">
        				 <label for="Promote">Promotion Code<br />
       	 		         <dsp:input id="Promote" name="Promote"
       	 		                 bean="ShippingGroupFormHandler.promoCode"  type="text"/></label>
    			</div>
				
      			<div class="optin_row">
     	 			<div data-role="fieldcontain">
        				<fieldset data-role="controlgroup">
		    				<input type="checkbox" disabled checked class="chk" name="chkOpt1" id="chkOpt1" data-role="none" />
		    				<label for="chkOptIn" style="float: left">Billing Information same as shipping</label>
        				</fieldset>
     				</div>
    			</div>
    
    			<!--<div class="optin_row">
      				<div data-role="fieldcontain">
        				<fieldset data-role="controlgroup">
		    				<input type="checkbox" class="chk" name="chkOpt2" id="chkOpt12" data-role="none" />
		   				<label for="chkOptIn" >Receive Verizon Wireless special offers via email.</label>
        				</fieldset>
     				</div>
    			</div>-->
		</div> 
		
		        <dsp:input bean="ShippingGroupFormHandler.applyShippingGroupsSuccessURL" type="hidden" value="guestReview.jsp?init=false"/>
                <dsp:input bean="ShippingGroupFormHandler.applyShippingGroupsErrorURL" type="hidden" value="shipInfo.jsp?init=false"/>
			    <dsp:input bean="ShippingGroupFormHandler.applyShippingGroups" type="submit" data-theme="d"  value="CONTINUE CHECKOUT" priority="<%=(int)-10%>"/>

		<%@include file="_miniCart.jsp" %> 

   		
  	 </dsp:form >
	 </dsp:page>

</div>



</body>
</html>
