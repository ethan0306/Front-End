(function() {

	mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.css");
	mstrmojo.requiresDescs(4385,2760,2703,2762,4394,3868,3869,4629,3871,3873,4845,2469,2305,3425,8045,8439,
			8861,8862,8863,8864,8865,8866,8898,8899,8900,8901);
	
	//this is the web server

	mstrmojo.IPA.SecurityConfiguration = mstrmojo.insert({
		scriptClass : "mstrmojo.Box",
		cssText : "height: 380px; width: 100%;position: relative;background: white;background-color: #FAFAFA;",
		alias : "SecurityConfiguration",
		selected : true,
		n : "Security",
		children : [
		       {scriptClass:"mstrmojo.Box",
		    	id:"EncryptionBox",   
		    	cssText:"margin-left: 10px;margin-top: 10px;",   
		    	children:[{
					scriptClass : "mstrmojo.Label",
					text : mstrmojo.desc(8898,"Encryption and Storage"),
					cssText : "font-weight: bold; padding-bottom: 5px;padding-top:0px;"
				}, {
					scriptClass : "mstrmojo.Box",
					cssText:"margin-bottom: -10px;",
					children : [{
						scriptClass : "mstrmojo.CheckBox",
						id:'SecurityUseEncryption',
						label : mstrmojo.desc(8861,"Encrypt Traffic between Web and Intelligence Server"),
					}]
				}]   
		     },{
			scriptClass : "mstrmojo.Box",
			id:"SecurityLHSBox",
			cssText : "position: absolute; padding: 10px;width: 42%;",
			children : [
			//Encryption and Storage
			{
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityPreventCaching',
					label : mstrmojo.desc(4385, "Prevent browser from caching content on the client"),
				}]
			},{
					scriptClass : "mstrmojo.Box",
					children : [{
						scriptClass : "mstrmojo.CheckBox",
						id:'SecurityEnableCookies',
						label : mstrmojo.desc(8862,"Enable Cookies"),
						
					}]
			},{
				scriptClass : "mstrmojo.Box",
				cssText : "padding-left: 10px",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityStoreSessions',
					label : mstrmojo.desc(2760, "Store MicroStrategy Intelligence Server Sessions Information in temporary cookies instead of the Web Server"),
					
					bindings:{
						enabled:'mstrmojo.all.SecurityEnableCookies.checked' 
					}
				}]
			},
			//Diagnostics
			{
				scriptClass : "mstrmojo.Label",
				text:mstrmojo.desc(2703, "Diagnostics"),
				cssText : "font-weight: bold; padding-bottom: 5px;padding-top:15px;"
			}, {
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityExceptionInfo',
					label : mstrmojo.desc(8863,"MicroStrategy Web Logs include exception information in the page source."),
				}]
			},{
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityRequestInfo',
					label : mstrmojo.desc(8864,"MicroStrategy  Web Logs include request information in the page source."),
				}]
			},
			//User Security
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8899,"User Security"),
				cssText : "font-weight: bold; padding-bottom: 5px;padding-top:15px;"
			}, {
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecuritySessionInfoInURL',
					label : mstrmojo.desc(2762, "Session information is included on the URL."),
				}]
			},{
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityAllowAdmin',
					label : mstrmojo.desc(4394, "Allow users with the 'Web administration' privilege to change project default preferences on all projects."),
				}]
			}
			
			
			
			]
			},
			 {
			scriptClass : "mstrmojo.Box",
			cssText : "left: 45%;top:-3%;position: absolute; padding: 10px; width:50%;border-left: 1px;border-left-color: #AAA; border-style: solid;border-top: 0px;border-right: 0px;border-bottom: 0px;",
			id:"SecurityRHSBox",
			children : [
			
			//HTML Output Allowances
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8865,"HTML Output Allowances"),
				cssText : "font-weight: bold; padding-bottom: 5px;padding-top:0px;"
			}, {
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityProjDesc',
					label: mstrmojo.desc(3868, "Project description in the projects page.")
				}]
			},{
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityObjDesc',
					label: mstrmojo.desc(3869,"Object Description")
				}]
			},{
					scriptClass : "mstrmojo.Box",
					children : [{
						scriptClass : "mstrmojo.CheckBox",
						id:'SecurityPromptTitleDesc',
						label: mstrmojo.desc(4629,"Prompt title and descriptions.")
					}]
			},{
					scriptClass : "mstrmojo.Box",
					children : [{
						scriptClass : "mstrmojo.CheckBox",
						id:'SecurityMetricValues',
						label: mstrmojo.desc(3871, "Metric values.")
					}]
			},{
					scriptClass : "mstrmojo.Box",
					children : [{
						scriptClass : "mstrmojo.CheckBox",
						id:'SecurityHeaderAndFooter',
						label : mstrmojo.desc(8866,"Print header and footer.")
					}]
			},{
					scriptClass : "mstrmojo.Box",
					children : [{
						scriptClass : "mstrmojo.CheckBox",
						id:'SecurityTextToCSV',
						label: mstrmojo.desc(3873,"Exported text in plain text of CSV formats.")
					}]
			},{
					scriptClass : "mstrmojo.Box",
					children : [{
						scriptClass : "mstrmojo.CheckBox",
						id:'SecurityJSExecution',
						label: mstrmojo.desc(4845, "Allow JavaScript Execution for Report Services Documents Hyperlinks.")
					}]
			},
			
			//Login Security
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8900,"Login Security"),
				cssText : "font-weight: bold; padding-bottom: 5px;padding-top:15px;"
			}, {
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityAutoLogin',
					label: mstrmojo.desc(2469, "Allow automatic login if session is lost.")
				}]
			},{
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityChangePassword',
					label: mstrmojo.desc(2305, "Allow users to change expired password.")
				}]
			},{
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityAutoComplete',
					label: mstrmojo.desc(3425,"Allow AutoComplete.")
				}]
			},{
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityNewHTTPSession',
					label: mstrmojo.desc(8045, "Create new HTTP session upon login")
				}]
			},
			
			//About
			{
				scriptClass : "mstrmojo.Label",
				text : mstrmojo.desc(8901,"About Page"),
				cssText : "font-weight: bold; padding-bottom: 5px;padding-top:15px;"
			}, {
				scriptClass : "mstrmojo.Box",
				children : [{
					scriptClass : "mstrmojo.CheckBox",
					id:'SecurityDisplayVersionInfo',
					label: mstrmojo.desc(8439,"Display version information to all users.")
				}]
			}
			
			
		]
		}]
	});

})();
