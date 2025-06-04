import axios from 'axios';

export const getGPTPlan = async (emotion) => {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${emotion} 기분일 때 어울리는 하루 일정 추천해줘.` }]
  }, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
};