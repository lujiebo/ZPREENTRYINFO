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
], function(BaseController, Controller, JSONModel, searchHelp, models, formatter, Filter, MessageBox, MessageToast, History, File) {
	"use strict";

	return BaseController.extend("ZPreEntryPeopleInfo.controller.HomePage", {
		formatter: formatter,

		onInit: function() {

			//alert(navigator.userAgent);
			// this.oPdfDialog = sap.ui.xmlfragment("ContractDialog", "ZPreEntryPeopleInfo.fragment.ShowPdfView", this);
			// this.oHtml = sap.ui.core.Fragment.byId("ContractDialog", "idFrame");
			this.oDataModelPreEntry = this.getOwnerComponent().getModel("PreaEntry");
			// this.InitCheckDialog.open();
			if (!this.oInitCheckDialog) {
				this.oInitCheckDialog = sap.ui.xmlfragment("InitCheckDialog", "ZPreEntryPeopleInfo.fragment.InitCheck", this);
				this.getView().addDependent(this.oInitCheckDialog);
			}
			this.oInitCheckDialog.open();
			this._ResourceBundle = this.getModel("i18n").getResourceBundle();
			this._JSONModel = this.getModel();
			// drop
			if (window.location.hostname == "localhost") {
				var oDropData = {
					fileDrop: this.createFileTable() //文件
				};
				var oDropModel = new JSONModel(oDropData);
				this.getView().setModel(oDropModel, "oDropModel");
				oDropModel.setSizeLimit(9999);
			}
			this._get_csrf('ZSY_TT_PRE_FILESet');

			if (sap.ushell.services != undefined) {
				if (new sap.ushell.services.UserInfo().getId() == "1194668") {
					this.getView().byId("jokerOTB").setVisible(true);
				}
			}

		},
		onCard: function(oEvent) {
			if (!this.oCardDialog) {
				this.oCardDialog = sap.ui.xmlfragment("Card", "ZPreEntryPeopleInfo.fragment.Card", this);
				this.getView().addDependent(this.oCardDialog);
			}
			this.oCardDialog.open();
		},
		onCancel: function() {
			this.oCardDialog.close();
		},
		onReread: function(oEvent) {
			if (!this.oInitCheckDialog) {
				this.oInitCheckDialog = sap.ui.xmlfragment("InitCheckDialog", "ZPreEntryPeopleInfo.fragment.InitCheck", this);
				this.getView().addDependent(this.oInitCheckDialog);
			}
			this.oInitCheckDialog.open();
		},
		onDialogConfirm: function(oEvent) {
			var that = this;

			// BusyDialog
			if (!this.oBusyDialog) {
				this.oBusyDialog = sap.ui.core.Fragment.byId("InitCheckDialog", "BusyDialog");
			}
			this.oBusyDialog.setVisible(true);
			this.oBusyDialog.open();

			var oEname = sap.ui.core.Fragment.byId("InitCheckDialog", "Ename").getValue(),
				oPhone = sap.ui.core.Fragment.byId("InitCheckDialog", "Phone").getValue();

			// check name is not null
			if (oEname == "") {
				this.oBusyDialog.close();
				this.ShowMessage(this._ResourceBundle.getText("oCheckErrorEname"));
				return;
			}

			// check phone in not null
			if (oPhone == "") {
				this.oBusyDialog.close();
				this.ShowMessage(this._ResourceBundle.getText("oCheckErrorPhone"));
				return;
			}

			var sPath = "/ZEntry_People_DeepSet";

			var oReturnTable = this.onInitData();
			oReturnTable.ZZAction = "PEOPLE_VERIFICATION";
			oReturnTable.Ename = oEname;
			oReturnTable.Phone = oPhone;

			this.oDataModelPreEntry.setHeaders({
				"X-Requested-With": "X"
			});
			this.oDataModelPreEntry.create(sPath, oReturnTable, { //
				success: function(oData, oResponse) {
					that.oBusyDialog.close();
					if (oData.Type == 'E') {
						that.ShowMessage(oData.Message);
					} else {
						that.oInitCheckDialog.close();
						var oPersonInfo = oData.navTo0002.results[0];
						if (oPersonInfo.GBLND == "") {
							oPersonInfo.GBLND = "CN";
						}
						if (oData.PhotoUrl != "") {
							oPersonInfo.PhotoUrl = oData.PhotoUrl;
						} else {
							var sRootPath = jQuery.sap.getModulePath("ZPreEntryPeopleInfo");
							var oPath = sRootPath + "/img/PersonImage.png";
							oPersonInfo.PhotoUrl = oPath;
						}
						oPersonInfo.Pcode = oData.PCODE;
						that.PCODE = oData.PCODE;
						that.Ename = oData.Ename;
						that.Phone = oData.Phone;
						that.Pernr = oData.Pernr;
						window.oData = oData;
						that.FileType01Max = oData.FILETYPE01MAX;
						that.FileType02Max = oData.FILETYPE02MAX;
						that.FileType03Max = oData.FILETYPE03MAX;
						that.FileType04Max = oData.FILETYPE04MAX;
						that.FileType05Max = oData.FILETYPE05MAX;
						that.FileType06Max = oData.FILETYPE06MAX;
						that.FileType07Max = oData.FILETYPE07MAX;
						that.FileType08Max = oData.FILETYPE08MAX;
						that.FileType09Max = oData.FILETYPE09MAX;
						that.FileType10Max = oData.FILETYPE10MAX;
						that.FileType11Max = oData.FILETYPE11MAX;
						
						that.getView().setModel(new JSONModel(oPersonInfo), "PersonInfo");
						that.getView().setModel(new JSONModel(window.oData.navTo0185.results), "MyIdCard");
						that.getView().setModel(new JSONModel(window.oData.navTo0022.results), "Educational");
						that.getView().setModel(new JSONModel(window.oData.navToT7CNAAT.results), "Language");
						that.getView().setModel(new JSONModel(window.oData.navTo0023.results), "Work");
						that.getView().setModel(new JSONModel(window.oData.navTo0021.results), "Family");
						that.getView().setModel(new JSONModel(window.oData.navTo0006.results), "Address");
						that.getView().setModel(new JSONModel(window.oData.navTo0105.results), "Communication");
						that.getView().setModel(new JSONModel(window.oData.navTo3531.results), "Language");

						if (window.oData.navToFile.results != undefined) {
							var oFileArr = window.oData.navToFile.results;
							that.getView().setModel(new JSONModel([]), "MyFile");
							var oMyFileArr1 = [],
								oMyFileArr2 = [],
								oMyFileArr3 = [],
								oMyFileArr4 = [],
								oMyFileArr5 = [],
								oMyFileArr6 = [],
								oMyFileArr7 = [],
								oMyFileArr8 = [],
								oMyFileArr9 = [],
								oMyFileArr10 = [],
								oMyFileArr11 = [];

							for (var i = 0; i < oFileArr.length; i++) {
								switch (oFileArr[i].PRE_FILETYPE) {
									case "01":
										oMyFileArr1.push(oFileArr[i]);
										break;
									case "02":
										oMyFileArr2.push(oFileArr[i]);
										break;
									case "03":
										oMyFileArr3.push(oFileArr[i]);
										break;
									case "04":
										oMyFileArr4.push(oFileArr[i]);
										break;
									case "05":
										oMyFileArr5.push(oFileArr[i]);
										break;
									case "06":
										oMyFileArr6.push(oFileArr[i]);
										break;
									case "07":
										oMyFileArr7.push(oFileArr[i]);
										break;
									case "08":
										oMyFileArr8.push(oFileArr[i]);
										break;
									case "09":
										oMyFileArr9.push(oFileArr[i]);
										break;
									case "10":
										oMyFileArr10.push(oFileArr[i]);
										break;
									case "11":
										oMyFileArr11.push(oFileArr[i]);
										break;
								}
							}
							that.getView().setModel(new JSONModel(oMyFileArr1), "MyFile1");
							that.getView().setModel(new JSONModel(oMyFileArr2), "MyFile2");
							that.getView().setModel(new JSONModel(oMyFileArr3), "MyFile3");
							that.getView().setModel(new JSONModel(oMyFileArr4), "MyFile4");
							that.getView().setModel(new JSONModel(oMyFileArr5), "MyFile5");
							that.getView().setModel(new JSONModel(oMyFileArr6), "MyFile6");
							that.getView().setModel(new JSONModel(oMyFileArr7), "MyFile7");
							that.getView().setModel(new JSONModel(oMyFileArr8), "MyFile8");
							that.getView().setModel(new JSONModel(oMyFileArr9), "MyFile9");
							that.getView().setModel(new JSONModel(oMyFileArr10), "MyFile10");
							that.getView().setModel(new JSONModel(oMyFileArr11), "MyFile11");
						}

						// drop
						var oDropData = {
							ictypDrop: window.oData.navtoT5R06.results, //证件类别
							acaquDrop: window.oData.navToT7CNA4T.results, //学历
							zhr_zylxDrop: window.oData.navToZYLX.results, //专业类型
							slabsDrop: window.oData.navToT519T.results, //学位
							insmoDrop: window.oData.navToT7CNA3T.results, //学习类型
							famsaDrop: window.oData.navToT591S_0021.results, //称谓
							land1Drop: window.oData.navToT005T.results, //联系地址-国家
							zzstateDrop: that.changeZzstate(oPersonInfo.GBLND), //省
							zzCityDrop: that.changeZzCity(oPersonInfo.ZZSTATE), //市
							zzOrt01Drop: that.changeOrt01(oPersonInfo.ZZCITY), //县
							zHr_mzDrop: window.oData.navToZHR_MZ.results, //民族
							famstDrop: window.oData.navToT502T.results, //婚姻状况
							stateDrop: window.oData.navToT005U.results, //联系地址
							usrtyDrop: window.oData.navToT591S_0105.results, //通讯类型
							anssaDrop: window.oData.navToT591S_0006.results, //通讯类型
							hukotDrop: window.oData.navToSH_PCN_HUKOT.results, //户口所在地
							politicalDrop: window.oData.navToT7CN5R.results, //政治面貌
							languageDrop: window.oData.navTo3531.results, //外语
							fileDrop: that.createFileTable() //文件
						};
						var oDropModel = new JSONModel(oDropData);
						oDropModel.setSizeLimit(99999);
						that.getView().setModel(oDropModel, "oDropModel");

						// that.getView().byId()

						that.changeEditable0185();
					}
				},
				error: function(oError) {
					that.oBusyDialog.close();
					that.oInitCheckDialog.close();
					that.ShowMessage(that._ResourceBundle.getText("ShowMessage"));
				}
			});

		},
		onDialogCancel: function(oEvent) {
			this.oInitCheckDialog.close();
		},
		getReturnTable: function(ModelName) {
			switch (ModelName) {
				case 'MyIdCard':
					var oIdCard_WF = {
						ICTYP: "",
						ICNUM: "",
						USEFR: "",
						USETO: ""
					};
					return oIdCard_WF;
				case 'Educational':
					var oEducational_WF = {
						ZHR_RXRQ: "",
						BEGDA: "",
						INSTI: "",
						FACH3: "",
						ACAQU: "",
						ZHR_ZYLX: "",
						SLABS: "",
						INSMO: "",
						ACQID: "",
						ACCID: "",
						ACAQM: false
					};
					return oEducational_WF;
				case 'Family':
					var oFamily_WF = {
						FAMSA: "",
						FANAM: "",
						// GESCH: "",
						GBDAT: "",
						ZZGZDW: "",
						LAND1: "CN",
						LANDX: "中国",
						STATE: "",
						CITY1: "",
						ZHR_XXDZ: "",
						TELNR: "",
						ZHR_SFSYYG: false
					};
					return oFamily_WF;
				case 'Work':
					var oWork_WF = {
						BEGDA: "",
						ENDDA: "",
						ZZGZDW: "",
						ZHR_W: "",
						DEPTN: "",
						ZHR_DRZW: "",
						REFER: "",
						REFCO: ""
					};
					return oWork_WF;
				case 'Address':
					var oAddress_WF = {
						ANSSA: "",
						GBLND: this.getView().getModel("PersonInfo").oData.GBLND,
						ZHR_S: this.getView().getModel("PersonInfo").oData.ZZSTATE,
						ZHR_S_DESC: this.getView().byId("ZZSTATE").getSelectedItem() != null ? this.getView().byId("ZZSTATE").getSelectedItem()
							.mProperties.text : "",
						//this.getView().getModel("PersonInfo").oData.ZZSTATE_DESC,
						ZHR_CS: this.getView().getModel("PersonInfo").oData.ZZCITY,
						ZHR_CS_DESC: this.getView().byId("ZZCITY").getSelectedItem() != null ? this.getView().byId("ZZCITY").getSelectedItem()
							.mProperties.text : "",
						//this.getView().getModel("PersonInfo").oData.ZZCITY_DESC,
						ZHR_X: this.getView().getModel("PersonInfo").oData.ZZORT01,
						ZHR_X_DESC: this.getView().byId("ZZORT01").getSelectedItem() != null ? this.getView().byId("ZZORT01").getSelectedItem()
							.mProperties.text : "",
						//this.getView().getModel("PersonInfo").oData.ZZORT01_DESC,
						LAND1: this.getView().getModel("PersonInfo").oData.GBLND,
						LANDX: this.getView().byId("GBLND").getSelectedItem() != null ? this.getView().byId("GBLND").getSelectedItem()
							.mProperties.text : "",
						LOCAT: ""
					};
					return oAddress_WF;
				case 'Communication':
					var oCommunication_WF = {
						USRTY: "",
						USRID: ""
					};
					return oCommunication_WF;

				case 'Language':
					var oLanguage_WF = {
						// BEGDA: "", //开始日期
						// ENDDA: "", //结束日期
						QUCEC: "", //语言
						ZZZGMC: "" //证书名称
					};
					return oLanguage_WF;
			}
		},
		onNewItem: function(oEvent) {
			var oId = this.getfcode(oEvent),
				oTable = [],
				oTableRow,
				oTableModel,
				oModelName;

			switch (oId) {
				case 'newIdCard':
					oModelName = "MyIdCard";
					oTableRow = this.getReturnTable(oModelName);
					break;
				case 'newEducational':
					oModelName = "Educational";
					oTableRow = this.getReturnTable(oModelName);
					break;
				case 'newFamily':
					oModelName = "Family";
					oTableRow = this.getReturnTable(oModelName);
					break;
				case 'newWork':
					oModelName = "Work";
					oTableRow = this.getReturnTable(oModelName);
					break;
				case 'newAddress':
					oModelName = "Address";
					oTableRow = this.getReturnTable(oModelName);
					break;
				case 'newCommunication':
					oModelName = "Communication";
					oTableRow = this.getReturnTable(oModelName);
					break;
				case "newLanguage":
					oModelName = "Language";
					oTableRow = this.getReturnTable(oModelName);
					break;
			}

			oTableModel = this.getView().getModel(oModelName);
			if (oTableModel == undefined) {
				oTable.push(oTableRow);
				this.getView().setModel(new JSONModel(oTable), oModelName);
			} else {
				if (oTableModel.oData == undefined) {
					oTable.push(oTableRow);
				} else {
					oTable = oTableModel.oData;
					oTable.push(oTableRow);
				}
				this.getView().setModel(new JSONModel(oTable), oModelName);
			}
		},

		onDeleteItem: function(oEvent) {
			var oId = this.getfcode(oEvent),
				oTable,
				oTableData = [],
				oTableRow,
				oTableModel,
				oModelName,
				oSelectedItem,
				oDeleteData = [];

			switch (oId) {
				case 'deleteIdCard':
					oModelName = "MyIdCard";
					var oIdCard_WF = this.getReturnTable(oModelName);
					oTableRow = oIdCard_WF;
					break;
				case 'deleteEducational':
					oModelName = "Educational";
					var oIdCard_WF = this.getReturnTable(oModelName);
					break;
				case 'deleteFamily':
					oModelName = "Family";
					var oIdCard_WF = this.getReturnTable(oModelName);
					break;
				case 'deleteWork':
					oModelName = "Work";
					var oIdCard_WF = this.getReturnTable(oModelName);
					break;
				case 'deleteAddress':
					oModelName = "Address";
					var oIdCard_WF = this.getReturnTable(oModelName);
					break;
				case 'deleteCommunication':
					oModelName = "Communication";
					var oIdCard_WF = this.getReturnTable(oModelName);
					break;
				case "deleteLanguage":
					oModelName = "Language";
					var oLanguage_WF = this.getReturnTable(oModelName);
					break;
			}
			oTable = this.getView().byId(oModelName);
			oSelectedItem = oTable.getSelectedIndices();
			oTableModel = this.getView().getModel(oModelName);
			oTableData = oTableModel.oData;
			var oTableArray = oTable.getBinding("rows").oList;

			if (oSelectedItem.length > 0) {
				for (var i = oSelectedItem.length - 1; i >= 0; i--) {
					var oTableRow = oTableArray[oSelectedItem[i]];
					this.deleteItem(oId, oModelName, oTableRow, oTableData);
				}
			} else {
				this.ShowMessage(this._ResourceBundle.getText("oErrorWhenDelete"));
			}
			// if (oSelectedItem.length > 0) {
			// 	for (var i = 0; i < oSelectedItem.length; i++) {
			// 		oDeleteData.push(oTable.getBinding("rows").oList[oTable.getSelectedIndices()[i]]);
			// 		var oTableRow = oTable.getBinding("rows").oList[oTable.getSelectedIndices()[i]];
			// 		this.deleteItem(oId, oModelName, oTableRow, oTableData);
			// 	}
			// } else {
			// 	this.ShowMessage(this._ResourceBundle.getText("oErrorWhenDelete"));
			// }
		},
		deleteItem: function(oId, oModelName, oTableRow, oTableData) {
			switch (oId) {
				case 'deleteIdCard':
					var ICTYP = oTableRow.ICTYP,
						ICNUM = oTableRow.ICNUM;
					for (var j = 0; j < oTableData.length; j++) {
						if (ICTYP == oTableData[j].ICTYP && ICNUM == oTableData[j].ICNUM) {
							oTableData.splice(j, 1);
						}
					}
					break;
				case 'deleteEducational':
					var ZHR_RXRQ = oTableRow.ZHR_RXRQ,
						BEGDA = oTableRow.BEGDA;
					for (var j = 0; j < oTableData.length; j++) {
						if (ZHR_RXRQ == oTableData[j].ZHR_RXRQ && BEGDA == oTableData[j].BEGDA) {
							oTableData.splice(j, 1);
						}
					}
					break;
				case 'deleteFamily':
					var FAMSA = oTableRow.FAMSA,
						FANAM = oTableRow.FANAM;
					for (var j = 0; j < oTableData.length; j++) {
						if (FAMSA == oTableData[j].FAMSA && FANAM == oTableData[j].FANAM) {
							oTableData.splice(j, 1);
						}
					}
					break;
				case 'deleteWork':
					var BEGDA = oTableRow.BEGDA,
						ENDDA = oTableRow.ENDDA,
						ZZGZDW = oTableRow.ZZGZDW;
					for (var j = 0; j < oTableData.length; j++) {
						if (BEGDA == oTableData[j].BEGDA && ENDDA == oTableData[j].ENDDA && ZZGZDW == oTableData[j].ZZGZDW) {
							oTableData.splice(j, 1);
						}
					}
					break;
				case 'deleteAddress':
					var ANSSA = oTableRow.ANSSA;
					for (var j = 0; j < oTableData.length; j++) {
						if (ANSSA == oTableData[j].ANSSA) {
							oTableData.splice(j, 1);
						}
					}
					break;
				case 'deleteCommunication':
					var SUBTY = oTableRow.SUBTY,
						USRID_LONG = oTableRow.USRID_LONG;
					for (var j = 0; j < oTableData.length; j++) {
						if (SUBTY == oTableData[j].SUBTY && USRID_LONG == oTableData[j].USRID_LONG) {
							oTableData.splice(j, 1);
						}
					}
					break;
				case 'deleteLanguage':
					var QUCEC = oTableRow.QUCEC,
						ZZZGMC = oTableRow.ZZZGMC;
					for (var j = 0; j < oTableData.length; j++) {
						if (QUCEC == oTableData[j].QUCEC && ZZZGMC == oTableData[j].ZZZGMC) {
							oTableData.splice(j, 1);
						}
					}
					break;
			}
			this.getView().setModel(new JSONModel(oTableData), oModelName);
		},
		ShowMessage: function(oMessage) {
			if (oMessage != "") {
				MessageBox.error(oMessage, {
					styleClass: "sapUiSizeCompact"
				});
				return;
			}
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf view.ZPreEntryPeopleInfo
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		onUploadFile: function(oEvent) {

			this.isIcon = "";
			this.oInitFileType(oEvent);
			// if (this.getfcode(oEvent) == "headerForTest") {
			// 	this.isIcon = "X";
			// }
			// this.oUploadFileType = sap.ui.core.Fragment.byId(this.getView().getId(), "UploadButton").getSelectedKey();
			if (this.isIcon != "X" && this.oUploadFileType == "") {
				this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeIsNull"));
				return;
			}
			if (!this.UploadDialog) {
				this.UploadDialog = sap.ui.xmlfragment(this.getView().getId(),
					"ZPreEntryPeopleInfo.fragment.FileUpload",
					this
				);
				this.getView().addDependent(this.UploadDialog);
			}

			// this.oInitFileType(oEvent);

			var oFile = {
				FileName: ""
			};
			this.getView().setModel(new JSONModel(oFile), "oFile");
			this.UploadDialog.open();
		},
		oInitFileType: function(oEvent) {
			var fcode = this.getfcode(oEvent);
			switch (fcode) {
				case "MyFileButton1":
					this.oUploadFileType = "01";
					this.oUploadFileModel = "MyFile1";
					this.isIcon = "X";
					break;
				case "MyFileButton2":
					this.oUploadFileType = "02";
					this.oUploadFileModel = "MyFile2";
					break;
				case "MyFileButton3":
					this.oUploadFileType = "03";
					this.oUploadFileModel = "MyFile3";
					break;
				case "MyFileButton4":
					this.oUploadFileType = "04";
					this.oUploadFileModel = "MyFile4";
					break;
				case "MyFileButton5":
					this.oUploadFileType = "05";
					this.oUploadFileModel = "MyFile5";
					break;
				case "MyFileButton6":
					this.oUploadFileType = "06";
					this.oUploadFileModel = "MyFile6";
					break;
				case "MyFileButton7":
					this.oUploadFileType = "07";
					this.oUploadFileModel = "MyFile7";
					break;
				case "MyFileButton8":
					this.oUploadFileType = "08";
					this.oUploadFileModel = "MyFile8";
					break;
				case "MyFileButton9":
					this.oUploadFileType = "09";
					this.oUploadFileModel = "MyFile9";
					break;
				case "MyFileButton10":
					this.oUploadFileType = "10";
					this.oUploadFileModel = "MyFile10";
					break;
				case "MyFileButton11":
					this.oUploadFileType = "11";
					this.oUploadFileModel = "MyFile11";
					break;
			}
		},
		oGetFileModelName: function(FileType) {
			switch (FileType) {
				case "01":
					return "MyFile1";
				case "02":
					return "MyFile2";
				case "03":
					return "MyFile3";
				case "04":
					return "MyFile4";
				case "05":
					return "MyFile5";
				case "06":
					return "MyFile6";
				case "07":
					return "MyFile7";
				case "08":
					return "MyFile8";
				case "09":
					return "MyFile9";
				case "10":
					return "MyFile10";
				case "11":
					return "MyFile11";
			}
		},
		onDialogImageCancel: function() {
			//update by 1194668  20210610  修复照片上传之后取消再上传同样照片无法成功的bug
			this.byId("fileUploader").clear();
			this.UploadDialog.close();
		},

		// 对图片进行压缩  
		compress: function(fileObj, encoderOptions, callback) {
			if (typeof(FileReader) === 'undefined') {
				console.log("当前浏览器内核不支持base64图标压缩");
				//调用上传方式不压缩    
				this.directTurnIntoBase64(fileObj, callback);
			} else {
				var reader = new FileReader();
				reader.onload = function(e) { //要先确保图片完整获取到，这是个异步事件   

					var image = new Image();
					image.src = e.target.result;
					image.onload = function() {
						var square = 1, //定义画布的大小，也就是图片压缩之后的像素  
							canvas = document.createElement('canvas'), //创建canvas元素  
							context = canvas.getContext('2d'),
							imageWidth = Math.round(square * image.width), //压缩图片的大小  
							imageHeight = Math.round(square * image.height),
							data = '';

						canvas.width = imageWidth;
						canvas.height = imageHeight;
						context.clearRect(0, 0, imageWidth, imageHeight); //在给定矩形内清空一个矩形   
						context.drawImage(this, 0, 0, imageWidth, imageHeight);
						var data = canvas.toDataURL('image/jpeg', Number(encoderOptions));
						//压缩完成执行回调    
						callback(data);
					};
				};
				reader.readAsDataURL(fileObj);

			}
		},
		directTurnIntoBase64: function(fileObj, callback) {
			var r = new FileReader();
			// 转成base64  
			r.onload = function() {
				//变成字符串  
				var imgBase64 = r.result;
				//console.log(imgBase64);  
				callback(imgBase64);
			};
			r.readAsDataURL(fileObj); //转成Base64格式  
		},
		base64ToFile: function(base64) {
			var file = new File(base64, 'anyname.jpg');
			console.log('File Object', file);
			return file;
		},
		saveBase64: function(base64) {
			var oReturnTable = this.onInitData();
			var oReturnTableRow;
			var oReturnTableP = [];
			oReturnTable.navToFile = this.getDataFromModel("MyFile");
			oReturnTableRow = {
				FILENAME: this.changeFileName(),
				FILENAME_OLD: this.oFile.name,
				MIMETYPE: this.oFile.type,
				PERNR: this.getModel("PersonInfo").oData.PERNR,
				PRE_FILETYPE: this.oUploadFileType,
				VALUE: base64,
				IS_ICON: this.isIcon

			};
			oReturnTableP.push(oReturnTableRow);
			oReturnTable.navToFile = oReturnTableP;

			var that = this;
			var sPath = "/ZEntry_People_DeepSet";
			oReturnTable.ZZAction = "SVAE_BASE64";
			oReturnTable.Ename = this.Ename;
			oReturnTable.Phone = this.Phone;
			oReturnTable.Pernr = this.Pernr;
			//update by 1194668  20210610  jin'du'tiao
			if (!this.oBusyDialog) {
				this.oBusyDialog = sap.ui.core.Fragment.byId("InitCheckDialog", "BusyDialog");
			}
			this.oBusyDialog.setVisible(true);
			this.oBusyDialog.open();

			this.oDataModelPreEntry.create(sPath, oReturnTable, { //
				success: function(oData, oResponse) {
					that.oBusyDialog.close();
					that.defaultFileUpload();
					that.UploadDialog.close();
					that.oBusyDialog.close();

					var oFileTableModel = that.getView().getModel(that.oUploadFileModel);

					var oFileTableRow = {
							PERNR: "",
							PRE_FILETYPE: "",
							FILENAME_OLD: "",
							FILENAME: "",
							MIMETYPE: "",
							SYUNAME: "",
							SYDATE: "",
							SYTIME: "",
							VALUE: "",
							URL: "",
							UUID: ""
						},
						oFileTableData;
					if (oFileTableModel != undefined) {
						oFileTableData = oFileTableModel.oData;
					} else {
						oFileTableData = [];
					}
					oFileTableRow.PERNR = oData.navToFile.results[0].PERNR;
					oFileTableRow.PRE_FILETYPE = oData.navToFile.results[0].PRE_FILETYPE;
					oFileTableRow.FILENAME = oData.navToFile.results[0].FILENAME;
					oFileTableRow.FILENAME_OLD = oData.navToFile.results[0].FILENAME_OLD;
					oFileTableRow.MIMETYPE = oData.navToFile.results[0].MIMETYPE;
					oFileTableRow.SYUNAME = oData.navToFile.results[0].SYUNAME;
					oFileTableRow.SYDATE = oData.navToFile.results[0].SYDATE;
					oFileTableRow.SYTIME = oData.navToFile.results[0].SYTIME;
					oFileTableRow.VALUE = oData.navToFile.results[0].VALUE;
					oFileTableRow.UUID = oData.navToFile.results[0].UUID;
					//window.open("/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='',Zhr_file_class='ZPRE_ENTRY')/$value");
					//http://sap-s4d-app.sunnyoptical.cn:8000/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='')/$value
					oFileTableRow.HREF = window.location.origin + "/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='" +
						oFileTableRow.FILENAME + "',Zhr_file_class='ZPRE_ENTRY')/$value";
					oFileTableData.push(oFileTableRow);
					that.getView().setModel(new JSONModel(oFileTableData), that.oUploadFileModel);
				},
				error: function(oError) {
					// that.oBusyDialog.close();
					// that.oInitCheckDialog.close();
				}
			});

		},

		onDialogImageOk: function(oEvent) {
			// upload file
			var oFileUploader = this.byId("fileUploader");

			var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			this.oFile = file;
			if (!oFileUploader.getValue()) {
				MessageToast.show("请先上传文件");
				return;
			}
			var oFileTableModel = this.getView().getModel("MyFile");
			if (oFileTableModel != undefined) {
				var oFileTableData = oFileTableModel.oData;
				for (var i = 0; i < oFileTableData.length; i++) {
					if (file.name == oFileTableData[i].FILENAME_OLD) {
						this.ShowMessage(this._ResourceBundle.getText("oErrorFileName"));
						return;
					}
				}
			}

			try {
				if (file) {
					//this.oBusyDialog.close();

					var oFileTypeArr = file.name.split(".");
					this.oFileType = oFileTypeArr[oFileTypeArr.length - 1];
					var oType = this.checkFileTypeBeforeUpload(this.oFileType);
					if (this.isIcon != 'X' && oType == false) {
						return;
					}
					if (file.size / (1024 * 1024) >= 15) {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileSizeError2"));
						return;
					}

					// 调用函数，对图片进行压缩  
					if (file.type == 'image/jpeg') {
						if (file.size / (1024 * 1024) > 1) {
							var that = this;
							var encoderOptions = (1 / (file.size / (1024 * 1024))).toFixed(2);
							if (file.size / (1024 * 1024) > 10) {
								encoderOptions = '0.1';
							}
							this.compress(file, encoderOptions, function(imgBase64) {
								//存储转换后的base64编码 
								that.saveBase64(imgBase64);
							});
							return;
						}
					}

					if (this.oUploadFileType == "10") {
						if (file.size / (1024 * 1024) >= 15) {
							this.ShowMessage(this._ResourceBundle.getText("oCheckFileSizeError2"));
							return;
						}
					} else {
						if (file.size / (1024 * 1024) >= 5) {
							this.ShowMessage(this._ResourceBundle.getText("oCheckFileSizeError"));
							return;
						}
					}

					this._bUploading = true;

					var that = this;
					var _handleSuccess = function(event, xhr, settings, data) {
						that.defaultFileUpload();
						that.UploadDialog.close();
						that.oBusyDialog.close();

						if (that.isIcon == 'X') {
							var oPersonInfo = that.getView().getModel("PersonInfo").oData;
							var sRootPath = jQuery.sap.getModulePath("ZPreEntryPeopleInfo");
							var oPath = sRootPath + "/img/PersonImage.png";
							oPersonInfo.PhotoUrl = oPath;
							that.getView().setModel(new sap.ui.model.json.JSONModel(oPersonInfo), "PersonInfo");

							oPersonInfo.PhotoUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location
									.port :
									"") + "/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_TT_PRE_FILESet(PERNR='" + that.getModel("PersonInfo").oData.PERNR + "'" +
								",PRE_FILETYPE='',FILENAME='',FILENAME_OLD='',FILETYPE='',MIMETYPE=''" + ")/$value";
							that.getView().setModel(new sap.ui.model.json.JSONModel(oPersonInfo), "PersonInfo");

							that.setFileArr(event);

							return;
						} else {
							var oFileTableModel = that.getView().getModel(that.oUploadFileModel);

							var oFileTableRow = {
									PERNR: "",
									PRE_FILETYPE: "",
									FILENAME_OLD: "",
									FILENAME: "",
									MIMETYPE: "",
									SYUNAME: "",
									SYDATE: "",
									SYTIME: "",
									// VALUE: "",
									URL: "",
									UUID: ""
								},
								oFileTableData;
							if (oFileTableModel != undefined) {
								oFileTableData = oFileTableModel.oData;
							} else {
								oFileTableData = [];
							}
							var oReturnList = event.childNodes[0].children[6]["childNodes"];
							for (var i = 0; i < oReturnList.length; i++) {
								var oNodeName = oReturnList[i].nodeName,
									oNodeValue = oReturnList[i].childNodes[0];

								var oFieldName = oNodeName.split(':')[1];
								switch (oFieldName) {
									case 'PERNR':
										oFileTableRow.PERNR = oNodeValue.data;
										break;
									case 'PRE_FILETYPE':
										oFileTableRow.PRE_FILETYPE = oNodeValue != undefined ? oNodeValue.data : "";
										break;
									case 'FILENAME':
										oFileTableRow.FILENAME = oNodeValue.data;
										break;
									case 'FILENAME_OLD':
										oFileTableRow.FILENAME_OLD = oNodeValue.data;
										break;
									case 'MIMETYPE':
										oFileTableRow.MIMETYPE = oNodeValue.data;
										break;
									case 'SYUNAME':
										oFileTableRow.SYUNAME = oNodeValue.data;
										break;
									case 'SYDATE':
										oFileTableRow.SYDATE = oNodeValue.data;
										break;
									case 'SYTIME':
										oFileTableRow.SYTIME = oNodeValue.data;
										break;
									case 'VALUE':
										oFileTableRow.VALUE = oNodeValue.data;
										break;
									case 'UUID':
										oFileTableRow.UUID = oNodeValue.data;
										break;
								}
							}
							// window.open("/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='',Zhr_file_class='ZPRE_ENTRY')/$value");
							// http://sap-s4d-app.sunnyoptical.cn:8000/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='')/$value
							oFileTableRow.HREF = window.location.origin + "/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='" +
								oFileTableRow.FILENAME + "',Zhr_file_class='ZPRE_ENTRY')/$value";
							oFileTableData.push(oFileTableRow);
							that.getView().setModel(new JSONModel(oFileTableData), that.oUploadFileModel);
						}

					};
					var _handleError = function(data) {
						that.oBusyDialog.close();
						var errorMsg = '';
						that.defaultFileUpload();
						if (data.responseText[1]) {
							errorMsg = /<message>(.*?)<\/message>/.exec(data.responseText)[1];
						} else {
							errorMsg = 'Something bad happened';
						}
						that.fireUploadComplete({
							"response": "Error: " + errorMsg
						});
						that._bUploading = false;
						that.oBusyDialog.close();
					};

					var oHeaders = {
						"x-csrf-token": this._csrfToken,
						"slug": encodeURIComponent(this.changeFileName()), //this.changeFileName(),
						"filename_old": encodeURIComponent(file.name),
						"pernr": this.getModel("PersonInfo").oData.PERNR,
						"is_icon": this.isIcon,
						"FileType": this.oUploadFileType,
						"FileNameType": this.getFileType(file.name)
					};

					jQuery.ajax({
						type: 'POST',
						url: this._url,
						headers: oHeaders,
						cache: false,
						contentType: file.type,
						processData: false,
						data: file,
						success: _handleSuccess,
						error: _handleError
					});
				}
			} catch (oException) {
				jQuery.sap.log.error("导入失败:\n" + oException.message);
			}
		},
		setFileArr: function(oEvent) {
			var oFileTableModel = this.getView().getModel(this.oUploadFileModel);

			var oFileTableRow = {
					PERNR: "",
					PRE_FILETYPE: "",
					FILENAME_OLD: "",
					FILENAME: "",
					MIMETYPE: "",
					SYUNAME: "",
					SYDATE: "",
					SYTIME: "",
					VALUE: "",
					URL: "",
					UUID: ""
				},
				oFileTableData;
			if (oFileTableModel != undefined) {
				oFileTableData = oFileTableModel.oData;
			} else {
				oFileTableData = [];
			}
			var oReturnList = oEvent.childNodes[0].children[6]["childNodes"];
			for (var i = 0; i < oReturnList.length; i++) {
				var oNodeName = oReturnList[i].nodeName,
					oNodeValue = oReturnList[i].childNodes[0];

				var oFieldName = oNodeName.split(':')[1];
				switch (oFieldName) {
					case 'PERNR':
						oFileTableRow.PERNR = oNodeValue.data;
						break;
					case 'PRE_FILETYPE':
						oFileTableRow.PRE_FILETYPE = oNodeValue != undefined ? oNodeValue.data : "";
						break;
					case 'FILENAME':
						oFileTableRow.FILENAME = oNodeValue.data;
						break;
					case 'FILENAME_OLD':
						oFileTableRow.FILENAME_OLD = oNodeValue.data;
						break;
					case 'MIMETYPE':
						oFileTableRow.MIMETYPE = oNodeValue.data;
						break;
					case 'SYUNAME':
						oFileTableRow.SYUNAME = oNodeValue.data;
						break;
					case 'SYDATE':
						oFileTableRow.SYDATE = oNodeValue.data;
						break;
					case 'SYTIME':
						oFileTableRow.SYTIME = oNodeValue.data;
						break;
					case 'VALUE':
						oFileTableRow.VALUE = oNodeValue.data;
						break;
					case 'UUID':
						oFileTableRow.UUID = oNodeValue.data;
						break;
				}
			}

			if (this.isIcon == "X") {
				oFileTableRow.HREF = window.location.origin + "/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_TT_PRE_FILESet(PERNR='" + this.getModel(
						"PersonInfo").oData.PERNR + "'" +
					",PRE_FILETYPE='',FILENAME='',FILENAME_OLD='',FILETYPE='',MIMETYPE=''" + ")/$value";
				oFileTableData = [];
				oFileTableData.push(oFileTableRow);
			} else {
				oFileTableRow.HREF = window.location.origin + "/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='" +
					oFileTableRow.FILENAME + "',Zhr_file_class='ZPRE_ENTRY')/$value";
				oFileTableData.push(oFileTableRow);
			}

			// oFileTableData.push(oFileTableRow);
			this.getView().setModel(new JSONModel(oFileTableData), this.oUploadFileModel);
		},
		defaultFileUpload: function() {
			var oFile = {
				FileName: ""
			};
			this.getView().setModel(new JSONModel(oFile), "oFile");
			delete this.oFile;
		},
		checkFileTypeBeforeUpload: function(oFileType) {
			var oFileType = oFileType.toUpperCase();
			// check file type before upload
			switch (this.oUploadFileType) {
				case "01":
					if (oFileType != "JPG") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError01"));
						return false;
					} else {
						return true;
					}
				case "02":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError02"));
						return false;
					} else {
						return true;
					}
				case "03":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError03"));
						return false;
					} else {
						return true;
					}
				case "04":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError04"));
						return false;
					} else {
						return true;
					}
				case "05":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError05"));
						return false;
					} else {
						return true;
					}
				case "06":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError06"));
						return false;
					} else {
						return true;
					}
				case "07":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError07"));
						return false;
					} else {
						return true;
					}
				case "08":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError08"));
						return false;
					} else {
						return true;
					}
				case "09":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError09"));
						return false;
					} else {
						return true;
					}
				case "10":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError10"));
						return false;
					} else {
						return true;
					}
				case "11":
					if (oFileType != "JPG" && oFileType != "PDF") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckFileTypeError11"));
						return false;
					} else {
						return true;
					}

			}
		},

		changeFileName: function() {
			var NewFileName,
				UploadTypeDesc,
				oDate = new Date(),
				counter, //conuter for file in one type
				DateTime = oDate.getFullYear().toString() + this.leadZero((oDate.getMonth() + 1), 2) + this.leadZero(oDate.getDate(), 2) + this.leadZero(
					oDate.getHours(), 2) + this.leadZero(oDate.getMinutes(), 2) + this.leadZero(oDate.getSeconds(), 2);

			var oFileDrop = window.oData.navToDD07T.results; //文件
			for (var i = 0; i < oFileDrop.length; i++) {
				if (oFileDrop[i].DomvalueL == this.oUploadFileType) {
					UploadTypeDesc = oFileDrop[i].Ddtext;
					break;
				}
			}

			switch (this.oUploadFileType) {
				case '01':
					counter = "01";
					this.FileType01Max = "01";
					break;
				case '02':
					counter = this.FileType02Max++;
					break;
				case '03':
					counter = this.FileType03Max++;
					break;
				case '04':
					counter = this.FileType04Max++;
					break;
				case '05':
					counter = this.FileType05Max++;
					break;
				case '06':
					counter = this.FileType06Max++;
					break;
				case '07':
					counter = this.FileType07Max++;
					break;
				case '08':
					counter = this.FileType08Max++;
					break;
				case '09':
					counter = this.FileType09Max++;
					break;
				case '10':
					counter = this.FileType10Max++;
					break;
				case '11':
					counter = this.FileType11Max++;
					break;
			}
			counter = this.leadZero(parseInt(counter), 2);
			NewFileName = this.getModel("PersonInfo").oData.PERNR + '_' + UploadTypeDesc + '_' + DateTime + '_' + counter;
			counter++;
			return NewFileName;
		},
		onDeleteFile: function(oEvent) {
			// var oListItem = oEvent.getParameters().listItem;
			var fcode = this.getfcode(oEvent);
			var oModelName = fcode;
			var oItem = oEvent.getParameter('listItem'),
				oFileTableData;
			var oFileTableModel = this.getView().getModel(oModelName);
			var PRE_FILETYPE = "";
			this.oInitFileType(oEvent);
			if (oFileTableModel != undefined) {
				oFileTableData = oFileTableModel.oData;
			} else {
				oFileTableData = [];
			}
			for (var i = 0; i < oFileTableData.length; i++) {
				// 
				if (oFileTableData[i].FILENAME == oItem.getCells()[0].getText() && oFileTableData[i].PRE_FILETYPE == oItem.getCells()[1].getText()) {
					PRE_FILETYPE = oFileTableData[i].PRE_FILETYPE;
					oFileTableData.splice(i, 1);
					this.getView().setModel(new JSONModel(oFileTableData), oModelName);
					break;
				}
			}
			if (PRE_FILETYPE == "01") {
				var oPersonInfo = this.getView().getModel("PersonInfo").oData;
				var sRootPath = jQuery.sap.getModulePath("ZPreEntryPeopleInfo");
				var oPath = sRootPath + "/img/PersonImage.png";
				oPersonInfo.PhotoUrl = oPath;
				this.getView().setModel(new sap.ui.model.json.JSONModel(oPersonInfo), "PersonInfo");
			}

		},
		getFileType: function(fileName) {
			var startIndex = fileName.lastIndexOf(".");
			if (startIndex != -1) {
				return fileName.substring(startIndex + 1, fileName.length).toLowerCase();
			} else {
				return "";
			}
		},
		onUploadComplete: function(oEvent) {

		},
		handleTypeMissmatch: function(oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			jQuery.each(aFileTypes, function(key, value) {
				aFileTypes[key] = "*." + value;
			});
			var sSupportedFileTypes = aFileTypes.join(", ");
			MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
				" is not supported. Choose one of the following types: " +
				sSupportedFileTypes);
		},

		handleBeforeUpload: function() {

		},
		handleValueChange: function(oEvent) {
			var oFileUploader = oEvent.getSource();
			oFileUploader.removeAllHeaderParameters();
			//x-csrf-token:
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: this._csrfToken
			}));

			MessageToast.show("点击确定按钮上传文件'" + oEvent.getParameter("newValue") + "'");

		},
		_get_csrf: function(entrySet) {
			var url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") +
				"/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/" + entrySet;
			this._url = url;
			var that = this;
			var _csrfToken = "";
			jQuery.ajax({
				url: url,
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch",
					"X-Requested-With": "XMLHttpRequest",
					"DataServiceVersion": "2.0"
				},
				type: "GET",
				contentType: "application/json",
				dataType: 'json',

				success: function(data, textStatus, jqXHR) {
					that._csrfToken = jqXHR.getResponseHeader('x-csrf-token');
					return that._csrfToken;
				}
			});
		},

		uploadStart: function(oEvent) {
			// Stellen die Kopf Parameter slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			//_busyDialog.open();
		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf view.ZPreEntryPeopleInfo
		 */
		onAfterRendering: function(oEvent) {
			this.changeEditable0185();

		},
		changeEditable0185: function() {
			//that.getView().setModel(new JSONModel(window.oData.navTo0185.results), "MyIdCard");
			if (window.oData == undefined) {
				return;
			}
			var oPa0185 = window.oData.navTo0185.results;
			for (var i = 0; i < oPa0185.length; i++) {
				if (oPa0185[i].ICTYP == "10") {
					//var oIcnumDomId = "application-Actions-EntryInfo-component---homePage--MyIdCard-rows-row" + i.toString() + "-col1";
					var oIcnumDomId = this.getView().sId + "--MyIdCard-rows-row" + i.toString() + "-col1";
					var oIcnumDomHead = document.getElementById(oIcnumDomId);
					if (oIcnumDomHead != null) {
						var oICnumDomChildren = oIcnumDomHead.children[0].children[0].children[0].children[0];
						oICnumDomChildren.disabled = true;
						oPa0185[i].ICNUM = oICnumDomChildren.defaultValue;
					}

				}
			}
		},
		handleChangeDate: function(oEvent) {

			var oModelName, oPath;
			var oListenViewContext = oEvent.getSource().oPropagatedProperties.oBindingContexts; //get the listen view 
			var oPersonInfo = this.getView().getModel("PersonInfo").oData;

			for (var oListenViewName in oListenViewContext) {
				if (oListenViewName != undefined) {
					oModelName = oListenViewName;
					oPath = oListenViewContext[oListenViewName].sPath.split("")[1];
				}
			}
			var oTableData = this.getView().getModel(oModelName).oData; // data in table	

			var oDP = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		handleChangeNumber: function(oEvent) {

			var oModelName, oPath;
			var oListenViewContext = oEvent.getSource().oPropagatedProperties.oBindingContexts; //get the listen view 
			var oPersonInfo = this.getView().getModel("PersonInfo").oData;

			for (var oListenViewName in oListenViewContext) {
				if (oListenViewName != undefined) {
					oModelName = oListenViewName;
					oPath = oListenViewContext[oListenViewName].sPath.split("")[1];
				}
			}
			var oTableData = this.getView().getModel(oModelName).oData; // data in table	

			var oDP = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			var re = /^[0-9][0-9]*$/;
			if (!re.test(sValue) && sValue != "") {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.None);
			}
		},

		onNext: function(oEvent) {
			this.getView().getModel().odata();
		},
		onSave: function(oEvent) {
			var that = this;
			var sPath = "/ZEntry_People_DeepSet";

			this.oReturnTable = this.getSaveTable("Save");

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (this.oError == "E") {
				that.ShowMessage(this.oMessage);
				return;
			} else {
				MessageBox.warning(
					this._ResourceBundle.getText("oCheckBeforeSave"), {
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(sAction) {
							if (sAction == 'OK') {
								that.onSaveOK(that.oReturnTable);
							}
						}
					});
			}
		},
		onSaveOK: function(oReturnTable) {
			this.openBusyDialog();
			var that = this;
			var sPath = "/ZEntry_People_DeepSet";
			oReturnTable.ZZAction = "PEOPLE_INFO_SAVE";
			oReturnTable.Ename = this.Ename;
			oReturnTable.PCODE = this.getModel("PersonInfo").oData.Pcode;
			oReturnTable.Phone = this.Phone;
			oReturnTable.Pernr = this.Pernr;

			oReturnTable.FILETYPE01MAX = this.FileType01Max.toString();
			oReturnTable.FILETYPE02MAX = this.FileType02Max.toString();
			oReturnTable.FILETYPE03MAX = this.FileType03Max.toString();
			oReturnTable.FILETYPE04MAX = this.FileType04Max.toString();
			oReturnTable.FILETYPE05MAX = this.FileType05Max.toString();
			oReturnTable.FILETYPE06MAX = this.FileType06Max.toString();
			oReturnTable.FILETYPE07MAX = this.FileType07Max.toString();
			oReturnTable.FILETYPE08MAX = this.FileType08Max.toString();
			oReturnTable.FILETYPE09MAX = this.FileType09Max.toString();
			oReturnTable.FILETYPE10MAX = this.FileType10Max.toString();
			oReturnTable.FILETYPE11MAX = this.FileType11Max.toString();

			this.oDataModelPreEntry.create(sPath, oReturnTable, { //
				success: function(oData, oResponse) {
					that.oBusyDialog.close();
					// that.oBusyDialog.close();
					if (oData.Type == 'E') {
						that.ShowMessage(oData.Message);
					} else {
						MessageBox.success('保存成功！');
					}
				},
				error: function(oError) {
					that.oBusyDialog.close();
					// that.oBusyDialog.close();
					// that.oInitCheckDialog.close();
				}
			});
		},
		getSaveTable: function(oPera) {
			var oReturnTable = this.onInitData();
			var oTableModel, oTableData;
			this.oError = "";
			this.oMessage = "";
			if (oPera == "Save") {
				oReturnTable.navTo0002 = this.getDataFromModelSave("PersonInfo");
				oReturnTable.navTo0185 = this.getDataFromModelSave("MyIdCard");
				oReturnTable.navTo0022 = this.getDataFromModelSave("Educational");
				oReturnTable.navTo0023 = this.getDataFromModelSave("Work");
				oReturnTable.navTo0021 = this.getDataFromModelSave("Family");
				oReturnTable.navTo0006 = this.getDataFromModelSave("Address");
				oReturnTable.navTo0105 = this.getDataFromModelSave("Communication");
				oReturnTable.navToFile = this.getDataFromModelSave("MyFile");
				oReturnTable.navTo3531 = this.getDataFromModel("Language");
			} else {
				oReturnTable.navTo0002 = this.getDataFromModel("PersonInfo");
				oReturnTable.navTo0185 = this.getDataFromModel("MyIdCard");
				oReturnTable.navTo0022 = this.getDataFromModel("Educational");
				oReturnTable.navTo0023 = this.getDataFromModel("Work");
				oReturnTable.navTo0021 = this.getDataFromModel("Family");
				oReturnTable.navTo0006 = this.getDataFromModel("Address");
				oReturnTable.navTo0105 = this.getDataFromModel("Communication");
				oReturnTable.navToFile = this.getDataFromModel("MyFile");
				oReturnTable.navTo3531 = this.getDataFromModel("Language");
			}
			var oFlag = "";
			var oFlag1 = "";
			if (this.oError != "E") {
				var oPhotoUrl = this.getView().getModel("PersonInfo").oData.PhotoUrl;
				var oPhotoUrlArr = oPhotoUrl.split("/");
				var oPersonImageName = oPhotoUrlArr[oPhotoUrlArr, length - 1];
				if (oPhotoUrl == undefined || oPhotoUrl == "" || oPersonImageName == "PersonImage.png") {
					this.oError = 'E';
					this.oMessage = this._ResourceBundle.getText("oErrorPersonImageIsNull");
				}
			}

			if (oPera != "Save") {
				if (this.oError != "E") {
					if (oReturnTable.navTo0006.length <= 0) {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0006IsNull");
					} else {
						oFlag = "";
						oFlag1 = "";
						// check 0006 = 10
						for (var i = 0; i < oReturnTable.navTo0006.length; i++) {

							if (oReturnTable.navTo0006[i].ANSSA == "2") {
								oFlag = "X";
								break;
							}
						}

						for (var i = 0; i < oReturnTable.navTo0006.length; i++) {

							if (this.checkBeforeSave(oReturnTable.navTo0006[i].LOCAT).trim() == "") {
								oFlag1 = "X";
								break;
							}

						}

						if (oFlag == "") {
							this.oError = 'E';
							this.oMessage = this._ResourceBundle.getText("oError0006_10IsNull");
						}

						if (oFlag1 == "X") {
							this.oError = 'E';
							this.oMessage = this._ResourceBundle.getText("oError0006LOCATIsNull");
						}

					}
				}

				// 0022
				if (this.oError != "E") {
					if (oReturnTable.navTo0022.length <= 0) {
						this.oError = 'E';
						// 至少要有一行教育
						this.oMessage = this._ResourceBundle.getText("oError0022IsNull");
					} else {
						// 有且仅有一条最高学历为空的
						// if (oReturnTable.navTo0022.length == 1) {
						// 	if (oReturnTable.navTo0022[0].ACAQM != 'X') {
						// 		this.oError = 'E';
						// 		// 至少要有一行教育
						// 		this.oMessage = this._ResourceBundle.getText("oError0022Flag0IsNull");
						// 	}
						// 	if (oReturnTable.navTo0022[0].ZHR_RXRQ > oReturnTable.navTo0022[0].BEGDA) {
						// 		this.oError = 'E';
						// 		// 入学日期大于毕业日期
						// 		this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError");
						// 	}
						// } else {
						var oFlag0022 = 0;
						var oDate = new Date(),
							oDateTime = oDate.getFullYear().toString() + (oDate.getMonth() + 1) + oDate.getDate().toString();
						for (var i = 0; i < oReturnTable.navTo0022.length; i++) {
							if (oReturnTable.navTo0022[i].ACAQM == 'X') {
								oFlag0022++;
								if (oFlag0022 > 1) {
									break;
								}
							}
							if (oReturnTable.navTo0022[i].ZHR_RXRQ > oReturnTable.navTo0022[i].BEGDA) {
								this.oError = 'E';
								// 入学日期大于毕业日期
								this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError");
							}
							if (oReturnTable.navTo0022[i].ZHR_RXRQ > oDateTime) {
								this.oError = 'E';
								// 入学日期大于毕业日期
								this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError1");
							}
							// 发现实习生的毕业日期有可能是未来的，注释
							// if (oReturnTable.navTo0022[i].BEGDA > oDateTime) {
							// 	this.oError = 'E';
							// 	// 毕业日期不能大于今天
							// 	this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError2");
							// }

						}
						if (oFlag0022 == 0) {
							this.oError = 'E';
							// 至少要有一行教育
							this.oMessage = this._ResourceBundle.getText("oError0022Flag0IsNull");
						} else if (oFlag0022 > 1) {
							this.oError = 'E';
							// 最多只能有一条最高学历
							this.oMessage = this._ResourceBundle.getText("oError0022Flag2IsNull");

						}
					}
					// }
				}

				// 0021
				if (this.oError != "E") {
					if (oReturnTable.navTo0021.length <= 0) {
						this.oError = 'E';
						// 至少要有一行家庭成员信息
						this.oMessage = this._ResourceBundle.getText("oError0021IsNull");
					}
				}

				// 0022
				if (this.oError != "E") {
					if (oReturnTable.navTo0022.length <= 0) {
						this.oError = 'E';
						// 至少要有一行教育
						this.oMessage = this._ResourceBundle.getText("oError0022IsNull");
					} else {
						// 有且仅有一条最高学历为空的
						// if (oReturnTable.navTo0022.length == 1) {
						// 	if (oReturnTable.navTo0022[0].ACAQM != 'X') {
						// 		this.oError = 'E';
						// 		// 至少要有一行教育
						// 		this.oMessage = this._ResourceBundle.getText("oError0022Flag0IsNull");
						// 	}
						// 	if (oReturnTable.navTo0022[0].ZHR_RXRQ > oReturnTable.navTo0022[0].BEGDA) {
						// 		this.oError = 'E';
						// 		// 入学日期大于毕业日期
						// 		this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError");
						// 	}
						// } else {
						var oFlag0022 = 0;
						var oDate = new Date(),
							oDateTime = oDate.getFullYear().toString() + (oDate.getMonth() + 1) + oDate.getDate().toString();
						for (var i = 0; i < oReturnTable.navTo0022.length; i++) {
							if (oReturnTable.navTo0022[i].ACAQM == 'X') {
								oFlag0022++;
								if (oFlag0022 > 1) {
									break;
								}
							}
							if (oReturnTable.navTo0022[i].ZHR_RXRQ > oReturnTable.navTo0022[i].BEGDA) {
								this.oError = 'E';
								// 入学日期大于毕业日期
								this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError");
							}
							if (oReturnTable.navTo0022[i].ZHR_RXRQ > oDateTime) {
								this.oError = 'E';
								// 入学日期大于毕业日期
								this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError1");
							}
							// 发现实习生的毕业日期有可能是未来的，注释
							// if (oReturnTable.navTo0022[i].BEGDA > oDateTime) {
							// 	this.oError = 'E';
							// 	// 毕业日期不能大于今天
							// 	this.oMessage = this._ResourceBundle.getText("oError0022DatumIsError2");
							// }

						}
						if (oFlag0022 == 0) {
							this.oError = 'E';
							// 至少要有一行教育
							this.oMessage = this._ResourceBundle.getText("oError0022Flag0IsNull");
						} else if (oFlag0022 > 1) {
							this.oError = 'E';
							// 最多只能有一条最高学历
							this.oMessage = this._ResourceBundle.getText("oError0022Flag2IsNull");

						}
					}
					// }
				}

				// 0105
				if (this.oError != "E") {
					if (oReturnTable.navTo0105.length <= 0) {
						this.oError = 'E';
						// 至少要有一通讯信息
						this.oMessage = this._ResourceBundle.getText("oError0105IsNull");
					}
				}

				// 0185
				if (this.oError != "E") {
					var oFlag0185 = 0,
						hash = {};
					if (oReturnTable.navTo0185.length <= 0) {
						this.oError = 'E'; //至少要有一行证件信息
						this.oMessage = this._ResourceBundle.getText("oError0185IsNull");
					} else {
						for (var i = 0; i < oReturnTable.navTo0185.length; i++) {
							if (hash[oReturnTable.navTo0185[i].ICTYP]) {
								this.oError = 'E'; //不能存在同样的证件类型
								this.oMessage = this._ResourceBundle.getText("oError0185SameIsNull");
								break;
							}
							// 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
							hash[oReturnTable.navTo0185[i].ICTYP] = true;

							if (oReturnTable.navTo0185[i].USEFR > oReturnTable.navTo0185[i].USETO) {
								this.oError = 'E'; //有效开始日期大于有效截至日期
								this.oMessage = this._ResourceBundle.getText("oError0185DatumIsError");
								break;
							}
						}
					}
				}
				
			}

			// // 0023
			// if (this.oError != "E") {
			// 	if (oReturnTable.navTo0023.length <= 0) {
			// 		this.oError = 'E';
			// 		// 至少要有一行工作经历
			// 		this.oMessage = this._ResourceBundle.getText("oError0023IsNull");
			// 	}
			// }

			// 0023
			if (this.oError != "E") {

				if (oReturnTable.navTo0023.length > 0) {
					for (var i = 0; i < oReturnTable.navTo0023.length; i++) {
						var oDate = new Date();
						var oDateChar8 = oDate.getFullYear().toString() + (oDate.getMonth() + 1) + oDate.getDate().toString();
						if (oReturnTable.navTo0023[i].BEGDA >= oReturnTable.navTo0023[i].ENDDA || oReturnTable.navTo0023[i].BEGDA > oDateChar8) {
							this.oError = 'E';
							// 工作开始时间要小于结束时间
							this.oMessage = this._ResourceBundle.getText("oError0023DateError");
						}
					}

				}
			}

			return oReturnTable;
		},
		getDataFromModel: function(ModelName) {

			var oTableModel = this.getView().getModel(ModelName);
			if (oTableModel == undefined) {
				return;
			}
			var oTableData = oTableModel.oData;
			var oReturnTable = [],
				oReturnTableRow;

			switch (ModelName) {
				case 'PersonInfo':

					oReturnTableRow = {
						GBDAT: oTableData.GBDAT,
						GESCH: oTableData.GESCH,
						NACHN: oTableData.NACHN,
						NAME2: oTableData.NAME2,
						PERNR: oTableData.PERNR
					};
					if (this.getView().byId("FAMST").getSelectedKey() == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001FAMSTIsNull");
					}

					// 婚姻状况为空
					oReturnTableRow.FAMST = this.getView().byId("FAMST").getSelectedKey();
					oReturnTableRow.FATXT = this.getView().byId("FAMST").getSelectedItem() != null ? this.getView().byId("FAMST").getSelectedItem().mProperties
						.text : "";
					if (oReturnTableRow.FAMST == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001FAMSTIsNull");
					}

					// 国家/地区为空
					oReturnTableRow.GBLND = this.getView().byId("GBLND").getSelectedKey();
					if (oReturnTableRow.GBLND == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001GBLNDIsNull");
					}

					// 国家/地区为空
					oReturnTableRow.HUKOT = this.getView().byId("HUKOT").getSelectedKey();
					if (oReturnTableRow.HUKOT == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001HUKOTIsNull");
					}

					// 个人数据-紧急联系人电话为空
					oReturnTableRow.ZHR_JJLXRDH = this.getView().byId("ZHR_JJLXRDH").getValue();
					if (oReturnTableRow.ZHR_JJLXRDH == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001ZHR_JJLXRDHIsNull");
					} else {
						var re = /^1\d{10}$/;
						if (!re.test(oReturnTableRow.ZHR_JJLXRDH)) {
							this.oError = 'E';
							this.oMessage = this._ResourceBundle.getText("oError0001ZHR_JJLXRDHFormatError");
						}
					}

					// 个人数据-民族为空
					oReturnTableRow.ZHR_JJLXRXM = this.getView().byId("ZHR_JJLXRXM").getValue();
					if (oReturnTableRow.ZHR_JJLXRXM == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001ZHR_JJLXRXMIsNull");
					}

					// 个人数据-紧急联系人姓名为空
					oReturnTableRow.ZHR_MZ = this.getView().byId("ZHR_MZ").getSelectedKey();
					oReturnTableRow.ZHR_MZ_DESC = this.getView().byId("ZHR_MZ").getSelectedItem() != null ? this.getView().byId("ZHR_MZ").getSelectedItem()
						.mProperties.text : "";
					if (oReturnTableRow.ZHR_MZ == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001ZHR_MZIsNull");
					}

					// 个人数据-籍贯省为空
					oReturnTableRow.ZZSTATE = this.getView().byId("ZZSTATE").getSelectedKey();
					oReturnTableRow.ZZSTATE_DESC = this.getView().byId("ZZSTATE").getSelectedItem() != null ? this.getView().byId("ZZSTATE").getSelectedItem()
						.mProperties.text : "";
					if (oReturnTableRow.ZZSTATE == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001ZZSTATEIsNull");
					}

					// 个人数据-籍贯市为空
					oReturnTableRow.ZZCITY = this.getView().byId("ZZCITY").getSelectedKey();
					oReturnTableRow.ZZCITY_DESC = this.getView().byId("ZZCITY").getSelectedItem() != null ? this.getView().byId("ZZCITY").getSelectedItem()
						.mProperties.text : "";
					if (oReturnTableRow.ZZCITY == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001ZZCITYIsNull");
					}

					// 个人数据-籍贯县为空
					oReturnTableRow.ZZORT01 = this.getView().byId("ZZORT01").getSelectedKey();
					oReturnTableRow.ZZORT01_DESC = this.getView().byId("ZZORT01").getSelectedItem() != null ? this.getView().byId("ZZORT01").getSelectedItem()
						.mProperties.text : "";
					if (oReturnTableRow.ZZORT01 == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001ZZORT01IsNull");
					}

					// 个人数据-政治面貌
					var pcode = this.getView().byId("POLITICAL").getSelectedKey();
					// oReturnTableRow.PCODE_DESC = this.getView().byId("POLITICAL").getSelectedItem() != null ? this.getView().byId("POLITICAL").getSelectedItem()
					// .mProperties.text : "";
					if (pcode == "") {
						this.oError = 'E';
						this.oMessage = this._ResourceBundle.getText("oError0001PCODEIsNull");
					}

					oReturnTable.push(oReturnTableRow);
					break;
				case 'MyIdCard':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						// oReturnTableRow = {
						// 	BEGDA: oTableData[i].BEGDA,
						// 	ICNUM: oTableData[i].ICNUM,
						// 	ENDDA: oTableData[i].ENDDA,
						// 	ICNUM: oTableData[i].ICNUM,
						// 	ICTXT: oTableData[i].ICTXT,
						// 	ICTYP: oTableData[i].ICTYP,
						// 	PERNR: oTableData[i].PERNR,
						// 	USEFR: oTableData[i].USEFR,
						// 	USETO: oTableData[i].USETO
						// };
						if (this.oError != "E") {
							if (oTableData[i].PERNR == undefined) {
								oReturnTableRow.PERNR = this.Pernr;
							} else {
								oReturnTableRow.PERNR = this.Pernr;
							}
							this.checkBeforeSave(oReturnTableRow.PERNR, this.Pernr);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
							// if(this.oError == "E"){
							// 	this.ShowMessage(this._ResourceBundle.getText("oError0022BEGDAIsNull"));
							// }							
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.ICNUM = this.checkBeforeSave(oTableData[i].ICNUM);
							if (oReturnTableRow.ICNUM == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0185ICNUMIsNull");
							}

							// 身份证18位校验
							if (this.oError != "E") {
								if (oReturnTableRow.ICTYP == "10") {
									if (oReturnTableRow.ICNUM.length != 18) {
										this.oError = 'E';
										this.oMessage = this._ResourceBundle.getText("oError0185ICNUM18IsNull");
									} else {
										if (this.onCheckCard(oReturnTableRow.ICNUM) == false) {
											this.oError = 'E';
											this.oMessage = this._ResourceBundle.getText("oError0185ICNUMRegIsNull");
										}
									}
								}
							}
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.ICTXT = this.checkBeforeSave(oTableData[i].ICTXT);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ICTYP = this.checkBeforeSave(oTableData[i].ICTYP);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.USEFR = this.checkBeforeSave(oTableData[i].USEFR);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.USETO = this.checkBeforeSave(oTableData[i].USETO);
						} else {
							return;
						}
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Educational':
					// this.getView().byId("Educational");
					var oEducationalData = this.getView().byId("Educational").mBindingInfos.rows.binding.oList;
					for (var i = 0; i < oTableData.length; i++) {
						// oReturnTableRow = {
						// 	ACAQM: oTableData[i].ACAQM,
						// 	ACAQU: oTableData[i].ACAQU,
						// 	ACCID: oTableData[i].ACCID,
						// 	ACQID: oTableData[i].ACQID,
						// 	BEGDA: oTableData[i].BEGDA,
						// 	ENDDA: oTableData[i].ENDDA,
						// 	FACH3: oTableData[i].FACH3,
						// 	INSMO: oTableData[i].INSMO,
						// 	INSTI: oTableData[i].INSTI,
						// 	PERNR: oTableData[i].PERNR,
						// 	SLABS: oTableData[i].SLABS,
						// 	SUBTY: oTableData[i].SUBTY,
						// 	ZHR_J: oTableData[i].ZHR_J,
						// 	ZHR_RXRQ: oTableData[i].ZHR_RXRQ,
						// 	ZHR_SFYJS: oTableData[i].ZHR_SFYJS,
						// 	ZHR_YXDW: oTableData[i].ZHR_YXDW,
						// 	ZHR_YXLX: oTableData[i].ZHR_YXLX,
						// 	ZHR_ZYLX: oTableData[i].ZHR_ZYLX
						// };
						oReturnTableRow = {};
						oTableData[i].SUBTY = "10";
						if (this.oError != "E") {
							if (oTableData[i].PERNR == undefined) {
								oReturnTableRow.PERNR = this.Pernr;
							} else {
								oReturnTableRow.PERNR = this.Pernr;
							}
							// oReturnTableRow.PERNR = this.checkBeforeSave(oTableData[i].PERNR);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_RXRQ = this.checkBeforeSave(oTableData[i].ZHR_RXRQ);
							if (oReturnTableRow.ZHR_RXRQ == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0022ZHR_RXRQIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
							if (oReturnTableRow.BEGDA == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0022BEGDAIsNull");
							}
							// 
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.FACH3 = this.checkBeforeSave(oTableData[i].FACH3);
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.ACAQU = this.checkBeforeSave(oTableData[i].ACAQU);
							oReturnTableRow.ACAQT = this.checkBeforeSave(oTableData[i].ACAQT);
							// oReturnTableRow.ACAQU = this.checkBeforeSave(oTableData[i].ACAQU);
							if (oReturnTableRow.ACAQU == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0022ACAQUIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_ZYLX = this.checkBeforeSave(oTableData[i].ZHR_ZYLX);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.INSMO = this.checkBeforeSave(oTableData[i].INSMO);
							// oReturnTableRow.INSMO = this.checkBeforeSave(oTableData[i].INSMO);
							if (oReturnTableRow.INSMO == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0022INSMOIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.INSTI = this.checkBeforeSave(oTableData[i].INSTI);
							if (oReturnTableRow.INSTI == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0022INSTIIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ACQID = this.checkBeforeSave(oTableData[i].ACQID);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ACCID = this.checkBeforeSave(oTableData[i].ACCID);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.SLABS = this.checkBeforeSave(oTableData[i].SLABS);
							oReturnTableRow.STEXT = this.checkBeforeSave(oTableData[i].STEXT);
							if (oReturnTableRow.SLABS == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0022SLABSIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.SUBTY = this.checkBeforeSave(oTableData[i].SUBTY);
						} else {
							return;
						}

						if (this.oError != "E") {
							// if(oEducationalData[i].ACAQM == true){
							// 	oReturnTableRow.ACAQM = 'X';
							// }else{
							// 	oReturnTableRow.ACAQM = '';
							// }
							oReturnTableRow.ACAQM = this.checkBeforeSave(oTableData[i].ACAQM);
							switch (oReturnTableRow.ACAQM) {
								case false:
									oReturnTableRow.ACAQM = "";
									break;
								case true:
									oReturnTableRow.ACAQM = "X";
									break;
							}

							// oReturnTableRow.ACAQM = oReturnTableRow.ACAQM == true?'X':"";
						} else {
							return;
						}

						oReturnTableRow.ZHR_SFYJS = this.checkBeforeSave(oTableData[i].ZHR_SFYJS);
						switch (oReturnTableRow.ZHR_SFYJS) {
							case false:
								oReturnTableRow.ZHR_SFYJS = "";
								break;
							case true:
								oReturnTableRow.ZHR_SFYJS = "X";
								break;
						}
						oReturnTableRow.ZHR_J = this.checkBeforeSave(oTableData[i].ZHR_J);
						oReturnTableRow.ZHR_YXDW = this.checkBeforeSave(oTableData[i].ZHR_YXDW);
						oReturnTableRow.ZHR_YXDW_DESC = this.checkBeforeSave(oTableData[i].ZHR_YXDW_DESC);
						oReturnTableRow.ZHR_YXLX = this.checkBeforeSave(oTableData[i].ZHR_YXLX);
						oReturnTableRow.ZHR_YXLX_DESC = this.checkBeforeSave(oTableData[i].ZHR_YXLX_DESC);
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Work':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
							if (oReturnTableRow.BEGDA == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0023BEGDAIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
							if (oReturnTableRow.ENDDA == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0023ENDDAIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E" && oReturnTableRow.BEGDA > oReturnTableRow.ENDDA) {
							this.oError = 'E';
							this.oMessage = this._ResourceBundle.getText("oError0023DATUM_FAILD");
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_GZJLLX = this.checkBeforeSave(oTableData[i].ZHR_GZJLLX);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZZGZDW = this.checkBeforeSave(oTableData[i].ZZGZDW);
							if (oReturnTableRow.ZZGZDW == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0023ZZGZDWIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_W = this.checkBeforeSave(oTableData[i].ZHR_W);
							if (oReturnTableRow.ZHR_W == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0023ZHR_WIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_DRZW = this.checkBeforeSave(oTableData[i].ZHR_DRZW);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.REFER = this.checkBeforeSave(oTableData[i].REFER);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.DEPTN = this.checkBeforeSave(oTableData[i].DEPTN);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.REFCO = this.checkBeforeSave(oTableData[i].REFCO);
						} else {
							return;
						}

						// oReturnTableRow = {
						// 	PERNR: oTableData[i].PERNR,
						// 	BEGDA: oTableData[i].BEGDA,
						// 	ENDDA: oTableData[i].ENDDA,
						// 	ZHR_GZJLLX: oTableData[i].ZHR_GZJLLX,
						// 	ZZGZDW: oTableData[i].ZZGZDW,
						// 	ZHR_W: oTableData[i].ZHR_W,
						// 	DEPTN: oTableData[i].DEPTN,
						// 	ZHR_DRZW: oTableData[i].ZHR_DRZW,
						// 	REFER: oTableData[i].REFER,
						// 	REFCO: oTableData[i].REFCO
						// };
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Family':
					for (var i = 0; i < oTableData.length; i++) {
						// oReturnTableRow = {
						// 	BEGDA: oTableData[i].BEGDA,
						// 	CITY1: oTableData[i].CITY1,
						// 	ENDDA: oTableData[i].ENDDA,
						// 	FAMSA: oTableData[i].FAMSA,
						// 	FANAM: oTableData[i].FANAM,
						// 	GBDAT: oTableData[i].GBDAT,
						// 	GESCH: oTableData[i].GESCH,
						// 	LAND1: oTableData[i].LAND1,
						// 	PERNR: oTableData[i].PERNR,
						// 	STATE: oTableData[i].STATE,
						// 	TELNR: oTableData[i].TELNR,
						// 	ZHR_SFSYYG: oTableData[i].ZHR_SFSYYG,
						// 	ZHR_XXDZ: oTableData[i].ZHR_XXDZ,
						// 	ZZGZDW: oTableData[i].ZZGZDW
						// };
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.CITY1 = this.checkBeforeSave(oTableData[i].CITY1);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.FAMSA = this.checkBeforeSave(oTableData[i].FAMSA);
							if (oReturnTableRow.FAMSA == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0021FAMSAIsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0021FAMSAIsNull"));
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.FANAM = this.checkBeforeSave(oTableData[i].FANAM);
							if (oReturnTableRow.FANAM == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0021FANAMIsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0021FANAMIsNull"));
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.GBDAT = this.checkBeforeSave(oTableData[i].GBDAT);
						} else {
							return;
						}

						// if (this.oError != "E") {
						// 	oReturnTableRow.GESCH = this.checkBeforeSave(oTableData[i].GESCH);
						// 	if (this.oError == "E") {
						// 		this.oError = 'E';
						// 		this.oMessage = this._ResourceBundle.getText("oError0021GESCHIsNull");
						// 		// this.ShowMessage(this._ResourceBundle.getText("oError0021GESCHIsNull"));
						// 	}
						// } else {
						// 	return;
						// }

						if (this.oError != "E") {
							oReturnTableRow.LAND1 = this.checkBeforeSave(oTableData[i].LAND1);
							oReturnTableRow.LANDX = this.checkBeforeSave(oTableData[i].LANDX);
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.STATE = this.checkBeforeSave(oTableData[i].STATE);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_LXS = this.checkBeforeSave(oTableData[i].ZHR_LXS);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_LXS_DESC = this.checkBeforeSave(oTableData[i].ZHR_LXS_DESC);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_LXCS = this.checkBeforeSave(oTableData[i].ZHR_LXCS);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_LXCS_DESC = this.checkBeforeSave(oTableData[i].ZHR_LXCS_DESC);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_XXDZ = this.checkBeforeSave(oTableData[i].ZHR_XXDZ);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.TELNR = this.checkBeforeSave(oTableData[i].TELNR);
							if (oReturnTableRow.TELNR == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0021TELNRIsNull");
							} else {
								var re = /^1\d{10}$/;
								if (!re.test(oReturnTableRow.TELNR)) {
									this.oError = 'E';
									this.oMessage = this._ResourceBundle.getText("oError0021TELNRFormatError");
								}
							}
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.ZHR_SFSYYG = this.checkBeforeSave(oTableData[i].ZHR_SFSYYG);
							switch (oReturnTableRow.ZHR_SFSYYG) {
								case false:
									oReturnTableRow.ZHR_SFSYYG = "";
									break;
								case true:
									oReturnTableRow.ZHR_SFSYYG = "X";
									break;
							}
							// oReturnTableRow.ZHR_SFSYYG = oReturnTableRow.ZHR_SFSYYG == true?'X':"";
							if (this.oError == "E") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0021ZHR_SFSYYGIsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0021ZHR_SFSYYGIsNull"));
							}
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.ZHR_XXDZ = this.checkBeforeSave(oTableData[i].ZHR_XXDZ);
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.ZZGZDW = this.checkBeforeSave(oTableData[i].ZZGZDW);
						} else {
							return;
						}
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Address':
					for (var i = 0; i < oTableData.length; i++) {
						// oReturnTableRow = {
						// 	ANSSA: oTableData[i].ANSSA,
						// 	BEGDA: oTableData[i].BEGDA,
						// 	ENDDA: oTableData[i].ENDDA,
						// 	GBLND: oTableData[i].GBLND,
						// 	LOCAT: oTableData[i].LOCAT,
						// 	ORT01: oTableData[i].ORT01,
						// 	ORT02: oTableData[i].ORT02,
						// 	PERNR: oTableData[i].PERNR,
						// 	STATE: oTableData[i].STATE
						// };
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						// if (this.oError != "E") {
						// 	oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						// 	// if (this.oError == "E") {
						// 	// 	this.ShowMessage(this._ResourceBundle.getText("oError0006BEGDAIsNull"));
						// 	// }								
						// } else {
						// 	return;
						// }

						// if (this.oError != "E") {
						// 	oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						// 	// if (this.oError == "E") {
						// 	// 	this.ShowMessage(this._ResourceBundle.getText("oError0006ENDDAIsNull"));
						// 	// }							
						// } else {
						// 	return;
						// }

						if (this.oError != "E") {
							oReturnTableRow.ANSSA = this.checkBeforeSave(oTableData[i].ANSSA);
							if (oReturnTableRow.ANSSA == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0006GBLNDIsNull");
							}
						}

						if (this.oError != "E") {
							oReturnTableRow.LAND1 = this.checkBeforeSave(oTableData[i].LAND1);
							if (oReturnTableRow.LAND1 == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0006ANSSAIsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0006GBLNDIsNull"));
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZHR_S = this.checkBeforeSave(oTableData[i].ZHR_S);
							if (oReturnTableRow.ZHR_S == "") {
								this.ShowMessage(this._ResourceBundle.getText("oError0006STATEIsNull"));
							}
						} else {
							return;
						}

						oReturnTableRow.ZHR_S_DESC = this.checkBeforeSave(oTableData[i].ZHR_S_DESC);
						oReturnTableRow.ZHR_CS_DESC = this.checkBeforeSave(oTableData[i].ZHR_CS_DESC);
						oReturnTableRow.ZHR_X_DESC = this.checkBeforeSave(oTableData[i].ZHR_X_DESC);

						if (this.oError != "E") {
							oReturnTableRow.ZHR_CS = this.checkBeforeSave(oTableData[i].ZHR_CS);
							if (oReturnTableRow.ZHR_CS == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0006ORT01IsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0006ORT01IsNull"));
							}
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.ZHR_X = this.checkBeforeSave(oTableData[i].ZHR_X);
							if (oReturnTableRow.ZHR_X == "") {
								this.ShowMessage(this._ResourceBundle.getText("oError0006ORT02IsNull"));
							}
						} else {
							return;
						}
						if (this.oError != "E") {
							oReturnTableRow.LOCAT = this.checkBeforeSave(oTableData[i].LOCAT);
							if (oReturnTableRow.LOCAT == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0006LOCATIsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0006LOCATIsNull"));
							}
						} else {
							return;
						}
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Communication':
					for (var i = 0; i < oTableData.length; i++) {
						// oReturnTableRow = {
						// 	BEGDA: oTableData[i].BEGDA,
						// 	ENDDA: oTableData[i].ENDDA,
						// 	PERNR: oTableData[i].PERNR,
						// 	SUBTY: oTableData[i].SUBTY,
						// 	USRID: oTableData[i].USRID,
						// 	USRID_LONG: oTableData[i].USRID_LONG,
						// 	USRTY: oTableData[i].USRTY
						// };
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.SUBTY = this.checkBeforeSave(oTableData[i].SUBTY);
							if (oReturnTableRow.SUBTY == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0105SUBTYIsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0105SUBTYIsNull"));
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.USRID_LONG = this.checkBeforeSave(oTableData[i].USRID_LONG);
							if (oReturnTableRow.USRID_LONG == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError0105USRID_LONGIsNull");
								// this.ShowMessage(this._ResourceBundle.getText("oError0105USRID_LONGIsNull"));
							}
						} else {
							return;
						}
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'MyFile':
					var Counter = 1;
					for (var i = 0; i < 11; i++) {
						var oModelName = "MyFile" + Counter;
						var oFileArr = this.getView().getModel(oModelName) != undefined ? this.getView().getModel(oModelName).oData : undefined;
						if (oFileArr != undefined && oFileArr.length != 0) {
							for (var j = 0; j < oFileArr.length; j++) {
								oReturnTableRow = {
									FILENAME: oFileArr[j].FILENAME,
									FILENAME_OLD: oFileArr[j].FILENAME_OLD,
									MIMETYPE: oFileArr[j].MIMETYPE,
									PERNR: oFileArr[j].PERNR,
									PRE_FILETYPE: oFileArr[j].PRE_FILETYPE,
									SYDATE: oFileArr[j].SYDATE,
									SYTIME: oFileArr[j].SYTIME,
									SYUNAME: oFileArr[j].SYUNAME,
									URL: oFileArr[j].URL,
									// VALUE: oFileArr[j].VALUE,
									HREF: oFileArr[j].HREF,
									UUID: oFileArr[j].UUID
								};
								oReturnTable.push(oReturnTableRow);
							}
						} else {
							var oCounterNum = this.leadZero(Counter, 2);
							if (oCounterNum == "01" || oCounterNum == "02" || oCounterNum == "03") {
								var oI18nName = "oCheckFileIsNull" + oCounterNum;
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText(oI18nName);
								// break;
							}
						}
						Counter++;
					}

					// for (var i = 0; i < oTableData.length; i++) {
					// 	oReturnTableRow = {
					// 		FILENAME: oTableData[i].FILENAME,
					// 		FILENAME_OLD: oTableData[i].FILENAME_OLD,
					// 		MIMETYPE: oTableData[i].MIMETYPE,
					// 		PERNR: oTableData[i].PERNR,
					// 		PRE_FILETYPE: oTableData[i].PRE_FILETYPE,
					// 		SYDATE: oTableData[i].SYDATE,
					// 		SYTIME: oTableData[i].SYTIME,
					// 		SYUNAME: oTableData[i].SYUNAME,
					// 		URL: oTableData[i].URL,
					// 		VALUE: oTableData[i].VALUE
					// 	};
					// 	oReturnTable.push(oReturnTableRow);
					// }
					break;

				case 'Language':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.QUCEC = this.checkBeforeSave(oTableData[i].QUCEC);
							if (oReturnTableRow.QUCEC == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError3531QUCECIsNull");
							}
						} else {
							return;
						}

						if (this.oError != "E") {
							oReturnTableRow.ZZZGMC = this.checkBeforeSave(oTableData[i].ZZZGMC);
							if (oReturnTableRow.ZZZGMC == "") {
								this.oError = 'E';
								this.oMessage = this._ResourceBundle.getText("oError3531ZZZGMCIsNull");
							}
						} else {
							return;
						}
						oReturnTableRow.ZZZGMC = this.checkBeforeSave(oTableData[i].ZZZGMC);
						oReturnTable.push(oReturnTableRow);
					}
					break;
			}
			return oReturnTable;
		},
		getDataFromModelSave: function(ModelName) {

			var oTableModel = this.getView().getModel(ModelName);
			if (oTableModel == undefined) {
				return;
			}
			var oTableData = oTableModel.oData;
			var oReturnTable = [],
				oReturnTableRow;

			switch (ModelName) {
				case 'PersonInfo':

					oReturnTableRow = {
						GBDAT: oTableData.GBDAT,
						GESCH: oTableData.GESCH,
						NACHN: oTableData.NACHN,
						NAME2: oTableData.NAME2,
						PERNR: oTableData.PERNR
					};

					// 婚姻状况为空
					oReturnTableRow.FAMST = this.getView().byId("FAMST").getSelectedKey();
					oReturnTableRow.FATXT = this.getView().byId("FAMST").getSelectedItem() != null ? this.getView().byId("FAMST").getSelectedItem().mProperties
						.text : "";

					// 国家/地区为空
					oReturnTableRow.GBLND = this.getView().byId("GBLND").getSelectedKey();

					// 国家/地区为空
					oReturnTableRow.HUKOT = this.getView().byId("HUKOT").getSelectedKey();

					// 个人数据-紧急联系人电话为空
					oReturnTableRow.ZHR_JJLXRDH = this.getView().byId("ZHR_JJLXRDH").getValue();

					// 个人数据-民族为空
					oReturnTableRow.ZHR_JJLXRXM = this.getView().byId("ZHR_JJLXRXM").getValue();

					// 个人数据-紧急联系人姓名为空
					oReturnTableRow.ZHR_MZ = this.getView().byId("ZHR_MZ").getSelectedKey();
					oReturnTableRow.ZHR_MZ_DESC = this.getView().byId("ZHR_MZ").getSelectedItem() != null ? this.getView().byId("ZHR_MZ").getSelectedItem()
						.mProperties.text : "";

					// 个人数据-籍贯省为空
					oReturnTableRow.ZZSTATE = this.getView().byId("ZZSTATE").getSelectedKey();
					oReturnTableRow.ZZSTATE_DESC = this.getView().byId("ZZSTATE").getSelectedItem() != null ? this.getView().byId("ZZSTATE").getSelectedItem()
						.mProperties.text : "";

					// 个人数据-籍贯市为空
					oReturnTableRow.ZZCITY = this.getView().byId("ZZCITY").getSelectedKey();
					oReturnTableRow.ZZCITY_DESC = this.getView().byId("ZZCITY").getSelectedItem() != null ? this.getView().byId("ZZCITY").getSelectedItem()
						.mProperties.text : "";

					// 个人数据-籍贯县为空
					oReturnTableRow.ZZORT01 = this.getView().byId("ZZORT01").getSelectedKey();
					oReturnTableRow.ZZORT01_DESC = this.getView().byId("ZZORT01").getSelectedItem() != null ? this.getView().byId("ZZORT01").getSelectedItem()
						.mProperties.text : "";

					// 个人数据-政治面貌
					// oReturnTableRow.PCODE = this.getView().byId("POLITICAL").getSelectedKey();
					// oReturnTableRow.PCODE_DESC = this.getView().byId("POLITICAL").getSelectedItem() != null ? this.getView().byId("POLITICAL").getSelectedItem()
					// 	.mProperties.text : "";

					oReturnTable.push(oReturnTableRow);
					break;
				case 'MyIdCard':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						if (this.oError != "E") {
							if (oTableData[i].PERNR == undefined) {
								oReturnTableRow.PERNR = this.Pernr;
							} else {
								oReturnTableRow.PERNR = this.Pernr;
							}
							this.checkBeforeSave(oReturnTableRow.PERNR, this.Pernr);
						} else {
							return;
						}

						oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						oReturnTableRow.ICNUM = this.checkBeforeSave(oTableData[i].ICNUM);
						oReturnTableRow.ICTXT = this.checkBeforeSave(oTableData[i].ICTXT);
						oReturnTableRow.ICTYP = this.checkBeforeSave(oTableData[i].ICTYP);
						oReturnTableRow.USEFR = this.checkBeforeSave(oTableData[i].USEFR);
						oReturnTableRow.USETO = this.checkBeforeSave(oTableData[i].USETO);
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Educational':
					var oEducationalData = this.getView().byId("Educational").mBindingInfos.rows.binding.oList;
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						oTableData[i].SUBTY = "10";
						if (this.oError != "E") {
							if (oTableData[i].PERNR == undefined) {
								oReturnTableRow.PERNR = this.Pernr;
							} else {
								oReturnTableRow.PERNR = this.Pernr;
							}
							// oReturnTableRow.PERNR = this.checkBeforeSave(oTableData[i].PERNR);
						} else {
							return;
						}

						oReturnTableRow.ZHR_RXRQ = this.checkBeforeSave(oTableData[i].ZHR_RXRQ);
						oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						oReturnTableRow.FACH3 = this.checkBeforeSave(oTableData[i].FACH3);
						oReturnTableRow.ACAQU = this.checkBeforeSave(oTableData[i].ACAQU);
						oReturnTableRow.ACAQT = this.checkBeforeSave(oTableData[i].ACAQT);
						oReturnTableRow.ZHR_ZYLX = this.checkBeforeSave(oTableData[i].ZHR_ZYLX);
						oReturnTableRow.INSMO = this.checkBeforeSave(oTableData[i].INSMO);
						oReturnTableRow.INSTI = this.checkBeforeSave(oTableData[i].INSTI);
						oReturnTableRow.ACQID = this.checkBeforeSave(oTableData[i].ACQID);
						oReturnTableRow.ACCID = this.checkBeforeSave(oTableData[i].ACCID);
						oReturnTableRow.SLABS = this.checkBeforeSave(oTableData[i].SLABS);
						oReturnTableRow.STEXT = this.checkBeforeSave(oTableData[i].STEXT);
						oReturnTableRow.SUBTY = this.checkBeforeSave(oTableData[i].SUBTY);
						oReturnTableRow.ACAQM = this.checkBeforeSave(oTableData[i].ACAQM);
						oReturnTableRow.ZHR_SFYJS = this.checkBeforeSave(oTableData[i].ZHR_SFYJS);
						oReturnTableRow.ZHR_J = this.checkBeforeSave(oTableData[i].ZHR_J);
						oReturnTableRow.ZHR_YXDW = this.checkBeforeSave(oTableData[i].ZHR_YXDW);
						oReturnTableRow.ZHR_YXDW_DESC = this.checkBeforeSave(oTableData[i].ZHR_YXDW_DESC);
						oReturnTableRow.ZHR_YXLX = this.checkBeforeSave(oTableData[i].ZHR_YXLX);
						oReturnTableRow.ZHR_YXLX_DESC = this.checkBeforeSave(oTableData[i].ZHR_YXLX_DESC);
						switch (oReturnTableRow.ACAQM) {
							case false:
								oReturnTableRow.ACAQM = "";
								break;
							case true:
								oReturnTableRow.ACAQM = "X";
								break;
						}

						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Work':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						oReturnTableRow.ZHR_GZJLLX = this.checkBeforeSave(oTableData[i].ZHR_GZJLLX);
						oReturnTableRow.ZZGZDW = this.checkBeforeSave(oTableData[i].ZZGZDW);
						oReturnTableRow.ZHR_W = this.checkBeforeSave(oTableData[i].ZHR_W);
						oReturnTableRow.ZHR_DRZW = this.checkBeforeSave(oTableData[i].ZHR_DRZW);
						oReturnTableRow.REFER = this.checkBeforeSave(oTableData[i].REFER);
						oReturnTableRow.DEPTN = this.checkBeforeSave(oTableData[i].DEPTN);
						oReturnTableRow.REFCO = this.checkBeforeSave(oTableData[i].REFCO);
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Family':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						oReturnTableRow.CITY1 = this.checkBeforeSave(oTableData[i].CITY1);
						oReturnTableRow.FAMSA = this.checkBeforeSave(oTableData[i].FAMSA);
						oReturnTableRow.FANAM = this.checkBeforeSave(oTableData[i].FANAM);
						oReturnTableRow.GBDAT = this.checkBeforeSave(oTableData[i].GBDAT);
						oReturnTableRow.LAND1 = this.checkBeforeSave(oTableData[i].LAND1);
						oReturnTableRow.LANDX = this.checkBeforeSave(oTableData[i].LANDX);
						oReturnTableRow.STATE = this.checkBeforeSave(oTableData[i].STATE);
						oReturnTableRow.ZHR_LXS = this.checkBeforeSave(oTableData[i].ZHR_LXS);
						oReturnTableRow.ZHR_LXS_DESC = this.checkBeforeSave(oTableData[i].ZHR_LXS_DESC);
						oReturnTableRow.ZHR_LXCS = this.checkBeforeSave(oTableData[i].ZHR_LXCS);
						oReturnTableRow.ZHR_LXCS_DESC = this.checkBeforeSave(oTableData[i].ZHR_LXCS_DESC);
						oReturnTableRow.ZHR_XXDZ = this.checkBeforeSave(oTableData[i].ZHR_XXDZ);
						oReturnTableRow.TELNR = this.checkBeforeSave(oTableData[i].TELNR);
						oReturnTableRow.ZHR_SFSYYG = this.checkBeforeSave(oTableData[i].ZHR_SFSYYG);
						switch (oReturnTableRow.ZHR_SFSYYG) {
							case false:
								oReturnTableRow.ZHR_SFSYYG = "";
								break;
							case true:
								oReturnTableRow.ZHR_SFSYYG = "X";
								break;
						}
						oReturnTableRow.ZHR_XXDZ = this.checkBeforeSave(oTableData[i].ZHR_XXDZ);
						oReturnTableRow.ZZGZDW = this.checkBeforeSave(oTableData[i].ZZGZDW);
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Address':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						oReturnTableRow.ANSSA = this.checkBeforeSave(oTableData[i].ANSSA);
						oReturnTableRow.LAND1 = this.checkBeforeSave(oTableData[i].LAND1);
						oReturnTableRow.ZHR_S = this.checkBeforeSave(oTableData[i].ZHR_S);
						oReturnTableRow.ZHR_S_DESC = this.checkBeforeSave(oTableData[i].ZHR_S_DESC);
						oReturnTableRow.ZHR_CS_DESC = this.checkBeforeSave(oTableData[i].ZHR_CS_DESC);
						oReturnTableRow.ZHR_X_DESC = this.checkBeforeSave(oTableData[i].ZHR_X_DESC);
						oReturnTableRow.ZHR_CS = this.checkBeforeSave(oTableData[i].ZHR_CS);
						oReturnTableRow.ZHR_X = this.checkBeforeSave(oTableData[i].ZHR_X);
						oReturnTableRow.LOCAT = this.checkBeforeSave(oTableData[i].LOCAT);
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'Communication':
					for (var i = 0; i < oTableData.length; i++) {
						oReturnTableRow = {};
						if (this.oError != "E") {
							oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						} else {
							return;
						}

						oReturnTableRow.PERNR = this.checkBeforeSave(this.Pernr);
						oReturnTableRow.BEGDA = this.checkBeforeSave(oTableData[i].BEGDA);
						oReturnTableRow.ENDDA = this.checkBeforeSave(oTableData[i].ENDDA);
						oReturnTableRow.SUBTY = this.checkBeforeSave(oTableData[i].SUBTY);
						oReturnTableRow.USRID_LONG = this.checkBeforeSave(oTableData[i].USRID_LONG);
						oReturnTable.push(oReturnTableRow);
					}
					break;
				case 'MyFile':
					var Counter = 1;
					for (var i = 0; i < 11; i++) {
						var oModelName = "MyFile" + Counter;
						var oFileArr = this.getView().getModel(oModelName) != undefined ? this.getView().getModel(oModelName).oData : undefined;
						if (oFileArr != undefined && oFileArr.length != 0) {
							for (var j = 0; j < oFileArr.length; j++) {
								oReturnTableRow = {
									FILENAME: oFileArr[j].FILENAME,
									FILENAME_OLD: oFileArr[j].FILENAME_OLD,
									MIMETYPE: oFileArr[j].MIMETYPE,
									PERNR: oFileArr[j].PERNR,
									PRE_FILETYPE: oFileArr[j].PRE_FILETYPE,
									SYDATE: oFileArr[j].SYDATE,
									SYTIME: oFileArr[j].SYTIME,
									SYUNAME: oFileArr[j].SYUNAME,
									URL: oFileArr[j].URL,
									// VALUE: oFileArr[j].VALUE,
									HREF: oFileArr[j].HREF,
									UUID: oFileArr[j].UUID
								};
								oReturnTable.push(oReturnTableRow);
							}
						}
						// else {
						// 	var oCounterNum = this.leadZero(Counter, 2);
						// 	if (oCounterNum == "01" || oCounterNum == "02" || oCounterNum == "03") {
						// 		var oI18nName = "oCheckFileIsNull" + oCounterNum;
						// 		this.oError = 'E';
						// 		this.oMessage = this._ResourceBundle.getText(oI18nName);
						// 		// break;
						// 	}
						// }
						Counter++;
					}

					break;
			}
			return oReturnTable;
		},
		checkBeforeSave: function(oTableDataFile) {
			return oTableDataFile == undefined ? "" : oTableDataFile;
		},
		// checkAndShowMsg: function(oField, oViewId, oFieldId, oMsg) {
		// 	var checkFlag = true;
		// 	if ($.isEmptyObject(oField)) {
		// 		this.oView.byId(oViewId).byId(oFieldId).setValueState("Error");
		// 		this.oView.byId(oViewId).byId(oFieldId).setValueStateText(oMsg);
		// 		checkFlag = false;
		// 		this.checkMsg.push(oMsg);
		// 	} else {
		// 		this.oView.byId(oViewId).byId(oFieldId).setValueState("None");
		// 		checkFlag = true;
		// 	}
		// 	return checkFlag;
		// },

		onSumbit: function(oEvent) {

			var that = this;

			this.oReturnTable = this.getSaveTable("Submit");
			if (this.oError == "E") {
				that.ShowMessage(this.oMessage);
				return;
			} else {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.warning(
					this._ResourceBundle.getText("oCheckBeforeSumbit"), {
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(sAction) {
							if (sAction == 'OK') {
								that.onSumbitOK(that.oReturnTable);
							}
						}
					});
			}

		},
		onSumbitOK: function(oReturnTable) {

			this.openBusyDialog();
			var that = this;
			var sPath = "/ZEntry_People_DeepSet";
			oReturnTable.ZZAction = "PEOPLE_INFO_SUMBIT";
			oReturnTable.Ename = this.Ename;
			oReturnTable.PCODE = this.getModel("PersonInfo").oData.Pcode;
			oReturnTable.Phone = this.Phone;
			oReturnTable.Pernr = this.Pernr;
			// oReturnTable.FILETYPE01MAX = this.FileType01Max;
			// oReturnTable.FILETYPE02MAX = this.FileType02Max;
			// oReturnTable.FILETYPE03MAX = this.FileType03Max;
			// oReturnTable.FILETYPE04MAX = this.FileType04Max;
			// oReturnTable.FILETYPE05MAX = this.FileType05Max;
			// oReturnTable.FILETYPE06MAX = this.FileType06Max;
			// oReturnTable.FILETYPE07MAX = this.FileType07Max;
			// oReturnTable.FILETYPE08MAX = this.FileType08Max;
			// oReturnTable.FILETYPE09MAX = this.FileType09Max;
			// oReturnTable.FILETYPE10MAX = this.FileType10Max;
			// oReturnTable.FILETYPE11MAX = this.FileType11Max;

			oReturnTable.FILETYPE01MAX = this.FileType01Max.toString();
			oReturnTable.FILETYPE02MAX = this.FileType02Max.toString();
			oReturnTable.FILETYPE03MAX = this.FileType03Max.toString();
			oReturnTable.FILETYPE04MAX = this.FileType04Max.toString();
			oReturnTable.FILETYPE05MAX = this.FileType05Max.toString();
			oReturnTable.FILETYPE06MAX = this.FileType06Max.toString();
			oReturnTable.FILETYPE07MAX = this.FileType07Max.toString();
			oReturnTable.FILETYPE08MAX = this.FileType08Max.toString();
			oReturnTable.FILETYPE09MAX = this.FileType09Max.toString();
			oReturnTable.FILETYPE10MAX = this.FileType10Max.toString();
			oReturnTable.FILETYPE11MAX = this.FileType11Max.toString();
			this.oDataModelPreEntry.create(sPath, oReturnTable, { //
				success: function(oData, oResponse) {
					that.oBusyDialog.close();
					if (oData.Type == 'E') {
						that.ShowMessage(oData.Message);
					} else {
						MessageBox.success('提交成功！');

					}
				},
				error: function(oError) {
					that.oBusyDialog.close();
					// that.oInitCheckDialog.close();
				}
			});
		},
		formatHUKOT: function(oInput) {
			switch (oInput) {
				case '1':
					return '非农业户口';
				case '2':
					return '农业户口';
				case '3':
					return '其他';
				case '':
					return '';
			}
		},
		formatGESCH: function(oInput) {
			switch (oInput) {
				case '1':
					return '男';
				case '2':
					return '女';
				case '3':
					return '其他';
			}
		},
		ValueHelp: function(oEvent) {

			// this.getView().setBusy(true);
			var that = this;

			var fcode = this.getfcode(oEvent, 2), //when you use the object in fragment you should give the second parameter value 2
				sPath = "/ZSEARCH_HELPSet",
				oFilters = [];
			var oModelName, oPath;
			var oListenViewContext = oEvent.getSource().oPropagatedProperties.oBindingContexts; //get the listen view 

			for (var oListenViewName in oListenViewContext) {
				if (oListenViewName != undefined) {
					oModelName = oListenViewName;
					oPath = oListenViewContext[oListenViewName].sPath.split("/")[1];
				}
			}
			var oTableData = this.getView().getModel(oModelName).oData; // data in table
			switch (fcode) {
				case "GBLND_0006":
					var EZf4id = "GBLND";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleGblnd"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "STATE_0006":
					var EZf4id = "STATE";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].LAND1 == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4CountryIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].LAND1));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleState"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "ORT01_0006":
					var EZf4id = "ORT01";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].ZHR_S == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4ProvinceIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].ZHR_S));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleOrt01"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "ORT02_0006":
					var EZf4id = "ORT02";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].ZHR_CS == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4CityIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].ZHR_CS));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleOrt02"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "CITY1_0021":
					var EZf4id = "CITY1_0021";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].ORT01 == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4CityIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].ORT01));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleOrt02"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
			}
			this._JSONModel.setProperty("/appProperties/fcode", EZf4id, false);
			this.oDataModelPreEntry.read(sPath, { //
				filters: oFilters,
				success: function(oData, oResponse) {

					var oJson = oData.results;
					that.getView().getModel().setProperty("/searchHelp/f4h2r", oJson);
					that.openDialog(oEvent);
					that.getView().setBusy(false);
				},
				error: function(error) {
					that.getView().setBusy(false);
				}
			});

		},
		ValueHelpTable: function(oEvent) {
			// this.openBusyDialog();
			// this.getView().setBusy(true);
			var that = this;

			var fcode = this.getfcode(oEvent, 2), //when you use the object in fragment you should give the second parameter value 2
				sPath = "/ZSEARCH_HELPSet",
				oFilters = [];
			var oModelName, oPath;
			var oListenViewContext = oEvent.getSource().oPropagatedProperties.oBindingContexts; //get the listen view 

			for (var oListenViewName in oListenViewContext) {
				if (oListenViewName != undefined) {
					oModelName = oListenViewName;
					oPath = oListenViewContext[oListenViewName].sPath.split("")[1];
				}
			}
			var oTableData = this.getView().getModel(oModelName).oData; // data in table

			switch (fcode) {
				case "TAB_LAND1_0006":
					var EZf4id = "TAB_LAND1_0006";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleGblnd"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_LAND1_0021":
					var EZf4id = "TAB_LAND1_0021";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleGblnd"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_ZHR_LXS_0021":
					var EZf4id = "TAB_ZHR_LXS_0021";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].LAND1 == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4CountryIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].LAND1));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleState"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_ZHR_LXCS_0021":
					var EZf4id = "TAB_ZHR_LXCS_0021";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].ZHR_LXS == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4CountryIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].ZHR_LXS));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleState"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_ACAQU":
					var EZf4id = "TAB_ACAQU";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleAcaqu"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_SLABS":
					var EZf4id = "TAB_SLABS";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].ACAQU == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4AcaquIsNull"));
						return;
					}
					oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].ACAQU));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleSlabs"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_ZHR_S_0006":
					var EZf4id = "TAB_ZHR_S_0006";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].LAND1 == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4CountryIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].LAND1));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleState"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_ZHR_CS_0006":
					var EZf4id = "TAB_ZHR_CS_0006";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].ZHR_S == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4ProvinceIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].ZHR_S));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleOrt01"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_ZHR_X_0006":
					var EZf4id = "TAB_ZHR_X_0006";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					if (oTableData[oPath].ZHR_CS == "") {
						this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4CityIsNull"));
						return;
					}
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, oTableData[oPath].ZHR_CS));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleOrt02"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
				case "TAB_QUCEC":
					var EZf4id = "TAB_QUCEC";
					oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
					this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleQucec"));
					this._JSONModel.setProperty("/searchHelp/Zvkey2", "", false);
					this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
					this._JSONModel.setProperty("/searchHelp/Path", oPath, false);
					break;
			}

			this._JSONModel.setProperty("/appProperties/fcode", EZf4id, false);

			this.oDataModelPreEntry.read(sPath, { //
				filters: oFilters,
				success: function(oData, oResponse) {

					var oJson = oData.results;
					that.getView().getModel().setProperty("/searchHelp/f4h2r", oJson);
					that.oBusyDialog.close();
					// oModel.setSizeLimit(9999);
					// that.getView().getModel().getProperty("/searchHelp")
					that.openDialog(oEvent);
					that.getView().setBusy(false);
				},
				error: function(error) {
					that.oBusyDialog.close();
					that.getView().setBusy(false);
				}
			});
		},
		openDialog: function(oEvent) {

			if (!this._nonCR) {
				this._nonCR = new searchHelp(this.getView());
			}
			this._nonCR.openDialog(oEvent);
			// this.setBusy(false);
		},
		handleChange: function(oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				oValiData = oValidatedComboBox.getItems(),
				sValue = oValidatedComboBox.getValue();

			var oFalg = false;
			for (var i = 0; i < oValiData.length; i++) {
				if (oValiData[i].getText() == sValue) {
					oFalg = true;
					break;
				}
			}

			if (oFalg == false) {
				oValidatedComboBox.setValueState("Error");
				oValidatedComboBox.setValueStateText(sValue & this._ResourceBundle.getText("oCheckErrorEname").oErrorComboBox);
			} else {
				oValidatedComboBox.setValueState("None");
			}

		},
		formatPRE_FILETYPE: function(oInput) {
			var oFileDrop = window.oData.navToDD07T.results; //文件
			for (var i = 0; i < oFileDrop.length; i++) {
				if (oFileDrop[i].DomvalueL == this.oUploadFileType) {
					return oFileDrop[i].Ddtext;
				}
			}
			// var oFileDrop = this.createFileTable(); //文件
			// for (var i = 0; i < oFileDrop.length; i++) {
			// 	if (oFileDrop[i].FileType == oInput) {
			// 		return oFileDrop[i].FileDesc;
			// 	}
			// }
		},
		formatACAQM: function(oInput) {
			if (oInput == 'X') {
				return true;
			} else {
				return false;
			}
		},
		onChangeEvent: function(oEvent) {
			// debugger;
			// this.getView().setBusy(true);
			var that = this;

			var fcode = this.getfcode(oEvent, 2); //when you use the object in fragment, you should give the second parameter value 2

			var oModelName, oPath;
			var oListenViewContext = oEvent.getSource().oPropagatedProperties.oBindingContexts; //get the listen view 

			for (var oListenViewName in oListenViewContext) {
				if (oListenViewName != undefined) {
					oModelName = oListenViewName;
					oPath = oListenViewContext[oListenViewName].sPath.split("")[1];
				}
			}
			var oTableData = this.getView().getModel(oModelName).oData; // data in table
			switch (fcode) {
				case "TAB_ACAQM":
					var oSelect = oEvent.getParameters().selected;
					oTableData[oPath].ACAQM = oSelect == true ? 'X' : "";
					this.getView().setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_ZHR_SFSYYG":
					var oSelect = oEvent.getParameters().selected;
					oTableData[oPath].ZHR_SFSYYG = oSelect == true ? 'X' : "";
					this.getView().setModel(new JSONModel(oTableData), oModelName);
					break;
			}
		},
		onChangeICNUM: function(oEvent) {
			var oModelName, oPath;
			var oListenViewContext = oEvent.getSource().oPropagatedProperties.oBindingContexts; //get the listen view 
			var oPersonInfo = this.getView().getModel("PersonInfo").oData;

			for (var oListenViewName in oListenViewContext) {
				if (oListenViewName != undefined) {
					oModelName = oListenViewName;
					oPath = oListenViewContext[oListenViewName].sPath.split("")[1];
				}
			}
			var oTableData = this.getView().getModel(oModelName).oData; // data in table	
			if (oTableData[oPath].ICTYP == '10') {
				oPersonInfo.GBDAT = oTableData[oPath].ICNUM.substr(6, 8);
				this.getView().setModel(new JSONModel(oPersonInfo), "PersonInfo");
			}
			this.changeEditable0185();
		},
		onChangeGblnd: function(oEvent) {
			var selectKey = oEvent.getSource().getSelectedItem().getKey();
			// var oStateArr = this.changeZzstate(selectKey);
			var oDropModel = this.getView().getModel("oDropModel").oData;
			var oPersonInfo = this.getView().getModel("PersonInfo").oData;
			oPersonInfo.ZZSTATE = "";
			oPersonInfo.ZZCITY = "";
			oPersonInfo.ZZORT01 = "";
			this.getView().setModel(new JSONModel(oPersonInfo), "PersonInfo");

			oDropModel.zzstateDrop = this.changeZzstate(selectKey);
			this.getView().setModel(new JSONModel(oDropModel), "oDropModel");

			// oDropModel.refresh();
			// zzstateDrop: that.changeZzstate(oPersonInfo.GBLND), //省
			// zzCityDrop: window.oData.navToCITY.results, //市
			// zzOrt01Drop: window.oData.navToORT01.results, //县			
		},
		changeZzstate: function(Gblnd) {
			var oStateArr = [];
			var oStateArrAll = window.oData.navToSTATE.results;
			for (var i = 0; i < oStateArrAll.length; i++) {
				if (oStateArrAll[i].ZHR_SJDM == Gblnd) {
					oStateArr.push(oStateArrAll[i]);
				}
			}
			return oStateArr;
		},
		onChangeZzstate: function(oEvent) {
			var oDropModel = this.getView().getModel("oDropModel");
			var oPersonInfo = this.getView().getModel("PersonInfo").oData;
			if (oEvent.getSource().getSelectedKey() == "") {
				return;
			}
			var selectKey = oEvent.getSource().getSelectedItem().getKey();
			// var oStateArr = this.changeZzCity(selectKey);
			oPersonInfo.ZZCITY = "";
			oPersonInfo.ZZORT01 = "";
			this.getView().setModel(new JSONModel(oPersonInfo), "PersonInfo");
			oDropModel.refresh();
			oDropModel.oData.zzCityDrop = this.changeZzCity(selectKey);
			// this.getView().setModel(newoDropModel, "oDropModel");
			oDropModel.refresh();

		},
		changeZzCity: function(State) {
			var oStateArr = [];
			var oCityArrAll = window.oData.navToCITY.results;
			for (var i = 0; i < oCityArrAll.length; i++) {
				if (oCityArrAll[i].ZHR_SJDM == State) {
					oStateArr.push(oCityArrAll[i]);
				}
			}
			return oStateArr;
		},
		onChangeZzCity: function(oEvent) {
			var oDropModel = this.getView().getModel("oDropModel");
			var oPersonInfo = this.getView().getModel("PersonInfo").oData;
			if (oEvent.getSource().getSelectedKey() == "") {
				return;
			}
			var selectKey = oEvent.getSource().getSelectedItem().getKey();
			oPersonInfo.ZZORT01 = "";
			this.getView().setModel(new JSONModel(oPersonInfo), "PersonInfo");
			oDropModel.refresh();
			oDropModel.oData.zzOrt01Drop = this.changeOrt01(selectKey);
			// this.getView().setModel(oDropModel, "oDropModel");
			oDropModel.refresh();

		},
		changeOrt01: function(Ort01) {
			var oOrt01Arr = [];
			var oCityArrAll = window.oData.navToORT01.results;
			for (var i = 0; i < oCityArrAll.length; i++) {
				if (oCityArrAll[i].ZHR_SJDM == Ort01) {
					oOrt01Arr.push(oCityArrAll[i]);
				}
			}
			return oOrt01Arr;

		},
		onShowDocument: function(oEvent) {
			var oParts = oEvent.getSource().mBindingInfos.text.parts[0];
			var oModelName = oParts.model,
				oFileName = oEvent.getSource().mProperties.text;
			var oFileArr = this.getView().getModel(oModelName).oData;

			var Image = {
				TitleMyFile: "", //title for Dialog
				HREF: "",
				PRE_FILETYPE: "",
				Content: ""
			};
			for (var i = 0; i < oFileArr.length; i++) {
				if (oFileArr[i].FILENAME == oFileName) {
					Image.TitleMyFile = this._ResourceBundle.getText("Title" + oModelName);
					// Image.HREF = oFileArr[i].HREF;
					Image.HREF = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port :
							"") + '/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename=' + "'" + encodeURIComponent(oFileArr[i].FILENAME) +
						"',Zhr_file_class='ZPRE_ENTRY')/$value";
					Image.PRE_FILETYPE = oFileArr[i].PRE_FILETYPE;
					// Image.Content = "<iframe src=" + Image.HREF +  " height='100%' width='100%'></iframe>";
					// Image.Content = "<iframe src="+'"http://sap-s4d-app.sunnyoptical.cn:8000/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/ZSY_D_FILESet(Filename='+"'10000008_体检报告_20201230_01,Zhr_file_class='ZPRE_ENTRY')/$value'"+"height='100%' width='100%'></iframe>";
					break;
				}
			}
			this.getView().setModel(new JSONModel(Image), "Image");

			// init Dialog
			window.open(Image.HREF);
			// if (oFileArr[i].PRE_FILETYPE == "01" || oFileArr[i].PRE_FILETYPE == "02" || oFileArr[i].PRE_FILETYPE == "03" || oFileArr[i].PRE_FILETYPE ==
			// 	"04") {
			// 	if (!this.ShowImageDialog) {
			// 		this.ShowImage_oId = this.generateMixed(20); //Math.random().toString(36).substr(2);
			// 		this.ShowImageDialog = sap.ui.xmlfragment(this.ShowImage_oId, "ZPreEntryPeopleInfo.fragment.ShowImageView", this);
			// 		this.getView().addDependent(this.ShowImageDialog);
			// 	}
			// 	// open value help dialog
			// 	this.ShowImageDialog.open();
			// } else {
			// 	window.open(Image.HREF);
			// }

		},
		onCloseImageDialog: function(oEvent) {
			this.ShowImageDialog.close();
		},
		onConfirmPdf: function(oEvent) {
			this.ShowPdfDialog.close();
		},
		// formatGBLND:function(oInput){
		// 	var Length = window.oData.navToZSY_TT_RDMB.results.length;
		// 	for(var i =0;i<Length;i++){
		// 		if(window.oData.navToZSY_TT_RDMB.results[i].ZHR_DOMNAME == 'ZSY_DM_STATE' && oInput == window.oData.navToZSY_TT_RDMB.results[i].ZHR_DM){
		// 			return window.oData.navToZSY_TT_RDMB.results[i].ZHR_DMMS;
		// 		}
		// 	}
		// },
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf view.ZPreEntryPeopleInfo
		 */
		onExit: function(oEvent) {

		}
	});
});