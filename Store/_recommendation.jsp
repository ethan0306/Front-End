<dsp:importbean bean="/atg/commerce/pricing/priceLists/PriceDroplet" />
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyFormatter" />
<dsp:importbean bean="/atg/dynamo/droplet/CurrencyConversionFormatter" />
<dsp:droplet name="/mas/commerce/droplet/MASItemsBySaleOptions">
     		<dsp:param name="skuId" param="id"/>
    		<dsp:oparam name="outputStart">
<div class="recommendation">
<div class="title">Your Recommendations</div>
<div class="itemsWrapper"> 
</dsp:oparam>
     		<dsp:oparam name="output">
	
				<div class="items">
			   <div class="image">
				<img class="prodRating" src="<dsp:valueof param="element.thumbnailimage.url"/>"></img>
			   </div>
			   <div class="itemName"><dsp:valueof param="element.displayName" valueishtml="true" /></div>
			   <dsp:droplet name="/atg/commerce/catalog/SKULookup"> 
			   <dsp:param name="elementName" value="skuitem"/>
			   <dsp:param param="id" name="id" />
			   <dsp:oparam name="output">	
                                  <dsp:getvalueof param="skuitem.dynamicattributes.rating" var="rating"/>	
                 		  	<c:if test="${rating eq 'N'}">
				  		<c:set var="rating" value="0"/>
                  		  	</c:if>				 
				  	<div class="starRating">
						<div class="rate_<dsp:getvalueof param="skuitem.rating" var="rating"/>"></div>
				  	</div>
					<div class="prodPrice">
    						<dsp:valueof param="skuitem.listPrice" converter="currency" />
					</div>
			    </dsp:oparam>
			    </dsp:droplet>
			</div>

     		</dsp:oparam>
     		<dsp:oparam name="empty">


	</dsp:oparam>
     		<dsp:oparam name="error"></dsp:oparam>    
     		<dsp:oparam name="outputEnd">
   </div>     
</div>

             </dsp:oparam> 
  	</dsp:droplet>
	



