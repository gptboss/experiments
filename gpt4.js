const dotenv = require("dotenv");
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
    model: "gpt-4",
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

multiplayer();
