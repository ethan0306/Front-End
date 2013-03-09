(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.TreeBrowserNode",
            "mstrmojo.TreeBrowser",
            "mstrmojo.ACL.UserDataService"
    );
      

    /**
     * UserTreeBrowser is a widget that allows the user to browse into the user/user group hierarchy and select muliple users/user groups
     * across different browser. You can make it only select under one branch by setting selectionAcrossBranch to false.
     */
    mstrmojo.ACL.UserTreeBrowser = mstrmojo.declare(
        // superclass
        mstrmojo.TreeBrowser,
        // mixins
        null,
        {   
            scriptClass:'mstrmojo.ACL.UserTreeBrowser',
            
            itemIdField: 'did',

            branchClickPolicy: mstrmojo.TreeBrowserEnum.BRANCH_POLICY_SELECT,
            
            getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){
                var DS = mstrmojo.ACL.UserDataService;
                if(params.isRoot){
                    DS.getTopLevelGroups(params, callbacks);
                } else {
                    DS.getMembers(params, callbacks);
                }
            }, 
            
            isBranch: function isBranch(data){
                return data.isGroup;
            },
            
            item2textCss: function item2textCss(data){
                return (this._super && this._super(data)) || 
                {
                    8704: 'u',
                    8705: 'ug'
                }[data.st];
            }
   });
 
})();