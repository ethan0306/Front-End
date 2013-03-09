
(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.func"
            );
    

    /**
     * This class provides the methods to communicate with web server/i-server to retrieve user/user group information. It also provides 
     * caching for performance purpose. 
     */
    mstrmojo.ACL.UserDataService = mstrmojo.provide(
            "mstrmojo.ACL.UserDataService", 
            {
                topgroups: null,
                
                userCandidates: null, 
                
                /**
                 * This method allows to retrieve all members of a user group. 
                 */
                getMembers: function(params, callbacks){
                    var taskParams =  {
                            taskId:'getUserEntityInfo',
                            blockBegin: params.blockBegin,
                            blockCount: params.blockCount,
                            userEntityID: params.data.did,
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                /**
                 * Retrieve all top level user groups. 
                 */
                getTopLevelGroups: function getTopLevelGroups(params, callbacks){
                    var me = this;
                    
                    if(this.topgroups){
                        callbacks.success({items: this.topgroups});
                        return;
                    } else {
                        callbacks.success = mstrmojo.func.composite([callbacks.success, function(res){
                            me.topgroups = res.items;
                        }]);
                    }
                    this.getUsers({topGroupsOnly:true}, callbacks);
                },
                
                /**
                 * Search for all users/user groups matching with certain search pattern/name pattern. 
                 */
                searchUserCandidates: function searchUserCandidates(pattern, wildCard, blockCount, callbacks){
                    var params = {
                            blockBegin: 1, 
                            blockCount: blockCount,
                            searchPattern: pattern,
                            nameWildcards: wildCard ? 1 : 2
                    };
                    this.getUsers(params, callbacks);
                },
                
                /**
                 * Retrieve the first n users/user groups in a system (n = blockCount parameter). 
                 */
                getUserCandidates: function getUserCandidates(blockCount, callbacks){
                    if(this.userCandidates){
                        callbacks.success(this.userCandidates);
                        return;
                    } else {
                        var successWas = callbacks.success,
                            me = this;
                        callbacks.success = function(res){
                            me.userCandidates = {items: res.items, isComplete: (res.bc == -1 || (res.bb + res.bc > res.sz))};
                            successWas(me.userCandidates);
                        };
                    }
                    var params = {
                            blockBegin: 1,
                            blockCount: blockCount,
                            nameWildcards: 1
                    };
                    this.getUsers(params, callbacks);  
                },
                
                getUsers: function getUsers(params, callbacks){
                    var ps = {taskId:'getUserServices', 
                            sessionState:mstrApp.sessionState};
                    mstrmojo.hash.copy(params, ps);
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, ps); 
                }
            
            }); 
                 
})();