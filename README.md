# chatgpt-cli

A simple CLI-tool to interact with ChatGPT.

## Commands

### Configuration

```
chatgpt config auth set <apiKey>
```

Set an OpenAI API key

```
chatgpt config auth get
```

Get an OpenAI API key

```
chatgpt config auth delete
```

Delete an OpenAI API key

### Asking questions

```
chatgpt ask --q <question> -t <temperature> -m <max-tokens> -d <model>

-q, --question          the question to ask (required)
-t, --temperature       set temperature (default = 1)
-m, --max-tokens        set max. tokens (default = 256)
-d, --model             set model (default = gpt-3.5-turbo)
```

### Global options

```
-c, --copy              copy the output to the clipboard
```

## License

MIT
