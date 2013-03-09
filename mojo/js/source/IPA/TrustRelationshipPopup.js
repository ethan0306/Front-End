/*
 * @author:akarandikar
 * Create trust relationship dialog
 */

(function(){

	mstrmojo.requiresCls("mstrmojo.Dialog");
    
    mstrmojo.IPA.TrustRelationshipPopup = mstrmojo.insert({
    		scriptClass:"mstrmojo.Dialog",
    		id:"TrustRelationshipPopup",
	  		cssText:"margin-bottom:10px;width:450px;",
	  		title: "Setup Trust Relationship with MicroStrategy Intelligence Server",	  		 
	  		
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
	  			  scriptClass:"mstrmojo.Table",
	  			  cssText:"margin:10px;",
	  			  rows:1,
	  			  cols:2,
	  			  children:[
	  			        {
	  			        	scriptClass:"mstrmojo.Label",
	  			        	text:"Web Server Application:",
	  			        	cssText:"width:130px;",
	  			        	slot:"0,0"
	  			        },
	  			        {
	  			        	scriptClass:"mstrmojo.TextBox",	
	  			        	size:'50',
	  			        	slot:"0,1"
	  			        }
	  			  ]
	  		  },
	  		  {
           	    scriptClass:"mstrmojo.HBox",           	    
           	    children:[
           	        {
           	        	scriptClass:"mstrmojo.HTMLButton",
           	        	cssClass:"mstrmojo-add-button",		            	        	
           	        	text:"Create Trust Relationship",
           	        	
           	        	onclick:function(){
           	        		//add code for setup here
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
