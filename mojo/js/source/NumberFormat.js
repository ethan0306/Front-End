(function(){

	// Private: A Map of Formatter object instances, keyed by a combination of separators...
	var _instanceMap = {};

	/**
	 * A factory class that constructs number formatters for a specific locale.
	 * A locale is specified by way of its number separators (decimal and thousands).
	 * 
	 * @class
	 */
	mstrmojo.NumberFormat =
		/**
		 * @lends mstrmojo.NumberFormat
		 */
		{
			/**
			 * Returns an instance of a NumberFormat instance for a specific locale.
			 * @param {String} decimalSeparator The decimal separator for the locale.
			 * @param {String} thousandSeparator The thousands separator for this locale.
			 * @return An instance of a NumberFormat that can parse strings and format numbers
			 * for this locale.
			 */
			getInstance: function getInstance(decimalSeparator, thousandSeparator) {
				// Construct a key based on the two separators...
				var instanceKey = decimalSeparator + "--" + thousandSeparator;
				
				/* Do we have an instance already? */
				if (instanceKey in _instanceMap) {
					/* If so, return it... */
					return _instanceMap[instanceKey];
				}

				// Create a new Formatter object
				var formatterObj = /** @lends mstrmojo.NumberFormat.prototype */ {
					/**
					 * Parses a String assumed to be in the desired locale into a Number.
					 * @param {String} s The string to parse.
					 * @return {Number} A Number (or NaN if the string is malformed).
					 */					
					parse: function(s) {},
					
					/**
					 * Formats a Number into a String of the desired locale.
					 * @param {Number} n The number to format.
					 * @return {String} A String with proper decimal separator. Thousand separators
					 * are <strong>not</strong> introduced into the resulting string.
					 */
					format: function(n) {}
				};
				
				// Special case: English
				if (decimalSeparator === "." && thousandSeparator === ",") {
					formatterObj.parse = function (/*String*/s) {
						if (!s) {
							return NaN;
						}
						
						// Already English--remove thousand separator...
						var simplifiedStr = s.replace(/,/g, "");
						
						return Number(simplifiedStr);
					};
					
					formatterObj.format = function (/*Number*/n) {
						return Number(n).toString();
					};
				} else {	// Non-English Locale...
					// Define our RegExp to use...
					var thouRE = new RegExp("\\" + thousandSeparator, "g");
						
					formatterObj.parse = function (/*String*/s) {
						if (!s) {
							return NaN;
						}
						
						// First, convert the locale-specific String to English...
						var englishStr = s.replace(thouRE, "").replace(decimalSeparator, ".");
						
						// Now, return the Number...
						return Number(englishStr);
					};
					
					formatterObj.format = function (/*Number*/n) {
						// First, convert the number to its English representation...
						var englishStr = Number(n).toString();
						
						// Now, replace...
						return englishStr.replace(".", decimalSeparator);
					};
				}
				
				// Put it in our map...
				_instanceMap[instanceKey] = formatterObj;
				
				return formatterObj;
			}
		};
})();