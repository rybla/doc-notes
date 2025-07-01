import filenamify from "filenamify";
import { do_ } from "./utility";
import { GenerateMetadataOfPaperPdf } from "./ai";

const config = {
  input_filepath: process.env.PAPER_URLS_FILEPATH as string,
  doc_dirpath: "./doc",
};

const input_text = await Bun.file(config.input_filepath).text();

console.log(JSON.stringify({ input_text }, null, 4));

const input_lines = input_text
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(JSON.stringify({ input_lines }, null, 4));

const failed_lines: string[] = [];
for (const line of input_lines) {
  console.log(`processing: ${line}`);
  if (!URL.canParse(line)) {
    console.warn(`can't parse URL: ${line}`);
    failed_lines.push(line);
    continue;
  }
  const url_parsed = URL.parse(line)!;
  const url = `${url_parsed.origin}${url_parsed.pathname}`;
  const tmp_filename = `${config.doc_dirpath}/${filenamify(url)}.pdf`;
  const pdf_response = await Bun.fetch(url);
  await Bun.write(tmp_filename, pdf_response);

  // // TODO: use pdf-parse somehow on pdf_response
  // // TODO: extract title
  // // TODO: extract abstract
  const metadata = await GenerateMetadataOfPaperPdf.Flow({
    doc_filepath: tmp_filename,
  });

  // TODO: extract references
  // TODO: generate overview
}

// TODO: write failed_lines back to original file
