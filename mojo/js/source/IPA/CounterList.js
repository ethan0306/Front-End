(function () {

    mstrmojo.requiresCls("mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", "mstrmojo.DataGrid", "mstrmojo.Button");

    mstrmojo.requiresDescs(2129, 7940, 8565, 8575, 8576, 8577, 8578, 8579, 8580, 8581, 8582);
    /**
     * CounterList is a list of available IPA counters and their information.
     * 
     * @class
     * @extends mstrmojo.DataGrid
     */
    mstrmojo.IPA.CounterList = mstrmojo.declare(
    // superclass
    mstrmojo.DataGrid,
    // mixins
    null,
    // instance members
    {
        scriptClass: "mstrmojo.IPA.CounterList",
        cssClass: "mstrmojo-IPA-CounterList",
        rtType: 2,
        //1=RTMonitoring, 2=RTAlerting, 4=RTLogging
        columns: [{
            headerText: mstrmojo.desc(8575, "Current Status"),
            dataWidget: {
                scriptClass: "mstrmojo.Button",
                cssClass: "mstrmojo-IPA-CounterList-ToggleButton",
                onclick: function () {
                    var counterString = this.parent.data.m + ":::" + this.parent.data.cat + ":::" + this.parent.data.inst + ":::" + this.parent.data.ctr,
                        toggleStart = !(this.parent.data.on),
                        cfg = {
                            taskId: 'ipaToggleRTAlerting',
                            cs: counterString,
                            st: toggleStart
                        },
                        counterList = this.parent.dataGrid;


                    mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                        success: function () {
                            counterList.getCounters();
                        },
                        failure: function (res) {
                            if (res) {
                                mstrmojo.alert(res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                            }
                        }
                    }, cfg);


                },
                bindings: {
                    cssClass: function () {
                        if (this.parent.data.on) {
                            return "mstrmojo-AlertsCounterStatus-button ON";
                        }
                        return "mstrmojo-AlertsCounterStatus-button OFF";
                    },
                    title: function () {
                        if (this.parent.data.on) {
                            return mstrmojo.desc(8576, "Stop Alert Counter");
                        }
                        return mstrmojo.desc(8577, "Start Alert Counter");
                    }
                }
            },
            colCss: "statusCol"
        }, {
            headerText: mstrmojo.desc(8565, "Machine Name"),
            dataField: "m",
            colCss: "machineCol"
        }, {
            headerText: mstrmojo.desc(7940, "Category"),
            dataField: "cat",
            colCss: "catCol"
        }, {
            headerText: mstrmojo.desc(8580, "Instance"),
            dataField: "inst",
            colCss: "instCol"
        }, {
            headerText: mstrmojo.desc(8581, "Counter Name"),
            dataField: "ctr",
            colCss: "counterCol"
        }, {
            headerText: mstrmojo.desc(2129, "Product"),
            dataField: "p",
            colCss: "productCol"
        }, {
            headerText: mstrmojo.desc(8582, "System Check"),
            dataField: "ki",
            colCss: "kiCol"
        }],

        getCounters: function () {
            var cfg = {
                taskId: 'ipaGetCounters',
                t: this.rtType
            },
                me = this;

            mstrmojo.xhr.request("POST", mstrConfig.taskURL, {
                success: function (res) {
                    me.set("items", res.items);
                    me.set("contentRetrieved", true);
                },
                failure: function (res) {
                    if (me.handleGetContentFailure) {
                        me.handleGetContentFailure(res);
                    }
                }
            }, cfg);
        },

        postBuildRendering: function()
        {
            this._super();
            if (this.visible && !this.contentRetrieved){
                this.getCounters();
            }
        }        

    });

}());