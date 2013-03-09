/**
  * MobileView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0
  */
  /* 
  * @fileoverview <p>Base class for displaying standard "Mobile" view.</p>
  */

(function () {

    mstrmojo.requiresCls("mstrmojo.Container",
                         "mstrmojo._HasLayout");

    /**
     * <p>Base class for displaying standard "Mobile" view.</p>
     * 
     * <p>This is an abstract class, it has no markup, markup slots or layoutConfig.  It is the responsibility of each subclass to implement it's own markup.</p>
     * 
     * @class
     * @abstract
     * @extends mstrmojo.Container
     */
    mstrmojo.MobileView = mstrmojo.declare(
        mstrmojo.Container,

        [ mstrmojo._HasLayout],

        /**
         * @lends mstrmojo.MobileView.prototype
         */
        {
            scriptClass: "mstrmojo.MobileView",

            controller: null
        }
    );

})();