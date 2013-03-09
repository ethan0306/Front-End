(function(){
    
    mstrmojo.requiresCls("mstrmojo.WidgetList", "mstrmojo.dom", "mstrmojo.TreeNodeSelector");
    
    var _D = mstrmojo.dom,
        NODE_STATE_CSS_MAP = {
            0: 'closed',
            1: 'opened',
            2: 'leaf'
        };
    
    /**
     * <p>A simple node widget for mstrmojo.TreeWidget.</p>
     *
     * <p>TreeNode is a widget whose markup includes: (1) an image ("stateNode") for expanding/collapsing its display,
     * (2) a label ("textNode") with optional text and/or icon, and (3) a list display of child nodes.  The list
     * comes from the TreeNode's optional "items" property (type: Array).</p>
     *  
     * <p>TreeNode is a subclass of WidgetList, therefore it inherits WidgetList's capabilities for rendering each item
     * in the "items" array as a new widget instance.  This item widget's configuration is determined by the "itemRenderer"
     * property and/or "itemRendererFunction" property of TreeNode.</p>
     *
     * @class
     * @extends mstrmojo.WidgetList
     */
    mstrmojo.TreeNode = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetList,
        // mixins
        null,
        {   // instance members
            scriptClass: "mstrmojo.TreeNode",
            
            markupString: '<li id="{@id}" class="mstrmojo-TreeNode {@cssClass}" style="{@cssText}" mstrAttach:mousedown>'
                                + '<div class="mstrmojo-TreeNode-div">'
                                    + '<img class="mstrmojo-TreeNode-state" src="../images/1ptrans.gif" />'
                                    + '<span class="mstrmojo-TreeNode-text {@textCssClass}"></span>'
                                + '</div>'
                                + '<ul class="mstrmojo-TreeNode-itemsContainer">{@itemsHtml}</ul></li>',

            markupSlots: {
                stateNode: function(){ return this.domNode.firstChild.firstChild;},
                textNode: function(){return this.domNode.firstChild.lastChild;},
                itemsContainerNode: function(){return this.domNode.lastChild;}
            },
            
            markupMethods: {
                ontextChange: function(){ this.textNode.innerHTML = this.text;},
                onstateChange: function(){ 
                    this.stateNode.className = "mstrmojo-TreeNode-state " + (NODE_STATE_CSS_MAP[this.state] || 'closed');
                    this.itemsContainerNode.style.display = (this.state === 1) ? 'block' : 'none';
                },
                onselectedChange: function(){
                    var fn = this.selected ? 'addClass' : 'removeClass';
                    mstrmojo.css[fn](this.domNode.firstChild, ['selected']);//mstrmojo.css[fn](this.textNode, ['selected']);
                },
                ondropCuePosChange: mstrmojo.WidgetList.prototype.markupMethods.ondropCuePosChange
            },
            
            renderOnScroll: false,

            listSelector: mstrmojo.TreeNodeSelector,
            
            /**
             * <p>Extends the inherited method in order to toggle the state of the TreeNode when the stateNode is clicked,
             * and to stop event bubbling when either the stateNode or an item is targeted.</p>
             *
             * <p>If a TreeNode's item widget is targeted, this method prevents the event from bubbling up to the
             * TreeNode's "parent" (either another TreeNode or the tree itself). If the event is allowed to bubble up,
             * the parent will respond to it by modifying its selectedIndices, which in turn will cause this TreeNode's
             * newly-made selection to get cleared.</p>
             * @ignore
             */
            premousedown: function pmd(evt) {
                var ret = this._super(evt),
                    t = _D.eventTarget(evt.hWin, evt.e);
                if (t == this.stateNode) {
                    if (this.state !== 2) {
                        this.set("state", this.state === 1 ? 0 : 1);
                    }
                }
                return ret;
            },
            
            /**
             */
            preclick: function(evt) {
                // TO DO: why do we need this here?
                mstrmojo.dom.stopPropogation(evt.hWin, evt.e);
            },
            
            /**
             * Responsible for notifying the tree that selections have changed.
             */
            prechange: function(evt){
                var ret = this._super(evt);
                if (ret !== false) {
                    var t = this.tree;
                    if (t && t.onnodechange) {
                        t.onnodechange(evt);
                    }
                }
                return ret;
            }
        });

})();

