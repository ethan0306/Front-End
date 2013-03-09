(function () {

    mstrmojo.requiresCls("mstrmojo.WizardSlide", "mstrmojo.Label", "mstrmojo.IPA.BreadCrumb", 
        "mstrmojo.IPA.ConfigEntryList", "mstrmojo.IPA.MultiSystemCheckConfigPanel");

    mstrmojo.requiresDescs(1059, 8587, 8589);

    /**
     *
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.IPA.SCCfgConsolidationSlide = mstrmojo.declare(

    //superclass
    mstrmojo.WizardSlide,

    //mixin
    null,

    /**
     * @lends mstrmojo.IPA.SCCfgConsolidationSlide.prototype
     */
    {
        scriptClass: "mstrmojo.IPA.SCCfgConsolidationSlide",
        name: "consolidationSlide",
        children: [{
            scriptClass: "mstrmojo.IPA.BreadCrumb",
            alias: "breadcrumb",
            cssClass: "mstrmojo-SCCfgWizard-SlideDescription"
        }, {
            scriptClass: "mstrmojo.Label",
            alias: "kiLabel",
            text: mstrmojo.desc(8589, "Share Value"),
            cssText: "text-align:right"
        }, {
            scriptClass: "mstrmojo.IPA.ConfigEntryList",
            items: null,
            isEntrySharable: true,
            alias: "commonEntry"
        }, {
            scriptClass: "mstrmojo.IPA.MultiSystemCheckConfigPanel",
            alias: "configslide"
        }],
        
        displayingSlide: function () {
	    var kiList = this.wizard.model.selection;

	    //reset the configuration values
	    this.wizard.model.set("systemCheckConfigurationValue", {});

	    var i, kiNamesArr = new Array(kiList.length), kiGuiNamesArr = new Array(kiList.length);
	    for (i = 0; i < kiList.length; i++) {
		var key = kiList[i].dssid,
		    startIndex = key.lastIndexOf("-") + 1;
		kiNamesArr[i] = key.substring(startIndex);
		kiGuiNamesArr[i] = kiList[i].n;
	    }

	    var cfg = {
		taskId: 'ipaGetSharedConfigurationEntries',
		m: kiList[0].m,
		kis: kiNamesArr
	    };

	    var configEntryList = this.configslide;
	    var commonEntry = this.commonEntry;

	    var breadcrumbPath = new Array(3);
	    breadcrumbPath[0] = kiList[0].m; //machine
	    breadcrumbPath[1] = kiList[0].p; //product
	    breadcrumbPath[2] = kiGuiNamesArr; //kis
	    this.breadcrumb.set("items", breadcrumbPath);

	    //set the items array to null first to reset screen
	    configEntryList.set("items", null);


	    var slide = this,
		callback = {
		    success: function (res) {
			var i, entryArray = res.items,
			    len = entryArray.length;

			if (len === 0) {
			    slide.wizard.model.set("isConsolidated", false);
			    slide.wizard.showSlide(slide.getNextSlide(), true);
			} else {
			    slide.wizard.model.set("isConsolidated", true);

			    var first = entryArray[0];
			    if (first.kilist.length === slide.wizard.model.selection.length) {
				commonEntry.set("items", first.entrylist);
				if (entryArray.length > 1) {
				    var newEntryArray = new Array(entryArray.length - 1);
				    for (i = 0; i < newEntryArray.length; i++) {
					newEntryArray[i] = entryArray[i + 1];
				    }
				    configEntryList.set("items", newEntryArray);
				}

			    } else {
				configEntryList.set("items", entryArray);
			    }
			}

		    },
		    failure: function (res) {
			if (res) {
			    alert(mstrmojo.desc(8587, "Error in getting configuration: ") + res.getResponseHeader("X-MSTR-TaskFailureMsg"));
			}
		    }
		};

	    mstrmojo.xhr.request("POST", mstrConfig.taskURL, callback, cfg);
        },

        aboutToGoNext: function () {

            var configurationValues = {},
                i, j, k, kis, entries, kikey, entry, selection;

            if (this.commonEntry.items && this.commonEntry.items.length > 0) {
                entries = this.commonEntry.getConfigEntries();

                for (i = 0; i < entries.length; i++) {
                    entry = entries[i];
                    if (entry.shared) {
                        selection = this.wizard.model.selection;
                        for (j = 0; j < selection.length; j++) {
                            kikey = selection[j].dssid;
                            if (!configurationValues[kikey]) {
                                configurationValues[kikey] = {};
                            }
                            configurationValues[kikey][entry.name] = entry.value;
                        }
                    }
                }
            }

            var sharedEntries = this.configslide.getConfigEntryValues();
            if (sharedEntries && sharedEntries.length > 0) {
                for (i = 0; i < sharedEntries.length; i++) {
                    entries = sharedEntries[i].entries;
                    kis = sharedEntries[i].kis;

                    for (j = 0; j < entries.length; j++) {
                        entry = entries[j];
                        if (entry.shared) {
                            for (k = 0; k < kis.length; k++) {
                                kikey = kis[k];
                                if (!configurationValues[kikey]) {
                                    configurationValues[kikey] = {};
                                }
                                configurationValues[kikey][entry.name] = entry.value;
                            }
                        }
                    }
                }
            }

            this.wizard.model.set("systemCheckConfigurationValue", configurationValues);
            return true;
        },

        getNextSlide: function () {
            return "configurationSlide";
        },

        getPreviousSlide: function () {
            return "selectionSlide";
        },

        onvisibleChange: function() {
            if (this.visible) {
                this.wizard.buttons.nextButton.set("visible", true);
                this.wizard.buttons.nextButton.set("text", mstrmojo.desc(1059, "Next"));
                this.wizard.buttons.backButton.set("visible", true);
                this.wizard.buttons.cancelButton.set("visible", false);
                this.wizard.titleBar.restart.set("visible", true);
                this.wizard.titleBar.restartIcon.set("visible", true);
            }
        }

    });

}());