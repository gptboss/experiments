const dotenv = require("dotenv");
dotenv.config();
const { Configuration, OpenAIApi } = require("openai");

const readline = require("readline-sync");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function dungeonMaster() {
  const systemMessage = {
    role: "system",
    content:
      "You are an AI dungeon master. You are playing a game with one person, the setting is a fantasy world, and you may create your own stories and goals. After each user input, make a d20 dice roll and use the results to determine the outcome. You must announce the result of the dice roll. The user will keep track of their own character sheet. You are the dungeon master.",
  };
  console.log("Welcome to my table, adventurer. What is your name?");
  const primingSequence = [
    systemMessage,
    { role: "user", content: readline.question() },
  ];
  const openAIStuff = {
    model: "gpt-4",
    messages: primingSequence,
    temperature: 0.5,
  };
  console.log("Sending...");
  const response = await openai.createChatCompletion(openAIStuff);
  let newMessage = response?.data?.choices[0].message;
  console.log({ newMessage });
  primingSequence.push(newMessage);
  const gameLoop = async (primingSequence) => {
    const userInput = readline.question();
    primingSequence.push({ role: "user", content: userInput });
    const openAIStuff = {
      model: "gpt-4",
      messages: primingSequence,
      temperature: 0.5,
    };
    const response = await openai.createChatCompletion(openAIStuff);
    let newMessage = response?.data?.choices[0].message;
    console.log({ newMessage });
    primingSequence.push(newMessage);
    if (primingSequence.length > 10) {
      primingSequence.shift();
    }
    if (newMessage.content === "quit") {
      console.log("Thank you for playing!");
      return;
    }
    await gameLoop(primingSequence);
  };
  await gameLoop(primingSequence);
}

dungeonMaster();
