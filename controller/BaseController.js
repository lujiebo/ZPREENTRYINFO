sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/m/MessageBox"
], function(Controller, UIComponent, History, formatter, MessageBox) {
	"use strict";

	return Controller.extend("ZPreEntryPeopleInfo.controller.BaseController", {

		formatter: formatter,

		getEventBus: function() {
			return this.getOwnerComponent().getEventBus();
		},

		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},

		getRouterID: function() {
			var oHC = this.getRouter().oHashChanger;
			if (oHC.privgetCurrentShellHash) {
				var sHash = oHC.privgetCurrentShellHash().hash;
				var s = oHC.privstripLeadingHash(sHash).split("-")[0];
				s = s && s === "Shell-home" ? null : s;
				return s;
			}
		},

		navTo: function(sName) {
			sName == null ? null : this.getRouter().navTo(sName);
		},

		getModel: function(sName) {
			return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
		},

		getODataMetadata: function(sName) {
			if (sName == "") {
				return null;
			}
			var oMetaData = this.getModel().getProperty("/ODataMetadata");
			return oMetaData[sName];
		},

		getEntityTypeByName: function(sODataName, sEntityTypeName) {
			if (!this.getODataMetadata(sODataName)) {
				return null;
			}
			return this.getODataMetadata(sODataName)._getEntityTypeByName(sEntityTypeName);
		},

		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		setBusy: function(b) {
			this.getModel().setProperty("/appProperties/busy", b);
		},

		setbcode: function(v) {
			this.getModel().setProperty("/appProperties/bcode", v, false);
		},

		getbcode: function(v) {
			return this.getModel().getProperty("/appProperties/bcode");
		},

		setfcode: function(v) {
			this.getModel().setProperty("/appProperties/fcode", v, false);
		},
		// 获取fcode，即为id
		getfcode: function(oEvent, num) {
			if (num == undefined) {
				var sButId = oEvent.getParameter("id");
				var aButId = sButId.split("-");
				var iLast = parseInt(aButId.length) - 1;
				var sOP = aButId[iLast];
				return sOP;
			} else {
				var sButId = oEvent.getParameter("id");
				var aButId = sButId.split("-");
				var iLast = parseInt(aButId.length) - num;
				var sOP = aButId[iLast];
				return sOP;
			}

		},

		isError: function(oContext) {
			var iCounterE = oContext.getModel().getProperty("/messages/counterE");
			return iCounterE > 0 ? true : false;
		},

		openMessagePopover: function(oContext) {
			if (oContext._MessageButton && this.isError(oContext)) {
				oContext._MessageButton.firePress();
			}
		},

		updateObligatory: function() {
			var oObligatory = {};
			var aReturn = this.getModel().getProperty("/returns");
			for (var i = 0; i < aReturn.length; i++) {
				// 后端修改传入逻辑后删除该if逻辑 开始
				/*
				 * if (aReturn[i].MessageV1 == "" && aReturn[i].MessageV2 == "") {
				 * aReturn[i].MessageV1 = aReturn[i].Parameter +
				 * aReturn[i].Field; }
				 */
				// 后端修改传入逻辑后删除该if逻辑 结束
				if (aReturn[i].MessageV1 != "" && aReturn[i].Type == "E") {

					var oR = {
						Id: aReturn[i].Id,
						LogMsgNo: aReturn[i].LogMsgNo,
						LogNo: aReturn[i].LogNo,
						Message: aReturn[i].Message,
						MessageV1: aReturn[i].MessageV1,
						MessageV2: aReturn[i].MessageV2,
						MessageV3: aReturn[i].MessageV3,
						MessageV4: aReturn[i].MessageV4,
						Number: aReturn[i].Number,
						Row: aReturn[i].Row,
						System: aReturn[i].System
					};

					if (aReturn[i].MessageV2 != "") {
						if (!oObligatory[aReturn[i].MessageV1]) {
							oObligatory[aReturn[i].MessageV1] = {};
						}
						oObligatory[aReturn[i].MessageV1][aReturn[i].MessageV2] = oR;
					}

					if (aReturn[i].MessageV2 == "") {
						oObligatory[aReturn[i].MessageV1] = oR;
					}

				}
			}
			this.getModel().setProperty("/verReturn", oObligatory, false);

		},

		clearInputRequiredErrorStatus: function(oEvent) {
			var sRootPath = "/verReturn";
			var sPath = oEvent.getSource().getBinding("valueState").sPath;
			if (sPath == "") {
				var aBindings = oEvent.getSource().getBinding("valueState").aBindings;
				sPath = aBindings[0].sPath + "/" + aBindings[1].oValue;
			}
			var oVerReturn = this._JSONModel.getProperty(sRootPath);
			sPath = sPath.replace(sRootPath + "/", "");
			var aKey = sPath.split("/", 2);
			if (aKey.length == 1) {
				delete oVerReturn[aKey[0]];
			}
			if (aKey.length == 2) {
				delete oVerReturn[aKey[0]][aKey[1]];
				// 表格中错误状态无法自动置空，需强制清理
				oEvent.getSource().setValueState("None");
			}
			this._JSONModel.setProperty(sRootPath, oVerReturn, false);
		},

		getPage: function() {
			var oView = this.getView();
			if (oView.getMetadata()._sClassName != "sap.ui.core.mvc.XMLView") {
				return null;
			}
			if (!oView.getContent() || oView.getContent().length == 0) {
				return null;
			}
			if (oView.getContent()[0].getMetadata()._sClassName != "sap.m.Page") {
				return null;
			}
			return oView.getContent()[0];
		},

		createGUID: function() {
			var g = "";
			var i = 32;
			while (i--) {
				g += Math.floor(Math.random() * 16.0).toString(16);
			}
			return g;
		},

		clone: function(obj, sub) {
			var o;
			if (obj.constructor == Object) {
				o = new obj.constructor();
			} else {
				o = new obj.constructor(obj.valueOf());
			}
			for (var key in obj) {
				if (o[key] != obj[key]) {
					if (typeof(obj[key]) == 'object') {
						o[key] = this.clone(obj[key]);
					} else {
						o[key] = obj[key];
					}
				}
			}
			o.toString = obj.toString;
			o.valueOf = obj.valueOf;
			return o;
		},

		onNavBack: function() {
			if (History.getInstance().getPreviousHash() !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("", {}, true);
			}
		},
		setBarcodeInputFocus: function() {
			setTimeout(function() {
				var o = $("input[type='search']");
				if (o && o[0]) {
					o[0].focus();
				}
			}, 500);
		},

		setBCFocus: function(v) {
			v.getFocusDomRef().focus();
				// var o = $("input[id=v]");
				// if (o && o[0]) {
				// o[0].focus();
				// }
		},
		setInputFocus: function(v) {
			var o = $("input[type='Number']");
			if (o && o[v]) {
				o[v].focus();
			}
		},
		generateMixed: function(n) {
			var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
				'Y', 'Z'
			];
			var res = "";
			for (var i = 0; i < n; i++) {
				var id = Math.ceil(Math.random() * 35);
				res += chars[id];
			}
			return res;
		},
		GetonInit: function() {
			var Kcdbh = this._JSONModel.getProperty("/Kcdbh");
			var fpaSet = this._JSONModel.getProperty("/fpaSet");
			var userSet = this._JSONModel.getProperty("/userSet");
			var sUrl = "/CheckAuthSet";
			var oFilter1 = new sap.ui.model.Filter("Bname", sap.ui.model.FilterOperator.EQ, userSet.id);
			var aFilters = [
				oFilter1
			];
			var mParameters = {
				filters: aFilters,
				success: function(oData, response) {
					if (response.statusCode === 200) {
						var Arry = oData.results;
						if (Arry.length == 1) {
							Kcdbh.Werks = Arry[0].Werks;
							Kcdbh.Name1 = Arry[0].Name1;
							Kcdbh.Smenr = Arry[0].Smenr;
							Kcdbh.Xmetxt = Arry[0].Xmetxt;
							fpaSet.IpBukrs = Arry[0].Werks;
							fpaSet.Butxt = Arry[0].Name1;
						}
						this._JSONModel.setProperty("/Kcdbh", Kcdbh);
						this._JSONModel.setProperty("/fpaSet", fpaSet);

					}
				}.bind(this),
				error: function(oError) {
					messages.showError(oError);
					// this.setBusy( false );
					// oDialog.close();
				}.bind(this)
			};
			this._ODataModel.read(sUrl, mParameters);
		},
		createGesch: function(oEvent) {
			var GESCH = [{
				GESCH: '1',
				GESCH_desc: '男'
			}, {
				GESCH: '2',
				GESCH_desc: '女'
			}, {
				GESCH: '3',
				GESCH_desc: '其他'
			}];
			return GESCH;
		},
		createFileTable: function(oEvent) {
			var FileTable = [{
				FileType: '01',
				FileDesc: '身份证复印件'
			}, {
				FileType: '02',
				FileDesc: '毕业证复印件'
			}, {
				FileType: '03',
				FileDesc: '学位证复印件'
			}, {
				FileType: '04',
				FileDesc: '上家单位离职证明'
			}, {
				FileType: '05',
				FileDesc: '白底证件照片'
			}, {
				FileType: '06',
				FileDesc: '体检报告'
			}];
			return FileTable;
		},
		onInitData: function(oEvent) {
			var oReturnTable = {
				ZZAction: "",
				Ename: "",
				PCODE: "",
				Phone: "",
				Pernr: "",
				Type: "",
				Message: "",
				PhotoUrl: "",
				FILETYPE01MAX: "",
				FILETYPE02MAX: "",
				FILETYPE03MAX: "",
				FILETYPE04MAX: "",
				FILETYPE05MAX: "",
				FILETYPE06MAX: "",
				FILETYPE07MAX: "",
				FILETYPE08MAX: "",
				FILETYPE09MAX: "",
				FILETYPE10MAX: "",
				FILETYPE11MAX: "",
				navTo0002: [],
				navTo0006: [],
				navTo0185: [],
				navTo0021: [],
				navTo0022: [],
				navTo0023: [],
				navTo0105: [],
				navToDD07T: [],
				navtoT5R06: [],
				navToT517T: [],
				navToT7CNA3T: [],
				navToT7CNA4T: [],
				navToZYLX: [],
				navToT519T: [],
				navToT591S_0006: [],
				navToT591S_0021: [],
				navToT591S_0105: [],
				navToT005T: [],
				navToT005U: [],
				navToFile: [],
				navToZSY_TT_RDMB: [],
				navToSH_PCN_HUKOT: [],
				navToSTATE: [],
				navToCITY: [],
				navToORT01: [],
				navToZHR_MZ: [],
				navToT502T: [],
				navToT7CNAAT: [],
				navToT7CN5R: [],
				navTo3531: []
			};
			return oReturnTable;
		},
		onCheckCard: function(cardNum) {
			var reg = "^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$";
			return reg.test(cardNum);
		},
		ShowMessage: function(oMessage) {
			if (oMessage != "") {
				MessageBox.error(oMessage, {
					styleClass: "sapUiSizeCompact"
				});
				return;
			}
		},

		leadZero: function(num, length) {
			return (Array(length).join('0') + num).slice(-length);
		},
		formatDate: function(oDate) {
			if (!oDate) {
				return "";
			}
			return oDate.substr(0,4) + "-" + oDate.substr(4,2) + "-" + oDate.substr(6,2);
		},
		
		formatTime: function(oTime) {
			if (!oTime) {
				return "";
			}
			return oTime.substr(0,2) + ":" + oTime.substr(2,2) + ":" + oTime.substr(4,2);
		},
		openBusyDialog: function(oEvent) {
			// BusyDialog
			if (!this.oBusyDialog) {
				this.oBusyDialog = this.byId("BusyDialog");
			}
			this.oBusyDialog.setVisible(true);
			this.oBusyDialog.open();
		}	

	});
});