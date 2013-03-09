(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.List",
            "mstrmojo._HasContextMenu",
    		"mstrmojo.MenuButton",
    		"mstrmojo.Editor",
    		"mstrmojo.TextBox"
    		);
	
  var ProjectList =  new mstrmojo.List({
		alias: "ProjectList",
		cssClass: "mstrmojo-mstrmojo-Architect-pm",
		cssText: "height:500px;width:100%;padding-top:5px;",
		itemMarkup: '<div class="mstrmojo-Architect-pm-bullet"><table class="mstrListView" cellspacing="0"><tr>'
						
						 +'<td colspan="1" rowspan="1"><span title="" class="mstrIcon-lv mstrIcon-lv-p" onclick="PM.onsel();"></span></td>'
						 +'<td colspan="3" rowspan="1" onclick="PM.onsel();"> {@n}</td>'
						 +'<td colspan="3" rowspan="1"> {@sn}</td>'
						 +'<td colspan="10" rowspan="1">DESC:{@desc}</td>'
						 +'<td colspan="5" rowspan="1">{@id}</td>'
						 +'<td colspan="3" rowspan="1"  margin=0> <Button title="Delete" class="mstrIcon-tb mstrmojo-ArchitectListIcon delbtn"  onclick="mstrmojo.all.pmlist.deleteProject();">'
						 +'<Button title="Rename" class="mstrIcon-tb mstrmojo-ArchitectListIcon edtbtn"  onclick="mstrmojo.all.pmlist.renameProject()"></td>'
						 +'</tr></table>'
					      + '</div>' 
        });
				                  
	
	
	var projects=new Array();
	
	function loadProject(callback)
	{
		var lp_params = {taskId:'getProjects'};
		var lpcb = {
			success: function(res){
			var k=0;
			projects=[];
			 for (i=0; i<res.servers.length;i++)
			 for (j=0; j<res.servers[i].projects.length; j++) {  
				projects[k]={n:res.servers[i].projects[j].name, id:res.servers[i].projects[j].id, 
						     sn:'Server Name: '+res.servers[i].name, desc:res.servers[i].projects[j].desc};
			     k++;}
			  
					      
			    if (callback){callback();}
			                      },
			                      
			failure: function(res){
				
				 mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
		          };
		
		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, lpcb, lp_params);
	}
	
    
	
	function populateProjectList(){
	  loadProject(setProjects);
	  
	}
	
	
	function setProjects(){
		
		ProjectList.set("items", projects);
		
	}
	
	function renderProjects()
	{   
	   loadProject(setProjects);
	   mstrmojo.all.pmicon.render();
	}	
	

	

mstrmojo.Architect.ProjectManagerList = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins
    		 mstrmojo._HasContextMenu,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.Architect.ProjectManagerList",
    		
    			markupString: '<div id="{@id}" class="mstrmojo-Box {@cssClass}" style="{@cssText}" ></div>',
    	        cssText: "overflow: auto;",				
    		    children: [ 
    		              {
	                          scriptClass: "mstrmojo.Box",
	              
	                          markupString:  '<div id="{@id}" class="mstrmojo-Box {@cssClass}" style="{@cssText}" >'
	            	                          +'<table summary="" class="mstrListView" cellspacing="0" id="ProjectList"><thead><tr>'
                                              +'<td colspan="1" rowspan="1">&nbsp;</td>'
                                              +'<td colspan="3" rowspan="1">Project Name</td>'
                                              +'<td colspan="3" rowspan="1">Server Name</td>'
                                              +'<td colspan="10" rowspan="1">Description</td>'
                                              +'<td colspan="5" rowspan="1">Project ID</td>'
                                              +'<td colspan="3" rowspan="1">Actions</td></tr></thead></table></div>'
                                  	 
                          },

				       	 ProjectList,
		
	                ],
	                
	             deleteProject:function (){
    			                    var e = (window.event) ? window.event : evt;
    			                    var target = mstrmojo.dom.eventTarget(window.event,e);
    		                       
    			                     var pid=target.parentElement.parentElement.children[4].innerHTML;
    		 	                     mstrmojo.all.ArchModel.deleteProject(pid,renderProjects);
    			 
    		                              },
    		                              
    		     renameProject:function (){
    		                  var e = (window.event) ? window.event : evt;
    		    			  var target = mstrmojo.dom.eventTarget(window.event,e);
    		    		      var pid=target.parentElement.parentElement.children[4].innerHTML;
    		    		      mstrmojo.all.ArchModel.renameProject(pid,32,renderProjects)
    		                              },
    		     onsel: function(){
    		                	 var list=this.ProjectList,
    		                     pname=list.items[list.selectedIndex].n,
    		                	 pserver=list.items[list.selectedIndex].sn.substring(13);
    		                	 window.location.href="mstrWeb?evt=3010&src=mstrWeb.3010&Project="+pname+"&loginReq=true&Port=0&Server="+pserver+"&mstrWeb=*0&welcome=*-1.*-1.0.0.0";
    		                	  
    		                        },
    		    
    		                              
    		     preBuildRendering: function(){
					
    			              populateProjectList();
	
                                             }	
           		
    		
    			
          }	    
	   );
})();