   <div id="selectedDevice" data-role="dialog">
      <div data-role="header"
        data-theme="c"
        data-id="vs_header">
        <h1>Selected Device</h1>
       </div>
       
    <div class="popupMenu" data-role="content"> 
        <p>You are shopping for <b>${selectedDeviceName}</b></p>
        <img class="prodMarquee" src="${selectedDeviceImgURL}" alt="${selectedDeviceName}" height="60px;"/>
        <div class="clear25"></div>
        <a href="/mas/deviceChange.jsp" data-theme="c" data-role="button">Change Device</a>
        <div class="clear10"></div>
        <a data-rel="back" data-theme="d" data-role="button">Continue Shopping</a>
    </div>              