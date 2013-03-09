(function () {    

    /* Required classes for TristateCheckBox */
    mstrmojo.requiresCls(
            "mstrmojo.Label",
            "mstrmojo.css",
            "mstrmojo.hash");
    
    /**
     * TristateCheckBox is a widget that works similarly to the CheckBox input element in html. Compared to the CheckBox input element though,
     * it is able to show a third state, when its grayed parameter is set to true. When the grayed is set to false, then it would work the same
     * as the CheckBox input element: when clicked, it would switch between checked and unchecked. To retrieve the value of a TristateCheckBox, 
     * you need to retrieve both grayed and checked parameters:
     * if grayed = true, checked = true, 3rd state;
     * if grayed = false, checked = false, unchecked;
     * if grayed = false, checked = true, checked;
     * grayed = false, checked = false is an invalid state and shall not be used. 
     */
    mstrmojo.TristateCheckBox = mstrmojo.declare(
            // superclass
            mstrmojo.Label,
            
            // mixins
            null,
            
            /**
             * @lends mstrmojo.TristateCheckBox.prototype
             */
            {
                scriptClass:'mstrmojo.TristateCheckBox', 
                grayed: true,
                checked: true,
                cssClass: 'tristate',                
                onclick: function() {
                    if (this.grayed) {
                        this.set('grayed', !this.grayed);
                    } else {
                        this.set('checked', !this.checked);
                    }
                },
                markupMethods: mstrmojo.hash.copy({
                    oncheckedChange: function() {
                        mstrmojo.css.toggleClass(this.domNode, 'checked', this.checked);
                    },
                    ongrayedChange: function() {
                        mstrmojo.css.toggleClass(this.domNode, 'grayed', this.grayed);
                    },
                    onenabledChange: function() {
                        mstrmojo.css.toggleClass(this.domNode, 'disabled', !this.enabled);
                    }
                }, mstrmojo.hash.copy(mstrmojo.Label.prototype.markupMethods))
            }
    ); 
    
})();