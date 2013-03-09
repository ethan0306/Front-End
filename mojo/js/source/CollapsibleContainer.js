(function () {

    mstrmojo.requiresCls("mstrmojo.Container", "mstrmojo._Collapsible", "mstrmojo.HBox", "mstrmojo.Button", "mstrmojo.Label");

    /**
     * if you want to define your own title bar, please use titleBar. Otherwise, use the default title bar 
     * by defining the 'title' variable
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.CollapsibleContainer = mstrmojo.declare(

    //superclass
    mstrmojo.Container,

    //mixin
    [mstrmojo._Collapsible],

    /**
     * @lends mstrmojo.CollapsibleContainer.prototype
     */
    {
        scriptClass: "mstrmojo.CollapsibleContainer",

        /**
         * the variable of expended or collapse state
         */
        expanded: false,

        /**
         * the customized title bar widget. optional  
         */
        titleBar: null,

        /**
         * the title is required if use default title bar
         */
        title: '&nbsp;',

        /**
         * mark string
         */
        markupString: '<div id="{@id}" class="mstrmojo-CollapsibleContainer {@cssClass}">' + '<div class="{@titleCssClass}"></div>' + '<div class="mstrmojo-CollapsibleContainer-content"></div>' + '</div>',

        /** 
         * mark slots
         */
        markupSlots: {

            /**
             * the title bar node
             */
            titleBarNode: function () {
                return this.domNode.firstChild;
            },

            /**
             * the container node for expend or collapse part
             */
            containerNode: function () {
                return this.domNode.lastChild;
            }
        },


        /**
         * mark methods
         */
        markupMethods: {
            /**
             * change event method for expended variable
             */
            onexpandedChange: function () {
                var _target = this.containerNode;

                if (this.expanded) {
                    this.expandDown(_target);
                } else {
                    this.collapseUp(_target);
                }
            }
        },

        /**
         * 
         * @param {Object} dn The domNode for Button or HTMLButton.
         */
        toggleExpandImg: function (dn) {
            if (dn) {
                if (this.expanded) {
                    mstrmojo.css.toggleClass(dn, "mstrmojo-expand-button", false);
                    mstrmojo.css.toggleClass(dn, "mstrmojo-collapse-button", true);
                } else {
                    mstrmojo.css.toggleClass(dn, "mstrmojo-collapse-button", false);
                    mstrmojo.css.toggleClass(dn, "mstrmojo-expand-button", true);
                }
            }
        },

        preBuildRendering: function preBuildRendering() {
            var tb = this.titleBar;
            if (tb) {
                tb.parent = this;
            } else {
                this.titleCssClass = "mstrmojo-webserver-titlebar";
            }

            if (this._super) {
                this._super();
            }
        },

        postBuildRendering: function postBuildRendering() {
            if (this._super) {
                this._super();
            }

            //disable animation for IE 9
            this.animate = (navigator.appName !== 'Microsoft Internet Explorer');

            var tb = this.titleBar,
                w;
            if (tb) {
                w = mstrmojo.insert(tb);
                w.set(parent, this);
            } else {
                var cc = this,
                    tt = this.title;
                w = mstrmojo.insert({
                    scriptClass: "mstrmojo.HBox",
                    parent: this,
                    children: [{
                        scriptClass: "mstrmojo.Button",
                        cssText: "margin-left:2px;margin-right:10px;",
                        postApplyProperties: function () {
                            if (cc.expanded) {
                                this.iconClass = "mstrmojo-collapse-button";
                            } else {
                                this.iconClass = "mstrmojo-expand-button";
                            }
                        },
                        onclick: function () {
                            cc.set("expanded", !cc.expanded);
                            cc.toggleExpandImg(this.domNode);
                        }
                    }, {
                        scriptClass: "mstrmojo.Label",
                        text: tt
                    }]
                });
            }

            w.render();
            this.titleBarNode.appendChild(w.domNode);
        }
    });

}());