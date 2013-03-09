(function () {
    mstrmojo.requiresCls("mstrmojo.WidgetListMapper", "mstrmojo.WidgetList", "mstrmojo.CollapsibleContainer", "mstrmojo.IPA.CollapsibleLabel", "mstrmojo.IPA.ConfigEntryList");

    /**
     * Widget for displaying a list of Configuration Entries
     * 
     * @class
     * @extends mstrmojo.WidgetList
     */
    mstrmojo.IPA.MultiSystemCheckConfigPanel = mstrmojo.declare(

    //superclass
    mstrmojo.WidgetList,

    //mix-ins
    null,

    /**
     * @lends mstrmojo.MultiSystemCheckConfigPanel.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.MultiSystemCheckConfigPanel",
        items: null,
        listMapper: mstrmojo.WidgetListMapper,

        itemFunction: function (item, idx, widget) {

            var i, kis = new Array(item.kilist.length);
            for (i = 0; i < kis.length; i++) {
                kis[i] = item.kilist[i].ki;
            }

            var tb = {
                scriptClass: "mstrmojo.Container",
                markupString: '<table id="{@id}" class="{@cssClass}" style="{@cssText}"><tbody><tr>' +
                        '<td style="width:20px"></td>'+
                        '<td></td>'+
                    '</tr></tbody></table>',
                markupSlots: {
                    buttonNode: function () {
                        return this.domNode.firstChild.firstChild.firstChild;
                    },
                    labelNode: function () {
                        return this.domNode.firstChild.firstChild.lastChild;
                    }                    
                },                
                parent: this,
                cssText: "border-top-style:solid;border-bottom-style:solid",
                children: [{
                    scriptClass: "mstrmojo.Button",
                    slot: "buttonNode",
                    postApplyProperties: function () {
                        if (this.parent.parent.expanded) {
                            this.iconClass = "mstrmojo-collapse-button";
                        } else {
                            this.iconClass = "mstrmojo-expand-button";
                        }
                    },
                    onclick: function () {
                        this.parent.parent.set("expanded", !this.parent.parent.expanded);
                        this.parent.parent.toggleExpandImg(this.domNode);
                    }
                }, {
                    scriptClass: "mstrmojo.IPA.CollapsibleLabel",
                    slot: "labelNode",
                    showingAll: true,
                    items: kis,
                    minItemsToShow: kis.length
                }],
		    markupMethods: {
			onitemsChange: function() {
			    this.domNode.style.width="100%";
			}
                }
            };
                        
            return mstrmojo.insert({
                scriptClass: "mstrmojo.CollapsibleContainer",
                entry: item,
                parent: widget,
                idx: idx,
                expanded: true,
                titleBar: tb,
                children: {
                    scriptClass: "mstrmojo.IPA.ConfigEntryList",
                    items: item.entrylist,
                    alias: "configEntryList",
                    isEntrySharable: true
                },
                getKiDssIds: function() {
                    var i, dssids = new Array(this.entry.kilist.length);
		    for (i = 0; i < dssids.length; i++) {
		        dssids[i] = this.entry.kilist[i].dssid;
		    }
		    return dssids;
                }
            });
        },

        getConfigEntryValues: function () {
            var itemWidgets = this.ctxtBuilder.itemWidgets;
            var valuesArray = new Array(itemWidgets.length);

            var i;
            for (i = 0; i < itemWidgets.length; i++) {
                var w = itemWidgets[i];
                valuesArray[i] = {};
                valuesArray[i].entries = w.configEntryList.getConfigEntries();
                valuesArray[i].kis = w.getKiDssIds();
            }
            return valuesArray;
        }
    });

}());