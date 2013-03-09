
(function(){


	mstrmojo.IPA.LoginPopup = mstrmojo.insert({
    scriptClass: "mstrmojo.Popup",
    id: "loginPopup",
    cssClass: "IPAPopup",
    slot: "LoginBox",
    left: "25%",
    servername: "",
    title: "",
    errormessage: "",
    children:[ { scriptClass: "mstrmojo.Table",
                id: "loginBox",
                alias: "loginBox",
                cssClass: "IPAPopup-loginBox",
                cellPadding: 2,
                cols: 2,
                rows: 5,
                children:[
                          {
                              scriptClass: "mstrmojo.Label",
                              cssText: "width: 80px; margin:0px",
                              text: "I-Server:",
                              bindings:{
                                  text: "this.parent.parent.title"
                              },
                              slot: "0,0"
                          },
                          {
                              scriptClass: "mstrmojo.Label",
                              alias: "IServer",
                              cssText: "width:230px; margin:0px",
                              showItemTooltip: true,
                              bindings:{
                                  text: "this.parent.parent.servername"
                              },
                              slot: "0,1"
                          },
                          {
                              scriptClass: "mstrmojo.Label", // This will be
																// shown when
																// there is only
																// one project
                              cssClass: "mobileConfig-loginBox-projectLabel",
                              slot: "0,1"
                          },
                          {
                              scriptClass: "mstrmojo.Label",
                              cssText: "width: 80px; margin:0px",
                              text: mstrmojo.desc(1161), // "User name:"
                              slot: "1,0"
                          },
                          {
                              scriptClass: "mstrmojo.TextBox",
                              cssText: "width:220px; margin:0px",
                              alias: "uid",
                              slot: "1,1"
                          },
                          {
                              scriptClass: "mstrmojo.Label",
                              cssText: "width: 80px; margin:0px",
                              text: mstrmojo.desc(1162), // "Password:"
                              slot: "2,0"
                          },
                          {
                        	  slot: "2,1",
                              scriptClass: "mstrmojo.TextBox",
                              cssText: "width:220px; margin:0px",
                              type: "password",
                              alias: "password"
                          },
                          {
                              slot: "3,1",
                              scriptClass: "mstrmojo.HTMLButton",
                              alias: "loginButton", 
                              text: mstrmojo.desc(4020), // "Login"
                              cssText: "margin-left: 20px;",
                              cssClass: "IPA-popupButton",
                              onclick: function(){
                        	  //try logging in with the supplied credentials
                        	  CR_LOGIN(this.parent.uid.value,this.parent.password.value);
                        	  
                              }
                          },
                          {
                              slot: "3,1",
                              scriptClass: "mstrmojo.HTMLButton",
                              cssText: "margin-left: 35px;", 
                              cssClass: "IPA-popupButton",
                              text: mstrmojo.desc(221), // "Cancel"
                              onclick: function(){                        	  
                        	  	  this.parent.parent.set('errormessage',"");
                                  this.parent.parent.close();
                              }
                          },
                          {
                              slot: "4,0",
                              scriptClass: "mstrmojo.WaitIcon",
                              alias: "waitIcon",
                              id:"loginPopUpWaitIcon",
                              cssClass: "IPAPopup-waitIcon"
                          },
                          {
                              slot: "4,1",
                              scriptClass: "mstrmojo.Label",
                              alias: "errorLabel",
                              bindings:{
                              text: "this.parent.parent.errormessage"
                            }
                          }
                ]}
],
    onOpen: function(){
    },
    onmodeChange: function(){
    },
    onClose: function(evt){
    },
    // The popup is a shared widget, so we need to override destroy/unrender to
	// prevent the garbage collection.
    destroy: function(){
        // IE HACK: 1) add the domNode to the document body to avoid being
		// recycled,
        // 2) change the value of the lastOpener for the future use.
        document.body.appendChild(this.domNode);
        this.lastOpener = {popupRef:{domNode:this.domNode}};
    },
    unrender: function(){}
    });
    
    
})();