(function(){

    mstrmojo.requiresCls("mstrmojo.Label");
	
	    /**
     * CounterLabel is a label for an IPA counter that displays the latest counter value.
     * 
     * <p> It will register itself to the counter controller, and upon each call to add values , will display the latest
     * value in the counter array 
     * </p>
     * 
     * @class
     * @extends mstrmojo.Label
     */
    mstrmojo.IPA.IPACounterAggLabel = mstrmojo.declare(    
	// superclass
    mstrmojo.Label,    
	// mixins
    null,
	// instance members
    {
        scriptClass: "mstrmojo.IPA.IPACounterAggLabel",
        
		controller:  mstrmojo.all.countercontroller,
		
		category: null,
		
		showTrendIndicators: true,
		
		instance: null,
		
		headerText:'',
		
		counter: null,
		
		appendSymbol: '',
        
        isSame: false,
		
		serverArr: null,
        
        init: function init(props){
            this._super(props);
            if(!this.controller || !this.counter || this.serverArr.length <= 0){
          //  	alert("No controller and counter specified");
            	return;
            }
            
            this.cobj = [];
            this.lastTotal = 0;
            
            var cat = this.category, 
        		ins=this.instance, 
        		con = this.controller,
            	cnt = this.counter;
        
            for(var i = 0 ; i < this.serverArr.length ; i++){
            	var svr= this.serverArr[i];
            	
            	var cnter = new mstrmojo.Obj({
            		num:0,
            		server:svr,
            		counter:cnt,
            		category:cat,
            		instance: ins,
            		controller: con,
            		parent: this,
            		isSame: false,
            		addValues: function addv(d){
            			if (d[d.length - 1].value >= 0 ){
            				this.num = parseInt(d[d.length - 1].value);
            				this.parent.refreshTxt();
            			}
            		}
            	});
            	this.controller.addCounters(cnter, false);
            	this.cobj.push(cnter);
            }
        },
        
        refreshTxt: function refreshTxt(){
        	if(this.cobj){
        		var total = 0;
        		for(var i=0;i < this.cobj.length ; i++){
        			total += this.cobj[i].num;
        		}

        		var text = this.headerText + " "; 
        		if(total > this.lastTotal){
        			text = text + "<font color=red>"  + total + "</font>"; 
        		}else if (total < this.lastTotal){
        			text = text + "<font color=green>" + total + "</font>";
        		}else{
        			text = text + total;
        		}

        		this.set("text", text + this.appendSymbol);
        		this.lastTotal = total;
        	}
        }
    });
    
}

)();
