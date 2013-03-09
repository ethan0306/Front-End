/**
 * Function Enumerations
 */
mstrmojo.mstr.EnumFunction = {

    /** Custom */
   FunctionCustom: -1,

    /** Reserved. */
   FunctionReserved: 0,

    /** Plus */
   FunctionPlus: 1,

    /** Minus */
   FunctionMinus: 2,

    /** Times */
   FunctionTimes: 3,

    /** Divide */
   FunctionDivide: 4,

    /** Unary minus */
   FunctionUnaryMinus: 5,

    /** Function for testing equality.  */
   FunctionEquals: 6,

    /** Function for testing nonequality. */
   FunctionNotEqual: 7,

    /** Greater than.  */
   FunctionGreater: 8,

    /** Less than.  */
   FunctionLess: 9,

    /** Greater than or equal to. */
   FunctionGreaterEqual: 10,

    /** Less than or equal to. */
   FunctionLessEqual: 11,

    /** Sum */
   FunctionSum: 12,

    /** Count */
   FunctionCount: 13,

    /** Average */
   FunctionAvg: 14,

    /** Minimum */
   FunctionMin: 15,

    /** Maximum */
   FunctionMax: 16,

    /** Between. */
   FunctionBetween: 17,

    /** Like (Generally used for string comparisons). */
   FunctionLike: 18,

    /** And */
   FunctionAnd: 19,

    /** Or */
   FunctionOr: 20,

    /** Not */
   FunctionNot: 21,

    /** The in operator.  */
   FunctionIn: 22,

    /** Rank qualification. */
   FunctionRank: 23,

    /** Absolute value */
   FunctionAbs: 24,

    /** Running sum */
   FunctionRunningSum: 25,

    /** Running Average */
   FunctionRunningAvg: 26,

    /** Moving sum */
   FunctionMovingSum: 28,

    /** Moving average */
   FunctionMovingAvg: 27,

    /** Product */
   FunctionProduct: 29,

    /** Median */
   FunctionMedian: 30,

    /** Mode */
   FunctionMode: 31,

    /** Standard deviation */
   FunctionStdev: 32,

    /** Variance */
   FunctionVar: 33,

    /** Geomin */
   FunctionGeomean: 34,

    /** Enhanced equal */
   FunctionEqualEnhanced: 35,

    /** Enhanced not equal */
   FunctionNotEqualEnhanced: 36,

    /** Enhanced greater or equal */
   FunctionGreaterEqualEnhanced: 37,

    /** Enhanced less or equal */
   FunctionLessEqualEnhanced: 38,

    /** Enhanced between */
   FunctionBetweenEnhanced: 39,

    /** Banding */
   FunctionBanding: 40,

    /** C-banding */
   FunctionBandingC: 41,

    /** P-banding */
   FunctionBandingP: 42,

    /** Not like. */
   FunctionNotLike: 43,

    /** Not between. */
   FunctionNotBetween: 44,

    /** Intersect */
   FunctionIntersect: 45,

    /** Intersect in */
   FunctionIntersectIn: 46,

    /** Null to zero */
   FunctionNullToZero: 47,

    /** Zero to null */
   FunctionZeroToNull: 48,

    /** Apply simple */
   FunctionApplySimple: 49,

    /** Apply aggregation */
   FunctionApplyAggregation: 50,

    /** Apply logic */
   FunctionApplyLogic: 51,

    /** Apply comparison */
   FunctionApplyComparison: 52,

    /** Apply Relative */
   FunctionApplyRelative: 53,

    /** Is null */
   FunctionIsNull: 54,

    /** Is not null */
   FunctionIsNotNull: 55,

    /** Upper case */
   FunctionUcase: 56,

    /** Not in. */
   FunctionNotIn: 57,

    /** N-tile */
   FunctionNTile: 58,

    /** Percentile */
   FunctionPercentile: 59,

    /** Moving maximum */
   FunctionMovingMax: 60,

    /** Moving minimum */
   FunctionMovingMin: 61,

    /** Moving Difference */
   FunctionMovingDifference: 62,

    /** Moving standard deviation */
   FunctionMovingStdev: 63,

    /** Exp. wgh. moving average */
   FunctionExpWghMovingAvg: 64,

    /** Moving count */
   FunctionMovingCount: 65,

    /** Running maximum */
   FunctionRunningMax: 66,

    /** Running Minimum */
   FunctionRunningMin: 67,

    /** Running standard deviation */
   FunctionRunningStdev: 68,

    /** Running count */
   FunctionRunningCount: 69,

    /** Exp. wgh. running average */
   FunctionExpWghRunningAvg: 70,

    /** Enhanced not between */
   FunctionNotBetweenEnhanced: 71,

    /** Concatenation */
   FunctionConcat: 72,

    /** In range */
   FunctionFirstInRange: 73,

    /** Last in range */
   FunctionLastInRange: 74,

    /** Value segment */
   FunctionValueSegment: 75,

    /** Contains */
   FunctionContains: 76,

    /** Begins with */
   FunctionBeginsWith: 77,

    /** Ends with */
   FunctionEndsWith: 78,

    /** Not contains */
   FunctionNotContains: 79,

    /** Not begins with */
   FunctionNotBeginsWith: 80,

    /** Not ends with */
   FunctionNotEndsWith: 81,

    /** Case */
   FunctionCase: 82,

    /** V-case */
   FunctionCaseV: 83,

    /** P-case */
   FunctionStdevP: 84,

    /** Running P-standard deviation */
   FunctionRunningStdevP: 85,

    /** Moving P-standard deviation */
   FunctionMovingStdevP: 86,

    /** N-tile S */
   FunctionNTileS: 87,

    /** N-tile VS */
   FunctionNTileVS: 88,

    /** P-varience */
   FunctionVarP: 89,

    /** Current date */
   FunctionCurrentDate: 90,

    /** Day of month */
   FunctionDayOfMonth: 91,

    /** Day of week */
   FunctionDayOfWeek: 92,

    /** Day of year */
   FunctionDayOfYear: 93,

    /** Week */
   FunctionWeek: 94,

    /** Month */
   FunctionMonth: 95,

    /** Quarter */
   FunctionQuarter: 96,

    /** Year */
   FunctionYear: 97,

    /** Current date-time */
   FunctionCurrentDateTime: 98,

    /** Current time */
   FunctionCurrentTime: 99,

    /** Hour */
   FunctionHour: 100,

    /** Minute */
   FunctionMinute: 101,

    /** Second */
   FunctionSecond: 102,

    /** MilliSecond */
   FunctionMilliSecond: 103,

    /** No blank concatenation */
   FunctionConcatNoBlank: 104,

    /** Length */
   FunctionLength: 105,

    /** Lower */
   FunctionLower: 106,

    /** L-time */
   FunctionLTrim: 107,

    /** Position */
   FunctionPosition: 108,

    /** R-time */
   FunctionRTrim: 109,

    /** Substirng */
   FunctionSubStr: 110,

    /** Init cap */
   FunctionInitCap: 111,

    /** Trim */
   FunctionTrim: 112,

    /** Reght string */
   FunctionRightStr: 113,

    /** Left string */
   FunctionLeftStr: 114,

    /**
     * @since MicroStrategy Web 9.0.0
     */
   FunctionGreatest: 115,

    /**
     * @since MicroStrategy Web 9.0.0
     */
   FunctionLeast: 116,

    /**
     * @since MicroStrategy Web 9.0.0
     */
   FunctionAdd: 134,

    /**
     * @since MicroStrategy Web 9.0.0
     */
   FunctionAverage: 135,

    /**
     * @since MicroStrategy Web 9.0.0
     */
   FunctionMultiply: 136,

    /**
     * @since MicroStrategy Web 9.0.0
     */
   FunctionBandingM: 137,

   FunctionReservedLastOne: 138,

    /** Tuple */
   FunctionTuple: 1000
};

