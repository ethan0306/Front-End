(function() {
	mstrmojo.BarcodeReader = mstrmojo.provide(
		'mstrmojo.BarcodeReader',
		{
			/**
			 * Call backs registered for the pending location request.
			 */
			_callback: null,
			_callbackId: 0,
			
			/**
			 * Method for JavaScript client to start barcode reading activity
			 * 
			 */
			readBarcodes: function readBarcodes(params, callback) {
			    this._callbackId++;
                var id = '' + this._callbackId;
                this._callback = callback;
                var callbackStr = 'mstrmojo.BarcodeReader.onBarcodeResult';
                if ( params ) {
                    params.blockBegin = 0;
                    params.blockCount = -1;
                    params.serverUrl = mstrApp.getConfiguration().getTaskUrlByProject(mstrApp.getCurrentProjectId());
                    params.sessionState = mstrApp.getSessionState();
                }
                mstrMobileApp.readBarcodes(id, (params && JSON.stringify(params)) || null, callbackStr);
			},
			
            onBarcodeResult: function onBarcodeResult(id, resCode, value) {
                //Ignore old calls;
                var callback = this._callback;
                if ( id != this._callbackId || (! callback)) {
                    return;
                }
                delete this._callback;
                if ( resCode == -1 ) { //Success
                    callback.success(value);
                } else if ( resCode != 0 ) {//Cancelled
                    callback.failure(value || 'Error reading bare code.');
                }
            }
		}
	);
	//checkLoadingStatus(mstrmojo.BarcodeReader, {});

})();