googleMapScript = true;

if (typeof(mstrmap) == 'undefined'){
    mstrmap = {};    
}

if (typeof(mstrApp) == "undefined")
{
    mstrApp = {};    
}

(function(){
    
    mstrmojo.requiresCls("mstrmojo.Widget",
            "mstrmojo.Button",
            "mstrmojo.HBox",
            "mstrmojo.VBox",
            "mstrmojo.SelectBox",
            "mstrmojo.form",
            "mstrmojo.array",            
            "mstrmojo.css",
            "mstrmojo._HasPopup",
            "mstrmojo._HasColorCodedArea",
            "mstrmojo._CanLoadMapExternalScript",
            "mstrmojo.Vis");
    
    function dojoRequires()
    {
        if (dojo) {

            dojo.require("dijit.Dialog");
            dojo.require("dijit.layout.BorderContainer");
            dojo.require("dijit.layout.ContentPane");
            dojo.require("dijit.form.DropDownButton");
            dojo.require("dijit.TooltipDialog");
            dojo.require("dojo.parser");

            dojo.require("dojox.charting.Chart2D");
            dojo.require("dojox.charting.themes.PlotKit.blue");
            dojo.require("dojox.charting.action2d.Highlight");
            dojo.require("dojox.charting.action2d.Magnify");
            dojo.require("dojox.charting.action2d.MoveSlice");
            dojo.require("dojox.charting.action2d.Shake");
            dojo.require("dojox.charting.action2d.Tooltip");
            dojo.require("dojox.charting.widget.Legend");
            dojo.require("dojo.colors");
            dojo.require("dojo.fx.easing");

            dojo.require("dojo.dnd.TimedMoveable");
        } else {
            window.setTimeout(dojoRequires,100);
        }
    }
            
    
    // Hyperlink Drill Constants
    var SAME_PROMPT = 1;
    var DO_NOT_ANSWER = 2;
    var CLOSE = 3;
    var DYNAMIC = 4;
    var STATIC = 5;
    var CURRENT_UNIT = 6;
    var ALL_VALID_UNITS = 7;
    var USE_DEFAULT_ANSWER = 8;
    
    //Action Type supported
    var DRILLING_ACTION = 1;
    var SELECTOR_ACTION = 2;
    var HYPERLINK_ACTION = 4;
    var SORT_ACTION = 8;
    
    //Data Model's 
    
    var PRIMARY_DATA_PROVIDER = 0;
    var SECONDARY_DATA_PROVIDER = 1;
    
    var DEFAULT_BUBBLE_SIZE = 10;
    mstrmojo.gmaps = {};
    /**
     * <p>Google Map.</p>
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    
    mstrmojo.gmaps.GoogleMap = mstrmojo.declare(
        // superclass
        mstrmojo.Vis,   //mstrmojo.Vis is child of mstrmojo.Widget
        
        // mixins
        [mstrmojo._HasPopup, mstrmojo._HasColorCodedArea, mstrmojo._CanLoadMapExternalScript, mstrmojo._Formattable],
        
        /**
         * @lends mstrmojo.Button.prototype
         */
        {
            scriptClass: 'mstrmojo.gmaps.GoogleMap',
            
            /**
             * An optional second CSS class that will be added to the domNode "class" attribute.
             * Typically used for setting an icon for the Button.
             * 
             * @type String
             */
            iconClass: '',
            
            formatPopupRef: {
                scriptClass: "mstrmojo.Editor",
                contentNodeCssClass: "mstrmojo-balloon",
                cssClass:"infowindowEditor",
                alias: "infoWindowEditor",
                title: mstrmojo.desc(8218,"Edit custom infoWindow"),
                left: '100px',
                top: '100px',
                width: '200px',
                help: 'creating_a_geo_map_visualization.htm',
                locksHover: true,
                
                onOpen: function(){

                    var openerDom = this.opener.domNode;
                    var position = mstrmojo.dom.position(openerDom);
                    var left = position.x+100;
                    var top = position.y+100;
                    
                    
                    this.set('top',top+'px');
                    this.set('left',left+'px');
                    
                    this.editorNode.style.width = '250px';
                    //update model to FE
                    //this.set('model', mstrmojo.all.mstrCGE.model);
                },
                
                children: [
                    {
                        scriptClass: "mstrmojo.TextArea",
                        cssClass:'mstrmojo-SaveAsEditor-descInput',
                        alias: 'desc',
                        bindings:{
                            value: "this.parent.opener.infoWindowHTML"
                        },
                        cols: 80,
                        rows: 7
                    },
                    {
                        scriptClass: "mstrmojo.HBox",
                        slot: 'buttonNode',
                        cssClass:"mstrmojo-Editor-buttonBar",                  
                        children: [
                            {
                               scriptClass: "mstrmojo.HTMLButton",
                               alias: 'ok',
                               text: mstrmojo.desc(1442,'OK'),
                               //text:'OK',
                               cssClass: 'mstrmojo-Editor-button',
                               onclick: function () {

                                   this.parent.parent.opener.saveCustomInfo(this.parent.parent.desc.value);
                               }
                            },                               
                            {
                                scriptClass: "mstrmojo.HTMLButton",
                                alias: 'cancel',
                                text: mstrmojo.desc(221,'Cancel'),
                                //text:'Cancel',
                                cssClass: 'mstrmojo-Editor-button',
                                onclick: function () {
                                    this.parent.parent.close();
                                }
                            }            
                        ]
                    }
                ]
            },
            
        setMapModel: function(model) 
        {          
        
           this.primaryModel = (model.grid1 ? new mstrmojo.Vis.DataParser(model.grid1) : null);
           this.secondaryModel = (model.grid2 ? new mstrmojo.Vis.DataParser(model.grid2) : null); 
        },
        
        getMapModel: function(key) 
        {
           return key === PRIMARY_DATA_PROVIDER ? this.primaryModel :  this.secondaryModel;
        },
            
            primaryModel : null,
            secondaryModel : null,                        
            areasHashMap : null,
            /**
             * The tooltip for this button.
             * 
             * @type String
             */
            title: '',
            gridParams: null,
            
            height: 'auto',
            width: 'auto',
            
            //tool bar
            toolbar :  null,
	        formatHandlers: {
                domNode: ['left', 'top', 'z-index', 'height', 'width']
            }, 
            /**
             * @ignore
             */
            markupString: '<div id="{@id}" title="{@title}" style="{@domNodeCssText};position:relative" mstrAttach:click,mousedown,mouseup,drawEnd>' +
                          '<div id="{@id}-toolbar" style="height:50px"></div>' +
                          '<div id="{@id}-map" style="width:{@width}px;"></div>' +
                          '</div>',
            /**
             * @ignore
             */
            markupSlots: {
                //the main canvas of the Chart
                mapDiv: function(){ return this.domNode.childNodes[1]; },
                toolBarDiv: function(){ return this.domNode.firstChild; }               
            },                        

            /**
             * Selected metric index, start from 0, default 0.
             */

            selectedMetricIndex: 0,
            onselectedMetricIndexChange:function onselectedMetricIndexChange() {
                this.debug("selected metric Index Changed");
                this.adjustColor();
                if (this.widgetProps) {
                    this.widgetProps.cmt = this.toolbar.metricSelector.selectedItem.id;
                    this.persistWidgetProps();
                }
            },
            /*
            selectedMetricId :"",
            onselectedMetricIdChange:function onselectedMetricIdChange() {
                //need to persist the id
                if (this.widgetProps) {
                    this.widgetProps.cmt = this.parent.hbox1.esriMetricSelector.selectedItem.id;
                    this.persistWidgetProps();
                }
            },
            */
            /**
             * flag for enable/disable selection
             */
            enableClickSelect:false,
            
            /**
             * flag for enable map operation such as pan and zoom
             */
            enableAreaSelect:false,
            clickHandler:null,
            moveHandler:null,
            fusionTableLayerClickHandler : null,             
            fusionTableLayerMouseMoveHandler : null,
            onenableAreaSelectChange:function onenableAreaSelectChange() {
                if (this.enableAreaSelect) {
                   this.toggleDragging(false);
                   var that = this;
                   this.clickHandler = google.maps.event.addListener(this.map,'click', function (evt) {
                       that.onMouseClick(evt);
                       //console.log("actual coordinates, lng= "+evt.latLng.lng()+":lat="+evt.latLng.lat());
                   });
                   this.moveHandler = google.maps.event.addListener(this.map,'mousemove', function (evt) {
                       that.onMouseMove(evt);
                   });
                   
                   //add the event listeners on the fusion table layer also
                
                   this.fusionTableLayerClickHandler = this.addColorCodedAreaListener('click', function(evt)
                                                           {
                                                                 that.onMouseClick(evt);            
                                                          });
                   this.fusionTableLayerMouseMoveHandler = this.addColorCodedAreaListener('mousemove', function(evt)
                                   {
                                     that.onMouseMove(evt);            
                                                       });
                   if (!this.curpolygonList) {
                         this.curpolygonList = [];
                      } 
               }
               else
               {
                   this.doClearRectangle(true); //force it to clear the rectangle

                   this.toggleDragging(true);
                   if (this.clickHandler){
                       google.maps.event.removeListener(this.clickHandler);
                       this.clickHandler = null;
                   }
                   if (this.moveHandler) {
                       google.maps.event.removeListener(this.moveHandler);
                       this.moveHandler = null;
                   }
                   
           if(this.fusionTableLayerClickHandler)
           {
              this.removeColorCodedAreaListener(this.fusionTableLayerClickHandler);
              this.fusionTableLayerClickHandler = null;
           }
           if(this.fusionTableLayerMouseMoveHandler)
           {
              this.removeColorCodedAreaListener(this.fusionTableLayerMouseMoveHandler);
              fusionTableLayerMouseMoveHandler = null;
           }
               }
            },
            
            /**
             * flag for enable popup
             */
            enablePopup:true,
            onenablePopupChange:function onenablePopupChange() {
                this.clearAllHighlight();
                this.hideInfoWindow(null);
            },
                        
            /**
             * flag for enable infoWindow visibility, we cannot prevent the infoWindow while clicking right now
             */
            infoWindowVisible:true,            
            
            /**
             * infoWindow html
             */
            infoWindowHTML:'',
            defaultInfoWindowHTML:'',
            
            /**
             * grid or graph mode for infoWindow
             */
            infoWindowUseGrid:true,
            
            /**
             * debugging flag
             */
            enableDebug:true,
            
            /**
             * enums for the cell type
             */
            enumNumber:2,
            enumText:3,
            enumImage:4,
            enumUrl:5,
            enumQuickSymbol:10,
            
            /**
             * base map url
             */
            bounds:null,
            numAttributes:-1,
            /**
             * stroke color sets
             */
            regularStroke:"#FFFFFF",
            highlightStroke:"#000000",
            selectedStroke:"#0000ff",
            defaultThresholdColor:"#FE766A",
            
            /**
             * paramters used for tasks
             */
            params:{},
            /**
             * default function for output debug message
             */
            debug:function debug(s) {
                if (this.enableDebug){
                    //console.log(s);
                }
            },
            clearMap:function clearMap() {
            },
            
            /*
             * these 3 functions are used to generate the info window editor
             * they are design to do the following task
             * default, edit and save
             * 
             */
            getDefaultInfoWindowTemplate: function getDefaultInfoWindowTemplate() {
                
                var contentHTML = "",
                    model = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    rowHeaders = model.getRowHeaders(0),
                    rowTitles = model.getRowTitles(),
                    colTitles = model.getColTitles(),
                    rowCell,rowCellTitle,
                    k,j, size;
                
                for (k=0, size= rowHeaders.size(); k<size ;k++)
                {
                    if (k === this.shapePosition || k === this.latColumnIndex || k === this.longColumnIndex || k === this.pointColumnIndex)
                    {
                        continue;
                    }
                    //rowCell = rowHeaders.getHeader(k);
                    
                    rowCellTitle = rowTitles.getTitle(k).getName();
                    contentHTML+="<b>"+rowCellTitle+"</b>: ${"+this.replaceSpace(rowCellTitle)+"}<br />";
                }
                //TODO might need to change the metrics string here.
                if (colTitles.size()===1 && colTitles.getTitle(0).getName()==="Metrics"){
                    //only add metric if we have metrics on the column
                    rowHeaders = colTitles.getTitle(0).getHeaderValues();
                    for (j=0, size = rowHeaders.length;j<size;j++){
                        rowCellTitle = rowHeaders[j].n;
                        contentHTML+="<b>"+rowCellTitle+"</b>: ${"+this.replaceSpace(rowCellTitle)+"}<br />";
                    }
                }
                return contentHTML;
            },
           
            saveCustomInfo:function saveCustomInfo(value)
            {
                this.infoWindowHTML = value;
                this.widgetProps.iwd = escape(this.infoWindowHTML);
                this.persistWidgetProps();
                this.closePopup();
            },
            
            replaceSpace:function replaceSpace(str,replaceStr) {
                var replace = replaceStr;
                if (replace === undefined) {
                    replace = "_";
                }
                return str.replace(/ /g,replace);
                    
            },
            /**
             * keyboard handlers to handle Control key
             */
            isCtrl:false,
            processMapKeydown:function processMapKeydown(_event_) {
                // --- Retrieve event object from current web explorer
                //var winObj = this.checkEventObj(_event_);
                //console.log("keydown");
                var winObj;
                if ( window.event ) {
                    winObj =  window.event;
                // --- Netscape and other explorers
                } else {
                    winObj = _event_;
                }

                //var intKeyCode = winObj.keyCode;
                //var intAltKey = winObj.altKey;
                var intCtrlKey = winObj.ctrlKey;

                // 1° --- Access with [ALT/CTRL+Key]
                if (intCtrlKey) {
                    //console.log("CTRL in");
                    var oldValue = this.isCtrl;
                    //console.log("control?"+this.isCtrl);
                    this.isCtrl = true;
//                    if (oldValue != this.isCtrl)
//                        console.log("control?"+this.isCtrl + ": id = "+ this.mapDiv.id);
                   
                }

            },
            processMapKeyup:function processMapKeyup(_event_) {
                //console.log("keyup");
                var winObj;
                if ( window.event ) {
                    winObj =  window.event;
                }
                // --- Netscape and other explorers
                else {
                    winObj = _event_;
                }

                //var intKeyCode = winObj.keyCode;
                //var intAltKey = winObj.altKey;
                var intCtrlKey = winObj.ctrlKey;

                // 1° --- Access with [ALT/CTRL+Key]
                if (!intCtrlKey) {
                    
                    this.handleAffinityAnimationKeyUp();

                    this.isCtrl = false;
                    
                }
            },
            
            onShow:function onShow() {
                if (this.map) {
                    google.maps.event.trigger(this.map, 'resize');
                    if(this.bounds) {
                        this.map.setCenter(this.bounds.getCenter());
                        this.map.fitBounds(this.bounds);
                    }
                }
            },
            justMetricId:function justMetricId(id) {
                if (id.indexOf("CD:")!=0) {
                    return id;
                }
                var endIndex = id.indexOf(':',3);
                return (endIndex >=0) ? id.substring(3,endIndex) : id.substring(3); 
            },
            configMetricSelector:function configMetricSelector(metricId) {
                if (!metricId) {
                    return;
                }
                var items = this.toolbar.metricSelector.items;
                var i=0;
                var found = false;
                while(!found && i<items.length ) {
                    if (this.justMetricId(items[i].id) === this.justMetricId(metricId)) {
                        found = true;
                    } else {
                        i++;
                    }
                }
                if (!found) {
                    i=0;
                }
                this.toolbar.metricSelector.set("selectedIndex", i);
                this.selectedMetricIndex = i;
            },
            /**
 * Encodes an html string.
 * @param {String} oldStr The html to encode.
 * @param {Boolean} [toServer=false] Indicates whether newlines should be encoded for html display ('<br />').
 * @type String
 * @return The encoded string value. 
 */ 
encode : function encode(oldStr, toServer) {
        var sb = oldStr;
        if (toServer == null) toServer = false;

        if ((oldStr != null) && (oldStr.length > 0)) {
                sb = "";

                for (var i = 0, len = oldStr.length; i < len; i++) {
                        switch (oldStr.charAt(i)) {
                        case '&':
                                if ((oldStr.length != (i + 1)) && (oldStr.charAt(i + 1) == '#')) {
                                        // we don't want to encode if &#
                                        sb += "&";
                                } else {
                                        sb += "&amp;";
                                }
                                break;

                        case '<':
                                sb += "&lt;";
                                break;

                        case '>':
                                sb += "&gt;";
                                break;

                        case '\'':
                                sb += "&#039;";
                                break;

                        case '\n':
                                    if (!toServer) {
                                        sb += "<br />";
                                    } else {
                                        sb += oldStr.charAt(i);
                                    }
                                break;

                        case '"':
                                sb += "&quot;";
                                break;
                        case ' ':
                                if (i == 0 || (i < oldStr.length - 1 && oldStr.charAt(i + 1) == ' ')) {
                                    sb += "&nbsp;";
                                } else {
                                    sb += oldStr.charAt(i);
                                }
                                break;
                        default:
                                sb += oldStr.charAt(i);
                                break;
                        }
                }
        }

        return sb;

},
            widgetProps:null,
            gridBone:null,
            createWidgetPropsXML:function createWidgetPropsXML() {
                var widgetPropsXml = "<widgetProps><fmt>";
                var k;
                for (k in this.widgetProps) {
                    widgetPropsXml += "<" + k + " value=\"" + this.encode(this.encode(this.widgetProps[k])) + "\" />";
                }
                   
                widgetPropsXml += "</fmt></widgetProps>";
                return widgetPropsXml;
            },
            persistWidgetProps:function persistWidgetProps() {
                if (this.widgetProps) {
                    
                    var widgetPropsXml = this.createWidgetPropsXML();
                    
                    var ac = [];
                    this.gridBone.setVisualizationSettings(null, null, null, null, ac, widgetPropsXml);
                    this.gridBone.um.add(ac);
                }
            },
            
            postBuildRendering: function postBuildRendering() {
                
                this._super();                
                //check if the grid is empty then just display the error message and return
                if(this.getModel().eg)
                {   
                    this.mapDiv.innerHTML = "<div class=\"map-err-message\" style = \"font-size:15px;height:100%;width:100%;background-color:white;color:black\">" + this.getModel().eg + "</div>";
                    return;
                }            
                //initialize window with values we get from transform                
                //retrieve the premiere key and cache it
                if(!!this.gridParams.clientId)                  
                {
                   this.setPremiere(true);                       
                   this.setPremiereKey(this.gridParams.clientId);
                }
                
                this.setLocaleLang(this.gridParams.lang);
                this.setLocaleRegion(this.gridParams.region);
                
                this.wpSecondaryDPKey = this.getModel().vp.ag;
				this.width = parseInt(this.width, 10);
				this.height = parseInt(this.height, 10);
				
                if(this.wpSecondaryDPKey && this.model.sdp && this.model.sdp[this.wpSecondaryDPKey]) 
                {                  
                  this.setMapModel({grid1: this.model, grid2 : this.model.sdp[this.wpSecondaryDPKey]});
                }
                else {                  
                  this.setMapModel({grid1: this.model, grid2 : null});
                } 
               
                //load the external scripts first     
                this.loadExternalScript(this.onStartLoadGoogleMap, this);
            },
    
            onStartLoadGoogleMap : function onStartLoadGoogleMap()
            {
                //create the google toolbar
                mstrmojo.gmaps.GoogleMap.newMapViewer(this);
                
                var that = this;
                //add keyboard event listener
                document.onkeydown = function(evt) {
                    that.processMapKeydown(evt);
                };
                document.onkeyup = function(evt){
                    that.processMapKeyup(evt);
                };
                    
                if (typeof(microstrategy) != 'undefined') {
                    this.gridBone = microstrategy.bone(this.gridParams.boneId);
                }
                
                this.widgetProps = this.getVisProps(this.gridParams);
                    
                if (this.widgetProps) {
                    var selectedMetricId = this.widgetProps.cmt;
                    this.configMetricSelector(selectedMetricId);
                }else {
                    //console.log("missing properties");
                }
                
                this.loadGoogleMap(null);
                this.updateToolBarButtons();

                mstrmap[this.gridParams.boneId]=this.toolbar.id;   
                 
            },
            
            cleanMap:function cleanMap() {
                this.hideInfoWindow(null);
            },
            
            initMapProperty:function initMapProperty(){
                //we need reset the geoPosition and geoAttributeName
                var geoName;
                for(geoName in this.columnIndices) {
                    if (this.columnIndices.hasOwnProperty(geoName)) {
                        this.columnIndices[geoName] = -1;
                    }
                }
                
                this.shapePosition = -1;
            },
            
            isAsp:function isAsp(){
                return (microstrategy.servletName.indexOf("aspx")!= -1);
            },
            
            findNumAttributes:function findNumAttributes() {
                var attrList = [],
                    rowAttributes = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles(),
                    numTemplateUnits = rowAttributes.size(), i;
                
                this.numAttributes = 0;
                
                for (i=0; i<numTemplateUnits; i++) {
                    if (mstrmojo.array.indexOf(attrList,rowAttributes.getTitle(i).getUnitId()) <0)
                    {
                        attrList.push(rowAttributes.getTitle(i).getUnitId());
                        this.numAttributes ++;
                    }
                }
            },
            latColumnIndex:-1,
            longColumnIndex:-1,
            lookupColumnIndex:-1,
            areaColumnIndex : -1,
            findLatLngPositionForm:function findLatLngPositionForm() {
                this.enableLatLng = false;
                
                var rowAttributes = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles(),
                    numTemplateUnits = rowAttributes.size(),
                    latFormId = this.wpLat,
                    longFormId = this.wpLng,
                    attrId = this.wpAttribute,
                    i, title;
                
                //search for the column that has lat and long information, based on the column header
                for (i=0; i<numTemplateUnits; i++) {
                    title = rowAttributes.getTitle(i);
                    if (title.getUnitId() === attrId)
                    {
                        var formId = title.getFormId();
                        if (formId === latFormId) {
                            this.columnIndices.Lat = i;
                            this.latColumnIndex = i;
                        } else if (formId === longFormId){
                            this.columnIndices.Long = i;
                            this.longColumnIndex = i;
                        }
                    }
                }
                this.enableLatLng = ((this.latColumnIndex != -1) && (this.longColumnIndex != -1));
                return this.enableLatLng;
            },
            findLatLngPositionAttribute:function findLatLngPositionAttribute() {
                this.enableLatLng = false;
                
                var rowAttributes = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles(),
                    numTemplateUnits = rowAttributes.size(),
                    latAttrId = this.wpLat,
                    longAttrId = this.wpLng,
                    i, attrId;
                
                //search for the column that has lat and long information, based on the column header
                for (i=0; i<numTemplateUnits; i++) {
                                        
                    attrId = rowAttributes.getTitle(i).getUnitId();
                    if (attrId === latAttrId) {
                        this.columnIndices["Lat"] = i;
                        this.latColumnIndex = i;
                    } else if (attrId === longAttrId){
                        this.columnIndices["Long"] = i;
                        this.longColumnIndex = i;
                    } 
                    if(attrId === this.wpLookupAttId){
                        this.lookupColumnIndex = i;
                    }
                }
                this.enableLatLng = ((this.latColumnIndex != -1) && (this.longColumnIndex != -1));
                return this.enableLatLng;
            },
            pointColumnIndex:-1,
            findPointPositionForm:function findPointPositionForm() {
                this.enablePoint = false;
                              
                var rowAttributes = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles(),
                    numTemplateUnits = rowAttributes.size(),
                    pointFormId = this.wpPoint,
                    attrId = this.wpAttribute,
                    i, title;
                
                //search for the column that has lat and long information, based on the column header
                
                for (i=0; i<numTemplateUnits; i++) {
                    title = rowAttributes.getTitle(i);
                    if ((title.getUnitId() === attrId) && (title.getFormId() === pointFormId))
                    {
                        this.columnIndices["Point"] = i;
                        this.pointColumnIndex = i;
                    }
                }
                this.enablePoint = this.pointColumnIndex != -1;
                return this.enablePoint;
            },
            findPointPositionAttribute:function findPointPositionAttribute(){
                this.enablePoint = false;
             
                var rowAttributes = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles(),
                    numTemplateUnits = rowAttributes.size(),                
                    pointAttrId = this.wpPoint,
                    i, id;
                
                //search for the column that has lat and long information, based on the column header                
                for (i=0; i<numTemplateUnits; i++) {
                    
                    title = rowAttributes.getTitle(i).getUnitId(); 
                    if (id === pointAttrId)
                    {
                        this.columnIndices["Point"] = i;
                        this.pointColumnIndex = i;
                    }
                    if(id === this.wpLookupAttId){
                        this.lookupColumnIndex = i;
                    }
                }
                this.enablePoint = this.pointColumnIndex != -1;
                return this.enablePoint;
            },
            
            findAreasColumnPosition:function findAreasColumnPosition() {
                var rowAttributes = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles(),
                    numTemplateUnits = rowAttributes.size(),                
                    i, id, title;
                
                //search for the column that has the areas attribute / attribute form id
                for (i=0; i<numTemplateUnits; i++) {
                  
                    //if the wpAreasColumnType is zero, then user selected Attribute Form
                    //else the user selected Attribute
                    title = rowAttributes.getTitle(i);
                    id = ((this.wpAreasColumnType === "0")? title.getUnitId() : title.getFormId()); 
                    
                    if (id === this.wpAreasAttId)
                    {
                       this.shapePosition = i; 
                       return  true;
                    }
                }
                
                return false;
            },
            
            columnIndices:{},
            infoWindow:null,
            geoLists:null,
            getGeoList:function getGeoList(columnIndex)
            {
                if (!this.geoLists)
                {
                    this.geoLists = {};
                }
                if (!this.geoLists.hasOwnProperty(columnIndex))
                {
                    this.geoLists[columnIndex]=[];
                }
                return this.geoLists[columnIndex];
            },
            checkLookUpAttributeInSecondaryDP:function checkLookUpAttributeInSecondaryDP() {
                     
                        var rowAttributes =  this.getMapModel(SECONDARY_DATA_PROVIDER).getRowTitles(),
                            numTemplateUnits = rowAttributes.size();
                        
                        
                        //search for the look up attribute in the secondary data provider
                        for (i=0; i<numTemplateUnits; i++) {
                            
                            if(rowAttributes.getTitle(i).getUnitId() === this.wpLookupAttId)                            
                               return true;
                    
                        }
                        
                        return false;
            },
            _affinityLines : null,   
            DEFAULT_LINE_COLOR : 0xff0000,        
            drawAffinityLinesUsingSecondaryDataProvider: function drawAffinityLinesUsingSecondaryDataProvider()
            {               
                //if we do not have a secondary data model then you cannot connect the markers
                //so return
                var secModel = this.getMapModel(SECONDARY_DATA_PROVIDER);
                if(!secModel)            
                {                    
                    mstrmojo.alert("Secondary data provider could not be found. In order to see the Affinity Lines, please reset the secondary data provider in the design mode.",null,"Affinity Lines Error");
                    return;
                }
               
                //retrieve the attribute column indexes of the secondary data provider
               
                if(this.findSecondaryDPAttrColIndexes() === -1) {
                    return;
                }
                                
                if(this._useAttribute && !this.checkLookUpAttributeInSecondaryDP())
                {
                  mstrmojo.alert("Lookup Attribute must be present in the affinity data provider.",null,"Affinity Lines Error");
                  return;
                }
                
                //check if at least one metric is present or not
                var sourceAttrElementID, destAttrElementID,
                    lineColor, lineThickness, secondMetricIndex, cell, polyline,
                    maxLineThickness = this.wpMaxLineThickness,
                    rowCount = secModel.getTotalRows() ;
                
                if(secModel.getColTitles().size() === 0)
                {
                  mstrmojo.alert("No Metric is present on the secondary data provider.",null,"Affinity Lines Error");
                  return;
                }
                
                secondMetricIndex = this.findSecondaryDPSecondMetricIndex();    
                   
                //compute the max metric value of the first metric 
                this.computeSecondaryDPMetricMax(0);
                       
                //retrieve data
                                             
                //iterate over each row of secondary data and connect the markers
                this._affinityLines = new Object();

                for (rowIndex = 0; rowIndex< rowCount ; rowIndex++)
                {                
                    var rowHeaderElements = secModel.getRowHeaders(rowIndex);
                          
                    var firstAttrElementHeader = rowHeaderElements.getHeader(this.secondaryDPFirstAttrColIndex);                    
                    var secondAttrElementHeader = rowHeaderElements.getHeader(this.secondaryDPSecondAttrColIndex);                
    
                    //get the source and destination attribute element id for this row
                    sourceAttrElementID = this.getElementIdWithoutAttributeID(firstAttrElementHeader.getElementId());
                    destAttrElementID = this.getElementIdWithoutAttributeID(secondAttrElementHeader.getElementId());
                       
                    if(!this._markerElementIDs[sourceAttrElementID] || !this._markerElementIDs[destAttrElementID]){
                        continue;
                    }
                                       
                    // Polyline overlay
                    //retrieve the threshold color if second metric is present and threshold is defined on it
                    if(secondMetricIndex != -1) {                       
                        lineColor = secModel.getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("#FF0000");
                    } else { 
                        lineColor = "#FF0000";  //default color
                    }
                       
                    //compute the line thickness
                       
                    cell = secModel.getMetricValue(rowIndex,0); 
                            
                    if (cell.getValue())
                    {
                        metricCellValue = parseFloat(!cell.getRawValue()?this.stripNumberFormat(cell.getValue()):cell.getRawValue());
                        lineThickness = (metricCellValue * maxLineThickness)/this.secondaryDPMetricMaxVal[0]['max'];
                    }
                    else
                        lineThickness = 1;
                                
                    polyline = new google.maps.Polyline({
                                        path: [this._markerElementIDs[sourceAttrElementID],
                                               this._markerElementIDs[destAttrElementID]],
                                        geodesic : (this.wpDrawArcsLines ==="Arcs"),
                                        strokeColor: lineColor,
                                        strokeOpacity: 1.0,
                                        strokeWeight: lineThickness}
                    );
                       
                    this._affinityLines[sourceAttrElementID + destAttrElementID] = polyline;
                    polyline.setMap(this.map);;             
                       
                }
            },
            _animationSourceMarkerLines : null,
            _animationMarkers : null,
            _affinityAnimationFinished : false,
            _currentAffinityInterval : 0,
            NO_OF_POINTS : 20,
            _affinityGlow : false,
            _selectedAffinityMarkers : null,
            startAffinityLinesAnimation: function startAffinityLinesAnimation(sourceMarkerIds)
            {
                //if we do not have a secondary data model then you cannot connect the markers
                //so return
                var secModel = this.getMapModel(SECONDARY_DATA_PROVIDER);
                if(!secModel)            
                {
                    mstrmojo.alert("Secondary data provider could not be found. In order to see the Affinity Lines, please reset the secondary data provider in the design mode.",null,"Affinity Lines Error");
                    return;
                }
                
                //retrieve the attribute column indexes of the secondary data provider
                
                if(this.findSecondaryDPAttrColIndexes() === -1){
                    return;
                }
                
                var secondMetricIndex ,
                    sourceAttrElementID, destAttrElementID,
                    polyline, option, i,  arr, marker, len,
                    rowCount = secModel.getTotalRows();
           
                if(secModel.getColTitles().size() === 0)
                {
                 mstrmojo.alert("No Metric is present on the secondary data provider.",null,"Affinity Lines Error");
                 return;
                }
                
                secondMetricIndex = this.findSecondaryDPSecondMetricIndex();    
                
                //compute the max metric value of the first metric 
                this.computeSecondaryDPMetricMax(0);
                    
                //retrieve data
                           
                //iterate over each row of secondary data and connect the markers
                if(!this._animationSourceMarkerLines) {
                    this._animationSourceMarkerLines = [];
                }
                
                //remove all the previous marker lines
                
                len = this._animationSourceMarkerLines.length;
                for(i = len; i >0; i--) {
                       this._animationSourceMarkerLines.pop();
                }
                    
                for (rowIndex = 0; rowIndex< rowCount; rowIndex++)
                {                
                    var rowHeaderElements = secModel.getRowHeaders(rowIndex);
                       
                    var firstAttrElementHeader = rowHeaderElements.getHeader(this.secondaryDPFirstAttrColIndex);                    
                    var secondAttrElementHeader = rowHeaderElements.getHeader(this.secondaryDPSecondAttrColIndex);                

                    //get the source and destination attribute element id for this row
                    sourceAttrElementID = this.getElementIdWithoutAttributeID(firstAttrElementHeader.getElementId());
                    destAttrElementID = this.getElementIdWithoutAttributeID(secondAttrElementHeader.getElementId());
                    
                    if(!sourceMarkerIds[sourceAttrElementID] || !this._markerElementIDs[destAttrElementID])
                    {
                        if(this._affinityLines[sourceAttrElementID + destAttrElementID] != null)
                        {
                            //dim the remaining marker lines not originating from this source marker id
                            polyline = this._affinityLines[sourceAttrElementID + destAttrElementID];
                            polyline.setMap(null);               //remove this line from the map                           
                        }
                        continue;
                    }
                    
                    polyline = this._affinityLines[sourceAttrElementID + destAttrElementID];
                    
                    polyline.strokeOpacity = 1;
                    polyline.setMap(this.map);   //make this line visible
                    
                    if(this.wpDrawArcsLines === "Arcs")
                        this._animationSourceMarkerLines[this._animationSourceMarkerLines.length] = this.findPointsOnArc(this._markerElementIDs[sourceAttrElementID], this._markerElementIDs[destAttrElementID]);
                    else                
                        this._animationSourceMarkerLines[this._animationSourceMarkerLines.length] = this.findPointsOnLine(this._markerElementIDs[sourceAttrElementID], this._markerElementIDs[destAttrElementID]);                
                }
                
                if(!this._animationMarkers)
                    this._animationMarkers = [];
                
                //remove all the previous glow marker
                len = this._animationMarkers.length;
                for(i = len; i >0; i--)
                       this._animationMarkers.pop();
                    
                this._affinityAnimationFinished = true;
                
                if(this._animationSourceMarkerLines.length === 0) {
                    return;
                }
                    
                //create the glow markers
                
                len = this._animationSourceMarkerLines.length;
                for(i = 0 ; i < len; i++)
                {   
                    arr  = this._animationSourceMarkerLines[i];  //retrieve the LatLng              
                    marker = this.createAffinityAnimationMarker(arr[0]);                
                    this._animationMarkers[i] = marker;
                }             
                
                this._currentAffinityInterval = 0;            
                this.doAffinityAnimation();
                
            },

            clearAffinityAnimationObjects: function clearAffinityAnimationObjects()
            {
                //remove any animation markers if present    
                if (this._animationMarkers) {
                    var len = this._animationMarkers.length;
                    
                    for (i = 0; i < len; i++) {
                        this._animationMarkers[i].setMap(null);
                    }
                    
                    for (i = len; i > 0; i--) 
                        this._animationMarkers.pop();
                }    
                    
                this._selectedAffinityMarkers = null;
                   
                this._affinityAnimationFinished = false;
            },
            
            handleAffinityAnimationMouseClick: function handleAffinityAnimationMouseClick(marker, event)
            {
                if (!marker) return;
                
                if(this._affinityAnimationFinished)
                { //clear the animation related objects of the previously selected markers
                    this.clearAffinityAnimationObjects();
                }
                
                var ctrlKey = event.ctrlKey;
                
                if (!this._selectedAffinityMarkers) {
                    this._selectedAffinityMarkers = new Object();                
                }
                    
                if (!ctrlKey)  //control key not selected
                {   
                    this._selectedAffinityMarkers[marker.attributes.id] = marker;                
                    marker.isSelected = true;
                        
                    this.handleAffinityAnimationKeyUp();
                } else if (this._selectedAffinityMarkers.hasOwnProperty(marker.attributes.id)) { //unselect the selected marker
                    
                    marker.isSelected = false;
                    id = marker.attributes.id;
                    delete this._selectedAffinityMarkers[marker.attributes.id];
                    
                } else {                //add this marker to the current selection
                    this._selectedAffinityMarkers[marker.attributes.id] = marker;                
                    marker.isSelected = true;                
                }        
            },
            
            handleAffinityAnimationKeyUp: function handleAffinityAnimationKeyUp()
            {
                if(!this._affinityAnimationFinished  && this._affinityGlow)
                {
                    //start the animation here if the user has clicked on any markers
                    
                    var sourceId = {}, id, marker;
                    for(id in this._selectedAffinityMarkers)
                    {
                        sourceId[this.getElementIdWithoutAttributeID(id)] = id;                                    
                    }
                    
                    //start the animation
                    this.startAffinityLinesAnimation(sourceId);
                }
            },
                    
            moveAffinityAnimationMarker: function moveAffinityAnimationMarker()
            {
                var i, len, arr, marker, 
                    interval = this._currentAffinityInterval; 
                for(i = 0 , len = this._animationSourceMarkerLines.length; i < len; i++)
                {                      
                    arr = this._animationSourceMarkerLines[i];
                    marker = this._animationMarkers[i];
                    
                    if (interval <this.NO_OF_POINTS) 
                    {
                        marker.setPosition(arr[interval]);
                    }
                    //add the glow marker only once for each line originating from the source marker 
                    if (interval === 0) 
                    {
                        marker.setMap(this.map);
                    }
                    
                }
                
                if (interval === this.NO_OF_POINTS - 1) {
                    for (i = 0, len = this._animationMarkers.length; i < len; i++) {                    
                        this._animationMarkers[i].setMap(null);  //remove the glow marker from the map
                    }
                    clearTimeout(this._glowTimer); // we are done with animation now remove the timer
                }
                else
                {
                    this._currentAffinityInterval++;
                    this.doAffinityAnimation();                
                }
                
            },
            
            
            doAffinityAnimation : function doAffinityAnimation()
            {
                var that = this;
                this._glowTimer = setTimeout(function(){that.moveAffinityAnimationMarker()}, 50);  //start the timer again    
            },
             
            createAffinityAnimationMarker: function createAffinityAnimationMarker(latLng)
            {             
                        
                var markerImage = new google.maps.MarkerImage("images/glow_marker.png",                                
                                                              null,null,null,                                            
                                                              new google.maps.Size(10,8)),                                        
                    marker = new google.maps.Marker({position: latLng, icon:markerImage, map:this.map});
                return marker;
            },

            findPointsOnArc :  function findPointsOnArc(from , to)
            {
                var nPoints  = this.NO_OF_POINTS;
                var coords  = [];
                var  radToDeg  = 180.0 / Math.PI; 
                
                var lat1  = from.lat()/ radToDeg;
                var lng1  = from.lng() / radToDeg;
                var lat2  = to.lat() / radToDeg;
                var lng2  = to.lng() / radToDeg;
                
                var degree  = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin(lat1-lat2)/2), 2) + 
                    Math.cos(lat1)* Math.cos(lat2)* Math.pow((Math.sin(lng1-lng2)/2), 2)));
                var i;
                for (i = 0; i <= this.NO_OF_POINTS; i++) 
                {
                    var f =  Number(i/nPoints);
                    var a = Math.sin((1-f) * degree) / Math.sin(degree);
                    var b = Math.sin(f * degree) / Math.sin(degree);
                    var x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
                    var y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
                    var z = a * Math.sin(lat1) + b * Math.sin(lat2);
                    var rLat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
                    var rLng = Math.atan2(y, x);
                    
                    coords[i] = new google.maps.LatLng(rLat * radToDeg,rLng*radToDeg);
                }
                
                return coords;
            },
            
            findPointsOnLine: function findPointsOnLine(from, to)
            {
                var m = Infinity; //default value parallel to y-axis. slope of the line
                var c ; //y-intercept
                var pts = [];
                var interval;
                var lat ;
                var lng ;
                var i;
                //calculate slope of the line forming the points from and to
                if(to.lng() - from.lng() != 0)
                {
                    m = (to.lat() - from.lat())/(to.lng() - from.lng());
                    c = from.lat() - m*from.lng();  //calculate the y-intercept
                    interval = (to.lng() - from.lng())/this.NO_OF_POINTS;          
                }
                else
                {              
                    interval = (to.lat() - from.lat())/this.NO_OF_POINTS;              
                }
                
                //now compute the points on the line
                
                for(i = 0 ; i <= this.NO_OF_POINTS; i++){
                    if(m === Infinity)
                    {
                        lng = from.lng();
                        lat = from.lat() + interval * i;
                    }
                    else
                    {
                        lng = from.lng() + interval * i;
                        lat = m*lng + c;
                    }
                    
                    pts[i] = new google.maps.LatLng(lat,lng);
                }                    
                return pts;
            },

           
            getElementIdWithoutAttributeID : function getElementIdWithoutAttributeID(elementID)
            {
                var newElementID  = "";
                var pos = 0;
                var i;
                for(i = 0 ; i < elementID.length; i++)
                {
                    if(elementID.charAt(i) === ':')
                        pos++;
                   
                    if(pos === 1)
                        continue;
                   
                    newElementID = newElementID + elementID.charAt(i);   
                }            
                return newElementID;            
            },
          
            secondaryDPFirstAttrColIndex:-1,  //secondary data provider's first attribute column index
            secondaryDPSecondAttrColIndex:-1,  //secondary data provider's second attribute column index
               
            findSecondaryDPAttrColIndexes:function findSecondaryDPAttrColIndexes() {                
                
                var rowAttributes =  this.getMapModel(SECONDARY_DATA_PROVIDER).getRowTitles(),                   
                    attrId = rowAttributes.getTitle(0).getUnitId(),  //get the attribute id of the first element
                    size = rowAttributes.size(), i;
                    
                this.secondaryDPFirstAttrColIndex = 0;  
                
                for (i = 1; i< size; i++) {
                    
                    if (rowAttributes.getTitle(i).getUnitId()!= attrId)
                    {
                      //we found the second attribute's column index
                      this.secondaryDPSecondAttrColIndex = i;
                      break;   
                    }
                }
                   
                return this.secondaryDPSecondAttrColIndex;
            },
            
            findSecondaryDPSecondMetricIndex:function findSecondaryDPSecondMetricIndex() {                
                            
                var colAttributes = this.getMapModel(SECONDARY_DATA_PROVIDER).getColTitles().getTitle(0).getHeaderValues();      
                return (colAttributes.length > 1)? 1 : -1;
            },
            
            _markerElementIDs : null,            
            maxValue:NaN,
            validBubble:false,
            idMarkerMap:null,            
            addMarker:function addMarker(markerList,latLng,attributes,simpleHTML,geoPosition,cell,idkey,oldMarker)
            {
                var marker;
                var colorString;
                var dojoColor;
 
                if (this.wpMarkerType === "1")
                {
                    //marker
                     
                    if (this._applyThreshold) 
                    {
                        //first check the threshold image
                        var type = cell.getThresholdType();
                        
                        switch (type) {
                            case this.enumText:
                            case this.enumQuickSymbol:
                                 
                colorString = this.getMapModel(PRIMARY_DATA_PROVIDER).getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("#FFFFFF");
                                dojoColor = new dojo.Color(colorString);
                                dojoColor.a = .75;
                                marker = new mstrmojo.gmaps.TextMarker({
                                    position:latLng,
                                    clickable:true,
                                    //labelText:this.getQuickSymbol(cell.v),
                                    labelText:cell.getValue(),
                                    attributes:attributes,
                                    mapWidget:this,
                                    geoPosition:geoPosition,
                                    simpleHTML:simpleHTML,
                                    map:this.map
                                });
                                
                                break;
                            case this.enumImage:
                            case this.enumUrl:
                                
                                var imageString = this.getMapModel(PRIMARY_DATA_PROVIDER).getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("no");
                                var markerImage = new google.maps.MarkerImage(imageString,
                                        //new google.maps.Size(100,100),
                                        //new google.maps.Point(0,0),
                                        null,null,null,
                                        //new google.maps.Point(0,0),
                                        new google.maps.Size(23,28));
                                //markerImage.setMap(map);
                                
                                marker = new google.maps.Marker({
                                    position: latLng,
                                    icon:markerImage,
                                    attributes:attributes,
                                    mapWidget:this,
                                    geoPosition:geoPosition,
                                    simpleHTML:simpleHTML,
                                    map:this.map
                                });
                                break;
                            case  this.enumNumber:
                            default:
                                //set the threshold color                                
                                colorString = this.getMapModel(PRIMARY_DATA_PROVIDER).getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue(this.defaultThresholdColor);
                                                
                                dojoColor = new dojo.Color(colorString);
                                dojoColor.a = .75;
                                var radius=DEFAULT_BUBBLE_SIZE;
                                 
                                marker = new mstrmojo.gmaps.CircleMarker({
                                    center:latLng,
                                    clickable: true,
                                    fillColor:dojoColor,
                                    strokeColor:this.regularStroke,
                                    selectedColor:this.selectedStroke,
                                    radius:radius,
                                    attributes:attributes,
                                    mapWidget:this,
                                    geoPosition:geoPosition,
                                    simpleHTML:simpleHTML,
                                    map:this.map
                                });
                                break;
                            
                        }
                    } else {
                        
                        var markerImage = new google.maps.MarkerImage(this.wpMarkerStyle,                                
                                null,null,null,                                
                                new google.maps.Size(23,28));
                        var hiliImage = new google.maps.MarkerImage(this.wpMarkerStyle,
                                null,null,null,new google.maps.Size(46,56));
                        marker = new google.maps.Marker({
                            position: latLng,
                            icon:markerImage,
                            attributes:attributes,
                            mapWidget:this,
                            geoPosition:geoPosition,
                            simpleHTML:simpleHTML,
                            image:markerImage,
                            hili:hiliImage,
                            map:this.map
                        });
                    }
                }  else if (this.wpMarkerType === "2") {
                    //bubble
                    //set the threshold color
                    if (this._applyThreshold) {                  
                        colorString = this.getMapModel(PRIMARY_DATA_PROVIDER).getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue(this.defaultThresholdColor);
                    } else {
                        colorString = this.defaultThresholdColor;
                    }
                    dojoColor = new dojo.Color(colorString);
                    dojoColor.a = .75;
                    var radius= DEFAULT_BUBBLE_SIZE;
                    
                    var type=cell.getThresholdType();
                    var cellNumber;
					
                    if (!type || type === this.enumNumber) {
                        cellNumber = parseFloat(!cell.getRawValue()? this.stripNumberFormat(cell.getValue()):cell.getRawValue());
                    } else {
                        cellNumber = cell.getRawValue();
                    }
                         
                    if (this.validBubble) {
                        radius = this.calculateBubbleRadius(cellNumber);						
                    }
                    
                    if (oldMarker) {
                        if (oldMarker instanceof mstrmojo.gmaps.CircleMarker) {
                            oldMarker.set("fillColor",dojoColor);
                            oldMarker.set("radius",radius);
                        }
                        marker = oldMarker;                 
                    } else {
                        marker = new mstrmojo.gmaps.CircleMarker({
                            center:latLng,
                            clickable: true,
                            fillColor:dojoColor,
                            strokeColor:this.regularStroke,
                            selectedColor:this.selectedStroke,
                            radius:radius,
                            attributes:attributes,
                            mapWidget:this,
                            geoPosition:geoPosition,
                            simpleHTML:simpleHTML,
                            map:this.map
                        });
                    }
                } else if (this.isDensityMap()) {
                    this.addDensity(markerList,latLng,attributes,simpleHTML,geoPosition,cell,idkey,oldMarker);
                    return;
                }
                marker.attributes = attributes;
                
                google.maps.event.addListener(marker,'mouseover', function () {
                    if (this.hili) {
                        this.setIcon(this.hili);
                    }
                });
                google.maps.event.addListener(marker,'mouseout', function () {
                    if (!this.isSelected && this.image) {
                        this.setIcon(this.image);
                    }
                });
                
                google.maps.event.addListener(marker, 'click', function(event) {
                    var mapWidget = this.mapWidget;
                    if (mapWidget._affinityGlow)                        
                    {
                        mapWidget.handleAffinityAnimationMouseClick(this, event);
                    } else if (mapWidget.enableClickSelect) {
                        mapWidget.handleSelection(this,event);
                    } else if (mapWidget.enablePopup) {
                        mapWidget.showInfoWindow(this);
                    }
                });
                
                markerList.push(marker);
                this.bounds.extend(latLng);
                this.idMarkerMap[idkey]= marker;
                
            },
            
            densityLocations:null,
            densityLayer:null,
            isDensityMap:function isDensityMap(){
                return (this.wpMarkerType == "4");
            },
            addDensity:function addDensity(markerList,latLng,attributes,simpleHTML,geoPosition,cell,idkey,oldMarker)
            {
                if (this.densityLocations === null) {
                    this.densityLocations = [];
                }
                this.densityLocations.push({
                    position: latLng,
                    attributes:attributes,
                    geoPosition:geoPosition,
                    simpleHTML:simpleHTML
                });
                this.bounds.extend(latLng);
            },
            
            populateBubbleVariables:function populateBubbleVariables() 
            {
                if (this.wpMarkerType !== "2" || this.enableShape) 
                {
                    return;
                }
                
                this.populateMinMax(this.selectedMetricIndex);
                
                var minMaxObject = this.minMaxMap[this.selectedMetricIndex];
                
                this.maxValue = minMaxObject["max"];
                this.validBubble = (this.maxValue != Infinity);
            },
            
            isTotal:function isTotalCell(nextColumnIndex,rowIndex)
            {              
                var rowHeaderElements = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowHeaders(rowIndex),
                    nextCellElement = rowHeaderElements.getHeader(nextColumnIndex),
                    nextElementId;
                
                if (!nextCellElement) {
                    return false;
                }                                     
                nextElementId = nextCellElement.getElementId();
                if (nextElementId.indexOf('DB:') === 0)
                {//id starts with DB: is a subtotal element;
                    return true;
                }
                return false;
            },
           
            createLatLngMarker:function createLatLngMarker() {
                if (!this.map) {
                    return;
                }

                this.defaultInfoWindowHTML = this.getDefaultInfoWindowTemplate();
                if (this.infoWindowHTML === "") {
                    this.infoWindowHTML = this.defaultInfoWindowHTML;
                }
                
                var markerList = this.getGeoList(this.latColumnIndex);
                markerList.length = 0;
                //retrieve data
             
                var priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    rowAttributes = priModel.getRowTitles(),
                    colCount = priModel.getTotalCols(),
                    colHeaderRowCount = priModel.getTotalColHeaderRows(),
                    rowHeaderElements,
                    rowCount = priModel.getTotalRows(),                               
                    strippedElementID,
                    attrId,
                    nextElementIndex = Math.max(this.latColumnIndex,this.longColumnIndex) + 1,
                    marker,
                    latitudeTitleIndex,
                    latitude,
                    latitudeId,
                    latitudeElement,
                    longitudeTitleIndex,
                    longitude,
                    longitudeId,
                    longitudeElement,
                    errTitle, err,
                    idkey,
                    s="";                     
                
                this._markerElementIDs = new Object();
                //we only care about latitude and longitude
                //find the metric column indices
                this.populateBubbleVariables();
             
                for (rowIndex=0; rowIndex < rowCount;rowIndex++)
                {                   
                    //get the lat
                    rowHeaderElements = priModel.getRowHeaders(rowIndex);
                    latitudeElement = rowHeaderElements.getHeader(this.latColumnIndex);
                    if (!latitudeElement || latitudeElement.getElementIndex() < 0) {
                        continue;
                    }
                   
                    latitudeTitleIndex = this.latColumnIndex;
                    latitude = this.stripNumberFormat(latitudeElement.getName());
                    latitudeId = latitudeElement.getElementId();
                    if (latitudeId.indexOf('DB:') === 0)
                    {//id starts with DB: is a subtotal element;
                        continue;
                    }
                    
                    //get the long
                    longitudeElement = rowHeaderElements.getHeader(this.longColumnIndex);
                    if (!longitudeElement || longitudeElement.getElementIndex() < 0) {
                        continue;
                    }
                    
                    longitudeTitleIndex = this.longColumnIndex;
                    longitude = this.stripNumberFormat(longitudeElement.getName());
                    longitudeId = longitudeElement.getElementId();
                    if (longitudeId.indexOf('DB:') === 0)
                    {//id starts with DB: is a subtotal element;
                        continue;
                    }
                    
                    if (isNaN(latitude))
                    {
                        errTitle=mstrmojo.desc(8185,'Invalid Format');
                        err=mstrmojo.desc(8187,'Invalid Format in Latitude Attribute(form)')+' '+ priModel.getRowTitles().getTitle(latitudeTitleIndex).getName();
                        mstrmojo.alert(err,null,errTitle);
                        return;
                    }
                        
                    if (isNaN(longitude))
                    {
                        errTitle=mstrmojo.desc(8185,'Invalid Format');
                        err=mstrmojo.desc(8188,'Invalid Format in Longitude Attribute(form)')+' '+ priModel.getRowTitles().getTitle(longitudeTitleIndex).getName();
                        mstrmojo.alert(err,null,errTitle);
                        return;
                    }
                    
                    
                    if (this._useAttribute && !this.isAggregate) {
                        idkey = rowIndex;
                    } else if (latitudeId === longitudeId){
                        idkey = latitudeId;
                    } else {
                        idkey = latitudeId+"|"+longitudeId;
                    }
                    
                    marker = null;
                    if (this.idMarkerMap[idkey]) {
                        if ((this.wpMarkerType === "2")  && this.isTotal(nextElementIndex,rowIndex)) {
                            marker = this.idMarkerMap[idkey];
                        } else {
                            continue;
                        }
                    }
                    attrId = latitudeElement.getElementId();
                    
                    if(this._useAttribute && this.lookupColumnIndex > 0)
                        strippedElementID = this.getElementIdWithoutAttributeID(rowHeaderElements.getHeader(this.lookupColumnIndex).getElementId());                    
                    else
                        strippedElementID = this.getElementIdWithoutAttributeID(attrId);

                    
                    //first create attributes/value pair
                    var attributes = {}, i, titleIndex, elementValue;
                    for (i=0;i<rowHeaderElements.size();i++) {
                        
                        titleIndex = i;
                        
                        elementValue = rowHeaderElements.getHeader(titleIndex).getName();
                        attributes[this.replaceSpace(rowAttributes.getTitle(titleIndex).getName())]=elementValue;
                    }
                    //next create metric/value pair
                   
                    var columnHeaderName,
                        columnHeaderColumnIndex,
                        columnHeaderRowIndex;
                    for (columnHeaderColumnIndex=0;columnHeaderColumnIndex<colCount ;columnHeaderColumnIndex++) {
                        columnHeaderName = null;
                        for (columnHeaderRowIndex=0;columnHeaderRowIndex<colHeaderRowCount ;columnHeaderRowIndex++) {
                            var cellElement = priModel.getColHeaders(columnHeaderRowIndex).getHeader(columnHeaderColumnIndex),                      
                                cellName = cellElement.getName();
                            
                            if (!columnHeaderName){
                                columnHeaderName = cellName;
                            } else {
                                columnHeaderName += " "+cellName;
                            }
                            
                        }
                        
                        var values = priModel.getMetricValue(rowIndex,columnHeaderColumnIndex),
                            thresholdType = values.getThresholdType();
                        
                        if (!thresholdType || thresholdType === this.enumNumber) {
                            attributes[this.replaceSpace(columnHeaderName)]=values.getValue();
                        } else {
                            attributes[this.replaceSpace(columnHeaderName)]=values.getRawValue();
                        }
                            
                        if (rowIndex === 0) {
                            s+="<b>"+columnHeaderName+"</b> :${"+this.replaceSpace(columnHeaderName)+"}<br />";
                        }
                    }
                    attributes.rowIndex = rowIndex;
                    attributes.geoIndex = latitudeElement.getElementIndex();
                    attributes.id = attrId;
                    
					var cell = priModel.getMetricValue(rowIndex,this.selectedMetricIndex);
                    
                    var latLng = new google.maps.LatLng(latitude,longitude);
                    
                    //cache the LatLng of this attribute element , the key is the stripped element id without the attribute part
                    this._markerElementIDs[strippedElementID] = latLng; 

                    s = this.createSimpleInfoHTML(rowIndex, attributes);
                    
                    
                    this.addMarker(markerList,latLng,attributes,s,[this.latColumnIndex,this.longColumnIndex],cell,idkey,marker);
                }
                this.centerMap();        
                
                if (this.isDensityMap()) {
                    this.createDensityMap();
                }
                        
            },
            cleanDensityMap:function cleanDensityMap() {
                this.densityLayer.setMap(null);
                this.dnesityLayer = null;
            },
            createDensityMap:function createDensityMap() {
                if (this.densityLayer) {
                    this.cleanDensityMap();
                }
                
                this.densityLayer = new mstrmojo.gmaps.DensityOverlay({
                    width:this.width,
                    height:this.height,
                    map:this.map,
                    mapWidget:this,
                    themeId:this.wpDensityTheme,
                    //bounds:this.map.getBounds(),
                    bounds:this.bounds,
                    locations:this.densityLocations
                });
            },
            createPointMarker:function createPointMarker() {
                if (!this.map) {
                    return;
                }
                this.defaultInfoWindowHTML = this.getDefaultInfoWindowTemplate();
                this.infoWindowHTML = this.defaultInfoWindowHTML;
                
                var markerList = this.getGeoList(this.pointColumnIndex);
                markerList.length = 0;
                //retrieve data
             
                var priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    rowAttributes = priModel.getRowTitles(),
                    rowCount = priModel.getTotalRows(),
                    colCount = priModel.getTotalCols(),
                    colHeaderRowCount = priModel.getTotalColHeaderRows(),
                    s="",
                    marker,
                    leftParenIndex,rightParenIndex,coreString,
                    strippedElementID,
                    attrId,
                    rowHeaderElements,
                    pointElement,
                    pointTitleIndex,
                    point,
                    pointId,                    
                    leftParenIndex,
                    rightParenIndex,
                    elems,
                    errTitle,
                    err,                                    
                    longitude,
                    latitude,
                    columnHeaderName,
                    columnHeaderColumnIndex,
                    columnHeaderRowIndex;
                
                //clear graphics
                //we only care about latitude and longitude
                //find the metric column indices
                this.populateBubbleVariables();
                
                this._markerElementIDs = new Object();
                 
                for (rowIndex= 0 ; rowIndex < rowCount;rowIndex++)
                {
                    //get the point
                    rowHeaderElements = priModel.getRowHeaders(rowIndex);
                    pointElement = rowHeaderElements.getHeader(this.pointColumnIndex);
                    if (!pointElement || pointElement.getElementIndex() < 0) {
                        continue;
                    }
                    //var pointTitleIndex = pointElement.tui;
                    pointTitleIndex = this.pointColumnIndex;
                    point = pointElement.getName();
                    pointId = pointElement.getElementId();
                    
                    marker = null;
                    if (this.idMarkerMap[pointId]) {
                        if ((this.wpMarkerType === "2")  && this.isTotal(this.pointColumnIndex+1,rowIndex)) {
                            marker = this.idMarkerMap[pointId];
                        } else {
                            continue;
                        }
                    }
                    
                    if(this._useAttribute && this.lookupColumnIndex >= 0) {
                        attrId = rowHeaderElements.getHeader(this.lookupColumnIndex).getElementId();
                        strippedElementID = this.getElementIdWithoutAttributeID(attrId);
                    }
                    else
                        strippedElementID = this.getElementIdWithoutAttributeID(pointId);
               
                    leftParenIndex = point.indexOf('(');
                    if (leftParenIndex < 0 ) {
                        continue;
                    }
                    rightParenIndex = point.indexOf(')',leftParenIndex);
                    if (rightParenIndex < 0 ) {
                        continue;
                    }
                    coreString = point.substring(leftParenIndex+1,rightParenIndex);
                    
                    elems = coreString.split(' ');
                    
                    if (!elems || elems.length != 2) 
                    {
                        errTitle=mstrmojo.desc(8185,'Invalid Format');
                        err=mstrmojo.desc(8186,'Invalid Format in Point Attribute(form) ##, it should be (longitude latitude)');
                        err=err.replace(/##/,priModel.getRowTitles().getTitle(pointTitleIndex).getName());
                        mstrmojo.alert(err,null,errTitle);
                        return;
                    }
                    
                    longitude = this.stripNumberFormat(elems[0]);
                    latitude = this.stripNumberFormat(elems[1]);
                    
                    if (isNaN(latitude) || isNaN(longitude))
                    {
                        errTitle=mstrmojo.desc(8185,'Invalid Format');
                        err=mstrmojo.desc(8186,'Invalid Format in Point Attribute(form) ##, it should be (longitude latitude)');
                        err=err.replace(/##/,priModel.getRowTitles().getTitle(pointTitleIndex).getName());
                        mstrmojo.alert(err,null,errTitle);
                        return;
                    }
                    
                    var attributes = {}, i, titleIndex, elementValue;
                    //first create attributes/value pair
                    
                    for (i=0;i<rowHeaderElements.size();i++) {
                      
                        titleIndex = i;
                        elementValue = rowHeaderElements.getHeader(titleIndex).getName();
                        attributes[this.replaceSpace(rowAttributes.getTitle(titleIndex).getName())]=elementValue;
                    }
                    if(this._useAttribute)
                        attributes["id"] = attrId;                
                    else
                        attributes["id"] = pointId;
                    //next create metric/value pair
                                     
                    for (columnHeaderColumnIndex=0;columnHeaderColumnIndex < colCount ;columnHeaderColumnIndex++) {
                        columnHeaderName = null;
                        for (columnHeaderRowIndex=0;columnHeaderRowIndex < colHeaderRowCount ;columnHeaderRowIndex++) {
                            var cellElement = priModel.getColHeaders(columnHeaderRowIndex).getHeader(columnHeaderColumnIndex),                            
                                cellName = cellElement.getName();
                            
                            if (!columnHeaderName){
                                columnHeaderName = cellName;
                            } else {
                                columnHeaderName += " "+cellName;
                            }                            
                        }
                        
                        var values =  priModel.getMetricValue(rowIndex,columnHeaderColumnIndex),
                            thresholdType = values.getThresholdType();
                        
                        if (!thresholdType || thresholdType === this.enumNumber) {
                            attributes[this.replaceSpace(columnHeaderName)]=values.getValue();
                        } else {
                            attributes[this.replaceSpace(columnHeaderName)]=values.getRawValue();
                        }
                        if (rowIndex === 0) {
                            s+="<b>"+columnHeaderName+"</b> :${"+this.replaceSpace(columnHeaderName)+"}<br />";
                        }
                    }
                    attributes["rowIndex"]=rowIndex;
                    attributes["geoIndex"]=pointElement.getElementIndex();
                    var cell = priModel.getMetricValue(rowIndex,this.selectedMetricIndex);
                    var latLng = new google.maps.LatLng(latitude,longitude);
                    
                    s = this.createSimpleInfoHTML(rowIndex, attributes);
                    
                    this.addMarker(markerList,latLng,attributes,s,this.pointColumnIndex,cell,pointId,marker);        
                    
                    //cache the LatLng of this attribute element , the key is the stripped element id without the attribute part
                this._markerElementIDs[strippedElementID] = latLng; 
                    
                }
                this.centerMap();        
            },
            
            
            minMaxMap:null,
            maxRadius:50,
            minRadius: 7,            
            bubbleMode:false,
            
            populateMinMax:function populateMinMax(metricColumnIndex) {
                if (!this.minMaxMap) {
                    this.minMaxMap = {}
                }
                //533002: disable mix max cache. 
                //if (this.minMaxMap.hasOwnProperty(metricColumnIndex))
                //    return;
                    
                var geoColumnIndices,
                    priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),                            
                    rowAttributes = priModel.getRowTitles(),
                    rowCount = priModel.getTotalRows(),    
                    rowIndex = 0,
                    minValue = Infinity,
                    maxValue = -Infinity,
                    latitudeElement,
                    latitudeTitleIndex,
                    latitude,
                    latitudeId,
                    longitudeElement,
                    longitudeTitleIndex,
                    longitude,
                    longitudeId,                    
                    pointElement,
                    pointTitleIndex,
                    point,
                    pointId,
                    leftParenIndex,
                    rightParenIndex,
                    elems,
                    errTitle,
                    err,
                    cell,
                    type,
                    cellNumber;
                    
                
                //calculate the min and max
                for (rowIndex=0;rowIndex < rowCount;rowIndex++){
                    var rowHeaderElements = priModel.getRowHeaders(rowIndex);
                    if (this.enableLatLng) {
                        latitudeElement = rowHeaderElements.getHeader(this.latColumnIndex);
                        if (!latitudeElement || latitudeElement.getElementIndex() < 0) {
                            continue;
                        }

                        latitudeTitleIndex = this.latColumnIndex;
                        latitude = this.stripNumberFormat(latitudeElement.getName());
                        latitudeId = latitudeElement.getElementId();
                        if (latitudeId.indexOf('DB:') === 0)
                        {//id starts with DB: is a subtotal element;
                            continue;
                        }
                        
                        //get the long
                        longitudeElement = rowHeaderElements.getHeader(this.longColumnIndex);
                        if (!longitudeElement || longitudeElement.getElementIndex() < 0) {
                            continue;
                        }
                        longitudeTitleIndex = this.longColumnIndex;
                        longitude = this.stripNumberFormat(longitudeElement.getName());
                        longitudeId = longitudeElement.getElementId();
                        if (longitudeId.indexOf('DB:') === 0)
                        {//id starts with DB: is a subtotal element;
                            continue;
                        }
                        
                        if (isNaN(latitude) || isNaN(longitude))
                        {
                            continue;
                        }
                    } else {
                            pointElement = rowHeaderElements.getHeader(this.pointColumnIndex);
                        if (!pointElement || pointElement.getElementIndex() < 0) {
                            continue;
                        }
                        //var pointTitleIndex = pointElement.tui;
                        pointTitleIndex = this.pointColumnIndex;
                        point = pointElement.getName();
                        pointId = pointElement.getElementId();
                        
                        if (pointId.indexOf('DB:') === 0) {
                            continue;
                        }
                        
                        leftParenIndex = point.indexOf('(');
                        if (leftParenIndex < 0 ) {
                            continue;
                        }
                        rightParenIndex = point.indexOf(')',leftParenIndex);
                        if (rightParenIndex < 0 ) {
                            continue;
                        }
                        coreString = point.substring(leftParenIndex+1,rightParenIndex);
                        //var elems = point.split(",");
                        elems = coreString.split(' ');
                        
                        if (!elems || elems.length != 2) 
                        {
                            continue;
                        }
                        latitude = this.stripNumberFormat(elems[0]);
                        longitude = this.stripNumberFormat(elems[1]);
                        if (isNaN(latitude) || isNaN(longitude))
                        {
                            continue;
                        }
                    }
                    
                    cell =  priModel.getMetricValue(rowIndex,metricColumnIndex);
                    type = cell.getThresholdType();
                    cellNumber;
                    if (!type || type===this.enumNumber){                        
                        cellNumber = parseFloat(!cell.getRawValue()?this.stripNumberFormat(cell.getValue()): cell.getRawValue());
                    } else {
                        cellNumber = cell.getRawValue();
                    }
                    maxValue = (cellNumber > maxValue) ? cellNumber : maxValue;
                    minValue = (cellNumber < minValue) ? cellNumber : minValue;
                    
                }
                this.minMaxMap[metricColumnIndex]= {"min":minValue,"max":maxValue};
                
            },
            
            secondaryDPMetricMaxVal : null,
            computeSecondaryDPMetricMax:function computeSecondaryDPMetricMax(metricColumnIndex) {
                if (!this.secondaryDPMetricMaxVal) {
                    this.secondaryDPMetricMaxVal = {}
                }
                if (this.secondaryDPMetricMaxVal.hasOwnProperty(metricColumnIndex))
                    return;
                
                var rowIndex = 0,                
                    maxValue = -Infinity,
                    secModel = this.getMapModel(SECONDARY_DATA_PROVIDER),
                    rowCount = secModel.getTotalRows(),
                    cell;
                
                //calculate the max
                for (rowIndex=0; rowIndex < rowCount; rowIndex++){
                 
                    cell = secModel.getMetricValue(rowIndex,metricColumnIndex);
                    
                    if (cell.getValue()){                        
                        var cellNumber = parseFloat(!cell.getRawValue()?this.stripNumberFormat(cell.getValue()):cell.getRawValue());
                         maxValue = (cellNumber > maxValue) ? cellNumber : maxValue;                         
                    }
                }
                this.secondaryDPMetricMaxVal[metricColumnIndex]= {"max":maxValue};
            },

            
            
            enableLatLng:false,
            enablePoint:false,
            enableBubble:false,
            enableShape:false,
            _useAttribute:false,
            _useLatlng:true,
            _useArea : false,           
            wpLat:null,
            wpLng:null,
            wpPoint:null,
            wpAttribute:null,
            wpMarkerType:"1",//1 marker, 2 bubble, 3 polygon 4 density map
            wpMarkerStyle:"images/balloonpp.png",
            _applyThreshold:false,
            _defaultView:null,
            wpDisPlayAffinityLines :0,
            wpDrawArcsLines :"Arcs",
            wpMaxLineThickness : 5,
            wpLookupAttId : null,
            wpAreasAttId : null,
            wpAreasColumnType : null, // whether the user chose attribute or attribute form for the areas mode
            wpAreasFusionTableXMLString : null,
            wpDensityTheme:null,
            wpSecondaryDPKey : null,
            
            getVisProps : function(gridParams){
                return this.model.vp;
            },
            isCanvasSupported:function isCanvasSupported(){
                  var elem = document.createElement('canvas');
                  return !!(elem.getContext && elem.getContext('2d'));
            },            
            loadWidgetProps:function loadWidgetProps(){
                var props = this.getVisProps(this.gridParams);

                if (!props) return false;
             
                var property = props.af;
                if (property)
                {
                    this._useAttribute = (property==="0");
                }
                property = props.gr;
                if (property)
                {
                    this._useLatlng = (property === "0");
                }
                if (!this._useAttribute)
                {
                    this.wpAttribute = props.ga;
                } 
                if (this._useLatlng)
                {
                    this.wpLat = props.flat;
                    this.wpLng = props.flong;
                } else {
                    this.wpPoint = props.fpt;
                }
                property = props.mtp;
                if (property)
                {
                    this.wpMarkerType = property;
                    if(this.wpMarkerType === "3")  //read properties related to areas
                    {
                        this.useArea = true;                        
                        this.wpAreasColumnType = props.af; // 0 means Use Attribute, 1 means Use Attribute Form
                        
                        this.wpAreasAttId = ((this.wpAreasColumnType === "0") ? props.aratt :props.aratf);
                        this.wpAreasFusionTableXMLString = props.aft;                       
                    }
                    else if (this.isDensityMap()) 
                    {
                        if (this.isCanvasSupported()) {
                            this.wpDensityTheme = props.dms | "1";
                        } else {
                            this.wpMarkerType = "1"; //force it to use markers
                        }
                    }
                    else
                    {
                        this.useArea = false;
                    }
                }
                property = props.mstyl;
                if (property)
                {
                    this.wpMarkerStyle = property;
                }
                property = props.at;
                if (property)
                {
                    this._applyThreshold = (property === "1")
                }
                //read the properties related to the Affinity lines
                property = props.da;
                
                if (property)
                {
                    this.wpDisPlayAffinityLines = property;
                    if(this.wpDisPlayAffinityLines != "0")
                    {
                        this.wpDrawArcsLines = props.dal;
                        this.wpMaxLineThickness = props.lwm;                        
                    }    
                }
                else{
                    this.wpDisPlayAffinityLines = "0";
                }
                
                property = props.dv;
                if (property)
                {
                    this._defaultView = property;
                }
                
                property = props.dm;
                if (property) 
                {
                    this.isAggregate = (property === "1");
                }
                
                property = props.mbs;
                if (property)
                {
                    this.maxRadius = parseInt(property)/2;
                }
                
                property = props.latt;
                if (property) 
                {
                    this.wpLookupAttId = property;
                }
                
                /*
                property = props.cmt;
                if (property)
                {
                    this._selectedMetricId = property;
                }
                */
                if (props && props.iwd) {
                    this.infoWindowHTML = unescape(props.iwd);
                }

                if (typeof(console) != undefined) {
                    console.log("finish loading widgetProps");
                }
            },
            
            mapTypeId:function mapTypeId(view) {
                var mapId;
                switch (view) {
                    case "1":
                        mapId = google.maps.MapTypeId.SATELLITE;
                        break;
                    case "2":
                        mapId = google.maps.MapTypeId.HYBRID;
                        break;
                    case "3":
                        mapId = google.maps.MapTypeId.TERRAIN;
                        break
                    case "0":
                    default:
                        mapId = google.maps.MapTypeId.ROADMAP;
                }
                return mapId;
            },
            
            updateToolBarButtons : function updateToolBarButtons(){                
                this.toolbar.affinityLines.set('visible', this.gridParams.isRW);                                
            },
            
            loadGoogleMap:function loadGoogleMap(mapping){
                this.loadWidgetProps();
                this.initMapProperty();
                
                this.bounds = new google.maps.LatLngBounds();
                var latlng = new google.maps.LatLng(31,-97);
                var myOptions = {
                    center: latlng,
                    mapTypeId: this.mapTypeId(this._defaultView),
                    minZoom : 2,
                    zoom : 4
                };
                var element = document.getElementById(this.mapDiv.id);
                if (!element) {
                    return;
                }
                
                this.map = new google.maps.Map(document.getElementById(this.mapDiv.id),
                            myOptions);
                
                
                this.infowindow = new google.maps.InfoWindow({
                    content: "",
                    hasShadow:false
                });
                    
                this.findNumAttributes();
                                
                this.idMarkerMap = {};
                
                var validAttributes = false;
                
                if(this.useArea)
                {
                 this._useAttribute = false; 
                 this._useLatlng = false;            
				 //disable the lasso toolbar button				 
				 this.toolbar.areaSelect.set("enabled",false);           
                }
                
                if (this._useAttribute)
                {
                    if (this._useLatlng)
                    {
                        //attribute lat lng
                        if (this.findLatLngPositionAttribute())
                        {
                            validAttributes = true;
                            this.createLatLngMarker();
                            if(this.gridParams.isRW && this.wpDisPlayAffinityLines != "0")
                                this.drawAffinityLinesUsingSecondaryDataProvider();

                        }
                    } else {
                        //attribute point
                        if (this.findPointPositionAttribute())
                        {
                            validAttributes = true;
                            this.createPointMarker();
                            if(this.gridParams.isRW && this.wpDisPlayAffinityLines != "0")
                                this.drawAffinityLinesUsingSecondaryDataProvider();
                        }
                    }
                } else {
                    if (this._useLatlng)
                    {
                        //attribute form lat and long
                        if (this.findLatLngPositionForm())
                        {
                            validAttributes = true;
                            this.createLatLngMarker();
                            if(this.gridParams.isRW && this.wpDisPlayAffinityLines != "0")
                                this.drawAffinityLinesUsingSecondaryDataProvider();
                        }
                    } else {
                        //attribute form point
                        if (this.findPointPositionForm())
                        {
                            validAttributes = true;
                            this.createPointMarker();
                            if(this.gridParams.isRW && this.wpDisPlayAffinityLines != "0")
                                this.drawAffinityLinesUsingSecondaryDataProvider();
                        }
                    }
                }
                
                
                if (!this.useArea && !validAttributes) {
                    mstrmojo.alert(mstrmojo.desc(8214,"No Mappable attributes present on the report."));
                }
                
                this.prepareDivs();
               
               if (this.useArea) {
                  this.isAggregate = true; //we always aggregate in the areas  mode
                    
                  if(!this.findAreasColumnPosition())
                  {
                    mstrmojo.alert(mstrmojo.desc(8214,"No Mappable attributes present on the report."));
                    return;
                  } 
                   this.parseAreasFusionTableXMLString();
                   this.initAreasData();
                   this.createFusionTable();
                }
                
                var that = this;
              
              // Now we want to know after the panel stack info window is rendered so that we can retrieve
              // the panel stack widget id, retrieve its domNode and set it as the content of google map info window
              if (mstrApp.docModel) {
                mstrApp.docModel.attachEventListener('infoWindowRendered', this.id, function(evt){
                    that.onInfoWindowRendered(evt);
                });
              }
                
            },
            //this method will parse the xml returned by click event handler on fusion table area
            getAreaCodeFromFusionTableClickEventResponseXML : function getAreaCodeFromFusionTableClickEventResponseXML(e, title)
            {   
                var str = e.infoWindowHtml,
                    searchStr = "<b>" + this.fusionTableLookUpColumn + ":</b>",
                    startPos = str.indexOf(searchStr,0),
                    endPos, clickedAreaCode;
                    
                if(startPos === -1)
                { 
                   var errMess = "Could not find the lookup attribute '" +this.fusionTableLookUpColumn + "' for the clicked area. ";
                   errMess += "Please make sure the Fusion Table infowindow HTML contains the look up attribute xml in the following format.";
                   errMess += "&lt;b&gt;" + this.fusionTableLookUpColumn + ":&lt;/b&gt;" + "{" + this.fusionTableLookUpColumn +"}";
                   mstrmojo.alert(errMess,null, title);
                   return null;
                }
                startPos = startPos + searchStr.length;
                endPos = str.indexOf("<", startPos);
                
                if (endPos === -1) // the user might have modified the infoWindow HTML, look till the end of string and see if there is any string present
                {
                   clickedAreaCode = str.substring(startPos).replace(/^\s+|\s+$/g, "");             
                }
                else {
                   clickedAreaCode = str.substring(startPos, endPos).replace(/^\s+|\s+$/g, "");
                }
            
                if(clickedAreaCode.length === 0)
                {
                     var errMess = "Could not find the lookup attribute '" +this.fusionTableLookUpColumn + "' value for the clicked area. ";
                     errMess += "Please make sure the Fusion Table infowindow HTML contains the look up attribute xml in the following format.";
                     errMess += "&lt;b&gt;" + this.fusionTableLookUpColumn + ":&lt;/b&gt;" + "{" + this.fusionTableLookUpColumn +"}";
                     mstrmojo.alert(errMess,null, title);
                     return null;
                }               
                
                return  clickedAreaCode;            
            },
            parseAreasFusionTableXMLString : function parseAreasFusionTableXMLString()
            {
                if (window.DOMParser)
                {
                   var parser=new DOMParser(),
                       xmlDoc=parser.parseFromString(this.wpAreasFusionTableXMLString,"text/xml"),
                       attrs = xmlDoc.getElementsByTagName("fusion-table")[0].attributes;
                   
                   this.fusionTableId = attrs.id.nodeValue;
                   this.fusionTableGeometryColumn = attrs.geo.nodeValue;
                   this.fusionTableLookUpColumn = attrs.areacol.nodeValue;
                }
                else // Internet Explorer
                {
                   var xmlDoc=new ActiveXObject("Microsoft.XMLDOM"), attrs;
                   xmlDoc.async="false";
                   xmlDoc.loadXML(this.wpAreasFusionTableXMLString);                   
                   attrs = xmlDoc.getElementsByTagName("fusion-table")[0].attributes;
                   
                   this.fusionTableId = attrs.getNamedItem("id").nodeValue;
                   this.fusionTableGeometryColumn = attrs.getNamedItem("geo").nodeValue;
                   this.fusionTableLookUpColumn = attrs.getNamedItem("areacol").nodeValue;
                }                                           
            },
            
            areaInfoWindow : null,
            initAreasData:function initAreasData() {
                if (!this.map) {
                    return;
                }                
                
                var deleteMe = {}, 
                    priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    rowAttributes = priModel.getRowTitles(),
                    rowCount = priModel.getTotalRows(),
                    colCount = priModel.getTotalCols(),
                    elemId, rowHeaderElements, areaElement, titleIndex, elementValue,
                    columnHeaderName, columnHeaderColumnIndex, columnHeaderRowIndex,
                    values, s, thresholdType, cell, type,
                    nextElementIndex = this.shapePosition + 1;
                
                
                this.enableShape = true;
                this.areasHashMap = {};
                    
                for (rowIndex = 0 ; rowIndex < rowCount ; rowIndex++)
                {
                    //get the area
                    rowHeaderElements = priModel.getRowHeaders(rowIndex);
                    areaElement = rowHeaderElements.getHeader(this.shapePosition);
                    if (!areaElement || areaElement.getElementIndex() < 0) {
                        continue;
                    }
                    elemId = areaElement.getElementId();
                    var attrs = {};                                
                     
                    if (this.idMarkerMap[elemId] && (!this.isTotal(nextElementIndex,rowIndex))) {  //is the next column element a  subtotal                            
                            continue; //it is not subtotal, so skip this row
                    }
                    
                    for (titleIndex=0; titleIndex < rowHeaderElements.size(); titleIndex++) {
                        
                        elementValue = rowHeaderElements.getHeader(titleIndex).getName();
                        attrs[this.replaceSpace(rowAttributes.getTitle(titleIndex).getName())] = elementValue;
                    }
                                    
                    for (columnHeaderColumnIndex=0;columnHeaderColumnIndex < colCount;columnHeaderColumnIndex++) {
                        columnHeaderName = null;
                        for (columnHeaderRowIndex=0; columnHeaderRowIndex<priModel.getTotalColHeaderRows(); columnHeaderRowIndex++) {
                            var cellName = priModel.getColHeaders(columnHeaderRowIndex).getHeader(columnHeaderColumnIndex).getName();
                           
                            if (!columnHeaderName){
                                columnHeaderName = cellName;
                            } else {
                                columnHeaderName += " "+cellName;
                            }
                            
                        }
                        values = priModel.getMetricValue(rowIndex,columnHeaderColumnIndex);
                        thresholdType = values.getThresholdType();
                         
                        if (!thresholdType || thresholdType === this.enumNumber) {
                            attrs[this.replaceSpace(columnHeaderName)]=values.getValue();
                        } else {
                            attrs[this.replaceSpace(columnHeaderName)]=values.getRawValue();
                        } 
                    }
                    
                    attrs.rowIndex = rowIndex;
                    attrs.geoIndex = areaElement.getElementIndex();
                    s  = this.createSimpleInfoHTML(rowIndex,attrs);
                    this.areasHashMap[areaElement.getName()] = {attributes : attrs,geoPosition : this.shapePosition, simpleHTML : s};
                    
                    //now read the threshold information 
                    if (this._applyThreshold) 
                    {
            cell = priModel.getMetricValue(rowIndex,this.selectedMetricIndex);
                        //first check the threshold image
                        type = cell.getThresholdType();
                        
                        switch (type) {
                            case this.enumText:
                            case this.enumQuickSymbol:      
                                 break;                          
                            case this.enumImage:
                            case this.enumUrl:
                                 break;
                            case this.enumNumber:
                            default:
                                //set the threshold color                                
                                  var colorString = this.getMapModel(PRIMARY_DATA_PROVIDER).getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("#5a709c");
                
                                 this.addAreaColor(areaElement.getName() ,colorString);             
                        }
                    }     
                    //store this element in the map
                    this.idMarkerMap[elemId] = elemId; 
                }         
                
            },
        
        handleFusionTableClickSelect : function handleFusionTableClickSelect(e)
        {
           if (!e) {
                return;
           }
           var clickedAreaCode, currentSelections, currSelectionsAreaNames = [], i, headerValues;

           clickedAreaCode = this.getAreaCodeFromFusionTableClickEventResponseXML(e, "Areas Click Select");
           if(!clickedAreaCode || !this.areasHashMap[clickedAreaCode]){
             return;
           }
           //currentSelections contains the array of idx of currently selected elements
           currentSelections = this.handleSelection(this.areasHashMap[clickedAreaCode]);
        
           headerValues =   this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(this.shapePosition).getHeaderValues(); 
           //retrieve the area names for the current selections
           for (i = 0; i < currentSelections.length; i++) 
           {                    
             //currSelectionsAreaNames.push(this.getMapModel(PRIMARY_DATA_PROVIDER).getRowHeaders(currentSelections[i]).getHeader(this.shapePosition).getName());
             currSelectionsAreaNames.push("'" + headerValues[currentSelections[i]].n + "'");
           }
           //highlight the clicked areas

           this.highlightArea(currSelectionsAreaNames);        
        },
            
        findPanelStackAsInfoWindowSelectorTarget : function findPanelStackAsInfoWindowSelectorTarget(sc)
        { 
            //if there is target panel stack which is info window then return true
                  
            if ( sc && sc.tks ) {
                var dm = mstrApp.docModel,
                    targets = sc.tks.split('\u001E');
                if(!dm){
                    return false;
                }
                for( var i = 0, len = targets.length; i < len; ++i ) {
                    var d = dm.getTargetDefn(targets[i]);
                    if (d[targets[i]] && d[targets[i]].ifw ) {
                        return true;
                    }
                }        
            }
            return false;
        },
        
        showPanelStackInfoWindow : function showPanelStackInfoWindow(geoItem, colIndex, latLng)
        {
            var priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                sc = priModel.getRowTitles().getTitle(colIndex).getSelectorControl(),
                eid = priModel.getRowHeaders(geoItem.attributes.rowIndex).getHeader(colIndex).getElementId(),        
                ps = {x:0,y:0,h:60,w:0};                
                
               
            //assign the mouse clicked position which will be used in the onInfoWindowRendered method
            //to place the tip of the google info window
            if(latLng)
              this.panelStackInfoPos = latLng;
            else            
              this.panelStackInfoPos = geoItem;
                    
            //we have a event listener onInfoWindowRendered registered for the slice event that will be raised from DocInfoWindow by the DocModel   
            mstrApp.docModel.slice({
                  type: mstrmojo.EnumRWUnitType.GRID,
                  sPos: ps,
                  ck: sc.ck,
                  ctlKey: sc.ckey,
                  tks: sc.tks,                
                  eid: eid
              });
        },
        
        panelStackInfoPos : null,
        handleFusionTablePopUp : function handleFusionTablePopUp(e)
        {
          if(!e)
            return;      
         
           var clickedAreaCode = this.getAreaCodeFromFusionTableClickEventResponseXML(e, "Areas Click Popup"),
               areaInfo;

           if(!clickedAreaCode || !this.areasHashMap[clickedAreaCode]){
             return;
           }
         
           areaInfo = this.areasHashMap[clickedAreaCode];
                            
           this.showInfoWindow(areaInfo, e.latLng, false);          
        },
        
        onInfoWindowRendered : function onInfoWindowRendered(evt)
        {             
              id = evt.id;
              var  w = mstrmojo.all[id],              
                   newDiv = document.createElement("div");            
                  
              if(this.enableClickSelect || this.enableAreaSelect)
              {
                // we will hide the infowindow using this class name in the .css file
                newDiv.className = 'clickSelectfuionTableInfoWindow';
                if(w)
                   newDiv.appendChild(w.domNode);                  
                   return;
              }           
                 
              // Now we want to know after the panel stack info window is rendered so that we can retrieve
              // the panel stack widget id, retrieve its domNode and set it as the content of google map info window
           
              if(w)
              {               
                  newDiv.className = 'fusionTableInfoWindow';
                  newDiv.style.overflow = 'hidden';
                  if(w.children[0])
                  {
                    var divH = w.children[0].defn.fmts.height,  //get the height of panel stack
                        pxIndex = divH.indexOf("px");
                                
                    if(pxIndex != -1)
                    {
                      divH = Number(divH.substring(0,pxIndex)) + 25 + 'px'; 
                    }
                    else
                    {
                      divH = w.children[0].defn.fmts.height + 25 + 'px'; 
                    }
                    newDiv.style.height = divH; //w.containerNode.offsetHeight;
                    newDiv.style.width = w.children[0].defn.fmts.width; //w.containerNode.offsetWidth;
                  }
                  else
                  {
                    newDiv.style.height = '100px'; //w.containerNode.offsetHeight;
                    newDiv.style.width = '200px'; //w.containerNode.offsetWidth;              
                    newDiv.style.overflow = 'auto';
                  }

                  w.containerNode.style.top = '10px';
                  w.containerNode.style.left = '0px';
                  

                  //add the triangle shape tip also because we want to hide it. 
                  //We hide the tooltip by specify a style in css
                  //If you don't add tip to the google info window, then the tip will be 
                  //displayed outside of google map infowindow which is not what we want

                  newDiv.appendChild(w.tipNode);        
                  newDiv.appendChild(w.domNode);        
              }

              if(this.areaInfoWindow) 
              {
                this.areaInfoWindow.close();
              }
              else
              {
                 this.areaInfoWindow = new google.maps.InfoWindow();
              }
              this.areaInfoWindow.setContent(newDiv);
              if (this.panelStackInfoPos instanceof google.maps.LatLng) {
                this.areaInfoWindow.setPosition(this.panelStackInfoPos);
                this.areaInfoWindow.open(this.map);
              }
              else{
                this.areaInfoWindow.open(this.map, this.panelStackInfoPos);
              }
            },
        
            fusionTableId : null,
            fusionTableGeometryColumn : null,
            fusionTableLookUpColumn : null,
            createFusionTable : function createFusionTable()
            {
              
              var areasList = [], key;
              
              this.defaultInfoWindowHTML = this.getDefaultInfoWindowTemplate();
              if (this.infoWindowHTML === "") {
                  this.infoWindowHTML = this.defaultInfoWindowHTML;
              }
              //check if there are more than 5 thresholds defined and throw a warning message if necessary
              if(this.getColorCount() > 5)
              {
                mstrmojo.alert("Only five threshold colors will be used to color code the areas. Rest will be ignored",null,"Areas Color Coding");
              } 
              //construct the list of areas to be rendered by fusion table
              
              for(key in this.areasHashMap)
              {
                 if(this.areasHashMap.hasOwnProperty(key)){
                     areasList.push("'" +key+"'");
                 }
               
              }
              //call the mixin methods to create the fusion table
                        
              this.createColorCodedArea(this.fusionTableId, this.fusionTableGeometryColumn, this.fusionTableLookUpColumn, areasList);
             
              this.showColorCodedArea(this.map);
              var that = this;
           
                  this.addColorCodedAreaListener('click', function(e)
                                  {
                                    if(that.enableClickSelect)
                                    {
                                       that.handleFusionTableClickSelect(e);   
                                    }
                                    else if(that.enablePopup)
                                    {
                                       that.handleFusionTablePopUp(e);
                                    }
                                    else if(that.enableAreaSelect)
                                    {
                                     //TODO
                                    }
                                  }
                             );
              
            },
                 
            
            removeDijit:function removeDijit(){
                var ids = this.domNode.id;
                dijit.registry.forEach(function(w){ 
                   if(dojo.indexOf(ids,w.id)){
                        w.destroyRecursive();
                   }
                });
            },
          
            prepareDivs:function prepareDivs() {
                // init info window div. 
                this.infoTabDiv = document.createElement("div");
                this.infoTabDiv.id = "infoDiv";
                this.infoTabDiv.style.paddingTop = "3px";
                this.infoTabDiv.style.overflow = "auto";                
                this.infoTabDiv.style.maxWidth = "640px";
                this.infoTabDiv.style.maxHeight = "200px";
                
                            
                var table = document.createElement("table"),
                    tableHead = document.createElement("tHead"),
                    tableBody = document.createElement("tBody"),
                    cssString,
                    isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
 
                table.setAttribute("cellspacing", "0");
                table.setAttribute("cellpadding", "2");
                
                table.appendChild(tableHead);
                table.appendChild(tableBody);
                this.infoTabDiv.appendChild(table);
                
                cssString = this.getMapModel(PRIMARY_DATA_PROVIDER).getCSSString();
                
                if (cssString !== undefined) {
                    var cssStyle = document.createElement('style');
    
                    cssStyle.type = 'text/css';
                    var node = cssStyle.styleSheet || cssStyle;
                    
                    
                    if(mstrmojo.dom.isWK) { // for webkit, "cssText" works fine with Safari, but not work with Chrome. Hence the solution:
                        if(node.firstChild) {
                            node.firstChild.nodeValue = cssString;
                        } else {
                            node.appendChild(document.createTextNode(cssString));                            
                        }
                    } else {
                        node[mstrmojo.dom.isIE ? "cssText" : "innerHTML"] = cssString;
                    }
                    this.infoTabDiv.appendChild(cssStyle);
                }
            },
            
            imageMap:{},
            calculateBubbleRadius:function calculateBubbleSize(value) {
				if(value <= 0)
				   return this.minRadius;
				   
                return Math.max(this.maxRadius * Math.sqrt(value/this.maxValue),this.minRadius);
            },
            adjustMarker:function adjustMarker() {
                if (this.wpMarkerType === "1" && !this._applyThreshold)
                {
                    return;
                }
                this.populateMinMax(this.selectedMetricIndex);
                this.populateBubbleVariables();
                
                var gradientFill = {type:"radial",cx:0,cy:0},
                    markerList = [],
                    g,
                    colorString,
                    dojoColor,
                    numMarker,
                    priModel = this.getMapModel(PRIMARY_DATA_PROVIDER);
                
                if (this.enableLatLng) {
                    markerList= this.getGeoList(this.latColumnIndex);
                } else if (this.enablePoint){
                    markerList = this.getGeoList(this.pointColumnIndex);
                }
                 
                numMarker = markerList.length;
                
                for (g=0;g<numMarker;g++) {
                    //Get the current feature from the featureSet.
                    //Feature is a graphic
                    
                    var marker = markerList[g],
                        rowIndex = marker.attributes.rowIndex,
                        rowCell,
                        type=this.enumNumber;
                 
                        rowCell =priModel.getMetricValue(rowIndex, this.selectedMetricIndex);
                        type = rowCell.getThresholdType();
                     
                    if (this.wpMarkerType === "1")
                    {
                       
                        var fill=null; 
                        switch (type) {
                            
                            case this.enumImage:
                            case this.enumUrl:
                                
                                var imageString = priModel.getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("no");
                                if (imageString != "no") {
                                    var markerImage;
                                    if (this.imageMap.hasOwnProperty(imageString)) {
                                        markerImage = this.imageMap[imageString];
                                    } else {
                                        var markerImage = new google.maps.MarkerImage(imageString,
                                            null,null,null,
                                            new google.maps.Size(20,20));
                                        this.imageMap[imageString]=markerImage;
                                    }
                                    if (marker instanceof google.maps.MarkerImage) {
                                        marker.setIcon(markerImage);
                                    } else {
                                        
                                        var imageMarker = new google.maps.Marker({
                                            position: marker.getPosition(),
                                            icon:markerImage,
                                            attributes:marker.attributes,
                                            simpleHTML:marker.simpleHTML,
                                            mapWidget:this,
                                            geoPosition:[this.latColumnIndex,this.longColumnIndex],
                                            map:this.map
                                        });
                                        google.maps.event.addListener(imageMarker,'mouseover', function () {
                                            if (this.hili) {
                                                this.setIcon(this.hili);
                                            }
                                        });
                                        google.maps.event.addListener(imageMarker,'mouseout', function () {
                                            if (!this.isSelected && this.image) {
                                                this.setIcon(this.image);
                                            }
                                        });
                                        
                                        google.maps.event.addListener(imageMarker, 'click', function(event) {
                                            var mapWidget = this.mapWidget;
                                            if (mapWidget._affinityGlow)                        
                                            {
                                                mapWidget.handleAffinityAnimationMouseClick(this, event);
                                            } else if (mapWidget.enableClickSelect) {
                                                mapWidget.handleSelection(this,event);
                                            } else if (mapWidget.enablePopup) {
                                                mapWidget.showInfoWindow(this);
                                            }
                                        });
                                                                           
                                        markerList[g]=imageMarker;
                                        marker.setMap(null);
                                    }
                                    
                                }
                                break;
                            case this.enumText:
                            case this.enumQuickSymbol:
                                
                                colorString = priModel.getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("#ffffff");
                                dojoColor = new dojo.Color(colorString);
                                dojoColor.a = 0.75;
                                var textMarker = new mstrmojo.gmaps.TextMarker({
                                    position:marker.getPosition(),
                                    clickable:true,
                                    //labelText:this.getQuickSymbol(rowCell.v),
                                    labelText:rowCell.getValue(),
                                    attributes:marker.attributes,
                                    mapWidget:this,
                                    geoPosition:[this.latColumnIndex,this.longColumnIndex],
                                    simpleHTML:marker.simpleHTML,
                                    map:this.map
                                });
                                markerList[g]=textMarker;
                           
                                google.maps.event.addListener(textMarker, 'click', function(event) {
                                    var mapWidget = this.mapWidget;
                                    if (mapWidget._affinityGlow)                        
                                    {
                                        mapWidget.handleAffinityAnimationMouseClick(this, event);
                                    } else if (mapWidget.enableClickSelect) {
                                        mapWidget.handleSelection(this,event);
                                    } else if (mapWidget.enablePopup) {
                                        mapWidget.showInfoWindow(this);
                                    }
                                });
                              
                                marker.setMap(null);
                                break;
                            case  this.enumNumber:
                            default:
                                //set the threshold color
                            
                                colorString = priModel.getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue(this.defaultThresholdColor);
                                dojoColor = new dojo.Color(colorString);
                                dojoColor.a = 0.75;
                                
                                var radius = DEFAULT_BUBBLE_SIZE;
                                if (marker instanceof mstrmojo.gmaps.CircleMarker) {
                                    marker.set("fillColor",dojoColor);
                                    marker.set("radius",radius);
                                } else {
                                    var circle = new mstrmojo.gmaps.CircleMarker({
                                        center:marker.getPosition(),
                                        clickable: true,
                                        fillColor:dojoColor,
                                        //strokeColor:strokeColor,									
                                        strokeColor:this.regularStroke,
                                        selectedColor:this.selectedStroke,
                                        radius:radius,
                                        attributes:marker.attributes,
                                        simpleHTML:marker.simpleHTML,
                                        mapWidget:this,
                                        geoPosition:[this.latColumnIndex,this.longColumnIndex],
                                        map:this.map
                                    });
                                    markerList[g]=circle;
                                    marker.setMap(null);
                                
                                    google.maps.event.addListener(circle, 'click', function(event) {
                                        var mapWidget = this.mapWidget;
                                        if (mapWidget._affinityGlow)                        
                                        {
                                            mapWidget.handleAffinityAnimationMouseClick(this, event);
                                        } else if (mapWidget.enableClickSelect) {
                                            mapWidget.handleSelection(this,event);
                                        } else if (mapWidget.enablePopup) {
                                            mapWidget.showInfoWindow(this);
                                        }
                                    });
                                 }
                                
                                 break;
                         }//end switch
                    } //end if
                    else {
                        //bubble mode
                        if (this._applyThreshold) {
                            
                            colorString = priModel.getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue(this.defaultThresholdColor);
                        } else {
                            colorString = this.defaultThresholdColor;
                        }
                        dojoColor = new dojo.Color(colorString);
                        dojoColor.a = 0.75;
                         
                        var radius = DEFAULT_BUBBLE_SIZE;
                          
                        var cellNumber = parseFloat(!rowCell.getRawValue() ? this.stripNumberFormat(rowCell.getValue()) : rowCell.getRawValue());
                        
                        if (this.validBubble) {
                            radius = this.calculateBubbleRadius(cellNumber);
							
                        }
                         
                        if (marker instanceof mstrmojo.gmaps.CircleMarker) {
                            marker.set("fillColor",dojoColor);
                            marker.set("radius",radius);
                        }
                    }
                }//end for 
            },
            adjustShape:function adjustShape() {
                 var shapeList = this.getGeoList(this.shapePosition);
                 if(!shapeList) return;
                 
                 var priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                     polygon,
                     rowIndex,
                     i;
                     
                 for(i=0;i< shapeList.length;i++)
                 {
                     polygon = shapeList[i];
                     rowIndex = polygon.attributes.rowIndex;
                     
                     var colorString = priModel.getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue(this.defaultThresholdColor);
                     polygon.setOptions({
                         fillColor: colorString
                     });
                 }
             },
             
            adjustAreaColor : function adjustAreaColor()
            {
                this.resetAreaColors();  //remove the existing colors on the areas
               
                if (!this.map) 
                {
                return;
            }                
                           
        var idAreasMap = {},
            priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
            rowCount = priModel.getTotalRows(),         
            elemId, rowHeaderElements, areaElement,         
            cell, type,
            nextElementIndex = this.shapePosition + 1;
           
                //iterate over all the rows and get the threshold color for the current selected metric
           for (rowIndex = 0; rowIndex < rowCount ; rowIndex++)
           {
           //get the area
           rowHeaderElements = priModel.getRowHeaders(rowIndex);
           areaElement = rowHeaderElements.getHeader(this.shapePosition);
           if (!areaElement || areaElement.getElementIndex() < 0) {
            continue;
           }
           elemId = areaElement.getElementId();


           if (idAreasMap[elemId] && (!this.isTotal(nextElementIndex,rowIndex))) {  //is the next column element a  subtotal                            
               continue; //it is not subtotal, so skip this row
           }


           //now read the threshold information 
           if (this._applyThreshold) 
           {
               cell = priModel.getMetricValue(rowIndex,this.selectedMetricIndex);
               //first check the threshold image
               type = cell.getThresholdType();

               switch (type) {
               case this.enumText:
               case this.enumQuickSymbol:      
                             break;                          
               case this.enumImage:
               case this.enumUrl:
                             break;
               case this.enumNumber:
               default:
                   //set the threshold color                                
                var colorString = this.getMapModel(PRIMARY_DATA_PROVIDER).getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("#5a709c");

                this.addAreaColor(areaElement.getName() ,colorString);              
               }
           }     
           //store this element in the map
           idAreasMap[elemId] = elemId; 
           }  
                           
              this.showColorCodedArea(this.map);
            },
            
            adjustColor:function adjustColor() {
                 if (this.enableLatLng || this.enablePoint)
                 {
                     this.adjustMarker();
                 }
                 if (this.enableShape)
                 {
                     //this.adjustShape();
                     this.adjustAreaColor();                     
                 }
            },
            /**
             * lookup map for fast retrieval of attribute element(ie state name) => key(row index) for data structure
             */
            createLookup:function createLookup() {
                var dataLookup = {},                
                    priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    rowCount = priModel.getTotalRows(), 
                    rowIndex;
                   
                for ( rowIndex=0; rowIndex< rowCount; rowIndex++ )
                {
                    var rowGeoHeader = priModel.getRowHeaders(rowIndex).getHeader(this.shapePosition);
                    
                    dataLookup[rowGeoHeader.getName()]={"rowIndex":rowIndex,"geoIndex":rowGeoHeader.getElementIndex()};
                    
                }
                return dataLookup;
            },
            
            sliceRow:function sliceRow(key) {
            },
           
            
            isIndexGeoPosition: function isIndexGeoPosition(index) {
                return (this.shapePosition === index) || (this.latColumnIndex === index) || (this.longColumnIndex === index);
            },
            
            

            /**
             * create the grid view for infoWindow
             */
            createGridInfoWindow:function createGridInfoWindow (dataRows,table) {
      
                // is IE or not.
                var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
                // info window table.
                var table = this.infoTabDiv.childNodes[0],
                    css = "gridInfoWindowTable", //TODO: remove this line once you get the css sent by transform
                    cell,
                    header,
                    tui,
                    idx,
                    td,
                    titleSpan,
                    i,j,k,
                    tr, 
                    priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    numRowAttributes = priModel.getRowHeaders(0).size(),
                    numColAttributes = priModel.getTotalCols(),
                    titles = priModel.getRowTitles(),
                    colHeaders = priModel.getColHeaders(0),
                    numRows = dataRows.length,                     
                    rowIndex, rowHeaders,
                    numMetrics = priModel.getColumnHeaderCount(),
                    numAttributes = priModel.getRowHeaders(0).size();
                    
                //table height and width are set to 100% in googlemap.css so that it occupies its parent div
                // first clear out the table.
                while(table.rows.length > 0) {
                      table.deleteRow(table.rows.length-1);
                }
                
                
                
                table.className = css;
			   
                
                // Now render an initial block of list items within this view.        

                if (table.tHead) {
					
                    var thead = table.tHead;
                    while(thead.rows.length > 0) {
                          thead.deleteRow(thead.rows.length-1);
                    }
                        
                    tr = thead.insertRow(thead.rows.length);
                    
                    for (i=0;i<numRowAttributes;i++) {
                        if (this.isIndexGeoPosition(i)) {
                            continue;
                        }
                        td = tr.insertCell(tr.cells.length);                                      
                        header = titles.getTitle(i);
                        css = titles.getCSS(i);
                      
                        td.className = css;
                      
                        titleSpan = document.createElement('span');
                        titleSpan.innerHTML = header.getName();
                        td.appendChild(titleSpan);                        
                    }
                    
                    //assuming simple column here.
                    for (i=0;i<numColAttributes;i++) {
                        td = tr.insertCell(tr.cells.length);
                                                                        
                        header = colHeaders.getHeader(i);
                        css = colHeaders.getCSS(i);    
                        td.className = css;                        
                        titleSpan = document.createElement('span');
                        titleSpan.innerHTML = header.getName();
                        td.appendChild(titleSpan);
                        
                    }
                }

                // render tbody : user data
                var tbody = table.tBodies[0];
                    
                
                for (i=0;i<numRows;i++) {
                    rowIndex = dataRows[i];
                    tr = tbody.insertRow(tbody.rows.length);
                    // get row formatting info.    
                    rowHeaders = priModel.getRowHeaders(rowIndex);
                    for(j = 0; j < numAttributes; j++) {
                        //skip the geo attribute we are using, since there should be only one
                        
                        if (this.isIndexGeoPosition(j)) {
                            continue;
                        }
                        
                        cell = rowHeaders.getHeader(j);
                        var attributeName = "";
						if (!!cell) {						
							idx = cell.getElementIndex();
							css = rowHeaders.getCSS(j); //this.getCssClass(cell.cni);
							attributeName = cell.getName();
						}
						
                        td = tr.insertCell(tr.cells.length);
                        // add the header format info.
                     
                        td.className = css;                     
                        td.innerHTML = '    ' + attributeName + '    ';
                    }

                                        
                    for (k=0; k<numMetrics;k++) {
                        var metricValues = priModel.getMetricValue(rowIndex,k),
                            metricValue = metricValues.getValue(),
                            thresholdType = metricValues.getThresholdType();
                        css = metricValues.getCSS();
                
                        td = tr.insertCell(tr.cells.length);
                        // add the metric value format info.
                      
                        td.className = css;
                      
                        if (!thresholdType || thresholdType === this.enumNumber)
                        {
                            td.innerHTML = '    ' + metricValue + '    ';
                        } else {
                            td.innerHTML = '    ' + metricValues.getRawValue() + '    ';
                        }                        
                    }
                }
                return table;
            },
            stripNumberFormat:function stripNumberFormat(numString) {

                var newString = numString.replace(this.gridParams.currencySymbol,"");
                var oldString;
                do {
                    oldString = newString;
                    newString = newString.replace(this.gridParams.groupingSeparator,"");
                } while (oldString != newString);
                var resultString = newString.replace(this.gridParams.decimalSeparator,".");
                return resultString;
            },
            isValidColIndex:function isValidColIndex(colIndex){
                var firstRowOfColumnHeader = this.getMapModel(PRIMARY_DATA_PROVIDER).getColTitles().getTitle(0).getHeaderValues();
                return (colIndex >=0 && colIndex <firstRowOfColumnHeader.length);
            },
            getColumnHeaderByIndex:function getColumnHeaderByIndex(colIndex)
            {
                if (!this.isValidColIndex(colIndex)) {
                    return "invalid column index";
                }
                var columnHeaders = this.getMapModel(PRIMARY_DATA_PROVIDER).getColTitles(), //this is an array
                    numColumnHeaders = columnHeaders.size(),
                    columnHeaderString = columnHeaders.getTitle(0).getHeaderValues()[colIndex].n,
                    i;
                    
                for (i=0;i<numColumnHeaders;i++){
                    columnHeaderString += " " + columnHeaders.getTitle(i).getHeaderValues()[colIndex].n;
                }
                return columnHeaderString;
            },
            /**
             * prepares the data to draw a chart.
             */
            prepareMapData:function prepareMapData(div,dataRows) 
            {
                var categoryLabels = [],
                    seriesLabels = [],
                    serieses = [],
                    priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    numAttributes = priModel.getRowHeaders(0).size(),                
                    min, max,             
                    numMetrics = priModel.getColumnHeaderCount();                                   
                    a,
                    categoryLabel,
                    numRows,                    
                    rowIndex,
                    i,j,k,
                    attributeElementName,
                    metricValue;
                    
                 //create category label (y axis)   
                //first determine the number of series
             
                for (a=0;a<numMetrics;a++)
                {
                    serieses[a]=[];
                    //assuming ? or complete?
                    seriesLabels.push(this.getColumnHeaderByIndex(a));
                }
                
                numRows = dataRows.length;
                categoryLabels.push({value: 0, text: ""});
            
                for(i=0; i<numRows;i++) {
                    // get row formatting info. 
                    rowIndex = dataRows[i];
                    categoryLabel=null;
                    var rowHeader = priModel.getRowHeaders(rowIndex);
                    for(j = 0; j < numAttributes; j++) {
                        //skip the geo attribute we are using
                        if (this.isIndexGeoPosition(j)) {
                            continue;
                        }
                        
                        attributeElementName = rowHeader.getHeader(j).getName();
                         
                        if (!categoryLabel) {
                            categoryLabel = attributeElementName;
                        } else {
                            categoryLabel += " " +attributeElementName;
                        }
                    }
                    categoryLabels.push({value: i+1, text: categoryLabel});
                                                                
                    //populate the series
					var metricCell;
                    for (k=0; k<numMetrics;k++) {
						metricCell = priModel.getMetricValue(rowIndex,k);
                        metricValue = (!metricCell.getRawValue() ? this.stripNumberFormat( metricCell.getValue()) : metricCell.getRawValue());  
                        serieses[k].push(parseFloat(metricValue));
                        if (min === undefined || parseFloat(min) > metricValue) {
                            min = metricValue;
                        }
                        if (max === undefined || parseFloat(max) < metricValue) {
                            max = metricValue;
                        }
                    }
                }
                categoryLabels.push({value: numRows+1, text: ""});
                this.drawChart(div,min,max,categoryLabels,"y",seriesLabels,serieses);
            },
            
            /**
             * draw a chart on infoWindow
             * div is the DIV node to draw on
             * inYMin and inYMax is the max and min value for Y axis,type number
             * xLabels and yLabels,seriesLabel are the corresponding labels for x axis, y axis and series.
             * theSeries is the data
             * requires dojo chart.
             */
            drawChart:function drawChart(div,inYMin, inYMax,xLabels, yLabel ,seriesLabel,theSeries) {
                var chart1 = new dojox.charting.Chart2D(div);
                chart1.setTheme(dojox.charting.themes.PlotKit.blue);
                chart1.addPlot("default", {type: "Default", markers: true, tension: 3, shadows: {dx: 2, dy: 2, dw: 2}});
                chart1.addPlot("back_grid", { type: "Grid", hMajorLines: true, vMajorLines: false });
                chart1.addAxis("x", {min: 1, max: xLabels.length -1, majorTick: {stroke: "black", length: 4}, minorTick: {stroke: "gray", length: 2}, 
                    labels: xLabels,
                    includeZero: true
                });
                chart1.addAxis(yLabel, {vertical: true, min: -1, max: Math.ceil(inYMax), majorTick: {stroke: "black", length: 3}, minorTick: {stroke: "gray", length: 3}, natural: true});
                var numSeries = theSeries.length;
                //chart1.addSeries(seriesLabel[0], theSeries[0], {stroke: {color: "blue", width: 2}, fill: "lightblue", marker: "m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0"});
                var colors = ["blue","red","green","yellow","orange"];
                var fills = ["lightblue","lightred","lightgreen","lightyellow","lightorange"];
                var i;
                for (i=0; i< numSeries;i++){
                    chart1.addSeries(seriesLabel[i], theSeries[i], {stroke: {color: colors[i%5], width: 2}, fill: fills[i%5], marker: "m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0"});
                }
                
                
                //var anim1a = new dojox.charting.action2d.Magnify(chart1, "default", {scale: 3});
                //var anim1b = new dojox.charting.action2d.Highlight(chart1, "default");
                //var anim1c = new dojox.charting.action2d.Tooltip(chart1, "default");
                chart1.render();
                //var legend1 = new dojox.charting.widget.Legend({chart: chart1, horizontal: false}, "legend1");
            },
            
            updateInfoWindowTemplate:function updateInfoWindowTemplate(infoTemplate){
                //if the graphics layer has not been initialized, do nothing
                if (this.graphicsLayer === undefined) {
                    return;
                }
               
                var graphics = this.queryFeatureSet.features;
                var numGraphics = graphics.length;
                var g;
                for (g=0;g<numGraphics;g++) {
                     //Get the current feature from the featureSet.
                     //Feature is a graphic
                     var graphic = graphics[g];
                     graphic.setInfoTemplate(infoTemplate);
                }
                this.graphicsLayer.refresh();
            },
            
            clusterIndex:0,
            cluster:[],
            createInfoWindow:function createInfoWindow(title,content)
            {
                var s;
                /*
                if (this.mstrInfo){
                    this.mstrInfo.clearData();
                    this.mstrInfo.addEntry(title,content);
                    this.mstrInfo.render();
                    s = this.mstrInfo.domNode.innerHTML;
                } else {
                <button type="button">Click Me!</button>
                */
                    s = '<div id="infoWindow" class="mstrMapButton" style="max-width:640px;font-size:8pt; max-height:200px;"><div id="title" style="height:26px">';
                    if (title)
                    {
                        //s+='<h1 id="firstHeading" class="firstHeading">'+title+'</h1>'
                        s+='<b>'+title+'</b>';
                    } else {
                        //s+='<h1 id="firstHeading" class="firstHeading"> </h1>'
                        //s+= ' ';
                    }
                    // add left button
                    //s += '<button type="button" ';
                    s += '<div id="infoPrev" class="mstrmojo-Button mstrtbMapPrev'
                    if (this.clusterIndex> 0)
                    {
                        s+= '" onclick="mstrmojo.all[\'';
                        s+= this.id;
                        s+= '\'].getPrev();return false;';
                    } else {
                        //s+= 'disabled=false';
                        s+=' disabled';
                    }
                    s+='" style="display: block" ></div>';
                    
                    s+='<div style="height:26px;line-height:25px;float:left;position:relative;"> ';
                    var ofString = mstrmojo.desc(4891, "## of ###");
                    var resultString = ofString.replace("##",""+(this.clusterIndex + 1)).replace("###",""+(this.cluster.length));
                    //s+=(this.clusterIndex + 1) + ' of ' + (this.cluster.length)+"</div>";
                    s+= resultString + "</div>";
                    // add right button
                    
                    //s += '<button type="button" ';
                    s += '<div id="infoNext" class="mstrmojo-Button mstrtbMapNext';
                    if (this.clusterIndex< this.cluster.length-1)
                    {
                        s+= '" onclick="mstrmojo.all[\'';
                        s+= this.id;
                        s+= '\'].getNext();return false;';
                    } else {
                        s+= ' disabled';
                    }
                    s+='" style="display: block" ></div>';
                    s += '</div>';
                    s += '<div id="bodyContent" style="border: 1px solid grey; padding: 3px;">';
                    
                    s += content;
                    
                    s+='</div></div>'
                    
                //}
                return s;
            },
            getPrev:function getPrev()
            {
                this.clusterIndex--;
                var mapObj = this.cluster[this.clusterIndex];
                this.showInfoWindow(mapObj,null,true);
            },
            getNext:function getNext()
            {
                this.clusterIndex++;
                var mapObj = this.cluster[this.clusterIndex];
                this.showInfoWindow(mapObj,null,true);
            },
            
            resolveCustomizedInfoWindow:function resolveCustomizedInfoWindow(attributes)
            {
                
                var input = this.infoWindowHTML;
                var result="";
                var baseIndex = 0;
                var startIndex = input.indexOf("${",baseIndex);
                var endIndex = input.indexOf("}",startIndex+1);
                var macroName;
                var transformedMacroName;
                var replaceValue;
                while( startIndex >=0 && endIndex >startIndex)
                {
                    macroName = input.substring(startIndex+2,endIndex);
                    var colonIndex = macroName.indexOf(":");
                    if (colonIndex >=0) {
                        transformedMacroName = macroName.substring(0,colonIndex)+" "+macroName.substring(colonIndex+1);
                    } else {
                        transformedMacroName = macroName;
                    }
                    transformedMacroName = this.replaceSpace(transformedMacroName);
                    if (attributes.hasOwnProperty(transformedMacroName))
                    {
                        result += input.substring(baseIndex,startIndex)+attributes[transformedMacroName];
                    } else {
                        result += input.substring(baseIndex,endIndex);
                    }
                    baseIndex = endIndex +1;
                    startIndex = input.indexOf("${",baseIndex);
                    endIndex = input.indexOf("}",startIndex+1);
                }
                result += input.substring(baseIndex,input.length);
                return result;
                //return this.infoWindowHTML;
            },
            findCluster:function findCluster(latlng,width,height)
            {
                var bounds = this.createClusterBounds(latlng,width,height);
                var markerList = [];
                if (this.enableLatLng)
                {
                    markerList = this.getGeoList(this.latColumnIndex);
                } else if (this.enablePoint)
                {
                    markerList = this.getGeoList(this.pointColumnIndex);
                }
                //this.cluster.length = 0;
                var i;
                for (i=0;i<markerList.length;i++)
                {
                    marker = markerList[i];
                    markerLatLng = marker.getPosition();
                    geoIndex = marker.attributes.geoIndex;
                    rowIndex = marker.attributes.rowIndex;
                    var markerSelected = mstrmojo.array.indexOf(this.cluster,marker);
                    if ((markerSelected < 0 ) && bounds.contains(markerLatLng))
                    {
                         
                         this.cluster.push(marker);
                    }
                }
                
            },
            infoAnchor:null,
            mstrInfo:null,
            showInfoWindow:function createContent(geoItem,latlng,clusterMode) {
                if (!this.enablePopup || !this.infowindow) {
                     //no popup if the flag is false
                     return;
                }
                
                //check if we have panel stack as info window then show it otherwise we'll show the regular info window
                var geoPos = [], sc;
                if (geoItem.geoPosition instanceof Array) 
                {
                    geoPos = geoItem.geoPosition;
                }
                else
                {
                    geoPos[0] = geoItem.geoPosition;
                } 
                  for(var i = 0 ; i < geoPos.length; i++)
                  {
                    sc = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(geoPos[i]).getSelectorControl();
                    if (this.findPanelStackAsInfoWindowSelectorTarget(sc)) {
                        this.showPanelStackInfoWindow(geoItem,geoPos[i], latlng);
                        return;
                    }
                  }
                
                
                if (!this.infoAnchor) {
                    this.infoAnchor = new google.maps.Marker();
                }
                //geoItem can of type Marker , OverlayView and an object
                //For density maps case, geoItem is an object so we use position in this case but not for Marker or OverlayView
                if (!(geoItem instanceof google.maps.Marker) && !(geoItem instanceof google.maps.OverlayView) &&  geoItem.position) {
                    latlng = geoItem.position;
                }
                if (latlng) {
                    this.infoAnchor.setPosition(latlng);
                }
                
                
                if (!clusterMode)
                {
                    this.clusterIndex=0;
                    if (this.isDensityMap()){
                        this.cluster = this.densityLayer.getLastCluster();
                    } else {
                        this.cluster.length=0;
                        this.cluster.push(geoItem);
                    if (geoItem instanceof mstrmojo.gmaps.CircleMarker){
                        this.findCluster(latlng||geoItem.getPosition(),geoItem.radius,geoItem.radius);
                    } else {
                        this.findCluster(latlng||geoItem.getPosition(),23,28);
                    }
                    }
                } 
                var dataRows, sliceInfo, div, content, detail, title, size;
                
                if (!this._useAttribute || this.isAggregate) {
                    sliceInfo = {'pos':geoItem.geoPosition, 'elementIndex':geoItem.attributes.geoIndex, 'setViewDataFlag':false, 'applyControl':false};
                 
                    dataRows = this.retrieveDataRows(sliceInfo);
                } else {
                    dataRows = [geoItem.attributes.rowIndex];
                }
            
                 if (this.infoWindowHTML !== undefined && (this.infoWindowHTML != "" && this.infoWindowHTML != this.defaultInfoWindowHTML)){
                     //content = this.resolveCustomizedInfoWindow(geoItem.attributes);
                     detail = this.resolveCustomizedInfoWindow(geoItem.attributes);
                     content = this.createInfoWindow(geoItem.attributes.NAME,detail);
                     
                     //we have a customized info window HTML
                     this.infowindow.setContent(content);
                        if (latlng)
                        {
                            this.infowindow.open(this.map, this.infoAnchor);
                        } else {
                            this.infowindow.open(this.map, geoItem);
                        }
                 //}else if (this.numAttributes ==1){
                 } else if (dataRows.length === 1) {
                     //content = geoItem.simpleHTML;
                     //this.infowindow.setContent(this.mstrInfo);
                     if (geoItem.attributes.NAME)
                     {
                         content = this.createInfoWindow(geoItem.attributes.NAME,geoItem.simpleHTML);
                     } else {
                         content = this.createInfoWindow("",geoItem.simpleHTML);
                     }
                     size = mstrmojo.dom.position(content);
                     this.infowindow.setContent(content);
                        if (latlng)
                        {
                            this.infowindow.open(this.map, this.infoAnchor);
                        } else {
                            this.infowindow.open(this.map, geoItem);
                        }
                     
                 } else if (this.infoWindowUseGrid) {
                
                     content = this.createGridInfoWindow(dataRows);
                     this.infowindow.setContent(this.infoTabDiv);
                                              
                     if (latlng)
                     {
                         this.infowindow.open(this.map, this.infoAnchor);                   
                     } else {
                         this.infowindow.open(this.map, geoItem);                   
                     }
                                    
                 } else {

                 }
                 
            },
            
            hideInfoWindow:function hideInfoWindow(evt){
                if (this.infowindow)
                {
                    this.infowindow.close();
                }
            },
            
            highlightedGraphics:null,
            currentSelections:null,
            selectedRowIndices:null,
            
            clearHighlightedGraphics:function clearHighlightedGraphics(columnIndex)
            {
            },
            getHighlightedGraphics:function getHighlightedGraphics(columnIndex)
            {
                if (!this.highlightedGraphics)
                {
                    this.highlightedGraphics = {};
                }
                if (!this.highlightedGraphics.hasOwnProperty(columnIndex))
                {
                    this.highlightedGraphics[columnIndex] = [];
                } 
                return this.highlightedGraphics[columnIndex];
                    
            },
            getCurrentSelections:function getCurrentSelection(columnIndex)
            {
                if (!this.currentSelections)
                {
                    this.currentSelections = {};
                }
                if (!this.currentSelections.hasOwnProperty(columnIndex))
                {
                    this.currentSelections[columnIndex] = [];
                }
                return this.currentSelections[columnIndex];
            },
            getSelectedRowIndices:function getSelectedRowIndices(columnIndex)
            {
                if (!this.selectedRowIndices)
                {
                    this.selectedRowIndices = {};
                }
                if (!this.selectedRowIndices.hasOwnProperty(columnIndex))
                {
                    this.selectedRowIndices[columnIndex] = [];
                }
                return this.selectedRowIndices[columnIndex];
            },
            handleDensitySelections:function handleDensitySelections(selections) {
                var columnIndex;
                if (this._useLatlng) {
                    columnIndex = this.latColumnIndex;
                } else {
                    columnIndex = this.pointColumnIndex;
                }
                var markerList = this.getGeoList(columnIndex);
                var marker;
                var markerLatLng;
                var geoIndex;
                var rowIndex;
                var markerSelected;
                
                // get the selection related array
                
                var highlightedGraphics = this.getHighlightedGraphics(columnIndex);
                var currentSelections = this.getCurrentSelections(columnIndex);
                var selectedRowIndices = this.getSelectedRowIndices(columnIndex);
                
                currentSelections.length = 0;
                selectedRowIndices.length = 0;
                this.clearAllHighlight();
                highlightedGraphics.length = 0;
               
                var i;
                
                for (i=0;i<selections.length;i++)
                {
                    var attr = selections[i].attributes;
                    geoIndex = attr.geoIndex;
                    rowIndex = attr.rowIndex;
                    markerSelected = mstrmojo.array.indexOf(currentSelections,geoIndex);
                    if (markerSelected < 0 )
                    {
                        currentSelections.push(geoIndex);
                        selectedRowIndices.push(rowIndex);
                    }
                }
                var sliceInfo = {'pos':columnIndex, 'elementIndex':currentSelections, 'setViewDataFlag':false, 'applyControl':true};
                this.applySelection(sliceInfo);
            },
            handleSelection:function handleSelection(mapObj,event) {
                 if (!this.enableClickSelect) {
                     return;
                 }
                                  
                 var geoIndex = mapObj.attributes.geoIndex,
                     rowIndex = mapObj.attributes.rowIndex,
                     columnIndex,
                     highlightedGraphics,
                     currentSelections,
                     selectedRowIndices,
                     isAdd= true,
                     map = this.map,
                     i, sliceInfo;
                 
                 if (mapObj.geoPosition instanceof Array)
                 {
                     columnIndex = mapObj.geoPosition[0];
                 } else {
                     columnIndex = mapObj.geoPosition;
                 }

                 highlightedGraphics = this.getHighlightedGraphics(columnIndex);
                 currentSelections = this.getCurrentSelections(columnIndex);
                 selectedRowIndices = this.getSelectedRowIndices(columnIndex);
                 
                 
                 //if (evt.ctrlKey && (this.currentSelections !== undefined)) {
                 //if (document.isCtrl) {
                 //console.log("2 control?"+this.isCtrl + ": id = "+ this.mapDiv.id);
                 if (this.isCtrl) {
                     //if control key is pressed, we will do multi-select
                     //note this.currentSeelctions is sorted
                     
                     i = mstrmojo.array.indexOf(currentSelections,geoIndex);
                     if (i != -1) {
                         //found, remove from the list
                         currentSelections.splice(i,1);
                         selectedRowIndices.splice(i,1);
                         
                         var graphicIndex = mstrmojo.array.indexOf(highlightedGraphics, mapObj);
                         if (typeof(mapObj.onisSelectedChange) != 'undefined')
                         {
                             mapObj.set("isSelected",false);
                         } else {
                             mapObj.isSelected = false;
                         }
                         highlightedGraphics.splice(graphicIndex,1);
                         if (typeof(mapObj.image) != 'undefined')
                         {
                             mapObj.setIcon(mapObj.image);
                         }
                   
                     } else {
                         //not found and it's the largest number
                         currentSelections.push(geoIndex);
                         selectedRowIndices.push(rowIndex);
                         
                         highlightedGraphics.push(mapObj);
                         if (typeof(mapObj.onisSelectedChange) != 'undefined')
                         {
                             mapObj.set("isSelected",true);
                         } else {
                             mapObj.isSelected = true;
                         }
                         if (typeof(mapObj.hili) != 'undefined')
                         {
                             mapObj.setIcon(mapObj.hili);
                         }
                     }
                 }  else {
                     this.doClearRectangle();
                     currentSelections.length = 0;
                     currentSelections.push(geoIndex);
                     selectedRowIndices.length = 0;
                     selectedRowIndices.push(rowIndex);
                     this.clearAllHighlight();//TODO
                     if (typeof(mapObj.onisSelectedChange) != 'undefined')
                     {
                         mapObj.set("isSelected",true);
                     } else {
                         mapObj.isSelected = true;
                     }
                     if (typeof(mapObj.hili) != 'undefined')
                     {
                         mapObj.setIcon(mapObj.hili);
                     }
                     highlightedGraphics.length = 0;
                     highlightedGraphics.push(mapObj);
                     
                 }
                 sliceInfo = {'pos':columnIndex, 'elementIndex':currentSelections, 'setViewDataFlag':false, 'applyControl':true};
                 this.applySelection(sliceInfo);
                 this.setDrilLButtonEnable();
                 return currentSelections;
             },
             clearAllHighlight:function clearAllHighlight() {
                 var i,j;
                 for ( i in this.highlightedGraphics)
                 {
                     if (this.highlightedGraphics[i] instanceof Array)
                     {
                         var highlightedGraphics = this.highlightedGraphics[i];
                         var hilightCount = highlightedGraphics.length;
                         for ( j=0; j< hilightCount;j++) {
                             var g = highlightedGraphics[j];
                             if (typeof(g.onisSelectedChange) != 'undefined')
                             {//marker
                                 g.set("isSelected",false);
                             } else {//shape
                                 g.isSelected = false;
                                 if (g.image) {
                                     g.setIcon(g.image);
                                 }
                                 else 
                                  {
                                     if(g.setOptions)
                     {
                                      g.setOptions({strokeColor: (g.isHighlighted ? this.highlightedStroke: this.regularStroke)});
                                     }
                                  } 
                             }
                         }
                     }
                 }
             },
             
             getSelectionInfo : function(sliceInfo){
                 var newIndicesKey = sliceInfo.elementIndex.sort().join("_");
                 if (this.currentSelectedIndex === newIndicesKey) {
                     return;
                 }
                 
                 this.currentSelectedIndex = newIndicesKey;
                 
                 var geoPosition = sliceInfo.pos,
                     geoAttributeSelector = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(geoPosition).getSelectorControl();
                 
                 
                 if (!geoAttributeSelector) {
                     return;
                 }
                        
                 var targetKeys = geoAttributeSelector.tks,
                     controlKeyContext = geoAttributeSelector.ck,
                     controlKey = geoAttributeSelector.ckey,
                     elementsList,
                     elementIDs = [],
                     numElements = sliceInfo.elementIndex.length,
                     itemSeparator = '\x1e';// ascii item separator;
                 var i;
                 for (i=0; i<numElements;i++) {
                     //TODO need new ID's
                     elementIDs.push(this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(geoPosition).getHeaderValues()[sliceInfo.elementIndex[i]].id);
                 }

                 elementsList = elementIDs.join(itemSeparator);
                 
                 return {targetKeys:targetKeys,
                         elementsList:elementsList,
                         controlKeyContext:controlKeyContext,
                         controlKey:controlKey};
                 
             },
             
             /*
              * old model manipulation functions
              */
             applySelection:function applySelection(sliceInfo) { // sliceInfo needs pos and elementIndex.
                 
                 var sInfo = this.getSelectionInfo(sliceInfo),
                     ac = [],
                     beanPath,
                     docView,
                     targetKeys = sInfo && sInfo.targetKeys,
                     elementsList = sInfo && sInfo.elementsList,
                     controlKey = sInfo && sInfo.controlKey,
                     controlKeyContext = sInfo && sInfo.controlKeyContext;
                     //gridBone = microstrategy.bone(this.gridParams.boneId);
                 
                 if (this.gridParams.isRW){
                     docView = this.gridBone.getDocViewer();
                     beanPath = docView.beanPath;
                 } else {
                     //beanPath = mstrApp.beanPath;
                     beanPath = this.gridParams.beanPath;
                 }
                 if ( targetKeys ) {//We will submit changes only if there is something to re-render
                     this.addAction(null, mstrUpdateManager.SET_CUR_CTL_ELEMENTS, beanPath,
                             ["2048130", "2048127","2048116","2048137","2048138","2048018"],
                             [controlKey, elementsList, targetKeys, controlKeyContext, "1","false"],
                             ac
                             );
                     microstrategy.updateManager.add(ac);
                     microstrategy.updateManager.flushAndSubmitChanges();
                 }
                 
                 
             },
             addAction:function addAction(elem, actId, bp, args, argv, ac) {
                bp = bp || this.beanPath;
                args = args || [];
                argv = argv || [];
                
                var a = microstrategy.updateManager.createActionObject(elem, actId, bp, args, argv, []);
                if (ac) {
                    ac.push(a);
                } else {
                    microstrategy.updateManager.add([a]);
                    microstrategy.updateManager.flushAndSubmitChanges();
                }    
            },
             
             /*
              * retrieve the rows which has the element with elementIndex on position index.
              * ie, category is the nth attribute on row headers, and book is the first element of the category
              * given pos=2 and elementIndex = 1, this function will return all rows indices that have book as the second
              * column attribute.
              */
             retrieveDataRows:function retrieveDataRows(sliceInfo) { // sliceInfo needs pos and elementIndex.
                // init data rows.
                var dataRows = [];
                var j,k;
                if(sliceInfo){
                     // decode slice info.
                     var geoElemIdx = parseInt(sliceInfo.elementIndex,10);
                     var pos;
                     if (sliceInfo.pos instanceof Array) {
                         pos = sliceInfo.pos;
                     } else {
                         pos = [parseInt(sliceInfo.pos,10)]; 
                     }
                     // check if it is not the Geo Attribute.
                     
                     if (!this.viewCache) {
                         this.viewCache = {};
                     }
                     // First, retrieve from cache if exists.
                     if( this.viewCache[geoElemIdx] ){  // if cached.
                         dataRows = this.viewCache[geoElemIdx]; 
                     }
                     else{ // not cached, then do slicing.
                         
                         
                         var numRows = this.getMapModel(PRIMARY_DATA_PROVIDER).getTotalRows();
                         var validRow;
                         for(k=0;k<numRows;k++) {
                             // element keys for the row.
                             var rowHeader =  this.getMapModel(PRIMARY_DATA_PROVIDER).getRowHeaders(k);
                             validRow = true;
                             for (j=0; j< pos.length;j++)
                             {
                                 var cellHeader =  rowHeader.getHeader(pos[j]);
                                 if (!cellHeader || cellHeader.getElementIndex() != geoElemIdx){
                                     validRow = false;
                                     break;
                                 }
                             }
                             
                             if (validRow) {
                                 dataRows.push(k);
                             }
                             
                         }
                         // add into cache.
                         this.viewCache[geoElemIdx] = dataRows;
                     }
                 }
                 return dataRows;
            },
            
            columnIndices : {"state":-1,"zip":-1},
            
            shapePosition : -1,
            onshapePositionChange: function ongeoPositionChange() {
                if (this.shapePosition>=0 && this.shapePosition < this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().size()) {
                    this.geoElements = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(this.shapePosition).getHeaderValues();
                } else {
                    this.geoElements = [];
                }
            },
            
            geoElements : {},
            mapLayers:[],

            createSimpleInfoHTML:function createSimpleInfoHTML(rowIndex,attributes)
            {
                var s="",
                    priModel = this.getMapModel(PRIMARY_DATA_PROVIDER),
                    rowCell,
                    rowCellTitle,
                    rowCellValue,
                    rowHeaders = priModel.getRowHeaders(rowIndex),
                    rowTitles = priModel.getRowTitles(),
                    colTitle = priModel.getColTitles(),
                    colHeaderCount = priModel.getColumnHeaderCount(),
                    k,j;
                    
                for (k=0;k<rowHeaders.size();k++)
                {
                    if (k=== this.latColumnIndex || k === this.longColumnIndex || k=== this.shapePosition  || k === this.pointColumnIndex)
                    {
                        continue;
                    }
                                        
                    rowCellTitle = rowTitles.getTitle(k).getName();
                    
                    rowCellValue = rowHeaders.getHeader(k).getName();
                    attributes[this.replaceSpace(rowCellTitle)]=rowCellValue;
                    
                    s+="<b>"+rowCellTitle+"</b>: "+rowCellValue+"<br />";
                }
                //TODO might need to change the metrics string here.
                if (colTitle.size() ===1 && colTitle.getTitle(0).getName()==="Metrics"){
                    //only add metric if we have metrics on the column
               
                    rowHeaders = colTitle.getTitle(0).getHeaderValues();
                    
                    for (j=0;j < colHeaderCount;j++){
                        var dataRow =  priModel.getMetricValue(rowIndex,j);
                        
                        rowCellTitle = rowHeaders[j].n;
                        rowCellValue = dataRow.getValue();
                        var thresholdType = dataRow.getThresholdType();
                                                
                        if (!thresholdType || thresholdType === this.enumNumber) {
                            s+="<b>"+rowCellTitle+"</b>: "+rowCellValue+"<br />";
                            attributes[this.replaceSpace(rowCellTitle)]=rowCellValue;
                        } else {
                            s+="<b>"+rowCellTitle+"</b>: "+dataRow.getRawValue()+"<br />";
                            attributes[this.replaceSpace(rowCellTitle)]=dataRow.getRawValue();
                        }                        
                    }
                }
                return "<div>"+s+"</div>";
            },
          
            centerMap:function centerMap()
            {
                if (this.bounds)
                {
                   this.map.setCenter(this.bounds.getCenter());
                    
                   if (this.getMapModel(PRIMARY_DATA_PROVIDER) && this.getMapModel(PRIMARY_DATA_PROVIDER).getTotalRows() > 1) {
                     this.map.fitBounds(this.bounds);
                   }
                }
            },
            loadShape:function loadShape(shapeData)
            {
                var polygonJson;
                var points;
                var pointJson;
                var latlng;
                var path;
                var geoName;
                var attributes;
                var colorString;
                var ymin,ymax,xmin,xmax;
                
                var shapeList = this.getGeoList(this.shapePosition);
                shapeList.length=0;
                
                var dataLookup = this.createLookup();
                var i,j;
                if (shapeData instanceof Array)
                {
                    for (i=0; i< shapeData.length; i++)
                    {
                        var shapeElement = shapeData[i];
                        path = [];
                        //attributes = {};
                        if (shapeElement && shapeElement.hasOwnProperty("Polygon"))
                        {
                            polygonJson = shapeElement.Polygon;
                            points = polygonJson.Pts;
                            geoName = polygonJson.Attribs.NAME;
                            attributes = polygonJson.Attribs;
                            ymin = polygonJson.Box.Ymin;
                            ymax = polygonJson.Box.Ymax;
                            xmin = polygonJson.Box.Xmin;
                            xmax = polygonJson.Box.Xmax;
                            var rowIndex = dataLookup[geoName].rowIndex;
                            attributes.rowIndex = rowIndex;
                            attributes.geoIndex = dataLookup[geoName].geoIndex;
                            if (points instanceof Array)
                            {
                                for (j=0; j< points.length; j++)
                                {
                                    pointJson = points[j];
                                    latlng = new google.maps.LatLng(pointJson[1],pointJson[0]);
                                    path.push(latlng);
                                }
                            }
                            var colorString = this.getMapModel(PRIMARY_DATA_PROVIDER).getMetricValue(rowIndex,this.selectedMetricIndex).getThresholdValue("#000000");
                            var polygon = new google.maps.Polygon({
                                paths: path,
                                strokeColor: this.regularStroke,
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                fillColor: colorString,
                                fillOpacity: 0.75,
                                geoPosition:this.shapePosition,
                                attributes:attributes,
                                simpleHTML:this.createSimpleInfoHTML(rowIndex,attributes),
                                bounds:new google.maps.LatLngBounds(new google.maps.LatLng(ymin,xmin),new google.maps.LatLng(ymax,xmax)),
                                isHighlighted:false,
                                isSelected:false
                            });
                            var that = this;
                            google.maps.event.addListener(polygon, "mouseover", function(event){
                                //this.strokeColor = "#000000";
                                //var opts = this.getOptions();
                                this.isHighlighted = true;
                                this.setOptions({strokeColor:that.highlightStroke});
                                that.showInfoWindow(this,event.latLng);
                            });
                            google.maps.event.addListener(polygon,"mouseout", function (event){
                                this.isHighlighted = false;
                                if (this.isSelected)
                                {
                                    this.setOptions({strokeColor:that.selectedStroke});
                                } else {
                                    this.setOptions({strokeColor:that.regularStroke});
                                }
                            });
                            google.maps.event.addListener(polygon,"click",function (event) {
                                //that.handleShapeClick(this);
                                if (that.enableAreaSelect)
                                {
                                    that.onMouseClick(event);
                                } 
                                that.handleSelection(this,event);
                            })
                            polygon.setMap(this.map);
                            this.bounds.union(new google.maps.LatLngBounds(
                                    new google.maps.LatLng(polygonJson.Box.Ymin,polygonJson.Box.Xmin),
                                    new google.maps.LatLng(polygonJson.Box.Ymax,polygonJson.Box.Xmax)));
                            shapeList.push(polygon);
                        }
                    }
                }
                this.centerMap();
            },
        
                    //console.log(attribute.n+":"+attribute.id);
            /**
             * rectangular search functions
             * curpolygon is the polygon currently used as the search rectangle
             */
            curpolygon:null,
            curpolygonList:null, //polygon, the current stored polygon
            bolAfterMouseDown:false, //flag, if mouse down has happened
            searchBounds:null, //latlngbounds, final search area
            startLatLng:null,
            getLatLngFromPoint:function getLatLngFromPoint(x,y)
            {
                var mapbounds = this.map.getBounds(),                
                    width = this.width,                
                    height = this.height,
                    ne = mapbounds.getNorthEast(),
                    sw = mapbounds.getSouthWest(),
                    west = sw.lng(),
                    east = ne.lng(),
                    north = ne.lat(),
                    south = sw.lat(),
                    position = mstrmojo.dom.position(this.domNode,true),                
                    lat = north - (north - south)* (y-position.y)/height,                
                    lng = west + (east - west) * (x-position.x) / width;
                    
//                console.log("east="+east+"|south="+south+"|west="+west+"|north="+north);
//                console.log("x="+x+";y="+y);
//                console.log("self calculation: lng="+lng+";lat="+lat);
                return new google.maps.LatLng(lat,lng);
            },
            test2:function test2(x,y)
            {
                var projection = this.map.getProjection();
                var position = mstrmojo.dom.position(this.domNode,true);
                var point = new google.maps.Point(x-position.x,y-position.y);
                var latlng = projection.fromPointToLatLng(point);
                //console.log("From Projection: lng="+latlng.lng()+":lat="+latlng.lat());
            },
            doClearRectangle: function doClearRectangle(forceClear)
            {
                if (!forceClear && !this.enableAreaSelect) {
                    return;
                }
                var i;
                for (i=0; i< this.curpolygonList.length; i++) {
                    this.curpolygonList[i].setMap(null);                    
                }
                this.curpolygonList.length = 0;
            },
            toggleDragging:function toggleDragging(bolEnableDrag)
            {
                //var opts = this.map.getOptions;
                var opts = {
                        draggable:bolEnableDrag
                    };
                
                this.map.setOptions(opts);
            },
           
            onMouseClick:function onMouseClick(event)
            {
                if (!this.enableAreaSelect) return;
                
                if (this.bolAfterMouseDown) {
                    this.drawRectangleEnd(event);
                } else {
                    this.drawRectangleStart(event);
                }
                
            },
            drawRectangleStart:function drawRectangleStart(event)
            {
                //instead of adding a canvas rectanle, add a polygon overlay
                //console.log("mouse down" + "document.isCtrl="+document.isCtrl+"|this.isCtrl="+this.isCtrl+"|Event.isCtrl"+event.isCtrl);
                //if (!document.isCtrl){
                if (!this.isCtrl){
                    this.doClearRectangle();
                }
                var startlatlng;
                if (event.latLng)
                {
                    startlatlng = event.latLng;
                }
                else {
                    startlatlng = this.getLatLngFromPoint(event.clientX,event.clientY);
                    this.test2(event.clientX,event.clientY);
                }
                
                //return;
                var path = 
                    [
                     new google.maps.LatLng(startlatlng.lat(),startlatlng.lng()),
                     new google.maps.LatLng(startlatlng.lat(),startlatlng.lng()),
                     new google.maps.LatLng(startlatlng.lat(), startlatlng.lng()),
                     new google.maps.LatLng(startlatlng.lat(), startlatlng.lng()),
                     new google.maps.LatLng(startlatlng.lat(),startlatlng.lng())
                    ];
                var polygon = new google.maps.Polygon(
                    {
                        paths:path,
                        strokeColor: "#0000FF",
                        strokeWeight: 2,
                        strokeOpacity: 1.0,
                        fillColor: "#067EE3",
                        //fillColor:"#00FF00",
                        fillOpacity: 0.5
                });
                var that = this;
                google.maps.event.addListener(polygon,"click",function (event) {
                    that.onMouseClick(event);
                });
                google.maps.event.addListener(polygon,"mousemove",function (event) {
                    that.onMouseMove(event);
                });
                                
               this.startLatLng = startlatlng;
               this.curpolygon = polygon;
               this.curpolygon.setMap(this.map);
               this.curpolygonList.push(polygon);
               this.bolAfterMouseDown  = true;
           },
           onMouseMove: function onMouseMove(event)
           {
               //as mouse moves update the extent of the polygon overlay
               
               if (!this.enableAreaSelect) return;
               
               var startlatlng = this.startLatLng;
               //return;
               var currentLatLng;
               if (event.latLng)
               {
                   currentLatLng = event.latLng;
               }
               else {
                   currentLatLng = this.getLatLngFromPoint(event.clientX,event.clientY);
                      //this.test2(event.clientX,event.clientY);
               }
               if (this.bolAfterMouseDown)
               {
                   
                   var path = 
                       [
                        new google.maps.LatLng(startlatlng.lat(),startlatlng.lng()),
                        new google.maps.LatLng(currentLatLng.lat(),startlatlng.lng()),
                        new google.maps.LatLng(currentLatLng.lat(), currentLatLng.lng()),
                        new google.maps.LatLng(startlatlng.lat(), currentLatLng.lng()),
                        new google.maps.LatLng(startlatlng.lat(),startlatlng.lng())
                       ];
                   this.curpolygon.setPath(path);
               
                }
            },
            drawRectangleEnd: function drawRectangleEnd(event)
            {
                if (!this.enableAreaSelect) return;
                //when finished, get extent of overlay
                var startlatlng = this.startLatLng,
                    endlatlng;
                    
                if (event.latLng)
                {
                    endlatlng = event.latLng;
                }
                else {
                    endlatlng = this.getLatLngFromPoint(event.clientX,event.clientY);
                    this.test2(event.clientX,event.clientY);
                }
                //return;
                var path = 
                    [
                        new google.maps.LatLng(startlatlng.lat(),startlatlng.lng()),
                        new google.maps.LatLng(endlatlng.lat(),startlatlng.lng()),
                        new google.maps.LatLng(endlatlng.lat(), endlatlng.lng()),
                        new google.maps.LatLng(startlatlng.lat(), endlatlng.lng()),
                        new google.maps.LatLng(startlatlng.lat(),startlatlng.lng())
                    ];
                this.curpolygon.setPath(path);
                            
                this.bolAfterMouseDown  = false;
              
                this.searchBounds = this.createSearchBounds(startlatlng, endlatlng);
                
                if (this.enableLatLng || this.enablePoint)
                {
                    this.rectangleMarkerSearch(this.isCtrl);
                    if(this._affinityGlow)
                    {
                        if (!this._selectedAffinityMarkers) {
                               this._selectedAffinityMarkers = new Object();                
                        }
                        var highlightedGraphics = this.getHighlightedGraphics(this.latColumnIndex);
                        var sourceIds = new Object();
                        for (marker  in highlightedGraphics) {                        
                            var id = highlightedGraphics[marker].attributes.id;                            
                            sourceIds[this.getElementIdWithoutAttributeID(id)] = id;
                        }                
                        //start the animation
                        this.startAffinityLinesAnimation(sourceIds);                
                        return;
                    }

                }
                if (this.enableShape)
                {
                   // this.rectangleShapeSearch();                 
                }
                this.setDrilLButtonEnable();
                
            },
            
            createClusterBounds:function createClusterBounds(latlng,width,height)
            {
                var mapBounds = this.map.getBounds();
                var mapNorthEast = mapBounds.getNorthEast();
                var mapSouthWest = mapBounds.getSouthWest();
                var mapEast = mapNorthEast.lng();
                var mapNorth = mapNorthEast.lat();
                var mapSouth = mapSouthWest.lat();
                var mapWest = mapSouthWest.lng();
                var latDistance = (mapEast > mapWest) ? mapEast - mapWest : 360+mapEast - mapWest;
                var pixelPerLng = this.width /latDistance;
                var pixelPerLat = this.height / (mapNorth - mapSouth);
                
                var south = latlng.lat() - height /pixelPerLat;
                var north = latlng.lat() + height /pixelPerLat;
                var east = latlng.lng() + width /pixelPerLng;
                var west = latlng.lng() - width /pixelPerLng;
                
                return new google.maps.LatLngBounds(new google.maps.LatLng(south,west),new google.maps.LatLng(north,east));
                
            },
            // create the correct LatLngBounds based on the screen point location
            createSearchBounds:function createSearchBounds(startlatlng,endlatlng)
            {
                var startlat = startlatlng.lat();
                var startlng = startlatlng.lng();
                var endlat = endlatlng.lat();
                var endlng = endlatlng.lng();
                var north, south,east,west;
                //lat does not wrap, based it on value comparison
                if (startlat > endlat)
                {
                    north = startlat;
                    south = endlat;
                } else {
                    north = endlat;
                    south = startlat;
                }
                
                //lng wrap, based it on screen point
                var projection = this.map.getProjection();
                var startPoint = projection.fromLatLngToPoint(startlatlng);
                var endPoint = projection.fromLatLngToPoint(endlatlng);
                
                if (startPoint.x < endPoint.x) {
                    west = startlng;
                    east = endlng;
                } else {
                    west = endlng;
                    east = startlng;
                }
                return new google.maps.LatLngBounds(new google.maps.LatLng(south,west),
                                                    new google.maps.LatLng(north,east));
            },
            rectangleMarkerSearch:function rectangleMarkerSearch(isCtrl)
            {
                if (!this.searchBounds) return;
                var columnIndex;
                if (this._useLatlng) {
                    columnIndex = this.latColumnIndex;
                } else {
                    columnIndex = this.pointColumnIndex;
                }
                var markerList = this.getGeoList(columnIndex);
                var marker;
                var markerLatLng;
                var geoIndex;
                var rowIndex;
                var markerSelected;
                
                // get the selection related array
                
                var highlightedGraphics = this.getHighlightedGraphics(columnIndex);
                var currentSelections = this.getCurrentSelections(columnIndex);
                var selectedRowIndices = this.getSelectedRowIndices(columnIndex);
                if (!isCtrl) 
                {
                    currentSelections.length = 0;
                    selectedRowIndices.length = 0;
                    this.clearAllHighlight();
                    highlightedGraphics.length = 0;
                }
                var i;
                if (this.isDensityMap()) {
                    var selection = this.densityLayer.searchRect(this.searchBounds);
                    for (i=0;i<selection.length;i++)
                    {
                        var attr = selection[i].attributes;
                        geoIndex = attr.geoIndex;
                        rowIndex = attr.rowIndex;
                        markerSelected = mstrmojo.array.indexOf(currentSelections,geoIndex);
                        if (markerSelected < 0 )
                        {
                            currentSelections.push(geoIndex);
                            selectedRowIndices.push(rowIndex);
                        }
                    }
                } else {
                    for (i=0;i<markerList.length;i++)
                    {
                        marker = markerList[i];
                        markerLatLng = marker.getPosition();
                        geoIndex = marker.attributes.geoIndex;
                        rowIndex = marker.attributes.rowIndex;
                        markerSelected = mstrmojo.array.indexOf(currentSelections,geoIndex);
                    if ((markerSelected < 0 ) && this.searchBounds.contains(markerLatLng))
                    {
                         
                         currentSelections.push(geoIndex);
                         selectedRowIndices.push(rowIndex);
                         if (marker instanceof mstrmojo.gmaps.CustomMarker)
                         {
                             marker.set("isSelected",true);
                         } else if (marker.hili) {
                             marker.isSelected = true;
                             marker.setIcon(marker.hili);
                         }
                         highlightedGraphics.push(marker);
                    }
                }
                }
                if(this._affinityGlow)
                    return;

                var sliceInfo = {'pos':columnIndex, 'elementIndex':currentSelections, 'setViewDataFlag':false, 'applyControl':true};
                this.applySelection(sliceInfo);
            },
            setPolygonStroke:function setPolygonStroke(polygon)
            {
                if (polygon.isHighlighted)
                {
                    polygon.setOptions({strokeColor:this.highlightStroke});
                } else if (polygon.isSelected){
                    polygon.setOptions({strokeColor:this.selectedStroke});
                } else {
                    polygon.setOptions({strokeColor:this.regularStroke});
                }
            },
            
            rectangleShapeSearch:function rectangleShapeSearch()
            {
                if (!this.searchBounds) return;
                var shapeList = this.getGeoList(this.shapePosition);
                var polygon;
                var polygonBounds;
                var geoIndex;
                var rowIndex;
                var xmin,ymin,xmax,ymax;
                
                //get the selection arrays
                var columnIndex = this.shapePosition;
                var highlightedGraphics = this.getHighlightedGraphics(columnIndex);
                var currentSelections = this.getCurrentSelections(columnIndex);
                var selectedRowIndices = this.getSelectedRowIndices(columnIndex);
                
                //clear the previous selections
                currentSelections.length = 0;
                selectedRowIndices.length = 0;
                this.clearAllHighlight();
                highlightedGraphics.length = 0;
                var i;
                for (i=0;i<shapeList.length;i++)
                {
                    polygon = shapeList[i];
                    polygonBounds = polygon.bounds;
                    geoIndex = polygon.attributes.geoIndex;
                    rowIndex = polygon.attributes.rowIndex;
                    
                    if (this.searchBounds.intersects(polygonBounds)&& this.intersectPolygon(polygon))
                    {
                         
                         currentSelections.push(geoIndex);
                         selectedRowIndices.push(rowIndex);
                         //if (polygon instanceof google.maps.polygon)
                         //{
                             polygon.set("isSelected",true);
                             this.setPolygonStroke(polygon);
                         //}
                         highlightedGraphics.push(polygon);
                         //console.log(polygon.attributes.NAME + " intersect");
                    } else {
                         //console.log(polygon.attributes.NAME + " Not intersect");
                    }
                }
                var sliceInfo = {'pos':columnIndex, 'elementIndex':currentSelections, 'setViewDataFlag':false, 'applyControl':true};
                this.applySelection(sliceInfo);
            },
            intersectPolygon:function intersectPolygon(polygon)
            {
                var paths = polygon.getPaths();
                if (!paths) return false;
                var i;
                for (i=0;i< paths.length;i++)
                {
                    if (this.intersectPath(paths.getAt(i))) {
                        return true;
                    }
                }
                return false;
                
            },
            intersectPath:function intersectPath(path)
            {
                if (!path || !(path instanceof google.maps.MVCArray) )
                {
                    return false;
                }
                if (this.doesPathContainsPoint(path,this.searchBounds.getNorthEast())){
                    return true;
                }
                var j=0;
                var i;
                for (i=0; i< path.length;i++)
                {
                    j++;
                    j = j % path.length;
                    if (this.intersectSegment(path.getAt(i),path.getAt(j))){
                        return true;
                    }
                }
                return false;
            },
            intersectSegment:function intersectSegment(v1,v2)
            {
                if (!this.searchBounds) return false;
                //taking care of the trivial case
                if (this.searchBounds.contains(v1) || this.searchBounds.contains(v2)) return true;
                var ne = this.searchBounds.getNorthEast();
                var sw = this.searchBounds.getSouthWest();
                var xmin = sw.lng();
                var xmax = ne.lng();
                var ymin = sw.lat();
                var ymax = ne.lat();
                var x1 = v1.lng();
                var y1 = v1.lat();
                var x2 = v2.lng();
                var y2 = v2.lat();
                var minPx = Math.min(x1,x2);
                var maxPx = Math.max(x1,x2);
                var minPy = Math.min(y1,y2);
                var maxPy = Math.max(y1,y2);
          
                var intersectValue;
                //check vertical bound
                if (x1 != x2) {
                    //check east bound
                    if (xmax >= minPx && xmax <= maxPx)
                    {
                        intersectValue = (y2 - y1)/(x2-x1)*(xmax-x1)+y1;
                        if (intersectValue <=ymax && intersectValue >= ymin)
                        {
                            return true;
                        }
                    }
                    
                    //check west bound
                    if (xmin >= minPx && xmin <= maxPx)
                    {
                        intersectValue = (y2 - y1)/(x2-x1)*(xmin-x1)+y1;
                        if (intersectValue <=ymax && intersectValue >= ymin )
                        {
                            return true;
                        }
                    }
                }
                
                
                //check horizontal bound
                if (y2 != y1) {
                    //check north bound
                    if (ymax >=minPy && ymax <= maxPy)
                    {
                        intersectValue = (x2 - x1)/(y2-y1)*(ymax-y1)+x1;
                        if (intersectValue <=xmax && intersectValue >= xmin) {
                            return true;
                        }
                    }
                    //check south bound
                    if (ymin >=minPy && ymin <= maxPy)
                    {
                        intersectValue = (x2 - x1)/(y2-y1)*(ymin-y1)+x1;
                        if (intersectValue <=xmax && intersectValue >= xmin) {
                            return true;
                        }
                    }
                }
                
                return false;
            },
            
            doesPathContainsPoint:function doesPathContainsPoint(path,latlng)
            {
                if (!path || !latlng) 
                {
                    return false;
                }
                var oddNodes = false;
                var x = latlng.lng();
                var y = latlng.lat();
                var v1;
                var v2;
                var x1;
                var y1;
                var x2;
                var y2;
                var j=0;
                var i;
                for (i=0; i< path.length; i++)
                {
                    j=(j+1) % path.length;
                    v1 = path.getAt(i);
                    v2 = path.getAt(j);
                    x1 = v1.lng();
                    y1 = v1.lat();
                    x2 = v2.lng();
                    y2 = v2.lat();
                    if (((y1 < y) && (y<= y2)) || ((y2<y) && (y<= y1))) {
                        if (x1 + (x2 - x1) * ( y - y1)/(y2 - y1) < x) {
                            oddNodes = !oddNodes;
                        }
                    }
                }
                return oddNodes;
            },
            
            findWrapperDom:function findWrapperDom()
            {
                //we need to find 9 parents up
                //for each VBox|HBox, we have table->tbody->tr>td 4 wrappers.
                //we use 1 VBox and 1 HBox and need to find 1 parent up
                //This means 9 parent level up
                return this.domNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            },
            
            docDrill:function docDrill(valueDrillKey, valueDisplayMode, valueDrillElementList, isWithin)
            {
                
                
                
                //var gridBone = microstrategy.bone(mstrApp.boneId);
                //var gridBone = microstrategy.bone(this.gridParams.boneId);
                var viewerId = this.gridBone.viewerId;
                var rwBone = microstrategy.bone(viewerId);
                
                try {
                    
                    var containerDomObj = this.findWrapperDom();
                    this.updateManager = microstrategy.updateManager;
                    //console.log("Assigned BeanPath "+this.gridParams.beanPath);
                    //console.log("message id" +this.gridParams.msgID);

                    
                    var retainParent = this.gridBone.drillRetainParentValue;
                    var retainThreshold = this.gridBone.drillKeepThreshValue;
            
                    var action = null;
                    
                    action = this.updateManager.createActionObject(containerDomObj, mstrUpdateManager.GRID_DRILL_OUTSIDE, "mstrweb",
                            ["3141", "3142", "3144", "3143", "3146", "3010", "3151", "3152"],
                            //[valueDrillKey, retainParent, retainThreshold, valueDrillElementList, valueDisplayMode, rwBone.messageID, "", mstrApp.sliceID],
                            [valueDrillKey, retainParent, retainThreshold, valueDrillElementList, valueDisplayMode, rwBone.messageID, "", this.gridParams.sliceID],
                            []); 
                    
                    
                    this.updateManager.useIframe = this.drillIframeEnabled; 
            
                    if (action) {
                        var actionCollection = [];
                        actionCollection.push(action);
                        this.updateManager.add(actionCollection);
                        this.updateManager.flushAndSubmitChanges();
                        this.updateManager.acknowledgeRequest();
                    }
            
                    return false;
            
                }
                catch(err) {
                    //console.log(err);
                    return false;
                }
                
            },
            reportDrill:function reportDrill(valueDrillKey, valueDisplayMode, valueDrillElementList, isWithin)
            {
                try {
                    
                    var containerDomObj = this.findWrapperDom();
                    this.updateManager = microstrategy.updateManager;
                    //this.beanPath = "mstrWeb.report.frame.rb.vb";
                    //console.log("Assigned BeanPath "+mstrApp.beanPath);

                    
                    var retainParent = "";
                    var retainThreshold = "";
            
                    var action = null;
                    
                    
                    //action = this.updateManager.createActionObject(containerDomObj, mstrUpdateManager.GRID_DRILL, mstrApp.beanPath,
                    action = this.updateManager.createActionObject(containerDomObj, mstrUpdateManager.GRID_DRILL, this.gridParams.beanPath,
                        ["4178", "4034", "4134", "4035", "4212"],
                        [valueDrillKey, retainParent, retainThreshold, valueDrillElementList, valueDisplayMode],
                        []);
                    
                    this.updateManager.useIframe = this.drillIframeEnabled; 
            
                    if (action) {
                        var actionCollection = [];
                        actionCollection.push(action);
                        this.updateManager.add(actionCollection);
                        this.updateManager.flushAndSubmitChanges();
                        this.updateManager.acknowledgeRequest();
                    }
            
                    return false;
            
                }
                catch(err) {
                    //console.log(err);
                    return false;
                }
            },
            regularDrill:function regularDrill(valueDrillKey, valueDisplayMode, valueDrillElementList, actionType,isWithin,columnIndex) 
            {
                //testing link drill
                   
                if (actionType === undefined || isNaN(actionType)) {
                    return;
                }
                if ((actionType & HYPERLINK_ACTION )>0) {
                    this.execHL(columnIndex);//should not be here
                } else if ((actionType & DRILLING_ACTION )>0){
                    //if (mstrApp.isRW) {
                    if (this.gridParams.isRW) {
                        this.docDrill(valueDrillKey, valueDisplayMode, valueDrillElementList, isWithin);
                    } else {
                        microstrategy.bones[this.gridParams.boneId].drill(valueDrillKey, valueDisplayMode, valueDrillElementList, isWithin);
                        //this.reportDrill(valueDrillKey, valueDisplayMode, valueDrillElementList, isWithin);
                    }
                }
            },
            getGeoIndex:function getGeoIndex() {
                return this.shapePosition;
            },
            setDrilLButtonEnable:function setDrillButtonEnable()
            {
                this.toolbar.drillButton.set("enabled",this.getDrillStatus());
            },
            getDrillStatus:function getDrillStatus()
            {
                return this.getDrillStatusByColumnIndex(this.shapePosition) || this.getDrillStatusByColumnIndex(this.latColumnIndex);
            },
            getDrillStatusByColumnIndex:function getDrillStatusByColumnIndex(index)
            {
                var selected = this.getSelectedRowIndices(index);
                if ( selected === undefined || !selected instanceof Array || selected.length === 0) {
                    return false;
                }

                //TODO DRILL
                var actionType = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowHeaders(selected[0]).getHeader(index).getActionType();
                if (actionType === undefined || isNaN(actionType)) {
                    return false;
                }
                
                if ((actionType & HYPERLINK_ACTION )>0) { 
                    return true;
                }
                if (this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(index).getDrillPath()){
                    return true;
                }
                return false;
            },
            
            // drilling section
            processDrill:function processDrillRequest(){
                if (this.enableShape)
                {
                    this.shapeDrill();
                }
                
                if (this.enableLatLng)
                {
                    this.latlngDrill();
                }
                if (this.enablePoint)
                {
                    this.doDrill(this.pointColumnIndex);
                }
            },
            
            latlngDrill:function latlngDrill() {
                this.doDrill(this.latColumnIndex);
            },
            shapeDrill:function shapeDrill() {
                this.doDrill(this.shapePosition)
            },
            getRowAxisAttributeIndex:function getRowAxisAttributeIndex(columnIndex) {
                var titles = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles();
                if (typeof(columnIndex)=='undefined' || columnIndex >= titles.size())
                {
                    return -1;
                }
                var attributeIndex = -1,
                    attributeLookup = {},
                    i;
                for (i=0; i<= columnIndex; i++){
                    if (typeof (attributeLookup[titles.getTitle(i).getUnitId()]) == 'undefined'){
                        attributeLookup[titles.getTitle(i).getUnitId()] = 1;
                        attributeIndex++;
                    }
                }
                return attributeIndex;
            },
            doDrill:function doDrill(index) {
                var selected = this.getSelectedRowIndices(index);
                if ( selected === undefined || !selected instanceof Array || selected.length === 0) {
                    return;
                }

                //TODO DRILL
                var actionType = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowHeaders(selected[0]).getHeader(index).getActionType();
                if (actionType === undefined || isNaN(actionType)) {
                    return;
                }
                
					//if we are in express mode both link drilling and drilling are carried by the xTabModel
					if (this.isOIVM()) {
					   var cells = [];					   
					   this.xtabModel.xtab.sid = this.node.data.sid; 
					   for(var i = 0; i < selected.length; i++)
					   {
					   	 var cell =  this.getMapModel(PRIMARY_DATA_PROVIDER).getRowHeaders(selected[i]).getHeaderCell(index);
						 cell.axis = 1;  //ROW AXIS
					   	 cells.push(cell);
					   }
					   this.execDynamiclLink2(cells);
					   return;
					}
					
					if ((actionType & HYPERLINK_ACTION )>0) 
					{
						this.execHL(index);
						return;
					}
                    
                
                
                var elementList = [];
                
                var adjustGeoRowAxisColumnIndex = this.getRowAxisAttributeIndex(index) + 1;
                var i;
                for (i=0;i<selected.length;i++){
                    var element = "1A"+adjustGeoRowAxisColumnIndex+"A"+selected[i];
                    elementList.push(element);
                }
                
                this.regularDrill(this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(index).getDrillPath()[0].k,"-1",elementList,actionType,index);
            },
            
            /**
             * link drilling functions
             */
            execHL: function execHL(columnIndex,parentElemsIndex, linkIndex) 
            {
                //@class=mstrGridReport; @method=execHL;
                try {
                    //TODO
                    //var linkDetails = this.linkMap[axis][position][0];
                    var linkDetails = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(columnIndex).getLinkMap()[0];
                    var linkArray = linkDetails.links;
                
                    if (!linkIndex) {   // if none specified, then ask where the default is (link)
                        linkIndex = linkDetails.di;
                    }
                    
                    var linkInfo = linkArray[linkIndex];
                    if (linkInfo) {
                        //TODO what is this.selections
                        //if (this.selections) this.selections.clearAll(true);
                        this[!linkInfo.url ? 'execDynamiclLink' :'execUrlLink'](linkDetails, linkInfo, parentElemsIndex,columnIndex);
                    }
                }
                catch(err) {
                    microstrategy.errors.log(err);
                }
            },
            
            execUrlLink : function execUrlLink(linkDetails, linkInfo, parentElemsIndex,columnIndex) 
            {
                //@class=mstrGridReport; @method=execUrlLink;
               try { 
                    // Needs to do it as a form, it might have too many parameters to send...
                    var oForm = null;
                    var url = linkInfo.url;
                    if (url.indexOf("&CurrentElement")>-1 && parentElemsIndex) {
                        var eltId = this.getElementId(parentElemsIndex.currAtt, parentElemsIndex);
                        url = linkInfo.url.replace("&CurrentElement", eltId);
                    }
                    oForm = mstrmojo.form.createDynamicForm(url);
                    if (linkDetails.onw) {
                        oForm.target = "_blank";
                    }
                    oForm.submit();
                    return;
                }
                catch(err) {
                    microstrategy.errors.log(err);
                }
            },
            execDynamiclLink : function execDynamiclLink(linkDetails, linkInfo, parentElemsIndex,columnIndex) 
            {
                //@class=mstrGridReport; @method=execDynamicLink;
                try {
                    var xml = this.buildLinkXml(linkDetails, linkInfo, parentElemsIndex,columnIndex);
                    //console.log(xml);
                    this.execDynamiclLinkInIVM( linkInfo, xml,linkDetails && linkDetails.onw);
                }
                catch(err) {
                    microstrategy.errors.log(err);
                }
            },
            
            getElementIDByIndex : function getElementIDByIndex(index,columnIndex) 
            {
                var es = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(columnIndex).getHeaderValues();
                if (index>=0 && index < es.length) {
                    return es[index].id;
                }
                return null;
            },
            getExecutionScope:function(){
                return microstrategy.EXECUTION_SCOPE;
            },
                    
            getMsgId:function(){
                return this.gridParams.msgID;
            },
//************
/**
 * Creates an attribute string for an XML element.
 * @memberOf microstrategy
 * @param {String} name The name of the attribute.
 * @param {String} value The value of the attribute.
 * @returns {String} The name-value pair for the XML element attribute. 
 */
addXmlAttr : function addXmlAttr(name, value) {
    //@class=microstrategy;@method=addXmlAttr;
    try {
        // TODO: Add encodding
        return " " + name + '="' + value + '"';
    }
    catch(err) {           
        return 0;
    }
},

/**
 * Creates an attribute string for an XML element. The value string of the attribute is encoded.
 * @memberOf microstrategy
 * @param {String} name The name of the attribute.
 * @param {String} value The value of the attribute.
 * @returns {String} The name-value pair of the XML attribute.
 */
addXmlAttrEncoded : function addXmlAttrEncoded(name, value) {
    if (! value) {
        return "";
    }
    var buf = [];
    var len = value.length;
    var ch;
    for (var i = 0; i < len; i++) {
        ch = value.charAt(i);
        switch (ch) {
        case '>':
            buf.push("&gt;");
            break;
        case '<':
            buf.push("&lt;");
            break;
        case '&':
            buf.push("&amp;");
            break;
        case '\u0009':
            buf.push("&#x09;"); // tab
            break;
        case '\n':
            buf.push("&#x0A;"); // line feed
            break;
        case '\r':
            buf.push("&#x0D;"); // carriage return
            break;
        case '"':
            buf.push("&quot;"); // 
            break;
        default:
            buf.push(ch);
        break;
        }
    }
    return ' ' + name + '="' + buf.join("") + '"';
},

//**************
            buildLinkXml: function buildLinkXml(linkDetails, linkInfo, parentElemsIndex,columnIndex) 
            {
                //@class=mstrGridReport; @method=buildLinkXml;
                var currentSelections = this.getCurrentSelections(columnIndex);
                try {
                    var me = this;
                    var axa = function(m,n) { //add xml attribute
                        return me.addXmlAttr(m,n);
                    };
                    var axae = function(m,n) {
                        return me.addXmlAttrEncoded(m,n);
                    };
                    
                    //var xml = "<hl" + axa("mid", mstrApp.msgID) + axa("srct", microstrategy.EXECUTION_SCOPE) + axa("aopam", linkInfo.daMode) + ">";
                    var xml = "<hl" + axa("mid", this.getMsgId()) + axa("srct", this.getExecutionScope()) + axa("aopam", linkInfo.daMode) + ">";

                    var answers = linkInfo.ans;
                
                    if (answers !== null) {
                        xml += "<prms>";
                        var i,j;
                        for (i=0, cnt = answers.length; i < cnt; i++){
                            var answer = answers[i];
                            var pid = answer.pid;
                            var aty = answer.m;
                            //var pty = answer.pt;
                            var statValues = answer.values;
                            var statDisplayNames = answer.dispNames;
                            xml += "<prm" + axa("id", pid) + axa("am", aty);
                            if ( answer.po.did ) {
                                xml += axa("orid", answer.po.did) + axa("ortp", answer.po.t);
                            }
                            xml +=">";
                
                            var ei = null;
                            var dynAttrs = null;
                            var attrI = null;
                            var attrInfo = null;
                            
                            // Switch case based on aty (answer mode) value...
                            switch (aty) {
                                case DO_NOT_ANSWER:
                                case CLOSE:
                                case USE_DEFAULT_ANSWER:
                                case SAME_PROMPT:
                                    break;
                                case STATIC:
                                    if (statValues !== null) {
                                        xml += "<pa ia='1'><es>";
                                        var  statCt;
                                        for (statCt=0; statCt<statValues.length; statCt++) {
                                            // TODO. Calculate prper element type based on it's preffix
                                            xml+= "<e" + axa("ei", statValues[statCt]) + axa("disp_n", statDisplayNames[statCt]) + axa("emt", "1")  + "/>";
                                            
                                        }
                                        xml += "</es></pa>";
                                    }
                                    break;
                                case DYNAMIC:
                                    //dynAttrs = answer.attrs;
                                    //if (dynAttrs != null && dynAttrs.length > 0 && parentElemsIndex) {
                                        xml += "<pa ia='1'>";
                                        //for (var dynCt=0; dynCt<dynAttrs.length; dynCt++) {
                                        //    attrI = dynAttrs[dynCt];
                                        //    attrInfo = this.attMap[attrI];
                                        xml += "<es " +   axa("dispForms","") + ">";
                                       
                                        for (j=0; j<currentSelections.length;j++) {
                                            //ei = this.getElementId(attrI, parentElemsIndex);
                                            ei = this.getElementIDByIndex(currentSelections[j],columnIndex);
                                            if (!ei) {
                                                continue;
                                            }
                                            
                                            // TODO. Calculate prper element type based on it's preffix
                                            xml +=  "<e" + axae("ei", ei) + axa("emt", "1") + "/>" ;
                                        }
                                        xml += "</es></pa>";
                                    break;
                                case ALL_VALID_UNITS:
                                    //dynAttrs = answer.attrs;
                                    //if (dynAttrs != null && dynAttrs.length > 0 && parentElemsIndex) {
                                        xml += "<pa ia='1'><attGroups><attGroup>";
                                        //for (var dynCt=0; dynCt<dynAttrs.length; dynCt++) {
                                        //    attrI = dynAttrs[dynCt];
                                        //    attrInfo = this.attMap[attrI];
                                        for (j=0; j<currentSelections.length;j++) {
                                            //ei = this.getElementId(attrI, parentElemsIndex);
                                            ei = this.getElementIDByIndex(currentSelections[j],columnIndex);
                                            if (!ei) {
                                                continue;
                                            }
                                            
                                            xml += "<a" + axa("id", attrInfo.id) + axae("n", attrInfo.n) + ">";
                                            
                                            //xml += "<es " +   axa("dispForms",attrInfo.displayFormsMap) + ">" +
                                            xml += "<es " +   axa("dispForms","") + ">" +
                                            // TODO. Calculate prper element type based on it's preffix
                                                    "<e" + axae("ei", ei) + axa("emt", "1") + "/>" +
                                                    "</es>";
                                            xml += "</a>";
                                            if ( aty == CURRENT_UNIT ) {
                                                break;
                                            }
                                        }
                                        xml += "</attGroup></attGroups></pa>";
                                    //}
                                    break;
                                case CURRENT_UNIT:
                                    dynAttrs = answer.attrs;
                                    //if (dynAttrs != null && dynAttrs.length > 0 && parentElemsIndex) {
                                    if (currentSelections !== null && currentSelections.length >0) {
                                        xml += "<pa ia='1'>";
                                            //attrI = parentElemsIndex.currAtt;
                                            attrI = this.getMapModel(PRIMARY_DATA_PROVIDER).getRowTitles().getTitle(this.shapePosition);
                                            //ei = this.getElementId(attrI, parentElemsIndex);
                                            ei = this.getElementIDByIndex(currentSelections[0],columnIndex);
                                            if (ei) {
                                                attrInfo = this.attMap[attrI];
                                                xml += "<a" + axa("id", attrInfo.id) + axae("n", attrInfo.n) + ">" +
                                                        "<es " +   axa("dispForms",attrInfo.displayFormsMap) + ">" + 
                                                // TODO. Calculate prper element type based on it's preffix
                                                        "<e" + axae("ei", ei) + axa("emt", "1") + "/>" +
                                                        "</es>" +
                                                        "</a>";
                                            }
                                        xml += "</pa>";
                                    }
                                    break;
                            }
                            xml += "</prm>";
                        }
                        xml += "</prms>";
                    }
                    xml += "</hl>";
                    return xml;
                }
                catch(err) {
                    if (microstrategy) {
                        microstrategy.errors.log(err);
                    }
                    else 
                    {
                        //console.log(err);
                    }
                    return null;
                }
            },
            execDynamiclLinkInIVM : function execDynamiclLinkInIVM(linkInfo, xml,onw) {
                //@class=mstrGridReport; @method=execDynamicLink;
                try {
                    var argNames = null;
                    //var argValues = [linkInfo.tid];
                    var argValues = [linkInfo.target.did];
                    
                    // Argument IDs will change, with new event definition
                    var event = null;
                    //var tvm = null;
                    //if (linkInfo.tty == microstrategy.DSSTYPE_RPT_DEFINITION) {
                    if (linkInfo.target.t == microstrategy.DSSTYPE_RPT_DEFINITION) {
                        event = mstrUpdateManager.RUN_REPORT;
                        argNames = ['1001'];
                         //TQMS 352141. We don't need to send link XML if link has no answers.
                        if (xml) {
                            argNames.push('4222');
                            argValues.push(xml);
                        }
                        argNames.push('4115');
                        //argValues.push(microstrategy.getReportViewMode(linkInfo.tstp));
                        argValues.push(microstrategy.getReportViewMode(linkInfo.target.st));
                    //} else if  (linkInfo.tty == microstrategy.DSSTYPE_DOC_DEFINITION) {
                    } else if  (linkInfo.target.t == microstrategy.DSSTYPE_DOC_DEFINITION) {
                        //if (linkInfo.tstp == microstrategy.DSSSUB_TYPE_RW) {
                        if (linkInfo.target.st == microstrategy.DSSSUB_TYPE_RW) {
                            event = mstrUpdateManager.RUN_RW_DOCUMENT;
                            argNames = ['2048001'];
                            if (xml) {
                                argNames.push('2048140');
                                argValues.push(xml);
                            }
                        } else {
                            event = mstrUpdateManager.RUN_DOCUMENT;
                            argNames = ['1001'];
                            if (xml) {
                                argNames.push('32351');
                                argValues.push(xml);
                            }
                        }
                    }
                
                    var um = microstrategy.updateManager;
                    var oldUseIframeSetting = um.useIframe;
                    var oldNWSetting = um.newWindow;
                
                    um.useIframe = false;
                    um.newWindow = onw;
                    if(um.hasChangesToSubmit()){
                        um.add([um.createActionObject(null, mstrUpdateManager.APPLY_CHANGES, mstrUpdateManager.applyChangesBeanPath, [], [], [])]);
                    }
                                
                    um.add([um.createActionObject(this.elem, event, "", argNames, argValues, [])]);
                    um.flushAndSubmitChanges();
                    um.acknowledgeRequest();
                    um.newWindow = oldNWSetting;
                    um.useIframe = oldUseIframeSetting;
                }
                catch(err) {
                    microstrategy.errors.log(err);
                }
            }
        }
    );
    
    
    /**
     * Add metric values to the label DIVs
     */
   mstrmojo.gmaps.GoogleMap.newMapViewer = function newMapViewer(map, scriptClass) {
        
        var url = unescape(map.gridParams.params),
            splitUrl = url.split("?"),
            baseUrl = splitUrl[0],        
            params = splitUrl[1].split("&"),
            splitParams = {},           
            p;
            scriptClass = scriptClass ? scriptClass : "mstrmojo.gmaps.GoogleMap";
        
        for (p in params) {
            if (params.hasOwnProperty(p)){
                var param = params[p].split("=");
                map.gridParams[param[0]]=param[1];
            }
        }
        mstrApp.localeId = map.gridParams.localeId;
        
        // hard code the flag        
        map.gridParams.includeOptimizedDrillPathSetting="true";
        
        mstrmojo.gmaps.GoogleMap.initMapViewer(map, scriptClass);
    };
    
   mstrmojo.gmaps.GoogleMap.initMapViewer= function initMapViewer(googlemap) {    
        //first retrieve the col titles.  We need to find the metric listings
        
        var  placeholder = googlemap.toolBarDiv.id,
             gridParams = googlemap.gridParams,                
             metricData = [];
                
        if (googlemap.getMapModel(PRIMARY_DATA_PROVIDER)) {
            
            var cols = googlemap.getMapModel(PRIMARY_DATA_PROVIDER).getColTitles(),  
                col,
                metricsString = mstrmojo.desc(1158,"Metrics"),
                i,j;
            //find the metric Column
            for (i = 0; i < cols.size(); i++) {
                col = cols.getTitle(i); //cols[i];
                if (col.getName() === metricsString) {
                    // find the metric elements
                    var es = col.getHeaderValues(); //col.es;
                    for (j=0; j< es.length; j++){
                        var o = {v:i,n:es[j].n,id:es[j].id};
                        metricData.push(o);
                    }
                    break;
                }
            }           
        }
        
        var oldId = mstrmap[gridParams.boneId];
        var oldContainer = mstrmojo.all[oldId];
        
        if (oldContainer)
        {
            oldContainer.destroy();
        } 
        
        var toolbar = mstrmojo.insert({            
                    alias: "hbox1",
                    scriptClass: "mstrmojo.HBox",
                    cssClass: "mstrMapToolbar mstrMapButton",
                    cssText: "background-color:#f0f0f0;",
					placeholder: placeholder,
                    children: [
                        {
                            alias: "metricSelector",
                            scriptClass: "mstrmojo.SelectBox",
                            items : metricData,
                            size: 1,
                            selectedIndex:0,
                            cssText: "white-space: nowrap",
                            cssClass : "mstrtbMetricSelector",
                            onchange: function onchange() {
                                googlemap.set("selectedMetricIndex",this.selectedIndex);                             
                            }
                            
                        },
                        {
                            alias:"drillButton",
                            scriptClass: "mstrmojo.Button",
                            iconClass: "mstrtbMapDrill",
                            title: mstrmojo.desc(145,"Drill"),
                            enabled : false,
                            onmousedown:function onmousedown() {
                                this.set("selected",true);
                            },
                            onmouseup:function onmouseup() {
                                this.set("selected",false);
                                googlemap.processDrill();
                            }
                        },
                        
                        {
                            alias:"clickSelect",
                            scriptClass: "mstrmojo.Button",
                            iconClass: "mstrtbMapSelection",
                            title: mstrmojo.desc(8215,"Enable/disable click to Select"),
                            onclick:function onclick() {
                                this.set("selected",!this.selected);
                               
                                googlemap.set("enableClickSelect",this.selected);
                                if (this.selected) {
                                    googlemap.set("enablePopup",false);
                                    googlemap.set("enableAreaSelect",false);
                             
                                    this.parent.areaSelect.set("selected",false);
                                    this.parent.infoWindow.set("selected",false);
                                    googlemap.clearMap();
                                }
                            }
                        },
                        {
                            alias:"areaSelect",
                            scriptClass: "mstrmojo.Button",
                            iconClass: "mstrtbMapRectangleSearch",
                            title: mstrmojo.desc(8216,"Map Rectangle Search"),
                            onclick:function onclick() {
                                this.set("selected",!this.selected);
                           
                                googlemap.set("enableAreaSelect",this.selected);
                                if (this.selected) {
                                    googlemap.set("enablePopup",false);
                                    googlemap.set("enableClickSelect",false);
                                    //map.set("infoWindowVisible",false);
                                    this.parent.clickSelect.set("selected",false);
                                    this.parent.infoWindow.set("selected",false);
                                    googlemap.clearMap();
                                }
                            }
                        },
                        {
                            alias:"infoWindow",
                            scriptClass: "mstrmojo.Button",
                            iconClass: "mstrtbMapDisableSearch",
                            title: mstrmojo.desc(8217,"Enable infoWindow"),
                            selected:true,
                            onclick:function onclick() {
                                this.set("selected",!this.selected);
                                googlemap.set("enablePopup",this.selected);
                                if (this.selected) {
                                    googlemap.set("enableAreaSelect",false);
                                    googlemap.set("enableClickSelect",false);
                                    this.parent.clickSelect.set("selected",false);
                                    this.parent.areaSelect.set("selected",false);
                                    googlemap.clearMap();
                                }
                            }
                        },
                        {
                            alias:"customInfoWindow",
                            scriptClass: "mstrmojo.Button",
                            iconClass: "mstrtbMapCustomizeInfoWindow",
                            title: mstrmojo.desc(8218,"Edit custom infoWindow"),
                            onclick:function onclick() {
                                googlemap.cleanMap();                                
                                googlemap.openPopup("formatPopupRef");                                
                            }
                        },
                        {
                            alias: "affinityLines",
                            scriptClass: "mstrmojo.Button",
                            selected: false,
                            iconClass: "mstrtbMapAffinity",
                            title: mstrmojo.desc(8051,"Display Affinity Lines/Arcs"),
                            onclick: function onclick(){
                            
                            if(googlemap.wpDisPlayAffinityLines === "0" || !googlemap.getMapModel(SECONDARY_DATA_PROVIDER))
                               return;
                               
                                googlemap._affinityGlow = !googlemap._affinityGlow;
                                
                                this.set('selected', !this.selected);
                                                            
                                if (!googlemap._affinityGlow) {
                                    var polyline;
                                    
                                    //make the alpha of all the polylines to 1
                                    var key;
                                    for (key in googlemap._affinityLines) {
                                        polyline = googlemap._affinityLines[key];                                    
                                        polyline.setMap(googlemap.map);
                                    }
                                    googlemap.clearAffinityAnimationObjects();
                                }
                            }
                        }
                    ]                
        });
        
        toolbar.render();
		//TQMS : 553405
        googlemap.mapDiv.style.height = parseInt(googlemap.height)- parseInt(toolbar.domNode.offsetHeight) + "px";
        googlemap.toolbar = toolbar;
    };
    
})();