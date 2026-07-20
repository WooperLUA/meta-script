import {parse} from "@babel/parser";

export const parse_code = (bytes: string, is_jsx = false) =>
{
    const plugins: any[] = ["typescript"];

    if (is_jsx)
    {
        plugins.push("jsx");
    }

    return parse(bytes, {
        sourceType:    "module",
        plugins:       plugins,
        errorRecovery: true,
        tokens:        true
    });
};

export const parse_macro_definitions = (ast: any) =>
{
    const macros: any[] = [];
    const tokens = ast.tokens || [];
    const body = ast.program.body;
    const seen_starts = new Set<number>();

    for (let i = 0; i < tokens.length; i++)
    {
        const token = tokens[i];

        if (token.type.label === "name" && token.value === "__ms_macro__")
        {
            if (seen_starts.has(token.start))
            {
                continue;
            }

            const colon_token = tokens[i + 1];
            const function_token = tokens[i + 2];

            if (
                colon_token && colon_token.type.label === ":" &&
                function_token && function_token.type.label === "function"
            )
            {
                const name_token = tokens[i + 3];

                if (name_token && name_token.type.label === "name")
                {
                    const macro_name = name_token.value;
                    const params: string[] = [];
                    let next_idx = i + 4;

                    if (tokens[next_idx] && tokens[next_idx].type.label === "(")
                    {
                        next_idx++;
                        while (tokens[next_idx] && tokens[next_idx].type.label !== ")")
                        {
                            const param_token = tokens[next_idx];
                            if (param_token.type.label === "...")
                            {
                                next_idx++;
                                if (tokens[next_idx] && tokens[next_idx].type.label === "name")
                                {
                                    params.push("..." + tokens[next_idx].value);
                                }
                            }
                            else if (param_token.type.label === "name")
                            {
                                params.push(param_token.value);
                            }
                            next_idx++;
                        }
                        next_idx++;
                    }

                    const body_block = find_associated_block(body, tokens[next_idx - 1].end);
                    if (body_block)
                    {
                        macros.push({
                            name:   macro_name,
                            params: params,
                            start:  token.start,
                            end:    body_block.end,
                            body:   body_block
                        });

                        seen_starts.add(token.start);
                    }
                }
            }
        }
    }

    return macros;
};

const find_associated_block = (nodes: any[], start_position: number): any | null =>
{
    for (const node of nodes)
    {
        if (node.end >= start_position)
        {
            if (node.type === "BlockStatement")
            {
                return node;
            }
            if (node.type === "ExpressionStatement" && node.expression.type === "BlockStatement")
            {
                return node.expression;
            }
            if (node.body)
            {
                if (Array.isArray(node.body))
                {
                    const found = find_associated_block(node.body, start_position);
                    if (found) return found;
                }
                else
                {
                    const found = find_associated_block([node.body], start_position);
                    if (found) return found;
                }
            }
        }
    }
    return null;
};

export const find_macro_usages = (node: any, macro_names: Set<string>, usages: any[] = []) =>
{
    if (!node) return usages;

    if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        macro_names.has(node.callee.name)
    )
    {
        usages.push({
            name:      node.callee.name,
            arguments: node.arguments,
            start:     node.start,
            end:       node.end
        });
    }

    for (const key in node)
    {
        if (node[key] && typeof node[key] === "object")
        {
            if (Array.isArray(node[key]))
            {
                for (const child of node[key])
                {
                    find_macro_usages(child, macro_names, usages);
                }
            }
            else
            {
                find_macro_usages(node[key], macro_names, usages);
            }
        }
    }

    return usages;
};