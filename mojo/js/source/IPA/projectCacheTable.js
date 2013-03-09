(function() {
	mstrmojo.requiresCls("mstrmojo.css", 
	"mstrmojo.Button", "mstrmojo.Obj", "mstrmojo.VBox", "mstrmojo.HBox", "mstrmojo.CustomizedHBox", "mstrmojo.IPA.IPACacheDetail", 
	"mstrmojo.WaitIcon", "mstrmojo.CheckBox", "mstrmojo.HTMLButton", "mstrmojo.Label", "mstrmojo.ListSelector",
	"mstrmojo.DataGrid", "mstrmojo.IPA.CustomHeader");

	mstrmojo.requiresDescs(8662, 8664,8722, 8666,8723,8711,8679,3610,8708,8668,8662,8724,8733,8726,8700,8691,8714,8750);
	
	//--Sami: TODO:
	//1. server should be coming in from window.location
	//2. scrolling issue

	/**
	 * the save session state
	 */
	var _SERVER_ID = _getParameter("server");

	/**
	 * the sort array for the job table
	 */
	var _sortAsc = {
		sortAsc : new mstrmojo.Obj({
			ReportCache : true,
			CacheFileSizeKB : true,
			Type : true,
			creationtime : true,
			HitCount : true,
			LastHitTime : true
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
				if(res == null)
					return;
				var projectsPullDown = mstrmojo.all.projectsForCache;
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
	 *
	 * @param the array of status
	 */
	function _createStatus(statuses) {
		var result = "";
		if(statuses) {
			for(var i = 0; i < statuses.length; i++) {
				var status = statuses[i].CacheStatus;
				if(status == 16) {
					result = result + "L, ";
				} else if(status == 256) {
					result = result + "F, ";
				} else if(status == 1) {
					result = result + "R, ";
				} else if(status == 32) {
					result = result + "U, ";
				}
			}
		}

		/* remove the ending comma */
		if(result.length > 2) {
			result = result.substr(0, result.length - 2);
		}

		return result;
	}

	/**
	 * get loaded projects. only need name of projects
	 * @param projects result created by command manager
	 */
	function _getLoadedProjects(projects) {
		var result = [];
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
	 * get jobs for a project. if the project guid is null, it
	 * will use the Microstrategy tutorial
	 * @param {Object} ss the saved session
	 * @param {Object} guid project guid
	 */
	function _getProjectCaches(project) {
		mstrmojo.all.cacheTable.set("items", []);
		mstrmojo.all.cacheTable.set("waiting", true);
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) {
				var caches = res;
				//array
				mstrmojo.all.cacheTable.set("waiting", false);
				if(caches && caches.length > 0 && caches[0].ReportCaches && caches[0].ReportCaches.length > 0) {
					mstrmojo.all.cacheTable.set('items', caches[0].ReportCaches);
					updatechartwithcache(caches[0].ReportCaches);
				}else{
					updatechartwithcache([]);
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
			command : "LIST ALL REPORT CACHES FOR PROJECT '" + project + "';"
		});
	}

	/**
	 *
	 * @param ss session
	 * @param project
	 * @param ids the cache id list separated by comma.
	 */
	function _deleteCaches() {
		var caches = mstrmojo.all.cacheTable.items;
		var sc = [];
		if(caches) {
			for(var i = 0; i < caches.length; i++) {
				if(caches[i].selected) {
					sc.push(caches[i].Id);
				}
			}
		}

		if(sc.length > 0) {
			var ids = sc.toString();
			var projectName = mstrmojo.all.projectsForCache.value;
			mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
				success : function(res) {
					mstrmojo.alert(mstrmojo.desc(8723, "Selected caches were deleted successfully."))
					var newItems = [];
					for(var i = 0; i < caches.length; i++) {
						if(!caches[i].selected) {
							newItems.push(caches[i]);
						}
					}

					if(newItems.length > 0) {
						mstrmojo.all.cacheTable.set('items', newItems);
						updatechartwithcache(newItems);
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
				command : "DELETE REPORT CACHE GUID " + ids + " FROM PROJECT '" + projectName + "';"
			});
		}

	}

	/**
	 * update the chart map
	 * @param rc the array of caches
	 */
	function updatechartwithcache(rc) {
		mstrmojo.all.cachetreemap.treeMapData = [];
		for(var i = 0; i < rc.length; i++) {
			var a = {};
			a.size = rc[i].CacheFileSizeKB;
			a.count = rc[i].HitCount;
			a.name = rc[i].ReportCache;
			mstrmojo.all.cachetreemap.treeMapData[i] = a;
		}

		//		mstrmojo.all.cachetreemap.treeMapData.sort(function(a,b){return b.size - a.size});
		mstrmojo.all.cachetreemap.update();
		mstrmojo.all.cachetreemap.drawChart();
		mstrmojo.all.cachetreemap.drawLegend(mstrmojo.all.cachetreemaplegend);

	}

	/**
	 * gui part
	 *
	 * create  projects drop down and the project cache table
	 */
	mstrmojo.IPA.projectCacheTable = mstrmojo.declare(mstrmojo.VBox, null, {
		scriptClass : "mstrmojo.VBox",
		cssText : "width: 945px;",
		lastSelectedCacheID : null,
		postCreate : function() {
			_getProjects();
		},
		children : [{
			scriptClass : "mstrmojo.CustomizedHBox",
			cssText : "width:935px;",
			children : [{
				scriptClass : "mstrmojo.Label",
				tdCssClass : "mstrmojo-projectpulldown-label",
				cssText : 'font: bold 10pt;margin-left:10px;',
				text : mstrmojo.desc(8711,"Project")
			}, {
				scriptClass : 'mstrmojo.Pulldown',
				tdCssClass : "mstrmojo-projectpulldown-pulldown",
				id : "projectsForCache",
				itemField : "n",
				itemIdField : 'n',
				cssText : 'margin-left:6px;width:200px;height:auto;',
				items : [{
					n : mstrmojo.desc(8722, "Select Project ...") 
				}],
				onitemsChange : function() {
					if(this.items && this.items.length > 0) {
						this.set("value", this.items[0].n);
					}
				},
				onvalueChange : function() {
					var projectName = this.value;
					if(projectName) {
						_getProjectCaches(projectName);
					}
				}
			}, {
				scriptClass : "mstrmojo.HTMLButton",
				cssClass : "IPA-popupButton",
				tdCssClass: "mstrmojo-projectpulldown-refresh",
				text : mstrmojo.desc(8714,"Refresh"),
				onclick : function() {
					var projectName = mstrmojo.all.projectsForCache.value;
					_getProjectCaches(projectName);
					mstrmojo.all.deleteCacheBtn.set("enabled", false);
				}
			}, {
				
				scriptClass : "mstrmojo.HTMLButton",
				cssText : "margin-left: 35px;",
				cssClass : "IPA-popupButton",
				id:"deleteCacheBtn",
				tdCssClass : "mstrmojo-projectpulldown-delete",
				text : mstrmojo.desc(8679,"Delete"),
				enabled: false,
		        postBuildRendering: function postBuildRendering() {
           			if (this._super) {
                		this._super();
            		}
					
					this.domNode.disabled = true;
				},
				onclick : function() {
					debugger;
					mstrmojo.insert({
    		            scriptClass: 'mstrmojo.WarningDialog',
    		            id:"CacheDialog",
    		            title: mstrmojo.desc(3610,"MicroStrategy Web"),
    		            width: '475px',
    		            buttons:[
    		                     mstrmojo.Button.newInteractiveButton(
    		                    		 mstrmojo.desc(8708,"ok"),
    		                    		 function(){
										 	mstrmojo.all.CacheDialog.destroy();
    		                    			 _deleteCaches();
    		                    		 },
    		                    		 null
    		                     	),
    		                     mstrmojo.Button.newInteractiveButton(
    		 							mstrmojo.desc(8668, "Cancel"),    		 							    		 							
    		 							function()
                                        {
                                        	mstrmojo.all.CacheDialog.destroy();
                                        },
    		 							null
    		 						)
    		                    ],
    		            children: [{
            		                scriptClass: 'mstrmojo.Label',
            		                cssText : 'position:absolute;left:80px;top:40px;',
            		                text: mstrmojo.desc(8662,"Are you sure you want to delete the selected caches?"),            		                
            		            }]
            		        }).render();
				},
				onenabledChange: function(){ 
                    this.domNode.disabled = ! this.enabled;
                }
			}]
		}, {
			scriptClass : "mstrmojo.DataGrid",
			id : "cacheTable",
			cssClass : 'mstrmojo-cachetable',
			model : _sortAsc,
			lastDetailBtn : null,
			numSelected: 0,
			waiting : false,
			listSelector: mstrmojo.ListSelector,
			makeObservable : true,
			sort : function(prop, asc) {
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
					updatechartwithcache(this.items);
				}
			},
			columns : [{
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:10em",
					text : mstrmojo.desc(8666, "cache name"),
					dataField : "ReportCache",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "cacheNameCol",
				dataWidget : {
					scriptClass : "mstrmojo.CustomizedHBox",
					cssText : "margin-left: 3px;",
					children : [{
						scriptClass : "mstrmojo.Button",
						tdCssClass : "mstrmojo-detailexpand-col",
						iconClass : "mstrmojo-jobdetail-expand",
						title : mstrmojo.desc(8750, "Cache Details"),
						expanded : false,
						onexpandedChange : function() {
							mstrmojo.css.toggleClass(this.domNode, "expanded", this.expanded);
						},
						onclick : function() {
							var indx = this.parent.idx;
							var rowBody = mstrmojo.all.cacheTable.itemsContainerNode.firstChild.tBodies[indx];
							var projectName = mstrmojo.all.projectsForCache.value;

							if(this.expanded) {
								/* delete the row for detail */
								rowBody.deleteRow(1);
								mstrmojo.all.cacheTable.lastDetailBtn = null;
								this.set("expanded", false);
							} else {
								/* create the new row and column */
								var newRow = rowBody.insertRow(1);
								newRow.setAttribute("class", "mstrmojo-DataRow");
								var td = document.createElement("td");
								td.setAttribute("colSpan", this.parent.dataGrid.columns.length);
								td.setAttribute("style", "padding:0px 30px 0px 10px;background-color:#D3E9FB;");

								newRow.appendChild(td);

								/* remember this detail button */
								var lastBtn = mstrmojo.all.cacheTable.lastDetailBtn;
								if(lastBtn != null) {
									lastBtn.set("expanded", false);
								}
								mstrmojo.all.cacheTable.lastDetailBtn = this;
								this.set("expanded", true);

								/* let's get the detail for the cache */
								var cacheId = this.parent.data.Id;
								if(cacheId) {
									var detail = mstrmojo.all.ipaCacheDetail;
									if(detail.model != null && detail.model.Id == cacheId) {
										td.appendChild(detail.domNode);
									} else {
										/* set waiting icon */
										var wi = mstrmojo.insert({
											scriptClass : "mstrmojo.WaitIcon",
											visible : true
										});
										wi.render();
										td.appendChild(wi.domNode);

										mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
											success : function(res) {
												var cacheDetails = res;
												if(cacheDetails && cacheDetails.length > 0) {
													detail.set("model", cacheDetails[0]);
													if(!detail.domNode) {
														detail.render();
													}
													wi.set("visible", false);
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
											command : "LIST PROPERTIES FOR REPORT CACHE GUID " + cacheId + " IN PROJECT '" + projectName + "';"
										});
									}
								}
							}
						}
					}, {
						scriptClass : "mstrmojo.Label",
						tdCssClass : "mstrmojo-jobname-col",
						postApplyProperties : function() {
							this.set("text", this.parent.data.ReportCache);
						}
					}]
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:7em",
					text : mstrmojo.desc(8724,"Size (KB)"),
					dataField : "CacheFileSizeKB",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "cacheSizeCol",
				dataField : "CacheFileSizeKB"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:5em",
					text : mstrmojo.desc(8733,"Type"),
					dataField : "Type",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "cacheTypeCol",
				dataField : "Type"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:6em",
					text : mstrmojo.desc(8726,"Status"),
					dataField : "Statuses",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "cacheStatusCol",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						this.text = _createStatus(this.data.Statuses);
						var lastId = mstrmojo.all.projectCacheTable.lastSelectedCacheID;
						if(lastId && lastId == this.data.Id) {
							this.dataGrid.set("selectedIndex", this.idx);
						}
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:7em",
					text : mstrmojo.desc(8700,"Last Hit"),
					dataField : "LastHitTime",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "cacheLastHitCol",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						this.text = this.data.LastHitTime;
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:8em;background:#494949",
					text : mstrmojo.desc(8691,"Hit Count"),
					dataField : "HitCount",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				colCss : "cacheHitCountCol",
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						this.text = this.data.HitCount;
					}
				}
			}, {
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
							checked : "mstrmojo.all.cacheTable.items[" + this.idx + "].selected"
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
							mstrmojo.all.deleteCacheBtn.set("enabled", false);
						}else{        
							mstrmojo.all.deleteCacheBtn.set("enabled", true);
						}
					}
				}
			}],
			onwaitingChange : function() {
				var table = mstrmojo.all.cacheTable.itemsContainerNode.firstChild;
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
					//            		this.set("items", []);
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
							text : "No cache found for this project.",
							visible : true
						});
						wi.render();
						td.appendChild(wi.domNode);

						newRow.appendChild(td);
					}
				}
			},
			onchange : function() {
				debugger;
				var projectCacheTable = mstrmojo.all.projectCacheTable;
				if(projectCacheTable && this.items && this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {

					if(projectCacheTable.lastSelectedCacheID != this.items[this.selectedIndex].Id) {
						//this.items[this.selectedIndex].set("selected", !this.items[this.selectedIndex].selected);
						projectCacheTable.lastSelectedCacheID = this.items[this.selectedIndex].Id;
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

	_getProjects();

})();
