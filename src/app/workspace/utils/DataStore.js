import {ReduceStore} from "flux/utils";
const _dispatcher = require('./DataDispatcher');

const _initialState = {
    modelData: {
        nodes: [],
        links: []
    },
    dataLineageData: {}
};

const reducers = {

    "set-model-data" : function (state, action): Object {
        let newState =  Object.assign({}, state);
        newState.modelData = action.data;
        return newState
    },

    "set-data-lineage-data" : function (state, action): Object {
        let newState =  Object.assign({}, state);
        newState.dataLineageData = action.data;
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
}

module.exports = new DataStore(_dispatcher);