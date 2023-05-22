#!/usr/bin/env node

const yargs = require("yargs");
const chalk = require("chalk");
const boxen = require("boxen");
const fs = require("fs");
const Configstore = require("configstore");
const { Configuration, OpenAIApi } = require("openai");

const packageJson = JSON.parse(fs.readFileSync("../package.json", "utf8"));
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
	.command("config", "configuration", () => {
		yargs.command("auth", "authentication", () => {
			yargs.command(
				"set <apiKey>",
				"set an OpenAI API key",
				() => {
					yargs.positional("apiKey", {
						type: "string",
					});
				},
				(argv) => {
					configStore.set("OPENAI_API_KEY", argv.apiKey);
				}
			);
			yargs.command("get", "get an OpenAI API key", () => {
				const key = configStore.get("OPENAI_API_KEY");

				if (key === undefined) {
					console.log(
						"You have not set an OpenAI API key (see --help)"
					);
				} else {
					console.log(key);
				}
			});
			yargs.command("delete", "delete an OpenAI API key", () => {
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
		"ask a question to ChatGPT",
		() => {
			yargs.option("q", {
				alias: "question",
				type: "string",
				describe: "the question you want to ask ChatGPT",
				demandOption: true,
			});
			yargs.option("t", {
				alias: "temperature",
				type: "number",
				describe: "the temperature you want to set",
				demandOption: false,
				default: 0.5,
			});
			yargs.option("m", {
				alias: "max-tokens",
				type: "number",
				describe: "the max. number of tokens you want to use",
				demandOption: false,
				default: 256,
			});
			yargs.option("d", {
				alias: "model",
				type: "string",
				describe: "the model you want to use",
				demandOption: false,
				default: "text-davinci-003",
			});
		},
		async (argv) => {
			if (configStore.get("OPENAI_API_KEY") === null) {
				console.log("You have not set an OpenAI API key (see --help)");
				return;
			}

			try {
				const response = await openai.createCompletion({
					model: argv.d,
					prompt: argv.q,
					temperature: argv.t,
					max_tokens: argv.m,
				});

				console.log(chalk.green(response.data.choices[0].text.trim()));
			} catch (err) {
				console.log(
					chalk.red(
						`openai error: ${err.response.data.error.message}`
					)
				);
			}
		}
	)
	.option("verbose", {
		type: "boolean",
		describe: "show logs",
		demandOption: false,
	})
	.help(true)
	.parse();
