(function () {
    mstrmojo.requiresCls("mstrmojo.WidgetListMapper", "mstrmojo.WidgetList", "mstrmojo.css", "mstrmojo.dom", 
    "mstrmojo.Container", "mstrmojo.Label", "mstrmojo.DropDownList", "mstrmojo.HTMLButton", "mstrmojo.TextBoxWithLabel");

    mstrmojo.requiresDescs(1442);
    
    /**
     * Widget for displaying a list of Actions
     * 
     * @class
     * @extends mstrmojo.WidgetList
     */
    mstrmojo.IPA.ActionList = mstrmojo.declare(
    mstrmojo.WidgetList, null,

    /**
     * @lends mstrmojo.ActionList.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.ActionList",
        items: null,
        listMapper: mstrmojo.WidgetListMapper,

        itemFunction: function (item, idx, widget) {

            var widgetClass;
            if (item.t === 0) {
                widgetClass = "mstrmojo.IPA.ActionNoParam";
            } else if (item.t === 1) {
                widgetClass = "mstrmojo.IPA.ActionStringParam";
            } else if (item.t === 2) {
                widgetClass = "mstrmojo.IPA.ActionOptionParam";
            }

            return mstrmojo.insert({
                scriptClass: widgetClass,
                action: item,
                list: widget
            });

        }
    });


    mstrmojo.IPA.ActionNoParam = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ActionNoParam.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.ActionNoParam",
        markupString: '<div id="{@id}" class="mstrmojo-ActionNoParam {@cssClass}" style="{@cssText}">' +
            '<div></div>' +
            '<div></div>' + 
            '</div>',
            
        markupSlots: {
            nameNode: function () {
                return this.domNode.firstChild;
            },
            descNode: function () {
                return this.domNode.lastChild;
            }
        },
        action: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "nameLabel",
            slot: "nameNode",
            cssClass: "actionName",
            onclick: function () {
                this.parent.list.raiseEvent({
                    name: "doAction",
                    action: this.parent.action.name,
                    type: this.parent.action.t
                });
            }
        },
        {
            scriptClass: "mstrmojo.Label",
            alias: "descLabel",
            slot: "descNode",
            cssClass: "actionDesc"
        }

        ],
        preBuildRendering: function () {
            this.nameLabel.text = this.action.n;
            this.descLabel.text = this.action.desc;
        }


    });



    mstrmojo.IPA.ActionStringParam = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ActionStringParam.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.ActionStringParam",
        markupString: '<div id="{@id}" class="mstrmojo-ActionStringParam {@cssClass}" style="{@cssText}">' +
            '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',


        markupSlots: {
            nameNode: function () {
                return this.domNode.firstChild;
            },
            descNode: function () {
                return this.domNode.childNodes[1];
            },
            inputNode: function () {
                return this.domNode.childNodes[2];
            },
            buttonNode: function () {
                return this.domNode.lastChild;
            }
        },

        action: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "nameLabel",
            slot: "nameNode",
            cssClass: "actionName",
            onclick: function () {
                this.parent.inputTextBox.set("visible", true);
                this.parent.submitButton.set("visible", true);
            }

        },
        {
            scriptClass: "mstrmojo.Label",
            alias: "descLabel",
            slot: "descNode",
            cssClass: "actionDesc"
        },
        {
            scriptClass: "mstrmojo.TextBoxWithLabel",
            alias: "inputTextBox",
            cssClass: "actionInput",
            slot: "inputNode",
            visible: false
        },
        {
            scriptClass: "mstrmojo.HTMLButton",
            alias: "submitButton",
            slot: "buttonNode",
            text: mstrmojo.desc(1442, "OK"),
            visible: false,
            onclick: function () {
                this.parent.list.raiseEvent({
                    name: "doAction",
                    action: this.parent.action.name,
                    type: this.parent.action.t,
                    param: this.parent.inputTextBox.value
                });
            }
        }

        ],
        preBuildRendering: function () {
            this.nameLabel.text = this.action.n;
            this.descLabel.text = this.action.desc;
            this.inputTextBox.label = this.action.sdesc || "";
            this.inputTextBox.tooltip = this.action.ldesc  || "";

        }
    });





    mstrmojo.IPA.ActionOptionParam = mstrmojo.declare(
    mstrmojo.Container, null,

    /**
     * @lends mstrmojo.IPA.ActionOptionParam.prototype
     */

    {
        scriptClass: "mstrmojo.IPA.ActionOptionParam",
        markupString: '<div id="{@id}" class="mstrmojo-ActionOptionParam {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',


        markupSlots: {
            nameNode: function () {
                return this.domNode.firstChild;
            },
            descNode: function () {
                return this.domNode.childNodes[1];
            },
            inputNode: function () {
                return this.domNode.childNodes[2];
            },
            buttonNode: function () {
                return this.domNode.lastChild;
            }
        },

        action: null,
        list: null,
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "nameLabel",
            slot: "nameNode",
            cssClass: "actionName",
            onclick: function () {
                this.parent.dropDown.set("visible", true);
                this.parent.submitButton.set("visible", true);
            }

        },
        {
            scriptClass: "mstrmojo.Label",
            alias: "descLabel",
            slot: "descNode",
            cssClass: "actionDesc"
        },
        {
            scriptClass: "mstrmojo.DropDownList",
            alias: "dropDown",
            cssClass: "actionInput",
            selectCssClass: "actionInput-select",
            slot: "inputNode",
            visible: false
        },
        {
            scriptClass: "mstrmojo.HTMLButton",
            alias: "submitButton",
            slot: "buttonNode",
            text: mstrmojo.desc(1442, "OK"),
            visible: false,
            onclick: function () {
                this.parent.list.raiseEvent({
                    name: "doAction",
                    action: this.parent.action.name,
                    type: this.parent.action.t,
                    param: this.parent.dropDown.value
                });
            }
        }

        ],
        preBuildRendering: function () {
            this.nameLabel.text = this.action.n;
            this.descLabel.text = this.action.desc;
            this.dropDown.title = this.action.sdesc || "";
            this.dropDown.tooltip = this.action.ldesc || "";
            this.dropDown.options = this.action.option;
            this.dropDown.value = this.action.option[0].v;
        }

    });

}());