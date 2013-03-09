(function() {
	mstrmojo.requiresCls("mstrmojo.Model", "mstrmojo.Arr");

	mstrmojo.IPA.EnvironmentModel = mstrmojo.declare(
	// superclass
			mstrmojo.Model,
			// mixins
			null,

			// instance members
			{
				scriptClass : "mstrmojo.IPA.EnvironmentModel",
				model : {},

				_set_model : function(n, v, silent) {
					if (this.model === v) {
						return false;
					}

					if (this.model.environments){
					for (var i = 0; i < this.model.environments.length; i++){
						if(this.model.environments[i].id)
							mstrmojo.all[this.model.environments[i].id].destroy();
						for (var j = 0; j < this.model.environments[i].iServers.length; j++){
							if(this.model.environments[i].iServers[j].id)
								mstrmojo.all[this.model.environments[i].iServers[j].id].destroy();
						}
					}
					for (var i = 0; i < this.model.webServers.length; i++){
						if(this.model.webServers[i].id)
							mstrmojo.all[this.model.webServers[i].id].destroy();
					}
					for (var i = 0; i < this.model.mobileServers.length; i++){
						if(this.model.mobileServers[i].id)
							mstrmojo.all[this.model.mobileServers[i].id].destroy();
					}
					}
					
					//1. go into the root node and extract the environments there
					if (v.length == 0) return true;
					
					this.model.environments = [];
					this.model.webServers = [];
					this.model.mobileServers = [];
					
					var rootNodePos = -1;
					var newModel = {};

					for ( var i = 0; i < v.length; i++) {
						if (v[i].id == "RN") {
							rootNodePos = i;
						}
						else{
							newModel[v[i].id] = v[i];
							if (newModel[v[i].id].type == "Web"){
								this.model.webServers.push(
										mstrmojo.hash.make(newModel[v[i].id], mstrmojo.Obj, null))
							}
							if (newModel[v[i].id].type == "Mobile"){
								this.model.mobileServers.push(
										mstrmojo.hash.make(newModel[v[i].id], mstrmojo.Obj, null))
							}
						}
					}
					
					var env=[]; 
					if(rootNodePos >= 0){						
						var	env = v[rootNodePos].children;
					}
					
					//initialize all the environments
			       var map;
					for (var i = 0; i < env.length; i++) {
			        	var myEnv = mstrmojo.hash.make(newModel[env[i].id], mstrmojo.Obj, null);
			        	myEnv.webServers = [];
			        	myEnv.mobileServers = [];
			        	myEnv.iServers = [];
			        	myEnv.serverStatus = [];
			            //now take out all the children and set it to the appropriate  list
			            for (var j = 0; j < myEnv.children.length; j++){
			            	var s = mstrmojo.hash.make(newModel[myEnv.children[j].id], mstrmojo.Obj, null);
			            	if (s.type =="IServer"){
			            		myEnv.iServers.push(s);
			            	}
			            	if (s.type =="Web"){
			            		map = {
			            				key : s.id,
			            				value : myEnv.children[j].status,
			            		};
			            		myEnv.serverStatus.push(map);
			            		myEnv.webServers.push(s);
			            	}
			            	if (s.type =="Mobile"){
			            		map = {
			            				key : s.id,
			            				value : myEnv.children[j].status,
			            		};
			            		myEnv.serverStatus.push(map);
			            		myEnv.mobileServers.push(s);
			            	}
			            }
			            delete myEnv.children;
			            
			            this.model.environments[i] = myEnv;
			        }
			        
					return true;
				}
			});
})();