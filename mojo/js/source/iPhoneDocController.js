/**
 * iPhoneDocController.js Copyright 2010 MicroStrategy Incorporated. All rights
 * reserved.
 * 
 * @version 1.0
 */
( function() {
    mstrmojo.requiresCls("mstrmojo.registry", 
                         "mstrmojo.iPhoneDoc",
                         "mstrmojo.iPhoneDocBuilder", 
                         "mstrmojo.iPhoneDocDataService",
                         "mstrmojo.DocModel");

    /**
     * Submits as data request to the app.
     * 
     * @param {Any[]} args An array of arguments to be passed to the method.
     * 
     * @private
     */
    function submitDataRequest(params) {
        mstrApp.serverRequest(params);
    }

    function _cleanup() {
        var a = mstrmojo.all, i;

        for (i in a) {
            if (a.hasOwnProperty(i)) {
                mstrmojo.registry.remove(a[i]);
            }
        }
    }

    var docLayout = 'iRoot';

    var docProxy = {

        data : null,
        controller : null,

        render : function(imgCache) {
            //Create the iPhone Doc.
            var doc = new mstrmojo.iPhoneDoc( {
                id : docLayout,
                placeholder : docLayout,
                controller : this.controller,
                renderMode : null
            });

            // Add builder with parent reference to the doc.
            doc.builder = new mstrmojo.iPhoneDocBuilder( {
                parent : doc
            });

            if (!this.error) {

                var docModel = doc.model = new mstrmojo.DocModel(this.data);
                docModel.controller = this.controller;

                docModel.dataService = new mstrmojo.iPhoneDocDataService( {
                    rwb : docModel.bs,
                    msgId : docModel.mid,
                    imgCache : imgCache
                });

                doc.buildChildren();
            }
            doc.render();

            window.setTimeout( function() {
                var keys = [], 
                urls = [], 
                key,
                unc = imgCache.unCachedImg;
                if (unc) {
                    for (key in unc) {
                        if (unc.hasOwnProperty(key)) {
                            keys.push(key);
                            urls.push(unc[key]);
                        }
                    }
                    if(keys.length>0) {
                        submitDataRequest( {
                            cmd : 'cim',
                            imgs : urls.join(',,,'),
                            imgKeys : keys.join(',,,')
                        });
                    }
                }
            }, 100);
        },

        destroy : function() {
            //we do not need transition curtain for rendering a new xtab
            var w = mstrmojo.all[docLayout];
            if (w) {
                var d = w.domNode, 
                    c = d.lastChild, 
                    length = d.childNodes.length, 
                    i;

                for (i = 0; i < length; i++) {
                    //if we have some xtab already rendered, we should clean the dom so that it will not be used as a transition curtain.
                    // w.domNode.innerHTML = "";
                    // window.setTimeout(function() {
                    d.removeChild(d.lastChild);
                    // }, 0);
                }
            }
            _cleanup();
        },

        adjustSize : function() {
            var xt = mstrmojo.all[docLayout];

            // trigger the FillsBrowswer handler on orientation changed.
        xt && xt.monitorWindow();
    }

    };

    function getDocProxy(controller, data) {
        docProxy.controller = controller;
        docProxy.data = data;
        return docProxy;
    }

    /**
     * Main Controller class for iPhone Doc viewer.
     * 
     * @class
     */
    mstrmojo.iPhoneDocController = mstrmojo.declare(
            null, 
            null,
    /**
     * @lends mstrmojo.iPhoneDocController.prototype
     */
    {
        scriptClass : "mstrmojo.iPhoneDocController",

        /**
         * Initializer.
         * 
         * @param {String} props.ttl A title of the controllers first view.
         * @param {String} props.did A report ID.
         * @param {int}    props.st A report subtype.
         */
        init : function init() {
        },

        setData : function(data) {
            this.data = data;
        },

        getProxy : function(data) {
            return getDocProxy(this, data);
        },

        onDrill : function(view, params) {
            submitDataRequest(params);
        },

        onLink : function(view, params) {
            if (params.link) {
                params.linkAnswers = link.toXml();
                delete params.link;
            }
            params.cmd = 'lnk';
            submitDataRequest(params);
        }
    });
})();