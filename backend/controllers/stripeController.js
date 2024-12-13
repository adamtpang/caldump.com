const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionCanceled(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

async function handleCheckoutComplete(session) {
  try {
    const user = await User.findOne({ email: session.customer_email });
    if (!user) {
      console.error('User not found:', session.customer_email);
      return;
    }

    user.license = {
      isActive: true,
      stripeCustomerId: session.customer,
      subscriptionId: session.subscription,
      expiresAt: new Date(session.expires_at * 1000)
    };

    await user.save();
  } catch (error) {
    console.error('Error handling checkout:', error);
  }
}

async function handleSubscriptionCanceled(subscription) {
  try {
    const user = await User.findOne({
      'license.subscriptionId': subscription.id
    });

    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }

    user.license = {
      isActive: false,
      stripeCustomerId: user.license.stripeCustomerId,
      subscriptionId: null,
      expiresAt: new Date()
    };

    await user.save();
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}