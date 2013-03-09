mstrmojo.DrillLinkMenu = mstrmojo.registry.ref({
        id: "mstrDrillLinkMenu",
        slot: "drillLinkMenuNode",
        scriptClass: "mstrmojo.Popup",
        cssClass: "mstrmojo-Menu",
        shadowNodeCssClass: "mstrmojo-Menu-shadow",
        contentNodeCssClass: "mstrmojo-Menu-content",
        locksHover: true,
        onOpen: function onOpen(){
            // Position this popup below the given button.
            var el = this.openerButton && this.openerButton.domNode,
                op = this.opener,
                diff = mstrmojo.boxmodel.offset(el, op && op[this.slot]),
                x = diff.left,
                y = diff.top + ((el && el.offsetHeight) || 0);
            
            this.set("left", x + "px");
            this.set("top", y + "px");
        },

        children: [
                   {
                       scriptClass: "mstrmojo.ListBox",
                       itemCssClass: "mstrmojo-ListBox-item mstrmojo-InteractiveText",
                       bindings: {
                           items:"this.parent.drillLinkItems"     
                               
                       },
                       onchange: function() {
                           // Do we have a selection?
                           if (this.selectedIndex !== -1) {
                               // Get the parent of our drop down button
                               // (which is the opener of our popup)...
                               var w = this.parent.opener;
                               
                               // Go to the link that is selected...
                               w.goToLink(this.selectedItem);
                               
                               //this.removeSelect(this.selectedIndex);
                               this.clearSelect();
                               
                               // Close the popup...
                               this.parent.close();
                           }
                       }
                   }
               ]

    });
