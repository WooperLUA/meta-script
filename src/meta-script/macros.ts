import generate from "@babel/generator";
import {parse_code, find_macro_usages} from "./parser";

const clone_node = (node: any): any =>
{
    return JSON.parse(JSON.stringify(node));
};

const find_local_declarations = (node: any, params: string[], local_vars: Set<string>) =>
{
    if (!node) return;

    if (node.type === "VariableDeclarator" && node.id && node.id.type === "Identifier")
    {
        const name = node.id.name;
        if (!params.includes(name))
        {
            local_vars.add(name);
        }
    }

    for (const key in node)
    {
        if (node[key] && typeof node[key] === "object")
        {
            if (Array.isArray(node[key]))
            {
                for (const child of node[key])
                {
                    find_local_declarations(child, params, local_vars);
                }
            }
            else
            {
                find_local_declarations(node[key], params, local_vars);
            }
        }
    }
};

const apply_hygiene_renaming = (node: any, renaming_map: Map<string, string>, parent_node: any = null) =>
{
    if (!node) return;

    if (node.type === "Identifier" && renaming_map.has(node.name))
    {
        const is_object_property = parent_node &&
            parent_node.type === "MemberExpression" &&
            parent_node.property === node &&
            !parent_node.computed;

        if (!is_object_property)
        {
            node.name = renaming_map.get(node.name)!;
        }
    }

    for (const key in node)
    {
        if (node[key] && typeof node[key] === "object")
        {
            if (Array.isArray(node[key]))
            {
                for (const child of node[key])
                {
                    apply_hygiene_renaming(child, renaming_map, node);
                }
            }
            else
            {
                apply_hygiene_renaming(node[key], renaming_map, node);
            }
        }
    }
};

const substitute_arguments = (node: any, params: string[], args: any[]) =>
{
    if (!node) return;

    for (const key in node)
    {
        const child = node[key];
        if (child && typeof child === "object")
        {
            if (child.type === "Identifier")
            {
                const param_index = params.indexOf(child.name);
                if (param_index !== -1 && args[param_index])
                {
                    node[key] = clone_node(args[param_index]);
                }
            }
            else if (Array.isArray(child))
            {
                for (let i = 0; i < child.length; i++)
                {
                    if (child[i] && child[i].type === "Identifier")
                    {
                        const param_index = params.indexOf(child[i].name);
                        if (param_index !== -1 && args[param_index])
                        {
                            child[i] = clone_node(args[param_index]);
                        }
                    }
                    else
                    {
                        substitute_arguments(child[i], params, args);
                    }
                }
            }
            else
            {
                substitute_arguments(child, params, args);
            }
        }
    }
};

const compile_macro_body = (body_node: any, params: string[], args: any[]): string =>
{
    const body_clone = clone_node(body_node);

    const local_vars = new Set<string>();
    find_local_declarations(body_clone, params, local_vars);

    const renaming_map = new Map<string, string>();
    for (const name of local_vars)
    {
        const unique_suffix = Math.random().toString(36).substring(2, 7);
        renaming_map.set(name, `${name}_ms_${unique_suffix}`);
    }

    apply_hygiene_renaming(body_clone, renaming_map);

    substitute_arguments(body_clone, params, args);

    let target_node = body_clone;
    if (
        body_clone.type === "BlockStatement" &&
        body_clone.body.length === 1 &&
        body_clone.body[0].type === "ExpressionStatement"
    )
    {
        target_node = body_clone.body[0].expression;
    }

    const {code} = generate(target_node, {
        minified:    false,
        jsescOption: {minimal: true}
    });

    let cleanCode = code.trim();

    if (cleanCode.startsWith("{") && cleanCode.endsWith("}"))
    {
        cleanCode = cleanCode.slice(1, -1).trim();
    }

    if (cleanCode.endsWith(";"))
    {
        cleanCode = cleanCode.slice(0, -1).trim();
    }

    return cleanCode;
};

export const expand_macros = (source: string, macros: any[], is_jsx = false): string =>
{
    const macro_map = new Map<string, any>();
    for (const m of macros)
    {
        macro_map.set(m.name, m);
    }

    const sorted_defs = [...macros].sort((a, b) => b.start - a.start);
    let clean_source = "";
    let last_index = source.length;

    for (const macro of sorted_defs)
    {
        const trailing_chunk = source.slice(macro.end, last_index);
        clean_source = trailing_chunk + clean_source;
        last_index = macro.start;
    }
    clean_source = source.slice(0, last_index) + clean_source;

    const clean_ast = parse_code(clean_source, is_jsx);
    const usages = find_macro_usages(clean_ast.program, new Set(macro_map.keys()));

    const sorted_usages = usages.sort((a, b) => b.start - a.start);
    let final_output = "";
    let last_usage_index = clean_source.length;

    for (const usage of sorted_usages)
    {
        const trailing_chunk = clean_source.slice(usage.end, last_usage_index);
        const macro_def = macro_map.get(usage.name);

        const replacement = compile_macro_body(macro_def.body, macro_def.params, usage.arguments);

        final_output = replacement + trailing_chunk + final_output;
        last_usage_index = usage.start;
    }
    final_output = clean_source.slice(0, last_usage_index) + final_output;

    return final_output.trim();
};