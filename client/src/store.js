import Vue from 'vue';
import Vuex from 'vuex';
import router from './router';

import { defaultClient as ApolloClient } from './main';
import { GET_CURRENT_USER, GET_POSTS, SIGNIN_USER } from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    user: null,
    loading: false,
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setUser: (state, payload) => {
      state.user = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    clearUser: state => {
      state.user = null;
    },
  },
  actions: {
    getCurrentUser: ({ commit }) => {
      commit('setLoading', true);
      ApolloClient.query({
        query: GET_CURRENT_USER,
      })
        .then(({ data }) => {
          commit('setLoading', false);
          // Add user data to state
          commit('setUser', data.getCurrentUser);
          console.log(data.getCurrentUser);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error(err);
        });
    },
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
      ApolloClient.mutate({
        mutation: SIGNIN_USER,
        variables: payload,
      })
        .then(({ data }) => {
          localStorage.setItem('token', data.signinUser.token);
          //console.log(data.signinUser);
          router.go();
        })
        .catch(err => {
          console.error(err);
        });
    },
    signoutUser: async ({ commit }) => {
      // clear user in state
      commit('clearUser');
      // remove token in localStorage
      localStorage.setItem('token', '');
      // end session
      await ApolloClient.resetStore();
      //redirect home
      router.push('/');
    },
  },
  getters: {
    posts: state => state.posts,
    user: state => state.user,
    loading: state => state.loading,
  },
});
