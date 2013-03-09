(function () {

    mstrmojo.requiresCls("mstrmojo.func", "mstrmojo.Obj");    
    
    /*
 	 * sorts template names in ascending order
 	 */
 	function _sortFunc(a,b){    	
    	if(a.name!='[Defaults]' &&  b.name!='[Defaults]'){
    		var e = a.name == b.name;
			var r = a.name > b.name;
			if(e) { return 0;} 
			else if(r) { return 1;} 
			else {return -1;} 
    	}    		
    }
    
    /*
  	  * fill iserver defaults using the pre-populated hash table and 
  	  * also create a map from keys:js object id 
  	  */
     function _fillIServerDefaultsData(propertyHashValues,fieldToIDHash){
  		mstrmojo.all.IServerPort.set('value',propertyHashValues.port);
  		fieldToIDHash.port = mstrmojo.all.IServerPort; 
  		mstrmojo.all.IServerInitPool.set('value',propertyHashValues.ini_pool);
  		fieldToIDHash.ini_pool = mstrmojo.all.IServerInitPool;
  		mstrmojo.all.IServerMaxPool.set('value',propertyHashValues.max_pool);
  		fieldToIDHash.max_pool = mstrmojo.all.IServerMaxPool;
  		mstrmojo.all.IServerLoadBalanceFactor.set('value',propertyHashValues.load_balance_factor);
  		fieldToIDHash.load_balance_factor = mstrmojo.all.IServerLoadBalanceFactor;
  		mstrmojo.all.IServerBusyTimeout.set('value',propertyHashValues.serverBusyTimeOut);
  		fieldToIDHash.serverBusyTimeOut = mstrmojo.all.IServerBusyTimeout;
  		mstrmojo.all.IServerRequestTimeout.set('value',propertyHashValues.requestTimeOut);
  		fieldToIDHash.requestTimeOut = mstrmojo.all.IServerRequestTimeout;
  		
  		mstrmojo.all.IServerKeepConnectionAlive.set('checked',propertyHashValues.keep_alive==="true"?true:false);
  		fieldToIDHash.keep_alive = mstrmojo.all.IServerKeepConnectionAlive;
  		mstrmojo.all.IServerShowLoginAfterLogout.set('checked',propertyHashValues.showLoginPageAfterLogout==="true"?true:false);
  		fieldToIDHash.showLoginPageAfterLogout = mstrmojo.all.IServerShowLoginAfterLogout;
  		mstrmojo.all.IServerOverideProjectLogin.set('checked',propertyHashValues.overrideProjectLoginModes==="true"?true:false);
  		fieldToIDHash.overrideProjectLoginModes = mstrmojo.all.IServerOverideProjectLogin;
  		
  		//pulldowns
  		mstrmojo.all.IServerConnectMode.onvalueChange(propertyHashValues.connectmode);
  		mstrmojo.all.IServerSortServerList.onvalueChange(propertyHashValues.serverSorting);
  		mstrmojo.all.IServerSortProjectList.onvalueChange(propertyHashValues.projectSorting);
  		mstrmojo.all.IServerShowProjectList.onvalueChange(propertyHashValues.loginFirst);
  		mstrmojo.all.IServerTrustedAuthPullDown.onvalueChange(propertyHashValues.trustedAuthProvider);
  		
  		//login prefs
  		mstrmojo.all.StdCheck.set("checked",(propertyHashValues.DssXmlAuthStandard==3)||(propertyHashValues.DssXmlAuthStandard==2)?true:false);
  		mstrmojo.all.StdRadio.set('enabled',mstrmojo.all.StdCheck.checked);
  		mstrmojo.all.StdRadio.set("checked",(propertyHashValues.DssXmlAuthStandard==3)||(propertyHashValues.DssXmlAuthStandard==3)?true:false);
  		
  		mstrmojo.all.LDAPCheck.set("checked",(propertyHashValues.DssXmlAuthLDAP==3)||(propertyHashValues.DssXmlAuthLDAP==2)?true:false);
  		mstrmojo.all.LDAPRadio.set('enabled',mstrmojo.all.LDAPCheck.checked);
  		mstrmojo.all.LDAPRadio.set("checked",(propertyHashValues.DssXmlAuthLDAP==3)||(propertyHashValues.DssXmlAuthLDAP==3)?true:false);
  		
  		mstrmojo.all.DBCheck.set("checked",(propertyHashValues.DssXmlAuthWarehousePassthrough==3)||(propertyHashValues.DssXmlAuthWarehousePassthrough==2)?true:false);
  		mstrmojo.all.DBRadio.set('enabled',mstrmojo.all.DBCheck.checked);
  		mstrmojo.all.DBRadio.set("checked",(propertyHashValues.DssXmlAuthWarehousePassthrough==3)||(propertyHashValues.DssXmlAuthWarehousePassthrough==3)?true:false);
  		
  		mstrmojo.all.GuestCheck.set("checked",(propertyHashValues.DssXmlAuthAnonymous==3)||(propertyHashValues.DssXmlAuthAnonymous==2)?true:false);
  		mstrmojo.all.GuestRadio.set('enabled',mstrmojo.all.GuestCheck.checked);
  		mstrmojo.all.GuestRadio.set("checked",(propertyHashValues.DssXmlAuthAnonymous==3)||(propertyHashValues.DssXmlAuthAnonymous==3)?true:false);
  		
  		mstrmojo.all.WindowsCheck.set("checked",(propertyHashValues.DssXmlAuthNTCredential==3)||(propertyHashValues.DssXmlAuthNTCredential==2)?true:false);
  		mstrmojo.all.WindowsRadio.set('enabled',mstrmojo.all.WindowsCheck.checked);
  		mstrmojo.all.WindowsRadio.set("checked",(propertyHashValues.DssXmlAuthNTCredential==3)||(propertyHashValues.DssXmlAuthNTCredential==3)?true:false);
  		
  		mstrmojo.all.IntegratedCheck.set("checked",(propertyHashValues.DssXmlAuthIntegrated==3)||(propertyHashValues.DssXmlAuthIntegrated==2)?true:false);
  		mstrmojo.all.IntegratedRadio.set('enabled',mstrmojo.all.IntegratedCheck.checked);
  		mstrmojo.all.IntegratedRadio.set("checked",(propertyHashValues.DssXmlAuthIntegrated==3)||(propertyHashValues.DssXmlAuthIntegrated==3)?true:false);
  		
  		mstrmojo.all.TrustedCheck.set("checked",(propertyHashValues.DssXmlAuthTrusted==3)||(propertyHashValues.DssXmlAuthTrusted==2)?true:false);
  		mstrmojo.all.TrustedRadio.set('enabled',mstrmojo.all.TrustedCheck.checked);
  		mstrmojo.all.TrustedRadio.set("checked",(propertyHashValues.DssXmlAuthTrusted==3)||(propertyHashValues.DssXmlAuthTrusted==3)?true:false);
  	 }
  	 
  	 /**
  	  * fill diagnostic defaults using the prepopulated hash table
  	  */
  	function _fillDiagnosticsDefaultsData(propertyHashValues,fieldToIDHash){  		 
  		 if(propertyHashValues.diagnosticType==='0'){
  			mstrmojo.all.DiagnosticsWebLogRadio.set('checked',true);
  			mstrmojo.all.DiagnosticsAdvLogger.set('enabled',true);
			mstrmojo.all.DiagnosticsXMLAPIRadio.set('enabled',true);
  			mstrmojo.all.DiagnosticsPackageRadio.set('enabled',true);
  			
  			 mstrmojo.all.DiagnosticsCustomLogRadio.set('checked',false);
  			 mstrmojo.all.DiagnosticsLogPath.set('value',propertyHashValues.internalLogPath);
  			 fieldToIDHash.internalLogPath = mstrmojo.all.DiagnosticsLogPath;
  	  		 mstrmojo.all.DiagnosticsMaxOutputFileSize.set('value',propertyHashValues.maxOutputFileSize);
  	  		 fieldToIDHash.maxOutputFileSize = mstrmojo.all.DiagnosticsMaxOutputFileSize;
  	  		 mstrmojo.all.DiagnosticsMaxOutPutFiles.set('value',propertyHashValues.numOfFileOutputs);
  	  		 fieldToIDHash.numOfFileOutputs = mstrmojo.all.DiagnosticsMaxOutPutFiles;
  	  		 
  	  		 //pulldowns
  	  		 mstrmojo.all.DiagnosticsLogPullDown.onvalueChange(propertyHashValues.internalLogLevel);
  	  		 
  	  		if(propertyHashValues.advLogger==='0'){
 				 mstrmojo.all.DiagnosticsAdvLogger.set('checked',false);
				 mstrmojo.all.DiagnosticsPackageRadio.set('checked',false);
 				 mstrmojo.all.DiagnosticsXMLUserName.set('value',"");
 				 mstrmojo.all.DiagnosticsXMLAPIRadio.set('checked',false);
 				 mstrmojo.all.DiagnosticsPackages.set('value',"");
				 mstrmojo.all.DiagnosticsUserName.set('value',"");
				 mstrmojo.all.DiagnosticsPattern.set('value',"");
 			 }
 			 else if(propertyHashValues.advLogger==='1'){
 				 mstrmojo.all.DiagnosticsAdvLogger.set('checked',true);
 				 mstrmojo.all.DiagnosticsXMLAPIRadio.set('checked',true);
 				 mstrmojo.all.DiagnosticsXMLUserName.set('value',propertyHashValues.XMLAPILogUserName);
 				 fieldToIDHash.XMLAPILogUserName = mstrmojo.all.DiagnosticsXMLUserName;
 			 }
 			 else{
 				 mstrmojo.all.DiagnosticsAdvLogger.set('checked',true);
 				 mstrmojo.all.DiagnosticsPackageRadio.set('checked',true);
 				 mstrmojo.all.DiagnosticsPackages.set('value',propertyHashValues.packages);
 				 fieldToIDHash.packages = mstrmojo.all.DiagnosticsPackages;
 				 mstrmojo.all.DiagnosticsUserName.set('value',propertyHashValues.packagesLogUserName);
 				 fieldToIDHash.packagesLogUserName = mstrmojo.all.DiagnosticsUserName;
 				 mstrmojo.all.DiagnosticsPattern.set('value',propertyHashValues.pattern);
 				 fieldToIDHash.pattern = mstrmojo.all.DiagnosticsPattern;
 				 
 				 //pulldown
 				 mstrmojo.all.DiagnosticsPackageLevel.onvalueChange(propertyHashValues.packagesLogLevel);  			
 			 }
  		 }
  		 else{
  			 mstrmojo.all.DiagnosticsCustomLogRadio.set('checked',true);
  			 mstrmojo.all.DiagnosticsWebLogRadio.set('checked',false);
  			 mstrmojo.all.DiagnosticsCustomFilePath.set("value",propertyHashValues.customLogPath);
  			 fieldToIDHash.customLogPath = mstrmojo.all.DiagnosticsCustomFilePath;
  		 }
  		 
  		 //stats
  		 mstrmojo.all.DiagnosticsStatisticsMode.onvalueChange(propertyHashValues.statisticsMode);
  		 mstrmojo.all.DiagnosticsStatisticsFilePath.set('value',propertyHashValues.statisticsFile);
  		 fieldToIDHash.statisticsFile = mstrmojo.all.DiagnosticsStatisticsFilePath;
  	 }
  	 
  	 /*
  	  * fill security defaults using the prepopulated hash table
  	  */
  	function _fillSecurityDefaultsData(propertyHashValues,fieldToIDHash){
  		 mstrmojo.all.SecurityUseEncryption.set('checked',propertyHashValues.useEncryption==1?true:false);
  		 mstrmojo.all.SecurityPreventCaching.set('checked',propertyHashValues.preventBrowserCaching==1?true:false);
  		 mstrmojo.all.SecurityEnableCookies.set('checked',propertyHashValues.useCookies==1?true:false);
  		 mstrmojo.all.SecurityStoreSessions.set('checked',propertyHashValues.useSessionCookie==1?true:false);
  		 mstrmojo.all.SecurityExceptionInfo.set('checked',propertyHashValues.renderExceptionInfo==1?true:false);
  		 mstrmojo.all.SecurityRequestInfo.set('checked',propertyHashValues.renderRequestInfo==1?true:false);
  		 mstrmojo.all.SecuritySessionInfoInURL.set('checked',propertyHashValues.includeSessionUrl==1?true:false);
  		 mstrmojo.all.SecurityAllowAdmin.set('checked',propertyHashValues.allowAdminApplyAllProjects==1?true:false);
  		 mstrmojo.all.SecurityProjDesc.set('checked',propertyHashValues.allowHTMLOnProjectDesc==1?true:false);
  		 mstrmojo.all.SecurityObjDesc.set('checked',propertyHashValues.allowHTMLOnObjectDesc==1?true:false);
  		 mstrmojo.all.SecurityPromptTitleDesc.set('checked',propertyHashValues.allowHTMLOnPromptDesc==1?true:false);
  		 mstrmojo.all.SecurityMetricValues.set('checked',propertyHashValues.allowHTMLOnMetricValues==1?true:false);
  		 mstrmojo.all.SecurityHeaderAndFooter.set('checked',propertyHashValues.allowHTMLOnPrintHeaders==1?true:false);
  		 mstrmojo.all.SecurityTextToCSV.set('checked',propertyHashValues.encodeExportResults==1?true:false);
  		 mstrmojo.all.SecurityJSExecution.set('checked',propertyHashValues.allowRSDHyperlinkJavaScript==1?true:false);
  		 mstrmojo.all.SecurityAutoLogin.set('checked',propertyHashValues.allowSeamlessLogin==1?true:false);
  		 mstrmojo.all.SecurityChangePassword.set('checked',propertyHashValues.changePwd==1?true:false);
  		 mstrmojo.all.SecurityAutoComplete.set('checked',propertyHashValues.autocomplete==1?true:false);
  		 mstrmojo.all.SecurityNewHTTPSession.set('checked',propertyHashValues.createNewSession==1?true:false);
  		 mstrmojo.all.SecurityDisplayVersionInfo.set('checked',propertyHashValues.showAboutPageInfo==1?true:false);  		
  	 }
  	
  	 /*
  	  * fill office defaults using the prepopulated hash table
  	  */
  	  function _fillWidgetDefaultsData(propertyHashValues,fieldToIDHash){
  		  mstrmojo.all.WidgetSWFFolder.set('value',propertyHashValues.widgetSrcFolderPath);
  		  fieldToIDHash.widgetSrcFolderPath = mstrmojo.all.WidgetSWFFolder;
  		  mstrmojo.all.WidgetWebCheck.set('checked',propertyHashValues.deployWeb==1?true:false);
  		  mstrmojo.all.WidgetDesktopCheck.set('checked',propertyHashValues.deployDesktop==1?true:false);
  		  mstrmojo.all.WidgetDesktopPath.set('value',propertyHashValues.desktopPath);
  		  fieldToIDHash.desktopPath = mstrmojo.all.WidgetDesktopPath;
  		  mstrmojo.all.WidgetOfficeCheck.set('checked',propertyHashValues.deployOffice==1?true:false);
  		  mstrmojo.all.WidgetOfficePath.set('value',propertyHashValues.officePath);
  		  fieldToIDHash.officePath = mstrmojo.all.WidgetOfficePath;
  		  mstrmojo.all.WidgetNCSCheck.set('checked',propertyHashValues.deployNCS==1?true:false);
  		  mstrmojo.all.WidgetNCSPath.set('value',propertyHashValues.ncsPath);
  		  fieldToIDHash.ncsPath = mstrmojo.all.WidgetNCSPath;
  	  }
  	  
     /*
  	  * fill office defaults using the prepopulated hash table
  	  */
  	function _fillOfficeDefaultsData(propertyHashValues,fieldToIDHash){
  		 mstrmojo.all.OfficeInstllationPath.set('value',propertyHashValues.officeLocation);
  		 fieldToIDHash.officeLocation = mstrmojo.all.OfficeInstllationPath;
  		 mstrmojo.all.OfficeAppendLocalePath.set('checked',propertyHashValues.appendLocalePath==1?true:false);
  		 mstrmojo.all.OfficeLinkToInstallation.set('checked',propertyHashValues.showOfficeLink==1?true:false);
  	 }   
  
  	/*
  	 * Retrieve values from the configurations tabs. Only those tabs that are valid for a template type
  	 * are used to retrieve values.
  	 * 
  	 * selectedIndex: the selected index for the template type pull down
  	 */		  
  	 function _retrieveAllValues(selectedIndex){
  		 var propertyHashTable = [];  		 
  		 
  		 //Iserver defaults  		
  		propertyHashTable.max_pool = mstrmojo.all.IServerMaxPool.value;
  		propertyHashTable.load_balance_factor = mstrmojo.all.IServerLoadBalanceFactor.value;  		  		
  		propertyHashTable.connectmode = mstrmojo.all.IServerConnectMode.selectedIndex;
  		mstrmojo.all.IServerKeepConnectionAlive.checked==true?propertyHashTable.keep_alive="true":propertyHashTable.keep_alive="false";
  		
  		if(selectedIndex == 0 || selectedIndex == 1 | selectedIndex == 2){
  			propertyHashTable.port = mstrmojo.all.IServerPort.value;
  	  		propertyHashTable.ini_pool = mstrmojo.all.IServerInitPool.value;
  			propertyHashTable.serverBusyTimeOut = mstrmojo.all.IServerBusyTimeout.value;
  	  		propertyHashTable.requestTimeOut = mstrmojo.all.IServerRequestTimeout.value;
  			propertyHashTable.trustedAuthProvider = mstrmojo.all.IServerTrustedAuthPullDown.selectedIndex+1;
  		}
  		
  		if(selectedIndex == 0 || selectedIndex == 1){  			
  			mstrmojo.all.IServerShowLoginAfterLogout.checked==true?propertyHashTable.showLoginPageAfterLogout="true":propertyHashTable.showLoginPageAfterLogout="false";
  			mstrmojo.all.IServerOverideProjectLogin.checked==true?propertyHashTable.overrideProjectLoginModes="true":propertyHashTable.overrideProjectLoginModes="false";
  			propertyHashTable.serverSorting = mstrmojo.all.IServerSortServerList.selectedIndex;
  			propertyHashTable.projectSorting = mstrmojo.all.IServerSortProjectList.selectedIndex+1;  		
  			propertyHashTable.loginFirst = mstrmojo.all.IServerShowProjectList.selectedIndex; 		
  			propertyHashTable.DssXmlAuthStandard = getValue(mstrmojo.all.StdCheck.checked,mstrmojo.all.StdRadio.checked);
  			propertyHashTable.DssXmlAuthLDAP = getValue(mstrmojo.all.LDAPCheck.checked,mstrmojo.all.LDAPRadio.checked);
  			propertyHashTable.DssXmlAuthWarehousePassthrough = getValue(mstrmojo.all.DBCheck.checked,mstrmojo.all.DBRadio.checked);
  			propertyHashTable.DssXmlAuthAnonymous = getValue(mstrmojo.all.GuestCheck.checked,mstrmojo.all.GuestRadio.checked);
  			propertyHashTable.DssXmlAuthNTCredential = getValue(mstrmojo.all.WindowsCheck.checked,mstrmojo.all.WindowsRadio.checked);
  			propertyHashTable.DssXmlAuthIntegrated = getValue(mstrmojo.all.IntegratedCheck.checked,mstrmojo.all.IntegratedRadio.checked);
  			propertyHashTable.DssXmlAuthTrusted = getValue(mstrmojo.all.TrustedCheck.checked,mstrmojo.all.TrustedRadio.checked);
  		}

  		if(selectedIndex == 0 || selectedIndex == 1 || selectedIndex == 2){
  			//Diagnostics
  			if(mstrmojo.all.DiagnosticsWebLogRadio.checked){
  				propertyHashTable.diagnosticType=0;
  				propertyHashTable.internalLogPath = mstrmojo.all.DiagnosticsLogPath.value;
  				propertyHashTable.maxOutputFileSize = mstrmojo.all.DiagnosticsMaxOutputFileSize.value;
  				propertyHashTable.numOfFileOutputs = mstrmojo.all.DiagnosticsMaxOutPutFiles.value;
  				switch(mstrmojo.all.DiagnosticsLogPullDown.selectedIndex){
  				case 0:
  					propertyHashTable.internalLogLevel = "OFF"; break;
  				case 1:
  					propertyHashTable.internalLogLevel = "SEVERE"; break;
  				case 2:
  					propertyHashTable.internalLogLevel = "WARNING"; break;
  				case 3:
  					propertyHashTable.internalLogLevel = "INFO"; break;
  				}
  			}else{
  				propertyHashTable.diagnosticType=1;
  				propertyHashTable.customLogPath = mstrmojo.all.DiagnosticsCustomFilePath.value;
  			}
  		
  			if(mstrmojo.all.DiagnosticsAdvLogger.checked){
  				if(mstrmojo.all.DiagnosticsXMLAPIRadio.checked){
  					propertyHashTable.advLogger = 1;
  					propertyHashTable.XMLAPILogUserName = mstrmojo.all.DiagnosticsXMLUserName.value;
  				}else{
  					propertyHashTable.advLogger = 2;
  					propertyHashTable.packages = mstrmojo.all.DiagnosticsPackages.value;
  					propertyHashTable.packagesLogUserName = mstrmojo.all.DiagnosticsUserName.value;
  					propertyHashTable.pattern = mstrmojo.all.DiagnosticsPattern.value;
  					switch(mstrmojo.all.DiagnosticsPackageLevel.selectedIndex){
  					case 0:
  						propertyHashTable.packagesLogLevel = "OFF"; break;
  					case 1:
  						propertyHashTable.packagesLogLevel = "SEVERE"; break;
  					case 2:
  						propertyHashTable.packagesLogLevel = "WARNING"; break;
  					case 3:
  						propertyHashTable.packagesLogLevel = "ALL"; break;
  					}  				
  				}
  			}else{
  				propertyHashTable.advLogger = 0;
  			}
  		
  			//stats
  			 switch(mstrmojo.all.DiagnosticsStatisticsMode.selectedIndex){
				case 0:
					propertyHashTable.statisticsMode = "OFF"; break;
				case 1:
					propertyHashTable.statisticsMode = "Screen"; break;
				case 2:
					propertyHashTable.statisticsMode = "File"; break;
				case 3:
					propertyHashTable.statisticsMode = "Screen and File"; break;
			}  	
  			 
  			propertyHashTable.statisticsFile = mstrmojo.all.DiagnosticsStatisticsFilePath.value;
  		}  		
  		
  		if(selectedIndex == 0 || selectedIndex == 1 || selectedIndex == 2){
  			//Security
  			mstrmojo.all.SecurityUseEncryption.checked==true?propertyHashTable.useEncryption=1:propertyHashTable.useEncryption=0;
  			
  			if(selectedIndex != 2){
  				mstrmojo.all.SecurityPreventCaching.checked==true?propertyHashTable.preventBrowserCaching=1:propertyHashTable.preventBrowserCaching=0;
  				mstrmojo.all.SecurityEnableCookies.checked==true?propertyHashTable.useCookies=1:propertyHashTable.useCookies=0;
  				if(mstrmojo.all.SecurityEnableCookies.checked)
  					mstrmojo.all.SecurityStoreSessions.checked==true?propertyHashTable.useSessionCookie=1:propertyHashTable.useSessionCookie=0;
  				mstrmojo.all.SecurityExceptionInfo.checked==true?propertyHashTable.renderExceptionInfo=1:propertyHashTable.renderExceptionInfo=0;
  				mstrmojo.all.SecurityRequestInfo.checked==true?propertyHashTable.renderRequestInfo=1:propertyHashTable.renderRequestInfo=0;
  				mstrmojo.all.SecuritySessionInfoInURL.checked==true?propertyHashTable.includeSessionUrl=1:propertyHashTable.includeSessionUrl=0;
  				mstrmojo.all.SecurityAllowAdmin.checked==true?propertyHashTable.allowAdminApplyAllProjects=1:propertyHashTable.allowAdminApplyAllProjects=0;
  				mstrmojo.all.SecurityProjDesc.checked==true?propertyHashTable.allowHTMLOnProjectDesc=1:propertyHashTable.allowHTMLOnProjectDesc=0;
  				mstrmojo.all.SecurityObjDesc.checked==true?propertyHashTable.allowHTMLOnObjectDesc=1:propertyHashTable.allowHTMLOnObjectDesc=0;
  				mstrmojo.all.SecurityPromptTitleDesc.checked==true?propertyHashTable.allowHTMLOnPromptDesc=1:propertyHashTable.allowHTMLOnPromptDesc=0;
  				mstrmojo.all.SecurityMetricValues.checked==true?propertyHashTable.allowHTMLOnMetricValues=1:propertyHashTable.allowHTMLOnMetricValues=0;
  				mstrmojo.all.SecurityHeaderAndFooter.checked==true?propertyHashTable.allowHTMLOnPrintHeaders=1:propertyHashTable.allowHTMLOnPrintHeaders=0;
  				mstrmojo.all.SecurityTextToCSV.checked==true?propertyHashTable.encodeExportResults=1:propertyHashTable.encodeExportResults=0;
  				mstrmojo.all.SecurityJSExecution.checked==true?propertyHashTable.allowRSDHyperlinkJavaScript=1:propertyHashTable.allowRSDHyperlinkJavaScript=0;
  				mstrmojo.all.SecurityAutoLogin.checked==true?propertyHashTable.allowSeamlessLogin=1:propertyHashTable.allowSeamlessLogin=0; 		 
  				mstrmojo.all.SecurityChangePassword.checked==true?propertyHashTable.changePwd=1:propertyHashTable.changePwd=0;
  				mstrmojo.all.SecurityAutoComplete.checked==true?propertyHashTable.autocomplete=1:propertyHashTable.autocomplete=0;
  				mstrmojo.all.SecurityNewHTTPSession.checked==true?propertyHashTable.createNewSession=1:propertyHashTable.createNewSession=0;
  				mstrmojo.all.SecurityDisplayVersionInfo.checked==true?propertyHashTable.showAboutPageInfo=1:propertyHashTable.showAboutPageInfo=0;
  			}
  		}

  		if(selectedIndex == 0 || selectedIndex == 1){ 
  			//Widget
 		 	propertyHashTable.widgetSrcFolderPath = mstrmojo.all.WidgetSWFFolder.value;
 		 	mstrmojo.all.WidgetWebCheck.checked==true?propertyHashTable.deployWeb=1:propertyHashTable.deployWeb=0;
			mstrmojo.all.WidgetDesktopCheck.checked==true?propertyHashTable.deployDesktop=1:propertyHashTable.deployDesktop=0;
			propertyHashTable.desktopPath = mstrmojo.all.WidgetDesktopPath.value;
			mstrmojo.all.WidgetOfficeCheck.checked==true?propertyHashTable.deployOffice=1:propertyHashTable.deployOffice=0;
			propertyHashTable.officePath = mstrmojo.all.WidgetOfficePath.value;
			mstrmojo.all.WidgetNCSCheck.checked==true?propertyHashTable.deployNCS=1:propertyHashTable.deployNCS=0;
			propertyHashTable.ncsPath = mstrmojo.all.WidgetNCSPath.value;
		}	
		  
  		if(selectedIndex == 0 || selectedIndex == 1){
  			//Office
  			propertyHashTable.officeLocation = mstrmojo.all.OfficeInstllationPath.value;
  			mstrmojo.all.OfficeAppendLocalePath.checked==true?propertyHashTable.appendLocalePath=1:propertyHashTable.appendLocalePath=0;
  			mstrmojo.all.OfficeLinkToInstallation.checked==true?propertyHashTable.showOfficeLink=1:propertyHashTable.showOfficeLink=0;
  		}
  		
  		return propertyHashTable;
  	 }
  	 
  	 function getValue(checkBox, radio){
  		 if(!checkBox && !radio) return 0;
  		 if(checkBox && radio) return 3;
  		 if(checkBox && !radio) return 2;
  		 if(!checkBox && radio) return 1;
  	 }  	
  	 
  	function formatAttributes(attributes) {
        var APOS = "'";
        var QUOTE = '"';
        var ESCAPED_QUOTE = {};
        ESCAPED_QUOTE[QUOTE] = '&quot;';
        ESCAPED_QUOTE[APOS] = '&apos;';

        var att_value;
        var apos_pos, quot_pos;
        var use_quote, escape, quote_to_escape;
        var att_str;
        var re;
        var result = '';

        for (var att in attributes) {
            att_value = attributes[att];

            // Find first quote marks if any
            apos_pos = att_value.indexOf(APOS);
            quot_pos = att_value.indexOf(QUOTE);

            // Determine which quote type to use around
            // the attribute value
            if (apos_pos == -1 && quot_pos == -1) {
                att_str = ' ' + att + "='" + att_value + "'";
                result += att_str;
                continue;
            }

            // Prefer the single quote unless forced to use double
            if (quot_pos != -1 && quot_pos < apos_pos) {
                use_quote = APOS;
            } else {
                use_quote = QUOTE;
            }

            escape = ESCAPED_QUOTE[use_quote];

            // Escape only the right kind of quote
            re = new RegExp(use_quote, 'g');
            att_str = ' ' + att + '=' + use_quote + att_value.replace(re, escape) + use_quote;
            result += att_str;
        }
        return result;
    }
  	
  	function createXmlElement(name, attributes, content) {
        var att_str = '';
        if (attributes) { // tests false if this arg is missing!
            att_str = formatAttributes(attributes);
        }
        var xml;
        if (!content) {
            xml = '<' + name + att_str + '/>';
        } else {
            xml = '<' + name + att_str + '>' + content + '</' + name + '>';
        }
        return xml;
    }
  	
    mstrmojo.IPA.IPATemplatesController = mstrmojo.declare(
    	    mstrmojo.Obj,
    	    null,
    	    /**
    	     * @lends mstrmojo.IPA.IPATemplatesController
    	     */
    	    {
    	        scriptClass: "mstrmojo.IPA.IPATemplatesController",
    	        
    	        //stores the key:propValue map for the templates
    	        propertyHashValues: [],
    	        
    	         //stores the key:objID map for templates
    	        fieldToObjectIDHash:[],
    	        
    	        firstTime:0,
    	        
        	     /*
        	     * apply template to the servers present in the grid on the 'Apply template' page        	     
        	     * template: the template selected in the main drop down
        	     * webServerForIserver: gives web/mobile server of the individual web/mobile selected in the tree
        	     * serversInGrid: array of servers in the grid
        	     * IServerTemplatesArray: contains widgets that holds templates for iserver 
        	     * label: the top page label
        	     */        	        	    	
        	    applyTemplates:function(template,webServerForIServer,serversInGrid, IServerTemplatesArray,label,callback){
    	    		mstrmojo.all.IPAOverlayBox.set('visible', true);    	    		
    	    		var iServerTemplate = 0;
    	    		//server xml
        	    	var webAndMobileServerXML="",webAndMobileServers="";
        	    	var iServersXML = "", iServers="";
        	    	
        	    	if(template.name == '[Defaults]'){
        	    		var templateName = 'sys_defaults';
        	    	}else{
        	    		templateName = template.name;
        	    	}
        	    	
    	    		//find if we need to apply to Iserver in case on individual web and mobile servers
    	    		if(IServerTemplatesArray.itemWidgets.length > 0 && label.split(" ",1)!='All'){
    	    			iServerTemplate = 1;
    	    			webAndMobileServerXML += createXmlElement("server", 
        	    				{"id":webServerForIServer.id,"tn":templateName,"port":webServerForIServer.port,
  	    				  "type":webServerForIServer.type,"name":webServerForIServer.name});
    	    			webAndMobileServers = createXmlElement("servers",{},webAndMobileServerXML);
    	    			
    	    			var iServerTemplateName;
    	    			for(var i=0;i<IServerTemplatesArray.itemWidgets.length;i++){
    	    				if(IServerTemplatesArray.itemWidgets[i].children[2].selectedItem != null)
    	    					iServerTemplateName = IServerTemplatesArray.itemWidgets[i].children[2].selectedItem.name;
    	    				else{
    	    					//scan the items and get the first universal/iserver template name
    	    					var templates = IServerTemplatesArray.itemWidgets[i].children[2].items;
    	    					for(var j = 0; j < templates.length; j++){
    	    						if(templates[j].type == 'UNIVERSAL'||
    	    								templates[j].type == 'Universal'||
    	    								templates[j].type == 'Intelligence Server'){
    	    							iServerTemplateName = templates[j].name;
    	    							break;
    	    						}
    	    					}
    	    					
    	    				}
    	    				
    	    				if(iServerTemplateName == '[Defaults]'){
    	    					iServerTemplateName = 'sys_defaults';
    	        	    	}
    	    				
    	    				iServersXML += 	createXmlElement("server", 
                	    				{"id":serversInGrid[i].id,"tn":iServerTemplateName,"port":serversInGrid[i].port,
                	    				  "type":serversInGrid[i].type,"name":serversInGrid[i].iServerName});
    	    			}
    	    			iServers = createXmlElement("servers",{},iServersXML);
    	    		}else{
    	    			//this is either all server, all web or all mobile
    	    			for(i=0; i < serversInGrid.length; i++){    	    		
            	    		webAndMobileServerXML += createXmlElement("server", 
            	    				{"id":serversInGrid[i].id,"tn":templateName,"port":serversInGrid[i].port,
          	    				  "type":serversInGrid[i].type,"name":serversInGrid[i].name});        	    	
            	    	}        	    	
            	    	webAndMobileServers = createXmlElement("servers",{},webAndMobileServerXML);
    	    		}
    	    		
        	    	mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, 
        	    			{
     	               			taskId: 'updateIPAPropertiesTask',     	               			
     	               			xmlwebservers:webAndMobileServers,
     	               			xmliservers:iServers     	               		
     	           			}
        	    	);
        	    },    
    	     
    	    /*
    	     * save template after getting all the properties
    	     */    	    	
    	    saveTemplate:function(template,callback){
        	    mstrmojo.all.IPAOverlayBox.set('visible', true);
    	    	var propertyHash = _retrieveAllValues(mstrmojo.all.TemplateTypePullDown.selectedIndex);
    	    	
    	    	//property xml
    	    	var propertyXML="";
    	    	for (var i in propertyHash){    	    		
    	    		propertyXML += createXmlElement("pr",{"name":i,"value":String(propertyHash[i])})    	    		
    	    	}    	    	
    	    	var prs = createXmlElement("prs",{},propertyXML);
    	    	
    	    	mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, 
    	    			{
 	               			taskId: 'saveIPAPropertiesTask',
 	               			xmlproperties:prs, 	               			
 	               			templatename:template.name,
 	               			templatetype:template.type
 	           			}
    	    	);
    	    },
    	    
    	      /* TO BE USED IN NEXT RELEASE
    	     * save and apply templates
    	     
    	    saveAndApplyTemplate:function(template,callback){
    	    	mstrmojo.all.IPAOverlayBox.set('visible', true);
    	    	var propertyHash = _retrieveAllValues();
    	    	
    	    	//property xml
    	    	var propertyXML="";
    	    	for (var i in propertyHash){    	    		
    	    		propertyXML += createXmlElement("pr",{"name":i,"value":String(propertyHash[i])})    	    		
    	    	}    	    	
    	    	var prs = createXmlElement("prs",{},propertyXML);
    	    	
    	    	//server xml
    	    	var serverXML="";
    	    	for(i=0; i < mstrmojo.all.environmentModel.model.webServers.length; i++){    	    		
    	    		serverXML += createXmlElement("server", {"id":mstrmojo.all.environmentModel.model.webServers[i].id});
    	    	}    	    	
    	    	for(i=0; i < mstrmojo.all.environmentModel.model.mobileServers.length; i++){
    	    		serverXML += createXmlElement("server", {"id":mstrmojo.all.environmentModel.model.mobileServers[i].id});
    	    	}
    	    	for(i=0; i < mstrmojo.all.environmentModel.model.environments.length;i++){
    	    		for(var server=0; server < mstrmojo.all.environmentModel.model.environments[i].iServers.length; server++){
    	    			serverXML += createXmlElement("server", {"id":mstrmojo.all.environmentModel.model.environments[i].iServers[server].id});
    	    		}
    	    	}
    	    	var servers = createXmlElement("servers",{},serverXML);
    	    	
    	    	mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, 
    	    			{
 	               			taskId: 'updateIPAPropertiesTask',
 	               			xmlproperties:prs,
 	               			xmlservers:servers,
 	               			templatename:template.name,
 	               			templatetype:template.type
 	           			}
    	    	);
    	    },
    	    */
    	    
    	    
    	   	/*
    	 	 * get the template list via task call
    	 	 */
    	 	 _getTemplateList:function(){
    	    	mstrmojo.all.IPAOverlayBox.set('visible', true);
    	 		var callback = {
    	                 success: function (res) {
    	 						mstrmojo.all.IPAOverlayBox.set('visible', false);
    	 						var templates = res;
    	 						if(res == null){
    	 							return;
    	 						}
    	 						var templateNamePullDown = mstrmojo.all.TemplateNamePullDown;
    	 						var selectedItem = mstrmojo.all.TemplateNamePullDown.selectedItem;
    	 						templateNamePullDown.items.length=0;
    	 						var newTemplate = {name:"[Create New...]"};
    	 						if(templateNamePullDown) {
    	 							templateNamePullDown.set("items", res.templateList);
    	 							templateNamePullDown.set('items',templateNamePullDown.items.sort(_sortFunc));    	 							
    	 							for(var i = 0; i < templateNamePullDown.items.length;i++){
    	 								if(templateNamePullDown.items[i].name == 'sys_defaults'){  
    	 									templateNamePullDown.items.splice(i,1);
    	 									templateNamePullDown.items.push({name:"[Defaults]",type:"Universal"});    	 									
    	 								}
    	 							}    	 							
    	 							mstrmojo.all.ApplyTemplatesPullDown.set("items",res.templateList);    	 						
    	 						}    	 						
    	 						templateNamePullDown.items.push(newTemplate);    	 						
    	 				  },
    	 				failure: function (res) {
    	 				   mstrmojo.all.IPAOverlayBox.set('visible', false);  
    	                   if (res) {
    	                       mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
    	                   }
    	               }
    	 			};
    	 			mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, {
    	               taskId: 'getIPATemplateFilesTask'
    	           });
    	 	},
    	 	
    	 	/*
    	 	 * get the data from selected template as per the pulldown widget
    	 	 */
    	 	_getTemplateData:function(templateName,propertyHash,fieldToIDHash){
    	 		mstrmojo.all.IPAOverlayBox.set('visible', true);    	 		
    	 		var callback = {
    	 			success:function(res){    	 				
    	 				// create property hash:value pair
    	 				for(var i=0; i < res.diagnosticsPropertyList.length; i++){
    	 					propertyHash[res.diagnosticsPropertyList[i].name] = res.diagnosticsPropertyList[i].value;
    	 					fieldToIDHash[res.diagnosticsPropertyList[i].name] = "";
    	 				}
    	 				
    	 				for(i=0; i < res.iserverDefaultsPropertyList.length; i++){
    	 					propertyHash[res.iserverDefaultsPropertyList[i].name] = res.iserverDefaultsPropertyList[i].value;
    	 					fieldToIDHash[res.iserverDefaultsPropertyList[i].name] = "";
    	 				}
    	 				
    	 				for(i=0; i < res.officePropertyList.length; i++){
    	 					propertyHash[res.officePropertyList[i].name] = res.officePropertyList[i].value;
    	 					fieldToIDHash[res.officePropertyList[i].name] = "";
    	 				}
    	 				
    	 				for(i=0; i < res.securityPropertyList.length; i++){
    	 					propertyHash[res.securityPropertyList[i].name] = res.securityPropertyList[i].value;
    	 					fieldToIDHash[res.securityPropertyList[i].name] = "";
    	 				}
    	 				
    	 				for(i=0; i < res.widgetPropertyList.length; i++){
    	 					propertyHash[res.widgetPropertyList[i].name] = res.widgetPropertyList[i].value;
    	 					fieldToIDHash[res.widgetPropertyList[i].name] = "";
    	 				}
    	 				
    	 				_fillIServerDefaultsData(propertyHash,fieldToIDHash);
    	 				_fillDiagnosticsDefaultsData(propertyHash,fieldToIDHash);
    	 				_fillSecurityDefaultsData(propertyHash,fieldToIDHash);
    	 				_fillOfficeDefaultsData(propertyHash,fieldToIDHash);
	 					_fillWidgetDefaultsData(propertyHash,fieldToIDHash);
    	 				
	 					mstrmojo.all.IPAOverlayBox.set('visible', false);	 					
    	 			},
    	 			
    	 			failure:function(res){    
    	 				mstrmojo.all.IPAOverlayBox.set('visible', false);
    	 				if (res) {					
    	                     mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
    	                 }
    	 			}
    	 		};
    	 		
    	 		mstrmojo.xhr.request('POST', mstrConfig.taskURL, callback, {
    	             taskId: 'getIPAPropertiesTask',
    	             template: templateName	
    	         });
    	 	},
    	 	
    	 	/*
    	 	 * returns true: if unique i.e. NO template name match is found
    	 	 * 		  false: if match is found	
    	 	 * @todo: check type later 
    	 	 */
    	 	checkIfTemplateNameTypeUnique:function(templateList, newTemplate){    	 		
    	 		for(var i = 0; i < templateList.length; i++){
   	 				if((newTemplate.name.toLowerCase() == templateList[i].name.toLowerCase()) ||
   	 						newTemplate.name === "Create New..." || newTemplate.name.toLowerCase() === "sys_defaults")
   	 					return false;
   	 				}
   	 				return true;   	 			
    	 	},
    	 	
    	 	/**
    	 	 * returns true: if template name does NOT contain any of the 
    	 	 * \ / : * ? " < > | [ ] ^ ~ . ; = , % &
    	 	 */
    	 	checkForValidName:function(newTemplateName){
    	 		var pattern = new RegExp(/[\\\/:*?"<\[\]>|~^\.;=,%&]/);
    	 		return !pattern.test(newTemplateName);
    	 	},
    	 	
    	 	/*
    	 	 * show config template tabs based on the template type selected.
    	 	 * Below is the list of tabs to show for each template type
    	 	 * Universal and Web template: iserver, diagnostics, security, office and widget deployment
    	 	 * Mobile template: iserver, diagnostic, security
    	 	 * Iserver template: iserver
    	 	 *
    	 	 * selectedIndex: the selected index for the template type pull down
    	 	 */
    	 	showConfigurationTabs:function(selectedIndex){
    	 		if(selectedIndex == 0 || selectedIndex == 1){        	 					
    	 				mstrmojo.all.tabStackID.unrender();
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.OfficeConfiguration);		 
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.WidgetDeploymentConfiguration);
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.DiagnosticsConfiguration);
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.SecurityConfiguration);	 						
						mstrmojo.all.tabStackID.addChildren(mstrmojo.IPA.DiagnosticsConfiguration,1,false);	 						
						mstrmojo.all.tabStackID.addChildren(mstrmojo.IPA.SecurityConfiguration,2,false);
						mstrmojo.all.tabStackID.addChildren(mstrmojo.IPA.OfficeConfiguration,3,false);		 
						mstrmojo.all.tabStackID.addChildren(mstrmojo.IPA.WidgetDeploymentConfiguration,4,false);						
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[1]);
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[2]);
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[3]);
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[4]);	 	
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[0]);
						if(this.firstTime == 0)
							this.firstTime = 1;
						else
							mstrmojo.all.tabStackID.render();		
						
						mstrmojo.all.IServerRHSBox.set('visible',true);
						mstrmojo.all.TrustedAuthProvidersHbox.set('visible',true);						
						mstrmojo.all.IServerBusyTimeoutText.set('visible',true);
						mstrmojo.all.IServerBusyTimeoutHbox.set('visible',true);
						mstrmojo.all.IServerRequestTimeoutText.set('visible',true);
						mstrmojo.all.IServerRequestTimeoutHbox.set('visible',true);
						mstrmojo.all.IServerSortTable.set('visible',true);	
						mstrmojo.all.IServerInitPool.set('visible',true);
						mstrmojo.all.IServerInitPoolLabel.set('visible',true);
						mstrmojo.all.IServerPortLabel.set('visible',true);
						mstrmojo.all.IServerPort.set('visible',true);
						
						mstrmojo.all.SecurityRHSBox.set('visible',true);
						mstrmojo.all.SecurityLHSBox.set('visible',true);					
					}
					if(selectedIndex == 2){	 	
						mstrmojo.all.tabStackID.unrender();	 						
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.OfficeConfiguration);		 
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.WidgetDeploymentConfiguration);
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.DiagnosticsConfiguration);
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.SecurityConfiguration);	 						
						mstrmojo.all.tabStackID.addChildren(mstrmojo.IPA.DiagnosticsConfiguration,1,false);
						mstrmojo.all.tabStackID.addChildren(mstrmojo.IPA.SecurityConfiguration,2,false);						
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[1]);
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[2]);
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[0]);	 						
						mstrmojo.all.tabStackID.parent.children[0].set('target',mstrmojo.all.tabStackID);
						if(this.firstTime == 0)
							this.firstTime = 1;
						else
							mstrmojo.all.tabStackID.render();	
						
						mstrmojo.all.IServerRHSBox.set('visible',true);
						mstrmojo.all.TrustedAuthProvidersHbox.set('visible',true);						
						mstrmojo.all.IServerBusyTimeoutText.set('visible',true);
						mstrmojo.all.IServerBusyTimeoutHbox.set('visible',true);
						mstrmojo.all.IServerRequestTimeoutText.set('visible',true);
						mstrmojo.all.IServerRequestTimeoutHbox.set('visible',true);
						mstrmojo.all.IServerSortTable.set('visible',true);
						mstrmojo.all.IServerInitPool.set('visible',true);
						mstrmojo.all.IServerInitPoolLabel.set('visible',true);
						mstrmojo.all.IServerPortLabel.set('visible',true);
						mstrmojo.all.IServerPort.set('visible',true);
						
						//hide IServer defaults that are not required
						mstrmojo.all.IServerRHSBox.set('visible',false);
						mstrmojo.all.IServerSortTable.set('visible',false);
						if(mstrmojo.all.TrustedAuthProvidersHbox.domNode!=null)
							mstrmojo.all.TrustedAuthProvidersHbox.domNode.style.cssText = "left: 45%;top:-3%;position: absolute; margin: 10px;";
						
						//hide mobile settings that are not required
						mstrmojo.all.SecurityRHSBox.set('visible',false);
						mstrmojo.all.SecurityLHSBox.set('visible',false);								
					}
					if(selectedIndex == 3){
						mstrmojo.all.tabStackID.unrender();	 						
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.IServerDefaults);
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.OfficeConfiguration);		 
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.WidgetDeploymentConfiguration);
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.DiagnosticsConfiguration);
						mstrmojo.all.tabStackID.removeChildren(mstrmojo.IPA.SecurityConfiguration);
						mstrmojo.all.tabStackID.addChildren(mstrmojo.IPA.IServerDefaults,0,false);
						mstrmojo.all.tabStackID.set('selected',mstrmojo.all.tabStackID.children[0]);
						if(this.firstTime == 0)
							this.firstTime = 1;
						else
							mstrmojo.all.tabStackID.render();	
						
						//hide IServer defaults that are not required						
						mstrmojo.all.IServerRHSBox.set('visible',false);
						mstrmojo.all.IServerInitPool.set('visible',false);
						mstrmojo.all.IServerInitPoolLabel.set('visible',false);
						mstrmojo.all.IServerPortLabel.set('visible',false);
						mstrmojo.all.IServerPort.set('visible',false);
						mstrmojo.all.TrustedAuthProvidersHbox.set('visible',false);
						mstrmojo.all.IServerBusyTimeoutText.set('visible',false);
						mstrmojo.all.IServerBusyTimeoutHbox.set('visible',false);
						mstrmojo.all.IServerRequestTimeoutText.set('visible',false);
						mstrmojo.all.IServerRequestTimeoutHbox.set('visible',false);
						mstrmojo.all.IServerSortTable.set('visible',false);
						mstrmojo.all.IServerLHSBox.domNode.style.cssText = "position: absolute; padding: 10px;width: 42%;";						
					}
    	 	}    	 	
    	 	
           });

})();