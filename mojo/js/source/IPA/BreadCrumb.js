(function () {

    mstrmojo.requiresCls("mstrmojo.WidgetList", "mstrmojo.Label", "mstrmojo.IPA.CollapsibleLabel");

    mstrmojo.IPA.BreadCrumb = mstrmojo.declare(
    // superclass
    mstrmojo.WidgetList,

    // mixins
    null,

    // instance members
    {

        scriptClass: "mstrmojo.IPA.BreadCrumb",
        items: [],
        itemFunction: function ifn(item, idx, w) {

            var i, entryText = "",
                cssClass = "mstrmojo-BreadCrumbEntry";
            if (idx === w.items.length - 1) {
                cssClass = "mstrmojo-BreadCrumbLastEntry";
            }

            if (item instanceof Array) {
                return new mstrmojo.IPA.CollapsibleLabel({
                    parent: w,
                    items: item,
                    cssClass: cssClass
                });
            } else {
                return new mstrmojo.Label({
                    parent: w,
                    text: item,
                    cssClass: cssClass
                });
            }
        },
        
        postBuildRendering: function() {
            if (this._super) {
                this._super();
            }
            this.itemsContainerNode.style.width = 'auto';	                
        }

    });
}());