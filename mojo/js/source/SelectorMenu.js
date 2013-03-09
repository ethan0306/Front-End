(function(){
    mstrmojo.requiresCls("mstrmojo.MetricQualification");
    
    var $ID = "mstrSelectorMenu",
        $S = "mstrmojo.all['" + $ID + "'].selector",
        $BOX = "mstrmojo.Box",
        $BOXC = "mstrmojo-Menu-Box",
        $PRS = "pressed",
        $QUA = "qua",
        $QBIND = $S + "." + $QUA + "==",
        $IBIND = "!!" + $S + ".include",
        $MUQ = mstrmojo.MCSUtil.Q,
        $D = mstrmojo.desc;
    
    /**
     * Helper function to create Selector menu buttons.
     * 
     * @param {String} t The text to display in the button.
     * @param {Function} fn The function to execute when the button is clicked.
     * @param {Object} [b] An optional collection of bindings for this button.
     * 
     * @returns Object The menu button config.
     * @private
     */
    function createSctrMnBtn(t, clickName, clickValue, pressedBinding) {
        var btn = {
            scriptClass: 'mstrmojo.MenuItem',
            text: t,
            cssClass: 'mstrmojo-InteractiveButton',
            onclick: function () {
                var p = mstrmojo.all[$ID],
                    s = p.selector;
                
                // set() the name and value from args to selector
                s.set(clickName, clickValue);
                
                p.close();
            },
            bindings: {
                pressed: pressedBinding,
                enabled: "!mstrmojo.all['" + $ID + "'].selector.isInFilterPanel() || !!mstrmojo.all['" + $ID + "'].selector.getFilterPanel().defn.cas",
                iconClass: "this." + $PRS + " ? ' " + $PRS + "' : ' ' "
            },
            onpressedChange: function () {
                if (this.domNode) {
                    mstrmojo.css.toggleClass(this.domNode, $PRS, this.pressed);
                }
            }
        };
        
        return btn;
    }
    
    /**
     * The popup config for the {@link mstrmojo.DocSelector} popup menu.
     * This popup menu is trigger by clicking on the pulldown button on Selector's Titlebar.
     * 
     * @type mstrmojo.Popup
     */
    mstrmojo.SelectorMenu = mstrmojo.registry.ref({
        id: "mstrSelectorMenu",
        slot: "popupNode",
        scriptClass: "mstrmojo.Popup",
        cssClass: "mstrmojo-Menu",
        shadowNodeCssClass: "mstrmojo-Menu-shadow",
        contentNodeCssClass: "mstrmojo-Menu-content",
        locksHover: true,
        onOpen: function onOpen(){
            // Position this popup below the given button.
            var el = this.openerButton.domNode,
                op = this.opener,
                diff = mstrmojo.boxmodel.offset(el, op && op[this.slot]),
                x = diff.left,
                y = diff.top + ((el && el.offsetHeight) || 0);
            
            this.set("left", x + "px");
            this.set("top", y + "px");
        },

        children: [{
            scriptClass: $BOX,
            bindings: {
                visible: $S + ".style==7"                                       // only available for metric slider selector  {@link EnumRWControlStyle}
            },
            cssClass: $BOXC,
            children: [ createSctrMnBtn($D(3945, 'Include'), "include", true, $IBIND),
                        createSctrMnBtn($D(3946, 'Exclude'),  "include", false, "!" + $IBIND)
            ] 
            },{
            scriptClass: $BOX,
            cssClass: $BOXC,
            bindings: {
                visible: $S + ".style==7||" +  $S + ".style==8"                // only for metric slider and qualification style, {@link EnumRWControlStyle}
            },
            children: [ createSctrMnBtn($D(527, 'Value'), $QUA, $MUQ._G, $QBIND + "0"),
                        createSctrMnBtn($D(8070, 'Rank Highest'), $QUA, $MUQ._RT, $QBIND + "1"),
                        createSctrMnBtn($D(8071, 'Rank Lowest'), $QUA, $MUQ._RB, $QBIND + "2"),
                        createSctrMnBtn($D(8072, 'Rank % Highest'), $QUA, $MUQ._PT, $QBIND + "3"),
                        createSctrMnBtn($D(8073, 'Rank % Lowest'), $QUA, $MUQ._PB, $QBIND + "4") 
            ] 
        }]
    });
}());