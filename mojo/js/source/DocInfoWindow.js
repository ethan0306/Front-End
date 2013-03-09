(function(){

    mstrmojo.requiresCls("mstrmojo.Popup",
                         "mstrmojo._HasBuilder",
                         "mstrmojo._IsAnchorable");

    var BASE_TIP_CLS = 'mstrmojo-DocInfoWindow-tip',
        DARK_BORDER_WIDTH = 1;

    
    mstrmojo.DocInfoWindow = mstrmojo.declare(
        // superclass
        mstrmojo.Popup,
        
        // mixins,
        [ mstrmojo._HasBuilder , mstrmojo._IsAnchorable],
        
        // instance props+methods
        {
            scriptClass: "mstrmojo.DocInfoWindow",
            
            markupString: '<div class="mstrmojo-DocInfoWindow-wrapper">' +
                              '<div id="{@id}" class="mstrmojo-DocInfoWindow"></div>' +
                              '<div class="' + BASE_TIP_CLS + ' top"></div>' +
                              '<div class="mstrmojo-DocInfoWindow-curtain" mstrAttach:click></div>' +
                          '</div>',

            markupSlots: {
                infoNode: function() { return this.domNode.firstChild; },
                tipNode: function(){return this.domNode.childNodes[1]; },
                curtainNode: function(){ return this.domNode.lastChild; },
                containerNode: function() { return this.domNode.firstChild; }
            },
            
            boundaryNodeName : "boundary",
            
            popupNodeName : 'infoNode',
            
            baseTipClass : BASE_TIP_CLS,
            
            anchorOffset : 1,
            
            anchorOrientation : 'h',
            
            anchor: null,
            
            boundary: null,
            
            closeOnClick : true,
            
            ontouchstart: function ontouchstart() {
                this.close();
            },
            
            prepareAnchor : function prepareAnchor(){
                var infoNodeStyle = this.infoNode.style,
                  contentChild = this.children[0],
                  contentChildNode = contentChild.dimNode || contentChild.domNode,
                  ifwWidth = contentChildNode.offsetWidth,
                  ifwHeight = contentChildNode.offsetHeight;
              
                // Set InfoWindow's size bigger than so that the background color will be visible.
                infoNodeStyle.width = (ifwWidth + 2 * DARK_BORDER_WIDTH) + 'px';
                infoNodeStyle.height = (ifwHeight + 2 * DARK_BORDER_WIDTH) + 'px';
            },

            nudge : function nudge(){
                this.positionDialog();
			    this.model.raiseEvent({name: 'infoWindowRendered',
				                       id: this.id   // info window widget id                    
                                      });
            },
            
            onRender: function onRender() {
                this.open();
            },
            
            getChildren: function getChildren(){
                var m = this.model,
                    c = m.getLayoutDataCache(m.getCurrentLayoutKey())[this.psId],
                    f = c.defn.fmts;
                
                // Override positioning format of child.
                f.left = DARK_BORDER_WIDTH + 'px';
                f.top = DARK_BORDER_WIDTH + 'px';
                
                return [c];
            }
        }
    );
}());