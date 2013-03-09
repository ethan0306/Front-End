(function () {

    mstrmojo.requiresCls("mstrmojo.Calendar",
                         "mstrmojo._TouchGestures");
    
    /**
     * <p>MobileCalendar is a widget that allows to pick a date for touch-enabled
     *  devices. </p>
     * 
     * @class
     * @extends mstrmojo.MobileCalendar
     */
    mstrmojo.MobileCalendar = mstrmojo.declare(
        // superclass
        mstrmojo.Calendar,
        // mixins
        [mstrmojo._TouchGestures],
        
        /**
         * @lends mstrmojo.MobileCalendar.prototype
         */
        {
            scriptClass: "mstrmojo.MobileCalendar",
            
            /**
             * @see mstrmojo.Calendar
             */
            cssPrefix: 'mobile-calendar',

            /**
             * Mobile Calendar shows the full calendar names.
             * 
             * @see mstrmojo.Calendar
             */
            monthNames: function(i){ return mstrmojo.locales.datetime.MONTHNAME_FULL[i]; },
            
            
            /**
             * The Mobile Calendar only shows the day view.
             * 
             * @see mstrmojo.Calendar
             */
            supportedViews: {
                day: true,
                month: true,
                year: true
            },
            
            /**
             * @see mstrmojo.Calendar
             */
            premousedown: function premousedown(e) {
                //for debugging purposes: Let the calendar handle clicks when testing on a non-mobile device.
                if (!mstrApp.isTouchApp()) {
                    return this._super(e);
                }
            },
            
            /**
             * @see mstrmojo._TouchGestures.
             */
            touchTap: function touchTap(touch) {
                //Process the event based on where the user has tapped.
                this.processEvent(document.elementFromPoint(touch.pageX, touch.pageY));
                
                return false;
            }
        }
    );
    
}());