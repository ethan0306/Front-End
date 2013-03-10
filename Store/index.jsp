<!DOCTYPE html>

<html lang="en">
<head>
<%@include file="_header.jsp" %>
</head>

<div id="deviceItemList2" data-role="dialog" data-close-btn-text="Back to Manufacturer List">
	<div data-role="header"
		data-theme="c"
		data-id="vs_header">
		<h1>Identify your Device</h1>
	   </div>
	<div class="popupMenu" data-role="content">
		<ul data-role="listview" data-filter="true">
              <dsp:droplet name="/mas/droplet/MASDeviceDetectionDroplet">
				<dsp:oparam name="output">
					<dsp:droplet name="/atg/dynamo/droplet/ForEach">
						<dsp:param param="masDetectedDeviceList" name="array" />
						<dsp:param value="product" name="elementName" />
						<dsp:oparam name="empty">
							<script>
                               window.location = "/mas/deviceChange.jsp";
			                </script>
						</dsp:oparam>
						<dsp:oparam name="outputStart">
							<dsp:getvalueof var="size" param="size" />
						</dsp:oparam>

						<dsp:oparam name="output">
							<dsp:getvalueof id="image" param="product.image"
								idtype="java.lang.String" />
							<dsp:getvalueof id="prodID" param="product.deviceID"
								idtype="java.lang.String" />
							<c:if test="${size eq 1}">
								<script>
                                   window.location = "categories?deviceId=<c:out value='${prodID}'/>&Ntk=accessory.compatibleDevices.repositoryId&Ntt=<c:out value='${prodID}'/>";
			                    </script>
				           </c:if>
					    <li><a href='categories?deviceId=<c:out value='${prodID}'/>&Ntk=accessory.compatibleDevices.repositoryId&Ntt=<c:out value='${prodID}'/>'>
									<img src='<c:out value='${image}'/>' />
									<h2>
										<dsp:valueof param="product.deviceName" valueishtml="true" />
									</h2>
					    </a></li>
						</dsp:oparam>
					</dsp:droplet>
				</dsp:oparam>
			</dsp:droplet>
		</ul>
	</div>
</div>
<!-- #deviceItemList -->


