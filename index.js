const PORT = process.env.PORT || 5000;
const express = require('express');
const { Aki } = require('aki-api');
const uniqId = require('uniqid');
const cors = require('cors');

const app = express();
const region = 'en';
const akiInstances = {};

app.use(cors());

app.get('/newsession', async (req, res) => {
  const sessionId = uniqId();
  const aki = new Aki(region);
  akiInstances[sessionId] = aki;
  await aki.start();
  res.json({ sessionId });
});

app.get('/nextquestion', async (req, res) => {
  const { sessionId } = req.query;
  const aki = akiInstances[sessionId];
  if (!aki) {
    res.json({ error: 'you must provide a valid session id' });
  } else {
    await aki.step(parseInt(req.query.answer, 10));
    if (aki.progress >= 70 || aki.currentStep >= 78) {
      await aki.win();
      console.log('firstGuess:', aki.answers);
      console.log('guessCount:', aki.guessCount);
      res.json({ guessCount: aki.guessCount, answers: aki.answers });
    } else {
      res.json({ question: aki.question, answers: aki.answers });
    }
  }
});

app.listen(PORT, () => {});
