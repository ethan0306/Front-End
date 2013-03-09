(function(){

mstrmojo.requiresCls(
        "mstrmojo.hash",
        "mstrmojo.expr",
        "mstrmojo.dom",
        "mstrmojo.boxmodel",
        "mstrmojo.Obj", 
        "mstrmojo.Arr",
        "mstrmojo.string",
        "mstrmojo.Box",
        "mstrmojo.TBox",
        "mstrmojo.HBox",
        "mstrmojo.Label",
        "mstrmojo.Button",
        "mstrmojo.HTMLButton",
        "mstrmojo.TextBox",
        "mstrmojo.Popup",        
        "mstrmojo.Editor",  
        "mstrmojo.Dial",
        "mstrmojo.WidgetList",
        "mstrmojo.FilterExpr",
        "mstrmojo.CGEOptions",
        "mstrmojo.ConditionWalk",
        "mstrmojo.SaveAsEditor",
        "mstrmojo.CGFormatEditor");

var _E = mstrmojo.expr,
    _ET = _E.ET,
    _BF = _E.BRANCH_FNS,
    _H = mstrmojo.hash,
    _B = mstrmojo.boxmodel,
    Arr = mstrmojo.Arr,
    Obj = mstrmojo.Obj, 
    _S = mstrmojo.string,
    _D = mstrmojo.dom;

/**
 * Searches a given Custom Group model to all the targets used in conditions.
 * @param {Object} m The Custom Group model.
 * @return {Object} The hashtable of targets found in the model; keyed by "did"; possibly empty.
 * @private
 */
function _findTargets(m) {
    var h = {};
    if (m) {
        var its = m.items;
        for (var i=0, iLen=(its&&its.length)||0; i<iLen; i++){
            var it = its[i],
                ex = it && it.expr;
            if (ex) {
                _E.findTargets(ex, "did", h);
            }
        }
    }
    return _H.valarray(h);
}

/**
 * Ensures that the model's list of items (CG Elements) is observable.
 * @param {mstrmojo.Widget} w The Custom Group Editor widget.
 * @private
 */
function _initModel(w) {
    var m = w.model;
    w.targets = _findTargets(m);
    w.targetsLastMod = new Date();
    if (!m) {
        m = new Obj({});
        w.model = m;
    }
    var its = m.items;
    if (!its) {
        its = mstrmojo.Arr.makeObservable([]);
        m.items = its;
    } else if (!its.attachEventListener) {
        its = _H.make(its, Arr);
    }
    for (var i=0, len=its.length; i<len; i++){
        var it = its[i];
        if (!it.attachEventListener) {
            it = _H.make(it, Obj);
        }
    }
}

var _PREFIX = mstrmojo.desc(4778,"Element"),
    _rePREFIX = new RegExp(_PREFIX + "\\s*(\\d+)", "i"),
    _NEW_ELEMENT_BASE = 10000;

/**
 * Returns an auto-generated name for a new Custom Group Element.
 * @param {Array} its The array of existing elements in the custom group model.
 * @return {String} The newly generated name.
 * @private
 */
function _freeName(its) {
    var i = 1;
    for (var k=0, len=(its&&its.length)||0; k<len; k++){
        var n = its[k].n,
            m = n && n.match(_rePREFIX);
        if (m) {
            var j = parseInt(m[1],10);
            i = Math.max(j+1, i);
        }
    }
    return _PREFIX + " " + i;
}

var _HEIGHT = 200;

/**
 * Launches a popup for editing a node in the expression tree.
 * @param {Object} data The expression data node to be edited.
 * @param {mstrmojo.Widget} widget The widget representing the data node to be edited.
 * @param {String} type The type of editor to launch; either "andor" or "condition".
 */
function _openWalk(data, widget, type){
    var cge = mstrmojo.all.mstrCGE,
        off = _D.delta(widget.domNode, cge.editorNode);
    
    off.y += (type == 'andor' ? 16 : parseInt(widget.domNode.offsetHeight, 10));

    var cfg = {
            condition: widget,
            zIndex: cge.zIndex + 10,
            left: off.x + 'px',
            top: off.y + 'px'
        },
        n;
    switch(type){
        case 'andor':
            n = "andOrPopupRef";
            break;
        case 'condition':
            n = "conditionPopupRef";
            cfg.model = _H.clone(data);
            cfg.targets = cge.targets;
            cfg.targetsLastMod = cge.targetsLastMod;
            break;
    }
    cge.openPopup(n, cfg);
}

function _syncParentExpr(f){
    // Writes back to our parent's data whenever end-user modifies our items.
    var d = f.parent.data;
    if (d){
        var its = f.items;
        d.expr = its && its[0];
    }
}

/**
 * Count the number of banding and condition qualification in an array of items. 
 * @param {Array} arr The array of items to be counted. 
 */
function _CountBC(arr){
    if (arr.constructor !== Array) {
        arr = [arr];
    }
    
    var item, r = {b:0,c:0}, nds, sr, b;
    for(var j=0,len=arr.length;j<len;j++){
        item = arr[j];
        if(!(item && item.et)) continue;
        nds = item.nds;            
        if(nds) {
            sr = _CountBC(nds);
            r.b += sr.b;
            r.c += sr.c;
        } else {
            b = (item.et === _ET.B); 
            r[b ? 'b' : 'c'] ++;
        }
    }
    
    return r;
}

/**
 * Update the number of banding and condition qualification in a filter tree.
 */
function _UpdateBCAdd(evt){
    var ct = _CountBC(evt.value), 
        t = this.tree;
    t.set('bandingCount', t.bandingCount + ct.b);
    t.set('conditionCount', t.conditionCount + ct.c);  
}

/**
 * Update the number of banding and condition qualification in a filter tree.
 */
function _UpdateBCRemove(evt){
    var ct = _CountBC(evt.value), 
        t = this.tree;
    t.set('bandingCount', t.bandingCount - ct.b);
    t.set('conditionCount', t.conditionCount - ct.c);    
}

function _saveTaskParams(saveAs){
    var cge = mstrmojo.all.mstrCGE,
        m = cge.model,
        id = m.did,                                           
        cgp = m.cgp,
        xml = cge.getXML();
    return {
        taskId: 'saveCustomGroup',
        xml: xml,
        objectID: id || '',   
        description: m.desc || '',
        name: m.n || '',                                            
        saveAs: saveAs,
        aggregation: cgp.agg,
        flatten: cgp.flat,
        parentFirst: cgp.pf,
        reportFilterInteraction: cgp.rfi
    };
}

mstrmojo.CustomGroupEditor = {
    id: "mstrCGE",
    title: mstrmojo.desc(7919,"Custom Group Editor"),    
    scriptClass: "mstrmojo.Editor",
    cssClass: "mstrmojo-charcoalboxe",
    cssText: "width:750px;background-color:#e6e6e6;",
    zIndex:10,    
    model: null,
    readOnly: false,
    help: 'custom_group_editor.htm',    
    formatPopupRef: {
        scriptClass: "mstrmojo.CGFormatEditor",
        contentNodeCssClass: "mstrmojo-balloon",
        alias: "formatEditor",
        title: mstrmojo.desc(2116),
        left: '100px',
        top: '100px',
        useAnimate: false,
        height: 350,
        slot: "containerNode",
        help:"formatting_a_custom_group.htm",
        locksHover: true,
        model: null,
        _set_model: function(n, v) {
            //When creating a new CG, the cge model item is not made observable which cause unable to save format.
            //TODO: This is temporary workaround, should fix this where cge model got updated.
            //make each CGElement observable
            _initModel(mstrmojo.all.mstrCGE);    
            this.model = v;
            this.model.selectedIndex = mstrmojo.all.mstrCGEls.selectedIndex;
            return true;  //ensure FormatEditor receives modelChange
        },
        bindings: { 
            model: function() {
                    return mstrmojo.all.mstrCGE.model;
                }
        },
        onOpen: function(){
            //update model to FE
            this.set('model', mstrmojo.all.mstrCGE.model);
        }
    },

    saveasRef: {
        scriptClass:"mstrmojo.SaveAsEditor",
        typeDesc: mstrmojo.desc(2105,"Custom Group"),
        browsableTypes: '8,257',
        onObjectSaved: function(o){
                var cge = mstrmojo.all.mstrCGE,
                m = cge && cge.model;
            if (m) {
                m.set('did', o.did);  //update model with the id of the newly created Object
                m.set('n', o.name); //update CG name
                m.set('desc', o.desc);
            }
        }
    },
            
    optionsRef: {
        scriptClass: "mstrmojo.Editor",
        cssClass: 'mstrmojo-CGEOptions',
        contentNodeCssClass: "mstrmojo-balloon",
        left: "100px",
        top: "230px",
        slot: "containerNode",    
        help:"Custom_Group_Options_dialog_box.htm",
        showTitle: true,
        title: mstrmojo.desc(7969, 'Custom Group Options'),
        onOpen: function(){
            var cge = mstrmojo.all.mstrCGE,
                sae = this.optionsEditor;
            
            sae.open(cge.model, {closeCB : [this,'close']});
        },
        children : [
            {
                scriptClass: "mstrmojo.CGEOptions",
                alias: "optionsEditor"
            }
        ]
    },
    
    postCreate: function(){
        _initModel(this);
    },
    
    _set_model: function(n,v) {
        var vWas = this.model,
            chg = vWas !== v,
            cgels = mstrmojo.all.mstrCGEls;;
        if (chg) {
            this.model = v;
            _initModel(this);  
            if(cgels){
                cgels.clearSelect();
            }
        }
        
        return chg;
    },
    
    children: [
        {
            scriptClass: "mstrmojo.TBox",
            alias: "header",
            cssText: "width: 100%",
            children: [
                {
                    scriptClass: "mstrmojo.Label",
                    alias: "name",
                    cssClass: "mstrmojo-charcoalbox subtle mstrmojo-cge-name",
                    emptyText: mstrmojo.desc(7920,"Enter Custom Group name here."),
                    bindings: {
                        text: function(){ 
                            var n = mstrmojo.all.mstrCGE.model.n || this.emptyText; 
                            return _S.encodeHtmlString(n); 
                        }                            
                    },
                    onclick: function(){
                        var cge = mstrmojo.all.mstrCGE,
                            off = _D.delta(this.domNode, cge.editorNode);
                        cge.openPopup(
                            "inlineTextRef",
                            {
                                left: off.x -1 + 'px',
                                top: off.y - (_D.isIE7 ? 2 : 1) + 'px',
                                txtConfig: {
                                    cssClass: "mstrmojo-cge-name-edit",
                                    value: cge.model.n || '',
                                    onEnter: function(){
                                        var v = _S.trim(this.value);
                                        if(v){
                                            cge.model.set("n", v);
                                        }
                                        this.parent.close({enter: true});
                                    },
                                    onCancel: function(){
                                        this.set("value", cge.model.n);
                                    },
                                    prevTab: null,
                                    nextTab: cge.header.desc
                                }
                            }
                        );
                    }
                },
                {
                    scriptClass: "mstrmojo.Label",
                    alias: "desc",
                    cssClass: "mstrmojo-charcoalbox subtle mstrmojo-cge-desc",
                    emptyText: mstrmojo.desc(7921,"Enter Custom Group description here."),
                    rows: 1,
                    bindings: {
                        text: function(){ 
                            var desc = mstrmojo.all.mstrCGE.model.desc|| this.emptyText; 
                            return _S.encodeHtmlString(desc); 
                        }
                    },
                    onclick: function(){
                        var cge = mstrmojo.all.mstrCGE,
                            off = _D.delta(this.domNode, cge.editorNode);
                        cge.openPopup(
                            "inlineTextRef",
                            {
                                left: off.x -1 + 'px',
                                top: off.y - (_D.isIE7 ? 2 : 1) + 'px',
                                txtConfig: {
                                    cssClass: "mstrmojo-cge-desc-edit",
                                    value: cge.model.desc || '',
                                    onEnter: function(){
                                        cge.model.set("desc", _S.trim(this.value));
                                        this.parent.close({enter: true});
                                    },
                                    onCancel: function(){
                                        this.set("value", cge.model.desc);
                                    },
                                    prevTab: cge.header.name,
                                    nextTab: null
                                }
                            }
                        );
                    }
                }
            ]
        },
        {
            scriptClass: "mstrmojo.Box",
            cssClass:"mstrmojo-CGE-content",
            alias: "content",
            children: [        
                // CG Elements list
                {
                            id: "mstrCGEls",
                            scriptClass: "mstrmojo.WidgetList",
                            cssClass: "mstrmojo-CustomGroupEls",
                            bindings: {
                                items: "mstrmojo.all.mstrCGE.model.items"
                            },
                            multiSelect: false,
                            renderOnScroll: false,
                            draggable: true,
                            dropZone: true,
                            allowCopy: false,
                            allowDrop: function(c){
                                // Only allow drops of other CG Elements in this list.
                                var s = c && c.src,
                                    w = s && s.widget;
                                return (w === this);
                            },
                            itemIdField: null,
                            itemDisplayField: 'n',
                            onchange: function(evt){
                                var idx = this.selectedIndex,
                                    ws = this.ctxtBuilder.itemWidgets,
                                    w;
                                for(var i=0,len=ws.length;i<len;i++){
                                    w = ws[i];
                                    if(w && i != idx){
                                        w.filterExpr.clearTreeSelect();
                                    }
                                }
                                
                            }, 
                            getNextId: function(){
                                return ++ _NEW_ELEMENT_BASE;
                            },
                    itemFunction: function (item, idx, w) {
                        return new mstrmojo.CustomGroupEl({
                                cssClass: "mstrmojo-charcoalbox",
                                data: item,
                                parent: w,
                                        state: item.isNew ? 1 : 0,
                                        onRender: item.isNew ? function(){this.filterExpr.newCondition();delete this.data.isNew;} : null,
                                        onclick: function(evt){
                                            // If end-user clicks on title, launch textbox for rename.
                                            var t = _D.eventTarget(evt.hWin, evt.e);
                                            if (t === this.titleNode){
                                                var cge = mstrmojo.all.mstrCGE,
                                                    off = _D.delta(this.titleNode, cge.editorNode),
                                                    me = this;
                                                cge.openPopup(
                                                    "inlineTextRef",
                                                    {
                                                        left: off.x + (_D.isIE ? 1 : 0) + 'px',
                                                        top: off.y + (_D.isIE7 ? -2 : 0) + 'px',
                                                        txtConfig: {
                                                            cssClass: "mstrmojo-cge-elname-edit",
                                                            value: this.data.n || '',
                                                            onEnter: function(){
                                                                var v = _S.trim(this.value);
                                                                if (v) {
                                                                    me.data.n = v;
                                                                    me.paint();
                                                                }
                                                                this.parent.close({enter: true});
                                                            },
                                                            onCancel: function(){
                                                                this.set("value", me.data.n);
                                                            },
                                                            prevTab: null,
                                                            nextTab: null
                                                        }
                                                    }
                                                );
                                            }
                                        },
                                postCreate: function() {
                                    this.children = [
                                        {
                                            scriptClass: "mstrmojo.FilterExpr",
                                            slot: "exprNode",
                                                    alias: "filterExpr",  // Hack: Needed to wire up the "Add condition" link in CustomGroupEl
                                                    bindings: {
                                                        // Initializes our items by reading them from our parent's data.
                                                        items: "var ex = this.parent.data.expr; return ex ? [ex] : []"
                                                    },
                                                    draggable: true,
                                                    dropZone: true,
                                                    allowCopy: false,       // Temp: to prevent duplicating nodes by ref 
                                                    makeObservable: true,
                                                    bandingCount: 0,
                                                    conditionCount: 0,                                             
                                                    onadd: function(evt){
                                                        _syncParentExpr(this);
                                                        _UpdateBCAdd.apply(this, [evt]);
                                                    },
                                                    onremove: function(evt){
                                                        _syncParentExpr(this);
                                                        _UpdateBCRemove.apply(this, [evt]);
                                                    },
                                                    editable: true,
                                                    onRender: function(){
                                                        var c = _CountBC(this.items),
                                                            t = this.tree;
                                                        t.set('bandingCount', c.b);
                                                        t.set('conditionCount', c.c);  
                                                    },
                                                    isEditable: function isedt(item){
                                                        if (!this.editable) {
                                                            return false;
                                                        }
                                                        var _result = false;
                                                        // Determines whether a given tree node data is editable or not.
                                                        //TO-DO: the switch can probably be replaced by item && (item.et != _ET.XML || !item.xml)? 
                                                        switch(item && item.et){
                                                            case _ET.ANDOR:  
                                                            case _ET.MQ:
                                                            case _ET.AQ:
                                                            case _ET.AL:    
                                                            case _ET.AC:
                                                            case _ET.MC:
                                                            case _ET.AE:
                                                            case _ET.R:
                                                            case _ET.F:   
                                                                _result = true; 
                                                                break;
                                                            case _ET.XML:
                                                                _result = !item.xml; // Hack, now we can edit shortcut to prompt
                                                        }
                                                        
                                                        if(!_result){
                                                            mstrmojo.all.mstrCGE.set('readOnly',true);
                                                        }

                                                        return _result;
                                                    },
                                                    onnodeclick: function ndclk(evt){
                                                        if (!this.editable) {
                                                            return;
                                                        }
                                                        // Launch an editor for editing upon click.
                                                        _openWalk(this.data, this, evt && evt.part);
                                                    },
                                                    onnodeadd: _UpdateBCAdd,
                                                    onnoderemove: _UpdateBCRemove,
                                                    allowDrop: function allowDrop(ctxt){
                                                        var s = ctxt && ctxt.src,
                                                            d = s && s.data,
                                                            et = d && d.et,
                                                            banding = (et === _ET.B),
                                                            t = this.tree;
        
                                                        return et && ((banding && (t.conditionCount === 0)) || (!banding && (t.bandingCount === 0)));   
                                                    },                                             
                                                    onNew: function _onNew(inf){
                                                        // Handles a click on the Add Condition link.
                                                        _openWalk(inf.data,
                                                            inf.widget.ctxtBuilder.itemWidgets[inf.index],
                                                            "condition"
                                                        );    
                                                    }
                                                },{
                                                    scriptClass: "mstrmojo.Button",
                                                    cssClass: "mstrmojo-CGE-addCondition",
                                                    text: mstrmojo.desc(1994,"Add Condition"),
                                                    slot: "exprToolsNode",
                                                    onclick: function(){
                                                        this.parent.filterExpr.newCondition(null, true);
                                                    },
                                                    bindings:{
                                                        enabled:function(){ return this.parent.filterExpr.bandingCount === 0;}
                                                    }
                                                }
                                            ];
                                        }
                                });
                            }
                },
                {
                    scriptClass: "mstrmojo.Button",
                    cssClass: "mstrmojo-CGE-newElement",
                    text: mstrmojo.desc(7922,"New Custom Group Element"),
                    alias: "addBtn",
                    title: mstrmojo.desc(7923,"Add new Custom Group Element"),
                    onclick: function(){
                        var cgels = mstrmojo.all.mstrCGEls;
                        var ng = cgels.add(
                            [{n: _freeName(cgels.items), did: ++ _NEW_ELEMENT_BASE, isNew: true}]
                        );
                        // TO DO: scroll to item and launch popup editor for its condition
                        // Scroll to newly added item
                        cgels.scrollTo(ng);
                    }
                 }
            ]
        },
        
        // Button bar.
        // TO DO: Create and use an mstrmojo.Table instead of nested HBoxes.
        {
            scriptClass: "mstrmojo.HBox",
            cssClass: "mstrmojo-Editor-buttonBar",
            cssText: "width: 100%",
            slot:"buttonNode",
            children: [
                {
                    scriptClass: "mstrmojo.HBox",
                    cssClass: 'left',
                    cssText: "border-collapse: separate",                    
                    cellSpacing: 3,
                    children: [
                        {
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: "mstrmojo-Editor-button",
                            text: mstrmojo.desc(4596,"Format..."),
                            onclick : function(){
                                var cge = mstrmojo.all.mstrCGE;
                                cge.openPopup("formatPopupRef",{zIndex:cge.zIndex + 10});
                            },
                            bindings : {
                                enabled : function(){
                                    return mstrmojo.all.mstrCGE.model.items.length > 0;
                                }
                            }
                        },
                        {
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: "mstrmojo-Editor-button",
                            text: mstrmojo.desc(7924,"Options..."),
                            onclick : function(){
                                var cge = mstrmojo.all.mstrCGE;
                                cge.openPopup("optionsRef",{zIndex:cge.zIndex + 10});
                            }
                        }
                    ]
                },
                {
                    scriptClass: "mstrmojo.HBox",
                    cssText: "float:right; border-collapse: separate",                    
                    cellSpacing: 3,
                    children: [
                        {
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: "mstrmojo-Editor-button",
                            text: mstrmojo.desc(5891,"Save"),
                            onclick: function() {
                                var cge = mstrmojo.all.mstrCGE,
                                    m = cge.model,
                                    id = m.did,
                                    valid = cge.isValid(true),
                                    ncg = mstrmojo.desc(8113,"New Custom Group");
                                if(valid){
                                    if(!id){
                                        cge.openPopup("saveasRef",{name:m.n || ncg ,desc:m.desc || '',folderLinksContextId:22,rootFolderID:m.pf, saveParams:_saveTaskParams(true), zIndex:cge.zIndex + 10});
                                        return; 
                                    }                                   
                                    var me = this,                                        
                                        // Create the task parameters to save current custom group.
                                        params = _saveTaskParams(false);
                                    this.set('enabled', false);
                                    this.set('iconClass', 'mstrmojo-WaitIcon');
                                    mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
                                            success: function() {
                                                me.set('enabled', true); 
                                                me.set('iconClass', '');
                                                //mstrmojo.all.mstrCGE.close(); //Should Not close CGE.
                                            },
                                            failure: function(res) {
                                                me.set('enabled', true);
                                                me.set('iconClass', '');
                                                mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
                                            }
                                        }, params);
                                }
                            },
                            bindings : {
                                enabled : function(){
                                    return !mstrmojo.all.mstrCGE.readOnly && mstrmojo.all.mstrCGE.model.items.length > 0;
                                }
                            }
                        },
                        {
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: "mstrmojo-Editor-button",
                            text: mstrmojo.desc(628,"Save As"),
                            onclick : function(){
                                var cge = mstrmojo.all.mstrCGE,
                                    m = cge && cge.model,
                                    valid = cge.isValid(true),
                                    ncg = mstrmojo.desc(8113,"New Custom Group");;
                                if(valid){
                                    cge.openPopup("saveasRef",{name:m.n || ncg,desc:m.desc || '',folderLinksContextId:22,rootFolderID:m.pf, saveParams:_saveTaskParams(true), zIndex:cge.zIndex + 10});
                                }
                            },
                            bindings : {
                                enabled : function(){
                                    return !mstrmojo.all.mstrCGE.readOnly && mstrmojo.all.mstrCGE.model.items.length > 0;
                                }
                            }
                        },
                        {
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: "mstrmojo-Editor-button",
                            text: mstrmojo.desc(221,"Cancel"),
                            onclick: function(){
                                mstrmojo.all.mstrCGE.close();
                            }
                        }
                    ]
                }
            ]
        }
    ],
    
    onOpen: function(){
        if(this.readOnly){
            mstrmojo.all.mstrCGE.set('title', mstrmojo.desc(8031,"Custom Group Editor (Read Only)"));            
            mstrmojo.alert(mstrmojo.desc(8022));
        }
    },
    
    onClose: function(){
        this.readOnly = false;
    },
    
    // function to convert cge information into xml format, which is acceptable by task
    // TODO move the definition to another scope. This method should be static to all custom group editors
    getXML : function CGE_json2xml(){
        var cge = this.model;
        var root = '<exp> <nd et="14" n="OR" fn="20" ce="' + (cge.cgp.ce? -1 : 0) + '" isp="' + (cge.cgp.isp ? -1 : 0) + '" ><nds>',
           end = '</nds></nd></exp>',
           props = {
                'a' : true,
                'a2' : true,
                'a3' : true,
                'agg' : true,
                'cc' : true,
                'ce' : true,
                'cgp' : true,
                'cs' : true,
                'desc' : true,
                'did' : true,
                'dmt' : true,
                'dmy' : true,
                'dtp' : true,
                'es' : true,
                'et' : true,
                'expr' : true,
                'f' : true,
                'flat' : true,
                'flt' : true,
                'fm' : true,
                'fm2' : true,
                'fm3' : true,
                'fn' : true,
                'fnt' : true,
                'fres' : true,
                'gb' : true,
                'isp' : true,
                'items' : true,
                'm' : true,
                'm2' : true,
                'm3' : true,
                'n' : true,
                'nds' : true,
                'not' : true,
                'pf' : true,
                'p' : true,
                'r' : true,
                'rps' : true,
                'st': true,
                't' : true,
                'utgt' : true,
                'utp' : true,
                'uts' : true,
                'v' : true,
                'xml' : true
           },
           config = {
                getArrItemName: function(n,v,i){
                    return n.substr(0, n.length - 1);
                },
                isSerializable: function(nodeName, jsons, index){
                   if (nodeName == 'xml') {
                       var ndXML = jsons[index].xml;
                       return { att: 'hasXML = "-1"', child : ndXML };
                   } 
                   //Formatting Data
                   else if (mstrmojo.array.indexOf(['header_format','grid_format', 'child_header_format', 'child_grid_format'], nodeName) > -1) {
                    var format = jsons[index][nodeName];
                    if (!format) return {};
                    
                    var xml = "<" + nodeName + ">";
                    for (var prs in format) { //each PropertySet, like FormattingFont
                       xml += "<prs n='" + prs + "'>"; 
                       var prsv = format[prs];
                       for (var pr in prsv) { //each Property, like Font
                           var prv = prsv[pr];
                           xml += "<pr n='" + pr + "' v='" + (prv=="pru" ? "" : prv) + "'";
                           xml += prv == 'pru' ? ' pru="1"' : '';
                           xml += "/>"; //end Property
                       }
                       xml += "</prs>"; //end PropertySet
                    }
                    xml += "</" + nodeName + ">";
                    return {child: xml};
                   }
                   
                   return (props[nodeName]) ? true: false;
                },
                skipNull: true
           },
           items = cge.items,
           result = [];
        for (var i = 0, len = items.length; i < len; i ++) {
            var item = items[i];
            item.expr.n = item.n;
            result[i] = _S.json2xml('nd', [
                                                        { ce: item.ce || false, 
                                                          isp: item.isp || false,
                                                          header_format: item.header_format,
                                                          grid_format: item.grid_format,
                                                          child_header_format: item.child_header_format,
                                                          child_grid_format: item.child_grid_format
                                                          }, 
                                                         item.expr
                                                        ], config);
        }
        return root + result.join('') + end;
    },
    inlineTextRef: {
        scriptClass: "mstrmojo.Popup",
        locksHover: true,
        slot: "containerNode",
        children: [{
            scriptClass: "mstrmojo.TextBox",
            alias: "txt",
            onTab: function(evt){
                if (this.onEnter) {
                    this.onEnter();
                }
                var w = _D.shiftKey(evt.hWin, evt.e) ?
                            this.prevTab : this.nextTab;
                if (w && w.onclick) {
                    w.onclick();
                }
            },
            onblur: function(){
                if (this.onEnter) {
                    this.onEnter();
                }
            },
            onEsc: function(){
                if (this.onCancel) {
                    this.onCancel();
                }
                this.parent.close({cancel: true});
            }
        }],
        onOpen: function(){
            var t = this.txt,
                c = this.txtConfig;
            if (c) {
                for (var k in c){
                    t.set(k, c[k]);
                }
            }
            t.focus();
        }, 
        onClose: function(cfg) {
            if (!cfg || (!cfg.cancel && !cfg.enter)){
                this.txt.onEnter();
            }
        }
    },
    andOrPopupRef: {
        scriptClass: "mstrmojo.Editor",
        cssClass: "mstrmojo-CGE-andOrPopup mstrmojo-ConditionWalk", 
        cssText: "width: auto;",
        contentNodeCssClass: "mstrmojo-balloon",
        left: "250px",
        top: "15px",
        slot: "containerNode",
        autoClose:true,   
        showTitle: false,
        draggable: false,  
        openEffect: null,
        closeEffect: null, 
        onOpen: function(){
            // The popup is just a cosmetic shell for the list.
            // Set the selection on the list widget so it can use it.
            var w = this.condition,
                not = w && w.data && w.data.not,
                p = w && w.parent,
                pd = p && p.data,
                fn = (pd && pd.fn) + (not ? 21 : 0);
            this.list.opening = true;
            this.list.set("selectedItem", isNaN(fn) ? null : {did: fn});
            this.list.opening = false;
        },
        children: [
            {
                scriptClass: "mstrmojo.Dial",
                cssClass:"mstrmojo-CGE-andOrDial",
                alias: "list",
                //cssText: "height:" + _HEIGHT + "px",
                itemMarkup: '<div class="dial-item {@css}">{@n}</div>',
                itemIdField: "did",
                items: [
                    {did: 19, n: _BF[19]},
                    {did: 20, n: _BF[20]},
                    {did: 19+21, n: _BF['19_21']}, //{did: 19+21, n: _BF[19] + " " + _BF[21]},
                    {did: 20+21, n: _BF['20_21']}  //{did: 20+21, n: _BF[20] + " " + _BF[21]}
                ],
                onchange: function(){
                    // If we are initializing the popup, ignore event.
                    if (this.opening) {
                        return;
                    }
                    // Collect the selection and close this popup.
                    var pop = this.parent,
                        w = pop.condition,
                        sel = this.selectedItem,
                        did = sel && sel.did,
                        not = did > 21 ? true : null,
                        fn = did - (not ? 21 : 0);
                    pop.close();
                    
                    // Update the filter expression.
                    var bq = w && w.parent;
                    if (bq && bq.data && bq.data.et === _E.ET.ANDOR) {
                        // If the condition has a branch qual (AND/OR) parent, assume it can conduct
                        // the edit+repaint for us. (Note: The edit may require indenting the condition.)
                        bq.edit(w, fn, not);
                    } else {
                        // If the condition has no branch qual parent, just update its data directly,
                        // and tell it to repaint.
                        var d = w && w.data;
                        if (d && (d.not !== not)) {
                            d.not = not;
                            w.paint();
                        }
                    }
                }
            }
        ]
    },
    conditionPopupRef: {
        scriptClass: "mstrmojo.Editor",
        cssClass: "mstrmojo-Editor-ConditionWalk",
        contentNodeCssClass: "mstrmojo-balloon",
        title: mstrmojo.desc(7953,"Condition Editor"),
        help: "condition_editor.htm",
        slot: "containerNode",     
        onOpen: function(){
            // The popup is just a cosmetic shell for the walk.
            // Pass down data to the walk widget so it can use it.
            this.walk.set("targets", this.targets);
            this.walk.set("targetsLastMod", this.targetsLastMod);
            this.walk.set("model", this.model);
        },
        onClose: function() {
            var c = this.condition;
            // if condition is empty, then remove the condition
            if (c.isEmpty()) {
                c.del();
            }
        },
        children: [
            {
                scriptClass: "mstrmojo.ConditionWalk",
                alias: "walk",
                cssText: "height:" + _HEIGHT + "px",
                targets: null,
                ets: null,
                onOK: function(){
                    var p = this.parent,
                        c = p.condition;
                    // Update the corresponding list data item "in place", without changing the object reference.
                    _H.copy(
                        this.model.get(),
                        _H.clear(c.data)
                    );
                    // Update the GUI.
                    c.paint();
                    p.close();
                }
            }
        ]
    },
    
    isValid : function (showMsg){
        var its = mstrmojo.all.mstrCGE.model.items,
            l = its.length,
            i,
            msg = '';
        if(l > 0){
            for(i=0;i<l;i++){
                if(!its[i].expr) {
                    msg += its[i].n + ',';
                }
            }
            if (msg) {
                msg = msg.replace(/,$/, '');
                mstrmojo.confirm(mstrmojo.desc(7947).replace('#', msg),   //Descriptor: Custom Group Element cannot be empty. Define at least one condition for #. 
                        [mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, { //Descriptor: OK
                            scriptClass: "mstrmojo.HTMLButton",
                            cssClass: 'mstrmojo-Editor-button'
                        })]); 
                return false;
            }
        } else {
            mstrmojo.confirm("Custom Group does not have any element defined. Please fix it before saving.", [
                             mstrmojo.Button.newInteractiveButton(mstrmojo.desc(1442), null, null, { //Descriptor: OK
                                 scriptClass: "mstrmojo.HTMLButton",
                                 cssClass: 'mstrmojo-Editor-button'
                             })]);               
            return false;
        }
        return true;
    }
};

})();