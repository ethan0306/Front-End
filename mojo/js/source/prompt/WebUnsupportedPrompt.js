(function () {
    mstrmojo.requiresCls("mstrmojo.prompt.WebPrompt");
    
    /**
     * Model for an unsupported prompt.
     * 
     * @class
     * @extends mstrmojo.prompt.WebPrompt
     */
    mstrmojo.prompt.WebUnsupportedPrompt = mstrmojo.declare(
        mstrmojo.prompt.WebPrompt,
        
        null,
        
        /**
         * @lends mstrmojo.prompt.WebUnsupportedPrompt.prototype
         */
        {
            scriptClass: 'mstrmojo.prompt.WebUnsupportedPrompt',
            
            /**
             * Current Prompt answer.
             */
            answerXml: '',
            
            /**
             * Populate current prompt base on serialized prompt information.
             */
            populate: function populate(props) {
                this._super(props);
                if ( props.ans && props.ans.xml) {
                	this.answerXml = props.ans.xml;
                }
            },
            
            /**
             * Returns the XML representation of prompt answer in the format used by the
             * Narrowcast server. This XML can be persisted in the Narrowcast server repository
             * and used later to populate answer of prompt object received from I-Server.
             *
             * @return the XML representation of prompt answer in the format used by the
             *         Narrowcast server.
             */
            getAnswerXML: function getAnswerXML() {
                return this.answerXml;
            },
            
            /**
             * Builds the short answer xml for this prompt's current answer.
             */
            buildShortPa: function buildShortPa(builder) {
        		builder.addRawXML(this.answerXml);
            },
            
            buildAnswerObject: function buildAnswerObject() {
                var ob =  this._super();
                if ( this.answerXml ) {
	                ob.ans = {
	                    xml: this.answerXml
	                };
                }
                return ob;
            },
            
            supported: function supported() {
            	return false;
            }
        }
    );
}());