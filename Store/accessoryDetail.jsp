<dsp:importbean bean="/atg/dynamo/droplet/Switch" />
<dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet" />
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter" />
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter" />
<dsp:importbean bean="/atg/userprofiling/Profile" />
<dsp:importbean bean="/mas/commerce/order/purchase/CartFormHandler" />
<dsp:importbean bean="/atg/dynamo/Configuration" />
<dsp:importbean bean="/atg/dynamo/droplet/ForEach" />
<dsp:importbean bean="/atg/commerce/ShoppingCart" />

<dsp:droplet name="/atg/commerce/catalog/SKULookup">
<dsp:param param="id" name="id" />


<dsp:oparam name="output">	



    <li class="myDevice">
	
	<dsp:droplet name="/atg/commerce/catalog/ProductLookup">
    		<dsp:param name="id" value="${sessionScope.selectedDeviceId}" />
    		<dsp:param name="itemDescriptor" value="device" />
    		<dsp:param value="device" name="elementName"/>
    		<dsp:oparam name="output">
        		<dsp:getvalueof param="device.miniImage.url" var="imgUrl"/>
        		<dsp:getvalueof param="device.displayName" var="deviceName"/>
       		 <span>Compatible with</span>
        		<span class="deviceName">${deviceName}<img src="${imgUrl}" alt="${deviceName}" height="25px;"/></span>
   		</dsp:oparam>
	</dsp:droplet>
    </li>

<dsp:droplet name="/atg/dynamo/droplet/ForEach">
					<dsp:param param="element.parentProducts" name="array" />
					<dsp:param value="product" name="elementName" />
					<dsp:oparam name="output">
						<dsp:getvalueof param="product.wmsProductId" var="accid" />
                                          <dsp:getvalueof param="product.longDescription" var="longDescription" />

					</dsp:oparam>
				</dsp:droplet>
    <dsp:form id="cart" action="" method="post" name="testForm">
		<div class="prodInfo">
			<img class="prodMarquee" src='<dsp:valueof param="element.thumbnailimage.url"/>'/>
			<div class="secondRow">
				<dsp:select bean="CartFormHandler.quantity"  priority="10" nodefault="false" data-mini="true" data-native-menu="false">
  					<dsp:option value="1">1</dsp:option>
  					<dsp:option value="2">2</dsp:option>
  					<dsp:option value="3">3</dsp:option>
				</dsp:select>	
                <dsp:getvalueof param="element.dynamicattributes.rating" var="rating"/>	
				<dsp:getvalueof param="element.listPrice" var="price"/>
                 <c:if test="${rating eq 'N'}">
				  <c:set var="rating" value="0"/>
                 </c:if>				 
				<div class="starRating">
					<div class="rate_<fmt:formatNumber value="${rating}" maxFractionDigits="0"/>"></div>
				</div>
				
				 
			</div>
			<div class="prodPrice"><dsp:valueof param="element.listPrice" converter="currency" /></div>
			<dsp:input bean="CartFormHandler.productId" paramvalue="element.parentProducts" type="hidden" />
			<dsp:input bean="CartFormHandler.siteId" paramvalue="siteId" type="hidden" />
			<dsp:input bean="CartFormHandler.catalogRefIds" paramvalue="element.repositoryId" type="hidden" />
			<dsp:input bean="CartFormHandler.addItemToOrderSuccessURL" type="hidden" value="shoppingCart.jsp" />
			<dsp:input bean="CartFormHandler.addItemToOrder" type="SUBMIT" class="addToCart"  data-role="button" data-theme="d" data-icon="plus" value="Add to Cart" title="Add to Cart"/>
				 <dsp:droplet name="/atg/dynamo/droplet/ForEach">
					<dsp:param param="element.parentProducts" name="array" />
					<dsp:param value="product" name="elementName" />
					<dsp:oparam name="output">
						<dsp:getvalueof param="product.wmsProductId" var="accid" />
                                          <dsp:getvalueof param="product.longDescription" var="longDescription" />

					</dsp:oparam>
				</dsp:droplet>

                            <div class="prodDesp">
					<h3><dsp:valueof param="element.displayName" valueishtml="true" /></h3>
					<p>${longDescription}</p>
				</div>
			
			<a id="custRev" href="${pageContext.request.contextPath}/customerReview.jsp"  class="addToCart" data-transition="pop" data-rel="dialog"
              data-role="button" data-theme="c"  title="Customer Review">Customer Review
            </a>	
			<script>
				var acd="${accid}";
				Sitecatalyst.accessorySelected="${deviceName}";
				Sitecatalyst.setProduct(Sitecatalyst.categorySelected, "${deviceName}", 1, "${price}")
			</script>

		</div>
		<dsp:include src="_recommendation.jsp" flush="true" />
	</dsp:form>



</dsp:oparam>
</dsp:droplet>	


