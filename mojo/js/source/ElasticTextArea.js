(function(){
    mstrmojo.requiresCls(
        "mstrmojo.TextArea",
        "mstrmojo.Button",
        "mstrmojo.Label",
        "mstrmojo.Box",
        "mstrmojo.fx",
        "mstrmojo.css",
        "mstrmojo.DropDownButton"
    );
    
    var INPUT = 1,
        TEXTAREA = 2,
        txtArea = null,
        timer = null,
        $D = mstrmojo.dom,
        $C = mstrmojo.css;        
    
    var _Duration = 400;
    
    /**
     * <p>
     * Animation effect of sliding in/out of a widget
     * </p>
     * 
     * @param {Boolean}
     *            show Boolean to indecate show or hide
     * @param {Object}
     *            widget Mojo Widget Instance
     */
    function slideProp(show, target, prop, start, stop, onEnd, ease, extraProps) {

        // set animation properties
        var props = {
                duration: _Duration,
                target : target,
                onEnd : function() {
                    if (onEnd) {
                        onEnd();
                    }
                },
                props: {}
            };
        
        props.props[prop] = {
                ease : ease || mstrmojo.ease.sin,
                start : parseInt(start, 10),
                stop : parseInt(stop, 10),
                suffix : 'px'
            };//targetProps;

        // copy in other widget specific animation properties
        props = mstrmojo.hash.copy(extraProps, props);

        // Animation instance
        var fx = new mstrmojo.fx.AnimateProp(props);

        fx.play();
        
        return fx;
    }
   
    
    
    
    mstrmojo.ElasticTextArea = mstrmojo.declare(
        //base class
        mstrmojo.Container,
        
        //mixin
        null,
        
        /**
         * @lends mstrmojo.ElasticTextArea.prototype
         */
        {
            scriptClass: 'mstrmojo.ElasticTextArea',
            
            markupString: '<div id="{@id}" class="mstrmojo-ElasticTextArea {@cssClass}" style="{@cssText}" mstrAttach:blur >' +
                                '<div class="mstrmojo-ElasticTextAreaContent " style="height: 100%;"></div>' + 
                            '</div>',
            markupSlots: {
                containerNode: function() { return this.domNode.firstChild;} 
            },


            markupMethods: {
                onvalueChange: function() {
                    if(this.textNode && this.value !== this.textNode.textArea.value) {
                        this.textNode.textArea.set('value', this.value);
                        this.adjustStatusBar();
                    }
                },

                onvisibleChange: function(){ 
                    this.domNode.style.display = this.visible ? 'inline' : 'none'; 
                },
                
                onwidthChange: function() {
                    if (this.domNode && this.width) {
                        this.domNode.style.width = this.width + 'px';
                    }
                },
                
                ontopChange: function() {
                    if (this.domNode && this.top) {
                        this.domNode.style.top = this.top + 'px';
                    }
                },
                
                onleftChange: function() {
                    if (this.domNode && this.left) {
                        this.domNode.style.left = this.left + 'px';
                    }
                }

            },
            
            /**
             * <p>Height of the &lt;TextArea&gt; in pixel</p>
             * @param {Integer}
             * @default 100
             */
            width: 200,
            

            /**
             * <p>Height of the &lt;TextArea&gt; in pixel</p>
             * @param {Integer}
             * @default 60
             */
            height: 30,
            

            /**
             * <p>Flag to indicate whether the &lt;TextArea&gt; supports the built-in resize handle</p>
             * @param {String} 'none','horizontal','vertical','both','inherit'
             * @default false
             */
            resize: 'none',
            

            /**
             * <p>Maximum number of characters allowed in the &lt;TextArea&gt; </p>
             * @param {Integer}
             * @default 256
             */
            maxLength: 256,
            

            /**
             * <p>Content of the &lt;TextArea&gt; in pixel</p>
             */
            value: '',
            
            postCreate: function() {
                this.minHeight = this.height;
                
                var me = this;
                this.children = [
                                    {
                                        scriptClass: 'mstrmojo.Box',
                                        alias: 'textNode',
                                        cssText: 'width:100%;',
                                        
                                        onheightChange: function(evt) {
                                            //this.domNode.style.width = this.width + 'px';
                                            var mh = this.parent.minHeight,
                                                start = Math.max(mh, evt.valueWas || 0),
                                                end = Math.max(mh, evt.value); //this.height
                                            
                                            if (start !== end) {
                                                if ($D.isIE7){
                                                    //"Height:100%" doesn't work for <textarea> in IE7, so we directly set the height to the expected value
                                                    this.textArea.domNode.style.height = this.domNode.style.height = end + 'px';
                                                }else if (this._slidingFx && this._slidingFx.isPlaying){
                                                    // If the animation is already started, we should update the stop value so that the final height would be correct 
                                                    this._slidingFx.props.height.stop = end;
                                                }else{
                                                    this._slidingFx = slideProp(true, this.domNode, 'height', start, end);
                                                }
                                            }
                                        },
                                        
                                        children: [
                                                   {
                                                       scriptClass: 'mstrmojo.TextArea',
                                                       alias: 'textArea',
                                                       cssClass: 'eta-text', 
                                                       cssText: 'width:100%;height:100%;',
                                                       rows: 1,
                                                       bindings: {
                                                           maxLength: 'this.parent.parent.maxLength'
                                                       },
                                                       onblur: function(e) {
                                                           if(me.onblur) {
                                                               me.onblur(e);
                                                           }
                                                       },
                                                       onkeyup: function(e) {
                                                           //avoid IE7 & 8 to one character more than maxLength
                                                           var ml = this.maxLength,
                                                               strLen = this.value.length;
                                                           if (ml <= strLen && !this.isArrowKeys && !this.isDeleteKeys) {
                                                               if ($D.isIE7 || $D.isIE8) {
                                                                   this.value = this.domNode.value = this.value.substr(0, Math.min(strLen, ml));
                                                               }
                                                               return false;
                                                           }

                                                           //set value and show tooltip
                                                           var p = this.parent.parent;
                                                           p.set('value', this.value);
                                                           p.adjustStatusBar();
                                                       } 
                                                   },
                                                   
                                                   { //Ghost DIV to assist finding the height of user input
                                                       scriptClass: 'mstrmojo.Label',
                                                       cssClass: 'eta-text ghost',
                                                       alias: 'ghost',
                                                       cssText: 'visibility: hidden; z-index:-1; position:absolute;left:0; top:0;  word-wrap:break-word; border:1px solid red; none; margin:0; padding:2; width:100%;',
                                                       bindings: {
                                                           text: "this.parent.parent.value"  
                                                       },
                                                       _setHeight: function(dh) {
                                                           //get default height or content height
                                                           var h = Math.max(dh||0, this.domNode.clientHeight);
                                                           
                                                           this.parent.set('height', h);
                                                       },
                                                       postCreate: function() {
                                                           this.markupMethods = mstrmojo.hash.copy(this.markupMethods);
                                                           this.markupMethods.ontextChange = function(evt) {
                                                               //update text
                                                               if (this.domNode && this.text) {
                                                                   //this.domNode.innerHTML = this.text.replace(/\n/g, '<br />&nbsp;');
                                                                   this.domNode.innerHTML = this.text.replace(/<br \/>&nbsp;/, '<br />').replace(/<|>/g, ' ').replace(/&/g,"&amp;").replace(/\n/g, '<br />&nbsp;'); 
                                                               }

                                                               //set height based on content
                                                               this._setHeight();
                                                           };
                                                       },
                                                       postBuildRendering: function(props) {
                                                           if (this._super) {
                                                               this._super(props);
                                                           }
    
                                                           //set default height
                                                           this._setHeight(this.parent.parent.height);
                                                       }
                                                   }
                                         ]
                                                   
                                    },
                                    {
                                        scriptClass: 'mstrmojo.Label',
                                        alias: 'statusBar',
                                        cssClass: 'eta-bar',
                                        text: ''
                                    },
                                    {
                                        scriptClass: 'mstrmojo.Label',
                                        alias: 'msgBoxTip',
                                        cssClass: 'eta-tip',
                                        cssText: $D.isIE8 ? 'bottom: -4px;' : ''
                                    } 
                        ]; 
            },
            
            preBuildRendering: function preBldRndr() {
                this._super();
                this.textNode.height = 0;
            },
            
            postBuildRendering: function pstBldRndr() {
                if(this._super) {
                    this._super();
                }
                
                this.textNode.textArea.set('value', this.value);
                this.adjustStatusBar();
            },            
            
            onmaxLengthChange: function(evt){
                //check 'evt.value' since it this may be called by binding to popup opener when it has no value set yet.
                if (evt.value) {
                    this.adjustStatusBar();
                }
            },
            
            onfontChange: function(evt){
                var textArea = this.textNode.textArea, 
                    ghost = this.textNode.ghost, f;
                
                for (f in this.font) {
                    this.domNode.style[f] = this.font[f];
                    
                    //IE7 does not inherit font info correctly
                    if ($D.isIE7) {
                        textArea.domNode.style[f] = this.font[f];
                        ghost.domNode.style[f] = this.font[f];
                        this.statusBar.domNode.style[f] = this.font[f];
                    }
                }
                
                //In IE9, adjust font size doesn't automatically update the line height. 
                if ($D.isIE9){
                    textArea.refresh();
                }
                
                //if font size gets changed, reset the height
                ghost._setHeight();
            },
            
            adjustStatusBar: function() {
                if (!this.msgBoxTip.domNode) {
                    return;
                }
                
                var eta = this,
                    mc = this.maxLength,
                    textArea = this.textNode.textArea,
                    strLen = (textArea.value && textArea.value.length) || 0,
                    r = strLen/mc,
                    msgBox = this.statusBar,
                    msgBoxTip = this.msgBoxTip;
                
                //update position
                var dotLeft = r * this.width;
                
                msgBoxTip.domNode.style.left = Math.min(Math.ceil(dotLeft - msgBoxTip.domNode.offsetWidth / 2 ), this.width-3) + 'px';
                msgBox.set('text', mstrmojo.desc(4891, strLen + ' of ' + mc).replace('##', strLen).replace('###', mc));
            },
            
            focus: function() {
                $D.setCaret(this.textNode.textArea.domNode, ((this.value && this.value.length) || 0));
            }
        }
    );
    

    mstrmojo.ElasticTextAreaButton = mstrmojo.declare(
            //base class
            mstrmojo.DropDownButton,
            //mixin
            null,
            /**
             * @lends mstrmojo.ElasticTextAreaButton.prototype
             */
            {
                scriptClass: 'mstrmojo.ElasticTextAreaButton',
                cssClass: "mstrmojo-ElasticTextAreaButton",
                popupToBody: false,
                popupWidth: 200,
                maxLength: 256,
                
                unrender: function unrender(ignoreDom){
                    var pr = this.popupRef;
                    if(this.popupToBody && pr.hasRendered){
                        pr.unrender(false);
                    }
                    if(this._super){
                        this._super(ignoreDom);
                    }
                },
                
                postBuildRendering: function pstBldRndr() {
                    if(this._super) {
                        this._super();
                    }
                    
                    if(this.value && this.value.length > 0) {
                        $C.addClass(this.domNode, 'filled');
                    }
                },                
                
                premousedown: function premousedown(evt) {
                    
                    if(this.popupToBody){
                        var pos = $D.position(this.popupNode, true),
                            pr = this.popupRef,  
                            cfg = {
                                left:Math.round(pos.x) + 'px', 
                                top:Math.round(pos.y) + 'px'
                            };
                        
                        if(!pr.hasRendered){
                            delete pr.slot;
                            cfg.placeholder = document.body.appendChild(document.createElement('div'));
                        }
                        
                        this.popupOpenConfig = this.popupOpenConfig || {};
                        
                        mstrmojo.hash.copy(cfg, this.popupOpenConfig);
                    } else {
                        this.popupRef.slot = "popupNode";
                    }
                    
                    //set the popup text area value
                    if(this.popupRef.eta) {
                        this.popupRef.eta.set('value', this.value);
                    } else {
                        this.popupRef.children[0].value = this.value;
                    }
                    
                    if(this._super){
                        this._super();
                    }
                    
                    //adjust the width of popup
                    var pn = this.popupRef.domNode;
                    if(pn){
                        pn.style.minWidth = (this.domNode.offsetWidth - 2) + 'px';
                    }
                },                
                
                popupRef: {
                            scriptClass: "mstrmojo.Popup",
                            slot: "popupNode",
                            cssClass: "mstrmojo-ElasticTextAreaPopup",
                            shadowNodeCssClass: "mstrmojo-ElasticTextAreaPopup-shadow",
                            contentNodeCssClass: "mstrmojo-ElasticTextAreaPopup-content",
                            autoCloses: false,
                            locksHover: true,
            
                            visible: true,
                            onOpen: function(){
                                var eta = this.eta,
                                    elEta = eta.domNode.firstChild,
                                    start = 0,
                                    end;
                                
                                this.eta.set('font', this.opener.font);

                                elEta.parentNode.style.display = 'block';
                                //set edit icon on the button
                                $C.addClass(this.opener.domNode, 'editing');
                                elEta.parentNode.style.overflow = 'hidden';
                                
                                end = this._h || (elEta.offsetHeight /*+ 21*/);
                                slideProp(false, elEta, 'height', start, end, function(){
                                    elEta.style.height = '100%'; elEta.parentNode.style.overflow = 'visible'; 
                                    eta.focus();
                                    });

                            },
                              
                            onClose: function(){
                                this.visible = false;
                                //this.eta.textNode.textArea.set('value', '');
                                //this.eta.set('value', '');
                                var p = this.eta.domNode,
                                    eta = p.firstChild,
                                    start = eta.offsetHeight,
                                    end = 0;
                                    
                                
                                //save
                                this._h = start;
                                this.opener.set('value', this.eta.value);
                                
                                //unset edit icon on the button
                                $C.removeClass(this.opener.domNode, 'editing');
                                
                                eta.style.height = eta.offsetHeight + 'px';
                                p.style.overflow = 'hidden';
                                slideProp(false, eta, 'height', start, end, function(){p.style.display = 'none';});
                            },
                            children: [
                               {
                                   scriptClass: 'mstrmojo.ElasticTextArea', 
                                   alias: 'eta',
                                   bindings: {
                                       width: function() {
                                           return this.parent.opener.popupWidth;
                                       },
                                       maxLength: function() {
                                           return this.parent.opener.maxLength;
                                       }
                                   }
                               }
                            ]
                    }
            }
    );
    
}());