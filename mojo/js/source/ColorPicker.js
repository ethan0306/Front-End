(function(){
    
    mstrmojo.requiresCls("mstrmojo.Container","mstrmojo.List", "mstrmojo.Button", "mstrmojo.color", "mstrmojo.Model", "mstrmojo.Table",
    		"mstrmojo._CanValidate", "mstrmojo.ValidationTextBox");

    //shortcut
    var $C = mstrmojo.color;
    
    
    
    /**
     * <p> Animation effect of sliding in/out of a widget</p>
     * 
     * @param {Boolean} show Boolean to indicate show or hide
     * @param {DOMNode} target DOMNode to animate 
     * @param {String} prop CSS property name ('height', 'top' etc)
     * @param {Integer} start Value to start animation
     * @param {Integer} stop  Value to stop animation
     * @param {Function} onEnd Callback to run when animation ends
     * @param {String} ease Name of the ease type
     * @param {Object} extrProps Extra properties to set to the animation instance
     */
    function slideProp(show, target, prop, start, stop, onEnd, ease, extraProps) {

        // set animation properties
        var props = {
                target : target,
                onEnd : function() {
                    if (onEnd) {
                        onEnd();
                    }
                },
                props: {}
            };
        
        props.props[prop] = {
                ease : ease,
                start : parseInt(start, 10),
                stop : parseInt(stop, 10),
                suffix : 'px'
            };//targetProps;

        // copy in other widget specific animation properties
        props = mstrmojo.hash.copy(extraProps, props);

        // Animation instance
        var fx = new mstrmojo.fx.AnimateProp(props);

        fx.play();
    }
    
    
    /**
     * <p>Add new user defined color </p>
     * @param {String} newcolor Hex color value (#xxxxxx)
     */
    var _updateUserPalette = function(newcolor) {
        
        if (newcolor === null) {
            return;
        }
        
        var userPalette = mstrmojo.locales.color.userPalette;
        var len = userPalette.length;
        
        //if user palette is full, remove last item
        if (len == 8) {
            userPalette.remove(len - 1, 1);
        }
        //add new color as first item
        userPalette.add([{n:newcolor, v: newcolor}], 0);
        
        //save userPalette
        //first build user colors into string
        var colors = '';
        for (var i = 0 ; i < 8; i ++) {
            if (userPalette[i] && userPalette[i].v) {
                colors += userPalette[i].v + ','; // ',' as colors separator
            }
        }
        colors = colors.replace(/,$/, ''); //remove trailing ','
        
        //call task to save 'userPalette' preference        
        mstrmojo.xhr.request('GET', mstrConfig.taskURL, 
                            {
                                success: function (res) {},
                                failure: function (res) {
                                    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                }
                            }, 
                            {
                                taskId: 'setPreference', 
                                prefs: 'userPalette' + '\u001E' + colors
                            }
        );
            
    };
    
    /**
     * <p>Create label</p>
     * @param {String} label The text to be shown; also used as alias.
     * @param {String} css Css Class Name
     * @param {String} slot The slot in a TABLE layout
     */
    var _createLabel = function(label, css, slot) {
        
        return  {
                    scriptClass: 'mstrmojo.Label',
                    text: label + ':',
                    cssClass: css,
                    slot: slot
                };
    };
    
    
    /**
     * <p>Create a rgb,hsv or hex input box with a label on the left.</p>
     * @param {String} label The text to be shown; also used as alias.
     * @param {String} slot The slot in a TABLE layout
     * @param {String} n ColorModel color component property name: 'r','g','b','h','s','v'
     * @param {Object} props Specific properties to be added for each InputBox
     */
    var _createInputBoxWithLabel = function(label, slot, n, props) {
        
        return mstrmojo.hash.copy(
                props || {},
                {
                    scriptClass: 'mstrmojo.ValidationTextBox',
                    //alias: label,
                    //label: label,
                    cssDisplay: 'block',
                    cssText: 'padding: ' + (mstrmojo.dom.isIE7 ? '0' : '1px'),
                    bindings: {
                        value: function(){
                            return this.parent.parent.colorModel[n] || '0'; //make sure Inputbox display 0
                        }
                    },
                    onValid: function() {
                    	this.parent.parent.colorModel.set(n, this.value);
                    },
                    
                    min: 0,
                    max: 255,
                    constraints: {
                    	trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
    					validator: function(v) {
    							var min = this.min,
    								max = this.max;
    							
    							v = parseInt(v, 10);
    							if (v >= min && v <= max) {
    									return {code: mstrmojo.validation.STATUSCODE.VALID};
    							} else {
    								return {
    										code: mstrmojo.validation.STATUSCODE.INVALID, 
    										msg: mstrmojo.desc(7883).replace('##', min).replace('###', max) //Descriptor: Please enter an integer between ## and ###.
    										};
    							}
    					}
                    },
                    slot: slot
                }
                );
    };
    
    
    /**
     * <p>Build a slider JSON</p>
     * @param {String} n Color component name this slider is built for
     *          'r' - Red color
     *          'g' - Green color
     *          'b' - Blue
     *          
     *          'h' - Hue
     *          's' - Saturation
     *          'v' - Brightness
     *                 
     * @return {Object}
     */
    var _createSlider = function(n) {
      return mstrmojo.hash.copy(
              {
                scriptClass: 'mstrmojo.Slider',
                alias: n + 'Slider',
                cssClass: 'sc ' + n,
                isHoriz: true,
                width: 130,
                cssBkBW: 0,
                items:[],
                getItemTooltip: function() {//Overriding
                  return this.items[this.min].n;
                },
                postCreate: function() {
                        //for (var i = 0; i < {Red:256, Green:256, Blue:246, Saturation:100, Brightness:100}[which]; i ++) {
                      for (var i = 0; i < {r:256, g:256, b:256, s:101, v:101, h:360}[n]; i ++) {
                            this.items.push({n:i, v: i});
                        }
                },
                bindings: {
                    selectedIndex: function() {
                        return this.parent.parent.colorModel[n] || '0'; //make sure Inputbox display it when it is 0.
                    }
                },
                onselectedIndexChange: function() {
                    //this.parent[n].set('value', this.selectedIndex);
                    this.parent.parent.colorModel.set(n, this.selectedIndex);
                    
                    if (this.domNode) {
                        this.min = this.max = this.selectedIndex;
                        this.typeHelper.updateThumb();
                    }
                },
                select: function(sel) {
                    this.set('selectedIndex', sel);
                },
                slot: '1,3' //all sliders are placed into this Table Cell
                }
              );
    };
    
    
    
    /**
     * <p>Custom color list itemRender to add attribute 'mstridx' in order to find 'selectedIndex' quickly and correctly</p>
     */
    var colorItemRender = function(item, idx, widget) {
        return '<div mstridx="' + idx + '" class="mstrmojo-ColorPicker-item ' + widget.itemCssClas +
                 '" style="background-color:' + item.v + ';" type="button" ' +
                 'title="' + item.n + '">' +
               '</div>';
    };

    
    /**
     * <p>This Color Picker List arranges the colors items as multiple items per row. 
     * The original mstrmojo.ListMapper.findIndex will not work in this scenario since it depends 
     * on each item's offsetTop which in this scenario is same for multiple items</p>
     */
    var listMapper = mstrmojo.hash.copy(
                    {
                        findIndex: function(w,p,node) {
                                        return node.getAttribute('mstridx') || -1;
                                    }
                    },
                    mstrmojo.hash.copy(mstrmojo.ListMapper)
     );
    
    
    /**
     * <p>Build List Widget for Basic Colors and User Palette</p>
     * @param {Object} editor The reference to this Color Picker Widget instance. 
     *        (since Basic and Advanced versions have different laytout, this param make it easy to get the need reference.)
     * @param {Object} ps Additional properties added to the List instance
     */
    var _createColorList = function(editor, ps) {
        return mstrmojo.hash.copy(
                ps,
                {//Basic defintion
                    scriptClass: 'mstrmojo.List',
                    cssClass: 'mstrmojo-ColorPicker-list',
                    itemMarkupFunction: colorItemRender,
                    listMapper: listMapper,
                    onchange: null, //to be defined by List instance
                    
                    //To be called by onchange()
                    _onchange: function() {
                        this.set('selectedColor', this.selectedItem.v);
                        editor.set('selectedColor', this.selectedItem.v);
                        
                        //callback provided in instance
                        if ((editor.isSimple || !editor.expanded) && editor.onChange) {
                            editor.onChange();
                        }
                    },
                    onselectedColorChange: function() {
                        editor.colorModel.set('hex', this.selectedColor);
                    }
                }
                );
    };


    /**
     * <p>Color Picker</p>
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.ColorPicker = mstrmojo.declare(
         
         //superclass
         mstrmojo.Container,  
          
         //mixins
         [mstrmojo._HasPopup],
         
        /**
         * @lends mstrmojo.ColorPicker.prototype
         */
        {
            scriptClass: "mstrmojo.ColorPicker",
    
            markupString: '<div id={@id} class="mstrmojo-ColorPicker {@cssClass} {@shadowCssClass}" style="height:{@height}; width:{@width};{@cssText}">' + 
                            '<div class="mstrmojo-ColorPicker-box"></div>' +
                          '</div>',
            
            markupSlots: {
                 containerNode: function() { return this.domNode.firstChild; }
            },
            markupMethods: {
                onvisibleChange: function(){this.domNode.style.display = this.visible? 'block' : 'none';},
                onexpandedChange: function(evt) {this.domNode.className = this.domNode.className.replace(/ expanded/, '') + (this.expanded ? ' expanded' : '');}
            },
            
            /**
             * <p>Flag to indicate thow this widget is set visible/hidden</P>
             * <p>true - the markupMethod onvisibleChange will not do anything, it rely on property 'show' to slide in/out</p>
             * @type Boolean
             * @default true
             */
            useAnimate: true,
            
            /**
             * <p>Apply build-in shadow cssClass</P>
             * @type Boolean
             * @default true 
             */
            useShadow: true,
            
            
            /**
             * <p>Render this widget as a simple color picker</p>
             * <p>Simple Color Picker include 'No Color', 'Basic Colors', and existing 'User Palette'</p>
             * @type Boolean
             * @default false 
             */
            isSimple: false,
            
            /**
             * <p>Flag to show 'No Color' button at GUI top</p>
             * @type Boolean
             * @default true
             */
            showNoColor: true,

            /**
             * <p>Flag to show 'More Colors ...' button</p>
             * @type Boolean
             * @default true
             */
            showMoreColors: true,
            
            /**
             * <p>Flag to show 'Gradients ...' button at GUI bottom</p>
             * @Boolean
             * @default true
             */
            showGradients: true,
            
            /**
            * <p>Enable User Palette update</p>
            * <p>Updating requires task request, however some scenario may not have session available, where this should be se to false</p>
            * @type Boolean
            * @default true 
            */
           showUserPalette: true,
           
            /**
             * <p>Widget Dimension - Height of simply color picker layout</p>
             * @type {String}
             * @default '168px'
             */
            height: '168px',
            
            /**
             * <p>Widget Dimension - Height of advanced color picker layout</p>
             * @type {String}
             * @default '326px'
             */
            fullHeight: '326px',

            /**
             * <p>Widget Dimension - Width of simply color picker layout</p>
             * @type {String}
             * @default '158px'
             */
            width: '158px',
            
            /**
             * <p>Widget Dimension - Width of advanced color picker layout</p>
             * @type {String}
             * @default '366px'
             */
            fullWidth: '366x',
            
            /**
             * <p>Flag to indicate whether the advanced layout is expanded </p>
             * @type {Boolean}
             * @default false
             */
            expanded: false,
            
            /**
             * <p>Event handler for 'expanded' change</p>
             * @param {mstrmojo.Event} evt
             * @return
             */
            onexpandedChange: function(evt) {

            	var domNode = this.domNode,
            		height = parseInt(this.height, 10), //predefined collapsed ColorPicker height
            		width = parseInt(this.width,10), //predefined collapsed ColorPicker width
            		fullHeight = parseInt(this.fullHeight, 10), //predefined collapsed colorpicker width Advanced ColorPicker height.
            		fullWidth  = Math.max(parseInt(this.fullWidth,10), domNode.scrollWidth); //Advanced ColorPicker width. Use 'scrollWidth' to get the right width at different locales.
            	
            	if (this.useAnimate != false) {
	                if (evt.value) {
	                    slideProp(true, domNode, 'width', width, fullWidth);
	                    slideProp(true, domNode, 'height', height, fullHeight);
	                } else {
	                    slideProp(true, domNode, 'width', fullWidth, width);
	                    slideProp(true, domNode, 'height', fullHeight, height);
	                }
            	} else {
            		if (evt.value) {
	                    domNode.style.width = fullWidth + 'px';
	                    domNode.style.height = fullHeight + 'px';
	                } else {
	                	domNode.style.width = width + 'px';
	                    domNode.style.height = height + 'px';
	                }
            	}
            },
            
            /**
             * <p>This is the user selected color value</p>
             * <p>Any widget that include this ColorPicker should add eventListener for this property value change to access it.</p>
             * @type String
             */
            selectedColor: null,
            
           
            /**
             * <p>Callback when selecting a color from the Basic Colors or User Palette</P>
             * <p>This callback is triggered when color picker is in simple layout or not expanded advanced layout</p>
             */
            onChange: null,
            
            /**
             * <p>Select the given color in the color palette when this editor is open</P>
             * @param {String} color Hex string color value
             * @private
             */
            _updateSelection: function(color) {
                //var color = this.selectedColor,
                var cp = (this.isSimple) ? this: this.layout.cp;
                    
                if (color) {
                    var idx = mstrmojo.array.find(cp.basicColors.items, 'v', color);
                    if (idx > -1) {
                        cp.basicColors.set('selectedIndex', idx);
                    }
                    else {
                        idx = mstrmojo.array.find(cp.userPalette.items, 'v', color);
                        if (idx > -1) {
                            cp.userPalette.set('selectedIndex', idx);
                        }
                    }
                }
            },
        
            visible: false,
            onvisibleChange: function() {
                //when open this editor, check whether target color changed:
                if (this.visible) {
                	//If color is 'transparent', set it to be '#FFFFFF' in order to get valid colorModel components just for display purpose
                    this.selectedColor = this.selectedColor && this.selectedColor.replace(/transparent/,'#FFFFFF') || '#FFFFFF';
                    this.colorModel.set('hex', this.selectedColor);
                    this._updateSelection(this.selectedColor);
                } 
            },
            
            /**
             * <p>Color Picker opener is expected to set default selectedColor when open color picker</p>
             * <p>Then when selectedColor changes, find out which color in the color set and set the selectedIndex</p>
             */
            onselectedColorChange: function() {
                this._updateSelection(this.selectedColor);
            },
            
            
            init: function(props) {

                var me = this;
                //create a model to contain hsb slider data, rgb data, hex data;
                //when one of them changes, update others
                this.colorModel = new mstrmojo.Model(
                        {
                            h: 0,
                            s: 0,
                            v: 100,
                            
                            _hsvChange: function(updateSBColor) {
                                //update hex
                                this.hex = '#' + $C.hsv2hex(this.h, this.s, this.v);
                                
                                //update rgb
                                var rgb = $C.hsv2rgb(this.h, this.s, this.v);
                                this.r = rgb[0];
                                this.g = rgb[1];
                                this.b = rgb[2];
                                
                                me.set('colorModel', mstrmojo.hash.copy(this, {}));
                            },
                        
                            _rgbChange: function(updateSBColor) {
                                //update hex
                                this.hex = '#' + $C.rgb2hex(this.r, this.g, this.b);
                                
                                //update rgb
                                var hsv = $C.rgb2hsv(this.r, this.g, this.b);
                                this.h = hsv[0];
                                this.s = hsv[1];
                                this.v = hsv[2];
                                
                                
                                //this.raiseEvent({name: 'colorModel'});
                                me.set('colorModel', mstrmojo.hash.copy(this, {}));
                            },
                            onhChange: function(){
                                //update rgb and hex
                                this._hsvChange(this.s !== 0);
                            },
                            onsChange: function(){
                                //update rgb and hex
                                this._hsvChange(false);
                            },
                            onvChange: function(){
                                //update rgb and hex
                                this._hsvChange(false);
                            },

                            onrChange: function(){
                                //update hsb and hex
                                this._rgbChange();
                            },
                            ongChange: function(){
                                //update hsb and hex
                                this._rgbChange();
                            },
                            onbChange: function(){
                                //update hsb and hex
                                this._rgbChange();
                            },
                            onhexChange: function(){
                                //update hsb and rgb
                                var rgb = $C.hex2rgb(this.hex);
                                this.r = rgb[0];
                                this.g = rgb[1];
                                this.b = rgb[2];
                                
                                var hsv = $C.hex2hsv(this.hex);
                                this.h = hsv[0];
                                this.s = hsv[1];
                                this.v = hsv[2];
                                
                                me.set('colorModel', mstrmojo.hash.copy(this, {}));
                            }
                        });
                
                this._super(props);
            },
            
            postBuildRendering: function() {
                if (this._super) {
                    this._super();
                }
                //
                this.colorModel.set('hex', this.selectedColor || '#FFFFFF');
                this.colorModel.set('s', 50);
                //this.set('visible', true);
            },
            
            preBuildRendering: function() {
                if (this._super) {
                    this._super();
                }
                
                if (this.isSimple) {
                    this.height = this.showNoColor ? '155px' : '100px';
                    this.width = '150px';
                }

                this.shadowCssClass = this.useShadow ? 'shadow' : '';
                
                //define Basic Colors List and User Palette List widgets
                //Basic Colors List
                var me = this,
                    noColor = {//No Color  
                        scriptClass: "mstrmojo.Button",
                        cssClass: 'nocolor',
                        text: mstrmojo.desc(959, 'Default'),
                        onclick: function() {
                           me.set('selectedColor', 'transparent');
                           
                           //update widget who open this editor
                           if (me.onChange) {
                               me.onChange();
                           }
                        }
                    },
                    
                    basicColors = _createColorList( this,
                        {
                            alias: 'basicColors',
                            items: mstrmojo.locales.color.colors,
                            onchange: function() {
                                if (this.selectedIndex > -1) {
                                    this.parent.userPalette.set('selectedIndex', -1);
                                    this._onchange();
                                }
                            }
                            
                        }),
                        
                    //User Palette
                    userPalette = _createColorList(this,
                            {
                                alias: 'userPalette',
                                cssClass: 'mstrmojo-ColorPicker-list userPalette',
                                makeObservable: true,
                                bindings: {
			                    	items: function(){
				                    	return me.showUserPalette != false ? mstrmojo.locales.color.userPalette : [];
				                    }
                                },
                                onchange: function() {
                                    //only when this widget is visible, update selection
                                    if (me.visible) {
                                        if (this.selectedIndex > -1) {
                                            this.parent.basicColors.set('selectedIndex', -1);
                                            this._onchange();
                                        }
                                    }
                                },
                                onadd: function() {
                                    this.refresh();
                                    
                                    //only when this widget is visible, update selection
                                    if (me.visible)  {
                                        this.parent.basicColors.set('selectedIndex', -1);
                                        this.set('selectedIndex', 0);
                                    }
                                }
                         });
                
                
                //Is requesting a Simple Color Picker?
                //if so, it will include three components: 'No Color' button, Basic Color and User Palette.
                if (this.isSimple) {
                    //do we need show 'No Color' button
                    if (this.showNoColor) {    
                        this.addChildren(noColor, 0);  //add to first slot
                    }
                           
                    this.addChildren(basicColors);
                    this.addChildren(userPalette);

                    //finished layout definition, stop here.
                    return ;
                }
                //end basic color picker layout definition
                

                ///Advanced Color Picker definition
                var advancedColorPickerLayout = {
                    scriptClass: 'mstrmojo.Table',
                    alias: 'layout',
                    rows: 2,
                    cols: 5,
                    layout: [
                                 //First row
                                 {
                                     cells: [
                                             {colSpan:2},
                                             {colSpan:2},
                                             {}
                                             ]
                                 },
                                 //Second row
                                 {
                                     cells: [{}, {},{},
                                             //{colSpan:2}
                                             {},{}
                                             ]
                                 }
                             ],
                             
                    children:[ 
                              {
                                  scriptClass: 'mstrmojo.VBox',
                                  cssClass: 'mstrmojo-ColorPicker-palette shadow',
                                  alias: 'cp',
                                  children:[noColor,
                                            basicColors,
                                            userPalette
                                  ],
                                  slot:'0,0'
                                  
                              },
                              
                              {
                                  //Saturation/Brightness Slider
                                  scriptClass: 'mstrmojo.Container',
                                  cssClass: 'sbSlider',
                                  markupString: '<div class="{@cssClass}" style="position:relative; {@cssText}" mstrAttach:click,mouseover,mousemove,mousedown,mouseup,mouseout>' +
                                                  '<div class="sbThumb"></div>' + 
                                                '</div>',
                                  markupSlots: {
                                      containerNode: function(){return this.domNode;},
                                      thumbNode: function() {return this.domNode.firstChild;}
                                  },
                                  markupMethods: {
                                	  onbgColorChange: function(){this.domNode.style.backgroundColor = this.bgColor; }
                                  },
                                  hex: null,
                                  bindings: {
                                      hex: "this.parent.parent.colorModel.hex",
                                      bgColor: function() {
                                              //this background-color should be synchronized with Hue slider
                                              return '#' + $C.hsv2hex(this.parent.parent.colorModel.h, 100, 100);
                                             }
                                  },
                                  onhexChange: function() {
                                      if (this.domNode) {
                                          //this.domNode.style.backgroundColor = this.parent.parent.colorModel.sbColor;
                                          
                                          //move thumb position
                                          this.thumbNode.style.left = this.parent.parent.colorModel.s / 100 * 160 - 3 + 'px';
                                          this.thumbNode.style.top =  (1 - this.parent.parent.colorModel.v / 100) * 160 - 3 + 'px';
                                          
                                      }
                                  },
                                  onmousedown: function(evt) {
                                      //initialize when first time mouseover the S/B Slider
                                      var rect = this.domNode.getBoundingClientRect();
                                      this.mouseX0 = rect.left;
                                      this.mouseY0 = rect.top;
                                      this.onmousemove = this._update;
                                      
                                      var me = this;
                                      this.onmouseup = function(evt) {
                                          me.onmousemove = null;
                                          mstrmojo.dom.detachEvent(document.body, 'mouseup', me.onmouseup);
                                      };
                                      
                                      mstrmojo.dom.attachEvent(document.body, 'mouseup', this.onmouseup);
                                  },
                                  onclick: function(evt) {
                                      this._update(evt);
                                  },
                                  _update: function(evt){
                                      var mp = {x:evt.e.clientX, y:evt.e.clientY},
                                          thumbX = Math.min(Math.max(0, mp.x - this.mouseX0), 160),
                                          thumbY = Math.min(Math.max(0, mp.y - this.mouseY0), 160);
                                  
                                      this.thumbNode.style.left = (thumbX - 3) + 'px';
                                      this.thumbNode.style.top = (thumbY - 3)+ 'px';

                                      //update Saturation / Brightness
                                      this.parent.parent.colorModel.s = Math.floor(100 * thumbX / 160); //
                                      this.parent.parent.colorModel.set('v', Math.floor(100 * (1 - thumbY / 160)));
                                  },
                                  slot: '0,1'
                              },
                              {
                                  //Hue Slider
                                  scriptClass: 'mstrmojo.Container',
                                  cssClass:'hueSlider',
                                  markupString: '<div class="{@cssClass}" style="position:relative; {@cssText}" mstrAttach:click,mouseover,mousedown,mouseup,mousemove,mouseout>' +
                                                  '<div class="hThumb"></div>' + 
                                                '</div>',
                                  markupSlots: {
                                      containerNode: function(){return this.domNode;},
                                      thumbNode: function() {return this.domNode.firstChild;}
                                  },
                                  bindings: {
                                      hex:"this.parent.parent.colorModel.hex",
                                      h: "this.parent.parent.colorModel.h"
                                  },
                                  onhexChange: function() {
                                      this._moveThumb();
                                  },
                                  onhChange: function() {
                                      this._moveThumb();
                                  },
                                  _moveThumb: function() {
                                      if (this.thumbNode) {
                                          //move thumb position
                                          this.thumbNode.style.top =  (1 - this.parent.parent.colorModel.h / 360) * 160 - 1 + 'px';
                                      }
                                  },
                                  onmousedown: function(evt) {
                                      //initialize when first time mouseover the S/B Slider
                                      this.mouseY0 = this.domNode.getBoundingClientRect().top;
                                      this.onmousemove = this._update;
                                      
                                      var me = this;
                                      this.onmouseup = function(evt) {
                                          me.onmousemove = null;
                                          mstrmojo.dom.detachEvent(document.body, 'mouseup', me.onmouseup);
                                      };
                                      mstrmojo.dom.attachEvent(document.body, 'mouseup', me.onmouseup);
                                  },
                                  onclick: function(evt) {
                                      this._update(evt);
                                  },
                                  _update: function(evt){
                                      var mp = {x: evt.e.clientX, y: evt.e.clientY},
                                          thumbY = Math.min(Math.max(0, mp.y - this.mouseY0), 160);
                                  
                                      this.thumbNode.style.top = (thumbY - 1) + 'px';
                                      
                                      //update Saturation / Brightness
                                      this.parent.parent.colorModel.set('h', Math.max(0, Math.floor(360 * (1 - thumbY / 160))));
                                  },
                                  slot:'0,2'
                              },
                              
                              {
                                  //Preview
                                  scriptClass: 'mstrmojo.Label',
                                  cssClass: 'mstrmojo-ColorPicker-preview',
                                  markupMethods: {
                                      onbgColorChange: function(){this.domNode.style.backgroundColor = this.bgColor;}
                                  },
                                  bindings: {
                                      bgColor: "this.parent.parent.colorModel.hex"
                                  },
                                  onclick: function() {
                                	  if (me.showUserPalette) {
                                   	   _updateUserPalette(this.bgColor);
                                      }
                                  },
                                  slot:'1,0'
                              },
                              
                              //Hex
                              _createLabel(mstrmojo.desc(7848), 'Hex', '1,0'),
                              
                              //Hex
                              _createInputBoxWithLabel(mstrmojo.desc(7848), '1,0', 'hex', 
                                      {
                                          cssClass: 'hex',
                                          cssDisplay: 'block',
                                          inputNodeCssClass: 'hex',
                                          dtp: 25, //Pattern
                                          constraints: {
                                          		trigger: mstrmojo.validation.TRIGGER.ONKEYUP,
                                          		validator: function(v) {
                          							if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                          									return {code: mstrmojo.validation.STATUSCODE.VALID};
                          							} else {
                          								return {
                          										code: mstrmojo.validation.STATUSCODE.INVALID, 
                          										msg: mstrmojo.desc(7882) //Descriptor:  'Please enter a 6-digit HEX color value in format: #xxxxxx'.
                          										};
                          							}
                          					}
                                          }                                          
                                      }
                              ),
                              
                              
                              //Red
                              _createLabel(mstrmojo.desc(3604), 'Red', '1,1'),
                              
                              //Green
                              _createLabel(mstrmojo.desc(3606), 'Green', '1,1'),
                              
                              //Blue
                              _createLabel(mstrmojo.desc(3608), 'Blue', '1,1'),

                              
                              //Hue
                              _createLabel(mstrmojo.desc(3605), 'Hue', '1,1'),
                              
                              //Saturation
                              _createLabel(mstrmojo.desc(3607), 'Saturation', '1,1'),
                              
                              //Brightness
                              _createLabel(mstrmojo.desc(3609), 'Brightness', '1,1'),
                              

                              //Red
                              _createInputBoxWithLabel(mstrmojo.desc(3604), '1,2', 'r'),
                              
                              _createSlider('r'),
                              
                              //Green
                              _createInputBoxWithLabel(mstrmojo.desc(3606), '1,2', 'g'),
                              
                              _createSlider('g'),
                                  
                              //Blue
                              _createInputBoxWithLabel(mstrmojo.desc(3608), '1,2', 'b'),

                              _createSlider('b'),
                              
                              //Hue
                              _createInputBoxWithLabel(mstrmojo.desc(3695), '1,2', 'h', {cssClass: 'h', max: 360}),
                              _createSlider('h'),
                              
                              //Saturation
                              _createInputBoxWithLabel(mstrmojo.desc(3607), '1,2', 's', {max: 100}),
                              
                              _createSlider('s'),
                              
                              //Brightness
                              _createInputBoxWithLabel(mstrmojo.desc(3609), '1,2', 'v', {max: 100}),
                              
                              _createSlider('v')
                              ]
                                
                }; //end advancedColorPickerLayout
                
                
                //'More colors...' button
                if (this.showMoreColors) {    
                    advancedColorPickerLayout.children.push(
                             { //More Color ...
                                scriptClass: 'mstrmojo.Button',
                                cssClass: 'more',
                                alias: 'more',
                                //text: 'More >>>',
                                title: mstrmojo.desc(7833),
                                onclick: function() {
                                    var editor = this.parent.parent;
                                    editor.set('expanded', !editor.expanded);
                                    this.domNode.setAttribute('title', editor.expanded ? mstrmojo.desc(7834) : mstrmojo.desc(7833)); //'Less Colors' : 'More Colors';
                                    this.domNode.className = editor.expanded ? 'less' : 'more';
                                },
                                slot: '0,0'
                            }
                       );
                }

                //'Gradients...' button
                if (this.showGradients) {    
                    advancedColorPickerLayout.children.push(
                            { //Gradients ...
                                scriptClass: 'mstrmojo.Button',
                                alias: 'showGradients',
                                cssClass: 'ge',
                                text: mstrmojo.desc(4786, 'Gradients...'),
                                title: mstrmojo.desc(7970, 'Open Graident Editor'),
                                onclick: function() {
                                    var editor = this.parent.parent;
                                    editor.set('show', false); //hide colorpicker
                                    editor.parent.ge.set('show', true); //show gradietEditor
                                },
                                slot: '0,0'
                            }
                       );
                }

                //now add advancedColorPickerLayout layout into container widget
                this.addChildren(advancedColorPickerLayout);
                
                //last add buttonbar
                this.addChildren(
                        {
                        scriptClass: "mstrmojo.HBox",
                        cssClass: "mstrmojo-ColorPicker-buttonBar",
                        children: [
                                       
                                   new mstrmojo.Button.newInteractiveButton (mstrmojo.desc(1442),    //OK 
                                           function() {
                                               var editor = this.parent.parent;
                                               //if animating the show/hide, the 'visible' should be set when animation ends
                                               if (!editor.useAnimate) {
                                                   editor.set('visible', false);
                                               }
                                               
                                               //get new user defined color
                                               var hex = editor.colorModel.hex;
                                               if (editor.showUserPalette) {
                                            	   _updateUserPalette(hex);
                                               }
                                               editor.set('selectedColor', hex);
                                              
                                               //call ok callback
                                               if (editor.onOK) {
                                                   editor.onOK();
                                               }
                                           }, 
                                           '#999', 
                                           {alias: 'ok', cssClass: 'mstrmojo-Editor-button'}
                                   ),
                                   new mstrmojo.Button.newInteractiveButton (
                                           mstrmojo.desc(221),        //Cancel 
                                           function(){
                                               var editor = this.parent.parent;
                                               
                                               //if animating the show/hide, the 'visible' should be set when animation ends
                                               if (!editor.useAnimate) {
                                                   editor.set('visible', false);
                                               }
                                               
                                               //call cancel callback
                                               if (editor.onCancel) {
                                                   editor.onCancel();
                                               }
                                           }, 
                                           '#999', 
                                           { alias: 'cancel',cssClass: 'mstrmojo-Editor-button'}
                                   )
//                                   ,
//                                   new mstrmojo.Button.newInteractiveButton (
//                                           mstrmojo.desc(134),    //Apply 
//                                           function(){
//                                               var editor = this.parent.parent;
//                                               
//                                               //get new user defined color
//                                               var hex = editor.colorModel.hex;
//                                               if (editor.showUserPalette) {
//                                            	   _updateUserPalette(hex);
//                                               }
//                                               editor.set('selectedColor', hex);
//                                               
//                                               //call cancel callback
//                                               if (editor.onApply) {
//                                                   editor.onApply();
//                                               }
//                                           }, 
//                                           '#999', 
//                                           { alias: 'apply',cssClass: 'mstrmojo-Editor-button'}
//                                   )
                              ]
                        });
		              
                } //end postCreate

        }); //end mstrmojo.ColorPicker{}
     
    
    
    /**
     * <p>This is local JSON object defining the Popup container for the color picker</p>
     * <p>Each color picker layout (simple, advanced or advanced with gradients button) will create an instance base on this</p>
     */
    var _colorPickerPopupJson = {
            scriptClass: 'mstrmojo.Popup',
            slot: "popupNode",
            contentNodeCssClass: "mstrmojo-ColorPicker-popup-content",
            autoCloses: false,
            locksHover: true,
            onOpen: function() {
                    //make the current color selected in color palette
                    this.colorPicker.set('selectedColor', this.opener.fillColor);
                    
                	//#412104 - For IE7, delay moving the popup domNode to the new opener
                    var me = this;
                    var _onOpen = function() {
                    	//Popups share one single color picker instance which is inserted to the first popup node, if this popup is used in multiple colorDropDowns.
                    	//when other popup opens, we need move the color pick domnode to the this current opener popup to display it correctly.
                    	me.lastOpener = me.lastOpener || me.opener;
                    	if (me.opener !== me.lastOpener) {
                    		me.opener.popupNode.appendChild(me.lastOpener.popupRef.domNode);
                    		me.lastOpener = me.opener;
                    	}
                    	me.colorPicker.set('show', true);
                    };
                    window.setTimeout(function(){_onOpen();}, 100);
    			},
            onClose: function() {
                    this.colorPicker.set('show', false);
                    
                    //if this colorpicker support gradient
                    if (this.ge) {
                       this.ge.set('show', false);
                    }
                    },
            postCreate: function() {
                        //we do not want this default behavior
                        this.markupMethods = mstrmojo.hash.copy(this.markupMethods);
                        this.markupMethods.onvisibleChange = null;
                    },
             preBuildRendering: function() {
                        if (this.showGradients || this.colorPicker.showGradients) {
                            this.addChildren(this.gradientRef);
                        }
                    },
             gradientRef: {
                                scriptClass: 'mstrmojo.GradientEditor',
                                alias: 'ge',
                                cssText: 'height:0; display:none; position:absolute; z-index: 4;',
                                visible: false, //disalbe Editor's open/close behavior
                                showTitle: false,
                                height: 240,
                                _resizeHandler: function(){},//override the resizeHandler so that it does not center the editor.
                                onOK: function() {
                                        //notify opener
                                        this.parent.opener.set('gradient', this.gradient);
                                        this.parent.opener.set('gradientCss', this.gradient.css);
                                        
                                        //slide out
                                        this.set('show', false);
                                },
                                onCancel: function() {
                                    //slide out
                                    this.set('show', false);
                                },
                                onshowChange: function(evt) {
                                        var show = evt.value,
                                            height = parseInt(this.height, 10);
                                        var target = this.domNode.firstChild;
                                        
                                        if (show) {
                                            //TODO: set gradient info model
                                            this.set('model', this.parent.opener.gradient);
                                            target.style.display = 'block';
                                        }
                                        
                                        if (this.useAnimate != false) {
                                            var start = show ? 0 : height,
                                            stop = height - start,
                                            me = this;
                                        
                                            //if sliding in, make sure it is visible first
                                            target.style.overflow = 'hidden'; 
                                            if (show) {
                                                target.style.display = 'block';
                                            }
                                            slideProp(evt.value, target, 'height', start, stop, 
                                                    function(){
                                                        if (!show) {
                                                            //totally hide it
                                                            target.style.display='none';
                                                            var opener = me.parent.opener; 
                                                            if (opener) {
                                                                opener.closePopup();
                                                            }
                                                        }
                                                        else {
                                                            //when showup, we need this to make sure colorpicker is fully visible
                                                            target.style.overflow = 'visible';
                                                            }
                                                }
                                            );
                                        } else {
                                        	target.style.height = show ? height + 'px' : 0;
                                        	target.style.display = show ? 'block': 'none';
                                        }
                                    },
                                    postCreate: function() {
                                        this.bindings = {
                                 	   			useAnimate: "this.parent.opener.useAnimate"
                                 	   };
                                    }
                            },
             children: [
                           
                       { //color picker
                           scriptClass: 'mstrmojo.ColorPicker',
                           alias: 'colorPicker',

                           //for simple version colorPicker
                           onChange: function() {
	                    	   //this code may be called twice if selecting a user color which has same as one of the basic colors
	                    	   //second time, opener is already null.
	                    	   if (!this.parent.opener) return;

                               //update opener's text
                               this.parent.opener.set('fillColor', this.selectedColor);
                               
                               //hide this color picker
                               this.set('show', false);
                               
                               //close popup
                               this.parent.opener.closePopup();
                           },
                           //for advanced colorpicker
                           onOK: function() {
                               this.onApply();                                                           

                               //close popup
                               this._closePopup();
                           },
                           //for advanced color picker
                           onApply: function() {
                               //update opener's text
                               this.parent.opener.set('fillColor', this.selectedColor);
                           },
                           onCancel:function() {
                               //close popup
                             this._closePopup();
                           },
                           _closePopup: function() {
                               //hide this color picker
                               this.set('show', false);

                               //close popup
                               if (!this.showGradients || !this.parent.ge || this.parent.ge && !this.parent.ge.show) {
                                   this.parent.opener.closePopup();
                               }
                           },
                           show: false,
                           onEnd: function() {this.set('visible', this.show);},
                           onshowChange: function() {
                               var height = parseInt(this.expanded ? this.fullHeight : this.height, 10);
                               if (this.useAnimate != false) {
                            	   var start = this.show ? 0 : height,
                                		   stop = height - start,
                                		   me = this,
                                		   onEnd = (!this.show ? function(){me.onEnd();} : null);

                                   //if sliding in, make sure it is visible first
                                   if (this.show) {
                                	   this.set('visible', true);
                                   }

                                   //slide in/out
                                   slideProp(this.show, this.domNode, 'height', start, stop,  onEnd);
                               } else {
                            	   this.set('visible', this.show);
                            	   this.domNode.style.height = height + 'px';
                               }
                           },
                           
                           postCreate: function() {
//                               this.isSimple = this.parent.isSimple;
//                               this.showGradients = this.parent.showGradients;
                               this.bindings = {
                        			   //This binding sets property 'showUserPalette' set on DropDownButton (ColorPicker opener)
                            		   showUserPalette: function() {
		                            	   return this.parent.opener ? this.parent.opener.showUserPalette : this.showUserPalette;
		                               },
		                               useAnimate: function() {
		                            	   return this.parent.opener ? this.parent.opener.useAnimate : this.useAnimate;
		                               },
		                               isSimple: function() {
		                            	   return this.parent.opener ? this.parent.opener.isSimple : this.isSimple;
		                               },
		                               showGradients: function() {
		                            	   return this.parent.opener ? this.parent.opener.showGradients : this.showGradients;
		                               },
		                               showNoColor: function() {
		                            	   return this.parent.opener ? this.parent.opener.showNoColor : this.showNoColor;
		                               }
                        	   };
                           }
                    
                       }
                ]
        };
    
    
    /**
     * <p>Define three color picker layout. The difference is just one flag property that set to determine whether to render certain widget components</p>
     * <p>The purpose of these definitions are to ensure only one instance for each type</p>
     */
    //Default color picker instance
    mstrmojo.colorPickerPopupRef = mstrmojo.insert(_colorPickerPopupJson);

    //Simple version of color picker - only Basic colors and User Palette.
    mstrmojo.simpleColorPickerPopupRef = mstrmojo.insert(mstrmojo.hash.copy({isSimple: true}, mstrmojo.hash.copy(_colorPickerPopupJson)));
    
    //For colorDropDown which accepts gradient as background - show 'Gradients' button
    mstrmojo.gradientColorPickerPopupRef = mstrmojo.insert(mstrmojo.hash.copy({showGradients: true}, mstrmojo.hash.copy(_colorPickerPopupJson)));
    
    
    /**
     * <p>Create a Color DropDown Button</p>
     * <p>A layout config can be passed to decide which color picker layout to apply.</p>
     * 
     * @param {Object} ps Properties to be set into DropDownButton instance
     * @param {Object} layoutConfig Object to set flag properties to decide type of widget layout
     * @param {Boolean} layoutConfig.isSimple Use simple widget layout
     * @param {Boolean} layoutConfig.showGradients Show 'Gradients' button in layout
     */
    mstrmojo.ColorPicker.createDropDown = function cdd(ps, layoutConfig) {
    	ps = ps || {};
    	
        //prepare popupRef based on given layoutConfig
    	var popupRef = mstrmojo.colorPickerPopupRef;
    	
    	//TODO: this code block about 'layoutConfig' should be removed and its corresponding setting should be moved to 'ps'
    	//once all related code are updated (eg FormatEdtior and GradientEditor)
        if (layoutConfig) {
            if (layoutConfig.isSimple) {
                popupRef = mstrmojo.simpleColorPickerPopupRef;
                ps.isSimple = layoutConfig.isSimple;
            }
            else if (layoutConfig.showGradients) {
                popupRef = mstrmojo.gradientColorPickerPopupRef;
                ps.showGradients = layoutConfig.showGradients;
            }
        } else { 
	        //After related changes in this version, the color picker layout config can now be set to 'ps' for DropDownButton.
	        //so should do the following:
	        if (ps) {
	            if (ps.isSimple) {
	                popupRef = mstrmojo.simpleColorPickerPopupRef;
	            }
	            else if (ps.showGradients) {
	                popupRef = mstrmojo.gradientColorPickerPopupRef;
	            }
	        }
        }
        
        //create color DropDownButton
        return mstrmojo.hash.copy(
                ps,
                {
                    scriptClass: 'mstrmojo.DropDownButton',
                    cssClass: 'mstrmojo-ColorPicker-DropDownButton',
                    markupMethods: {
                        onfillColorChange: function() {
                            if (this.boxNode && this.fillColor) {
                                this.boxNode.style.cssText = 'background-color: ' + this.fillColor;
                                
                                //reset gradient
                                this.gradient = null;
                                this.gradientCss = null;
                            }
                        },
                        ongradientCssChange: function() {
                            if (this.boxNode && this.gradientCss) {
                                this.boxNode.style.cssText = this.gradientCss;
                          
                                //reset fillColor
                                this.fillColor = null;
                            }
                        }
                    },
                    popupRef: popupRef,
                     
                    //Public Properties:
                    /**
                     * Flag to show UserPalette
                     * @type Boolean
                     * @default true
                     */
                    showUserPalette: true,
                    
                    /**
                     * Flag to slide in/out color picker
                     * @type Boolean
                     * @default true
                     */
                    useAnimate: true,
                    
                    /**
                     * Flag to show 'gradients' button
                     * @type Boolean
                     * @default false
                     */
                    showGradients: false,
                    
                    /**
                     * Flag to show simple version of color picker
                     * @type Boolean
                     * @default false
                     */
                    isSimple: false
                    
                    /**
                     * <p>fillColor</p>
                     * <p> - This property contains the selected color value from Color Picker; it also sets as background-color of this Dropdown button.
                     * The code that expects to receive color from this ColorDropDown should listen to 'fillColorChange' event.</p>
                     * 
                     * @type String Hex color value
                     * fillColor: '#012345' //example
                     */
                }
         );
    };
    
    
})();
