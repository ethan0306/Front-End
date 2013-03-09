(function() {
    
    mstrmojo.requiresCls("mstrmojo.DocDataService");
    
    function _getCacheSrcIfExists(src, imc, imgKey) {
        if(imc && imc.cachedImg[imgKey]) {
            return imc.baseURL + imc.cachedImg[imgKey];
        } else {
            if(!imc.unCachedImg[imgKey]) {
                imc.unCachedImg[imgKey] = src;
            }
            return src;
        }
    }
    
    mstrmojo.iPhoneDocDataService = mstrmojo.declare(
            mstrmojo.DocDataService,
            null,
            {
                scriptClass: "mstrmojo.iPhoneDocDataService",
                
                imgCache: null,
                
                getRWGraphImage: function getRWGraphImage(params, callback) {
                    var imgKey =  params.k + "," + parseInt(params.sid, 10) + ","  + params.gbk + "," + this.msgId,
                        imc = this.imgCache;
                    //overriding callback
                    this._super(params, { 
                        success: function(src) {
                            callback.success(_getCacheSrcIfExists(src, imc, imgKey));
                         }
                    });
                    
                },
                
                getDocImage: function(url) {
                    var imgKey = url && url.replace(/\\/g, '/'),
                    imc = this.imgCache;
                    return _getCacheSrcIfExists(url, imc, imgKey);
                }
            }
        );
})();