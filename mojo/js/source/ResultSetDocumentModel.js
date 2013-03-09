(function () {
    
    mstrmojo.requiresCls("mstrmojo.DocModel",
                         "mstrmojo.func",
                         "mstrmojo.hash");

    var $FWM = mstrmojo.func.wrapMethods,
        $HSH = mstrmojo.hash;
    
    function wrapCallback (callback) {
        var model = this;
        return $FWM({
            success: function (res) {
                mstrmojo.hash.copy(res, model);
            }
        }, callback);
    }
    
    function submitToDataService(methodName, args) {
        var dataService = this.getDataService();
        dataService[methodName].apply(dataService, args);
    }

    function getPromptsCallback() {
        var model = this;
        
        return function (res) {
            model.setPrompts(model.getDataService().getPrompts());
        };
    }

    mstrmojo.ResultSetDocumentModel = mstrmojo.declare(

        mstrmojo.DocModel,
        
        null,
        
        /**
         * @lends mstrmojo.ResultSetDocumentModel.prototype
         */
        {
            scriptClass: 'mstrmojo.ResultSetDocumentModel',
            
            setPrompts: function setPrompts(prompts) {
                this.prompts = prompts;
                if ( prompts ) {
                    prompts.host = this;
                }
            },
                
            execute: function execute(params, callback, resParams) {
                var model = this,
                    p = { 
                         dssId: params.did, 
                         objType: params.objType || params.t  //Params
                    };
                    if ( params.projectID ) {
                        p.projectID = params.projectID;
                    }
                    if ( params.promptsAnswerXML) {
                        p.promptsAnswerXML = params.promptsAnswerXML;
                    }
                    if ( params.linkAnswers) {
                        p.linkAnswers = params.linkAnswers;
                    }
                
                submitToDataService.call(this, 'execute', [p, $FWM({
                    success: function (res) {
                        $HSH.copy(res, model);
                        //In case of link drilling or hitting the cache 
                        //we can get success even for prompted reports.
                        //So we need to get prompts from data service
                        model.setPrompts(model.getDataService().getPrompts());
                    },
                    prompts: getPromptsCallback.call(model)
                    
                }, callback), resParams]);
            },
            
            answerPrompts: function answerPrompts(callback) {
                submitToDataService.call(this, 'answerPrompts', [ this.prompts, wrapCallback.call(this, callback) ]);
            },
            
            linkToObject: function linkToObject (params, callback) {
                var model = this,
            		cb = $FWM({
	                    prompts: getPromptsCallback.call(this)
	                }, callback),
	                sc = cb.success;
                cb.success = function(res) {
                    $HSH.copy(res, model);
                    //TQMS 495454 We need to save prompts to be able to re-prompt
                    model.setPrompts(model.getDataService().getPrompts());
                    //TQMS 530077. Remember group by elements in case we need to change a layout 
                    // because of orientation. 
                	model.gbElements = params.groupByElements;
                	sc(res);
                	delete model.gbElements;
                };
                submitToDataService.call(this, 'linkToObject', [ params, cb]);
            }
        }
    );
}());