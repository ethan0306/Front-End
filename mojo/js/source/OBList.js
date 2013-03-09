(function () {

	mstrmojo.requiresCls("mstrmojo.ListSelector","mstrmojo.List", "mstrmojo.string");

    /************************Private methods*********************************/
	
	mstrmojo.OBList = mstrmojo.declare(
		// superclass
		mstrmojo.List,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.OBList",
		
		/************************CSSVariables*************************************/	
			
			cssClass : "mstrmojo-OBList",
			itemClass : "mstrmojo-OBListItem",
			iconClass : 'mstrmojo-OBListItemIcon',
			textClass : 'mstrmojo-OBListItemText',
			iconCssPrefx : 'mstrmojo-OBIcon_',
			
		/************************Markup variables and methods*********************/ 
			itemMarkupFunction : function(item, index, me){
            	return '<div class="' + me.itemClass +'">' + 
            	           '<table cellspacing="0" cellpadding="0"><tbody><tr><td>' +
            		       me.getIcon(item) + 
            		   '</td><td>' +    
            		       '<div class="'+ me.textClass +'">'+ mstrmojo.string.htmlAngles(item.n) + '</div>'+
            		   '</td></tr></tbody></table>' +    
            	        '</div>';
	        },
	        
	        getIcon : function(item){
	            var t = item[this.itemType],
	                st = item[this.itemSubType],
	                tc = ' t' + t,     //css class for Object Type level
	                stc = (t == 1 || t == 3) ? ' st' + st : '',     //css class for Object subType level; Now only need this for 'Filter'
	                isc = item[this.itemISC]? 'class="mstrmojo-ListIcon isc"': '';  //css class for a shortcut object
	            return '<span class="mstrmojo-ListIcon ' + tc + stc + '">' +
	                        '<span ' + isc + '></span>' +
	                    '</span>';
	        },
			
		/************************Instance variables*******************************/
	        
	        listSelector: mstrmojo.ListSelector,
	        
	        selectionPolicy : 'reselect',
	        
	        itemType : 't',
	        
	        itemSubType : 'st',
	        
	        itemISC: 'isc' //is shortcut
	            
	        
		/************************Instance methods*********************************/
			
		}
	);
	
})();
