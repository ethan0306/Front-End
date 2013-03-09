(function () {
    
    /**
     * A utility class for working with arrays.
     * 
     * @class
     */
    mstrmojo.array = mstrmojo.provide(
        "mstrmojo.array",
        /**
         * @lends mstrmojo.array
         */
        {
            
            /**
             * Searches a given array for a given item.
             * 
             * @param {Any[]} arr The array to search.
             * @param {Any} item The item to search for.
             * 
             * @return The index of the item if found; -1 otherwise.
             */
            indexOf: function indexOf(arr, item) {
                var i = 0,
                    len = (arr && arr.length)  || 0;
                
                for (; i < len; i++) {
                    if (arr[i] == item) {
                        return i;
                    }
                }
                return -1;
            },
            
            /**
             * Searches a given array for given set of items.
             * 
             * @return {Object} The search results object, with the following properties:
             * <ul>
             * <li>"indices": an array of indices, one for each given item (null, if not found);</li>
             * <li>"count": the number of items found, possibly 0;</li>
             * <li>"map": a mapping of each found item, keyed by its index in "items" param, to the index where it was found
             * in the "arr" param.</li>
             * </ul>
             */
            indexOfMulti: function idxOf(/*Array*/ arr, /*Array*/ items) {
                if (!items) {
                    return {indices: null, map: {}, count: 0};
                }
                var len = items.length,
                    idxs = new Array(len),
                    map = {},
                    c = 0;
                for (var i=0, j=(arr&&arr.length)||0; i<j; i++){
                    var a = arr[i];
                    for (var k = 0; k<len; k++) {
                        if (items[k] === a){
                            idxs[k] = i;
                            map[k] = i;
                            c++;
                            break;  // Assumes item won't be repeat in items
                        }
                    }
                }
                return {indices: idxs, map: map, count: c}; 
            },
            
            /**
             * Calls a given function once per each item in a given array,
             * passing into that function 3 arguments: the item value, the
             * item index, and the array itself.
             * 
             * @param {Array} arr The Array to be iterated.
             * @param {Function} f The function to be run for each iteration.  The function will accept three parameters (value, index, arr) and if it explicitly returns false the 
             *        iteration will be canceled.
             * @param {Object} [scope=f] An optional scope for the passed function.
             */
            forEach: function forEach(arr, f, scope) {
                for (var i = 0, len = (arr && arr.length) || 0; i < len; i++) {
                    if (scope) {
                        if (f.call(scope, arr[i], i, arr) === false) {
                            break;
                        }
                    } else {
                        if (f(arr[i], i, arr) === false) {
                            break;
                        }
                    }
                }
            },
            
            /**
             * <p>Returns the subset of a given array.</p>
             * 
             * <p>The items of the subset are determined by a given filter function. The function receives
             * each item as the sole argument to the function, and those items
             * for whom the function returns truthy are included in the subset.</p>
             */
            filter: function filter(/*Array*/ arr, /*Function*/ f, /*Object?*/ config) {
                var result = [],
                    n = 0;
                for (var i=0, len=arr && arr.length || 0; i < len; i++) {
                    if (f(arr[i])) {
                        result[n] = arr[i];
                        n++;
                        if (config && config.max && (n >= config.max)) {
                            break;
                        }
                    }
                }
                return result;
            },
            
            /**
             * Returns the index of the first item in a given array whose given
             * property name matches a given value.  This is a faster alternative to
             * using filter() for a simple property-value search.
             */
            find: function find(/*Array*/ arr, /*String*/ n, /*Any*/ v) {
                for (var i=0, len=arr && arr.length || 0; i < len; i++) {
                    var obj = arr[i];
                    if (obj && obj[n] == v) {
                        return i;
                    }
                }
                return -1;
            },
            
            /**
             * Binary search for an array item via comparison of a property.
             * Assumes the array is sorted (ascending) via the given property's value.
             * @param {Array} arr Array of items to be searched.
             * @param {Object} item Item whose property value is to be matched.
             * @param {String} p Name of property whose value is to be matched.
             * @param {Integer} [len] Length of given array; can be supplied as a performance optimization.
             */
            findBin: function fBin(/*Array*/ arr, /*Object*/ item, /*String*/ p, /*Integer?*/ len) {
                var h = len ? len : arr.length, // high
                    l = -1,         // low
                    m,              // medium
                    v = item[p];    // value
                while (h-l > 1) {
                    if (arr[m = h+l >> 1][p] < v) { // a+b >> 1 is shortcut for parseInt((a+b)/2,10)
                        l = m;
                    } else {
                        h = m;
                    }
                }
                return arr[h][p] === v ? h : -1;
            },

            /**
             * Searches the provided array for an item that has a property p with a specified value.  The array must be
             * sorted in ascending order by the property p otherwise the results are undefined.  Both the property values
             * and the test value are assumed to be strings. The search is case INSENSITIVE.
             * The comparison of item property value against the test value is limited to the length on the test value.
             * If no match is found, this method returns the index into the array where an object with property p == test value
             * should be inserted to keep the array sorted.
             * @param {Array} o Array to search
             * @param {String} v Value to search for in the array items property p
             * @param {String} p Name of property to use in comparisons
             * @returns Index of matching string or place to insert object with test value.
             * @type Integer
             */
            
            search: function search(o,v,p) {
                var h = o.length,
                    l = -1,
                    m,
                    val = v.toUpperCase(),
                    len = v.length;
                    
                while(h - l > 1)
                    if(o[m = h + l >> 1][p].substr(0,len).toUpperCase() < val) l = m;
                    else h = m;
                return h;
            },

            /**
             * Searches a given array for items which match a given set of items on a given property.
             * 
             * @param {Array} arr The items to be searched.
             * @param {String} n The property name which will be used to match items.
             * @param {Array} items The items to be searched for.
             * @return {Object} The search results object, with the following properties:
             * <ul>
             * <li>"indices": an array of indices, one for each given item (null, if not found);</li>
             * <li>"count": the number of items found, possibly 0;</li>
             * <li>"map": a mapping of each found item, keyed by its index in "items" param, to the index where it was found
             * in the "arr" param.</li>
             * </ul>
             */
            findMulti: function idxOf(/*Array*/ arr, /*String*/ n, /*Array*/ items) {
                if (!items) {
                    return {indices: null, map: {}, count: 0};
                }
                var len = items.length,
                    idxs = [], // new Array(len), can not create fixed length array, since the items may have item not in the arr range.
                    map = {},
                    c = 0;
                for (var i=0, j=(arr&&arr.length)||0; i<j; i++){
                    var a = arr[i][n];
                    for (var k = 0; k<len; k++) {
                        if (items[k][n] === a){
                            idxs[k] = i;
                            map[k] = i;
                            c++;
                            break;  // Assumes item won't be repeat in items
                        }
                    }
                }
                return {indices: idxs, map: map, count: c}; 
            },
            
            /**
             * Removes a given item from a given array, if found.
             */
            removeItem: function rmI(/*Array*/ arr, /*Any*/ item) {
                var i = this.indexOf(arr, item);
                if (i >-1) {
                    this.removeIndices(arr, i, 1);
                }
                return i;
            },
            
            /**
             * Searches a given array for items which match a given set of items on a given property, and
             * removes any of the matches found.
             * 
             * @param {Array} arr The items to be searched.
             * @param {String} n The property name which will be used to match items.
             * @param {Array} items The items to be searched for.
             */
            removeItems: function rmIts(arr, n, items){
                var ret = this.findMulti(arr, n, items);
                if (ret.count) {
                    // Sort the indices in ascending order, slice off the nulls (i.e., the not found).
                    var idxs = ret.indices.concat().sort(this.numSorter).slice(0, ret.count);
                    for (var i=idxs.length-1; i>-1; i--) {
                        // TO DO: optimize this function to do splices in ranges, not individual items.
                        arr.splice(idxs[i], 1);
                    }
                }
            },
            
            /**
             * Comparison function for sorting number data types. Used with Array.prototype.sort.
             */
            numSorter: function ns(a,b) {
                return Number(a)-Number(b);
            },

            stringSorter: function ss(a,b){
                var A = a.toLowerCase();
                var B = b.toLowerCase();
                if (A < B){
                   return -1;
                }else if (A > B){
                  return  1;
                }else{
                  return 0;
                }
            },
            
            /**
             * Removes a given range of indices from a given array.
             * 
             * @param start The starting index (0-based) of the indices to be removed.
             * @param count The number of indices to be removed.
             */
            removeIndices: function removeIds(/*Array*/ arr, /*Integer*/ start, /*Integer*/ count) {
                arr.splice(start, count);
            },
            
            /**
             * Inserts a given array of items into a given array at a given index.
             * 
             * @param {Array} [arr] The array to be inserted into; if missing, a new array is created.
             * @param {Integer} idx The index at which to insert the new items.
             * @param {Array} items The items to be inserted.
             * @returns {Array} The array after insertion.
             */
            insert: function inst(arr, idx, items) {
                if (!arr) {
                    arr = [];
                }
                if (idx == null){
                    idx = arr.length;
                }
                Array.prototype.splice.apply(arr, [idx, 0].concat(items));
                return arr;
            },
            
            /**
             * <p>Creates a hashtable of booleans from the contents of a given array.</p>
             *
             * <p>The array values are used as the hash keys; the hash values are all set to true.</p>
             *
             * @param {Array} arr The array from which to read the hash keys.
             * @returns {Object} The new hashtable.
             */
            hash: function hs(arr) {
                var h = {};
                for (var i=0, len=(arr&&arr.length)||0; i<len; i++) {
                    h[arr[i]] = true;
                }
                return h;
            },
            
            /**
             * Returns a list of the items at the given indices of an array.
             * @param {Array} arr The array whose items are to be read.
             * @param {Array} idxs The list of indices at which the array will be read. If null, null is returned. If empty, an empty array is returned.
             * @return {Array} The subset of array items at the requested indices; possibly empty or null.
             */
            get: function gt(arr, idxs){
                if (!idxs) {
                    return null;
                }
                var ret = [];
                for (var i=0, len=idxs.length; i<len; i++) {
                    ret[i] = arr[idxs[i]];
                }
                return ret;
            },

            /**
             * This function do a deep sort on array of array of objects based on a sortable object property.
             * 
             * The object in the innermost array could have depth 2 or higher.
             * 
             * @param (Array) arr Array to sort 
             * @param (String) prop Property to sort on
             * @param {Integer} idx Index of the property in the object (0-based).
             * 
             * var data = [ //all rows
                  [ //row 1
                      { //col 1
                        text: 'r1 text 1',//text to display
                        icon: 'r1 icon 1'
                      },
                      { //col 2
                        text: 'r1 text 2',//text to display
                        icon: 'icon 2'
                      },
        
                      { //col 3
                        text: 'r1 text 3',//text to display
                        icon: 'icon 3'
                      }
         
                  ],//end row1
        
                [ //row 2
         
                      { //col 1
                        text: 'r2 text 1',//text to display
                        icon: 'r2 icon 1'
                      },
                      { //col 2
                        text: 'r2 text 2',//text to display
                        icon: 'r2 icon 2'
                      },
        
                      { //col 3
                        text: 'r2 text 3',//text to display
                        icon: ' r2 icon 3'
                      }
        
         
                  ], //end row2
                [ //row 3
         
                      { //col 1
                        text: 'ar3 text 1',//text to display
                        icon: 'r3 icon 1'
                      },
                      { //col 2
                        text: 'r3 text 2',//text to display
                        icon: 'r3 icon 2'
                      },
        
                      { //col 3
                        text: 'r3 text 3',//text to display
                        icon: ' r3 icon 3'
                      }
        
         
                  ]//end row3
                ];
             
                Usage: Sort on 'text' whose index is 0 in the sample data 'col' object.
                        deepSort(data, 'text', 0, true);
                 */
            deepSortArr: function deepSortArr(/*Array*/arr, /*String*/prop, /*Integer*/ idx, /*Boolean*/asc) {
                return arr.sort(function(a, b){
                    return (!asc ? (a[idx][prop] <= b[idx][prop]) : (a[idx][prop] > b[idx][prop])) ? -1 : 1;
                    }
                );
            }

        });
    
})();