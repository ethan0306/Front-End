<!DOCTYPE html>

<html lang="en">
<head>
<%@include file="_header.jsp" %>
</head>

<body>

<div id="deviceList" data-role="page" data-theme="c"
    data-title="Select a Device">

    <div data-role="header" data-theme="c"
        data-id="vs_header">
        <h1>Select a Device</h1>
    </div>

    <div data-role="content">
        <div data-role="collapsible-set" data-inset="true">
            <ul data-role="listview" data-inset="true">
                <dsp:getvalueof id="catId" param="id">
                    <c:if test="${empty catId}">
                        <dsp:param name="itemId" value="cat100002" />
                    </c:if>
                </dsp:getvalueof>
   
                <dsp:droplet name="/atg/commerce/catalog/CategoryLookup">
                    <dsp:param param="itemId" name="id" />
                    <dsp:oparam name="output">
                        <dsp:droplet name="/atg/dynamo/droplet/ForEach">
                            <dsp:param param="element.fixedChildCategories" name="array" />
                            <dsp:param value="catalog" name="elementName" />
                            <dsp:oparam name="output">
                                <dsp:getvalueof id="catIdVal" param="catalog.Id"
                                    idtype="java.lang.String" />
                                <li><a
                                    href='/mas/deviceItemList.jsp?id=<c:out value='${catIdVal}'/>'
                                    data-transition="pop" data-rel="dialog"><dsp:valueof
                                            param="catalog.displayName" valueishtml="true" /></a></li>

                            </dsp:oparam>
                        </dsp:droplet>
                    </dsp:oparam>
                </dsp:droplet>
            </ul>
        </div>
    </div>
</div>

</body>
</html>

