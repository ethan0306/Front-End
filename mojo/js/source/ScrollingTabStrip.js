(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Button",
        "mstrmojo.Container",
        "mstrmojo.TabStrip"
    );

    
    /**
     * A Scrollable TabStrip widget. It extends mstrmojo.TabStrip and adds scroll button on both ends when necessary.
     * 
     * @class
     * @extends mstrmojo.TabStrip
     */
    mstrmojo.ScrollingTabStrip = mstrmojo.declare(
        // superclass
        mstrmojo.TabStrip,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.ScrollingTabStrip.prototype
         */
        {
            scriptClass: "mstrmojo.ScrollingTabStrip",
            
            markupString: '<div id="{@id}" class="mstrmojo-TabStrip mstrmojo-ScrollingTabStrip {@cssClass}" style="{@cssText}">' +
                            '<span></span>' +
                            '<div class="c" style="position:relative; display:inline-block;">' +
                                '<div style="position:absolute;"></div>' +
                            '</div>' + 
                            '<span></span>' +
                         '</div>',

            markupSlots: {
                containerNode: function(){ return this.domNode.childNodes[1].firstChild;},
                scrollNode: function(){ return this.domNode.childNodes[1];},
                stripNode: function(){ return this.domNode.childNodes[1].firstChild;},
                btnLeftNode: function(){ return this.domNode.childNodes[0];},
                btnRightNode: function(){ return this.domNode.childNodes[2];}
            },
            
            markupMethods: {
                onvisibleChange: function(){
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                    if (this.visible) {
                        //raise 'widthChange' event again to sync TabStrip components width when scrollNode/stripNode are ready.
                        this.set('width', parseInt(this.width, 10));
                    }
                },
                onleftChange: function() {
                    if (this.stripNode && this.left != null) {
                        this.stripNode.style.left = this.left + 'px';
                    }
                },
                onwidthChange: function(evt) {
                    //update left/right scrolling button status
                    var scrollNode = this.scrollNode,
                        stripNode = this.stripNode;
                    if (scrollNode && stripNode) {
                        var me = this,
                            w = parseInt(this.width, 10); //tab container width
                        
                        //use timeout to ensure getting the clientWidth.
                        window.setTimeout(function(){
                            if (w < stripNode.clientWidth) { //scrollNode is not wide enough for the entire strip
                                me.createScrBtn();
                                w -= (me.btnsWidth || 0);
                            }
                            me.updateScrBtn();
                            if(mstrmojo.dom.isIE7){//434377
                                stripNode.style.width = stripNode.clientWidth + 7 + 'px';
                            }
                            scrollNode.style.width = w + 'px';
                        }, 0);
                        
                    }
                } 
            },
            
            /**
             * <p>Step size to scroll the Tab Strip</p>
             * @type Integer
             */
            step: 50,
            
            /**
             * <p>Scroll the tabStrip at given direction by one step.</p>
             * @param Integer dir Integer number to indicate scrolling direction (-1: left, 1 - right)
             * @private
             */
            scroll: function(dir) {
                //if scroll direction is not provided, set it to 1 (right)
                dir = dir || 1;
                
                var scrollNode = this.scrollNode,
                    stripNode = this.stripNode,
                    left = Math.abs(parseInt(this.left, 10) || 0),  //invisible port on left of scrollNode
                    right = Math.max(stripNode.clientWidth - left - scrollNode.clientWidth, 0), //invisible portion on right
                    delta = Math.min(this.step, (dir == -1 ? right : left));  //what to adjust
                
                this.set('right', right);
                this.set('left', - (left - dir * delta));

                //update scroll buttons status
                this.updateScrBtn();
            },
            
            /**
             * <p>Create Scroll Buttons and add them to tab strip</P>
             * @private
             */
            createScrBtn: function() {
                //if already created, return;
                if (this.btnLeft && this.btnRight) {
                    return;
                }
                
                //add ScrollButtons
                var me = this;
                this.addChildren(
                            [{
                                scriptClass: 'mstrmojo.Button',
                                cssClass: 'l',
                                alias: 'btnLeft',
                                visible: false,
                                enabled: false,
                                scrollInterval : null,
                                onmousedown: function(){
                                    var that = this;
                                    this.scrollInterval = window.setInterval(function (a,b) {
                                        me.scroll(1);
                                        if(me.left >= 0){
                                            clearInterval(that.scrollInterval);
                                        }
                                      },60);
                                },
                                onmouseup: function(){    
                                    clearInterval(this.scrollInterval);
                                },
                                slot: 'btnLeftNode'
                            },
                            {
                                scriptClass: 'mstrmojo.Button',
                                cssClass: 'r',
                                alias: 'btnRight',
                                visible: false,
                                enabled: false,
                                onmousedown: function(){
                                    var that = this;
                                    this.scrollInterval = window.setInterval(function (a,b) {
                                        me.scroll(-1);
                                        if(me.right <= 0){
                                            clearInterval(that.scrollInterval);
                                        }
                                      },60);
                                },
                                onmouseup: function(){    
                                    clearInterval(this.scrollInterval);
                                },
                                slot: 'btnRightNode'
                            }]);
                this.renderChildren();
                
                //set total width of two scroll buttons
                this.btnsWidth = 50;
            },
            
            /**
             * <P>Update scroll buttons 'visible' and 'enabled' status</P>
             * @private
             */
            updateScrBtn: function() {
                //update left/right scrolling button status
                var scrollNode = this.scrollNode,
                    stripNode = this.stripNode,
                    btnLeft = this.btnLeft,
                    btnRight = this.btnRight;
                    
                if (scrollNode && stripNode && btnLeft && btnRight) {
                    var left = Math.abs(parseInt(this.left, 10) || 0),
                        stripNodeWidth = stripNode.clientWidth;

                    //update 'enabled'
                    btnRight.set('enabled', stripNodeWidth - left > scrollNode.clientWidth);
                    btnLeft.set('enabled', left > 0);

                    //update 'visible'
                    var w = parseInt(this.width, 10), //tab container width
                        v = w < stripNodeWidth; //flag of visibility
                    this.btnLeft.set('visible', v);
                    this.btnRight.set('visible', v);
                    
                    //if scrollbuttons are hidden, reset stripNode's left
                    if (!v) {
                        this.set('left', 0);
                    }
                }
            }
        }
    );
    
})();