/**
 * Model for MSTR Elements Prompt.
 */
(function() {
    mstrmojo.requiresCls("mstrmojo.prompt.WebPrompt",
                         "mstrmojo.array",
                         "mstrmojo.mstr.EnumDataType",
                         "mstrmojo.mstr.WebAttribute",
                         "mstrmojo.mstr.WebElements",
                         "mstrmojo.mstr.WebAttributeForm",
                         "mstrmojo.mstr.WebExpression",
                         "mstrmojo.mstr.WebFilter");
    
    mstrmojo.requiresDescs(8407,8408,8759);
    
    var $ARF = mstrmojo.array.forEach;
    var promptStyles = mstrmojo.prompt.WebPrompt.STYLES;

    /**
     * Mapping between value of DSS Property "GeographicMapping" to the value of "type" in the results from google reverse geocoding service 
     */
    var geoMapping = {
        0: 'country',
        1: 'administrative_area_level_1',
        2: 'locality',
        3: 'postal_code'
    };
    
    function findGeoValue (results, p) {
        results = results || [];
        
        var mapping = (p && p.prs && p.prs.GeographicMapping) || 0,
            type = geoMapping[mapping],
            fnd = false,
            v = '';
        
        $ARF(results, function (r) {
            $ARF(r.address_components, function (a) {
                $ARF(a.types, function (ti) {
                    if (ti === type) {
                        v = a.short_name;
                        fnd = true;
                        return false;
                    }
                });
                
                if (fnd) {
                    return false;
                }
            });
            
            if (fnd) {
                return false;
            }
        });        
        return v;
    }
    
    var $F = mstrmojo.mstr.EnumFunction,
        $D_T = mstrmojo.mstr.EnumDataType;

    function populateElementsFromDateAnswer(callbacks) {
        var dates = this.dateAnswer,
            len = dates && dates.length, 
            i = 1;
        if (len) {
            var form = new mstrmojo.mstr.WebAttributeForm({did: this.origin.dateFormID}),
                expr = new mstrmojo.mstr.WebExpression(),
                filter = new mstrmojo.mstr.WebFilter({expression: expr}),
                node = expr.newAQSubExpression(this.origin, form, $F.FunctionIn, $D_T.DataTypeDate, dates[0]);
            
            for (; i < len; i ++) {
                expr.createTimeNode(dates[i], node);
            }
            
            var elems = this.origin.getElements({
                shortFilterXML: filter.getXML(),
                blockBegin: 1,
                blockCount: -1
            });
            
            var me = this,
                fnSuccess = callbacks.success;
            callbacks.success = function() {
                me.dateAnswer = null;
                me.answer.set('items', elems.items);
                //TQMS 511438. Make sure that at least one of selected dates is present in the warehouse
                if ( ! elems.items.length && callbacks.failure ) {
                    callbacks.failure(mstrmojo.desc(8759, "No data found for the selected date(s)."));
                } else {
                    fnSuccess();
                }
            };
            
            elems.getItems(0, callbacks);
        } else {
            this.answer.set('items', []);
            this.dateAnswer = null;
            callbacks.success();
        }
    } 
    
    
    mstrmojo.prompt.WebElementsPrompt = mstrmojo.declare(
        // suuper class
        mstrmojo.prompt.WebPrompt,
        // mixin
        null, // can execute?
        // properties
        {
            scriptClass: 'mstrmojo.prompt.WebElementsPrompt',
            /**
             * Current Prompt answer. {@link WebElements}
             */
            answer: '',
            /**
             * Previous prompt answer. {@link WebElements}
             */
            preAnswer: '',
            /**
             * Default prompt answer {@link WebElements}
             */
            defAnswer: '',
            /**
             * A collection of suggested answer elements or null.
             */
            suggestion: null,
            /**
             * A source attribute for the prompt.
             */
            origin: null,
            /**
             * The filter restriction object or null.
             */
            filter: null,
            /**
             * Support Calendar style elements prompt, which GUI will use Calendar to pick some dates
             * as answer. Then we need to use task to figure out the WebElements for answer.
             * 
             * When we use the dateAnswer field, the 'answer' field will not reflect current answer, until
             * syncDateAnswer() function gets called.
             */
            dateAnswer: null,
            
            getStyle: function getStyle() {
                var style = this._style;
                if (!style) {
                    var promptProperties = this.prs;
                    
                    // We need to check if the attribute is a date and then check if it has the Calendar style applied to display as a Calendar
                    if (promptProperties['DisplayStyle'] === 'Calendar' && !!this.origin.dateFormID) {
                    	style = promptStyles.CALENDAR;
                    } else {
                        style = promptStyles.LIST;
                    }
                    
                    this._style = style;
                }
                
                return style;
            },
            
            /**
             * Synchrnize the 'answer' field with dateAnswer Field.
             */
            syncDateAnswer: function syncDateAnswer(callbacks) {
                if (this.dateAnswer) {
                    populateElementsFromDateAnswer.call(this,  callbacks);
                } else {
                    callbacks.success();
                }
            },
            /**
             * For specified data type {@link #getDataType}, validates whether prompt answer
             * is in correct format and within minimun and maximum limits.
             * An exception is thrown if one of the conditions fails - check the error code
             * to see which test failed.
             *
             */
            validate: function validate(v){
            	// check required first
            	this._super(v);
            	v = (v === undefined || v === null) ? (this.answer && this.answer.items) : v;
                var cnt = (v && v.length) || 0,
                    min = parseInt(this.min, 10),
                    max = parseInt(this.max, 10),
                    errText = '';
                
                if (!isNaN(min) && cnt < min){
                    errText = mstrmojo.desc(8407, 'You have made (#) selections, which is fewer selections than the required (##) for this prompt. Please make more selections.').replace('##', min).replace('#', cnt);
                } else if (!isNaN(max) && cnt > max) {
                    errText = mstrmojo.desc(8408, 'You have made (#) selections, which is more selections than are allowed (##) for this prompt. Please remove some selections.').replace('##', max).replace('#', cnt);
                }
                
                if (errText) {
                    throw new Error(errText);
                }
            },
            /**
             * Returns true if the current prompt answer is null or the
             * answer collection is empty (For example, in Elements collection is empty 
             * in case of an element prompt).
             * @return true or false.
             */
            isAnswerEmpty: function isAnswerEmpty(v){
            	v = (v === undefined || v === null) ? (this.answer && this.answer.items) : v;
            	return (!v) || (v.length == 0);
            },
            
            /**
             * Returns the WebElements for browsing.
             */
            getAvailable: function getAvailable() {
            	if (this.suggestion && this.suggestion.items.length > 0) {
	            	return this.suggestion;
            	} else {
                    return this.origin.getElements();
            	}
                /*
                if (!this.available) {
                    this.available = this.origin.getElements();
                }
                return this.available;
                */
            },
            
            canSearch: function canSearch() {
                //TQMS 497753 We shall not allow search if prompts has predefined list of elements
                return ! (this.suggestion && this.suggestion.items.length > 0);
            },
            
            getDisplayValue: function getDisplayValue() {
            	// if calendar style and we have cached answer in dateAnswer field
            	if (this.getStyle() == mstrmojo.prompt.WebPrompt.STYLES.CALENDAR && this.dateAnswer) {
            		return this.dateAnswer.join(',');
            	}
            	else {
                    var answer = this.answer,
                    items = (answer && answer.items) || [],
                    i = 0,
                    len = items.length,
                    value = [];
                
	                // Iterate items and retrieve the name of each item.
	                for (; i < len; i++) {
	                    value.push(items[i].n);
	                }
	                
	                // Return joined item names.
	                return value.join(', ');
            	}
            },
            /**
             * return the answer as an array of dates
             */
            getAnswerAsDateArray: function() {
            	var dateUtil = mstrmojo.date,
            		dates = [],
            		i,
            		dateAnswer = this.dateAnswer,
            		answer = this.answer && this.answer.items;
            	if (this.getStyle() == mstrmojo.prompt.WebPrompt.STYLES.CALENDAR) {
            		if (dateAnswer) {
            			for (i = 0; i < dateAnswer.length; i ++) {
            				dates.push(dateUtil.parseDate(dateAnswer[i]));
            			} 
            		} else if (answer) {
            			for (i = 0; i < answer.length; i ++) {
            				dates.push(dateUtil.parseDate(answer[i].n));
            			}
            		}
            	} 
            	return dates;
            },
            
            /**
             * Returns a WebElements corresponding to the search config.
             */
            getSearch: function getSearch(searchPattern, matchCase, onTarget) {
                var cfg = {
                        searchPattern: searchPattern,
                        matchCase: matchCase
                    };
                if (onTarget) {
                    cfg.searchTarget = this.searchTarget;
                }
                return this.origin.getElements(cfg);
            },
            
            /**
             * Populate current prompt base on serialized prompt information.
             */
            populate: function populate(props) {
                this._super(props);
                // populate current answers
                var ans = (props && props.ans && props.ans.elms) || [];
                
                // this is not a browsable list
                this.answer = new mstrmojo.mstr.WebElements({
                    items: ans, 
                    totalSize: ans.length,
                    blockBegin: 1,
                    blockCount: -1
                });
                
                // populate origin
                var org = props && props.orgn;
                if (org) {
                    this.origin = new mstrmojo.mstr.WebAttribute(org);
                    
                    if (this.dataSourcesXML) {
                    	this.origin.browseConfig.dataSources = this.dataSourcesXML;
                    }
                    // for Geo Location prompt, we need to put on more restriction for elements browsing
                    var prs = this.prs;
                    if (prs && prs.DisplayStyle === 'GeoLocation' && prs.LookupForm){
                        var att = prs.LookupForm.split('~');
                        this.searchTarget = new mstrmojo.mstr.WebAttribute({
                            did: att[0],
                            t: att[1],
                            st: att[3],
                            n: att[2]
                        });
                        
                    }
                    // populate to answer elements
                    this.answer.source = this.origin;
                }
                
                // populate suggested answer
                var suggest = props && props.suggest;
                if (suggest) {
                	var suggestion = this.suggestion = new mstrmojo.mstr.WebElements({
                		items: suggest
                	});
                }
                // populate filter
                var fil = props && props.fres;
                if (fil) {
                    this.filter = new mstrmojo.mstr.WebOI(fil);
                    if (org){
                        this.origin.browseConfig.filter = this.filter;
                    }
                }
            },
            
            populateAnswer: function(answer) {
                this.answer.items = mstrmojo.hash.cloneArray(answer.ans.elms);
            },
            
            
            buildAnswerObject: function buildAnswerObject() {
                var ob =  this._super();
                ob.ans = {
                    elms: mstrmojo.hash.cloneArray(this.answer.items)
                };
                return ob;
            },
            /**
             * Gives prompt an opportunity to perform any time consuming task before the answer gets used.
             */
            prepareAnswer: function prepareAnswer(callbacks){
                this.syncDateAnswer(callbacks);
            },
            
            setAnswerValue: function setAnswerValue(v) {
                this.validate(v);
                
                if (this.getStyle() == mstrmojo.prompt.WebPrompt.STYLES.CALENDAR) {
                    this.set('dateAnswer', v);
                } else {
                    this.answer.set('items', v);
                }
            },
            
            getAnswersCount: function getAnswersCount() {
                
                if(this.dateAnswer) {
                    
                    return this.dateAnswer.length;
                } else if(this.answer) {
                    
                    return this.answer.items.length;
                }
                
                return 0;
            },              
            
            /**
             * Builds the short answer xml for this prompt's current answer.
             */
            buildShortAnswerXML: function buildShortAnswerXML(builder) {
                if (this.dateAnswer) {
                    alert('need to sync date answers first.');
                } else {
                    if (this.answer) {
                        this.answer.buildShortXML(builder);
                    }
                }
            },
            /**
             * Uses web service to get current GeoLocation Target information for browsing.
             * Only relevant to GeoLocation elements prompt
             */
            getGeoTargetValue: function getGeoTargetValue(callbacks) {
                /*
                var loc = 'Vienna';
                if (callbacks && callbacks.success) {
                    callbacks.success(loc);
                }
                return
                */
                var me = this;
                mstrmojo.GeoLocation.getCurrentAddress(
                        {
                            success: function (address) {
                                var loc = findGeoValue(address, me);
                                if (callbacks && callbacks.success) {
                                    callbacks.success(loc);
                                }
                            }, 
                            failure: function(err){
                                if (callbacks && callbacks.failure) {
                                    callbacks.failure(err);
                                }
                            }
                        }
                    );
//             },
//            getGeoTarget: function getGeoTarget(){
//                t = '',
//                tgt = this.searchTarget;
//                if (tgt){
//                    t = tgt.did + '~' + tgt.t, + '~' + tgt.n + '~' + tgt.st;
//                }
//                return t;
            }
        }
    );
}());