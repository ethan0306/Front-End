(function () {

    mstrmojo.requiresCls("mstrmojo.Container", "mstrmojo.Label");
    
    mstrmojo.requiresDescs(8571, 8572);

    mstrmojo.IPA.CollapsibleLabel = mstrmojo.declare(

    // superclass
    mstrmojo.Container,

    // mixins
    null,

    // instance members
    {

        scriptClass: "mstrmojo.IPA.CollapsibleLabel",
        minItemsToShow: 2,
        showingAll: false,
        items: [],
        text: "",
        markupString: '<div id="{@id}" class="mstrmojo-IPA-CollapsibleLabel {@cssClass}" style="{@cssText}">' + '<span></span>' + '<span></span>' + '</div>',

        markupSlots: {
            listNode: function () {
                return this.domNode.firstChild;
            },

            linkNode: function () {
                return this.domNode.lastChild;
            }
        },
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "list",
            slot: "listNode",
            cssText: "float:left",
            bindings: {
                text: function () {
                    var items = this.parent.items,
                        minItemsToShow = this.parent.minItemsToShow,
                        numItemsToShow, lastItemBeforeAnd, entryText = "";
                        
                    if (!items) {
                        //this is a regular string
                        return this.parent.text;
                    }

                    if (this.parent.showingAll || items.length <= minItemsToShow) {
                        numItemsToShow = items.length;
                        lastItemBeforeAnd = numItemsToShow - 1;
                    } else {
                        numItemsToShow = minItemsToShow;
                        lastItemBeforeAnd = numItemsToShow;
                    }
                    for (i = 0; i < numItemsToShow; i++) {
                        entryText += items[i];

                        if (i < lastItemBeforeAnd) {
                            if (i === lastItemBeforeAnd - 1) {
                                entryText += ", and ";
                            } else {
                                entryText += ", ";
                            }
                        }
                    }
                    return entryText;
                }


            }
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "link",
            slot: "linkNode",
            cssText: "float:left;margin-left:5px;text-decoration:underline;cursor:pointer",
            onclick: function () {
                this.parent.set("showingAll", !this.parent.showingAll);
            },
            bindings: {
                visible: function () {
                    return (this.parent.items) && (this.parent.items.length > this.parent.minItemsToShow);
                },

                text: function () {
                    if (this.parent.showingAll) {
                        return "(" + mstrmojo.desc(8572, "Show less") + ")";
                    }
                    var hiddenEntries = this.parent.items.length - this.parent.minItemsToShow;
                    return hiddenEntries + " " + mstrmojo.desc(8571, "more");
                }

            }
        }]
    });
}());