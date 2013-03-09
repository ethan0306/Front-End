(function() {

	mstrmojo.requiresCls("mstrmojo.Label");

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
	mstrmojo.IPA.IPACounterLabel = mstrmojo.declare(
	// superclass
	mstrmojo.Label,
	// mixins
	null,
	// instance members
	{
		scriptClass : "mstrmojo.IPA.IPACounterLabel",

		controller : null,

		prevValue : null,

		category : null,

		showTrendIndicators : false,

		instance : null,

		server : null,

		headerText : '',

		counter : null,

		appendSymbol : '',

		isSame : false,

		init : function init(props) {
			this._super(props);

			if(this.controller) {
				this.controller.addCounters(this, false);
			} else {
				alert("No controller specified");
			}
			this.origCssText = this.cssText;
		},
		addValues : function addv(d) {
			if(d[d.length - 1].value >= 0) {
				var currentValue = parseInt(d[d.length - 1].value);
				var t = this.headerText + currentValue + " " + this.appendSymbol;

				var trendUp = "&nbsp";
				var trendDown = "&nbsp";

				if(this.showTrendIndicators) {
					var colorcss = 'color: black;' + this.origCssText;

					if(this.prevValue != null && this.prevValue < currentValue) {
						trendUp = "&#x25B2"
						colorcss = 'color: red;' + this.origCssText;
						this.set("cssText", colorcss);
					}
					if(this.prevValue != null && this.prevValue > currentValue) {
						trendDown = "&#x25BC"
						colorcss = 'color: green;' + this.origCssText;
					}
					t = trendUp + "<br />" + t + "<br />" + trendDown;
					
					this.set("cssText", colorcss);
				}

				
				this.set("text", t);

				this.prevValue = currentValue;
			}
		}
	});

}
)();
