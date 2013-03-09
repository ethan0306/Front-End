(function() {
    mstrmojo.requiresCls('mstrmojo.css', 'mstrmojo.hash', 'mstrmojo.string', 'mstrmojo.DICFactory');
    
    var EDIT_ACTION = 32,
        TX_ELEM_TEXTFIELD = 3,
        TEXTAREA = 8,
        MASK = '********',
        FIELDGROUP = 2,
        DATA_DRIVEN_CONTROL = 2,
        $C = mstrmojo.css,
        MASK = '********',
        $H = mstrmojo.hash;
    
    var tf_formatHandlers = null;
    
    /**
     * Set the dirty flag on the given DOM node by placing a div node (containing the dirty cell flag) in.
     * @param {HTMLElement} c The given DOM node for setting the dirty flag.
     * @param {HTMLElement} d The container DOM node. 
     */
    function setDirtyFlag(c, d) {
        if(c && c.className !== 'flag-container') {
            var f = document.createElement('div');
            f.className = 'flag-container';
            f.style.right = '10px';
            f.innerHTML = '<div class="dirty-cell"/>';
            d.insertBefore(f, c);                            
        }
    }
    
    /**
     * <p>A mixin for displaying editable text field. The data input controller is dynamically 
     * associated with the text field according to the text field data type. </p>
     * 
     * <p>The data input widget will get displayed as embedded widget when the show control by default is set to be true.
     * If the show control by default is false, the data input widget will get display as popup widget when user clicks on it. 
     * </p>
     */
    mstrmojo._IsEditableTextfield = 
        {
            _mixinName: "mstrmojo._IsEditableTextfield",            
                                        
            preBuildRendering: function preBldRnd() {
                var d = this.node.data,
                    defn = this.node.defn,
                    di = d.dic || defn.txi.dic,
                    rv = (this.rv == '') ? this.value : this.rv; //TQMS 499163: use the display value if the raw value is empty for static text field.
                        
                //if we configure a password mask for the DIC
                if(di.psw) {
                    this.v = MASK;
                    rv = this.rv = '';
                }
                //if the dic definition does not include the vls data, assign the values from data portion
                if(this.vls) {
                    di.vls = this.vls;
                }
                
                this.dt = di.dt;
                if(di.ipt === DATA_DRIVEN_CONTROL) {
                    this.dk = di.k;
                }
                
                this.dicWidget = mstrmojo.DICFactory.createDIC({dic: di, owner: this, k:0, dv: this.value, value: rv, openerType: FIELDGROUP});
                
                if (this.shouldReplaceValueNode()){
                    //cache the formatHandlers since they are class level property
                    if(!tf_formatHandlers) {
                        tf_formatHandlers = $H.clone(this.formatHandlers);
                    }
                    
                    this.formatHandlers.domNode = ['T', 'z-index', 'D', 'B', 'F', 'P', 'text-align', 'background-color', 'fx', 'white-space', 'overflow'];
                    //do not have value node anymore from the DocTextField class, delete it
                    delete this.formatHandlers.valueNode;
                }
                //apply editable field css    
                this.set('cssClass', 'editable-field');
            
                if(this._super) {
                    this._super();
                }            
            }, 
            
            shouldReplaceValueNode: function shouldReplaceValueNode(){
                return this.dicWidget.showByDefault || this.dicWidget.hasPreview;
            },
            
            postBuildRendering: function pstBldRnd() {
                if(this._super) {
                    this._super();
                }
                
                var w = this.dicWidget,
                    text = this.valueNode.innerHTML;

                // TQMS 497975: Editable textfield should not be shrunk if it contains empty string.
                if (mstrmojo.string.isEmpty(text)){
                    this.valueNode.innerHTML = text + '1';
                    this.valueNode.style.height = this.valueNode.clientHeight + 'px';
                    this.valueNode.innerHTML = text;
                }
                
                if (w.showByDefault){
                    w.render();
                }else{
                    if (w.hasPreview){
                        // need to replace the value node
                        w.openerNode = this.domNode;
                        //TQMS 503967: While rendering the datetime picker for the first time, we need to use the display value.
                        w.renderPreview(this.value); 
                    }else{
                        w.openerNode = this.valueNode;
                    }
                    
                    mstrmojo.dom.attachEvent(w.openerNode, 'click', function() {
                        w.showInPopup();
                    });
                }
                
                //if inline control, we restore the format handlers
                if(this.shouldReplaceValueNode()) {
                    $H.copy(tf_formatHandlers, this.formatHandlers);
                }
                
                if(this.mdf && this.sci) {
                    var d = this.domNode, 
                        c = d.firstChild;
                    setDirtyFlag(c, d);
                }
            },
            
            getKeyContext: function(key) {
                var o = {dt: this.dt || 0};
                if(this.dk) {
                    o.k = this.dk;
                }
                return o;
            },
            
            getUpdates: function() {
                var udv = this.getUpdatedValues()[0],
                    k = udv.k ? ('rw_control_key="' + udv.k + '" element_id="' + this.vls[mstrmojo.array.find(this.vls, 'v', udv.v)].eid + '" ') : '';
                return '<rwf rw_tree_type="' + this.tt + '" rw_node_key="' + this.fgk + '" rw_field_key="' + this.k + '" key="' + this.key + '" columns="' + this.cls + '" types="' + TX_ELEM_TEXTFIELD + '" ' + k + 'value="' + mstrmojo.string.encodeXMLAttribute(String(udv.v)) + '" dt="' + udv.dt + '" />';
            },
            
            updateValue: function(idx, vo) {
                if (this._super){
                    this._super(idx, vo);
                }
                
                var t = this.valueNode,
                    d = this.domNode,
                    w = this.dicWidget,
                    v = vo.v,
                    dv = vo.dv;
                
                if(this.rv !== v) {
                    if(!w.showByDefault) {
                        if (w.hasPreview){
                            w.renderPreview();
                        }else {
                            t[t.innerText !== undefined ? 'innerText':'textContent'] = this.psw ? MASK : dv;
                        }
                    }
                    
                    if(this.sci) {                            
                        setDirtyFlag(d.firstChild, d);
                    }
                    
                    this.rv = v;
                    this.v = dv;
                    this.mdf = 1;
                }
                
                //return whether we need to do auto-refresh
                //as textfield will never do auto-refresh, we always return false here
                return false;
            },
            
            applyPasswordMask: function(){
                this.psw = true;
                this.v = MASK;
                this.rv = '';
            },
            
            /**
             * Returns the update JSON object for task call
             */
            getUpdateObject: function getUpdateObject() {
                return {
                    nodeKey: this.fgk,
                    cells: [{
                        fieldKey: this.k,
                        wid: this.wid, //to be changed
                        newValue: mstrmojo.string.encodeXMLAttribute(String(this.rv)),
			dataType: this.dt
                    }],
                    retrieveData: false, //for web task
                    //TQMS: 501190 set autoRefresh flag to be true to trigger auto recalculate.
                    autoRefresh: true
                };
            },                        
            
            update: function update(node) {
                if(this._super) {
                    this._super(node);
                }
                var d = node.data,
                    df = node.defn;
                
                if(d.vls) {
                    this.vls = d.vls;
                } else {
                    delete this.vls;
                }
                
                this.cell = node.data;
                //set the value
                this.value = d.v || '';
                //add raw data
                this.rv = (d.rv === undefined) ? this.value : d.rv;
                this.tca = d.tca || 0;
                this.dt = d.dt;
                this.key = d.key || ''; // in Android, we do not really use the value, so set it to be empty string
                this.cls = d.cls || ''; // the same reason above
                this.wid = d.wid;
                
                //modified?
                this.mdf = d.mdf;
                
                //show indicator
                this.sci = df.txi.sci;
                this.tt = df.tt;
                this.fgk = df.fgk;
            }            
        };
}());
