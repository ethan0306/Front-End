/**
  * _CanCheckItem.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *
  * @fileoverview <p>Code mixing for checking if folder or projec item is clickable.</p>
  * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
  * @version 1.0
  */

(function () {
    
    var CLASS_NAME = 'mstrmojo.android._CanCheckItem';

    
    /**
     * <p>A mixin for adding a Delete button to android main title bar</p>
     */
     
    mstrmojo.android._CanCheckItem = mstrmojo.provide(
        'mstrmojo.android._CanCheckItem',
        
        /**
         * @lends mstrmojo._CanCheckItem
         */
        {
            _mixinName: 'mstrmojo.android._CanCheckItem',
            
            preselectionChange: function preselectionChange(evt) {
                var added = evt.added,
                    removed = evt.removed;
                if ( added ) {
                    var item = this.items[added[0]];
                    if ( ! this.canClick(item)) {
                        //548647 We need to restore selections to make sure that it will 
                        //be unselected when user taps on the clickable item.
                        if ( removed && removed.length) {
                            this.select(removed, true);
                        }
                        return false;
                    }
                }
                return true;
            },
            
            canClick: function canClick(item) {
                if ( mstrMobileApp.isOnline() || item.act === 5) {
                    return true;
                }
                var config = mstrApp.getConfiguration(),
                project, 
                realPid;
                // Is this a project?
                if (item.t === 8 && (item.st === 'Project'  || item.systemFolder)) {
                    project = config.getProject(item.did);
                    return !!(project && project.realPid);
                } else {
                                              //TQMS 553307. Items on the custom home screen may belong to
                                              //             different projects
                    project = config.getProject(item.pid || mstrApp.getCurrentProjectId());
                    realPid = project && project.realPid;
                    return !!(realPid && mstrMobileApp.isCached(realPid, item.did, item.st));
                }
            }
            
        }
    );
})();