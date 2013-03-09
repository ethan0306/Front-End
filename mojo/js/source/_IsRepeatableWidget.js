(function() {
    
    /**
     * The mixin helps the widgets to create repeated units.
     */
    mstrmojo._IsRepeatableWidget = {
            
        _mixinName: "mstrmojo._IsRepeatableWidget",
        
        /**
         * evaluates whether the markup string needs to be replaced with the new widgets in postBuildRendering
         */
        replace: false,
        
        /**
         * The updated unit map, keyed by unit id, and the value is the object of repeated widget.
         */
        unitsMap: null,
        
        /**
         * The widget map, keyed by unit id, and the value is the Widget object.
         */
        widgetsMap: null,
                
        /**
         * The target Widget we are replacing our place holder markup string.
         */
        targetWidget: null,
        
        /**
         * The props for replacing widget
         */
        props: null,
        
        /**
         * Initializes the unitsMap.
         */
        init: function(props) {
        
            this._super(props);
            this.unitsMap = {};
            this.widgetsMap = {};
        },
        
        /**
         * Get the Markup String of expected widget. Should be subclassed by the target class.
         * @param {String} widx The index of the repeatable unit.
         * @param {Object} data The data object populating the properties of the target widget.
         * @param {String} data.value The raw value of the target widget.
         * @param {String} [data.dv] The display string.
         * @param {String} [data.ts] The type semantic
         * @param {String} [style] The css style for the widget.
         * @returns {String} The markup string. 
         */
        getMarkup: function(widx, data, style) {
            this.unitsMap[widx] = data;
            return '<div id="' + this.id + '_' + widx + '" style="visibility:hidden;' + style + '">' + (data.dv || null) + '</div>';
        },

        unrender: function unrender() {            
            this.widgetsMap = {};
            this.unitsMap = {};
            
            if(this._super) {
                this._super();
            }
        },
        
        postBuildRendering: function() {
            
            if(this._super) {
                this._super();
            }
            if(this.replace) {
                var i, um = this.unitsMap, prop;
                for(i in um) {
                    if(um.hasOwnProperty(i)) {
                        var dom = document.getElementById(this.id + '_' + i),
                            Cls = this.targetWidget;
                        
                        if(dom && dom.parentNode && Cls) {
                            
                            var p = dom.parentNode,
                                w = new Cls(this.props),
                                data = um[i];
                            
                            w.parent = this;                            
                            w.set('widx', i); //key of the widget
                            w.set('containerDOM', p);
                            
                            //if we have data object, we need to set the property to the target widget
                            //we need to set the value in the end so that when widget can read other data properties when calling onvalueChange
                            if(data) {
                                for(prop in data) {
                                    if(data.hasOwnProperty(prop) && prop !== 'value') {
                                        w.set(prop, data[prop]);
                                    }
                                }
                                w.set('lv', data.value); //last value
                                w.set('value', data.value);
                            }
                            
                            if(this._preRender) {
                                this._preRender(w, p);
                            }
                            
                            w.render();                            
                            
                            if(this._postRender){
                                this._postRender(w, p);
                            }
                            
                            this.widgetsMap[i] = w;
                            
                            p.replaceChild(w.domNode, dom);                        
                        }
                    }
                }                
            }
        }
        
    };
    
}());