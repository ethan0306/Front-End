/**
 * AndroidPromptsController.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */

(function () {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController");
    
    mstrmojo.requiresDescs(8393);

    /**
     * Android prompts controller.
     * 
     * @class
     * @extends mstrmojo.MobileBookletController
     */
    mstrmojo.AndroidPromptsController = mstrmojo.declare(
            
        mstrmojo.MobileBookletController,
        
        null,

        /**
         * @lends mstrmojo.AndroidPromptsController.prototype
         */
        {
            scriptClass: "mstrmojo.AndroidPromptsController",
            
            /**
             * @param params.prompts
             * @param [params.callback] An optional function that will be called from the answerPrompts method.
             * 
             * @ignore
             */
            start: function start(params) {
                this.callback = params.callback;
                var prompts = this.prompts = params.prompts,
                    name = prompts.host.n;
                
                this.addView(this.newView('Prompts', {
                    prompts: prompts,
	                supportedPrompts: params.supportedPrompts,
                    ttl: mstrmojo.desc(8393, 'Prompt Summary') + ((name) ? ': ' + name : '')
                }));
            },
            
            answerPrompts: function answerPrompts() {
            	var me = this;
                this.prompts.prepareAnswer({
                    success: function() {
                        try {
	                    	me.prompts.validate();
	                    	me.callback();
                        } catch (e) {
                            mstrApp.onerror(e);
                            return false; // failed in anwering prompt.
                        }
                    } 
                });
            }
        }
    );
}());