(function(){

    mstrmojo.requiresCls("mstrmojo.XtabModel",
                         "mstrmojo._IsRptModel",
                         "mstrmojo.func");
    
    /**
     * <p>A model for handling Report Xtab interactivity.</p>
     * 
     * @class
     * @extends mstrmojo.XtabModel
     * @borrows mstrmojo._IsRptModel
     */
    mstrmojo.RptXtabModel = mstrmojo.declare(
        mstrmojo.XtabModel,
        
        [ mstrmojo._IsRptModel ],
        
        /** 
         * @lends mstrmojo.RptXtabModel.prototype
         */
        {            
            scriptClass: "mstrmojo.RptXtabModel",
            
            getPageByTree: function getPageByTree(callback) {
                // Do we NOT have any page by data?
                if (!this.data.ghs || !this.data.ghs.phs) {
                    // Nothing to do.
                    return;
                }
                this._super(callback);
            },
            
            
            /**
             * Request new incremental fetch grid data from the server.
             * 
             * @params params The task parametes object.
             */
            downloadGridData: function downloadGridData(params) {                
                var widgetID = params.xtabId,
                    memo = params.memo,
                    w = mstrmojo.all[widgetID],
                    dataService = this.getDataService();
                
                var callback = {
                        /**
                         * Callback for when the Task returns back successfully.
                         * 
                         * @param The task result.
                         */
                        success: function (res) {
                            //Do we have the Xtab widget and do we have some data returned?
                            if (res && w) {
                                //Call dataDownloaded on the widget so as to render the new grid data.
                                w.dataDownloaded({data:res}, memo);
                                
                                //Update the CSS
                                w.updateXtabStyles(res.cssString);
                            }
                        },

                        /**
                         * Callback for when the task returns in error.
                         */
                        failure: function() {
                            if(w.dataDownloadErr) {
                                w.dataDownloadErr();
                            }
                        }
                };

                //Delegate it to the dataservice to make the task call.
                dataService.downloadGridData(params, callback);                
            }
        }
    );
}());