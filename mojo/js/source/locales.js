
(function(){

    mstrmojo.requiresCls("mstrmojo.hash");
    
    mstrmojo.requiresDescs(6078,7899,7900,7901,6079,6081,6080,6082,7902,7902,6076,6077,7903);
    
    /**
     * A utility class to load locale specific information from web server. 
     * 
     * @class
     */
    mstrmojo.locales = mstrmojo.provide(
        "mstrmojo.locales",
            /**
             * @lends mstrmojo.locales
             */
            {
                /**
                 * Load locale specific information and callback if succeeded. 
                 */
        	    load: function(callback){
                    var me = this;
                    if (this.isLoaded) {
                        callback();
                    } else {
                        mstrmojo.xhr.request('GET', mstrConfig.taskURL, 
                        {
                            success: function(res) {
                                //copy result
                                mstrmojo.hash.copy(mstrmojo.hash.obj2array(res), me);
                                
                                callback();
                                if (mstrmojo.expr) {
                                    mstrmojo.expr.onLocaleUpdated();
                                }
                                mstrmojo.locales.isLoaded = true;
                                
                            },
                            failure: function(res) {
                                alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));//can not use mstrmojo.alert because mstrmojo.Dialog may not be loaded yet.
                            }
                        },
                        // no parameter, load current user's all locale related info 
                        {
                            taskId: 'getLocaleInfo'
                        });
                    }            
                },
                
                isLoaded: false,
                
                "datetime": {
                    "MONTHNAME_SHORT": [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec"
                    ],
                    "MONTHNAME_FULL": [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December"
                    ],
                    "dayShortNames": [
                        "S",
                        "M",
                        "T",
                        "W",
                        "T",
                        "F",
                        "S"
                    ],
                    "dayNames": [
                        "S",
                        "M",
                        "T",
                        "W",
                        "T",
                        "F",
                        "S"
                    ],
                    dayNames_FULL: [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday"
                    ],
                    "DATEINPUTFORMATS": [
                        "M/d/yy",
                        "M/d/yyyy",
                        "MMM d, yy"
                    ],
                    "TIMEINPUTFORMATS": [
                        "h:mm a",
                        "H:mm",
                        "h:mm:ss a",
                        "H:mm:ss",
                        "h:mm:ss a z"
                    ],
                    "DATEOUTPUTFORMAT": "M/d/yyyy",
                    "TIMEOUTPUTFORMAT": "h:mm:ss a",
                    "AM_NAME": "AM",
                    "PM_NAME": "PM",
                    "TWODIGITYEARSTART": "2029"
                },
                "number": {
                    "NUMBERINPUTFORMATS": {
                        "0": "#,##0.###"
                    },
                    "INTEGERINPUTFORMATS": {
                        "0": "#,##0"
                    },
                    "NUMBEROUTPUTFORMAT": "#0.##########",
                    "INTEGEROUTPUTFORMAT": "#0",
                    "DECIMALSEPARATOR": ".",
                    "THOUSANDSEPARATOR": ","
                },
                "expression": {
                    "METRICVALIDATIONLEVEL": "0",
                    "PRESERVEWHITESPACE": false,
                    "Include": [
                        {
                            "did": "1",
                            "n": "Include"
                        },
                        {
                            "did": "2",
                            "n": "Exclude"
                        }
                    ],
                    "BranchQual": [
                        {
                            "did": "19",
                            "n": "AND"
                        },
                        {
                            "did": "20",
                            "n": "OR"
                        },
                        {
                            "did": "21",
                            "n": "NOT"
                        },
                        {
                            "did": "19_21",
                            "n": "AND NOT"
                        },
                        {
                            "did": "20_21",
                            "n": "OR NOT"
                        }
                    ],
                    "RootOperator": [
                        {
                            "did": "19",
                            "n": "All selections"
                        },
                        {
                            "did": "20",
                            "n": "Any selection"
                        }
                    ],
                    "ExprType": [
                        {
                            "did": "2",
                            "n": "Qualify"
                        },
                        {
                            "did": "5",
                            "n": "Select"
                        }
                    ],
                    "DimtyLevels": [
                        {
                            "did": "1",
                            "n": "Default"
                        },
                        {
                            "did": "2",
                            "n": "Metric"
                        },
                        {
                            "did": "3",
                            "n": "Report"
                        }
                    ],
                    "Attribute": [
                        {
                            "did": "1,6",
                            "n": "Equals",
                            "t": 1
                        },
                        {
                            "did": "1,7",
                            "n": "Does not equal",
                            "t": 1
                        },
                        {
                            "did": "1,8",
                            "n": "Greater than",
                            "t": 1
                        },
                        {
                            "did": "1,10",
                            "n": "Greater than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,9",
                            "n": "Less than",
                            "t": 1
                        },
                        {
                            "did": "1,11",
                            "n": "Less than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,17",
                            "n": "Between",
                            "t": 1
                        },
                        {
                            "did": "1,44",
                            "n": "Not between",
                            "t": 1
                        },
                        {
                            "did": "1,76",
                            "n": "Contains",
                            "t": 1
                        },
                        {
                            "did": "1,79",
                            "n": "Does not contain",
                            "t": 1
                        },
                        {
                            "did": "1,77",
                            "n": "Begins with",
                            "t": 1
                        },
                        {
                            "did": "1,80",
                            "n": "Does not begin with",
                            "t": 1
                        },
                        {
                            "did": "1,78",
                            "n": "Ends with",
                            "t": 1
                        },
                        {
                            "did": "1,81",
                            "n": "Does not end with",
                            "t": 1
                        },
                        {
                            "did": "1,18",
                            "n": "Like",
                            "t": 1
                        },
                        {
                            "did": "1,43",
                            "n": "Not Like",
                            "t": 1
                        },
                        {
                            "did": "1,54",
                            "n": "Is Null",
                            "t": 1
                        },
                        {
                            "did": "1,55",
                            "n": "Is Not Null",
                            "t": 1
                        },
                        {
                            "did": "1,22",
                            "n": "In",
                            "t": 1
                        },
                        {
                            "did": "1,57",
                            "n": "Not In",
                            "t": 1
                        }
                    ],
                    "Metric": [
                        {
                            "did": "1,6",
                            "n": "Equals",
                            "t": 1
                        },
                        {
                            "did": "1,7",
                            "n": "Does not equal",
                            "t": 1
                        },
                        {
                            "did": "1,8",
                            "n": "Greater than",
                            "t": 1
                        },
                        {
                            "did": "1,10",
                            "n": "Greater than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,9",
                            "n": "Less than",
                            "t": 1
                        },
                        {
                            "did": "1,11",
                            "n": "Less than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,17",
                            "n": "Between",
                            "t": 1
                        },
                        {
                            "did": "1,44",
                            "n": "Not between",
                            "t": 1
                        },
                        {
                            "did": "1,54",
                            "n": "Is Null",
                            "t": 1
                        },
                        {
                            "did": "1,55",
                            "n": "Is Not Null",
                            "t": 1
                        },
                        {
                            "did": "1,22",
                            "n": "In",
                            "t": 1
                        },
                        {
                            "did": "1,57",
                            "n": "Not In",
                            "t": 1
                        },
                        {
                            "did": "2,1",
                            "n": "Highest",
                            "t": 2
                        },
                        {
                            "did": "2,2",
                            "n": "Lowest",
                            "t": 2
                        },
                        {
                            "did": "3,1",
                            "n": "Highest%",
                            "t": 3
                        },
                        {
                            "did": "3,2",
                            "n": "Lowest%",
                            "t": 3
                        }
                    ],
                    "MDXAttribute": [
                        {
                            "did": "1,6",
                            "n": "Equals",
                            "t": 1
                        },
                        {
                            "did": "1,7",
                            "n": "Does not equal",
                            "t": 1
                        },
                        {
                            "did": "1,8",
                            "n": "Greater than",
                            "t": 1
                        },
                        {
                            "did": "1,10",
                            "n": "Greater than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,9",
                            "n": "Less than",
                            "t": 1
                        },
                        {
                            "did": "1,11",
                            "n": "Less than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,17",
                            "n": "Between",
                            "t": 1
                        },
                        {
                            "did": "1,44",
                            "n": "Not between",
                            "t": 1
                        },
                        {
                            "did": "1,22",
                            "n": "In",
                            "t": 1
                        },
                        {
                            "did": "1,57",
                            "n": "Not In",
                            "t": 1
                        }
                    ],
                    "MDXMetric": [
                        {
                            "did": "1,6",
                            "n": "Equals",
                            "t": 1
                        },
                        {
                            "did": "1,7",
                            "n": "Does not equal",
                            "t": 1
                        },
                        {
                            "did": "1,8",
                            "n": "Greater than",
                            "t": 1
                        },
                        {
                            "did": "1,10",
                            "n": "Greater than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,9",
                            "n": "Less than",
                            "t": 1
                        },
                        {
                            "did": "1,11",
                            "n": "Less than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,17",
                            "n": "Between",
                            "t": 1
                        }
                    ],
                    "SAPAttribute": [
                        {
                            "did": "1,6",
                            "n": "Equals",
                            "t": 1
                        },
                        {
                            "did": "1,7",
                            "n": "Does not equal",
                            "t": 1
                        },
                        {
                            "did": "1,22",
                            "n": "In",
                            "t": 1
                        },
                        {
                            "did": "1,57",
                            "n": "Not In",
                            "t": 1
                        },
                        {
                            "did": "1,8",
                            "n": "Greater than",
                            "t": 1
                        },
                        {
                            "did": "1,10",
                            "n": "Greater than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,9",
                            "n": "Less than",
                            "t": 1
                        },
                        {
                            "did": "1,11",
                            "n": "Less than or equal to",
                            "t": 1
                        },
                        {
                            "did": "1,17",
                            "n": "Between",
                            "t": 1
                        }
                    ],
                    "Element": [
                        {
                            "did": "1,22",
                            "n": "In List",
                            "t": 1
                        },
                        {
                            "did": "1,57",
                            "n": "Not In List",
                            "t": 1
                        }
                    ]
                },
                "validation": {
                        "requiredFieldError": mstrmojo.desc(6078, "This field is required."),
                        "invalidCharError": mstrmojo.desc(7899, "This field contains invalid characters for #."),
                        "invalidDateStringError": mstrmojo.desc(7900, "This field contains invalid date/time string."),
                        "invalidNumericFormatError": mstrmojo.desc(7901, "This field contains numeric value with incorrect format."),
                        "outofRangeError": mstrmojo.desc(6079, "This field should be # between ## and ###."),
                        "noLessMinError": mstrmojo.desc(6081,  "This field should be # greater than or equal to ##."),
                        "noGreaterMaxError": mstrmojo.desc(6080, "This field should be # less than or equal to ###."),
                        "failRegexTestError": mstrmojo.desc(6082, "This field failed regular expression validation."),
                        "invalidValueInListError": mstrmojo.desc(7902, "One of the value (#) in this list is not valid."),
                        "integerDataType": mstrmojo.desc(6076, "an Integer value"),
                        "numericDataType": mstrmojo.desc(6077, "a Number value"),
                        "dateDataType": mstrmojo.desc(7903, "a Date/Time value")    
                },
                'color':{
                    'colors':[{'n':'Black','v':'#000000'},{'n':'Brown','v':'#993300'},{'n':'Olive Green','v':'#333300'},{'n':'Dark Green','v':'#003300'},{'n':'Dark Teal','v':'#003366'},{'n':'Dark Blue','v':'#000080'},{'n':'Indigo','v':'#333399'},{'n':'Grey-80%','v':'#333333'},{'n':'Dark Red','v':'#800000'},{'n':'Orange','v':'#FF6600'},{'n':'Dark Yellow','v':'#808000'},{'n':'Green','v':'#008000'},{'n':'Teal','v':'#008080'},{'n':'Blue','v':'#0000FF'},{'n':'Blue-Grey','v':'#666699'},{'n':'Grey-50%','v':'#808080'},{'n':'Red','v':'#FF0000'},{'n':'Light Orange','v':'#FF9900'},{'n':'Lime','v':'#99CC00'},{'n':'Sea Green','v':'#339966'},{'n':'Aqua','v':'#33CCCC'},{'n':'Light Blue','v':'#3366FF'},{'n':'Violet','v':'#800080'},{'n':'Grey-40%','v':'#969696'},{'n':'Pink','v':'#FF00FF'},{'n':'Gold','v':'#FFCC00'},{'n':'Yellow','v':'#FFFF00'},{'n':'Bright Green','v':'#00FF00'},{'n':'Turquoise','v':'#00FFFF'},{'n':'Sky Blue','v':'#00CCFF'},{'n':'Plum','v':'#993366'},{'n':'Grey-25%','v':'#C0C0C0'},{'n':'Rose','v':'#FF99CC'},{'n':'Tan','v':'#FFCC99'},{'n':'Light Yellow','v':'#FFFF99'},{'n':'Light Green','v':'#CCFFCC'},{'n':'Light Turquoise','v':'#CCFFFF'},{'n':'Pale Blue','v':'#99CCFF'},{'n':'Lavender','v':'#CC99FF'},{'n':'White','v':'#ffffff'}],
                    'userPalette':[{'n':'#F00E0E','v':'#F00E0E'},{'n':'#080000','v':'#080000'},{'n':'#E81A1A','v':'#E81A1A'},{'n':'#6E0909','v':'#6E0909'},{'n':'#4F2828','v':'#4F2828'},{'n':'#141212','v':'#141212'},{'n':'#D60202','v':'#D60202'},{'n':'#C40404','v':'#C40404'}]
                }
                                
        	}
        );
})();
