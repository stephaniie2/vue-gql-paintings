import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as ApolloClient } from './main';
import { GET_POSTS, SIGNIN_USER } from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    loading: false,
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
  },
  actions: {
    getPosts: ({ commit }) => {
      commit('setLoading', true);
      // use ApolloClient to fetch getPosts query
      ApolloClient.query({
        query: GET_POSTS,
      })
        .then(({ data }) => {
          // Pass data to state via mutations
          // commit passes data from actions along to mutation function
          commit('setPosts', data.getPosts);
          commit('setLoading', false);
          console.log(data.getPosts);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error(err);
        });
    },
    signinUser: ({ commit }, payload) => {
      ApolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload,
        })
        .then(({ data }) => {
          console.log(data.signinUser);
        })
        .catch(err => {
          console.error(err);
        });
    },
  },
  getters: {
    posts: state => state.posts,
    loading: state => state.loading,
  },
});