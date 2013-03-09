(function() {
	mstrmojo.requiresCls("mstrmojo.css", "mstrmojo.Button", "mstrmojo.Obj", "mstrmojo.VBox", "mstrmojo.HBox", "mstrmojo.CustomizedHBox", 
	"mstrmojo.IPA.IPAJobDetail", "mstrmojo.Label", "mstrmojo.ListSelector",
	//"mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", 
	"mstrmojo.DataGrid", "mstrmojo.IPA.CustomHeader");
	
	mstrmojo.requiresDescs(8705,8696,8726,8725,8697,8710,8695,8680,8708,8668,8714,8722,8711,8734,8742,8741,8740,8744,8745,8743,8727,8669,8684,8671,8738,8685,8713,8661,8746,8747);
	
	//--Sami: TODO:
	//1. server should be coming in from window.location
	//2. scrolling issue

	/**
	 * the save session state
	 */
	var _SavedSessionState = null;

	var _SERVER_ID = _getParameter("server");

	var INTERVAL = 10000;

	/**
	 * the sort array for the job table
	 */
	var _sortAsc = {
		sortAsc : new mstrmojo.Obj({
			Description : true,
			Owner : true,
			JobId : true,
			startTime : true,
			JobStatus : true,
			runningTime : true
		})
	};

	/**
	 * retrieve the projects for the server in the url
	 */
	function _getProjects() {
		_SERVER_ID = _getParameter('server');
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) { 
				var projects = res;
				var projectsPullDown = mstrmojo.all.projectPulldown;
				if(projectsPullDown) {
					projectsPullDown.set("items", _getLoadedProjects(projects));
				}
			},
			failure : function(res) {
				//mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
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

	/**
	 * a workaround to show the delete button after render again
	 */
	function _resetSelection() {
		var jobTable = mstrmojo.all.jobTable;
		if(jobTable) {
			var curr = jobTable.selectedIndex;
			if(curr == 0) {
				jobTable.set("selectedIndex", jobTable.items.length - 1);
			} else {
				jobTable.set("selectedIndex", 0);
			}

			jobTable.set("selectedIndex", curr);
		}
	}

	/**
	 * get job by project
	 * @param ss the saved session
	 * @param projectName the name project to retrieve jobs
	 */
	function _getProjectJobs(projectName) {
		var query = "LIST JOBS ";
		if (projectName && projectName != mstrmojo.desc(8661,'All Projects')) {
			query = query + "FROM '" + projectName + "';";
		}else{
			query = query + ";";
		}
		
		mstrmojo.all.jobTable.set("items", []);
		mstrmojo.all.jobTable.set("waiting", true);
		
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) {
				var jobs = res;
				mstrmojo.all.jobTable.set("waiting", false);
				if (jobs && jobs.length > 0) {
					mstrmojo.all.jobTable.set('items', res);
				//_resetSelection();
				}
			},
			failure : function(res) {
				//mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
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
	 * kill a job
	 * @param {Object} jid the job id
	 */
	function _killJob() {
		var jobs = mstrmojo.all.jobTable.items;
		if(jobs){
			for(var i=0;i<jobs.length; i++){
				if(jobs[i].selected){
					var jid = jobs[i].JobId;
					mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
						success : function(res) {
						},
						failure : function(res) {
							//    alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
						},
						complete : function() {
						}
					}, {
						taskId : 'CRCommandExecutionTask',
						serverId : _SERVER_ID,
						command : "KILL JOB " + jid + ";"
			
					});					
				}
			}	
		}
	}

	/**
	 * transform status number to readable word
	 * @param status id the number indicates the job status
	 */
	function _getJobStatus(statusid) {
		var sJobStatus = "";
		switch (statusid) {
			case 0:
				sJobStatus = mstrmojo.desc(8713,"Ready");
				break;
			case 1:
				sJobStatus = mstrmojo.desc(8685,"Executing");
				break;
			case 2:
				sJobStatus = mstrmojo.desc(8738,"Waiting");
				break;
			case 3:
				sJobStatus = mstrmojo.desc(8671,"Completed");
				break;
			case 4:
				sJobStatus = mstrmojo.desc(8684,"Error");
				break;
			case 5:
				sJobStatus = mstrmojo.desc(8669,"Cancelled");
				break;
			case 6:
				sJobStatus = mstrmojo.desc(8727,"Stopped");
				break;
			case 7:
				sJobStatus = mstrmojo.desc(8743,"Waiting for Governor");
				break;
			case 8:
				sJobStatus = mstrmojo.desc(8745,"Waiting for Prompt");
				break;
			case 9:
				sJobStatus = mstrmojo.desc(8744,"Waiting for Project");
				break;
			case 10:
				sJobStatus = mstrmojo.desc(8740,"Waiting for Cache");
				break;
			case 11:
				sJobStatus = mstrmojo.desc(8741,"Waiting for Children");
				break;
			case 12:
				sJobStatus = mstrmojo.desc(8742,"Waiting for Fetch Results");
				break;
			default:
				sJobStatus = mstrmojo.desc(8734,"Unknown");
				break;
		}

		return sJobStatus;
	}

	/**
	 * create  projects drop down and the project job table
	 */
	mstrmojo.IPA.projectJobTable = mstrmojo.declare(
	// superclass
	mstrmojo.VBox, null, {
		cssText : "width:98%;",
		lastSelectedJobID : null,
		postCreate : function() {
			_getProjects();

		},
		children : [{
			scriptClass : "mstrmojo.CustomizedHBox",
			cssText : "width:945px;",
			children : [{
				scriptClass : "mstrmojo.Label",
				tdCssClass : "mstrmojo-projectpulldown-label",
				cssText : 'font: bold 10pt;margin-left:10px;',
				text : mstrmojo.desc(8711,"Project")
			}, {
				scriptClass : 'mstrmojo.Pulldown',
				tdCssClass : "mstrmojo-projectpulldown-pulldown",
				id : "projectPulldown",
				itemField : "n",
				itemIdField : "n",
				cssText : 'margin-left:6px;width:150px;height:auto',
				items : [{
					n : mstrmojo.desc(8722,"select project ...")
				}],
				onitemsChange : function() {
					if(this.items && this.items.length > 0) {
						this.set("value", this.items[0].n);
					}
				},
				onvalueChange : function() {
					var projectName = this.value;
					if(projectName) {
						mstrmojo.all.jobTable.set("items", []);
						mstrmojo.all.jobTable.set("waiting", true);
						_getProjectJobs(projectName)
					}
				}
			}, {
				scriptClass : "mstrmojo.HTMLButton",
				cssClass : "IPA-popupButton",
				tdCssClass: "mstrmojo-projectpulldown-refresh",
				text : mstrmojo.desc(8714,"Refresh"),
				onclick : function() {
					var projectName = mstrmojo.all.projectPulldown.value;
					_getProjectJobs(projectName);
					mstrmojo.all.cancelJobBtn.set("enabled", false);
				}
			}, {
				scriptClass : "mstrmojo.HTMLButton",
				id:"cancelJobBtn",
				cssText : "margin-left: 35px;",
				cssClass : "IPA-popupButton",
				tdCssClass : "mstrmojo-projectpulldown-delete",
				text : mstrmojo.desc(8668,"Cancel"),
				enabled: false,
				postBuildRendering: function postBuildRendering() {
           			if (this._super) {
                		this._super();
            		}
					
					this.domNode.disabled = true;
				},
				onclick : function() {
					var num = mstrmojo.all.jobTable.numSelected;
					var msg = "";
					if(num == 1){
						msg = mstrmojo.desc(8746,"Are you sure you want to close the job?");
					}else{
						msg= mstrmojo.desc(8747,"Are you sure you want to close these " + num + " jobs?").replace('##', num);
					}
					mstrmojo.insert({
    		            scriptClass: 'mstrmojo.WarningDialog',
    		            id:"JobMonitorDialog",
    		            title: mstrmojo.desc(3610,"MicroStrategy Web"),
    		            width: '475px',
    		            buttons:[
    		                     mstrmojo.Button.newInteractiveButton(
    		                    		 mstrmojo.desc(8708,"OK"),
    		                    		 function(){
										 	mstrmojo.all.JobMonitorDialog.destroy();
    		                    			 _killJob();
    		 								var projectName = mstrmojo.all.projectPulldown.value;
											_getProjectJobs(projectName)
    		                    		 },
    		                    		 null
    		                     	),
    		                     mstrmojo.Button.newInteractiveButton(
    		 							mstrmojo.desc(8668,"Cancel"),    		 							    		 							
    		 							function()
                                        {
                                        	mstrmojo.all.JobMonitorDialog.destroy();
                                        },
    		 							null
    		 						)
    		                    ],
    		            children: [{
            		                scriptClass: 'mstrmojo.Label',
            		                cssText : 'position:absolute;left:80px;top:40px;',
            		                text: msg,            		                
            		            }]
            		        }).render();
				},
				onenabledChange: function(){ 
                    this.domNode.disabled = ! this.enabled;
                }
			}]
		}, {
			scriptClass : "mstrmojo.DataGrid",
			id : "jobTable",
			cssClass : "mstrmojo-jobtable",
			model : _sortAsc,
			numSelected: 0,
			lastDetailBtn : null,
			listSelector: mstrmojo.ListSelector,
			waiting : false,
			makeObservable : true,
			sort : function(prop, asc) {
				var sortFunc = function mySort(p, s) {
					return function(a, b) {
						var aProp = eval("a." + p), bProp = eval("b." + p);
						var e = aProp == bProp;
						var r = aProp > bProp;
						/* wxu use EMCA standard return value */
						if(s) {
							if(e) { return 0;} 
							else if(r) { return 1;} 
							else {return -1;}
						} else {
							if(e) {return 0;} 
							else if(r) {return -1;} 
							else {return 1;}
						}
					};
				};
				if(this.items) {
					this.items.sort(sortFunc(prop, asc));
					var num = this.numSelected;
					this.render();
					this.set("numSelected", num);
					_resetSelection();
				}
			},
			columns : [{
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:9em",
					text : mstrmojo.desc(8680,"Description"),
					dataField : "Description",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "jobDescriptionCol",
				dataWidget : {
					scriptClass : "mstrmojo.CustomizedHBox",
					cssText : "margin-left: 3px;",
					children : [{
						scriptClass : "mstrmojo.Button",
						tdCssClass : "mstrmojo-detailexpand-col",
						iconClass : "mstrmojo-jobdetail-expand",
						title : mstrmojo.desc(8695,"Job Detail"),
						expanded : false,
						onexpandedChange : function() {
							mstrmojo.css.toggleClass(this.domNode, "expanded", this.expanded);
						},
						onclick : function() {
							var indx = this.parent.idx;
							var rowBody = mstrmojo.all.jobTable.itemsContainerNode.firstChild.tBodies[indx];
							var projectName = mstrmojo.all.projectPulldown.value;

							if(this.expanded) {
								/* delete the row for detail */
								rowBody.deleteRow(1);
								mstrmojo.all.jobTable.lastDetailBtn = null;
								this.set("expanded", false);

								/* start to refresh job list */
								_getProjectJobs(projectName)
							} else {
								/* create the new row and column */
								var newRow = rowBody.insertRow(1);
								newRow.setAttribute("class", "mstrmojo-DataRow");
								var td = document.createElement("td");
								td.setAttribute("colSpan", this.parent.dataGrid.columns.length);
								td.setAttribute("style", "padding:0px 30px 0px 10px;background-color:#D3E9FB;");
								newRow.appendChild(td);

								/* remember this detail button */
								var lastBtn = mstrmojo.all.jobTable.lastDetailBtn;
								if(lastBtn != null) {
									lastBtn.set("expanded", false);
								}
								mstrmojo.all.jobTable.lastDetailBtn = this;
								this.set("expanded", true);

								/* let's get the detail for the job */
								var jobId = this.parent.data.JobId;
								if(jobId) {
									var detail = mstrmojo.all.ipaJobDetail;
									if(detail.model != null && detail.model.JobId == jobId) {
										td.appendChild(detail.domNode);
									} else {
										mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
											success : function(res) {
												var jobs = res;
												if(jobs && jobs.length > 0) {
													detail.set("model", jobs[0]);
													if(!detail.domNode) {
														detail.render();
													}
													td.appendChild(detail.domNode);
												}
											},
											failure : function(res) {
												//		alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
											},
											complete : function() {
											}
										}, {
											taskId : 'CRCommandExecutionTask',
											serverId : _SERVER_ID,
											command : "LIST PROPERTIES FOR JOB " + jobId + ";"
										});
									}
								}
							}
						}
					}, {
						scriptClass : "mstrmojo.Label",
						tdCssClass : "mstrmojo-jobname-col",
						postApplyProperties : function() {
							this.set("text", this.parent.data.Description);
						}
					}]
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:5em",
					text : mstrmojo.desc(8710,"Owner"),
					dataField : "Owner",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "jobOwnerCol",
				dataField : "Owner"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:6em",
					text : mstrmojo.desc(8697,"Job ID"),
					dataField : "JobId",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "jobIdCol",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						this.text = this.data.JobId;
						var lastId = mstrmojo.all.projectJobTable.lastSelectedJobID;
						if(lastId && lastId == this.data.JobId) {
							this.dataGrid.set("selectedIndex", this.idx);
						}
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:7em",
					text : mstrmojo.desc(8725,"Start Time"),
					dataField : "CreationTime",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "jobCreationTimeCol",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						this.text = this.data.CreationTime;
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:5em",
					text : mstrmojo.desc(8726,"Status"),
					dataField : "JobStatus",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "jobStatusCol",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						this.text = _getJobStatus(this.data.JobStatus);
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:9em",
					text : mstrmojo.desc(8696,"Job Duration"),
					dataField : "JobDuration",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "jobRunningTimeCol",
				dataField : "JobDuration",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						var min = Math.floor(this.parent.data.JobDuration / 60);
						// The minutes
						var sec = this.parent.data.JobDuration % 60;
						// The balance of seconds
						this.text = min + " min " + sec + " sec";
					}
				}
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
						debugger;
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
							checked : "mstrmojo.all.jobTable.items[" + this.idx + "].selected"
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
							mstrmojo.all.cancelJobBtn.set("enabled", false);
						}else{        
							mstrmojo.all.cancelJobBtn.set("enabled", true);
						}
					}
				}
			} ],
			onwaitingChange : function() {
				var table = mstrmojo.all.jobTable.itemsContainerNode.firstChild;
				if(this.waiting) {
					if(table) {
						var newRow = table.insertRow(0);
						newRow.setAttribute("class", "mstrmojo-DataRow");
						newRow.setAttribute("id", "jobWaitingIcon");
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

						
						var wi = mstrmojo.insert({
							scriptClass : "mstrmojo.Label",
							cssText : "text-align:center;",
							text : mstrmojo.desc(8705,"No job found for this project."),
							visible : true
						});
						wi.render();
						td.appendChild(wi.domNode);

						newRow.appendChild(td);
					}
				}
			},
			onchange : function() {
				var jobtable = mstrmojo.all.projectJobTable;
				if(jobtable && this.items && this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {
					jobtable.lastSelectedJobID = this.items[this.selectedIndex].JobId;
				}
			}
		}]
	});

	_getProjects();

})();
