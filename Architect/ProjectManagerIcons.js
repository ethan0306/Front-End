(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.MenuButton",
    		"mstrmojo.Editor",
    		"mstrmojo.TextBox",
			"mstrmojo._HasContextMenu"
    		);
	
	
    
	 var PMIcon = new mstrmojo.Box({
	   
	                scriptClass: "mstrmojo.Box",
	               
	                markupString: '<div id="{@id}" class="mstrmojo-Box {@cssClass}" style="{@cssText}" >{@projectsHTML}</div>'   });
		
		
	                        
	
	
   function loadProject(callback)
	   {
		var lp_params = {taskId:'getProjects'};
		var lpcb = {
			      success: function(res){
			                          var k=0;
			                          projectsHTML='<div dg="0" or="2" class="mstrTransform" style="display:block;" rsz="0" name="projects_ProjectsStyle" id="projects_ProjectsStyle" ors="3"><table cellpadding="0" class="mstrLargeIconView" cellspacing="0" border="0"><col class="mstrLargeIconViewCell" span="1"/><col class="mstrLargeIconViewCell" span="1"/>';
			                          for (i=0; i<res.servers.length;i++)
			                              for (j=0; j<res.servers[i].projects.length; j++) { 
			                            	      var src="mstrWeb?evt=3010&src=mstrWeb.3010&Project="+res.servers[i].projects[j].name+"&loginReq=true&Port=0&Server="+res.servers[i].name+"&mstrWeb=*0&welcome=*-1.*-1.0.0.0";
				                                  var item='<td  class="mstrmojo-Architect-pm-bullet" colspan="1" rowspan="1" mstrAttach:mouseover,mouseout><table class="mstrLargeIconViewItem" cellspacing="0"><tr><td colspan="1" rowspan="1">'
				                                            +'<a href="'+src+'"><span title="'+res.servers[i].projects[j].name
				                                	        +'" class="mstrmojo-Architect-mstrIcon" name="mstrIconProject" id="mstrIconProject" style="background-position: 0px -152px;"></span></a></td><td class="mstrLargeIconViewItemText" colspan="1" rowspan="1">'
				                                            +'<div class="mstrLargeIconViewItemName"><a style="text-decoration:none" href="'+src+'">'+res.servers[i].projects[j].name+'</a></div>'
                                                            +'<div class="mstrProjectDescription"> '+res.servers[i].projects[j].desc+'</div><div class="mstrServer"><label>Server name</label><span>'+res.servers[i].name
                                                            +'</span></div><div><span style="padding-right:10px;"><a href="#" onclick="mstrmojo.all.pmicon.renameProject()">Rename</a></span><span><a href="#" onclick="mstrmojo.all.pmicon.deleteProject()">Delete</a><span></div><div style="visibility:hidden">'+res.servers[i].projects[j].id+'</div></td></tr></table></td>';
				                         if(k%2){
				                                    projectsHTML+=item+'</tr>';}  
				                         else {
					                                projectsHTML+='<tr>'+item;}
				                                    k++;
				                              }
			                          projectsHTML+='</table></div>';
			      
			    if (callback){callback();}
			    
			  },
			failure: function(res){
				
				 mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg')); }
		};
		
		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, lpcb, lp_params);
	}

   
    
    function populateProjectList(){
		    loadProject(setHTML);
	    }	
	

    function setHTML(){
	
	    PMIcon.markupString='<div id="{@id}" class="mstrmojo-Box {@cssClass} style="{@cssText}">'+projectsHTML+'</div>';
	    PMIcon.render();
	    
}
    function renderProjects(){
    	  loadProject(setHTML);
    	  mstrmojo.all.pmlist.render();
    }
    
    
    
  
    mstrmojo.Architect.ProjectManagerIcons= mstrmojo.declare(
    		// superclass
    		  mstrmojo.Box,
    		
    		// mixins
    		  mstrmojo._HasContextMenu,
    		
    		{
    			
    			scriptClass: "mstrmojo..Architect.ProjectManagerIcons",
    		     
    			cssText: "position:relative; top:20px; overflow: auto; height: 600px;",
    			
    			children: [ 
    			             PMIcon
    			          ],
    			          
    	   deleteProject: function(){
    			  var e = (window.event) ? window.event : evt;
    			  var target= mstrmojo.dom.eventTarget(window.event, e);
    			  
    		        var pid=target.parentElement.parentElement.parentElement.childNodes[4].innerHTML;
    		    	mstrmojo.all.ArchModel.deleteProject(pid,renderProjects);
    		    },	
  			
          renameProject:function (){
	                  var e = (window.event) ? window.event : evt;
	    			  var target = mstrmojo.dom.eventTarget(window.event,e);
	    			  var pid=target.parentElement.parentElement.parentElement.childNodes[4].innerHTML;
	    		      mstrmojo.all.ArchModel.renameProject(pid,32,renderProjects)
	                              },
	                              
  			preBuildRendering: function(){
				
    			          populateProjectList();     
    			                         }
	
    		}                
  	
  		    
	    );
})();