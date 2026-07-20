import * as fs from "node:fs";
import * as path from "node:path";
import {parse_macro_definitions, parse_code} from "./meta-script/parser";
import {expand_macros} from "./meta-script/macros";
import {apply_defined_syntax} from "./meta-script/syntax-rules";
import {apply_precomputation} from "./meta-script/precomp";
import {safe_replace} from "./meta-script/utils";

const ALLOWED_FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

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
        else if (arg === "--help" || arg === "-h")
        {
            console.log("Usage: meta-script <file_path> [--jsx]");
            process.exit(0);
        }
        else if (!arg.startsWith("-"))
        {
            flags.file_path = arg;
        }
    }

    if (!flags.file_path)
    {
        console.error("Error: You must provide a file path.");
        console.log("Usage: meta-script <file_path> [--jsx]");
        process.exit(1);
    }

    const file_extension = path.extname(flags.file_path);

    if (!ALLOWED_FILE_EXTENSIONS.has(file_extension))
    {
        console.error(`Error: Unrecognized file extension "${file_extension}".`);
        console.error(`File must be one of: ${Array.from(ALLOWED_FILE_EXTENSIONS).join(", ")}`);
        process.exit(1);
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

    if (!fs.existsSync(file_path))
    {
        console.error(`Error: File not found: ${file_path}`);
        process.exit(1);
    }

    const file_content = fs.readFileSync(file_path, "utf8");

    // Precomputation
    const precomputed_content = apply_precomputation(file_content);

    // Macro preprocess for babel
    const preprocessed_content = safe_replace(precomputed_content, /#define_macro\s+(\w+)/g, "__ms_macro__: function $1");

    // Syntax definition
    const content = apply_defined_syntax(preprocessed_content);

    // Macro definitions and extensions
    const ast = parse_code(content, jsx);
    const macros = ast ? parse_macro_definitions(ast) : [];
    const clean_content = expand_macros(content, macros, jsx);

    console.log("Processed Content:\n", clean_content);

    const dir = path.dirname(file_path);
    const base_name = path.basename(file_path, file_extension);
    const output_path = path.join(dir, `${base_name}-ms${file_extension}`);

    fs.writeFileSync(output_path, clean_content, "utf8");
    console.log(`\nSuccessfully wrote to ${output_path}`);
};

main(process.argv);