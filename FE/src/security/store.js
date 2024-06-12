import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    user: null
  },
  mutations: {
    SET_AUTH(state, status) {
      state.isAuthenticated = status;
    },
    // SET_USER(state, user) {
    //   state.user = user;
    // }
  },
  actions: {
    // authenticate({ commit }, user) {
    authenticate({ commit } ) {
      commit('SET_AUTH', true);
      // commit('SET_USER', user);
    },
    unauthenticate({ commit }) {
      commit('SET_AUTH', false);
      // commit('SET_USER', null);
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user
  }
});
