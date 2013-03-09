(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo.css");
        
    var _C = mstrmojo.css;

    /**
     * <p>Panel is a Container whose contents can be collapsed and expanded.</p>
     *
     * <p>Panel has a slot named "containerNode" for containing child widgets. Panel
     * also supports an optional "state" property (default = 1).
     * When "state" is 0, the Panel is collapsed, meaning that the child widgets in the Panel's containerNode are hidden;
     * otherwise, they are shown.  An optional DOM node, called the "stateNode", can be designated in the Panel
     * markupString to display the state of the Panel to the end-user.  
     * Additionally, an optional "titleNode" can be designated in the markupString to display the Panel's (optional) "title" property.</p>
     *
     * @class
     */
    mstrmojo.Panel = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        null,
        
        // instance props+methods
        /**
         * @lends mstrmojo.Panel.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.Panel",

            /**
             * If 0, the Panel's child widgets are hidden; otherwise, they are shown.
             * @type Integer
             */
            state: 1,
            
            /**
             * If false, the Panel's title bar is hidden; if true it's shown.
             * @type Integer
             */
            showTitlebar: false,
            
            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-Panel {@cssClass}" style="position: relative;{@cssText}">' + 
                      '<div class="mstrmojo-Panel-titlebar {@cssClass}">' +
                          '<img class="mstrmojo-Panel-state" src="../images/1ptrans.gif" align="absmiddle" ' +
                             'onclick="var w = mstrmojo.all[\'{@id}\']; w.set(\'state\', w.state === 0 ? 1 : 0)" />' +
                          '<span class="mstrmojo-Panel-text" style="{@ttlTxtCssText}"></span>' +
                          '<input type="button" class="mstrmojo-Panel-del" value="{@delText}" onclick="mstrmojo.all[\'{@id}\'].del()"/>' +   
                          '<div class="mstrmojo-clearMe"></div>' +
                      '</div>' +
                      '<div class="mstrmojo-Panel-container"></div>' +
                   '</div>',

            /**
             * @ignore
             */
            markupSlots: {
                stateNode: function(){return this.domNode.firstChild.firstChild;},
                titlebarNode: function() {return this.domNode.firstChild;},
                titleNode: function(){return this.domNode.firstChild.childNodes[1];},
                containerNode: function(){ return this.domNode.lastChild;}
            },
            
            /**
             * @ignore
             */
            markupMethods: {
                ontitleChange: function(){
                    var tn = this.titleNode;
                    if (tn) {
                        var t = this.title;
                        tn.innerHTML = (t !== null) ? t : '';
                    }
                },
                onstateChange: function(){ 
                    var cls = (this.state === 0);
                    for (var n in {stateNode:1, titleNode: 1, containerNode: 1}){
                        if (this[n]) {
                            _C.toggleClass(this[n], ['closed'], cls);
                        }
                    }
                },
                onshowTitlebarChange: function(){
                     _C.toggleClass(this.titlebarNode, ['closed'], (this.showTitlebar === false));
                }
            },
            
            del: function del(){
                var p = this.parent;
                if (p && p.remove){
                    p.remove(this.item);
                }
                if (this.customDel) {//custom hook for del
                    this.customDel();
                }
           }
        }
    );
    
})();