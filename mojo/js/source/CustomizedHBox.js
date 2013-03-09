(function (){
	
	mstrmojo.requiresCls(
			"mstrmojo.Container");
	var PREFIX = "slot";
	mstrmojo.CustomizedHBox = mstrmojo.declare(
		
		mstrmojo.Container,
		
		null,
		
		{
			scriptClass: "mstrmojo.CustomizedHBox",
			
	        cellCssClass: "",
	        cellSpacing: 0,
	        cellPadding: 0,
			
			markupString: '<table id="{@id}" class="mstrmojo-HBox {@cssClass}" style="{@cssText}" cellspacing="{@cellSpacing}" cellpadding="{@cellPadding}"><tr>{@tableHtml}</tr></table>',
	        markupSlots: {
	            containerNode: function(){
	                return this.domNode.rows[0];
	            }
	        },
	        markupMethods: {
	            onvisibleChange: function(){
	                this.domNode.style.display = this.visible ? mstrmojo.css.DISPLAY_TABLE : "none";
	            }
	        },
			
	        buildRendering: function bldRn(){
	            this.tableHtml = "";
	            var t = [], ch = this.children, len = (ch && ch.length) || 0, i;
	            if (len) {
	                var counter = 0, 
						css = this.cellCssClass ? ' class="mstrmojo-HBox-cell ' + this.cellCssClass + '" ' : "", 
						tdHtml = "<td " + css + "></td>";
	                for (i = 0; i < len; i++) {
						if(ch[i].tdCssClass){
							tdHtml = '<td class="' + ch[i].tdCssClass + '"></td>';
						}
	                    t[counter++] = tdHtml;
	                    ch[i].slot = PREFIX + i;
	                }
	                this.tableHtml = t.join("");
	            }
	            this._super();
	            if (len) {
	                var slots = {}, tds = this.containerNode.cells;
	                for (i = 0; i < len; i++) {
	                    slots["slot" + i] = tds[i];
	                }
	                this.addSlots(slots);
	            }
	        },
	        addChildren: function addChild(widget, idx, silent){
	            if (!widget) {
	                return widget;
	            }
	            if (idx === undefined || isNaN(idx) || idx < 0) {
	                var ch = this.children;
	                idx = (ch && ch.length) || 0;
	            }
	            var i = 0, cnt;
	            if (widget.constructor === Array) {
	                for (i = 0, cnt = widget.length; i < cnt; i++) {
	                    widget[i].slot = PREFIX + (idx + i);
	                }
	            }
	            else {
	                widget[i].slot = PREFIX + idx;
	            }
	            return this._super(widget, idx, silent);
	        },
	        childRenderCheck: function childRndrChk(child){
	            if (child && !child.hasRendered) {
	                var slotName = child.slot || this.defaultChildSlot;
	                return !!this[slotName] || slotName.match(/^slot[\d]+$/);
	            }
	            return false;
	        },
	        onchildRenderingChange: function chRnChg(obj){
	            var child = (obj && obj.src) || obj, d = child && child.domNode;
	            if (d) {
	                var s = child.slot;
	                if (!this[s]) {
	                    var match = s && s.match(/^slot([\d]+)$/);
	                    if (match) {
	                        var idx = parseInt(match[1], 10), cn = this.containerNode, cells = cn.cells, cLen = (cells && cells.length) || 0, slots = {};
	                        for (var i = cLen; i <= idx; i++) {
	                            var td = cn.insertCell(i);
	                            slots["slot" + i] = td;
								if(child.tdCssClass){
									td.className = child.tdCssClass;
								}else if (this.cellCssClass) {
	                                td.className = this.cellCssClass;
	                            }
	                        }
	                        this.addSlots(slots);
	                    }
	                }
	            }
	            this._super(obj);
	        }
		}
	);
})();
