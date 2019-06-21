import '@babel/polyfill';
import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';

import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

Vue.use(VueApollo);

// setup ApolloClient
export const defaultClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  // include auth token
  fetchOptions: {
    credentials: 'include',
  },
  request: operation => {
    // if no token in localStorage, add it
    if (!localStorage.token) {
      localStorage.setItem('token', '');
    }

    // add token to authorization header
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token'),
      },
    });
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      console.log('[networkError]', networkError);
    }

    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err);
      }
    }
  },
});

const apolloProvider = new VueApollo({ defaultClient });

Vue.config.productionTip = false;

new Vue({
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App),
  created() {
    // execute getCurrentUser query
    this.$store.dispatch('getCurrentUser');
  },
}).$mount('#app');
