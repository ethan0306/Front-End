(function(){
   
    mstrmojo.requiresCls(
            "mstrmojo.dom"
            );
    
    var _D = mstrmojo.dom;
    
    mstrmojo._IsMovable = mstrmojo.provide(
        "mstrmojo._IsMovable", 
        {
            /**
             * Whether or not this widget is draggable/movable. It shall be always true since this is a movable mixin.
             */
            draggable: true,
            
            /**
             * Whether or not this widget controls its own avatar when dragged. By default, for a movable object/widget, we do not show
             * any avatar, instead, we just change the mouse cursor to 'move' style. 
             */
            ownAvatar: true,  
            
            /**
             * Internal variable to keep the left position of this widget/target when moving starts. 
             */
            _leftPos: null,
            
            /**
             * Internal variable to keep the top position of this widget/target when moving starts. 
             */
            _topPos: null,
            
            
            /**
             * Override this function if the moving handle is not the default node, that is, the whole widget domNode. 
             */
            getMovingHandle: function getMovingHandle(){
                return this.domNode;
            },
            
            /**
             * Override this function if the moving target is not the default node, that is, the whole widget domNode. 
             */
            getMovingTarget: function getMovingTarget(){
                return this.domNode;
            },
            
            /**
             * Handler when dragging starts. 
             */
            ondragstart: function(c){
                var n = c.src.node,
                    tn = this.getMovingHandle(),
                    st = this.getMovingTarget().style;
                    if(_D.contains(tn,n,true,document.body)){
                          if(_D.isWK){//a workaround to make the cursor taking effect in webkit browsers. 
                              document.onselectstart = function(e){ e.preventDefault();return false; }
                          }
                          tn.style.cursor = "move";                        
                          this._leftPos = parseInt(st.left, 10); 
                          this._topPos = parseInt(st.top, 10);
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
                      st = this.getMovingTarget().style,
                      vl = this._leftPos + dx + 'px',
                      vt = this._topPos + dy + 'px';
                  st.left = vl;
                  this.left = vl;
                  st.top = vt; 
                  this.top = vt;
              },
              
              /**
               * Handler when dragging ends. 
               */              
              ondragend: function(c){
                  if(_D.isWK){
                      document.onselectstart = function(e){return true; }
                  }
                  this.getMovingHandle().style.cursor = "default";
                  this._leftPos = null;
                  this._topPos = null;
              }
        });
    
})();