interface SyntaxRule
{
    pattern: RegExp;
    replacement: string;
}

export const apply_defined_syntax = (source: string): string =>
{
    const rules: SyntaxRule[] = [];
    const define_regex = /#define_syntax\s*\(\s*(['"`])(.*?)\1\s*,\s*(['"`])(.*?)\3\s*\);?/g;

    let match;
    while ((match = define_regex.exec(source)) !== null)
    {
        const user_pattern = match[2];
        const user_replacement = match[4];

        const escape_regex = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        const var_names: string[] = [];
        const var_regex = /\$(\w+)/g;
        let var_match;
        while ((var_match = var_regex.exec(user_pattern)) !== null)
        {
            var_names.push(var_match[1]);
        }

        let regex_string = escape_regex(user_pattern);
        var_names.forEach((varName) =>
        {
            regex_string = regex_string.replace(`\\$${varName}`, `([^\\)]+)`);
        });

        const pattern_regex = new RegExp(regex_string, 'g');

        let replacement_target = user_replacement;
        var_names.forEach((varName, index) =>
        {
            replacement_target = replacement_target.replace(`$${varName}`, `$${index + 1}`);
        });

        rules.push({
            pattern:     pattern_regex,
            replacement: replacement_target
        });
    }

    let clean_source = source.replace(define_regex, "");

    for (const rule of rules)
    {
        clean_source = clean_source.replace(rule.pattern, rule.replacement);
    }

    return clean_source;
};