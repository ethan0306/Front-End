mstrmojo.android.EnumMenuOptions = mstrmojo.provide(
    "mstrmojo.android.EnumMenuOptions", {
        // Default menu options must be bitwise
        HOME: 1,
        SETTINGS: 2,
        HELP: 4,
        
        ALL: 255,    // constant that contains all default menu options enabled
        
        // End defalt menu options

        //Other options don't to be bitwise but they must not contains default option bits
        REFRESH:     0x100,
        FULL_SCREEN: 0x200,
        GROUP_BY:    0x300,
        PAGE_BY:     0x400,
        REPROMPT:    0x500,
        DELETE:      0x600,
        SEARCH:      0x700,
        SCAN:        0x800,
        MAP_ROADMAP: 0x900,
        MAP_SAT:     0xA00,
        MAP_HYBRID:  0xB00,
        MAP_TERRAIN: 0xC00,
        DOC_LAYOUTS: 0xD00
    });
