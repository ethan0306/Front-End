(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.Widget"
            );
    
    /**
     * FileUploadBox is a widget used to upload a file to web server. It wraps around the file input element in HTML and provides
     * a unified GUI across browsers. In addition, it is integrated with MicroStratey task infrastructure and can perform asynchronous upload
     * through an embedded iframe. To start uploading, the entry to call is the submit method, which takes an optional set of task parameters and an 
     * optional callbacks object. 
     */
    mstrmojo.FileUploadBox = mstrmojo.declare(
            // superclass
            mstrmojo.Widget,
            // mixins
            null,
            // instance members
            {
                scriptClass: "mstrmojo.FileUploadBox",
                
                value: "",
                
                params: null,
                
                action: 'taskProc', 
                
                uploadTaskId: 'uploadFile',
                
                browseLabel: 'Browse...',
                
                fileFieldName: 'myfile', 
                
                multiple: '', //multiple or empty(default)
                
                status: 'init', //init, loading, successful or failed

                jsonp: 'parent.mstrmojo.all.{@id}.uploadCallback(@R@)',
                
                markupString:'<div id={@id} class="mstrmojo-FileUploadBox {@cssClass}" style="{@cssText}">'  
                                 + '<form class="mstrmojo-FileUploadBox-form" target="{@id}_iframe" enctype="multipart/form-data" method="post" action="{@action}">'
                                        + '<input class="mstrmojo-FileUploadBox-input" readonly="readonly" type="text" size="30"/>'       
                                        + '<div class="mstrmojo-FileUploadBox-buttonDiv">'
                                            + '<div class="mstrmojo-FileUploadBox-button">{@browseLabel}</div>'
                                            + '<input class="mstrmojo-FileUploadBox-file" type="file" {@multiple} size="30" style="font-size:4em;" name="{@fileFieldName}" onchange="mstrmojo.all.{@id}.synValue();"/>'       
                                        + '</div>'
                                        + '<div style="display:none;"></div>'
                                 + '</form>'
                                 + '<iframe id="{@id}_iframe" + name="{@id}_iframe" style="display:none;" src="about:blank"></iframe>'
                            + '</div>',
                
                markupSlots:{
                    formNode: function(){return this.domNode.firstChild;},
                    inputNode: function(){return this.domNode.firstChild.firstChild;},
                    buttonNode: function(){return this.domNode.firstChild.childNodes[1].firstChild;},
                    fileNode: function(){return this.domNode.firstChild.childNodes[1].lastChild;},
                    paramsNode: function(){return this.domNode.firstChild.lastChild;}
                },
                
                markupMethods:{
                    onstatusChange: function(){
                        if(this.status === 'init'){
                            this.inputNode.value = "";
                            this.fileNode.value = "";
                            this.paramsNode.innerHTML = "";
                        }
                    },
                    onvalueChange: function(){
                        this.inputNode.value = this.value;
                    }
                },
                
                uploadCallback: function(d){
                    var success = (d.status == 200);
                    this.set('status', success ? 'successful' : 'failed');
                    if(success && this.onSuccess){
                        this.onSuccess(d);
                    }
                    if(!success && this.onFailed){
                        this.onFailed(d);
                    }
                },
                
                synValue: function(){
                    var v = this.fileNode.value,
                        a = v.split(/[\/\\]/);
                    
                    v = a[a.length-1];
                    this.set('value', v);
                },
                
                submit: function(ps, callbacks){
                    var r = true;
                    if(this.onsubmit){
                        r = this.onsubmit();
                    }
                    if(r){
                        //add other parameters to the form
                        ps = ps || {};
                        ps.fileFieldName = this.fileFieldName;
                        ps.taskEnv = "jsonp2";
                        ps.taskId = this.uploadTaskId;
                        ps.jsonp = this.jsonp.replace('{@id}', this.id);
                        
                        var h = [],
                            p;
                        
                        for(p in ps){
                            h.push('<input type="hidden" name="' + p + '" value="' + mstrmojo.string.encodeHtmlString(ps[p]) + '"/>');
                        }
                        
                        if(this.params){
                            ps = this.params;
                            for(p in ps){
                                h.push('<input type="hidden" name="' + p + '" value="' + mstrmojo.string.encodeHtmlString(ps[p]) + '"/>');
                            }
                        }
                        
                        this.paramsNode.innerHTML = h.join('');
                    
                        //update callbacks
                        if(callbacks){
                            this.onSuccess = callbacks.success;
                            this.onFailed = callbacks.failure;
                        }
                        
                        //submit the form to start uploading and change the status
                        this.formNode.submit();
                        
                        this.set('status', 'loading');
                    }
                },
                
                reset: function(){
                    this.set('status', 'init');
                }

            }
        );
        

    
})();