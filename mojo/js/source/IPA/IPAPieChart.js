(function(){

    mstrmojo.requiresCls("mstrmojo.VisPieChart");
	
	    /**
     * CounterLabel is a label for an IPA counter that displays the latest counter value.
     * 
     * <p> It will register itself to the counter controller, and upon each call to add values , will display the latest
     * value in the counter array 
     * </p>
     * 
     * @class
     * @extends mstrmojo.VisPieChart
     */
    mstrmojo.IPA.IPAPieChart = mstrmojo.declare(    
	// superclass
    mstrmojo.VisPieChart,    
	// mixins
    null,
	// instance members
    {
        scriptClass: "mstrmojo.IPA.IPAPieChart",

        isSame: false,
		
		server: null,
		
		colors: [ '#D50003','#BBBBBB','#0099FF', '#FFB03C', '#F26AE1', '#888BF4', '#93CA20', '#FE2F68'],
		
		appendSymbol:'',
		
        init: function init(props){
			
			this._super(props);
		
            if(this.counters.length <= 0){
            	alert("No counters specified");
            	return;
            }
            
            this.cobj = [];
        
            for(var i = 0 ; i < this.counters.length ; i++){
				this.pieChartData.push(1);
				this.Labels.push(this.counters[i].counter);
            	
            	var cnter = new mstrmojo.Obj({
            		num:0,
            		server:this.server,
            		counter:this.counters[i].counter,
            		category:this.counters[i].category,
            		instance: this.counters[i].instance,
            		controller: this.counters[i].controller,
            		parent: this,
            		isSame: false,
            		addValues: function addv(d){
            			if (d[d.length - 1].value >= 0 ){
						for(var i = 0; i < this.parent.pieChartData.length; i++){
							if (this.parent.Labels[i] == this.counter && this.server == this.parent.server){
								this.parent.pieChartData[i] = parseInt(d[d.length - 1].value);
								this.parent.drawChart();
							}
						}
            			}
            		}
            	});
            	this.counters[i].controller.addCounters(cnter, false);
            	this.cobj.push(cnter);
            }
        },
        
        //override VisPieChart:renderToolTips() to show appendSymbol
        renderTooltip: function rndrttp(touchX, touchY) {
			
				//set the tooltip text 	
		centerX = this.width/2
		centerY = this.height/2
		radius = Math.min(centerX,centerY);
		var hyp = Math.sqrt( Math.pow((touchX-centerX),2) + Math.pow((touchY-centerY),2))						
		if (hyp < radius)
		{
			//   the click was inside the pie chart area
				var angle = Math.atan2(touchY - centerY,touchX - centerX);
				(angle < 0)? angle = (2 * Math.PI) + angle: null;
				for (var i = 0; i < this.data.length; i++){
					if (angle > this.data[i].arc1 && angle < this.data[i].arc2){
					 this.tooltip.innerHTML = '<b>' + this.Labels[i]+ ': </b>' + this.pieChartData[i] + " " + this.appendSymbol;
					 this.highlightContext.clearRect(0,0,this.width,this.height);
					 this.highlightContext.beginPath(); 
					 this.highlightContext.moveTo(centerX,centerY); 
					 this.highlightContext.arc(centerX,centerY,radius,this.data[i].arc1,this.data[i].arc2,false);
					 this.highlightContext.lineTo(centerX,centerY); 
					 this.highlightContext.strokeStyle = "#FFFFFF";
					 this.highlightContext.lineWidth = 2;
					 this.highlightContext.stroke();
				break;
					
					}
				
				}

		
		    //	this.set('selectedrectindex',i);

		
		this.tooltip.style.webkitTransform = 'translate(' + centerX - 60 + 'px,' + centerY - 60 + 'px)';
		this.tooltip.style.MozTransform = 'translate(' + centerX - 60 + 'px,' + centerY + 'px)';
		this.tooltip.style.msTransform = 'translate(' + centerX + 'px,' + centerY + 'px)';

		//Fade the tooltip in
		if (this.tooltip.className.indexOf("fadeIn") < 0) {
			this.tooltip.className = this.tooltip.className + " fadeIn";
			if (this.isAndroid) {
				this.tooltip.style.visibility = 'visible';
			}
		}
		}					

	},

    });
    
}

)();
