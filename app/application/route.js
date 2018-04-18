import { hash } from 'rsvp';
import { run } from '@ember/runloop';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route'

export default Route.extend({
  theme: service(),
  session: service(),
  store: service(),

  removeInitialLoading: on('activate', function() {
    if (document) {
      const initalLoadingIndicator = document.getElementById('initial-loading-indicator');
      initalLoadingIndicator && initalLoadingIndicator.remove();
    }
  }),

  fetchCartItems() {
    return this.store.findAll('cart-item');
  },

  beforeModel() {
    const fetchSession = this.get('session').fetch().catch(function() {});

    // initial loading
    run(function() {
      const initalLoadingIndicator = document.getElementById('initial-loading-indicator');

      if (!initalLoadingIndicator) {
        return; // abort
      }

      const loadingProgress = initalLoadingIndicator.children[0].children[1];
      loadingProgress.value = 70;

      fetchSession.then(function() {
        loadingProgress.value = 100;
      });
    });

    return fetchSession;
  },

  model() {
    return hash({
      cartItems: this.fetchCartItems()
    });
  },

  actions: {
    signIn(provider) {
      this.get('session').open('firebase', { provider }).then(() => { this.transitionTo('/'); });
    },

    signOut() {
      this.get('session').close().then(() => { this.refresh(); }).catch((/*err*/) => {
        // fail silently
      });
    },

    transitionTo(route) {
      // transitionTo(route, id, event) vs transitionTo(route, event)
      const id = arguments.length > 2 ? arguments[1] : null;

      if (isEmpty(id)) {
        this.transitionTo(route);
      } else {
        this.transitionTo(route, id);
      }
    },

    hopTo(url) {
      // TODO make this work with Cordova
      window.location.assign(url);
    },

    // usage: this.send('toastMessage', message)
    // alt usage: {{action "toastMessage" message}}
    // expires after 6 seconds
    toastMessage(message) {
      this.get('theme').toastMessage(message);
    },

    // usage: this.send('addToCart', product, options)
    // alt usage: {{action "addToCart" product (hash quantity=1)}}
    // options will be the customizations added to the cart item, such as
    // quantity, color, size, etc.
    addToCart(product, options = {}) {
      const cartItems = this.modelFor('application').cartItems;
      const quantity = options.quantity || 1;

      let cartItem = cartItems.findBy('product.id', product.get('id'));

      if (cartItem) {
        cartItem.incrementProperty('quantity', quantity);
      } else {
        cartItem = this.store.createRecord('cart-item', {
          product, quantity
        });
      }

      cartItem.save().then(() => {
        this.get('theme').toastMessage(`${quantity} item(s) added`, {
          path: 'cart',
          text: 'view cart'
        });
      }).catch(() => {
        this.get('theme').toastMessage('error adding item');
      });
    },

    destroyRecord(record) {
      record.destroyRecord();
    }
  }
});
