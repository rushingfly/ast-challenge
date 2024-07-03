// JSON parameter
export interface InputJson {
  requestType: string;
  responseType: string;
}

// Options parameter
export interface InputOptions {
  queryInterface: string;
  tDataName: string;
  extendsInterfaceName: string;
  hookParamsTypeName: string;
  hookName: string;
  keyName: string;
  queryService: string;
  queryServiceMethodName: string;
  errorMsgText: string;
}
