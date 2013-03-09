/**
 * DebugResSetStore.js Copyright 2010 MicroStrategy Incorporated. All rights reserved.
 * 
 * @version 1.0
 */
/*
 * @fileoverview Widget that contains the entire application UI on Mobile devices.
 */
var debugRsStore = {
    "-1":{
        eId: "-1",
        children:{}
    }
};
var debugRsStoreCount = 1;

(function() {

    mstrmojo.requiresCls(
            "mstrmojo.Obj"
    );

    /**
     * @private
     */
    var CLASS_NAME = 'DebugResSetStore';
    
    var NO_ROW_ID = -1,
    
    //Cache tree levels
    LVL_ROOT = 0,
    LVL_PROMPT = 1,
    LVL_LAYOUT = 2,
    LVL_PAGE_BY = 3,
    LVL_IF = 4,
    
    VN_DATA = "data",
    VN_PROMPT = "prompt",
    VN_PB_TREE = "pb";

    var LVL_NAMES = ['root', 'prompt', 'layout', 'pb', 'ifc'];

    /**
     * Main Widget class for mobile applications.
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._FillsBrowser
     */
    mstrmojo.DebugResSetStore = mstrmojo.declare(
        mstrmojo.Obj,
        null,

        /**
         * @lends mstrmojo.DebugResSetStore.prototype
         */
        {
            scriptClass: "mstrmojo.DebugResSetStore",
            
            //nodes: [],
            root: {
                children: {}
            },
            init: function init(projId){
                this._super();
                this.nodes = [];
                var root = this.root,
                    projNod;
                if (projId) {
                    projNode = root.children[projId];
                    if (! projNode ) {
                        projNode = {
                            key: projId, 
                            level: 0, 
                            //values: {},
                            children: {}
                        };
                        root.children[projId] = projNode;
                    }
                    this.nodes.push(projNode);
                }
            },
            
            getData: function getData(level, keys) {
                var p = level ? this.nodes[level - 1] : this.root,
                    nodes = this.nodes,
                    n, i;
                nodes.length = level + keys.length;
                for ( i = 0; i < keys.length; i++) {
                    n = nodes[level + i];
                    if ( n && n.key == keys[i]) {
                        p = n;
                    } else {
                        break;
                    }
                }
                for ( ; p && i < keys.length; i++) {
                    n = p.children[keys[i]];
                    if ( n ) {
                        nodes[level + i] = n;
                    }
                    p = n;
                }
                if ( n ) {
                    while ( n.child ) {
                        n = n.child;
                        nodes[level + i++] = n;
                    }
                    return n.values[VN_DATA];
                }
            },
            
            putData: function putData(paramStr) {
                var params = JSON.parse(paramStr),
                    level = params.level,
                    keys = params.keys, 
                    data = params.data, 
                    updateParent = params.updateParent,
                    extras = params.extras,
                    nodes = this.nodes,
                    p = level ? nodes[level - 1] : this.root,
                    i, n ;
                nodes.length = level + keys.length;
                for ( i = 0; i < keys.length; i++) {
                    n = nodes[level + i];
                    if ( n && n.key == keys[i]) {
                        p = n;
                    } else {
                        break;
                    }
                }
                for (; i < keys.length; i++) {
                    n = {
                            key: keys[i], 
                            level: level + i, 
                            values: {},
                            children: {}
                        };
                    n.parent = p;
                    p.children[keys[i]] = n;
                    if ( ! p.child || updateParent ) {
                        p.child = n;
                    }
                    updateParent = true;
                    nodes[level + i] = n;
                    p = n;
                }
                if ( data ) {
                    this.setValue(n.level, 'data', data);
                }
                if ( extras ) {
                    for ( i = 0; i < extras.length; i++ ) {
                        var e = extras[i];
                        this.setValue(e.l, e.n, e.v);
                    }
                }
            },
            
            setAsDefault: function setAsDefault(level) {
                var node = this.nodes[level],
                    parent = node.parent;
                parent.child = node;
            },
            
            setValue: function setValue(level, name, value) {
                var e = this.nodes[level]; 
                e.values[name] = value;
            },
            
            getValue: function getValue(name, level) {
                if (typeof(level) != 'undefined'  && level >= 0 ) {
                    return this.nodes[level].values[name];
                } else {
                    var v, nodes = this.nodes, vals;
                    for ( var i = 0; i < nodes.length; i++) {
                        vals = nodes[i].values; 
                        v = vals && vals[name];
                        if ( v ) {
                            return v;
                        }
                    }
                    return null;
                }
            },
            
            hasNode: function hasNode(level) {
                return this.nodes[level];
            },
            
            getKey: function getKey(level) {
                var n = this.nodes[level];
                return n && n.key;
            },
            
            
            getKeys: function getKeys () {
                var res = [];
                for ( var i = 0; i < this.nodes.length; i++ ) {
                    if (this.nodes[i]) {
                        res[i] = this.nodes[i].key;
                    }
                }
                return JSON.stringify(res);
            },
            
            //===========================================================================================
            getNodeByKey: function getNodeByKey(parent, key) {
                parent = parent || this.root;
                var res = parent.children[key],
                    nodes = this.nodes;
                if ( res ) {
                    var n = res;
                    for ( var i = res.level; i < nodes.length; i++ ) {
                        if ( n && i === n.level ) {
                            nodes[i] = n;
                            n = n.child;
                        } else {
                            nodes[i] = null;
                        }
                    }
                }
                return res;
            },
            
            addNode: function addNode(key, level, value, valueName, valueLevel, updateParent) {
                var n = {
                        key: key, 
                        level: level, 
                        values: {},
                        children: {}
                    };
                if ( level === valueLevel) {
                    n.values[valueName] = value;
                }
                var p = this.getParent(level) || this.root;
                n.parent = p;
                p.children[key] = n;
                if ( ! p.child || updateParent ) {
                    p.child = n;
                }
                this.nodes[level] = n;
                return n;
            },

            addDataNodes: function addDataNodes(data, layout, pbKey, ifPosition, dataLevel) {
                if ( layout ) {
                    this.addNode(layout, LVL_LAYOUT, data, VN_DATA, dataLevel, false);
                }
                if ( pbKey ) {
                    this.addNode(pbKey, LVL_PAGE_BY, data, VN_DATA, dataLevel, false);
                }
                if ( ifPosition ) {
                    this.addNode(ifPosition, LVL_IF, data, VN_DATA, dataLevel, false);
                }
            },
            
            getParent: function getParent(level) {
                for ( var i = level - 1; i >= 0; i--) {
                    if ( this.nodes[i]) {
                        return this.nodes[i];
                    }
                }
                return null;
            },
            
            removeProjectCaches: function removeProjectCaches(projId) {
                delete this.root.children[projId];
            },
            
            clear: function clear() {
                this.root.children = {};
                this.nodes = [];
            },

            getImage: function getImage(url) {
                return url;
            }
            
        });
})();

