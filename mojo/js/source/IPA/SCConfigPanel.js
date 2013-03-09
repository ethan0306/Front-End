(function () {

    mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.HTMLButton", "mstrmojo._FillsBrowser", "mstrmojo.IPA.PluginTreeBrowser", "mstrmojo.IPA.ConfigEntryList");

    mstrmojo.IPA.SCConfigPanel = mstrmojo.declare(
    // superclass
    mstrmojo.HBox,

    // mixins
    [mstrmojo._FillsBrowser],

    /**
     * @lends mstrmojo.IPA.SCConfigPanel.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.SCConfigPanel",

        children: [{
            scriptClass: "mstrmojo.IPA.PluginTreeBrowser",
            cssClass: "mstrmojo-IPA-SystemCheckTree",
            kiType: 33,
            multiSelect: false,
            noCheckBox: true,
            selectionAcrossBranch: false,
            listSelector: mstrmojo.TreeNodeSelector,
            alias: "selectionslide",
            

            handlenodechange: function handlenodechange(evt) {

                var ki = evt.src.selectedItem;

                if (ki && ki.m && ki.p && ki.n) {
                    var cfg = {
                        taskId: 'healthCenterGetKIConfigurationEntries',
                        machine: ki.m,
                        product: ki.p,
                        ki: ki.n
                    };

                    var configEntryList = this.parent.configslidewrapper;

                    //set the items array to null first to reset screen
                    configEntryList.set("items", null);


                    var callback = {
                        success: function (res) {
                            var i, entryArray = res.entries,
                                len = entryArray.length;
                            for (i = 0; i < len; i++) {
                                entryArray[i] = mstrmojo.hash.make(entryArray[i], mstrmojo.Obj, null);
                            }
                            configEntryList.set("machine", ki.m);
                            configEntryList.set("product", ki.p);
                            configEntryList.set("ki", ki.n);
                            configEntryList.set("items", entryArray);

                        },
                        failure: function (res) {
                            if (res) {
                                mstrmojo.alert('Failed to get config: ' + res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                            }
                        }
                    };


                    mstrmojo.xhr.request("POST", mstrConfig.taskURL, callback, cfg);
                }


            }
        },

        {
            scriptClass: "mstrmojo.Container",
            alias: "configslidewrapper",
            items: null,
            cssClass: "mstrmojo-IPA-SystemCheckTree",
            markupString: '<div id="{@id}" class="mstrmojo-ConfigEntryWrapper {@cssClass}">' + '<div></div>' + '<div></div>' + '</div>',
            markupSlots: {
                entryNode: function () {
                    return this.domNode.firstChild;
                },
                labelNode: function () {
                    return this.domNode.lastChild;
                }
            },

            children: [{
                scriptClass: "mstrmojo.IPA.ConfigEntryList",
                alias: "configslide",
                slot: "entryNode",
                bindings: {
                    visible: function () {
                        var isVisible = this.parent.items && this.parent.items.length > 0;
                        return isVisible;
                    },
                    items: function () {
                        var items = this.parent.items;
                        return items;
                    }
                }
            }, {
                scriptClass: "mstrmojo.Label",
                alias: "noconfiglabel",
                text: "There is no configuration entry required for this system check.",
                cssText: "margin:10px",
                slot: "labelNode",
                bindings: {
                    visible: function () {
                        return this.parent.items && this.parent.items.length === 0;
                    }
                }
            }]
        },

        {

            scriptClass: 'mstrmojo.HTMLButton',
            cssClass: "mstrmojo-IPA-ConfigEntryApplyButton",
            text: "Save Configuration",
            cssText: "margin: 0px 10px 10px 10px;",
            onclick: function () {

                if (this.enabled) {

                    var configEntryList = this.parent.configslidewrapper;

                    if (!configEntryList.ki) {
                        mstrmojo.alert("No system check selected");
                        return;
                    }

                    var values = configEntryList.configslide.getConfigEntryValues();
                    var configEntries = new Array(values.length);
                    var i;
                    for (i = 0; i < values.length; i++) {
                        configEntries[i] = configEntryList.items[i].name;
                    }


                    var cfg = {
                        taskId: 'healthCenterSaveConfigurationEntryTask',
                        machine: configEntryList.machine,
                        product: configEntryList.product,
                        ki: configEntryList.ki,
                        entry: configEntries,
                        value: values
                    };

                    var callback = {
                        success: function () {
                            mstrmojo.alert("Configuration saved successfully!");

                        },
                        failure: function (res) {
                            if (res) {
                                mstrmojo.alert('Failed to save config: ' + res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                            }
                        }
                    };


                    mstrmojo.xhr.request("POST", mstrConfig.taskURL, callback, cfg);
                }
            },

            bindings: {
                enabled: function () {
                    return (this.parent.configslidewrapper.items && this.parent.configslidewrapper.items.length > 0);
                }

            }
        }]

    });

}());