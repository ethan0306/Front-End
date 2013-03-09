(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.ObjectInputBox"
    );
    
    var E = mstrmojo.expr;

    mstrmojo.ME.ConditionInputBox = mstrmojo.declare(
            // superclass
            mstrmojo.ObjectInputBox,
            // mixins
            null,
            { 
                cssClass: 'mstrmojo-ObjectInputBox condition',
                
                browseItemVisible: true,

                folderLinksContextId : 10, 
                
                browsableTypes: [E.TP.FOLDER, E.TP.FILTER].join(','),
                
                noEditButton: true,
                
                maxObjectCount: 1,
                
                item2textCss: function item2textCss(data){
                    return (this._super && this._super(data)) || 
                    {
                        1: 'f',
                        '-99': 'br'    //browse....
                    }[data.t] || '';
                },
                getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                    mstrmojo.ME.MetricDataService.getFilters(params, callbacks);
                }
   });
 
})();