/**
  * FolderView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  * @version 1.0
  * 
  * @fileoverview <p>Widget for displaying folder contents on Android devices.</p>
  * @author <a href="mailto:mhaugen@microstrategy.com">Mark Haugen</a>
  * @version 1.0
  */
(function () {

    mstrmojo.requiresCls("mstrmojo.android.SimpleList",
//                         "mstrmojo._SupportsEllipsisText",
                         "mstrmojo.android._HasLingeringListSelections",
                         "mstrmojo.android._CanCheckItem",
                         "mstrmojo.css");
    
    var itemMarkup;

    function onConnectivityChanged(isOnline) {
       
        this.refresh();
    }
    
    /**
     * Widget for displaying folder contents on an Android Device.
     * 
     * @class
     * @extends mstrmojo.android.SimpleList
     */
    mstrmojo.android.medium.FolderView = mstrmojo.declare(
            
        mstrmojo.android.SimpleList,

        [ mstrmojo.android._HasLingeringListSelections, mstrmojo.android._CanCheckItem], //mstrmojo._SupportsEllipsisText,

        /**
         * @lends mstrmojo.android.medium.FolderView.prototype
         */
        {
            scriptClass: "mstrmojo.android.medium.FolderView",

            cssClass: 'folder-browser',
            
            /**
             * Turn on select scrolling.
             * 
             * @ignore
             */
            useSelectScroll: true,
            
            /**
             * Turn on highlight for select scrolling.
             * 
             * @ignore
             */
            highlightOnSelect: true,
            
            /**
             * @see mstrmojo.android.SimpleList
             */
            hasEvenRows: true,
            
            /**
             * Add and remove transition duration so selections fade.
             * 
             * @ignore
             */
            listHooks: {
                select: function (el) {
                    // Change transition duration to zero so it highlights immediately.
                    el.style.webkitTransitionDuration = 0;
                },
                unselect: function (el) {
                    // Set duration to non-zero value so the background color will fade out.
                    el.style.webkitTransitionDuration = '300ms';
                }
            },
            
            /**
             * Stores the parameters retreived from the result of the task call made by the dataservice. It's used for refreshing the folder view later on.
             * 
             * @type Object
             */
            params: null,

            init: function init(props) {
                this._super(props);
                //TQMS 526661 We need to know when connectivity changes
                var publisher = mstrmojo.publisher;
                publisher.subscribe(publisher.NO_SRC, publisher.CONNECTIVITY_CHANGED_EVENT, onConnectivityChanged, this.id );
            },
            
            getItemMarkup: function (item) {
                if (!itemMarkup) {
                    itemMarkup = this._super(item).replace('{@n}', '<h3>{@n}</h3><h4>{@desc}</h4><div><div></div></div>');
                }
                
                return itemMarkup;
            },
            
            getItemProps: function getItemProps(item, idx) {
                var props = this._super(item, idx),
                    desc = item.desc || '';
                
                // Add subtype class to dislay icon.
                props.addCls('ty' + item.st);
                
                // Do we have a description? 
                if (desc) {
                    // Add description to properties.
                    props.desc = desc;
                    
                    // Add description css class.
                    props.addCls('desc');
                }
                
                // Is the item a shortcut?
                if (item.isc) {
                    // Add shortcut css class.
                    props.addCls('isc');
                }

                if ( ! this.canClick(item) ) {
                    props.addCls('disabled');
                }
                
                return props;
            },
            
            /**
             * Updates the UI with the specified folder contents and overrides the base class to set the title.
             * 
             * @param {Object} res object that describes the folder's contents
             */
            setData: function (res) {
                //Set the items on the Folder View
                this.set('items', res.items);
                
                // Store the request params for future use
                this.params = res;
            },

            // Commented out due to poor performance.
//            /**
//             * Overridden to ellipsize the title and description fields.
//             * 
//             * @ignore
//             */
//            onRender: function onRender() {
//                if (this._super) {
//                    this._super();
//                }
//                
//                var items = this.itemsContainerNode.childNodes,
//                    cnt = items.length,
//                    i = 0;
//
//                // Iterate each item.
//                for (; i < cnt; i++) {
//                    // Ellipsize the title.
//                    this.ellipsize('h3', items[i].childNodes[0]);
//                }
//            },
            
            postselectionChange: function postselectionChange(evt) {
                // Were any selections added?
                var added = evt.added;
                if (added) {
                    
                    // Pass control to controller to open requested item.
                    var item = this.items[added[0]];
                    this.controller.openObject({
                        ttl: item.n,
                        st: item.st,
                        did: item.did,
                        ab: item.ab,
                        rtf: item.rtf
                    });
                }
            },
            
            /**
             * @see mstrmojo.AndroidMainView
             */
            populateActionMenu: function populateActionMenu(config) {
                // Delegate the request to the controller to populate the menu.
                this.controller.populateMenu(config);
            },
            
            /**
             * @see mstrmojo.AndroidMainView
             */
            handleMenuItem: function handleMenuItem(group, command) {
                // Default command to empty object.
                command = command || {};
                
                // Add view to command.
                command.view = this;
                
                // Delegate the request to the controller to handle the menu item.
                this.controller.handleMenuItem(group, command);
            }
        }
    );
}());