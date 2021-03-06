import axios from "axios-es6";
import JSONConfigProvider from "./JSONConfigProvider";
import ObjectTransformer from "./ObjectTransformer";

const _dispatcher = require('./DataDispatcher');

class DataGetter {

    static loadDataForObjectTypes(loadingModelData: boolean = true, objectTypes: []): [] {
        load.setText("Fetching requested data, please wait...");

        const axiosGetter = axios.create(JSONConfigProvider.createMetaInformation());

        let nodes = [];
        let options = JSONConfigProvider.generateRequest(objectTypes);
        let childrenToLoad = [];

        let promiseArray = [];

        options.forEach(option => {
            // it's only an URL, use it directly
            if (typeof option === 'string' || option instanceof String) {
                promiseArray.push(axiosGetter.get(option));
            }
            // or it's a complete object (usually because more logic is needed)
            else if (option === Object(option)) {
                promiseArray.push(axiosGetter.get(option.api));
                if (option.children) {
                    option.children.forEach(child => {
                        promiseArray.push(axiosGetter.get(child.api));
                        childrenToLoad.push({
                            parentType: child.parentType,
                            childType: child.childType,
                            parentKey: child.key,
                            childKey: child.childKey ? child.childKey : "_uuid",
                            intoProperty: child.intoProperty
                        })
                    })
                }
            }
        });
        try {
            axios.all(promiseArray)
                .then((results) => {
                    for (let i = 0; i < results.length; i++) {
                        let result = results[i];
                        let treatChildrenInSpecialWay = false;
                        if (result && result.data) {
                            let currentNodes = result.data.rows;
                            for (let j = 0; j < childrenToLoad.length; j++) {
                                let childrenType = childrenToLoad[j].childType;
                                if (currentNodes && currentNodes.length > 0 && currentNodes[0]._type === childrenType) {
                                    childrenToLoad[j].nodes = currentNodes;
                                    treatChildrenInSpecialWay = true;
                                }
                            }
                            if (!treatChildrenInSpecialWay) {
                                nodes = nodes.concat(currentNodes);
                            }
                        }
                    }
                    for (let j = 0; j < childrenToLoad.length; j++) {
                        let children = childrenToLoad[j];
                        if (children.nodes && children.nodes.length > 0) {
                            this.mergeChildrenIntoParents(nodes, children);
                        }
                    }
                    _dispatcher.dispatch({
                        type: "set-" + (loadingModelData ? "model" : "data-lineage") + "-data",
                        data: {
                            "nodes": nodes,
                            "selectedItems": objectTypes
                        }
                    });
                    msg.success('Nodes loaded');
                    load.setActive(false);
                })
                .catch(error => {
                    console.log('Loading of nodes failed. Reason: ' + error);
                    msg.error('Loading of nodes failed. Please check provided URL, credentials and server status.');

                    load.setActive(false);
                });
        } catch (err) {
            console.log('Loading of nodes failed. Reason: ' + JSON.stringify(err));
            msg.error('Loading of nodes failed. Please check provided URL, credentials and server status.');

            load.setActive(false);
        }
    }

    static loadMultipleSpecificData(whatToLoad: [], whereToStore: String, whatToDoNext: Function) {
        load.setText("Fetching requested data, please wait...");
        let promiseArray = [];
        let nodes = [];

        const axiosGetter = axios.create(JSONConfigProvider.createMetaInformation());

        whatToLoad.forEach(toLoad => {
            const query = {
                filters: toLoad.filters
            };

            const search = toLoad.filters ? "search" : "";
            const object = JSONConfigProvider.getObjectByItsType(toLoad.objectType);
            const URL = object.api + "/" + search;

            promiseArray.push(axiosGetter.post(URL, query));
        });
        try {
            axios.all(promiseArray)
                .then((results) => {
                    for (let i = 0; i < results.length; i++) {
                        let result = results[i];
                        if (result && result.data) {
                            let currentNodes = result.data.rows;
                            nodes = nodes.concat(currentNodes);
                        }
                    }
                    const data = {};
                    data[whereToStore] = ObjectTransformer.removeDuplicitiesByUUID(nodes);
                    _dispatcher.dispatch({
                        type: "set-additional-data",
                        data: data
                    });
                    msg.success('Nodes loaded');
                    load.setActive(false);
                    if (whatToDoNext) {
                        whatToDoNext();
                    }
                })
                .catch(error => {
                    console.log('Loading of nodes failed. Reason: ' + error);
                    msg.error('Loading of nodes failed. Please check provided URL, credentials and server status.');

                    load.setActive(false);
                });
        } catch (err) {
            console.log('Loading of nodes failed. Reason: ' + JSON.stringify(err));
            msg.error('Loading of nodes failed. Please check provided URL, credentials and server status.');

            load.setActive(false);
        }
    }

    static loadSpecificData(whatToLoad: {}, whereToStore: String, whatToDoNext: Function) {
        load.setText("Fetching requested data, please wait...");

        const axiosGetter = axios.create(JSONConfigProvider.createMetaInformation());

        const object = JSONConfigProvider.getObjectByItsType(whatToLoad.objectType);
        const URL = object.api + "/";

        try {
            axiosGetter.get(URL)
                .then((result) => {
                    if (result && result.data) {
                        const data = {};
                        data[whereToStore] = result.data.rows;

                        _dispatcher.dispatch({
                            type: "set-additional-data",
                            data: data
                        });
                        msg.success(object.label + ' loaded');
                    }
                    msg.success('Nodes loaded');
                    load.setActive(false);
                    if (whatToDoNext) {
                        whatToDoNext();
                    }
                })
                .catch(error => {
                    console.log('Loading of data failed. Reason: ' + JSON.stringify(error));
                    msg.error('Loading of data failed. Please check provided URL, credentials and server status.');

                    load.setActive(false);
                });
        } catch (err) {
            console.log('Loading of data failed. Reason: ' + JSON.stringify(err));
            msg.error('Loading of data failed. Please check provided URL, credentials and server status.');

            load.setActive(false);
        }
    }

    static mergeChildrenIntoParents(allNodes: Array, childrenDefinition: Object) {
        let parentNodes = allNodes.filter(node => node._type === childrenDefinition.parentType);
        parentNodes.forEach(parentNode =>
            parentNode[childrenDefinition.intoProperty] = childrenDefinition.nodes.find(childNode =>
            ObjectTransformer.getDottedPropertyValue(parentNode, childrenDefinition.parentKey) ===
            ObjectTransformer.getDottedPropertyValue(childNode, childrenDefinition.childKey))
        );
    }
}

export default DataGetter;