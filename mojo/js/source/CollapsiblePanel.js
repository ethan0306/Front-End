(function() {

    mstrmojo.requiresCls("mstrmojo.Container", 
                         "mstrmojo._Collapsible");
    
    /**
	 *  
	 * @deprecated replaced by CollapsibleContainer
	 * @class
	 * @extends mstrmojo.Container
	 */
    mstrmojo.CollapsiblePanel = mstrmojo.declare(
    	
    	//superclass
        mstrmojo.Container,

        //mixin
        [mstrmojo._Collapsible],
        
        /**
		 * @lends mstrmojo.CollapsiblePanel.prototype
		 */
        {
            scriptClass: "mstrmojo.CollapsiblePanel",
            
            animate: true,
            
            /**
			 * An title for the dialog.
			 * 
			 * @type String
			 */
            title: '',
            
            /**
             * the variable of expended or collapse state
             */
            expanded: false,
            
            /**
             * the status of error or success
             */
            status: null,
			
			/**
			 * css class for the title
			 */
			titleCssClass: '',
			
			numericAlertsCssClass: '',
			
			numberOfAlerts: null,
            
            /**
             * mark string
             */
            markupString:	'<div id="{@id}" class="mstrmojo-CollapsiblePanel {@cssClass}">' +
                         			'<div class="{@titleCssClass}">'+
                         					'<img class="mstrmojo-PanelButton" id="{@id}expandcollapse" src="{@expandImg}" mstrAttach:click> </img>' + 
                         					'&nbsp;{@title}&nbsp;&nbsp;' + 
                         					'<span class="{@statusCssClass}" id="{@id}status"  mstrAttach:click><img  id="{@id}statusImg" class="mstrmojo-PanelButton" src="{@successImg}"></img></span>'+
                         					'<span class="{@numericAlertsCssClass}">{@numberOfAlerts}</span></div>' + 
                                    '<div class="mstrmojo-CollapsiblePanel-content"></div>' + 
                            '</div>',
            /**
             * the image used for expend button
             */         
            expandImg: '../images/expand.png',
            
            /**
             * the image used for collapse button
             */
            collapseImg: '../images/collapse.png',
            
            /**
             * the image used for success status
             */
            successImg: '../images/tick.png',
            
            statusCssClass: '',
            
            /**
             * the image used for error status
             */
            errorImg: '../images/tbCloseAcc.gif',
            
            /** 
             * mark slots
             */
            markupSlots: {
            	
            	/**
            	 * the button for expend or collapse
            	 */
            	toggleButton: function() { return this.domNode.firstChild.firstChild; }, 	       	
            	/**
            	 * the container node for expend or collapse part
            	 */
                containerNode: function(){ return this.domNode.childNodes[1]; },
            	
            	statusButton: function(){ return this.domNode.firstChild.childNodes[2]; },
            	
            	alertsButton: function(){ return this.domNode.firstChild.childNodes[3]; }

            },
            
            /**
             * mark methods
             */
            markupMethods: {
            	
            	/**
            	 * change event method for expended variable
            	 */
            	onexpandedChange: function() { 
                	var _target = this.containerNode;
                	
                	if (this.expanded) {
                		this.expandDown( _target );
                		this.toggleButton.src = this.collapseImg;
                	    
                	} else {
                		this.collapseUp( _target );
                		this.toggleButton.src = this.expandImg;
                	}
                },
                
                onstatusChange: function(){
                	if((navigator.userAgent.indexOf("Safari") != -1) && 
                			(navigator.userAgent.indexOf("Chrome") == -1))return;
                	if (this.status ===  true){
                		this.statusButton.style.display = "inline" ;
                	   this.statusButton.firstChild.src = this.successImg;
                	} else  if (this.status === false)
                	{
                		this.statusButton.style.display = "inline" ;
                		this.statusButton.firstChild.src = this.errorImg;
                	}
                	else {
                		this.statusButton.style.display = "none";
                	}
                	
                },
                
                /**
                 * change event method for status variable
                 */
                onnumberOfAlertsChange: function(){
                	if((navigator.userAgent.indexOf("Safari") != -1) && 
                			(navigator.userAgent.indexOf("Chrome") == -1))return;
                	
                	//now change the number , if no number is found hide the display
                	if (!this.numberOfAlerts){
                		this.alertsButton.style.display = "none";
                	}else{
	                	if (this.title == 'Alerts')
	                	{
	                		this.statusButton.style.display = "none";
	                	}
                		this.alertsButton.style.display = "inline";
                		this.alertsButton.innerHTML = (this.numberOfAlerts != null) ? this.numberOfAlerts : '';
                	}
                	
                	
                }
            },
            
           /**
            * click event for toggle button
            */
            onclick: function(evt){
            	this.set('expanded', this.expanded != true);
           },          
           
           _set_numberOfAlerts: function sttxt(n, v) {
               var was = this.text;
               this.numberOfAlerts = v;
               return was != v;
           },
           
           postBuildRendering: function postBuildRendering(){
               if(this._super){
                   this._super();
               }
             
              //disable animation for IE 9
        	(navigator.appName == 'Microsoft Internet Explorer')? this.animate = false: this.animate = true;
               
               if(this.summary){
            	   var s = mstrmojo.insert(this.summary);
            	   s.render();
            	   this.domNode.firstChild.appendChild(s.domNode);
               }
           }
        }
    );
        
})();