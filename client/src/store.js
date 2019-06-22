import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

import { defaultClient as ApolloClient } from "./main";
import {
  GET_CURRENT_USER,
  GET_POSTS,
  SIGNIN_USER,
  SIGNUP_USER,
  ADD_POST
} from "./queries";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    user: null,
    loading: false,
    error: null,
    authError: null
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
    setError: (state, payload) => {
      state.error = payload;
    },
    setAuthError: (state, payload) => {
      state.authError = payload;
    },
    clearUser: state => {
      state.user = null;
    },
    clearError: state => {
      state.error = null;
    }
  },
  actions: {
    getCurrentUser: ({ commit }) => {
      commit("setLoading", true);
      ApolloClient.query({
        query: GET_CURRENT_USER
      })
        .then(({ data }) => {
          commit("setLoading", false);
          // Add user data to state
          commit("setUser", data.getCurrentUser);
          console.log(data.getCurrentUser);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    getPosts: ({ commit }) => {
      commit("setLoading", true);
      // use ApolloClient to fetch getPosts query
      ApolloClient.query({
        query: GET_POSTS
      })
        .then(({ data }) => {
          // Pass data to state via mutations
          // commit passes data from actions along to mutation function
          commit("setPosts", data.getPosts);
          commit("setLoading", false);
          console.log(data.getPosts);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    addPost: ({ commit }, payload) => {
      ApolloClient.mutate({
        mutation: ADD_POST,
        variables: payload,
        update: (cache, { data: { addPost } }) => {
          console.log(cache, data);
          // Read ROOT_QUERY from GET_POSTS
          const data = cache.readQuery({ query: GET_POSTS });
          // Create updated data
          data.getPosts.unshift(addPost);
          // Update data to ROOT_QUERY
          cache.writeQuery({
            query: GET_POSTS,
            data
          });
        },
        // optimistic response ensures data is added immediately
        optimisticResponse: {
          __typename: "Mutation",
          addPost: {
            __typename: "Post",
            _id: -1,
            ...payload
          }
        }
      })
        .then(({ data }) => {
          console.log(data.addPost);
        })
        .catch(err => {
          commit("setLoading", false);
          commit("setError", err);
          console.error(err);
        });
    },
    signinUser: ({ commit }, payload) => {
      //clear error state
      commit("clearError");
      // set Loading
      commit("setLoading", true);
      ApolloClient.mutate({
        mutation: SIGNIN_USER,
        variables: payload
      })
        .then(({ data }) => {
          commit("setLoading", false);
          localStorage.setItem("token", data.signinUser.token);
          //console.log(data.signinUser);
          router.go();
        })
        .catch(err => {
          commit("setLoading", false);
          commit("setError", err);
          console.error(err);
        });
    },
    signupUser: ({ commit }, payload) => {
      //clear error state
      commit("clearError");
      // set Loading
      commit("setLoading", true);
      ApolloClient.mutate({
        mutation: SIGNUP_USER,
        variables: payload
      })
        .then(({ data }) => {
          commit("setLoading", false);
          localStorage.setItem("token", data.signupUser.token);
          //console.log(data.signinUser);
          router.go();
        })
        .catch(err => {
          commit("setLoading", false);
          commit("setError", err);
          console.error(err);
        });
    },
    signoutUser: async ({ commit }) => {
      // clear user in state
      commit("clearUser");
      // remove token in localStorage
      localStorage.setItem("token", "");
      // end session
      await ApolloClient.resetStore();
      //redirect home
      router.push("/");
    }
  },
  getters: {
    posts: state => state.posts,
    user: state => state.user,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError
  }
});
