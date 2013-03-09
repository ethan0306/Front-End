(function(){

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo._IsRptModel");
    
    /**
     * <p>A model for handling Report Graph interactivity.</p>
     * 
     * @class
     * @extends mstrmojo.Obj
     * @borrows mstrmojo._IsRptModel
     */
    mstrmojo.GraphModel = mstrmojo.declare(
        mstrmojo.Obj,
        
        [ mstrmojo._IsRptModel ],
        
        /** 
         * @lends mstrmojo.GraphModel.prototype
         */
        {            
            scriptClass: "mstrmojo.GraphModel"
        }
    );
}());