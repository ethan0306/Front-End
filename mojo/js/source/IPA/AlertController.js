(function () {

    mstrmojo.requiresCls("mstrmojo.Obj", "mstrmojo.Arr", "mstrmojo.hash");

    /**
     * A controller class for IPA alerts.
     * 
     * @class
     */
    mstrmojo.IPA.AlertController = mstrmojo.declare(
    mstrmojo.Obj,

    null,
    /**
     * @lends mstrmojo.IPA.AlertController
     */
    {
        scriptClass: "mstrmojo.IPA.AlertController",
        model: null,
        
        refreshAlerts: function () {
            if (this.model.refreshAlerts) {
                this.getAlerts();
            }
        },

        getAlerts: function () {
            var alertCallback = {
                success: function (res) {
                    if (res) {

                        // convert the array members to observable mojo objects
                        var i, alertArray = res.alerts,
                            len = alertArray.length;
                        for (i = 0; i < len; i++) {
                            alertArray[i] = mstrmojo.hash.make(alertArray[i], mstrmojo.Obj, null);
                        }
                        mstrmojo.all.alertModel.set("alerts", alertArray);
                        return;
                    }
                }
            };

            // Execute getAlert task.
            mstrmojo.xhr.request("POST", mstrConfig.taskURL, alertCallback, {
                taskId: "ipaGetAlerts"
            });

        },

        dismissAlerts: function (alertIDs) {
            var cfg = {
                ids: alertIDs,
                taskId: 'ipaAcknowledgeAlerts'
            };

            mstrmojo.all.alertModel.set("showMenuWaitIcon", true);

            mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                success: function (res) {
                    //refresh our alert table
                    mstrmojo.all.alertController.getAlerts();
                    mstrmojo.all.alertModel.set("showMenuWaitIcon", false);

                },
                failure: function (res) {
                    if (res && res.getResponseHeader("X-MSTR-TaskFailureMsg")) {
                        mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                        mstrmojo.all.alertModel.set("showMenuWaitIcon", false);
                    }
                }
            }, cfg);
        },

        setAlertReadStatus: function (alertIDs, isAlertsRead) {
            var cfg = {
                ids: alertIDs,
                isread: isAlertsRead,
                taskId: 'ipaSetAlertReadStatus'
            };


            mstrmojo.all.alertModel.set("showMenuWaitIcon", true);

            mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                success: function (res) {
                    //refresh our alert table
                    mstrmojo.all.alertController.getAlerts();
                    mstrmojo.all.alertModel.set("showMenuWaitIcon", false);

                },
                failure: function (res) {
                    if (res && res.getResponseHeader("X-MSTR-TaskFailureMsg")) {
                        mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                        mstrmojo.all.alertModel.set("showMenuWaitIcon", false);
                    }
                }
            }, cfg);
        },

        getAlertDetails: function (alert) {
            if (alert.m && alert.p && alert.ki) {

                if (alert.rt) {
                    var counterKey = alert.m + ":::" + alert.cat + ":::" + alert.i + ":::" + alert.c,
                        cfg = {
                            ctr: counterKey,
                            taskId: 'ipaGetAlerts'
                        };

                    var callback = {
                        success: function (res) {
                            if (res) {
                                var a = res.alerts[0];
                                if (a) {
                                    alert.set("list", a.list);
                                }
                            }
                        }
                    };

                    mstrmojo.xhr.request("POST", mstrConfig.taskURL, callback, cfg);
                }

                if (!alert.hasDetails) {
                    var cnfg = {
                        machine: alert.m,
                        product: alert.p,
                        ki: alert.ki,
                        taskId: 'ipaGetKIStatus'
                    };

                    var cb = {
                        success: function (res) {
                            if (res) {
                                alert.set("actions", res.actions);
                                alert.set("hasDetails", true);
                            }
                        }
                    };


                    mstrmojo.xhr.request("POST", mstrConfig.taskURL, cb, cnfg);
                }
            } else {
                alert.set("actions", null);
                alert.set("hasDetails", false);
            }
        },

        doAction: function (m, p, ki, actionName, type, param) {
            if (type === 0) {
                mstrmojo.all.alertController.execute(m, p, ki, actionName);
            } else {
                var cfg = {
                    machine: m,
                    product: p,
                    ki: ki,
                    action: actionName,
                    param: param,
                    taskId: 'ipaValidateActionParam'
                };


                mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                    success: function (res) {
                        mstrmojo.all.alertController.execute(m, p, ki, actionName);
                    },

                    failure: function (res) {
                        if (res && res.getResponseHeader("X-MSTR-TaskFailureMsg")) {
                            mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                        }
                    }

                }, cfg);
            }


        },

        execute: function (m, p, ki, actionName) {
        
            var cfg = {
                machine: m,
                product: p,
                ki: ki,
                action: actionName,
                taskId: 'ipaDoAction'
            };


            mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                success: function (res) {
                    //refresh our alert table
                    mstrmojo.all.alertController.getAlerts();

                },
                failure: function (res) {
                    if (res) {
                        mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                    }
                }
            }, cfg);
        }

    });

}());