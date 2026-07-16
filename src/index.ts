import * as fs from "node:fs";
import {parse_macro_definitions, parse_code} from "./meta-script/parser";
import {expand_macros} from "./meta-script/macros";
import {apply_defined_syntax} from "./meta-script/syntax-rules";

const parse_args = (argv: string[]) =>
{
    const args = argv.slice(2);
    const flags = {
        jsx:            false,
        file_path:      "",
        file_extension: ""
    };

    for (const arg of args)
    {
        if (arg === "--jsx")
        {
            flags.jsx = true;
        }
        else if (!arg.startsWith("-"))
        {
            flags.file_path = arg;
        }
    }

    if (!flags.file_path)
    {
        throw new Error("You must provide a file path");
    }

    const ALLOWED_FILE_EXTENSIONS = new Set(["ts", "tsx", "js", "jsx"]);
    const file_extension = flags.file_path.slice(flags.file_path.lastIndexOf(".") + 1);

    if (!ALLOWED_FILE_EXTENSIONS.has(file_extension))
    {
        throw new Error(
            `Unrecognized file extension. File must be one of: ${Array.from(ALLOWED_FILE_EXTENSIONS).join(", ")}`
        );
    }

    flags.file_extension = file_extension;

    if (file_extension.endsWith("x"))
    {
        flags.jsx = true;
    }

    return flags;
};

const main = (argv: string[]) =>
{
    const {file_path, jsx, file_extension} = parse_args(argv);
    const file_content = fs.readFileSync(file_path, "utf8");

    const preprocessed_content = file_content.replace(/#define_macro\s+(\w+)/g, "__ms_macro__: function $1");

    const content = apply_defined_syntax(preprocessed_content);

    const ast = parse_code(content, jsx);
    const macros = ast ? parse_macro_definitions(ast) : [];

    const clean_content = expand_macros(content, macros, jsx);

    console.log("Processed Content:\n", clean_content);

    const last_ext_index = file_path.lastIndexOf(`.${file_extension}`);
    const base_path = file_path.slice(0, last_ext_index);
    fs.writeFileSync(`${base_path}-ms.${file_extension}`, clean_content, "utf8");
};

main(process.argv);