#!/usr/bin/env node

const path = require("path");
const yargs = require("yargs");
const chalk = require("chalk");
const boxen = require("boxen");
const ora = require("ora");
const clipboardy = require("clipboardy");

const fs = require("fs");
const Configstore = require("configstore");
const { Configuration, OpenAIApi } = require("openai");

const packageJson = JSON.parse(
	fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
);
const configStore = new Configstore(packageJson.name);

const configuration = new Configuration({
	apiKey: configStore.get("OPENAI_API_KEY"),
});

const openai = new OpenAIApi(configuration);

yargs
	.usage(
		boxen(chalk.green("ChatGPT CLI tool"), {
			padding: 1,
			borderColor: "green",
		})
	)
	.detectLocale(false)
	.command("config", "Configuration options", () => {
		yargs.command("auth", "Authentication options", () => {
			yargs.command(
				"set <apiKey>",
				"Set an OpenAI API key",
				() => {
					yargs.positional("apiKey", {
						type: "string",
					});
				},
				(argv) => {
					configStore.set("OPENAI_API_KEY", argv.apiKey);
				}
			);
			yargs.command("get", "Get an OpenAI API key", () => {
				const key = configStore.get("OPENAI_API_KEY");

				if (key === undefined) {
					console.log(
						"You have not set an OpenAI API key (see --help)"
					);
				} else {
					console.log(key);
				}
			});
			yargs.command("delete", "Delete an OpenAI API key", () => {
				const key = configStore.get("OPENAI_API_KEY");

				if (key === undefined) {
					console.log(
						"You have not set an OpenAI API key (see --help)"
					);
				} else {
					configStore.delete("OPENAI_API_KEY");
				}
			});
		});
	})
	.command(
		"ask",
		"Ask a question to ChatGPT",
		() => {
			yargs.option("q", {
				alias: "question",
				type: "string",
				describe: "The question you want to ask",
				demandOption: true,
			});
			yargs.option("t", {
				alias: "temperature",
				type: "number",
				describe: "The temperature you want to set (default = 0.5)",
				demandOption: false,
				default: 0.5,
			});
			yargs.option("m", {
				alias: "max-tokens",
				type: "number",
				describe:
					"The max. number of tokens you want to use (default = 256)",
				demandOption: false,
				default: 256,
			});
			yargs.option("d", {
				alias: "model",
				type: "string",
				describe: "The model you want to use (default = gpt-3.5-turbo)",
				demandOption: false,
				default: "gpt-3.5-turbo",
			});
		},
		async (argv) => {
			if (configStore.get("OPENAI_API_KEY") === null) {
				console.log("You have not set an OpenAI API key (see --help)");
				return;
			}

			const spinner = ora({ color: "green" }).start(
				"Asking to ChatGPT..."
			);

			try {
				switch (argv.d) {
					default: {
						const response = await openai.createCompletion({
							model: argv.d,
							prompt: argv.q,
							temperature: argv.t,
							max_tokens: argv.m,
						});

						spinner.stop().clear();

						console.log(
							chalk.green(response.data.choices[0].text.trim())
						);

						if (argv.copy) {
							clipboardy.writeSync(
								response.data.choices[0].text.trim()
							);
						}
						break;
					}
					case "gpt-3.5-turbo": {
						const response = await openai.createChatCompletion({
							model: argv.d,
							messages: [{ role: "user", content: argv.q }],
							temperature: argv.t,
							max_tokens: argv.m,
						});

						spinner.stop().clear();

						console.log(
							chalk.green(
								response.data.choices[0].message.content.trim()
							)
						);

						if (argv.copy) {
							clipboardy.writeSync(
								response.data.choices[0].message.content.trim()
							);
						}
						break;
					}
				}
			} catch (err) {
				spinner.stop().clear();

				console.log(
					chalk.red(
						`openai error: ${err.response.data.error.message}`
					)
				);
			}
		}
	)
	.option("copy", {
		type: "boolean",
		describe: "Copy the output to the clipboard",
	})
	.help(true)
	.parse();
