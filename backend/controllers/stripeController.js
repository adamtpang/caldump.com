const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('Received Stripe webhook with signature:', sig ? 'present' : 'missing');
    console.log('Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'present' : 'missing');

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook event type:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Processing checkout.session.completed:', {
          customerEmail: session.customer_email,
          customerId: session.customer,
          clientReferenceId: session.client_reference_id,
          metadata: session.metadata
        });
        await handleCheckoutComplete(session);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Send 200 response to acknowledge receipt even if processing failed
    res.json({ received: true, error: error.message });
  }
};

async function handleCheckoutComplete(session) {
  try {
    console.log('Handling checkout completion for:', session.customer_email);

    // Try to find user by email from session or client reference ID
    const email = session.customer_email || session.client_reference_id;
    if (!email) {
      console.error('No email found in session');
      return;
    }

    // Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found, creating new user:', email);
      // Create new user if doesn't exist
      user = new User({
        email,
        googleId: email, // Will be updated when they sign in with Google
        license: {
          isActive: true,
          stripeCustomerId: session.customer,
          purchaseDate: new Date()
        }
      });
    } else {
      console.log('Found existing user:', {
        email: user.email,
        googleId: user.googleId
      });
    }

    // Update user's license
    user.license = {
      isActive: true,
      stripeCustomerId: session.customer,
      purchaseDate: new Date(),
      ...user.license, // Preserve any existing license data
      lastUpdated: new Date()
    };

    await user.save();
    console.log('Successfully updated user license:', {
      email: user.email,
      isActive: user.license.isActive,
      stripeCustomerId: user.license.stripeCustomerId
    });

    // Double-check the save was successful
    const verifyUser = await User.findOne({ email });
    console.log('Verification of saved user:', {
      email: verifyUser.email,
      licenseActive: verifyUser.license?.isActive,
      stripeCustomerId: verifyUser.license?.stripeCustomerId
    });

  } catch (error) {
    console.error('Error handling checkout:', {
      error: error.message,
      stack: error.stack,
      session: {
        customerEmail: session.customer_email,
        customerId: session.customer
      }
    });
    throw error;
  }
}