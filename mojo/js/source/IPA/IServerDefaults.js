(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css");
	//this is the web server
	
	mstrmojo.requiresDescs(16,769,761,59,98,255,260,2604,1948,1947,274,278,298,5595,4611,4624,6041,973,8844,
			8845,8846,8847,8848,8859,8850,8851,8852,4531,8262,5788,5789,8441,2057,4618,4617,8184,7628);
	
	mstrmojo.IPA.IServerDefaults = mstrmojo.insert({
		scriptClass : "mstrmojo.Box",
		cssText : "height: 350px; width: 100%;position: relative;background: white;background-color: #FAFAFA;",
		alias : "IntelligenceServerDefaults",
		selected : true,
		n : "Intelligence Server Defaults",
		children : [{
			scriptClass : "mstrmojo.Box",
			id:"IServerLHSBox",
			cssText : "position: absolute; padding: 10px;width: 42%;border-right: 1px;border-right-color: #AAA; border-style: solid;border-top: 0px;border-left: 0px;border-bottom: 0px;",
			children : [
			//Connection preferences Title
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8844,"Connection Preferences"),
				cssText : "font-weight: bold; padding-bottom: 10px"
			},

			//Optons for Connection Preferences
			{
				scriptClass : "mstrmojo.Table",
				cssText : 'width: 100%;padding-bottom: 10px;',
				rows : 7,
				cols : 2,
				children : [{
					slot : "0,0",
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8845,"Connection Mode:") + " "
				}, {
					scriptClass : 'mstrmojo.Pulldown',
					id:"IServerConnectMode",
					slot : "0,1",
					itemField : "n",
					itemIdField : 'n',
					cssText : 'width:140px;height:auto;',
					items : [{
						n : mstrmojo.desc(4531,"Automatic")						
					}, {
						n : mstrmojo.desc(8262,"Manual")						
					}],
					onitemsChange : function() {
						
					},
					onvalueChange : function(mode) {						
						if(mode == 0){
							this.set('value',this.items[0].n);							
							this.set('selectedIndex', 0);
						}
						if(mode == 1){
							this.set('value',this.items[1].n);
							this.set('selectedIndex', 1);
						}
					}
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(16,"Port"),
					slot : "1,0",
					id:"IServerPortLabel"
				}, {
					scriptClass : "mstrmojo.TextBox",
					slot : "1,1",
					id:"IServerPort"
				}, {
					scriptClass : "mstrmojo.Label",
					text:mstrmojo.desc(769,"Initial Pool Size"),
					slot: "2,0",
					id:"IServerInitPoolLabel"

				},{
					scriptClass : "mstrmojo.TextBox",
					slot : "2,1",
					id:"IServerInitPool",
						visible:true
				},{
					scriptClass : "mstrmojo.Label",
					text:mstrmojo.desc(761,"Maximum Pool Size"),
					slot: "3,0"

				},{
					scriptClass : "mstrmojo.TextBox",
					slot : "3,1",
					id:"IServerMaxPool"
				},{
					scriptClass : "mstrmojo.Label",
					text:mstrmojo.desc(59, "Load Balance Factor"),
					slot: "4,0"

				},{
					scriptClass : "mstrmojo.TextBox",
					slot : "4,1",
					id:"IServerLoadBalanceFactor"
				},{
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8846,"Server Busy Timeout"),
					id:"IServerBusyTimeoutText",
					slot: "5,0"
				},{
					scriptClass:"mstrmojo.HBox",
					id:"IServerBusyTimeoutHbox",
					slot: "5,1",
					children:[{
							scriptClass : "mstrmojo.TextBox",					
							id:"IServerBusyTimeout"
						},{
							scriptClass : "mstrmojo.Label",
							text:mstrmojo.desc(98,"second(s)"),
							cssText:"padding-left:5px;"
						 }
					]					
				},{
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(973,"Request Timeout"),
					id:"IServerRequestTimeoutText",
					slot: "6,0"

				},{
					scriptClass:"mstrmojo.HBox",
					id:"IServerRequestTimeoutHbox",
					slot : "6,1",
					children:[
					 {
						scriptClass : "mstrmojo.TextBox",					
					    id:"IServerRequestTimeout"
					 },
					 {
						scriptClass : "mstrmojo.Label",
						text:mstrmojo.desc(98,"second(s)"),		
						cssText:"padding-left:5px;"
					 }
					]
				}]
			},// End of Table
			{
				scriptClass : "mstrmojo.CheckBox",
				label: mstrmojo.desc(8847,"Keep connection alive between Web and Intelligence Server"),
				id:"IServerKeepConnectionAlive",
				checked:false	
			},{
				scriptClass : "mstrmojo.Table",
				cssText : 'width: 100%;padding-top: 10px;',
				id:'IServerSortTable',
				rows : 2,
				cols : 3,
				children : [{
					slot : "0,0",
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8848,"Sort Server List:") + " "
				}, {
					scriptClass : 'mstrmojo.Pulldown',
					id:"IServerSortServerList",
					slot : "0,1",
					itemField : "n",
					itemIdField : 'n',
					cssText : 'width:140px;height:auto;',
					items : [
					    {n : mstrmojo.desc(2057,"None")},
						{n : mstrmojo.desc(8441,"Default")},
						{n : mstrmojo.desc(5788,"By name")}						
					],
					onitemsChange : function() {
					},
					onvalueChange : function(mode) {
						if(mode == 0){
							this.set('value',this.items[0].n);							
							this.set('selectedIndex', 0);
						}
						if(mode == 1){
							this.set('value',this.items[1].n);
							this.set('selectedIndex', 1);
						}
						if(mode == 2){
							this.set('value',this.items[2].n);
							this.set('selectedIndex', 2);
						}
					}
				},{
					slot : "1,0",
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8849,"Sort Project List:") + " "
				}, {
					scriptClass : 'mstrmojo.Pulldown',
					id:"IServerSortProjectList",
					slot : "1,1",
					itemField : "n",
					itemIdField : 'n',
					cssText : 'width:140px;height:auto;',
					items : [
					        {n : mstrmojo.desc(8441,"Default")},
							{n : mstrmojo.desc(5788,"By name")},
							{n : mstrmojo.desc(5789,"By description")}
					],
					onitemsChange : function() {
					},
					onvalueChange : function(mode) {
						if(mode == 1){
							this.set('value',this.items[0].n);							
							this.set('selectedIndex', 0);
						}
						if(mode == 2){
							this.set('value',this.items[1].n);
							this.set('selectedIndex', 1);
						}
						if(mode == 3){
							this.set('value',this.items[2].n);
							this.set('selectedIndex', 2);
						}
					}
				}]
			}]
		}, {
			scriptClass : "mstrmojo.Box",
			cssText : "left: 45%;top:10%;position: absolute; padding: 10px; width:50%;",
			id:"IServerRHSBox",
			visible:true,
			children : [
			//Login preferences Title
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8850,"Login Preferences"),
				cssText : "font-weight: bold;padding-bottom:10px;"

			},
			//now add the table 
			{
				scriptClass : "mstrmojo.Table",
				cssText : 'width: 100%;padding:2px;border: 1px solid; ',
				rows : 10,
				cols : 3,			
					
				//sets next enabled radio to checked if 
				setNextEnabledRadioChecked:function(){				 
						if(mstrmojo.all.StdCheck.checked)
							mstrmojo.all.StdRadio.set('checked',true);
						else if(mstrmojo.all.LDAPCheck.checked)
							mstrmojo.all.LDAPRadio.set('checked',true);
						else if(mstrmojo.all.DBCheck.checked)
							mstrmojo.all.DBRadio.set('checked',true);
						else if(mstrmojo.all.GuestCheck.checked)
							mstrmojo.all.GuestRadio.set('checked',true);
						else if(mstrmojo.all.WindowsCheck.checked)
							mstrmojo.all.WindowsRadio.set('checked',true);
						else if(mstrmojo.all.IntegratedCheck.checked)
							mstrmojo.all.IntegratedRadio.set('checked',true);
						else if(mstrmojo.all.TrustedCheck.checked)
							mstrmojo.all.TrustedRadio.set('checked',true);
				},
				
				//
				//returns true if all 7 radio are disabled (ie enabled = false for all)
				areAllRadioUnChecked:function(){
					if(mstrmojo.all.StdRadio.checked ||mstrmojo.all.LDAPRadio.checked || 
							mstrmojo.all.DBRadio.checked || 
					   mstrmojo.all.GuestRadio.checked || mstrmojo.all.WindowsRadio.checked ||
					   mstrmojo.all.IntegratedRadio.checked || mstrmojo.all.TrustedRadio.checked)
							return false;
					else
						return true;
				},
				
				//returns true if all 7 radio are disabled (ie enabled = false for all)
				areAllRadioDisabled:function(){
					if(mstrmojo.all.StdRadio.enabled ||mstrmojo.all.LDAPRadio.enabled || 
							mstrmojo.all.DBRadio.enabled || 
					   mstrmojo.all.GuestRadio.enabled || mstrmojo.all.WindowsRadio.enabled ||
					   mstrmojo.all.IntegratedRadio.enabled || mstrmojo.all.TrustedRadio.enabled)
							return false;
					else
						return true;
				},
				
				children : [{
					slot : "0,0",
					scriptClass : "mstrmojo.Label",
					text : "&nbsp;" + mstrmojo.desc(255, "Login Mode"),
					cssText : "font-weight: bold; padding-bottom: 10px; color: white; background: gray;"
				}, {
					slot : "0,1",
					scriptClass : 'mstrmojo.Label',
					text: mstrmojo.desc(260, "Enabled"),
					cssText : "font-weight: bold; padding-bottom: 10px; color: white; background: gray;"
				}, {
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(2604,  "Default"),
					slot : "0,2",
					cssText : "font-weight: bold; padding-bottom: 10px; color: white; background: gray;"
				}, {
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(274,  "Standard (username & password)"),
					slot: "2,0"
				},
				{
					scriptClass : "mstrmojo.RadioButton",
					id:"StdRadio",					
					slot : "2,2",
					
					onclick:function(){
						if(this.checked){
							mstrmojo.all.LDAPRadio.set('checked',false);
							mstrmojo.all.DBRadio.set("checked",false);
							mstrmojo.all.GuestRadio.set("checked",false);
							mstrmojo.all.WindowsRadio.set("checked",false);
							mstrmojo.all.IntegratedRadio.set("checked",false);
							mstrmojo.all.TrustedRadio.set("checked",false);
						}
					}
				},
				{
					scriptClass : "mstrmojo.CheckBox",					
					id:"StdCheck",					
					slot : "2,1",
					
					onclick:function(){
						if(this.checked){
							mstrmojo.all.StdRadio.set("enabled",true);							
						}else{
							mstrmojo.all.StdRadio.set("checked",false);
							mstrmojo.all.StdRadio.set("enabled",false);	
							
							this.parent.setNextEnabledRadioChecked();
							
							if(this.parent.areAllRadioDisabled()){
								//set standard login checkbox and radio to checked								
								mstrmojo.all.StdRadio.set("checked",true);
								mstrmojo.all.StdRadio.set("enabled",true);
								mstrmojo.all.StdCheck.set("checked",true);
							}
						}
					}
				},{
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(1947,  "LDAP Authentication"),
					slot: "3,0"

				},{
					scriptClass : "mstrmojo.CheckBox",
					slot : "3,1",
					id:"LDAPCheck",
					
					onclick:function(){
						if(this.checked){
							mstrmojo.all.LDAPRadio.set("enabled",true);							
						}else{
							mstrmojo.all.LDAPRadio.set("checked",false);
							mstrmojo.all.LDAPRadio.set("enabled",false);	
							
							this.parent.setNextEnabledRadioChecked();
							
							if(this.parent.areAllRadioDisabled()){
								//set standard login checkbox and radio to checked								
								mstrmojo.all.StdRadio.set("checked",true);
								mstrmojo.all.StdRadio.set("enabled",true);
								mstrmojo.all.StdCheck.set("checked",true);
							}
						}
					}
				},{
					scriptClass : "mstrmojo.RadioButton",
					id:"LDAPRadio",					
					slot : "3,2",
					
					onclick:function(){
						if(this.checked){
							mstrmojo.all.StdRadio.set('checked',false);
							mstrmojo.all.DBRadio.set("checked",false);
							mstrmojo.all.GuestRadio.set("checked",false);
							mstrmojo.all.WindowsRadio.set("checked",false);
							mstrmojo.all.IntegratedRadio.set("checked",false);
							mstrmojo.all.TrustedRadio.set("checked",false);
						}
					}
				},{
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(1948, "Database Authentication"),
					slot: "4,0"

				},{
					scriptClass : "mstrmojo.CheckBox",
					slot : "4,1",
					id:"DBCheck",
					
					onclick:function(){
						if(this.checked){
							mstrmojo.all.DBRadio.set("enabled",true);
						}else{
							mstrmojo.all.DBRadio.set("checked",false);
							mstrmojo.all.DBRadio.set("enabled",false);
							
							this.parent.setNextEnabledRadioChecked();
							
							if(this.parent.areAllRadioDisabled()){
								// set standard login checkbox and radio to checked								
								mstrmojo.all.StdRadio.set("checked",true);
								mstrmojo.all.StdRadio.set("enabled",true);
								mstrmojo.all.StdCheck.set("checked",true);
							}
						}
					}
				},{
					scriptClass : "mstrmojo.RadioButton",
					slot : "4,2",
					id:"DBRadio",
				
					onclick:function(){
						if(this.checked){
							mstrmojo.all.StdRadio.set('checked',false);
							mstrmojo.all.LDAPRadio.set("checked",false);
							mstrmojo.all.GuestRadio.set("checked",false);
							mstrmojo.all.WindowsRadio.set("checked",false);
							mstrmojo.all.IntegratedRadio.set("checked",false);
							mstrmojo.all.TrustedRadio.set("checked",false);
						}
					}
				},{
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(278, "Guest"),
					slot: "5,0"

				},{
					scriptClass : "mstrmojo.CheckBox",
					slot : "5,1",
					id:"GuestCheck",
					
					onclick:function(){
						if(this.checked){
							mstrmojo.all.GuestRadio.set("enabled",true);
						}else{
							mstrmojo.all.GuestRadio.set("checked",false);
							mstrmojo.all.GuestRadio.set("enabled",false);
							
							this.parent.setNextEnabledRadioChecked();
							
							if(this.parent.areAllRadioDisabled()){
								// set standard login checkbox and radio to checked								
								mstrmojo.all.StdRadio.set("checked",true);
								mstrmojo.all.StdRadio.set("enabled",true);
								mstrmojo.all.StdCheck.set("checked",true);
							}
						}
					}
				},{
					scriptClass : "mstrmojo.RadioButton",
					slot : "5,2",
					id:"GuestRadio",
					onclick:function(){
						if(this.checked){
							mstrmojo.all.StdRadio.set('checked',false);
							mstrmojo.all.LDAPRadio.set("checked",false);
							mstrmojo.all.DBRadio.set("checked",false);
							mstrmojo.all.WindowsRadio.set("checked",false);
							mstrmojo.all.IntegratedRadio.set("checked",false);
							mstrmojo.all.TrustedRadio.set("checked",false);
						}
					}
				},{
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(298, "Windows Authentication"),
					slot: "6,0"

				},{
					scriptClass : "mstrmojo.CheckBox",
					slot : "6,1",
					id:"WindowsCheck",
					onclick:function(){
						if(this.checked){
							mstrmojo.all.WindowsRadio.set("enabled",true);
						}else{
							mstrmojo.all.WindowsRadio.set("checked",false);
							mstrmojo.all.WindowsRadio.set("enabled",false);
							
							this.parent.setNextEnabledRadioChecked();
							
							if(this.parent.areAllRadioDisabled()){
								// set standard login checkbox and radio to checked								
								mstrmojo.all.StdRadio.set("checked",true);
								mstrmojo.all.StdRadio.set("enabled",true);
								mstrmojo.all.StdCheck.set("checked",true);
							}
						}
					}
				},{
					scriptClass : "mstrmojo.RadioButton",
					slot : "6,2",
					id:"WindowsRadio",
					onclick:function(){
						if(this.checked){
							mstrmojo.all.StdRadio.set('checked',false);
							mstrmojo.all.LDAPRadio.set("checked",false);
							mstrmojo.all.DBRadio.set("checked",false);
							mstrmojo.all.GuestRadio.set("checked",false);
							mstrmojo.all.IntegratedRadio.set("checked",false);
							mstrmojo.all.TrustedRadio.set("checked",false);
						}
					}
				},{
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(5595,"Integrated Authentication"),
					slot: "7,0"

				},{
					scriptClass : "mstrmojo.CheckBox",
					slot : "7,1",
					id:"IntegratedCheck",
					
					onclick:function(){
						if(this.checked){
							mstrmojo.all.IntegratedRadio.set("enabled",true);
						}else{
							mstrmojo.all.IntegratedRadio.set("checked",false);
							mstrmojo.all.IntegratedRadio.set("enabled",false);	
							this.parent.setNextEnabledRadioChecked();
							
							if(this.parent.areAllRadioDisabled()){
								// set standard login checkbox and radio to checked								
								mstrmojo.all.StdRadio.set("checked",true);
								mstrmojo.all.StdRadio.set("enabled",true);
								mstrmojo.all.StdCheck.set("checked",true);
							}
						}
					}
				},{
					scriptClass : "mstrmojo.RadioButton",
					slot : "7,2",
					id:"IntegratedRadio",
					onclick:function(){
						if(this.checked){
							mstrmojo.all.StdRadio.set('checked',false);
							mstrmojo.all.LDAPRadio.set("checked",false);
							mstrmojo.all.DBRadio.set("checked",false);
							mstrmojo.all.GuestRadio.set("checked",false);
							mstrmojo.all.WindowsRadio.set("checked",false);
							mstrmojo.all.TrustedRadio.set("checked",false);
						}
					}
				},{
					scriptClass : "mstrmojo.Label",
					text: mstrmojo.desc(4611,"Trusted Authentication Request"),
					slot: "8,0"

				},{
					scriptClass : "mstrmojo.CheckBox",
					slot : "8,1",
					id:"TrustedCheck",
					onclick:function(){
						if(this.checked){
							mstrmojo.all.TrustedRadio.set("enabled",true);
						}else{
							mstrmojo.all.TrustedRadio.set("checked",false);
							mstrmojo.all.TrustedRadio.set("enabled",false);
							
							this.parent.setNextEnabledRadioChecked();
							
							if(this.parent.areAllRadioDisabled()){
								// set standard login checkbox and radio to checked								
								mstrmojo.all.StdRadio.set("checked",true);
								mstrmojo.all.StdRadio.set("enabled",true);
								mstrmojo.all.StdCheck.set("checked",true);
							}
						}
					}
				},{
					scriptClass : "mstrmojo.RadioButton",
					slot : "8,2",
					id:"TrustedRadio",
					onclick:function(){
						if(this.checked){
							mstrmojo.all.StdRadio.set('checked',false);
							mstrmojo.all.LDAPRadio.set("checked",false);
							mstrmojo.all.DBRadio.set("checked",false);
							mstrmojo.all.GuestRadio.set("checked",false);
							mstrmojo.all.WindowsRadio.set("checked",false);
							mstrmojo.all.IntegratedRadio.set("checked",false);
						}
					}
				}]
			},
			//Combo boxes and drop down
			{
				cssText : "padding-top: 20px;",
				scriptClass: "mstrmojo.Box",
				children: [
					{
						scriptClass : "mstrmojo.CheckBox",
						label: mstrmojo.desc(6041,"Override Project Login Mode Settings"),
						id:"IServerOverideProjectLogin"
					}]
			},{
				scriptClass: "mstrmojo.Box",
				children: [
					{
						scriptClass : "mstrmojo.CheckBox",
						label: mstrmojo.desc(8851,"Show login page after user logout"),
						id:"IServerShowLoginAfterLogout"
					}]
			},{
					scriptClass: "mstrmojo.HBox",
				children: [
				{
					scriptClass: "mstrmojo.Label",
					text: mstrmojo.desc(8852,"Show project List")
				},
				{
					scriptClass : 'mstrmojo.Pulldown',
					id:"IServerShowProjectList",
					itemField : "n",
					itemIdField : 'n',
					cssText : 'width:140px;height:auto;',
					items : [
					    {n : "Before Login"}, //0 from task
					    {n : "After Login"},  //1 from task						
					],
					onitemsChange : function() {
					},
					onvalueChange : function(mode) {
						if(mode == 0){
							this.set('value',this.items[0].n);							
							this.set('selectedIndex', 0);
						}
						if(mode == 1){
							this.set('value',this.items[1].n);
							this.set('selectedIndex', 1);
						}
					}
				}]},
				]
		},
		{
			scriptClass: "mstrmojo.HBox",
			id:'TrustedAuthProvidersHbox',
			cssText : "left: 45%;top:0%;position: absolute; margin: 10px;",
			children: [
			      {
			    	  scriptClass: "mstrmojo.Label",			    	  
			    	  text:mstrmojo.desc(4624,  "Trusted Authentication Providers")
			      },
			      {
			    	  scriptClass : 'mstrmojo.Pulldown',
			    	  id:"IServerTrustedAuthPullDown",
			    	  itemField : "n",
			    	  itemIdField : 'n',
			    	  cssText : 'width:140px;height:auto;',					    	  
			    	  items : [
			    	           {n : mstrmojo.desc(4618,"Tivoli")},  //1 from task
			    	           {n : mstrmojo.desc(4617,"SiteMinder")}, //2 from task
			    	           {n : mstrmojo.desc(7628,"Custom SSO")}, //3 from task
			    	           {n : mstrmojo.desc(8184,"Oblix")}  //4 from task
			    	           ],
			    	  onitemsChange : function() {
			          },
			          onvalueChange : function(mode) {
			        	  if(mode == 1){
			        		  this.set('value',this.items[0].n);							
			        		  this.set('selectedIndex', 0);
			        	  }
			        	  if(mode == 2){
			        		  this.set('value',this.items[1].n);
			        		  this.set('selectedIndex', 1);
			        	  }
			        	  if(mode == 3){
			        		  this.set('value',this.items[2].n);
			        		  this.set('selectedIndex', 2);
			        	  }
			        	  if(mode == 4){
			        		  this.set('value',this.items[3].n);
			        		  this.set('selectedIndex', 3);
			        	  }
			          }
			       }]
		}
		]
	});

})();
