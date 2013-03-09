(function () {

    mstrmojo.requiresCls("mstrmojo.func", "mstrmojo.Model","mstrmojo.Obj", "mstrmojo.Arr", "mstrmojo.hash", "mstrmojo.IPA.EnvironmentModel");

    function formatAttributes(attributes) {
        var APOS = "'";
        QUOTE = '"'
        var ESCAPED_QUOTE = {}
        ESCAPED_QUOTE[QUOTE] = '&quot;'
        ESCAPED_QUOTE[APOS] = '&apos;'

        var att_value
        var apos_pos, quot_pos
        var use_quote, escape, quote_to_escape
        var att_str
        var re
        var result = ''

        for (var att in attributes) {
            att_value = attributes[att]

            // Find first quote marks if any
            apos_pos = att_value.indexOf(APOS)
            quot_pos = att_value.indexOf(QUOTE)

            // Determine which quote type to use around
            // the attribute value
            if (apos_pos == -1 && quot_pos == -1) {
                att_str = ' ' + att + "='" + att_value + "'"
                result += att_str
                continue
            }

            // Prefer the single quote unless forced to use double
            if (quot_pos != -1 && quot_pos < apos_pos) {
                use_quote = APOS
            } else {
                use_quote = QUOTE
            }

            escape = ESCAPED_QUOTE[use_quote]

            // Escape only the right kind of quote
            re = new RegExp(use_quote, 'g')
            att_str = ' ' + att + '=' + use_quote + att_value.replace(re, escape) + use_quote
            result += att_str
        }
        return result
    }

    function _pad(val) {
        var s = val.toString();
        return s.length < 2 ? "0" + s : s;
    }

    function _convertUCStringToDate(dat) {
        return dat.getUTCFullYear() + "-" + _pad((dat.getUTCMonth() + 1)) + "-" + _pad(dat.getUTCDate()) + " " + _pad(dat.getUTCHours()) + ":" + _pad(dat.getUTCMinutes()) + ":" + _pad(dat.getUTCSeconds());
    }

    function createXmlElement(name, attributes, content) {
        var att_str = ''
        if (attributes) { // tests false if this arg is missing!
            att_str = formatAttributes(attributes)
        }
        var xml
        if (!content) {
            xml = '<' + name + att_str + '/>'
        } else {
            xml = '<' + name + att_str + '>' + content + '</' + name + '>'
        }
        return xml
    }

    function updateEnvironmentTask(ipac, cbos, cbof) {

    	mstrmojo.xhr.request('POST', mstrConfig.taskURL ,{
            success: cbos,
            failure: cbof
        }, {
            taskId: 'updateTopologyTask',
            xmlcommands: ipac
        });


    }

    function getEnvironmentsTask(t, cs, cf) {    	
    	mstrmojo.xhr.request('POST', mstrConfig.taskURL ,{
            success: cs,
            failure: cf
        }, {
            taskId: 'getTopologyTask',
            timestamp: t
        });
    }

    function MHALoginTask(s, p, a, cs, cf) {
    	mstrmojo.xhr.request('POST', mstrConfig.taskURL ,{
            success: cs,
            failure: cf
        }, {
            taskId: 'MHALoginTask',
            server: s,
            port: p,
            accesscode: a
        });
    }
    function AddHCAgentToMHATask(s, p, a, cs, cf) {
    	mstrmojo.xhr.request('POST', mstrConfig.taskURL ,{  	
            success: cs,
            failure: cf
        }, {
            taskId: 'addHCAgentToMHATask',
            server: s,
            port: p,
            accesscode: a
        });
    }
    function MHALogoutTask(cs, cf) {
    	mstrmojo.xhr.request('POST', mstrConfig.taskURL ,{
            success: cs,
            failure: cf
        }, {
            taskId: 'MHALogoutTask',            
        });
    }
    
    function DeleteMHATask(cs, cf) {
    	mstrmojo.xhr.request('POST', mstrConfig.taskURL ,{
            success: cs,
            failure: cf
        }, {
            taskId: 'deleteMHATask',            
        });
    }
    

    function setAttributes(ipac, cbos, cbof) {
    	mstrmojo.xhr.request('POST', mstrConfig.taskURL ,{
            success: cbos,
            failure: cbof
        }, {
            taskId: 'updateTopologyTask',
            xmlcommands: ipac
        });
    }
    
    function serverValidationTask(server, port, appPath, callback){
    	mstrmojo.xhr.request('POST', mstrConfig.taskURL , callback, 
    	{
            taskId: 'webServerValidationTask',
            server: server,
            port: port,
            appPath:appPath            
        });
    }


    mstrmojo.IPA.EnvironmentController = mstrmojo.declare(
    mstrmojo.Obj,
    null,
    /**
     * @lends mstrmojo.IPA.EnvironmentController
     */
    {
        scriptClass: "mstrmojo.IPA.EnvironmentController",

        model: null,

        commandStack: [],

        unconnectedServers: [],

        selectedServers: [],

        // Create New Environment
        createEnvironmentwithServers: function as(e, callBackOnSuccess, callBackOnFailure) {    	
            var s = this.selectedServers;
            var serversxml = "",
                associationXML = "";
            // create environment xml
            var envXML = createXmlElement("c", e);
            // create servers xml
            // associate servers with environment
            for (var i = 0; i < s.length; i++) {
                if (s[i].i === "e1" || s[i].i === "e2" || s[i].i === "e3") {
                    s[i].i = s[i].i + i + ""; //change default id to add multiple servers of same type at a once
                    serversxml += createXmlElement("c", s[i]);
                }
                associationXML += createXmlElement("a", {
                    "pi": e.i,
                    "ci": s[i].i,
                    "po": "0"
                });
            }

            // add env to root node            
            associationXML += createXmlElement("a", {
                "pi": "RN",
                "ci": e.i,
                "po": "0"
            });

            var ipac = createXmlElement("ipac", {
                ts: _convertUCStringToDate(new Date())
            }, envXML + serversxml + associationXML);

            //clear the array
            this.selectedServers.length = 0;
            this.unconnectedServers.length = 0;
            updateEnvironmentTask(ipac, callBackOnSuccess, callBackOnFailure);            
        },
        // Deleting an Environment
        deleteEnvironment: function de(id, callBackOnSuccess, callBackOnFailure) {
            var deleteXML = createXmlElement("di", {
            	"pi": "RN",
                "ci": id
            });
            var ipac = createXmlElement("ipac", {
                ts: _convertUCStringToDate(new Date())
            }, deleteXML);

            updateEnvironmentTask(ipac, callBackOnSuccess, callBackOnFailure);
        },
        // Creating New Web/Mobile Server
        createServers : function (s,callBackOnSuccess,callBackOnFailure)
        {
        	var serversxml = "";
        	if (s.i === "e2" || s.i === "e3") {
                serversxml = createXmlElement("c", s);
            }
        	 var ipac = createXmlElement("ipac", {
                 ts: _convertUCStringToDate(new Date())
             }, serversxml);

             updateEnvironmentTask(ipac, callBackOnSuccess, callBackOnFailure);
        },
        // Associate a Web/Mobile Server to an environment
        associateServerToEnvironment: function as(s, e, callBackOnSuccess, callBackOnFailure) {
            var serversxml = "";

            //check for new web or mobile servers
            if (s.i === "e2" || s.i === "e3") {
                serversxml = createXmlElement("c", s);
            }

            //var i = e.iServers.length + e.mobileServers.length + e.webServers.length;
            var associationXML = createXmlElement("a", {
                "pi": e.i,
                "ci": s.i,
                "po": "0"
            });

            var ipac = createXmlElement("ipac", {
                ts: _convertUCStringToDate(new Date())
            }, serversxml + associationXML);

            updateEnvironmentTask(ipac, callBackOnSuccess, callBackOnFailure);

        },
        // 	DisAssociate a Web/Mobile Server to an environment
        disassociateServerFromEnvironment: function as(s, e, callBackOnSuccess, callBackOnFailure) {
            var disassociationXML = createXmlElement("di", {
                "pi": e.i,
                "ci": s.i
            });

            var ipac = createXmlElement("ipac", {
                ts: _convertUCStringToDate(new Date())
            }, disassociationXML);

            updateEnvironmentTask(ipac, callBackOnSuccess, callBackOnFailure);
        },
        // Update the Model with Changes in Topology
        getEnvironmentList: function gel(timestamp, callBackOnSuccess, callBackOnFailure) {            
        	me = this;            
            var successFunc = mstrmojo.func.composite([function (res) {
                mstrmojo.all.environmentModel.set('model', res.elementList)
            },
            callBackOnSuccess]);

            getEnvironmentsTask(timestamp, successFunc, callBackOnFailure);
        },


        connectToMHA: function con(s, p, a, callBackOnSuccess, callBackOnFailure) {
            MHALoginTask(s, p, a, callBackOnSuccess, callBackOnFailure);
        },
        
        disconnectFromMHA: function (callBackOnSuccess, callBackOnFailure) {
            MHALogoutTask(callBackOnSuccess, callBackOnFailure);
        },
        
        clearMHA:function (callBackOnSuccess, callBackOnFailure) {
            DeleteMHATask(callBackOnSuccess, callBackOnFailure);
        },
        addHCAgentToMHA : function(s, p, a,callBackOnSuccess, callBackOnFailure){
        	AddHCAgentToMHATask(s, p, a, callBackOnSuccess, callBackOnFailure);
        },
        setEnableAttribute: function mod(i, attrValue, callBackOnSuccess, callBackOnFailure) {
            var setAttributeXML = createXmlElement("m", {
                "i": i,
                "enable": attrValue
            });
            var ipac = createXmlElement("ipac", {
                ts: _convertUCStringToDate(new Date())
            }, setAttributeXML);

            setAttributes(ipac, callBackOnSuccess, callBackOnFailure);
        },

        setEnvNameAttribute: function (i, envName, callBackOnSuccess, callBackOnFailure) {
            var setAttributeXML = createXmlElement("m", {
                "i": i,
                "name": envName
            });
            var ipac = createXmlElement("ipac", {
                ts: _convertUCStringToDate(new Date())
            }, setAttributeXML);

            setAttributes(ipac, callBackOnSuccess, callBackOnFailure);
        },
        
        setServerPortAttribute : function(i, portValue, callBackOnSuccess, callBackOnFailure){
        	 var setAttributeXML = createXmlElement("m", {
                 "i": i,
                 "port": portValue
             });
             var ipac = createXmlElement("ipac", {
                 ts: _convertUCStringToDate(new Date())
             }, setAttributeXML);

             setAttributes(ipac, callBackOnSuccess, callBackOnFailure);	
        },
        
        setServerApplicationAttribute : function(i, appValue, callBackOnSuccess, callBackOnFailure){
       	 var setAttributeXML = createXmlElement("m", {
                "i": i,
                "application": appValue
            });
            var ipac = createXmlElement("ipac", {
                ts: _convertUCStringToDate(new Date())
            }, setAttributeXML);

            setAttributes(ipac, callBackOnSuccess, callBackOnFailure);	
       },

//        reorderEnvironments: function (i, index, callBackOnSuccess, callBackOnFailure) {
//
//           var id = index.toString(); 
//    	   var disassociationXML = createXmlElement("di", {
//                "ci": i,
//                "pi": "RN"
//            });
//            var associationXML = createXmlElement("a", {
//                "ci": i,
//                "pi": "RN",
//                "po": id
//            });
//
//
//            var ipac = createXmlElement("ipac", {
//                ts: _convertUCStringToDate(new Date())
//            }, disassociationXML + associationXML);
//
//            updateEnvironmentTask(ipac, callBackOnSuccess, callBackOnFailure);
//        },
        // Validate Server
        validateServer:function(server,port,appPath,callback){
        	serverValidationTask(server, port, appPath, callback);
        },

        /**
         * This function checks if put is a valid port number i.e a positive integer with no 
         * floating point value, non numeric content
         * return:true if valid value
         * 		  false if invalid value
         */
        isAValidPortNumber: function (num) {
            if ((parseFloat(num) == parseInt(num)) && !isNaN(num) && !(num < 0)) {
                return true;
            } else {
                return false;
            }
        },

        /** 
         * Checks if element is present in the array.
         * return true : if element is present in the array
         *        false : otherwise 
         */
        isElementInArray: function (array, elem) {
            if (array) {
                for (var i = 0; i < array.length; i++) {
                    if (elem.id != null) {
                        if ((array[i].id == elem.id)) return true;
                    } else if (elem.i != null) {
                        if ((array[i].i == elem.i) && (array[i].name == elem.name)&& 
                        	(array[i].port == elem.port) && (array[i].application == elem.application)) 
                        			return true;
                    }
                }
            }
            return false;
        },
        
        /** 
         * This method is called from IPABuildEnvironments to get the index of the element that we know
         * definitely exists in the selectedServers array.
         * Returns in the index of the element being searched
         * return index 
         */
        getArrayIndex: function (array, elem){
        	for(var i = 0; i < array.length; i++){
        		if((array[i].id == elem.id || array[i].i == elem.i) && (array[i].name == elem.name) &&
        				(array[i].type == elem.type))
        			return i;
        	}
        }

    });

})();