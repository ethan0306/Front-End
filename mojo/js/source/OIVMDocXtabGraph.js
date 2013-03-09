(function () {

    mstrmojo.requiresCls("mstrmojo.DocXtabGraph");

    var $D = mstrmojo.dom;

    /**
     * <p>A widget for displaying a single MicroStrategy Report Services Graph control in Express Mode.</p>
     *
     * @class
     * @extends mstrmojo.DocXtabGraph
     */
    mstrmojo.OIVMDocXtabGraph = mstrmojo.declare(
        mstrmojo.DocXtabGraph,

        null,

        /**
         * @lends mstrmojo.OIVMDocXtabGraph.prototype
         */
        {
            scriptClass: "mstrmojo.OIVMDocXtabGraph",

            /**
             * Overridden to create and use pre-loader image for graph source.
             *
             * @ignore
             */
            postBuildRendering: function postBuildRendering() {
                // Have we NOT created the preloader image yet?
                if (!this.preLoader) {
                    // Create and cache the pre loader image.
                    this.preLoader = document.createElement('img');
                }

                // Call super.
                return this._super();
            },

            /**
             * Overridden to create OIVM graph src.
             *
             * @param {Integer|String} h The height of the requested graph image.
             * @param {Integer|String} w The width of the requested graph image.
             *
             * @ignore
             */
            retrieveGraphSrc: function retrieveGraphSrc(h, w) {
                // Create graph source URL.
                var src = mstrConfig.taskURL + '?taskId=getRWGraphImage&taskEnv=xhr&__ts__=' + (new Date().getTime()) + '&messageID=' + this.model.mid + '&nodeKey=' + this.k + '&sliceID=' + parseInt(this.node.data.sid, 10) + '&imgType=4' + '&width=' + parseInt(w, 10) + '&height=' + parseInt(h, 10) + '&sessionState=' + mstrApp.sessionState,
                    preLoader = this.preLoader,
                    imgNode = this.imgNode,
                    id = this.id;

                if(mstrmojo){
	                var validateRandNum = mstrmojo.getValidateRandNum();
	                if(validateRandNum){
	                	src += '&validateRandNum=' + validateRandNum;
	                }
                }
                
                // Is the src different from the original pre-loader source?
                if (preLoader.src !== src) {
                    // Notify the app that we are going to begin processing the graph.
                    mstrApp.addLoadingGraph(id);

                    var fnComplete = function () {
                            mstrApp.removeLoadingGraph(id);
                        },
                        load = 'load',
                        err = 'error',
                        fnPreFail,
                        fnPreLoad,
                        fnMainFail,
                        fnMainLoad;

                    // Attach a one time event listener to hear when the preLoader is finished loading.
                    fnPreLoad = $D.attachOneTimeEvent(preLoader, load, function () {

                        // Attach a one time event listener to hear when the main image node is finished loading.
                        fnMainLoad = $D.attachOneTimeEvent(imgNode, load, function () {
                            // Call complete function.
                            fnComplete();

                            // Clear the loader background.
                            imgNode.style.background = 'none';

                            // Reset the readyState of our definition.
                            mstrmojo.all[id].defn.set('readyState', mstrmojo.EnumReadystate.IDLE);

                            // Detach failure event listener from main image node.
                            $D.detachEvent(imgNode, err, fnMainFail);
                        });

                        // Attach a one time event listener to hear if the main image node loading fails.
                        fnMainFail = $D.attachOneTimeEvent(imgNode, err, function () {
                            // Call complete function.
                            fnComplete();

                            // Detach loading event listener from main image node.
                            $D.detachEvent(imgNode, load, fnMainLoad);
                        });

                        // Detach failure event listener from preLoader.
                        $D.detachEvent(preLoader, err, fnPreFail);

                        // Transfer src from preloader to graph image.
                        imgNode.src = preLoader.src;
                    });

                    // Attach a one time event listener to hear when if the preLoader fails.
                    fnPreFail = $D.attachOneTimeEvent(preLoader, 'error', function () {
                        // Call complete function.
                        fnComplete();

                        // Detach loading event listener from preLoader.
                        $D.detachEvent(preLoader, load, fnPreLoad);
                    });

                    // Set new src on the preLoader.
                    preLoader.src = src;
                }
            }
        }
    );

}());