sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"./searchHelp",
	"ZPreEntryPeopleInfo/model/models",
	"ZPreEntryPeopleInfo/model/formatter",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	'sap/m/MessageToast',
	"sap/ui/core/routing/History",
	'sap/ui/core/util/File'
], function (BaseController, Controller, JSONModel, searchHelp, models, formatter, Filter, MessageBox, MessageToast, History, File) {
	"use strict";

	return BaseController.extend("ZPreEntryPeopleInfo.controller.BsHomePage", {
		formatter: formatter,

		onInit: function () {

			//alert(navigator.userAgent);
			// this.oPdfDialog = sap.ui.xmlfragment("ContractDialog", "ZPreEntryPeopleInfo.fragment.ShowPdfView", this);
			// this.oHtml = sap.ui.core.Fragment.byId("ContractDialog", "idFrame"); 
			this.oDataModelPreEntry = this.getOwnerComponent().getModel("PreaEntry");
			// this.InitCheckDialog.open();
			if (!this.oInitCheckDialog) {
				this.oInitCheckDialog = sap.ui.xmlfragment("InitCheckDialog", "ZPreEntryPeopleInfo.fragment.BsInitCheck", this);
				this.getView().addDependent(this.oInitCheckDialog);
			}
			this.oInitCheckDialog.open();
			this._ResourceBundle = this.getModel("i18n").getResourceBundle();
			this._JSONModel = this.getModel();
		},
		onCancel: function () {
			this.oCardDialog.close();
		},
		onReread: function (oEvent) {
			if (!this.oInitCheckDialog) {
				this.oInitCheckDialog = sap.ui.xmlfragment("InitCheckDialog", "ZPreEntryPeopleInfo.fragment.BsInitCheck", this);
				this.getView().addDependent(this.oInitCheckDialog);
			}
			this.oInitCheckDialog.open();
		},
		onDialogConfirm: function (oEvent) {
			console.log(window.location.href);

			var that = this;

			// BusyDialog
			if (!this.oBusyDialog) {
				this.oBusyDialog = sap.ui.core.Fragment.byId("InitCheckDialog", "BusyDialog");
			}
			this.oBusyDialog.setVisible(true);
			this.oBusyDialog.open();

			var oEname = sap.ui.core.Fragment.byId("InitCheckDialog", "Ename").getValue(),
				oIdCard = sap.ui.core.Fragment.byId("InitCheckDialog", "Phone").getValue();

			// check name is not null
			if (oEname == "") {
				this.oBusyDialog.close();
				this.ShowMessage(this._ResourceBundle.getText("oCheckErrorEname"));
				return;
			}

			// check oIdCard in not null
			if (oIdCard == "") {
				this.oBusyDialog.close();
				this.ShowMessage(this._ResourceBundle.getText("oCheckErrorIdCard"));
				return;
			}

			var sPath = "/ZEntry_People_DeepSet";

			var oReturnTable = this.onInitData();
			oReturnTable.ZZAction = "EVALUATION_VERIFICATION";
			oReturnTable.Ename = oEname;
			oReturnTable.Phone = oIdCard;

			this.oDataModelPreEntry.setHeaders({
				"X-Requested-With": "X"
			});
			this.oDataModelPreEntry.create(sPath, oReturnTable, { //
				success: function (oData, oResponse) {
					that.oBusyDialog.close();
					if (oData.Type == 'E') {
						that.ShowMessage(oData.Message);
					} else {
						if (oData.ZIP_URL != "") {
							that.oInitCheckDialog.close();
							window.location.href = oData.ZIP_URL;
						}else{
							that.ShowMessage("不在测评名单中!");
						}
					}
				},
				error: function (oError) {
					that.oBusyDialog.close();
					that.oInitCheckDialog.close();
					that.ShowMessage(that._ResourceBundle.getText("ShowMessage"));
				}
			});

		},
		onDialogCancel: function (oEvent) {
			this.oInitCheckDialog.close();
			if (window.WeixinJSBridge != undefined) {
				window.WeixinJSBridge.call('closeWindow');
			}

			if (window.AlipayJSBridge != undefined) {
				window.AlipayJSBridge.call('closeWebview');
			}

			var browserName = navigator.appName;
			if (browserName == "Microsoft Internet Explorer") {
				window.opener = null;
				window.close();

			} else {
				window.location.href = "about:blank"; //关键是这句话
				window.close();
			}
		},
		ShowMessage: function (oMessage) {
			if (oMessage != "") {
				MessageBox.error(oMessage, {
					styleClass: "sapUiSizeCompact"
				});
				return;
			}
		}
	});
});