/*global mstrmojo:false, mstrApp:false, window:false, document:false */
/*jslint forin: true, undef: true, browser: true, newCap: true */

(function(){

    mstrmojo.FlexHelper = mstrmojo.declare(
        null,
        null,
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.FlexHelper",
            
            getWidget: function gw(objId) {
	        	var ids = objId.split('x');
	        	return mstrApp.docModel.getUnitInstance(ids[0],ids[1]);
            },
        
            getZoomFactor: function gzf() { 
                 return mstrApp.docModel.zf * 100;
            }
        }
    );
    
    var flexHelper = new mstrmojo.FlexHelper();

    window.getFlexHelper = function () {
        return flexHelper;
    };
        
})();

