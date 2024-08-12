const express = require('express');
const axios = require('axios');
const app = express();

const SERVER_PORT = 9876;
const NUMBER_API_URL = 'http://20.244.56.144/test';
const RECENT_NUMBERS_LIMIT = 10;

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIzNDc1OTI5LCJpYXQiOjE3MjM0NzU2MjksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjI5MzhmMTk0LWI5NGEtNDZiMS1iZTNmLTdjZWM2NDM3MjgzZSIsInN1YiI6InJpdGhpY2suZTIxQGlpaXRzLmluIn0sImNvbXBhbnlOYW1lIjoiRm9uaXgiLCJjbGllbnRJRCI6IjI5MzhmMTk0LWI5NGEtNDZiMS1iZTNmLTdjZWM2NDM3MjgzZSIsImNsaWVudFNlY3JldCI6Ilh6U3hIdmxpendDbnhYdEwiLCJvd25lck5hbWUiOiJSaXRoaWNrIiwib3duZXJFbWFpbCI6InJpdGhpY2suZTIxQGlpaXRzLmluIiwicm9sbE5vIjoiUzIwMjEwMDEwMDcyIn0.iLextkuXfFDjAgXLOwtZO6NK4Hdpj2t9k2BJkRwBnIs';
let recentNumbers = [];

async function fetchNumbersByType(type) {
  let url;
  switch (type) {
    case 'e':
      url = `${NUMBER_API_URL}/even`;
      break;
    case 'p':
      url = `${NUMBER_API_URL}/primes`;
      break;
    case 'f':
      url = `${NUMBER_API_URL}/fibonacci`;
      break;
    case 'r':
      url = `${NUMBER_API_URL}/random`;
      break;
    default:
      return [];
  }

  try {
    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
    });
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching numbers of type ${type}:`, error.message);
    return [];
  }
}

function calculateavgOfList(numbers) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
}

app.get('/numbers/:type', async (req, res) => {
  const { type } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: 'Invalid number type' });
  }

  const newNumbers = await fetchNumbersByType(type);
  const uniqueNumbers = Array.from(new Set(newNumbers));

  const windowPrevState = [...recentNumbers];

  uniqueNumbers.forEach((num) => {
    if (!recentNumbers.includes(num)) {
      if (recentNumbers.length >= RECENT_NUMBERS_LIMIT) {
        recentNumbers.shift();
      }
      recentNumbers.push(num);
    }
  });

  const windowCurrState = [...recentNumbers];
  const avg = calculateavgOfList(windowCurrState);

  res.json({
    numbers: uniqueNumbers,
    windowPrevState,
    windowCurrState,
    avg,
  });
});

app.listen(SERVER_PORT, () => {
  console.log(`running on  port ${SERVER_PORT}`);;
});