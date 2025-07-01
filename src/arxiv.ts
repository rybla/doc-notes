import * as xml2js from "xml2js";
import { fromCodeToLabel } from "./arxiv_categories";

export type ArxivPaper = typeof getPaperById extends (
  ...args: any[]
) => Promise<infer T>
  ? T
  : never;

export async function getPaperById(arxivId: string) {
  const url = `http://export.arxiv.org/api/query?id_list=${arxivId}`;
  const response = await Bun.fetch(url);
  const data = await response.text();
  const xml = await xml2js.parseStringPromise(data);

  function definedOrThrow<A>(x: A | undefined, name: string): A {
    if (x === undefined) throw new Error(`${name} === undefined`);
    return x;
  }

  const feed = definedOrThrow(xml.feed, "feed");
  const entry = definedOrThrow(feed.entry[0], "entry");

  const title: string = definedOrThrow(entry.title, "title");
  const summary: string = definedOrThrow(entry.summary[0]?.trim(), "summary");
  const authors: string[] = definedOrThrow(
    entry.author?.map((x: any) => x.name[0]),
    "authors",
  );
  const categoryCodes: string[] = definedOrThrow(
    entry.category.map((x: any) => x.$.term),
    "categoryCodes",
  );
  const categoryLabels = categoryCodes.map((code) =>
    definedOrThrow(fromCodeToLabel(code), `fromCodeToLabel("${code}")`),
  );

  const absUrl = `https://arxiv.org/abs/${arxivId}`;
  const pdfUrl = `https://arxiv.org/pdf/${arxivId}`;

  return {
    title,
    publishDateTime: entry.published,
    summary,
    authors,
    categoryCodes,
    categoryLabels,
    absUrl,
    pdfUrl,
  };
}
