import {safe_replace} from "./utils";

export const apply_precomputation = (source: string): string =>
{
    const precomp_regex = /#define_precomp\s+(\w+)\s+(.+)/g;
    const definitions: { name: string; value: string }[] = [];
    let match;

    while ((match = precomp_regex.exec(source)) !== null)
    {
        const name = match[1];
        const expression = match[2].trim();

        try
        {
            const evaluated = new Function(`return ${expression}`)();
            definitions.push({name, value: JSON.stringify(evaluated)});
        }
        catch (err: any)
        {
            throw new Error(`Failed to precompute "${name}": ${err.message}`);
        }
    }

    let clean_source = safe_replace(source, /#define_precomp\s+\w+\s+.+/g, "");

    for (const def of definitions)
    {
        const word_boundary_regex = new RegExp(`\\b${def.name}\\b`, "g");
        clean_source = safe_replace(clean_source, word_boundary_regex, def.value);
    }

    return clean_source;
};