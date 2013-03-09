(function () {
    mstrmojo.requiresCls("mstrmojo.WidgetListMapper", "mstrmojo.WidgetList", "mstrmojo.Container", "mstrmojo.Label");
    mstrmojo.requiresDescs(6098);
    
    /**
     * Widget for displaying Knowledge Item Configuration Info
     * 
     * @class
     * @extends mstrmojo.WidgetList
     */
    mstrmojo.IPA.SCConfigInfo = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.SCConfigInfo.prototype
     */
    {

        scriptClass: "mstrmojo.IPA.SCConfigInfo",
        markupString: '<div id="{@id}" class="mstrmojo-ConfigItem {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            nameNode: function () {
                return this.domNode.firstChild;
            },
            configNode: function () {
                return this.domNode.lastChild;
            }
        },
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "nameLabel",
            slot: "nameNode",
            cssText: "font-weight:bold;margin: 10px 0 5px 0;",
            bindings: {
                text: function () {
                    return this.parent.cfg.machine + "► " + this.parent.cfg.product + "► " + this.parent.cfg.ki;
                }
            }
        }, {
            scriptClass: "mstrmojo.IPA.ConfigList",
            alias: "configList",
            slot: "configNode",
            bindings: {
                items: "this.parent.cfg.configs"
            }
        }

        ]
    });  
    
    
    /**
     * Widget for displaying a list of Configuration
     * 
     * @class
     * @extends mstrmojo.WidgetList
     */
    mstrmojo.IPA.ConfigList = mstrmojo.declare(
    mstrmojo.WidgetList, null,

    /**
     * @lends mstrmojo.ConfigList.prototype
     */
    {

        scriptClass: "mstrmojo.IPA.ConfigList",

        items: null,
        listMapper: mstrmojo.WidgetListMapper,

        itemFunction: function (item, idx, widget) {

            return mstrmojo.insert({
                scriptClass: "mstrmojo.Label",

                config: item,
                cssText: "margin: 0 0 0 10px;",
                bindings: {
                    text: function () {
                        var i, val = this.config.value, len = val.length;
                        if (this.config.type === 1) {
                            val = "";
                            for (i=0; i< len; i++) {
                                val = val.concat("*");
                            }
                        }
                        
                        if (this.config.type === 4) {
                            if (val === 0) {
                               val = mstrmojo.desc(6098, "N/A");
                            }
                        }
                        
                        return this.config.entry + ": " + val;
                    }
                }
            });

        }
    });

}());