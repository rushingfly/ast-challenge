import generate from "@babel/generator";
import * as t from "@babel/types";
import { InputJson, InputOptions } from "./convertFunction.d";

/*
    The function to convert AST to TS code.
    jsonParams: the converted JSON object
    options: all the params need to be parameterized
*/
export const convertFunction = (
  jsonParams: InputJson,
  options: InputOptions
): string => {
  if (!jsonParams) {
    return;
  }
  const { requestType, responseType } = jsonParams;
  const {
    queryInterface,
    tDataName,
    extendsInterfaceName,
    hookParamsTypeName,
    hookName,
    keyName,
    queryService,
    queryServiceMethodName,
    errorMsgText,
  } = options;

  const interfactStatement = t.exportNamedDeclaration(
    t.tsInterfaceDeclaration(
      t.identifier(queryInterface),
      t.tsTypeParameterDeclaration([t.tsTypeParameter(null, null, tDataName)]),
      [
        t.tsExpressionWithTypeArguments(
          t.identifier(extendsInterfaceName),
          t.tsTypeParameterInstantiation([
            t.tsTypeReference(t.identifier(responseType)),
            t.tsTypeReference(t.identifier(tDataName)),
          ])
        ),
      ],
      t.tsInterfaceBody([
        t.tsPropertySignature(
          // hack: should be a optional prop, but didn't find the param.
          t.identifier("request?"),
          t.tsTypeAnnotation(t.tsTypeReference(t.identifier(requestType)))
        ),
      ])
    )
  );

  const typeParameter = t.tsTypeParameterDeclaration([
    t.tsTypeParameter(
      null,
      t.tsTypeReference(t.identifier(responseType)),
      tDataName
    ),
  ]);

  const params = t.objectPattern([
    t.objectProperty(
      t.identifier("request"),
      t.identifier("request"),
      false,
      true
    ),
    t.objectProperty(
      t.identifier("options"),
      t.identifier("options"),
      false,
      true
    ),
  ]);
  params.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier(hookParamsTypeName),
      t.tsTypeParameterInstantiation([
        t.tsTypeReference(t.identifier(tDataName)),
      ])
    )
  );

  const useQueryCallExpression = t.callExpression(t.identifier("useQuery"), [
    t.arrayExpression([t.stringLiteral(keyName), t.identifier("request")]),
    t.arrowFunctionExpression(
      [],
      t.blockStatement([
        t.ifStatement(
          t.unaryExpression("!", t.identifier(queryService)),
          t.throwStatement(
            t.newExpression(t.identifier("Error"), [
              t.stringLiteral(errorMsgText),
            ])
          )
        ),
        t.returnStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier(queryService),
              t.identifier(queryServiceMethodName)
            ),
            [t.identifier("request")]
          )
        ),
      ])
    ),
    t.identifier("options"),
  ]);

  useQueryCallExpression.typeParameters = t.tsTypeParameterInstantiation([
    t.tsTypeReference(t.identifier(responseType)),
    t.tsTypeReference(t.identifier("Error")),
    t.tsTypeReference(t.identifier(tDataName)),
  ]);

  const usePoolsFunction = t.arrowFunctionExpression(
    [params],
    t.blockStatement([t.returnStatement(useQueryCallExpression)])
  );
  usePoolsFunction.typeParameters = typeParameter;

  const usePoolsStatement = t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier(hookName), usePoolsFunction),
  ]);

  return generate(
    t.file(
      t.program([
        /*
            export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> {
                request?: QueryPoolsRequest;
            }
        */
        interfactStatement,
        /*
            const usePools = <TData = QueryPoolsResponse,>({
                request,
                options
            }: UsePoolsQuery<TData>) => {
                return useQuery<QueryPoolsResponse, Error, TData>(["poolsQuery", request], () => {
                    if (!queryService) throw new Error("Query Service not initialized");
                    return queryService.pools(request);
                }, options);
            };
        */
        usePoolsStatement,
      ])
    ) as any
  ).code;
};
