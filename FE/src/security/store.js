import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    blogId: null,
    // user: null
  },
  mutations: {
    SET_AUTH(state, status) {
      state.isAuthenticated = status;
    },
    SET_BLOG_ID(state, blogId) {
      state.blogId = blogId;
    },
    CLEAR_BLOG_ID(state) {
      state.blogId = null;
    },
    // SET_USER(state, user) {
    //   state.user = user;
    // }
  },
  actions: {
    // authenticate({ commit }, user) {
    authenticate({ commit }) {
      commit('SET_AUTH', true);
      // commit('SET_USER', user);
    },
    unauthenticate({ commit }) {
      commit('SET_AUTH', false);
      // commit('SET_USER', null);
    },
    setBlogId({ commit }, blogId) {
      commit('SET_BLOG_ID', blogId);
    },
    clearBlogId({ commit }) {
      commit('CLEAR_BLOG_ID');
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    blogId: state => state.blogId,
    // user: state => state.user
  }
});
