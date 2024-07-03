import babelTraverse from "@babel/traverse";
import { parse, ParserPlugin } from "@babel/parser";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { convertFunction } from "../src/convertFunction";

const expectCode = (ast) => {
  expect(generate(ast).code).toMatchSnapshot();
};

const printCode = (ast) => {
  console.log(generate(ast).code);
};

const json = `
  {
    "Pools": {
        "requestType": "QueryPoolsRequest",
        "responseType": "QueryPoolsResponse"
    }
  }`;

const options = {
  queryInterface: "UsePoolsQuery",
  tDataName: "TData",
  extendsInterfaceName: "ReactQueryParams",
  hookParamsTypeName: "UsePoolsQuery",
  hookName: "usePools",
  keyName: "poolsQuery",
  queryService: "queryService",
  queryServiceMethodName: "pools",
  errorMsgText: "Query Service not initialized",
};

const jsonObj = JSON.parse(json).Pools;
it("works", () => {
  const code = convertFunction(jsonObj, options);
  expect(code).toMatchSnapshot();
});
