(function() {
    mstrmojo.requiresCls("mstrmojo.List", "mstrmojo.ListMapperTile", "mstrmojo.WidgetList");
    mstrmojo._TileList = mstrmojo.provide(
            'mstrmojo._TileList', 
            {
                layout: {
                    row: 3,
                    col: 3
                },
                _set_layout: function(l, v) {
                    mstrmojo.hash.copy(v, this.layout);
                    // refresh GUI
                    this.refresh();
                },
                preBuildRendering: function() {
                    this.cssClass = this._cssClassPrefix + ' ' + this.cssClass;
                    if (this._super) {
                        this._super();
                    }
                },
                postBuildRendering: function() {
                    var ret = true;
                    if (this._super) {
                        ret = this._super();
                    }
                    this.cssClass = this.cssClass.replace(this._cssClassPrefix, '');
                    return ret;
                }
            });
    
    mstrmojo.TileList = mstrmojo.declare(
            mstrmojo.List, 
            [mstrmojo._TileList], 
            {
                scriptClass: 'mstrmojo.TileList',
                listMapper: mstrmojo.ListMapperTile,
                _cssClassPrefix: 'mstrmojo-TileList'
            });
    
    mstrmojo.WidgetTileList = mstrmojo.declare(
            mstrmojo.WidgetList, 
            [mstrmojo._TileList], 
            {
                scriptClass: 'mstrmojo.WidgetTileList',
                listMapper: mstrmojo.WidgetListMapperTile,
                _cssClassPrefix: 'mstrmojo-WidgetTileList'
            });
})();
