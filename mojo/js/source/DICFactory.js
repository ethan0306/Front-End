(function () {
    mstrmojo.requiresCls("mstrmojo.hash");

    var $H = mstrmojo.hash,
        dicPopup = null;
    
    //Internal function to initialize a DIC widget inside the DIC group
    //o: config object
    function _createDICInGroup(o){
        return mstrmojo.DICFactory.createDIC(
                $H.copy({dic: this.dic, owner: this.owner, group: this}, o));
    }
    
    /**
     * <p> A utility factory for creating platform independent data input controls and popup instances. </p> 
     */
    mstrmojo.DICFactory = mstrmojo.provide(
        "mstrmojo.DICFactory",
        {
            /**
             * Creates an instance of data input control object.
             * @param {Object} o The configure object
             * @param {Object} o.dic Data input control configure object
             * @param {Widget} o.opener The opener of the data input control
             * @param {Object} o.value The raw value
             * @param {Object} o.dv the display value
             * @param {String} [o.k] The key from opener to identify the control widget
             * @param {HTMLElement} [o.openerNode] The opener node 
             * @param {Object} [o.props] Other properties initilializing widget 
             * Example dic info
             * {
             *   t: 1,
             *   dm: 1,
             *   wm: 0,
             *   w: 12,
             *   ml: 256,
             *   min: 10,
             *   max: 100,
             *   itv: 10,
             *   vls: [{v: 10}, {v: 20}]
             * }
             * @returns {Object} data input control instance
             */
            createDIC: function(o) {
                var dic = o.dic,
                    Cls = mstrmojo.DICList[dic.t],
                    w; 
                if(Cls) {
                    //if we don't have a key for the dic, we set its opener's id as its key
                    if (o.k === undefined){
                        o.k = o.opener && o.opener.id;
                    }
                    
                    //populate values of the following two properties 
                    o.showByDefault = mstrmojo.DICConfig.showDICByDefault(o.dic, o.openerType);
                    o.hasPreview = mstrmojo.DICConfig.hasDICPreview(o.dic, o.openerType);
                    
                    w = new Cls(o);
                }
                
                return w;
            },
                        
            /**
             * Creates popup instance for data input controls.   
             * @param opener {Object} either xtab or textfield
             * @param dic {Object} the dic widget
             * @returns {Object} Popup instances
             */
            createDICPopup: function(opener, dic) {
                return mstrmojo.DICPopup.getInstance(opener, dic);
            },

            /**
             * Creates a data input control group object for a given group configure object.
             * @param {Object} gco Group configure object.
             * @param {String} gco.gk Group key.
             * @param {Object} gco.dic Data input configure object.
             * @param {Object} gco.opener The owner of the group widget.
             * @returns {mstrmojo.Widget} The instance of a DICGroup widget. 
             */
            createDICGroup: function(gco) {
                var dicGroup = $H.copy(gco, {
                    
                        scriptClass: "mstrmojo.Widget",
                    
                        /**
                         * Widgets map object
                         */
                        widgetsMap: {},
                        
                        /**
                         * Data input configure object
                         */
                        dic: null,
                        
                        /**
                         * The opener (owner) of the DICGroup object (mstrmojo.EditableXtab or mstrmojo.EditabTextfield)
                         */
                        owner: null,
                        
                        /**
                         * The collection of individual DIC configure objects. The configure object is used to create DIC instance
                         */
                        groupMembers: {},

                        postCreate: function(){
                            var dic = this.dic, otp = this.openerType, DC = mstrmojo.DICConfig;
                            this.showByDefault = DC.showDICByDefault(dic, otp);
                            this.hasPreview = DC.hasDICPreview(dic, otp);
                        },
                        
                        /**
                         * Save the DIC config object. 
                         * @param k The unique key of DIC in the group
                         * @param o DIC config
                         */
                        addDIC: function addDIC(k, o) {
                            this.groupMembers[k] = o;
                        },
                        
                        /**
                         * Initialize and render the popup DIC specified by the key.
                         * @param k The unique key of DIC in the group
                         */
                        showPopupDIC: function showPopupDIC(k){
                            if (!this.showByDefault){
                                var w = this.widgetsMap[k],
                                    o = this.groupMembers[k];
                                
                                if (!o){
                                    return;
                                }
                                
                                // if the widget is not initialized yet, create it
                                if (!w){
                                    w = this.widgetsMap[k] = _createDICInGroup.call(this, o);
//                                    o.hasRendered = true; // this is actually not needed
                                }
                                
                                // ask widget to render itself inside the popup
                                w.showInPopup();
                            }
                        },
                        
                        /**
                         * Initialize and render all the inline DIC widgets.
                         */
                        render: function render() {
                            // if the dic is shown by default or it has a "preview" for the popup, render it. 
                            if (this.showByDefault || this.hasPreview){ 
                                var gms = this.groupMembers, me = this, dicWidget;

                                $H.forEach(gms, function (go, k) {
                                    if (!go.hasRendered){
                                        me.widgetsMap[k] = dicWidget = _createDICInGroup.call(me, go);
                                        
                                        // if the dic widget is shown by default, render it and then use it to replace the openerNode 
                                        if (me.showByDefault){
                                            dicWidget.render();
                                        // if the dic widget has preview for the popup, replace the content of openerNode with the preview
                                        }else if (me.hasPreview){
                                            dicWidget.renderPreview();
                                        }
                                        //mark as 'rendered' so that it won't be rendered again
                                        go.hasRendered = true;
                                    }
                                });
                            }
                        },
                        
                        destroy: function destroy() {
                            $H.forEach(this.widgetsMap, function (w) {
                                w.destroy();
                            });
                            this.widgetsMap = {};
                        }
                    });
                
                return mstrmojo.insert(dicGroup);
            }
        }
    );
}());