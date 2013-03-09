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
    mstrmojo.IPA.IPACounterAggDivLabel = mstrmojo.declare(    
	// superclass
    mstrmojo.Label,   
	// mixins
    null,
	// instance members
    {
        scriptClass: "mstrmojo.IPA.IPACounterAggDivLabel",
		
		serverArr: null,
		
		controller: mstrmojo.all.countercontroller,
		
		category: null,
		
		showTrendIndicators: false,
		
		instance: null,
		
		headerText:'',
		
		appendSymbol: '',
        
        isSame: false,
		
		topCounter:null,
		
		bottomCounter:null,
        
        postCreate: function(){
            
            if(!this.controller || !this.topCounter || !this.bottomCounter || this.serverArr.length <= 0){
            	//alert("No controller, top counter, or bottom counter specified");
            	return;
            }
            
            this.cobj = [];
            var cat = this.category, 
            	ins=this.instance, 
            	con = this.controller;
            
            for(var i = 0 ; i < this.serverArr.length ; i++){
            	var svr= this.serverArr[i], 
            		bct = this.bottomCounter, 
            		tct = this.topCounter;
            	
            	var tcounter = new mstrmojo.Obj({
            		num:0,
            		server:svr,
            		counter:tct,
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
            	this.controller.addCounters(tcounter, false);
            	this.cobj.push(tcounter);
            	
            	var bcounter = new mstrmojo.Obj({
            		num:0,
            		server:svr,
            		counter:bct,
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
            	this.controller.addCounters(bcounter, false);
            	this.cobj.push(bcounter);
            }
            
        },
        
        refreshTxt: function refreshTxt(){
        	if(this.cobj){
        		var tt = 0,
        			bt = 0;
        		for(var i=0;i < this.cobj.length ; i++){
        			if(i/2 == 0){
        				tt += this.cobj[i].num;
        			}else{
        				bt += this.cobj[i].num;
        			}
        		}

        		var perc = 0;
        		if (bt!=0){
        			perc = Math.floor(tt/bt * 100);
        		}
        		
        		var text = this.headerText + tt + "/" + bt;
        		if(perc < 90){
        			text = text + "<font color=red>"  + " (" + perc + "%)" + "</font>"; 
        		}else{
        			text = text + "<font color=green>" +  " (" + perc + "%)" + "</font>";
        		}

        		this.set("text", text + this.appendSymbol);
        	}
        }
        
        
    });
    
}

)();
