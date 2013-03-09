/**
 * General setting for iPhone
 */
(function(){

    mstrmojo.requiresCls(
            'mstrmojo.mobileConfigUtil',
            "mstrmojo.Table",
            "mstrmojo.ValidationTextBox",
            "mstrmojo.SelectBox",
            "mstrmojo.CheckBox",
            "mstrmojo.FieldSet");
    
    //Util
    var util = mstrmojo.mobileConfigUtil,                    
        _TR = mstrmojo.validation.TRIGGER,
        _DTP = mstrmojo.expr.DTP,
        isNotUniversalDevice = "this.parent.model.data.dt != 3 && this.parent.model.data.dt != 4",
        isUniversalTablet = "this.parent.model.data.dt == 4",
        hideOnUniBindings = {
            visible: isNotUniversalDevice
        },
        isUniversalDevice = 'this.parent.model.data.dt==3 || this.parent.model.data.dt==4',
        isIOS = "this.parent.model.data.dt == 1||this.parent.model.data.dt == 2",
        parentModel = "this.parent.model",
        parentModelBindings = {
            model: parentModel
        };
    
    /**
     * Logging levels
     */
       var levels = [{n: mstrmojo.desc(844), v: util.LOGGING_LEVEL_WARNING},
                    {n: mstrmojo.desc(845), v: util.LOGGING_LEVEL_ERROR},
                    {n: mstrmojo.desc(874), v: util.LOGGING_LEVEL_MESSAGES},
                    {n: mstrmojo.desc(2461), v: util.LOGGING_LEVEL_ALL},
                    {n: mstrmojo.desc(2411), v: util.LOGGING_LEVEL_OFF}],
                    
              timeUnitCollection = [{n: mstrmojo.desc(707), v: util.TIME_UNIT_DAYS},
                          {n: mstrmojo.desc(708), v: util.TIME_UNIT_HOURS},
                          {n: mstrmojo.desc(7895), v: util.TIME_UNIT_MINUTES}],
              menValues = [{n: '25 '+mstrmojo.desc(7771), v: 25},
                           {n: '50 '+mstrmojo.desc(7771), v: 50},
                           {n: '100 '+mstrmojo.desc(7771), v: 100},
                           {n: '250 '+mstrmojo.desc(7771), v: 250},
                           {n: '500 '+mstrmojo.desc(7771), v: 500},
                           {n: '1 '+mstrmojo.desc(7938), v: 1 * 1024},
                           {n: '2 '+mstrmojo.desc(7938), v: 2 * 1024},
                           {n: '3 '+mstrmojo.desc(7938), v: 3 * 1024},
                           {n: '4 '+mstrmojo.desc(7938), v: 4 * 1024}];
    // Given a value with specified timeUnit(day,hour,minute), transform it to minutes.
       function _calculateTime(time, unit){
           var peInMnt = -1; //default value: 'Never'
             switch (unit) {
               case util.TIME_UNIT_DAYS: 
                   peInMnt = time * 24 * 60;
                   break;
               case util.TIME_UNIT_MINUTES:
                   peInMnt = time;
                   break;
                 case util.TIME_UNIT_HOURS:
                   peInMnt = time * 60;
                   break;
               default: break;
           }
           return peInMnt;
       }
          
          // Given a value in minutes, transform it a JSON containing the time unit and value 
       function _getTimeUnit(tmInMnt) {
           if (tmInMnt % (24*60) === 0 ) {
               return {t: tmInMnt / (24*60), u: util.TIME_UNIT_DAYS};
           }
           
           if (tmInMnt % 60 === 0 ) {
               return {t: tmInMnt / 60, u: util.TIME_UNIT_HOURS};
           }

           return {t: tmInMnt, u: util.TIME_UNIT_MINUTES};
       }
          
       
    // Given a value with specified timeUnit(day,hour,minute), transform it to minutes.
    function _calculateTime(time, unit){
        var peInMnt = -1; //default value: 'Never'
          switch (unit) {
            case util.TIME_UNIT_DAYS: 
                peInMnt = time * 24 * 60;
                break;
            case util.TIME_UNIT_MINUTES:
                peInMnt = time;
                break;
              case util.TIME_UNIT_HOURS:
                peInMnt = time * 60;
                break;
            default: break;
        }
        return peInMnt;
    }
       
       // Given a value in minutes, transform it a JSON containing the time unit and value 
    function _getTimeUnit(tmInMnt) {
        if (tmInMnt % (24*60) === 0 ) {
            return {t: tmInMnt / (24*60), u: util.TIME_UNIT_DAYS};
        }
        
        if (tmInMnt % 60 === 0 ) {
            return {t: tmInMnt / 60, u: util.TIME_UNIT_HOURS};
        }

        return {t: tmInMnt, u: util.TIME_UNIT_MINUTES};
    }
       
       
    //UI
    mstrmojo.iPhone_tab = mstrmojo.insert({
        scriptClass: "mstrmojo.Table",
        cssText: "margin 10px 0px 0px 10px",
        
        n: mstrmojo.desc(7767),      //"iPhone Settings"
        id: "iPhone_tab",
        
        model: null,
        
        layout: [  {cells: [{}, {}, {}]},       // row 0
                   {cells: [{}, {}, {}]}, 
                   {cells: [{}, {}, {}]},
                   {cells: [{}, {}]}, 
                   {cells: [{}, {}]},
                   {cells: [{}, {}, {}]},
                   {cells: [{}, {}, {}]},
                   {cells: [{}, {}, {}]}, 
                   {cells: [{}, {}, {}]}, 
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},     // row 10
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]}, // row 20
                   {cells: [{},{colSpan:2}]},  
                   {cells: [{},{colSpan:2}]},
                   {cells: [{},{colSpan:2}]},
                   {cells: [{},{colSpan:2}]},
                   {cells: [{},{}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{},{colSpan:2}]},
                   {cells: [{colSpan: 3}]},
                   {cells: [{colSpan: 3}]}     // row 29
                   ], 

        children: 
            [
                    //"Memory Limit:"
                    util.propertyName(mstrmojo.desc(7770), "0,0", "width:200px"),
                    {
                        slot: "0,1",
                        alias: 'mlUnit',
                        scriptClass: "mstrmojo.SelectBox",
                        cssClass: "mobileconfig-SelectBox",
                        showItemTooltip: true,
                        size: 1,
                        items: menValues,
                        bindings: {
                               mlv: "this.parent.model.data.gnl.ml.v"
                        },
                        onmlvChange: function(){
                            if (this.mlv !== undefined && this.mlv !== null) {
                                var i = menValues.length -1; 
                                for (;i >= 1&& menValues[i].v >= this.mlv && menValues[i-1].v >= this.mlv; i--);
                                this.set('selectedIndex', i );
                            }
                        },
                        onchange: function() {
                            if(this.selectedItem) {
                                this.parent.model.data.gnl.ml.v = this.selectedItem.v;
                            }
                        }
                    },
                
                    //"Network Timeout:"
                    util.propertyName(mstrmojo.desc(7772), "1,0"),
                    {
                        slot: "1,1",
                        alias: "ntIpt",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        required: true,
                        dtp: _DTP.INTEGER,
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v) {
                                var art = parseInt(this.parent.model.data.gnl.art.v, 10),
                                    min = isNaN(art)? 1:art;
                                
                                if (v < min || v > 9999){
                                    return  {code: mstrmojo.validation.STATUSCODE.INVALID_VALIDATOR, 
                                             msg:mstrmojo.desc(7839).replace(/###/, 9999).replace(/##/, min)};
                                }else{
                                    return {id: this.id, code : mstrmojo.validation.STATUSCODE.VALID, msg: ''};  
                                }
                            }
                        },
                        bindings: {
                              value: "this.parent.model.data.gnl.nt.v"
                        },
                        onValid: function() {
                            var p = this.parent,
                                artIpt = p.artIpt,
                                m = this.parent.model;
                                
                            util.setValidValue(m.data.gnl.nt, 'v', this.value);
                            m.validate();
                            //Update the validation status of the Acceptable network response setting
                            if (artIpt.value != null && !artIpt.isValid()){
                                artIpt.validate();
                            }
                        },
                        onInvalid: function(){
                            if ( this.parent.model) {
                              delete this.parent.model.data.gnl.nt.v;
                              this.parent.model.set("validFlag", false);
                            }
                        }
                    },
                    //seconds
                    util.propertyName(mstrmojo.desc(7773), "1,2", "margin-left:4px"),
                    
                    //Acceptable network response time:
                    util.propertyName(mstrmojo.desc(8060), "2,0", "", hideOnUniBindings ),
                    {
                        slot: "2,1",
                        alias: 'artIpt',
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        required: true,
                        dtp: _DTP.INTEGER,
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v) {
                                var nt = parseInt(this.parent.model.data.gnl.nt.v, 10),
                                    max = isNaN(nt) ? 9999:Math.min(nt, 9999);
                                
                                if (v < 1 || v > max){
                                    return  {code: mstrmojo.validation.STATUSCODE.INVALID_VALIDATOR, 
                                             msg:mstrmojo.desc(7839).replace(/###/, max).replace(/##/, 1)};
                                }else{
                                    return {id: this.id, code : mstrmojo.validation.STATUSCODE.VALID, msg: ''};  
                                }
                            }
                        },
                        bindings: {
                            value: "this.parent.model.data.gnl.art.v",
                            visible: isNotUniversalDevice
                        },
                        onValid: function() {
                            var p = this.parent,
                                ntIpt = p.ntIpt,
                                m = this.parent.model;
                            
                            util.setValidValue(m.data.gnl.art, 'v', this.value);
                            m.validate();
                            //Update the validation status of the Network timeout setting
                            if (ntIpt.value != null && !ntIpt.isValid()){
                                ntIpt.validate();
                            }
                        },
                        onInvalid: function(){
                            if (this.parent.model) {
                                delete this.parent.model.data.gnl.art.v;
                                this.parent.model.set("validFlag", false);
                            }
                        }
                    },
                    //seconds
                    util.propertyName(mstrmojo.desc(7773), "2,2", "margin-left:4px", hideOnUniBindings),
                    
                    
                    //Max Columns in Grid
                    util.propertyName(mstrmojo.desc(7840) + ":", "3,0"),
                    {
                        slot: "3,1",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        required: true,
                        dtp: _DTP.INTEGER,
                        validateInput: function(v) {
                            if (v <1 || v > 9999)  {
                                return false;
                            }
                        },
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v) {
                                return util.generalValidator(v, this.dtp, this.validateInput, 
                                        mstrmojo.desc(7839).replace(/###/, 9999).replace(/##/, 1));
                            }
                        },
                        bindings: {
                              value: "this.parent.model.data.gnl.mgc.v"
                        },
                        onValid: function() {
                            util.setValidValue(this.parent.model.data.gnl.mgc, 'v', this.value);
                            this.parent.model.validate();
                        },
                        onInvalid: function(){
                            if (this.parent.model) {
                              delete this.parent.model.data.gnl.mgc.v;
                              this.parent.model.set("validFlag", false);
                            }
                        }
                    },
                    //Maximum canvas to screen ratio
                    util.propertyName(mstrmojo.desc(8762) + ":", "4,0", "", { visible: isUniversalDevice} ),
                    {
                        slot: "4,1",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        required: true,
                        dtp: _DTP.INTEGER,
                        constraints: {
                    		trigger: _TR.ALL,
                    		validator: function(v) {
                    			if (v < 1 || v > 25)  {
                    				return  {code: mstrmojo.validation.STATUSCODE.INVALID_VALIDATOR, 
                                        msg:mstrmojo.desc(7839).replace(/###/, 25).replace(/##/, 1)};
                    			}
                    		}
                    	},
                        bindings: {
                            value: "this.parent.model.data.gnl.mcs.v",
                            visible: isUniversalDevice
                        },
                        onValid: function() {
                            util.setValidValue(this.parent.model.data.gnl.mcs, 'v', this.value);
                            this.parent.model.validate();
                        },
                        onInvalid: function(){
                            if (this.parent.model) {
                            	if(this.parent.model.data.gnl.mcs) {
                            		delete this.parent.model.data.gnl.mcs.v;
                            	}
                                this.parent.model.set("validFlag", false);
                            }
                        }
                    },
                    //"Logging Level:"
                    util.propertyName(mstrmojo.desc(1477), "4,0", "", hideOnUniBindings),
                    {
                        slot: "4,1",
                        scriptClass: "mstrmojo.SelectBox",
                        cssClass: "mobileconfig-SelectBox",
                        showItemTooltip: true,
                        size: 1,
                        items: levels,
                        bindings: {
                            selectedItem: "{v:this.parent.model.data.gnl.ll.v}",
                            visible: isNotUniversalDevice
                        },
                        onchange: function() {
                            this.parent.model.data.gnl.ll.v = this.selectedItem.v;
                        }
                    },
                    //"Maximum Log Size:"
                    util.propertyName(mstrmojo.desc(7828), "5,0", "", hideOnUniBindings),
                    {
                        slot: "5,1",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        alias: "mlsVTB",
                        required: true,
                        dtp: _DTP.INTEGER,
                        validateInput: function(v) {
                            if (v < 0 || v > 9999) {
                                return false;
                            }
                        },
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v) {
                             return util.generalValidator(v, this.dtp, this.validateInput, 
                                     mstrmojo.desc(7839).replace(/###/, 9999).replace(/##/, 0));
                            }
                        },
                        bindings: {
                            value: "this.parent.model.data.gnl.mls.v",
                            visible: isNotUniversalDevice
                        },
                        onValid: function() {
                            util.setValidValue(this.parent.model.data.gnl.mls, 'v', this.value);
                            this.parent.model.validate();
                        },
                        onInvalid: function(){
                            if (this.parent.model) {
                              delete this.parent.model.data.gnl.mls.v;
                              this.parent.model.set("validFlag", false);
                            }
                        }
                    },
                    //entries
                    util.propertyName(mstrmojo.desc(7939), "5,2", "margin-left:4px", hideOnUniBindings),
                    //"Check for new subscription every:"
                    {
                        alias: "sciCheck",
                        slot: "6,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8025),
                        bindings:{
                            checked: "this.parent.model.data.gnl.sci.v > 0"
                        },
                        onclick: function(){
                            util.setValidValue(this.parent.model.data.gnl.sci, "v", this.checked ? this.parent.sciInput.value : -1);
                            this.parent.sciInput.set("enabled", this.checked);
                            this.parent.model.validate();
                        }
                    },
                    {
                        slot: "6,1",
                        alias: "sciInput",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        required: true,
                        dtp: _DTP.INTEGER,
                        validateInput: function(v) {
                            if (v < 1 || v > 9999)  {
                                return false;
                            }
                        },
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v) {
                                return util.generalValidator(v, this.dtp, this.validateInput, 
                                        mstrmojo.desc(7839).replace(/###/, 9999).replace(/##/, 1));
                            }
                        },
                        bindings: {
                            value: "this.parent.model.data.gnl.sci.v > 0?this.parent.model.data.gnl.sci.v:''",
                            enabled: "this.parent.model.data.gnl.sci.v > 0"
                        },
                        onValid: function() {
                            util.setValidValue(this.parent.model.data.gnl.sci, 'v', this.value);
                            this.parent.model.validate();
                        },
                        onInvalid: function(){
                            if (this.parent.model && this.parent.sciCheck.checked) {
                                delete this.parent.model.data.gnl.sci.v;
                                this.parent.model.set("validFlag", false);
                            }
                        },
                        onenabledChange: function(){
                            if(this.enabled){
                                this.validate();
                            } else {
                                this.set("validationStatus", {code: mstrmojo.validation.STATUSCODE.VALID});
                            }
                        }
                    },
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(7773), 
                        slot: "6,2", 
                        cssText: "margin-left:4px"
                    },
                    //"Validate device cache every:"
                    {
                        alias: "cviCheck",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8026),
                        slot: "7,0",
                        bindings:{
                            checked: "this.parent.model.data.gnl.cvi.v > 0"
                        },
                        onclick: function(){
                            util.setValidValue(this.parent.model.data.gnl.cvi, "v", this.checked? this.parent.cviInput.value : -1);
                            this.parent.cviInput.set("enabled", this.checked);
                            this.parent.model.validate();
                        }
                    },
                    {
                        alias: "cviInput",
                        slot: "7,1",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        required: true,
                        dtp: _DTP.INTEGER,
                        validateInput: function(v) {
                            if (v < 1 || v > 9999)  {
                                return false;
                            }
                        },
                        constraints: {
                            trigger: _TR.ALL,
                            validator: function(v) {
                                return util.generalValidator(v, this.dtp, this.validateInput, 
                                        mstrmojo.desc(7839).replace(/###/, 9999).replace(/##/, 1));
                            }
                        },
                        bindings: {
                            value: "this.parent.model.data.gnl.cvi.v > 0? this.parent.model.data.gnl.cvi.v : ''",
                            enabled: "this.parent.model.data.gnl.cvi.v > 0"
                        },
                        onValid: function() {
                            util.setValidValue(this.parent.model.data.gnl.cvi, 'v', this.value);
                            this.parent.model.validate();
                        },
                        onInvalid: function(){
                            if (this.parent.model && this.parent.cviCheck.checked) {
                                delete this.parent.model.data.gnl.cvi.v;
                                this.parent.model.set("validFlag", false);
                            }
                        },
                        onenabledChange: function(){
                            if(this.enabled){
                                this.validate();
                            } else {
                                this.set("validationStatus", {code: mstrmojo.validation.STATUSCODE.VALID});
                            }
                        }
                    },
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(7773), 
                        slot: "7,2", 
                        cssText: "margin-left:4px"
                    },
                    //"Cache real-time data for:"
                    {
                        alias: "crdCheck",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8831),//'Cache real-time data for:',
                        slot: "8,0",
                        bindings:{
                            checked: "this.parent.model.data.gnl.crd.v > 0"
                        },
                        onclick: function(){
                            util.setValidValue(this.parent.model.data.gnl.crd, "v", this.checked? this.parent.crdInput.value : 0);
                            this.parent.crdInput.set("enabled", this.checked);
                            this.parent.model.validate();
                        }
                    },
                    {
                        alias: "crdInput",
                        slot: "8,1",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        cssClass: "mobileconfig-TextBox",
                        required: true,
                        dtp: _DTP.INTEGER,
                        constraints: {
                            min: 1,
                            trigger: _TR.ALL
                        },
                        bindings: {
                            value: "this.parent.model.data.gnl.crd.v > 0? this.parent.model.data.gnl.crd.v : ''",
                            enabled: "this.parent.model.data.gnl.crd.v > 0"
                        },
                        onValid: function() {
                            util.setValidValue(this.parent.model.data.gnl.crd, 'v', this.value);
                            this.parent.model.validate();
                        },
                        onInvalid: function(){
                            if (this.parent.model && this.parent.crdCheck.checked) {
                                delete this.parent.model.data.gnl.crd.v;
                                this.parent.model.set("validFlag", false);
                            }
                        },
                        onenabledChange: function(){
                            if(this.enabled){
                                this.validate();
                            } else {
                                this.set("validationStatus", {code: mstrmojo.validation.STATUSCODE.VALID});
                            }
                        }
                    },
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(7773), 
                        slot: "8,2", 
                        cssText: "margin-left:4px"
                    },
                    {
                        slot: "9,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(7774),      //"Allow Users to Access Settings"
                        bindings: {
                            checked : "this.parent.model.data.gnl.uas.v"
                        },
                        onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.uas.v = this.checked;
                            }
                        }
                    },
                    {
                        slot: "10,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(9062),     //"Automatically pre-load subscriptions"
                        bindings: {
                            checked : "this.parent.model.data.gnl.plc.v===1" //AUTO
                        },
                       onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.plc.v = (this.checked)? util.CACHE_PRELOAD_AUTO : util.CACHE_PRELOAD_OFF;
                            }
                        }
                    },
                    {
                        slot: "11,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                       label: mstrmojo.desc(7841),      //"Cache Folders"
                       bindings: {
                           checked : "this.parent.model.data.gnl.fc.v"
                       },
                       onclick : function() {
                           if(this.parent.model){
                               this.parent.model.data.gnl.fc.v = this.checked;
                           }
                       }
                    },
                    {
                        slot: "12,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(7843),      //"Clear Caches When Application Closes"
                        bindings: {
                            checked : "this.parent.model.data.gnl.cc.v===2"//onClose
                       },
                       onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.cc.v = (this.checked)? util.CACHE_CLEAR_ONCLOSE : util.CACHE_CLEAR_AUTO;
                            }
                        }
                    },
                    {
                        slot: "13,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8356), //"Allow users to modify caching settings",  
                        bindings: {
                            checked : "this.parent.model.data.gnl.usc.v"
                       },
                       onclick : function() {
                           if(this.parent.model){
                               this.parent.model.data.gnl.usc.v = this.checked;
                           }
                        }
                    },
                    {
                        slot: "14,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8357), //"Allow users to modify logging settings",
                        bindings: {
                            checked : "this.parent.model.data.gnl.usl.v",
                            visible: isNotUniversalDevice
                       },
                       onclick : function() {
                           if(this.parent.model){
                               this.parent.model.data.gnl.usl.v = this.checked;
                           }
                        }
                    },
                    {
                        slot: "15,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8358), //"Allow users to enable Diagnostic Mode",
                        bindings: {
                            checked : "this.parent.model.data.gnl.usd.v"
                       },
                       onclick : function() {
                           if(this.parent.model){
                               this.parent.model.data.gnl.usd.v = this.checked;
                           }
                        }
                    },
                    {
                        slot: "16,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8036),      //"Enable Push Notification"
                        bindings: {
                            checked : "this.parent.model.data.gnl.pn.v===1",//ON
                            visible: isNotUniversalDevice
                       },
                       onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.pn.v = (this.checked)? util.PUSH_NOTIFICATION_ON : util.PUSH_NOTIFICATION_OFF;
                            }
                        }
                    },
                    {
                        slot: "17,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8226),      //"Enable Email Screen"
                        bindings: {
                            checked : "this.parent.model.data.gnl.es.v",
                            visible: isNotUniversalDevice
                       },
                       onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.es.v = this.checked;
                            }
                        }
                    },
                    {
                        slot: "18,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(9063),      //"Disable the built-in PDF viewer"
                        bindings: {
                            checked : "this.parent.model.data.gnl.dbpv.v",
                            visible: isIOS
                       },
                       onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.dbpv.v = this.checked;
                            }
                        }
                    },
                    {
                        slot: "19,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(9064),      //"Allow users to open PDF documents in external applications"
                        bindings: {
                            checked : "this.parent.model.data.gnl.eopdf.v",
                            visible: isIOS
                       },
                       onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.eopdf.v = this.checked;
                            }
                        }
                    },
                    {
                        slot: "20,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-CheckBox",
                        label: mstrmojo.desc(8300),      //"Ignore user privileges errors during reconcile"
                        bindings: {
                            checked : "this.parent.model.data.gnl.ipe.v",
                            visible: isNotUniversalDevice
                       },
                       onclick : function() {
                            if(this.parent.model){
                                this.parent.model.data.gnl.ipe.v = this.checked;
                            }
                        }
                    },
                    {
                        //"Password Expiration"
                        slot: "21,0",
                        scriptClass: "mstrmojo.Label",
                        cssText: "width: 200px",
                        text: mstrmojo.desc(4039) + ":",
                        bindings:{
                            visible: isNotUniversalDevice
                        }
                    },
                    {
                        slot: "21,1",
                        scriptClass: "mstrmojo.RadioButton",
                        name: "nvr",
                        alias: "nvr",
                        label: mstrmojo.desc(63),      //"Never"
                        bindings: {
                            initValue: "this.parent.model.data.gnl.pe.v",
                            visible: isNotUniversalDevice
                        },
                        oninitValueChange: function() { //intial the status of this widgets
                            if (this.initValue == -1) { //Never
                                this.set("checked", true);
                                this.parent.aftrTm.aftr.set("checked", false);
                            } else {
                                this.set("checked", false);
                                this.parent.aftrTm.aftr.set("checked", true);
                                
                                var tm = _getTimeUnit(this.initValue);
                                this.parent.aftrTm.inputTm.set("value", tm.t);
                                this.parent.aftrTm.set("tmUnit", tm.u);
                            }
                        },
                        onclick : function() {
                            if (this.isChecked()) {
                                this.set("checked", true);
                                this.parent.aftrTm.aftr.set("checked",false);
                                if (this.parent.model) {
                                    util.setValidValue(this.parent.model.data.gnl.pe, 'v', -1);
                                    this.parent.model.validate();
                                }
                            }
                        }
                    },
                    {
                        slot: "22,1",
                        scriptClass: "mstrmojo.HBox",
                        cssText: "margin-bottom:8px",
                        alias: "aftrTm",
                        tmUnit: util.TIME_UNIT_DAYS,
                        bindings: {
                            visible: isNotUniversalDevice
                        },
                        children: [
                                   {
                                       scriptClass: "mstrmojo.RadioButton",
                                       name: "aftr",
                                       alias: "aftr",
                                       label: mstrmojo.desc(7894),     //"After"
                                       onclick : function() { //the radioButton do not completely finished
                                           if (this.isChecked()) {
                                               this.set("checked", true);
                                               this.parent.parent.nvr.set("checked",false);
                                           }
                                       }
                                   },
                                   {
                                       scriptClass: "mstrmojo.ValidationTextBox",
                                       alias: "inputTm",
                                       cssText: "width:75px;margin-left:3px",
                                       bindings: {
                                           enabled: "this.parent.aftr.checked"
                                       },
                                       required: true,
                                       dtp: _DTP.INTEGER,
                                       validateInput: function(v) {
                                           if (v < 0 || v > 99) { 
                                               return false;
                                           }
                                       },
                                       constraints: {
                                           trigger: _TR.ALL,
                                           validator: function(v) {
                                               return util.generalValidator(v, this.dtp, this.validateInput, 
                                                       mstrmojo.desc(7839).replace(/###/, 99).replace(/##/, 1));
                                           } 
                                       },
                                       onenabledChange: function() {
                                           if (this.enabled) {
                                               this.validate();
                                           } else {
                                              this.set("validationStatus", {code: mstrmojo.validation.STATUSCODE.VALID});
                                           }
                                       },
                                       onValid: function() {
                                           if (this.parent.tmUnit) {
                                               var pe = _calculateTime(this.value, this.parent.tmUnit);
                                               if (this.parent.parent.model) {
                                                   util.setValidValue(this.parent.parent.model.data.gnl.pe, 'v', pe);
                                                   this.parent.parent.model.validate();
                                               }
                                           }
                                       },
                                       onInvalid: function(){
                                           if (this.parent.parent.model) {
                                               delete this.parent.parent.model.data.gnl.pe.v;
                                               this.parent.parent.model.set("validFlag", false);
                                           }
                                       }
                                   },
                                   {
                                       scriptClass: "mstrmojo.SelectBox",
                                       alias: "unt",
                                       cssText: "width:70px;margin-left:8px",
                                       showItemTooltip: true,
                                       items: timeUnitCollection,
                                       size:1,
                                       bindings: {
                                           enabled: "this.parent.aftr.checked",
                                           selectedItem: "{v: this.parent.tmUnit}"
                                       },
                                       onchange: function() {
                                           this.parent.set("tmUnit", this.selectedItem.v);
                                           if (this.parent.tmUnit) {
                                               var pe = _calculateTime(this.parent.inputTm.value, this.parent.tmUnit);
                                               if (this.parent.parent.model) {
                                                   util.setValidValue(this.parent.parent.model.data.gnl.pe, 'v', pe);
                                                   this.parent.inputTm.validate();
                                               }
                                           }
                                       }
                                   }
                                   ]
                    },

                    {
                    //"Check and update configuration"
                        slot: "23,0",
                        scriptClass: "mstrmojo.Label",
                        cssText: "width: 200px",
                        text: mstrmojo.desc(8299) + ":"
                    },
                    {
                        slot: "23,1",
                        scriptClass: "mstrmojo.RadioButton",
                        name: "upCfg",
                        alias: "uptcNvr",
                        label: mstrmojo.desc(63),      //"Never"
                        bindings: {
                            initValue: "this.parent.model.data.gnl.uptc.v"
                        },
                        calTime: function(tmInMnt) {
                            if (tmInMnt % (24*60) === 0 ) {
                                return {t: tmInMnt / (24*60), u: util.TIME_UNIT_DAYS};
                            }
                            
                            return {t: tmInMnt / 60, u: util.TIME_UNIT_HOURS};
 
                        },
                        oninitValueChange: function() { //intial the status of this widgets
                            if (this.initValue == -1) { //Never
                                this.set("checked", true);
                                this.parent.uptcTm.vry.set("checked", false);
                            } else {
                                this.set("checked", false);
                                this.parent.uptcTm.vry.set("checked", true);
                                
                                var tm = this.calTime(this.initValue);
                                this.parent.uptcTm.inputTm.set("value", tm.t);
                                this.parent.uptcTm.set("uptcUnit", tm.u);
                            }
                        },
                        onclick : function() {
                            if (this.isChecked()) {
                                this.set("checked", true);
                                this.parent.uptcTm.vry.set("checked",false);
                                if (this.parent.model) {
                                    util.setValidValue(this.parent.model.data.gnl.uptc, 'v', -1);
                                    this.parent.model.validate();
                                }
                            }
                        }
                    },{
                        slot: "24,1",
                        scriptClass: "mstrmojo.HBox",
                        cssText: "margin-bottom:8px",
                        alias: "uptcTm",
                        uptcUnit: util.TIME_UNIT_DAYS,
                        calculatePe: function (time, unit) {
                            var peInMnt = -1; //default value: 'Never'
                            switch (unit) {
                                case util.TIME_UNIT_DAYS: 
                                    peInMnt = time * 24 * 60;
                                    break;
                                case util.TIME_UNIT_MINUTES:
                                    peInMnt = time;
                                    break;
                                case util.TIME_UNIT_HOURS:
                                    peInMnt = time * 60;
                                    break;
                                default: break;
                            }
                            return peInMnt;
                    },
                        children: [
                                   {
                                       scriptClass: "mstrmojo.RadioButton",
                                       name: "upCfg",
                                       alias: "vry",
                                       label: mstrmojo.desc(1320),     //"Every"
                                       onclick : function() { //the radioButton do not completely finished
                                           if (this.isChecked()) {
                                               this.set("checked", true);
                                               this.parent.parent.uptcNvr.set("checked",false);
                                           }
                                       }
                                   },
                                   {
                                       scriptClass: "mstrmojo.ValidationTextBox",
                                       alias: "inputTm",
                                       cssText: "width:75px;margin-left:3px",
                                       bindings: {
                                           enabled: "this.parent.vry.checked"
                                       },
                                       required: true,
                                       dtp: _DTP.INTEGER,
                                       validateInput: function(v) {
                                           if (v < 1 || v > 99) { 
                                               return false;
                                           }
                                       },
                                       constraints: {
                                           trigger: _TR.ALL,
                                           validator: function(v) {
                                               return util.generalValidator(v, this.dtp, this.validateInput, 
                                                       mstrmojo.desc(7839).replace(/###/, 99).replace(/##/, 1));
                                           } 
                                       },
                                       onenabledChange: function() {
                                           if (this.enabled) {
                                               this.validate();
                                           } else {
                                              this.set("validationStatus", {code: mstrmojo.validation.STATUSCODE.VALID});
                                           }
                                       },
                                       onValid: function() {
                                           if (this.parent.uptcUnit) {
                                               var uptc = this.parent.calculatePe(this.value, this.parent.uptcUnit);
                                               if (this.parent.parent.model) {
                                                   util.setValidValue(this.parent.parent.model.data.gnl.uptc, 'v', uptc);
                                                   this.parent.parent.model.validate();
                                               }
                                           }
                                       },
                                       onInvalid: function(){
                                           if (this.parent.parent.model) {
                                               delete this.parent.parent.model.data.gnl.uptc.v;
                                               this.parent.parent.model.set("validFlag", false);
                                           }
                                       }
                                   },
                                   {
                                       scriptClass: "mstrmojo.SelectBox",
                                       alias: "uptcUnt",
                                       cssText: "width:70px;margin-left:8px",
                                       showItemTooltip: true,
                                       items: [{n: mstrmojo.desc(707), v: util.TIME_UNIT_DAYS},
                                               {n: mstrmojo.desc(708), v: util.TIME_UNIT_HOURS}],
                                       size:1,
                                       bindings: {
                                           enabled: "this.parent.vry.checked",
                                           selectedItem: "{v: this.parent.uptcUnit}"
                                       },
                                       onchange: function() {
                                           this.parent.set("uptcUnit", this.selectedItem.v);
                                           if (this.parent.uptcUnit) {
                                               var uptc = this.parent.calculatePe(this.parent.inputTm.value, this.parent.uptcUnit);
                                               if (this.parent.parent.model) {
                                                   util.setValidValue(this.parent.parent.model.data.gnl.uptc, 'v', uptc);
                                                   this.parent.inputTm.validate();
                                               }
                                           }
                                       }
                                   }
                                   ]
                    },
                    {
                        slot: "25,0",
                        scriptClass: "mstrmojo.CheckBox",
                        cssClass: "mobileconfig-Checkbox",
                        label: mstrmojo.desc(8061),	//Use certificate server
                        alias: "ucsCheck",
                        bindings:{
                            checked: "this.parent.model.data.gnl.ucs.v"
                        },
                        onclick: function(){
                            if (this.parent.model){
                                this.parent.model.data.gnl.ucs.v = this.checked;
                            }
                        }
                    },
                    {
                        slot: "25,1",
                        scriptClass: "mstrmojo.ValidationTextBox",
                        alias: "ucsInput",
                        dtp: mstrmojo.expr.DTP.VARCHAR,
                        constraints: {
                            trigger:mstrmojo.validation.TRIGGER.ALL,
                            regExp: new RegExp('^https\:\/\/', 'i')
                        },
                        cssText: "width:200px;margin-left:3px",
                        bindings:{
                            enabled: "this.parent.ucsCheck.checked",
                            initValue: "this.parent.model.data.gnl.cs.v"
                        },
                        oninitValueChange: function(n, v){
                            if(!!this.initValue){ 
                                this.set("value", this.initValue);
                            }
                        },
                        onenabledChange: function(){
                            if (this.hasRendered){
                                this.required = this.enabled;
                                if(!this.enabled){
                                    var m = this.parent.model;
                                    if (!!this.value) { m.data.gnl.cs.v = "";}
                                    this.clearValidation();
                                    m.set("validFlag", true);
                                } else if (this.value != null){
                                    this.validate();
                                }
                            }
                        },
                        onValid: function(){
                            var m = this.parent.model;
                            if (m){
                                m.data.gnl.cs.v = this.value;
                                m.set("validFlag", true);
                            }
                        },
                        onInvalid: function(){
                            var m = this.parent.model;
                            if (m){
                                m.set("validFlag", false);
                            }
                        }
                     },
                     {
                         slot: "26,0",
                         scriptClass: "mstrmojo.CheckBox",
                         cssText:"margin-left:11px",
                         label: mstrmojo.desc(9065),        //Clear caches when certificate becomes invalid
                         alias: "dwCheck",
                         bindings:{
                             enabled: "this.parent.ucsCheck.checked",
                             checked: "this.parent.model.data.gnl.dw.v",
                             visible: "this.parent.model.data.dt === 1 || this.parent.model.data.dt === 2"
                         },
                         onclick: function(){
                             if (this.parent.model){
                                 this.parent.model.data.gnl.dw.v = this.checked;
                             }
                         }
                     },
                    {
                       //Require re-authentication to confidential projects on resuming application after:
                        slot: "27,0",
                        scriptClass: "mstrmojo.Label",
                        cssText: "width: 200px",
                        text: mstrmojo.desc(8285),
                        bindings:{
                            visible: isNotUniversalDevice
                        }
                    },
                    {
                        slot: "27,1",
                        scriptClass: "mstrmojo.HBox",
                        bindings:{
                            initValue: "this.parent.model.data.gnl.rar.v",
                            visible: isNotUniversalDevice
                        },
                        oninitValueChange: function(){
                            var tm = _getTimeUnit(this.initValue);
                            this.inputTm.set("value", tm.t);
                            this.unt.set("timeUnit", tm.u);
                        },
                        children: [
                           {
                               scriptClass: "mstrmojo.ValidationTextBox",
                               alias: "inputTm",
                               cssText: "width:75px;margin-left:3px",
                               required: true,
                               dtp: _DTP.INTEGER,
                               validateInput: function(v) {
                                   if (v < 1 || v > 99) { 
                                       return false;
                                   }
                               },
                               constraints: {
                                   trigger: _TR.ALL,
                                   validator: function(v) {
                                       return util.generalValidator(v, this.dtp, this.validateInput, 
                                               mstrmojo.desc(7839).replace(/###/, 99).replace(/##/, 1));
                                   } 
                               },
                               onValid: function() {
                                   if (this.parent.unt.timeUnit) {
                                       var mins = _calculateTime(this.value, this.parent.unt.timeUnit),
                                           model = this.parent.parent.model;
                                       if (model) {
                                           util.setValidValue(model.data.gnl.rar, 'v', mins);
                                           model.validate();
                                       }
                                   }
                               },
                               onInvalid: function(){
                                   var model = this.parent.parent.model;
                                   if (model) {
                                       delete model.data.gnl.rar.v;
                                       model.set("validFlag", false);
                                   }
                               }
                           },
                           {
                               scriptClass: "mstrmojo.SelectBox",
                               alias: "unt",
                               cssText: "width:70px;margin-left:8px",
                               showItemTooltip: true,
                               items: timeUnitCollection,
                               timeUnit: util.TIME_UNIT_MINUTES,
                               bindings:{
                                   selectedItem: "{v: this.timeUnit}"
                               },
                               size:1,
                               onchange: function() {
                                   var model = this.parent.parent.model,
                                       inputTm = this.parent.inputTm;
                                   if (this.timeUnit) {
                                       this.set('timeUnit', this.selectedItem.v);
                                       var mins = _calculateTime(inputTm.value, this.timeUnit);
                                       if (model) {
                                           util.setValidValue(model.data.gnl.rar, 'v', mins);
                                           inputTm.validate();
                                       }
                                   }
                               }
                           }
                           ]
                    },
                    {
                        scriptClass: 'mstrmojo.FieldSet',
                        slot: '28,0',
                        legend: "Google Maps",
                        cssClass: "greyBorder",
                        cssText: "margin:8px 0px 0px 0px;width:100%",
                        bindings: {
                            visible: isUniversalDevice,
                            model: parentModel
                        },
                        children: [
                        {
                            scriptClass: 'mstrmojo.Table',
                            cssText: 'width: 100%; margin-top: 8px;',
                            bindings: parentModelBindings,
                            layout: [{cells: [{colSpan: 3}]},
                                     {cells: [{colSpan: 3}]}], 
                            children: [
                                {
                                    slot: "0,0",
                                    scriptClass: "mstrmojo.CheckBox",
                                    cssClass: "mobileconfig-Checkbox",
                                    label: mstrmojo.desc(9044),     //"Enable maps"
                                    alias: "mapCheck",   // map enable checkbox
                                    bindings:{
                                        model: parentModel,
                                        checked: "this.parent.parent.model.data.gnl.gme.v"
                                    },
                                    onclick: function(){
                                         if(this.model){
                                             util.setValidValue(this.model.data.gnl.gme, "v", this.checked);
                                         }
                                         this.set("checked",this.checked);
                                         
                                         var gmk = this.parent.children[1].children[0].gmkInput;
                                         gmk.required=this.checked;
                                         gmk.validate();
                                    }
                                },
                                {
                                    scriptClass: 'mstrmojo.FieldSet',
                                    slot: '1,0',
                                    cssClass: "mstrmojo-FieldSet-noborder",
                                    cssText: "margin: 0 0 8px 16px;width:100%",
                                    bindings: parentModelBindings,
                                    children: [
                                    {
                                        scriptClass: 'mstrmojo.Table',
                                        cssText: 'width: 100%',
                                        bindings: parentModelBindings,
                                        layout: [{cells: [{},{colSpan:2}]},
                                                 {cells: [{colSpan:3}]},
                                                 {cells: [{},{colSpan:2}]}], 
                                        children: [
                                            {
                                               // Google maps key/client ID
                                                slot: "0,0",
                                                scriptClass: "mstrmojo.Label",
                                                cssText: "width: 145px",
                                                text: mstrmojo.desc(9045)  //"Key:"
                                            },
                                            {
                                                slot: "0,1",
                                                scriptClass: "mstrmojo.ValidationTextBox",
                                                alias: "gmkInput",
                                                dtp: mstrmojo.expr.DTP.VARCHAR,
                                                constraints: {
                                                    trigger:mstrmojo.validation.TRIGGER.ALL,
                                                    min: 1
                                                },
                                                required: true,
                                                cssText: "width:200px;margin-left:3px",
                                                bindings:{
                                                    model: parentModel,
                                                    initValue: "this.parent.model.data.gnl.gmk.v",
                                                    enabled: "this.parent.parent.parent.mapCheck.checked"
                                                },
                                                oninitValueChange: function(n, v){
                                                    if(!!this.initValue){ 
                                                        this.set("value", this.initValue);
                                                    }
                                                },
                                                onValid: function(){
                                                    var m = this.model;
                                                    if (m){
                                                        m.data.gnl.gmk.v = this.value;
                                                        m.set("validFlag", true);
                                                    }
                                                },
                                                onInvalid: function(){
                                                    var m = this.model;
                                                    if (m){
                                                        m.set("validFlag", false);
                                                    }
                                                }
                                             },
                                            {
                                                slot: "1,0",
                                                scriptClass: "mstrmojo.CheckBox",
                                                cssClass: "mobileconfig-Checkbox",
                                                label: mstrmojo.desc(9046),     //"Premiere key"
                                                alias: "premCheck",   // is premiere key
                                                bindings:{
                                                    model: parentModel,
                                                    checked: "this.model.data.gnl.gmpk.v",
                                                    enabled: "this.parent.parent.parent.mapCheck.checked",
                                                    visible: isUniversalTablet
                                                },
                                                onclick: function(){
                                                     if(this.model){
                                                         util.setValidValue(this.model.data.gnl.gmpk, "v", this.checked);
                                                     }
                                                     this.set("checked",this.checked);
                                                }
                                            },
                                            {
                                                slot: "2,0",
                                                scriptClass: "mstrmojo.Label",
                                                cssText: "width: 100px",
                                                text: mstrmojo.desc(2761),  //"URL:"
                                                bindings: {
                                                    visible: isUniversalTablet
                                                }
                                            },
                                            {
                                                slot: "2,1",
                                                scriptClass: "mstrmojo.ValidationTextBox",
                                                alias: "gmuInput",
                                                dtp: mstrmojo.expr.DTP.VARCHAR,
                                                constraints: {
                                                    trigger:mstrmojo.validation.TRIGGER.ALL,
                                                    regExp: new RegExp('^https?\:\/\/', 'i')
                                                },
                                                cssText: "width:200px;margin-left:3px",
                                                bindings:{
                                                    model: parentModel,
                                                    initValue: "this.parent.model.data.gnl.gmu.v",
                                                    enabled: "this.parent.premCheck.checked && this.parent.parent.parent.mapCheck.checked",
                                                    visible: isUniversalTablet
                                                    
                                                },
                                                oninitValueChange: function(n, v){
                                                    if(!!this.initValue){ 
                                                        this.set("value", this.initValue);
                                                    }
                                                },
                                                onValid: function(){
                                                    var m = this.model;
                                                    if (m){
                                                        m.data.gnl.gmu.v = this.value;
                                                        m.set("validFlag", true);
                                                    }
                                                },
                                                onInvalid: function(){
                                                    var m = this.model;
                                                    if (m){
                                                        m.set("validFlag", false);
                                                    }
                                                }
                                             }
                                        
                                        ]
                                    }]
                                }]
                            }]
                        },
                    {
                        scriptClass: 'mstrmojo.FieldSet',
                        slot: '29,0',
                        legend: mstrmojo.desc(8415),          //"Encryption options "
                        cssClass: "greyBorder",
                        cssText: "margin:8px 0px 0px 0px;width:100%",
                        bindings: {
                            visible: isUniversalDevice
                        },
                        children: [{
                            scriptClass: 'mstrmojo.Table',
                            cssText: 'width: 100%',
                            bindings: {
                                m: 'this.parent.parent.model'
                            },
                            layout: [{cells: [{colSpan: 3}]},
                                     {cells: [{colSpan: 3}]},
                                     {cells: [{colSpan: 3}]},
                                     {cells: [{colSpan: 3}]},
                                     {cells: [{},{},{}]},
                                     {cells: [{},{},{}]},
                                     {cells: [{},{},{}]}], 
                             children: [{
                                 alias: "rpc",
                                 scriptClass: "mstrmojo.CheckBox",
                                 cssClass: "mobileconfig-CheckBox",
                                 label: mstrmojo.desc(8506),//Descriptor: "Requires passcode"
                                 slot: "0,0",
                                 bindings:{
                                     checked: "!this.parent.m.data.gnl.dtm.v"
                                 },
                                 onclick: function(){
                                     if(this.parent.m){
                                         util.setValidValue(this.parent.m.data.gnl.dtm, "v", !this.checked);
                                     }
                                     this.set("checked",this.checked);
                                 }
                             },
                            {
                                scriptClass: "mstrmojo.CheckBox",
                                cssClass: "mobileconfig-CheckBox",
                                label: mstrmojo.desc(8507),//Descriptor: "Requires at least one numeric character"
                                slot: "1,0",
                                bindings:{
                                    checked: "this.parent.m.data.gnl.drn.v",
                                    enabled: "this.parent.rpc.checked"
                                },
                                onclick: function(){
                                    if(this.parent.m){
                                        util.setValidValue(this.parent.m.data.gnl.drn, "v", this.checked);
                                    }
                                }
                            },
                            {
                                scriptClass: "mstrmojo.CheckBox",
                                cssClass: "mobileconfig-CheckBox",
                                label: mstrmojo.desc(8508) + "( $, @, % ...)",//"Requires at least one special character"
                                slot: "2,0",
                                bindings:{
                                    checked: "this.parent.m.data.gnl.drsc.v",
                                    enabled: "this.parent.rpc.checked"
                                },
                                onclick: function(){
                                    if(this.parent.m){
                                        util.setValidValue(this.parent.m.data.gnl.drsc, "v", this.checked);
                                    }
                                }
                            },
                          
                            {
                                scriptClass: "mstrmojo.CheckBox",
                                cssClass: "mobileconfig-CheckBox",
                                label: mstrmojo.desc(8509),  //Descriptor: "Requires at least one capital letter"
                                slot: "3,0",
                                bindings:{
                                    checked: "this.parent.m.data.gnl.drcl.v",
                                    enabled: "this.parent.rpc.checked"
                                },
                                onclick: function(){
                                    if(this.parent.m){
                                        util.setValidValue(this.parent.m.data.gnl.drcl, "v", this.checked);
                                    }
                                }
                            },
                            util.propertyName(mstrmojo.desc(8420), "4,0"),//Descriptor: "Passcode length:"
                            {
                                slot: "4,1",
                                scriptClass: "mstrmojo.ValidationTextBox",
                                cssClass: "mobileconfig-TextBox passcode",
                                required: true,
                                dtp: _DTP.INTEGER,
                                constraints: {
                                    trigger: _TR.ALL,
                                    min: 3,
                                    max: 8
                                },
                                bindings: {
                                    value: "this.parent.m.data.gnl.dcn.v",
                                    enabled: "this.parent.rpc.checked"
                                },
                                onValid: function() {
                                    util.setValidValue(this.parent.m.data.gnl.dcn, 'v', this.value);
                                    this.parent.m.validate();
                                },
                                onInvalid: function(){
                                    if (this.parent.m) {
                                      delete this.parent.m.data.gnl.dcn.v;
                                      this.parent.m.set("validFlag", false);
                                    }
                                }
                            },
                            util.propertyName(mstrmojo.desc(8423), "4,2", "margin-left:4px"),//Descriptor: "characters"
                            util.propertyName(mstrmojo.desc(8421), "5,0"), //Descriptor: "Maximum number of failed logon attempts:"
                            {
                                slot: "5,1",
                                scriptClass: "mstrmojo.ValidationTextBox",
                                cssClass: "mobileconfig-TextBox passcode",
                                required: true,
                                dtp: _DTP.INTEGER,
                                constraints: {
                                    trigger: _TR.ALL,
                                    min: 1
                                },
                                bindings: {
                                    value: "this.parent.m.data.gnl.dmatp.v",                                
                                    enabled: "this.parent.rpc.checked"
                                },
                                onValid: function() {
                                    util.setValidValue(this.parent.m.data.gnl.dmatp, 'v', this.value);
                                    this.parent.m.validate();
                                },
                                onInvalid: function(){
                                    if (this.parent.m) {
                                      delete this.parent.m.data.gnl.dmatp.v;
                                      this.parent.m.set("validFlag", false);
                                    }
                                }
                            },
                            util.propertyName(mstrmojo.desc(8422), "6,0"), //Descriptor: "Lockout duration:"
                            {
                                slot: "6,1",
                                scriptClass: "mstrmojo.ValidationTextBox",
                                cssClass: "mobileconfig-TextBox passcode",
                                required: true,
                                dtp: _DTP.INTEGER,
                                constraints: {
                                    trigger: _TR.ALL,
                                    min: 0,
                                    max: 10
                                },
                                bindings: {
                                    value: "this.parent.m.data.gnl.dd.v",
                                    enabled: "this.parent.rpc.checked"
                                },
                                onValid: function() {
                                    util.setValidValue(this.parent.m.data.gnl.dd, 'v', this.value);
                                    this.parent.m.validate();
                                },
                                onInvalid: function(){
                                    if (this.parent.m) {
                                      delete this.parent.m.data.gnl.dd.v;
                                      this.parent.m.set("validFlag", false);
                                    }
                                }
                            },
                            util.propertyName(mstrmojo.desc(7773), "6,2", "margin-left:4px")
                            ]
                        }]
                    }                    
                    
                ]   
    });
    
})();
