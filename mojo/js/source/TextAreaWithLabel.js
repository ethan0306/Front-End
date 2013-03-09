(function () {

    mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.css", "mstrmojo.TextArea");

    /**
     * A text area with a label next to it.
     * 
     * @class
     * @extends mstrmojo.TextArea
     */
    mstrmojo.TextAreaWithLabel = mstrmojo.declare(
    // superclass
    mstrmojo.TextArea,

    // mixins
    null,

    /**
     * @lends mstrmojo.TextAreaWithLabel.prototype
     */
    {
        scriptClass: 'mstrmojo.TextAreaWithLabel',

        /**
         * The string to appear before the textarea.
         * 
         * @type String
         */
        label: '',

        /**
         * The string to appear after the textarea.
         * 
         * @type String
         */
        rightLabel: '',

        cssDisplay: 'inline',

        markupString: '<div class="mstrmojo-TextAreaWithLabel {@cssClass}" style="{@cssText}">' + 
            '<span class="mstrmojo-TextArea-label">{@label}</span>' + 
            '<textarea id="{@id}" class="mstrmojo-TextArea {@inputNodeCssClass}"  style="{@inputNodeCssText}" ' + 'title="{@tooltip}" ' + 
                'rows="{@rows}" cols="{@cols}" maxlength="{@maxLength}" index="{@tabIndex}"' + ' mstrAttach:focus,keydown,keyup,blur ' + '></textarea>' + 
            '<span class="mstrmojo-TextArea-label-right">{@rightLabel}</span>' +
        '</div>',

        markupSlots: {
            inputNode: function () {
                return this.domNode.firstChild.nextSibling;
            }
        },

        preBuildRendering: function () {
            this.markupMethods = mstrmojo.hash.copy({
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? this.cssDisplay : 'none';
                },
                oncssClassChange: function () {
                    this.domNode.className = "mstrmojo-TextAreaWithLabel " + (this.cssClass || '');
                }
            }, mstrmojo.hash.copy(this.markupMethods));
        }
    });
}());