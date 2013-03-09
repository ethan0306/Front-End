(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.ObjectInputBox"
    );

    mstrmojo.ACL.UserInputBox = mstrmojo.declare(
            // superclass
            mstrmojo.ObjectInputBox,
            // mixins
            null,
            { 
                item2textCss: function item2textCss(data){
                    return (this._super && this._super(data)) || 
                    {
                        8704: 'u',
                        8705: 'ug'
                    }[data.st] || '';
                },
                getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                    mstrmojo.ACL.UserDataService.searchUserCandidates(params.pattern, !params.isVerify, params.blockCount, callbacks);
                }
   });
 
})();