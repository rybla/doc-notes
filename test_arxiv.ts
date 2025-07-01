import { getPaperById } from "@/arxiv";
import { stringify } from "@/utility";
import * as xml2js from "xml2js";

const arxivId = "2506.19697";
// const url = `http://export.arxiv.org/api/query?id_list=${arxivId}`;
// const response = await Bun.fetch(url);
// const data = await response.text();
// // console.log(stringify({ data }));

// const xml = await xml2js.parseStringPromise(data);
// console.log(stringify({ xml }));

// const metadata = {
//   title: xml.feed?.entry[0]?.title,
//   publishDateTime: xml.feed?.entry[0]?.published,
//   summary: xml.feed?.entry[0]?.summary[0]?.trim(),
//   authors: xml.feed?.entry[0]?.author?.map((x: any) => x.name[0]),
//   categories: xml.feed?.entry[0]?.category.map((x: any) => x.$.term),
// };

console.log(await getPaperById(arxivId));
