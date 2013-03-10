<!DOCTYPE html>
<%@ include file="/includes/taglibs.jspf"%>
<%@ page import="atg.servlet.*"%>
<dsp:importbean bean="/atg/userprofiling/ProfileFormHandler" />
<dsp:importbean bean="/atg/dynamo/droplet/ErrorMessageForEach" />
<dsp:importbean bean="/atg/dynamo/droplet/IsEmpty" />
<html lang="en">

<head>
   <%@include file="_header.jsp" %>
</head>
<body>

	<div id="login" data-role="page" data-theme="c" data-title="Checkout">

		<div data-role="header" data-theme="c" data-position="fixed"
			data-id="vs_header">
			<h1>Checkout</h1>
			<a href="/mas/shoppingCart.jsp" data-icon="back" data-theme="d"
				data-iconpos="notext">Back</a>
		</div>
		<!-- header -->

		<div id="contentArea" data-role="content">
		   <div class="login-container">
				<dsp:form id="log_as_user" action="userOpt.jsp" class="login-content" method="post">
					<dsp:droplet name="ErrorMessageForEach">
						<dsp:param bean="ProfileFormHandler.formExceptions" name="exceptions" />
						<dsp:oparam name="output">
							<li><dsp:valueof param="message" /></li>
						</dsp:oparam>
					</dsp:droplet>
							<div class="login-field userId">
								<dsp:input class="TextBox Text" type="search" required="true" bean="ProfileFormHandler.value.login" placeholder="My Verizon ID or Device Number" maxlength="60" size="25"    />
							</div>
							<div class="login-field pw">
								<dsp:input class="TextBox Password" required="true"  bean="ProfileFormHandler.value.password" placeholder="Your Password" maxlength="30" size="20" type="password" />
							</div>
							<div class="user_login">
								<dsp:input class="button" bean="ProfileFormHandler.login" type="submit" value="Sign In" />
								<dsp:input bean="ProfileFormHandler.loginSuccessURL" type="hidden" value="userOpt.jsp" />
					            <dsp:input bean="ProfileFormHandler.loginErrorURL" type="hidden" value="login.jsp" />
							</div>
				</dsp:form>
			   </div>
			
			  <dsp:form id="log_as_guest" action="/mas/shipInfo.jsp" class="login-content" method="post">
						<div class="val_row">
							<div class="login-field email">
							    <input id="_Email" type="email" name="_Email" class="TextBox Text" required="true"  placeholder="Your Email Address">
							</div>
						</div>
						<div class="guest_login">
							 <input id="guest_submit" class="button" type="submit" value="Checkout As Guest">
						</div>
			  </dsp:form>
				
		</div>

	</div>

</body>
</html>
