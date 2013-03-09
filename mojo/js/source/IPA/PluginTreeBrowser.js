(function () {

    mstrmojo.requiresCls("mstrmojo.TreeBrowserNode", "mstrmojo.TreeBrowser", "mstrmojo.css");

    /**
     * <p>Represents a tree for Health Center plugin hierarchy (Machine - Product - KI).</p>
     * 
     * @class
     * @extends mstrmojo.TreeBrowser
     */
    mstrmojo.IPA.PluginTreeBrowser = mstrmojo.declare(

    // superclass
    mstrmojo.TreeBrowser,

    // mixins
    null,

    /**
     * @lends mstrmojo.IPA.PluginTreeBrowser.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.PluginTreeBrowser",
        cssClass: "mstrmojo-IPA-PluginTreeBrowser",
        selectionAcrossBranch: false,
        kiType: 0,
        handleGetContentFailure: null,

        getContentThroughTaskCall: function (param, callback) {
            var cfg = {}, w = this;
            cfg.ki_ty = this.kiType;

            if (param.isRoot) {
                cfg.taskId = "ipaGetMachine";
            } else if (param.data.t === "0") {
                cfg.taskId = "ipaGetProduct";
                cfg.m = param.data.n;
            } else if (param.data.t === "1") {
                cfg.taskId = "ipaGetKnowledgeItem";
                cfg.m = param.data.m;
                cfg.p = param.data.n;
            }

            if (cfg.taskId) {

                mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                    success: function (res) {
                        callback.success({
                            items: res.items
                        });
                    },
                    failure: function (res) {
                        if (w.handleGetContentFailure) {
                            w.handleGetContentFailure(res);
                        }
                    }
                }, cfg);
            }
        },

        isBranch: function (data) {
            return (data.t !== "2");
        },

        item2textCss: function item2textCss(data) {
            var textCss = data.st + " t" + data.t;

            if (data.t === "1") {
                if (data.n === "Configuration") {
                    textCss += " conf";
                } else if (data.n === "MicroStrategy Desktop") {
                    textCss += " desk";
                } else if (data.n === "MicroStrategy Enterprise Manager") {
                    textCss += " em";
                } else if (data.n === "MicroStrategy Intelligence Server") {
                    textCss += " iserver";
                } else if (data.n === "MicroStrategy Narrowcast Server") {
                    textCss += " ncs";
                } else if (data.n === "MicroStrategy Office") {
                    textCss += " off";
                } else if (data.n === "MicroStrategy Web Services") {
                    textCss += " ws";
                } else {
                    textCss += " web";
                }
            }

            if (data.t === "2" && !data.hc) {
                textCss += " noCfg";
            } else {
                textCss += " hasCfg";
            }

            return textCss;
        },
        onnodechange: function onnodechange(evt) {
            this._super(evt);
            if (this.handlenodechange) {
                this.handlenodechange(evt);
            }
        },

        itemFunction: function ifn(item, idx, w) {
            var tree = w.tree || w,
                iw = new mstrmojo.TreeBrowserNode({
                    data: item,
                    state: 0,
                    parent: w,
                    tree: tree,
                    multiSelect: w.multiSelect,
                    text: item[w.itemDisplayField],
                    textCssClass: tree.item2textCss(item),
                    cssClass: "mstrmojo-IPA-PluginTreeNode",
                    items: item[w.itemChildrenField],
                    itemIdField: w.itemIdField,
                    itemDisplayField: w.itemDisplayField,
                    itemIconField: w.itemIconField,
                    itemChildrenField: w.itemChildrenField,
                    itemFunction: w.itemFunction,
                    listSelector: w.listSelector,
                    isSpecialNode: function isSpecialNode() {
                        return tree.isBranch(item) || !item.hc;
                    },
                    bindings: {
                        showNode: function () {
                            return this.tree.showAll || this.data.t !== "2" || this.data.hc;
                        }
                    },
                    onshowNodeChange: function () {
                        if (this.domNode) {
                            mstrmojo.css.toggleClass(this.domNode, "hide", !this.showNode);
                        }
                    },
                    onRender: function () {
                        mstrmojo.css.toggleClass(this.domNode, "hide", !this.showNode);
                    }

                });
            return iw;
        }

    });

}());