
(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.func",
            "mstrmojo.hash"
            );
    
    var BasicAggMap = {
        '8107C31BDD9911D3B98100C04F2233EA': 'Sum',
        '548C68A0F60811D3ACC300C04F0423DE': 'StdevP',
        "8107C31FDD9911D3B98100C04F2233EA": 'Max',
        "8107C331DD9911D3B98100C04F2233EA": 'GeoMean',
        "B2C0FA4220C711D6AD1400C04F0423DE": 'First',
        "8107C32CDD9911D3B98100C04F2233EA": 'Product',
        "B2C0FA4020C711D6AD1400C04F0423DE": 'Greatest',
        "8107C330DD9911D3B98100C04F2233EA": 'Var',
        "8107C32FDD9911D3B98100C04F2233EA": 'Stdev',
        "8107C32DDD9911D3B98100C04F2233EA": 'Median',
        "B2C0FA4320C711D6AD1400C04F0423DE": 'Last',
        "8107C31CDD9911D3B98100C04F2233EA": 'Count',
        "8107C31DDD9911D3B98100C04F2233EA": 'Avg',
        "8107C31EDD9911D3B98100C04F2233EA": 'Min',
        "8107C32EDD9911D3B98100C04F2233EA": 'Mode',
        "D64F1B10F6C011D3ACC300C04F0423DE": 'VarP',
        "B2C0FA4120C711D6AD1400C04F0423DE": 'Least'
    };
    
    function _sortFunctions(fcts){
        //sort the function categories and the functions under each category
        var fs = function(a, b){
                return mstrmojo.array.stringSorter(a.n, b.n);
            },
            i, len;
        
        fcts = fcts.sort(fs);
        
        for(i=0, len=fcts.length;i<len;i++){
            fcts[i].fns = fcts[i].fns.sort(fs);
        } 
        return fcts;
    }

    /**
     * This class provides the methods to communicate with web server/i-server to retrieve information required by metric editor. 
     * It also provides caching for performance purpose. 
     */
    mstrmojo.ME.MetricDataService = mstrmojo.provide(
            "mstrmojo.ME.MetricDataService", 
            {

                functions: null,
                
                metricComponents: null,
                
                functionsDetails: null,
                
                getMetricDefintion: function getMetricDefintion(params, callbacks){
                    var taskParams =  {
                            taskId:'getMetricDefinition',
                            metricId: params.id,
                            outputFlags: 65599, 
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                validateMetric: function validateMetric(params, callbacks){
                    var taskParams =  {
                            taskId:'validateMetric',
                            metricId: params.metricId,
                            tokenStreamXML: params.tokenStreamXML, 
                            metricXML: params.metricXML,
                            outputFlags: 327695,
                            //localSymbolFolderXML: params.localSymbolFolderXML,
                            sessionState: mstrApp.sessionState
                    };
                    if(mstrmojo.string.isEmpty(params.metricId)){
                        taskParams.isNew = true;
                    }
                    
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                }, 
                
                getMetricComponents: function getMetricComponents(params, callbacks){
                    var me = this,
                        mc = this.metricComponents;
                    if(mc){
                        callbacks.success(mc);
                        return;
                    } else {
                        callbacks.success = mstrmojo.func.composite([callbacks.success, function(res){
                            me.metricComponents = res;
                        }]);
                    } 
                    var taskParams =  {
                            taskId:'searchMetadata',
                            blockBegin: params.blockBegin,
                            blockCount: params.blockCount,
                            searchPattern: params.pattern,
                            //nameWildcards: 2,
                            rootFolderType: 24,
                            objectType: '11,12,13,43',//function, fact, attribute, transformation
                            recursive: true,
                            styleName: 'MojoFolderStyle',
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                getAttributes: function getAttributes(params, callbacks){
                    var taskParams =  {
                            taskId:'searchMetadata',
                            blockBegin: params.blockBegin,
                            blockCount: params.blockCount,
                            searchPattern: params.pattern,
                            rootFolderType: 26,
                            //rootFolderID: '8D678DA511D3E4981000E787EC6DE8A4',
                            objectType: 12,
                            recursive: true,
                            styleName: 'MojoFolderStyle',
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                getFacts: function getFacts(params, callbacks){
                    var taskParams =  {
                            taskId:'searchMetadata',
                            blockBegin: params.blockBegin,
                            blockCount: params.blockCount,
                            searchPattern: params.pattern,
                            rootFolderType: 29,
                            objectType: 13,
                            recursive: true,
                            styleName: 'MojoFolderStyle',                            
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);    
                },
                
                getMetrics: function getMetrics(params, callbacks){
                    var taskParams =  {
                            taskId:'searchMetadata',
                            blockBegin: params.blockBegin,
                            blockCount: params.blockCount,
                            searchPattern: params.pattern,
                            rootFolderType: 5,
                            objectType: 4,
                            recursive: true,
                            styleName: 'MojoFolderStyle',                            
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);  
                },                
                
                getFunctions: function getFunctions(callbacks){
                    var me = this,
                        fcts = this.functions || window.sessionStorage && window.sessionStorage.getItem('functions');
                    
                    if(fcts){
                        fcts = _sortFunctions(eval('(' + fcts + ')').fncs);
                        callbacks.success(fcts);
                    } else {
                        var cb = {failure: callbacks.failure, textResponse: true},
                            taskParams =  {
                                taskId:'getSystemFunctions',
                                includeFunctionDetails: false,
                                functionFlags: 2,
                                sessionState: mstrApp.sessionState
                            };
                        
                        cb.success = function(res){
                            //caching
                            if(window.sessionStorage){
                                window.sessionStorage.setItem('functions', res);
                            }      
                            me.functions = res; 
                            
                            fcts = _sortFunctions(eval('(' + res + ')').fncs);

                            callbacks.success(fcts);
                        };
                        mstrmojo.xhr.request('POST', mstrConfig.taskURL, cb, taskParams);
                    }                    
                },

                getAggFunctions: function getAggFunctions(){
                    if(this._aggFunctions){
                        return this._aggFunctions;
                    }
                    
                    var fcts = this.functions || window.sessionStorage && window.sessionStorage.getItem('functions');
                    
                    if(!fcts){
                        mstrmojo.alert("We shall not reach this point!");
                    }
                    
                    fcts = _sortFunctions(eval('(' + fcts + ')').fncs);
                    
                    //TO-DO: We shall find a way to indicate a package is basic functions, instead of hardcode here. 
                    fcts = mstrmojo.array.filter(fcts[0].fns, function(item){
                         return BasicAggMap[item.did];
                    });

                    return fcts;   
                },
                
                getFunctionCatList: function getFunctionCatList(){
                    if(this._functionCatList){
                        return this._functionCatList;
                    }
                    
                    var fcts = this.functions || window.sessionStorage && window.sessionStorage.getItem('functions');
                    
                    if(!fcts){
                        mstrmojo.alert("We shall not reach this point!");
                    }
                    
                    fcts = _sortFunctions(eval('(' + fcts + ')').fncs);
                    
                    fcts[0].fns = mstrmojo.array.filter(fcts[0].fns, function(item){
                        return !BasicAggMap[item.did];  
                    });
                    
                    fcts = mstrmojo.hash.make(fcts,mstrmojo.Arr);
                    
                    this._functionCatList = fcts;
                    
                    return fcts;
                },
                
                getFunctionDetails: function getFunctionDetails(params, callbacks){
                    var taskParams =  {
                            taskId:'getSystemFunctions',
                            functionId: params.did,
                            includeFunctionDetails: true,
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                getTransformations: function getTransformations(params, callbacks){
                    var taskParams =  {
                            taskId:'searchMetadata',
                            blockBegin: params.blockBegin,
                            blockCount: params.blockCount,
                            searchPattern: params.pattern,
                            rootFolderType: 38,
                            objectType: 43,
                            recursive: true,
                            styleName: 'MojoFolderStyle',                            
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);  
                },
                
                getFilters: function getFilters(params, callbacks){
                    var taskParams =  {
                            taskId:'searchMetadata',
                            blockBegin: params.blockBegin,
                            blockCount: params.blockCount,
                            searchPattern: params.pattern,
                            rootFolderType: 4,
                            objectType: 1,
                            recursive: true,
                            styleName: 'MojoFolderStyle',  
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                getAttributeForms: function getAttributeForms(params, callbacks){
                    var taskParams =  {
                            taskId:'getAttributeForms',
                            attributeID: params.attributeID,
                            displayedForms: params.displayedForms,
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                },
                
                getSubtotalFunctions: function getSubTotalFunctions(params, callbacks){
                    var taskParams =  {
                            taskId:'searchMetadata',
                            objectType: '1025,1026',
                            recursive: true,
                            sessionState: mstrApp.sessionState
                    };
                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams);
                }
            
            }); 
                 
})();