(function(){
    
    function prevTextNode(node, include, stopNode){
        if(node.nodeType === 3 && include){
            return node;
        } else {//element or non-include text node
            var ns = (include && node.nodeType === 1 && node.lastChild) ? node.lastChild : prevSib(node, stopNode);
            return ns ? prevTextNodeIncluding(ns, stopNode) : null;
        }
    }
    
    function prevSib(node, stopNode){
        return (node === stopNode) ? null : (node.previousSibling || prevSib(node.parentNode, stopNode));
    }
    
    function prevTextNodeIncluding(node, stopNode){
        if(node === stopNode){
            return null;
        }
        if(node.nodeType === 3 && getTextContent(node)) {//non-empty text node
            return node;
        } else if(node.nodeType === 1 && node.lastChild){//element
            return prevTextNodeIncluding(node.lastChild);
        } else {//empty content or empty node
            return prevTextNodeIncluding(prevSib(node, stopNode));
        }
    }   
    
    
    function getTextContent(node){
        return node.textContent || node.nodeValue || node.innerText; 
    }
    
    function nextTextNode(node, include, stopNode){
        if(node.nodeType === 3 && include){
            return node;
        } else {//element or non-include text node
            var ns = (include && node.nodeType === 1 && node.firstChild) ? node.firstChild : nextSib(node, stopNode);
            return ns ? nextTextNodeIncluding(ns, stopNode) : null;
        }
    }
    
    function nextSib(node, stopNode){
        return (node === stopNode) ? null : (node.nextSibling || nextSib(node.parentNode, stopNode));
    }
        
    function nextTextNodeIncluding(node, stopNode){
        if(node === stopNode){
            return null;
        }
        if(node.nodeType === 3 && getTextContent(node)) {//non-empty text node
            return node;
        } else if(node.nodeType === 1 && node.firstChild){//element
            return nextTextNodeIncluding(node.firstChild);
        } else {//empty content or empty node
            return nextTextNodeIncluding(nextSib(node, stopNode));
        }
    }
    
    /**
     * mstrmojo.range contains couple utility functions that help retrieve and manage the selection/range of a document. 
     */
    mstrmojo.range = mstrmojo.provide(
                    "mstrmojo.range",
                    {
                        EDGE: {
                            EDGE_BEGIN: 1, 
                            EDGE_END: 2, 
                            EDGE_MIDDLE: -1
                        },

                        /**
                         * Return whether the offset position is at the node edge.  
                         */
                        getEdgeInfo: function getEdgeInfo(node, offset){
                            var l = 0, range;
                            if(node.nodeType === 1){
                                if(window.getSelection){
                                    range = document.createRange();
                                    range.selectNode(node);
                                    l = range.toString().length;
                                }else{
                                    range = document.body.createTextRange();
                                    range.moveToElementText(node);
                                    l = range.text.length;
                                }
                            } else {
                                l = getTextContent(node).length;
                            }
                            
                            //var l = (node.nodeType === 3) ? getTextContent(node).length : node.childNodes.length;
                            return offset === l ? this.EDGE.EDGE_END : (offset === 0 ? this.EDGE.EDGE_BEGIN : this.EDGE.EDGE_MIDDLE);
                        },
                        
                        
                        /**
                         * collapse the range and move it to the end of the node.
                         */
                        collapseOnNode: function collapseOnNode(node, toStart){
                            var selection = this.getSelection(),
                                range = this.getRange(); 
                            if(window.getSelection){
                                //selection.collapseToStart();//somehow FF needs this in order to refresh the selection                           
                                range.selectNodeContents(node);                     
                                range.collapse(toStart);
                                selection.removeAllRanges();
                                selection.addRange(range); 
                                //selection.collapseToStart();//somehow FF needs this in order to refresh the selection 
                            } else {
                                range.moveToElementText(node);
                                range.collapse(toStart);
                                range.select();
                            }
                        },            
                        
                        collapseOnTextNode: function collapseOnTextNode(node, offset){
                            var selection = this.getSelection(),
                                range = this.getRange(); 
                            if(window.getSelection){
                                //selection.collapseToStart();//somehow FF needs this in order to refresh the selection   
                                var tn = nextTextNode(node, true);
                                range.setStart(tn, offset);                    
                                range.collapse(true);
                                selection.removeAllRanges();
                                selection.addRange(range); 
                            } else {
                                range.moveToElementText(node);
                                range.collapse(true);
                                range.move('character', offset);
                                range.select();
                            }
                        },
                        
                        /**
                         * Return the info of current selection. It shall standardize the selection interfaces different between IE style and W3c style. 
                         * The returned info contained 3 parts information: a) collapsed or not; b) startContainer/endContainer(if not collapsed); 
                         * 3) startOffset/endOffset(if not collapsed). Note that startContainer and endContainer shall be text node. 
                         */
                        getRangeInfo: function getRangeInfo(){
                            var rInfo = null, 
                                selection,
                                range= this.getRange(),
                                range2;
                            if(window.getSelection){
                                
                                    var gos = function(r, c, start){
                                            var r2 = r.cloneRange();
                                            r2.collapse(start);
                                            r2.setStartBefore(c);
                                            return r2.toString().length;
                                        },
                                        sc = range.startContainer,
                                        so = range.startOffset;
                                    
                                    //if startContainer is element, reset the startOffset to be the text length offset, instead of child nodes offset
                                    if(sc.nodeType === 1){
                                        so = gos(range, sc, true);
                                    }
                                    
                                    rInfo = {collapsed: range.collapsed, startContainer: sc, startOffset: so};
                                    
                                    if(!range.collapsed){//not collapsed, add more info
                                        var ec = range.endContainer,
                                            eo = range.endOffset;
                                        if(ec.nodeType === 1){
                                            eo = gos(range,ec,false);
                                        }
                                        rInfo.endContainer = ec;
                                        rInfo.endOffset = eo;
                                    }
                                    rInfo.range = range;
                            } else {
                                var pe, range3,
                                    fo = function(r, start){
                                        var r2 = r.duplicate(),
                                            range2 = document.body.createTextRange(),
                                            pe;
                                        r2.collapse(start);
                                        pe  = r2.parentElement();
                                        range2.moveToElementText(pe);
                                        range2.setEndPoint('EndToStart', r2);
                                        return {container: pe, offset: range2.text.length};
                                    },
                                    si = fo(range, true),
                                    ei;
                                   

                                rInfo = {
                                         collapsed: (range.compareEndPoints("StartToEnd", range)===0), 
                                         startContainer: si.container, 
                                         startOffset: si.offset
                                         };

                                if (!rInfo.collapsed){
                                    ei = fo(range, false);
                                    rInfo.endContainer = ei.container;
                                    rInfo.endOffset = ei.offset;
                                }
                            }
                            return rInfo;
                        },
                        
                        
                        /**
                         * Whether to collapse the selection. 
                         */
                        collapse: function collapse(toStart){
                            if(window.getSelection){ 
                                var selection = this.getSelection();
                                if(toStart){
                                    selection.collapseToStart();
                                } else {
                                    selection.collapseToEnd();
                                }
                            } else {
                                var range = this.getRange();
                                range.collapse(toStart);
                                range.select();
                            }
                        },
                        
                        /**
                         * Select the whole node. The node shall be of an element. 
                         */
                        selectSingleNode: function selectSingleNode(node){
                            var selection = this.getSelection(),
                                range = this.getRange();    
                            if(window.getSelection){   
        /*                        var tn = this.nextTextNode(node, 0);
                                range.setStart(tn,0);
                                range.setEnd(tn,getTextContent(node).length);*/
                                range.selectNodeContents(node);
                                selection.removeAllRanges();
                                selection.addRange(range); 
                            } else {
                                range.moveToElementText(node);
                                range.select();
                            }
                        },
                        
                        /**
                         * Select multiple nodes, starting from 
                         */
                        selectMultipleNodes: function selectMultipleNodes(startContainer, startOffset, endContainer, endOffset){
                            var selection = this.getSelection(),
                                range = this.getRange();
                            if(window.getSelection){
                                range.setStart(startContainer,startOffset);
                                range.setEnd(endContainer,endOffset);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            } else {
                                //move start point to the right position
                                startContainer = (startContainer.nodeType === 3) ? startContainer.parentNode : startContainer;
                                    
                                range.moveToElementText(startContainer);
                                range.move('character', startOffset);
                                
                                //use another range to set the end point
                                endContainer = (endContainer.nodeType === 3) ? endContainer.parentNode: endContainer;
                                var range2 = document.body.createTextRange();
                                range2.moveToElementText(endContainer);
                                range2.move('character', endOffset);
                                range.setEndPoint('EndToStart', range2);
                                range.select();
                            }
                        },
                        
                        getSelection: function getSelection(){
                            if(window.getSelection){
                                return window.getSelection();
                            } else {
                                return document.selection;
                            }
                        },
                        
                        getRange: function getRange(){
                            if (window.getSelection){//all major browsers, except IE browsers before IE9
                                selection = window.getSelection();
                                if (selection.rangeCount>0){
                                    return selection.getRangeAt(0);
                                } else {
                                    return document.createRange(); //chrome lost range (rangeCount === 0) when the DOM is changed due to delete/insert
                                }
                            } else {
                                return document.selection.createRange();
                            }
                        }
                    }
               );
})();