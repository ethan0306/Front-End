(function(){

	mstrmojo.requiresCls("mstrmojo.hash");

	mstrmojo.Event = mstrmojo.declare(
		// superclass
		null,
		
		// mixins
		null,
		
		// instance methods
		{
			scriptClass: "mstrmojo.Event",
			
			/**
			 * Called from constructor.
			 */
			init: function init_Event(/*Object?*/ props) {
				// Is the event missing a name? If so, try using the event "type" (if any).
				if (props && !props.name) props.name = props.type;
				
				// Copy all the properties to this new instance.  For performance optimization,
				// use copy rather than mixin.  Later when we have more instance methods for
				// this class, we might need to change to mixin instead of copy.
				mstrmojo.hash.copy(props, this);
			}
		}
	);
	
})();