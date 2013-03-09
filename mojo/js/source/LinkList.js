(function(){
    mstrmojo.requiresCls("mstrmojo.ListBox", "mstrmojo.color");
    var SELECTED_COLOR = [0x7F, 0xCE, 0xFF];
    var HIGHLIGHTED_COLOR = [0xD8, 0xE6, 0xEF];
    var highlight = function(colorStr, highlightRgb) {
        if ( ! colorStr || colorStr == 'transparent' ) {
            colorStr = '#FFFFFF';
        }
        
        var rgb = mstrmojo.color.hex2rgb(colorStr), r, g, b;
        if(!highlightRgb) {
           r = Math.round((3/5)*parseInt(rgb[0])+110);
           g = Math.round((3/5)*parseInt(rgb[1])+110);
           b = Math.round((3/5)*parseInt(rgb[2])+110);
        } else {
           r = rgb[0] * highlightRgb[0] / 0xFF;
           g = rgb[1] * highlightRgb[1] / 0xFF;
           b = rgb[2] * highlightRgb[2] / 0xFF;
           var luminosity = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
           //alert("----1" + luminosity);
           if ( luminosity < 85 ) {
               r = r + (63 * ((85 - luminosity) / 85));
               if ( r > 0xFF ) {
                   r = 0xFF;
               }
               g = g + (63 * ((85 - luminosity) / 85));
               if ( g > 0xFF ) {
                   g = 0xFF;
               }
               b = b + (96 * ((85 - luminosity) / 85));
               if ( b > 0xFF ) {
                   b = 0xFF;
               }
           }
        }
        return '#' + mstrmojo.color.rgb2hex(r, g, b);
    };
    var changeColor = function(el, widget, ct){
		el.style['backgroundColor'] = widget['bg' + ct + 'Color'] || '';
		el.style['color'] = widget['text'+ ct + 'Color'] || '';
    }
    /**
     * Renders a native HTML button for each item.
     * It duplicated all the methods and properties from mstrmojo.DivItemRenderer,
     * which currently contained and used by ListBox.
     * Then it will just override the implementation of render.
     */
    mstrmojo.LinkItemRenderer =  mstrmojo.hash.copy({
    	render: function (/*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
            var nAll = item.v != "u;" ? " nAll" : "";
            return '<input mstridx="' + idx + '" class="' 
                        + widget.itemCssClass 
                        + (widget.selectedIndices[idx] ? ' ' + widget.itemSelectedCssClass : '')
                        + nAll
                        + '" style="' + widget.itemCssText 
                        + ' color:' + (widget.selectedIndices[idx] ? widget.textSelectedColor : widget.textNormalColor) + ';'
                        + ' background-color:' + (widget.selectedIndices[idx] ? widget.bgSelectedColor : widget.bgNormalColor) + ';' 
                        + '" type="button" '
                        + ' value="' + item[widget.itemDisplayField] + '" '
                        + ' onmouseover="mstrmojo.all.' + widget.id + '.onmouseover(self, ' + idx + ')"'
                        + ' onmouseout="mstrmojo.all.' + widget.id + '.onmouseout(self, ' + idx + ')"'
                        + '/>';

        },
		select: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
			el.className += ' selected';
			changeColor(el, widget, 'Selected');
		},
		unselect: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
			el.className = el.className.replace(/selected/g, '');
			changeColor(el, widget, 'Normal');
		},
    	highlight: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
    		var ct = widget.selectedIndices[idx] ? 'Selected' : 'Highlighted';
			changeColor(el, widget, ct);
    	},
    	unhighlight: function(/*DomNode*/ el, /*Object*/ item, /*Integer*/ idx, /*Widget*/ widget) {
    		var ct = widget.selectedIndices[idx] ? 'Selected' : 'Normal';
			changeColor(el, widget, ct);
    	}
    }, mstrmojo.hash.copy(mstrmojo.DivItemRenderer));
    /**
     *  Mixin for a ButtonList.
     *  It duplicates all properties and methods from _RendersItemDivs. 
     *  It only overrides the original itemRenderer to ButtonItemRenderer
     */
    mstrmojo._RendersItemLinks = mstrmojo.hash.copy({
    	onmouseover: function(win, idx) {
    		var el = this._getItemNode(idx);
    		this.itemRenderer.highlight(el, this.items[idx], idx, this);
    	},
    	onmouseout: function(win, idx) {
    		var el = this._getItemNode(idx);
    		this.itemRenderer.unhighlight(el, this.items[idx], idx, this);
    	},
    	preBuildRendering: function() {
    		// initialize hover/selected colors
    	    this.bgNormalColor = this['background-color'] || this.parent && this.parent['background-color'];
    	    this.bgSelectedColor = this.parent && this.parent.defn && this.parent.defn['ssc'];
    	    if(this.bgSelectedColor != null) {
               this.bgHighlightedColor = highlight(this.bgSelectedColor);
            } else {
               this.bgSelectedColor = highlight(this.bgNormalColor, SELECTED_COLOR);
               this.bgHighlightedColor = highlight(this.bgNormalColor, HIGHLIGHTED_COLOR);
            }
            
    	    this.textNormalColor = this.color;
    	    this.textSelectedColor = mstrmojo.color.getContrastingColor(this.bgSelectedColor, ['#ffffff', '#000000']);
    	    this.textHighlightedColor = mstrmojo.color.getContrastingColor(this.bgHighlightedColor, ['#ffffff', '#000000']);
    	    
    		if (this._super) {
    			this._super();
    		}
    		
    	}
    }, mstrmojo.hash.copy(mstrmojo._RendersItemDivs));
    mstrmojo._RendersItemLinks.itemRenderer = mstrmojo.LinkItemRenderer;

    mstrmojo.requiresCls("mstrmojo.ListBox");
    mstrmojo.LinkList = mstrmojo.declare(
        // super class
        mstrmojo.ListBox,
        // mixins
        [mstrmojo._RendersItemLinks],
        // instance members
        {
            scriptClass : "mstrmojo.LinkList",
            cssClass : "mstrmojo-LinkList",
            itemCssClass : "mstrmojo-LinkList-item",
            selectionPolicy : "toggle"       // toggle policy for link bar
          
        }
    );

    mstrmojo.requiresCls("mstrmojo.ListBoxHoriz");
    
    mstrmojo.LinkListHoriz = mstrmojo.declare(
        // super class
        mstrmojo.ListBoxHoriz,
        // mix ins
        [mstrmojo._RendersItemLinks],
        // instance members
        {
            scriptClass : "mstrmojo.LinkListHoriz",
            cssClass : "mstrmojo-LinkListHoriz",
            itemCssClass : "mstrmojo-LinkListHoriz-item",
            selectionPolicy : "toggle"       // toggle policy for link bar
          
        }
    );
})();