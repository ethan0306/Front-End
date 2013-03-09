(function(){
         
	 /*
	  * This method will convert the existing areaColor HashMap into a map from color to area Names
	  * 
	  * Ex: if the existing areaColor map contains the following map
	  * 
	  * {'VA' : 0xffffff, 'LA' : 0XFF00FF, 'MD' : 0XFFFFFF} 
	  * 
	  * This method will convert the above map into {0XFFFFFF :"'VA', 'MD'" , 0XFF00FF : 'LA'}
	  * 
	  * 
	  */
	 function transformAreaColorMap(areaColorMap)
	 {
	 	var colorAreaMap = {};
		
		if (!areaColorMap) {
			return null;
		}
		   
		var state, color;             
  	    for(state in areaColorMap)
		{
		   color = areaColorMap[state];
		   if(colorAreaMap[color])
		   {
		   	colorAreaMap[color] += ", '" + state + "'";
		   }
		   else{
		   	 colorAreaMap[color] = "'" + state + "'";
		   }		 	
		}
		
		return colorAreaMap;
	 }
     
    /**
     * A mixin for classes that will represent the fusion table layer drawn on the map
     * @class
     * @public
     */
    mstrmojo._HasColorCodedArea =         
        /**
         * @lends mstrmojo._HasColorCodedArea#
         */
    {
        _mixinName : 'mstrmojo._HasColorCodedArea',
        layer : null,
		highlightedLayer : null,
        areaColors : null,
        polyOptions : null,
        defaultPolyOption : null,
        areaCodeColumnName : null,
		totalColors : 0,
	    colorMap : null, //A Map that maps color to area code this map is used to count the noof distinct colors
         
        /**
         * Create the Fusion TableLayer object
         * 
         * 
         */
        createColorCodedArea: function createColorCodedArea(fusionTableId, geoColumnName, areaCodeColumnName,areaListToShow)
        {            			  
			  var whereClause = areaListToShow.join(","),  //construct the where clause
                  queryObject = { select: geoColumnName, from: fusionTableId};
	      
	      if(whereClause.length > 0) //if where clause is present then specify in the fusiontablelayer construction
	      {
	        queryObject.where = areaCodeColumnName + " IN (" + whereClause + ")";
	      }
              
              this.layer = new google.maps.FusionTablesLayer({
	    			       query: queryObject,
	    			       suppressInfoWindows : true
	    	                 });    
	      this.highlightedLayer = new google.maps.FusionTablesLayer({
	    			                    query: {
	    				                        select: geoColumnName,
	    				                          from: fusionTableId
	    			                           },
	    			                    suppressInfoWindows : true
	    	                        });                    
	      this.areaCodeColumnName = areaCodeColumnName;
        },
        
        
        addAreaColor : function addAreaColor(areaName, color)
        {			
          if(this.areaColors === null)
          {
             this.areaColors = {};
			 this.colorMap = {};
          }
          
	      this.areaColors[areaName] = color;
		  	          
	      if(!this.colorMap[color])	     //check here how many threshold colors are present
	      {
	        this.colorMap[color] = "'" + areaName + "'";
			this.totalColors++;
          }
          
        },
		
		resetAreaColors : function resetAreaColors()
		{
			 this.areaColors = {};
             this.colorMap = {};
			 this.totalColors = 0;
		},
		
		getColorCount : function getColorCount()
		{
          return this.totalColors; 
		},
        /*
        addPolygonOption : function addPolygonOption(color, polygonOption, isDefault)
        {
          
          if(isDefault != 'undefined' && isDefault)
          {
           this.defaultPolyOption = {};
           this.defaultPolyOption[color] = polygonOption;
           return;
          }
          
          if(this.polyOptions == null)
          {
             this.polyOptions = {};
          }          
          
          this.polyOptions[color] = polygonOption;        
        }, */
        
        showColorCodedArea : function showColorCodedArea(map)
        {
          if(this.layer === null)
          {
             return;
          }
          var stylesArr = [];

          if(this.defaultPolyOption === null)
          {
             stylesArr[0] = {	     	    	    	                      
			       polygonOptions: {	    	    	      	                         
						 fillColor: "#5a709c",
						 fillOpacity: 0.7,	    	    	    	    	                         
						 strokeColor: "#FFFFFF",
						 strokeWeight :1
						}
	    	              };
	  }
	  else 
	  {	     
	     stylesArr[0] = this.defaultPolyOption;
	  }
	  
	  var colorsMap = transformAreaColorMap(this.areaColors);  
	  if(colorsMap)
	  {
	     //now construct the styles array
             var  i = 1, stateColor;             
  	     for(stateColor in colorsMap)
	     {

		   var polyOption = { fillColor: stateColor, fillOpacity: 0.7};


		   stylesArr[i++] = {
				       where : this.areaCodeColumnName + " IN (" +colorsMap[stateColor]  + ")",	    					 
				       polygonOptions : polyOption
			            };


	     } 
	  }   
	   //set the styles on to the FusionTableLayer	     
	     
	      this.layer.set("styles",stylesArr);
	  
          this.layer.setMap(map);                    
        },
        
        addColorCodedAreaListener : function addColorCodedAreaListener(eventType, listenerFunction)
        {
          if (!this.layer) {
		  	return null;
		  } 
          var listenerIds = [];
		  listenerIds[0] = google.maps.event.addListener(this.layer, eventType, listenerFunction);
	      listenerIds[1] = google.maps.event.addListener(this.highlightedLayer, eventType, listenerFunction);
		  return listenerIds;
        },
	
	removeColorCodedAreaListener : function removeColorCodedAreaListener(listenerIds)
	{
	    if (!listenerIds) {
			return;
		}

	    google.maps.event.removeListener(listenerIds[0]);
	    google.maps.event.removeListener(listenerIds[1]);
        },
        
	highlightArea : function highlightArea(areasToHighlight)
	{
		this.highlightedLayer.setMap(null); //remove highlighting
		if (!areasToHighlight || areasToHighlight.length === 0) {
			return;
		}
		//construct the WHERE clause
		var i, areaList = areasToHighlight.join(",");
				
		this.highlightedLayer.query.where = this.areaCodeColumnName + " IN (" + areaList + ")";
		this.highlightedLayer.setMap(this.map);   
	}
	
         
    }; //mstrmojo._HasColorCodedArea
}//function
)();