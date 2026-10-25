#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const cheerio = require("cheerio");

const DEFAULT_SECTION_SELECTOR = "a.overview_header";
const DEFAULT_TITLE_SELECTOR = "div.tut_overview";

function printUsage() {
  console.error(
    "Usage: npm run extract -- <input.html> [--section <selector>] [--title <selector>] [--output <file.json>]",
  );
  console.error(
    'Example: npm run extract -- titles.html --section ".section" --title ".title"',
  );
}

function parseArguments(argumentsList) {
  const positionalArguments = [];
  const options = [];
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const separatorIndex = argument.indexOf("=");
    const option =
      separatorIndex === -1 ? argument : argument.slice(0, separatorIndex);

    if (
      option === "--section" ||
      option === "--section-selector" ||
      option === "--title" ||
      option === "--title-selector" ||
      option === "--output"
    ) {
      options.push(argument);
      if (separatorIndex === -1 && argumentsList[index + 1]) {
        options.push(argumentsList[index + 1]);
        index += 1;
      }
    } else if (argument.startsWith("-")) {
      options.push(argument);
    } else {
      positionalArguments.push(argument);
    }
  }

  if (positionalArguments.length === 0) {
    throw new Error("An input HTML file is required.");
  }

  let inputFile;
  if (positionalArguments.length === 1) {
    inputFile = positionalArguments[0];
  } else if (
    positionalArguments.length === 2 &&
    fs.existsSync(path.resolve(positionalArguments[0])) &&
    fs.statSync(path.resolve(positionalArguments[0])).isDirectory()
  ) {
    inputFile = path.join(positionalArguments[0], positionalArguments[1]);
  } else {
    throw new Error(
      "Provide one input HTML file, or a directory followed by its filename.",
    );
  }

  const parsed = {
    inputFile,
    sectionSelector: DEFAULT_SECTION_SELECTOR,
    titleSelector: DEFAULT_TITLE_SELECTOR,
    outputFile: undefined,
  };

  for (let index = 0; index < options.length; index += 1) {
    const argument = options[index];
    const separatorIndex = argument.indexOf("=");
    const option =
      separatorIndex === -1 ? argument : argument.slice(0, separatorIndex);
    const value =
      separatorIndex === -1
        ? options[index + 1]
        : argument.slice(separatorIndex + 1);

    if (
      option === "--section" ||
      option === "--section-selector" ||
      option === "--title" ||
      option === "--title-selector" ||
      option === "--output"
    ) {
      if (!value || (separatorIndex === -1 && value.startsWith("--"))) {
        throw new Error(`Missing value for ${option}.`);
      }

      if (option === "--section" || option === "--section-selector") {
        parsed.sectionSelector = value;
      } else if (option === "--title" || option === "--title-selector") {
        parsed.titleSelector = value;
      } else {
        parsed.outputFile = value;
      }

      if (separatorIndex === -1) {
        index += 1;
      }
      continue;
    }

    throw new Error(`Unknown option: ${option}.`);
  }

  return parsed;
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function extractSections(html, sectionSelector, titleSelector) {
  const $ = cheerio.load(html);
  const sections = $(sectionSelector).toArray();
  const titleContainers = $(titleSelector).toArray();
  let id = 1;

  return sections.flatMap((section, sectionIndex) => {
    const titleContainer = titleContainers[sectionIndex];
    const titles = titleContainer
      ? $(titleContainer)
          .find("a")
          .toArray()
          .map((element) => cleanText($(element).text()))
          .filter(Boolean)
      : [];

    return titles.map((title) => ({
      id: id++,
      section: cleanText($(section).text()),
      title,
    }));
  });
}

function main() {
  let argumentsConfig;

  try {
    argumentsConfig = parseArguments(process.argv.slice(2));
  } catch (error) {
    printUsage();
    throw error;
  }

  const inputPath = path.resolve(argumentsConfig.inputFile);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${argumentsConfig.inputFile}`);
  }

  const html = fs.readFileSync(inputPath, "utf8");
  const sections = extractSections(
    html,
    argumentsConfig.sectionSelector,
    argumentsConfig.titleSelector,
  );
  const outputPath = path.resolve(
    argumentsConfig.outputFile ||
      `${path.basename(inputPath, path.extname(inputPath))}.json`,
  );

  fs.writeFileSync(outputPath, `${JSON.stringify(sections, null, 2)}\n`, "utf8");
  console.log(`Extracted ${sections.length} section(s) to ${outputPath}`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
