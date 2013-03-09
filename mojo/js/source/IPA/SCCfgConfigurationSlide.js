(function () {

    mstrmojo.requiresCls("mstrmojo.WizardSlide", "mstrmojo.Label", "mstrmojo.IPA.ConfigEntryList");

    mstrmojo.requiresDescs(118, 8586, 8587, 8588);

    /**
     *
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.IPA.SCCfgConfigurationSlide = mstrmojo.declare(

    //superclass
    mstrmojo.WizardSlide,

    //mixin
    null,

    /**
     * @lends mstrmojo.IPA.SCCfgConfigurationSlide.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.SCCfgConfigurationSlide",
        name: "configurationSlide",
        index: 0,
        children: [{
            scriptClass: "mstrmojo.Label",
            alias: "kiLabel",
            cssClass: "mstrmojo-SCCfgWizard-SlideDescription"
        }, {
            scriptClass: "mstrmojo.IPA.ConfigEntryList",
            alias: "configslide",
            isEntrySharable: false
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "noConfigLabel",
            visible: false,
            text: mstrmojo.desc(8586, "There is no configuration entry required for this system check.")
        }],
        
	displayingSlide: function () {

            var model = this.wizard.model, ki = model.selection[model.kiIndex];
            this.kiLabel.set("text", ki.n);

            var cfg = {
                taskId: 'ipaGetKIConfigurationEntries',
                machine: ki.m,
                product: ki.p,
                ki: ki.n
            };

            var configEntryList = this.configslide;
            var noConfigLabel = this.noConfigLabel;

            //set the items array to null first to reset screen
            configEntryList.set("items", null);


            var callback = {
                success: function (res) {
                    var i, entryArray = res.entries,
                    	len = entryArray.length;
                    	
                    var startingCfg = model.systemCheckStartingConfigValue;
                    if (!startingCfg)
                    {
                    	startingCfg = new mstrmojo.Obj();
                    	model.set("systemCheckStartingConfigValue", startingCfg);
                    }
                    
                    var key = ki.m + "-" + ki.p + "-" + ki.n;
                    if(!startingCfg[key])
                    {
                    	startingCfg[key] = entryArray;
                    }
                    
                                            
                    if (len > 0) {
                        var consolidatedValues = model.systemCheckConfigurationValue[ki.dssid];
                        
                        for (i = 0; i < len; i++) {
                            if (consolidatedValues && consolidatedValues[entryArray[i].name]) {
                                entryArray[i].data = consolidatedValues[entryArray[i].name];
                                entryArray[i].disabled = true;
                                
                            }
                            entryArray[i].oldData = startingCfg[key][i].data;
                            entryArray[i].share = false;
                            entryArray[i] = mstrmojo.hash.make(entryArray[i], mstrmojo.Obj, null);
                        }
                        
                        noConfigLabel.set("visible", false);
                        configEntryList.set("machine", ki.m);
                        configEntryList.set("product", ki.p);
                        configEntryList.set("ki", ki.n);
                        configEntryList.set("items", entryArray);
                        configEntryList.set("visible", true);
                    } else {
                        configEntryList.set("items", entryArray);
                        configEntryList.set("visible", false);
                        noConfigLabel.set("visible", true);
                    }

                },
                failure: function (res) {
                    if (res) {
                        mstrmojo.alert(mstrmojo.desc(8587, "Error in getting configuration: ") + res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                    }
                }
            };


            mstrmojo.xhr.request("POST", mstrConfig.taskURL, callback, cfg);
        },
        
        aboutToGoNext: function () {

            var wizard = this.wizard;
            var slide = this;

            var values = this.configslide.getConfigEntryValues();
            var configEntries = new Array(values.length);
            var valuesWithDot = new Array(values.length);
            var configPairs = new Array(values.length);

            var i;
            for (i = 0; i < values.length; i++) {
                configEntries[i] = this.configslide.items[i].name;
                configPairs[i] = {};
                configPairs[i].type = this.configslide.items[i].type;
                configPairs[i].entry = this.configslide.items[i].name;
                configPairs[i].value = values[i];
                valuesWithDot[i] = "." + values[i]; //workaround empty string problem in array serialization
            }

            var ki = wizard.model.selection[this.wizard.model.kiIndex];
            var cfg = {
                taskId: 'ipaSaveConfigurationEntry',
                machine: ki.m,
                product: ki.p,
                ki: ki.n,
                entry: configEntries,
                value: valuesWithDot,
                configs: configPairs
            };

            if (values.length === 0) {
                this.wizard.model.cfgs[this.wizard.model.kiIndex] = cfg;
                return true;
            }

            var callback = {
                success: function () {
                    wizard.model.cfgs[wizard.model.kiIndex] = cfg;
                    wizard.showSlide(slide.getNextSlide(), true);

                },
                failure: function (res) {
                    if (res) {
                        mstrmojo.alert(mstrmojo.desc(8588, "Error in saving configuration: ") + res.getResponseHeader("X-MSTR-TaskFailureMsg"));
                    }
                }
            };

            mstrmojo.xhr.request("POST", mstrConfig.taskURL, callback, cfg);
            return false;
        },

        getNextSlide: function () {
            if (this.wizard.model.kiIndex === this.wizard.model.selection.length - 1) {
                return "summarySlide";
            }

            this.wizard.model.kiIndex++;
            return "configurationSlide";
        },

        getPreviousSlide: function () {
            if (this.wizard.model.kiIndex === 0) {
                return (this.wizard.model.isConsolidated) ? "consolidationSlide" : "selectionSlide";
            }
            this.wizard.model.kiIndex--;
            return "configurationSlide";
        },

        onvisibleChange: function() {
            if (this.visible) {
                this.wizard.buttons.nextButton.set("visible", true);
                this.wizard.buttons.nextButton.set("text", mstrmojo.desc(118, "Save"));
                this.wizard.buttons.backButton.set("visible", true);
                this.wizard.buttons.cancelButton.set("visible", false);
                this.wizard.titleBar.restart.set("visible", true);
                this.wizard.titleBar.restartIcon.set("visible", true);
            }
        }

    });

}());