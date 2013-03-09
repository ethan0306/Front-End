(function() {

	var _random = function rnd(max) {
		var rndnum = max * Math.random();
		rndnum = Math.ceil(rndnum);
		return rndnum;
	};
	function addDatatoChart(dp, ch, cdp) {

		var chartcat = ch.model.categories.items;

		var timedate = new Date(dp.timestamp);
		var displaydate = timedate.toLocaleTimeString();//.getHours() + ":" + timedate.getMinutes() + ":" + timedate.getSeconds();

		chartcat.shift();
		chartcat.push(displaydate);

		cdp.shift();
		cdp.push(parseFloat(dp.value).toFixed(2));

	}

	mstrmojo.requiresCls("mstrmojo.Obj");

	/**
	 * CounterLabel is a label for an IPA counter that displays the latest counter value.
	 *
	 * <p> It will register itself to the counter controller, and upon each call to add values , will display the latest
	 * value in the counter array
	 * </p>
	 *
	 * @class
	 * @extends mstrmojo.Label
	 */
	mstrmojo.IPA.IPAChartCounter = mstrmojo.declare( // superclass
	mstrmojo.Obj,  // mixins
	null,  // instance members
	{
		scriptClass : "mstrmojo.IPA.IPAChartCounter",

		controller : null,

		category : null,

		instance : null,

		server : null,

		counter : null,

		chart : null,

		index : null,

		isSame : false,

		init : function init(props) {
			this._super(props);

			if(this.controller) {
				this.controller.addCounters(this, false);

				var dp = [];
				for(var i = 0; i < 100; i++) {
					dp[i] = "-" + (_random(2));
				}

				this.index = this.chart.model.series.length;

				var temp = {
					v : dp,
					hi : [this.index]
				};
				this.chart.model.series.push(temp);
				temp = {
					n : this.counter,
					f : ''
				};

				this.chart.model.colHeaders[0].items.push(temp);
				this.chart.model.colHeaders[0].x = _random(10);

			} else {
				alert("No controller specified");
			}
		},
		addValues : function addv(d) {

			var chartv = this.chart.model.series[this.index].v;

			if(chartv[chartv.length - 1] < 0) {
				for(var i = 0; i < d.length; i++) {
					addDatatoChart(d[i], this.chart, chartv);
				}
			} else {
				addDatatoChart(d[d.length - 1], this.chart, chartv);
			}

			this.chart.model.series[this.index].v = chartv.slice(0, chartv.length);
			this.chart.update();
			this.chart.refresh();

		},
		deActivateCounter : function deaccounter() {

			this.chart.model.series.splice(this.index, 1);
			this.index = -1;
			this.chart.model = null;
			this.chart.update();
			this.chart.refresh();

		},
		activateCounter : function accounter() {

			this.chart.model.series.push(this.chartDataPoints);
			this.index = this.chart.model.series.length - 1;
			this.chart.model = null;
			this.chart.update();
			this.chart.refresh();

		}
	});

})();
