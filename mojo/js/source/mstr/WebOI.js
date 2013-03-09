/**
 *  Model for MSTR WebObjectInfo
 *  
 *  Task call which returns information about a MSTR WebObjectInfo should try to pack its information
 *  using the same property names. So, that json object can be easily merged in this object.
 */
(function() {
   var objectNodeName = {
        1: "f", // EnumDSSXMLObjectTypes.DssXmlTypeFilter:

        2: "tm", // EnumDSSXMLObjectTypes.DssXmlTypeTemplate:

        3: "rd", // EnumDSSXMLObjectTypes.DssXmlTypeReportDefinition:

        4: "mt", // EnumDSSXMLObjectTypes.DssXmlTypeMetric:

        7: "amt", // EnumDSSXMLObjectTypes.DssXmlTypeAggMetric:

        8: "fd", // EnumDSSXMLObjectTypes.DssXmlTypeFolder:

        10: "p", // EnumDSSXMLObjectTypes.DssXmlTypePrompt:

        11: "fun", // EnumDSSXMLObjectTypes.DssXmlTypeFunction:

        12: "at", // EnumDSSXMLObjectTypes.DssXmlTypeAttribute:

//        case EnumDSSXMLObjectTypes.DssXmlTypeFact:
//            return "fc";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDimension:
//            return "dm";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeTable:
//            return "tb";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeFactGroup:
//            return "fcg";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeShortcut:
//            return "shct";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeResolution:
//            return "rsl";
//
        21: "fm" //case EnumDSSXMLObjectTypes.DssXmlTypeAttributeForm:
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeSchema:
//            return "sch";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeCatalog:
//            return "ctg";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeCatalogDefn:
//            return "ctgd";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeColumn:
//            return "c";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypePropertySet:
//            return "prst";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDBRole:
//            return "dbr";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDBLogin:
//            return "dbl";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDBConnection:
//            return "dbc";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeProject:
//            return "pj";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeServerDef:
//            return "svrd";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeUser:
//            return "u";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeConfiguration:
//            return "cfg";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeRequest:
//            return "req";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeScript:
//            return "scr";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeSearch:
//            return "so";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeSearchFolder:
//            return "sf";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeFunctionPackageDefinition:
//            return "fpd";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeRole:
//            return "role";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeSecurityRole:
//            return "scrl";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeStyle:
//            return "sty";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeFormat:
//            return "fmt";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeConsolidation:
//            return "con";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeConsolidationElement:
//            return "ce";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeScheduleEvent:
//            return "schev";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeScheduleObject:
//            return "schob";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeScheduleTrigger:
//            return "schtr";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeLink:
//            return "lnk";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDbTable:
//            return "dbt";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeTableSource:
//            return "tbs";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDocumentDefinition:
//            return "dd";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDrillMap:
//            return "drmp";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeDBMS:
//            return "dbms";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeMDSecurityFilter:
//            return "mdsf";
//
//        case EnumDSSXMLObjectTypes.DssXmlTypeSubscriptionDevice:
//            return "device";
//            
//        default:
//            // TBD : future : log warning
//            return "resv";
//        }
    };
    function getObjectNodeName(objectType) {
    	return objectNodeName[objectType] || "resv";
    };
	mstrmojo.mstr.WebOI = mstrmojo.declare(
			// super class
			mstrmojo.Obj,
			// mixin
			null,
			// properties
			{
				/*
				 * DSSID for this object.
				 */
				did: '',
				/**
				 * Type of this object.
				 */
				t: 0,
				/**
				 * Subtype of this object.
				 */
				st: 0,
				/**
				 * Name of this object.
				 */
				n: '',
				/**
				 * Description of this object.
				 */
				desc: '',
				/**
				 * Abbreviation of this object.
				 */
				ab: '',
				/**
				 * ?????
				 */
				icp: '',
				/**
				 * XML representation of this object.
				 */
				xml: '',
				/**
				 * Returns the xml representing this object. (short format)
				 */
				getXML: function() {
					// for now, we just return the xml came from web server side.
					return this.xml || this.buildShortXML().toString();
				},
				buildShortXML: function(builder) {
					builder = builder || new mstrmojo.XMLBuilder();
			        builder.addChild(getObjectNodeName(this.t));
			        this.buildShortObjectAttributes(builder);
			        this.buildTypeSpecificShortXML(builder);
		            builder.closeElement();
		            return builder;
				},
				buildShortObjectAttributes: function(builder) {
			        builder.addAttribute("did", this.did);
			        builder.addAttribute("tp", this.t);
			        builder.addAttribute("stp", this.st);
			        builder.addAttribute("n", this.n);
				},
				buildTypeSpecificBody: function(builder) {
					// default impelementation does nothing
				},
				buildShortObjectElt: function(builder) {
			        builder.addChild(getObjectNodeName(this.t));
			        this.buildShortObjectAttributes(builder);
		            builder.closeElement();
				}
			}
	);
})();