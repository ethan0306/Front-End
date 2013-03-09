(function(){
    
    var BUILDER_METHOD = {
        BUTTON: 'newButton',
        PICKERBUTTON: 'newPickerButton',
        LIST: 'newList',
        SEPARATOR: 'newSeparator',
        TEXT: 'newCustom'
    };

    function cmdMethodName(/*String*/ cmdid) {
        return (cmdid === "export") ? cmdid + "Cmd" : cmdid;
    }
    
    // Private utility for ToolBarBuilder which creates the expression for the binding
    // used by the "enabled" property of toolbar children.
    function bindEnabled(/*String*/ enabledFeatures){
        // Split the comma-delim list of features into individual feature names.
        var arr = enabledFeatures.split(','),
            txt = [],
            i, len;
        // For each name...
        for (i = 0, len=arr.length; i<len; i++) {
            // Remove the "!" prefix, if any.
            var s = arr[i],
                neg = s.match(/^\!/);
            if (neg) {
                s = s.replace("!", "");
            }
            // Add the feature name (possibly with "!" prefix) to binding expression.
            txt.push(
                (neg? "!" : "") 
                + "this.target.model.features['" + s + "']"
            );
        }
        return txt.join(" && ");
    }

    function bindItems(/*String*/ cmdid){
        return "var t = this.target, c = this.cmdid; if (t && c) {if (t.requiresMethod) t.requiresMethod(c); return this.target." 
                + cmdid 
                + "Options;}";
    }
    
    function bindSelectedItem(/*String*/ cmdid){
        // Hack: to make selectedItem refresh after items, we reference this.items in the selectedItem binding even though we don't use this.items for anything.
        // TO DO: enhance bindings infrastructure to support either a sort order for bindings or an ordered array of bindings.
        return "var x = this.items; var t = this.target, c = this.cmdid; if (t && c){ if (t.requiresMethod) t.requiresMethod(c); return this.target." 
                + cmdid 
                + "Value;}";
    }
    
    function openLink(json){
        var link = json.link,
            h = link && link.href,
            t = link && link.target,
            xtraUrl = json['extra-url'];
        
        if (!link || !h) {
            return;
        }

        // Add any extra url.
        if (xtraUrl) {
            h += '&' + xtraUrl;
        }

        if(link['use-window-open']){
            t = '_blank';
        }
        
        // Open the url.
        window.open(h, t ? t : "_self");
    }
    
    mstrmojo.ToolBarBuilder = {
    
        scriptClass: "mstrmojo.ToolBarBuilder",
        
        build: function build(/*Array*/ nodes, /*ToolBarModel*/ model, /*Object?*/ config) {
            var arr = [],
                i, len;
            for (i = 0, len=(nodes&&nodes.length) || 0; i < len; i++) {
                var json = nodes[i],
                    n = BUILDER_METHOD[(json&&json.type) || 'SEPARATOR'],
                    w = this[n] && this[n](json, config);
                    if (w) {
                        arr.push(w);
                    }
            }
            return arr;
        },
        
        newButton: function nwBtn(/*Object*/ json, /*Object?*/ config) {
            if(json['on-click'] || json.link){
                return this.newCustom(json,config);
            }
            var c = cmdMethodName(json.cmdid);
            return new mstrmojo.Button({
                            title: json.tooltip,
                            iconClass: json.id,
                            cssClass: 'mstrmojo-InteractiveButton',
                            target: config && config.target,
                            cmdid: c,
                            onclick: function() {
                                var t = this.target,
                                    ci = this.cmdid;
                                t.requiresMethod(ci);
                                t[ci]();
                            },
                            bindings: json.enabledFeatures ?
                                    {enabled: bindEnabled(json.enabledFeatures)} :
                                    null
                        });
        },
                
        newPickerButton: function nwPkrBtn(/*Object*/ json, /*Object?*/ config) {
            var c = cmdMethodName(json.cmdid);
            var bs;
            if (!json.items) {
                bs = {};
                bs.items = bindItems(c);
            }
            if (json.enabledFeatures) {
                bs = bs || {};
                bs.enabled = bindEnabled(json.enabledFeatures);
            }
            function oc() {
                var t = this.target,
                    ci = this.cmdid,
                    its = this.items,
                    idx = this.selectedIndex;
                t.requiresMethod(ci);
                t[ci](its[idx].dssid);
            }
            return new mstrmojo.PickerButton({
                title: json.title || '',
                iconClass: json.id,
                items: json.items,
                itemDisplayField: 'n',
                itemIdField: 'dssid',
                autoHide: true,
                size: 1,
                selectedIndex: parseInt(json.selectedIndicesList, 10) || 0,
                target: config && config.target,
                cmdid: c,
                onchange: oc,
                bindings: bs
            });
        },
        
        newList: function nwLst(/*Object*/ json, /*Object?*/ config) {
            var c = cmdMethodName(json.cmdid),
                bs = {selectedItem: bindSelectedItem(c)};
            if (!json.items) {
                    // We don't have predefined items, so use a binding to fetch them at run-time.
                    bs.items = bindItems(c);
            }
            if (json.enabledFeatures) {
                    // We have enabled features, so bind the "enabled" property to them.
                    bs.enabledFeatures = bindEnabled(json.enabledFeatures);
            }

            return new mstrmojo.SelectBox({
                            size: 1,
                            tooltip: json.title || '',
                            iconClass: json.id,
                            cmdid: c,
                            target: config && config.target,
                            itemDisplayField: 'n',
                            itemIdField: 'dssid',
                            autoHide: true,
                            onchange: function(){
                                var t = this.target,
                                    ci = this.cmdid,
                                    itm = this.selectedItem;
                                t.requiresMethod(ci);
                                t[ci](itm && itm.dssid);
                            },
                            items: json.items,        // Maybe undefined
                            bindings: bs            // Includes items if json.items is undefined
                        });
        },
        
        newSeparator: function nwSep(/*Object?*/ json, /*Object?*/ config) {
            return new mstrmojo.ToolSeparator(json);
        },
        
        newCustom: function newCstm(/*Object?*/ json, /*Object?*/ config) {
            var b = new mstrmojo.Button({
                    markupString: '<div id="{@id}" class="mstrmojo-Button {@cssClass}" title="{@title}" style="{@cssText}" mstrAttach:click,mousedown,mouseup>' + 
                        '<div id="{@iconClass}" class="mstrmojo-Button-text"></div></div>',
                    title: json.tooltip,
                    cssClass: 'mstrmojo-InteractiveButton',
                    onclick: function() {
                        if(json.link){
                            openLink(json);
                        }
                        if(json['on-click']){
                            eval(json['on-click']);
                        }
                    },
                    bindings: json.enabledFeatures ?
                            {enabled: bindEnabled(json.enabledFeatures)} :
                            null
                }),
                v = json.value;
            
            b.text =  v || "";
            b.cssText = v ? 'width:auto;margin-top:4px;' : "";
            b.title = json.tooltip || "";
            b.iconClass = json.id || "";
            
            return b;
        }
    };

}());