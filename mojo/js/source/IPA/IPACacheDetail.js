/**
 * 
 *show detail of cache. only one instance
 * @author wxu
 */

(function(){
	
	mstrmojo.requiresCls(
			"mstrmojo.Table",
			"mstrmojo.Label");
			
	mstrmojo.requiresDescs(8702,8687,8664,8673,8739,8721,8712,8677,8675,8718,8674,8688);
	
	mstrmojo.IPA.IPACacheDetail = mstrmojo.insert({
		scriptClass: "mstrmojo.Table",
		cssClass:"mstrmojo-cachedetail-table",
		id:"ipaCacheDetail",
		cellSpacing: '0',
		cellPadding: '2',
		selected: true,
		model: null,
		rows:12,
		cols:2,
		layout:[
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]},
		    {cells:[{cssClass:"detailName"},{cssClass:"detailValue"}]}
		 ],
		children:[
		    {
		    	scriptClass: "mstrmojo.Label",
		    	text:mstrmojo.desc(8702,"Last Update"),
		    	cssClass:"mstrmojo-cachedetail-label",
		    	slot:"0,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.LastUpdatedTime"
		    	},
		    	slot:"0,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8687,"Expiration"),
		    	slot:"1,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.Expiration"
		    	},
		    	slot:"1,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8664,"Cache ID"),
		    	slot:"2,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.Id"
		    	},
		    	slot:"2,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8673,"Creation Time"),
		    	slot:"3,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.CreationTime"
		    	},
		    	slot:"3,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8739,"Waiting List"),
		    	slot:"4,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.WaitingList"
		    	},
		    	slot:"4,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8721,"Security Filter ID"),
		    	slot:"5,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.SecurityFilterID"
		    	},
		    	slot:"5,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8712,"Prompt Answer"),
		    	slot:"6,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.CachePromptAnswers"
		    	},
		    	slot:"6,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8677,"Database Login"),
		    	slot:"7,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.DBLogin"
		    	},
		    	slot:"7,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8675,"Database Connection"),
		    	slot:"8,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.DBConnection"
		    	},
		    	slot:"8,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8718,"Report ID"),
		    	slot:"9,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.ReportId"
		    	},
		    	slot:"9,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8674,"Data Language"),
		    	slot:"10,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.Language"
		    	},
		    	slot:"10,1"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	text:mstrmojo.desc(8688,"File Name"),
		    	slot:"11,0"
		    },
		    {
		    	scriptClass: "mstrmojo.Label",
		    	cssClass:"mstrmojo-cachedetail-label",
		    	bindings:{
		    		text: "this.parent.model.CacheFileName"
		    	},
		    	slot:"11,1"
		    } 
		]
	});
	
})();