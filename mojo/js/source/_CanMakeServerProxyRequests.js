/**
  * _CanMakeServerProxyRequests.js
  * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0

  * @fileoverview <p>A mixin with methods for making server requests via a proxy.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  */

(function () {

    /**
     * Static field to hold timeout handler for default loading message.
     *
     * @static
     * @private
     */
    var hTimeout;

    /**
     * <p>A mixin with methods for making server requests via a proxy.</p>
     *
     * @class
     * @public
     */
    mstrmojo._CanMakeServerProxyRequests = mstrmojo.provide(
        'mstrmojo._CanMakeServerProxyRequests',

        /**
         * @lends mstrmojo._CanMakeServerProxyRequests
         */
        {
            _mixinName: 'mstrmojo._CanMakeServerProxyRequests',

            /**
             *  Makes a request to the server.
             *
             *  @param {Object} params The parameters for the request.
             *  @param {Object} [callback] An optional object containing functions to be called as the request process proceeds.
             *  @param {Function} [callback.submission] A function called as the server request is initiated.
             *  @param {Function} [callback.success] A function called when the server request completes successfully.
             *  @param {Function} [callback.failure] A function called if the server request fails for any reason.
             *  @param {Function} [callback.complete] A function called when the server request is completed, regardless of status.
             *  @param {Object} [config] An optional object with configuration parameters for this request.
             *  @param {String} [config.src] The name of the method that is requesting this server call.
             *  @param {Boolean} [config.override] True if this server request should cancel all previous server requests that may be in the queue.
             *  @param {Boolean} [config.silent] True if this server request should be silent, meaning no wait message hide/show or error display.
             *  @param {Boolean} [config.showWait] True to display the default wait message before the request is submitted.
             *  @param {Boolean} [config.hideWait] True to hide the default wait message after the request is complete.
             *  @param {Boolean} [config.showProgress] True to display the native progress bar for this request.
             *  @param {Boolean} [config.hideProgress] True to hide the native progress bar after the request is complete.
             */
            serverRequest: function serverRequest(params, callback, config) {
                var app = this;

                try {
                    // Initialize callback if missing.
                    callback = callback || {};

                    // Initialize config if missing.
                    config = config || {};

                    // Add the project ID to the config.
                    config.projectId = config.projectId || this._currentProjId;

                    // Add the mobile configuration to the config.
                    config.mobileConfig = this.getConfiguration();

                    // Calculate the source method name from either the config object or the caller function.
                    var mthName = config.src || (arguments.callee && arguments.callee.caller.name);

                    // Is the request not explicitly silent?
                    if (!config.silent) {
                        // Add default callback methods.
                        callback = mstrmojo.func.wrapMethods(callback, {
                            submission: function () {
                                // Should we show the wait message?
                                if (config.showWait) {
                                    // Create function to show message.
                                    var fn = function () {
                                        // Show the message.
                                        app.showMessage();

                                        // Make sure timeout handle is cleared.
                                        hTimeout = undefined;
                                    };

                                    // Are we delaying feedback?
                                    if (config.delay) {
                                        // Yes, call function in timeout.
                                        hTimeout = window.setTimeout(fn, 300);
                                    } else {
                                        // No, call function immediately.
                                        fn();
                                    }
                                } else if (config.showProgress) {
                                	mstrMobileApp.showProgress();
                                }
                            },

                            failure: function (res) {
                            	// TQMS 502978 - moved here from MobileApp.js to avoid being prompted twice for certificate
                                if (res && res.requireDeviceCertificate) {
                		            if (window.confirm('Missing/invalid/expired device certificate detected. Would you like to get a new one?')) {
                		                try {
                		                    mstrApp.rootController.spawn(mstrApp.viewFactory.newScreenController("Settings", {}), {}, "getCertificateAuthenticationFieldsView");
                		                } catch (err) {
                                            res.method = mthName;
                                            mstrApp.handleError(err, app);
                		                }
                		            }
                                    return;
                                }                            	
                            	
                                if ( ! (config.noErrorMessage || res.noErrorMessage)) {
                                    // Add the source method name to response.
                                    res.method = mthName;
    
                                    // Ask the app to handle the error.
                                    mstrApp.handleError(res, app);
                                }
                            },

                            complete: function () {
                                // Should we hide the message?
                                if (config.hideWait === true ) {
                                    // Do we have a timeout handle?
                                    if (hTimeout) {
                                        // YES, Message never displayed, so clear timeout...
                                        window.clearTimeout(hTimeout);

                                        // and set handle to undefined.
                                        hTimeout = undefined;
                                    } else {
                                        // NO, message might be displayed so hide it.
                                        app.hideMessage();
                                    }
                                }
                                
                                if (config.hideProgress === true ) {
                                	mstrMobileApp.hideProgress();
                                }
                            }
                        });
                    }

                    // For performance reason, we should call the request immediately -- serverProxy
                    // request is async and chrome can redraw in the mean time.
                    try {
                        app.serverProxy.request(callback, params, !!config.override, config);
                    } catch (ex1) {
                        // At this point we always have the failure callback
                        callback.failure(ex1);
                    }

                } catch (ex2) {
                    // Must have failed in a request handler so log an error.
                    mstrApp.handleError(ex2, this);
                }
            }
        }
    );
}());