(function() {
	mstrmojo.requiresCls(
			"mstrmojo.prompt.WebConstantPrompt", 
			"mstrmojo.prompt.WebGeoConstantPrompt", 
			"mstrmojo.prompt.WebElementsPrompt",
			"mstrmojo.prompt.WebUnsupportedPrompt",
			"mstrmojo.XMLBuilder");
	mstrmojo.prompt.WebPrompts = mstrmojo.declare(
			// suuper class
			mstrmojo.Obj,
			// mixin
			null, // can execute?
			// properties
			{
				scriptClass: 'mstrmojo.prompt.WebPrompts',
				/**
				 * Locale for this prompt collection.
				 */
				lcl: 1033,
				/**
				 * The collection of prompts in object.
				 */
				//prompts: [],
				/**
				 * Owner of this prompt collection. It can be report or document.
				 */
				host: null,
				/**
				 * Whether merge the Geo location prompts into one prompt.
				 */
				mergeGeoPrompts: true,
				
	            init: function init(props){
	                var rsl = props.rsl;
	                delete props.rsl;
	                this._super(props);
	                this.populate(rsl);
	            },            
	            
				
				/**
				 * Returns a prompt by its index in the collection.
				 *
				 * @param index - the prompt index in the collection
				 *
				 * @return the prompt object
				 */
				get: function(index) {
					var ps = this.prompts;
					if (ps && index < ps.length) {
						return ps[index];
					} else {
						alert('index is out of boundary.');
					}
				},
				/**
				 * Returns the number of prompts in the collection
				 *
				 * @return the number of prompts in the collection
				 */
				size: function size(){
					var ps = this.prompts;
					return ps && ps.length || 0;
				},

				/**
				 * Returns true if there is no prompts in the collection, false otherwise.
				 *
				 * @return true if there is no prompts in the collection, false otherwise.
				 */
				isEmpty: function isEmpty(){
					return !this.prompts || !!this.prompts.length;
				},


				/**
				 * Validates each prompt in this prompt collection. This method steps through each prompt and
				 * calls the {@link WebPrompt#validate WebPrompt.validate()} method. This method validates
				 * that the answers are consistent with the restrictions which that prompt definition impose.
				 *
				 * @exception WebAPIHelperException Thrown if an error occurs in the validation process.
				 */
				validate: function validate(){
					var ps = this.prompts;
					for (var i = 0; i < ps.length; i ++) {
						ps[i].validate(); // if failed, an exception will be thrown
					}
					return true;
				},

				/**
				 * Populate this prompts collection
				 */
				populate: function populate(rsl) {
					var prompts = rsl && rsl.prompts,
						$T = mstrmojo.prompt.PromptTypes,
						mgp = this.mergeGeoPrompts,
						geo;
					this.lcl = rsl && rsl.lcl || this.lcl;
					this.prompts = [];
					for (var i = 0; i < prompts.length; i ++){
						var p = prompts[i];
						switch(p.ptp){
							case $T.CONSTANT_PROMPT:
								// create prompt instance
								var pm = new mstrmojo.prompt.WebConstantPrompt();
								// populate with data
								pm.populate(p);
								// merge geo prompts
								if (mgp && pm.prs && pm.prs.DisplayStyle == 'GeoLocation'){
									if (!geo){
										geo = new mstrmojo.prompt.WebGeoConstantPrompt();
										geo.title = "Current Location";
										geo.add(pm);
										pm = geo;
									} else {
										// not the first geo prompt, add into Geo prompt then leave from here.
										geo.add(pm);
										continue;
									}
								}
								break;
							case $T.ELEMENTS_PROMPT:
								var pm = new mstrmojo.prompt.WebElementsPrompt();
								// populate with data
								pm.populate(p);
								break;
							default:
								var pm = new mstrmojo.prompt.WebUnsupportedPrompt();
								// populate with data
								pm.populate(p);
								// alert("have not implemented this prompt type.");
						}
						// push into collection
						this.prompts.push(pm);
					}
				},
                
				populateAnswers: function populateAnswers(answers) {
				    var prompts = this.prompts,
				        i;
				    for ( i = 0; i < answers.length; i ++ ) {
				        prompts[i].populateAnswer(answers[i]);
				    }
				},
				
                buildAnswerObject: function buildAnswerObject() {
                    var ob = [];
                    for (var i = 0; i < this.size(); i ++) {
                        var p = this.prompts[i];
                        ob.push(p.buildAnswerObject());
                    }
                    return ob;
                },
				/**
				 *  Load answers based on messageID
				 */
//				loadAnswers: function loadAnswers(messageID){},

                prepareAnswer: function(callbacks){
                	var ps = this.prompts,
	            		prep = function(ps, i, callbacks) {
                			var len = ps.length; 
                			ps[i].prepareAnswer({
                				success: function() {
                    				if (i < len - 1) {
                    					prep(ps, i + 1, callbacks);
                    				} else {
                    					if (callbacks && callbacks.success) {
                    						callbacks.success();
                    					}
                    				}
                				},
                    			failure: function(){
                    				if (callbacks && callbacks.failure) {
                    					callbacks.failure();
                    				}
                    			}
                			});
	            		};
                	if (ps && ps.length > 0){
                		prep(this.prompts, 0, callbacks);
                	}
                	
                },
				/**
				 * Returns the XML string representing answers of all prompts in the collection
				 * that have an answer. The XML is formatted for use in Nerrowcast server.
				 * This string can be persisted and used later to populate
				 * prompts returned by I-Server with current answers.
				 *
				 * @return the answer XML string
				 */
				getAnswerXML: function getAnswerXML(){
					var buf = new mstrmojo.XMLBuilder();
					this.buildShortAnswerXML(buf);
					return buf.toString();
				},
				/**
				 * Builds the short answer xml for this prompt's current answer.
				 */
				buildShortAnswerXML: function buildShortAnswerXML(builder) {
					builder = builder || new mstrmojo.XMLBuilder();
					builder.addChild('rsl');
					builder.addAttribute('lcl', this.lcl);
					for (var i = 0; i < this.size(); i ++) {
						var p = this.prompts[i];
						p.buildShortPa(builder);
					}
					builder.closeElement();
				},
				
				hasSupported: function hasSupported() {
                    for (var i = 0; i < this.size(); i ++) {
                        var p = this.prompts[i];
                        if (p.supported() ) {
                            return true;
                        }
                    }
                    return false;
				}
			}
	);
	// EnumWebPromptType
	mstrmojo.prompt.PromptTypes = {
			CONSTANT_PROMPT : 1,
			CONSTANT_GEO_PROMPT: 1.5,
			ELEMENTS_PROMPT : 2,
			OBJECT_PROMPT : 4
	};
	mstrmojo.Enum = {};
	mstrmojo.Enum.Validation = {};
	mstrmojo.Enum.Validation.STATUSCODE = {
		'VALID' :0,
		'INVALID_DATATYPE' :1,
		'EXCEEDS_MIN_VALUE' :2,
		'EXCEEDS_MAX_VALUE' :3,
		'EXCEEDS_MIN_LENGTH' :4,
		'EXCEEDS_MAX_LENGTH' :5,
		'EXCEEDS_MIN_COUNT' :6,
		'EXCEEDS_MAX_COUNT' :7,
		'INVALID_ANSWERS' :8,
		'NO_INPUT' :9,
		'NO_PERSONAL_ANSWER_NAME' :10,
		'INCOMPLETE_CONDITION' :11,
		'TRUNCATED' :12,
		'INCOMPLETE_CONDITION_ON_AUTO_NODE' :13, // only used internally to distinguish incomplete condition 
		'INVALID_PERSONAL_ANSWER_NAME' :14,
		'DUPLICATED' :15,
		'INVALID' :999
	// general error code for unknown reason/from server
	};
})();