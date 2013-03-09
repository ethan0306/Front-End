(function(){
    
    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.css",
            "mstrmojo.hash",
            "mstrmojo.TreeNode"
    );
    
   var _D = mstrmojo.dom;

   /**
    * This class extends from TreeNode and customizes couple behaviors, like allowing on-demand content request and incremental fetch/rendering.
    */
   mstrmojo.TreeBrowserNode = mstrmojo.declare(
       //superclass
       mstrmojo.TreeNode,
       //mixins
       null,
       {
          scriptClass: 'mstrmojo.TreeBrowserNode',
          
          markupString: '<li id="{@id}" class="mstrmojo-TreeNode {@cssClass}" style="{@cssText}" mstrAttach:mousedown,click,dblclick>'
              + '<div class="mstrmojo-TreeNode-div">'
                  + '<img class="mstrmojo-TreeNode-state" src="../images/1ptrans.gif" />'
                  + '<img class="mstrmojo-TreeNode-checkBox" src="../images/1ptrans.gif" />'
                  + '<span class="mstrmojo-TreeNode-text {@textCssClass}"></span>'
              + '</div>'
              + '<ul class="mstrmojo-TreeNode-itemsContainer">{@itemsHtml}</ul></li>',

           markupSlots: mstrmojo.hash.copy({
               checkBoxNode: function(){ return this.domNode.firstChild.childNodes[1];
               }
           }, mstrmojo.TreeNode.prototype.markupSlots),
               
           blockBegin: 1,
           
           allowUnlistedValues: false,
           
           //blockCount: 10, //all tree nodes shall share the same blockCount, that is the one from tree. 
           
           contentRetrieved: false,  
           
           onstateChange: function onstateChange(){           
               if(!this.contentRetrieved && (this.state == 1)){
                   this.set('items', [this.tree.loadingItemCreaterFunc()]);
                   this.tree.getContent(this, this.blockBegin);
               }               
           },
           
           toggleState: function toggleState(){
               if (this.state !== 2) {
                   this.set("state", this.state === 1 ? 0 : 1);
               }
           },
           
           preclick: function preclick(evt){
               _D.clearBrowserHighlights(evt.hWin); 
               return false;
           },
           
           predblclick: function predblclick(evt){
               _D.clearBrowserHighlights(evt.hWin);
               return false;
           }, 
           
           premousedown: function pmd(evt) {
              var D = mstrmojo.dom,
                   t = mstrmojo.dom.eventTarget(evt.hWin, evt.e),
                   tree = this.tree,
                   isLeaf = (this.state == 2),
                   icn = D.contains(
                           this.itemsContainerNode,
                           D.eventTarget(evt.hWin, evt.e),
                           true,
                           this.domNode),
                   toggleOnClick = (tree.branchClickPolicy == mstrmojo.TreeBrowserEnum.BRANCH_POLICY_TOGGLE);
              
               //do not bubble up to avoid selection              
               if(this.isSpecialNode() || !(t == this.checkBoxNode || (t == this.textNode && (isLeaf || !toggleOnClick)))){
                   D.stopPropogation(evt.hWin, evt.e);
               }
               
               if ((t == this.stateNode) || (t == this.textNode && !isLeaf && toggleOnClick)) {
                   if(!isLeaf) {
                       this.toggleState();
                   }
               }  else if(t == this.checkBoxNode || icn){
                   if(this._super){
                       this._super(evt);
                   }
               } else {//leaf and textNode
                   this.handleNodeClicked();
               }
           },
           
           isSpecialNode: function isSpecialNode(){
               var st = this.data && this.data.st;
               return (st < 0);
           },
           
           handleNodeClicked: function handleNodeClicked() {
               var tree = this.tree,
                   w = this.parent,
                   data = this.data;
               switch(data && data.st){
                   case '-4'://previous items
                       mstrmojo.css.addClass(this.textNode, ['loading']);
                       tree.getContent(w, w.blockBegin - tree.blockCount);
                       break;
                       
                   case '-3'://next items
                       mstrmojo.css.addClass(this.textNode, ['loading']);
                       tree.getContent(w, w.blockBegin + tree.blockCount);
                       break;
                       
                   case '-1'://loading
                   case '-2'://failed
                       //do nothing
                       break;   
                   default:
                       if(tree.handleNodeClicked){
                           tree.handleNodeClicked(data);
                       }
               }
           },
           
           init: function(props){
               this._super(props);
               this.set('state', this.tree.isBranch(this.data) ? 0 : 2); //branch node default to closed
           },
           
           postBuildRendering: function postBuildRendering(){
               if(this._super){
                   this._super();
               }
               var _handler = function(e){
                   _D.preventDefault(window, e || window.event); //We need this to remove highlights
                   return false;
               };
               
               //We need this to remove highlights in non-IE browser.
               _D.attachEvent(this.domNode, 'mousedown', _handler);
               
               //hide the checkBox if it is special nodes
               if(this.isSpecialNode() || this.tree.noCheckBox){
                   this.checkBoxNode.style.display = 'none';
               }
           }
       });
   
})();