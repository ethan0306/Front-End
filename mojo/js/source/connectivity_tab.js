/**
 * Connectivity Setting tab
 */
(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.mobileConfigUtil",
            "mstrmojo.Table",
            "mstrmojo.WidgetList",
            "mstrmojo.ListSelector",
            "mstrmojo.array",
            "mstrmojo.AjaxCall",
            "mstrmojo.ValidationTextBox",
            "mstrmojo.SelectBox",
            "mstrmojo.CheckBox",
            "mstrmojo.FieldSet",
            "mstrmojo.Panel",
            "mstrmojo.Button",
            "mstrmojo.HBox");
    
    //Util
    var util = mstrmojo.mobileConfigUtil,
        _TR = mstrmojo.validation.TRIGGER,
        _DTP = mstrmojo.expr.DTP,
        _D = mstrmojo.dom,
        _H = mstrmojo.hash;
    
    //local data
    /**
     * Mobile Server Authen mode items
     */
      var srvAuthenMode = [{n: mstrmojo.desc(7778),v: util.AUTHEN_ANONY},     //"Anonymous" 
                           {n: mstrmojo.desc(7227),v: util.AUTHEN_BASIC},     //"Basic" 
                           {n: mstrmojo.desc(7779),v: util.AUTHEN_WIN}],      //"Windows"
                  
     /**
     * Project Authen mode items
     */                      
      androidPrjAuthenMode = [ {n: mstrmojo.desc(3157),v: util.PRJ_AUTHEN_STD},      //"Standard"
                               {n: mstrmojo.desc(7779),v: util.PRJ_AUTHEN_WIN},      //"Windows"
                               {n: mstrmojo.desc(7790),v: util.PRJ_AUTHEN_LDAP},     //"LDAP"
                               {n: mstrmojo.desc(1563),v: util.PRJ_AUTHEN_DB}],//"Database"
                               
       prjAuthenMode = _H.cloneArray(androidPrjAuthenMode).concat([{n: mstrmojo.desc(8027),v: util.PRJ_AUTHEN_TRUSTED}]),//"Trusted"    
                           
      /**
      * mobile server type
      */                    
       srvType = [{n: mstrmojo.desc(7787),v: util.SRV_ASP},     //'ASP.NET'
                  {n: mstrmojo.desc(7788),v: util.SRV_J2EE}],   //'J2EE'
                                                          
       /**
        * request type
        */
       reqType = [{n: mstrmojo.desc(7785),v: util.REQ_HTTP},    //'HTTP'
                  {n: mstrmojo.desc(7786),v: util.REQ_HTTPS}];  //'HTTPS'
      
    //UI
    mstrmojo.connect_tab = mstrmojo.insert({
        scriptClass: "mstrmojo.Table",
        id: "connect_tab",
        n: mstrmojo.desc(7768),    //"Connectivity Settings"
        
        model: null,
        layout: [{cells: [{}]},
                 {cells: [{}]}, 
                 {cells: [{}]}, 
                 {cells: [{}]}],
        bindings: {
            isAndroid: 'this.model.data.dt==3 || this.model.data.dt==4',
            isBlackberry: 'this.model.data.dt==5'
        },
        children: [
                {
                    slot: "0,0",
                    scriptClass: "mstrmojo.FieldSet",
                    legend: mstrmojo.desc(7775),          //"Default Mobile Server Authentication: "
                    cssClass: "mstrmojo-FieldSet-noborder",
                    cssText: "margin:8px 0px 0px 0px;width:500px",
                    children: [ 
                    {
                        scriptClass: "mstrmojo.Table",
                        rows: 5,
                        cols: 2,
                        children: [ 
                                //"Authentication Mode:"
                                util.propertyName(mstrmojo.desc(7776), "0,0", "width:200px"),
                                {
                                    slot: "0,1",
                                    scriptClass: "mstrmojo.SelectBox",
                                    showItemTooltip: true,
                                    cssClass: "mobileconfig-SelectBox",
                                    size: 1,
                                    items: srvAuthenMode,
                                    bindings: {
                                        selectedItem: "{v:this.parent.parent.parent.model.data.cty.wsdc.am}"
                                    },
                                    onchange: function() {
                                        var wsdc = this.parent.parent.parent.model.data.cty.wsdc;
                                        if (wsdc) {
                                            if (!wsdc.set){
                                                _H.make(wsdc, mstrmojo.Obj);
                                            }
                                            wsdc.set("am",this.selectedItem.v);
                                        }
                                    }
                                },
                                //"Login:"
                                util.propertyName(mstrmojo.desc(2763),"1,0", '', {visible: "!(this.parent.parent.parent.model.data.cty.wsdc.am===1)"}),
                                {
                                    slot: "1,1",
                                    scriptClass: "mstrmojo.TextBox",
                                    cssClass: "mobileconfig-TextBox",
                                    bindings: {
                                        value: "this.parent.parent.parent.model.data.cty.wsdc.lo",
                                        visible: "!(this.parent.parent.parent.model.data.cty.wsdc.am===1)"//util.AUTHEN_ANONY
                                    },
                                    onvalueChange: function(evt) {
                                        if (this.parent.parent.parent.model) {
                                            util.setValidValue(this.parent.parent.parent.model.data.cty.wsdc, 'lo', this.value);
                                        }
                                    }
                                },
                                //"Password:"
                                util.propertyName(mstrmojo.desc(1162), "2,0", '', {visible: "!(this.parent.parent.parent.model.data.cty.wsdc.am===1)"}),
                                {
                                    slot: "2,1",
                                    scriptClass: "mstrmojo.TextBox",
                                    cssClass: "mobileconfig-TextBox",
                                    tooltip: mstrmojo.desc(7847),
                                    type: "password",
                                    bindings: {
                                        value: "this.parent.parent.parent.model.data.cty.wsdc.ps",
                                        visible: "!(this.parent.parent.parent.model.data.cty.wsdc.am===1)"//util.AUTHEN_ANONY
                                    },
                                    onvalueChange: function() {
                                        if (this.parent.parent.parent.model) {
                                            util.setValidValue(this.parent.parent.parent.model.data.cty.wsdc, 'ps', this.value);
                                        }
                                    }
                                },
                                {
                                    slot: "3,1",
                                    scriptClass: "mstrmojo.Label",
                                    text: mstrmojo.desc(7847),
                                    bindings: {
                                        visible: "!(this.parent.parent.parent.model.data.cty.wsdc.am===1)"
                                    }
                                },
                                {
                                    slot: "4,1",
                                    scriptClass: "mstrmojo.CheckBox",
                                    cssClass: "mobileconfig-CheckBox",
                                    label: mstrmojo.desc(8269), //'Overwrite user-specified credentials when applying configuration',     
                                    bindings: {
                                        checked: "this.parent.parent.parent.model.data.cty.wsdc.ow",
                                        visible: "!(this.parent.parent.parent.model.data.cty.wsdc.am===1)"
                                    },
                                    oncheckedChange: function() {
                                        if (this.parent.parent.parent.model) {
                                            this.parent.parent.parent.model.data.cty.wsdc.ow = this.checked;
                                        }
                                    }
                                }
                           ]
                    } ]
                },
                {
                    slot: "1,0",
                    scriptClass: "mstrmojo.WidgetList",
                    cssText: "margin:5px 20px 5px 0px;width: 540px",
                    listSelector: mstrmojo.ListSelector,
                    alias: "srvList",
                    makeObservable: true,
                    renderOnScroll: _D.isIE? false : true,
                    // validate the model when add/remove a server
                    onadd: function(){
                        this.parent.model.set("validFlag", false);
                    },
                    onremove: function(){
                        this.parent.model.validate();
                    },
                    bindings: {
                        items: "this.parent.model.data.cty.wsl"
                    },
                    itemFunction: function(item, idx, w) {
                        _H.make(item, mstrmojo.Obj);
                        if (item.pl){
	                        for (var i = 0; i < item.pl.length; i++){
	                        	var prj = item.pl[i];
	                        	prj.pdn = prj.sn + prj.pid ;
	                        	if (prj.rtf) {
	                        	    _H.make(prj.rtf, mstrmojo.Obj);
	                        	}
	                        }
                        }
                        var srvConfig = new mstrmojo.Panel(
                                {
                                        item: item,
                                        parent: w,
                                        showTitlebar: true,
                                        state: 1,
                                        delText: mstrmojo.desc(7791),
                                        ttlTxtCssText: "width:320px",
                                        bindings: {
                                            title: "(!this.item.nm)?'"+mstrmojo.desc(7904)+"':this.item.nm"
                                        },
                                        postCreate: function() {
                                            this.getAvailablePrjs();
                                        },
                                        customDel: function() {
                                            delete this.item;
                                            this.destroy();//garbage clean
                                        },
                                        /*
                                         * This method processes the project data retrieved from a Mobile Server and use that to populate the project dropdown
                                         * @param {Array} v A list sent back from the webserver containing all the I-server info.
                                         * @param {Boolean} [createPrj]  An optional flag specifying whether we need a shell project to be populated after the projects
                                         *                               info is retrieved. 
                                         */
                                        updatePrjList: function(v, createPrj) {
                                            
                                            if (v && v.length === 0){
                                                this.set("prjItems", []);
                                                this.toggleNoPrjMsg(true);
                                                this.syncPrjList();
                                            } else if(v){
                                                var items = [];
                                                    
                                                for (var i = 0, len = v.length; i < len; i++) {
                                                     for(var j = 0, pip = v[i].projects, plen = pip.length; j < plen; j++) {
                                                         var p = pip[j],
                                                         vi = v[i];
                                                         items.push({n:p.name, svr:vi, pid: p.id, pdn: (vi.name +p.id)});
                                                    }
                                                }
                                                
                                                this.set("prjItems", items);
                                                this.toggleNoPrjMsg(false);
                                                this.syncPrjList();
                                                if(createPrj) {
                                                   this.newProject();    //adding the first project to the newly configured Mobile Server
                                                }
                                            } else {
                                                delete this.prjItems;
                                                this.toggleNoPrjMsg(true);
                                                this.syncPrjList();
                                            }
                                        },
                                        
                                        syncPrjList: function(){
                                            if(this.item) {
                                                var configured = this.item.pl, available = this.prjItems;
                                                if(!configured || configured.length === 0) {
                                                   return;
                                                }
                                                if(!available || available.length === 0) {
                                                    for(var i = 0, len = configured.length; i<len; i++){
                                                        _H.make(configured[i], mstrmojo.Obj);
                                                        configured[i].set("dead", true);
                                                    }
                                                } else{
                                                    for(var j = 0, xlen = configured.length; j<xlen; j++) {
                                                        _H.make(configured[j], mstrmojo.Obj);
                                                       configured[j].set("dead", (mstrmojo.array.find(available, "pdn", configured[j].pdn) === -1));
                                                    }
                                                }
                                                this.children[0].prjList.set("items", this.item.pl);
                                            }
                                        },
                                        
                                        toggleNoPrjMsg: function(display){
                                           if(this.children && this.children[0]){
                                              this.children[0].getPrj.noPrjMsg.set("visible", display);
                                           }
                                        },
                                        
                                        /**
                                         * This method retrieves (and caches) the default project setting from the Mobile Server, and use it 
                                         * as a template to create new project
                                         */
                                        newProject: function(){
                                            if (!this.parent.parent.model.defaultPrj){
                                                var me = this;
                                                this.parent.parent.model.getDefaultConfig(util.DEFAULT_PROJECT, 
                                                    function(response){
                                                        me.parent.parent.model.defaultPrj = response;
                                                        me.newProject();
                                                    });
                                            }else if (this.children[0].prjList) {
                                                var newPrj = _H.clone(this.parent.parent.model.defaultPrj);
                                              _H.make(newPrj, mstrmojo.Obj);
                                              newPrj.pid = this.prjItems[0].pid;
                                              newPrj.pn = this.prjItems[0].n;
                                              newPrj.sn = this.prjItems[0].svr.name;
                                              newPrj.pdn = newPrj.sn + newPrj.pid;
                                              this.children[0].prjList.add([newPrj], -1);
                                          }
                                        },
                                        /**
                                         * The flag that indicates we are in the waiting process of projects retrieval. Mobile Server related information
                                         * shall remain un-editable at this point
                                         */
                                        wait: false,
                                        /**
                                         * This method retrieves the projects available for configuration at a given Mobile Server
                                         * @param {Boolean} [createPrj]  An optional flag specifying whether we need a shell project to be populated after the projects
                                         *                               info is retrieved. 
                                         */
                                        getAvailablePrjs: function(createPrj) {
                                            if(!item.po || !this.item.nm || !this.item.pt) {
                                                return;
                                            }
                                            //clear out
                                            delete this.prjItems;
                                            
                                            this.set("wait", true); 
                                            
                                            var that = this;    
                                            mstrmojo.xhr.request("GET", 
                                                    mstrConfig.taskURL,
                                                     {
                                                       success: function(response){
                                                           if (response) {
                                                               that.updatePrjList(response.servers, createPrj);
                                                           } else {
                                                               that.updatePrjList([]);       //no projects to be configured on the Mobile Server
                                                           }
                                                           that.set("wait", false);
                                                       },
                                                       failure: function(response){
                                                           var err = response.getResponseHeader('X-MSTR-TaskFailureMsg');
                                                           if (response.status === 404 ) { // no connection to this Mobile Server
                                                               err = mstrmojo.desc(7992).replace(/##/, that.item.nm);
                                                           }
                                                           
                                                           util.showErrorMsgBox(err);
                                                           that.toggleNoPrjMsg(true);
                                                           that.syncPrjList();
                                                           that.set("wait", false);
                                                       },
                                                       timeout: function(){
                                                           var err = mstrmojo.desc(973).replace(/:/, ''); //Request timeout
                                                           util.showErrorMsgBox(err);
                                                           that.toggleNoPrjMsg(true);
                                                           that.syncPrjList();
                                                           that.set("wait", false);
                                                       }
                                                     },
                                                     {
                                                        taskId:"getProjects",
                                                        taskEnv: "xhr",                       // do we have double byte project name?
                                                        localeID: mstrApp.displayLocaleId,    //use the browser locale to retrieve metadata
                                                        dataFlag:2                                 //we only need name, not description
                                                     },
                                                     null,
                                                     util.getWebSrvUrl(this.item));
                                        },
                                        children: [ 
                                        {
                                            scriptClass: "mstrmojo.Table",
                                            cssText: "margin:5px 0px 0px 0px",
                                            layout: [{cells: [{cssText:"vertical-align:top;width:200px"}, {},{}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{colSpan: 2}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{}, {}]}, 
                                                       {cells: [{colSpan: 2}]},
                                                       {cells: [{colSpan: 2}]}, 
                                                       {cells: [{colSpan: 2}]},
                                                       {cells: [{colSpan: 2}]}],
                                            children: [
                                                    //"Mobile Server Name:"
                                                    util.propertyName(mstrmojo.desc(7780), "0,0", "width:200px"),
                                                    {
                                                        slot: "0,1",
                                                        scriptClass: "mstrmojo.ValidationTextBox",
                                                        alias: "wsNmVTB",
                                                        cssClass: "mobileconfig-TextBox",
                                                        required: true,
                                                        dtp: _DTP.CHAR,
                                                        constraints: {
                                                            trigger: _TR.ALL
                                                        },
                                                        validationStatus: {id: this.id, code : mstrmojo.validation.STATUSCODE.VALID, msg: ''},
                                                        bindings: {
                                                            value: "this.parent.parent.item.nm",
                                                            enabled: "(!this.parent.parent.prjItems || this.parent.parent.prjItems.length === 0) &&!this.parent.parent.wait"
                                                        },
                                                        onValid: function() {
                                                           util.setValidValue(this.parent.parent.item,'nm',  this.value, true);
                                                           this.parent.parent.parent.parent.model.validate();
                                                        },
                                                        onInvalid: function() {
                                                            if (this.parent.parent.parent.parent.model) {
                                                                this.parent.parent.parent.parent.model.set("validFlag", false);
                                                            }
                                                        }
                                                    },
                                                    {
                                                        slot: "0,1",
                                                        scriptClass: "mstrmojo.Label",
                                                        text: mstrmojo.desc(7846)
                                                  },
                                                  {
                                                      slot:"0,2",
                                                      scriptClass : "mstrmojo.Label",
                                                      bindings: {
                                                          show: "this.parent.parent.wait"
                                                      },
                                                      onshowChange: function() {
                                                          this.set("cssText", this.show? "position:relative;right:200px;top:30px;z-idex:999;width:50px" : "width:25px");
                                                          this.set("cssClass", this.show? "waitIcon" : "");
                                                          this.refresh();
                                                      }
                                                  },
                                                  //"Mobile Server Port:"
                                                  util.propertyName(mstrmojo.desc(7781), "1,0"),
                                                  {
                                                      slot: "1,1",
                                                      scriptClass: "mstrmojo.ValidationTextBox",
                                                      alias: "wsPoVTB",
                                                      cssClass: "mobileconfig-TextBox",
                                                      required: true,
                                                      dtp: _DTP.INTEGER,
                                                      constraints: {
                                                          trigger: _TR.ALL,
                                                          validator: function(v) {
                                                              return util.generalValidator(v, this.dtp,util.validatePort, 
                                                                      mstrmojo.desc(7839).replace(/###/, 65535).replace(/##/, 0));
                                                          }
                                                      },
                                                      bindings: {
                                                          value: "this.parent.parent.item.po",
                                                          enabled: "(!this.parent.parent.prjItems || this.parent.parent.prjItems.length === 0)&&!this.parent.parent.wait"
                                                      },
                                                      validationStatus: {id: this.id, code : mstrmojo.validation.STATUSCODE.VALID, msg: ''},
                                                      onValid: function() {
                                                          util.setValidValue(this.parent.parent.item, 'po', this.value, true);
                                                          this.parent.parent.parent.parent.model.validate();
                                                      },
                                                      onInvalid: function() {
                                                          this.parent.parent.set("prjItems", undefined);
                                                          if (this.parent.parent.parent.parent.model) {
                                                              this.parent.parent.parent.parent.model.set("validFlag", false);
                                                          }
                                                      }
                                                  },
                                                //"Mobile Server Path:"
                                                  util.propertyName(mstrmojo.desc(7782), "2,0"),
                                                  {
                                                      slot: "2,1",
                                                      scriptClass: "mstrmojo.ValidationTextBox",
                                                      alias: "wsPtVTB",
                                                      cssClass: "mobileconfig-TextBox",
                                                      required: true,
                                                      dtp: _DTP.CHAR,
                                                      constraints: {
                                                          trigger: _TR.ALL
                                                      },
                                                      bindings: {
                                                          value: "this.parent.parent.item.pt",
                                                          enabled: "(!this.parent.parent.prjItems || this.parent.parent.prjItems.length === 0)&&!this.parent.parent.wait"
                                                      },
                                                      validationStatus: {id: this.id, code : mstrmojo.validation.STATUSCODE.VALID, msg: ''},
                                                      onValid: function() {
                                                          util.setValidValue(this.parent.parent.item, 'pt', this.value, true);
                                                          this.parent.parent.parent.parent.model.validate();
                                                      },
                                                      onInvalid: function() {
                                                          this.parent.parent.set("prjItems", undefined);
                                                          if (this.parent.parent.parent.parent.model) {
                                                              this.parent.parent.parent.parent.model.set("validFlag", false);
                                                          }
                                                      }
                                                  },
                                                  //"Mobile Server Type:"
                                                  util.propertyName(mstrmojo.desc(7783), "3,0"),
                                                  {
                                                      slot: "3,1",
                                                      scriptClass: "mstrmojo.SelectBox",
                                                      showItemTooltip: true,
                                                      cssClass: "mobileconfig-SelectBox",
                                                      size: 1,
                                                      items: srvType,
                                                      bindings: {
                                                          selectedItem: "{v:this.parent.parent.item.ty}",
                                                          enabled: "(!this.parent.parent.prjItems || this.parent.parent.prjItems.length === 0)&&!this.parent.parent.wait"
                                                      },
                                                      onchange: function() {
                                                          this.parent.parent.item.ty = this.selectedItem.v;
                                                      }
                                                  },
                                                  //"Request Type:"
                                                  util.propertyName(mstrmojo.desc(7784), "4,0"),
                                                  {
                                                      slot: "4,1",
                                                      scriptClass: "mstrmojo.SelectBox",
                                                      showItemTooltip: true,
                                                      cssClass: "mobileconfig-SelectBox",
                                                      size: 1,
                                                      items: reqType,
                                                      bindings: {
                                                          selectedItem: "{v:this.parent.parent.item.rt}",
                                                          enabled: "(!this.parent.parent.prjItems || this.parent.parent.prjItems.length === 0)&&!this.parent.parent.wait"
                                                      },
                                                      onchange: function() {
                                                          this.parent.parent.item.rt = this.selectedItem.v;
                                                      }
                                                  },
                                                    {
                                                        slot: "5,0",
                                                        scriptClass: "mstrmojo.CheckBox",
                                                        cssClass: "mobileconfig-CheckBox",
                                                        label: mstrmojo.desc(7789),        //"Use Default Authentication"
                                                        bindings: {
                                                            checked: "this.parent.parent.item.udc"
                                                        },
                                                        oncheckedChange: function() {
                                                            this.parent.parent.item.set("udc", this.checked);
                                                        }
                                                    },
                                                    //"Authentication Mode:"
                                                    util.propertyName(mstrmojo.desc(7776), "6,0"),
                                                    {
                                                        slot: "6,1",
                                                        scriptClass: "mstrmojo.SelectBox",
                                                        showItemTooltip: true,
                                                        cssClass: "mobileconfig-SelectBox",
                                                        size: 1,
                                                        items: srvAuthenMode,
                                                        bindings: {
                                                            selectedItem: "{v:this.parent.parent.item.wsc.am}",
                                                            enabled: "!this.parent.parent.item.udc"
                                                        },
                                                        onchange: function() {
                                                            var wsc = this.parent.parent.item.wsc;
                                                            if(wsc){
                                                                if (!wsc.set){
                                                                    _H.make(wsc, mstrmojo.Obj);
                                                                }
                                                                wsc.set("am", this.selectedItem.v);
                                                            }
                                                        }
                                                    },
                                                    //"Login:"
                                                    util.propertyName(mstrmojo.desc(2763), "7,0", '', { visible :  "!this.parent.parent.item.udc&&!(this.parent.parent.item.wsc.am===1)"}),
                                                    {
                                                        slot: "7,1",
                                                        scriptClass: "mstrmojo.TextBox",
                                                        cssClass: "mobileconfig-TextBox",
                                                        bindings: {
                                                            value: "this.parent.parent.item.wsc.lo",
                                                            visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.wsc.am===1)"//util.AUTHEN_ANONY
                                                        },
                                                        onvalueChange: function() {
                                                            util.setValidValue(this.parent.parent.item.wsc, 'lo', this.value);
                                                        }
                                                    },
                                                    //"Password:"
                                                    util.propertyName(mstrmojo.desc(1162),"8,0", '', { visible :  "!this.parent.parent.item.udc&&!(this.parent.parent.item.wsc.am===1)"}),
                                                    {
                                                        slot: "8,1",
                                                        scriptClass: "mstrmojo.TextBox",
                                                        cssClass: "mobileconfig-TextBox",
                                                        tooltip: mstrmojo.desc(7847),
                                                        type: "password",
                                                        bindings: {
                                                            value: "this.parent.parent.item.wsc.ps",
                                                            visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.wsc.am===1)"//util.AUTHEN_ANONY
                                                        },
                                                        onvalueChange: function() {
                                                            util.setValidValue(this.parent.parent.item.wsc, 'ps', this.value);
                                                        }
                                                    },
                                                    {
                                                        slot: "9,1",
                                                        scriptClass: "mstrmojo.Label",
                                                        text: mstrmojo.desc(7847),
                                                        bindings: {
                                                            visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.wsc.am===1)"
                                                        }
                                                    },
                                                    {
                                                        slot: "10,1",
                                                        scriptClass: "mstrmojo.CheckBox",
                                                        cssClass: "mobileconfig-CheckBox",
                                                        label: mstrmojo.desc(8269),// 'Overwrite user-specified credentials when applying configuration',     
                                                        bindings: {
                                                            checked: "this.parent.parent.item.wsc.ow",
                                                            visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.wsc.am===1)"
                                                        },
                                                        oncheckedChange: function() {
                                                            if (this.parent.parent.item) {
                                                                this.parent.parent.item.wsc.ow = this.checked;
                                                            }
                                                        }
                                                    },
                                                    {
                                                        slot: "11,0",
                                                        scriptClass: "mstrmojo.FieldSet",
                                                        cssClass: "mstrmojo-FieldSet-noborder",
                                                        cssText: "margin:8px 0px 0px 0px;width:500px",
                                                        legend: mstrmojo.desc(7796),        //"Default Project Authentication:"
                                                        children: [ 
                                                         {
                                                                scriptClass: "mstrmojo.Table",
                                                                rows: 5,
                                                                cols: 2,
                                                                bindings: {
                                                                    svrItem: "this.parent.parent.parent.item"
                                                                },
                                                                children: [
                                                                        //"Authentication Mode:"
                                                                        util.propertyName(mstrmojo.desc(7776), "0,0", "width:200px"),
                                                                        {
                                                                            slot: "0,1",
                                                                            scriptClass: "mstrmojo.SelectBox",
                                                                            showItemTooltip: true,
                                                                            cssClass: "mobileconfig-SelectBox",
                                                                            size: 1,
                                                                            bindings: {
                                                                                selectedItem: "{v:this.parent.svrItem.pdc.am}"
                                                                            },
                                                                            items: mstrmojo.all.connect_tab.isAndroid ? androidPrjAuthenMode : prjAuthenMode,
                                                                            onchange: function() {
                                                                                var pdc = this.parent.svrItem.pdc;
                                                                                if (pdc) {
                                                                                    if (!pdc.set){
                                                                                        _H.make(pdc, mstrmojo.Obj);
                                                                                    }
                                                                                    pdc.set("am", this.selectedItem.v);
                                                                                }
                                                                            }
                                                                        },
                                                                        //"Login:"
                                                                        util.propertyName(mstrmojo.desc(2763), "1,0", '', {visible: "!(this.parent.svrItem.pdc.am===2)&&!(this.parent.svrItem.pdc.am===64)"}),
                                                                        {
                                                                            slot: "1,1",
                                                                            scriptClass: "mstrmojo.TextBox",
                                                                            cssClass: "mobileconfig-TextBox",
                                                                            bindings: {
                                                                                value: "this.parent.svrItem.pdc.lo",
                                                                                visible: "!(this.parent.svrItem.pdc.am===2)&&!(this.parent.svrItem.pdc.am===64)"//PRJ_AUTHEN_WIN
                                                                            },
                                                                            onvalueChange: function() {
                                                                                util.setValidValue(this.parent.svrItem.pdc, 'lo', this.value);
                                                                            }
                                                                        },
                                                                        //"Password:"
                                                                        util.propertyName(mstrmojo.desc(1162),"2,0", '', {visible: "!(this.parent.svrItem.pdc.am===2)&&!(this.parent.svrItem.pdc.am===64)"}),
                                                                        {
                                                                            slot: "2,1",
                                                                            scriptClass: "mstrmojo.TextBox",
                                                                            cssClass: "mobileconfig-TextBox",
                                                                            tooltip: mstrmojo.desc(7847),
                                                                            type: "password",
                                                                            bindings: {
                                                                                value: "this.parent.svrItem.pdc.ps",
                                                                                visible: "!(this.parent.svrItem.pdc.am===2)&&!(this.parent.svrItem.pdc.am===64)"//PRJ_AUTHEN_WIN
                                                                            },
                                                                            onvalueChange: function() {
                                                                                util.setValidValue(this.parent.svrItem.pdc, 'ps', this.value);
                                                                            }
                                                                        },
                                                                        {
                                                                            slot: "3,1",
                                                                            scriptClass: "mstrmojo.Label",
                                                                            cssText: "margin-bottom:5px",
                                                                            text: mstrmojo.desc(7847),
                                                                            bindings: {
                                                                                visible: "!(this.parent.svrItem.pdc.am===2)&&!(this.parent.svrItem.pdc.am===64)"
                                                                            }
                                                                        },
                                                                        {
                                                                            slot: "4,1",
                                                                            scriptClass: "mstrmojo.CheckBox",
                                                                            cssClass: "mobileconfig-CheckBox",
                                                                            label:  mstrmojo.desc(8269),//'Overwrite user-specified credentials when applying configuration',     
                                                                            bindings: {
                                                                                checked: "this.parent.svrItem.pdc.ow",
                                                                                visible: "!(this.parent.svrItem.pdc.am===2)&&!(this.parent.svrItem.pdc.am===64)"
                                                                            },
                                                                            oncheckedChange: function() {
                                                                                if (this.parent.svrItem) {
                                                                                    this.parent.svrItem.pdc.ow = this.checked;
                                                                                }
                                                                            }
                                                                        }
                                                                        ]
                                                             } ]
                                                    },
                                                    {
                                                        slot: "12,0",
                                                        scriptClass: "mstrmojo.WidgetList",
                                                        alias: "prjList",
                                                        cssText: "width:500px",
                                                        listSelector: mstrmojo.ListSelector,
                                                        makeObservable: true,
                                                        renderOnScroll: false,
                                                        bindings: {
                                                            items: "this.parent.parent.item.pl"
                                                        },  
                                                        itemFunction: function(item, idx, w) {
                                                            _H.make(item, mstrmojo.Obj);
                                                            
                                                             var itmStr = 'this.parent.parent.parent.item',
                                                             pStr= 'this.parent.parent.parent.parent.parent.parent.prjItems';
                                                            
                                                            var prjConfig = new mstrmojo.Panel(
                                                               {
                                                                        item: item,
                                                                        cssText: "margin-top:10px",
                                                                        parent: w,
                                                                        showTitlebar: true,
                                                                        state: 1,
                                                                        delText: mstrmojo.desc(7880),
                                                                        bindings: {
                                                                            title: "this.item.title"
                                                                        },
                                                                        customDel: function() {
                                                                            delete this.item;
                                                                            this.destroy();//garbage clean
                                                                        },
                                                                        children: [
                                                                        {
                                                                                    scriptClass: "mstrmojo.Table",
                                                                                    cssClass: "greyBorder",
                                                                                    cssText: "width:500px",
                                                                                    layout: [{cssText: "margin-left:5px", cells: [{cssText: "width:200px"}, {}]}, 
                                                                                             {cells: [{colSpan:2}]}, 
                                                                                             {cells: [{}, {}]}, 
                                                                                             {cells: [{colSpan:2}]}, 
                                                                                             {cells: [{}, {}]}, 
                                                                                             {cells: [{}, {}]}, 
                                                                                             {cells: [{}, {}]}, 
                                                                                             {cells: [{}, {}]}, 
                                                                                             {cells: [{}, {}]}, 
                                                                                             {cells: [{}, {}]}, 
                                                                                             {cells: [{}, {}]}],
                                                                                    children: [
                                                                                          util.propertyName(mstrmojo.desc(2930), "0,0", "margin-left:15px;width:170px"),
                                                                                          {
                                                                                                  slot: "0,1",
                                                                                                  scriptClass: "mstrmojo.HBox",
                                                                                                  children:[
                                                                                                       {
                                                                                                          scriptClass: "mstrmojo.SelectBox",
                                                                                                          showItemTooltip: true,
                                                                                                          cssClass: "mobileconfig-SelectBox",
                                                                                                          size: 1,
                                                                                                          itemIdField: "pdn",
                                                                                                          showOptTitle: true,
                                                                                                          getItemName: function(item, idx) {
                                                                                                                  return (item.svr)? item.n + " (" + item.svr.name + ")":item.pn + " (" + item.sn+ ")";
                                                                                                          },

                                                                                                          bindings: {
                                                                                                                  enabled:'!' + itmStr + '.dead',
                                                                                                                  items: '(' + itmStr + '.dead)? [' + itmStr + ']:' + pStr,
                                                                                                                  selectedItem: '{pdn:((' + itmStr+ '.pid)? (' + itmStr+ '.sn + ' + itmStr+ '.pid):' + pStr+ '[0].pdn)}'
                                                                                                          },
                                                                                                          onchange: function(){
                                                                                                                  var mIt = this.parent.parent.parent.item;
                                                                                                                  if (mIt) {
                                                                                                                      if (this.selectedItem && this.selectedItem.svr) {
                                                                                                                          mIt.pn = this.selectedItem.n;
                                                                                                                          mIt.sn = this.selectedItem.svr.name;
                                                                                                                          mIt.sp = this.selectedItem.svr.port;
                                                                                                                          mIt.pid = this.selectedItem.pid;
                                                                                                                          mIt.pdn = this.selectedItem.pdn;
                                                                                                                      }
                                                                                                                      mIt.set("title", mIt.pn+" ("+mIt.sn+")");
                                                                                                                  }
                                                                                                         }
                                                                                                       },
                                                                                                       {
                                                                                                          slot: "0,1",
                                                                                                          scriptClass: "mstrmojo.Label",
                                                                                                          cssText: "color:red;margin-left:5px",
                                                                                                          bindings: {
                                                                                                              visible: itmStr + '.dead === true'
                                                                                                          },
                                                                                                          text:mstrmojo.desc(7853)
                                                                                                       }
                                                                                                  ]
                                                                                          },
                                                                                          {
                                                                                                    slot: "1,0",
                                                                                                    scriptClass: "mstrmojo.CheckBox",
                                                                                                    cssClass: "mobileconfig-CheckBox",
                                                                                                    cssText: "margin-left:11px",
                                                                                                    label: mstrmojo.desc(7789),    //"Use Default Authentication"
                                                                                                    bindings: {
                                                                                                        checked: "this.parent.parent.item.udc"
                                                                                                    },
                                                                                                    oncheckedChange: function() {
                                                                                                       this.parent.parent.item.set("udc",  this.checked);
                                                                                                    }
                                                                                            },
                                                                                            //Use root folder:
                                                                                            {
                                                                                                slot: "2,0",
                                                                                                alias: "customRtf",
                                                                                                scriptClass: "mstrmojo.CheckBox",
                                                                                                cssText: "margin-left: 11px",
                                                                                                label: mstrmojo.desc(8074),
                                                                                                bindings:{
                                                                                                    checked: "!!this.parent.parent.item.rtf.oi",
                                                                                                    visible: 'mstrmojo.all.connect_tab.model.data.dt!=5' //not BlackBerrry
                                                                                                },
                                                                                                onclick: function(){
                                                                                                    var proj = this.parent.parent.item;
                                                                                                    if (this.checked){ // if this option is to be checked, restore the previous value
                                                                                                        proj.rtf = this.prevRtf;
                                                                                                    }else{
                                                                                                        this.prevRtf = proj.rtf; // remember the last value
                                                                                                        proj.rtf = {}; // not to raise an event
                                                                                                    }
                                                                                                }
                                                                                            },
                                                                                            {
                                                                                                scriptClass: "mstrmojo.HBox",
                                                                                                slot: "2,1",
                                                                                                bindings: {
                                                                                                    visible: 'mstrmojo.all.connect_tab.model.data.dt!=5' //not BlackBerrry
                                                                                                },
                                                                                                children: [                                                                               
                                                                                                     {
                                                                                                        scriptClass: "mstrmojo.TextBox",
                                                                                                        cssClass: "mobileconfig-TextBox",
                                                                                                        readOnly: true,
                                                                                                        bindings: {
                                                                                                            enabled: "this.parent.parent.customRtf.checked",
                                                                                                            value: "this.parent.parent.parent.item.rtf.oi.pt"
                                                                                                        }
                                                                                                    },
                                                                                                    util.createObjBrowserDropdown({
                                                                                                         reuseSession: true,
                                                                                                         browsableTypes: "8",
                                                                                                         targetType: "rtf",
                                                                                                         bindings:{
                                                                                                             enabled: "this.parent.parent.customRtf.checked",
                                                                                                             target: "this.parent.parent.parent.item"
                                                                                                         }
                                                                                                    })
                                                                                                ]
                                                                                            },
                                                                                            {
                                                                                            	slot: "3,0",
                                                                                            	scriptClass: "mstrmojo.CheckBox",
                                                                                            	cssText: "margin-left:11px",
                                                                                            	label: mstrmojo.desc(8286), //"Treat project content as confidential"
                                                                                            	bindings:{
                                                                                            		checked: "this.parent.parent.item.cd",
                                                                                            		visible: "!mstrmojo.all.connect_tab.isAndroid&&mstrmojo.all.connect_tab.model.data.dt!=5"
                                                                                            	},
                                                                                            	onclick: function(){
                                                                                            		util.setValidValue(this.parent.parent.item, "cd", this.checked, true);
                                                                                            	}
                                                                                            },
                                                                                            {
                                                                                            	slot: "4,0",
                                                                                            	scriptClass: "mstrmojo.CheckBox",
                                                                                            	cssText: "margin-left:25px",
                                                                                            	label: mstrmojo.desc(8287), //"User login is case sensitive"
                                                                                            	bindings:{
                                                                                            		checked: "this.parent.parent.item.lcs",
                                                                                            		enabled: "this.parent.parent.item.cd",
                                                                                            		visible: "!mstrmojo.all.connect_tab.isAndroid&&mstrmojo.all.connect_tab.model.data.dt!=5"
                                                                                            	},
                                                                                            	onclick: function(){
                                                                                            		util.setValidValue(this.parent.parent.item, "lcs", this.checked);
                                                                                            	}
                                                                                            },
                                                                                            /*//Allow subscriptions from device
                                                                                            {
                                                                                                scriptClass: "mstrmojo.CheckBox",
                                                                                                alias: "allowSubscription",
                                                                                                slot: "3,0",
                                                                                                label: mstrmojo.desc(8075),
                                                                                                cssText: "margin-left:11px",
                                                                                                bindings:{
                                                                                                    checked: "this.parent.parent.item.asd"
                                                                                                },
                                                                                                onclick: function(){
                                                                                                    this.parent.parent.item.set("asd", this.checked);
                                                                                                    if(mstrmojo.all.mobileConfig){
                                                                                                        mstrmojo.all.mobileConfig.validate();
                                                                                                    }
                                                                                                }
                                                                                            },
                                                                                            //Use subscription schedule:
                                                                                            {
                                                                                                slot: "4,0",
                                                                                                scriptClass: "mstrmojo.CheckBox",
                                                                                                alias: "useSchedule",
                                                                                                cssText: "margin-left: 11px",
                                                                                                label: mstrmojo.desc(8076),
                                                                                                bindings:{
                                                                                                    checked: "this.parent.allowSubscription.checked || !!this.parent.parent.item.sc.oi",
                                                                                                    enabled: "!this.parent.allowSubscription.checked"
                                                                                                },
                                                                                                oncheckedChange: function(){
                                                                                                    var proj = this.parent.parent.item;
                                                                                                    if (this.checked && proj.sc === undefined){ // if this option is to be checked, restore the previous value
                                                                                                        proj.sc = this.prevSc;
                                                                                                    }else if (!this.checked){
                                                                                                        this.prevSc = proj.sc; // remember the last value
                                                                                                        proj.sc = undefined; // not to raise an event
                                                                                                    }
                                                                                                }
                                                                                            },
                                                                                            {
                                                                                                scriptClass: "mstrmojo.HBox",
                                                                                                slot: "4,1",
                                                                                                children: [
                                                                                                    {
                                                                                                        scriptClass: "mstrmojo.ValidationTextBox", 
                                                                                                        cssClass: "mobileconfig-TextBox",
                                                                                                        readOnly: true,
                                                                                                        dtp: mstrmojo.expr.DTP.VARCHAR,
                                                                                                        constraints: {trigger:mstrmojo.validation.TRIGGER.ALL},
                                                                                                        bindings: {
                                                                                                            enabled: "this.parent.parent.useSchedule.checked",
                                                                                                            value: "this.parent.parent.parent.item.sc.oi.n",
                                                                                                            required: "this.enabled && this.parent.parent.allowSubscription.checked"
                                                                                                        },
                                                                                                        onrequiredChange: function(){
                                                                                                            this.validate();
                                                                                                            if (!this.required){
                                                                                                                this.onValid();
                                                                                                            }
                                                                                                        },
                                                                                                        onValid: function(){
                                                                                                            if (mstrmojo.all.mobileConfig){
                                                                                                                mstrmojo.all.mobileConfig.validate();
                                                                                                            }
                                                                                                        },
                                                                                                        onInvalid: function(){
                                                                                                            if (mstrmojo.all.mobileConfig){
                                                                                                                mstrmojo.all.mobileConfig.set("validFlag", false);
                                                                                                            }
                                                                                                        }
                                                                                                    },
                                                                                                    util.createTriggerListDropdown({
                                                                                                         targetType: "sc",
                                                                                                         reuseSession: true,
                                                                                                         bindings:{
                                                                                                             enabled: "this.parent.parent.useSchedule.checked",
                                                                                                             target: "this.parent.parent.parent.item"
                                                                                                         }
                                                                                                    })
                                                                                                ]
                                                                                            },*/
                                                                                            //"Authentication Mode:"//project
                                                                                            util.propertyName(mstrmojo.desc(7776), "5,0",  "margin-left:15px"),
                                                                                            {
                                                                                                    slot: "5,1",
                                                                                                    scriptClass: "mstrmojo.SelectBox",
                                                                                                    showItemTooltip: true,
                                                                                                    cssClass: "mobileconfig-SelectBox",
                                                                                                    size: 1,
                                                                                                    items: mstrmojo.all.connect_tab.isAndroid ? androidPrjAuthenMode : prjAuthenMode,
                                                                                                    bindings: {
                                                                                                        selectedItem: "{v:this.parent.parent.item.pc.am}",
                                                                                                        enabled: "!this.parent.parent.item.udc"
                                                                                                    },
                                                                                                    onchange: function() {
                                                                                                        var pc = this.parent.parent.item.pc;
                                                                                                        if (pc){
                                                                                                            if (!pc.set){
                                                                                                                _H.make(pc, mstrmojo.Obj);
                                                                                                            }
                                                                                                            pc.set("am", this.selectedItem.v);
                                                                                                        }
                                                                                                    }
                                                                                            },
                                                                                            //"Login:"
                                                                                            util.propertyName(mstrmojo.desc(2763), "6,0",  "margin-left:15px", {visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.pc.am===2)&&!(this.parent.parent.item.pc.am===64)"}),
                                                                                            {
                                                                                                    slot: "6,1",
                                                                                                    scriptClass: "mstrmojo.TextBox",
                                                                                                    cssClass: "mobileconfig-TextBox",
                                                                                                    bindings : {
                                                                                                        value : "this.parent.parent.item.pc.lo",
                                                                                                        visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.pc.am===2)&&!(this.parent.parent.item.pc.am===64)"//PRJ_AUTHEN_WIN
                                                                                                    },
                                                                                                    onvalueChange: function() {
                                                                                                        util.setValidValue(this.parent.parent.item.pc, 'lo', this.value);
                                                                                                    }
                                                                                            },
                                                                                            //"Password:"
                                                                                            util.propertyName(mstrmojo.desc(1162), "7,0",  "margin-left:15px",  {visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.pc.am===2)&&!(this.parent.parent.item.pc.am===64)"}),
                                                                                            {
                                                                                                    slot: "7,1",
                                                                                                    scriptClass: "mstrmojo.TextBox",
                                                                                                    cssClass: "mobileconfig-TextBox",
                                                                                                    tooltip: mstrmojo.desc(7847),
                                                                                                    type: "password",
                                                                                                    bindings: {
                                                                                                        value: "this.parent.parent.item.pc.ps",
                                                                                                        visible: "!this.parent.parent.item.udc&&!(this.parent.parent.item.pc.am===2)&&!(this.parent.parent.item.pc.am===64)"//PRJ_AUTHEN_WIN
                                                                                                    },
                                                                                                    onvalueChange: function() {
                                                                                                        util.setValidValue(this.parent.parent.item.pc, 'ps', this.value);
                                                                                                    }
                                                                                            },
                                                                                            {
                                                                                                slot: "8,1",
                                                                                                scriptClass: "mstrmojo.Label",
                                                                                                cssText: "margin-bottom:5px",
                                                                                                text: mstrmojo.desc(7847),
                                                                                                bindings: {
                                                                                                    visible:  "!this.parent.parent.item.udc&&!(this.parent.parent.item.pc.am===2)&&!(this.parent.parent.item.pc.am===64)"
                                                                                                }
                                                                                            },
                                                                                            {
                                                                                                slot: "9,1",
                                                                                                scriptClass: "mstrmojo.CheckBox",
                                                                                                cssClass: "mobileconfig-CheckBox",
                                                                                                label:  mstrmojo.desc(8269),//'Overwrite user-specified credentials when applying configuration',     
                                                                                                bindings: {
                                                                                                    checked: "this.parent.parent.item.pc.ow",
                                                                                                    visible:  "!this.parent.parent.item.udc&&!(this.parent.parent.item.pc.am===2)&&!(this.parent.parent.item.pc.am===64)"
                                                                                                },
                                                                                                oncheckedChange: function() {
                                                                                                    if (this.parent.parent.item) {
                                                                                                        this.parent.parent.item.pc.ow = this.checked;
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            
                                                                                            ]
                                                                        } ]
                                                                    });
                                                            return prjConfig;
                                                        }
                                                    }, 
                                                    {
                                                        slot: "13,0",
                                                        scriptClass: "mstrmojo.Button",
                                                        text: mstrmojo.desc(7793),        //"Configure New Project"
                                                        cssText: "text-decoration:underline;margin:8px 0px 15px 10px;color:#0000FF; font-weight: bold;",
                                                        bindings: {
                                                            visible: "this.parent.parent.prjItems && this.parent.parent.prjItems.length > 0"
                                                        },
                                                        onclick: function(evt) {
                                                           this.parent.parent.newProject();
                                                        }
                                                    },
                                                    {
                                                        slot: "14,0",
                                                        scriptClass: "mstrmojo.HBox",
                                                        alias: "getPrj",
                                                        children: [{  
                                                                scriptClass: "mstrmojo.Button",
                                                                text: mstrmojo.desc(7793),     //"Configure New Project",
                                                                cssText: "text-decoration:underline;margin:4px 0px 8px 10px;color:#0000FF; font-weight: bold;",
                                                                bindings: {
                                                                    visible: "!this.parent.parent.parent.prjItems || this.parent.parent.parent.prjItems.length === 0",
                                                                    //mstrmojo.validation.valid = 0
                                                                    enabled: "this.parent.parent.wsNmVTB.validationStatus.code== 0&&this.parent.parent.wsPoVTB.validationStatus.code== 0&&this.parent.parent.wsPtVTB.validationStatus.code== 0&& !this.parent.parent.parent.wait"
                                                                },
                                                                onclick: function(evt) {
                                                                   this.parent.parent.parent.getAvailablePrjs(true);
                                                                }
                                                             },
                                                             {
                                                                alias: "noPrjMsg",
                                                                scriptClass: "mstrmojo.Label",
                                                                cssText: "margin-left:10px",
                                                                visible: false,
                                                                text: mstrmojo.desc(7792)         //"No projects available for this Mobile Server."
                                                             }]
                                                    }   
                                                   ]
                                        }]
                                    });
                            return srvConfig;
                        }
                    }, 
                    {
                        slot: "2,0",
                        scriptClass: "mstrmojo.Button",
                        text: mstrmojo.desc(7777),      //"Configure New Mobile Server"
                        cssText: "text-decoration:underline;margin:8px 0px 8px 0px;color:#0000FF; font-weight: bold;",
                        onclick: function(evt) {
                            if (this.parent.srvList) {
                                if (!this.parent.model.defaultSrv){
                                    var me = this;
                                    this.parent.model.getDefaultConfig(util.DEFAULT_WEBSERVER, 
                                            function(response){
                                                me.parent.model.defaultSrv = response;
                                                me.onclick();
                                            });
                                }else{
                                    this.parent.srvList.add([_H.clone(this.parent.model.defaultSrv)], -1);
                                }
                            }
                        }
                    },
                    {
                        slot: "3,0",
                        scriptClass: "mstrmojo.FieldSet",
                        legend: mstrmojo.desc(8447) + ":", //"Trusted Certificates:"
                        cssClass: "mstrmojo-trustedCert-setting",
                        bindings: {
                            visible: "this.parent.model.data.dt == 3 || this.parent.model.data.dt == 4"
                        },
                        children:[
                            {
                                scriptClass: "mstrmojo.WidgetList",
                                alias: "cerList",
                                cssClass: "cert-list",
                                makeObservable: true,
                                renderOnScroll: false,
                                bindings: {
                                    items: "this.parent.parent.model.data.cty.tcs"
                                },
                                onremove: function(){
                                    this.parent.parent.model.validate();
                                },
                                itemFunction: function(item, idx, w){
                                    return new mstrmojo.HBox({
                                        cssText: "height: 22px;",
                                        children:[{
                                            scriptClass: "mstrmojo.Button",
                                            cssClass: "cert-delete",
                                            text: "x",
                                            title: mstrmojo.desc(629),
                                            onclick: function(){
                                                w.remove(item);
                                            }
                                        }, {
                                            scriptClass: "mstrmojo.ValidationTextBox",
                                            cssClass: "cert-edittext",
                                            value: item.url,
                                            constraints: {
                                                trigger: mstrmojo.validation.TRIGGER.ALL,
                                                regExp: /^http:\/\//i
                                            },
                                            dtp: _DTP.CHAR,
                                            onValid: function(){
                                                item.url = this.value;
                                                w.parent.parent.model.validate();
                                            },
                                            onInvalid: function(){
                                                delete item.url;
                                                w.parent.parent.model.set("validFlag", false);
                                            }
                                        }]
                                    });
                                }
                            },
                            {
                                scriptClass: "mstrmojo.Button",
                                text: mstrmojo.desc(8469),      //"Add new certificate"
                                cssClass: "cert-add",
//                                bindings: {
//                                    enabled: "this.parent.parent.model.validFlag"
//                                },
                                onclick: function(){
                                    this.parent.cerList.add([{url:"http://"}]);
                                }
                            }
                        ]
                    }
                ]
    });
    
})();