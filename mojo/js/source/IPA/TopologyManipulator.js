(function(){

	 mstrmojo.requiresCls("mstrmojo.func", "mstrmojo.Model");
	 mstrmojo.requiresCls("mstrmojo.Obj", "mstrmojo.Arr", "mstrmojo.hash");
    
    function formatAttributes(attributes){
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
            }
            else {
                use_quote = QUOTE
            }
            
            escape = ESCAPED_QUOTE[use_quote]
            
            // Escape only the right kind of quote
            re = new RegExp(use_quote, 'g')
            att_str = ' ' + att + '=' + use_quote +
            att_value.replace(re, escape) +
            use_quote
            result += att_str
        }
        return result
    }
    
    function _pad(val){
        var s = val.toString();
        return s.length < 2 ? "0" + s : s;
    }
    
    function _convertUCStringToDate(dat){
        return dat.getUTCFullYear() + "-" + _pad((dat.getUTCMonth() + 1)) + "-" + _pad(dat.getUTCDate()) + " " + _pad(dat.getUTCHours()) + ":" + _pad(dat.getUTCMinutes()) + ":" + _pad(dat.getUTCSeconds());
    }
    
    function createXmlElement(name, attributes, content){
        var att_str = ''
        if (attributes) { // tests false if this arg is missing!
            att_str = formatAttributes(attributes)
        }
        var xml
        if (!content) {
            xml = '<' + name + att_str + '/>'
        }
        else {
            xml = '<' + name + att_str + '>' + content + '</' + name + '>'
        }
        return xml
    }
    
    function updateTopologyTask(ipac, cbos,cbof){
    
        mstrmojo.xhr.request('POST', '../servlet/taskProc', {
            success: cbos,
            failure: cbof
        }, {
            taskId: 'updateTopologyTask',
            xmlcommands: ipac
        });
        
        
    }
    
    function getTopologyTask(t,cs,cf){
        mstrmojo.xhr.request('POST', '../servlet/taskProc', {
            success: cs,
            failure:cf
        }, {
            taskId: 'getTopologyTask',
            timestamp: t
        });  
    }
    
	function buildModel(e){
		// set the model passed in to something heirachical
		if (e.length == 0) return [];
		var newModel = {};
		var rootNodePos = -1;
		newModel.environments = [];
		
		for (var i = 0; i < e.length; i++){
			if (e[i].id == "RN"){rootNodePos = i;}
			else{newModel[e[i].id] = e[i];}
		}

		var env = e[rootNodePos].children;

		for (var i = 0; i < env.length; i++){
			newModel.environments.push(newModel[env[i].id]);
		}

		return newModel;
	
		}
    
    mstrmojo.IPA.TopologyManipulator = mstrmojo.provide("mstrmojo.IPA.TopologyManipulator", {
        
    	commandStack: [],
		
		unconnectedServers: [],
		
		unconnectedEnvironment: {},
    	
    	environmentListModel: {},
    	
    	createEnvironmentwithServers: function as(e,callBackOnSuccess,callBackOnFailure){
			var s = this.unconnectedServers;
            var serversxml = "",associationXML = "";
            // create environment xml
            var envXML = createXmlElement("c",e);
            // create servers xml
            // associate servers with environment
            for (var i = 0; i < s.length; i++){
            	serversxml += createXmlElement("c",s[i]);
            	associationXML += createXmlElement("a",{"pi":e.i,"ci":s[i].i,"po":"0"});
            }
            
            // add env to root node
            associationXML += createXmlElement("a",{"pi":"RN","ci":e.i,"po":"0"});

           var ipac = createXmlElement("ipac", {ts: _convertUCStringToDate(new Date())},
        		   envXML+serversxml+associationXML);
            
           updateTopologyTask(ipac, callBackOnSuccess,callBackOnFailure);
		   //clear the array
		   this.unconnectedServers.length = 0;
        },
    
		deleteEnvironment: function de(id, /*name, t, p,*/ callBackOnSuccess,callBackOnFailure){
        	var deleteXML = createXmlElement("de", {"i":id});
        	var ipac = createXmlElement("ipac", {ts: _convertUCStringToDate(new Date())},deleteXML);
        	  
        	updateTopologyTask(ipac, callBackOnSuccess,callBackOnFailure);
        },
        
		associateServerToEnvironment: function as(s, e, callBackOnSuccess,callBackOnFailure){
        	
        	var serversxml  = createXmlElement("c",s);
        	var associationXML = createXmlElement("a",{"pi":e.i,"ci":s.i,"po":"0"});
        	
            var ipac = createXmlElement("ipac", {ts: _convertUCStringToDate(new Date())},associationXML);
             
            updateTopologyTask(ipac, callBackOnSuccess,callBackOnFailure);
        	
        },
        
		disassociateServerFromEnvironment: function as(s, e, callBackOnSuccess,callBackOnFailure){
        	var disassociationXML = createXmlElement("di",{"pi":e.i,"ci":s.i});
        	
            var ipac = createXmlElement("ipac", {ts: _convertUCStringToDate(new Date())},disassociationXML);
             
            updateTopologyTask(ipac, callBackOnSuccess,callBackOnFailure);
        },
        
		getEnvironmentList: function gel(timestamp,callBackOnSuccess,callBackOnFailure){
        	me = this;
        	var successFunc = mstrmojo.func.composite(
        			[function(res){
        				me.environmentListModel = buildModel(res.elementList);
        				},callBackOnSuccess]);
        	
        	getTopologyTask(timestamp,successFunc,callBackOnFailure);
        },
        
        addunconnectedServers: function (server){
        	this.unconnectedServers.push(server);
        	
        },
        
        /*
         * This function checks if put is a valid port number i.e a positive integer with no 
         * floating point value, non numeric content
         * return:true if valid value
         * 		  false if invalid value
         */
        isAValidPortNumber: function(num){
        	if((parseFloat(num) == parseInt(num)) && !isNaN(num)&& !(num<0)){
        		return true;
        	}else{
        		return false;
        	}
        },
        
        /**
         * Checks if element is present in the array.
         * return true : if element is present in the array
         *        false : otherwise 
         */        
        isElementInArray:function(array, elem){
        	for(var i =0; i < array.length; i++){
        		if(array[i].id == elem.id)
        			return true;
        	}
        	return false;
        }
        
    });
    
})();
