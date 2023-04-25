import { Configuration, OpenAIApi } from 'openai';
import { createFunction } from '@mui/toolpad/server';

export const query_open = createFunction(
  async function open({ parameters }) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    try {
      const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: 'Hello world',
        max_tokens: 100,
      });
      console.log(completion.data.choices[0].text);
      return completion.data.choices[0].text;
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  },

  {
    parameters: {
      prompt: {
        typeDef: { type: 'string' },
      },
    },
  },
);

export const query_open2 = createFunction(
  async function open2({ parameters }) {
    const messages = [];
    messages.push({ role: 'user', content: parameters.prompt });

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    console.log(messages);
    const chat = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n'),
      max_tokens: 100,
    });

    // console.log(completion.data.choices[0].text);
    // return completion.data.choices[0].text;
    const reply = chat.data.choices[0].text;
    console.log(`ChatGPT: ${reply}`);
    messages.push({ role: 'assistant', content: reply });
  },

  {
    parameters: {
      prompt: {
        typeDef: { type: 'string' },
      },
    },
  },
);

export const query_open3 = createFunction(
  async function open3({ parameters }) {
    const message_arr = [];
    message_arr.push({
      role: 'user',
      content: 'Tell me something interesting about 10th August 2000',
    });

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const chat = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: message_arr,
      max_tokens: 100,
    });

    // message_arr.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    // console.log(message_arr)
    // console.log(chat.data.choices[0].message);

    const reply = chat.data.choices[0].message;
    // console.log(`ChatGPT: ${reply}`);
    // console.log(reply);

    message_arr.push({ role: 'assistant', content: reply });
    console.log(message_arr);
    return chat.data.choices[0].message;
  },
  {
    parameters: {
      prompt: {
        typeDef: { type: 'string' },
      },
    },
  },
);
