(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.ObjectInputBox"
    );

    mstrmojo.ME.TransformInputBox = mstrmojo.declare(
            // superclass
            mstrmojo.ObjectInputBox,
            // mixins
            null,
            { 
                cssClass: 'mstrmojo-ObjectInputBox transform',
                //browseItemVisible: true,
                items:[],
                
                noEditButton: true,
                
                item2textCss: function item2textCss(data){
                    return (this._super && this._super(data)) || 
                    {
                        43: 'tr',
                        '-99': 'br'    //browse....
                    }[data.t] || '';//default is report level
                },
                getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                    mstrmojo.ME.MetricDataService.getTransformations(params, callbacks);
                }
   });
 
})();