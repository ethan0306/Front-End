
<div data-role="popup" id="miniCart" data-corners="false" data-theme="none" data-shadow="false" data-tolerance="0,0">
	
	<dsp:droplet name="IsEmpty">
        	<dsp:param bean="ShoppingCartModifier.order.commerceItems" name="value"/>
			<dsp:oparam name="false"> 		
			<dsp:droplet name="ForEach">
				<dsp:param bean="ShoppingCartModifier.order.commerceItems" name="array"/>
           			<dsp:param name="elementName" value="item"/>
                  		<dsp:oparam name="output">
					<div class="cartItem">
						<img src='<dsp:valueof param="item.auxiliaryData.catalogRef.thumbnailImage.url"/>'/>
						<div class="info">
							<div class="title"><dsp:valueof param="item.auxiliaryData.catalogRef.displayName" valueishtml="true"/></div>
							<div class="count"> 
								<span class="quantity">Qty:<dsp:valueof param='item.quantity'/></span>
								<span class="price"><dsp:valueof param="item.priceInfo.amount" /></span>
							</div>
						</div>
					</div>	
				</dsp:oparam>
			</dsp:droplet>
		</dsp:oparam>
	</dsp:droplet>
		
	<div data-role="navbar">
		<ul>
			<li><a data-theme="a" href="/mas/shoppingCart.jsp">Modify Order</a></li>
			<li class="cancel"><a data-theme="a" href="#">Cancel</a></li>
		</ul>
	</div><!-- /navbar -->
</div>
