/**
 * 
 */
(function(){
    mstrmojo.requiresCls("mstrmojo.HBox");
    
    var SEARCH_DELAY = 500; // 0.5 sec delay
    
    /**
     * This strategy will piggy back _delayStrategyTimer on each search view, 
     * since only one strategy exists in whole application... 
     * 
     * It uses searchFunc() on the search view to perform search
     */
    var delayStrategy = {
        onkeyup: function(sv, sp) {
            // if there is a timer on the VIEW, we need to cancel it
            var hndl = sv._searchTimer;
            if (hndl) {
                window.clearTimeout(hndl);
            }
            
            sv._searchTimer = window.setTimeout(function() {
                 // perform on-fly search
                 sv.searchFunc(sp);
                 // clear timer
                 delete sv._searchTimer;
            }, SEARCH_DELAY);
        },
        
        onEnter: function(sv, sp) {
            sv.searchFunc(sp);
        }
    };
    
    function raiseToSearchStrategy(methodName) {
        var editor = this.parent,
            ss = editor.searchStrategy;
        
        if (ss) {
            ss[methodName](editor, this.value);
        }
    }
    
    mstrmojo.android.AndroidSearchBox = mstrmojo.declare(
        mstrmojo.HBox,
        
        null,
        
        {
            /**
             * Search Pattern
             */
            searchPattern: null,
            
            /**
             * Search Result.
             * @type {WebElements}
             */
            searchResult: null,
            
            /**
             * Search strategy which decide what to do when search key typed in
             * 
             * One strategy shared by all views
             */
            searchStrategy: delayStrategy,
            
            /**
             * Basic browse configuration, which will be kept during search.
             * @see browseConfig property in WebElements.
             */
            browseConfig: null,
            
            /**
             * The function for search. Anyone uses this widget, should set up this function to perform real search
             * 
             * @param {String} searchNameParameter The pattern to search for. 
             */
            searchFunc: mstrmojo.emptyFn,
            
            /**
             * Default implementation of clearSearch is to wipe out search result
             */
            clearSearch: function(){
                this.set('searchResult', null);
            },
            
            /*
            onSearchPatternChange: function() {
                var spn = this.children[0].searchPattern;
                if (spn) {
                    spn.set('value', this.searchPattern || '');
                }
            },*/
            
            setPattern: function setPattern(value) {
                this.textBox.set('value', value);
                this.searchFunc(value);
            },
            
            children: [{
                  scriptClass: 'mstrmojo.TextBox',
                  
                  alias: 'textBox',
                  
                  onkeyup: function() {
                  //TQMS 510223, we disable auto search function for 921m.
                  //    raiseToSearchStrategy.call(this, 'onkeyup');
                  },
                  
                  onEnter: function() {
                      raiseToSearchStrategy.call(this, 'onEnter');
                  }
            }, {
                  scriptClass: 'mstrmojo.Button',
                  cssClass: 'srch c',
                  text: 'Clear', 
                  visible: false,
                  onclick: function(){
                      var parent = this.parent;
                      
                      // Clear the search field.
                      parent.children[0].set('value', '');
                      
                      // calling view's clearSearch() function
                      parent.parent.clearSearch();
                  }
            }]
        }
    );
}());