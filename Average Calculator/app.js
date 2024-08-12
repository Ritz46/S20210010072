const express = require('express');
const axios = require('axios');
const app = express();

const port_no = 9876;
const test_url = 'http://20.244.56.144/test';
const window_lim = 10;

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIzNDc2MzgxLCJpYXQiOjE3MjM0NzYwODEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjI5MzhmMTk0LWI5NGEtNDZiMS1iZTNmLTdjZWM2NDM3MjgzZSIsInN1YiI6InJpdGhpY2suZTIxQGlpaXRzLmluIn0sImNvbXBhbnlOYW1lIjoiRm9uaXgiLCJjbGllbnRJRCI6IjI5MzhmMTk0LWI5NGEtNDZiMS1iZTNmLTdjZWM2NDM3MjgzZSIsImNsaWVudFNlY3JldCI6Ilh6U3hIdmxpendDbnhYdEwiLCJvd25lck5hbWUiOiJSaXRoaWNrIiwib3duZXJFbWFpbCI6InJpdGhpY2suZTIxQGlpaXRzLmluIiwicm9sbE5vIjoiUzIwMjEwMDEwMDcyIn0.0j9mjC1iK40leUYBvZCzuzM-LNRv3XorIrW1UiDkTZ0';
let nums = [];

async function fetchNumbersByType(type) {
  let url;
  switch (type) {
    case 'e':
      url = `${test_url}/even`;
      break;
    case 'p':
      url = `${test_url}/primes`;
      break;
    case 'f':
      url = `${test_url}/fibo`;
      break;
    case 'r':
      url = `${test_url}/rand`;
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

function calcAvg(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
  sum += numbers[i];
}
return (sum / numbers.length).toFixed(2);
}

app.get('/numbers/:type', async (req, res) => {
  const { type } = req.params;

  if (['p', 'f', 'e', 'r'].includes(type)==0) {
    return res.status(400).json({ error: 'Invalid number type' });
  }

  const newNumbers = await fetchNumbersByType(type);
  const uniqueNumbers = Array.from(new Set(newNumbers));

  const windowPrevState = [...nums];

  uniqueNumbers.forEach((num) => {
    if (!nums.includes(num)) {
      if (nums.length >= window_lim) {
        nums.shift();
      }
      nums.push(num);
    }
  });

  const windowCurrState = [...nums];
  const avg = calcAvg(windowCurrState);

  res.json({
    numbers: uniqueNumbers,
    windowPrevState,
    windowCurrState,
    avg,
  });
});

app.listen(port_no, () => {
  console.log(`running on  port ${port_no}`);;
});
