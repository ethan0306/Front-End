(function() {

    mstrmojo.requiresCls(
            "mstrmojo.Dialog",
            "mstrmojo.dnd");
    
    var $D = mstrmojo.dom;
    
    /**
     * DraggableDialog extends Dialog allowing it to be dragged around the screen
     * 
     * @class
     * @extends mstrmojo.Dialog
     */
    mstrmojo.DraggableDialog = mstrmojo.declare(

        mstrmojo.Dialog,

        null,
        
        /**
         * @lends mstrmojo.DraggableDialog.prototype
         */
        {
            scriptClass: "mstrmojo.DraggableDialog",
            
            /**
             * Whether or not this editor is draggable/movable. 
             */
            draggable: true,
            
            /**
             * Whether or not this editor controls its own avatar when dragged.
             */
            ownAvatar: true,   
            
            /**
             * Which node will be used as handle for the DnD functionality
             * */
            draggableNodeName : "titleNode",
            
            markupString: '<div id="{@id}" class="mstrmojo-Dialog {@cssClass}" mstrAttach:click>' +
                              '<div class="win mstrmojo-Editor" style="{@cssText}"  mstrAttach:mousedown>' +
                                  '<div class="mstrmojo-Editor-titlebar"><div class="mstrmojo-Editor-title">{@title}</div></div>' +
                                  '<div class="mstrmojo-Editor-content"></div>' + 
                                  '<div class="mstrmojo-Editor-buttons"></div>' +
                              '</div>' +
                              '<div class="mstrmojo-Editor-curtain"></div>' + 
                              '<div class="mstrmojo-Editor-tip"></div>' +
                          '</div>',
            
                          /**
                           * Handler for mouse down event, in order to close the editor. 
                           */
            premousedown: function premousedown(evt){
                var e = evt.e,
                t = $D.eventTarget(evt.hWin,e);
                if(t == this.closeNode){
                    this.close();
                } 
            },
    
            /**
             * Handler when dragging starts. 
             */
            ondragstart: function(c){
                var n = c.src.node,
                tn = this[this.draggableNodeName],
                st = this.editorNode.style;
                if($D.contains(tn,n,true,this.domNode)){
                    tn.style.cursor = "move";                        
                    this.leftPos = parseInt(st.left, 10); 
                    this.topPos = parseInt(st.top, 10);
                    return true;
                } else {
                    return false;
                }
            },
    
            /**
             * Handler when dragging. 
             */              
            ondragmove: function(c){
                var e = c.tgt.pos,
                s = c.src.pos,
                dx = e.x - s.x,
                dy = e.y - s.y,
                st = this.editorNode.style,
                vl = this.leftPos + dx + 'px',
                vt = this.topPos + dy + 'px';
                st.left = vl;
                this.left = vl;
                st.top = vt; 
                this.top = vt;
            },
    
            /**
             * Handler when dragging ends. 
             */              
            ondragend: function(c){
                this[this.draggableNodeName].style.cursor = "default";
            }
        }
    );
        
}());