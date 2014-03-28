(function () {
    mstrmojo.requiresCls(  
        "mstrmojo.Box",       
        "mstrmojo.Table",
        "mstrmojo.Architect.JoinsView",
        "mstrmojo.Architect.TableEditor"
    );
    
    var $C = mstrmojo.css;
    
    var right_panel_width = 200;
    
  
    /************************Private methods*********************************/

    mstrmojo.Architect.SingleTableView = mstrmojo.declare(
        // superclass
       mstrmojo.QB.SplitPanel,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.Architect.SingleTableView",
            rightItemVisible: false,
            lp:70,
            children: [   
                {
        		    scriptClass: "mstrmojo.QB.VSplitPanel",
        		    slot:"leftItem",
        		    topP: 60,
        			children: [
        	 		    {
        	 		        scriptClass: "mstrmojo.Architect.TableEditor",
        	 		        id:"tableEditor",
        	 		        slot: 'topItem',
        	 		        cssText: "margin:3px;border:2px solid #CCC; background-color:white;overflow:auto; height:100%;",
        	 		        alias: "mappings"
        	 		        	
        	 		    },
        	 		    {
        	 		        scriptClass: "mstrmojo.Architect.RelationPanel",
        	 		        id:"relationPanel",
        	 		        slot: 'bottomItem',
        	 		        alias: "relations",
        	 		        cssText: "background-color:white; border:2px solid #CCC;" 
        	 		    }     
        	 		   ],
                         layoutConfig: {
                        	 w: {
                        		 topItem: '100%',
                        		 bottomItem: '100%'
                        	 },
                        	 h: {
                        		 topItem: '60%',
                        		 bottomItem: '40%'
                        	 }
                         }
        		},
        		{
        		    scriptClass: "mstrmojo.Architect.JoinsView",
        		    id:"ARTableJoins",
        		    alias: "rightPanel",
        		    slot:"rightItem",
        		    cssText: "background-color:white;height:100%;"
        		}
	        ],
	        
	             layoutConfig: {
                w: {
                    leftItem: '100%',
                    rightItem: '0%'
                },
                h: {
                	leftItem: '100%',
                    rightItem: '100%'
                 }
            },
	      
        	toggleJoins: function showJoins(e) {
        		this.status=e;
        		if(e){
        	            this.rightPanel.refresh();
        	         }
        			var rv=!this.rightItemVisible;
        		    this.set('rightItemVisible', rv);
        	}
        	
        	
     
        });

})();