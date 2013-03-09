(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Widget");
    
    mstrmojo.DropDownList = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins,
        null,
        
        // instance props+methods
        {
            scriptClass: "mstrmojo.DropDownList",
            
            /**
             * The text to appear to the left of the pulldown.
             */
            title: '',
            
            /**
             * Optional css class name for the select box within the pulldown control.
             */
            selectCssClass: '',

            /**
             * Tooltip text for the select box within the pulldown control.
             */
            tooltip: '',

            cssDisplay: 'inline',
            
            value : '',
            
            /**
             * While rendering the DropDownList, if unset is true, we will assume that the first option represents
             * the unset state and select it by default. And when user selects other options, this 
             * "unset option" would be removed automatically.
             * 
             *  TODO: Currently, we rely on widget users to pass in the unset option while setting this property to true.
             *  We could support having default unset values in the future.
             */
            unset: false,
            
            markupString: '<span id="{@id}"  class="mstrmojo-DropDownList {@cssClass}">' +
                    '{@title}' +
                    '<select id="{@id}_select" class="mstrmojo-DropDownList-select {@selectCssClass}"  style="{@cssText}" title="{@tooltip}"' +
                        'onchange="mstrmojo.all[\'{@id}\'].set(\'selected\', this.options[this.selectedIndex].value);">{@renderedOptions}' +
                    '</select>' +
                    '<div class = "strikeoutContainer"></div>' + 
                '</span>',
                
            markupSlots: {
                selectNode: function(){  return this.domNode.getElementsByTagName('select')[0]; }
            },
        
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? this.cssDisplay : 'none'; },
                onidxChange: function() {
                	var s = this.domNode.getElementsByTagName('select');
                	if (s && s.length) {
                		s[0].selectedIndex = this.idx;
                	}
                },
                onvalueChange : function(evt){
                    var sn = this.selectNode,
                        ops = sn.options,
                        v = this.value, idx;
                    for(var o = 0; o < ops.length; o++){
                        var b = ops[o].value == v;
                        if(b){
                            idx = o;

                            //check value to make sure the initial css class wont be removed at initialization stage 
                            if (v != '') {
                                mstrmojo.css.toggleClass(ops[o], 'selected', b);
                            }
                            
                            break;
                        }
                    }
                    
                    //If we have a dummy option, like the <attribute> or empty (nothing selected)
                    //remove the option once we make a valid selection
                    if(sn.length > 0 && idx > 0 && this.unset){
                        sn.remove(0);
                        idx--;
                        this.unset = false;
                    }
                    
                    this.set('idx', idx);
                },
                onwidthChange: function(){
                    if (this.width >= 0){
                        this.selectNode.style.width = this.width + 'px';
                    }
                }
            },
            
            onselectedChange : function(){
                var sn = this.selectNode;
                if(sn){
                    this.set('value', sn.value);
                }
            },
            
            preBuildRendering: function preBuildRendering() {
                
                // Create an array to hold the output.
                var out = [];
                var x = -1;
                
                // Select the first option if it's in the unset state
                if (this.unset){
                	this.idx = 0;
                }
                
                // Iterate through the options and create the html for each.
                var e = this.options;
                for (var i = 0, cnt = (e&&e.length)||0; i < cnt; i++) {
                    var o = e[i];
                    
                    // Is it selected?
                    var s = '';
                    if (this.idx == i) {
                        // Store the currently selected value for evt.valueWas.
                        this.selected = o.v;
                        this.value = o.v;
                        // Identify this option as being selected.
                        s = ' selected="true" class="selected"';
                    } 
                    out[++x] = '<option value="' + o.v + '"' + s + '>' + o.n;
                }
                
                // Replace the options collection with the resolved htmlText.
                this.renderedOptions = out.join('</option>');
                return true;
            }
                
        }
    );
    
})();