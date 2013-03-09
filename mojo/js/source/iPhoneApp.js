/**
 * OIVMApp.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function() {

    mstrmojo.requiresCls("mstrmojo.func",
                         "mstrmojo.form",
                         "mstrmojo.ServerProxy");

    /**
     * The iPhone server transport.
     * 
     * @type Object
     */
    mstrmojo.iPhoneServerTransport = {            
        serverRequest: function serverRequest(id, requestId, request) {
            mstrmojo.form.send(request.params, null, "POST");
        }
    };
    
    /**
     * A singleton class representing mobile application. It provides application entry point as
     * well as a bunch of application-level services. Any code within the application can access the
     * instance of this class via mstrApp global variable.
     * 
     * @class
     * @extends mstrmojo.Obj
     * 
     */
    mstrmojo.iPhoneApp = mstrmojo.declare(

        mstrmojo.Obj,
        
        null,

        /**
         * @lends mstrmojo.iPhoneApp.prototype
         */
        {
            scriptClass: "mstrmojo.iPhoneApp",
            
            /**
             * The instance of {@link mstrmojo.ServerProxy} to use for communication with the server.
             * 
             *  @type mstrmojo.ServerProxy
             */
            serverProxy: null,
            
            init: function init(props) {
                this._super(props);
                
                if (!this.serverProxy) {
                    this.serverProxy = new mstrmojo.ServerProxy({
                        transport: mstrmojo.iPhoneServerTransport,
                        _sessions: {}
                    });
                }
            },
            
            setTarget: function setTarget(target) {                
                this.data = target;                
            },            
            
            setSessionState: function(sessionState, projectId, _hostUrl, taskBaseUrl) {                                                                                                        
                this.serverProxy._sessions[projectId] = this.sessionState = sessionState;
                this.baseTaskUrl = taskBaseUrl;
                this.projectId = projectId;
                this.hostUrl = _hostUrl + "/";
            },
            
            getXtabProxy: function getXtabProxy() {
                if(this.controller) {
                    return this.controller.getProxy(this.data);
                } else {
                    var c = this.controller = new mstrmojo.iPhoneXtabController();
                    return c.getProxy(this.data);
                }
            },
            
            getDocProxy: function getDocProxy() {
                if(this.controller) {
                    return this.controller.getProxy(this.data);
                } else {
                    var c = this.controller = new mstrmojo.iPhoneDocController();
                    return c.getProxy(this.data);
                }
            },
                        
            serverRequest: function serverRequest(params) {
                try {                    
                    var app = this;
                    
                    window.setTimeout(function () {
                        app.serverProxy.request({}, params);
                    }, 0);
                    
                } catch (ex) {
                    mstrmojo.err(ex);
                }                
            }
        });
    
})();