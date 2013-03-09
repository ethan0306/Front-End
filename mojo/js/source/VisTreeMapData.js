(function() {
	mstrmojo.requiresCls("mstrmojo.VisChartUtils");

	function deepCopy(obj) {
	    if (Object.prototype.toString.call(obj) === '[object Array]') {
	        var out = [], i = 0, len = obj.length;
	        for ( ; i < len; i++ ) {
	            out[i] = arguments.callee(obj[i]);
	        }
	        return out;
	    }
	    if (typeof obj === 'object') {
	        var out = {}, i;
	        for ( i in obj ) {
	            out[i] = arguments.callee(obj[i]);
	        }
	        return out;
	    }
	    return obj;
	}

	    
	
	function DrawVertically(w, h) {
		return (w > h);
	}
	function AspectRatio(w, h) {
		return Math.max(w / h, h / w);
	}

	function AdjustSizes(s, area) {
		var totalSize = 0, newSizes = [];

		for ( var i = 0; i < s.length; i++) {
			totalSize += s[i];
		}

		for ( var i = 0; i < s.length; i++) {
			newSizes[i] = s[i] * (area / totalSize);
		}

		return newSizes;

	}

	function LayoutRectangles(area, rect, drawV,iStart) {

		var totalSize = 0;

		for (var i = iStart; i < rect.length; i++) 
		{
			totalSize += rect[i].size;
		}

		for (var i = iStart; i < rect.length; i++) 
		{	
			if (drawV) {
				rect[i].w = (totalSize / area.h);
				rect[i].h = (rect[i].size/rect[i].w);
				if (i != iStart){
					rect[i].y = rect[i-1].y + rect[i-1].h;	
					rect[i].x = rect[i-1].x;
				}
			} else {
				rect[i].h = (totalSize / area.w);
				rect[i].w = (rect[i].size/rect[i].h);
				if (i != iStart){
					rect[i].x = rect[i-1].x + rect[i-1].w;
					rect[i].y = rect[i-1].y;
				}
			}
			if (iStart == i){
			 rect[i].y = area.y; 
			 rect[i].x = area.x;
			}
		}
		
	}

	mstrmojo.VisTreeMapData = mstrmojo.provide("mstrmojo.VisTreeMapData",
	/**
	 * @lends mstrmojo.VisTreeMapData
	 */
	{
		rectangles : [],

		process : function prcss(w) {
		this.rectangles = [];
		
		var sizes = [];

		for(var i = 0; i <w.treeMapData.length; i++){
			sizes[i] = w.treeMapData[i].size;
		}
		
		width = w.width, 
		height = w.height;
		
		//adjust the size ratio to fit the canvas size
		sizes = AdjustSizes(sizes, w.width * w.height);

		//initialize the rectangles with the sizes
		var aspectRatio = null,
		prevAspectRatio = null,
		startpos = 0,
		prevRect = [],
		dv = false,
		totalArea = {'x' : 0,
				'y' : 0,
				'w' : width,
				'h' : height,
				'size' : (width * height)};
			

		for ( var i = 0; i < sizes.length; i++) {

			if ((aspectRatio <= prevAspectRatio) || (prevAspectRatio == null)) {
				this.rectangles.push( {
					'x' : 0,
					'y' : 0,
					'w' : 0,
					'h' : 0,
					'size' : sizes[i]});
			}else{
				//if the aspect ratio is worse than the previous one, 
				//backtrack one and re-adjust width and height
				//lock everything into place.
				this.rectangles = prevRect;
				startpos = i;
				aspectRatio = null;
				prevAspectRatio = null;
				
				if (dv){
					totalArea.w -= this.rectangles[i-1].w;
					totalArea.x += this.rectangles[i-1].w;
				}
				else{
					totalArea.h -= this.rectangles[i-1].h;
					totalArea.y += this.rectangles[i-1].h;
				}

			}
			dv = DrawVertically(totalArea.w, totalArea.h);
			prevRect = deepCopy(this.rectangles);
			LayoutRectangles(totalArea, this.rectangles,dv,startpos);
			
			prevAspectRatio = aspectRatio;

			aspectRatio = AspectRatio(
					this.rectangles[i].w,
					this.rectangles[i].h);
			
			if (aspectRatio > prevAspectRatio && prevAspectRatio != null) --i;
		}
	}

	});

})();