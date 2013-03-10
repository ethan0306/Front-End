<dsp:importbean bean="/atg/commerce/ShoppingCart" />
<dsp:importbean bean="/atg/dynamo/droplet/Switch"/>


<dsp:droplet name="/mas/commerce/droplet/RetrieveOrderDroplet">
	<dsp:oparam name="output">
	</dsp:oparam>
</dsp:droplet>
	
<dsp:droplet name="Switch">
	<dsp:param name="value" bean="ShoppingCart.currentEmpty" />
	<dsp:oparam name="true">
		 <li><a class="ui-disabled"
                    data-role="button"
                    data-icon="arrow-r"
                    >Cart</a></li>
                    <li><a class="ui-disabled" 
                    data-role="button"
                    data-icon="arrow-r"
                    >Checkout</a></li>					
	</dsp:oparam>
	<dsp:oparam name="default">	
		<li><a href="/mas/shoppingCart.jsp" 
                    data-role="button"
                    data-icon="arrow-r"
                    >Cart<div class="number_in_cart"><dsp:valueof bean="/atg/commerce/ShoppingCart.current.totalCommerceItemCount" /></div></a></li>
                    <li><a href="/mas/login.jsp" 
                    data-role="button"
                    data-icon="arrow-r"
                    >Checkout</a></li>
	</dsp:oparam>
</dsp:droplet> 

