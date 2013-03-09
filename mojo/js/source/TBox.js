
mstrmojo.requiresCls("mstrmojo.Container");

mstrmojo.TBox = mstrmojo.declare(
    mstrmojo.Container,
    
    null,
    {
        scriptClass: "mstrmojo.TBox",
        markupString: '<table id="{@id}" class="mstrmojo-TBox {@cssClass}" cellspacing="{@cellSpacing}" cellpadding="{@cellPadding}" style="{@cssText}">'
            + '<tbody><tr><td></td></tr></tbody></table>',
                markupSlots: {
            containerNode: function(){ return this.domNode.rows[0].cells[0];}
        },
        
        cellSpacing: 0,
        
        cellPadding: 0
    
    });
