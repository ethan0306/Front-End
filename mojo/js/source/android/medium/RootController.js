(function() {

    mstrmojo.requiresCls("mstrmojo.MobileBookletController",
                         "mstrmojo.android._IsRootController");
    
    /**
     * Method to dispatch controller.
     * 
     * @private
     */
    function dispatchController(fromWin, params) {
        // Do we not have a device configuration?
        var deviceCfg = (fromWin) ? null : mstrApp.getConfiguration();
    
        var screenType = (fromWin) ? null : deviceCfg.getHomeScreenType();
        // Is this either a default (1), custom screen (2), a ResultSet (3) or a Folder (4)? or if it is coming from window.screenConfig
        if ((screenType >= 1 && screenType <= 4) || fromWin === true) {
            if (screenType > 2 || fromWin === true) {
    
                // Get homescreen.
                var homeScreen = (fromWin) ? window.screenConfig : deviceCfg.getHomeScreen(),
                    pid = homeScreen.pid,
                    did = homeScreen.did,
                    st = homeScreen.st;
    
                switch (screenType) {
                    // document/report
                    case 3: {
                        break;
                    }
                    
                    // folder
                    //
                    case 4: {
                        var oi = homeScreen.oi;
                        pid = oi.pid;
                        did = oi.did;
                        st = oi.st;
                        this.csp = oi.csp = !!homeScreen.csp;
                        break;
                    }
                }

                // Pass the project ID to the application.
                mstrApp.setCurrentProjectId(pid);
    
                // Overwrite parameters
                params = {
                    did: did,
                    st: st
                };
                if (screenType === 3) {
                    params.projectID = pid;
                }
                if (screenType === 4) {
                    params.csp = this.csp;
                }
    
                // Reset screenType for view key.
                screenType = st;
            }
    
            // Spawn the new controller.
            this.spawn(mstrApp.viewFactory.newScreenController(this.getViewKey(screenType), params), params);
        } else {
            // Illegal screen type so log it.
            mstrmojo.err({
                name: 'DispatchError',
                message: 'illegal default homescreen type, hsc=' + screenType
            });
        }
    }
        
    /**
     * Main controller class for small form factor (booklet based) mobile applications.
     * 
     * @class
     * @extends mstrmojo.MobileBookletController
     */
    mstrmojo.android.medium.RootController = mstrmojo.declare(
            
        mstrmojo.MobileBookletController,
        
        [ mstrmojo.android._IsRootController ],

        /**
         * @lends mstrmojo.android.medium.RootController.prototype
         */
        {
            scriptClass: "mstrmojo.android.medium.RootController",
            
            start: function start(params) {
                var screenType = mstrApp.getConfiguration().getHomeScreenType();
                
                if (this._super(params)) {
                    var fromWin = !!window.screenConfig;
                    if( !fromWin ) {
                        // Set booklet reference.
                        this.booklet = this.rootView;
                    }
                    dispatchController.call(this, fromWin, params);
                        
                    return true;
                        
                } else {
                    // Illegal screen type so log it.
                    mstrmojo.err({ 
                        name: 'StartupError', 
                        message: 'illegal default homescreen type, hsc=' + screenType
                    });
                }
                
                return false;
            },
            
            direct: function direct() {
                 if(window.screenConfig) {
                    dispatchController.call(this, true);
                 }
            },
            
            goHome: function goHome(details) {
                
                // to go home, make the next controller the current one. This will detach any
                // other controllers that make be in the chain after the home controller.
                this.nextController.makeCurrent();                

                if ( details && details.connectivityChanged ) {
                    var hsController = this.nextController,
                        hsView = hsController.getLastView();
                        
                        hsView.set('cfg', mstrApp.getConfiguration().getHomeScreen() );
                }
            }
        }
    );
})();