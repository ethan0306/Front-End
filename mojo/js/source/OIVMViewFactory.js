(function(){
    
    mstrmojo.requiresCls("mstrmojo.DocDataService");
    
    mstrmojo.OIVMViewFactory = mstrmojo.declare(
        mstrmojo.OIVMViewFactory,        
        null,
        {
            scriptClass: 'mstrmojo.OIVMViewFactory',
            
            newDocDataService: function newDocDataService(props) {
                return new mstrmojo.DocDataService(props);
            }
        }
    );
}());