 (function(){
       mstrmojo.requiresCls("mstrmojo.Obj",
                            "mstrmojo.mobileConfigView",
                            "mstrmojo.mobileConfigUtil");
    var util = mstrmojo.mobileConfigUtil,
        _deviceToHSMap = [];
        _deviceToHSMap[util.DEVICE_IPHONE]=util.DEFAULT_IPHONE_CUSTOM_HOMESCREEN;
        _deviceToHSMap[util.DEVICE_IPAD]=util.DEFAULT_IPAD_CUSTOM_HOMESCREEN;
        _deviceToHSMap[util.DEVICE_PHONE_UNIVERSAL]=util.DEFAULT_PHONE_UNIVERSAL_CUSTOM_HOMESCREEN;
        _deviceToHSMap[util.DEVICE_TABLET_UNIVERSAL]=util.DEFAULT_TABLET_UNIVERSAL_CUSTOM_HOMESCREEN;
       
       function _checkHomescreenObject(obj, flag){
           if (flag){
             if (obj === undefined || obj.oi === undefined || obj.oi.did === undefined){
               return false;
             }
           }
           return true;
         }
           
       function _checkUndefinedFields(data){
           // check general settings
           if (data.gnl){
               var deviceType = data.dt,
               gnl = data.gnl,
               fs = [];
               if(deviceType != '5'){
                   fs = ["ml","nt","mls","mgc","sci","cvi","art", "dmatp", "dcn", "dd"];
                   

                   if (isNaN(parseInt(gnl.pe.v,10)) || isNaN(parseInt(gnl.rar.v,10))) {
                       return false;
                   }
                   
                   if(gnl.ucs.v && !gnl.cs.v){
                       return false;
                   }
               } else {
                   fs = ['apf', 'chs', 'cmi', 'cmt', 'cmw', 'ctk', 'mds', 'mff', 'mrl', 'nrt', 'plp', 'rpc', 
                         'rsel', 'rsl', 'rtu', 'scf', 'slm', 'svc', 'tcp', 'tgt', 'tls', 'tqs', 'ums', 'wsc'];
               }
               
               for (var i=0;i<fs.length;i++){
            	   if (gnl[fs[i]].v === undefined){
            		   return false;
            	   }
               }
           }
           // check connectivity settings
           if (data.cty){
               var tcs = data.cty.tcs, //trusted certificates
                   wsl = data.cty.wsl; //web server list
               
               for (var i=0, len=tcs.length;i<len;i++){
                   if (tcs[i].url === undefined){
                       return false;
                   }
               }
               
               for (var i=0, len=wsl.length; i<len; i++){
                   var ws = wsl[i];
            	   if (ws.po === undefined || ws.pt === undefined || ws.nm === undefined){
                       return false;
                   }
                   for (var j=0, pl = ws.pl, len2 = pl.length; j<len2; j++){
                	   if (pl[j].asd === true && (!pl[j].sc || !pl[j].sc.oi)){
                		   return false;
                	   }
                   }
               }
           }
           // check custom homescreen settings
           if (data.hsc && data.hsc.tp === util.HOMESCREEN_CUSTOM){
               var cst = data.hsc.cst;
               if (cst.fmt.bkg.tp === util.BACKGROUND_IMAGE){
                   if (!cst.fmt.bkg.img.src){
                	   return false;
                   }
               }
               if (cst.fmt.ttl.tp === util.TITLEBAR_IMAGE){ 
            	   if (!cst.fmt.ttl.img.src){
            		   return false;
            	   }
               }
               for (var i=0, l=cst.btns.length;i<l;i++){
                   var btn = cst.btns[i];
                   if (btn.icn.tp === util.ICON_IMAGE){
                       if (!btn.icn.img.src){
                    	   return false;
                       }
                   }
               }
           }
           
           if (data.n === undefined){
               return false;
           }

           return true;
       }

        
        /* mobile configuration model */  
        mstrmojo.insert({
            scriptClass: "mstrmojo.Obj",
            id: "mobileConfig",
            validFlag: false,
            
            clearConfigData: function() {
                //safe?
                delete this.data;
            },
            
           /**
           * Refresh data, if no specific id, use default value on server and make the widget and model use the consistent data.
           */
            refreshConfigData: function(configId, dt) {

                    var ths = this,
                        params = {taskEnv: "xhr", blockVersion: 1};
                    
                    if (configId) {
                        params.taskId = "getMobileConfiguration";
                        params.configurationID = configId;
                    } else {
                        params.taskId = "getNewMobileConfiguration";
                        params.deviceType = dt;
                    }
                    
                    mstrmojo.xhr.request("POST", 
                                        mstrConfig.taskURL,
                                        {
                                              success: function(response){
                                                      if (response) {
                                                        util.makeHashable(response.cty);//needed for issue 409415
                                                    if(response.hsc) { util.makeCSTHomescreenHashable(response.hsc);}
                                                        mstrmojo.all.mobileConfig.set("data",response);
                                                    
                                                    if (response.hsc && response.hsc.tp == util.HOMESCREEN_DEFAULT){
                                                        var hsc = response.hsc,
                                                            configType = _deviceToHSMap[mstrApp.device];
                                                            
                                                        ths.getDefaultConfig(configType, 
                                                            function(response){ // task callback function
                                                                util.makeCSTHomescreenHashable({cst:response});
                                                                hsc.set("cst", response);
                                                            });
                                                    }
                                                      }
                                              },
                                             failure: function(response){
                                                      util.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                              }
                                        },
                                        params,
                                         false,
                                         null
                                      );

            },
            
            /**
             * get default configuration from the webserver.
             * @param type DEFAULT_WEBSERVER, DEFAULT_PROJECT, DEFAULT_HOMESCREEN_BUTTON, DEFAULT_CUSTOM_HOMESCREEN
             * @param callbackOnSuccess callback function to deal with the response
             * */
            getDefaultConfig: function(type, callbackOnSuccess){
                mstrmojo.xhr.request("POST", mstrConfig.taskURL,
                                     {
                                        success: callbackOnSuccess,
                                        failure: function(response){
                                            if (response){
                                                util.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                            }
                                        }
                                     },
                                     {taskId: "getMobileConfigurationBlock", configBlockType: type, taskEnv: "xhr", blockVersion: 1},
                                     false,
                                     null);
                                     
            },
            
            /**
             * return a project list
             * @param pid, sn if specified, return an one-element list with the project that pid&sn matches
             */
            getProjects: function(pid, sn) {
                var projectHash = {};
                var items = [];
                if (this.data) {
                    for (var wl = this.data.cty.wsl, i = 0; i < wl.length; i++) {
                        for (var pl = wl[i].pl, j = 0; j < pl.length; j++) {
                            var key = pl[j].pid + "_" + pl[j].sn; 
                        	if (!projectHash[key]){
                                projectHash[key] = 1;
                                var item = {n : (pl[j].pn + '(' + pl[j].sn + ')'), // project display name
                                          v : pl[j].pid,  // project ID
                                          webServer : util.getWebSrvUrl(wl[i]), // web server url
                                          iServer : pl[j].sn, // IServer name
                                          project : pl[j].pn,
                                          authMode: (pl[j].udc === true)? wl[i].pdc.am : pl[j].pc.am,
                                          transferAuthHeader: util.getTransferAuth(wl[i])};
                                if (pid===item.v && sn===item.iServer) {
                                    return [item];
                                }
                                items.push(item);
                            }
                        }
                    }
                }
                return items;
            },

            /**
             * Global validation on the model data
             */
            validate: function(){
              var flag = _checkUndefinedFields(this.data);
              
              var hsc = this.data.hsc;
              if(hsc){
              flag &= _checkHomescreenObject(hsc.fd, hsc.tp === util.HOMESCREEN_FOLDER);
              flag &= _checkHomescreenObject(hsc.rs, hsc.tp === util.HOMESCREEN_RD);
                  
                  if (hsc.tp === util.HOMESCREEN_RD && hsc.rs){
                      var sobs = hsc.rs.sobs;
                      for (var i=0, len = sobs.length; i<len; i++){
                          var act = sobs[i];
                          flag &= _checkHomescreenObject(act.rs, act.tp === util.ACT_RUNREPORT);
                          flag &= _checkHomescreenObject(act.fd, act.tp === util.ACT_BROWSEFOLDER);
                      }
                      
              if (hsc.tp === util.HOMESCREEN_CUSTOM && hsc.cst){
                  var btns = hsc.cst.btns;
                  for (var i=0, len = btns.length;i<len;i++){
                      var act = btns[i].act;
                      flag &= _checkHomescreenObject(act.rs, act.tp === util.ACT_RUNREPORT);
                      flag &= _checkHomescreenObject(act.fd, act.tp === util.ACT_BROWSEFOLDER);
                  }
              }
                  }
              }
              this.set("validFlag", !!flag);
            },
            
            postCreate: function(){
                this.refreshConfigData((mstrApp.configId === '')?undefined:mstrApp.configId, 
                        (mstrApp.device === '')?undefined:mstrApp.device);
            }
        });
        

         
       mstrmojo.all.editConfig.set("model", mstrmojo.all.mobileConfig);
})();
