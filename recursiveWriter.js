const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();
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

async function getLastParagraph(text) {
  const paragraphs = text.split("\n");
  const lastParagraph = paragraphs[paragraphs.length - 1];
  const lastParagraphLength = lastParagraph.length;
  const documentLength = text.length;
  return { lastParagraph, lastParagraphLength, documentLength };
}

async function getDocumentLength(textArray) {
  let documentLength = 0;
  for (let i = 0; i < textArray.length; i++) {
    documentLength += textArray[i].length;
  }
  return documentLength;
}

function checkIfFinished(desiredLength, documentLength) {
  if (documentLength >= desiredLength) {
    return true;
  }
  return false;
}

async function summarizeContent(currentSummary, lastMessage) {
  const systemMessage = {
    role: "system",
    content: "You are an AI summarizer. You summarize content.",
  };
  const messages2 = [
    systemMessage,
    {
      role: "user",
      content: `Please concatenate these texts: ${
        currentSummary || ""
      }\n\n${lastMessage}.`,
    },
  ];
  const concatenateStuff = {
    model: "gpt-3.5-turbo",
    messages: messages2,
    temperature: 0.7,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
  const concatenateResponse = await openai.createChatCompletion(
    concatenateStuff
  );
  const concatenatedSummary =
    concatenateResponse?.data?.choices[0].message.content;
  return concatenatedSummary;
}

const writeToFile = (fileName, contentArray) => {
  const content = contentArray.join("\n\n");
  fs.writeFileSync(fileName, content);
};

async function generateContent(initialPrompt, desiredLength) {
  const systemMessage = {
    role: "system",
    content:
      "You are an AI writer. You write compelling and informative content designed to help people understand complex topics.",
  };
  const primingSequence = [
    {
      role: "user",
      content: "Mackenzie: Hi, I'm a programmer setting up your environment.",
    },
    { role: "assistant", content: "It's nice to meet you." },
    {
      role: "user",
      content:
        "Mackenzie: You will receive a document summary as a prompt, a length, the last paragraph that was written, and the desired length. You are going to interpolate this information to write custom, logical paragraphs that will help the user understand the topic. The difference between the length and desired length will let you know how much more you need to write. You can use the last paragraph to help you write the next paragraph. You can also use the prompt to help you understand the topic. Make sense?",
    },
    {
      role: "assistant",
      content: "Yes, I think so. I'm ready to begin.",
    },
    {
      role: "user",
      content: "Mackenzie: Great! Let's get started.",
    },
  ];
  let messages = [systemMessage, ...primingSequence];
  let promptObject = {
    prompt: initialPrompt,
    desiredLength: desiredLength,
    lastParagraph: "",
    lastParagraphLength: 0,
    documentLength: 0,
  };
  let allMessages = [];
  async function recursiveChat(
    promptObject,
    systemMessage,
    primingSequence,
    allMessages
  ) {
    const {
      summary,
      prompt,
      desiredLength,
      lastParagraph,
      lastParagraphLength,
      documentLength,
    } = promptObject;
    let messages = [systemMessage, ...primingSequence];
    let openAIstuff = {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 1,
    };
    messages.push({
      role: "user",
      content: `You are writing this blog post: ${prompt}\n\nYou have written ${documentLength} characters so far, and this is a summary of the current content: ${summary}. You need to write ${
        desiredLength - documentLength
      } more characters. You will get multiple opportunities, so only write 100-300 characters at a time. Your last paragraph was: ${lastParagraph}.`,
    });
    console.log("Firing OpenAI");
    const response = await openai.createChatCompletion(openAIstuff);
    let newMessage = response?.data?.choices[0].message;
    console.log({ newMessage });
    allMessages.push(newMessage.content);
    console.log({ allMessages });
    let newDocumentLength = await getDocumentLength(allMessages);
    console.log({ newDocumentLength });
    const {
      lastParagraph: newLastParagraph,
      lastParagraphLength: newLastParagraphLength,
    } = await getLastParagraph(newMessage.content);
    const finished = checkIfFinished(desiredLength, newDocumentLength);
    if (finished) {
      console.log("Finished!");
      console.log({ allMessages });
      writeToFile("./file.md", allMessages);
      return messages;
    }
    console.log("Firing Summary");
    const newSummary = await summarizeContent(summary, newMessage.content);
    console.log({ newSummary });
    const newPromptObject = {
      summary: newSummary,
      prompt,
      desiredLength,
      lastParagraph: newLastParagraph,
      lastParagraphLength: newLastParagraphLength,
      documentLength: newDocumentLength,
    };
    console.log("Recursing");
    recursiveChat(newPromptObject, systemMessage, primingSequence, allMessages);
  }
  recursiveChat(promptObject, systemMessage, primingSequence, allMessages);
}

generateContent(
  "5 Ways AI Chat Agents Can Streamline Customer Service for E-commerce Businesses.",
  7000
);
