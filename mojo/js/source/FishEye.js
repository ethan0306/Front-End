(function(){

    mstrmojo.requiresCls("mstrmojo.ListHoriz",
                         "mstrmojo.fx");
    
    /**
     * <p>FishEye Widget</p>
     * 
     * <p>It's a horizontal list of elments. </p> 
     * 
     * @class
     * @public 
     * @extends mstrmojo.ListHoriz
     */
    mstrmojo.FishEye = mstrmojo.declare(
            //super
            mstrmojo.ListHoriz,
            
            //mixin
            null,
            
            /**
             * <p>Instance members</p>
             * @lends mstrmojo.FishEye.prototype
             */
            {
                scriptClass: "mstrmojo.FishEye",
                alias: 'fishEyeList',
                
                width: 16, //width of each fisheye in 'px'
                size: 10, ///number of fisheyes to display
                step : 16, //scrolling step in 'px'; this should be equal the width of one fisheye item
                speed: 2, 
                
                cssClass: 'mstrmojo-FishEye',
                cssClassItem: 'mstrmojo-dot',
                
                
                itemMarkupFunction : function(item, index, widget) {
                                      return '<div class="mstrmojo-fisheye-item ' + widget.cssClassItem + '"' +  
                                                    ' title="'+ item.n + '" idx="' + index + '"' + 
                                                    ' did="' + item.did + '"' +
                                                '>&nbsp;</div>';
                                        },
                
                /**
                 * <p>handle List selection event: </p>
                 * <ul> 
                 * 		<li> if selection is the first or last item in viewport and scrollable, then scroll it</li>
                 * 		<li> update container's property</li>
                 * </li>
                 */
                onchange: function() {
                    this.scroll2();
                    
                    //update index change to FishEyeContainer
                    this.parent.set('selectedIndex', this.selectedIndex);
                },
                
                as: new mstrmojo.fx.AnimateProp(), //animation instance

                onitemsChange: function() {
                    if (this._super) {
                        this._super();
                    }
                    
                    this.last = this.items.length - 1;
                    this.first = Math.max(0, this.last - this.size);

                    //scroll left to show the last item
                     if (this.items.length > this.size) {
                    	 this.scroll('left', this.width );
                     }
                },
                
                /**
                 * <p>This event is triggered by FishEyeContainer's setIndex( )</p>
                 */
                scroll2: function() {
                    var cnt = this.selectedIndex - this.last;
                    //adjust fisheye position so that the selected fisheye is second or last second item in the list,if applicable
                    if (this.selectedIndex == this.first && this.first > 0) 
                    {
                        this.scroll('right', this.width);
                    }
                    else if (this.selectedIndex == this.last && this.last < this.items.length - 1) {
                        this.scroll('left', this.width);
                    } 
                    else if (this.selectedIndex > this.last) {
                        cnt = this.selectedIndex - this.last;
                        this.scroll('left', this.width * cnt, cnt)
                        this.last = Math.min(this.items.length - 1, this.last + cnt);
                    }
                    else if (this.selectedIndex < this.first) {
                        cnt = this.first - this.selectedIndex;
                        this.scroll('right', this.width * cnt, cnt);
                        this.first = Math.max(0, this.first - cnt);                        
                    }
                },
                
                
                /**
                 * <P>Animate scrolling</P>
                 * <P>This method is called by scrolling button that initiates the scrolling action.</P>
                 * 
                 * @param {String} dir Direction to scroll. Value = 'left' or 'right'
                 * @param {Integer} dist Distance to scroll. Positive number. Optional. 
                 * @param {Integer} count Number of items (steps) to scroll. Optional. 
                 */
                scroll: function(dir, dist, count) {
                    //shiftLeft(this.step);// shiftting leftward by 10px
                    var n = this.itemsContainerNode,
                        b = n && n.style;

                    //animate scrolling
                    var as = this.as,
                    	pos = parseInt(mstrmojo.css.getStyleValue(n, {left:'right', right:'left'}[dir]), 10),
                    	pos = isNaN(pos) ? 0 : pos,
                    	start = parseInt(b.left, 10) || 0,
                        stop = start + (dir=='left'? -1 : 1) * (dist || (Math.min(this.step, (-1) * pos)));

                    //config animation instance
                    as.target = n;
                    as.props = {
                                 left: {
                                         start: start, 
                                         stop: stop, 
                                         duration: 100, 
                                         interval: 10, 
                                         suffix: 'px'
                                       }
                               };
                    as.play();
                    
                    //update first/last item's index in fisheye's viewport
                    count = count===undefined ? 1 : count;

                    this.first += (dir == 'left' ? 1 :  -1) * count;
                    this.last = this.first + this.size - 1;

                    //update status of scroll button
                    this.parent.set('scrollable', this.last < this.items.length - 1);
                    this.parent.set('rightScrollable', this.first > 0);
                    
                    return stop;
                },
                
                /**
                 * <p>Data source object this FishEye listens to add/remove items</p>
                 * @type {String}
                 */
                srcId: null, 
                
                
                postBuildRendering: function(){
                    if (this._super) {
                        this._super();
                    }
                    
                    //This flag is set after posBuildRendering is called in render()
                    //But we need it here. So set it by checking against the domNode.
                    this.hasRendered = !!this.domNode;
                    
                    //cache first selected item
                    var n = this.itemsContainerNode,
                        tb = n && n.firstChild,
                        r = tb && tb.rows && tb.rows[0],
                        c = r && r.cells && r.cells[0];
                    
                    //initialization
//                    mstrmojo.all.obdata = mstrmojo.all.obdata || new mstrmojo.Model();
//                    mstrmojo.all.obdata.set('path', this.items);
//                    this.set('selectedIndex', this.items.length -1); //update index and trigger objectbrowser's label listener
                        
                     this.first = 0;
                     this.last = this.size - 1; // Math.min(this.selectedIndex, this.size);this.size;
                     
                     //listen to Src selection change
                     var id = this.srcId;
                     if (id && mstrmojo.all[id] && mstrmojo.all[id].attachEventListener) {
                         mstrmojo.all[id].attachEventListener('change',
                                                                 this.id, 
                                                                 function(evt){
                                                                 if (this.items[this.items.length -1] != evt.src.selectedItem) {
                                                                     this.items.add([mstrmojo.hash.copy(evt.src.selectedItem)]);
                                                                     this.set('selectedIndex', this.items.length - 1);
                                                                 }
                                                                 
                                                                 if (this.items.length > this.size) {
                                                                     //update this fisheye list's 'scrollable' property
                                                                     this.set('rightScrollable', this.items.length > this.size);
                                                                     
                                                                     // scroll left to ensure the last item is visible
                                                                     this.scroll('left', this.width * (this.selectedIndex - this.last), (this.selectedIndex - this.last))
                                                                 }
                                                             });
                     }
                     
                     //make the List get back to this original position after refresh with 'items' change. 
                     this.itemsContainerNode.style.left = Math.min(0, (this.size - this.items.length + 1)) * this.width + 'px';
                } //end postBuildRendering
                                        
            }//end instance properties
    );
    
    
    
    
})();