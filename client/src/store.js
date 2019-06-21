import Vue from 'vue';
import Vuex from 'vuex';

import { gql } from 'apollo-boost';
import { defaultClient as ApolloClient } from './main';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload;
    },
  },
  actions: {
    getPosts: ({ commit }) => {
      // use ApolloClient to fetch getPosts query
      ApolloClient.query({
        query: gql`
          query {
            getPosts {
              _id
              title
              imageUrl
            }
          }
        `,
      })
        .then(({ data }) => {
          // Pass data to state via mutations
          // commit passes data from actions along to mutation function
          commit('setPosts', data.getPosts);
          console.log(data.getPosts);
        })
        .catch(err => {
          console.error(err);
        });
    },
  },
  getters: {
    posts: state => state.posts
  }
});
