(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css");
	mstrmojo.requiresDescs(3997,6075,1161,3991,3994,2706,3443,2707,2708,3992,8853,8854,8858,8855,8856,8857,
			3524,2666,2667,2668,2669,2709,2710,2711,2712);
	
	//this is the web server

	mstrmojo.IPA.DiagnosticsConfiguration = mstrmojo.insert({
		scriptClass : "mstrmojo.Box",
		cssText : "height: 480px; width: 100%;position: relative;background: white;background-color:#FAFAFA;",
		alias : "Diagnostics",
		selected : true,
		n : "Diagnostics",
		children : [{
			scriptClass : "mstrmojo.Box",
			cssText : "position: absolute; padding: 10px;width: 42%;",
			children : [
			//MicroStrategy Web Log Setup
			{
				scriptClass : "mstrmojo.HBox",
				children: [{
						scriptClass : "mstrmojo.RadioButton",
						id:"DiagnosticsWebLogRadio",
						
						onclick:function(){
							if(this.checked){
								mstrmojo.all.DiagnosticsCustomLogRadio.set('checked',false);
								mstrmojo.all.DiagnosticsAdvLogger.set('enabled',true);
								mstrmojo.all.DiagnosticsXMLAPIRadio.set('enabled',true);
            		  			mstrmojo.all.DiagnosticsPackageRadio.set('enabled',true);
							}
        				}
					},
					{
						scriptClass : "mstrmojo.Label",
						text : mstrmojo.desc(8853,"MicroStrategy Web Log Setup"),
						cssText : "font-weight: bold;"
				}]
				
			},
			//Optons for Web Log Setup
			{
				scriptClass : "mstrmojo.Table",
				cssText : 'width: 100%;padding: 10px 0 10px 30px;',
				rows : 4,
				cols : 2,
				children : [{
					slot : "0,0",
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8858,"Logging Level") + ": "
				}, {
					scriptClass : 'mstrmojo.Pulldown',
					id:"DiagnosticsLogPullDown",
					slot : "0,1",
					itemField : "n",
					itemIdField : 'n',
					cssText : 'width:140px;height:auto;',
					items : [
					         {
						n : mstrmojo.desc(2668,"OFF") //OFF in task
					},{
						n : mstrmojo.desc(2666,"Errors")   //SEVERE in task
					}, {
						n : mstrmojo.desc(2667,"Warnings") //WARNING in task
					},{
						n : mstrmojo.desc(2669,"Messages") //INFO in task
					}
					],
					onitemsChange : function() {
					},
					onvalueChange : function(mode) {
						if(mode === "OFF"){
							this.set('value',this.items[0].n);							
							this.set('selectedIndex', 0);
						}
						if(mode === "SEVERE"){
							this.set('value',this.items[1].n);
							this.set('selectedIndex', 1);
						}
						if(mode === "WARNING"){
							this.set('value',this.items[2].n);							
							this.set('selectedIndex', 2);
						}
						if(mode === "INFO"){
							this.set('value',this.items[3].n);
							this.set('selectedIndex', 3);
						}
					},
					bindings:{
						enabled:"mstrmojo.all.DiagnosticsWebLogRadio.checked"
					}
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8854,"Log File Directory"),
					slot : "1,0"
				}, {
					scriptClass : "mstrmojo.TextBox",
					id:"DiagnosticsLogPath",
					slot : "1,1",
					
					bindings:{
						enabled:"mstrmojo.all.DiagnosticsWebLogRadio.checked"
					}
				}, {
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8855,"Max Output File Size"),
					slot: "2,0"
				},{
					scriptClass:"mstrmojo.HBox",
					slot : "2,1",
					children:[
					    {
					    	scriptClass : "mstrmojo.TextBox",
					    	id:"DiagnosticsMaxOutputFileSize",					    	
					    	bindings:{
					    		enabled:"mstrmojo.all.DiagnosticsWebLogRadio.checked"
					    	}
					    },
					    {
							scriptClass : "mstrmojo.Label",
							text:mstrmojo.desc(6075,"bytes"),
							cssText:"padding-left:5px;"
						}]
				},
				{
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8856,"Max Output Files"),
					slot: "3,0"

				},{
					scriptClass : "mstrmojo.TextBox",
					id:"DiagnosticsMaxOutPutFiles",
					slot : "3,1",
					bindings:{
						enabled:"mstrmojo.all.DiagnosticsWebLogRadio.checked"
					}
				}
				]
			}// End of Table		
			]
		}, {
			scriptClass : "mstrmojo.Box",
			cssText : "left: 45%;position: absolute; padding: 40px 10px 10px 10px; width:50%",
			children : [
			//Advanced Logger Options
			{
				scriptClass : "mstrmojo.HBox",
				children: [{
						scriptClass : "mstrmojo.CheckBox",
						id:"DiagnosticsAdvLogger",
						
						onclick:function(){
							if(!this.checked){
									mstrmojo.all.DiagnosticsPackageRadio.set('checked',false);
									mstrmojo.all.DiagnosticsXMLAPIRadio.set('checked',false);            							
							}else{
								mstrmojo.all.DiagnosticsXMLAPIRadio.set('checked',true);
							}
						}
					},
				{
						scriptClass : "mstrmojo.Label",
						text:mstrmojo.desc(3997,"Advanced Logger Options"),
						cssText : "font-weight: bold;"
				}]
				},{
					scriptClass : "mstrmojo.Box",
					cssText : "padding: 5px 0 0 15px;",
					children: [{
						scriptClass : "mstrmojo.HBox",
						children: [{
								scriptClass : "mstrmojo.RadioButton",
								id:"DiagnosticsXMLAPIRadio",
								onclick:function(){
            						if(this.checked){
            							mstrmojo.all.DiagnosticsPackageRadio.set('checked',false);
            							mstrmojo.all.DiagnosticsAdvLogger.set('checked',true);            							
            						}
        						}	
							},
							{
								scriptClass : "mstrmojo.Label",
								text : mstrmojo.desc(8857,"XML API-Logger")
						}]
					},{
						scriptClass : "mstrmojo.HBox",
						cssText : "margin-left: 20px",
						children: [{
								scriptClass : "mstrmojo.Label",
								cssText : "width: 70px;",
								text:mstrmojo.desc(1161, "User Name: ")
							},
							{
								scriptClass : "mstrmojo.TextBox",
								id:"DiagnosticsXMLUserName",
								bindings:{
									enabled:"mstrmojo.all.DiagnosticsXMLAPIRadio.checked"
								}	
						}]
					}
					
					]
					
				},{
					scriptClass : "mstrmojo.Box",
					cssText : "padding: 5px 0 0 15px;",
					children: [{
						scriptClass : "mstrmojo.HBox",
						children: [{
								scriptClass : "mstrmojo.RadioButton",
								id:"DiagnosticsPackageRadio",
								onclick:function(){
    								if(this.checked){
    									mstrmojo.all.DiagnosticsXMLAPIRadio.set('checked',false);
    									mstrmojo.all.DiagnosticsAdvLogger.set('checked',true);
    								}
								}	
							},
							{
								scriptClass : "mstrmojo.Label",
								text:mstrmojo.desc(3991, "Multiple/Other Package Logging")
						}]
					},
					{
						scriptClass: "mstrmojo.VBox",
						cssText : "width: 100%",
						children: [					{
						scriptClass : "mstrmojo.HBox",
						cssText : "margin-left: 20px",
						children: [{
								scriptClass : "mstrmojo.Label",
								cssText : "width: 70px;",
								text:mstrmojo.desc(3992, "Package(s): ")
							},
							{
								scriptClass : "mstrmojo.TextBox",
								id:"DiagnosticsPackages",
								bindings:{
									enabled:"mstrmojo.all.DiagnosticsPackageRadio.checked"
								}
								
						}]
					},{
						scriptClass : "mstrmojo.HBox",
						cssText : "margin-left: 20px",
						children: [{
								scriptClass : "mstrmojo.Label",
								cssText : "width: 70px;",
								text:mstrmojo.desc(1161, "User Name: ")
							},
							{
								scriptClass : "mstrmojo.TextBox",
								id:"DiagnosticsUserName",
								bindings:{
									enabled:"mstrmojo.all.DiagnosticsPackageRadio.checked"
								}
						}]
					},{
						scriptClass : "mstrmojo.HBox",
						cssText : "margin-left: 20px",
						children: [{
							cssText : "width: 70px;",
								scriptClass : "mstrmojo.Label",
								text:mstrmojo.desc(3994, "Pattern: ")
							},
							{
								scriptClass : "mstrmojo.TextBox",
								id:"DiagnosticsPattern",
								bindings:{
									enabled:"mstrmojo.all.DiagnosticsPackageRadio.checked"
								}
						}]
					},{
						scriptClass : "mstrmojo.HBox",
						cssText : "margin-left: 20px",
						children: [{
								scriptClass : "mstrmojo.Label",
								cssText : "width: 70px;",
								text: mstrmojo.desc(8858,"Logging Level")
							},
							{
					scriptClass : 'mstrmojo.Pulldown',
					id:"DiagnosticsPackageLevel",
					itemField : "n",
					itemIdField : 'n',
					cssText : 'width:140px;height:auto;',
					items : [{
						n : mstrmojo.desc(2668,"OFF") //OFF in task
					},{
						n : mstrmojo.desc(2666,"Errors")   //SEVERE in task
					}, {
						n : mstrmojo.desc(2667,"Warnings") //WARNING in task
					},{
						n : mstrmojo.desc(3524,"All") //ALL in task
					}],
					
					bindings:{
						enabled:"mstrmojo.all.DiagnosticsPackageRadio.checked"
					},
					onitemsChange : function() {
					},
					onvalueChange : function(mode) {
						if(mode === "OFF"){
							this.set('value',this.items[0].n);							
							this.set('selectedIndex', 0);
						}
						if(mode === "SEVERE"){
							this.set('value',this.items[1].n);
							this.set('selectedIndex', 1);
						}
						if(mode === "WARNING"){
							this.set('value',this.items[2].n);							
							this.set('selectedIndex', 2);
						}
						if(mode === "ALL"){
							this.set('value',this.items[3].n);
							this.set('selectedIndex', 3);
						}
					}
					}]
					}
						
						]
						
					}
					]
					
				}]
				
		},{
			scriptClass : "mstrmojo.Box",
			cssText : "position:absolute;top:250px;padding: 10px;width: 95%;border-top: 1px;border-top-color: #AAA;border-bottom: 0px; border-bottom-color: #AAA;border-style: solid;border-right: 0px;border-left: 0px;",
			children : [
			//Custom Web Log Setup
			{
				scriptClass : "mstrmojo.HBox",
				children: [{
						scriptClass : "mstrmojo.RadioButton",
						id:"DiagnosticsCustomLogRadio",
						
						onclick:function(){
            				if(this.checked){
            					mstrmojo.all.DiagnosticsWebLogRadio.set('checked',false);
            					 
            		  			 mstrmojo.all.DiagnosticsAdvLogger.set('checked',false);
            		  			 mstrmojo.all.DiagnosticsAdvLogger.set('enabled',false);
            		  			 
            		  			 mstrmojo.all.DiagnosticsPackageRadio.set('checked',false);
            		  			 mstrmojo.all.DiagnosticsPackageRadio.set('enabled',false);
            		  			
            		  			 mstrmojo.all.DiagnosticsXMLAPIRadio.set('checked',false);
            		  			 mstrmojo.all.DiagnosticsXMLAPIRadio.set('enabled',false);
            				}
        				}
					},
					{
						scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8859,"Custom MicroStrategy Web Log Setup"),
					cssText : "font-weight: bold;"
				}]
			},		//Custom Web Log Setup
			{
				scriptClass : "mstrmojo.HBox",
				cssText: "margin:10px",
				children: [{
						scriptClass : "mstrmojo.Label",
						text: mstrmojo.desc(8860,"Custom Setup File Path:") + " "
					},
					{
						scriptClass : "mstrmojo.TextBox",
						size:50,
						id:"DiagnosticsCustomFilePath",
						bindings:{
							enabled:"mstrmojo.all.DiagnosticsCustomLogRadio.checked"
						}	
				}]
			}
			
			]
				
		},		
		{
			scriptClass : "mstrmojo.Box",
			cssText : "position:absolute;top:320px;padding: 10px;width: 95%;border-top: 1px;border-top-color: #AAA;border-bottom: 0px; border-bottom-color: #AAA;border-style: solid;border-right: 0px;border-left: 0px;",
			children : [			            
			    {
			    	scriptClass:"mstrmojo.HBox",			    	
			    	children:[
			    	   {
			    		   scriptClass : "mstrmojo.Label",
			    		   text:mstrmojo.desc(2706, "Statistics"),
							cssText : "padding-left:10px;font-weight: bold;"
			    	   }       
			    	]
			    },
			    {
			    	scriptClass:"mstrmojo.HBox",
			    	cssText: "margin:10px",
			    	children:[
			    	     {
			    	    	 	scriptClass : "mstrmojo.Label",		
			    	    	 	cssText:"padding-right:40px",
			    	    	 	text:mstrmojo.desc(2707, "Mode:")
			    	     },
			    	     {
			    	    	    scriptClass : 'mstrmojo.Pulldown',			    	    	    
								id:"DiagnosticsStatisticsMode",
								itemField : "n",
								itemIdField : 'n',
								cssText : 'width:140px;height:auto;',
								items : [{
									n : mstrmojo.desc(2709,"OFF") //OFF in task
								},{
									n : mstrmojo.desc(2710,"Screen")   //Screen in task
								}, {
									n : mstrmojo.desc(2711,"File") //File in task
								},{
									n : mstrmojo.desc(2712,"Screen and File") //Screen and file in task
								}],
								onitemsChange : function() {			    	    	 		
								},
								onvalueChange : function(mode) {
									if(mode === "OFF"){
										this.set('value',this.items[0].n);							
										this.set('selectedIndex', 0);
									}
									if(mode === "Screen"){
										this.set('value',this.items[1].n);
										this.set('selectedIndex', 1);
									}
									if(mode === "File"){
										this.set('value',this.items[2].n);							
										this.set('selectedIndex', 2);
									}
									if(mode === "Screen and File"){
										this.set('value',this.items[3].n);
										this.set('selectedIndex', 3);
									}
								}
			    	     }]
			    },
			    {
			    	scriptClass:"mstrmojo.HBox",
			    	cssText: "margin-left:10px",
			    	children:[
			    	     {
			    	    	 	scriptClass : "mstrmojo.Label",
			    	    	 	text:mstrmojo.desc(2708, "Statistics File:")
			    	     },			    	     
			    	     {
			    	    	 scriptClass:"mstrmojo.VBox",
			    	    	 cssText: "margin-left:10px",
			    	    	 children:[{
			    	    		   scriptClass : "mstrmojo.TextBox",
			    	    		   size:50,
			    	    		   id:"DiagnosticsStatisticsFilePath"
			    	    	 	},
			    	    	 	{
			    	    	 		scriptClass:"mstrmojo.Label",
			    	    	 		text:mstrmojo.desc(3443, "Please enter an absolute path including file and extension, using / as directory delimiter")
			    	    	 	}]
			    	     }
			    	]
			    }       
		]}
		
		]
	});

})();
