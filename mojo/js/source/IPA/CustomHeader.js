(function () {

    mstrmojo.requiresCls("mstrmojo.Container", "mstrmojo.Button");



    /**
     * Widget used as custom table header in datagrid.  Supports sorting, perhaps later filtering as well.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.IPA.CustomHeader = mstrmojo.declare(
    mstrmojo.Container,

    null,

    /**
     * @lends mstrmojo.IPA.CustomHeader.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.CustomHeader",
        dataField: "",
        text: "",
        model: null,
        markupString: '<div id="{@id}" class="mstrmojo-IPA-CustomHeader {@cssClass}" style="{@cssText}">' + '<div> </div>' + '<div> </div>' + '</div>',

        markupSlots: {
            descNode: function () {
                return this.domNode.childNodes[0];
            },
            sortButtonNode: function () {
                return this.domNode.childNodes[1];
            }
        },
    	markupMethods: {
    	    onvisibleChange: function(){this.domNode.style.display = this.visible? 'block' : 'none';}
    	},

        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "headerText",
            slot: "descNode",
            cssClass: "customHeader-Text",
            postBuildRendering: function postBuildRendering() {
                this.set("text", this.parent.text);
            }
        },
        {
            scriptClass: "mstrmojo.Button",
            alias: "sortButton",
            slot: "sortButtonNode",
            iconClass: "customHeader-ascBtn",
            onclick: function () {

                var prop = this.parent.dataField;
                
                var asc = !eval("this.parent.model.sortAsc." + prop);
                this.parent.model.sortAsc.set(prop, asc);
                
                this.parent.dataGrid.sort(prop, asc);
            },

            postBuildRendering: function () {

                var prop = this.parent.dataField;
                var asc = !eval("this.parent.model.sortAsc." + prop);

                if (asc) {
                    //this.set("iconClass", "customHeader-ascBtn");
                    mstrmojo.css.removeClass(this.domNode, "customHeader-descBtn");
                    mstrmojo.css.addClass(this.domNode, "customHeader-ascBtn");
                } else {
                    //this.set("iconClass", "customHeader-descBtn");
                    mstrmojo.css.removeClass(this.domNode, "customHeader-ascBtn");
                    mstrmojo.css.addClass(this.domNode, "customHeader-descBtn");
                }
            }
        }]


    });

})();