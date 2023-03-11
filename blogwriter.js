const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function extractHeadings(headingMessage) {
  const systemMessage = {
    role: "system",
    content: "You are a helpful AI assistant that extracts headings from text.", // base prompt
  };
  const primingSequence = [
    {
      role: "user",
      content: `Hello! I need you to extract headings from text and return it to me as an array of objects. It's really important you *do not* act conversationally, just take a break and be a robot. Here's an example: If I give you a list like: "1. Heading 1\n2. Heading 2", I need you to say :[{"heading": 'Heading 1'}, {"heading": 'Heading 2'}]`,
    },
    {
      role: "assistant",
      content: `Sure thing!`,
    },
    {
      role: "user",
      content: `Great! Here are some possible headings you can start with: \n\n 1. Define your purpose and audience\n2. Choose a topic and narrow it down\n3. Conduct research and gather information\n4. Create an outline and structure for your posts\n5. Write your first draft\n6. Edit and proofread your post\n7. Publish your post\n8. Promote your post\n9. Analyze your post's performance\n10. Write more blog posts\n`,
    },
    {
      role: "assistant",
      content: `[{"heading":"Define your purpose and audience},{"heading":"Choose a topic and narrow it down"},{"heading":"Conduct research and gather information"},{"heading":"Create an outline and structure for your posts"},{"heading":"Write your first draft"},{"heading":"Edit and proofread your post"},{"heading":"Publish your post"},{"heading":"Promote your post"},{"heading":"Analyze your post's performance"},{"heading":"Write more blog posts"}]`,
    },
    {
      role: "user",
      content: `${headingMessage}`, // user prompt
    },
  ];

  const headingExtractionStuff = {
    model: "gpt-3.5-turbo",
    messages: [systemMessage, ...primingSequence],
    temperature: 0.7,
  };

  const headingExtractionResponse = await openai.createChatCompletion(
    headingExtractionStuff
  );
  let headings = headingExtractionResponse?.data?.choices[0].message.content;
  console.log({ headings });

  try {
    const regex = /\[({".*":".*"})\]/g;
    const matches = headings.match(regex);
    headings = JSON.parse(matches);
    console.log({ headings });
    return headings;
  } catch (error) {
    console.log({ error });
  }
}

const writeToFile = (fileName, contentArray) => {
  const content = contentArray.join("\n\n");
  fs.writeFileSync(fileName, content);
};

async function main(title) {
  const systemMessage = {
    role: "system",
    content: "You are a helpful AI assistant.", // base prompt
  };

  const headingsPrompt = {
    role: "user",
    content: `I'm writing a blog post called ${title}. I need some headings to start with.`, // replace "some" with an integer for more or less content
  };

  const headingStuff = {
    model: "gpt-3.5-turbo",
    messages: [systemMessage, headingsPrompt],
    temperature: 0.7,
  }; // very basic, loose parameters

  const headingResponse = await openai.createChatCompletion(headingStuff);
  let headings = await extractHeadings(
    headingResponse?.data?.choices[0].message.content
  );
  let subHeadings = [];
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const headingPrompt = {
      role: "user",
      content: `I'm writing a blog post titled: ${title}, and I need some content for the heading ${heading.heading}. Can you come up with some subheadings for this heading?`, // replace "some" with an integer for more or less content
    };
    const contentStuff = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, headingPrompt],
      temperature: 0.7,
    };
    const contentResponse = await openai.createChatCompletion(contentStuff);
    const content = await extractHeadings(
      contentResponse?.data?.choices[0].message.content
    );
    subHeadings.push({ heading: heading.heading, content });
  }
  console.log({ subHeadings });
  // iterate over all subheadings
  // for each subheading, ask for content
  // Write the content to file
  const allWritings = [`# ${title}`];
  for (let i = 0; i < subHeadings.length; i++) {
    const { heading, content } = subHeadings[i];
    allWritings.push(`## ${heading}`);
    console.log({ content });
    console.log(content?.length);
    if (content?.length) {
      for (let i = 0; i < content.length; i++) {
        const subContent = content[i];
        const { heading } = subContent;
        allWritings.push(`### ${heading}`); // this works
        // this doesn't ...?
        const subHeadingPrompt = {
          role: "user",
          content: `I'm writing a blog post titled: "${title}", and I need some content for the subheading "${heading}". Can you come up with 4-8 sentences supporting this subheading? Please write them as a paragraph, then summarize those points as a bullet list.`, // play with the sentence length here. 4-8 sentences is a good range for ChatGPT, try longer, try shorter, see what you like.
        };
        console.log({ subHeadingPrompt });
        const contentStuff = {
          model: "gpt-3.5-turbo",
          messages: [systemMessage, subHeadingPrompt],
          temperature: 0.7,
        };
        const contentResponse = await openai.createChatCompletion(contentStuff);
        console.log({ contentResponse });
        const newContent = contentResponse?.data?.choices[0].message.content;
        allWritings.push(newContent);
      }
    }
  }
  console.log({ allWritings });
  // write to file
  writeToFile(`${title}.md`, allWritings); // make sure to change the file name here
}

main("Understanding ReactJs"); // the title of your blog post
// there should be a file called "Understanding ReactJs.md" in your directory for this experiment
// you can change BOTH filenames to whatever you want for custom results
