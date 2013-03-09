(function (){
	
	mstrmojo.requiresCls(
		"mstrmojo.TabContainer",
		"mstrmojo.Table",
		"mstrmojo.Label");
		
	mstrmojo.requiresDescs(8699,8706,8707,8728,8689,8695, 8757);	
	
	/**
	 * ipa job detail. there is only instance. 
	 */
	
	function nl2br(text){
		var re_nlchar = ""
		text = escape(text);
		if(text.indexOf('%0D%0A') > -1){
			re_nlchar = /%0D%0A/g ;
		}else if(text.indexOf('%0A') > -1){
			re_nlchar = /%0A/g ;
		}else if(text.indexOf('%0D') > -1){
			re_nlchar = /%0D/g ;
		}
		return unescape( text.replace(re_nlchar,'<br />') );
	}
	
	mstrmojo.IPA.IPAJobDetail = mstrmojo.insert(
	{
        scriptClass:"mstrmojo.TabContainer",
		cssClass:"mstrmojo-jobdetail-panel",
		id:'ipaJobDetail',
		model:null,
		children: [
		{
			scriptClass: "mstrmojo.TabStrip",
			slot: "top",
			autoHide: false,
			target: this.parent.detailStack
		}, 
		{
			scriptClass: "mstrmojo.StackContainer",
			cssClass:"mstrmojo-jobdetail-frame",
			slot: "stack",
			alias: "detailStack",
			border: "1px solid #AAAAAA",
			children: [
				mstrmojo.insert(
				{
					scriptClass: "mstrmojo.Table",
					cssClass:"mstrmojo-jobdetail-table",
					cellSpacing: '0',
					cellPadding: '0',
					selected: true,
					n: mstrmojo.desc(8695,"Job Detail"),
					rows:4,
					cols:2,
					layout:[
						    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
						    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
						    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
						    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]}
					],
					children: [				
					{
						scriptClass: 'mstrmojo.Label',
						alias:'filter',
						cssClass:'mstrmojo-cachedetail-label',
						slot:'0,1'
					},
					{
						scriptClass: 'mstrmojo.Label',
						alias:'template',
						cssClass:'mstrmojo-cachedetail-label',
						slot:'1,1'
					},
					{
						scriptClass: 'mstrmojo.Label',
						alias:'numOfTasks',
						cssClass:'mstrmojo-cachedetail-label',
						slot:'2,1'
					},
					{
						scriptClass: 'mstrmojo.Label',
						alias:'numOfFinishedTasks',
						cssClass:'mstrmojo-cachedetail-label',
						slot:'3,1'
					},
					{
						scriptClass: 'mstrmojo.Label',
						slot:'0,0',
						cssClass:'mstrmojo-cachedetail-label',
						text:mstrmojo.desc(8689,'Filter :')
					},
					{
						scriptClass: 'mstrmojo.Label',
						slot:'1,0',
						cssClass:'mstrmojo-cachedetail-label',
						text:mstrmojo.desc(8728,'Template :')
					},
					{
						scriptClass: 'mstrmojo.Label',
						slot:'2,0',
						cssClass:'mstrmojo-cachedetail-label',
						text:mstrmojo.desc(8707,'Number of Tasks :')
					},
					{
						scriptClass: 'mstrmojo.Label',
						slot:'3,0',
						cssClass:'mstrmojo-cachedetail-label',
						text:mstrmojo.desc(8706,'Number of Finished Tasks :')
					}
					]

				}), 
				mstrmojo.insert(
				{
					scriptClass: "mstrmojo.VBox",
					cssText:"margin-bottom:3px;",
					n: mstrmojo.desc(8699,"Job SQL Query"),
					children: [
					{
						scriptClass: 'mstrmojo.Label',
						cssClass:"mstrmojo-sqlquery-label",
						alias: 'sqlInfo'
					}]
				})
				],
				postCreate:function(){
					var table = this.children[0];
					//set the initial selected
					this.set("selected", table);
				}
			}],
			_set_model:function(n, v){
				//this is a workaround of a bug in the TabContainer
				this.model = v;
				var job = v;
				var table = this.children[1].children[0];
				var sqlInfo = this.children[1].children[1].sqlInfo;
					
				if(job && table){
					table.filter.set("text", job.Filter);
					table.template.set("text", job.Template);
					table.numOfTasks.set("text", job.NumberOfTasks);
					table.numOfFinishedTasks.set("text", job.NumberOfFinishedTasks);
					
					if(job.SQLQuery == "undefined"){
						sqlInfo.set("text", nl2br(mstrmojo.desc(8757,"The SQL has not been generated for this job yet")));
					}else{
						sqlInfo.set("text", nl2br(job.SQLQuery));	
					}
					
				}
			}
	});
})();
