(function(){

    mstrmojo.requiresCls("mstrmojo.TabStripBase",
                         "mstrmojo._TouchGestures",
                         "mstrmojo.Label",
                         "mstrmojo.array");
    
    function selectNext() {
        var models = this._models;
        
        if (!models || !models.length) {
            return;
        }
        
        var target = this.target,
            current = target.selected,
            index = 0;

        mstrmojo.array.forEach(models, function (v, idx) {
            if (v === current) {
                index = idx + 1;
                return false;
            }
        });
        
        target.set('selected', models[index] || models[0]);
    }
    
    /**
     * A Mobile TabStrip widget.
     * 
     * @class
     * @extends mstrmojo.TabStripBase
     */
    mstrmojo.MobileTabStrip = mstrmojo.declare(
        // superclass
        mstrmojo.TabStripBase,
        
        // mixins,
        [ mstrmojo._TouchGestures ],
        
        /**
         * @lends mstrmojo.MobileTabStrip.prototype
         */
        {
            scriptClass: "mstrmojo.MobileTabStrip",
            
            markupString: '<div id="{@id}" class="mstrmojo-TabStrip {@cssClass}" style="{@cssText}">' +
                              '<div></div>' +
                              '<div>{@_btnMarkup}</div>' +
                              '<div style="clear:both;height:0;"></div>' +
                          '</div>',

            markupSlots: {
                containerNode: function () { return this.domNode.firstChild; },
                btnNode: function(){ return this.domNode.childNodes[1]; }
            },
            
            children: [{
                scriptClass: 'mstrmojo.Label',
                alias: 'selectedTitle'
            }],
            
            postBuildRendering: function postBuildRendering() {
                this._super();
                
                if (mstrmojo.debug && !mstrApp.onMobileDevice()) {
                    var tabStrip = this;
                    mstrmojo.dom.attachEvent(this.domNode, 'click', function() {
                        selectNext.apply(tabStrip);
                    });
                }
            },
            
            touchTap: function (touch) {
                selectNext.apply(this);
            },
            
            selectionChange: function selectionChange(evt) {
                var tps = this.targetProps || {},
                    selected = (evt && evt.value) || (this.target && this.target.selected),
                    models = this._models,
                    length = models && models.length,
                    btnNode = this.btnNode,
                    title, btnMarkup
                
                // Do we have more than one model?
                if (length & length > 1) {
                    title = (selected && selected[tps.childTitle || 'n']);
                    
                    // Create button (dots) markup.
                    var buttons = new mstrmojo.StringBuffer();
                        
                    // Iterate models.
                    for (var i = 0; i < length; i++) {
                        buttons.append('<div class="dot' + ((selected === models[i]) ? ' on' : '') + '"></div>');
                    }
                    
                    // Create buttons and button container.
                    btnMarkup = '<div style="width:' + ((8 * length) + 25 * (length - 1)) + 'px">' + buttons.toString() + '</div>';
                }
                
                // Set the title from the selected model.
                this.selectedTitle.set('text', title || '');
                
                // Cache button markup.
                this._btnMarkup = btnMarkup || '';
                
                // Do we already have a button node?
                if (btnNode) {
                    // Set the innter html to the button markup.
                    btnNode.innerHTML = this._btnMarkup;
                }
            },
            
            addTabButtons: function addTabButtons(models, index) {
                // Do we NOT have any buttons?
                var modelLength = models && models.length;
                if (!modelLength) {
                    return;
                }
                
                // Do we already have a collection of models?
                var cached = this._models;
                if (cached) {
                    if (!index && index !== 0) {
                        cached = cached.concat(models);
                    } else {
                        cached.splice.apply(cached, [ index, 0 ].concat(models));
                    }
                } else {
                    // NO, so initialize the collection.
                    cached = models;
                }
                
                // Cache the collection of models.
                this._models = cached;
                
                // Read the current selection, if any.
                this.selectionChange();                
            },
            
            removeTabButton: function removeTabButton(tgt) {
                var models = this._models;
                
                // Iterate models looking for the passed in target.
                mstrmojo.array.forEach(models, function (model, idx) {
                    // Is this model the target?
                    if (model === tgt) {
                        // Remove from models collection.
                        models.splice(idx, 1);
                        return false;
                    }
                });
                
                // Cache models collection.
                this._models = models;
                
                // Render selection change.
                this.selectionChange();
            }
        }
    );
    
})();