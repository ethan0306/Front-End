/**
 * 
 */
mstrmojo.mstr.EnumExpressionType = {
    ExpressionReserved: 0,

    /** Specifies a generic expression type.
     Used on nodes which do not require an expression type.*/
    ExpressionGeneric: 1,

    /** Specifies a single base form qualification
     (example: Customer(Last Name) Like "C*"). */
    FilterSingleBaseFormQual: 2,

    /** Specifies a multy base form qualification */
    FilterMultiBaseFormQual: 3,

    /** Specifies a joint form qualification */
    FilterJointFormQual: 4,

    /** Specifies a list qualification.
     Used in attribute qualification which use an elements list node.*/
    FilterListQual: 5,

    /** Specifies a list qualification involving an attribute form
     (example: Customer(Last Name) In ("Jacobson", "Jones") */
    FilterListFormQual: 6,

    /** Specifies a joint list qualification */
    FilterJointListQual: 7,

    /** Specifies a joint list qualification involving attribute forms */
    FilterJointListFormQual: 8,

    /**
     * Specifies a single base form expression qualification.  This is generally when two attribute
     * forms are compared to each other in the qualification.
     */
    FilterSingleBaseFormExpression: 9,

    /** Specifies a single metric qualification (example: Sales  > 100).*/
    FilterSingleMetricQual: 10,

    /** Specifies a qualification on multiple metrics.*/
    FilterMultiMetricQual: 11,

    /** Specifies a metric expression qualification (example: M1 > M2).*/
    FilterMetricExpression: 12,

    /**
     * Specifies an embedded qualification.  This is generally used as the expression
     * type for a shortcut to another filter within an expression.
     */
    FilterEmbedQual: 13,

    /**
     * Specifies a branch qualification.  This is typically, though not always, an and, or, or
     * not node, for example, exp1 AND exp2.
     */
    FilterBranchQual: 14,

    /** Specifies a relationship qualification */
    FilterRelationshipQual: 15,

    /** Specifies an all attribute qualification */
    FilterAllAttributeQual: 16,

    /** Specifies an attribute ID qualification */
    FilterAttributeIDQual: 17,

    /** Specifies an attribute description qualification */
    FilterAttributeDESCQual: 18,

    /** Specifies an aggregate metric qualification */
    ExpressionAggMetric: 19,

    /** Specifies a banding qualification */
    ExpressionBanding: 20,

    /** Specifies a filter report qualification */
    FilterReportQual: 21,

    /** Specifies an expression prompt supporting SAP Variables 
     * @since MicroStrategy Web 8.0.1 
     */
    ExpressionMDXSAPVariable: 22,

    /**
     * @since MicroStrategy Web 9.0.0
     */
    ExpressionSQLQueryQual: 23, // Qualification in SQLQuery

    /**
     * @since MicroStrategy Web 9.0.0
     */
    ExpressionCanceledPrompt: 24, //

    /**
     * @since MicroStrategy Web 9.0.0
     */
    ExpressionElementList: 25, // List Derived element

    /**
     * @since MicroStrategy Web 9.0.0
     */
    ExpressionElementSingle: 26 // Single derived element

};

