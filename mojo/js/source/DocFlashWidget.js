/*global mstrmojo:false, window:false, document:false, isIE:false, AC_FL_RunContent:false, DetectFlashVer:false */


(function () {
    mstrmojo.requiresCls("mstrmojo.Widget", "mstrmojo._Formattable");
    
    var REQUIRED_MAJOR_VERSION = 10,
        REQUIRED_MINOR_VERSION = 1,
        REQUIRED_REVISION = 0;
    
    /**
     * This is a widget for embedded Flex component.
     */
    mstrmojo.DocFlashWidget = mstrmojo.declare(
        // super class
        mstrmojo.Widget,
        // mixin
        [mstrmojo._Formattable],
        // properties
        {
            scriptClass: 'mstrmojo.DocFlashWidget',
                       
            formatHandlers: {
                domNode: [ 'RW', 'T', 'B', 'fx']
            },
            
            markupString: '<div id={@id} class="mstrmojo-docwidget" title="{@tooltip}" style="{@cssText}">' + 
                '*This content requires the Adobe Flash Player version ' + REQUIRED_MAJOR_VERSION + 
                ' or higher.* <a target="_blank" href="http://www.adobe.com/go/getflash/">*Get Flash*</a></div>',
                // default error message, @TODO descriptor 5863 and 4896
        
            markupMethods: {
                onheightChange: function(){
                    var h = this.height;
                    var domNode = this.domNode;
                    domNode.style.height = h + 'px';
                    var fc = domNode.firstChild;
                    if (fc) {
                        if (fc.style) {
                            fc.style.height = h + 'px';
                        }
                        if (fc.height !== undefined) {
                            fc.height = h;
                        }
                    }
                },

                onwidthChange: function() {
                    var w = this.width;
                    var domNode = this.domNode;
                    domNode.style.width = w + 'px';
                    var fc = domNode.firstChild;
                    if (fc) {
                        if (fc.style) {
                            fc.style.width = w + 'px';
                        }
                        if (fc.width !== undefined) {
                            fc.width = w;
                        }
                    }
                }
            },

            preBuildRendering: function preBuildRendering() {
                if (this._super) {
                    this._super();
                }
                // prepare this.vars based on Doc information
                var defn = this.node.defn,
                    d = this.node.data,
                    app = mstrApp,
                    cfg = mstrConfig;
                
                var vars = {};
                var u = encodeURIComponent; // cache the reference to the function
                vars.flashvars = 'MsgId=' + this.model.mid +  
                    '&NodeKeys=' + u((d.k + ':' + d.sid) + ((defn.sdp)? (',' + defn.sdp) : '')) +
                    '&Scope=2' +
                    ((defn.curl)? ('&customURL=' + u(defn.curl)) : '') +
                    ((defn.cxml)? ('&customXML=' + u(defn.cxml)) : '') +
                    ((cfg.taskURL)? ('&TaskURL=' + u(cfg.taskURL)) : '') +
                    '&Mode=online' +
                    ((app.FlashResBundleURL) ? ('&ResBundleURL=' + u(app.FlashResBundleURL)) : '') +
                    ((app.Privs) ? ('&Privs=' +  u(app.Privs)) : '') +
                    ((app.localeId) ? ('&NumberLocale=' + app.localeId) : '') + 
                    ((app.displayLocaleId) ? ('&LanguageLocale=' + app.displayLocaleId) : '') +  
                    ((app.sessionState) ? ('&SessionState=' + u(u(app.sessionState))) : '');
                
                vars.movie = defn.swf.replace(".swf","");
                
                if (defn.vars) {
                    vars.extraFlashVars = defn.vars;
                }

                this.vars = vars;
                
                // prepare other properties
                this.cssText = (this.cssText || "") + this.domNodeCssText;
                
                var fs = this.getFormats();
                this.height = fs.height.replace("px","");
                this.width = fs.width.replace("px","");
            },
            
            postBuildRendering: function(){
                if (this._super) {
                    this._super();
                }

                var vs = this.vars;
                
                if (DetectFlashVer === undefined) {
                    return;
                }
                var hasProductInstall = DetectFlashVer(6, 0, 65);
                var hasRequestedVersion = DetectFlashVer(REQUIRED_MAJOR_VERSION, REQUIRED_MINOR_VERSION, REQUIRED_REVISION);
                
                if (!hasRequestedVersion && !hasProductInstall) {
                    return;
                }
                
                var params = [
                    "id", this.id,
                    "parentDiv", this.id,
                    "width", this.width,
                    "height", this.height,                    
                    "quality", "high",
                    "bgcolor", "#ffffff",
                    "align", "middle",
                    "allowScriptAccess","sameDomain",
                    "wmode","opaque",
                    "type", "application/x-shockwave-flash",
                    "pluginspage", "http://www.adobe.com/go/getflashplayer"
                ];
                
                
                if (hasRequestedVersion) {
                    params = params.concat([
                        "src", vs.movie,
                        "flashvars",vs.flashvars
                        ]);
                    
                    AC_FL_RunContent.apply(AC_FL_RunContent, params);
                } 
                else {
                    // if (hasProductInstall) {
                    // We don't need the line above, since we already checked if (!hasRequestedVersion && !hasProductInstall)
                    var MMPlayerType = (isIE) ? "ActiveX" : "PlugIn";
                    var MMredirectURL = window.location;
                    document.title = document.title.slice(0, 47) + " - Flash Player Installation";
                    var MMdoctitle = document.title;

                    params = params.concat([
                        "src", "../swf/playerProductInstall",
                        "FlashVars", "MMredirectURL=" + MMredirectURL + "&MMplayerType=" + MMPlayerType + "&MMdoctitle=" + MMdoctitle
                        ]);
                    
                    AC_FL_RunContent.apply(AC_FL_RunContent,params);
                }
            },
            
            resize: function resize() {
                var fs = this.getFormats();
                
                var w = fs.width;
                // Sometimes the w, after resizing, is a numeric value of 0, rather than a string value of "0px"
                if (w.replace) {
                    w = w.replace("px","");
                }
                this.set('width', w);
                
                // Sometimes the h, after resizing, is a numeric value of 0, rather than a string value of "0px"
                var h = fs.height; 
                if (h.replace) {
                    h = h.replace("px","");
                }
                this.set('height', h);
            }
        }
    );
})();
