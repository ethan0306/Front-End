mstrmojo._ShowsStatus = mstrmojo.provide(
"mstrmojo._ShowsStatus",
{
    /**
     * Utility method on show the status bar while rendering children of a container. This implementation is abstract to some extent since it 
     * relies on the specific container implementations (that want to show status bar) to provide the client side layout currently. Towards that it therefore expects
     * the following rendering markup slots to be defined 
     * [1] _STATUS - slot for status bar. 
     * [2] _STATUS_TXT - slot for status bar text
     * [3] _STATUS_BAR - slot for status bar length
     * 
     * See markupString and markupSlot of Xtab.js & DocLayoutViewer.js for usage. 
     * 
     * ToDo - While we are reusing the status bar through the implementation below, we are still not reusing the HTML template (markup string & slots).  
     */
    showStatus: function shwSts(/*Boolean*/ show, /*String*/ txt, /*Integer*/ perc) {
        // Show render status indicator (if any).
        var el = this._STATUS;
        
        if (!this.hasRendered || !el) {
            return;
        }
        
        if (!show) {
            // Hide render status indicator (if any).
            if (this.showingStatus) {
                el.style.display = 'none';
            }
        } else {
            if (el) {
                // Set caption text.
                var zz = this._STATUS_TXT && (this._STATUS_TXT.innerHTML = txt || '');

                // Set progress bar length.
                zz = this._STATUS_BAR && (this._STATUS_BAR.style.width = (perc || 0) + '%');
                
                // optimization. We position the status bar only the first time. 
                if(!this.isStatusBarPositioned) {
                    el.style.top = Math.max((this.scrollboxHeight || 0) - 50, 12) + 'px';
                    this.isStatusBarPositioned = true;
                }

                if (!this.showingStatus) {
                    el.style.display = 'block';
                }
                
            }
        }
        // Record our new state.
        this.showingStatus = show;
    },
    
     updateStatus: function updSts(/*String*/ txt, /*Integer*/ perc) {
        this.showStatus(this.showingStatus, txt, perc);
    }
});