(function () {

    mstrmojo.requiresCls("mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.HTMLButton", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", "mstrmojo.DataGrid", "mstrmojo.IPA.AlertDetailPanel", "mstrmojo.IPA.CustomHeader", "mstrmojo._FillsBrowser", "mstrmojo.DropDownButton", "mstrmojo.CheckBox", "mstrmojo.ImageCheckBox", "mstrmojo.ListSelector");

    mstrmojo.requiresDescs(96, 512, 1695, 2043, 2461, 8078, 8564, 8565, 8566, 8567);

    function _destroyDetailPanels(w) {
        var hws = w.detailPanels,
            len = hws && hws.length,
            i;
        if (len > 0) {
            for (i = 0; i < len; i++) {
                if (hws[i]) {
                    hws[i].destroy(true);
                }
            }
        }
    }

    /**
     * 
     * 
     * @class
     * @extends mstrmojo.DataGrid
     */
    mstrmojo.IPA.AlertPanel = mstrmojo.declare(
    mstrmojo.DataGrid,

    [mstrmojo._FillsBrowser],

    /**
     * @lends mstrmojo.IPA.AlertPanel.prototype
     */

    {
        scriptClass: "mstrmojo.IPA.AlertPanel",
        cssClass: "mstrmojo-AlertGrid",
        cssText:"width:960px;margin:0 auto;",
        multiSelect: true,
        resizable: false,
        expandable: true,
        controller: null,
        expandedAlerts: [],
        detailPanels: [],
        isRealTime: false,
        listSelector: mstrmojo.ListSelector,
        columns: [{
            headerText: "",
            colWidth: 25,
            dataWidget: {
                scriptClass: "mstrmojo.Label",
                cssClass: "mstrmojo-AlertGrid-Expand",
                expanded: false,
                postApplyProperties: function () {
                    this.id = this.parent.data.m + this.parent.data.p + this.parent.data.ki + this.parent.data.c + this.parent.data.i;
                },
                onexpandedChange: function () {
                    mstrmojo.css.toggleClass(this.domNode, "expanded", this.expanded);
                },

                onclick: function (evt) {
                    var wrapper = this.domNode.parentNode.parentNode.parentNode;
                    var i = this.parent.dataGrid.listMapper.findIndex(this.parent.dataGrid, this.parent.dataGrid.itemsContainerNode, wrapper);

                    if (!this.expanded) {

                        var tr = document.createElement("tr");

                        //make the new row to have the same background color for visual continuation
                        tr.setAttribute("class", this.parent.domNode.attributes.getNamedItem("class").nodeValue);
                        mstrmojo.css.removeClass(tr, "selected");

                        wrapper.appendChild(tr);

                        var td = document.createElement("td");
                        td.setAttribute("colSpan", this.parent.dataGrid.columns.length);
                        tr.appendChild(td);

                        var div = document.createElement("div");
                        div.setAttribute("id", "div" + i);
                        td.appendChild(div);
                        td.setAttribute("style", "padding:0 60px 0 60px");

                        var data = this.parent.data;                        
                        mstrmojo.all.alertController.getAlertDetails(data);

                        wrapper.detail = mstrmojo.insert({
                            scriptClass: "mstrmojo.IPA.AlertDetailPanel",
                            placeholder: "div" + i,
                            alert: data
                        });

                        wrapper.detail.render();
                        this.set("expanded", true);


                        if (evt) {
                            if (mstrmojo.array.indexOf(this.parent.dataGrid.expandedAlerts, this.id) === -1) {
                                mstrmojo.array.insert(this.parent.dataGrid.expandedAlerts, 0, this.id);
                            }
                            this.parent.dataGrid.detailPanels.push(wrapper.detail);
                        }

                    } else {
                        wrapper.detail.destroy();
                        wrapper.detail = {};
                        wrapper.deleteRow(1);
                        this.set("expanded", false);

                        if (evt) {
                            mstrmojo.array.removeItem(this.parent.dataGrid.expandedAlerts, this.id);
                        }
                    }
                    
                    mstrmojo.all.alertModel.set("refreshAlerts", (this.parent.dataGrid.expandedAlerts.length === 0) );
                }
            }
        }, {        	
            headerWidget: {
                scriptClass: 'mstrmojo.DropDownButton',
                cssClass: 'mstrmojo-AlertGrid-DropDownButton',
                postCreate: function () {
                    if (!this.dataGrid.isRealTime) {
                        this.set("cssClass", "hide");
                    }
                    this.set("model", mstrmojo.all.alertModel);
                },
                popupRef: {
                    scriptClass: 'mstrmojo.Popup',
                    cssClass: "mstrmojo-Menu",
                    shadowNodeCssClass: "mstrmojo-Menu-shadow",
                    contentNodeCssClass: "mstrmojo-Menu-content",
                    cssText:"color:grey",
                    slot: 'popupNode',
                    locksHover: true,
                    children: [{
                        alias: "Buttons",
                        scriptClass: 'mstrmojo.Box',
                        children: [{
                            alias: 'All',
                            scriptClass: 'mstrmojo.Label',
                            text: mstrmojo.desc(2461, "All"),
                            cssClass: "mstrmojo-AlertGrid-MenuButton",
                            onclick: function () {
                                mstrmojo.all.alertModel.selectAllAlerts();
                                this.parent.parent.opener.closePopup();
                            }
                        }, {
                            alias: 'Read',
                            scriptClass: 'mstrmojo.Label',
                            text: mstrmojo.desc(8078, "Read"),
                            cssClass: "mstrmojo-AlertGrid-MenuButton",
                            onclick: function () {
                                mstrmojo.all.alertModel.selectReadAlerts();
                                this.parent.parent.opener.closePopup();
                            }
                        }, {
                            alias: 'Unread',
                            scriptClass: 'mstrmojo.Label',
                            text: mstrmojo.desc(8564, "Unread"),
                            cssClass: "mstrmojo-AlertGrid-MenuButton",
                            onclick: function () {
                                mstrmojo.all.alertModel.selectUnreadAlerts();
                                this.parent.parent.opener.closePopup();
                            }
                        }, {
                            alias: 'Error',
                            scriptClass: 'mstrmojo.Label',
                            text: mstrmojo.desc(96, "Error"),
                            cssClass: "mstrmojo-AlertGrid-MenuButton",
                            onclick: function () {
                                mstrmojo.all.alertModel.selectErrorAlerts();
                                this.parent.parent.opener.closePopup();
                            }
                        }, {
                            alias: 'Warning',
                            scriptClass: 'mstrmojo.Label',
                            text: mstrmojo.desc(1695, "Warning"),
                            cssClass: "mstrmojo-AlertGrid-MenuButton",
                            onclick: function () {
                                mstrmojo.all.alertModel.selectWarningAlerts();
                                this.parent.parent.opener.closePopup();
                            }
                        }, {
                            alias: 'None',
                            scriptClass: 'mstrmojo.Label',
                            text: mstrmojo.desc(2057, "None"),
                            cssClass: "mstrmojo-AlertGrid-MenuButton",
                            onclick: function () {
                                mstrmojo.all.alertModel.selectNoAlerts();
                                this.parent.parent.opener.closePopup();
                            }
                        }]
                    }]
                }
            },
            colWidth: 30,
            dataWidget: {
                scriptClass: "mstrmojo.ImageCheckBox",
                postApplyProperties: function () {
                    this.alertID = this.parent.data.m + this.parent.data.p + this.parent.data.ki + this.parent.data.c + this.parent.data.i;
                },
                preBuildRendering: function () {
                    if (!this.dataGrid.isRealTime) {
                        this.set("visible", false);
                    }
                },
                bindings: {
                    checked: function () {
                        var len = mstrmojo.all.alertModel.selectedAlerts.length;
                        return len && mstrmojo.all.alertModel.isSelected(this.alertID);
                    }
                },
                onclick: function () {
                    mstrmojo.all.alertModel.toggleAlertSelection(this.alertID, this.checked);
                }
            }
        }, {
            headerWidget: {
                scriptClass: 'mstrmojo.IPA.CustomHeader',
                text: mstrmojo.desc(2043, "Type"),
                dataField: "t",
                postCreate: function () {
                    this.set("model", mstrmojo.all.alertModel);
                }
            },
            colWidth: 45,
            dataWidget: {
                scriptClass: "mstrmojo.Label",
                cssClass: "mstrmojo-AlertGrid-button",
                postBuildRendering: function () {
                    mstrmojo.css.addClass(this.domNode, this.parent.data.t);
                }
            }
        }, {
            headerWidget: {
                scriptClass: 'mstrmojo.IPA.CustomHeader',
                text: mstrmojo.desc(8078, "Read"),
                dataField: "read",
                postCreate: function () {
                    if (!this.dataGrid.isRealTime) {
                        this.set("visible", false);
                    }
                    this.set("model", mstrmojo.all.alertModel);
                }
            },
            colWidth: 35,
            dataWidget: {
                scriptClass: "mstrmojo.Label",
                cssClass: "mstrmojo-AlertGrid-button",
                postBuildRendering: function () {
                    if (!this.dataGrid.isRealTime) {
                        this.set("visible", false);
                    }
                    mstrmojo.css.addClass(this.domNode, this.parent.data.read);
                },
                onclick: function (evt) {
                    var alerts = this.parent.data.list,
                        alertIDs = [];
                    alertIDs[0] = alerts[0].id;
                    mstrmojo.all.alertController.setAlertReadStatus(alertIDs, this.parent.data.read);
                }
            }
        }, {
            headerWidget: {
                scriptClass: 'mstrmojo.IPA.CustomHeader',
                text: mstrmojo.desc(8565, "Machine Name"),
                dataField: "m",
                postCreate: function () {
                    this.set("model", mstrmojo.all.alertModel);
                }
            },
            colWidth: 100,
            dataField: "m"
        }, {
            headerWidget: {
                scriptClass: 'mstrmojo.IPA.CustomHeader',
                text: mstrmojo.desc(8566, "Product Name"),
                dataField: "p",
                postCreate: function () {
                    this.set("model", mstrmojo.all.alertModel);
                }
            },
            colWidth: 90,
            dataField: "p"
        }, {
            headerText: mstrmojo.desc(8567, "Alert Message"),
            dataFunction: function (item, idx, w) {
                var desc = item.desc, cutIdx = desc.indexOf("<");
                
                if (cutIdx < 0) {
                    cutIdx = 120;
                }
                
                if (!item.rt && desc.length > cutIdx) {
                    return desc.substr(0, cutIdx) + "...";
                }

                return desc;
            },
             colWidth: 250
        }, {
            headerWidget: {
                scriptClass: 'mstrmojo.IPA.CustomHeader',
                text: mstrmojo.desc(487, "Time"),
                dataField: "ts",
                postCreate: function () {
                    if (!this.dataGrid.isRealTime) {
                        this.set("visible", false);
                    }
                    this.set("model", mstrmojo.all.alertModel);
                }
            },
            colWidth: 130,
            dataField: "ts"
        }],

        sort: function sort(p, asc) {
            if (this.isRealTime) {
                mstrmojo.all.alertModel.set("rtSortProp", p);
                mstrmojo.all.alertModel.realtimeAlerts.sort(mstrmojo.all.alertModel.sortFunc(p, asc));
            } else {
                mstrmojo.all.alertModel.set("nonRtSortProp", p);
                mstrmojo.all.alertModel.nonRealtimeAlerts.sort(mstrmojo.all.alertModel.sortFunc(p, asc));
            }

            this.refresh();
        },

        postBuildRendering: function () {
            this._super();
            //re-expand all previously expanded rows
            var i, len, arr = this.expandedAlerts;
            for (i = 0, len = (arr && arr.length) || 0; i < len; i++) {
                var label = mstrmojo.all[arr[i]];
                if (label) {
                    label.onclick();
                }
            }
        },
        refresh: function refresh(postUnrender) {
            _destroyDetailPanels(this);
            if (this.expandLabel) {
                this.expandLabel.destroy();
            }

            if (this._super) {
                this._super(postUnrender);
            }
        },

        destroy: function dst(skipCleanup) {
            _destroyDetailPanels(this);
            this._super();
        }

    });

}());