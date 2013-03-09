(function(){

    mstrmojo.requiresCls("mstrmojo.func");
    
    /**
     * <p>A ResSetLink to a report or document.</p>
     * 
     * @class
     * @extends mstrmojo.XtabModel
     */
    mstrmojo.ResSetLink = mstrmojo.declare(
        mstrmojo.Obj,
        
        null,
        
        /** 
         * @lends mstrmojo.ResSetLink.prototype
         */
        {            
            scriptClass: "mstrmojo.ResSetLink",
            // Hyperlink Drill Constants
            SAME_PROMPT: 1,
            DO_NOT_ANSWER: 2,
            CLOSE: 3,
            DYNAMIC: 4,
            STATIC: 5,
            CURRENT_UNIT: 6,
            ALL_VALID_UNITS: 7,
            USE_DEFAULT_ANSWER: 8,
            
            toXml: function toXml() {
                
                // Function for createing XML attributes.
                var me = this,
                    fnXMLAttribute = function(name, value) { 
                        return ' ' + name + '="' + value + '"';
                    },
                    fnXMLAttributeElement = function(name, value) {
                        return fnXMLAttribute(name, mstrmojo.string.encodeXMLAttribute(value));
                    },
                    xml = new mstrmojo.StringBuffer();

                // Start the link XML.
                xml.append('<hl' + fnXMLAttribute('mid', me.mid) + fnXMLAttribute('srct', me.srct) + fnXMLAttribute('aopam', me.aopam) + '>');
                  
                // Get the answers info. 
                var prms = this.prms,
                    prmCnt = prms && prms.length;
                  
                if (prmCnt) {
                    
                    // Add prompts node. 
                    xml.append('<prms>');
                    
                    for (var i = 0; i < prmCnt; i++) {
                        var prm = prms[i];
                          
                        // Prompt ID, answermode, prompt type.
                        // Add the prompt info node to the xml. 
                        xml.append('<prm' + fnXMLAttribute('id', prm.id) + fnXMLAttribute('am', prm.am));
                          
                        // Is the prompt origin passed. If yes, add that to the XML too. 
                        if (prm.orid) {
                            xml.append(fnXMLAttribute('orid', prm.orid) + fnXMLAttribute('ortp', prm.ortp));
                        }
                        xml.append('>');  
              
                        // How should we answer the prompts?
                        switch (prm.am) {
                            case me.DO_NOT_ANSWER:
                            case me.CLOSE:
                            case me.USE_DEFAULT_ANSWER:
                            case me.SAME_PROMPT:
                                break;
                                  
                            case me.STATIC:
                                xml.append('<pa ia="1"><es>');
                                var es = prm.pa.es,
                                    esLen = es && es.length || 0;

                                for (var z = esLen - 1; z >= 0; --z) {
                                    var e = es[z];
                                    xml.append('<e' + fnXMLAttribute('ei', e.ei) + fnXMLAttribute('disp_n', e.disp_n) + fnXMLAttribute('emt', e.emt)  + '/>');
                                }
                                  
                                xml.append('</es></pa>');
                                break;
                                  
                            case me.DYNAMIC:
                            case me.ALL_VALID_UNITS:
                            case me.CURRENT_UNIT:
                                var pa = prm.pa;
                                if (pa) {
                                    xml.append('<pa ia="1">');
                                    var a = pa.a;
                                    
                                    if (a) {
                                        xml.append('<a' + fnXMLAttribute('id', a.id) + fnXMLAttributeElement('n', a.n) + '>');
                                    }
                                                  
                                    xml.append('<es' + fnXMLAttribute('dispForms', a && a.dispForms >=0 ? a.dispForms : '') + '>'); 
                                    var es = pa.es
                                        esLen = es && es.length || 0;
                                    for (var z = esLen - 1; z >= 0; --z) {
                                        var e = es[z];
                                        xml.append('<e' + fnXMLAttribute('ei', e.ei) + fnXMLAttribute('disp_n', e.disp_n) + fnXMLAttribute('emt', e.emt)  + '/>');
                                    }
                                    xml.append('</es>');
                                      
                                    if (a) {
                                        xml.append('</a>');
                                    }
                                    xml.append('</pa>');
                                }
                                break;
                                
                        }
                        xml.append('</prm>');
                    }
                    xml.append('</prms>');
                }
                xml.append('</hl>');
                  
                return xml.toString();
            }


        }
    );
})();