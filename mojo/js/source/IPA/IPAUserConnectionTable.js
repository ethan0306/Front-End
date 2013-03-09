/**
 * @author wxu
 */
(function() {
	mstrmojo.requiresCls("mstrmojo.css", "mstrmojo.Button", "mstrmojo.Obj", "mstrmojo.VBox", "mstrmojo.HBox", "mstrmojo.CustomizedHBox", 
	"mstrmojo.IPA.IPACacheDetail", "mstrmojo.WaitIcon", "mstrmojo.CheckBox", "mstrmojo.HTMLButton", "mstrmojo.Label", "mstrmojo.ListSelector",
	//"mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", 
	"mstrmojo.DataGrid", "mstrmojo.IPA.CustomHeader");

	mstrmojo.requiresDescs(3610,8661,8711,8722,8681,8708,8668,8737,8730,8670,8690,8701,8694,8749,8752,8755);
	
	/**
	 * the save session state
	 */
	var _SERVER_ID = _getParameter("server");

	/**
	 * the sort array for the job table
	 */
	var _sortAsc = {
		sortAsc : new mstrmojo.Obj({
			Name : true,
			Project : true,
			SourceApplication : true,
			ConnectionTime : true,
			FirstJobTime : true,
			LastJobTime : true,
			JobCount : true
		})
	};
	
	function _convertTime( tm){
		var h = Math.floor(tm/3600);
		var m = Math.floor((tm- 3600 * h)/60);
		var s = (tm - 3600 *h - 60*m);
		if(h < 10) h = "0"+h;
		if(m < 10) m = "0"+m;
		if(s < 10) s = "0"+s;
		return h + ":" + m + ":" + s;
	}

	/**
	 * retrieve the projects for the server in the url
	 */
	function _getProjects() {
		_SERVER_ID = _getParameter('server');
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) {
				var projects = res;
				if(res == null)
					return;
				var projectsPullDown = mstrmojo.all.projectsForUserConnection;
				if(projectsPullDown) {
					projectsPullDown.set("items", _getLoadedProjects(projects));
				}
			},
			failure : function(res) {
				mstrmojo.alert("Failed to get Project List: " + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			},
			complete : function() {
			}
		}, {
			taskId : 'CRCommandExecutionTask',
			command : 'LIST PROJECTS;',
			serverId : _SERVER_ID
		});
	}

	/**
	 * get application source name
	 * @param int type of client type
	 */
	function _getSource(s) {
		switch(s) {
			case 1:
				return "Desktop";
			case 23:
				return "Office";
			case 6:
				return "Web";
			case 13:
				return "Command Manager";
			case 10:
				return "Object Manager";
			case 14:
				return "Enterprise Manager";
			case 16:
				return "Project Builder";
			case 17:
				return "Configuration Wizard";
			case 23:
				return "Office";
			case 24:
				return "Tools";
			case 26:
				return "Integrity Manager";
			case 27:
				return "MD Update";
			case 28:
				return "COM Browser ";
			case 29:
				return "Mobile";
			case 31:
				return "Health Center";
			case 32:
				return "Cube Advisor";
		}

		return s;
	}

	/**
	 * get loaded projects. only need name of projects
	 * @param projects result created by command manager
	 */
	function _getLoadedProjects(projects) {
		var result = [];
		result.push({
			n : mstrmojo.desc(8661,'All Projects')
		});
		for(var i = 0; i < projects.length; i++) {
			var project = projects[i];
			if(project.ProjStatus == 0) {
				result.push({
					n : project.Name
				});
			}
		}

		return result;
	}

	function _getCountsforType(type, a) {
		var typecounts = {};
		for(var i = 0; i < a.length; i++) {
			if(a[i][type]) {
				var ct;
				if(type == "SourceApplication")
					ct = _getSource(a[i][type]);
				else
					ct = a[i][type];
				if(ct == "<Server>")
					ct = "Server";
				if(typecounts[ct]) {
					typecounts[ct]++;
				} else {
					typecounts[ct] = 1;
				}
			}
		}

		return typecounts;

	}

	/**
	 * @param {Object} project name
	 */
	function _getUserConnections(project) {
		var query = "LIST ALL USER CONNECTIONS ";
		if(project && project != mstrmojo.desc(8661,'All Projects')) {
			query = query + " FROM PROJECT '" + project + "';";
		} else {
			query = query + ";";
		}
		
		mstrmojo.all.userConnectionTable.set("items", []);
		mstrmojo.all.userConnectionTable.set("waiting", true);
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) { 
				if(!mstrmojo.all.userConnectionTable) {
					return;
				}
				var ucs = res;
				//array
				mstrmojo.all.userConnectionTable.set("waiting", false);
				if(ucs && ucs.length > 0) { 
					_updateGraph(ucs);
					
					var table = mstrmojo.all.userConnectionTable;
					table.set('items', ucs);
					if(table.lastSortedProp){
						var asc = eval("_sortAsc.sortAsc." + table.lastSortedProp);
						table.sort(table.lastSortedProp, asc);
					}
				}
			},
			failure : function(res) {
				mstrmojo.alert("Failed to get user connections: " + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			},
			complete : function() {
			}
		}, {
			taskId : 'CRCommandExecutionTask',
			serverId : _SERVER_ID,
			command : query
		});
	}
	
	/**
	 * update the pie graph
	 * @param {Object} items
	 */
	function _updateGraph(items){
		mstrmojo.all.monitoringchartbytype.setValues(_getCountsforType("SourceApplication", items));

		mstrmojo.all.monitoringchartbytype.refreshValues();

		mstrmojo.all.graphwaiticon.set('visible', false);
		mstrmojo.all.monitoringchartbytype.parent.set('visible', true);
	}

	/**
	 *
	 * @param ss session
	 * @param project
	 * @param ids the cache id list separated by comma.
	 */
	function _disconnect() {
		var connections = mstrmojo.all.userConnectionTable.items;
		var uc = [];
		if(connections) {
			for(var i = 0; i < connections.length; i++) {
				if(connections[i].selected) {
					uc.push(connections[i].SessionId);
				}
			}
		}

		if(uc.length > 0) {
			var ids = uc.toString();
			mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
				success : function(res) {
					mstrmojo.alert(mstrmojo.desc(8755,"Selected user connections were disconnected successfully."))
					var newItems = [];
					for(var i = 0; i < connections.length; i++) {
						if(!connections[i].selected) {
							newItems.push(connections[i]);
						}
					}

					if(newItems.length > 0) {
						mstrmojo.all.userConnectionTable.set('items', newItems);
						_updateGraph(newItems);
					}
				},
				failure : function(res) {
					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
				},
				complete : function() {
				}
			}, {
				taskId : 'CRCommandExecutionTask',
				serverId : _SERVER_ID,
				command : "DISCONNECT USER SESSIONID " + ids + ";"
			});
		}

	}

	/**
	 * gui part
	 *
	 * create  projects drop down and the project cache table
	 */
	mstrmojo.IPA.IPAUserConnectionTable = mstrmojo.declare(mstrmojo.VBox, null, {
		cssText : "width: 98%;",
		lastSelectedSessionID : null,
		children : [{
			scriptClass : "mstrmojo.CustomizedHBox",
			cssText : "width:98%;",
			children : [{
				scriptClass : "mstrmojo.Label",
				tdCssClass : "mstrmojo-projectpulldown-label",
				cssText : 'font: bold 10pt;margin-left:10px;',
				text : mstrmojo.desc(8711,"Project")
			}, {
				scriptClass : 'mstrmojo.Pulldown',
				tdCssClass : "mstrmojo-projectpulldown-pulldown",
				id : "projectsForUserConnection",
				itemField : "n",
				itemIdField : 'n',
				cssText : 'margin-left:6px;width:200px;height:auto;',
				items : [{
					n : mstrmojo.desc(8722,"Select Projects ...")
				}],
				onitemsChange : function() {
					if(this.items && this.items.length > 0) {
						this.set("value", this.items[0].n);
					}
				},
				onvalueChange : function() {
					var projectName = this.value;
					if(projectName) {
						
						_getUserConnections(projectName);
					}
				}
			},{
				scriptClass : "mstrmojo.HTMLButton",
				cssClass : "IPA-popupButton",
				tdCssClass: "mstrmojo-projectpulldown-refresh",
				text : mstrmojo.desc(8714,"Refresh"),
				onclick : function() {
					var projectName = mstrmojo.all.projectsForUserConnection.value;
					_getUserConnections(projectName);
					mstrmojo.all.disconnectUserBtn.set("enabled", false);
				}
			},  {
				scriptClass : "mstrmojo.HTMLButton",
				id:"disconnectUserBtn",
				cssText : "margin-left: 35px;",
				cssClass : "IPA-popupButton",
				tdCssClass : "mstrmojo-projectpulldown-delete",
				text : mstrmojo.desc(8681,"Disconnect"),
				enabled: false,
		        postBuildRendering: function postBuildRendering() {
           			if (this._super) {
                		this._super();
            		}
					
					this.domNode.disabled = true;
				},
				onclick : function() {
					mstrmojo.insert({
    		            scriptClass: 'mstrmojo.WarningDialog',
    		            id:"UserConnectionDialog",
    		            title: mstrmojo.desc(3610,"MicroStrategy Web"),
    		            width: '475px',
    		            buttons:[
    		                     mstrmojo.Button.newInteractiveButton(
    		                    		 mstrmojo.desc(8708,"OK"),
    		                    		 function(){
										 	mstrmojo.all.UserConnectionDialog.destroy();
    		                    			 _disconnect();
    		                    		 },
    		                    		 null
    		                     	),
    		                     mstrmojo.Button.newInteractiveButton(
    		 							mstrmojo.desc(8668,"Cancel"),    		 							    		 							
    		 							function()
                                        {
                                        	mstrmojo.all.UserConnectionDialog.destroy();
                                        },
    		 							null
    		 						)
    		                    ],
    		            children: [{
            		                scriptClass: 'mstrmojo.Label',
            		                cssText : 'position:absolute;left:80px;top:40px;',
            		                text: mstrmojo.desc(8749,"Are you sure you want to disconnect the selected user connections?"),            		                
            		            }]
            		        }).render();
				},
				onenabledChange: function(){ 
                    this.domNode.disabled = ! this.enabled;
                }
			}]
		}, {
			scriptClass : "mstrmojo.DataGrid",
			id : "userConnectionTable",
			cssClass : 'mstrmojo-userconnectiontable',
			model : _sortAsc,
			lastDetailBtn : null,
			numSelected:0,
			waiting : false,
			listSelector: mstrmojo.ListSelector,
			makeObservable : true,
			postCreate : function() {
				_getProjects();
			},
			sort : function(prop, asc) {	
			this.lastSortedProp = prop;
				var sortFunc = function mySort(p, s) {
					return function(a, b) {
						var aProp = eval("a." + p), bProp = eval("b." + p);
						var e = aProp == bProp;
						var r = aProp > bProp;
						/* wxu use EMCA standard return value */
						if(s) {
							if(e) {
								return 0;
							} else if(r) {
								return 1;
							} else {
								return -1;
							}
						} else {
							if(e) {
								return 0;
							} else if(r) {
								return -1;
							} else {
								return 1;
							}
						}
					};
				};
				if(this.items) {
					this.items.sort(sortFunc(prop, asc));
					var num = this.numSelected;
					this.render();
					this.set("numSelected", num);
				}
			},
			columns : [{
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:10em",
					text : mstrmojo.desc(8737,"User Name"),
					dataField : "Name",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colWidth:"100",
				dataField : "Name"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:7em",
					text : mstrmojo.desc(8711,"Project"),
					dataField : "Project",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colWidth:"150",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						var p = this.data.Project;
						if(p) {
							p = p.replace(">", "&gt;")
							p = p.replace("<", "&lt;")
						}

						this.text = p;
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:14em",
					text : mstrmojo.desc(8730,"Time Connected"),
					dataField : "ConnectionTime",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colWidth:"120",
				dataField : "ConnectionTime"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:10em",
					text : mstrmojo.desc(8670,"Client Type"),
					dataField : "SourceApplication",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colWidth:"150",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						var tt = _getSource(this.data.SourceApplication);
						this.text = tt;
						this.dataGrid.items[this.idx].SourceApplication = tt; 
						var lastId = mstrmojo.all.IPAUserConnectionTable.lastSelectedSessionID;
						if(lastId && lastId == this.data.SessionId) {
							this.dataGrid.set("selectedIndex", this.idx);
						}
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:12em",
					text : mstrmojo.desc(8690,"First Job Time"),
					dataField : "FirstJobTime",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colWidth:"100",
				dataField : "FirstJobTime"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:12em",
					text : mstrmojo.desc(8701,"Last Job Time"),
					dataField : "LastJobTime",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colWidth:"100",
				dataField : "LastJobTime"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:10em",
					text : mstrmojo.desc(8694,"Job Count"),
					dataField : "JobCount",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colWidth:"90",
				dataField : "JobCount"
			},{
				headerWidget : {
					scriptClass : 'mstrmojo.ImageCheckBox',
					label : '',
					visible : true,
					postBuildRendering: function() {
						if (this._super) {
                        	return this._super();
                        } 
						
						if(this.dataGrid.numSelected == 0){
								this.checked=false;
								this.inputNode.src = '../images/check_off.gif';
							}else if (this.dataGrid.numSelected == this.dataGrid.items.length) {
								this.checked=true;
								this.inputNode.src = '../images/check_on.gif';
							}else{
								this.inputNode.src = '../images/Check_conflict.gif';
							}
						
										 
                        return true;
                    },
					postCreate: function(){
						this.dataGrid.checkAllBox = this;
					},
					oncheckedChange : function() {
						var c = this.checked;
						for(var i = 0; i < this.dataGrid.items.length; i++) {
								this.dataGrid.items[i].set("selected", c);
						}
					
						if(c){
							this.dataGrid.numSelected = this.dataGrid.items.length;
							this.inputNode.src = '../images/check_on.gif';
						}else{
							this.dataGrid.numSelected = 0;
							this.inputNode.src = '../images/check_off.gif';
						}
					}
				},
				colWidth: "70",
				dataWidget : {
					scriptClass : 'mstrmojo.CheckBox',
					label : '',
					visible : true,
					postApplyProperties : function() {
						if(!this.data.scriptClass) {
							this.dataGrid.items[this.idx] = new mstrmojo.Obj(this.data)
						}

						this.checked = this.data.selected;
						this.set("bindings", {
							checked : "mstrmojo.all.userConnectionTable.items[" + this.idx + "].selected"
						});
					},
					oncheckedChange : function() {
						this.dataGrid.items[this.idx].selected = this.checked;
						
						if(this.checked == true){
							this.dataGrid.numSelected++;
						}else if( this.dataGrid.numSelected != 0){
							this.dataGrid.numSelected--;
						}
						var cb = this.dataGrid.checkAllBox;
						if(cb && cb.hasRendered){
							if(this.dataGrid.numSelected == 0){
								cb.checked=false;
								cb.inputNode.src = '../images/check_off.gif';
							}else if (this.dataGrid.numSelected == this.dataGrid.items.length) {
								cb.checked=true;
								cb.inputNode.src = '../images/check_on.gif';
							}else{
								cb.inputNode.src = '../images/Check_conflict.gif';
							}
						}
						
						if(this.dataGrid.numSelected == 0){
							mstrmojo.all.disconnectUserBtn.set("enabled", false);
						}else{        
							mstrmojo.all.disconnectUserBtn.set("enabled", true);
						}
					}
				}
			} ],
			onwaitingChange : function() {
				var table = mstrmojo.all.userConnectionTable.itemsContainerNode.firstChild;
				if(this.waiting) {
					if(table) {
						var newRow = table.insertRow(0);
						newRow.setAttribute("class", "mstrmojo-DataRow");
						var td = document.createElement("td");
						td.setAttribute("colSpan", this.columns.length);
						td.setAttribute("style", "padding:0 0 0 10px");

						/* set waiting icon */
						var wi = mstrmojo.insert({
							scriptClass : "mstrmojo.WaitIcon",
							visible : true
						});
						wi.render();
						td.appendChild(wi.domNode);

						newRow.appendChild(td);
					}
				} else {
					if(table) {
						if(table.rows && table.rows.length > 0) {
							table.deleteRow(0);
						}

						var newRow = table.insertRow(0);
						newRow.setAttribute("class", "mstrmojo-DataRow");
						var td = document.createElement("td");
						td.setAttribute("colSpan", this.columns.length);
						td.setAttribute("style", "padding:0 0 0 10px");

						/* set waiting icon */
						var wi = mstrmojo.insert({
							scriptClass : "mstrmojo.Label",
							cssText : "text-align:center;",
							text : mstrmojo.desc(8752,"No user sessions found for this project."),
							visible : true
						});
						wi.render();
						td.appendChild(wi.domNode);

						newRow.appendChild(td);
					}
				}
			},
			onchange : function() {
				var table = mstrmojo.all.IPAUserConnectionTable;
				if(table && this.items && this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {

					if(table.lastSelectedSessionID != this.items[this.selectedIndex].Id) {
						table.lastSelectedSessionID = this.items[this.selectedIndex].Id;
					}

					/* wxu scroll to selected row if it is not shown up*/
					var height = this.itemsContainerNode.offsetHeight;
					var visibleHeight = this.scrollboxNode.offsetHeight;
					var rowHeight = height / this.items.length;
					var scrollTo = height * (this.selectedIndex / this.items.length);
					if(scrollTo + rowHeight >= this.scrollboxNode.scrollTop + visibleHeight || scrollTo <= this.scrollboxNode.scrollTop) {
						this.scrollboxNode.scrollTop = scrollTo;
					}
				}
			}
		}]
	});

})();
