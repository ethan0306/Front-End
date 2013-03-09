(function () {

    mstrmojo.requiresCls("mstrmojo.Container", "mstrmojo._HasLayout", "mstrmojo.Label", "mstrmojo.IPA.ActionList", "mstrmojo.DataGrid");

    mstrmojo.requiresDescs(39, 487, 527, 2751, 4699);

    /**
     * Widget for displaying detail information of an alert
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.IPA.AlertDetailPanel = mstrmojo.declare(
    mstrmojo.Container,

    null,

    /**
     * @lends mstrmojo.IPA.AlertDetailPanel.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.AlertDetailPanel",

        alert: null,

        markupString: '<div id="{@id}" class="mstrmojo-AlertDetailPanel {@cssClass}" style="{@cssText}">' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '<div></div>' + '</div>',

        markupSlots: {
            helpNode: function () {
                return this.domNode.childNodes[0];
            },
            resultNode: function () {
                return this.domNode.childNodes[1];
            },
            alertGridNode: function () {
                return this.domNode.childNodes[2];
            },
            actionNode: function () {
                return this.domNode.childNodes[3];
            }
        },

        children: [{
            scriptClass: 'mstrmojo.Label',
            slot: 'helpNode',
            alias: 'help',
            cssClass: 'mstrmojo-IPA-AlertDetail-Help',
            bindings: {
                text: "this.parent.alert.help"
            }
        },
        {
            scriptClass: 'mstrmojo.Label',
            slot: 'resultNode',
            alias: 'result',
            cssClass: 'mstrmojo-IPA-AlertDetail-Result',
            bindings: {
                text: "this.parent.alert.desc"
            }
        },
        {
            scriptClass: 'mstrmojo.DataGrid',
            slot: 'alertGridNode',
            alias: 'alertGrid',
            cssClass: "mstrmojo-AlertDetailGrid",
            cssText:"width:auto;",
            renderOnScroll: true,
            columns: [{
            	colWidth: 110,
                headerText: mstrmojo.desc(487, "Time"),
                dataField: "time",
                colCss: "alertGrid-timeCol"
            },
            {
            	colWidth: 250,
                headerText: mstrmojo.desc(39, "Description"),
                dataWidget: {
                    scriptClass: 'mstrmojo.CollapsiblePanel',
                    cssClass: "mstrmojo-IPA-RealTimeAlertHistory",
                    expanded: false,
                    children: [{
                        scriptClass: 'mstrmojo.DataGrid',
                        cssClass: "mstrmojo-AlertHistoryGrid",
                        cssText:"width:250px",
                        resizable: true,
                        expandable: false,
                        columns: [{
                            headerText: mstrmojo.desc(487, "Time"),
                            dataField: "htime"
                        },
                        {
                            headerText: mstrmojo.desc(527, "Value"),
                            dataField: "hval"
                        }],
                        bindings: {
                            items: "this.parent.parent.data.hist"
                        }
                    }],
                    postApplyProperties: function () {
                        var old = mstrmojo.all[this.parent.data.id];
                        if (old) {
                            old.destroy();
                        }
                        this.id = this.parent.data.id;
                        this.title = this.parent.data.desc;
                        this.expanded = (mstrmojo.array.indexOf(mstrmojo.all.alertModel.expandedAlertHistory, this.id) > -1);                        
                    },
                    postBuildDom: function () {			    
                        if (this.parent.data.hist.length === 0 ) {
                            if (this.domNode) {
                                mstrmojo.css.addClass(this.domNode.firstChild.firstChild, "hide");
                            }
                        }                               
                    },
                    onexpandedChange: function () {
                        if (this.expanded) {
                            mstrmojo.array.insert(mstrmojo.all.alertModel.expandedAlertHistory, 0, this.id);
                        } else {
                            mstrmojo.array.removeItem(mstrmojo.all.alertModel.expandedAlertHistory, this.id);
                        }
                    }

                },
                colCss: "alertGrid-descCol"
            },
            {
            	colWidth: 150,
                headerText: mstrmojo.desc(4699, "Email"),
                dataField: "email",
                colCss: "alertGrid-emailCol"
            },
            {
            	colWidth: 130,
                headerText: mstrmojo.desc(2751, "Message"),
                dataField: "msg",
                colCss: "alertGrid-msgCol"
            }],
            bindings: {
                items: "this.parent.alert.list"
            }
        },
        {
            scriptClass: 'mstrmojo.IPA.ActionList',
            slot: 'actionNode',
            alias: 'actions',
            cssClass: 'action-buttons',
            bindings: {
                items: "this.parent.alert.actions"
            }
        }],

        postBuildRendering: function postBuildRendering() {
            var rtn = true;
            if (this._super) {
                rtn = this._super();
            }

            this.actions.attachEventListener('doAction', this.id, function (item) {
                var alert = this.alert;
                mstrmojo.all.alertController.doAction(alert.m, alert.p, alert.ki, item.action, item.type, item.param);
            });

            if (this.alert.rt) {
                this.result.set("visible", false);
            } else {
                this.alertGrid.set("visible", false);
            }


            return rtn;
        }
    });

}());