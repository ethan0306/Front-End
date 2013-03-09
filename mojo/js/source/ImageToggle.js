(function(){
    
    mstrmojo.requiresCls("mstrmojo.array", "mstrmojo.css", "mstrmojo.string");
    
    var $A = mstrmojo.array,
        $C = mstrmojo.css,
        $S = mstrmojo.string,
        _US = 'unselected',
        CSS_DISPLAY = 'inline-block';
    /**
     * @extends mstrmojo.Widget
     */
    mstrmojo.ImageToggle = mstrmojo.declare(
        mstrmojo.Widget,
        null,
        /**
         * @lends mstrmojo.ImageToggle.prototype
         */
        {
            scriptClass: 'mstrmojo.ImageToggle',
            
            /**
             * The url to the unset image 
             */
            unset: null,
            
            useAnimation: true,
            
            markupString: '<div class="mstrmojo-ImageToggle {@cssClass}" style="{@cssText}" tabindex="-1"  mstrAttach:click,blur ></div>',
            
            markupMethods: {
                onimageListChange: function() {
                    var imgs = this.imageList && this.imageList.slice(), //duplicate the image list 
                        me = this,
                        ust = this.unset, i, div, img;
                    //if we have an unset image, add it into the image list
                    if(!$S.isEmpty(ust) && imgs) {
                        imgs.push({n: ust, v: ust, _ust: true});
                    }
                    if(this.domNode && imgs) {
                        me.domNode.innerHTML = '';
                        me.domNode.style.minHeight = Math.min(20, me.height) + 'px';
                        me.domNode.style.minWidth = Math.min(20, me.width) + 'px';
                        me._loadedImgs = imgs.length;
                        mstrmojo.array.forEach(imgs, function(imgObj, i) {
                            div = document.createElement('div');
                            div[div.innerText !== undefined ? 'innerText':'textContent'] = "\u00a0";
                            div.style.cssText = 'display:none;font-size:0px !important;line-height:' + me.height + 'px !important;';
                            
                            img = document.createElement('img');
                            img.alt = img.title = imgObj.v;
                            img.style.verticalAlign = 'middle';
                            img.style.maxHeight = me.height + 'px';
                            img.style.maxWidth = me.width + 'px';
                            
                            if (!mstrmojo.dom.isIE) {
                                //TQMS#480117 set a image not found image if the src is not valid
                                img.onerror = function() {
                                    this.src = '../images/image_not_found.jpg';
                                };
                            }
                            div.appendChild(img);
                            me.domNode.appendChild(div);
                            img.src = imgObj.n || '../images/image_not_found.jpg';
                            
                            //save the unset image index
                            if(imgObj._ust) {
                                me.ustImgIdx = i;
                            }
                            me._imgs[i] = div;
                        });
                        
                        this._setSelectedValue();
                    } 
                },
                onvalueChange: function() {
                    this._setSelectedValue();
                }
            },
            
            imageList: null,
            
            value: null,
            
            selectedIndex: -1,
            
            preBuildRendering: function preBldRnd() {
                if(this._super) {
                    this._super();
                }
                
                this._imgs = [];
            },

            _setSelectedValue: function setSltV() {
                var me = this, 
                    s = this.selectedIndex, 
                    imgs = this.imageList;
                
                if(imgs) {
                    //unselect previous one
                    if(imgs[s]) {
                        me._imgs[s].style.display = 'none';
                    }
                    $A.forEach(this.imageList, function(img, i) {
                        if(img.v == me.value) {
                            $C.removeClass(me.domNode, _US);
                            me.selectedIndex = i;
                            me._imgs[i].style.display = CSS_DISPLAY;
                            return ;
                        }
                    });
                    
                    if(this.selectedIndex === -1) {
                        if(!this.unset) {
                            //unset status
                            $C.addClass(this.domNode, _US);
                        } else {
                            var div = this._imgs[this.ustImgIdx],
                                img = div.firstChild;
                            
                            img.alt = img.title = this.value;
                            div.style.display = CSS_DISPLAY; 
                        }
                    }
                }
            },
            
            onclick: function onclk() {
                var imgs = this.imageList,
                    len = imgs && imgs.length,
                    d = 300,
                    s = this.selectedIndex,
                    ls = s,
                    p = this.domNode,
                    e1, e2, c, t, me = this;
                
                c = (s === -1 && this.ustImgIdx !== null) ? this._imgs[this.ustImgIdx] : this._imgs[s];
                s = (s + 1) % len;
                t = this._imgs[s];
                $C.removeClass(p, _US);
                this.selectedIndex = s;
                
                if (this.useAnimation){
                    e2 = new mstrmojo.fx.FadeIn({
                        duration: d,
                        interval: d/10,
                        target: t,
                        preStart: function(){
                            this.target.style.display = CSS_DISPLAY;
                        }
                    });
                    
                    e1 = new mstrmojo.fx.FadeOut({
                        duration: d,
                        interval: d/10,
                        target: c,
                        onEnd: function() {
                            c.style.display = 'none';
                            //the source image is an unset image, re should remove it when the animation is done
                            if(ls === -1) {
                                me._imgs.splice(me.ustImgIdx, 1);
                                p.removeChild(c);
                                delete me.ustImgIdx;
                            }
                            e2.play();
                        }
                    });
    
                    //some time we will have unset status
                    if(c) {
                        e1.play();
                    }else {
                        e2.play();
                    }
                }else {
                    if (c){
                        c.style.display ='none';
                        if(ls === -1) {
                            me._imgs.splice(me.ustImgIdx, 1);
                            p.removeChild(c);
                            delete me.ustImgIdx;
                        }
                    }
                    t.style.display = CSS_DISPLAY;
                }
                
                this.value = this.imageList[s].v;
            }
        }
    );
}());