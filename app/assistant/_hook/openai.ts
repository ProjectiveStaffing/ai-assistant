import OpenAI from 'openai';
 
const openai = new OpenAI({

  apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY,

  baseURL: `${process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT}`,

  defaultQuery: {

    'api-version': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION,

  },

  defaultHeaders: {

    'api-key': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY!,

  },

});
 
export default openai;

 