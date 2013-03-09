(function(){
    
    //private variables
      var isPremier = false;
      var premiereKey = null;  //premier key
      var mstrLang = null;
      var mstrRegion = null;
                
        
    /**
     * A mixin for classes that will represent the fusion table layer drawn on the map
     * @class
     * @public
     */
    mstrmojo._CanLoadMapExternalScript =         
        /**
         * @lends mstrmojo._CanLoadMapExternalScript#
         */
    {
        _mixinName : 'mstrmojo._CanLoadMapExternalScript',
        callback : null,
        mixinParentMapObj : null,
    
    /**
     * Setter methods 
     * 
     */
      setPremiere : function setPremiere(val)
      {
         isPremier = val;       
      },
      
      isPremiere : function isPremiere()
      {
         return isPremier;       
      },
      
      setPremiereKey : function setPremiereKey(id)
      {
        premiereKey = id;   
      },
      
      getPremiereKey : function getPremiereKey()
      {
        return premiereKey;  
      },
      
      setLocaleLang : function setLocaleLang(lang)
      {
         mstrLang = lang;   
      },  

      getLocaleLang : function getLocaleLang()
      {
         return mstrLang;   
      },
            
      setLocaleRegion : function setLocaleRegion(region)
      {
         mstrRegion = region;
      },
               
      getLocaleRegion : function getLocaleRegion()
      {
         return mstrRegion;
      },         
    
    /**
     * Loading the google map using javascript
     * @return
     */
    
    loadExternalScript : function loadScript(callBackFunc, mapObject) {
                
        var urlBase;     
        
        if (window.location.protocol == "https:") {     
           urlBase = "https://maps-api-ssl.google.com/maps/api/js?v=3&sensor=false";
        } else {        
          urlBase = "http://maps.google.com/maps/api/js?v=3&sensor=false";
        }
        
        urlBase += "&language=" + this.getLocaleLang() + "&region=" + this.getLocaleRegion();
        
        //if isPremier is a valid premier key then append clientId to the url
        if (this.isPremiere()) {
            urlBase = urlBase + "&client=" + this.getPremiereKey();
        }    
        
        //save the reference to the callback
        this.callback = callBackFunc;
        //save the reference to the map object
        this.mixinParentMapObj = mapObject;
        
        //TQMS : 535209 when the https protocol is used, without this global variable, dojo tries to use http to load dojox
        //so to prevent it declare this global variable
        djConfig = {
        modulePaths: {
          "dojo": window.location.protocol + "//ajax.googleapis.com/ajax/libs/dojo/1.6/dojo",
          "dijit": window.location.protocol + "//ajax.googleapis.com/ajax/libs/dojo/1.6/dijit",
          "dojox": window.location.protocol + "//ajax.googleapis.com/ajax/libs/dojo/1.6/dojox"
                   }
        }; 
        
        //now load the external scripts
        mstrmojo._LoadsScript.requiresExternalScripts
        (
          [
           {
            url: urlBase,           
            callbackParamName : "callback",
            forceReload : true
           },
           {
            //TQMS : 532044, dojo 1.5 does not render bubbles on IE9 ,so we upgraded to 1.6
            url : window.location.protocol+ "//ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/dojo.xd.js",         
            forceReload : true
           }
          ],
              this.loadMarkerScript,
              this);     
        },
        
        loadMarkerScript : function loadMarkerScript() {
            //TQMS : 536567
            //do force reload of these classes because when we load the google's javascript everytime, the map object is also creating
            //every time and we should reload the following classes because they rely on google.map.overlayview class. If we do not
            //reload them then google throws error since this object will become invalid once we load the google's javascript
            mstrmojo.invalidateCls("mstrmojo.gmaps.CustomMarker");
            mstrmojo.invalidateCls("mstrmojo.gmaps.CircleMarker");
            mstrmojo.invalidateCls("mstrmojo.gmaps.TextMarker");
            mstrmojo.invalidateCls("mstrmojo.gmaps.DensityOverlay");
            
            mstrmojo.requiresCls("mstrmojo.gmaps.CustomMarker",
                                 "mstrmojo.gmaps.TextMarker", 
                                 "mstrmojo.gmaps.CircleMarker",
                                 "mstrmojo.gmaps.DensityOverlay"
                                 );
            
        //now load the css files
        this.loadCoreCss();
        this.loadGoogleMapVisCss();
        if (typeof(dojo)!= 'undefined')
        {
            dojo.require("dojox.gfx");              
        }
        this.loadMap();
    },
    //TQMS : 531806 ... On some browsers like Chrome dojo was not loaded before we try to create the bubbles, so createsurface
    //method was not present and hence the markers were not shown but on other browsers , dojox is loaded before
    //trying to create bubbles..
    //To make it consistent and reliable we now wait until the dojox is loaded before trying to load the google map
    loadMap : function loadMap()
    {
        if (typeof(dojox.gfx) == 'undefined' || typeof(dojox.gfx.createSurface)  == 'undefined') {
            
        //  console.log("dojox.gfx not available ..waiting");
            var that = this;
            window.setTimeout(function(){       
                that.loadMap()
            }, 100);
        }
        else {      
            //call the GoogleMap method to indicate we are done loading the external java script files
            
            this.callback.call(this.mixinParentMapObj);
        }
    }, 
    
    isOIVM : function isOIVM(){
          return !(!mstrApp || !mstrApp.isOIVM || !mstrApp.isOIVM());
    },

    loadCoreCss : function loadCoreCss() {
        var currentStyles = document.styleSheets;
        if (currentStyles)  {
            var i, style;
            for (i=0;i<currentStyles.length;i++) {
                style = currentStyles[i];
                if (style.id =="mojocore") {
                    return;
                }
            }
        }
        
        var css = document.createElement("link");
        css.setAttribute("rel", "stylesheet");
        css.setAttribute("type", "text/css");
        css.setAttribute("href", "../javascript/mojo/css/core.css");
        css.setAttribute("id","mojocore");
        document.getElementsByTagName("head")[0].appendChild(css);
    
    },
    
    loadGoogleMapVisCss : function loadGoogleMapVisCss() {
        var currentStyles = document.styleSheets;
        if (currentStyles)  {
            var i, style;
            for (i=0;i<currentStyles.length;i++) {
                style = currentStyles[i];
                if (style.id =="googleMapVis") {
                    return;
                }
            }
        }
        
        var css = document.createElement("link");
        css.setAttribute("rel", "stylesheet");
        css.setAttribute("type", "text/css");
        css.setAttribute("href", "../style/mstr/googleMap.css");
        css.setAttribute("id","googleMapVis");
        document.getElementsByTagName("head")[0].appendChild(css);  
        }         
    }; //mstrmojo._CanLoadMapExternalScript
}//function
)();