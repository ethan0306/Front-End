(function () {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController",
                         "mstrmojo.android._IsRootController");


    /**
     * Main controller class for large form factor mobile applications.
     *
     * @class
     * @extends mstrmojo.ViewController
     */
    mstrmojo.android.large.RootController = mstrmojo.declare(

        mstrmojo.MobileBookletController,

        [ mstrmojo.android._IsRootController ],

        /**
         * @lends mstrmojo.android.large.RootController.prototype
         */
        {
            scriptClass: "mstrmojo.android.large.RootController",

            start: function start(params) {
                if (this._super(params)) {
                    // Get a reference to the application browser.
                    var rootView = this.booklet = this.rootView,
                        homeScreen = mstrApp.viewFactory.newHomeScreenView({
                            controller: this
                        }),
                        browser = this.browser = homeScreen.contentChild;

                    // Make sure the app browser and rootView have a reference to the controller.
                    homeScreen.controller = rootView.controller = browser.controller = this;

                    // Start the app browser.
                    if (browser.start()) {
                        // TQMS #553057: If start does not return true it means we spawned a new controller so we don't want to show the home screen
                        // as adding a view will detach the next controller.
                        this.addView(homeScreen);
                    }

                    // Return true to indicate that we started.
                    return true;
                }

                // Return false to indicate that start did not take place.
                return false;
            },

            selfGoBack: function selfGoBack() {
                // Ask the AppBrowser to handle it.
                return this.browser.goBack();
            },

            goHome: function goHome(details) {
                // Tell the browser to go home.
                this.browser.goHome(details);
                this.makeCurrent();
            }

        }
    );
}());