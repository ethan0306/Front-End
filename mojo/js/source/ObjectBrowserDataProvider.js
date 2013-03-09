(function () {
	//OBDataProvider
    /************************Private methods*********************************/
	
	mstrmojo.ObjectBrowserDataProvider = mstrmojo.declare(
		// superclass
		mstrmojo.Object,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.ObjectBrowserDataProvider",
		
			/************************Instance variables*******************************/
			
			callback : null,
			
			ob : null,
			
			item : null,
			
			path : mstrConfig.taskURL,
			/************************Instance methods*********************************/
				
			fetchFolderContents : function(ob, item, callback){
	        	this.ob = ob;
	        	this.item = item;
	        	this.callback = callback;
				var bc = this.ob.blockCount,
				    params = {
		            taskId:'searchMetadata', 
		            styleName:'MojoFolderStyle',
		            blockCount : bc,
		            includeAncestorInfo : true
				};
				if(ob.folderLinksContextId){
				    params.folderLinksContextId = ob.folderLinksContextId;
				}
				if(ob.sId){
					params.sessionState = ob.sId;
				}
				if(item.fid){
					params.rootFolderID = item.fid;
				}else if(item.fty){
					params.rootFolderType = item.fty;
				}
				if(ob.browsableTypes){
					params.objectType = ob.browsableTypes;
				}
				
				if(item.blockBegin){
					params.blockBegin = item.blockBegin; 
				}
				
				if(item.searchPattern){
					params.searchPattern = item.searchPattern;
                    if(item.recursive){
                        params.recursive = item.recursive;
                    }
                }

                mstrmojo.xhr.request('POST', this.path, callback, params, undefined, this.XServer, this.baseParams);
			},
			
			newFolder : function(fid, n, d, cb){
				var params = {
			            taskId:'createFolder',
			            folderID : fid,
			            name : n,
			            description : d
					};
				
                mstrmojo.xhr.request('POST', this.path, cb, params, undefined, this.XServer, this.baseParams);
				
			}
			
			
		}
	);
	
})();