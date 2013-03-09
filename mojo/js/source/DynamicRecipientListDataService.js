(function(){
    
    mstrmojo.requiresCls("mstrmojo.xhr",
            "mstrmojo.string");
    

    /**
     * This class provides the methods to communicate with web server/i-server to retrieve information required by Dynamic Recipient list
     */
    mstrmojo.DynamicRecipientListDataService = mstrmojo.provide(
            "mstrmojo.DynamicRecipientListDataService", 
            {
                getDynamicRecipientList: function getDynamicRecipientList(params, callbacks){
                    var taskParams =  {
                            taskId:'getDynamicRecipientList',
                            objectID: params.did,
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                getDynamicRecipientLists: function getDynamicRecipientLists(params, callbacks){
                    var taskParams =  {
                            taskId:'getDynamicRecipientLists',
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                deleteDynamicRecipientList: function deleteDynamicRecipientList(params, callbacks){
                    var taskParams =  {
                            taskId:'deleteDynamicRecipientList',
                            objectID: params.did,
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                browseAttributeForms: function browseAttributeForms(params, callbacks){
                    var taskParams =  {
                            taskId:'browseAttributeForms',
                            reportId: params.cntid,
                            contentType: params.contentType || 7,
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                saveDynamicRecipientList: function saveDynamicRecipientList(params, callbacks){
                    var taskParams =  {
                            taskId:'saveDynamicRecipientList',
                            name: params.n,
                            drlXml: params.drlXml,
                            sessionState: mstrApp.sessionState
                    };
                    if(params && params.did){
                        taskParams.objectID = params.did;
                    }
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                obj2Xml: function obj2Xml(v, root) {
                    
                    var r = '',
                    removed = {//model properties which do not want to serialized.
                            _meta_usesSuper: false,
                            id: false,
                            scriptClass: false,
                            audibles: false,
                            attachEventListener: false,
                            destroy: false,
                            detachEventListener: false,
                            init: false,
                            raiseEvent: false,
                            set: false
                    },
                    config = {
                            isSerializable: function(nodeName, jsons, index) {
                                                        return (removed[nodeName] === false)? false : true;
                                                },
                            skipNull: false,
                            convertBoolean: false
                   };
                     
                   r += mstrmojo.string.json2xml(root, v, config);
                   return r;
                }
                
            }); 
                 
})();