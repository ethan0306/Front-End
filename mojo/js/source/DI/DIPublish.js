(function(){
    mstrmojo.requiresCls();
    
    var list= new mstrmojo.List({
        cssClass: "mstrmojo-di",
        cssText:"padding-left: 50px; ",
        alias:"list",
        itemMarkup:    ' <div class="mstrmojo-di-bullet" style="paddidng-top: 20px;"  onclick="mstrmojo.all.DIPublish.sel()"><table cellspacing="0"><tr>'
                       +'<td  class="mstrmojo-di-{@icon}"> </td>'
                       +'<td style="vertical-align: top; padding-left:10px;"> <div style="font-size: 11pt; padding-bottom:5px;" >{@n}</div><div style="color:grey">{@desc}</div></td>'
                       +'</tr></table>'
                       + '</div>' ,
        items:[{t:12, icon:'report',  n:mstrmojo.desc(621)/*Create Report*/, desc:mstrmojo.desc(49)},
               {t:12, icon:'document', n:mstrmojo.desc(2918)/*Create Document*/, desc:'*Create an enterprise report, scorecard, or dashboard from scratch or from a template*'},
               {t:12, icon:'analysis', n:mstrmojo.desc(8042)/*Create Analysis*/, desc:'*Explore data visually and discover trends, patterns, relationships and outliers*'},
               {t:12, icon:'exit', n:'*Exit*'/*Exit*/, desc:'*You can use the imported data later in reports, documents or visual analysis. The data will remian in ths system indefinitely.*'}]
       
    });
    
    var DEFAULT_REPORT_ID = '8154998B41AE3328BBB70692605904E4';
    
    mstrmojo.DI.DIPublish = mstrmojo.declare(
        mstrmojo.Box,
        null,
        {
            scriptClass: "mstrmojo.DI.DIPublish",
            id: 'DIPublish',
            cssClass: 'mstrmojo-di-pub',
            model: null,
            
            children: [{
                // Title bar
                scriptClass: "mstrmojo.Label",
                cssClass: 'mstrmojo-di-sub-tb',
                text: mstrmojo.desc(172) //Publish
            },
            {
                // Content
                scriptClass: "mstrmojo.VBox",
                alias: 'content',
                cssClass: 'content',
                
                children: [{
                    scriptClass: "mstrmojo.Label",
                    cssClass: '',
                    text: '*You data file was imported successfully and is ready to be used within your project. Please select what you would like to do with the data now*'
                },
                list]
            }],
            
            sel: function sel() {
                var ix = this.content.list.selectedIndex,
                    um = microstrategy.updateManager,
                    ac = [],
                    bp = mstrmojo.App.name,
                    params = {};
                switch (ix) {
                case 0: 
                    ac.push(um.createActionObject(
                            null,
                            mstrUpdateManager.EDIT_IMPORT_REPORT, 
                            bp,
                            ["3155", "3138"], 
                            [this.model.cid, 2], 
                            []));
                    break;
                case 1:
                    ac.push(um.createActionObject(
                            null,
                            mstrUpdateManager.EDIT_IMPORT_RW, 
                            bp,
                            ["3001", "3017", "3115"], 
                            [DEFAULT_REPORT_ID, 1, 2], 
                            []));
                    ac.push(um.createActionObject(
                            null,
                            mstrUpdateManager.ADD_IMPORT_AS_SOURCE, 
                            bp + '.rwd.rwframe',
                            ["2048032", "2048033"], 
                            [this.model.cid, 3], 
                            []));
                    break;
                case 2:
                    ac.push(um.createActionObject(
                            null,
                            mstrUpdateManager.EDIT_IMPORT_RW, 
                            bp,
                            ["3017", "3001", "3115", "3163", "3158", "3007"], 
                            [0, this.model.cid, 1, 16, 2048, 3], 
                            []));                 
                    break;
                case 3:
                    ac.push(um.createActionObject(
                            null,
                            mstrUpdateManager.CLOSE, 
                            bp + '.' + mstrmojo.App.pageName,
                            ["3140"], 
                            [-1], 
                            []));
                    break;
                
                }
                um.add(ac, true);
                um.flushAndSubmitChanges();
            }
        }
    );
})();