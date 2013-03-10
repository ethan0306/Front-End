(function () {
    mstrmojo.requiresCls("mstrmojo.SuggestionList");

    mstrmojo.QB.SuggestionList = mstrmojo.declare(

        mstrmojo.SuggestionList,

        null,

        {
            scriptClass: 'mstrmojo.QB.SuggestionList',
            
            getItemMarkup: function (item, idx) {
               var opener = this.parent.opener;
               return '<div class="mstrmojo-suggest-text ' + ((opener && opener.item2textCss(item)) || '') + '">' +  item[this.itemField] + '</div><br>';
            },

            getItemProps: function getItemProps(item, idx) {
                return {};
            }
        }
    );
}());