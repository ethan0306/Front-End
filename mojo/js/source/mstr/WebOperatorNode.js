/**
 * Model for Operator node in MSTR expression
 */
(function() {
	mstrmojo.requiresCls(
			"mstrmojo.mstr.EnumExpressionType",
			"mstrmojo.mstr.EnumNodeDimty",
			"mstrmojo.mstr.EnumFunction",
			"mstrmojo.mstr.EnumNodeType",
			"mstrmojo.mstr.EnumWebFunctionType",
			"mstrmojo.mstr.WebNode"
			);
	/** private */
	var $EXP_TP = mstrmojo.mstr.ExpressionType,
		$ND_DIM = mstrmojo.mstr.EnumNodeDimty,
		$F = mstrmojo.mstr.EnumFunction,
		$N_T = mstrmojo.mstr.EnumNodeType,
		$F_TP = mstrmojo.mstr.EnumWebFunctionType;
	
	var isMetricQualification = function(_expressionType) {
		return _expressionType == $EXP_TP.FilterSingleMetricQual 
		|| _expressionType == $EXP_TP.FilterMetricExpression
		|| _expressionType == $EXP_TP.FilterMultiMetricQual;
	};

	mstrmojo.mstr.WebOperatorNode = mstrmojo.declare(
			// super class
			mstrmojo.mstr.WebNode,
			// mixin
			null,
			// properties
			{
				scriptClass: 'mstrmojo.mstr.WebOperatorNode',
				nodeType: $N_T.NodeOperator,
				/**
				 * The function of an operator node, from {@link EnumFunction}, or {@link EnumWebMRPFunction} in
				 * the case of rank or percent nodes.
				 */
				func: $F.FunctionReserved,
				/**
				 * The function type of the operator node, from {@link EnumWebFunctionType}.
				 */
				funcType: $F_TP.WebFunctionTypeGeneric,
				property: '',
				onExprTypeChange: function(){
					if (isMetricQualification(this.exprType)){
						this.dimType = $ND_DIM.NodeDimtyUnspecified;
					}
				},
				on_set_func: function(n, v) {
					var ascending = false; ///???????????????????
					if (this.funcType == $F_TP.WebFunctionTypePercentQual ||
							this.funcType == $F_TP.WebFunctionTypeRankQual) {
								var mrpFunction = v;
								switch (mrpFunction) {
								case EnumWebMRPFunction.WebMRPFunctionTop:
									this.func = $F.FunctionLessEqual;
									this.property = "<pr ix=\"4\" v=\"0\"/>";
									break;

								case EnumWebMRPFunction.WebMRPFunctionBottom:
									this.func = $F.FunctionLessEqual;
									this.property = "<pr ix=\"4\" v=\"-1\"/>";
									break;

								case EnumWebMRPFunction.WebMRPFunctionBetween:
									this.func = $F.FunctionBetween;
									if (ascending) { //??????
										this.property = "";
									} else {
										this.property = "<pr ix=\"4\" v=\"0\"/>";
									}
									break;

								case EnumWebMRPFunction.WebMRPFunctionExcludeTop:
									this.func = $F.FunctionGreater;
									this.property = "<pr ix=\"4\" v=\"0\"/>";
									break;

								case EnumWebMRPFunction.WebMRPFunctionExcludeBottom:
									this.func = $F.FunctionGreater;
									this.property = "<pr ix=\"4\" v=\"-1\"/>";
									break;

								case EnumWebMRPFunction.WebMRPFunctionNotBetween:
									this.func = $F.FunctionNotBetween;
									if (ascending) { //// ????
										this.property = "";
									} else {
										this.property = "<pr ix=\"4\" v=\"0\"/>";
									}
									break;

								case EnumWebMRPFunction.WebMRPFunctionEquals:
									this.func = $F.FunctionEquals;
									this.property = "";
									break;

								case EnumWebMRPFunction.WebMRPFunctionDifferentFrom:
									this.func = $F.FunctionNotEqual;
									this.property = "";
									break;
								   
								case EnumWebMRPFunction.WebMRPFunctionBanding:
									this.func = $F.FunctionBanding;
									this.property = "<pr ix=\"4\" v=\"0\"/>";
									break;

								case EnumWebMRPFunction.WebMRPFunctionBandingC:
									this.func = $F.FunctionBandingC;
									this.property = "<pr ix=\"4\" v=\"0\"/>";
									break;
								
								case EnumWebMRPFunction.WebMRPFunctionBandingP:
									this.func = $F.FunctionBandingP;
									this.property = "<pr ix=\"4\" v=\"0\"/>";
									break;
								
								case EnumWebMRPFunction.WebMRPFunctionBandingM:
									this.func = $F.FunctionBandingM;
									this.property = "<pr ix=\"4\" v=\"0\"/>";
									break;

								default:
									// log error?
								}

								if (this.funcType == $F_TP.WebFunctionTypePercentQual) {
									this.property += "<pr ix=\"5\" v=\"0\"/>";
								} else {
									this.property += "<pr ix=\"5\" v=\"-1\"/>";
								}

								var childNode = null;

								if (this.childNodes && this.childNodes.length > 0) {
									childNode = this.childNodes[0];
								}
								if (childNode != null) {
									childNode.setPropertyStr(property);
								}
							} else {
								this.func = v;
							}
					
				},
				buildTypeSpecificShortXML: function buildTypeSpecificShortXML(builder) {
					builder.addChild("op").addAttribute("fnt", this.func).closeElement();
					var ppt = this.property;
					if (ppt) {
						builder.addChild("prs").addRawXML(ppt).closeElement();
					}
				}

			}
			);
})();