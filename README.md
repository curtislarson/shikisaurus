# shikisaurus

A Deno version of the excellent [shiki](https://github.com/shikijs/shiki) library via [shiki-es](https://github.com/unjs/shiki-es). The following extra features and customizations have been added:

- A svg renderer using [deno-canvas](https://github.com/DjDeveloperr/deno-canvas).
- A font cache with a few popular web fonts hard coded in.
- A web server for rendering code snippets from github (more info below)

## Web Server

The web server is intended to replicate the useful funtionality described in [Creating a permanent link to a code snippet](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-a-permanent-link-to-a-code-snippet) while also being able to render any GitHub permalink the server has permission to access. This allows you to embed code samples in the project `README.md` and from entirely different repositories.

## Examples

The following raw markdown code:

```md
![Shiki Highlighter](https://shiki.quack.rest/https://github.com/shikijs/shiki/blob/154db14d584c61bc86d5163f217d4609b662b5d6/packages/shiki/src/index.ts)
```

Produces this rendered code snippet:

![Shiki Highlighter](https://shiki.quack.rest/https://github.com/shikijs/shiki/blob/154db14d584c61bc86d5163f217d4609b662b5d6/packages/shiki/src/index.ts)

And with line number ranges:

```md
![Shiki Highlighter](https://shiki.quack.rest/https://github.com/shikijs/shiki/blob/154db14d584c61bc86d5163f217d4609b662b5d6/packages/shiki/src/index.ts%23L16-L17)
```

Produces:

![Shiki Highlighter](https://shiki.quack.rest/https://github.com/shikijs/shiki/blob/154db14d584c61bc86d5163f217d4609b662b5d6/packages/shiki/src/index.ts%23L16-L17)

You can also customize the theme and language via the `?theme=` and `?lang` search parameter.

```md
![Monokai](https://shiki.quack.rest/https://github.com/jOOQ/jOOQ/blob/9572c51985b957b84509e1771748febd27f15326/jOOQ-examples/jOOQ-flyway-example/src/test/java/org/jooq/example/flyway/AfterMigrationTestJava.java?theme=monokai&lang=java)
```

Produces:

![Monokai](https://shiki.quack.rest/https://github.com/jOOQ/jOOQ/blob/9572c51985b957b84509e1771748febd27f15326/jOOQ-examples/jOOQ-flyway-example/src/test/java/org/jooq/example/flyway/AfterMigrationTestJava.java?theme=monokai&lang=java)

## Deployment

- Deployed to [Deno Deploy](https://deno.com/deploy)
- Domain is currently `shiki.quack.rest`

## TODO

- [ ] Most of the code is quite old and could use a refactor
- [ ] Add in more languages or just remove hardcode.
- [ ] Infer language based on file extension
- [ ] Document available languages and themes
- [ ] Support additional metadata in webserver svg renderer for closer feature parity with GitHub code snippets
