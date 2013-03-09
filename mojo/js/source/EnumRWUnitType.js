/**
 * Enumeration for the types of objects in an RW Document.
 * TO DO: lookup real enumerated values from Java source code.
 */
mstrmojo.EnumRWUnitType = {
	LAYOUT: 0,			//was: 1
	HEADER: 2,
	FOOTER: 3,
	SUBSECTION: 4,		//was: 3
	DETAILS: 5,
	PAGEHEADER: 6,
	PAGEFOOTER: 7,
	PANELSTACK: 8,
	PANEL: 9,

    
    // type*10 + displayMode
	GRID: 521,
	GRAPH: 522,
	GRIDGRAPH: 527,
    
	RECTANGLE: 101,
	IMAGE: 102,
	LINE: 105,
	TEXTFIELD: 106,
	HTMLCONTAINER: 107,
	SELECTOR: 111,
    ROUNDEDRECTANGLE: 112,
	VISUALIZATION: 114,
	MOJOVISUALIZATION: 115
};
