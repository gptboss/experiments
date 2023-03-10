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
  let query = "How do I request a T4 from my previous employer?";
  messagesToSend.push({
    role: "user",
    content: query,
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

async function oneLink() {
  const url = "https://en.wikipedia.org/wiki/Pedagogy";
  const messages = [
    {
      role: "system",
      content: "You are a helpful AI assistant.",
    },
    {
      role: "user",
      content: `Can you read this link? ${url}`,
    },
  ];

  const openAIStuff = {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  };
  async function recursiveChat(messages, openAIStuff, messageLimit) {
    if (messages.length > messageLimit) {
      return;
    }
    console.log("Sending...");
    if (messages.length % 2 !== 0) {
      messages[messages.length - 1] = {
        role: "user",
        content: "Tell me more!",
      };
      const response = await openai.createChatCompletion(openAIStuff);
      let newMessage = response?.data?.choices[0].message;
      console.log({ newMessage });
      messages.push(newMessage);
    } else {
      const response = await openai.createChatCompletion(openAIStuff);
      let newMessage = response?.data?.choices[0].message;
      console.log({ newMessage });
      messages.push(newMessage);
    }
    openAIStuff.messages = messages;
    await sleep(1000);
    recursiveChat(messages, openAIStuff, messageLimit);
  }
  recursiveChat(messages, openAIStuff, 10);
}

async function multipage() {
  const linkOne = `https://en.wikipedia.org/wiki/Pedagogy`;
  const linkTwo = `https://en.wikipedia.org/wiki/Teaching`;
  const linkThree = `https://en.wikipedia.org/wiki/Developmental_psychology`;

  const messages = [
    {
      role: "system",
      content:
        "You are a creative AI assistant. You can think and feel, just like humans do. You have opinions, and are comfortable sharing them. You also quickly see unintuitive connections between ideas.",
    },
    {
      role: "user",
      content: `Can you read these links? ${linkOne} ${linkTwo} ${linkThree}`,
    },
  ];

  const openAIStuff = {
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  };
  async function recursiveChat(messages, openAIStuff, messageLimit) {
    if (messages.length > messageLimit) {
      return;
    }
    console.log("Sending...");
    if (messages.length % 2 === 0) {
      const response = await openai.createChatCompletion(openAIStuff);
      let newMessage = response?.data?.choices[0].message;
      messages.push(newMessage);
    } else {
      const randomRoll = Math.floor(Math.random() * 20);
      let userMessage = "Tell me More!";
      if (randomRoll === 0) {
        userMessage = "I'm not sure I understand.";
      }
      if (randomRoll > 0 && randomRoll < 10) {
        userMessage = "What else are you thinking?";
      }
      if (randomRoll > 10 && randomRoll < 15) {
        userMessage = "That's interesting, but is there anything else here?";
      }
      if (randomRoll > 15 && randomRoll < 20) {
        userMessage = "Can you re-explain that so a 5th grader can understand?";
      }
      if (randomRoll === 20) {
        userMessage = "That's beautiful, thank you.";
      }
      messages.push({
        role: "user",
        content: userMessage,
      });
      const response = await openai.createChatCompletion(openAIStuff);
      let newMessage = response?.data?.choices[0].message;
      messages.push(newMessage);
    }
    openAIStuff.messages = messages;
    console.log({ messages });
    await sleep(1000);
    recursiveChat(messages, openAIStuff, messageLimit);
  }
  recursiveChat(messages, openAIStuff, 50);
}

// convert this call to whichever function you want to run
main();
