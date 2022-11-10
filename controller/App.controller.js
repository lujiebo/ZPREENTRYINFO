sap.ui.define([
	"./BaseController",
	"./designMode",
	"sap/ui/model/json/JSONModel"
], function(BaseController, designMode, JSONModel) {
	"use strict";

	return BaseController.extend("ZPreEntryPeopleInfo.controller.App", {
		onInit: function() {
			this.getView().addStyleClass(designMode.getCompactCozyClass());
		},

		onAfterRendering: function() {
			// if(window.location.hostname!="localhost"){
			// 	var oHC = this.getRouter().oHashChanger;
			// 	var sHash = oHC.privgetCurrentShellHash().hash;
			// 	var s = oHC.privstripLeadingHash(sHash).split("-")[0];
			// 	s = s && s === "Shell-home" ? null : s;
			// 	this.getRouter()._oRoutes[s] ? this.navTo(s) : null;				
			// }

		},

		getAppControl: function() {
			return this.byId("appNavContainer");
		}
	});
});