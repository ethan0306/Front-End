(function(){
    
    mstrmojo.requiresCls("mstrmojo.array");
    
    /**
     * Returns a hidden input.
     * 
     * @param {HTMLDocument} doc The parent document of the target form.
     * @param {String} n The name of the field.
     * @param {String} v The value of the field.
     * 
     * @returns HTMLElement
     * @private
     */
    function createInput(doc, n, v) {
        var el = doc.createElement('input');
        el.name = n;
        el.type = 'hidden'; //#435303 - FF4 issue - this should go before setting el.value; or call el.setAttribute(); otherwise, el.value will be lost. 
        el.value = v;

        return el;
    }
    
    /**
     * Appends URL values as hidden inputs to the supplied form.
     * 
     * @param {HTMLElement} oForm The form that will receive the new hidden inputs.
     * @param {String} URL The URL with the parameters and values to be added to the form.
     * 
     * @type Boolean
     * @return false
     */
    function _addURLAsHiddenInputsToForm(oForm, URL){
        URL = URL.substring(URL.indexOf("?") + 1,URL.length);
        var URLParameters = URL.split("&"),
            parameterName = "",
            parameterValue = "";

        //Replace ALL + characters with space. The reason for that is the unescape function does not take care of this conversion.
        //That function just converts all strings of format %HH to the character value of the HH hex value
        //Our URL encoding codes spaces to + characters. Hence we have to reverse that effect over here.
        var myRegExp = /\+/g;

        for (var i = 0, cnt = URLParameters.length; i < cnt; i++) {
            var p = URLParameters[i].split("=");
            parameterName = p[0];
            parameterValue = p[1];

            if (parameterValue) {
                parameterValue = decodeURIComponent(parameterValue.replace(myRegExp, ' '));
            }

            var oNewItem = document.createElement("INPUT");
            oNewItem.type="HIDDEN";
            oNewItem.name = parameterName;
            oNewItem.value = parameterValue;

            oForm.appendChild(oNewItem);
        }
        return false;
    }

    /**
     * Static class for building and submitting dynamic forms.
     * 
     * @class
     */
    mstrmojo.form = {
            
        /**
         * Creates a dynamic FORM element and inserts it into the body of the document.
         * 
         * @param {String} sAction The url of the form which may contain parameters.
         * 
         * @type HTMLElement
         * @return The newly created and inserted form.
         */
        createDynamicForm:function createDynamicForm(sAction) {
            var oNewForm = document.createElement("FORM") ,
                hasParameters = sAction.indexOf('?') > 0;

            oNewForm.name = "dynamic_form";
            oNewForm.method = "POST";

            var formAction =  ((hasParameters) ? sAction.substring(0, sAction.indexOf('?')) : sAction);

            //Remove request parameters if any and add them as hidden inputs:
            oNewForm.action = formAction;

            // Does the action have parameters?
            if (hasParameters) {
                // Add the parameters to the form.
                _addURLAsHiddenInputsToForm(oNewForm, sAction);
            }

            //insert the new form after the last form in the list of forms on the document
            document.body.appendChild(oNewForm);

            return oNewForm;
        },
        
        /**
         * <p>Submits an HTTP request via an HTML form.</p>
         * 
         * <p>The form is dynamically created, populated with the given params (if any), added to DOM, submitted, and then removed from DOM.</p>
         * 
         * @param {Object} params The parameters to be added to the form as hidden inputs.
         * @param {String} [action=mstrApp.name|mstrWeb] The value for the action attribute of the dynamic form.
         * @param {String} [method=GET] The value for the method attribute of the dynamic form.
         * @param {String} [target] The target of the form.
         * @param {Object} [config] An optional configuration object.  
         * @param {Object} [addUtxs] An optional flag indicating whether to append unqiue time stamp as part of the action. Default to false in ASP enviornment
         */
        send: function send(params, action, method, target, config, addUxts) {
            // Create the form.
            var doc = ((config && config.hWin) || window).document,
                f = doc.createElement('form'),
                app = mstrApp;
            
            // Set the method, defaulting to 'GET'.
            f.method = method || "GET";
            
            // Is the target present?
            if (target) {
                // Add to form.
                f.target = target;
            }
            
            // Set the form action.
            f.action = action || app.name;
            
            //TQMS 411098  Not append timestamp as part of the action as it will break in ASP enviornment
            addUxts = (addUxts !== undefined )? addUxts:!(f.action && f.action.indexOf("aspx") > 0);
            
            // Do we have a sessionId?
            if (app.sessionId) {
                // Add the sessionId to the action.
                f.action += ';jsessionid=' + app.sessionId;
            }

            // we need unique timestamp in the action. 
            // Note - Just creating unique input node (with a timestamp) is not good enough for some browsers e.g. Safari instance within an native application. 
            if (addUxts) { 
                f.action += ';uxts' + mstrmojo.now();
            }
            
            // Add time stamp to avoid caching.
            f.appendChild(createInput(doc, 'xts', mstrmojo.now()));
            
            //Add persist parameters
            for (var key in app.persistTaskParams) {
            	params[key] = app.persistTaskParams[key];
            }
            
            // Do we have servlet state? when lost session, we may need servlet state to recover the server/project info ...
            if (app.servletState && app.name){
            	params[app.name] = app.servletState;
            }

            // Add the parameters
            if (params) {
                // Iterate the parameters.
                for (var n in params) {
                    // Is the value an array?
                    if (params[n].constructor == Array) {
                        // Yes, add multiple fields with the same name.
                        mstrmojo.array.forEach(params[n], function (item) {
                            f.appendChild(createInput(doc, n, item));
                        });
                    } else {
                        // No, just add one field for this value.
                        f.appendChild(createInput(doc, n, params[n]));
                    }
                }
            }
            
            // Append the form to the document.
            doc.body.appendChild(f);

            // Try to submit the form.
            try {
                f.submit();
            } catch (ex) {
                // Failed.  Does the form have a target and did it fail because of the popup blocker?
                if (target && ex.result === 2147500037 && !window.open('', '', 'width=1,height=1,left=0,top=0,scrollbars=no')) {
                    mstrmojo.alert('*This action requires popups to be allowed in the browser.*');    // TODO: Descriptor: 5877
                } else {
                    mstrmojo.err('Form submission failed for an unknown reason.');         // TODO: Descriptor
                }
            }
            
            // Remove the form from the DOM.
            doc.body.removeChild(f);
        }
    };
})();