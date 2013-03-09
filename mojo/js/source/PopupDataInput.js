(function() {
    
    mstrmojo.requiresCls(
            "mstrmojo.Container",
            "mstrmojo.num",
            "mstrmojo.date",
            "mstrmojo.TextBox",
            "mstrmojo.CheckBox",
            "mstrmojo.Slider",
            "mstrmojo.DateTextBox",
            "mstrmojo.ValidationTextBox",
            "mstrmojo.SwitchBox",
            "mstrmojo.TimePicker",
            "mstrmojo.ElasticTextArea",
            "mstrmojo.DropDownList",
            "mstrmojo.Slider",
            "mstrmojo.ToolBar"
            );
    
    var $NIB = mstrmojo.Button.newIconButton,
        $D = mstrmojo.dom,
        $C = mstrmojo.css,
        _DTP = mstrmojo.expr.DTP,
        INPUT_VALUES_MANUAL = 1,
        decimal = '.',
        NUM = 'number',
        GRY = 'greyed',
        INTEGER = 1, 
        NUMERIC = 3, //EnumDSSXMLDataType.DssXmlDataTypeNumeric
        REAL_NUM = 5, //EnumDSSXMLDataType.DssXmlDataTypeReal
        DOUBLE = 6,
        FLOAT = 7, //EnumDSSXMLDataType.DssXmlDataTypeFloat
        BIGDECIMAL = 30,
        SLD = 'mstrmojo.Slider',
        LB = 'mstrmojo.Label',
        BC = 'mstrmojo-oivmSprite '; //button style prefix
    
    /**
     * DataInput Type:
     * 1. Textbox
     * 2. Switch
     * 3. List
     * 4. Slider
     * 5. Calendar
     * 6. TimePicker
     */
    var TEXTBOX = 1,
        SWITCH = 2,
        LIST = 3,
        SLIDER = 4,
        CALENDAR = 5,
        TIMEPICKER = 6,
        TOGGLE = 7,
        TEXTAREA = 8;
    
    var POPUP_INLINE = 0,
        POPUP_ABOVE = 1,
        POPUP_BELOW = 2,
        HEIGHT = 'height',
        WIDTH = 'width';
    
    function getModeValue(config, mode) {
        var v = null, 
            style = config.style;
        
        if(mode === WIDTH) {
            //Fixed with mode?
            if(config.wm) {
                v = config.w;             
            } else {
                v = style.width;
            }
        }
        else if(mode === HEIGHT) {
            //Fixed height mode?
            if(config.hm) {
                v = config.h;
            } else {
                v = style.height;
            }
        }
        return v;
    }
    
    /**
     * Set the style of the editor so that it can be displayed without truncating.
     * @param {Widget} editor
     * @param {Integer} config.wm Width mode, 0 inherited, 1 custom value
     * @param {String} config.style top, left, height, width properties
     * @param {Integer} popup Popup style, can be POPUP_INLINE, or POPUP_ABOVE, or POPUP_BELOW 
     * @param {HTMLElement} [target] 
     */
    function setStyle(editor, config, popup) {
        var style = config.style,
            cn = config.cssName,
            dm = editor.domNode,
            ds = dm.style,
            ee = editor._curEditor,
            ett = editor.tipNode.style,
            es = ee.domNode.style,
            et = editor.toolbar,
            width, height;

        //Fixed with mode?
        width = getModeValue(config, WIDTH);
        height = getModeValue(config, HEIGHT);
        
        if(popup === POPUP_INLINE) {
            //inline, inherit width mode
            ds.padding = '0px';
            ett.display = 'none';
            
            if(style) {
                for(var i in style) {
                    ds[i] = style[i];
                }
                var h = parseInt(height || style.height, 10) - 8;
                es.height = (isNaN(h) || (h < 0)) ? 'auto' : h + 'px';;
                var w = parseInt(width || style.width, 10) - 2;
                ee.set('width', w);
                es.width = (w - 6) + 'px';
            }
            
            if (ee.adjustChildPopupPos) {
                ee.adjustChildPopupPos(style);
            }

        } else if(popup === POPUP_ABOVE) {
            ett.display = 'block';
            var w = parseInt(width, 10),
                left = (parseInt(style.left, 10)  + parseInt(style.width, 10)/2 - 21);
            ds.left = left + 'px';
            var top = (parseInt(config.style.top, 10)),
                tipUp = top < 76;
            
            //adjust editor position and tip css class
            top = tipUp ? top + parseInt(style.height) + 15 :  top - 76;
            editor.tipNode.className = tipUp ? 'boxtipUp' : 'boxtip';
             
            ds.top = top + 'px';
            ee.set('width', w);
            
            //TODO: move to css
            ds.paddingLeft = '6px';
            ds.paddingTop = '6px';
            ds.paddingRight = '6px';
            ds.paddingBottom = '11px';
            ds.height = "44px";
            
            w = w > 100 ? (w + 70) : 200;
            ds.width = w + 'px';
            
            //adjust 'left' to make the editor is fully visible in browser window
            var shift = (document.body.offsetWidth - left - w - parseInt($C.getStyleValue(dm, 'paddingLeft')) - parseInt($C.getStyleValue(dm, 'paddingRight')));
            shift = shift > 0 ? 0 : shift;
            
            ds.left = parseInt(ds.left) + shift + 'px';
            ett.left = 15 - shift + 'px'; //move tip 15 pixel to the right so that it can be shifted to the right of the round corner
            
            et.set('visible', true);
            ett.display = 'block';
        } else {//POPUP_BELOW
            ds.top = style.top;
            ds.left = style.left;
            ds.height = es.height = height + 'px';
            ds.width = es.width = width + 'px';
            et.set('visible', true);
            ett.display = 'none';
        }
    }
    
    /**
     * Get items list for sliders based on the min, max, and interval value.
     * @param {Object} di Data input config object
     * @param {String} di.ipt The property controls whether the inputs are automatically generated or not. The value can be 'Calculated' or 'Manual'.
     * @param {Array} di.vls The collection of values if the inputs are manually created.
     * @param {Integer} di.min The minimum value of the slider
     * @param {Integer} di.max The maximum value of the slider
     * @param {Integer} di.itv The interval value
     * @returns {Array} Items list
     */
    function getItems(di) {
        var m = [], i, v, vs, len, nm = 0,
            dv = String(di.itv),
            dx = dv && dv.indexOf(decimal);
        if(dx >= 0) {
            nm = dv.substring(dx+1).length; 
        }
        
        if(parseInt(di.ipt, 10) !== INPUT_VALUES_MANUAL) {
            for(i = 0, v = di.min; v <= di.max; i++, v += di.itv) {
                m[i] = {'n': mstrmojo.num.toLocaleString(nm > 0? v.toFixed(nm) : v) , 'v': v};
            }
        } else {
            if(di.t === SLIDER) {
                vs = di.vls;
                for(i = 0, len = vs.length; i < len; i++) {
                    v = vs[i].v || vs[i];
                    m[i] = {'n': v === undefined ? '' : v, 'v': v };
                }
            } else {
                m = di.vls;
                mstrmojo.array.forEach(m, function(mi) {
                    if(mi.n === undefined) {
                        mi.n = '';
                    }
                });                
            }
        }
        return m;
    }    
    
    /**
     * Get updated value from the editor
     * @param {Widget} editor The editor
     */
    function getUpdatedValue(editor) {
        if(editor.getUpdatedValue) {            
            return editor.getUpdatedValue();
        } else {
            return editor.value;
        }
        
    }

    /**
     * Close the popup editor
     * @ignore
     */
    function close() {
        var ce = this._curEditor,
            ct = this.toolbar;
        //detach the mousedown handler added in setTarget()
        $D.detachEvent(document, 'mousedown', this.md);
        //detach the mouse wheel handler
        $D.detachEvent(document, $D.isFF ? 'DOMMouseScroll' : 'mousewheel', this.mw);
        ce.set('visible', false);
        ct.set('visible', false);
        ct.apply.set('enabled', false);
        $C.addClass(ct.apply.domNode, GRY);
        this.close();
    }

    /**
     * Applys fonts on the target input nodes
     * @ignore
     */
    function applyFonts() {
        var i, f = this.font;
        if(this.inputNode) {
            for(i in f) {
                if(f.hasOwnProperty(i)) {
                    this.inputNode.style[i] = f[i];
                }
            }
        }
    }
    
    /**
     * A context sensitive popup that can display different types of editor based on the target context.
     * @class 
     * @extends mstrmojo.Popup
     */
    mstrmojo.PopupDataInput =  mstrmojo.declare(
       // super class     
       mstrmojo.Popup,
       
       // mixins
       null,
       
       /**
        * @lends mstrmojo.PopupDataInput.prototype
        */
       {
           /**
            * @ignore
            */
           scriptClass: 'mstrmojo.PopupDataInput',
           /**
            * @ignore
            */
           markupString: '<div cie="popupDI" id={@id} class="mstrmojo-PopupDataInput mstrmojo-DataInputControl {@cssClass}" style="{@cssText}" mstrAttach:keyup>'+
                           '<div cie="toolbar" style="right:0px;z-index:2"></div>' +
                           '<div cie="dateEditor"></div>' +
                           '<div cie="valueEditor"></div>' +
                           '<div cie="switchEditor"></div>' +
                           '<div cie="sliderEditor"></div>' +
                           '<div cie="selectBoxEditor"></div>' +
                           '<div cie="timePickerEditor"></div>' +
                           '<div cie="toggleEditor"></div>' +
                           '<div cie="textAreaEditor"></div>' +
                           '<div cie="arrow" class="boxtip"></div>' +
                         '</div>',
           /**
            * @ignore
            */
           markupSlots: {
               editorNode: function() { return this.domNode; },
               toolbarNode: function() { return this.domNode.firstChild; },
               dateNode: function() { return this.domNode.childNodes[1]; },
               valueNode: function() { return this.domNode.childNodes[2]; },
               switchNode: function() { return this.domNode.childNodes[3]; },
               sliderNode: function() { return this.domNode.childNodes[4]; },
               selectBoxNode: function() { return this.domNode.childNodes[5]; },
               timePickerNode: function() { return this.domNode.childNodes[6]; },
               toggleNode: function() { return this.domNode.childNodes[7]; },
               textAreaNode: function() { return this.domNode.childNodes[8]; },
               tipNode: function() { return this.domNode.lastChild; }
           },
           
           /**
            * @ignore
            */
           markupMethods: {
               onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; },
               onheightChange: function() { this.domNode.style.height = this.height || ''; },
               onwidthChange: function() { this.domNode.style.width = this.width || ''; },
               ontopChange: function() { this.domNode.style.top = this.top || ''; },
               onleftChange: function() { this.domNode.style.left = this.left || ''; }
           },

           /**
            * The value of the current editor
            * @type String
            */
           value: null,
           
           /**
            * The original value of the editor. Used to compare with the final value to decide whether the value get changed from user input.
            * @type String
            * @private
            */
           _srcValue: null,
           
           /**
            * Current edtiro
            * @type mstrmojo.Widget
            * @private
            */
           _curEditor: null,
           
           children: [
              //apply cancel buttons are in the toolbar node
              { 
                  scriptClass: 'mstrmojo.ToolBar',
                  slot: 'toolbarNode',
                  alias: 'toolbar',
                  visible: false,
                  children: [
                      $NIB(mstrmojo.desc(134, 'Apply'), BC + 'tbApply greyed', function() {
                          this.parent.parent.onApply();
                      }, null, {enabled: false, alias: 'apply'}),
                      $NIB(mstrmojo.desc(221,'Cancel'), BC + 'tbCancel', function() {
                          this.parent.parent.onCancel();
                      })
                  ]
              },
              // date editor
              {                  
                  scriptClass: 'mstrmojo.DateTextBox',
                  alias: 'dateBox',
                  slot: 'dateNode',
                  autoFormat: false,
                  //dtp: 15,
                  onvalueChange: function() {
                      var cal = this.calendar.cal,
                          _DT = mstrmojo.date;
                      
                      this.invalid = mstrmojo.string.trim(this.value || '').length == 0 || this.validationStatus.code > mstrmojo.validation.STATUSCODE.VALID;
                      
                      if(cal.value != this.value) {
                          cal.set('value', this.value);
                      } else if(this.min || this.max) {
                          if(this.min && _DT.compareDateAndOrTime(this.min, cal.value) > 0) {
                              this.value = this.min;
                          } else if(this.max && _DT.compareDateAndOrTime(cal.value, this.max) > 0) {
                              this.value = this.max;
                          }
                      }
                      if(this.hasRendered && this.visible) {
                          var me = this;
                          window.setTimeout(function() {
                              me.focus();
                          }, 0);
                      }
                  },
                  onfontChange: applyFonts,
                  adjustChildPopupPos: function(style) {
                      //adjust 'left' of the child Popup to make the editor is fully visible in browser window
                      var me = this;

                      //shift calendar popup by timeout in order to get the popup width
                      window.setTimeout(function() {
                          var dm = me.domNode,
                              calDom = me.calendar.domNode,
                              w = calDom.scrollWidth,
                              left = parseInt(style.left, 10);
                              shift = (document.body.offsetWidth - left - w - parseInt($C.getStyleValue(dm, 'paddingLeft')) - parseInt($C.getStyleValue(dm, 'paddingRight')));


                          //shift only when popup got cutoff on right end  
                          if (shift < 0) {
                              calDom.style.left = shift + 'px';
                          }
                          
                          //#478960 - do we need to show the Calendar above the inputbox?
                          var top = parseInt(style.top, 0); //Date InputBox top position
                          if (top + me.inputNode.offsetHeight + calDom.offsetHeight <= mstrmojo.dom.windowDim().h) {
                              calDom.style.top = me.inputNode.offsetHeight + 'px';  //show Calendar below Date InputBox (defualt)
                          } else {
                              calDom.style.top = - calDom.offsetHeight + 'px';  //otherwise show Calendar above Date Inputbox
                          }

                      }, 10);
                  },
                  visible: false
              }, 
              // value editor
              {
                  scriptClass: 'mstrmojo.ValidationTextBox',
                  alias: 'valueBox',
                  slot: 'valueNode',
                  font: null,
                  onfontChange: applyFonts,
                  dtp: 9, //mstrmojo.expr.DTP.VARCHAR
                  constraints: {
                      //TODO: replace the validator based on the DTP
                      validator: function(v) {
                              var SC = mstrmojo.validation.STATUSCODE;
                              if((this.dt >= INTEGER && this.dt <= FLOAT) || (this.dt === BIGDECIMAL)) {
                                  if(mstrmojo.num.isNumeric(v)) {
                                      return {code:SC.VALID};
                                  }
                                  return {code:SC.INVALID, msg:mstrmojo.desc(7901, 'This field contains numeric value with incorrect format')};
                              } else {
                                  return {code:SC.VALID};
                              }
                      },
                      trigger: mstrmojo.validation.TRIGGER.ONKEYUP
                  },
                  focus: function() {
                      this.validate();
                      mstrmojo.dom.setCaret(this.domNode, (this.value && this.value.length || 0));
                  },
                  visible: false
              },
              //switch editor
              { 
                  scriptClass: 'mstrmojo.CheckBox',
                  alias: 'switchBox',
                  slot: 'switchNode',
                  getUpdatedValue: function() {
                      if(this.vm) {
                          return this.vm[this.checked ? 1 : 0].v;
                      }
                      else {
                          return this.checked;
                      }
                  },
                  visible: false
              },
              // slider editor
              { 
                  scriptClass: 'mstrmojo.VBox',
                  alias: 'sliderBox',
                  slot: 'sliderNode',
                  getUpdatedValue: function() {
                      return this.sliderField.sliderBar.value;
                  },
                  onwidthChange: function() {
                      this.sliderField.sliderBar.domNode.style.width = this.width + 'px';
                  },
                  onvalueChange: function() {
                      var txt = '',
                          v = parseFloat(this.value),
                          sb = this.sliderField.sliderBar;
                      if(isNaN(v) || (!isNaN(v) && (v < this.min || v > this.max))) {
                          txt = mstrmojo.desc(8316, ' (out of range)');
                          $C.addClass(sb.domNode, 'unset');
                      } else {
                          $C.removeClass(sb.domNode, 'unset');
                      }
                      this.textField.valueText.set('text', this.value + txt);
                      if(this.visible && !this.parent.toolbar.apply.enabled) {
                          this.parent.toolbar.apply.set('enabled', true);
                          $C.removeClass(this.parent.toolbar.apply.domNode, GRY);
                      }
                  },
                  children: [
                      {
                          scriptClass: 'mstrmojo.HBox',
                          cssText: 'padding-left:5px',
                          alias: 'textField',
                          children: [
                              {
                                  scriptClass: LB,
                                  text: mstrmojo.desc(4104, 'Value:')
                              },
                              {
                                  scriptClass: LB,
                                  cssText: 'white-space:nowrap;overflow:visible;width:30px;text-align:left;font-weight:bold;padding-left:4px',
                                  alias: 'valueText',
                                  text: '0'
                              }
                          ]
                      },
                      {
                          scriptClass: 'mstrmojo.HBox',
                          alias: 'sliderField',
                          cssText: 'margin: 5px 10px 3px;white-space: nowrap;',
                          children: [
                              {
                                  scriptClass: LB,
                                  alias: 'minText',
                                  cssText: 'padding-right:6px;padding-top:1px;text-align:right;',                                  
                                  text: ''
                              },
                              {
                                  scriptClass: SLD,
                                  isHoriz: true,
                                  alias: 'sliderBar',
                                  onselectionChange: function(evt) {                                           
                                      this.value = this.items[this.selectedIndex] && this.items[this.selectedIndex].n;
                                      this.parent.parent.set('value', this.value);
                                      this.typeHelper.updateThumb();
                                  },
                                  value: 0,
                                  items: []
                              },
                              {
                                  scriptClass: LB,
                                  alias: 'maxText',
                                  cssText: 'margin-left:3px;text-align:left;padding-top:1px;',
                                  test: ''
                              }
                          ]
                      }
                  ],
                  visible: false
              },
              // list box
              { 
                  scriptClass: 'mstrmojo.DropDownList',
                  alias: 'selectBox',
                  slot: 'selectBoxNode',
                  visible: false,
                  onwidthChange: function() {
                      this.selectNode.style.width = this.width + 'px';
                  },
                  options: [{n: 'Yes', v: 'Yes'},{n: 'No', v: 'No'}]
              },
              // time picker
              {
                  scriptClass: 'mstrmojo.TimePicker',
                  alias: 'timeBox',
                  slot: 'timePickerNode',
                  onvalueChange: function() {
                      if(this.displayValue !== this.value && !this.parent.toolbar.apply.enabled) {
                          this.parent.toolbar.apply.set('enabled', true);
                          $C.removeClass(this.parent.toolbar.apply.domNode, GRY);
                      }
                  },
                  visible: false
              },
              // text area control
              {
                  alias: 'etaBox',
                  slot: 'textAreaNode',
                  scriptClass: 'mstrmojo.ElasticTextArea',
                  visible: false
              },
              // toggle
              {
                  slot: 'toggleNode',
                  scriptClass: 'mstrmojo.ImageToggle',
                  alias: 'toggleBox',
                  visible: false
              }
           ],
           
           /**
            * Add popup to document body.
            */
           preBuildRendering: function preBldRnd() {
               //append the popup to the end of the document DOM
               if(!this.slot && !this.placeholder){
                   this.placeholder = document.body.appendChild(document.createElement("div"));
               }
               
               if (this._super) {
                   return this._super();
               } else {
                   return true;
               }
           },
           
           onkeyup: function onkeyup(evt) {
               var hWin = evt.hWin,
                   e = evt.e || hWin.event,
                   ce = this._curEditor.alias;
               //on enter key
               if(ce !== "etaBox" && e.keyCode === 13) {
                   // Call the on blur method.
                   this.onApply();
               //on escape key    
               } else if(e.keyCode === 27) {
                   this.onCancel();
               }               
           },           
           
           /**
            * The function handles the apply action when the apply button is clicked.
            * @private
            */
           onApply: function() {
               this.applyChange();
               close.call(this);
           },
           
           /**
            * The function handles the cancel action when the cancel button is clicked
            * @private
            */
           onCancel: function() {
               close.call(this);
           },

           /**
            * The function is used to enable an editor for the given target.
            * @param {Integer} props.t
            * @param {String} props.fmt
            * @param {HTMLElement} target The target element that we need to change text on
            */
           open: function(opener, config) {
               if(!config.t) {
                   return ;
               }
               
               if(this._super) {
                   this._super(opener, config);
               }
               
               this.opener = opener;
               this.key = config.key;
               var type = config.t,
                   popup = POPUP_INLINE;
               
               if(type == CALENDAR) {
                   var db = this.dateBox;
                   if(config.ict) {
                       db.dtp = _DTP.TIMESTAMP;
                   } else {
                       db.dtp = _DTP.DATE;
                   }
                   db.constraints = {trigger:mstrmojo.validation.TRIGGER.ALL};
                   db.openPopup('calendar', db._calendarConfig);
                   if(config.min) {
                       db.min = config.min;
                   }
                   if(config.max) {
                       db.max = config.max;
                   }
                   this._curEditor = db;
               } else if(type == TIMEPICKER) {
                   popup = POPUP_BELOW;
                   config.hm = config.wm = 1;//hajack config property for a proper display
                   if(!$D.isIE) {
                       config.h = 180;
                   } else {
                       config.h = 28; 
                   }
                   config.w = 158;
                   var tb = this.timeBox;
                   tb.displayValue = config.value;
                   if(config.itv) {
                       tb.set('interval', config.itv);
                   }
                   tb.set('active', 2); //set active field to be minutes
                   this._curEditor = tb; 
               } else if(type == TEXTBOX) {
                   var vb = this.valueBox;
                   if(config.ml) {
                       vb.set('maxLength', config.ml);
                   }
                   if(config.psw) {
                       vb.type = 'password';
                   }
                   vb.dt = config.dt;
                   vb.refresh();
                   this._curEditor = vb;
               } else if(type == SLIDER) {
                   var sf = this.sliderBox.sliderField,
                       smin = sf.minText,                       
                       smax = sf.maxText,
                       min = parseInt(config.min, 10),
                       max = parseInt(config.max, 10),
                       sb = sf.sliderBar,
                       items = getItems(config),
                       idx = 0;
                   if(parseInt(config.ipt, 10) !== INPUT_VALUES_MANUAL){                       
                       idx = Math.floor((Math.max(Math.min(config.value, max), min) - min) / config.itv);
                       if(typeof min === NUM) {
                           smin.set('text', min.toString());
                       }
                       if(typeof max === NUM) {
                           smax.set('text', max.toString());
                       }
                       this.sliderBox.set('min', min);
                       this.sliderBox.set('max', max);
                   } else {
                       idx = mstrmojo.array.find(items, 'v', config.value);
                   }
                   sb.set('width', parseInt(getModeValue(config, WIDTH), 10));
                   sb.set('items', items);
                   sb.select(idx || 0);
                   popup = POPUP_ABOVE;
                   // refresh so that slider can recalculate to set the correct display
                   sb.refresh();
                   this.sliderBox.value = null;
                   this._curEditor = this.sliderBox;                   
               } else if(type === LIST) {
                   var lb = this.selectBox,
                       items = getItems(config),
                       value = config.value,
                       idx = mstrmojo.array.find(items, 'v', config.value);
                   
                   if (idx == -1){
                	   items = [{n:config.ust, v:config.value}].concat(items);
                	   lb.unset = true;
                   }
                   
                   lb.set('options', items);
                   //delete width so that we can reset the value
                   delete lb.width;
                   lb.refresh();
                   this._curEditor = lb;
               } else if(type === TOGGLE) {
                   var tb = this.toggleBox;
                   tb.set('imageList', config.vls);
                   this._curEditor = tb;
               } else if(type === TEXTAREA) {
                   //for text area, we don't want the hight limitation
                   //TQMS: 473801 reduce the textarea hight to be 0 so that the previous setting will not affect it
                   config.style.height = 0;
                   this.etaBox.set('maxLength', config.ml);
                   this._curEditor = this.etaBox;
               } else if(type === SWITCH) {
                   var sb = this.switchBox;
                   sb.set('vm', config.vls);
                   
                   this._curEditor = sb;                   
               } else {
                   return ;
               }

               var ce = this._curEditor;
               if(ce.focus) {
                   window.setTimeout(function() {
                       ce.focus();
                   }, 100);
               }
               
               this._srcValue = config.value;
               ce.set('value', config.value);
               setStyle(this, config, popup);
               
               if(config.font) {
                   ce.set('font', config.font);
               }               
               
               ce.set('visible', true);
               ce.set('invalid', false);
               
               var me = this;
               this.md = this.md || function md(e){                   
                   var elTarget = $D.eventTarget(self, e);
                   var t = $D.findAncestorByAttr(elTarget,
                           'cie',
                           true,
                           me.domNode);
                   
                   if (!elTarget.getAttribute('cie') && !t) {
                       me.onBlur();
                   }
               };
               //mouse wheel event, for now, we close the editor
               this.mw = this.mw || function(e) {  
                   me.onBlur(); 
               };
    
                //attach the mousedown event so that the onBlur function can triggered when the mouse is clicking outside of the editor widget
                $D.attachEvent(document, 'mousedown', this.md); 
                $D.attachEvent(document, $D.isFF ? 'DOMMouseScroll' : 'mousewheel', this.mw);
                
                this.set('visible', true);
                //sorry IE, no animations for you due to a flashing issue and missing images 
                if(!$D.isIE) {
                    var fx = new mstrmojo.fx.FadeIn({target: this.domNode});
                    fx.play();
                }
                
                if (popup == POPUP_ABOVE) {
                    var me = this;
                    window.setTimeout(function() {
                        me.set('width', 'auto'); //reset in order to correct new width
                        me.set('width', (ce.domNode.scrollWidth) + 'px');
                    }, 10);
                }
           },
           
           /**
            * Save the change
            */
           applyChange: function() {
               var ce = this._curEditor;
               this.value = getUpdatedValue(ce);

               if(this._srcValue !== this.value) {
                   //validate the value before applying changes
                   if(ce.validate) {
                       ce.validate();
                   }
                   //when calling data changed, we do not need to pass the modified cell dom since it can be found by the widget it self
                   this.opener.dataChanged(this.key, this._srcValue, this.value, null, ce.isValid && !ce.isValid());
               }
           },
           
           /**
            * When the editor is not on focus (e.g. the mouse clicks outside of the editor), the onBlur function is called.
            * @private
            */
           onBlur: function() {
               if(this._curEditor.alias !== "sliderBox" && this._curEditor.alias !== "timeBox" && !this._curEditor.invalid) {
                   this.applyChange();
               }
               close.call(this);
           }           
       }
    );

    
})();