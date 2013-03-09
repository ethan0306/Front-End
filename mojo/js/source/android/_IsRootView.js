(function () {

    mstrmojo.requiresCls("mstrmojo.Label",
                         "mstrmojo.dom",
                         "mstrmojo.css");

    var $CSS = mstrmojo.css;

    mstrmojo.requiresDescs(2901);

    function updateRootOrientationClass() {
        $CSS[((mstrApp.isLandscape()) ? 'add' : 'remove') + 'Class'](this.domNode, 'rootLandscape');
    }

    /**
     * A mixin to add Android root view functionality.
     *
     * @class
     * @public
     */
    mstrmojo.android._IsRootView = {

        _mixinName: 'mstrmojo.android._IsRootView',

        /**
         * Overridden to hide wait screen if orientation changed.
         *
         *  @ignore
         */
        monitorWindow: function monitorWindow(evt) {
            // Ask device for actual screen dimensions.
            var dimensions = mstrApp.getScreenDimensions();

            // Call super to resize GUI.
            // TQMS #508137: We need to override the event with actual screen dimensions because iFrames can change the size of the target.
            this._super({
                currentTarget: {
                    innerWidth: dimensions.w,
                    innerHeight: dimensions.h
                }
            });

            // Update the root orientation css class.
            updateRootOrientationClass.call(this);

            // Orientation changed which means the wait screen was visible so hide it now (in a timeout to make sure rendering is complete).
            window.setTimeout(function () {
                mstrMobileApp.setWaitScreenVisibility(false);
            }, 0);
        },

        /**
         * Overridden to raise the orientationChange event when the orientation changes.
         *
         * @ignore
         */
        setDimensions: function setDimensions(h, w) {
            // Is the original state of the root view in landscape?
            var wasLandscape = (parseInt(this.width, 10) > parseInt(this.height, 10));

            this._super(h, w);

            // Did the landscape value change?
            if (wasLandscape !== (parseInt(w, 10) > parseInt(h, 10))) {
                // Raise the "orientationChange" event.
                this.raiseEvent({
                    name: 'orientationChange',
                    isLandscape: !wasLandscape
                });
            }
        },

        /**
         * The browser returns incorrect dimensions when the app starts up, this causes the root view to be sized incorrectly.
         * Override the method to get it from the App.
         *
         * @see mstrmojo._FillsBrowser
         */
        getBrowserDimensions: function () {
            return mstrApp.getScreenDimensions();
        },

        /**
         * Asks the JAVA host application to take a screen shot of the current screen (used for previews).
         *
         * @param {Object} position An object with position values (x, y, h, and w) of the screen area to capture.
         * @param {String} id The DssId of the object currently displayed.
         *
         */
        takeScreenShot: mstrmojo.emptyFn,

        children: [{
            scriptClass: 'mstrmojo.Label',
            alias: 'msg',
            text: 'Loading...',
            visible: false,
            cssClass: 'mstrmojo-RootViewMessage'
        }],

        /**
         * Custom hook to hide park the msg node after it fades out.
         *
         * @ignore
         */
        onRender: function onRender() {
            // Update the root orientation css class.
            updateRootOrientationClass.call(this);

            // Attach an event listener to park the loading msg after it fades.
            mstrmojo.dom.attachEvent(this.msg.domNode, 'webkitTransitionEnd', $CSS.parkAfterFade);
        },

        /**
         * <p>Returns an object with "h" and "w" properties representing the available height and width for content children.</p>
         *
         * @param {Boolean} [supportsFullScreen=false] An optional boolean indicating if the requesting view supports fulls screen mode.
         *
         * @type Object
         */
        getContentDimensions: function getContentDimensions(supportsFullScreen) {
            var lastView = mstrmojo.all[this.controllerId].getLastController().getLastView();

            // Return the content dimensions of the last view (if found) or the screen dimensions.
            return (lastView && lastView.getContentDimensions()) || mstrApp.getScreenDimensions();
        },

        /**
         * Shows the application level wait message.
         *
         * @param {String} [text=Loading...] An optional message to display.
         *
         */
        showMessage: function showMessage(text) {
            var msg = this.msg,
                msgNode = msg.domNode,
                msgNodeStyle = msgNode.style;

            // Add message text.
            msgNode.innerText = text || mstrmojo.desc(2901, 'Loading...');

            // Display message centered within the viewport.
            msgNodeStyle.position = 'absolute';
            msgNodeStyle.display = 'block';
            msgNodeStyle.left = Math.round(parseInt(this.width, 10) / 2 - msgNode.offsetWidth / 2) + 'px';
            msgNodeStyle.top = Math.round(parseInt(this.height, 10) / 2 - msgNode.offsetHeight / 2) + 'px';
            msgNodeStyle.opacity = 1;
        },

        /**
         * Hides the application level wait message.
         */
        hideMessage: function hideMessage() {

            // Fade the msg node out.
            this.msg.domNode.style.opacity = 0;
        }
    };
}());