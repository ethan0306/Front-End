(function () {

    mstrmojo.requiresCls("mstrmojo.Model", "mstrmojo.Arr");

    mstrmojo.IPA.AlertModel = mstrmojo.declare(
    // superclass
    mstrmojo.Model,

    // mixins
    null,

    // instance members
    {
        scriptClass: "mstrmojo.IPA.AlertModel",
        alerts: [],
        realtimeAlerts: [],
        realtimeErrors: [],
        realtimeWarnings: [],
        nonRealtimeAlerts: [],
        nonRealtimeErrors: [],
        nonRealtimeWarnings: [],
        selectedAlerts: [],
        expandAlertView: true,
        showMenuWaitIcon: false,
        showRT: true,
        refreshAlerts: true,
        children: [{
            scriptClass: "mstrmojo.Obj",
            alias: "sortAsc",
            t: true,
            ts: true,
            m: true,
            p: true,
            ki: true
        }],
        rtSortProp: "t",
        nonRtSortProp: "t",

        _set_alerts: function (n, v, silent) {
            if (this.alerts === v) {
                return false;
            }

            var i, len = this.alerts.length;
            for (i = 0; i < len; i++) {
                this.alerts[i].destroy();
            }

            this.alerts = v;
            return true;
        },

        bindings: {
            realtimeAlerts: function () {
                var i, j = 0,
                    a = [];
                for (i = 0; i < this.alerts.length; i++) {
                    if (this.alerts[i].rt) {
                        a[j] = this.alerts[i];
                        j = j + 1;
                    }
                }
                return a.sort(this.sortFunc(this.rtSortProp, this.sortAsc[this.rtSortProp]));
            },
	        realtimeErrors: function () {
	            var i, j = 0, alert, a = [];
	            for (i = 0; i < this.realtimeAlerts.length; i++) {
	                alert = this.realtimeAlerts[i];
	                if (alert.t === 'ERROR') {
	                    a[j++] = alert;
	                }
	            }            
	            return a;
	        },
	        realtimeWarnings: function () {
	            var i, j = 0, alert, a = [];
	            for (i = 0; i < this.realtimeAlerts.length; i++) {
	                alert = this.realtimeAlerts[i];
	                if (alert.t === 'WARNING') {
	                    a[j++] = alert;
	                }
	            }            
	            return a;
	        },
            realtimeErrors: function () {
	            var i, j = 0, alert, a = [];
	            for (i = 0; i < this.realtimeAlerts.length; i++) {
	                alert = this.realtimeAlerts[i];
	                if (alert.t === 'ERROR') {
	                    a[j++] = alert;
	                }
	            }            
	            return a;
	        },
	        realtimeWarnings: function () {
	            var i, j = 0, alert, a = [];
	            for (i = 0; i < this.realtimeAlerts.length; i++) {
	                alert = this.realtimeAlerts[i];
	                if (alert.t === 'WARNING') {
	                    a[j++] = alert;
	                }
	            }            
	            return a;
	        },
            nonRealtimeAlerts: function () {
                var i, j = 0,
                    a = [];
                for (i = 0; i < this.alerts.length; i++) {
                    if (!this.alerts[i].rt) {
                        a[j] = this.alerts[i];
                        j = j + 1;
                    }
                }
                return a.sort(this.sortFunc(this.nonRtSortProp, this.sortAsc[this.nonRtSortProp]));
            },
	        nonRealtimeErrors: function () {
	            var i, j = 0, alert, a = [];
	            for (i = 0; i < this.nonRealtimeAlerts.length; i++) {
	                alert = this.nonRealtimeAlerts[i];
	                if (alert.t === 'ERROR') {
	                    a[j++] = alert;
	                }
	            }            
	            return a;
	        },
	        nonRealtimeWarnings: function () {
	            var i, j = 0, alert, a = [];
	            for (i = 0; i < this.nonRealtimeAlerts.length; i++) {
	                alert = this.nonRealtimeAlerts[i];
	                if (alert.t === 'WARNING') {
	                    a[j++] = alert;
	                }
	            }            
	            return a;
            }
        },
        
        postCreate: function() {
             this.set("selectedAlerts", mstrmojo.Arr.makeObservable([]));
        },

        getNumberOfAlertsForEnv: function getNumberOfAlertsForEnv(env) {
            var i, s, m, ip, sum = 0,
                machines = {};
            for (s in env.iServers) {
                m = env.iServers[s].name;
                machines[m] = true;
            }
            for (s in env.webServers) {
                m = env.webServers[s].name;
                machines[m] = true;
            }
            for (s in env.mobileServers) {
                m = env.mobileServers[s].name;
                machines[m] = true;
            }

            for (i = 0; i < this.alerts.length; i++) {
                m = this.alerts[i].m;
                ip = this.alerts[i].ip;
                if (machines[m] || machines[ip]) {
                    sum++;
                }
            }
            return sum;
        },

        sortFunc: function sortFunc(prop, asc) {
            return function (a, b) {
                var aProp = eval("a." + prop),
                    bProp = eval("b." + prop);

                if (asc) {
                    return aProp < bProp;
                } else {
                    return aProp > bProp;
                }
            };
        },

        isSelected: function (alertID) {
            if (alertID) {
                var i, selectedAlertID;
                for (i = 0; i < this.selectedAlerts.length; i++) {
                    selectedAlertID = this.selectedAlerts[i];
                    if (alertID === selectedAlertID) {
                        return true;
                    }
                }
            }
            return false;
        },

        selectAllAlerts: function () {
            var i, j = 0, selectedAlert, selectedIDs = [];
            this.selectedAlerts.destroy();            
            for (i = 0; i < this.realtimeAlerts.length; i++) {
                selectedAlert = this.realtimeAlerts[i];
                selectedIDs[j++] = selectedAlert.m + selectedAlert.p + selectedAlert.ki + selectedAlert.c + selectedAlert.i;
            }  
            this.set("selectedAlerts", mstrmojo.Arr.makeObservable(selectedIDs));
        },
        
        selectReadAlerts: function () {
            var i, j = 0, selectedAlert, selectedIDs = [];
            this.selectedAlerts.destroy();            
            for (i = 0; i < this.realtimeAlerts.length; i++) {
                selectedAlert = this.realtimeAlerts[i];
                if (selectedAlert.read) {
                    selectedIDs[j++] = selectedAlert.m + selectedAlert.p + selectedAlert.ki + selectedAlert.c + selectedAlert.i;
                }
            }            
            this.set("selectedAlerts", mstrmojo.Arr.makeObservable(selectedIDs));
        },      
        
        selectUnreadAlerts: function () {
             var i, j = 0, selectedAlert, selectedIDs = [];
            this.selectedAlerts.destroy();            
            for (i = 0; i < this.realtimeAlerts.length; i++) {
                selectedAlert = this.realtimeAlerts[i];
                if (!selectedAlert.read) {
                    selectedIDs[j++] = selectedAlert.m + selectedAlert.p + selectedAlert.ki + selectedAlert.c + selectedAlert.i;
                }
            }            
            this.set("selectedAlerts", mstrmojo.Arr.makeObservable(selectedIDs));
        },
        
        selectErrorAlerts: function () {
            var i, j = 0, selectedAlert, selectedIDs = [];
            this.selectedAlerts.destroy();            
            for (i = 0; i < this.realtimeAlerts.length; i++) {
                selectedAlert = this.realtimeAlerts[i];
                if (selectedAlert.t === 'ERROR') {
                    selectedIDs[j++] = selectedAlert.m + selectedAlert.p + selectedAlert.ki + selectedAlert.c + selectedAlert.i;
                }
            }            
            this.set("selectedAlerts", mstrmojo.Arr.makeObservable(selectedIDs));
        },
        
        selectWarningAlerts: function () {
             var i, j = 0, selectedAlert, selectedIDs = [];
            this.selectedAlerts.destroy();            
            for (i = 0; i < this.realtimeAlerts.length; i++) {
                selectedAlert = this.realtimeAlerts[i];
                if (selectedAlert.t === 'WARNING') {
                    selectedIDs[j++] = selectedAlert.m + selectedAlert.p + selectedAlert.ki + selectedAlert.c + selectedAlert.i;
                }
            }            
            this.set("selectedAlerts", mstrmojo.Arr.makeObservable(selectedIDs));
        },
        
        selectNoAlerts: function () {
            var selectedIDs = [];
            this.selectedAlerts.destroy();            
            this.set("selectedAlerts", mstrmojo.Arr.makeObservable(selectedIDs));
        },        
        
        toggleAlertSelection: function (alertID, select) {
            if (alertID && select && ! this.isSelected(alertID)) {
                var tmp = [];
                tmp[0] = alertID;
                this.selectedAlerts.add(tmp, this.selectedAlerts.length);
            }
            
            if (alertID && !select) {
                var i, j = -1, selectedAlertID, tmp = mstrmojo.Arr.makeObservable([]);
                for (i = 0; i < this.selectedAlerts.length; i++) {
                    selectedAlertID = this.selectedAlerts[i];
                    if (alertID !== selectedAlertID) {
                        tmp.add(selectedAlertID, tmp.length, true);
                    }
                    else {
                        j = i;
                    }
                }
                
                if (j >=0) {
                    this.selectedAlerts.destroy();
                    this.set("selectedAlerts", tmp);
                }
                
            }
        },
        
        getAlertSelection: function () {
            var i, j = 0, rtAlert, alertID, selectedAlerts = [];
            for (i = 0; i < this.realtimeAlerts.length; i++) {
                rtAlert = this.realtimeAlerts[i];
                alertID = rtAlert.m + rtAlert.p + rtAlert.ki + rtAlert.c + rtAlert.i;

                if (mstrmojo.array.indexOf(this.selectedAlerts, alertID) >= 0) {
                    selectedAlerts[j++] = rtAlert;
                }

            }
            return selectedAlerts;
        }
    });
}());