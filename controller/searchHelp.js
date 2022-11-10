sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"./designMode",
	"./messages",
	"ZPreEntryPeopleInfo/model/formatter"
], function(Object, Device, Filter, JSONModel,designMode, messages, formatter) {
	"use strict";

	return Object.extend("ZPreEntryPeopleInfo.controller.searchHelp", {
		formatter: formatter,

		constructor: function(oParentView) {
			this._oParentView = oParentView;
			this._oViewModel = this._oParentView.getModel();
			this._Controller = oParentView.getController();
			this._ResourceBundle = this._oParentView.getModel("i18n").getResourceBundle();
			this._ODataModel = this._oParentView.getModel("PreaEntry");
		},

		openDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this._oParentView.getId(), "ZPreEntryPeopleInfo.view.searchHelp", this);
				designMode.syncStyleClass(this._oParentView, this._oDialog);
				this._oParentView.addDependent(this._oDialog);
			}
			this._oViewModel.setProperty("/appProperties/f4panel", false);
			this._oDialog.open();

		},

		onSearch: function(evt) {
			var searchHelp = this._oViewModel.getProperty("/searchHelp"),
				VALUE1,
				KEY1;
				
			if (searchHelp.KEY1 !== '') {
				KEY1 = searchHelp.KEY1;
				this._oViewModel.setProperty("/searchHelp/Note1", KEY1);
			}				
			if (searchHelp.VALUE1 !== '') {
				VALUE1 = searchHelp.VALUE1;
				this._oViewModel.setProperty("/searchHelp/Note1", VALUE1);
			}
			var oFilters = [];
			var sUrl = "/ZSEARCH_HELPSet";
			var that = this;
			oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, this._oViewModel.getProperty("/appProperties/fcode")));
			if(searchHelp.KEY1 !== ''){
				oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, KEY1));
			}
			if(searchHelp.VALUE1 !== ''){
				oFilters.push(new Filter("VALUE1", sap.ui.model.FilterOperator.EQ, VALUE1));
			}			
			this._ODataModel.read(sUrl,{ //
				filters: oFilters,
				success: function(oData, oResponse) {

					var oJson = oData.results;
					that._oViewModel.setProperty("/searchHelp/f4h2r", oJson);
					that._oViewModel.setSizeLimit(that._oViewModel.getProperty("/searchHelp/EMaxrecords"));
				},
				error: function(error) {
					that.getView().setBusy(false);
				}
			});
		},

		handleSearch: function(evt) {
			var aFilters = [];
			var afilter = [];
			var sValue = evt.getParameter("newValue");
			afilter.push(new Filter("Note1", sap.ui.model.FilterOperator.Contains, sValue));
			afilter.push(new Filter("Zvkey1", sap.ui.model.FilterOperator.Contains, sValue));
			// var oFilter = new Filter("Note1",
			// sap.ui.model.FilterOperator.Contains, sValue);
			var allFilters = new Filter(afilter, false); // false为并集
			aFilters.push(allFilters);
			var oBinding = this._oParentView.byId("LCGZ").getBinding("items");
			oBinding.filter(aFilters);
		},

		getTx: function(matnr) {
			var sUrl = "/ntzbSet";
			var oFilter1 = new sap.ui.model.Filter("EMatnr", sap.ui.model.FilterOperator.EQ, matnr);
			var aFilters = [
				oFilter1
			];
			var mParameters = {
				filters: aFilters,
				success: function(oData, response) {
					var Arry = oData.results;
					this._oViewModel.setProperty("/txb", Arry);
				}.bind(this),
				error: function(oError) {
					messages.showODataErrorText(oError);
					oDialog.close();
				}.bind(this)
			};
			this._ODataModel.read(sUrl, mParameters);
		},

		pressEvent: function(evt) {
			this._oDialog.close();
			var context = evt.getSource().getBindingContext();
			var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			var oModelName = this._oViewModel.getProperty("/searchHelp/ModelName");
			var oPath = this._oViewModel.getProperty("/searchHelp/Path");
			var oTableData = this._oParentView.getModel(oModelName).oData;
			switch (fcode) {
				case "TAB_LAND1_0021"://国家地区
					oTableData[oPath].LAND1 = item.KEY1;
					oTableData[oPath].LANDX = item.VALUE1;
					// oTableData[oPath].ZHR_S_DESC = item.VALUE1;
					oTableData[oPath].ZHR_LXS = "";
					oTableData[oPath].ZHR_LXS_DESC = "";
					oTableData[oPath].ZHR_LXCS = "";
					oTableData[oPath].ZHR_LXCS_DESC = "";
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;
				case "TAB_LAND1_0006"://国家地区
					oTableData[oPath].LAND1 = item.KEY1;
					oTableData[oPath].LANDX = item.VALUE1;
					oTableData[oPath].ZHR_S = "";
					oTableData[oPath].ZHR_S_DESC = "";
					oTableData[oPath].ZHR_CS = "";
					oTableData[oPath].ZHR_CS_DESC = "";
					oTableData[oPath].ZHR_X = "";
					oTableData[oPath].ZHR_X_DESC = "";
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;	
				case "TAB_ZHR_S_0006"://省
					oTableData[oPath].ZHR_S = item.KEY1;
					oTableData[oPath].ZHR_S_DESC = item.VALUE1;
					oTableData[oPath].ZHR_CS = "";
					oTableData[oPath].ZHR_CS_DESC = "";
					oTableData[oPath].ZHR_X = "";
					oTableData[oPath].ZHR_X_DESC = "";
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;						
				case "TAB_ZHR_CS_0006"://城市/地区
					oTableData[oPath].ZHR_CS = item.KEY1;
					oTableData[oPath].ZHR_CS_DESC = item.VALUE1;
					oTableData[oPath].ZHR_X = "";
					oTableData[oPath].ZHR_X_DESC = "";
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;	
				case "TAB_ZHR_X_0006"://县
					oTableData[oPath].ZHR_X = item.KEY1;
					oTableData[oPath].ZHR_X_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;						
				case "GBLND": //国家地区
					oTableData[oPath].LAND1 = item.KEY1;
					oTableData[oPath].ZHR_S = "";
					oTableData[oPath].ZHR_S_DESC = "";
					oTableData[oPath].ZHR_CS = "";
					oTableData[oPath].ZHR_CS_DESC = "";
					oTableData[oPath].ZHR_X = "";
					oTableData[oPath].ZHR_X_DESC = "";
					// oTableData[oPath].ZHR_S_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;
				case "STATE": //省
					oTableData[oPath].ZHR_S = item.KEY1;
					oTableData[oPath].ZHR_S_DESC = item.VALUE1;
					oTableData[oPath].ZHR_CS = "";
					oTableData[oPath].ZHR_CS_DESC = "";
					oTableData[oPath].ZHR_X = "";
					oTableData[oPath].ZHR_X_DESC = "";
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;
				case "ORT01": //城市/地区
					oTableData[oPath].ZHR_CS = item.KEY1;
					oTableData[oPath].ZHR_CS_DESC = item.VALUE1;
					oTableData[oPath].ZHR_X = "";
					oTableData[oPath].ZHR_X_DESC = "";					
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;	
				case "ORT02": //县
					oTableData[oPath].ZHR_X = item.KEY1;
					oTableData[oPath].ZHR_X_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;
				case "TAB_ZSY_DE_LXS_0021": //县
					oTableData[oPath].ZHR_X = item.KEY1;
					oTableData[oPath].ZHR_X_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;		
				case "TAB_ZHR_LXS_0021":
					oTableData[oPath].ZHR_LXS = item.KEY1;
					oTableData[oPath].ZHR_LXS_DESC = item.VALUE1;
					oTableData[oPath].ZHR_LXCS = "";
					oTableData[oPath].ZHR_LXCS_DESC = "";					
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;	
				case "TAB_ZHR_LXCS_0021":
					oTableData[oPath].ZHR_LXCS = item.KEY1;
					oTableData[oPath].ZHR_LXCS_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;			
				case "TAB_ACAQU":
					oTableData[oPath].ACAQU = item.KEY1;
					oTableData[oPath].ACAQT = item.VALUE1;
					oTableData[oPath].SLABS = "";
					oTableData[oPath].STEXT = "";
					// oTableData[oPath].ZHR_LXCS_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;
				case "TAB_SLABS":
					oTableData[oPath].SLABS = item.KEY1;
					oTableData[oPath].STEXT = item.VALUE1;
					// oTableData[oPath].ZHR_LXCS_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;		
				case "TAB_QUCEC":
					oTableData[oPath].QUCEC = item.KEY1;
					oTableData[oPath].QUCET = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData),oModelName);
					break;			
			}

			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			this._Controller.setBusy(false);
		},

		pressSelectEvent: function(evt) {

			var context = evt.getSource().getBindingContext();
			var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			if (fcode == "IvSmenr") {
				// 返利报表-柜组
				this.multiSelect(fcode);
			}
		},

		// 柜组-多行选择
		multiSelect: function(fcode) {
			var String;
			var bsc;
			var selectsTab;

			if (fcode == "IvSmenr") {
				selectsTab = this._oParentView.byId("GuiZu").getSelectedItems();
				for (var i = 0; i < selectsTab.length; i++) {
					var v = selectsTab[i].getBindingContext();
					var item = v.getProperty(v.sPath);

					if (String) {
						String = String + "," + item.Zvkey1;
					} else {
						String = item.Zvkey1;
					}
				}
				this._oViewModel.setProperty("/rtrSet/IvSmenr", String, false);
			}

		},

		onSumbitAction: function() {
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			this.multiSelect(fcode);
			this._oDialog.close();
			var oTable = this._oParentView.byId("GuiZu");
			oTable.setMode(sap.m.ListMode.Delete);
			oTable.setMode(sap.m.ListMode.MultiSelect);
		},

		setFCVisible: function(f) {
			if (f == "IvSmenr" || f == "Monat" || f == "KhinrFA" || f == "KostlFA" || f == "IpGdsdeptFA") {
				return false;
			}
			return true;
		},

		onCancelAction: function() {
			this._oDialog.close();
			this._oViewModel.setProperty("/searchHelp/Zvkey1", "");
			this._oViewModel.setProperty("/searchHelp/Note1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			//this._oParentView.byId("Zvkey1_Note1").clear();
			this._Controller.setBusy(false);
		},

		onPostSuccess: function(oController) {
			oController.getEventBus().publish("ZPreEntryPeopleInfo", "postExecuted", oController);
		}
	});
});