(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.MenuButton",
            "mstrmojo.form"
    		);
	mstrmojo.requiresDescs(8571,4700, 1563, 1143,1085,1088, 2102,61,60,9095,9096, 9097, 9098,8042,9099, 7972, 8724, 9100, 9101,9213,9214,9212); 
	    var tip=mstrmojo.desc(9212 , "Contact your administration to configure access to Salesforce reports by enabling an https connection and setting the appropriate Salesforce parameters. See Help for more details");
	    var bwidth=document.body.clientWidth,
	        bheight=document.body.clientHeight,
	        doch=bheight*0.75,
	        listh=doch-80,
	        pad=bwidth*0.05;
	    var list={
	       scriptClass:"mstrmojo.List",
           cssClass: "mstrmojo-di",
           cssText:"padding-left:"+bwidth*0.03+"px;",
           alias:"list",
           itemMarkup:    ' <div class="mstrmojo-di-bullet {@icon}" style="padding:10px 0px 10px;" onclick="di.sel()"><table cellspacing="0"><tr>'
				        +'<td  class="mstrmojo-qb-Icons {@icon}"> </td>'
				        +'<td style="vertical-align: top; padding-left:10px;"> <div style="font:14px arial;margin-top:2px;font-weight: bold; color:#333333;" >{@n}</div><div style="font:11px arial;color:#777777">{@desc}</div></td>'
				        +'</tr></table><span class="tip" style="display:none;">{@tip}</span>'
					    + '</div>' ,
           items:[{t:12, icon:'File',  n:mstrmojo.desc(4700,"File"), desc:mstrmojo.desc(9096,"Import an Excel, CSV or Text file")},
                {t:12, icon:'Database', n:mstrmojo.desc(9095,"Freeform"),desc:mstrmojo.desc(9097,"Import Data using a Script:SQL,XQuery,SOQL or HiveQL")},
                {t:12, icon:'Cube', n:mstrmojo.desc(1563,"Database"), desc:mstrmojo.desc(9098,"Import from Relational data sources")},
                {t:12, icon:'SF', n:mstrmojo.desc(9213,"Salesforce"), desc:mstrmojo.desc(9214,"Import your Reports from Salesforce.com"), tip:tip}],
                
          onmousemove: function(evt){
		    var target = mstrmojo.dom.eventTarget(window, evt);
		    if(target&&target.className==="mstrmojo-qb-Icons SF")
		    	      target.parentNode.parentNode.parentNode.parentNode.lastChild.style.display="block";
		    else if(target.innerText==="Salesforce"||target.innerText==="Import your Reports from Salesforce.com"){
		    	     target.parentNode.parentNode.parentNode.parentNode.parentNode.lastChild.style.display="block";
		    }
		    else{
		         var sftip=document.getElementsByClassName('mstrmojo-di-bullet SF')[0].lastChild;
		         if(sftip.style.display==="block") sftip.style.display='none'
		    }
	    },

	    onRender: function(){
	    	   if (this.domNode){ 
	  	           	mstrmojo.dom.attachEvent(this.domNode, 'mousemove', this.onmousemove);
	  	            mstrmojo.dom.attachEvent(this.domNode, 'mouseout', this.onmouseout);
	    	   }
	    }
        
	 };
	 var _more=[
				  { 'did': '0', 'n': 'Other1'},
	              { 'did': '1', 'n': 'Other1'},
	              { 'did': '2', 'n': 'Other1'},
	              { 'did': '3', 'n': 'Other1'}];
	
   var _getQuota=function getQuota(callback){
            var taskParams =  {
                taskId:'qBuilder.GetQuota',
                sessionState: mstrApp.sessionState
            };
            var cb = {
   			 success: function(res){
           	     if (callback && callback.success){
           	    	 callback.success(res);
           	     }
  				 },
   			 failure: function(res){ 
  					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
 				 }			
   		 };
            mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams);
        };
	              
    var menuButton= new mstrmojo.MenuButton({
		 	    cssClass: "mstrmojo-Editor-button function",
		        cssText: "visibility:hidden; border:0px solid; background-color:transparent;",
		        iconClass: "mstrmojo-ArchitectListIcon div", 
		        alias: "menu",
		        itemChildrenField: 'fns',
		        itemIdField: 'did',
		        itemField: 'n',
		        text:"",	
		        menuZIndex:100,
		        searchItemAdded: true,
		        executeCommand: function(item){},
		        postCreate: function(){		  
				        this.cm = _more;
				    }
				 }); 
	 
	 var quotalist= {
		 scriptClass:"mstrmojo.List",
         cssClass: "mstrmojo-di",
         cssText:"position:relavtive; top:-20px; padding-top:20px; height:"+listh+"px;overflow-y:auto;overflow-x:hidden;",
         alias:"qlist",
         itemMarkup:    ' <div class="mstrmojo-di-Quota-bullet" idx="{@idx}"; style="padding-left:10px;padding-right:10px; border-bottom: 1px solid #888888;"><table cellspacing="0" style="width:100%;"><tr>'
				       +'<td style="width:50%;"><div style="padding-bottom:5px;"><span style="padding-left: 10px;"></span><span class="qspan2">{@n}</span></div>'
				             +'<div style="padding-left: 10px; font: 11px arial; color:#777777;">{@desc}</div>'
				             +'<div style="padding-top:10px; padding-left: 10px; visibility: hidden;"><span class="qspan">'+mstrmojo.desc(8042,"Create Analysis")+'</span><span class="qspan">'+mstrmojo.desc(1088,"Edit")+
				             '</span><span class="qspan">'+mstrmojo.desc(1085,"Schedule")+'</span><span class="qspan">'+mstrmojo.desc(9099,"Share")+'</span><span id="mop" class="qspan">'+mstrmojo.desc(8571,"More")+'</span></div></td>'
				        +'<td style="width:15%;"><span class="qspan2">{@size}</span></td>'
				        +'<td style="width:15%;"><span class="qspan2">{@owner}</span></td>'
				        +'<td style="width:20%;"><span class="qspan2">{@tm}</span></td>'
				        +'</tr></table>'
					    + '</div>' ,
					
        onmousemove: function(evt){
		    var target = mstrmojo.dom.eventTarget(window, evt);
		    if(target&&target.className==="mstrmojo-di-Quota-bullet"){
		             var p=target.parentNode.parentNode.children;
		    	      target.firstChild.firstChild.firstChild.firstChild.lastChild.style.visibility="visible";
		    	       var  idx=target.attributes["idx"].nodeValue;
		    	      for(var i=0,len=p.length; i<len; i++){
		    		      if(i===parseInt(idx)) continue;
		    		      var c=p[i].children[0].firstChild.firstChild.firstChild.firstChild.lastChild.style.visibility;
		    	          if(c==="visible") p[i].children[0].firstChild.firstChild.firstChild.firstChild.lastChild.style.visibility="hidden";
		                 }
		    }
		    if(target&&target.id==='mop'){
	    		  var left=target.offsetLeft+target.offsetWidth,
	    		      p=target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode,
	    		      li=p.parentNode.parentNode.parentNode,
	    		      top=p.offsetTop-li.offsetHeight+target.offsetTop-li.scrollTop+10;
	    		  menuButton.cssText="position:relative; visibility:visible;left:"+left+"px;top:"+top+"px; border:0px solid; background-color:transparent;z-index:40;";
	  		    }
		    else{  
		    	  menuButton.cssText= "visibility:hidden;";
		    }
	    		  menuButton.render();
		    
	    },
	    onmouseout: function(evt){
	    	  var target = mstrmojo.dom.eventTarget(window, evt);
	    	  if(target&&target.className==="mstrmojo-di-Quota-bullet"){
	    		   var li=target.parentNode.parentNode.parentNode;
	    		   if(evt.clientX>li.clientWidth+li.offsetLeft-2||evt.clientY>li.firstChild.clientHeight+li.offsetTop+15||
		    		evt.clientX<li.offsetLeft||evt.clientY<li.offsetTop+22)
	    	   {
	    		  target.firstChild.firstChild.firstChild.firstChild.lastChild.style.visibility="hidden";;
	    	   }
	    	  }
	    },
	
	    onRender: function(){
	    	   if (this.domNode){ 
	  	           	mstrmojo.dom.attachEvent(this.domNode, 'mousemove', this.onmousemove);
	  	            mstrmojo.dom.attachEvent(this.domNode, 'mouseout', this.onmouseout);
	    	   }
	    }
	 };
	
	

	    
   mstrmojo.DataImport = mstrmojo.declare(
		    mstrmojo.Container,
    		null,
    		{
                scriptClass: "mstrmojo.DataImport",
                markupString:'<div id="{@id}" class="mstrmojo-di {@cssClass}" style="{@cssText}">' +
	                          '<div class="mstrmojo-di-toolbar"></div>' +
	                          '<div></div>'+
	                          '<div class="mstrmojo-di-layout" style="width:100%; height:{@height}; border-bottom:2px solid #888888;padding-top:20px;"></div>' +
	                          '<div class="mstrmojo-di-footer" style="width:100%;"></div>' +
	                          '</div>',
	            markupSlots: {
	              				toolbar: function(){ return this.domNode.firstChild; },
	              				layout: function(){ return this.domNode.children[2]; },
	              				footer: function(){ return this.domNode.lastChild; }
	              			},
                height:doch+"px",
    			width:null,
    			minWidth:800,
    			minHeight:500,
    			
    			children: [ 
                            {
                               scriptClass: "mstrmojo.Table", 
                               rows: 1,
       	                       cols: 2,
       	                       slot: 'toolbar',
       	                       layout: [{cssText:"background-color:grey;",cells: [{cssText: "height:25px; width:100%; "}, {cssText: "width:28px;  height:25px; padding-right:5px;"},{cssText: "width:28px; height:25px; "}]}],
       	                       children:[
    			                  {
    		                        scriptClass: "mstrmojo.Label",
    		                        slot:"0,0",
    		                        cssText:"font-size:15px;color:white;margin-left:10px;",
    		                        text: mstrmojo.desc(7972,"Import data")
    			                  },
    			                  { scriptClass: "mstrmojo.Button",
    			    			    slot: "0,1",
    			    				iconClass: "mstrmojo-di-help",
    			    				title:  mstrmojo.desc(1143,"Help")
    			    			  },
    			                  {scriptClass: "mstrmojo.Button",
    			    			    slot: "0,2",
    			    				iconClass: "mstrmojo-di-close",
    			    				title: mstrmojo.desc(2102,"Close")
    			    			  }
    			                  ]
    			              },
    			              {
                                scriptClass: "mstrmojo.Box",
    			                slot: 'layout',
    			                children:[
			                        //  Welcome page
			                        {
			                            scriptClass: "mstrmojo.Table",
    			                         alias: 'welcome',
    			                         cssText:"width:100%;",
    			                         rows: 1,
                                         cols: 2,
                                         usage:0,
                                         quota:0,
                                         layout: [{cells: [{cssText: "width:25%;"}, {cssText: "vertical-align: top; width:75%;"}]}],
    				                     children: [
    				                    	 {
    				                    		scriptClass: "mstrmojo.Box",
    				                    		height:doch-20+"px",
    				                    		cssText:"border-right:1px solid #888888;padding-right:"+pad+"px; margin-right:1px;overflow-y:auto;",
    				                    		slot: "0,0",  
    				                    	    children:[
    				                            {
    			                                 scriptClass: "mstrmojo.Label",
    			                                 cssText:" font:14px arial; font-weight:bold; color:#666666; padding:0px 0px 25px 50px;",
    			                                 text: mstrmojo.desc(9100,"Select Your Data Source") 
    				                            },
    			                                list
				                              ]},
				                              {
				                               scriptClass: "mstrmojo.Box",
				                               height:doch-20+"px",
				                               cssText:"border-left:1px solid #ffffff;padding-left:"+pad+"px;padding-right:"+pad+"px;",
				                               slot: "0,1",
	    				                       children:[
	    				                           {
	    			                                 scriptClass: "mstrmojo.Label",
	    			                                 cssText:" font:14px arial; font-weight:bold; color:#666666;  padding:0px 0px 25px;",
	    			                                 text: ""
	    				                           },
	    				                           {
		    			                                 scriptClass: "mstrmojo.Table",
		    			                                 cssText:"position:relative;height:20px; border-top:1px solid #888888;border-bottom:1px solid #888888;background-color:#F5F5F2; z-index:100;",
		    			                                 rows: 1,
		    	                                         cols: 4,
		    	                                         cellSpacing: 1,
		    	                                         layout: [{cells: [{cssText: "width:50%;"}, {cssText: "width:15%;"},{cssText: "width:15%;"},{cssText: "width:20%;"}]}],
		    	                                         children:[
		    	                                                   {
		    	          			                                 scriptClass: "mstrmojo.Label",
		    	          			                                 slot:"0,0",
		    	          			                                 cssClass:"qspan3",
		    	          			                                 cssText:"padding-left:18px;",
		    	          			                                 text: mstrmojo.desc(7972,"Import data")
		    	          				                            },
		    	          				                          {
			    	          			                                 scriptClass: "mstrmojo.Label",
			    	          			                                 slot:"0,1",
			    	          			                                 cssClass:"qspan3",
			    	          			                                 text: mstrmojo.desc(8724,"Size(KB)")
			    	          				                            },
			    	          				                      {
				    	          			                              scriptClass: "mstrmojo.Label",
				    	          			                              slot:"0,2",
				    	          			                              cssClass:"qspan3",
				    	          			                              text: mstrmojo.desc(60,"Owner")
				    	          				                    },
				    	          				                    {
					    	          			                              scriptClass: "mstrmojo.Label",
					    	          			                              slot:"0,3",
					    	          			                              cssClass:"qspan3",
					    	          			                              text: mstrmojo.desc(61 ,"Modified")
					    	          				             }
				    	          				                    ]
	    				                           },
	    				                           quotalist,
	    				                           menuButton
					                              ]
					                           }
				                           ]
				                    }
			               ],
			               preBuildRendering: function(){
		                        	 var me=this.children[0];
		                        	var taskParams =  {
		                                     taskId:'getDIExternalInfo',
		                                     sessionState: mstrApp.sessionState
		                                  };
		                               var cb={
		                              			success:function(res){
		                            	           if(res.id&&res.redirectURL&&res.secret&&document.location.protocol.indexOf('https')>-1){
		                            	             var ls=me.children[0].children[1];
		                              			         ls.items[3].icon='SFA';
		                              			         ls.render();
		                            	           }
		                              		    }, 
		                              		    failure:function(res){
		                              		          mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));	  
		                              		                          }
		                              		        };
		                              		   
		                                mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, taskParams); 
		                        	 var success=function(res){
		                        		 var c=res.cubes,
		                        		     cbs=c.cube,
		                        		     tb=me.children[1];
		                        		     txt=mstrmojo.desc(9101,"Currently using ## MB of ### MB allocated In-memory Space").replace('##',c.cusage).replace('###', c.cquota);
		                        		      me.usage=c.cusage;
		                        		      me.quota=c.cquota;
		                        		      tb.children[0].set('text', txt);
		                        		  var items=[];
		                        		  if(cbs){
		                        			  for(var i=0,len=cbs.length;i<len; i++){
		                        				    var cb=cbs[i];
		                        				     items[i]={idx:i, size:cb.sz, owner: 'Administrator', tm: "", n:cb.cname, desc:''};
		                        			  }
		                        			  tb.children[2].set('items', items)
		                        		  }
		                        		  tb.children[1].domNode.style.width=tb.children[2].domNode.clientWidth+'px';
		                        		   
		                        	 },
		                        	     failure=function(){};
		                        	  _getQuota({success:success, failure:failure});
		                         }
    			              }
    			              ],
    			 sel: function sel(){
	            		  var item = this.children[1].welcome.children[0].list.selectedItem,
	              		      url = {};	  
	              		  switch (item.icon){
	              		  case 'File':	
	              			  mstrmojo.form.send({evt:'3137', src:microstrategy.servletName+'.3137', isNew: 'true', DataImportSource: '0'}, mstrApp.name, 'POST', null, null, false); 
	              			  break;
	              		  case 'Database':
	              			  mstrmojo.form.send({evt:'3171', src:microstrategy.servletName+'.3171', FFsql:'true'}, mstrApp.name, 'POST', null, null, false);
	              			  break;	              		         			  
	              		  case 'Cube':
	              			  mstrmojo.form.send({evt:'3171', src:microstrategy.servletName+'.3171'}, mstrApp.name, 'POST', null, null, false);	              			 
	              			  break;
	              		  case 'SFA':
	              			  mstrmojo.form.send({evt:'3137', src:microstrategy.servletName+'.3137', isNew:'true', DataImportSource:'2'}, mstrApp.name, 'POST', null, null, false);
	              			  break;
	              		  default:
	              			  break;
	              		  }
	              		  
	             }
	          
    		}
	   );
})();
