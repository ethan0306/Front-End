(function () {

    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo.hash");

/************************Private methods*********************************/
    function animatePage(start, stop, duration, props) {
        var cfg = mstrmojo.hash.copy(props, {
            props: {
                left: { 
                    isStyle: true, 
                    start: start, 
                    stop: stop, 
                    suffix: 'px', 
                    ease: mstrmojo.ease.linear 
                }
            },
            duration: duration
        });
        
        (new mstrmojo.fx.AnimateProp(cfg)).play();
    }
    
    function turnPage(me, curr, prev, direction) {
        
        var dn = me.domNode,
            sw = dn.offsetWidth;
        
        //428369; The animation looks bad on FF3.5 and below
        var animate = !(/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) || Number(RegExp.$1) > 3.5,
            d = direction ? 1 : -1,
            wf = parseInt(sw, 10) * d,
            duration = animate ? 500 : 0;
        
        animatePage(0, -wf, duration, {
            target: prev,
            duration: duration,
            preStart : function(){
                this.target.style.overflowY = "hidden";
            }
        });
        
        animatePage(wf, 0, duration, {
            target: curr,
            preStart : function(){
                this.target.style.overflowY = "auto";
            }
        });
        
        if(me.waiting) {
            animatePage(0, -wf, duration, {
                widget: me,
                slot: 'loaderNode',
                onEnd : function(){
                    this.widget.waiting = false;
                }
            });
        } 
    }
    
    var logicPageSwitch = function (me) {
        var cp = me.currentPage;
        if (cp === me.p1Node) {
            cp = me.p2Node;
        } else {
            cp = me.p1Node;
        }
        me.currentPage = cp;
    };
    
    
    /**
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.Booklet = mstrmojo.declare(

        mstrmojo.Widget,

        null,

        /*
         * @lends mstrmojo.Booklet.prototype
         */
        {
            scriptClass: "mstrmojo.Booklet",
            
            
        /************************Markup variables and methods*********************************/ 
            pageClass : "mstrmojo-BookletPage",
            
            markupString: '<div id="{@id}" class="mstrmojo-Booklet {@cssClass}" style="{@cssText}">' + 
                            '<div id="{@id}_p1" class="mstrmojo-BookletPage" ></div>' + 
                            '<div id="{@id}_p2" class="mstrmojo-BookletPage" style="left:-100%;"></div>' +
                            '<div id="{@id}_ldr" class="mstrmojo-BookletLoader" ></div>' + 
                          '</div>',
                          
            markupSlots: {
                containerNode: function () {
                    return this.domNode; 
                },
                p1Node : function () {
                    return this.domNode.firstChild;
                },
                p2Node : function () {
                    return this.domNode.childNodes[1];
                },
                loaderNode : function () {
                    return this.domNode.childNodes[2];
                }
            },
            
            markupMethods: {
                onnextChange : function () {
                    var n = this.next;
                    if (!n) {
                        return;
                    }
                    
                    // Switch pointers to new page and keep a reference to the page that we are changing.
                    var prev = this.currentPage,
                        p1 = this.p1Node,   
                        curr = this.currentPage = (prev == p1) ? this.p2Node : p1;  
                
                    // Has the next widget NOT been instantiated yet?
                        if(!(n instanceof mstrmojo.Obj)){
                        // Insert making sure to replace non-instantiated version in this.next.
                        n = this.next = mstrmojo.insert(n);
                    }
                    
                    // Has the next widget NOT been rendered yet? 
                    if(!n.hasRendered){
                        // Add placeholder to current panel.
                        n.placeholder = curr.appendChild(document.createElement('span'));
                        
                        // Render.
                        n.render();
                    } else {
                        //add the next node to the current page.
                        if (curr.firstChild){
                            curr.replaceChild(n.domNode, curr.firstChild);
                        }else{
                            curr.appendChild(n.domNode);
                        }
                    }
                    
                    // Hide waiting node.
                    this.set('waiting', false);
                    
                    // Physically move the pages.
                        if(curr && prev){
                            turnPage(this, curr, prev, this.turnDirFwd);
                        }
                },
                
                onwaitingChange : function(evt){
                    this.loaderNode.style.left = (this.waiting) ? 0 : '-100%'; 
                },

                onheightChange : function(evt){
                    if(this.height){
                         this.domNode.style.height = this.height;
                    }
                },

                onwidthChange : function(evt){
                    if(this.width){
                       this.domNode.style.width = this.width;
                    }
                }
            },
            
        /************************Instance variables*********************************/
            enabled : true,
            
            waiting : false,
            
            //The next widget to be displayed
            next : null,
            
            //Pointer to the current displayed page
            currentPage : null,
            
            //Direction of the page turn, true if forward, false for backwards
            turnDirFwd : true,
            
            FORWARD : true,
            
            REVERSE : false,
            
        /************************Instance methods*********************************/
            
            turnFwd : function(w){
                this.turn(w, this.FORWARD);
            },
            
            turnBack : function(w){
                this.turn(w, this.REVERSE);
            },
            
            turn : function(w, direction){
                this.set('turnDirFwd',direction);
                this.set('next',w);
            }
        }
    );
    
})();