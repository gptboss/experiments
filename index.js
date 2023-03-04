const dotenv = require("dotenv");
dotenv.config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

async function multiplayer() {
  const systemMessage = {
    role: "system",
    content: "You are a helpful AI assistant.",
  };

  const userMessages = [
    { role: "user", content: "Mackenzie: I'm stuck on this project." },
    { role: "user", content: "Mitchell: What project?" },
    {
      role: "user",
      content:
        "Mackenzie: I can't figure out how to make a one time invoice in stripe.",
    },
    { role: "user", content: "Mitchell: Let's check with our AI assistant." },
  ];

  const messagesToSend = [systemMessage, ...userMessages];

  const openAIStuff = {
    model: "gpt-3.5-turbo",
    messages: messagesToSend,
    temperature: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    user: "Mackenzie and Mitchell",
  };
  console.log("Sending...");
  const response = await openai.createChatCompletion(openAIStuff);
  let newMessage = response?.data?.choices[0].message;
  console.log({ newMessage });

  messagesToSend.push(newMessage);
  messagesToSend.push({
    role: "user",
    content:
      "Mackenzie: Thanks! But how do I do that in NodeJS? I'm building this for a React/Flutter app.",
  });
  messagesToSend.push({
    role: "user",
    content:
      "Mitchell: Yea, looks like this is just for sending payment links, but we need to do this programmatically.",
  });
  console.log({ messagesToSend });
  return;
  const openAIStuff2 = {
    model: "gpt-3.5-turbo",
    messages: messagesToSend,
    temperature: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    user: "Mackenzie and Mitchell",
  };

  console.log("Sending...");
  const response2 = await openai.createChatCompletion(openAIStuff2);
  let newMessage2 = response2?.data?.choices[0].message;
  console.log({ newMessage2 });
}

async function search() {
  const systemMessage = {
    role: "system",
    content:
      "You are a helpful AI assistant that converts natural language queries into specialized API calls.",
  };

  const userMessages = [
    {
      role: "user",
      content:
        "Mackenzie: Hello! I'm initializing you to help some people turn natural language into code.",
    },
    { role: "assistant", content: "I understand. Continue." },
    {
      role: "user",
      content:
        "Mackenzie: You will be in charge of internet search lookups. I need you to take natural sentences, such as 'Where was Joe Biden born?', and return a new sentence that calls a search function. For example: 'search('Joe Biden birthplace')'",
    },
    { role: "assistant", content: "I understand. Continue." },
    {
      role: "user",
      content:
        "Mackenzie: Let's try some examples. What is the capital of France?",
    },
    { role: "assistant", content: "search('France capital')" },
    {
      role: "user",
      content: "Mackenzie: Great! I'm passing you off to the user now.",
    },
    {
      role: "assistant",
      content:
        "Okay, I'm ready to convert sentences to search queries and am happy to help.",
    },
  ];

  const messagesToSend = [systemMessage, ...userMessages];
  messagesToSend.push({
    role: "user",
    content: "How do I request a T4 from my previous employer?",
  });

  const openAIStuff = {
    model: "gpt-3.5-turbo",
    messages: messagesToSend,
    temperature: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  };

  console.log("Sending...");
  const response = await openai.createChatCompletion(openAIStuff);
  let newMessage = response?.data?.choices[0].message;
  console.log({ newMessage });
  return;
}

// convert this call to whichever function you want to run
main();
