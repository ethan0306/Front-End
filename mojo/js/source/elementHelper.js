(function(){
    
    var _A = mstrmojo.array,
        ELEM_ALL_ID = 'u;',
        ELEM_DUMMY_ID = '-1';
    
    /**
     * A utility class for working with Element ID formatting
     * 
     * @class
     */
    mstrmojo.elementHelper = mstrmojo.provide(
        "mstrmojo.elementHelper",
        {
            
            /**
             * With browseElements task, we get the elements terse id with format of "hxxx;;display name",
             * here we need to reconstruct it to the format of "hxxx;<att_id>;display name".
             * And if the delDT is set to true, it means we don't need the display name. Just build it as "hxxx;<att_id>"
             * @param elems
             * @param attrId
             * @param delDT
             * @return
             */
            buildElemsTerseID: function buildElemsTerseID(elems, attrId, delDN) {
                var item;
                for (var i in elems) {
                    item = elems[i];
                    if (item.v) {
                        var vs = item.v.split(';');
                        if (vs && vs.length > 1) {
                            vs[1] = attrId;
                            
                            //delete the display name part, if the delete flag is set to true
                            if (delDN && vs.length > 2) {
                                vs.pop();
                            }
                            item.v = vs.join(';');
                        }
                    }
                }
                
                return elems;
            },
            /**
             * Compute the element selected count out of the total count for given number
             * @param ces current selected elements
             * @param elems the total elements
             * @return (sc of tc) or (tc) if sc == tc
             */
            buildElemsCountStr: function buildElemsCountStr(ces, elems) {
                if (!ces || !ces.length || !elems || !elems.length) {
                    return '';
                }
                
                var sc = ces.length, 
                    tc = elems.length;
                
                // Remove the all item from count
                if (_A.find(elems, 'v', ELEM_ALL_ID) > -1) {
                    tc -= 1;
                }
                // Remove the dummy item from count
                if (_A.find(elems, 'v', ELEM_DUMMY_ID) > -1) {
                    tc -= 1; 
                }
                
                // Consider user select All item
                if (_A.find(ces, 'v', ELEM_ALL_ID) > -1 || _A.indexOf(ces, ELEM_ALL_ID) > -1) {
                    sc = tc;
                }
                
                // Builde the string
                if (sc >= tc) {
                    return '(' + tc + ')';
                } else {
                    return '(' + sc + ' of ' + tc + ')';
                }
            }               
        });
})();