/**
 *  Configuration List screen, the first screen user can see, contains info about all saved configurations.
 */
(function(){   

    mstrmojo.requiresCls(
            "mstrmojo.mobileConfigUtil",
            "mstrmojo.MultiColumnListBox",
            "mstrmojo.InlineEditor",
            "mstrmojo.form",
            "mstrmojo.MCListBoxCP");
    
    //Util
    var util = mstrmojo.mobileConfigUtil,     
         _D = mstrmojo.dom,
         _H = mstrmojo.hash,
         _S = mstrmojo.string,
         _TR = mstrmojo.validation.TRIGGER,
         _DTP = mstrmojo.expr.DTP;
    
    //Local data
    var urlAuthenMode = [{n: mstrmojo.desc(7778),v: util.AUTHEN_ANONY}, 
                         {n: mstrmojo.desc(7227),v: util.AUTHEN_BASIC}, 
                         {n: mstrmojo.desc(7779),v: util.AUTHEN_WIN}],
                         
          reqType = [{n: mstrmojo.desc(7785),v: util.REQ_HTTP},    //'HTTP'
                           {n: mstrmojo.desc(7786),v: util.REQ_HTTPS}],  //'HTTPS'         
          
          deviceType = [{n: mstrmojo.desc(7725), v: util.DEVICE_IPHONE},//mstrmojo.desc(7725) iPhone
                               {n: mstrmojo.desc(7726), v: util.DEVICE_IPAD},
                               {n: mstrmojo.desc(8433), v: util.DEVICE_PHONE_UNIVERSAL},//Android Phone
                               {n: mstrmojo.desc(8434), v: util.DEVICE_TABLET_UNIVERSAL},
                               {n: mstrmojo.desc(7866), v: util.DEVICE_BLACKBERRY}];//Android Tablet
                         

    //UI
    var confListTable = new mstrmojo.MultiColumnListBox({
        slot: "0,0",
        id: "confListTable",
        n: "Configuration List",
        
        renderAllItems: true,//render all in one page
        
        model: [],//mstrmojo.all.confIndex.children
        getActBtn: function getActBtn(title, onclickStr, cssClass) {
            return '<a class = mstrLink>'
                            + '<span class="actionIcons ' + cssClass + '" title="'+title+'" onclick="' +onclickStr+ '">'
                            + '</span></a>';
        },
        genActions: function genActions() {
            return this.getActBtn(mstrmojo.desc(767), "mstrmojo.all[\'"+this.id+"\'].modifyItem(event)", "actionIcons-modify")
                        +  this.getActBtn(mstrmojo.desc(3558), "mstrmojo.all[\'"+this.id+"\'].duplicateItem(event)", "actionIcons-duplicate")
                        +  this.getActBtn(mstrmojo.desc(7826), "mstrmojo.all[\'"+this.id+"\'].urlGen(event)", "actionIcons-url")
                        +  this.getActBtn(mstrmojo.desc(3559), "mstrmojo.all[\'"+this.id+"\'].deleteItem(event)", "actionIcons-delete");
        },
        
        getDeviceName: function(deviceType) {
        	switch (deviceType) {
        		case util.DEVICE_IPHONE: return mstrmojo.desc(7725);
        		case util.DEVICE_IPAD: return mstrmojo.desc(7726);
        		case util.DEVICE_PHONE_UNIVERSAL: return mstrmojo.desc(8433);
        		case util.DEVICE_TABLET_UNIVERSAL: return mstrmojo.desc(8434);
        		case util.DEVICE_BLACKBERRY: return mstrmojo.desc(7866);
        	}
        },
        
        _set_model: function(n,v) {
            this.model = v;
            
            var indexList = [];
            if (v) {
                for(var i = 0; i < this.model.length; i++) {
                   indexList.push([{v: this.model[i].n, icon: (this.model[i].uptc != -1)? 'actionIcons-update' : ''}, {v: this.getDeviceName(this.model[i].dt)}, {v: this.genActions()}]);
                }
                
                this.columns[0].editable = true;//bindings does not work, not sure reason, maybe just can not set it in time.
            } else {
                indexList = [[{v: _S.htmlAngles("<" + mstrmojo.desc(7835) + ">")}, {v:""}, {v: ""}]];
                this.columns[0].editable = false;
            }
            delete this.cp.items;//cleant he old list object
            this.cp.set("items",indexList);
            this.refresh();
            this.set("editor", this.getEditor());
            
            return true;
        },
        
        left: '20px',
        top: '150px',
        width: "100%",
        height: "100%",
        autoColWidth: false,
        sortable:false,
        resizable:false,

        /**
         * get the event source row index in a table
         * @param {DOMEvent} e The DOM event object, if provided by the browser. 
         */
        getItemRow: function(e) {
             var tgt = _D.eventTarget(window, e);
                
             if (tgt){
                var tgtTD = _D.findAncestorByName(tgt, 'td', false, this.domNode);
                if(tgtTD) {
                    return tgtTD.parentNode.rowIndex;
                }
             }
        },
        getEditor: function() {
                return  new mstrmojo.InlineEditor({
                          cssClass: "mobile-InlineEditor",
                          onblur: function(evt) {
                                if (this.target && this.editor.value && 
                                        _S.trim(this.editor.value)&& (_S.trim(this.editor.value) != this.target[this.target.innerText? 'innerText': 'textContent'])) { 
                                         //before update the display to talk with server to see if there is duplicated name
                                        var t = this.target,
                                        itemIdx = t.parentNode.parentNode.parentNode.rowIndex,
                                        item = mstrmojo.all.confListTable.model[itemIdx];
                                        
                                        var v = {};
                                        v = _H.clone(item);// deep copy
                                        
                                        v.n =  this.editor.value;//change configuration name according to user input
                                        
                                        var  r = util.obj2Xml(v, "cnf", true, false);
                                        
                                        var that = this;
                                        mstrmojo.xhr.request("POST", 
                                                mstrConfig.taskURL,
                                                {
                                                     success: function(response){
                                                                        t[t.innerText? 'innerText': 'textContent'] = v.n; 
                                                                        that.setTarget(null);
                                                                        that.set('visible', false);
                                                                        mstrmojo.all.confListTable.model[itemIdx].n = v.n;
                                                                  },
                                                     failure: function(response){ 
                                                                      util.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                                }
                                                },
                                                {
                                                    taskId: "updateMobileConfigurationProperties",
                                                    taskEnv: "xhr",
                                                    configurationID: v.cid,
                                                    configurationPropertiesXML: r
                                                },
                                                null,
                                                null
                                              );
                                  } else {
                                      this.setTarget(null);
                                      this.set('visible', false);
                                  }
                      }
              });
        },

        modifyItem: function(e) { 
            this.parent.toEdit(this.model[this.getItemRow(e)].dt, this.model[this.getItemRow(e)].cid);
        },
        
        urlGen: function(e) {
            mstrmojo.all.confList.urlSetting.open(null, {rowIdx: this.getItemRow(e)});
        },
        
        /**
         * Duplicate config item
         */
        applyDuplicate: function(id, name, count){
            
            var confNm = '';
            if (count === 0) {
                confNm = mstrmojo.desc(3651).replace(/##/, name);
            } else {
                confNm = mstrmojo.desc(3652).replace(/###/, count).replace(/##/, name);
            }
            
            var that = this;
            mstrmojo.xhr.request("POST", 
                    mstrConfig.taskURL,
                    {
                         success: function(response) {
                                        mstrmojo.all.confIndex.refreshData();
                                    },
                         failure: function(response) { 
                                        that.applyDuplicate(id, name, ++count);// how to parse the error msg
                                    }
                    },
                    {
                        taskId: "duplicateMobileConfiguration",
                        taskEnv: "xhr",
                        configurationID:  id,
                        configurationName:  confNm
                    },
                    null,
                    null
                  );
        },
        
        duplicateItem: function(e) {
            var rowId = this.getItemRow(e);
            this.applyDuplicate(this.model[rowId].cid, this.model[rowId].n, 0);
        },
        
        deleteItem: function(e) {
            
            mstrmojo.all.confList.disableCurtain.set("visible", true);
            
            var rowId = this.getItemRow(e),
            id = this.model[rowId].cid,
            msg = '<span>' + mstrmojo.desc(7856) + ', </span>' 
                + '<span style="font-weight:bold">' + _S.htmlAngles(this.model[rowId].n) + '</span>' 
                + '<span> ?</span>',
            del = mstrmojo.all.cnfrmDel;
          
            if (del) {//in case the cnfrmDel dialog is not deleted.
                del.children.msg.set("text",msg);
            } else {
                mstrmojo.insert({
                                        scriptClass: "mstrmojo.Dialog",
                                        id: "cnfrmDel",
                                        title: mstrmojo.desc(3610),
                                        btnAlignment: "right",
                                        width: "475px",
                                        cssText: "border:1px solid #AAAAAA;",
                                        buttons: [
                                                  {
                                                      scriptClass: "mstrmojo.HTMLButton",
                                                      cssText: "margin-bottom:2px",
                                                      text: mstrmojo.desc(1442),
                                                      preBuildRendering: function() {
                                                          this.cssClass = "mobileconfig-Button";
                                                      },
                                                      postBuildRendering: function() {
                                                          this.domNode.focus();
                                                      },
                                                      onclick: function(evt) {
                                                              // delete the config
                                                              mstrmojo.xhr.request("POST", 
                                                                      mstrConfig.taskURL,
                                                                      {
                                                                           success: function(response){},
                                                                           failure: function(response){ 
                                                                                           util.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                                                      }
                                                                      },
                                                                      {
                                                                          taskId: "deleteMobileConfiguration",
                                                                          taskEnv: "xhr",
                                                                          configurationID:  id
                                                                      },
                                                                      null,
                                                                      null
                                                                    );
                                                              mstrmojo.all.confIndex.refreshData(); //update the confList
                                                              mstrmojo.all.confList.disableCurtain.set("visible", false);
                                                              mstrmojo.all.cnfrmDel.destroy();
                                                      }
                                                  },
                                                  {
                                                      scriptClass: "mstrmojo.HTMLButton",
                                                      cssText: "margin-left:15px;margin-bottom:2px",
                                                      text: mstrmojo.desc(221),
                                                      preBuildRendering: function() {
                                                          this.cssClass = "mobileconfig-Button";
                                                      },
                                                      onclick: function(evt){
                                                          mstrmojo.all.confList.disableCurtain.set("visible", false);
                                                          mstrmojo.all.cnfrmDel.destroy();
                                                      }
                                                  }
                                                  ],
                                        children: [
                                                      {
                                                          scriptClass: "mstrmojo.Label",
                                                          alias: "msg",
                                                          text: msg
                                                      }
                                                   ]
                                    }).render();
                
                     // no need to center the dialog, the dialog's editorNode is centered for us
                     // _D.center(mstrmojo.all.cnfrmDel.domNode);
                }

        },
        
        cp: new mstrmojo.MCListBoxCP({
            
            columns: [
                        {
                            type: 'icon_text',
                            v: mstrmojo.desc(7765),     //'Configuration Name',
                            sortable: false, 
                            editable: true,
                            width: "400px"
                        }, 
                        {
                            type: 'text',
                            v: mstrmojo.desc(2327),     //'Device',
                            sortable: false, 
                            editable: false,
                            width: "120px"
                        }, 
                         {
                             type: 'text',
                             v: mstrmojo.desc(3265),       //'Actions', 
                             sortable: false,                 
                             editable: false,
                             width: "150px"
                         } 
                        ],

             items: [[{v: ""},{v: ""}, {v: ""}]]// initalize with empty structure
        }) 
    });

    mstrmojo.confList = mstrmojo.insert( {
        id: "confListContainer",
        scriptClass: "mstrmojo.Container",
        markupString: "<div></div>",
        visible: true,
        markupSlots: {
          containerNode: function() { return this.domNode; }
        },
        markupMethods: {
          onvisibleChange: function(){ this.domNode.style.display = this.visible?"block":"none";}
        },
        children:[{
          scriptClass: "mstrmojo.Table",
          id: "confList",
          rows: 5,
          cols: 1,
          cssText: "margin:20px 20px 20px 20px",
          
          /**
           * change to edit page.
           * 
           * @param {Integer} dt Required. Device type.
           * @param {Integer} id Optional. Configuration ID.
           */
          toEdit: function(dt, id) {
                if (!dt) {
                    return;
                }
                
                mstrmojo.form.send((id)? { evt: 3004, target: "mobileConfig", configId: id, device: dt} 
                                                                              : { evt: 3004, target: "mobileConfig", device: dt});
          },
          
          children: [
                      confListTable, 
                      {
                          slot: "1,0",
                          scriptClass: "mstrmojo.Button",
                          enabled: true,
                          text: mstrmojo.desc(7766),   //"Define New Configuration",
                          cssText: "text-decoration:underline;margin-left:10px;margin-top:8px;color:#0000FF; font-weight: bold;width:150px",
                          onclick: function(evt) {
                              this.parent.dtEdtr.open();
                          } 
                      },
                      {
                          /**
                           * show a wizard to choose device
                           */
                          slot: "2,0",
                          scriptClass: "mstrmojo.Popup",
                          alias: "dtEdtr",
                          cssClass: "greyBorder",
                          cssText: "z-index:20;margin-left:65px;background-color:#F5F5F2",
                          onOpen: function() {
                              mstrmojo.all.confList.disableCurtain.set("visible", true);
                          },
                          onClose: function() {
                              mstrmojo.all.confList.disableCurtain.set("visible", false);
                          },
                          children: [{
                              scriptClass: "mstrmojo.Table",
                              cssText: "margin: 5px 5px 5px 5px",
                              layout: [{cells: [{},{colSpan:2,cssText: "width:100px"}]},{cells: [{},{},{}]}], //'Device'
                              children: [
                                util.propertyName(mstrmojo.desc(2327), "0,0", "margin-right: 10px"),
                               {
                                  slot: "0,1",
                                  alias: "dt",
                                  scriptClass: "mstrmojo.SelectBox",
                                  showItemTooltip: true,
                                  cssText: "width:100%",
                                  size: 1,
                                  items: deviceType,
                                  selectedItem: {v: util.DEVICE_IPHONE}
                              },
                              {
                                  slot: "1,1",
                                  scriptClass: "mstrmojo.Button",
                                  cssClass: "mobileconfig-Button",
                                  cssText: "margin-top:5px;margin-right:10px",
                                  text: mstrmojo.desc(1442), // "Ok"
                                  onclick: function() {
                                      var dvc = this.parent.dt.selectedItem.v;
                                      this.parent.parent.parent.toEdit(dvc);
                                  }
                              },
                              {
                                  slot: "1,2",
                                  scriptClass: "mstrmojo.Button",
                                  cssClass: "mobileconfig-Button",
                                  cssText: "margin-top:5px",
                                  text: mstrmojo.desc(221),       //"Cancel"
                                  onclick: function() {
                                      this.parent.parent.close();
                                  }
                              }]
                          }]
                      },
                      {
                          slot: "3,0",
                          scriptClass: "mstrmojo.Popup",
                          cssClass: "greyBorder",
                          cssText: "z-index:20",
                          alias: "urlSetting",
                          useShortURL: false,

                          /**
                           * Use curtain to disable conf list when edit url setting
                           */
                          onOpen: function() {
                          
                             var urlEdt = this.children[0];

                             urlEdt.hostnameVTB.validate();
                              
                              if (urlEdt.hostportVTB.enabled) {
                                  urlEdt.hostportVTB.validate();
                              }
                              
                              mstrmojo.all.confList.disableCurtain.set("visible", true);
                              
                              var dmNd = this.domNode;
                              
                              _D.center(dmNd);//make the top left to be the center of browser.
                          },
                          onClose: function() {
                              this.urlCurtain.set("visible", false);
                              delete this.itmCpy;
                              this.set("urlStr", undefined);//trigger the event to update the textarea
                              delete this.urlStr;
                              mstrmojo.all.confList.disableCurtain.set("visible", false);
                          },
                          updatePopupConfig: function(config) {
                              this.rowIdx = config.rowIdx;
                              this.set("itmCpy", _H.clone(mstrmojo.all.confListTable.model[mstrmojo.all.confList.urlSetting.rowIdx]));
                          },
                          
                          // This should really be a generic utility method, but it's here for now.
                          // TODO Move to a generic HTTP utility package.
                          // Pass in a map of name/value pairs and get back a String that contains 
                          // all of these as: "n1=v1&n2=v2&...&nN=vN"
                          buildURLParams: function(paramMap) {
                        	  var paramArray = [];
                        	  
                        	  // Build an array of name=value elements...
                        	  for (var n in paramMap) {
                        		  paramArray.push(n + '=' + paramMap[n]);
                        	  }
                        	  
                        	  return paramArray.join('&');
                          },
                          
                          updateURL: function(btn) {
                              
                              var lct = window.location,
                              path = lct.pathname.slice(0, String(lct.pathname).lastIndexOf('/')),
                              itm = this.itmCpy,
                              prtcl = (itm.lnk.rt === util.REQ_HTTPS)? 'https' : 'http',
                              universal = (itm.dt == util.DEVICE_PHONE_UNIVERSAL || itm.dt == util.DEVICE_TABLET_UNIVERSAL),
                              isBlackberry = itm.dt == util.DEVICE_BLACKBERRY,
                              port = itm.lnk.ipo ? ':'+itm.lnk.po : '',
                              host = itm.lnk.nm;

                              // Define our URL parameters...
                              var params = {
                                  taskId:	'getMobileConfiguration'
                              };
                              params['taskEnv']         = universal ? 'xhr'  : 'xml';
                              params['taskContentType'] = universal ? 'json' : 'xmlanf';
                              params['configurationID'] = itm.cid;
                              
                              if(isBlackberry){
                                  params['taskEnv'] = 'blackberry_xml';
                              }
                              
                              if (universal) {
                            	  params['blockTransform'] = 'flatten';
                              }
                              
                              if(universal || isBlackberry){
                                  // devices running mobile universal require block version 1 or later which has
                                  // the web server and project credentials re-loaded to new positions in the config. data model
                                  params['blockVersion'] = '1';
                              }
                              
                              var baseUrl = prtcl + '://' + host + port +
                                                      path + '/' + mstrConfig.taskURL + '?' +
                                                      this.buildURLParams(params);
                              
                              var url = '';
                              if(itm.dt == util.DEVICE_BLACKBERRY){
                                  url = baseUrl;
                              } else {
                                  baseUrl = encodeURIComponent(baseUrl);
                                  
                                  url = ((itm.dt == util.DEVICE_IPAD)? 'mstripad' : 'mstr')+
                                          '://?url=' + baseUrl + 
                                          '&authMode=' + itm.lnk.am + 
                                          ((itm.cs)? ('&csUrl=' + encodeURIComponent(itm.cs)) : ''),
                                       me = this,
                                       tcs = itm.tcs;
                                  
                                  //trusted certificates
                                  for (var i = 0, len = tcs && tcs.length; i < len || 0; i++){
                                      url += '&trust=' + encodeURIComponent(tcs[i].url);
                                  }
                              }
                              
                              var waitIcon = function(show){
                                  btn.set('textIconClass', show? 'mstrmojo-WaitIcon' : '');
                                  btn.set('enabled', !show);
                              },
                              me = this;
                                  
                              if(this.useShortURL && universal){
                                  waitIcon(true);
                                  //Use resourceFeed to get tinyURL for android
                                  mstrmojo.xhr.request("POST", mstrApp.resourceFeedURL || 'resourceFeed', {
                                      success: function(response) { 
                                          me.set("urlStr", response);
                                          waitIcon(false);
                                      },
                                      failure: function(response) {
                                          me.set("urlStr", response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                          waitIcon(false);
                                      }
                                  }, 
                                  null, true, "http://tinyurl.com/api-create.php", true, { url: url});
                              } else {
                                  this.set("urlStr", url);
                              }
                          },
                          
                          children: [
                                     {
                                         scriptClass: "mstrmojo.Table",
                                         cssText: "width:400px;height:140px;background-color:#F5F5F2",
                                         layout: [{cssClass: "mstrmojo-Editor-titlebar", cells: [
                                                     {cssClass:"mstrmojo-Editor-titleCell"},
                                                     {cssClass:"mstrmojo-Editor-titleCell", colSpan:2}]}, 
                                                     {cells: [{colSpan:3}]}, 
                                                     {cells: [{}, {colSpan:2}]}, 
                                                     {cells: [{}, {colSpan:2}]}, 
                                                     {cells: [{},{colSpan:2}]},
                                                     {cells: [{},{colSpan:2}]},
                                                     {cells: [{colSpan:3}]},
                                                     {cells: [{}, {}, {}]},
                                                     {cells: [{colSpan:3}]}
                                                     ],
                                         children: [
                                                    {
                                                        slot:"0,0",
                                                        scriptClass: "mstrmojo.Label",
                                                        cssClass: "mstrmojo-Editor-title",
                                                        cssText: "font-weight: bold",
                                                        text: mstrmojo.desc(7794)      //"Generate Configuration URL"
                                                    },
                                                    {
                                                        slot:"0,1",
                                                        scriptClass: "mstrmojo.Button",
                                                        title: mstrmojo.desc(2102),
                                                        iconClass: "mstrmojo-Editor-close",
                                                        cssText: " float: right",
                                                        onclick: function() {
                                                            this.parent.parent.close();
                                                        }
                                                    },
                                                    //"Specify the connectivity information of the server hosting the configuration."
                                                    util.propertyName(mstrmojo.desc(7949), "1,0","margin:15px 2px 2px 15px;"),
                                                    
                                                    //"Server name"
                                                    {
                                                        slot: "2,0",
                                                        scriptClass: "mstrmojo.Label",
                                                        cssText: "margin:5px 2px 2px 15px",
                                                        text: mstrmojo.desc(36) + ":"
                                                    },
                                                    {
                                                        slot: "2,1",
                                                        scriptClass: "mstrmojo.ValidationTextBox",
                                                        cssText: "margin:5px 15px 2px 0px;width:200px",
                                                        alias: "hostnameVTB",
                                                        required: true,
                                                        dtp: _DTP.CHAR,
                                                        constraints: {
                                                        trigger: _TR.ALL,
                                                        validator: function(v) {
                                                                return util.generalValidator(v, this.dtp,
                                                                                    function(v) {
                                                                                        if( v == 'localhost' || v == '127.0.0.1') {
                                                                                            return false;
                                                                                        }
                                                                                    }, 
                                                                                    mstrmojo.desc(7852));
                                                                   }
                                                        },
                                                        bindings:{
                                                            value: 'this.parent.parent.itmCpy.lnk.nm || window.location.hostname'
                                                        },
                                                        onValid: function() {
                                                            if (this.parent.parent.itmCpy){
                                                                this.parent.parent.itmCpy.lnk.nm = this.value;
                                                                this.set("isValid", true);
                                                            }
                                                        },
                                                        onInvalid: function() {
                                                            this.set("isValid", false);
                                                        }
                                                    },
                                                    //Include port:
                                                    {
                                                        slot: "3,0",
                                                        scriptClass: "mstrmojo.CheckBox",
                                                        alias: "showPrt",
                                                        cssText: "margin:5px 0px 2px 11px",
                                                        label: mstrmojo.desc(7950)+ ":",  
                                                        bindings:{
                                                            checked: 'this.parent.parent.itmCpy.lnk.ipo'
                                                        },
                                                        oncheckedChange: function() {
                                                            if (this.checked == null){
                                                                return;
                                                            }
                                                            
                                                            if (this.checked) {
                                                                this.parent.hostportVTB.validate();
                                                            } else {
                                                                this.parent.hostportVTB.clearValidation();
                                                                this.parent.hostportVTB.set("isValid", true);
                                                            }
                                                            
                                                            this.parent.parent.itmCpy.lnk.ipo = this.checked;
                                                        }
                                                    },
                                                    {
                                                        slot: "3,1",
                                                        scriptClass: "mstrmojo.ValidationTextBox",
                                                        cssText: "margin:5px 15px 2px 0px;width:200px",
                                                        alias: "hostportVTB",
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
                                                            enabled: "this.parent.showPrt.checked",
                                                            value: function(){
                                                                var port = this.parent.parent.itmCpy.lnk.po;
                                                                return port == -1 ? (window.location.port || 80) : port;
                                                            }
                                                        },
                                                        onValid: function() {
                                                            if (this.parent.parent.itmCpy){
                                                                this.parent.parent.itmCpy.lnk.po = this.value;
                                                            }
                                                            this.set("isValid", true);
                                                        },
                                                        onInvalid: function() {
                                                                 this.set("isValid", false);
                                                        }
                                                    },
                                                    //"Request type:"
                                                    util.propertyName(mstrmojo.desc(7951)+ ":", "4,0", "margin:5px 2px 2px 15px"),
                                                    {
                                                        slot: "4,1",
                                                        scriptClass: "mstrmojo.SelectBox",
                                                        showItemTooltip: true,
                                                        cssText: "margin:5px 15px 2px 0px;width:205px",
                                                        itemIdField: "v",
                                                        size: 1,
                                                        items: reqType,
                                                        bindings: {
                                                            selectedItem: "{v:this.parent.parent.itmCpy.lnk.rt}"
                                                        },
                                                        onchange: function() {
                                                            if (this.parent.parent.itmCpy) {
                                                                this.parent.parent.itmCpy.lnk.rt = this.selectedItem.v;
                                                            }
                                                        }
                                                    },
                                                    //"Authentication mode:"
                                                    util.propertyName(mstrmojo.desc(7952) + ":", "5,0", "margin:5px 2px 2px 15px", {
                                                        visible: "this.parent.parent.itmCpy.dt!=5"//not BlackBerry
                                                    }),
                                                    {
                                                        slot: "5,1",
                                                        scriptClass: "mstrmojo.SelectBox",
                                                        showItemTooltip: true,
                                                        cssText: "margin:5px 15px 2px 0px;width:205px",
                                                        itemIdField: "v",
                                                        size: 1,
                                                        items: urlAuthenMode,
                                                        bindings: {
                                                            selectedItem: "{v:this.parent.parent.itmCpy.lnk.am}",
                                                            visible: "this.parent.parent.itmCpy.dt!=5"//not BlackBerry
                                                        },
                                                        onchange: function() {
                                                            if (this.parent.parent.itmCpy) {
                                                                this.parent.parent.itmCpy.lnk.am = this.selectedItem.v;
                                                            }
                                                        }
                                                    },
                                                    {
                                                        slot: "6,0",
                                                        scriptClass: "mstrmojo.CheckBox",
                                                        cssText: "margin:5px 15px 2px 11px",
                                                        label: mstrmojo.desc(9047),     //"Use short URL"
                                                        oncheckedChange: function() {
                                                           this.parent.parent.useShortURL = this.checked;
                                                        },
                                                        bindings:{
                                                            checked: "this.parent.parent.useShortURL",
                                                            visible: "this.parent.parent.itmCpy.dt==3||this.parent.parent.itmCpy.dt==4"//only Android
                                                        }
                                                    },
                                                    {
                                                        slot: "7,0",
                                                        scriptClass: "mstrmojo.Button",
                                                        cssClass: "mobileconfig-Button",
                                                        cssText: "margin-right: 50px",
                                                        alias: "urlBtn",
                                                        text: mstrmojo.desc(7826), //generate URL
                                                        bindings: {
                                                            enabled: "this.parent.hostnameVTB.isValid&&this.parent.hostportVTB.isValid"
                                                        },
                                                        markupMethods: _H.copy(mstrmojo.Button.prototype.markupMethods, {
                                                            ontextIconClassChange: function(){
                                                                this.textNode.className = "mstrmojo-Button-text  " + this.textIconClass; 
                                                            }
                                                        }),
                                                        onclick: function() {
                                                            this.parent.parent.updateURL(this);
                                                         }
                                                    },
                                                    {
                                                        slot: "7,1",
                                                        scriptClass: "mstrmojo.Button",
                                                        cssClass: "mobileconfig-Button",
                                                        cssText: "margin-left: 15px;margin-right: 15px",
                                                        text: mstrmojo.desc(118),         //"Save"
                                                        bindings: {
                                                            enabled: "this.parent.hostnameVTB.isValid&&this.parent.hostportVTB.isValid"
                                                        },
                                                        enableBtn: function(enable) {
                                                            this.set("enabled", enable);
                                                            this.parent.cancelBtn.set("enabled",enable);
                                                            this.parent.urlBtn.set("enabled",enable);
                                                        },
                                                        onclick: function() {
                                                            this.parent.parent.urlCurtain.set("visible", true);
                                                            this.enableBtn(false);
                                                            var cpy = mstrmojo.all.confList.urlSetting.itmCpy;
                                                            var  r = util.obj2Xml(cpy, "cnf", false, false);
                                                            var that = this;
                                                            mstrmojo.xhr.request("POST", 
                                                                    mstrConfig.taskURL,
                                                                    {
                                                                        success: function(response){
                                                                            mstrmojo.all.confListTable.model[mstrmojo.all.confList.urlSetting.rowIdx].lnk = cpy.lnk;
                                                                            mstrmojo.all.confList.urlSetting.close();
                                                                            that.enableBtn(true);
                                                                        },
                                                                        failure: function(response){ 
                                                                            util.showErrorMsgBox(response.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                                                            that.enableBtn(true);
                                                                        }
                                                                    },
                                                                    {
                                                                        taskId: "updateMobileConfigurationProperties",
                                                                        taskEnv: "xhr",
                                                                        configurationID: cpy.cid,
                                                                        configurationPropertiesXML: r
                                                                    },
                                                                    null,
                                                                    null
                                                            );
                                                        }
                                                    },
                                                    {
                                                        slot: "7,2",
                                                        scriptClass: "mstrmojo.Button",
                                                        alias: "cancelBtn",
                                                        cssClass: "mobileconfig-Button",
                                                        cssText: "margin-left: 15px;margin-right: 15px",
                                                        text: mstrmojo.desc(221),       //"Cancel"
                                                        onclick: function() {
                                                        mstrmojo.all.confList.urlSetting.close();
                                                        }
                                                    },
                                                    {
                                                        slot: "8,0",
                                                        scriptClass: "mstrmojo.Panel",
                                                        cssText: "text-align:center",
                                                        alias: "urlShow",
                                                        bindings: {
                                                            state: "(this.parent.parent.urlStr)?1:0"
                                                        },
                                                        children: [{
                                                                           scriptClass: "mstrmojo.TextArea",
                                                                           cssText: "width:350px;height:100px;margin-bottom:15px;cursor:default",
                                                                           cssClass: "greyBorder",
                                                                           readOnly: true,
                                                                           bindings: {
                                                                               value: "this.parent.parent.parent.urlStr"
                                                                           }
                                                                       },
                                                                       {
                                                                           scriptClass: "mstrmojo.Button",
                                                                           enabled: true,
                                                                           visible: _D.isAndroid,
                                                                           text: "Link",
                                                                           cssText: "margin-bottom:15px;text-decoration:underline;color:#0000FF;font-weight: bold",
                                                                           onclick: function() {
                                                                    	   	window.location = this.parent.parent.parent.urlStr;
                                                                       	  }
                                                                       }
                                                        ]
                                                    }
                                                    ]
                                     },
                                     {
                                         scriptClass: "mstrmojo.Label",
                                         alias: "urlCurtain",
                                         visible: false,
                                         cssClass: "confList-disableCurtain"
                                     }
                                     ]
                      },
                        {
                          slot:"4,0",
                            scriptClass: "mstrmojo.Label",
                            alias: "disableCurtain",
                            visible: false,
                            cssClass: "confList-disableCurtain"
                        }
                      ]
        }
        ]
    });
    
})();