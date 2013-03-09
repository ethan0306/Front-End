(function(){

    mstrmojo.requiresCls("mstrmojo.Widget");
    
    mstrmojo.EditableLabel = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.EditableLabel",
            
            /**
             * The text (or HTML) to be displayed in the label.
             */
            text: null,
            
            editable: false,
            
            /**
             * optional text that acts as tooltip for this Editable label
             * @type String
             */
            title: '',

            markupString: '<div id="{@id}" class="mstrmojo-EditableLabel {@cssClass}" title="{@title}" contenteditable="{@editable}" style="{@cssText}" mstrAttach:click,blur,keyup>' + 
                          '</div>',
            
            markupMethods: {
                ontextChange: function(){ this.domNode.innerHTML = (this.text != null) ? this.text : ''; },
                oncssTextChange: function() { this.domNode.style.cssText = (this.cssText != null) ? this.cssText : ''; },
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; },
                oneditableChange: function() {					
                	this.domNode.contentEditable = this.editable;
					this.domNode.spellcheck = false;
                    mstrmojo.css[this.editable ? 'addClass' : 'removeClass'](this.domNode, ['editable']);
					if (this.editable) {
						this.domNode.focus();						
						document.execCommand('selectAll', false, null);
					}
					else
					{
						this.domNode.blur();
					}
                },
            },
            	
            // There are no markupSlots, so we can omit that property.

            /**
             * If true, this widget will update its visible property when we set its "text" property:
             * false, if text is null or empty; true otherwise.
             */
            autoHide: false,
            
            /**
             * Custom setter for text, implements the autoHide feature.
             */
            _set_text: function sttxt(n, v) {
                if (this.autoHide) {
                    this.set('visible', (v!=null) && (v!=="")); // must use !=="" because value 0 should not be hidden
                }
                var was = this.text;
                this.text = v;
                return was != v;
            },
            
            
            onclick: function(){
            	this.set('editable', true);          	
            	
            },
            
            onblur: function(){            	
            	this.set('text',this.domNode.innerHTML);
            	this.set('editable', false);
            },
            
            onkeyup: function(event){              	
            	//For FF: pass event object, event.e contains keyCodes            	
            	var evt = window.event? window.event : event.e;            	
            	var key = evt.keyCode;
            	
            	if(key == 27){			 //escape key escapes any edits
            		this.set('text',this.data.name);
            		this.set("title",this.data.name);            		
            		this.render();            		
            	}
            	if(key == 13){		//enter key saves the text            		
            		var newText = this.domNode.innerHTML.replace(/<div><br><\/div>/,""); //for chrome
            		newText = newText.replace(/<br>/,""); //for chrome
            		newText = newText.replace(/<br><br>/,""); //for FF
            		if(newText.length > 0){
            			this.set('text',newText);
            			this.set("title",newText);
            		}            		
            		else{
            			this.set('text',this.data.name);
                		this.set("title",this.data.name);
                		this.render();
            		}
            		this.set('editable', false);
            	}
            }
            
        }
    );
    
})();