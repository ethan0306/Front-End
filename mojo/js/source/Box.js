(function () {

    mstrmojo.requiresCls("mstrmojo.Container");

    var $WIDGET = mstrmojo.Widget;

    mstrmojo.Box = mstrmojo.declare(

        mstrmojo.Container,

        null,

        {
            scriptClass: "mstrmojo.Box",

            markupString: '<div id="{@id}" class="mstrmojo-Box {@cssClass}" style="{@cssText}"></div>',

            markupSlots: {
                containerNode: function () { return this.domNode; }
            },

            markupMethods: {
                onvisibleChange: $WIDGET.visibleMarkupMethod,
                onheightChange: $WIDGET.heightMarkupMethod,
                onwidthChange: $WIDGET.widthMarkupMethod
            }
        }
    );

}());