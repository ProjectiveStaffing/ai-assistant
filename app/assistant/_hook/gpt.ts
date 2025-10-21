 import type { NextApiRequest, NextApiResponse } from 'next';
import openai from './openai';

 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { message } = req.body;
 
  if (!message) return res.status(400).json({ error: 'No message provided' });
 
  try {

    const completion = await openai.chat.completions.create({

  messages: [

    {

      role: 'system',

      content: 'Responde en formato JSON con los campos: intent, taskname, fecha, relationship.',

    },

    {

      role: 'user',

      content: message,

    },

  ],

  model: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT!,

  temperature: 0.7,

  response_format: { type: 'json_object' }, // ✅ CORRECTO

});

 
 
    const content = completion.choices[0].message?.content;

    const parsed = JSON.parse(content ?? '{}');
 
    res.status(200).json(parsed);

  } catch (error) {

    console.error('GPT error:', error);

    res.status(500).json({ error: 'Error al procesar la solicitud' });

  }

}

 