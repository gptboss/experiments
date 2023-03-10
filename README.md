# GPTBoss Experiments

This repository has a bunch of random bullshit experiments I've done with ChatGPT. I'm not sure if they're useful to anyone, but I'm putting them here for posterity.

## Setup

if Node is installed:

`npm i`

you also need an openai key, and to change .env.example to .env and put your key in there.
You get an openai key from openai.

## Running

Change one of the functions in `index.js` to `main()` and run `node index.js`, or change the `main()` function to the experimental function you want to run.
Results appear in the console.

## Experiments

### Multiplayer

The multiplayer experiement checks how ChatGPT responds to multiple user inputs. You can see in the code that there are multiple user messages before the assistant creation is created. To run the experiment, change the call for `main()` to `multiplayer()` and run `node index.js`. You can change the number of user messages and content of user messages by changing the `userMessages` array.

### Search Toolformer

The search experiment allows you to convert queries to function calls. To run the experiment, change the call for `main()` to `search()` and run `node index.js`. You can change the query by changing the `query` variable.

### Link Reading

`oneLink()` and `multipage()` both experiment with reading links. `oneLink()` reads a single link, and `multipage()` reads multiple links. To run the experiment, change the call for `main()` to `oneLink()` or `multipage()` and run `node index.js`. You can change the links by changing the links variables. 