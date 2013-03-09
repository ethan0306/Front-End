(function(){
    //This class is borrowed from http://www.webtoolkit.info/javascript-base64.html
    
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    
    var $SFCC = String.fromCharCode;
    
    function _utf8_encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
     
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += $SFCC(c);
            }else if((c > 127) && (c < 2048)) {
                utftext += $SFCC((c >> 6) | 192);
                utftext += $SFCC((c & 63) | 128);
            }else {
                utftext += $SFCC((c >> 12) | 224);
                utftext += $SFCC(((c >> 6) & 63) | 128);
                utftext += $SFCC((c & 63) | 128);
            }
         }
        return utftext;
    }
     
    function _utf8_decode(utftext) {
        var string = "",
            i = 0,
            c = 0, c1 = 0, c2 = 0;
        
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += $SFCC(c);
                i++;
            }else if((c > 191) && (c < 224)) {
                c1 = utftext.charCodeAt(i+1);
                string += $SFCC(((c & 31) << 6) | (c1 & 63));
                i += 2;
            }else {
                c1 = utftext.charCodeAt(i+1);
                c2 = utftext.charCodeAt(i+2);
                string += $SFCC(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                i += 3;
            }
        }
        return string;
    }
    
    mstrmojo.base64 = mstrmojo.provide(
        "mstrmojo.base64",
        /**
         * @lends mstrmojo.base64
         */
        {
            /**
             * <p> Decode the Base64-encoded response header whose value are in the following format: "=?UTF-8?B?EncodedText?=" </p>
             * 
             * @param {String} value The value of a response header.
             * @returns {String} The decoded response header.
             */
            decodeHttpHeader: function(value){
                var rEncoded = /\=\?UTF-8\?B\?(.+?)\?\=/g;
                if (value && value.indexOf("=?UTF-8?B?") === 0){
                    var decMsg = "", result;
                    while ((result = rEncoded.exec(value)) !== null){
                        decMsg += mstrmojo.base64.decode(result[1]);
                    }
                    return decMsg;
                }
                return value;
            },
            
            /**
             * Use Base64 to encode a string input. 
             * @param {String} input A string value.
             * @type String
             * @return The Base64 encoded string
             */
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                
                input = _utf8_encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
    
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
    
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
             
                    output += _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
             
                }
                return output;
            },
            
            /**
             * Decode a Base64 encoded string. 
             * @param {String} input A Base64 encoded string value.
             * @type String
             * @return The decoded string
             */
            decode: function (input) {
                var output = "", i = 0;
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));
    
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    
                    output += $SFCC(chr1);
                    
                    if (enc3 != 64) {
                        output += $SFCC(chr2);
                    }
                    if (enc4 != 64) {
                        output += $SFCC(chr3);
                    }
                }
                output = _utf8_decode(output);
                return output;
            }
        }
    ); //end provide()
})();