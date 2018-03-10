import vue from 'vue'
import axios from 'axios'
import vuex from 'vuex'
import router from '../router'

var production = !window.location.host.includes('localhost')
var baseURL = production ? '//kanbanception.herokuapp.com/' : '//localhost:3000/'

var api = axios.create({
    baseURL: baseURL + "api/",
    timeout: 3000,
    withCredentials: true
});

var auth = axios.create({
    baseURL: baseURL + "auth/",
    timeout: 3000,
    withCredentials: true
});

vue.use(vuex)

var store = new vuex.Store({
    state: {
        user: {},
        boards: {},
        activeBoard: {},
        lists: {},
        tasks: {},
        comments: {}

    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        // TO ADD ONE NEW BOARD
        addBoard(state, payload) {
            state.boards.unshift(payload)
        },
        //TO SET ALL BOARDS FOR USER
        getBoards(state, payload) {
            state.boards = payload
        },
        // TO SET ACTIVE BOARD
        setActiveBoard(state, board) {
            state.activeBoard = board
        },
        // TO ADD ONE NEW LIST
        addList(state, payload) {
            state.lists.unshift(payload)
        },
        //TO SET ALL LISTS FOR USER
        getLists(state, payload) {
            state.lists = payload
        },
        // TO SET ACTIVE LIST
        setActiveList(state, list) {
            state.activeList = list
        },
        // TO ADD ONE NEW TASK
        addTask(state, payload) {
            debugger
            state.tasks.unshift(payload)
        },
        addComment(state, payload) {
            state.comments.unshift(payload)
        },
        getComments(state, payload) {
            state.comments = payload
        },
        getTasks(state, payload) {
            state.tasks[payload.listId] = payload.results
        }
    },
    actions: {
        //BOARD ACTIONS
        addBoard({ commit, dispatch }, payload) {
            api.post("boards/", payload)
                .then(results => {
                    dispatch("getBoards", results.data)
                })
        },
        getBoards({ commit, dispatch }, payload) {
            api.get("boards/")
                .then(result => {
                    console.log(result)
                    commit("getBoards", result.data)
                })
                .catch(err => { console.log(err) })
        },
        setActiveBoard({ commit, dispatch }, payload) {
            api.get("boards/" + payload._id)
                .then(result => {
                    commit('setActiveBoard', { id: payload, data: result.data })
                    router.push({ name: 'Board' })
                    console.log(result)
                    commit('setActiveBoard', result.data)
                })
                .catch(err => { console.log(err) })
        },
        removeBoard({ commit, dispatch }, payload) {
            api.delete("boards/" + payload._id)
                .then(result => {
                    dispatch("getBoards")
                })
        },
        //LIST ACTIONS
        addList({ commit, dispatch }, payload) {
            api.post('boards/' + payload.boardId + '/lists/', payload)
                .then(results => {
                    dispatch("getLists", { _id: payload.boardId })
                })
        },
        getLists({ commit, dispatch }, payload) {
            api.get('boards/' + payload._id + '/lists/')
                .then(result => {
                    console.log(result)
                    commit("getLists", result.data)
                })
                .catch(err => { console.log(err) })
        },
        setActiveList({ commit, dispatch }, payload) {
            console.log(payload)
            api.get("boards/" + payload._id + '/lists/' + list._id)
                .then(result => {
                    commit('setActiveList', { id: payload, data: result.data })
                    router.push({ name: 'List' })
                    console.log(result)
                    commit("setActiveList", result.data)
                })
                .catch(err => { console.log(err) })
        },
        removeList({ commit, dispatch }, payload) {
            api.delete("lists/" + payload._id)
                .then(result => {
                    dispatch("getLists")
                })
        },
        //TASK ACTIONS
        addTask({ commit, dispatch }, payload) {
            debugger
            api.post('boards/' + payload.boardId + '/lists/' + payload.listId + '/tasks/', payload)
                .then(results => {
                    console.log(results)
                    dispatch("getTasks", { _id: payload.listId })
                })
                .catch(err => { console.log(err) })
        },

        // getTasks not written yet
        getTasks({ commit, dispatch }, payload) {
            api.get('boards/' + payload._id + '/lists/' + payload.listId + '/tasks/')
            .then(result => {
                    console.log(result)
                    var foundTasks = {
                        results: result.data,
                        listId: payload.listId
                    }
                    commit("getTasks", foundTasks)
                })
                .catch(err => { console.log(err) })
        },

        getComments({ commit, dispatch }, payload) {
            api.post('boards/' + payload.boardId + '/lists/' + payload.listId + '/tasks/' + payload.taskId + '/comments/')
                .then(result => {
                    console.log(result)
                    commit('getComments', result.data)
                })
                .catch(err => { console.log(err) })
        },

        addComments({ commit, dispatch }, payload) {
            api.post('boards/' + payload.boardId + '/lists/' + payload.listId + '/tasks/' + payload.taskId + '.comments/', payload)
                .then(results => {
                    console.log(results)
                    dispatch("getComments", { _id: payload.taskId })
                })
                .catch(err => (console.log(err)))
        },



        //Login and Register actions ===================================================================
        login({ commit, dispatch }, payload) {
            auth.post('login', payload)
                .then(user => {
                    commit('setUser', user.data)
                    router.push({ name: 'Home' })
                    console.log(user.data)
                })
                .catch(err => {
                    commit('handleError', err)
                })
        },
        createUser({ commit, dispatch }, payload) {
            auth.post('createUser', payload)
                .then(user => {
                    commit('setUser', user.data)
                    router.push({ name: 'Home' })
                    console.log(user.data)
                })
                .catch(err => {
                    commit('handleError', err)
                })
        },
        logout({ commit, dispatch }, payload) {
            auth.delete('logout')
                .then(res => {
                    commit('setUser', {})
                        // router.push({ name: 'Login' })
                    console.log(res)
                })
                .catch(err => {
                    commit('handleError', err)
                })
        },
        authenticate({ commit, dispatch }) {
            auth.get('authenticate')
                .then(res => {
                    console.log("You are signed in", res.data)
                    commit('setUser', res.data)
                })
                .catch(err => {
                    console.error(err);
                })
        },

    }
})

export default store