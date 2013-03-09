(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.hash", 
            "mstrmojo.Container", 
            "mstrmojo._FormatDefinition",
            "mstrmojo.FieldSet",
            "mstrmojo.Table");
    
    var _H = mstrmojo.hash,
    _N = mstrmojo.num;

    var createPaddingBox = function(ps) {
        return mstrmojo.hash.copy(
                    ps,
                    {
                        scriptClass: 'mstrmojo.ValidationTextBox',
                        maxLength: 6,
                        dtp: 4, //decimal
                        min: 0,
                        max: 100,
                        constraints: {
                            trigger: mstrmojo.validation.TRIGGER.ONKEYUP
                        },
                        bindings: {
                            m: ps.modelBinding,
                            value : function() {
                                var v = this.m[this.pr];
                                return v == null ? '' : this._PT2UserUnits(v).replace(/0{1,}$/, '').replace(/\.$/, '.0').replace(/,$/, ',0');  
                                //trim trailing 0s, and append one 0 if it has multiple before trimming
                            }
                        },
                        postCreate: function() {
                            this.markupMethods = mstrmojo.hash.copy({
                                        onvalueChange: function() { 
                                            //when model changes, update inputbox display
                                            this.inputNode.value = this.value;
                                        }
                                    },
                                    mstrmojo.hash.copy(this.markupMethods));
                        },
                        onValid: function() {
                            this.m[this.pr] = this._UserUnits2PT(this.value);
                        },
                        /**
                         * padding is saved as 'pt' in backend, which should be converted to local user units:
                         */
                        _PT2UserUnits: function(v) {
                            return _N.toLocaleString(_N.convertToLocalUnits(_N.toString(v) / 72.0));
                        },
                        /**
                         * convert user input into 'pt'
                         */
                        _UserUnits2PT: function(v) {
                          return _N.toLocaleString(_N.toString(_N.convertToUSUnits(v)) * 72.0);
                      }
                    }
        );
    };
   
    /**
     * <p>Create pefix and suffix label for a TextBox.</p>
     * <p>This label is supposed to be placed in TABLE cell</p>
     * @param {String} text Text to display
     * @param {String} slot Cell Location
     */
    var createPaddingBoxLabel = function(text, slot) {
        return {
            scriptClass: 'mstrmojo.Label',
            text: text,
            slot: slot            
        };
    };
    
    
 mstrmojo.PaddingFormatter = mstrmojo.declare (
            
            //superclass
            mstrmojo.Container,  
             
            //mixins
            null,
            
           {
               scriptClass: "mstrmojo.PaddingFormatter",
                         
               cssClass: 'mstrmojo-PaddingFormatter',
               
               markupString: '<div id={@id} class="{@cssClass}" style="{@cssText}"></div>',
               
               markupSlots: {
                   containerNode: function() { return this.domNode; }
               },
               
               markupMethods: {
                   onvisibleChange: function() { this.domNode.style.display = this.visible ? 'block' : 'none'; }
               },
               
               postCreate: function(){
                   this.onmodelChange();
               },
               
               onmodelChange: function(){
                   if(this.model && !this.model.scriptClass){
                       _H.make(this.model, mstrmojo.Obj);
                  }
               },
               
               children: [{
                   scriptClass: 'mstrmojo.FieldSet',
                   alias: 'padding',
                   cssClass: 'mstrmojo-FormatEditor-padding',
                   legend: mstrmojo.desc(2883), //Descriptor: Padding
                   children: [{
                                  scriptClass: 'mstrmojo.HBox',
                                  cssClass: 'paddingBox',
                                  children: [{
                                                 scriptClass: 'mstrmojo.Table',
                                                 rows: 2,
                                                 cols: 3,
                                                 children: [
                                                            //Left
                                                            createPaddingBoxLabel(mstrmojo.desc(3528), '0,0'), //Descriptor: Left
                                                            createPaddingBox({pr: 'LeftPadding', slot: '0,1', modelBinding: 'this.parent.parent.parent.parent.model'}),
                                                            createPaddingBoxLabel(mstrApp.unitsLabel, '0,2'),
                                                            
                                                            //Top
                                                            createPaddingBoxLabel(mstrmojo.desc(3526), '1,0'),       //Descriptor: Top
                                                            createPaddingBox({pr: 'TopPadding', slot: '1,1', modelBinding: 'this.parent.parent.parent.parent.model'}),
                                                            createPaddingBoxLabel(mstrApp.unitsLabel, '1,2')
                                                            ]
                                             },{
                                                 scriptClass: 'mstrmojo.Table',
                                                 rows: 2,
                                                 cols: 3,
                                                 children: [
                                                            //Right
                                                            createPaddingBoxLabel(mstrmojo.desc(3529), '0,0'),         //Descriptor: Right
                                                            createPaddingBox({pr: 'RightPadding', slot: '0,1', modelBinding: 'this.parent.parent.parent.parent.model'}),
                                                            createPaddingBoxLabel(mstrApp.unitsLabel, '0,2'),

                                                            //Bottom
                                                            createPaddingBoxLabel(mstrmojo.desc(3527), '1,0'),        //Descriptor: Bottom
                                                            createPaddingBox({pr: 'BottomPadding', slot: '1,1', modelBinding: 'this.parent.parent.parent.parent.model'}),
                                                            createPaddingBoxLabel(mstrApp.unitsLabel, '1,2')
                                                            ]
                                             }]
                              }]
               }]
           }
       ); //end declare()
})();