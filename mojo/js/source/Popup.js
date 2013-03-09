(function() {

    mstrmojo.requiresCls("mstrmojo.Container", 
            "mstrmojo._IsPopup", 
    "mstrmojo._CanAutoClose");

    /**
     * Popup is a Container that is also a popup and can autoHide.
     */
    mstrmojo.Popup = mstrmojo.declare(
            // superclass
            mstrmojo.Container,
            // mixins
            [mstrmojo._IsPopup, mstrmojo._CanAutoClose],
            // instance members
            {
                scriptClass: "mstrmojo.Popup",

                shadowNodeCssClass: "mstrmojo-popup-shadow",

                contentNodeCssClass: "mstrmojo-popup-content",

                cssDisplay : "block",

                markupString: '<div id="{@id}" class="mstrmojo-Popup {@cssClass}" style="{@cssText}" '
                    + '><div class="mstrmojo-Popup-shadow {@shadowNodeCssClass}"></div><div class="mstrmojo-Popup-content {@contentNodeCssClass}"></div>',

                    markupSlots: {
                containerNode: function(){ return this.domNode.lastChild; },
                shadowNode: function() { return this.domNode.firstChild; }
            },

            markupMethods: {
                onvisibleChange: function() { this.domNode.style.display = (this.visible) ? this.cssDisplay : 'none'; },
                onleftChange: function(){ this.domNode.style.left = (this.left != null) ? this.left: ''; },
                ontopChange: function(){ this.domNode.style.top = (this.top != null) ? this.top: ''; }
            }

            }
    );

})();