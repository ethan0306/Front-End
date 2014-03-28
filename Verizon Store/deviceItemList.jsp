<%@ include file="/includes/taglibs.jspf"%>
 <%@ page import="atg.servlet.*"%>
 
<div id="deviceItemList" data-role="dialog">
      <div data-role="header"
		data-theme="c"
		data-id="vs_header">
		<h1>Find your Device</h1>
	   </div>
	   
	<div class="popupMenu" data-role="content">	
		<ul data-role="listview" data-filter="true">
   			<dsp:droplet name="/atg/commerce/catalog/CategoryLookup">
					<dsp:param param="id" name="id" />
					<dsp:oparam name="output">
						<dsp:droplet name="/atg/dynamo/droplet/ForEach">
							<dsp:param param="element.childProducts" name="array" />
							<dsp:param value="product" name="elementName" />

							<dsp:oparam name="output">
								<dsp:getvalueof id="image" param="product.miniImage.url" idtype="java.lang.String"/>
								<dsp:getvalueof id="prodID" param="product.Id" idtype="java.lang.String"/>
                                <li><a href='categories?deviceId=<c:out value='${prodID}'/>&Ntk=accessory.compatibleDevices.repositoryId&Ntt=<c:out value='${prodID}'/>'>
				<img src='<c:out value='${image}'/>'/>
				<h2><dsp:valueof param="product.displayName" valueishtml="true" /></h2>
			</a></li>
							</dsp:oparam>
						</dsp:droplet>
					</dsp:oparam>
				</dsp:droplet>
		</ul>
	</div>				
</div><!-- #deviceItemList -->


