import { do_ } from "./utility";

const config = {
  input_filepath:
    "/Users/henry/Library/Mobile Documents/com~apple~CloudDocs/url-notes/paper_urls.txt",
};

// const input_text = await fs.readFile(config.input_filepath, "utf8");
const input_text = await Bun.file(config.input_filepath).text();

const input_lines = input_text
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const line of input_lines) {
  console.log(`processing: ${line}`);
  if (!URL.canParse(line)) {
    console.warn(`can't parse URL: ${line}`);
    continue;
  }
  const url_parsed = URL.parse(line)!;
  const url = `${url_parsed.origin}${url_parsed.pathname}`;
  const pdf_response = await Bun.fetch(url);

  // TODO: extract title
  // TODO: extract abstract
  // TODO: extract references
  // TODO: generate overview

  await Bun.write("test.pdf", pdf_response);
}
