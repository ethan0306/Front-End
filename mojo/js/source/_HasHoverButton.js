(function () {

	mstrmojo.requiresCls("mstrmojo.registry");
	
    // Private method walks the ancestors of the given widget to 
    // search for the container in which the Menu is located.
    
    function getPopupDelegate (/*Widget*/ widget){
        var w = widget;
        while (w) {
            if (w.openDrillLinkMenu) {
                return w;
            }
            w = w.parent;
        }
        return null;
    
    }
    
    
    /**
     * <p>A mixin for {@link mstrmojo.DocTextfield}s and {@link mstrmojo.DocImage}s
     * that have Drill Links. This mixin adds a button to TextFields and Images that
     * have Drill Links. </p>
     * 
     * @class
     * @public
     */    
    mstrmojo._HasHoverButton = 
    /**
     * @lends mstrmojo._HasHoverButton#
     */
    {
        
        /**
         * The name to identify this mixin. Required by {@link mstrmojo.DynamicClassFactory}.
         */
        _mixinName: 'mstrmojo._HasHoverButton',
            
        buttonNodeMarkup: '<div class="mstrmojo-LinkInfo-buttonNode"></div>',
        
        init: function init(p) {
            this._super(p);
            
            this.markupSlots.buttonNode = function() { return this.domNode.lastChild; };    
        },

        update: function update(node) {
            this._super(node);
            
            var fdl = node.defn.dl,
                ddl = node.data.dl;
            
            var dliRef = this.drillLinkItems = ((fdl && fdl.items) || []).concat((ddl && ddl.items) || []).sort(function (a, b) {
                return a.index - b.index;
            });
            
            //TQMS 433815: need to remove the duplicate links. This is also part of the fix for 428594
            // which might introduce additional links.
            for (var idx = 0; idx < dliRef.length-1; idx++){
            	if (dliRef[idx].index == dliRef[idx+1].index){
            		dliRef.splice(idx, 1);
            	}
            }
            
            if (fdl && fdl.target) {
                for (var index = 0; index < dliRef.length; index++) {
                    dliRef[index].target = fdl.target;
                }
            }
        }, 
        
        postBuildRendering: function pstBldRnd() {
            if (!this.hoverBtn) {
                this.addChildren(
                        mstrmojo.registry.ref({
                            scriptClass: "mstrmojo.Button",
                            slot: "buttonNode",
                            alias: "hoverBtn",
                            
                            onclick: function onclick() {
                                this.openPopup();
                            },
                            
                            openPopup: function openPopup(){
                                var dl = getPopupDelegate(this);
                                if (dl) {
                                    dl.openDrillLinkMenu(
                                            {
                                                openerButton: this, 
                                                drillLinkItems: this.parent.drillLinkItems
                                            }
                                    );
                                }
                            },
                                  
                            closePopup: function closePopup(){
                                var dl = getPopupDelegate(this);
                                if (dl) {
                                    dl.closeDrillLinkMenu();
                                }
                            }

                        })
                );
            }
            return this._super();
        }
            
    };//mstrmojo._HasHoverButton
        
}//function
)();