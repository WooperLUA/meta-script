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
Macros are hygienic so defining variables in a macro is safe.
```typescript
#define_macro foo(args)
{
    //body
}

foo(args)
```

## Defining a syntax rule
Prefixing with **$** allows for dynamic data in the syntax (they basically act as 'arguments').
```typescript
#define_syntax `|> $operation` -> `.$operation`

const a : number[] = [1,2,3] |> map(x => x * x)
                             |> filter(x => x % 2 == 0);
```

## Defining a precomputation
```typescript
#define_precomp x Math.sin(Math.PI / 4) * 1000
```

# Running MetaScript
```shell
meta-script <file_path> [--jsx]
```
It's possible to explicitly add the **--jsx** flag to specify JSX usage but MetaScript infers it anyway.
```shell
meta-script <file_path> [--jsx]
```

# 📄 License
MIT © Wooper (https://github.com/WooperLUA)