 (function(){
       mstrmojo.requiresCls("mstrmojo.Obj",
                            "mstrmojo.mobileListView");
        
       // instance generation
       // mobile configuration list model   
       mstrmojo.insert({
           id: "confIndex",
           scriptClass: "mstrmojo.Obj",
           
           _set_children: function(n, v) {
               this.children = v;
               mstrmojo.all.confListTable.set("model", this.children);
               return true;
           },
           
           refreshData: function() {
           
               var that = this;    
               mstrmojo.xhr.request("POST", 
                                   mstrConfig.taskURL,
                                   {
                                         success: function(response){
                                                 delete that.children;
                                                 if (response && response.cnfs.length !== 0) {
                                                     that.set("children", response.cnfs);//whole data for config index list
                                                 } else {
                                                     that.set("children", undefined);//whole data for config index list
                                                 }
                                         },
                                        failure: function(response){
                                                 delete that.children;
                                                 that.set("children",undefined);//needed to trigger set() event.
                                                 mstrmojo.mobileConfigUtil.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                         }
                                   },
                                   {taskId:"getMobileConfigurationIndex",  taskEnv: "xhr"},
                                   false,
                                   null
                                 );
           },

           postCreate: function(){
                   this.refreshData();
          }
        });
})();