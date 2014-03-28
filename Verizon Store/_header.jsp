<dsp:page>
<dsp:importbean bean="/OriginatingRequest" var="originatingRequest"/>
<dsp:getvalueof var="title" vartype="java.lang.String" value="${originatingRequest.title}" /> 

<title>
	<c:choose>
	<c:when test="${!empty title}">
		<c:out value="${title}&nbsp;|&nbsp;"/>
    </c:when>
    </c:choose>
	Verizon Wireless Mobile Accessories Store
</title>
<meta name="description" content="">    <!-- for SEO -->
<meta charset="utf-8" />

<meta name="HandheldFriendly" content="True">   <!-- for old mobile device -->
<meta name="MobileOptimized" content="320"/>    <!-- for old mobile device -->
<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes">

<!-- Mobile IE allows us to activate ClearType technology for smoothing fonts for easy reading -->
<meta http-equiv="cleartype" content="on">

<link rel="apple-touch-icon" href="/mas/css/images/icon.jpg"/>

<link rel="stylesheet" href="/mas/css/structure.css" />
<link rel="stylesheet" href="/mas/css/vzw.min.css" />
<link rel="stylesheet" href="/mas/css/common.css" />

<script src="/mas/scripts/jquery.js"></script> 
<script src="/mas/scripts/jquery.mobile-1.2.0.min.js"></script>
<script src="/mas/scripts/jquery.validate.js"></script> 
<script src="/mas/scripts/common.js"></script>
<script src="/mas/scripts/checkout.js"></script>
<script src="/mas/scripts/endeca-auto-suggest.js"></script>
<script src="/mas/scripts/catalyst.js"></script>
<script src="//verizonwireless.ugc.bazaarvoice.com/static/6543-en_us/bvapi.js"></script>

<script>
	   var Sitecatalyst, prodName;
       function setCookie(c_name,value,exdays) {
       var exdate=new Date();
       exdate.setDate(exdate.getDate() + exdays);
       var c_value=escape(exdate.getTime()) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
       var cookieName=getCookie('masagent');
       if(cookieName==null){
       document.cookie=c_name + "=" + c_value;
       }

       }
       function getCookie(c_name)
       {
       var i,x,y,ARRcookies=document.cookie.split(";");
       for (i=0;i<ARRcookies.length;i++)
         {
         x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
         y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
         x=x.replace(/^\s+|\s+$/g,"");
         if (x==c_name)
              {
              return unescape(y);
              }
         }
       }
         setCookie('masagent','store','30');
       </script>


</dsp:page>
