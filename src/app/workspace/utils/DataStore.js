import {ReduceStore} from "flux/utils";
const _dispatcher = require('./DataDispatcher');

const _initialState = {
    modelData: {
        nodes: [],
        selectedItems: []
    },
    dataLineageData: {
        originNodes: [],
        targetNodes: [],
        nodes: [],
        links: []
    },
    additionalData: {
        originDataLoaded: false,
        targetDataLoaded: false,

        dataSets: [],
        originDataStructures: [],
        targetDataStructures: [],
        originMappings: [],
        targetMappings: [],
        mappings: []
    },
    settings: {
        baseUrl: "http://localhost:8086/v1/",
        timeout: 100000,
        token: "Basic :"
    },
    loadingState: {
        isLoading: false,
        loadingText: ""
    }
};

const reducers = {

    "set-model-data": function (state, action): Object {
        let newState = Object.assign({}, state);
        newState.modelData = action.data;
        return newState
    },

    "set-data-lineage-data": function (state, action): Object {
        let newState = Object.assign({}, state);
        newState.dataLineageData = Object.assign({}, state.dataLineageData, action.data);
        return newState
    },

    "set-additional-data": function (state, action): Object {
        let newState = Object.assign({}, state);
        newState.additionalData = Object.assign({}, state.additionalData, action.data);
        return newState
    },

    "set-settings": function (state, action): Object {
        let newState = Object.assign({}, state);
        newState.settings = action.data;
        return newState
    }
};

class DataStore extends ReduceStore {

    getInitialState(): Object {
        return _initialState;
    }

    reduce(state, action): Object {
        var reducer: Function = reducers[action.type];
        return reducer ? reducer(state, action) : state;
    }

    getModelData(state) {
        const usedState = state ? state : this.getState();
        return usedState.modelData;
    }

    getDataLineageData(state) {
        const usedState = state ? state : this.getState();
        return usedState.dataLineageData;
    }

    getAdditionalData(state) {
        const usedState = state ? state : this.getState();
        return usedState.additionalData;
    }

    getSettings(state) {
        const usedState = state ? state : this.getState();
        return usedState.settings;
    }

    getLoadingState(state) {
        const usedState = state ? state : this.getState();
        return usedState.loadingState;
    }
}

module.exports = new DataStore(_dispatcher);