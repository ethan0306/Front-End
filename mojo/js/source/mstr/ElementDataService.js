(function () {
    mstrmojo.requiresCls("mstrmojo.hash");

    mstrmojo.mstr.ElementDataService = mstrmojo.provide(

        'mstrmojo.mstr.ElementDataService',

        {
            /**
             * Retrieve elements according to the parameters, and performs call backs according to the result of the service.
             *
             * @param {Object} params The parameter for this request.
             * @param {String} params.attributeID The ID of the attribute whose elements have been requested.
             * @param {Integer} params.blockBegin
             * @param {Integer} params.blockCount
             * @param {String} params.filterXML
             * @param {String} params.searchPattern
             * @param {Boolean} params.matchCase
             * @param {String} params.dataSourcesXML
             * @param {String} [params.searchForms]
             * @param {String} [params.shortFilterXML]
             * @param {String} [params.targetAttributeID]
             * @param {Boolean} [params.includeFormNames]
             * @param {Boolean} [params.includeFormValues]
             * @param {String} [params.displayedForms]
             * @param {String} [params.dimensionID]
             */
            getElements: function getElements(params, callback) {
                var req = mstrmojo.hash.copy(params, {});
                req.taskId = req.taskId || 'browseElements';
                mstrApp.serverRequest(req, callback, {
                    showWait: true,
                    hideWait: true,
                    delay: true
                });
            }
        }
    );
}());