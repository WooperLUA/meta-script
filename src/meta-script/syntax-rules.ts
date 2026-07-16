interface SyntaxRule
{
    pattern: RegExp;
    replacement: string;
}

export const apply_defined_syntax = (source: string): string =>
{
    const syntax_regex = /#define_syntax\s+`([^`]+)`\s*->\s*`([^`]+)`/g;
    const rules: { pattern: string; replacement: string }[] = [];
    let match;

    while ((match = syntax_regex.exec(source)) !== null)
    {
        rules.push({
            pattern:     match[1].trim(),
            replacement: match[2].trim()
        });
    }

    let clean_source = source.replace(/#define_syntax\s+`[^`]+`\s*->\s*`[^`]+`/g, "");

    for (const rule of rules)
    {
        const escape_regex = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

        const param_regex = /\$(\w+)/g;
        let pattern_regex_str = escape_regex(rule.pattern);
        const param_names: string[] = [];
        let param_match;

        while ((param_match = param_regex.exec(rule.pattern)) !== null)
        {
            param_names.push(param_match[1]);
        }

        for (const name of param_names)
        {
            pattern_regex_str = pattern_regex_str.replace(`\\$${name}`, `([\\s\\S]+?)`);
        }

        const matcher = new RegExp(pattern_regex_str, "g");

        clean_source = clean_source.replace(matcher, (...args) =>
        {
            let result = rule.replacement;
            for (let i = 0; i < param_names.length; i++)
            {
                result = result.replace(`$${param_names[i]}`, args[i + 1]);
            }
            return result;
        });
    }

    return clean_source;
};