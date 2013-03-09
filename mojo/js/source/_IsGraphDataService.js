/**
 * _IsGraphDataService.js
 * @author Jamshed Ghazi
 * Copyright 2012 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview <p>Mixin that provide the task calls shared between Report and Document Graphs.</p>
 * @version 1.0
 */
(function(){


	mstrmojo._IsGraphDataService = mstrmojo.provide(
			"mstrmojo._IsGraphDataService",

			/**
			 * @lends mstrmojo._IsGraphDataService
			 */
			{
				handleUserSingleTap: function handleUserSingleTap(sliceID, nodekey, x, y, selectable, callback) {
					if(mstrApp.onMobileDevice()) {
						mstrApp.serverRequest({
							taskId: 'handleUserSingleTap',
							sliceID: sliceID,
							nodekey: nodekey,
							x: x,
							y: y,
							selectable: selectable
						}, callback);
					}
				}

			});
}());
