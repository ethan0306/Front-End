(function() {

	var _CounterCollection = [];
	var _perfBeanID = "";
	var _doneAdding = false;
	var _countersXML = "";
	var _counterID = [];
	var _idValues = 0;
	var _refreshRate = null;
	var _timeout = null;
	var _lastTime = "";

	function _pad(val) {
		var s = val.toString();
		return s.length < 2 ? "0" + s : s;
	}

	function _convertUCStringToDate(dat) {
		return dat.getUTCFullYear() + "-" + _pad((dat.getUTCMonth() + 1)) + "-" + _pad(dat.getUTCDate()) + " " + _pad(dat.getUTCHours()) + ":" + _pad(dat.getUTCMinutes()) + ":" + _pad(dat.getUTCSeconds());
	}

	var _addCounterTaskCall = function addctsk() {
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) {
				_perfBeanID = res.perfMonBeanId;
				//see if any are left to register and call again.
				_doneAdding = true;
			},
			failure : function(res) {
				//console.log(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			},
			complete : function() {

			}
		}, {
			taskId : 'addPerformanceCounter',
			perfmonID : _perfBeanID,
			counters : _countersXML

		});

	};
	var _getCounterDataTaskCall = function getcdtsk() {
		

		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {

			success : function(res) {
					
				if (!res.counterList) return;

				var counterList = res.counterList;

				for(var i = 0; i < counterList.length; i++) {

					var counterwidgets = _CounterCollection[counterList[i].id];
					var datapoints = counterList[i].counterDataList;

					if(!counterwidgets)
						return;

					for(var j = 0; j < counterwidgets.length; j++) {
						if(datapoints.length > 0) {

							counterwidgets[j].addValues(datapoints);
							//get the last data point
							
							_lastTime = _convertUCStringToDate(new Date(datapoints[datapoints.length - 1].timestamp));
						}
					}

				}

				if(_refreshRate !== null) {
					_timeout = setTimeout(_process, _refreshRate);
				}
			},
			failure : function(res) {
				//  alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			},
			complete : function() {
			}
		}, {
			taskId : 'getPerformanceCounterData',
			perfMonBeanId : _perfBeanID,
			startpoint : _lastTime

		});
	};
	var _process = function proc() {
		if(_doneAdding === false) {
			setTimeout(proc, 300);
			return;
		} else {
			_getCounterDataTaskCall();
		}

	};
	function _convertDateToUTCString(localTime) {
		var dateTimeComponents = localTime.split(" ");
		var dateComponent = dateTimeComponents[0].split("-");
		var timeComponent = dateTimeComponents[1].split(":");
		var ampm = dateTimeComponents[2];

		var dat = new Date(parseInt(dateComponent[0], 10),     parseInt(dateComponent[1], 10) - 1, parseInt(dateComponent[2], 10), parseInt(timeComponent[0], 10) % 12, parseInt(timeComponent[1], 10), parseInt(timeComponent[2], 10));

		if(ampm == "PM") {
			dat.setHours(dat.getHours() + 12);
		}
		return dat;
	}

	/**
	 * IPACounterController is the IPA controller for all the counters that are brought back from the server side
	 *
	 * <p> It is responsible for adding,removing and updating all the different counters that are registered.
	 * it also passes along the updated values to the widgets so they can show their values.
	 * </p>
	 *
	 * @class
	 * @extends mstrmojo.Obj
	 */
	mstrmojo.IPA.IPACounterController = mstrmojo.declare(
	// superclass
	mstrmojo.Obj,
	// mixins
	null,
	// instance members
	{
		scriptClass : "mstrmojo.IPA.IPACounterController",

		refreshRate : 1000,

		flushAddCounters : function flushaddc() {
			_doneAdding = false;
			_countersXML = '<counters>';
			for(var id in _CounterCollection) {
				_countersXML = _countersXML + '<counter id="' + id + '"' + ' server="' + _CounterCollection[id].server + '"' + ' category="' + _CounterCollection[id].category + '"' + ' instance="' + _CounterCollection[id].instance + '"' + ' name="' + _CounterCollection[id].counter + '"/>';

				_CounterCollection[id].added = true;
			}
			_countersXML = _countersXML + '</counters>';

			setTimeout(_addCounterTaskCall,500);

		},
		addCounters : function addc(widget, bulk) {
			_doneAdding = false;

			var longID = widget.category + "." + widget.instance + "." + widget.counter + "." + widget.server;

			if(!_counterID[longID]) {

				_counterID[longID] = "C" + _idValues;

				_CounterCollection[_counterID[longID]] = [];
				_CounterCollection[_counterID[longID]].category = widget.category;
				_CounterCollection[_counterID[longID]].instance = widget.instance;
				_CounterCollection[_counterID[longID]].counter = widget.counter;
				_CounterCollection[_counterID[longID]].server = widget.server;
				_CounterCollection[_counterID[longID]].added = false;
				_idValues++;
			} else {
				widget.isSame = true;
			}

			_CounterCollection[_counterID[longID]].push(widget);

			if(widget.isSame === true) {
				return;
			}

			if(bulk === false) {
				//		this.flushAddCounters();
			}
		},
		removeCounters : function removec(c) {
			for(var c in _CounterCollection) {
				var counterWidgets = _CounterCollection[c]
				for(var i = 0; i < counterWidgets.length; i++) {
					counterWidgets[i].destroy();
				}
			}
			_CounterCollection = {};
			_counterID = {};
			_lastTime = "";

		},
		processNewValues : function pnv() {
			_refreshRate = this.refreshRate;
			_process();
		},
		stopRefreshData : function stopt() {
			clearTimeout(_timeout);
		}
	});

})();
