/**
 * Model for MSTR expression
 */
(function() {
	mstrmojo.requiresCls(
			"mstrmojo.mstr.EnumFunction",
			"mstrmojo.mstr.EnumWebFunctionType",
			"mstrmojo.mstr.EnumExpressionType",
			"mstrmojo.mstr.EnumNodeType",
			"mstrmojo.mstr.EnumDataType",
			"mstrmojo.mstr.WebOperatorNode",
			"mstrmojo.mstr.WebFormShortcutNode",
			"mstrmojo.mstr.WebConstantNode",
			"mstrmojo.mstr.WebTimeNode"
			);
	var $F = mstrmojo.mstr.EnumFunction,
		$F_TP = mstrmojo.mstr.EnumWebFunctionType,
		$EXP_TP = mstrmojo.mstr.EnumExpressionType,
		$N_T = mstrmojo.mstr.EnumNodeType,
		$D_T = mstrmojo.mstr.EnumDataType;
	mstrmojo.mstr.WebExpression = mstrmojo.declare(
			// super class
			mstrmojo.Obj,
			// mixin
			null,
			// properties
			{
				scriptClass: 'mstrmojo.mstr.WebExpression',
				/**
				 * The current root node of the expression.  While this node's properties can
				 * be changed (for example, the function being applied), the actual root node cannot be replaced.
				 */
				rottNode: null,
				init: function(props) {
					if (!props) {
						props = {};
					}
					if (!props.rootNode) {
						props.rootNode = new mstrmojo.mstr.WebOperatorNode({
							exprType: $EXP_TP.FilterBranchQual,
							funcType: $F_TP.WebFunctionTypeGeneric,
							func: $F.FunctionAnd
						});
					}
					if (this._super) {
						this._super(props);
					}
				},
				/**
				 * Creates an operator node with the given expression type and function type, and appends it to
				 * the given node within the expression tree.
				 * @param expressionType The type of the subexpression rooted at the operator node,
				 * from {@link com.microstrategy.webapi.EnumDSSXMLExpressionType}.
				 * @param func The function to assign to the operator node, from {@link com.microstrategy.webapi.EnumDSSXMLFunction}.
				 * @param parent A {@link WebOperatorNode} object which will serve as the parent of the newly created
				 * operator node. If no parent node specified, then the new operator node will be appended under expression root node.
				 * @return The newly created node, of type {@link WebOperatorNode}.
				 */
				createOperatorNode: function createOperatorNode(expressionType, func, parent){
					if (!parent) {
						parent = this.rootNode;
					}
					var node = new mstrmojo.mstr.WebOperatorNode({exprType:expressionType});
					node.set('func', func);
					parent.appendChild(node);
					return node;
				},
				createFormShortcutNode:function createFormShortcutNode(/*WebOI*/attr, /*WebOI*/form, parent){
					if (!parent) {
						parent = this.rootNode;
					}
					// skip some sanity checking for now
					var node = new mstrmojo.mstr.WebFormShortcutNode({
						attribute: attr,
						form: form
					});
					parent.appendChild(node);
					return node;
				},
				createValueNode: function createValueNode(/*String*/value, /*int*/dataType, parent) {
					var node = null;
					switch (dataType) {
					case $D_T.DataTypeDate:
					case $D_T.DataTypeTime:
					case $D_T.DataTypeTimeStamp:
						return this.createTimeNode(value, parent);
					default: 
						return this.createConstantNode(value, dataType, parent);
					}
				},
				createConstantNode: function createConstantNode(/*String*/value, /*int*/dataType, parent) {
					if (!parent) {
						parent = this.rootNode;
					}
					var  node = new mstrmojo.mstr.WebConstantNode({
						value: value,
						type: dataType
					});
					parent.appendChild(node);
					return node;
				},
				/**
				 * Creates a {@link WebTimeNode} object.  This is used when creating a qualification
				 * on an attribute form with a time-based datatype.
				 * @param time The string representation of the time to use for the node.
				 * @param parent The node to append the newly created one to.
				 * @return The newly created {@link WebTimeNode} object.
				 */
				createTimeNode: function(time, parent){
					var node = new mstrmojo.mstr.WebTimeNode({
						value: time
					});
					if (!parent) {
						parent = this.rootNode;
					}
					parent.appendChild(node);
					return node;
				},
				newAQSubExpression: function(/*WebOI*/attr, /*WebOI*/ form, /*int*/ func, /*int*/dt, /*String*/value){
					if (func < 0) {
						func = $F.FunctionEquals;
					}
					var subExpr = this.createOperatorNode($EXP_TP.FilterSingleBaseFormQual, func),
						fmNode = this.createFormShortcutNode(attr, form, subExpr),
						valNode = this.createValueNode(value, dt, subExpr);
					return subExpr;
				},
				buildShortXML: function buildShortXML(builder) {
					builder.addChild('exp');
					var rt = this.rootNode;
					if (rt) {
						if (rt.exprType == $EXP_TP.FilterBranchQual
							&& rt.nodeType == $N_T.NodeOperator) {
							if (!rt.childNodes || !rt.childNodes.length) {
								//do nothing
							} else if (rt.childNodes.length == 1) {
								if (rt.func == $F.FunctionAnd || rt.func == $F.FunctionOr) {
									rt.childNodes[0].buildShortXML(builder);
								} else { // root has 1 child, but is not a branch qual of and/or
									rt.buildShortXML(builder);
								}
							} else { // root has more than 1 child node
								rt.buildShortXML(builder);
							}
						} else { // not branch qual/operator node
							rt.buildShortXML(builder);
						}
					}
					builder.closeElement(); // exp
				}
				
			}
			);
	
})();