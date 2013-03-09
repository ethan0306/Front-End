(function(){
    mstrmojo.requiresCls("mstrmojo.Box");

    /**
     * <p>A widget to display an Android specific Android Map.</p> 
     * 
     * This is intended to live inside an AndroidView widget as the contentChild.
     * 
     * @class
     * @extends mstrmojo.Box
     */
    mstrmojo.maps.InfoWindow = mstrmojo.declare(
        mstrmojo.Box,

        null,

        {            
            scriptClass: "mstrmojo.maps.InfoWindow",
            
            rowIndex : -1,
            
            init: function init(props){
                this._super(props);
            },

            start : function start(){
                this.render();
                this.update(this.rowIndex);
            },
            
            update : function update(rowIndex){
                this.rowIndex = rowIndex;
                var res = this.containerNode,
                innerHTML = '<table><tbody>' + 
                '<tr>' + 
                '<td colspan="2" class="androidMap-infoWindowTitle">'+ mapDataObj.getAttributeName(rowIndex) + '</td>' + 
                '</tr>';
                //Default font and background colors
                innerHTML += this.getMetricInfo();
                innerHTML += '</tbody></table>';
                res.innerHTML = innerHTML;
            },
            
            getMetricInfo : function getMetricInfo(){            
                // NOTE: Using eval() here to parse the metric values array did NOT work. eval() returned some quasi-array that was part object
                //          and part array, e.g.  metricData instanceof Array returned FALSE, typeof metricData === "object", length was a function, not a property.
                //          This is likely because the getMetricValues() method on the Java side returns a JSONArray.
                var metricData = JSON.parse(mapDataObj.getMetricValues(this.rowIndex).toString()),
                    res = '',
                    mdLen = metricData.length;
                                                        
                for(var i = 0; i < mdLen; i++){
                    var item = metricData[i]; 
                    if(item.ts == 4){
                        res += '<tr><td class="androidMap-infoWindowText"> '+ mapDataObj.getMetricName(i) +' </td><td><img src="' + item.v +'"></td></tr>';
                    }else{
                      //Default font and background colors
                      var fColor = 'black',
                          bColor = 'transparent';
                      
                      //If using thresholds, use the background and font color from the data
                      if(mapDataObj.useThresholds()){
                          fColor = mapDataObj.getThresholdColorRGB(item.fcti); //font color
                          bColor = mapDataObj.getThresholdColorRGB(item.bcti); //background color
                      }
                      res += '<tr><td class="androidMap-infoWindowText">'+ mapDataObj.getMetricName(i) +'</td><td style="background-color:'+ bColor +';color:'+ fColor +';">'+ item.v + '</td></tr>';
                    }
                }
                return res;
            }

        }
    );
})();