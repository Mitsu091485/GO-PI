const express = require('express');
const bodyParser = require('body-parser');
const PiBackend = require('pi-nodejs'); // switched to pi-nodejs from github

const APP_ID = process.env.PI_APP_ID || 'YOUR_PI_APP_ID';
const APP_SECRET = process.env.PI_APP_SECRET || 'YOUR_PI_APP_SECRET';

const app = express();
app.use(bodyParser.json());

const pi = new PiBackend({ appId: APP_ID, appSecret: APP_SECRET });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/pi/callback', (req, res) => {
  try {
    if (!pi.verifyRequest(req)) {
      return res.status(401).send({ error: 'Invalid signature' });
    }
    console.log('Pi Callback:', req.body);

    if (req.body.type === 'A2U_PAYMENT_AUTHORIZED') {
      console.log(`✅ User ${req.body.user_id} authorized ${req.body.amount} π`);
    }

    res.status(200).send({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'server error' });
  }
});

app.post('/create-payment', (req, res) => {
  const payment = {
    app_id: APP_ID,
    user_id: "test-user-id",
    amount: 1,
    memo: "GO PI test payment",
    callback_url: (process.env.PUBLIC_URL || "http://localhost:3000") + "/pi/callback"
  };

  const signed = pi.signPaymentRequest ? pi.signPaymentRequest(payment) : payment;
  res.json({ payment: signed });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 GO PI running on port ${PORT}`));
