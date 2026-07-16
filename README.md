```
 ▄██▀▄▄▀██▄  ▀███▀███ ███▀███▀███   ▄██▀▀██▄       ▄▄██▄█ ▄██▀▀███ ▀███▀███▄▄   ▀███▀ ▀███▀███▄▄  ███▀███▀███
▓▓▓  ▓▓  ▓▓▓  ▓▓▓  ▀▓ ▓▀  ▓▓▓  ▀▓  ▓▓▓    ▓▓▓    ▄▓▓▓▀  ▓ ▓▓▓   ▀▓  ▓▓▓   ▀▓▓▓   ▓▓▓   ▓▓▓   ▀▓▓▓ ▓▀  ▓▓▓  ▀▓
▒▒▒  ▒▒  ▒▒▒  ▒▒▒  ▄      ▒▒▒      ▒▒▒    ▒▒▒   ▒▒▒▀      ▒▒▒       ▒▒▒    ▒▒▒   ▒▒▒   ▒▒▒    ▒▒▒     ▒▒▒    
░░░  ░░  ░░░  ░░░▄░░      ░░░      ░░░    ░░░  ▐░░░▄      ░░░       ░░░   ▄░░▀   ░░░   ░░░   ▄░░▀     ░░░      
░░░  ░░  ░░░  ░░░         ░░░      ░░░    ░░░       ▀░░░  ░░░       ░░░  ▀░░▄    ░░░   ░░░            ░░░    
▒▒▒  ▒▒  ▒▒▒  ▒▒▒         ▒▒▒      ▒▒▒    ▒▒▒        ▐▒▒▌ ▒▒▒       ▒▒▒   ▐▒▒▌   ▒▒▒   ▒▒▒            ▒▒▒    
▓▓▓      ▓▓▓  ▓▓▓   ▄     ▓▓▓      ▓▓▓    ▓▓▓   ▄   ▄▓▓▓  ▓▓▓    ▄  ▓▓▓    ▓▓▓   ▓▓▓   ▓▓▓            ▓▓▓    
███      ███  ███ ▄██     ███      ███    ███   █▄▄███▀   ███  ▄██  ███    ███   ███   ███            ███    
▀▀▀      ▀▀▀ ▀▀▀▀▀▀▀▀    ▀▀▀▀▀    ▀▀▀▀▀  ▀▀▀▀▀  ▀ ▀▀▀      ▀▀▀▀▀▀▀ ▀▀▀▀▀  ▀▀▀▀▀ ▀▀▀▀▀ ▀▀▀▀▀          ▀▀▀▀▀   
```

**MetaScript** is a **preprocessor** | **transpiler** that adds simple **metaprogramming** features to :
- Javascript | Typescript
- JSX | TSX

--------------------------------------------------------------------------------

# 📖 Usage

## Defining a macro
Args are hygienic so defining variables in a macro is safe.
```css
#define_macro foo(args)
{
    //body
}

foo(args)
```

## Defining a syntax rule
Prefixing with $ allows for dynamic data in the syntax (args basically).
```css
#define_syntax `|> $operation` -> `.$operation`

const a : number[] = [1,2,3] |> map(x => x * x)
                             |> filter(x => x % 2 == 0);
```

## Defining a precomputation
```css
#define_precomp x Math.sin(Math.PI / 4) * 1000
```

# Running MetaScript
```shell
<node | bun> index.ts <path_to_the_file>
```
It's possible to explicitly add the **--jsx** flag to specify JSX usage but MetaScript infers it anyway.
```shell
<node | bun> index.ts <path_to_the_file> --jsx
```

# 📄 License
MIT © Wooper (https://github.com/WooperLUA)