(function() {
	// descriptor for required prompt error message
    mstrmojo.requiresDescs(8409);
    /**
     * Base class for all web prompt objects.
     * 
     * @class
     * @extends mstrmojo.Obj
     */
    mstrmojo.prompt.WebPrompt = mstrmojo.declare(
        mstrmojo.Obj,
        
        null,

        /**
         * @lends mstrmojo.prompt.WebPropt.prototyep
         */
        {
            scriptClass: 'mstrmojo.prompt.WebPrompt',
            
            /**
             * Web prompt type.
             * 
             * @type Integer 
             * @see com.microstrategy.web.objects.EnumWebPromptType
             */
            promptType: 0,
            
            /**
             * Hash map of properties, keyed by property's name.
             * @type Object
             */
            prs: null,
            
            /**
             * Prompt type.
             * 
             * @type Integer
             * @see com.microstrategy.webapi.EnumDSSXMLPromptType.
             */
            pt: 0,
            
            /**
             * Prompt's PIN assigned by the I-Server that uniquely identifies
             * this prompt inside prompts collection.
             * 
             * @type Integer
             */
            pin: 0,
            
            /**
             * Prompt's location.
             */
            loc: null,
            
            /**
             * Prompt title or null.
             * 
             * @type String
             */
            title: '',
            
            /**
             * Prompt description.
             * 
             * @type String
             */
            mn: '',
            
            /**
             * Whether the prompt is require or not.
             * 
             * @type Boolean
             * @default false
             */
            req: false,
            
            /**
             * Value of prompt minimum property or null. This value is used to
             * validate prompt answers.
             * 
             * @type Number
             */
            min: null,
            
            /**
             * Value of prompt miximum property or null. This value is used to
             * validate prompt answers.
             * 
             * @type Number
             */
            max: null,
            
            /**
             * Value of prompt's data sources XML.  
             */
            dataSourcesXML: '',
            /**
             * <p>Returns the style of the prompt from the {@link mstrmojo.prompt.WebPrompt.STYLES} enumeration.</p>
             * 
             * <p>An error is thrown if no style is found.
             * 
             * @type Integer
             */
            getStyle: mstrmojo.emptyFn,
            
            /**
             * Returns the value to display for this prompt.
             * 
             * @type String
             */
            getDisplayValue: mstrmojo.emptyFn,
            
            /**
             * <p>Validates whether the prompt passes the maximum and minimum limits (normally are limits on count of answers),
             * and required validation requirements.</p>
             * 
             * <p>This method should be called after setting answer for this prompt and before calling {@link #answerPrompt}.
             * This check in done at web server side, no Intelligence Server call involved.</p>
             * 
             * <p>An exception is thrown if one of the conditions fails - check the error code
             * to see which test failed.</p>
             * 
             */
            validate: function validate(v){
            	if (this.isAnswerEmpty(v) && this.req) {
            		 throw new Error(mstrmojo.desc(8409, 'This prompt (#) requires an answer.').replace('#', this.title)); 
            	}
            },
            
            /**
             * Gives prompt an opportunity to perform any time consuming task before the answer gets used.
             */
            prepareAnswer: function prepareAnswer(callbacks){
                var fn = callbacks && callbacks.success;
                if (fn) {
                    fn();
                }
            },
            
            /**
             * Returns the XML representation of prompt answer in the format used by the
             * Narrowcast server. This XML can be persisted in the Narrowcast server repository
             * and used later to populate answer of prompt object received from I-Server.
             *
             * @returns the XML representation of prompt answer in the format used by the Narrowcast server.
             */
            getAnswerXML: function getAnswerXML() {
                var buf = new mstrmojo.XMLBuilder();
                this.buildShortPa(buf);
                return buf.toString();
            },
            
            /**
             * Builds the short answer xml for this prompt's current answer.
             */
            buildShortAnswerXML: function buildShortAnswerXML(builder) {
                //alert('no implementation for this method. - buildShortAnswerXML.');
                return builder;
            },
            
            /**
             * Builds the short answer xml for this prompt's current answer.
             * 
             * @param builder mstrmojo.XMLBuilder
             */
            buildShortPa: function buildShortPa(builder) {
                builder.addChild("pa");
                builder.addAttribute("pt", this.pt);
                
                var loc = this.loc;
                if (loc) {
                    builder.addAttribute("pin", loc.pin);
                    builder.addAttribute("did", loc.did);
                    builder.addAttribute("tp", loc.t);
                }
                
                // specific type build its own info
                this.buildShortAnswerXML(builder);
                builder.closeElement();
            },
            
            /**
             * Populate the current answer from the XML. This method takes both
             * standard and short answer formats. If the <code>answerXML</code> parameter
             * is null and the prompt has the current answer it will be removed.
             *
             * @param ans the answer XML.
             */
            populateAnswer: function populateAnswer(ans){
                //alert('no implementation for this method. - populateAnswer.');
            },
            
            /**
             * Sets the prompt answer to the supplied value, provided validation succeeds.
             * 
             * <p>An exception is thrown if one of the conditions fails - check the error code
             * to see which test failed.</p>
             * 
             * @returns Boolean
             */
            setAnswerValue: mstrmojo.emptyFn,
            
            /**
             * Returns true if the current prompt answer is null or the
             * answer collection is empty (For example, in Elements collection is empty 
             * in case of an element prompt).
             * @return true or false.
             */
            isAnswerEmpty: function isAnswerEmpty(v){
                //alert('no implementation for this method. - isAnswerEmpty.');
                return false;
            },
            
            /**
             * Populate current prompt base on serialized prompt information.
             */
            populate: function populate(props) {
                this.promptType = props.ptp;
                this.pt = props.dptp;
                this.mn = props.mn;
                this.pin = props.pin;
                this.title = props.ttl;
                this.loc = props.loc;
                this.min = props.min || '';
                this.max = props.max || '';
                this.req = props.reqd;
                this.dataSourcesXML = props.dsrcs;
                
                // Populate prompt properties from array of prompt property objects.
                var prs = this.prs = {};
                mstrmojo.array.forEach(props.prs, function (p) {
                    prs[p.n] = p.v;
                });
                this.hasAnswer = props.hasAns;
            },
            
            buildAnswerObject: function buildAnswerObject() {
                return {
                    //I.B. We may need location to link answer to prompt
                    //loc: this.loc
                };
            },
            
            supported: function supported() {
            	return true;
            }
        }
    );
    
    mstrmojo.prompt.WebPrompt.TYPES = {
        CONSTANT_PROMPT: 1,
        CONSTANT_GEO_PROMPT: 1.5,
        ELEMENTS_PROMPT: 2            
    };
    
    mstrmojo.prompt.WebPrompt.STYLES = {
        TEXT: 1,
        LIST: 2,
        STEPPER: 3,
        SWITCH: 4,
        SLIDER: 5,
        CALENDAR: 6,
        TIME: 7,
        GEO: 8,
        BARCODE: 9
    };
}());