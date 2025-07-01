import googleAI from "@genkit-ai/googleai";
import { genkit, z, type Action } from "genkit";
import * as fs from "fs/promises";
import { pdfToText } from "pdf-ts";
import { stringify } from "./utility";

export const ai = genkit({ plugins: [googleAI()] });

type GetInput<A> =
  A extends Action<infer I, infer O, infer S> ? z.infer<I> : never;

type GetOutput<A> =
  A extends Action<infer I, infer O, infer S> ? z.infer<O> : never;

export namespace GenerateMetadataOfPaperPdf {
  export type Input = GetInput<typeof Flow>;
  export type Output = GetOutput<typeof Flow>;

  export const Flow = ai.defineFlow(
    {
      name: "GenerateMetadataOfPaperPdf",
      inputSchema: z.object({
        doc_filepath: z.string(),
      }),
      outputSchema: z.object({
        title: z.string(),
        authors: z.array(z.string()),
        publishDate: z.string(),
        tags: z.array(z.string()),
        abstract: z.string(),
      }),
    },
    async (input) => {
      console.log(`processing: ${input.doc_filepath}`);

      // const doc_text = await readPdfFileAsText(input.doc_filepath);
      const doc_buffer = await fs.readFile(input.doc_filepath);

      const response = await ai.generate({
        model: googleAI.model("gemini-2.0-flash-lite"),
        output: {
          schema: z.object({
            title: z.string().describe("The title of the paper."),
            authors: z
              .array(z.string())
              .describe(
                "An array of each author's name, from paper's byline. Each name listing should use the format: first name then last name.",
              ),
            publishDate: z
              .string()
              .describe("The date that the paper was published."),
            tags: z
              .array(z.string())
              .describe(
                'An array of tags that summarize the major topics of the paper\'s content. These are often also called "Index Terms"',
              ),
            abstract: z.string().describe("The abstract of the paper."),
          }),
        },
        system: `You are an assistant for carefully analyzing academic papers. The user will provide an academic paper as an attached document. Read the paper carefully in order to write the appropriate information about it in a structured format.`,
        prompt: [
          {
            media: {
              url: `data:application/pdf;base64,${doc_buffer.toString("base64")}`,
            },
          },
        ],
      });

      if (response.output === null) throw new Error("response.output === null");

      return {
        title: response.output.title,
        authors: response.output.authors,
        publishDate: response.output.publishDate,
        tags: response.output.tags.map((tag) => tag.toLowerCase()),
        abstract: response.output.abstract,
      };
    },
  );
}

async function readPdfFileAsText(pdf_filepath: string) {
  return await pdfToText(await fs.readFile(pdf_filepath));
}
