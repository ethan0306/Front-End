(function(){

	mstrmojo.PickerButton = mstrmojo.declare(
		// superclass
		mstrmojo.HBox,
		// mixins
		null,
		// instance members
		{
			scriptClass: "mstrmojo.PickerButton",
			
			cssClass: "mstrmojo-PickerButton",
			
			cellCssClass: "mstrmojo-PickerButton-cell",
			
			enabled: true,

            postCreate: function(){
                this.children = [
				{
					scriptClass: "mstrmojo.Button",
					cssClass: 'mstrmojo-InteractiveButton',
					bindings: {
						title: "this.parent.title",
						iconClass: "this.parent.iconClass",
						selectedIndex: "this.parent.selectedIndex",
						enabled: "this.parent.enabled"
					},
					onclick: function(){
						this.parent.onchange();
					}
				},
				{
					scriptClass: "mstrmojo.DropDownButton",
					cssClass: "mstrmojo-PickerButton-DropDownButton",
					bindings: {
						enabled: "this.parent.enabled"
					},
					popupRef: {
						scriptClass: "mstrmojo.Popup",
						slot: "popupNode",
						cssClass: "mstrmojo-Menu",
						shadowNodeCssClass: "mstrmojo-Menu-shadow",
						contentNodeCssClass: "mstrmojo-Menu-content",
						autoCloses: false,
						locksHover: true,
						children: [
							{
								scriptClass: "mstrmojo.ListBox",
								itemCssClass: "mstrmojo-ListBox-item mstrmojo-InteractiveText",
								bindings: {
									itemDisplayField: "this.parent.opener.parent.itemDisplayField",
									itemIdField: "this.parent.opener.parent.itemIdField",
									items: "this.parent.opener.parent.items"
								},
								onchange: function(){
									if (this._closing) return;
									var idx = this.selectedIndex,
										dd = this.parent.opener;
									if ((idx >-1) && dd) {
										this._closing = true;
										dd.closePopup();
										dd.parent.selectedItem = this.selectedItem;
										dd.parent.selectedIndex = idx;
										dd.parent.onchange();
										this._closing = false;
									}
								}
							}								
						]
					}
				}];
			}
		}
	);

})();