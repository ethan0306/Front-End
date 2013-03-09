(function() {

    mstrmojo.requiresCls("mstrmojo.VBox",
                         "mstrmojo.ObjectBrowser",
                         "mstrmojo.HTMLButton");
    
    /**
     * Denotes the supported types of objects that can be picked using the IVE dataset picker
     */
    var supportedTypes = {
        768: true, //DssXmlSubTypeReportGrid
        769: true, //DssXmlSubTypeReportGraph
        774: true, //DssXmlSubTypeReportGridAndGraph
        776: true  //DssXmlSubTypeReportCube
    };

    /**
     * This widget is used to display whether 
     * 
     * @class
     * @extends mstrmojo.Editor
     */
    mstrmojo.IVEDatasetPicker = mstrmojo.declare(
            
        //Super class
        mstrmojo.Editor,

        //Mixins
        null,

        /**
         * @lends mstrmojo.IVEDatasetPicker.prototype
         */
        {
            scriptClass : "mstrmojo.IVEDatasetPicker",
            
            /**
             * Set a custom CSS class for the editor.
             */
            cssClass: "mstrmojo-ive-dataset-picker",
            
            /**
             * The Editor title
             * 
             * @see mstrmojo.Editor
             */
            title: mstrmojo.desc(8042,'Create Analysis'),
            
            /**
             * We do not have help for the editor. Set it to null so it's hidden. 
             * 
             * @see mstrmojo.Editor
             */
            help: null,
            
            /**
             * Denotes the starting folder for the Object browser.
             * 
             * @type String
             * @default null
             */
            startingFolder: null,
            
            /**
             * This object stores the last selected item.
             */
            item: null,

            /**
             * The children consists of an object browser and 
             */
            children: [{
                scriptClass : "mstrmojo.ObjectBrowser",
                alias : 'ob',
                cssText : 'border-style:none solid none none;border-width:1px;border-color:#DDDDDD;',
                closeable : false,
                
                /**
                 * Browseable types are set to Folder, Cube, Grid, Graph, Grid-Graph
                 */
                browsableTypes : '8,768,769,774,776',
                
                /**
                 * The user shouldn't be able to close the object browser upon selection.
                 */
                closeOnSelect : false,
                showCompletePath : false,
                searchVisible: false,
                
                /**
                 * @see folderLinks.xml The IVE Dataset Picker uses the same Folder Links Context Id as Select Dataset.
                 */
                folderLinksContextId: 1,
                bindings: {
                    rootFolderID: function() {
                        return this.parent.startingFolder;
                    }
                }
            },{
                scriptClass: "mstrmojo.HTMLButton",
                cssClass: "mstrmojo-Editor-button",
                text: mstrmojo.desc(1442,"OK"),
                onclick: function(evt){
                    this.parent.close({
                        item: this.parent.item
                    });
                },
                bindings: {
                    enabled: function (){
                        return !!this.parent.item;
                    }
                }
            }],
            
            preBuildRendering: function() {
                if (this._super) {
                    this._super();
                }
                
                //Set an event handler when an item is selected on the object browser
                this.ob.onSelectCB = [this, 'onOBSelect'];
                
                //Set the animation property on the Object Browser.
                this.ob.booklet.set('animates', false);
                
                //Set the starting folder on the object browser
                this.ob.rootFolderID = this.startingFolder;
            },
            
            postBuildRendering: function() {
                if (this._super) {
                    this._super();
                }
                //Ask the object browser to browse to the current root folder 
                this.ob.browse();
            },
            
            onOBSelect: function(item) {
                //If the selected object can be converted to analysis, keep this 
                this.set('item', (supportedTypes[item.st] ? item : null)); 
            },
            
            /**
             * This event listener is invoked whenever the starting folder is updated.
             */
            onstartingFolderChange: function() {
                //Set the rootfolder id on the object browser based on the new starting folder
                this.ob.rootFolderID = this.startingFolder;
                
                //Browse to this new folder.
                this.ob.browse();
            }
                    
        });
}());