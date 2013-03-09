(function () {

    mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo.TabContainer", "mstrmojo._Collapsible", "mstrmojo.TabStrip", "mstrmojo.StackContainer", "mstrmojo.IPA.AlertPanel");

    mstrmojo.requiresDescs(96, 1695, 8078, 8564, 8568, 8569, 8570, 8605, 8606, 8607, 8609);

    mstrmojo.IPA.AlertTabButton = mstrmojo.declare(
    //superclass
    mstrmojo.Widget,
    //mixin
    null,

    {
        scriptClass: "mstrmojo.IPA.AlertTabButtons",

        markupString: '<div id="{@id}" class="mstrmojo-TabButton {@cssClass}" style="{@cssText}" mstrAttach:click,mouseup>' 
        	+ '<span class="{@cssClass}" style="margin-left: 3%;"></span>' 
        	+ '<span class="mstrmojo-Alerts-badge numErrorsBox">{@numberOfAlerts}</span>'
        	+ '<span class="{@cssClass}"></span>' 
        	+ '<span class="mstrmojo-Alerts-badge numErrorsBox">{@numberOfErrors}</span>'
        	+ '<span class="{@cssClass}"></span>' 
        	+ '<span class="mstrmojo-Alerts-badge numErrorsBox">{@numberOfWarnings}</span>'
        	+ '</div>',

	cssClass: "mstrmojo-IPA-AlertTabButton",

        markupSlots: {
            /**
             * the button for expend or collapse
             */
            titleNode: function () {
                return this.domNode.firstChild;
            },
            alertsNode: function () {
                return this.domNode.childNodes[1];
            },
            errorsTitleNode: function () {
                return this.domNode.childNodes[2];
            },
            errorsNode: function () {
            	return this.domNode.childNodes[3];
            },
            warningsTitleNode: function () {
                return this.domNode.childNodes[4];
            },
            warningsNode: function () {
            	return this.domNode.childNodes[5];
            }
        },

        markupMethods: {
            onvisibleChange: function () {
                this.domNode.style.display = this.visible ? 'inline' : 'none';
            },
            ontitleChange: function () {
                this.titleNode.innerHTML = this.title || '';
                this.errorsTitleNode.innerHTML = this.target.errorsLabel || '';
                this.warningsTitleNode.innerHTML = this.target.warningsLabel || '';
            },
            onbackgroundColorChange: function () {
                this.domNode.style.backgroundColor = this.backgroundColor || '';
            },
            onselectedChange: function () {
                mstrmojo.css.toggleClass(this.domNode, ['selected'], !! this.selected);
            },
            onnumberOfAlertsChange: function () {
                if (this.alertsNode) {
                    //now change the number, if no number is found hide the display
                    if (this.numberOfAlerts === null) {
                        this.alertsNode.style.display = "none";
                    } else {
                        this.alertsNode.style.display = "inline";
                        if (this.numberOfAlerts > 0) {
                            this.alertsNode.innerHTML = this.numberOfAlerts;
                        }
                        else {
                            this.alertsNode.innerHTML = "&#x2713;";
                            this.alertsNode.style.background = "green";
                        }
                    }
                }
                if (this.errorsNode) {
                    //now change the number, if no number is found hide the display
                    if (this.numberOfErrors === null) {
                        this.errorsNode.style.display = "none";
                    } else {
                        this.errorsNode.style.display = "inline";
                        if (this.numberOfAlerts > 0) {
                            this.errorsNode.innerHTML = this.numberOfErrors;
                        }
                        else {
                            this.errorsNode.innerHTML = "&#x2713;";
                            this.errorsNode.style.background = "green";
                        }
                    }
                }
                if (this.warningsNode) {
                    //now change the number, if no number is found hide the display
                    if (this.numberOfWarnings === null) {
                        this.warningsNode.style.display = "none";
                    } else {
                        this.warningsNode.style.display = "inline";
                        if (this.numberOfAlerts > 0) {
                            this.warningsNode.innerHTML = this.numberOfWarnings;
                        }
                        else {
                            this.warningsNode.innerHTML = "&#x2713;";
                            this.warningsNode.style.background = "green";
                        }
                    }
                }
                if (this.errorsNode) {
                    //now change the number, if no number is found hide the display
                    if (this.numberOfErrors === null) {
                        this.errorsNode.style.display = "none";
                    } else {
                        this.errorsNode.style.display = "inline";
                        if (this.numberOfErrors > 0) {
                            this.errorsNode.innerHTML = this.numberOfErrors;
                        }
                        else {
                            this.errorsNode.innerHTML = "&#x2713;";
                            this.errorsNode.style.background = "green";
                        }
                    }
                }
                if (this.warningsNode) {
                    //now change the number, if no number is found hide the display
                    if (this.numberOfWarnings === null) {
                        this.warningsNode.style.display = "none";
                    } else {
                        this.warningsNode.style.display = "inline";
                        if (this.numberOfWarnings > 0) {
                            this.warningsNode.innerHTML = this.numberOfWarnings;
                        }
                        else {
                            this.warningsNode.innerHTML = "&#x2713;";
                            this.warningsNode.style.background = "green";
                        }
                    }
                }
            }
        },


        bindings: {
            numberOfAlerts: function () {
                return this.target.items.length;
            },
            numberOfErrors: function () {
                return this.target.errors.length;
            },
            numberOfWarnings: function () {
                return this.target.warnings.length;
            }
        },

        onmouseup: function () {
            mstrmojo.all.alertModel.set("expandAlertView", true);
            mstrmojo.all.alertModel.set("showRT", (this.target.alias === "rtAlertView"));
        }

    });


    /**
     * 
     * @class
     * @extends mstrmojo.TabContainer
     */
    mstrmojo.IPA.AlertView = mstrmojo.declare(

    //superclass
    mstrmojo.TabContainer,

    //mixin
    [mstrmojo._Collapsible],

    /**
     * @lends mstrmojo.IPA.AlertView prototype
     */
    {
        scriptClass: "mstrmojo.IPA.AlertView",
        animate: true,
        model: null,
        children: [{
            scriptClass: "mstrmojo.TabStrip",
            cssText:"width:960px;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:5px",
            slot: "top",
            autoHide: false,
            target: this.parent.detailStack,
            tabButtonClass: "IPA.AlertTabButton"
        }, {
            scriptClass: "mstrmojo.Widget",
            slot: "containerNode",
            cssClass: "mstrmojo-IPA-AlertViewBar",
            cssText:"width:958px;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px",
            visible: true,
            markupString: '<div id="{@id}" class="{@cssClass}" style="{@cssText}">' + 
                '<span class="" style="margin:3px; vertical-align: middle">' + mstrmojo.desc(8609, "Expand an alert below to view more details") + '</span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(8564, "Unread") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button UNREAD" style="float:right"></span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(8078, "Read") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button READ" style="float:right"></span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(1695, "Warning") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button WARNING" style="float:right"></span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(96, "Error") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button ERROR" style="float:right"></span>' + '</div>',
                
            bindings: {
                visible: function () {
                    var res = !mstrmojo.all.alertModel.showRT || mstrmojo.all.alertModel.selectedAlerts.length === 0;
                    return res;
                }
            },
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            }
        }, {
            scriptClass: "mstrmojo.Container",
            slot: "containerNode",
            cssClass: "mstrmojo-IPA-AlertViewBar",
            cssText:"width:958px;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px",
            markupString: '<div id="{@id}" class="{@cssClass}" style="{@cssText}">' + 
                '<span style="float:left;"></span>' + 
                '<span style="float:left;"></span>' + 
                '<span style="float:left;"></span>' + 
                '<span style="float:left;"></span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(8564, "Unread") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button UNREAD" style="float:right"></span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(8078, "Read") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button READ" style="float:right"></span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(1695, "Warning") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button WARNING" style="float:right"></span>' + 
                '<span class="" style="float:right; padding-top:3px">' + mstrmojo.desc(96, "Error") + '</span>' + 
                '<span class="mstrmojo-AlertGrid-button ERROR" style="float:right"></span>' + '</div>',
                
            markupSlots: {
                readNode: function () {
                    return this.domNode.firstChild;
                },
                unreadNode: function () {
                    return this.domNode.childNodes[1];
                },
                dismissNode: function () {
                    return this.domNode.childNodes[2];
                },
                waitIconNode: function () {
                    return this.domNode.childNodes[3];
                }
                
            },
            children: [{
                scriptClass: "mstrmojo.Label",
                text: mstrmojo.desc(8605, "Mark as Read"),
                cssClass: "mstrmojo-IPA-AlertViewBarMenuLink",
                slot: "readNode",
                onclick: function () {
                    var i, j, selectedAlert, selectedAlerts = mstrmojo.all.alertModel.getAlertSelection(), alertIDs = mstrmojo.Arr.makeObservable([]);
                    for (i = 0; i < selectedAlerts.length; i++)
                    {
                        selectedAlert = selectedAlerts[i];
                        alertIDs.add(selectedAlert.list[0].id);                        
                    }
                    mstrmojo.all.alertController.setAlertReadStatus(alertIDs, true);
                }
            }, {
                scriptClass: "mstrmojo.Label",
                text: mstrmojo.desc(8606, "Mark as Unread"),
                cssClass: "mstrmojo-IPA-AlertViewBarMenuLink",
                slot: "unreadNode",
                onclick: function () {
                    var i, j, selectedAlert, selectedAlerts = mstrmojo.all.alertModel.getAlertSelection(), alertIDs = mstrmojo.Arr.makeObservable([]);
                    for (i = 0; i < selectedAlerts.length; i++)
                    {
                        selectedAlert = selectedAlerts[i];
                        alertIDs.add(selectedAlert.list[0].id);                        
                    }
                    mstrmojo.all.alertController.setAlertReadStatus(alertIDs, false);
                }
            },{
                scriptClass: "mstrmojo.Label",
                text: mstrmojo.desc(8607, "Dismiss"),
                cssClass: "mstrmojo-IPA-AlertViewBarMenuLink",
                slot: "dismissNode",
                onclick: function () {
                    var i, j, selectedAlert, selectedAlerts = mstrmojo.all.alertModel.getAlertSelection(), alertIDs = mstrmojo.Arr.makeObservable([]);
                    for (i = 0; i < selectedAlerts.length; i++)
                    {
                        selectedAlert = selectedAlerts[i];
                        alertIDs.add(selectedAlert.list[0].id);
                    }
                    mstrmojo.all.alertController.dismissAlerts(alertIDs);
                }
            }, {
                scriptClass: "mstrmojo.WaitIcon",
                alias: "waitIcon",
                slot: "waitIconNode",
                bindings: {
                    visible: function() {
                        return mstrmojo.all.alertModel.showMenuWaitIcon;
                    }
                }
            }],
            bindings: {
                visible: function () {
                    var res = mstrmojo.all.alertModel.showRT && mstrmojo.all.alertModel.selectedAlerts.length > 0;
                    return res;
                }
            },
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            }
        }, {
            scriptClass: "mstrmojo.StackContainer",
            slot: "stack",
            alias: "detailStack",
            cssText:"width:960px;margin:0 auto;",
            postCreate: function () {
                this.addChildren({
                    scriptClass: "mstrmojo.IPA.AlertPanel",
                    cssText:"width:960px;margin:0 auto;",
                    alias: "rtAlertView",
                    n: mstrmojo.desc(8568, "Realtime Notifications"),
                    errorsLabel: mstrmojo.desc(845, "Errors"),
                    warningsLabel: mstrmojo.desc(844, "Warnings"),
                    isRealTime: true,
                    bindings: {
                        items: "mstrmojo.all.alertModel.realtimeAlerts",
                        errors: "mstrmojo.all.alertModel.realtimeErrors",
                        warnings: "mstrmojo.all.alertModel.realtimeWarnings"
                    }
                });

                this.addChildren({
                    scriptClass: "mstrmojo.IPA.AlertPanel",
                    cssText:"width:960px;margin:0 auto;",
                    alias: "tradAlertView",
                    n: mstrmojo.desc(8569, "System Alerts"),
                    errorsLabel: mstrmojo.desc(845, "Errors"),
                    warningsLabel: mstrmojo.desc(844, "Warnings"),
                    isRealTime: false,
                    bindings: {
                        items: "mstrmojo.all.alertModel.nonRealtimeAlerts",
                        errors: "mstrmojo.all.alertModel.nonRealtimeErrors",
                        warnings: "mstrmojo.all.alertModel.nonRealtimeWarnings"
                    }
                });

                //set the initial selected
                this.set("selected", this.children[0]);
            }
        }],

        /**
         * mark methods
         */
        markupMethods: {
            /**
             * change event method for expanded variable
             */
            onexpandedChange: function () {
                var target = this.stack;

                if (this.expanded) {
                    this.expandDown(target);
                } else {
                    this.collapseUp(target);
                }
            }
        },

        bindings: {
            expanded: function () {
                return this.model.expandAlertView;
            }
        }
    });

}());