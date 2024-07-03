import babelTraverse from "@babel/traverse";
import { parse, ParserPlugin } from "@babel/parser";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { readFileSync } from "fs";
import path from "path";
import { convertFunction } from "../src/convertFunction";

const expectCode = (ast) => {
  expect(generate(ast).code).toMatchSnapshot();
};

const printCode = (ast) => {
  console.log(generate(ast).code);
};

const json = readFileSync(
  path.resolve(__dirname, "..") + "/example-methods.json",
  "utf-8"
);

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

const jsonAll = JSON.parse(json);
const list = Object.keys(jsonAll);

it("works", () => {
  let code = "";
  list.forEach((k) => {
    code += `${convertFunction(jsonAll[k], options)}\n\n`;
  });
  expect(code).toMatchSnapshot();
});
