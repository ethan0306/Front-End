(function () {

    mstrmojo.requiresCls(
        "mstrmojo.Label",
        "mstrmojo.HTMLButton",
        "mstrmojo.CheckBox",
        "mstrmojo.HBox",
        "mstrmojo.VBox",
        "mstrmojo.Box",
        "mstrmojo.Popup",
        "mstrmojo.List",
        "mstrmojo.DropDownButton");
    
    var setMyBindings = function(me){
        //me.boxes.left.pf.attachEventListener('pfChange',me.id,'positionChange');
        me.attachEventListener('pfChange',me.id,'positionChange');
        me.boxes.left.flat.attachEventListener('checkedChange',me.id,'flatChange');
        var b = {
                pf : 'this.boxes.left.pf.value',
                flat : '!this.boxes.left.flat.checked',
                agg : function(){return this.boxes.left.agg.checked ? "2" : "1";},
                rfi : 'this.boxes.left.rfi.value'
            };
        me.set('bindings',b); 
    },
    
    updateFields = function(me){
        var l = me.boxes.left;
        
        l.pf.set('value',me.pf);
        l.flat.set('checked', !me.flat);
        l.agg.set('checked', me.agg == 2);
        l.rfi.set('value',me.rfi);
    };
  
    
    
    /**
     * <p>
     * Animation effect of sliding in/out of a widget
     * </p>
     * 
     * @param {Boolean}
     *            show Boolean to indecate show or hide
     * @param {Object}
     *            widget Mojo Widget Instance
     *            
     * @private
     * @ignore           
     */
    function slideProp(show, target, prop, start, stop, onEnd, ease, extraProps) {

        // set animation properties
        var props = {
                target : target,
                onEnd : function() {
                    if (onEnd) {
                        onEnd();
                    }
                },
                props: {}
            };
        
        props.props[prop] = {
                ease : ease || mstrmojo.ease.sin,
                start : parseInt(start, 10),
                stop : parseInt(stop, 10),
                suffix : 'px'
            };//targetProps;

        // copy in other widget specific animation properties
        props = mstrmojo.hash.copy(extraProps, props);

        // Animation instance
        var fx = new mstrmojo.fx.AnimateProp(props);

        fx.play();
    }
    

    /**
     * Custom Group Options Editor.
     * @class
     * 
     * @extends mstrmojo.VBox
     */
    mstrmojo.CGEOptions = mstrmojo.declare(
        //superclass
        mstrmojo.VBox,
            
        //mixin
        null,
            
        /**
         * @lends mstrmojo.CGEOptions.prototype
         */
        {

        scriptClass: "mstrmojo.CGEOptions",

        children: [{
            scriptClass: "mstrmojo.HBox",
            alias: 'boxes',
            cellCssClass: 'cell',
            children: [{
                alias: 'left',
                scriptClass: "mstrmojo.Box",
                cssClass: 'mstrmojo-CGEOptions-options',
                children: [
//                            _createCheckBox({
//                               alias: 'flat',
//                               cssClass: 'row',
//                               label: mstrmojo.desc(7954, 'Enable hierarchical display')
//                           }),

//                           _createCheckBox(
//                           {
//                               alias: 'agg',
//                               cssClass: 'row',
//                               label: mstrmojo.desc(7955, 'Enable subtotals display')
//                           }),
                            {
                                scriptClass: 'mstrmojo.ImageCheckBox',
                               alias: 'flat',
                               cssClass: 'row',
                               label: mstrmojo.desc(7954, 'Enable hierarchical display')
                           },

                           {
                               scriptClass: 'mstrmojo.ImageCheckBox',
                               alias: 'agg',
                               cssClass: 'row',
                               label: mstrmojo.desc(7955, 'Enable subtotals display')
                           },
                           
                           
                            {
                                scriptClass: "mstrmojo.Label",
                                text: mstrmojo.desc(7956, 'Position parent header:'),
                                cssClass: 'row'
                            },
                            {
                                scriptClass: "mstrmojo.Pulldown",
                                itemIdField: 'v', 
                                alias: 'pf',
                                cssClass: 'CGE-parent-header mstrmojo-FormatEditor-DropDownButton',
                                items:
                                        [
                                         {n: mstrmojo.desc(7957, 'Above child items'), v: true},
                                         {n: mstrmojo.desc(7958, 'Below child items'), v: false}
                                         ],
                                bindings: {
                                    value: 'this.parent.parent.parent.pf'
                                }
                            },
                            {
                                scriptClass: "mstrmojo.Label",
                                text: mstrmojo.desc(7959, 'Interaction with report filter:'),
                                cssClass: 'row'
                            },
                            {
                                scriptClass: "mstrmojo.Pulldown",
                                itemIdField: 'v',
                                alias: 'rfi',
                                cssClass: 'CGE-report-filter mstrmojo-FormatEditor-DropDownButton',
                                items:
                                        [
                                        {n: mstrmojo.desc(7960, 'Default (Database Instance level)'), v: -1},
                                        {n: mstrmojo.desc(7961, 'No interaction'), v: 0},
                                        {n: mstrmojo.desc(2398, 'Apply'), v: 1},
                                        {n: mstrmojo.desc(7962, 'Apply but ignore related elements'), v: 2}
                                         ],
                                bindings: {
                                    value: function() {
                                        var rfi = this.parent.parent.parent.rfi,
                                            rfi = rfi == undefined ? '-1' : rfi;
                                        return rfi;
                                    }
                                }
                            }
               ]
            },
            {
                scriptClass: "mstrmojo.Box",
                alias:'preview',
                cssClass: 'mstrmojo-CGEOptions-preview',
                children : [
                    {
                        scriptClass: "mstrmojo.Label",
                        cssClass: 'title',
                        text: mstrmojo.desc(3389, 'Preview')
                    },
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(7963, 'Element Header 1'),
                        alias: 'g1t'
                    },
                    {
                        scriptClass: "mstrmojo.Box",
                        alias: 'e1',
                        cssClass: 'e',
                        children: [
                                    {
                                        scriptClass: "mstrmojo.Label",
                                        text: mstrmojo.desc(7965, 'Item 1-1')
                                    },
                                    {
                                        scriptClass: "mstrmojo.Label",
                                        text: mstrmojo.desc(7966, 'Item 1-2')
                                    }],
                        onflatChange: function(){
                            mstrmojo.css.toggleClass(this.domNode, ['flat'], this.flat);
                        }
                    },
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(7963, 'Element Header 1'),
                        cssText: 'margin-bottom:10px;',
                        alias: 'g1b'
                    },
                    
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(7964, 'Element Header 2'),
                        cssText: 'margin-top:10px;',
                        alias: 'g2t'
                    },
                    {
                        scriptClass: "mstrmojo.Box",
                        alias: 'e2',
                        cssClass: 'e',
                        children: [
                                    {
                                        scriptClass: "mstrmojo.Label",
                                        text: mstrmojo.desc(7967, 'Item 2-1')
                                    },
                                    {
                                        scriptClass: "mstrmojo.Label",
                                        text: mstrmojo.desc(7968, 'Item 2-2')
                                    }],
                        onflatChange: function(){
                            mstrmojo.css.toggleClass(this.domNode, ['flat'], this.flat);
                        }
                    },
                    {
                        scriptClass: "mstrmojo.Label",
                        text: mstrmojo.desc(7964, 'Element Header 2'),
                        alias: 'g2b'
                    }
                ]
            }]
        },
        {
            scriptClass: "mstrmojo.HBox",
            alias: 'btns',
            cssClass: 'mstrmojo-Editor-buttonBar',
            cssText: 'margin-top: 10px;',
            children: [{
                scriptClass: "mstrmojo.HTMLButton",
                alias: 'ok',
                text: mstrmojo.desc(2397, 'OK'),
                cssClass: 'mstrmojo-Editor-button',
                onclick: function () {
                    this.parent.parent.save();
                }
            },
            {
                scriptClass: "mstrmojo.HTMLButton",
                alias: 'cancel',
                text: mstrmojo.desc(2399, 'Cancel'),
                cssClass: 'mstrmojo-Editor-button',
                onclick: function () {
                    this.parent.parent.cancel();
                }
            }]
        }],
        
        
        //position parent header
        pf : true,
        //enable hierarchical display
        flat: false,
        //enable subtotals display
        agg: '1',
        //custom group interaction with report metric
        rfi: '-1',
        
        /************************Instance methods*********************************/
        
        postBuildRendering: function () {
            if (this._super) {
                this._super();
            }
            setMyBindings(this);
            this.preview();
        },
        
        open: function(model, props){
            var pp = model.cgp;
            this.pp = pp;
            this.set('pf', pp.pf);
            this.set('flat', pp.flat);
            this.set('agg', pp.agg);
            this.set('rfi', pp.rfi);
            
            updateFields(this);
            
            for(var p in props){
                this[p] = props[p];
            }
            
            this.set('visible', true);
            if (!this.hasRendered) {
                this.render();
            }
        },
        
        cancel: function(){
            var cb = this.closeCB;
            if(cb){
                cb[0][cb[1]]();
            }
        },
        
        save: function(){
            this.pp.pf = this.pf;
            this.pp.flat = this.flat;
            this.pp.agg = this.agg;
            this.pp.rfi = this.rfi;
            this.cancel();
        },
        
        positionChange: function(evt){
            this.preview(evt.value, null);
        },
        
        flatChange: function(evt){
            this.preview(null, !evt.value);
        },
        
        preview: function(p, f){
            p = !!p ? String(p) === 'true' : !(String(this.pf) === 'false');
            f = (f == null ? this.flat : f);
            var top = !!p,
                pv = this.boxes.preview;
            
            pv.g1t.set('visible',top);
            pv.g1b.set('visible',!top);
            pv.g2t.set('visible',top);
            pv.g2b.set('visible',!top);
            pv.e1.set('flat', f);
            pv.e2.set('flat', f);
        }
    });
})();