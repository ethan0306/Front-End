(function(){
    
    var $RED = mstrmojo.desc(3604);

    mstrmojo._FormatDefinition = {
        //Formats List
        Formats:[
                 {n: mstrmojo.desc(3433)}, //Descriptor: Font
                 {n: mstrmojo.desc(3434)}, //Descriptor: Number
                 {n: mstrmojo.desc(3435)}, //Descriptor: Alignment
                 {n: mstrmojo.desc(3436)} //Descriptor: Color and Lines
         ],
         FormatTarget: [
                 // {n: 'All', v: 5},
                 {n: mstrmojo.desc(7942), v: 1, p:'header_format'},           //Descriptor: Element Header
                 {n: mstrmojo.desc(7943), v: 2, p:'grid_format'},             //Descriptor: Element Value
                 {n: mstrmojo.desc(7944), v: 3, p:'child_header_format'},     //Descriptor: Individual Items Header
                 {n: mstrmojo.desc(7945), v: 4, p:'child_grid_format'}        //Descriptor: Individual Items Value
         ],
         MetricFormatTarget: [{n: 'Metric Headers', v: 1, p:'header_format'}, 
                              {n: 'Metric Values', v: 2, p:'grid_format'}],
         MetricValueFormats: [
                              {n: mstrmojo.desc(3434)}, //Descriptor: Number
                              {n: mstrmojo.desc(3435)}, //Descriptor: Alignment
                              {n: mstrmojo.desc(3433)}, //Descriptor: Font
                              {n: mstrmojo.desc(2886)}, //Descriptor: Borders
                              {n: mstrmojo.desc(3905)} //Descriptor: Background
         ],
         MetricHeaderFormats: [
                              {n: mstrmojo.desc(3434)}, //Descriptor: Number
                              {n: mstrmojo.desc(3435)}, //Descriptor: Alignment
                              {n: mstrmojo.desc(3433)}, //Descriptor: Font
                              {n: mstrmojo.desc(2886)}, //Descriptor: Borders
                              {n: mstrmojo.desc(3905)}, //Descriptor: Background
                              {n: 'Chart'}
         ],
         //Default value for each Formatting Property
        DefaultFormat: {
            FormattingAlignment: {
                'Horizontal': '1',
                'Vertical': '1',
                'TextWrap': '0',
                'TextDirection': '0'
            },
            FormattingBorder: {
                'HInsideStyle': '1',
                'VInsideStyle': '1',
                'TopStyle': '1',
                'LeftStyle': '1',
                'BottomStyle': '1',
                'RightStyle': '1',
                'HInsideColor': '0',
                'VInsideColor': '0',
                'TopColor': '0',
                'LeftColor': '0',
                'BottomColor': '0',
                'RightColor': '0',
                'Border3DStyle': '0',
                'Border3DWeight': '0',
                'Border3DBottomColor': '0',
                'Border3DLeftColor': '0',
                'Border3DRightColor': '0',
                'Border3DTopColor': '0'
            },
            FormattingFont: {
                'Name': 'Arial',
                'Bold': '0',
                'Italic': '0',
                'Size': '10',
                'Strikeout': '0',
                'Underline': '0',
                'Color': '0',
                'Script': '0'
            },
            FormattingNumber: {
                'Category': '9',
                'DecimalPlaces': '0',
                'ThousandSeparator': '-1',
                'CurrencySymbol': '$',
                'CurrencyPosition': '0',
                'Format': 'General',
                'NegativeNumbers': '3'
            },
            FormattingPadding: {
                'LeftPadding': '1',
                'RightPadding': '1',
                'TopPadding': '1',
                'BottomPadding': '1',
                'LineSpacing': '0'
            },
            FormattingPatterns: {
                'FillColor': '16777215',
                'PatternColor': '8650752',
                'PatternStyle': '1',
                'FillStyle': '0',
                'ApplyToGraphThreshold': '0',
                'GradientColor': '16777215',
                'GradientAngle': '0',
                'GradientXOffset': '0',
                'GradientYOffset': '0',
                'SelectorSelectionColor': '16167264',
                'SelectorSelectionFillStyle': '0',
                
                //Chart pattern for metric headers
                'SeriesFillColor': 'pru',
                'SeriesPatternColor': '8650752',
                'SeriesPatternStyle': '1',
                'SeriesFillStyle': '0',
                'SeriesApplyToGraphThreshold': '0',
                'SeriesGradientColor': '16777215',
                'SeriesGradientAngle': '0',
                'SeriesGradientXOffset': '0',
                'SeriesGradientYOffset': '0',
                'SeriesSelectorSelectionColor': '16167264',
                'SeriesSelectorSelectionFillStyle': '0'
            }
        },
        
        //Font Family names
        Families: [
            {n: mstrmojo.desc(2412), v: "pru"},  //Descriptor: Default
            {n: "Arial", v: "Arial"},
            {n: "Arial Black", v: "Arial Black"},
            {n: "Arial Narrow", v: "Arial Narrow"},
            {n: "Arial Unicode MS", v: "Arial Unicode MS"},
            {n: "Batang", v: "Batang"},
            {n: "Book Antiqua", v: "Book Antiqua"},
            {n: "Bookman Old Style", v: "Bookman Old Style"},
            {n: "Bookshelf Symbol 1", v: "Bookshelf Symbol 1"},
            {n: "Bookshelf Symbol 2", v: "Bookshelf Symbol 2"},
            {n: "Bookshelf Symbol 3", v: "Bookshelf Symbol 3"},
            {n: "Comic Sans MS", v: "Comic Sans MS"},
            {n: "Courier New", v: "Courier New"},
            {n: "Garamond", v: "Garamond"},
            {n: "Haettenschweiler", v: "Haettenschweiler"},
            {n: "Impact", v: "Impact"},
            {n: "Lucida Console", v: "Lucida Console"},
            {n: "Lucida Sans Unicode", v: "Lucida Sans Unicode"},
            {n: "Map Symbols", v: "Map Symbols"},
            {n: "Marlett", v: "Marlett"},
            {n: "Monotype Corsiva", v: "Monotype Corsiva"},
            {n: "Monotype Sorts", v: "Monotype Sorts"},
            {n: "MS Gothic", v: "MS Gothic"},
            {n: "MS Outlook", v: "MS Outlook"},
            {n: "Microsoft Sans Serif", v: "Microsoft Sans Serif"},
            {n: "MT Extra", v: "MT Extra"},
            {n: "Symbol", v: "Symbol"},
            {n: "Tahoma", v: "Tahoma"},
            {n: "Times New Roman", v: "Times New Roman"},
            {n: "Trebuchet MS", v: "Trebuchet MS"},
            {n: "Verdana", v: "Verdana"},
            {n: "Webdings", v: "Webdings"},
            {n: "Wingdings", v: "Wingdings"},
            {n: "Wingdings 2", v: "Wingdings 2"},
            {n: "Wingdings 3", v: "Wingdings 3"}
        ],
        
        //Font Sizes
        Sizes: [
            {n: mstrmojo.desc(2412), v: "pru"},  //Descriptor: Default
            {n: "2", v: "2"},
            {n: "3", v: "3"},
            {n: "4", v: "4"},
            {n: "5", v: "5"},
            {n: "6", v: "6"},
            {n: "7", v: "7"},
            {n: "8", v: "8"},
            {n: "9", v: "9"},
            {n: "10", v: "10"},
            {n: "11", v: "11"},
            {n: "12", v: "12"},
            {n: "14", v: "14"},
            {n: "16", v: "16"},
            {n: "18", v: "18"},
            {n: "20", v: "20"},
            {n: "22", v: "22"},
            {n: "24", v: "24"},
            {n: "36", v: "36"},
            {n: "48", v: "48"},
            {n: "72", v: "72"}
        ],
        
        //Font Styles
        Styles: [
            {n: mstrmojo.desc(2412), v: "pru"},                       //Descriptor: Default
            {n: mstrmojo.desc(3440), v: "0,0"},   //value:first is Bold, second is Italic  // Descriptor: Regular
            {n: mstrmojo.desc(2718), v: "-1,0", v2:'-1,'},          // Descriptor: Bold
            {n: mstrmojo.desc(2719), v: "0,-1", v2: ',-1'},         // Descriptor: Italic
            {n: mstrmojo.desc(3441), v: "-1,-1"}                    // Descriptor: Bold Italic
        ],
        
        //Font Effects
        Effects: [
                {n: 'Underline', v: 0},
                {n: 'Strike', v: 1}
        ],
        
        //Number Categories
        Category: [
                   {n: mstrmojo.desc(2412), v: -2},    //Descriptor: Default
                   {n: mstrmojo.desc(2378), v: 9},    // Descriptor: General
                   {n: mstrmojo.desc(2050), v: 0},     // Descriptor: Fixed
                   {n: mstrmojo.desc(2051), v: 1},     // Descriptor: Currency
                   {n: mstrmojo.desc(2052), v: 2},     // Descriptor: Date
                   {n: mstrmojo.desc(2170), v: 3},     // Descriptor: Time
                   {n: mstrmojo.desc(2053), v: 4},     // Descriptor: Percentage
                   {n: mstrmojo.desc(2054), v: 5},     // Descriptor: Fraction
                   {n: mstrmojo.desc(2055), v: 6},     // Descriptor: Scientific
                   {n: mstrmojo.desc(2056), v: 7}      // Descriptor: Custom
         ],
 
        //Maximum Negative Digits:
        MaxNegativeDidigts: 30,
         
        //Fixed Negative Number Formats 
        FixedNegative:[
                  {n: '-1,234.12', v: 1, f: '#,##0.00'},
                  {n: '-1,234.12['+ $RED +']', r:true, v: 5, f: '#,##0.00;[RED]-#,##0.00'},
                  {n: '1,234.12['+ $RED +']', r:true, v: 2, f: '#,##0.00;[RED]#,##0.00'},
                  {n: '(1,234.12)', v: 3, f: '#,##0.00;(#,##0.00)'},
                  {n: '(1,234.12)['+ $RED +']', r:true, v: 4, f: '#,##0.00;[RED](#,##0.00)'}
        ],
     
        //Currency Negative Number Formats
        CurrencyNegative:[
                        {n: '$-1,234.12', v: 1, f: '"$"#,##0.00'},
                        {n: '$-1,234.12['+ $RED +']', r:true, v: 5, f: '"$"#,##0.00;[RED]-"$"#,##0.00'},
                        {n: '$1,234.12['+ $RED +']', r:true, v: 2, f: '"$"#,##0.00;[RED]"$"#,##0.00'},
                        {n: '$(1,234.12)', v: 3, f: '"$"#,##0.00;("$"#,##0.00)'},
                        {n: '$(1,234.12)['+ $RED +']', r:true, v: 4, f: '"$"#,##0.00;[RED]("$"#,##0.00)'}
       ],
       
       //Currency Symbol Position
       CurrencyPosition: [
                          {n: mstrmojo.desc(2194), v: 0},      //Descriptor: Left
                          {n: mstrmojo.desc(2195), v: 1},      //Descriptor: Right
                          {n: mstrmojo.desc(2183), v: 2},      //Descriptor: Left with space
                          {n: mstrmojo.desc(2182), v: 3}       //Descriptor: Right with space
       ],
       
       //Date Formats
       Date: [
               {n: mstrmojo.desc(2231), v: "m/d"},                 //Descriptor: 4/7
               {n: mstrmojo.desc(2232), v: "mm/dd"},               //Descriptor: 04/07
               {n: mstrmojo.desc(2233), v: "m/d/yy"},              //Descriptor: 4/7/98
               {n: mstrmojo.desc(2234), v: "mm/dd/yy"},            //Descriptor: 04/07/98
               {n: mstrmojo.desc(2235), v: "mm/dd/yyyy"},          //Descriptor: 04/07/1998
               {n: mstrmojo.desc(2236), v: "d-mmm"},               //Descriptor: 7-Apr
               {n: mstrmojo.desc(2237), v: "d-mmm-yy"},            //Descriptor: 7-Apr-98
               {n: mstrmojo.desc(2238), v: "mmm-yy"},              //Descriptor: Apr-98
               {n: mstrmojo.desc(2239), v: "mmm 'yy"},             //Descriptor: Apr '98
               {n: mstrmojo.desc(2240), v:"mmmm yyyy"},            //Descriptor: April 1998
               {n: mstrmojo.desc(2241), v: "m/d/yy h:mm"},         //Descriptor: 4/7/98 15:41
               {n: mstrmojo.desc(2242), v: "m/d/yy h:mm AM/PM"},   //Descriptor: 4/7/98 3:41 PM
               {n: mstrmojo.desc(2243), v: "mmmm d, yyyy"}         //Descriptor: April 7, 1998
      ],
      
      //Time Formats
      Time: [
              {n: mstrmojo.desc(2244), v: "h:mm"},                 //Descriptor: 15:41
              {n: mstrmojo.desc(2245), v: "h:mm AM/PM"},           //Descriptor: 3:41 PM
              {n: mstrmojo.desc(2246), v: "h:mm:ss"},              //Descriptor: 15:41:46
              {n: mstrmojo.desc(2247), v: "h:mm:ss AM/PM"},        //Descriptor: 3:41:46 PM
              {n: mstrmojo.desc(2241), v: "m/d/yy h:mm"},          //Descriptor: 4/7/98 15:41
              {n: mstrmojo.desc(2242), v: "m/d/yy h:mm AM/PM"},    //Descriptor: 4/7/98 3:41 PM
              {n: mstrmojo.desc(2250), v: "mm/dd/yy h:mm"},        //Descriptor: 04/07/98 15:41
              {n: mstrmojo.desc(2248), v: "mm/dd/yy h:mm AM/PM"}   //Descriptor: 04/07/98 3:41 PM
     ],
     
     //Percentage Formats
     PercentNegative: [
                       {n: '-12.12%', v: 1, f:'0.00%'},
                       {n: '-12.12%['+ $RED +']', r:true, v: 5, f: '0.00%;[RED]-0.00%'},
                       {n: '12.12%['+ $RED +']', r:true, v: 2, f: '0.00%;[RED]0.00%'},
                       {n: '(12.12%)', v: 3, f: '0.00%;(0.00%)'},
                       {n: '(12.12%)['+ $RED +']', r:true, v: 4, f: '0.00%;[RED](0.00%)'}
     ],
     
     //Fraction Formats
     Fraction: [
             {n: '12 1/3', v: "# ?/?"},
             {n: '37/3',   v: "?/?"},
             {n: '12 26/81', v: "# ??/??"},
             {n: '998/81',   v: "??/??"}
    ],
    
    //Text Directions
    TextDirection: [
                    {n: mstrmojo.desc(2412), v: 'pru'},  //Descriptor: Default
                    {n: mstrmojo.desc(4601), v: 0}, //Descriptor: Horizontal
                    {n: mstrmojo.desc(5156), v: -90}   //Descriptor: -90 Degree
    ],
    
    //Text Horizontal Alignment Types
    Horizontal: [
            {n: mstrmojo.desc(2296), v: 'pru'},   //Descriptor: Use Default
            {n: mstrmojo.desc(2378), v: 1},    //Descriptor: General
            {n: mstrmojo.desc(2194), v: 2},    //Descriptor: Left
            {n: mstrmojo.desc(2193), v: 3},    //Descriptor: Center
            {n: mstrmojo.desc(2195), v: 4},    //Descriptor: Right
            {n: mstrmojo.desc(2068), v: 6}     //Descriptor: Justify
    ],
  
    //Text Vertical Alignment Types
    Vertical: [
            {n: mstrmojo.desc(2296), v: 'pru'},   //Descriptor: Use Default
            {n: mstrmojo.desc(2256), v: 1},    //Descriptor: Top
            {n: mstrmojo.desc(2067), v: 2},    //Descriptor: Center    
            {n: mstrmojo.desc(2257), v: 3}     //Descriptor: Bottom
    ],
    
    //Flag to Wrap Text
    TextWrap: [ //This List is not for rendering, just make consistent code when find selected value.
               {v: 0},
               {v: -1}
    ],
    
    //Border Styles - styles and sizes mixed
    BorderStyles: [
                    {n: mstrmojo.desc(2412), v: 'pru'},    //Descriptor: Default
                    {n: mstrmojo.desc(2258), v: 0},        //Descriptor: None
                    {n: mstrmojo.desc(2259), v: 3},        //Descriptor: Dashed
                    {n: mstrmojo.desc(2260), v: 4},        //Descriptor: Dotted
                    {n: mstrmojo.desc(2261), v: 7},        //Descriptor: Hair
                    {n: mstrmojo.desc(2262), v: 1},        //Descriptor: Thin
                    {n: mstrmojo.desc(2264), v: 5},        //Descriptor: Thick
                    {n: mstrmojo.desc(2265), v:6}           //Descriptor: Double
    ],
    
    /**
     * Extract source format setting properties which exist in default format into target format
     *  @param sf Source format
     *  @param tf Target format
     *  @param defaultFormat The default format to compare to
     * @return
     */
    extractModel: function(sf, tf, defaultFormat){
       var dftFmt = defaultFormat || this.DefaultFormat;
        for (var ps in sf) {
            //Property set
            var sfps = sf[ps];
            
            if (!sfps.attachEventListener) {
                //not observalbe, just save it
                if (!_H.isEmpty(sfps)) {
                    tf[ps] = sfps;
                }
            } else { 
                //Observalbe, save only those defined in DefaultFormat
                for (var p in sfps) {
                    if (dftFmt[ps] && dftFmt[ps][p]) {
                        if (!tf[ps]) {
                            tf[ps]=  {};
                        }
                        tf[ps][p] = sfps[p];
                    }
                }
            }
        }
    },
    /**
     * Generate a standard format setting model, compared to default, if it does not have certain property set 
     * make an empty one. And make sure each property object is observable.
     * @param fm Format model
     * @param defaultFormat The default format to compare to
     * @return fm 
     */
    getStandardFormat: function(fm, defaultFormat){
        var df = mstrmojo.hash.clone(defaultFormat || this.DefaultFormat);
        //prepare current format - if it does not have certain property set, make an empty one.
        fm = fm || {};
        for (var ps in df) {
            fm[ps] = fm[ps] || {};
        }
                         
        for (var ps in fm) {
            if (!fm[ps].attachEventListener) {
                fm[ps] = mstrmojo.hash.make(fm[ps], mstrmojo.Obj);
            }
        }
        
        return fm;
    },
    
    
    /**
     * Save source format mode into target model, according to map array.
     * @param sm Source model
     * @param tm Target model
     * @param map The model format setting object name list, eg. ['header_format', 'grid_format']
     * @param defaultFormat The default format to compare to
     * @return 
     */
    saveFormatModel: function(sm, tm, map, defaultFormat) {
        var df = defaultFormat || this.DefaultFormat;
        for (var j =0 ; j < map.length; j++ ) {
            var which = map[j],
            tf = tm[which] || null,
            sf = sm[which];

            if (typeof sf === 'undefined' ) {//decide if delete tm.header_format
                delete tm[which];
                continue;
            }
            
            for (var ps in df) {
                var PS = df[ps];
                
                if(!tf && !sf || tf && !tf[ps] && !sf[ps]){//ps properties is all default and not changed.
                    continue;
                }
                
                for (var p in PS) {
                    if (typeof sf[ps]=== 'undefined' || sf[ps]==='' || sf[ps][p] === 'pru' || typeof sf[ps][p] == 'undefined') {
                        if (tf && tf[ps] && tf[ps][p] != null && tf[ps][p] != 'pru' ) { 
                            tf[ps][p] = 'pru';
                        }
                    } else { 
                        tf = tf || {};
                        tf[ps] = tf[ps] || {};
                        tf[ps][p] = sf[ps][p];
                    }
                }
            }
            
            //if there is some data, save it
            if (tf) {
                tm[which] = tf;
            }
        }
    }
};
    
})();