(function(){
    mstrmojo.requiresCls("mstrmojo.TabContainer");
    
    mstrmojo.TabListContainer = mstrmojo.declare(
        //superclass
        mstrmojo.TabContainer,
        //minxins,
        null,
        /**
         * @lends mstrmojo.TabListContainer.prototype
         */
        {
            scriptClass: 'mstrmojo.TabListContainer',
            
            markupString: '<table id="{@id}" class="mstrmojo-tabcontainer {@cssClass}"><tr>' +
                                    '<td class="mstrmojo-tabcontainer-tabs {@listCssClass}"></td>' +
                                    '<td class="mstrmojo-tabcontainer-stack {@containerCssClass}"></td>' +
                                    '<td class="{@bottomCssClass}"></td>' +
                                    '</tr></table>',
                                    
            markupSlots: {
                top: function(){ return this.domNode.firstChild.childNodes[0].childNodes[0]; },
                stack: function(){ return this.domNode.firstChild.childNodes[0].childNodes[1];},
                containerNode: function() { return this.domNode.firstChild.childNodes[0].childNodes[1]; },
                bottom: function(){ return this.domNode.firstChild.childNodes[0].childNodes[2]; }
            }
        });
    
})();
