sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createLocalModel: function() {
			var oModel = new JSONModel(this._initialLocalData());
			oModel.setSizeLimit(9999);
			return oModel;
		},
		_initialLocalData: function() {

			var localData = {

				// ---responseCode,data;
				Baecode: "",
				appProperties: {
					busy: false,
					editable: false,
					needSave: false,
					// 附件相关
					deleteVisible: true,
					uploadInvisible: false,
					bcode: "",
					fcode: ""
				},
				verReturn: {},
				messages: {
					buttonWidth: "0em",
					counter: 0,
					counterE: 0,
					content: []
				},
				ODataMetadata: {},

				searchHelp: {
					EMaxrecords: 500,
					F4ID: "",
					ModelName:"",
					Path:"",
					KEY1: "",
					KEY2: "",
					VALUE1: "",
					VALUE2: "",
					FILTER1: "",
					f4h2r: []
				},
				PersonInfo: {
					FAMST: "",
					FATXT: "",
					GBDAT: "",
					GBLND: "",
					GESCH: "",
					HUKOT: "",
					NACHN: "",
					NAME2: "",
					PERNR: "",
					ZHR_JJLXRDH: "",
					ZHR_JJLXRXM: "",
					ZHR_MZ: "",
					ZHR_MZ_DESC: "",
					ZZCITY: "",
					ZZCITY_DESC: "",
					ZZORT01: "",
					ZZORT01_DESC: "",
					ZZSTATE: "",
					ZZSTATE_DESC: ""
				},
				MyIdCard: {
					BEGDA: "",
					ICNUM: "",
					ENDDA: "",
					ICTXT: "",
					ICTYP: "",
					PERNR: "",
					USEFR: "",
					USETO: ""
				},
				Educational: {
					ACAQM: "",
					ACAQU: "",
					ACCID: "",
					ACQID: "",
					BEGDA: "",
					ENDDA: "",
					FACH3: "",
					INSMO: "",
					INSTI: "",
					PERNR: "",
					SLABS: "",
					SUBTY: "",
					ZHR_J: "",
					ZHR_RXRQ: "",
					ZHR_SFYJS: "",
					ZHR_YXDW: "",
					ZHR_YXLX: "",
					ZHR_ZYLX: ""
				},
				Work: {
					PERNR: "",
					BEGDA: "",
					ENDDA: "",
					ZHR_GZJLLX: "",
					ZZGZDW: "",
					ZHR_W: "",
					DEPTN: "",
					ZHR_DRZW: "",
					REFER: "",
					REFCO: ""
				},
				Family: {
					BEGDA: "",
					CITY1: "",
					ENDDA: "",
					FAMSA: "",
					FANAM: "",
					GBDAT: "",
					GESCH: "",
					LAND1: "",
					PERNR: "",
					STATE: "",
					TELNR: "",
					ZHR_SFSYYG: "",
					ZHR_XXDZ: "",
					ZZGZDW: ""
				},
				Address: {
					ANSSA: "",
					BEGDA: "",
					ENDDA: "",
					GBLND: "",
					LOCAT: "",
					ORT01: "",
					ORT02: "",
					PERNR: "",
					STATE: ""
				},
				Communication: {
					BEGDA: "",
					ENDDA: "",
					PERNR: "",
					SUBTY: "",
					USRID: "",
					USRID_LONG: "",
					USRTY: ""
				},
				MyFile: {
					FILENAME: "",
					FILENAME_OLD: "",
					MIMETYPE: "",
					PERNR: "",
					PRE_FILETYPE: "",
					SYDATE: "",
					SYTIME: "",
					SYUNAME: "",
					URL: "",
					VALUE: ""
				}
			};

			var uR = $.ajax({
				url: "/sap/bc/ui2/start_up",
				async: false
			});

			if (uR.status === 200) {
				localData.userSet = uR.responseJSON;
			}

			return localData;
		},
		getHost: function() {
			var host = {
				sURI: '/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/',
				ODataServiceUrl: window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port :
					"") + '/sap/opu/odata/sap/ZSY_HR_PRE_ENTRY_SRV/',
				sdealPath: "/ZSEARCH_HELPSet"
			};

			return host;
		}

	};
});