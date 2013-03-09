(function() {
    
    mstrmojo.requiresCls("mstrmojo.func");
    
    var $FWM = mstrmojo.func.wrapMethods;
    
    /**
     * <p>Returns a generic handler function that will call the same method on the data service (passing whatever arguments are passed to it) after wrapping the callback.</p>
     * 
     * <p>NOTE: Generic handlers must have a required callback object as their last parameter.</p>
     * 
     * @param {String} methodName The name of the method to call on the data service.
     * 
     * @returns Function
     * @private
     */
    function getHandlerFunction(methodName) {
        return function() {
            // Pull the callback out of the last element in the arguments array.
            var model = this,
                args = [].slice.call(arguments),        // Converts arguments object to true array.
                callback = args.pop();
            
            // Wrap the callback with the default success method.
            args.push(mstrmojo.func.wrapMethods({
                success: function (res) {
                	model.setData(res);
                },
                //TQMS 488829 Link drilling can produce prompted report
                prompts: function(res) {
                	model.setPrompts(model.getDataService().getPrompts());
                }
            }, callback));

            // Submit.
            this.submitToDataService(methodName, args);
        };
    }
    
    /**
     * Serves as a handler for execution callback object.
     * 
     * @param {mstrmojo._IsRptModel} model The model to operate on.
     * @param {Object} [data] Optional data response from execution.  If present, the models data property will be set to the value of this parameter.
     * 
     * @private
     */
    function executeHandler(model, data) {
        // Do we have data?
        if (data) {
            // Reset model data.
            model.data = data;
        }
        
        // Set prompts on model.
        //In case of link drilling or hitting the cache we can get success even for prompted reports, so we always need to get prompts from data service.
        model.setPrompts(model.getDataService().getPrompts());
    }
    
    /**
     * A mixin to add common Report Model functionality to other models (Rpt, Graph, etc.).
     */
    mstrmojo._IsRptModel = {
            
        _mixinName: 'mstrmojo._IsRptModel',
        
        setPrompts: function setPrompts(prompts) {
            this.prompts = prompts;
            if (prompts) {
                prompts.host = this;
            }
        },

        getDataService: function getDataService() {
            return this.dataService;
        },
        
        execute: function execute(params, callback) {
            var model = this,
                p = {
                    dssId: params.did
                };
            if ( params.promptsAnswerXML) {
                p.promptsAnswerXML = params.promptsAnswerXML;
            }
            if ( params.linkAnswers) {
                p.linkAnswers = params.linkAnswers;
            }
            this.getDataService().execute(p, $FWM({
                    success: function (res) {
                        executeHandler(model, res);
                    },
                    prompts: function () {
                        executeHandler(model);
                    }
                }, callback));
        },
        
        refresh: function refresh(params, callback){
            var model = this;
            this.getDataService().getResults(
                null,
                $FWM({
                   success: function(res) {
                        executeHandler(model, res);
                   }
                }, callback));           
        },
        
        answerPrompts: function answerPrompts(callback) {
            var model = this;
            this.getDataService().answerPrompts(this.prompts, $FWM({
                success: function (res) {
                    model.data = res;
                }
            }, callback));
        },
        
        /**
         * Calls the requested method on the data server and passes the parameters.
         * 
         * @param {String} methodName The name of the method to call on the data service.
         * @param {Any[]} args An array of arguments to pass.
         * 
         * @private
         */
        submitToDataService : function submitToDataService(methodName, args) {
            var dataService = this.getDataService();
            dataService[methodName].apply(dataService, args);
        },
        
        getPageByTree: function getPageByTree(callback) {
            this.submitToDataService.call(this, 'getPageByTree', [ callback ]);
        },
        
        sort: getHandlerFunction('sort'),
        
        pivot: getHandlerFunction('pivot'),
        
        drillGrid: getHandlerFunction('drillGrid'),
        
        drill2Grid: getHandlerFunction('drill2Grid'),
        
        linkToObject: getHandlerFunction('linkToObject'),
        
        pageBy: getHandlerFunction('pageBy'),
        
        setData: function setData(res) {
            this.data = res;
            //In case of link drilling we need to get prompts with current answers from the
            //data service
            if ( ! this.prompts ) {
                this.setPrompts(this.dataService.getPrompts());
            }
        	
        }
    };
}());