import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Julep } from '@julep/sdk';



const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const julepClient = new Julep({
  apiKey:      process.env.JULEP_API_KEY,
  environment: process.env.JULEP_ENVIRONMENT
});

const AGENT_ID = process.env.JULEP_AGENT_ID;
if (!AGENT_ID) {
  console.error('JULEP_AGENT_ID must be set in your .env');
  process.exit(1);
}

const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: { appid: process.env.OPENWEATHERMAP_API_KEY, units: 'metric' }
});


function decideDiningStyle({ weatherMain, weatherDesc, temp }) {
  const main = (weatherMain || '').toLowerCase();
  const desc = (weatherDesc  || '').toLowerCase();
  const comfortable = temp >= 15 && temp <= 30;
  const clearSky    = main.includes('clear') || desc.includes('sunny');
  const wetStuff    = ['rain','drizzle','thunderstorm','snow'].some(k => main.includes(k));
  return clearSky && comfortable && !wetStuff ? 'outdoor' : 'indoor';
}

async function julepJSONPrompt(prompt) {
  const session = await julepClient.sessions.create({ agent: AGENT_ID });
  const chat    = await julepClient.sessions.chat(session.id, {
    messages: [{ role: 'user', content: prompt }],
    auto_run_tools: false
  });
  const raw = chat.choices[0].message.content.trim();
  try {
    return JSON.parse(raw);
  } catch {
    return raw
      .split(/\n+/)
      .map(l => l.replace(/^[\d+\-\)\.]+\s*/, '').trim())
      .filter(Boolean);
  }
}

function buildNarrative({ dish, restaurant, diningStyle, includeForecast, forecast }) {
  const venue = restaurant
    ? `${restaurant.name} (${restaurant.rating.toFixed(1)}/5, ${restaurant.address})`
    : 'a beloved local spot';
  const style = diningStyle === 'outdoor'
    ? 'Grab a patio seat and enjoy the sunshine.'
    : 'Find a cosy table indoors away from the elements.';
  const intro = includeForecast ? `With ${forecast}, ` : '';
  return `${intro}savour “${dish}” at ${venue}. ${style}`;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => res.send('pong'));

app.post('/api/itinerary', async (req, res) => {
  const { cities } = req.body;
  if (!Array.isArray(cities) || !cities.length) {
    return res.status(400).json({ error: 'cities must be a non-empty array' });
  }

  // Process all cities in parallel for better performance
  const results = await Promise.all(cities.map(async (city) => {
    try {
      const { data: w } = await weatherClient.get('/weather', { params: { q: city } });
      const forecastStr = `${w.weather[0].description}, ${w.main.temp.toFixed(1)}°C`;
      const diningStyle = decideDiningStyle({
        weatherMain: w.weather[0].main,
        weatherDesc: w.weather[0].description,
        temp: w.main.temp
      });

      let summary;
      if (diningStyle === 'outdoor') {
        summary = `Today in ${city}: expect ${forecastStr}. It's sunny, so for breakfast and dinner, outdoor dining is recommended; for lunch, indoor seating would be cozier. Here's your foodie plan:`;
      } else {
        summary = `Today in ${city}: expect ${forecastStr}. Given the conditions, indoor dining is recommended for all meals. Here's your foodie plan:`;
      }

      const dishes = await julepJSONPrompt(
        `Return only a JSON array of exactly 3 strings – the iconic local dishes in ${city}. No code fences or extra text.`
      );
      if (!Array.isArray(dishes) || dishes.length !== 3) {
        throw new Error('Failed to fetch dishes');
      }

      const restaurants = {};
      for (const dish of dishes) {
        restaurants[dish] = await julepJSONPrompt(
          `Return only a JSON array (≤5) of objects for top-rated restaurants in ${city} serving "${dish}". ` +
          'Each object: {"name":string,"rating":number,"address":string}. No code fences or extra text.'
        );
      }

      const itinerary = { summary };
      ['breakfast','lunch','dinner'].forEach((meal, idx) => {
        itinerary[meal] = buildNarrative({
          dish: dishes[idx],
          restaurant: restaurants[dishes[idx]][0],
          diningStyle,
          includeForecast: false,
          forecast: ''
        });
      });

      return [city, {
        weather: forecastStr,
        weatherRaw: w,
        diningStyle,
        dishes,
        restaurants,
        itinerary
      }];
    } catch (err) {
      console.error(`Error for ${city}:`, err);
      return [city, { error: err.message || 'Internal failure' }];
    }
  }));

  const out = Object.fromEntries(results);

  res.json(out);
});

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(` running on ${PORT}`));
