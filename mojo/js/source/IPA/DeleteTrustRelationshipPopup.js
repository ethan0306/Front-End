/*
 * @author:akarandikar
 * Delete trust relationship dialog
 */

(function(){

	mstrmojo.requiresCls("mstrmojo.Dialog");
    
    mstrmojo.IPA.DeleteTrustRelationshipPopup = mstrmojo.insert({
    		scriptClass:"mstrmojo.Dialog",
    		id:"DeleteTrustRelationshipPopup",
	  		cssText:"margin-bottom:10px;width:450px;",
	  		title: "Delete Trust Relationship with MicroStrategy Intelligence Server",	  		 
	  		
	  		children:[
	  		  {
	  			  scriptClass:"mstrmojo.Table",
	  			  cssText:"margin:5px;",
	  			  rows:2,
	  			  cols:2,
	  			  children:[
	  			    {
	  			    	scriptClass:"mstrmojo.Label",
	  			    	text:"User name:",
	  			    	slot:"0,0"	
	  			    },
	  			    {
	  			    	scriptClass:"mstrmojo.TextBox",
	  			    	slot:"0,1"	
	  			    },
	  			    {
	  			    	scriptClass:"mstrmojo.Label",
	  			    	text:"Password:",
	  			    	slot:"1,0"	
	  			    },
	  			    {
	  			    	scriptClass:"mstrmojo.TextBox",
	  			    	slot:"1,1"	
	  			    }
	  			  ]
	  		  },
	  		  {
	  			  scriptClass:"mstrmojo.Table",
	  			  cssText:"margin:10px;",
	  			  rows:4,
	  			  cols:1,
	  			  children:[
	  			    {
	  			    	scriptClass:"mstrmojo.RadioButton",
	  			    	label:"Standard (username and passowrd)",
	  			    	checked:true,
	  			    	slot:"0,0",
	  			    	onclick:function(){
	  			    		if(this.checked){
								this.parent.children[1].set('checked',false);
								this.parent.children[2].set('checked',false);
								this.parent.children[3].set('checked',false);								
							}
	  			    	}
	  			    },
	  			    {
	  			    	scriptClass:"mstrmojo.RadioButton",
	  			    	label:"LDAP Authentication",
	  			    	slot:"1,0",
	  			    	onclick:function(){
  			    		if(this.checked){
							this.parent.children[0].set('checked',false);
							this.parent.children[2].set('checked',false);
							this.parent.children[3].set('checked',false);								
						}
  			    	}
	  			    },
	  			    {
	  			    	scriptClass:"mstrmojo.RadioButton",
	  			    	label:"Database Authentication",
	  			    	slot:"2,0",
	  			    	onclick:function(){
  			    		if(this.checked){
							this.parent.children[0].set('checked',false);
							this.parent.children[1].set('checked',false);
							this.parent.children[3].set('checked',false);								
						}
  			    		}
	  			    },
	  			    {
	  			    	scriptClass:"mstrmojo.RadioButton",
	  			    	label:"Windows Authentication",
	  			    	slot:"3,0",
	  			    	onclick:function(){
  			    		if(this.checked){
							this.parent.children[0].set('checked',false);
							this.parent.children[1].set('checked',false);
							this.parent.children[2].set('checked',false);								
						}
  			    	}
	  			    }
	  			  ]
	  		  },
	  		  {
           	    scriptClass:"mstrmojo.HBox",           	    
           	    children:[
           	        {
           	        	scriptClass:"mstrmojo.HTMLButton",
           	        	cssClass:"mstrmojo-add-button",		            	        	
           	        	text:"Delete Trust Relationship",
           	        	
           	        	onclick:function(){
           	        		//add code for delete here
           	        		//alert("TODO");	            	        		
           	        	}
           	        },
           	        {
           	        	scriptClass:"mstrmojo.HTMLButton",
           	        	cssClass:"mstrmojo-add-button",
           	        	text:mstrmojo.desc(2399,"Cancel"),
           	        	
           	        	onclick:function(){
           	        		this.parent.parent.unrender();
           	        	}
           	        	
           	        }
           	    ]
              }
	  		]}
    );        
})();
