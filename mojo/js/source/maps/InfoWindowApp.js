/**
  * InfoWindowApp.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>Skeletal application object for displaying map info windows.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */
(function() {

    mstrmojo.requiresCls("mstrmojo.Obj",
                         "mstrmojo.Container",
                         "mstrmojo.Label",
                         "mstrmojo.hash", 
                         "mstrmojo.func",
                         "mstrmojo.dom",
                         "mstrmojo.maps.InfoWindow",
                         "mstrmojo.maps.InfoWindowController",
                         "mstrmojo.MobileDoc",
                         "mstrmojo.MobileDocBuilder",
                         "mstrmojo.DocModel",
                         "mstrmojo.android.AndroidViewFactory",
                         "mstrmojo.MobileConfiguration",
                         "mstrmojo._CanMakeServerProxyRequests"
                     );
    
    var $DOM = mstrmojo.dom;

    function handleError(res, app) {
        var msg = [],
            map = {
                name: 'Exception',
                message: 'Error',
                sourceURL: 'Source URL',
                fileName: 'File',
                lineNumber: 'Line',
                line: 'Line',
                method: 'Method'
            };
        
        // Make sure res exists.
        res = res || {};

        // Iterate map and create message.
        mstrmojo.hash.forEach(map, function (v, n) {
            if (n in res) {
                msg.push(v + ': ' + res[n]); 
            }
        });
        
        // Does the object have a response header?
        if (res.getResponseHeader) {
            // Add the response header.
            msg.push('XHR: ' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
        }
        
        // Convert to string.
        msg = msg.join('\n');
        
        // Do we have an app?
        if (app && app.rootView) {
            // Make sure the message is hidden.
            app.rootView.hideMessage();
        }
        
        if (!res.handledError && msg.length > 0) {
            mstrmojo.alert(msg);
            res.handledError = true;
        }
        
        mstrmojo.dbg(res.stack || msg);
    }
    
    function onWindowError(errMsg, fName, lineNum) {
        handleError({ 
            message: errMsg, 
            fileName: fName, 
            lineNumber: lineNum 
        });
    }
    
    function _getDocParams(dd) { 
        return {
            ab: dd.ab,
            did: dd.did,
            st: dd.st,
            ttl: dd.ttl
        };
    }
    
    function _getDocModel(dd) {
        return {
            mid: dd.mid,
            bs: dd.bs,
            defn: dd.defn,
            data: dd.data
        };
    }

    /**
     * A singleton class representing mobile application. It provides application entry point as
     * well as a bunch of application-level services. Any code within the application can access the
     * instance of this class via mstrApp global variable.
     * 
     * @class
     * @extends mstrmojo.Obj
     * 
     */
    mstrmojo.maps.InfoWindowApp = mstrmojo.declare(
        mstrmojo.Obj,
        
        [mstrmojo._CanMakeServerProxyRequests],  // mixins

        /**
         * @lends mstrmojo.maps.InfoWindowApp.prototype
         */
        {
            scriptClass: "mstrmojo.maps.InfoWindowApp",
            
            init: function init(props){
                this._super(props);
                var fn = window.onerror;
                window.onerror = (fn) ? mstrmojo.func.composite([ onWindowError, fn ]) : onWindowError;

                // hook up privledged method
                this.handleError = handleError;
            },
            
            /**
             * Application entry point.
             * 
             */
            start: function start() {
                
                // set up the configuation in case anyone needs a setting and                
                // save it so we store it in the LocalStorage; MobileConfiguration will look there or use a hard coded default
                if ( !this.onMobileDevice() ) {
                    mstrMobileApp.saveConfiguration( mstrMobileApp.getConfiguration() );
                }
                
            	mstrMobileApp.setBinaryFormat(this.getConfiguration().getBinaryMode());
            	this.useBinaryFormat = mstrMobileApp.useBinaryFormat();  
                                
                // Create view...
                var vw = this.rootView = new mstrmojo.Container({
                    id: "rootView",
                    placeholder:this.placeholder,
                    markupString: '<div id="{@id}" style="{@cssText}">' +
                                    '<div></div>' +
                                    '<div></div>' +
                                  '</div>',
                    markupSlots: {
                        containerNode: function() { return this.domNode.firstChild; },
                        msgNode: function() { return this.domNode.lastChild;}
                    },
                    children: [
                    {
                        scriptClass: 'mstrmojo.Container',
                        slot: "containerNode",
                        alias: "rootContainer",
                        markupString: '<div></div>'
                    },                    
                    {
                        scriptClass: 'mstrmojo.Label',
                        alias: 'msg',
                        slot: "msgNode",
                        text: 'Loading...',
                        visible: true
                    }],    
                    showMessage: function(text) {
                        var msg = text || this.msg.text,
                            msgNode = msg.domNode,
                            msgNodeStyle = msgNode.style;                        
                        
                        msgNode.innerText = msg;
                        // Display message centered within the viewport.
                        msgNodeStyle.display = 'block';
                        msgNodeStyle.opacity = 1;
                    },
                    hideMessage: function hideMessage() {
                        this.msg.domNode.style.opacity = 0;
                    }
                });
                
                // and render.
                vw.render();

                
                var ctlr = this.rootController = new mstrmojo.maps.InfoWindowRootController({
                        id: "rootController",
                        firstView: vw
                    }),
                    docParams,
                    docModel;
                                
                if ( this.isDoc ) {
                    var dd = this.getDocData();
                    
                    docParams = _getDocParams(dd);
                    docModel = _getDocModel(dd);
                }
                                                    
                
                ctlr.start( { 
                    placeholder: this.placeholder,
                    rowIndex: this.rowIndex,
                    isDoc: this.isDoc,
                    docParams: docParams,
                    docModel: docModel,
                    model: this.getModel(),
                    sc: this.sc
                } );
            },
            
            /**
             * called when we need to switch documents before displaying the info window data
             * @param {Number} rowIndex index of element to display in the info window
             */
            loadNewDoc: function( rowIndex ) {
                var dd = this.getDocData(),
                    docParams = _getDocParams(dd),
                    docModel = _getDocModel(dd);

                this.rootController.nextController.restart( {   
                    placeholder: this.placeholder,
                    rowIndex: rowIndex,
                    isDoc: true,
                    docParams: docParams,
                    docModel: docModel,
                    model: this.getModel()
                } );
            },
            
            getDocData: function() {
            	return eval('(' + mapDataObj.getDocData() + ')');
            },
            getModel: function() {
            	return eval('(' + mapDataObj.getGridData() + ')');
            },
            
            /**
             * Returns the current mobile configuration for this application.
             * 
             * @returns mstrmojo.MobileConfiguration
             */
            getConfiguration: function getConfiguration() {
                if (!this._cfg) {
                    this._cfg = new mstrmojo.MobileConfiguration();
                }
                
                return this._cfg;
            },

            /**
             * Shows the application level message.
             * 
             * @param {String} [text] A text to display. If missing then the wait message will be displayed.
             */
            showMessage: function showMessage(msg) {
                this.rootView.showMessage(msg);
            },
            
            /**
             * Hides the application level message.
             */
            hideMessage: function hideMessage() {
                this.rootView.hideMessage();
            },

            update: function(rowIndex) {
                this.rootController.nextController.update(rowIndex);
            },
            
            /**
             * @returns returns TRUE if we are running on a physical device and not a desktop browser.
             * 
             * @type Boolean
             */            
            onMobileDevice: function onMobileDevice() { 
                return !mstrMobileApp.isProxy;
            },
            
            /**
             * Indicates whether the Application is "touch" event enabled.
             * 
             * @type Boolean
             */
            isTouchApp: function isTouchApp() {
                return ($DOM.isIPad || $DOM.isAndroid || mstrApp.onMobileDevice());
            },
            
            /**
             * Handles web window errors.
             */
            onerror: function onerror(res) {
                handleError(res, this);
            }
            

            
        });
    

}());