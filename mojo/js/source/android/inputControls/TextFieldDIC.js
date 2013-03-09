(function(){
    
    mstrmojo.requiresCls("mstrmojo.TextFieldDIC");
    
    mstrmojo.android.inputControls.TextFieldDIC = mstrmojo.declare(
        mstrmojo.TextFieldDIC,
        null,
        {
            scriptClass: 'mstrmojo.android.inputControls.TextFieldDIC',
            
            cssClass: 'mstrmojo-TextFieldDIC',
            
            cssDisplay: 'block',
            
            //override to use the fixed size;
            onfontChange: mstrmojo.emptyFn,
            
            /**
             * @override mstrmojo.TextFieldDIC.applyChanges
             */
            applyChanges: function() {
                //TQMS 506312: for Chinese or Korean input, the virtual keyboard can input values without triggering
                //key up, therefore, the value will not get changed. So calling the domNode blur function to force the
                //input box value applied to widget value.
                this.domNode.blur();
                return this._super();
            },
            
            /**
             * @override mstrmojo.TextFieldDIC.handleInvalid
             */
            handleInvalid: function(){
                //Only show the warning but do not revert to the old value
                mstrmojo.alert(this.validationStatus.msg);
            },

            /**
             * Overrides the focus function so that the setCaret function will not get called for android
             */
            focus: function() {
                this.validate();
            }
        }
    );
}());