(function(){
 
    mstrmojo.requiresCls("mstrmojo.locales");
    
    var _DT = function(){return mstrmojo.locales.datetime;},
        $S = mstrmojo.string;

    /**
     * mstrmojo.date is a utility class that provides utility functions related to date/time, such as date parsing/formatting. 
     */
    mstrmojo.date = mstrmojo.provide(
            "mstrmojo.date",
            {
    			monthNumbers : {
					Jan:1,
					Feb:2,
					Mar:3,
					Apr:4,
					May:5,
					Jun:6,
					Jul:7,
					Aug:8,
					Sep:9,
					Oct:10,
					Nov:11,
					Dec:12
				},
				
                REGEXPS: {
                    DATES: {},  // To store regular expressions built from date formats.
                    TIMES: {}   // To store regular expressions built from time formats.
                },
                
                CACHE: {
                    PARSEDATE: {
                        CONTAINS: {},
                        EQUALS: {}
                    },
                    PARSETIME: {
                        CONTAINS: {},
                        EQUALS: {}
                    }
                }, 
                
                /**
                 * Validation method for dates.  Returns true if the given string matches one of MSTR Web's input patterns (or
                 * output pattern) for dates.
                 * If bFormat, the method returns a converted String if there is a match; null otherwise.
                 * Else if bFormat is false, the method instead just returns true|false depending on whether there is a match.
                 * If the optional Boolean param "bContains" is true, then
                 * a string which contains a valid date substring will be considered valid; otherwise
                 * only a string which equals a valid date string will be considered valid.
                */
                isDate: function isDate(/*String*/ s, /*Boolean?*/ bFormat, /*Boolean?*/ bContains) {
                    // Try parsing the string according to our acceptable patterns.
                    var dateInfo = this.parseDate(s, bContains);
                    // If parsing succeeded, and the numbers are in the right range, validation successful.
                    var isValid = !!(dateInfo && this.doesDateExist(dateInfo.month, dateInfo.day, dateInfo.year));
                    if (bFormat) {
                        if (isValid) {
                            var formatted = this.formatDateInfo(dateInfo, _DT().DATEOUTPUTFORMAT);
                            if (bContains) {
                                return {match: dateInfo.match, formatted: formatted};
                            } else {
                                return formatted;
                            }
                        } else {
                            return null;
                        }
            
                    } else {
                        return !!isValid;
                    }
                },
                
                /**
                 * This method applies a format String to a dateInfo object to produce a formatted date String.
                 * The given dateInfo object is assumed to have the following properties:  "month" (1-12),
                 * "day" (Integer), "year" (four digit Integer).  The format String is typically the out format
                 * specified by MSTRWeb server.  In theory, this method should handle any such format String,
                 * but to optimize this implementation, we make certain assumptions about the format String, namely:
                 * the string may contain: "MMMM", "MMM", "MM", "M", "dd", "d", "yyyy", "yy"; all other chars
                 * are taken as literals.
                 */
                formatDateInfo: function formatDateInfo(/*Object*/ dateInfo, /*String*/ format) {
                    if (!format) return '';
                    var day = dateInfo.day,
                        month = dateInfo.month,
                        year = dateInfo.year;
                    
                    var s = format.replace(/dd/g, this.formatInteger(day, 2)
                                    ).replace(/d/g, Number(day)
                                    ).replace(/yyyy/g, Number(year)
                                    ).replace(/yy/g, this.formatInteger(Number(year) % 100, 2)
                                    ).replace(/MMM/g, "~~~~"
                                    ).replace(/MM/g, "@@"
                                    ).replace(/M/g, "^"
                                    ).replace(/MMMM/g, _DT().MONTHNAME_FULL[Number(month) - 1]
                                    ).replace(/\~\~\~\~/g, _DT().MONTHNAME_SHORT[Number(month) - 1]
                                    ).replace(/\@\@/g, this.formatInteger(month, 2)
                                    ).replace(/\^/g, Number(dateInfo.month)
                                    );
                    return s;
                },
                
                
                /**
                 * Parses a given date string to determine the month, day and year values
                 * it represents.  If the optional Boolean param "bContains" is true, then
                 * a string which contains a valid date substring will be considered valid; otherwise
                 * only a string which equals a valid date string will be considered valid.
                 */
                parseDate: function parseDate(/*String*/ s, /*Boolean?*/ bContains, /*String?*/ format) {
                    if (s == null) return false;
                    if (typeof(s) != 'string') s = String(s);
                    s = $S.trim(s);
                    
                    // Check our cache.  The cache is a hashtable; hash key = the given string (trimmed);
                    // hash value = the parse result object (if date found) or a null (if date not found).
                    var cache = this.CACHE.PARSEDATE[bContains ? "CONTAINS" : "EQUALS"],
                        cachedResult = cache[s];
                    if (cachedResult || (cachedResult === null)) return cachedResult;       
                    // Cached result not found.  Must parse date and store parsing result in cache.
                    var parseResult = null;
            
                    // Build an array of all acceptable date formats.
                    var formats;
                    if (format){
                    	formats = [format];
                    }else{
                    	formats = [].concat(_DT().DATEINPUTFORMATS);
                    	formats.unshift(_DT().DATEOUTPUTFORMAT);
                    }
            
                    // Now compare the given string to each acceptable format.
                    for (var i = 0, len = formats.length; i < len; i++) {       
                        // Convert the format to a regular expression for javascript comparison.    
                        var reInfo = this._buildRegExp4DateFormat(formats[i]),
                        // Does the given string match the regular expression?
                            result = reInfo && s.match(bContains ? reInfo.reContains : reInfo.reEquals);
                        if (result) {
                            // Yes, matched. Fetch parts: month, day and year.
                            parseResult = {
                                match: result[0],
                                year: reInfo.yearIndex && this.fourDigitYear(result[reInfo.yearIndex]),
                                day: reInfo.dayIndex && parseInt(Number(result[reInfo.dayIndex])),
                                month: reInfo.monthIndex && this.numericMonth(result[reInfo.monthIndex])
                            };
                            break;
                        }
                    } // end for loop walking the acceptable formats
                    // Store parse result in cache for later re-use.
                    cache[s] = parseResult;
                    return parseResult;
                },
            
                /**
                 * Validation method for times.  Returns true if the given string matches one of MSTR Web's input patterns (or
                 * output pattern) for times.
                 * If bFormat, the method returns a converted String if there is a match; null otherwise.
                 * Else if bFormat is false, the method instead just returns true|false depending on whether there is a match.
                 * If the optional Boolean param "bContains" is true, then
                 * a string which contains a valid time substring will be considered valid; otherwise
                 * only a string which equals a valid time string will be considered valid.
                 */
                isTime: function isTime(/*String*/ s, /*Boolean?*/ bFormat, /*Boolean?*/ bContains) {
                    // Try parsing the string according to our acceptable patterns.
                    var timeInfo = this.parseTime(s, bContains);
                    // If parsing succeeded, and the numbers are in the right range, validation successful.
                    var isValid = !!(timeInfo && this.doesTimeExist(timeInfo.hour, timeInfo.min, timeInfo.sec));
                    if (bFormat) {
                        if (isValid) {
                            var formatted = this.formatTimeInfo(timeInfo, _DT().TIMEOUTPUTFORMAT);
                            if (bContains) {
                                return {match: timeInfo.match, formatted: formatted};
                            } else {
                                return formatted;
                            }
                        } else {
                            return null;
                        }
                    } else {
                        return !!isValid;
                    }
                },
                
                /**
                 * Parses a given time string to determine the hour, minute and second values
                 * it represents.  If the optional Boolean param "bContains" is true, then
                 * a string which contains a valid time substring will be considered valid; otherwise
                 * only a string which equals a valid time string will be considered valid.
                 */
                parseTime: function parseTime(/*String*/ s, /*Boolean?*/ bContains, /*String?*/format) {
                    if (s == null) return false;
                    if (typeof(s) != 'string') s = String(s);
                    s = $S.trim(s);
                    
                    // Check our cache.  The cache is a hashtable; hash key = the given string (trimmed);
                    // hash value = the parse result object (if date found) or a null (if date not found).
                    var cache = this.CACHE.PARSETIME[bContains ? "CONTAINS" : "EQUALS"],
                        cachedResult = cache[s];
                    if (cachedResult || (cachedResult === null)) return cachedResult;       
                    // Cached result not found.  Must parse date and store parsing result in cache.
                    var parseResult = null;
            
                    // Build an array of all acceptable time formats.
                    var formats;
                    if (format){
                    	formats = [format];
                    }else{
                    	formats = [].concat(_DT().TIMEINPUTFORMATS);
                    	formats.unshift(_DT().TIMEOUTPUTFORMAT);
                    }
            
                    // Now compare the given string to each acceptable format.
                    for (var i = 0, len = formats.length; i < len; i++) {       
                        // Convert the format to a regular expression for javascript comparison.    
                        var reInfo = this._buildRegExp4TimeFormat(formats[i]),
                        // Does the given string match the regular expression?
                            result = reInfo && s.match(bContains ? reInfo.reContains : reInfo.reEquals);
                        if (result) {
                            // Yes, matched. Fetch pieces: hour, min, sec, ampm, zone, etc.
                            var ampm = reInfo.ampmIndex && result[reInfo.ampmIndex];
                            parseResult = {
                                match: result[0],
                                // By convention, return a capital Hour (0-23), not a little hour (1-12)
                                hour: reInfo.hourIndex && this.capitalHour(result[reInfo.hourIndex], ampm),
                                min: reInfo.minIndex && parseInt(Number(result[reInfo.minIndex])),
                                sec: reInfo.secIndex && parseInt(Number(result[reInfo.secIndex]))
                            };
                            break;
                        }
                    } // end for loop walking the acceptable formats
                    // Store parse result in cache for later re-use.
                    cache[s] = parseResult;
                    return parseResult;
                },
                
                /**
                 * This method applies a format String to a timeInfo object to produce a formatted time String.
                 * The given timeInfo object is assumed to have the following properties:  "hour" (0-23),
                 * "min" (0-59), "sec" (0-59, possibly missing).  The format String is typically the out format
                 * specified by MSTRWeb server.  In theory, this method should handle any such format String,
                 * but to optimize this implementation, we make certain assumptions about the format String, namely:
                 * the string may contain: "HH", "H", "hh", "h", "mm", "m", "ss", "s", "a"; all other chars
                 * are taken as literals.
                 */
                formatTimeInfo: function formatTimeInfo(/*Object*/ timeInfo, /*String*/ format) {
                    if (!format) return '';
                    var twelveHour = !(Number(timeInfo.hour) % 12) ? 12 : (Number(timeInfo.hour) % 12),
                        s = format.replace(/HH/g, this.formatInteger(timeInfo.hour, 2)
                                    ).replace(/H/g, Number(timeInfo.hour)
                                    ).replace(/hh/g, this.formatInteger(twelveHour, 2)
                                    ).replace(/h/g, twelveHour
                                    ).replace(/mm/g, this.formatInteger(Number(timeInfo.min) || 0, 2)
                                    ).replace(/m/g, Number(timeInfo.min) || 0
                                    ).replace(/ss/g, this.formatInteger(Number(timeInfo.sec) || 0, 2)
                                    ).replace(/s/g, Number(timeInfo.sec) || 0
                                    ).replace(/a/g, (Number(timeInfo.hour) < 12) ? _DT().AM_NAME : _DT().PM_NAME
                                    );
                    return s;
                },

                /**
                 * Returns true if the given time falls within the valid number range of hours, minutes
                 * and seconds.  Seconds are optional, so if omitted, the time can still be considered valid.
                 */
                doesTimeExist: function doesTimeExst(/*Integer*/ capitalHour, /*Integer*/ min, /*Integer?*/ sec) {
                    var h = parseInt(capitalHour);
                    if (h >= 0 && h <= 23) {
                        var m = parseInt(min);
                        if (m >= 0 && m <= 59) {
                            if (!sec) return true;
                            var s = parseInt(sec);
                            if (s >= 0 && s <= 59) return true;
                        }
                    }
                    return false;
                },
                
                
                /**
                 * This method converts a given hour to a capital Hour.  "Capital Hour" means
                 * an integer from 0-23.  The given hour can be either in capital Hour units
                 * or in little hour units (1-12); but if given in little hour units, then the
                 * ampm argument must be set to either "AM" or "PM" or their localized equivalents
                 * (_DT().AM_NAME and _DT().PM_NAME).  The ampm param is case-insensitive.
                 */
                capitalHour: function capitalHour(/*String*/ hour, /*String?*/ ampm) {
                    // Assume that if no am/pm info is given, the hour is a capital Hour,
                    // meaning 0-23.  Otherwise, if am/pm is given, the hour is a little hour,
                    // meaning, 1-12.
                    hour = parseInt(Number(hour));
                    if (ampm && (ampm.match(_DT().AM_NAME) || ampm.match(/AM/i))) {
                        // We have AM info, so hour is a little hour.
                        return hour % 12;
                    } else if (ampm && (ampm.match(_DT().PM_NAME) || ampm.match(/PM/i))) {
                        // We have PM info, so hour is a little hour.
                        return 12 + (hour % 12);
                    } else {
                        // Missing or invalid ampm param.
                        // We don't have am/pm info, so hour is a capital Hour.
                        return hour;
                    }
                },
                
                /**
                 * Validation to check if a given string is either (1) a date only, (2) a time only, or
                 * (3) a date + time.
                 * The bFormat param determines whether this method returns a string (bFormat = true)
                 * or boolean (bFormat = false or missing).
                 */
                isDateAndOrTime: function isDateAndOrTime(/*String*/ s, /*Boolean?*/ bFormat) {
                    return this.isDateTime(s, bFormat)
                            || this.isDate(s, bFormat)
                            || this.isTime(s, bFormat);
                },
                
                /**
                 * Validation method for timestamps. Succeeds if the given string contains a
                 * valid date and a valid time.  Note that if other extraneous chars are also present
                 * in the string along valid date + time substrings, validation still succeeds.
                 * The bFormat param determines whether this method returns a string (bFormat = true)
                 * or boolean (bFormat = false or missing).
                 * If bFormat is true, the method will return the formatted
                 * date and time, if found; null otherwise.  If bFormat is false,
                 * the method will return true if the date and time are found; false otherwise.
                 * If bFormat is true and a match is made, the formatted date + formatted time strings
                 * are concat'd together by a space (in whichever order they were found); other extraneous
                 * pieces of the string are discarded.
                 */
                isDateTime: function isDateTime(/*String*/ s, /*Boolean?*/ bFormat) {
                    // Try to parse the date and time info from the given string.
                    // If parsing succeeded, and the numbers are in the right range, validation successful.
                    var dateTimeInfo = this.parseDateAndOrTime(s),
                        dateInfo = dateTimeInfo && dateTimeInfo.date,
                        timeInfo = dateTimeInfo && dateTimeInfo.time,
                        isValid = !!dateInfo 
                                    && !!timeInfo
                                    && this.doesDateExist(dateInfo.month, dateInfo.day, dateInfo.year)
                                    && this.doesTimeExist(timeInfo.hour, timeInfo.min, timeInfo.sec);
                    // Are we returning a formatted String, or a Boolean?
                    if (bFormat) {
                        // Return formatted Strings concat'd together, if matched; otherwise return null.
                        if (isValid) {
                            // Format the strings and concat. Which came first, date or time?
                            var formattedDate = this.formatDateInfo(dateInfo, _DT().DATEOUTPUTFORMAT),
                                formattedTime = this.formatTimeInfo(timeInfo, _DT().TIMEOUTPUTFORMAT),
                                dateIndex = s.indexOf(dateInfo.match),
                                timeIndex = s.indexOf(timeInfo.match);
                            return (timeIndex < dateIndex) ?
                                    formattedTime + ' ' + formattedDate :
                                    formattedDate + ' ' + formattedTime;
                                
                        } else {
                            return null;
                        }
                    } else {
                        // Return Boolean.
                        return !!isValid;
                    }
                },
                
                

                /**
                 * Parses a given string for date and time substring information.  If both date and time are not
                 * found, parser returns null; otherwise, parser returns a composite object with two properties, "date" and "time", each of
                 * which correspond to the return values from calling the methods "parseDate" and "parseTime" respectively.
                 * If only date info is found, the "time" property is set to null; if only time info is found, the "date" property
                 * is set to null.
                 */
                parseDateAndOrTime: function parseDateAndOrTime(/*String*/ s, /*String?*/ dateFormat, timeFormat) {
                    // First look for a date substring.
                    var dateInfo = this.parseDate(s, true, dateFormat);
                    // Now look for a time substring; search in the string after removing the date (if found), so that we
                    // don't mistake some of the date as part of a time.
                    var sWithoutDate = $S.trim((dateInfo && dateInfo.match) ? 
                                            s.replace(dateInfo.match, "") :
                                            s),
                        timeInfo = this.parseTime(sWithoutDate, false, timeFormat); // by passing false, we are asking for exactly match
                        
                    // If we didn't find a time nor a date, we are done.
                    if (!dateInfo && !timeInfo) {
                        return null;
                    } else {
                        // We found a date or a time, or both. Return the results of both parsings.
                        return {
                            date: dateInfo,
                            time: timeInfo
                            };
                    }
                },
                
                /**
                 * Compares a given value with a minimum and maximum. If the value is below the minimum, returns -1.
                 * If the value is above the maximum, returns 1.  Otherwise, returns 0.  Note that the value, min & max
                 * are all assumed to use the current locale's formats for date & time.
                 */
                inDateTimeRange: function inDateTimeRange(val, min, max) {
                    // Parse the value's date and/or time.
                    var valInfo = this.parseDateAndOrTime(val),
                        valDateInfo = valInfo && valInfo.date,
                        valTimeInfo = valInfo && valInfo.time;
                    // If both date & time failed to parse, exit.
                    if (!valDateInfo && !valTimeInfo) return 0;
                    
                    // Minimum comparison.
                    if (min != null) {
                        // Parse the minimum's date and/or time.
                        var minInfo = this.parseDateAndOrTime(min);
                        // Compare the minimum's date, if any.
                        if (valDateInfo && minInfo && minInfo.date) {
                            var minDiff = this.compareDate(valDateInfo, minInfo.date);
                            if (minDiff < 0) {
                                // The given date is less than the minimum.
                                return -1;
                            } else if (minDiff == 0)  {
                                // The given date is the same as the minimum date.
                                // Compare the minimum's time, if any.
                                if (valTimeInfo && minInfo.time
                                    && (this.compareTime(valTimeInfo, minInfo.time) < 0))
                                {
                                    // The given date's time is less than the minimum.
                                    return -1;
                                } // end if compareTime with minInfo
                            } // end else if minDiff == 0
                        } // end if valDateInfo && minInfo.date
                    } // end if min
            
                    // Maximum comparison.
                    if (max != null) {
                        // Parse the maximum's date and/or time.
                        var maxInfo = this.parseDateAndOrTime(max);
                        // Compare the maximum's date, if any.
                        if (valDateInfo && maxInfo && maxInfo.date) {
                            var maxDiff = this.compareDate(valDateInfo, maxInfo.date);
                            if (maxDiff > 0) {
                                // The given date is greater than the maximum.
                                return 1;
                            } else if (maxDiff == 0) {
                                // The given date is the same as the maximum date.
                                // Compare the maximum's time, if any.
                                if (valTimeInfo && maxInfo.time
                                    && (this.compareTime(valTimeInfo, maxInfo.time) > 0))
                                {
                                    // The given date's time is greater than the maximum.
                                    return 1;
                                } // end if compareTime of max
                            } // end else if maxDiff == 0
                        } // end if valDateInfo && maxInfo.date
                    } // end if max
                    return 0;
                },
                
                
                /**
                 * Compares two non-null localized date strings. If val1 is lesser, returns a negative.
                 * If val1 is greater, returns a postive. Otherwise returns zero.
                 * The caller may also pass in Objects, rather than Strings, for either value, where the
                 * Object passed in the Object returned by calling mstrmojo.date.parseDate(..) with the
                 * localized date string.
                 */ 
                compareDate: function compareDate(/*String|Object*/ val1, /*String|Object*/ val2) {
                    if (val1 == val2) return 0;
                    var date1 = typeof(val1) == 'string' ? this.parseDate(val1) : val1,
                        date2 = typeof(val2) == 'string' ? this.parseDate(val2) : val2;
                    if (!date1) return -1;
                    if (!date2) return 1;
                    return (date1.year - date2.year)
                                || (date1.month - date2.month)
                                || (date1.day - date2.day)
                                || 0;
                },
                
                /**
                 * Compares two non-null localized time strings. If val1 is lesser, returns a negative.
                 * If val1 is greater, returns a postive. Otherwise returns zero.
                 * The caller may also pass in Objects, rather than Strings, for either value, where the
                 * Object passed in the Object returned by calling LocaleParser.parseTime(..) with the
                 * localized time string.
                 */ 
                compareTime: function compareTime(/*String*/ val1, /*String*/ val2) {
                    if (val1 == val2) return 0;
                    var time1 = typeof(val1) == 'string' ? this.parseTime(val1) : val1,
                        time2 = typeof(val2) == 'string' ? this.parseTime(val2) : val2;
                    if (!time1) return -1;
                    if (!time2) return 1;
                    return (time1.hour - time2.hour)
                                || (time1.min - time2.min)
                                || (time1.sec - time2.sec)
                                || 0;
                },
            
                /**
                 * Compares two non-null localized datetime strings. If val1 is lesser, returns a negative.
                 * If val1 is greater, returns a postive. Otherwise returns zero.
                 */ 
                compareDateTime: function compareDateTime(/*String*/ val1, /*String*/ val2) {
                    return this.compareDate(val1, val2) || this.compareTime(val1, val2);
                },
                
                compareDateAndOrTime: function compareDateAndOrTime(/*String*/ val1, /*String*/ val2) {
                	if (val1 == val2) return 0;
                	var dt1 = typeof(val1) == 'string' ? this.parseDateAndOrTime(val1) : val1,
                		dt2 = typeof(val2) == 'string' ? this.parseDateAndOrTime(val2) : val2;
                	
                	if (!dt1) return -1;
                	if (!dt2) return 1;
                		
                	var d1 = dt1.date, d2 = dt2.date, t1 = dt1.time, t2 = dt2.time;
                	return this.compareDate(d1, d2) || this.compareTime(t1, t2); 
                },
                
                /**
                 * Converts a given date format string from MSTRWeb server to a javascript
                 * regular expression that will be used to match that string against a
                 * user-given value.
                 * This method makes many assumptions about the format strings:
                 * 1) The string has chars "M", "d" and "y" (case-sensitive).
                 * 2) The "d"s are grouped together consecutively, as are the "M"s and "y"s.
                 * 3) There are either 1 or 2 "d"s, 1 to 4 "M"s, and either 2 or 4 "y"s.
                 */
                _buildRegExp4DateFormat: function re4DateFmt(/*String*/ formatStr) {
                
                    if (!formatStr) return null;
                    // Lookup local cached result. 
                    var reInfo = this.REGEXPS.DATES[formatStr];
                    if (!reInfo) {
                        // Cache not found, build result and cache it.
                        if (!this.REGEXPS.MONTHNAME_FULL) {
                            this.REGEXPS.MONTHNAME_FULL = _DT().MONTHNAME_FULL.join("|");
                            this.REGEXPS.MONTHNAME_SHORT = _DT().MONTHNAME_SHORT.join("|");
                        }
                        // The result is an object with several properties...
                        reInfo = this.REGEXPS.DATES[formatStr] = {};
                        // The "formatStr" prop has the original format string.
                        reInfo.formatStr = formatStr;
                        // The "re" prop has a regular expression derived from the format string.
                        // This requires several string replacements:
                        // 1) First, we need to escape any string chars which are not:
                        // "M", "d", "y", or white space.
                        // 2) Replace "dd" with 2 digits, to be captured as a whole.
                        // 3) Replace "d" with 1 or 2 digits, to be captured as a whole.
                        // Note that 2 & 3 must be done before the rest, because the digit placeholder
                        // is "\d" in RE syntax, which might be confused with "d" for day in Date syntax.
                        // 4) Replace 4 "y"s with 4 digits, to be captured as a whole.
                        // 5) Replace 2 "y"s with 2 digits, to be captured as a whole.
                        // 6) Replace 4 "M"s with a placeholder for a list of full month names
                        // (this placeholder should avoid "M"s)
                        // 7) Replace 3 "M"s with a placeholder for a list of short month names
                        // (this placeholder should avoid "M"s and should avoid being confused
                        // with the parts of the list of full month names).
                        // 8) Replace 2 "M"s with 2 digits, to be captured as a whole.
                        // 9) Replace "M" with 1 or 2 digits, to be captured as a whole.
                        // 10) Replace the 4 "M"s placeholder with the actual list of full month names.
                        // 11) Replace the 3 "M"s placeholder with the actual list of short month names.
                        var reStr = reInfo.reStr = formatStr.replace(/([^M|d|y|\s])/g, "\\$1"
                                        ).replace(/dd/g, "~~~~" // temporary place holder so the following "d" replacement wont touch "dd"s
                                        ).replace(/d/g, "(\\d{1,2})"
                                        ).replace(/\~\~\~\~/g, "(\\d\\d)"   // replace temporary placeholder for "dd"s
                                        ).replace(/yyyy/g, "(\\d\\d\\d\\d)"
                                        ).replace(/yy/g, "(\\d\\d)"
                                        ).replace(/MMMM/g, "@@@@"
                                        ).replace(/MMM/g, "@@@"
                                        ).replace(/MM/g, "(\\d\\d)"
                                        ).replace(/M/g, "(\\d{1,2})"
                                        ).replace("@@@@","(" + this.REGEXPS.MONTHNAME_FULL + ")"
                                        ).replace("@@@", "(" + this.REGEXPS.MONTHNAME_SHORT + ")");
                        // Now instantiate the reg expr objects and cache them; one object for
                        // an "equals" match, another for a "contains" match.
                        reInfo.reEquals = new RegExp("^" + reStr + "$");
                        reInfo.reContains = new RegExp("^" + reStr + "\\b");
                        // When we apply this reg expr and a match is found, the
                        // results of match() will yield the month, day and year
                        // parts that matched the pattern.  But they'll be sorted in
                        // the order they are found.  So we record their order in order
                        // to identify them later when examining the results of a match.
                        var indices = [
                            {key: "monthIndex", index: formatStr.indexOf("M")},
                            {key: "dayIndex", index: formatStr.indexOf("d")},
                            {key: "yearIndex", index: formatStr.indexOf("y")}
                            ];
                        indices.sort(function(a, b) { return a.index - b.index });
                        var counter = 1;
                        for (var i = 0; i < 3; i++) {
                            reInfo[indices[i].key] = indices[i].index > -1 ?
                                                        counter++ : null;
                        }   
                    }
                    return reInfo;
                },
            
                /**
                 * Converts a given time format string from MSTRWeb server to a javascript
                 * regular expression that will be used to match that string against a
                 * user-given value.
                 * This method makes many assumptions about the format strings:
                 * 1) The string may have chars "H", "h", "m", "s", "a", "z" and "Z" (case-sensitive).
                 * 2) These chars above are grouped together consecutively.
                 * 3) Some chars are assumed to occur a max # of times (e.g., no more than 2 "H"s, "s"s, "m"s, etc).
                 * 4) A single quote (') is used to enclose a set of literal chars.
                 * 5) Two single quotes ('') are used to represent a single quote.
                 */
                _buildRegExp4TimeFormat: function re4TimeFmt(/*String*/ formatStr) {
                
                    if (!formatStr) return null;
                    // Lookup local cached result. 
                    var reInfo = this.REGEXPS.TIMES[formatStr];
                    if (!reInfo) {
                        // Cache not found, build result and cache it.
                        if (!this.REGEXPSTR_AMPM) {
                            
                            this.REGEXPSTR_AMPM = [_DT().AM_NAME, 
                                                _DT().PM_NAME,
                                                String(_DT().AM_NAME).toLowerCase(),
                                                String(_DT().PM_NAME).toLowerCase()
                                                ].join("|");
                        }
                        // The result is an object with several properties...
                        reInfo = this.REGEXPS.TIMES[formatStr] = {};
                        // The "formatStr" prop has the original format string.
                        reInfo.formatStr = formatStr;
                        // The "re" prop has a regular expression derived from the format string.
                        // This requires several string replacements:
                        // 1) First, we temporarily replace every double-single-quote with
                        // a placeholder so it will be ignored in the next step.
                        var reStr = formatStr.replace(/\'\'/g, '"');
                        // 2) Next, we temporarily remove every literal that is enclosed
                        // in single quotes, so it won't be modified by the following steps.
                        // We'll reinsert these literals back in after those steps are done.
                        var literals = reStr.match(/\'(.+?)\'/g);
                        reStr.replace(/\'(.+?)\'/g, '*');
                        // 3) we need to escape any string chars which are not:
                        // "H", "h", "m", "s", "z", "Z", "a", or white space.
                        // 4) Replace these special chars with correct placeholders.
                        reStr = reStr.replace(/([^H|h|m|s|z|Z|a|\s])/g, "\\$1"
                                        ).replace(/HH|hh/g, "(\\d\\d)"
                                        ).replace(/H|h/g, "(\\d{1,2})"
                                        ).replace(/mm/g, "(\\d\\d)"
                                        ).replace(/m/g, "(\\d{1,2})"
                                        ).replace(/ss/g, "(\\d\\d)"
                                        ).replace(/s/g, "(\\d{1,2})"
                                        ).replace(/a/gi, "(" + this.REGEXPSTR_AMPM + ")"
                                        ).replace(/z|Z/g, "(.+?)");
                        // 5) Now we are ready to reinsert our literals back in.
                        for (var i = 1, len = literals && literals.length || 0; i < len; i++) {
                            reStr = reStr.replace(/\*/, literals[i]);
                        }
                        // 6) And we can undo our first step; replacing the double single quotes.
                        reStr = reStr.replace(/\"/g, "'");
                        
                        // Now instantiate the reg expr object and cache it.
                        // Now instantiate the reg expr objects and cache them; one object for
                        // an "equals" match, another for a "contains" match.
                        reInfo.reEquals = new RegExp("^" + reStr + "$");
                        reInfo.reContains = new RegExp(reStr);
                        // When we apply this reg expr and a match is found, the
                        // results of match() will yield the month, day and year
                        // parts that matched the pattern.  But they'll be sorted in
                        // the order they are found.  So we record their order in order
                        // to identify them later when examining the results of a match.
                        var indices = [
                            {key: "hourIndex", index: formatStr.search(/h|H/)},
                            {key: "minIndex", index: formatStr.indexOf("m")},
                            {key: "secIndex", index: formatStr.indexOf("s")},
                            {key: "ampmIndex", index: formatStr.indexOf("a")},
                            {key: "zoneIndex", index: formatStr.search(/z|Z/)}
                            ];
                        indices.sort(function(a, b) { return a.index - b.index });
                        var counter = 1;
                        for (var i = 0; i < 5; i++) {
                            reInfo[indices[i].key] = indices[i].index > -1 ? 
                                                        counter++ : null;
                        }   
                    }
                    return reInfo;
                },
                
                /**
                 * Returns true if the given date is an actual day on the calendar.
                 * For example February 30th of any year would return false.
                 */
                doesDateExist: function doesDateExist(/*Integer*/ month, /*Integer*/ day, /*Integer*/ year) {
                    var dt = new Date(year, month - 1, day);

                    return year == dt.getFullYear() &&
                           month == dt.getMonth() + 1 &&
                           day == dt.getDate();
                },
            
                /**
                 * Given a year integer that is between 0 and 99 inclusive,
                 * this method will return a corresponding 4-digit year.
                 */
                fourDigitYear: function fourDigitYear(/*String|Integer*/ year) {
                    year = parseInt(Number(year));
                    if (!isNaN(year)) {
                        var twoDigitStart = (_DT().TWODIGITYEARSTART  % 100) || 0;   
                        if (year >= 0 && year <= twoDigitStart) 
                            year = 2000 + year; 
                        else if (year > twoDigitStart && year < 100)
                            year = 1900 + year;
                    }
                    return year;
                },
                
                /**
                 * Returns the 1-based (NOT 0-based) index of a given month name.  If not found, returns 0.
                 * The name is searched for in the list of localized month names/abbrevs.
                 */
                numericMonth: function numMonth(/*String|Number*/ month) {
                    // Were we given an integer (either as a String or a Number)? Then no work required.
                    var monthInt = parseInt(Number(month)),
                        _A = mstrmojo.array;
                    if (!isNaN(monthInt)) return monthInt;
                    
                    // We were given a non-integer string. Must be a month name (long or short).
                    // Search for it in our list of month names.
                    var len = month && month.length || 0,
                        index = -1;
                    if (len) {
                        // If the name is 3 chars long or shorter, start by looking in the abbreviations.
                        if (len <= 3) {
                            index = _A.indexOf(_DT().MONTHNAME_SHORT, month);
                        }
                        // If still not found, look for it in the full month names list.
                        if (index == -1) {
                            index = _A.indexOf(_DT().MONTHNAME_FULL, month);
                        }
                    }
                    return index + 1;
                },
                
                /**
                 * This method converts a given integer into a string whose length is at least
                 * equal to the given minimum length.  For example, if the integer 5 is passed
                 * in with a given min length = 2, then this method returns "05".
                 */
                formatInteger: function fmtInt(/*Integer*/ num, /*Integer*/ minLen) {
                    var s = String(num),
                        missing = Math.max(minLen - s.length, 0);
                    if (missing > 0) {
                        var arr = [s];
                        for (var i = 1; i <= missing; i++) {
                            arr.push("0");
                        }
                        s = arr.reverse().join('');
                    }
                    return s;
                },
                
                /**
                 * This method returns the first Date of a given month. 
                 */
                getFirstDateOfMonth: function(y,m){
                    return new Date(y, m-1, 1);
                },
                
                /**
                 * This method returns the Date object given values for various part of a Date object. 
                 */
                getDateObject: function(y,m,d,hh,mm,ss){
                    y = y || 0;
                    m = m || 1;
                    d = d || 1;
                    hh = hh || 0;
                    mm = mm || 0;
                    ss = ss || 0;
                    return new Date(y,m-1,d,hh,mm,ss);
                },
                
                /**
                 * This method returns a native Date object based on a date info object.
                 */
                getDateFromDateInfo: function (dateInfo) {
                    return this.getDateObject(
                                dateInfo.date && dateInfo.date.year,
                                dateInfo.date && dateInfo.date.month,
                                dateInfo.date && dateInfo.date.day,
                                dateInfo.time && dateInfo.time.hour,
                                dateInfo.time && dateInfo.time.min,
                                dateInfo.time && dateInfo.time.sec
                            );
                },
                
                /**
                 * This method returns a json given a Date object.  
                 */
                getDateJson: function(date){
                    return {year:date.getFullYear(),month:date.getMonth() + 1,day:date.getDate(),
                            hour:date.getHours(),min:date.getMinutes(),sec:date.getSeconds()};
                },
                
                /**
                 * This method checks whether a year is a leap or not. 
                 */
                isLeapYear: function(y) {
                    return !(y%400) || (!(y%4) && !!(y%100));
                },
                
                /**
                 * This method returns the number of days in a given month. 
                 */
                getDaysOfMonth: function(y,m){
                    var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    if(m == 2 && this.isLeapYear(y)){ return 29; } 
                    return days[m - 1];     
                },
                
                /**
                 * This method returns a previous month of a given month. 
                 */
                getPreMonth: function(y,m) {
                    if(m === 1) return {y:y-1, m:12};
                    return {y:y,m:m-1};
                },
                
                /**
                 * This method returns a next month of a given month. 
                 */
                getNextMonth: function(y,m){
                    if(m === 12) return {y:y+1,m:1};
                    return {y:y,m:m+1};
                }              
                
            });

 })();