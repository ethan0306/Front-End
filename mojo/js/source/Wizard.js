(function () {

    mstrmojo.requiresCls("mstrmojo.Container", "mstrmojo.HBox", "mstrmojo.Label", "mstrmojo.Button");
    mstrmojo.requiresDescs(221, 373, 1059);
    
    /**
     * if you want to define your own title bar, please use titleBar. Otherwise, use the default title bar 
     * by defining the 'title' variable
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.Wizard = mstrmojo.declare(

    //superclass
    mstrmojo.Container,

    //mixin
    null,

    /**
     * @lends mstrmojo.Wizard.prototype
     */
    {
        scriptClass: "mstrmojo.Wizard",
	
	/**
	 * the customized title bar widget. optional  
	 */
	titleBar: null,

	/**
	 * the title is required if use default title bar
	 */
        title: '&nbsp;',

        slides: {},

        currentSlide: null,
        startingSlide: null,

        model: new mstrmojo.Obj(),


        /**
         * mark string
         */
        markupString: '<div id="{@id}" class="mstrmojo-Wizard {@cssClass}">' + '<div class="{@titleCssClass}"></div>' + '<div class="mstrmojo-Wizard-content"></div>' + '</div>',

        /** 
         * mark slots
         */
        markupSlots: {

            /**
             * the title bar node
             */
            titleBarNode: function () {
                return this.domNode.firstChild;
            },

            /**
             * the container node for expend or collapse part
             */
            containerNode: function () {
                return this.domNode.lastChild;
            }
        },

        children: [{
            scriptClass: "mstrmojo.StackContainer",
            alias: "slidesStack",
            cssClass: "mstrmojo-Wizard-SlideContainer",
            slot: "containerNode"
        }, {
            scriptClass: "mstrmojo.HBox",
            alias: "buttons",
            cssText: "float:right",
            slot: "containerNode",
            children: [{
                scriptClass: "mstrmojo.Button",
                cssClass: "mstrmojo-Wizard-buttons",
                text: mstrmojo.desc(373, "Back"),
                alias: "backButton",
                onclick: function () {
                    this.parent.parent.onBackButtonClick();
                }
            }, {
                scriptClass: "mstrmojo.Button",
                cssClass: "mstrmojo-Wizard-buttons",
                text: mstrmojo.desc(1059, "Next"),
                alias: "nextButton",
                onclick: function () {
                    this.parent.parent.onNextButtonClick();
                }
            }, {
                scriptClass: "mstrmojo.Button",
                cssClass: "mstrmojo-Wizard-buttons",
                text: mstrmojo.desc(221, "Cancel"),
                alias: "cancelButton",
                onclick: function () {
                    this.parent.parent.onCancelButtonClick();
                }
            }]

        }],
        
        postCreate: function() {
            var w, tb = this.titleBar;
            if (tb) {
                w = mstrmojo.insert(tb);
            } 
            else {
                w = mstrmojo.insert({
		    scriptClass: "mstrmojo.Label",
		    cssClass: "mstrmojo-Wizard-title",
		    bindings: {
			text: "this.parent.title"
		    }
		});
            }
            w.set("parent", this);
            this.set("titleBar", w);
        },
        
        postBuildRendering: function() {    
            if (this._super) {
                this._super();
            }
            var w = this.titleBar;
            w.render();
            this.titleBarNode.appendChild(w.domNode);
        },        

        addSlide: function (w) {
            this.slides[w.name] = w;
            w.wizard = this;
            w.visible = false;

            this.slidesStack.addChildren(w, 0, false);
        },

        showSlide: function (name, isForward) {
            var w = this.slides[name];
            if (w) {
                if (isForward) {
                    w.displayingSlide();
                }
                this.slidesStack.set("selected", w);
                this.currentSlide = w;                
            }
        },

        onNextButtonClick: function () {
            try {
                if (this.currentSlide.aboutToGoNext()) {
                    this.showSlide(this.currentSlide.getNextSlide(), true);
                }
            } catch (err) {
                mstrmojo.alert(err);
            }
        },

        onBackButtonClick: function () {
            var prev = this.currentSlide.getPreviousSlide();
            this.showSlide(prev, (this.currentSlide.name === prev));
        },

        onCancelButtonClick: function () {
            this.showSlide(this.startingSlide, true);
        }


    });

}());