/*
 * @author:akarandikar
 */

(function () {

    mstrmojo.requiresCls("mstrmojo.TreeBrowserNode", "mstrmojo.TreeBrowser");

    /**
     * <p>Represents a tree for Apply server templates</p>
     * 
     * @class
     * @extends mstrmojo.TreeBrowser
     */
    mstrmojo.IPA.EnvironmentTreeBrowser = mstrmojo.declare(

    // superclass
    mstrmojo.TreeBrowser,

    // mixins
    null,

    /**
     * @lends mstrmojo.IPA.EnvironmentTreeBrowser.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.EnvironmentTreeBrowser",        
        
        getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){
    		var tsk={};
    		var level = -1; //to cheat the tree browser, set level to -1 initially
    		var envID;
    		var blkCount = 1;
    		tsk.timestamp = null;    		
    		mstrmojo.all.NoServersLabel.set('visible',false);
    		mstrmojo.all.serverDetails.set('visible',false);
    		mstrmojo.all.IPAOverlayBox.set('visible', true);    		
    		if (params.isRoot) {
    			if (params.blockCount == 30){
    				 if(this.items.length != mstrmojo.all.environmentModel.model.environments.length){
    					 this.selectionParentNode.set('selectedIndex',-1);
    					 blkCount = 30;
    				 }
    				 else if (this.items.length == mstrmojo.all.environmentModel.model.environments.length){
    					 for(var i = 0; i < this.items.length; i++){
    						 if(this.items[i].id != mstrmojo.all.environmentModel.model.environments[i].id){
    							 this.selectionParentNode.set('selectedIndex',-1);
    							 blkCount = 30;
    							 break;
    						 }    							 
    					 }
    				 }
    				 else{
    					 blkCount = 1;
    				 }
    			}
    			else {
    				blkCount = 1;
    			}
    			tsk.taskId = "getTopologyTask";
    		}else if (params.data.t == -2) {
    			//when some env is clicked    			
    			level = -2;					
    			envID = params.data.id;
                tsk.taskId = "getMHAStatusTask";
                tsk.timestamp = null;
    		}
    		else if (params.data.t == 2) {
    			//when All Servers is clicked
    			level = 2;					
    			envID = params.data.envID;
                tsk.taskId = "getMHAStatusTask";
                tsk.timestamp = null;
    		}else if (params.data.t == 0) {
    			//when WebServers is clicked
    			level = 0;    			
    			envID = params.data.envID;
                tsk.taskId = "getMHAStatusTask";
                tsk.timestamp = null;
    		}else if (params.data.t == 1) {
    			//when MobileServers is clicked
    			envID = params.data.envID;
    			level = 1;							
                tsk.taskId = "getMHAStatusTask";
                tsk.timestamp = null;
    		}
    		
    		mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                success: function (res) {
    				mstrmojo.all.IPAOverlayBox.set('visible', false);
    				mstrmojo.all.EnvironmentTreeBrowser.w = [];
    				var web = {};
    				var mobile = {};
    				var allServers = {};
    				this.items = [];
    				var envArr = mstrmojo.all.environmentModel.model.environments;
    				
    				if(envArr.length < 0){    					
    					mstrmojo.all.EnvironmentTreeBrowser.set('visible',false);    					
    					mstrmojo.all.browseTreeLabel.set('visible',false);
    					mstrmojo.all.serverDetails.set('visible',false);
    				}
    				
    				if(level == -1){
    					//get all env names at the start
    					var envObj = {};
    					for(var i=0; i < envArr.length; i++){
    						envObj = {};
    						envObj.name = envArr[i].name; envObj.t = -2;envObj.id=envArr[i].id;    						
    						mstrmojo.all.EnvironmentTreeBrowser.w.push(envObj);
    					}
    					if(blkCount == 30)
    						mstrmojo.all.EnvironmentTreeBrowser.set('items', mstrmojo.all.EnvironmentTreeBrowser.w);
    				}else if (level == -2){
    					// when some env is clicked
    					var hasServer = 0;    					
    					
    					//add 'All Server'
    					allServers.name = 'All Servers'; allServers.t = 2; allServers.envID = envID;
    					allServers.type = 'AllServers';
    					mstrmojo.all.EnvironmentTreeBrowser.w.push(allServers);    					
    					
    					for(i = 0; i < envArr.length; i++){
    						if(envID == envArr[i].id)
    						{
    							if (envArr[i].webServers.length > 0){
    								web.name = 'Web Servers'; web.t = 0; web.envID = envID; web.type='WebServers';
    		    					mstrmojo.all.EnvironmentTreeBrowser.w.push(web);    		    					
    		    					hasServer = 1;
    							}
    							
    							if (envArr[i].mobileServers.length > 0){
    								mobile.name = 'Mobile Servers'; mobile.t=1;mobile.envID = envID; mobile.type='MobileServers';
    								mstrmojo.all.EnvironmentTreeBrowser.w.push(mobile);    								
    								hasServer = 1;
    							}
    							mstrmojo.all.IPAAllWebServersGrid.set('items',envArr[i].webServers);
    							mstrmojo.all.IPAAllMobileServersGrid.set('items',envArr[i].mobileServers);
    							break;
    						}    						
    					}
    					
    					if(hasServer != 1){
    						mstrmojo.all.EnvironmentTreeBrowser.w.pop();
    						mstrmojo.all.NoServersLabel.set('visible',true);    						
			    			mstrmojo.all.serverTemplateLabel.set('visible',false);
			    			mstrmojo.all.serverTierLabel.set('visible',false);
			    			mstrmojo.all.ApplyTemplatesPullDown.set('visible',false);
    						mstrmojo.all.IPAAllWebServersGrid.set('visible',false);
							mstrmojo.all.IPAAllMobileServersGrid.set('visible',false);
							mstrmojo.all.IPAAllServersGrid.set('visible',false);
							mstrmojo.all.IndividualServersVBox.set('visible',false);
							mstrmojo.all.ApplyTemplateButton.set('visible',false);							
    					}
    					
    				}else if (level == 0){
    					//populate web servers for that env
    					web.name = 'All Web Servers'; web.envID = envID; web.type = 'AllWeb';
    					mstrmojo.all.EnvironmentTreeBrowser.w.push(web);
    					
    					for(i=0; i < envArr.length; i++){
    						if(envID === envArr[i].id){
    							var webServers = envArr[i].webServers;
    							for(var j = 0; j < webServers.length; j++){
    								mstrmojo.all.EnvironmentTreeBrowser.w.push(webServers[j]);
    							}
    							break;
    						}
    					}    					
    				}else if (level == 1){
    					// populate mobile servers for that env
    					mobile.name = 'All Mobile Servers'; mobile.envID = envID; mobile.type = 'AllMobile';
    					mstrmojo.all.EnvironmentTreeBrowser.w.push(mobile);
        				
    					for(i=0; i < envArr.length; i++){
    						if(envID === envArr[i].id){
    							var mobileServers = envArr[i].mobileServers;
    							for(j = 0; j < mobileServers.length; j++){
    								mstrmojo.all.EnvironmentTreeBrowser.w.push(mobileServers[j]);
    							}
    							break;
    						}
    					}
    				}else if (level == 2){
    					// All Servers in the env    					
    					var items = [];
    					webServers = []; mobileServers=[];

    					 for(i=0; i < envArr.length; i++){
    						if(envID === envArr[i].id){
    							webServers = envArr[i].webServers;
    							for(j = 0; j < webServers.length; j++){
    								items.push(webServers[j]);
    							}
    							
    							mobileServers = envArr[i].mobileServers;
    							for(j = 0; j < mobileServers.length; j++){
    								items.push(mobileServers[j]);
    							}    							
    							break;
    						}
    					 }
    					 mstrmojo.all.IPAAllServersGrid.set('items',items);    					 
    				}
    			
    			
    				callbacks.success({
    					items: mstrmojo.all.EnvironmentTreeBrowser.w                		
                	});
            	},
                failure: function (res) {
                    if (res) {
                    	mstrmojo.all.IPAOverlayBox.set('visible', false);
                        alert("Failure in retreiving environment tree");
                    }
                }
            }, tsk);
    	},
    	
    	isBranch: function (data) {    		
    		return (data.t <= 1);
        },
        
        item2textCss: function item2textCss(data) {       	
        	var textCss;
        	
        	if(data.t == -2){        		
        			textCss = "EnvLevel";        		
        	}else if (data.t == 0){
        			textCss = "WebLevel";
        	}else if (data.t == 1){
        			textCss = "MobileLevel";
        	}else if (data.t == 2){
        			textCss = "AllServersLevel";
        	}else{
        		textCss = data.type; 
        	}        	
        	return textCss;
        },
        
        itemFunction: function ifn(item, idx, w) {
        	var tree = w.tree || w,
                iw = new mstrmojo.TreeBrowserNode({
                    data: item,
                    state: 0,
                    parent: w,
                    tree: tree,
                    multiSelect: w.multiSelect,
                    text: item[w.itemDisplayField],
                    textCssClass: tree.item2textCss(item),
                    cssClass: "mstrmojo-IPA-ServerTreeNode",
                    items: item[w.itemChildrenField],
                    itemIdField: w.itemIdField,
                    itemDisplayField: w.itemDisplayField,
                    itemIconField: w.itemIconField,
                    itemChildrenField: w.itemChildrenField,
                    itemFunction: w.itemFunction,
                    listSelector: w.listSelector,
                    isSpecialNode: function isSpecialNode() {
                        return tree.isBranch(item);
                    }
                });
        	return iw;
        },
        
        onnodechange: function onnodechange(evt) {
        	this._super(evt); 
            
        	//clear prev results
            mstrmojo.all.ApplyTemplatesResultLabel.set("text","");
            mstrmojo.all.ApplyTemplatesResultLabel.set("visible",false);
			mstrmojo.all.Results.set("visible",false);
			
            //get env list to update grids
            mstrmojo.all.environmentController.getEnvironmentList(
					null,function() {
						var params = {blockBegin:0, blockCount:30, data:"",isRoot:true};            
			            mstrmojo.all.EnvironmentTreeBrowser.getContentThroughTaskCall(params,{success:function(res){},failure:function(res){}});
			            if (mstrmojo.all.EnvironmentTreeBrowser.handlenodechange) {
			                mstrmojo.all.EnvironmentTreeBrowser.handlenodechange(evt);
			            }
					},function(){mstrmojo.alert("Failed to retrieve topology");});
        }
    });

}());   