/**
  * AndroidView.js
  * Copyright 2010 MicroStrategy Incorporated. All rights reserved.
  *    @version 1.0
  */
  /* 
  * @fileoverview <p>Widget for displaying a standard "Android" view with a titleNode slot and containerNode slot.</p>
  */

(function () {

    mstrmojo.requiresCls("mstrmojo.MobileView",
                         "mstrmojo.Label",
                         "mstrmojo.css");

    /**
     * <p>Widget for displaying a standard "Android" view with a titleNode slot and containerNode slot.</p>
     * 
     * @class
     * @extends mstrmojo.MobileView
     */
    var $AV = mstrmojo.AndroidView = mstrmojo.declare(
        mstrmojo.MobileView,

        null,

        /**
         * @lends mstrmojo.AndroidView.prototype
         */
        {
            scriptClass: "mstrmojo.AndroidView",

            markupString: '<div id="{@id}" class="mstrmojo-AndroidView {@cssClass}" style="{@cssText}">' +
                              '<div></div>' +
                              '<div></div>' +
                          '</div>',

            markupSlots: {
                titleNode: function () { return this.domNode.firstChild; },
                containerNode: function() { return this.domNode.lastChild; }
            },

            layoutConfig: {
                h: {
                    titleNode: '50px',
                    containerNode: '100%'
                },
                w: {
                    titleNode: '100%',
                    containerNode: '100%'
                }
            },
            
            /**
             * <p>The static configuration for the child widget that should appear in the containerNode of this view.</p>
             * 
             * @type Object
             * @abstract
             */
            contentChild: null,
            
            children: [],
            /**
             * Adds the content child as defined in the contentChild property.
             * 
             * @ignore
             */
            addChildren: function addChildren(c, idx, silent) {
            	c = (c && c.concat([])) || [];
                // Extract the label and title.
                var label = {
                        scriptClass: 'mstrmojo.Label',
                        slot: 'titleNode',
                        alias: 'title',
                        cssClass: "mstrmojo-AndroidView-Title"
                    },
                    title = this.ttl;
                
                // Do we have a title?
                if (title) {
                    // Set the title into the label.
                    label.text = title;
                }
                
                // Reset children.
                c.push(label);
                
                // Add content and bottom children.
                var view = this; 
                mstrmojo.hash.forEach({
                    content: 0,
                    bottom: 1
                }, function (slot, name) {
                    // Do we have this child?
                    var childName = name + 'Child',
                        child = view[childName];
                    
                    if (child) {
                        // Set the slot.
                        child.slot = ((slot) ?  name : 'container') + 'Node'; 
                        
                        // Set the alias.
                        child.alias = childName;
                        
                        // Add to children collection.
                        c.push(child);
                    }
                });
                
                return this._super(c, idx, silent);
            },
                        
            /**
             * Updates the text of the title node.
             * 
             * @param {String} titleText The new title text.
             */
            updateTitle: function updateTitle (titleText) {
                this.title.set('text', titleText);
            },
            
            getTitle: function getTitle() {
                return this.title.text;
            },
            
            getContentView: function getContentView(options) {
                return this.contentChild;
            },
            
            setData: function setData(data) {
                this.contentChild.setData(data);
            }
                        
        }
    );
    
    // Register this class to have the height of the cmdNode layout changed for DPI.
    mstrmojo.DPIManager.registerClass($AV, 'h', 'titleNode', 30, 85);
})();