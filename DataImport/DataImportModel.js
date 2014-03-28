/**
 * The model object of Data Import page
 */
(function(){
    mstrmojo.requiresCls(
            "mstrmojo.QB.QBuilderModel"
        );    
    
    var BROWSE_TYPES = {
        MAPPING: 1,
        DATA : 2,
        SOURCE : 8,
        SHEETS : 16
    };
    
    var _S = mstrmojo.string,
        _H = mstrmojo.hash,
        _A = mstrmojo.array;
    
    mstrmojo.DI.DataImportModel = mstrmojo.declare(
        // superclass
    	mstrmojo.Obj,
        // mixins
        null,
        
        {
            id: "DIModel",
            scriptClass: "mstrmojo.DI.DataImportModel",
            
            curPg: 0,
            
            // we inherit some properties from parent class:
            // msgid:
            // dataset:
            // mappings:
            
            srce: null,
            
            shts: null,
            
//            /**
//             * we should build new structure 'data' and 'maps' model for GUI use
//             */
//            newData: null,
//            
//            newMaps: null,
            
            cachedDatas: {}, 
            
            cachedMaps: {},
            
            cid: null, //the cube report id after save
            
            curIx: 0, //the index of the excel sheet
            
            BTS: BROWSE_TYPES,
            
            loadRptData: function loadRptData(prevFg, shtIx, cb) {
                var params = {
                        taskId: 'qBuilder.GetReportXDADefinition',
                        messageid: this.msgid,
                        sessionState: mstrApp.sessionState,
                        browsetype: 4,
                        previewflag: prevFg
                };
                
                if (shtIx >= 0) {
                    params.sheetIndex = shtIx;
                }
                this.showWaitPage();
                
                mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, this.restructCB(cb), params);
            },
          
            
            
            getQuota: function getQuota(callback){
           	 var mdl = this;
                var taskParams =  {
                    taskId:'qBuilder.GetQuota',
                    sessionState: mstrApp.sessionState
                };
                var cb = {
       			 success: function(res){
               	     if (callback && callback.success){
               	    	 callback.success(res);
               	     }
      				 },
       			 failure: function(res){ 
      					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
     				 }			
       		 };
                mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams);
            },
            
            postCreate: function(){
                //TODO
            }
        }
    );

})();