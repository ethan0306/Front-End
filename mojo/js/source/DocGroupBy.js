(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo.DropDownList");

    mstrmojo.DocGroupBy = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.DocGroupBy.prototype
         */
        {
            scriptClass: "mstrmojo.DocGroupBy",
                        
            markupString: '<div id="{@id}" class="mstrmojo-DocGroupBy {@cssClass}">' +
                                '<div style="padding-top: 5px;">' +
                                    '<span class="mstrmojo-DocGroupBy-title">{@title}</span>' +
                                '</div>' +
                                '<div class="mstrmojo-clearMe"></div>' +
                        '</div>',
                
            markupSlots: {
                containerNode: function(){return this.domNode.firstChild; }
            },
                
            /**
             * The MicroStrategy Report Services document group by component.
             * 
             * @constructs
             * @extends mstrmojo.Container
             * 
             * @param {Object} props A hash of properties/values to be applied to this instance.
             */
            init: function init(props) {
                this._super(props);
                
                // Call the method to insert the pulldown children.
                this.ondataChange();
            },
            
            /**
             * Adds the child pulldowns from the list of units in the data property. 
             * 
             * @private
             */
            ondataChange: function ondataChg() {
                if (!this.data || !this.data.length) {
                    return;
                }
                
                var wIcon = new mstrmojo.WaitIcon(),
                    fn = function (evt) {
                        this.controller.onGroupBy(this, {
                            groupbyKey: evt.src.k,
                            elementId: evt.value
                            //treesToRender: 2
                        }, function (v) {
                            wIcon.set('visible', v);
                        });
                    };
                    
                // Step through the units and create a pulldown for each one.
                for (var i = 0, cnt = this.data.length; i < cnt; i++) {
                    // Get current unit.
                    var p = this.data[i];
                    
                    // Create and add the pulldown.
                    var c = this.addChildren(new mstrmojo.DropDownList({
                        k: p.k,
                        title: p.unit.target.n + ':',
                        idx: p.unit.idx,
                        cssClass: 'mstrmojo-DocGroupBy-unit',
                        selectCssClass: 'mstrmojo-DocGroupBy-unit-select'
                    }));
                    
                    // Set the options on the new pulldown child.  I'm not doing this in the constructor because I don't want the array of 
                    // options to be observable.
                    c.options = p.unit.elms;
                    
                    // Set an event listener to call inner event handler function.
                    c.attachEventListener("selectedChange", this.id, fn);
                }
                
                // Add wait indicator.
                this.addChildren(wIcon);
            },
            
            /**
             * Determines if all group by units are set to "All".
             * 
             * @type {Boolean}
             * @returns True if all group by units are set to "All".
             */
            areUnitsSetToAll: function () {
                var __result = true;
                
                // Iterate through the group by units looking for one that is not set to all.
                mstrmojo.array.forEach(this.data, function (g) {
                    if (g.unit.elms[g.unit.idx].v !== 'u;') {
                        __result = false;
                        return false;    // Cancel iteration.
                    }
                });
                
                return __result;
            }
            
        }
    );
    
})();