(function(){

    mstrmojo.requiresCls('mstrmojo.Vis', 'mstrmojo._CanSupportTransaction');
    
    function getAbsolutePath(imagePath){
        if(/^(http|https):\/\//i.test(imagePath)){
            return imagePath;
        }else {
            var hostURL = mstrApp.getConfiguration().getHostUrlByProject(mstrApp.getCurrentProjectId());
            return hostURL.replace(/(servlet\/|asp\/)$/, '') + imagePath;
        }
    }
    
    mstrmojo.PhotoUploader = mstrmojo.declare(
            
            mstrmojo.Vis,
            
            [mstrmojo._CanSupportTransaction, mstrmojo._TouchGestures],
            
            {
                scriptClass: 'mstrmojo.PhotoUploader',
                
                photoNum: 0,
                
                markupString: '<div id="{@id}" class="mstrmojo-PhotoUploader" style="left:{@left};top:{@top};width:{@width};height:{@height}" mstrAttach:click>' +
                                  '<div class="actionButton" style="line-height:{@height}">{@n}</div>' +
                                  '<img class="preview"></img>' +
                                  '<div class="numberBadge">' +
                                      '<div class="badgeText"></div>' +
                                  '</div>' +
                              '</div>',
                
                markupSlots: {
                    buttonNode: function(){ return this.domNode.firstChild;},
                    previewNode: function(){ return this.domNode.childNodes[1];},
                    badgeNode: function() { return this.domNode.lastChild;},
                    badgeTextNode: function() {return this.domNode.lastChild.firstChild;}
                },
                
                markupMethods:{
                    onphotoNumChange: function(){
                        mstrmojo.css.toggleClass(this.domNode, 'empty', this.photoNum == 0);
                        if (this.photoNum > 0){
                            this.badgeTextNode.innerHTML = this.photoNum;
                        }
                    }
                },
               
                preBuildRendering: function(){
                    this._super();
                    
                    var dp = this.getDataParser(),
                        rowTitles = dp.getRowTitles(),
                        colTitles = dp.getColTitles(),
                        firstRow, t1, t2, t3, atid1, atid2;
                    
                    if (rowTitles.size() < 3 && colTitles.size() < 1){
                        // Must have at least 3 attribute forms and 1 metric
                        mstrmojo.alert("Incorrect grid template structure!");
                        return false;
                    } else if (dp.getTotalRows() < 10){
                        // Must have at least 10 rows 
                        mstrmojo.alert("At least 10 rows required!");
                        return false;
                    } 
                    
                    firstRow = dp.getRowHeaders(0);
                    t1 = rowTitles.getTitle(0); //photo path attribute
                    t2 = rowTitles.getTitle(1); //photo description attribute
                    atid1 = t1.getUnitId(); // attribute id
                    atid2 = t2.getUnitId();
                    t3 = colTitles.getTitle(0).getHeaderValues()[0]; //count metric
                    
                    this.cellInfo = [{
                        atid: atid1,
                        form_id: t1.getFormId(),
                        ui: 0
                    }, {
                        atid: atid2,
                        form_id: t2.getFormId(),
                        ui: (atid1 == atid2) ? 0:1 //if two forms are from the same attribute, then unit index should be the same
                    }, {
                        metric_id: t3.oid
                    }];

                    this.photoNum = 0; //reset photoNum
                    this.n = mstrmojo.desc(8470);
                },
                
                /**
                 * @override
                 */
                setModel: function(model){
                    this.txModel = model && model.docModel;
                },
                
                /**
                 * @param k the current row ordinal
                 * @return
                 */
                getKeyContext: function(k){
                    return { o: parseInt(k, 10) };
                },
                
                /**
                 * generate manipulation JSON for android
                 */
                getUpdateObject: function(i){
                    var udvs = this.getUpdatedValues(),
                        CHANGE_DATA = 2, //manipulation type for grid cell change
                        cells = [], ci = this.cellInfo;
                    
                    for (var i in udvs){
                        var udv = udvs[i],
                            photoPath = mstrmojo.string.encodeXMLAttribute(String(udv.v[0])),
                            photoDesc = mstrmojo.string.encodeXMLAttribute(String(udv.v[1])),
                            count = '1';
                        cells.push({
                            rowOrdinal: udv.o, //photo path attr
                            attId: ci[0].atid,
                            formId: ci[0].form_id,
                            unitIndex: ci[0].ui,
                            newValue: photoPath
                        }, {
                            rowOrdinal: udv.o, //photo desc attr
                            attId: ci[1].atid,
                            formId: ci[1].form_id,
                            unitIndex: ci[1].ui,
                            newValue: photoDesc
                        }, {
                            rowOrdinal: udv.o, //count metric
                            colOrdinal: 0,
                            newValue: count
                        });
                    }
                    
                    return {
                        manipulation: CHANGE_DATA,
                        nodeKey: this.k,
                        sliceId: this.sid,
                        cells: cells,
                        autoRefresh: false
                    };
                },
                
                /**
                 * generate manipulation xml for oivm
                 * TODO: data type is hardcoded, should read this info from txi node.
                 */
                getUpdates: function getUpdates(){
                    var eg = [], 
                        w = this, 
                        j, udt = false,
                        udvs = this.getUpdatedValues(), udv,
                        TX_ELEM_ATT_FORM = 1,
                        TX_ELEM_METRIC = 2,
                        DssXmlDataTypeVarChar = 9,
                        DssXmlDataTypeInteger = 1,
                        ci = this.cellInfo;
                    
                    eg.push('<gr rw_tree_type="' + this.defn.tt + '" rw_node_key="' + w.k + '" slice_id="' + (w.sid || 0) + '">');
                    
                    for(j in udvs) {
                        if(udvs.hasOwnProperty(j)) {
                            udv = udvs[j];
                            
                            for (var i = 0; i < 2; i++){
                                eg.push('<cli ax="1" attribute_id="' + ci[i].atid + '" form_id="' + ci[i].form_id + '">' + 
                                            '<updt types="' + TX_ELEM_ATT_FORM +'" ordinal="' + udv.o + '" value="' + udv.v[i] + '" dt="' + DssXmlDataTypeVarChar + '"/>' +
                                        '</cli>');
                            }
                            
                            eg.push('<cli cordinal="0" metric_id="' + ci[2].metric_id + '">' + 
                                        '<updt types="' + TX_ELEM_METRIC + '" rordinal="' + udv.o + '" value="1" dt="' + DssXmlDataTypeInteger + '"/>' +
                                    '</cli>');
                            
                            udt = true;
                        }
                    }
                    eg.push('</gr>');
                    if (!udt){
                        eg = [];
                    }
                    
                    return eg.join('');
                },
                
                /**
                 * callback upon the photo has been uploaded
                 */
                photoUploaded: function(imagePath, description){
                    mstrMobileApp.setWaitScreenVisibility(false);
                    var url = getAbsolutePath(imagePath),
                        desc = description,
                        currentIdx = this.photoNum;
                    
                    this.previewNode.src = url;
                    
                    this.dataChanged(currentIdx, {}, {v: [url, desc]});

                    this.set('photoNum', currentIdx + 1);
                },
                
                touchTap: function(){
                    this.onclick();
                },
                
                onclick: function(){
                    if (this.photoNum == 10){
                        mstrmojo.alert("can upload at most 10 photos");
                    }else{
                        var params = {
                            serverUrl: mstrApp.getConfiguration().getTaskUrlByProject(mstrApp.getCurrentProjectId()),
                            sessionState: mstrApp.getSessionState(),
                            descs: {
                                'ADD_PHOTO' : mstrmojo.desc(8470),
                                'TAKE_NEW_PHOTO' : mstrmojo.desc(8471),
                                'CHOOSE_FROM_GALLERY' : mstrmojo.desc(8472),
                                'DONE' : mstrmojo.desc(8473),
                                'CANCEL' : mstrmojo.desc(221)
                            }
                        };
                        
                        //TODO: let controller decide instead of calling mstrMobileApp interface directly.
                        mstrMobileApp.uploadPhotos(JSON.stringify(params), 'mstrmojo.all["' + this.id + '"].photoUploaded');
                    }
                }
            }
    );

}());