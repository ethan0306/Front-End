(function() {

    mstrmojo.requiresCls("mstrmojo.AndroidXtab",
                        "mstrmojo._IsInteractiveGrid");

    /**
     * A report based interactive grid visualization for the Android platform.
     * 
     * @class
     * @extends mstrmojo.MobileXtab
     * @borrows mstrmojo._IsInteractiveGrid
     * 
     */
    mstrmojo.AndroidInteractiveGridXtab = mstrmojo.declare(

            mstrmojo.AndroidXtab,

            [ mstrmojo._IsInteractiveGrid ],

            /**
             * @lends mstrmojo.AndroidInteractiveGridXtab.prototype
             */
            {
                scriptClass: 'mstrmojo.AndroidInteractiveGridXtab'
            }
    );
}());
