(function() {

	mstrmojo.requiresCls("mstrmojo.Obj","mstrmojo.AndroidInteractiveGridXtab","mstrmojo.DocInteractiveGridXtab","mstrmojo.VisTimeSeries","mstrmojo.DocVisTimeSeries","mstrmojo.VisMicroChart","mstrmojo.maps.AndroidRptMap","mstrmojo.maps.AndroidMapModel","mstrmojo.maps.AndroidDocMap","mstrmojo.ImageCarousel","mstrmojo.PhotoUploader","mstrmojo.VisMap","mstrmojo.VisChartLine");

	var ANDROID_VIS_LIST = {'MicroChartsVisualizationStyle':{'s':'MicroChartVisualizationDataStyle','c':'VisMicroChart'},'TimeSeriesAjaxVisualizationStyle':{'dc':'DocVisTimeSeries','s':'TimeSeriesVisualizationDataStyle','c':'VisTimeSeries'},'ImageViewerVisualizationStyle':{'s':'VisualizationDataStyle','c':'ImageCarousel'},'AndroidPhotoUploaderStyle':{'s':'VisualizationDataStyle','c':'PhotoUploader'},'LineChartAjaxVisualizationStyle':{'s':'LineChartVisualizationDataStyle','c':'VisChartLine'},'AndroidMapStyle':{'dc':'maps.AndroidDocMap','s':'MapVisualizationDataStyle','c':'maps.AndroidRptMap','m':'maps.AndroidMapModel'},'InteractiveGridAjaxVisualizationStyle':{'dc':'DocInteractiveGridXtab','s':'InteractiveGridDataStyle','c':'AndroidInteractiveGridXtab'},'ImageMapAjaxVisualizationStyle':{'s':'ImageMapVisualizationDataStyle','c':'VisMap'}};

	mstrmojo.AndroidVisList = mstrmojo.declare (

		// superclass
		mstrmojo.Obj,

		// mixins
		null,

		{
			scriptClass: 'mstrmojo.AndroidVisList'

		}
	);

		mstrmojo.AndroidVisList.getVis = function (styleName) {
			return ANDROID_VIS_LIST[styleName] || null;
		};
		mstrmojo.AndroidVisList.getVisClass = function(cls, defn) {
			if(defn.txi && defn.t === 115 /*Interactive Grid*/) {
				return mstrmojo.DynamicClassFactory.newComponent(cls, [mstrmojo._CanSupportTransaction, mstrmojo._IsEditableXtab]);
			} else {
				return cls;
			}
		};
}) ();
