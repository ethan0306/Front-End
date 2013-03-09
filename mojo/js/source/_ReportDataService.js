(function () {
    /**
     * <p>A mixin with common methods XtabDataService and GraphDataService</p>
     * 
     * @class
     * @public
     */
    mstrmojo._ReportDataService = mstrmojo.provide(
        'mstrmojo._ReportDataService',
        
        /**
         * @lends mstrmojo._ReportDataService
         */
        {
            _mixinName: 'mstrmojo._ReportDataService',
            
            getPageByTree: function getPageByTree(callback) {
                mstrApp.serverRequest({
                    taskId: 'getPageByTree',
                    msgID: this.msgId
                }, callback);
            },
            
            pageByUnitsToKeys: function pageByUnitsToKeys(pbUnits) {
                var pbArr = [],
                    i;
                
                for (i = 0; i < pbUnits.length; i++) {
                    var p = pbUnits[i];
                    if (mstrApp.useBinaryFormat) {
                        pbArr.push(p.v);
                    } else {
                        pbArr = pbArr.concat([ p.id, p.tp, p.v ]);
                    }
                }
                return pbArr.join('\u001F');
            }
        }
    );
}());
