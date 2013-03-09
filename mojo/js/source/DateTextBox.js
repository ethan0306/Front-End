(function(){

    mstrmojo.requiresCls("mstrmojo.ValidationTextBox", "mstrmojo.Calendar", "mstrmojo.Popup", "mstrmojo._HasPopup", "mstrmojo.locales", "mstrmojo.string");

    var _MK = mstrmojo.ValidationTextBox.prototype.markupMethods,
        _S = mstrmojo.string;
    
 
    
    /**
     * <p>DateTextBox is a text box that accepts date/time string input.</p>
     * 
     * <p>You can type directly into the text box or use the calendar pop up to help 
     * select a new date/time string. It can support validation by default. </p>
     * 
     * @class
     * @extends mstrmojo.ValidationTextBox
     * 
     */
    mstrmojo.DateTextBox = mstrmojo.declare(
            // superclass
            mstrmojo.ValidationTextBox,
            
            // mixins
            [mstrmojo._HasPopup],
            
            /**
             * @lends mstrmojo.DateTextBox.prototype
             */
            {
                scriptClass: "mstrmojo.DateTextBox",
                
                /**
                 * Whether the calendar pop up shall be appended to document body instead of popup node. 
                 * Set it to true if the calendar pop up is hidden due to z-index problem. 
                 */
                calendarToBody: false, 
                
                /**
                 * zIndex for calendar popup.
                 */
                calendarZIndex: 100,
                
                /**
                 * Update the value of this text box using Calendar using an OK button. 
                 * This setting would be ignored when the dtp is timestamp/time, when an OK button is always used. 
                 */
                changeValueOnOK: false,
                
                /**
                 * Whether this text box would accept multiple values separated by list separator, which is dependent on current locale. 
                 */
                isList: false,
                
                /**
                 * The data type of this text box. 
                 * It shall be one of date (14), timestamp (16) or time(15). 
                 */
                dtp:14,//date
                
                /**
                 * Whether to convert the date input by users into standard output format defined by specific locale. 
                 */
                autoFormat:true,
                
                markupString:'<div id="{@id}" class="mstrmojo-DateTextBox {@cssClass}" style="{@cssText}">' +
                                  '<input class="mstrmojo-DateTextBox-input" type="text" title="{@tooltip}"' +
                                    'value="{@value}" size="{@size}" maxlength="{@maxLength}" index="{@tabIndex}"' +
                                    ' mstrAttach:focus,keyup,blur />' +
                                  '<div class="mstrmojo-DateTextBox-icon" mstrAttach:click> </div>' +
                                  '<div class="mstrmojo-DateTextBox-popup"></div>' + 
                             '</div>',
                             
                markupSlots: {
                    inputNode: function(){ return this.domNode.firstChild; },
                    iconNode: function() { return this.domNode.childNodes[1]; },
                    popupNode: function(){ return this.domNode.lastChild;}
                },
                
                
                markupMethods: {
                    onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; },
                    onwidthChange: function() { if(this.width) {this.inputNode.style.width = (this.width - 20) + 'px'; this.iconNode.style.left = (this.width - 18) + 'px'; this.domNode.style.width = this.width + 'px';} },
                    onvalueChange: _MK.onvalueChange,
                    onvalidationStatusChange: _MK.onvalidationStatusChange
                },                  
                
                calConfig: null,
                
                calendar: {
                    scriptClass:'mstrmojo.Popup',
                    cssClass: 'mstrmojo-DateTextBox-calendar',
                    locksHover: true,
                    slot: 'popupNode',  
                    onOpen: function(){
                        var o = this.opener,
                            z = o && o.calendarZIndex,
                            c = this.cal,
                            cfg = o && o.calConfig;
                        
                        if(z){
                            this.domNode.style.zIndex = z;
                        }
                        
                        for (var k in cfg) {//TO-DO: consider move calConfig to popup instead. 
                            c.set(k, cfg[k]);
                        }
                    },
                    children:[
                              {
                                  scriptClass:"mstrmojo.Calendar",
                                  alias:'cal',
                                  bindings: {
                                      dtp: "this.parent.opener.dtp",
                                      value: "this.parent.opener.value",
                                      changeValueOnOK: function(){
                                          var dtp = this.parent.opener.dtp, 
                                              cv = this.parent.opener.changeValueOnOK;
                                          return dtp === 15 || dtp === 16 || cv;
                                      }
                                  },                                          
                                  onValueUpdate:function(evt){
                                      var op = this.parent && this.parent.opener;
                                      if(op){
                                          var v = op.value,
                                              ls = window.mstrConfig && window.mstrConfig.listSep || ';';
                                          if(op.isList && !_S.isEmpty(v)){
                                              op.set('value', op.value + ls + this.value);
                                          } else {
                                              op.set('value',this.value);
                                          }
                                          op.closePopup();
                                      }
                                  }
                              }
                              ]
                },
                
                
                /**
                 * Event handler for click event to open/close the calendar popup. 
                 */
                onclick: function(evt){
                    var p = this._lastOpened, c = this._calendarConfig;
                    if(!c){
                        c = {};
                        if(this.calendarToBody){
                            delete this.calendar.slot;
                            c.placeholder = document.body.appendChild(document.createElement("div"));
                            c.nudge = function(){
                                var op = this.opener;
                                if(op){
                                    var p = mstrmojo.dom.position(op.popupNode,true), 
                                        s = this.domNode.style;
                                    s.left = p.x + "px";
                                    s.top = p.y + "px";
                                }
                            };
                        } 
                        this._calendarConfig = c;
                    }
                    if (p && p.visible) {
                        this.closePopup();
                    } else {
                        // Use a property-name reference in order to leverage caching.
                        this.openPopup('calendar', c);
                    }
                },
                
                unrender: function(){
                    this._super();
                    
                    //TQMS 499367: need to unrender the calendar popup as it won't do that automatically
                    if (this.calendar.hasRendered){
                        this.calendar.unrender();
                    }
                }
        }      
    );

})();                