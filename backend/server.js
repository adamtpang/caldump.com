const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })
});

const db = getFirestore();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Configure CORS
app.use(cors({
  origin: ['https://caldump.com', 'https://www.caldump.com', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, email, returnUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1QUgojFL7C10dNyG4VKw4oFl',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
      client_reference_id: userId,
      customer_email: email,
      metadata: {
        userId: userId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook handler
const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  console.log('Received webhook with signature:', sig);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('Webhook event type:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    console.log('Processing completed checkout for user:', userId);

    try {
      // Update user's license in Firestore
      await db.collection('users').doc(userId).set({
        license: {
          active: true,
          purchaseDate: new Date().toISOString(),
          stripeSessionId: session.id,
          lastUpdated: new Date().toISOString()
        }
      }, { merge: true });

      console.log('License activated successfully for user:', userId);
    } catch (error) {
      console.error('Error updating user license:', error);
      return res.status(500).send('Error updating user license');
    }
  }

  res.json({ received: true });
};

// Raw body parser for Stripe webhooks
app.post('/api/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});