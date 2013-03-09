(function() {

    mstrmojo.requiresCls("mstrmojo.TextBox","mstrmojo._CanValidate");

    var _C = mstrmojo.css,
        _V = mstrmojo.validation,
        _TR = _V.TRIGGER,
        _SC = _V.STATUSCODE,
        _MK = mstrmojo.TextBox.prototype.markupMethods;
    
    /**
     * A text box control that can validate its value.
     * 
     * @class
     * @extends mstrmojo.TextBox
     */
    mstrmojo.ValidationTextBox = mstrmojo.declare(
        // superclass
        mstrmojo.TextBox,
        
        // mixins
        [mstrmojo._CanValidate],
        
        /**
         * @lends mstrmojo.TextBox.prototype
         */
        {
            scriptClass: 'mstrmojo.ValidationTextBox',
            
            validationDelay: 500,
            
            markupMethods: {
                onvisibleChange: _MK.onvisibleChange,
                onvalueChange: _MK.onvalueChange,
                onenabledChange: _MK.onenabledChange,
                onreadOnlyChange: _MK.onreadOnlyChange,
                ontooltipChange: _MK.ontooltipChange,                
                onvalidationStatusChange: function(){
		            var vs = this.validationStatus;
		            if(!vs) {
		                return;
		            }
		            var it = this.inputNode,
		                isInvalid = (vs.code > _SC.VALID),
		                css = this.constraints.invalidCssClass;   
		                
		            _C.toggleClass(it, css ? css : ['mstrmojo-TextBox-ErrValidation'], isInvalid);
		            if(isInvalid){
		                it.setAttribute('title', vs.msg);
		            }else{
		                if (this._original_tooltip !== undefined && this._original_tooltip !== null) {
		                    it.setAttribute('title', this._original_tooltip);
		                }
		            }                   
		        }
            },

            /**
             * Override to attach event handlers. 
             */
            postBuildRendering: function pstBR(){
                if(this._super) {
                    this._super();
                }
                
                //store original tooltip
                this._original_tooltip = this.inputNode.title;  
            },
            
            /**
             * Handler for keyup event to validate after some delay if configured.  
             */
            prekeyup: function pku(evt) {
                if(this._super){
                    this._super(evt);   
                }
                var tri = (this.constraints.trigger & _TR.ONKEYUP) > 0;
                if(tri){
                    if(this._valDelayTimer){
                        window.clearTimeout(this._valDelayTimer);
                    }
                    
                    if(!this._validateHandler){
                        var me = this;
                        this._validateHandler = function(){
                            me.validate();      
                            if(me._valDelayTimer){
                                window.clearTimeout(me._valDelayTimer);
                                delete me._valDelayTimer;
                            }                        
                        };
                    }
                    
                    this._valDelayTimer = window.setTimeout(this._validateHandler, this.validationDelay);
                }
            },
            
            preinput: function() {
                if(this._super){
                    this._super(evt);   
                }
                var tri = (this.constraints.trigger & _TR.ONKEYUP) > 0;
                if(tri){
                    this.validate();   
                }
            },
            
            /**
             * Handler for blur event to validate the input if configured. 
             */
            preblur: function pb(evt) {
                if(this._super){
                    this._super(evt);   
                }
                var tri = (this.constraints.trigger & _TR.ONBLUR) > 0;
                if(tri){
                    this.validate();   
                }
            },

            /**
             * Provide this method to clear validation status/appearance. 
             */
            clearValidation: function clearValidation(){
                if(this._super){
                    this._super();   
                }
                var it = this.inputNode,
                    css = this.constraints.invalidCssClass;
                _C.removeClass(it, css ? css : ['mstrmojo-TextBox-ErrValidation']);
                it.title = this._original_tooltip; 
            }            
        });
})();            