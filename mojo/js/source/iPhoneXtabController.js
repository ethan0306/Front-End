/**
 * iPhoneXtabController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */

(function() {
    
    var USE_DEFAULT_ANSWER = 8;    

    /**
     * Submits as data request to the app.
     * 
     * @param {Any[]} args An array of arguments to be passed to the method.
     * 
     * @private
     */
    function submitDataRequest (params) {
        mstrApp.serverRequest(params);
    }

    function _cleanup() {
        var a = mstrmojo.all;

        for(var i in a) {
            /*if(a[i].id == 'iToolbar') {
            a[i].set('visible', false);
                if(a[i].isOpen) {
                    a[i].hideToolbar();
                }
                continue;
            }*/
            mstrmojo.registry.remove(a[i]);
        }
    }    

    var xmlencode = function(string) {
        return string.replace(/\&/g,'&'+'amp;').replace(/</g,'&'+'lt;').replace(/>/g,'&'+'gt;').replace(/\'/g,'&'+'apos;').replace(/\"/g,'&'+'quot;');
    };    
    
    var curXtabId = 'iRoot';
    
    var xtabProxy = {
            
        data: null,
        controller: null,
                        
        adjustSize: function() {
            var xt = mstrmojo.all[curXtabId];

            // trigger the FillsBrowswer handler on orientation changed.
            xt && xt._monitorWindow();
        },

        getRWInfo: function() {
            var rw = mstrmojo.all[curXtabId].gridData.rw;
            return '<ifd tr="' + rw.tr + '" wmr="' + rw.wmr + '" tc="' + rw.tc + '" wmc="' + rw.wmc  + '" wsr="' + rw.wsr + '" wsc="' + rw.wsc + '"/>';
        },

        // TODO rename this to getReportInfo
        getPBInfo: function() {
            var str = '',
                gd = mstrmojo.all[curXtabId].gridData,
                phs = gd.ghs.phs,
                ci = gd.ci,
                n = gd.n || "";

            if (phs || ci || n) {
                // switch from <info> to <report_info n="xxx"> once we can determine name
                str = '<report_info n="' + xmlencode(n) + '">';
                if (ci) {
                    str += '<ci cid="' + ci.cid + '" tp="' + ci.tp + '" utm="' + ci.utm + '"/>';
                }
                if (phs) {
                    str += '<pbe>';
                    //<pbe><pb ei="BB:8D679D4B11D3E4981000E787EC6DE8A4:1:2:0:2:1:3:1:Northeast"/><pb ei="BB:8D679D3511D3E4981000E787EC6DE8A4:1:2:0:2:1:3:11:Boston"/></pbe>
                    var cets = phs.cets;
                    for (var i in cets) {
                        str += '<pb ei="' + xmlencode(cets[i].eid) + '"/>';
                    }
                    str += '</pbe>';
                }
                str += '</report_info>';
            }
            return str;
        },

        hasPageBy: function() {
            var phs = mstrmojo.all[curXtabId].gridData.ghs.phs;
            if (phs && phs.cets) {
                return "1";
            }
            return "0";
        },

        /*dataDownloaded: function(jsonStr) {
            var xtab = mstrmojo.all[curXtabId],
                json = eval(jsonStr);

            if(json.eg) {
                return json.eg;
            }
            if(xtab && xtab.dataDownloaded) {
                xtab.dataDownloaded(
                    {
                        data: json
                    }
                );
            }
            return ;
        },*/
        
        render: function(cacheMap) {
            
            var imgCacheMap = cacheMap,
                xTabId = curXtabId,
                json = this.data;

            //get the rendered xtab as the transition curtain
            //var curtain = mstrmojo.all[curXtabId] && mstrmojo.all[curXtabId].domNode;
            _cleanup();

            if(json && json.eg) {
                return json.eg;
            }

            var xtab = new mstrmojo.iXtab({
                id: xTabId,
                placeholder: curXtabId,
                formatResolver:{
                    getFormat:function(/* JSON */ defn) {
                        return defn.fmts;
                    }
                },
                
                defn : new mstrmojo.Model ({
                        fmts:{
                            top: "0",
                            left:"0",
                            // todo0 - use one value for later.
                            scrollarea: {
                             y: 459,
                             x: 319
                            }
                        }
                    }),
                imgCacheMap: imgCacheMap,
                controller: this.controller
            }); 
            
            xtab.model = new mstrmojo.XtabModel({controller: this.controller});
            xtab.update({'data': json});
            xtab.render();
                
            return ;
        },
        
        destroy: function() {
            //we do not need transition curtain for rendering a new xtab
            var w = mstrmojo.all[curXtabId];
            if(w) {
                var d = w.domNode,
                    c = d.lastChild,
                    length = d.childNodes.length,
                    i = 0;

                for (i = 0; i < length; i++) {
                    //if we have some xtab already rendered, we should clean the dom so that it will not be used as a transition curtain.
                    //w.domNode.innerHTML = "";
                    window.setTimeout(function() {
                        d.removeChild(d.lastChild);
                    }, 0);
                }
            }
        }        
    };
    
    function getXtabProxy(controller, data) {
        xtabProxy.controller = controller;
        xtabProxy.data = data;
        return xtabProxy;
    }
    
    
    /**
     * Main Controller class for iPhone applications.
     * 
     * @class
     * @extends mstrmojo.XtabController
     * 
     * @borrows mstrmojo._FillsBrowser
     */
    mstrmojo.iPhoneXtabController = mstrmojo.declare(
        null,
        null,
        /**
         * @lends mstrmojo.iPhoneXtabController.prototype
         */
        {
            scriptClass: "mstrmojo.iPhoneXtabController",
            
            /**
             * Initializer.
             * 
             * @param {String} props.ttl A title of the controllers first view.
             * @param {String} props.did A report ID.
             * @param {int}    props.st A report subtype.
             */
            init: function init(){
            },
            
            setData: function(data) {
                this.data = data;
            },

            getProxy: function(data) {
                return getXtabProxy(this, data);
            },
            
            touchTap: function() {
                var params = {cmd: 'tap'};
                submitDataRequest(params);
            },
            
            swipe: function (params) {
                submitDataRequest(params);
            },
            
            sortGrid: function sortGrid(view, action) {
                var params = {cmd: 'sort', sortKey: action.sortKey, sortOrder: action.sortOrder, clearSort: 1, subtotalPos: action.subTotalsPos};                
                submitDataRequest(params);
            },
            
            pivotGrid: function pivotGrid(view, action) {
                var params = {cmd: 'pivot', pos: action.pos, axis: action.axis, objectType: action.objectType};
                submitDataRequest(params);
            },
            
            onDrill: function onDrill(view, action) {
                var elems = action.drillElements,
                    params = {
                        cmd: 'drl',
                        dk: action.drillPathKey
                    };

                if (elems) {
                  var arr = elems.split("A");
                  params.a = arr[0];
                  params.d = arr[1];
                  params.o = arr[2];
                }                
                submitDataRequest(params);
            },
                        
            onLink: function onLink(view, action) {
                // here we want to send another piece of information besides linkAnswer. We want to pass on
                // the overall answer mode - whether all the links are going to be answered using default answer.
                // this will be used the the native code to cache.
                if ( action.link) {
                    action.linkAnswers = link.toXml();
                    delete action.link;
                }

                // initialize with the the daMode attribute of the link definition.
                var params = mstrmojo.hash.copy(action, {cmd: 'lnk'});
                    linkInfo = action.linkInfo,
                    areAllAnswersDefault = (linkInfo.daMode == USE_DEFAULT_ANSWER);

                // if it has all (remaining) answers set for default answering, then we move on to check individual link answers.
                if(areAllAnswersDefault) {
                    var answers = linkInfo.ans;

                    if(answers) {
                        for (i = 0, cnt = answers.length; i < cnt; ++i){
                            // check the answer mode of each individual answer.Any one without default answers => value of false overall.
                            if(answers[i].m != USE_DEFAULT_ANSWER) {
                                areAllAnswersDefault = false;
                                break;
                            }
                        }
                    }
                }

                // add our computed value for areAllAnswersDefault
                params.areAllAnswersDefault = areAllAnswersDefault ? 1 : 0;
                
                var target = linkInfo.target;
                params.tty = target && target.t;
                
                delete params.linkInfo;
                delete params.linkTarget;
                delete params.srcMsgId;
                // time to submit the form.
                submitDataRequest(params);
           }            
            
        });
})();