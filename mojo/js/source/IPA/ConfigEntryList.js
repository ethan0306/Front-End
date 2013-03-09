(function () {
    mstrmojo.requiresCls("mstrmojo.WidgetListMapper", "mstrmojo.WidgetList", "mstrmojo.css", "mstrmojo.dom", "mstrmojo.Container", "mstrmojo.Label", "mstrmojo.TextBoxWithLabel", "mstrmojo.TextAreaWithLabel");

    mstrmojo.requiresDescs(8573, 8574);

    /**
     * Widget for displaying a list of Configuration Entries
     * 
     * @class
     * @extends mstrmojo.WidgetList
     */
    mstrmojo.IPA.ConfigEntryList = mstrmojo.declare(
    mstrmojo.WidgetList, null,

    /**
     * @lends mstrmojo.ConfigEntryList.prototype
     */ {
        scriptClass: "mstrmojo.IPA.ConfigEntryList",
        items: null,
        listMapper: mstrmojo.WidgetListMapper,
        isEntrySharable: false,

        itemFunction: function (item, idx, widget) {

            var w, widgetClass;
            if (item.type === 0) {
                widgetClass = "mstrmojo.IPA.ConfigEntryInteger";
            } else if (item.type === 1) {
                widgetClass = "mstrmojo.IPA.ConfigEntryPassword";
            } else if (item.type === 2) {
                widgetClass = "mstrmojo.IPA.ConfigEntryString";
            } else if (item.type === 3) {
                widgetClass = "mstrmojo.IPA.ConfigEntryEnum";
            } else if (item.type === 4) {
                widgetClass = "mstrmojo.IPA.ConfigEntryTimeFilter";
            } else if (item.type === 5) {
                widgetClass = "mstrmojo.IPA.ConfigEntryLongString";
            }

            w = mstrmojo.insert({
                scriptClass: widgetClass,
                entry: item,
                list: widget,
                idx: idx,
                cssClass: "mstrmojo-IPA-ConfigEntry",
                cssText: "clear:both",
                isSharable: widget.isEntrySharable
            });

            if (!widget.isEntrySharable) {
                w.shareCheckBox.set("visible", false);
            }

            return w;
        },


        getConfigEntryValues: function () {
            var itemWidgets = this.ctxtBuilder.itemWidgets;
            var valuesArray = new Array(itemWidgets.length);

            var i;
            for (i = 0; i < itemWidgets.length; i++) {
                var w = itemWidgets[i];
                valuesArray[i] = w.getValue();

            }
            return valuesArray;
        },

        getConfigEntries: function () {
            var itemWidgets = this.ctxtBuilder.itemWidgets;
            var valuesArray = new Array(itemWidgets.length);

            var i;
            for (i = 0; i < itemWidgets.length; i++) {
                var w = itemWidgets[i],
                    entry = {};
                entry.shared = w.shareCheckBox.isChecked();
                entry.value = w.getValue();
                entry.name = w.entry.name;

                valuesArray[i] = entry;

            }
            return valuesArray;
        }

    });



    mstrmojo.IPA.ConfigEntryInteger = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ConfigEntryInteger.prototype
     */ {
        scriptClass: "mstrmojo.IPA.ConfigEntryInteger",
        markupString: '<div id="{@id}" class="mstrmojo-ConfigEntryInteger {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            shareNode: function () {
                return this.domNode.firstChild;
            },
            inputNode: function () {
                return this.domNode.childNodes[1];
            },
            helpTextNode: function () {
                return this.domNode.childNodes[2];
            },
            statusNode: function () {
                return this.domNode.lastChild;
            }
        },
        entry: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.TextBoxWithLabel",
            alias: "input",
            slot: "inputNode",
            inputNodeCssText: "float:right"
        }, {
            scriptClass: "mstrmojo.CheckBox",
            alias: "shareCheckBox",
            slot: "shareNode",
            cssText: "float:right"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "helpLabel",
            slot: "helpTextNode",
            cssClass: "mstrmojo-ConfigEntry-Help"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "statusLabel",
            slot: "statusNode",
            cssClass: "mstrmojo-ConfigEntry-Status"
        }],
        preBuildRendering: function () {
            this.input.value = this.entry.data;
            this.input.label = this.entry.name;
            this.helpLabel.text = this.entry.help;
            this.shareCheckBox.checked = this.entry.share;
            this.statusLabel.text = (!this.isSharable || this.entry.share) ? "" : mstrmojo.desc(8573, "No common value found");

            if (this.entry.oldData && (this.entry.data != this.entry.oldData)) {
                this.input.set("inputNodeCssClass", "highlight");
            }
            
            if (this.entry.disabled) {
            	this.input.set("enabled", false);
            }
        },


        getValue: function () {
            return this.input.value;
        }


    });



    mstrmojo.IPA.ConfigEntryString = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ConfigEntryString.prototype
     */ {
        scriptClass: "mstrmojo.IPA.ConfigEntryString",
        markupString: '<div id="{@id}" class="mstrmojo-ConfigEntryString {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            shareNode: function () {
                return this.domNode.firstChild;
            },
            inputNode: function () {
                return this.domNode.childNodes[1];
            },
            helpTextNode: function () {
                return this.domNode.childNodes[2];
            },
            statusNode: function () {
                return this.domNode.lastChild;
            }
        },
        entry: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.TextBoxWithLabel",
            alias: "input",
            slot: "inputNode",
            inputNodeCssText: "float:right"
        }, {
            scriptClass: "mstrmojo.CheckBox",
            alias: "shareCheckBox",
            slot: "shareNode",
            cssText: "float:right"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "helpLabel",
            slot: "helpTextNode",
            cssClass: "mstrmojo-ConfigEntry-Help"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "statusLabel",
            slot: "statusNode",
            cssClass: "mstrmojo-ConfigEntry-Status"
        }],
        preBuildRendering: function () {
            this.input.value = this.entry.data;
            this.input.label = this.entry.name;
            this.helpLabel.text = this.entry.help;
            this.shareCheckBox.checked = this.entry.share;
            this.statusLabel.text = (!this.isSharable || this.entry.share) ? "" : mstrmojo.desc(8573, "No common value found");

            if (this.entry.oldData && (this.entry.data != this.entry.oldData)) {
                this.input.set("inputNodeCssClass", "highlight");
            }            
            if (this.entry.disabled) {
            	this.input.set("enabled", false);
            }
        },

        getValue: function () {
            return this.input.value;
        }



    });

    mstrmojo.IPA.ConfigEntryPassword = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ConfigEntryPassword.prototype
     */ {
        scriptClass: "mstrmojo.IPA.ConfigEntryPassword",
        markupString: '<div id="{@id}" class="mstrmojo-ConfigEntryPassword {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            shareNode: function () {
                return this.domNode.firstChild;
            },
            inputNode: function () {
                return this.domNode.childNodes[1];
            },
            helpTextNode: function () {
                return this.domNode.childNodes[2];
            },
            statusNode: function () {
                return this.domNode.lastChild;
            }
        },
        entry: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.TextBoxWithLabel",
            alias: "input",
            slot: "inputNode",
            type: "password",
            inputNodeCssText: "float:right"
        }, {
            scriptClass: "mstrmojo.CheckBox",
            alias: "shareCheckBox",
            slot: "shareNode",
            cssText: "float:right"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "helpLabel",
            slot: "helpTextNode",
            cssClass: "mstrmojo-ConfigEntry-Help"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "statusLabel",
            slot: "statusNode",
            cssClass: "mstrmojo-ConfigEntry-Status"
        }],
        preBuildRendering: function () {
            this.input.value = this.entry.data;
            this.input.label = this.entry.name;
            this.helpLabel.text = this.entry.help;
            this.shareCheckBox.checked = this.entry.share;
            this.statusLabel.text = (!this.isSharable || this.entry.share) ? "" : mstrmojo.desc(8573, "No common value found");

            if (this.entry.oldData && (this.entry.data != this.entry.oldData)) {
                this.input.set("inputNodeCssClass", "highlight");
            }
            if (this.entry.disabled) {
            	this.input.set("enabled", false);
            }            
        },

        getValue: function () {
            return this.input.value;
        }



    });

    mstrmojo.IPA.ConfigEntryEnum = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ConfigEntryEnum.prototype
     */ {
        scriptClass: "mstrmojo.IPA.ConfigEntryEnum",
        markupString: '<div id="{@id}" class="mstrmojo-ConfigEntryEnum {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            shareNode: function () {
                return this.domNode.firstChild;
            },
            inputNode: function () {
                return this.domNode.childNodes[1];
            },
            helpTextNode: function () {
                return this.domNode.childNodes[2];
            },
            statusNode: function () {
                return this.domNode.lastChild;
            }
        },
        entry: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.DropDownList",
            alias: "input",
            slot: "inputNode",
            cssText: "float:right"
        }, {
            scriptClass: "mstrmojo.CheckBox",
            alias: "shareCheckBox",
            slot: "shareNode",
            cssText: "float:right"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "helpLabel",
            slot: "helpTextNode",
            cssClass: "mstrmojo-ConfigEntry-Help"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "statusLabel",
            slot: "statusNode",
            cssClass: "mstrmojo-ConfigEntry-Status"
        }],
        preBuildRendering: function () {
            this.input.title = this.entry.name;
            this.input.options = this.entry.list;
            this.input.value = this.entry.data || this.entry.list[0].n;
            this.helpLabel.text = this.entry.help;
            this.shareCheckBox.checked = this.entry.share;
            this.statusLabel.text = (!this.isSharable || this.entry.share) ? "" : mstrmojo.desc(8573, "No common value found");

            if (this.entry.oldData && (this.entry.data != this.entry.oldData)) {
                this.input.set("cssClass", "highlight");
            }
            if (this.entry.disabled) {
            	this.input.set("enabled", false);
            }           
        },

        getValue: function () {
            return this.input.selectNode.value;
        }


    });


    mstrmojo.IPA.ConfigEntryTimeFilter = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ConfigEntryTimeFilter.prototype
     */ {
        scriptClass: "mstrmojo.IPA.ConfigEntryTimeFilter",
        markupString: '<div id="{@id}" class="mstrmojo-ConfigEntryTimeFilter {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            shareNode: function () {
                return this.domNode.firstChild;
            },
            inputNode: function () {
                return this.domNode.childNodes[1];
            },
            helpTextNode: function () {
                return this.domNode.childNodes[2];
            },
            statusNode: function () {
                return this.domNode.lastChild;
            }
        },
        entry: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.TextBoxWithLabel",
            alias: "input",
            slot: "inputNode",
            inputNodeCssText: "float:right",
            emptyText: mstrmojo.desc(8573, "<Enter value to enable, clear value to disable>")
        }, {
            scriptClass: "mstrmojo.CheckBox",
            alias: "shareCheckBox",
            slot: "shareNode",
            cssText: "float:right"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "helpLabel",
            slot: "helpTextNode",
            cssClass: "mstrmojo-ConfigEntry-Help"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "statusLabel",
            slot: "statusNode",
            cssClass: "mstrmojo-ConfigEntry-Status"
        }],
        preBuildRendering: function () {
            this.input.value = (this.entry.filter) ? this.entry.data : "";
            this.input.label = this.entry.name;
            this.helpLabel.text = this.entry.help;
            this.shareCheckBox.checked = this.entry.share;
            this.statusLabel.text = (!this.isSharable || this.entry.share) ? "" : mstrmojo.desc(8573, "No common value found");

            mstrmojo.css.addClass(this.input, "highlight");

            if (this.entry.oldData && (this.entry.data != this.entry.oldData)) {
                this.input.set("inputNodeCssClass", "highlight");
            }
            if (this.entry.disabled) {
            	this.input.set("enabled", false);
            }
        },

        getValue: function () {
            var val = this.input.value;
            if (val === "") {
                return 0;
            }
            return this.input.value;
        }

    });

    mstrmojo.IPA.ConfigEntryLongString = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ConfigEntryLongString.prototype
     */ {
        scriptClass: "mstrmojo.IPA.ConfigEntryLongString",
        markupString: '<div id="{@id}" class="mstrmojo-ConfigEntryLongString {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            shareNode: function () {
                return this.domNode.firstChild;
            },
            inputNode: function () {
                return this.domNode.childNodes[1];
            },
            helpTextNode: function () {
                return this.domNode.childNodes[2];
            },
            statusNode: function () {
                return this.domNode.lastChild;
            }
        },
        entry: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.TextAreaWithLabel",
            alias: "input",
            slot: "inputNode",
            inputNodeCssText: "float:right;resize:both;",
            rows: 4,
            cols: 30
        }, {
            scriptClass: "mstrmojo.CheckBox",
            alias: "shareCheckBox",
            slot: "shareNode",
            cssText: "float:right"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "helpLabel",
            slot: "helpTextNode",
            cssClass: "mstrmojo-ConfigEntry-Help"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "statusLabel",
            slot: "statusNode",
            cssClass: "mstrmojo-ConfigEntry-Status"
        }],
        preBuildRendering: function () {
            this.input.value = this.entry.data;
            this.input.label = this.entry.name;
            this.helpLabel.text = this.entry.help;
            this.shareCheckBox.checked = this.entry.share;
            this.statusLabel.text = (!this.isSharable || this.entry.share) ? "" : mstrmojo.desc(8573, "No common value found");

            if (this.entry.oldData && (this.entry.data != this.entry.oldData)) {
                this.input.set("inputNodeCssClass", "highlight");
            }
            if (this.entry.disabled) {
            	this.input.set("enabled", false);
            }
        },

        getValue: function () {
            return this.input.value;
        }



    });

}());