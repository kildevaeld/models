
interface ParserOptions {
  output?: string
}

declare module parser {
  function parse(data: string, options?: ParserOptions): any
}

