(function(){

    mstrmojo.requiresCls("mstrmojo.Obj");

    mstrmojo.maps.AndroidMapModel = mstrmojo.declare(
        mstrmojo.Obj,
        
        null,
        
        /** 
         * @lends mstrmojo.maps.AndroidMapModel.prototype
         */
        {            
            scriptClass: "mstrmojo.maps.AndroidMapModel",

            getVisProps: function() {
                return this.data.vp;
            },
            
            /*
                STUB METHODS -             
            */
            
            setPrompts: function setPrompts(prompts) {},

            getDataService: function getDataService() {},
                        
            execute: function execute(params, callback) {},
            
            answerPrompts: function answerPrompts(callback) {},
            
            getPageByTree: function getPageByTree(callback) {},                        
            
            sort: function sort (params, callback) {},
            
            pivot: function pivot (params, callback) {},
            
            drillGrid: function drillGrid (params, callback) {},
            
            drill2Grid: function drill2Grid (params, callback) {},            

            linkToObject: function linkToObject (params, callback) {},
            
            pageBy: function pageBy(pageByKeys, callback) {},
                        
            saveRWProps: function saveRWProps(nodeKey, props, type, loadData, callback) {}
         
        }
        
 
    );
})();