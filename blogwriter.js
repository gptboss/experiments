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
      content: `Great! Here are some possible headings you can start with: \n\n 1. Define your purpose and audience\n2. Choose a topic and narrow it down\n3. Conduct research and gather information\n4. Create an outline and structure for your posts\n5. Write your first draft\n6. Edit and proofread your post\n7. Publish your post\n8. Promote your post\n9. Analyze your post's performance\n10. Write more blog posts\nLet me know if you need any more help!`,
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
  await sleep(1500);
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
    if (!headings) {
      const newRegex = /\[({".*":".*"}(,\\n)?)\]/g;
      const newMatches = headings.match(newRegex);
      const newHeadings = JSON.parse(newMatches);
      if (!newHeadings) {
        return extractHeadings(headingMessage);
      }
      return newHeadings;
    }
    return headings;
  } catch (error) {
    if (error?.data?.type == "server_error") {
      console.log("Error: ", error?.data);
      return extractHeadings(headingMessage);
    }
    console.log({ error });
  }
}

const writeToFile = (fileName, contentArray) => {
  const content = contentArray.join("\n\n");
  fs.writeFileSync(fileName, content);
};

const fireCompletion = async (options) => {
  await sleep(1500);
  try {
    const response = await openai.createChatCompletion(options);
    const responseContent = response?.data?.choices[0].message.content;
    console.log({ responseContent });
    return responseContent;
  } catch (error) {
    if (error?.data?.type) {
      console.log("Error: ", error?.data);
      return fireCompletion(options);
    }
  }
};

const addExamples = async (title, heading, subheading, text) => {
  const systemMessage = {
    role: "system",
    content:
      "You are a creative writing AI that helps users explain dry ideas with fun or funny examples and anecdotes.",
  };
  const primingSequence = [
    systemMessage,
    {
      role: "user",
      content: `Hello! I need you to help me write a blog post called ${title}. I'm working under the heading ${heading} and subheading ${subheading}. I need you to help me come up with some examples to explain the ideas in this paragraph: \n\n "${text}"\n\n
			The stories you come up with do not have to be true, but they should be interesting and fun to read and illustrate the importance of the information in the paragraph I sent you.`,
    },
  ];
  const exampleStuff = {
    model: "gpt-3.5-turbo",
    messages: primingSequence,
    temperature: 0.7,
  };
  const exampleResponse = await fireCompletion(exampleStuff);
  return exampleResponse;
};

const addAnalogies = async (title, heading, subheading, text) => {
  const systemMessage = {
    role: "system",
    content:
      "You are a creative writing AI that helps users explain dry or complex ideas with analogies to help readers understand better.",
  };
  const primingSequence = [
    systemMessage,
    {
      role: "user",
      content: `Hello! I need you to help me write a blog post called ${title}. I'm working under the heading ${heading} and subheading ${subheading}. I need you to help me come up with some analogies to explain the ideas in this paragraph: \n\n "${text}"\n\n
			The analogies you come up with do not need to be perfectly accurate, but they should be interesting and fun to read and illustrate the information in the paragraph I sent you.`,
    },
  ];
  const analogyStuff = {
    model: "gpt-3.5-turbo",
    messages: primingSequence,
    temperature: 0.7,
  };
  const analogyResponse = await fireCompletion(analogyStuff);
  return analogyResponse;
};

const addCaseStudies = async (title, heading, subheading, text) => {
  const systemMessage = {
    role: "system",
    content:
      "You are a creative writing AI that helps users explain dry or complex ideas with analogies to help readers understand better.",
  };
  const primingSequence = [
    systemMessage,
    {
      role: "user",
      content: `Hello! I need you to help me write a blog post called ${title}. I'm working under the heading ${heading} and subheading ${subheading}. I need you to help me come up with some case studies to help reinforce the ideas in this paragraph: \n\n "${text}"\n\n
			The case studies you come up with do not need to be true, but they should be interesting and fun to read and underline the successful application of the information in the paragraph I sent you.`,
    },
  ];
  const analogyStuff = {
    model: "gpt-3.5-turbo",
    messages: primingSequence,
    temperature: 0.7,
  };
  const analogyResponse = await fireCompletion(analogyStuff);
  return analogyResponse;
};

const produceChapter = async (title, heading, subheading, text) => {
  const examples = await addExamples(title, heading, subheading, text);
  console.log({ examples });
  const analogies = await addAnalogies(title, heading, subheading, text);
  console.log({ analogies });
  const caseStudies = await addCaseStudies(title, heading, subheading, text);
  console.log({ caseStudies });
  return `${text}\n\n#### Examples\n\n${examples}\n\n#### Analogies\n\n${analogies}\n\n#### Case Studies\n\n${caseStudies}`;
};

async function main(title) {
  console.log("Starting blog writer on: ", title);
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
  const headingResponse = await fireCompletion(headingStuff);
  let headings = await extractHeadings(headingResponse);
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
    const contentResponse = await fireCompletion(contentStuff);
    const content = await extractHeadings(contentResponse);
    subHeadings.push({ heading: heading.heading, content });
  }
  console.log({ subHeadings });
  // iterate over all subheadings
  // for each subheading, ask for content
  // Write the content to file
  const allWritings = [`# ${title}`];
  for (let i = 0; i < subHeadings.length; i++) {
    const { heading: subheading, content } = subHeadings[i];
    allWritings.push(`## ${subheading}`);
    writeToFile(`${title}.md`, allWritings);
    const sectionPrompt = {
      role: "user",
      content: `I'm writing a blog post titled: "${title}". I'm working on the subheading "${subheading}", please write an introductory paragraph for this section.`, // play with the sentence length here. 4-8 sentences is a good range for ChatGPT, try longer, try shorter, see what you like.
    };
    const sectionStuff = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, sectionPrompt],
      temperature: 0.7,
    };
    const sectionContent = await fireCompletion(sectionStuff);
    console.log({ sectionContent });
    allWritings.push(sectionContent);
    writeToFile(`${title}.md`, allWritings);
    if (content?.length) {
      for (let i = 0; i < content.length; i++) {
        const subContent = content[i];
        console.log({ subContent });
        const { heading } = subContent;
        allWritings.push(`### ${heading}`);
        writeToFile(`${title}.md`, allWritings);
        console.log({ heading });
        const subHeadingPrompt = {
          role: "user",
          content: `I'm writing a blog post titled: "${title}", and I need some content for the subheading "${heading}". Can you come up with 6-12 sentences supporting this subheading? Please write them as a paragraph, then summarize those points into a 4 bullet list.`, // play with the sentence length here. 4-8 sentences is a good range for ChatGPT, try longer, try shorter, see what you like.
        };
        const contentStuff = {
          model: "gpt-3.5-turbo",
          messages: [systemMessage, subHeadingPrompt],
          temperature: 0.7,
        };
        await sleep(1500);
        const newContent = await fireCompletion(contentStuff);
        const fullChapter = await produceChapter(
          title,
          heading,
          subheading,
          newContent
        );
        allWritings.push(fullChapter);
        writeToFile(`${title}.md`, allWritings);
      }
    }
  }
  const headingList = headings.join("\n");
  const conclusionPrompt = {
    role: "user",
    content: `I'm writing a blog post titled: "${title}". The article has the following sections: ${headingList}. I'm working on the conclusion, please write a paragraph that summarizes this topic and those points.`,
  };
  const conclusionStuff = {
    model: "gpt-3.5-turbo",
    messages: [systemMessage, conclusionPrompt],
    temperature: 0.7,
  };
  await sleep(1500);
  const conclusionResponse = await openai.createChatCompletion(conclusionStuff);
  const conclusionContent =
    conclusionResponse?.data?.choices[0].message.content;
  allWritings.push(`## Conclusion`);
  allWritings.push(conclusionContent);
  console.log({ allWritings });
  // write to file
  writeToFile(
    `Passive Income Strategies for Financial Freedom.md`,
    allWritings
  ); // make sure to change the file name here
}

main("Passive Income Strategies for Financial Freedom"); // the title of your blog post
// there should be a file called "Title.md" in your directory for this experiment
// you can change BOTH filenames to whatever you want for custom results
