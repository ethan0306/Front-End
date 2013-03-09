(function(){
    
    mstrmojo.requiresCls("mstrmojo.gmaps.GoogleMap", "mstrmojo._IsSelectorTarget");
    
    /**
     * <p>Google Map.</p>
     * 
     * @class
     * @extends mstrmojo.gmaps.GoogleMap
     */
    mstrmojo.gmaps.GoogleMapOIVM = mstrmojo.declare(
        // superclass
        mstrmojo.gmaps.GoogleMap,
        
        // mixins
         [mstrmojo._IsSelectorTarget],
        
        /**
         * @lends mstrmojo.Button.prototype
         */
        {
            scriptClass: 'mstrmojo.gmaps.GoogleMapOIVM',
            
            _w : null,
            
            model : null,
            
            getWidget : function(gridParams){
                if(!this._w && gridParams){
                    for(var i in mstrmojo.all){
                        if(mstrmojo.all[i].k == gridParams.key){							
                            this._w = mstrmojo.all[i];
                            break;
                        }
                    }
                }
                return this._w;
            },
            			
			getDocModel : function getDocModel()
			{				
				return this.xtabModel.docModel;
			},
			
            getVisProps : function(gridParams){
								
				 if(!this._w){
				 	this.getWidget(gridParams);
				 }
				return this._super(gridParams);
            },
            			
            getExecutionScope:function(){
				if(!this.isOIVM())
                {
                    return this._super();
                }
 	           return "2";
	        },
			
	        getMsgId:function(){
				if(!this.isOIVM())
                {
                    return this._super();
                }
	           return mstrApp.docModel.mid;
	        },
            
            execDynamiclLink2 : function execDynamiclLink2(cells) {                
                // Retrieve the action from the model.
                
                var action = this.xtabModel.getLinkDrillAction(cells),				
                    handler = action && action.h;

                // Do we have a handler and does our controller support this handler?
                if (handler && this.controller[handler]) {
                    // Call the handler (passing in the action).
                    this.xtabModel.controller[handler](this, action.a);                 
                }
        
            },
            
            persistWidgetProps:function persistWidgetProps() {
				if(!this.isOIVM())
                {                   
                    return this._super();
                }
				
				var key = this._w.k;
				
		        var widgetPropsXml =  this.createWidgetPropsXML();
	  
				var props = {};											
				props[key] = {
					           FormattingWidget: "WidgetProps" + '\u001F' + widgetPropsXml
				             };
				
				this.getDocModel().saveRWProps(this._w.k, props , 1, false, {success:function() {}});            	
            },            
			
			
            applySelection:function applySelection(sliceInfo) { // sliceInfo needs pos and elementIndex.
                
				 if(!this.isOIVM())
                {					
                    return this._super(sliceInfo);
                }
				var sInfo = this.getSelectionInfo(sliceInfo);
				
                if(sInfo && !!sInfo.targetKeys){
					
                    this.getDocModel().slice({
                        type: mstrmojo.EnumRWUnitType.GRID,
                        ck: sInfo.controlKeyContext,
                        //ctlKey: this._w.k,
						ctlKey: sInfo.controlKey,
                        tks: sInfo.targetKeys,
                        eid: sInfo.elementsList,
                        sPos :{x:0,y:0,h:0,w:0}
                    });
                }
            }
        }
    )
}());