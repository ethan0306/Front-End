(function(){
	mstrmojo.requiresCls(
            "mstrmojo.Architect.ProjectManagerList",        
            "mstrmojo.Architect.ProjectManagerIcons",
            "mstrmojo.Architect.ArchitectModel"
    		);
	
var AM = new mstrmojo.Architect.ArchitectModel({id:"ArchModel"}); 
var pn=new mstrmojo.Editor({ 
	 title: "Create New Project",
	 cssText: "width:250px;",
	 children: [
    {//Name label
        scriptClass:"mstrmojo.Label",
        cssText: "font-weight:bold; width:100%; padding: 5px;",
        alias: "nameinfo",
        text: "Project Name: "
    },

    {//	Project name
          scriptClass: "mstrmojo.TextBox",
          alias: "txtname",
          cssText:"width:200px;"
          
       	
   },

   { // buttons
	scriptClass : 'mstrmojo.HBox',
	cssClass : 'mstrmojo-Editor-buttonBox',
	slot : 'buttonNode',
	children : [ 
	{//OK
		scriptClass : "mstrmojo.HTMLButton",
		cssClass : "mstrmojo-Editor-button",
		cssText:"float:right;",
		text : mstrmojo.desc(1442, "OK"),
		onclick : function(evt) {
			var e = this.parent.parent;
			var ret = true;;
			if (e.onOK) { ret = e.onOK(); }
			if (ret) { e.close();}
			AM.createProject(e.children[1].value,this.renderProjects);
		},
		renderProjects: function(){
			//setTimeout("PMI.render()", 2000);
			//setTimeout("PM.render()", 2000);
			}
	  
	}, 
	{// cancel
		scriptClass : "mstrmojo.HTMLButton",
		cssClass : "mstrmojo-Editor-button",
		text : mstrmojo.desc(221, "Cancel"),
		onclick : function(evt) {
			var e = this.parent.parent;
			if (e.onCancel) { e.onCancel(); }
			e.close();
		}
	}
]}
]
		});

mstrmojo.Architect.ProjectManager = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		null,
    		{
    			scriptClass: "mstrmojo.Architect.ProjectManager",
    			children: [
    			           {
                             scriptClass:"mstrmojo.TabContainer",
	                         markupString: '<div class="mstrmojo-Architect-PM-tabcontainer"><div class="mstrmojo-tabcontainer-tabs" ></div>' +
	                                        '<div class="mstrmojo-tabcontainer-stack" ></div></div>',
	                         model:null,
	                         children: [{
	                     		scriptClass: "mstrmojo.TabStrip",
	                     		slot: "top",
	                     	    autoHide: false,
	                     	    cssText:"background-color:#D9DDE0",
	                     	    target: this.parent.detailStack,
	                     		addTabButtons: function(models, index) {
	                                 var tps = this.targetProps || {},
	                                     t = tps.childTitle || 'n',
	                                     c = tps.childColor || 'tbc',
	                                     Sc = this.tabButtonClass,
	                                     btns = [],
	                                     stack = this.target,
	                                     oc = function(evt){
	                                         stack.set("selected", this.target);
	                                        
	                                     };
	                                 mstrmojo.requiresCls('mstrmojo.' + Sc);
	                                 
	                                 // Iterate the button models.
	                                 for (var i = 0, len = (models&&models.length)||0; i < len; i++) {
	                                     var b = models[i],  // Single button.
	                                         ttl = b[t];     // Button title.
	                                     
	                                     if (ttl) {
	                                         // Create new button.
	                                         var btn = new mstrmojo[Sc]({
	                                         	markupString: '<span class="mstrmojo-Architect-PM-ToolButton" title='+ttl+' style="{@cssText}" mstrAttach:click></span>',
	                                           //  title: ttl,
	                                             cssText:"background-image:"+b[c]+";background-repeat:no-repeat; background-position:center;",
	                                            // cssClass:"mstrmojo-arch-ToolButton",
	                                             target: b,
	                                             onclick: oc
	                                         });
	                                         
	                                         // Add to collection.
	                                         btns.push(btn);
	                                     }
	                                 }

	                                var btn = new mstrmojo[Sc]({
	                                 	markupString: '<span class="mstrmojo-Architect-PM-ToolButton" title="Create New Project" style="{@cssText}" mstrAttach:click></span>',
	                                     cssText:"background:url(images/project20x19.gif); background-repeat:no-repeat; background-position:center;",
	                                    
	                                     //cssClass:,
	                                     target: b,
	                                     onclick: function(evt){
	                                        pn.open();
	                                        pn.txtname.focus();
	                                                       } 
	                                     });
	                                
	                                     btns.push(btn);
	                                 // Did we create some buttons?
	                                 if (btns.length) {
	                                 	  
	                                 	if (this.autoHide)
	                                         this.set("visible", btns.length);               
	                                         this.addChildren(btns, index);
	                                        
	                                 }
	                                  } 
	                                 
	                     	  }, 
	                     	 {
	                     		scriptClass: "mstrmojo.StackContainer",
	                     		slot: "stack",
	                     		alias: "detailStack",
	                     		children: [
                                        new mstrmojo.Architect.ProjectManagerList({
                                        	id:"pmlist",
                                            n:"ListView", 
                                            tbc:"url(images/iconListView2.gif)"
                                         }),
                                        new mstrmojo.Architect.ProjectManagerIcons({
                                         	id:"pmicon",
                                            n:"IconView", 
                                            tbc:"url(images/iconIconView.gif)"
                                          })
	                     			],
	                     			postCreate:function(){
	                     				var table = this.children[1];
	                     				this.set("selected", table);
	                     			}
	                     		}]
	                            }
	                         ]
    		          }
	    );
})();