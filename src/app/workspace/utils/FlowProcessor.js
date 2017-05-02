import DataGetter from "./DataGetter";
import ObjectTransformer from "./ObjectTransformer";
import DataStore from "../utils/DataStore";

const _dispatcher = require('./DataDispatcher');

class FlowProcessor {

    static verifyAndCompute(originDataSets: [], targetDataSets: []) {
        load.setText("Computing flow from origins to the targets, please wait...");

        _dispatcher.dispatch({
            type: "set-additional-data",
            data: {
                originDataLoaded: false,
                targetDataLoaded: false
            }
        });

        if (originDataSets.length < 1) {
            msg.error('You must specify at least one origin, aborting computation of data lineage...');
            return;
        }
        if (targetDataSets.length < 1) {
            msg.error('You must specify at least one target, aborting computation of data lineage...');
            return;
        }

        _dispatcher.dispatch({
            type: "set-additional-data",
            data: {
                originDataSets: originDataSets,
                targetDataSets: targetDataSets
            }
        });

        this.computeDataStructures(originDataSets, true);
        this.computeDataStructures(targetDataSets, false);
    }

    static computeDataStructures(dataSets: [], isOriginData: boolean) {
        load.setText("Fetching required data structures, please wait...");
        const storeProperty = (isOriginData ? "origin" : "target") + "DataStructures";
        const searchRequest = this.createUniformRequest("dataStructure", dataSets, this.createDataStructureFilter);

        DataGetter.loadMultipleSpecificData(searchRequest, storeProperty, this.computeMappings.bind(this, isOriginData));
    }

    static computeMappings(isOriginData: boolean) {
        load.setText("Fetching required mappings, please wait...");
        let dataStructures;
        if (isOriginData) {
            dataStructures = DataStore.getState().additionalData.originDataStructures;
        } else {
            dataStructures = DataStore.getState().additionalData.targetDataStructures;
        }

        const storeProperty = (isOriginData ? "origin" : "target") + "Mappings";
        const searchRequest = this.createUniformRequest("mapping", dataStructures, this.createMappingFilter);

        DataGetter.loadMultipleSpecificData(searchRequest, storeProperty, this.computeFlow.bind(this, isOriginData));
    }

    static computeFlow(isOriginData: boolean) {
        load.setText("Computing flow from origins to the targets, please wait...");
        let links = [];
        let nodes = [];

        const storeProperty = (isOriginData ? "origin" : "target") + "DataLoaded";
        const reverseProperty = (isOriginData ? "target" : "origin") + "DataLoaded";

        const data = {};
        data[storeProperty] = true;

        _dispatcher.dispatch({
            type: "set-additional-data",
            data: data
        });

        const secondFlowDone = DataStore.getState().additionalData[reverseProperty];

        // both origin and target flows are computed, do the magic
        if (secondFlowDone === true) {
            const originDataSets = DataStore.getState().additionalData.originDataSets;
            const targetDataSets = DataStore.getState().additionalData.targetDataSets;

            const originDataStructures = DataStore.getState().additionalData.originDataStructures;
            const targetDataStructures = DataStore.getState().additionalData.targetDataStructures;

            const originMappings = DataStore.getState().additionalData.originMappings;
            const targetMappings = DataStore.getState().additionalData.targetMappings;

            const originEntities = this.getEntitiesFromMappings(originMappings);
            const targetEntities = this.getEntitiesFromMappings(targetMappings);

            // map the entities one with another and then continue to both origin and target sides
            load.setText("Computing entities...");
            const matchedEntities = this.intersect(originEntities, targetEntities);

            // also, keep everything in some sane object to be able to draw arcs later
            let nodesTree = {
                originDataSets: [],
                targetDataSets: [],
                originDataStructures: [],
                targetDataStructures: [],
                originMappings: [],
                targetMappings: [],
                entities: matchedEntities
            };

            load.setText("Computing flow from origins to entities...");
            originMappings.forEach(mapping => {
                // handle entities
                const mappingEntityUUID = ObjectTransformer.getDottedPropertyValue(mapping, "entity._uuid");
                const matchedEntity = matchedEntities.find(entity => entity._uuid === mappingEntityUUID);
                if (matchedEntity) {
                    nodesTree.originMappings.push(mapping);
                    links.push({
                        source: mapping,
                        target: matchedEntity,
                        value: 1
                    })
                }

                // handle data structures
                const mappingMappingSection = JSON.stringify(ObjectTransformer.getDottedPropertyValue(mapping, "mappingSection"));
                const mappingSelectionSection = JSON.stringify(ObjectTransformer.getDottedPropertyValue(mapping, "selectionSection"));
                const mappingJoinSection = JSON.stringify(ObjectTransformer.getDottedPropertyValue(mapping, "joinSection"));

                originDataStructures.forEach(dataStructure => {
                    if (mappingMappingSection.includes(dataStructure._uuid) ||
                        mappingSelectionSection.includes(dataStructure._uuid) ||
                        mappingJoinSection.includes(dataStructure._uuid)) {

                        nodesTree.originDataStructures.push(dataStructure);
                        links.push({
                            source: dataStructure,
                            target: mapping,
                            value: 1
                        });

                        // handle data sets
                        const dataStructureDataSetUUID = ObjectTransformer.getDottedPropertyValue(dataStructure, "dataSet._uuid");
                        const matchedDataSet = originDataSets.find(dataSet => dataSet._uuid === dataStructureDataSetUUID);
                        if (matchedDataSet) {
                            nodesTree.originDataSets.push(matchedDataSet);
                            links.push({
                                source: matchedDataSet,
                                target: dataStructure,
                                value: 1
                            })
                        }
                    }
                });
            });

            load.setText("Computing flow from entities to targets...");
            targetMappings.forEach(mapping => {
                // handle entities
                const mappingEntityUUID = ObjectTransformer.getDottedPropertyValue(mapping, "entity._uuid");
                const matchedEntity = matchedEntities.find(entity => entity._uuid === mappingEntityUUID);
                if (matchedEntity) {
                    nodesTree.targetMappings.push(mapping);
                    links.push({
                        source: matchedEntity,
                        target: mapping,
                        value: 1
                    })
                }

                // handle data structures
                const mappingMappingSection = JSON.stringify(ObjectTransformer.getDottedPropertyValue(mapping, "mappingSection"));
                const mappingSelectionSection = JSON.stringify(ObjectTransformer.getDottedPropertyValue(mapping, "selectionSection"));
                const mappingJoinSection = JSON.stringify(ObjectTransformer.getDottedPropertyValue(mapping, "joinSection"));

                targetDataStructures.forEach(dataStructure => {
                    if (mappingMappingSection.includes(dataStructure._uuid) ||
                        mappingSelectionSection.includes(dataStructure._uuid) ||
                        mappingJoinSection.includes(dataStructure._uuid)) {

                        nodesTree.targetDataStructures.push(dataStructure);
                        links.push({
                            source: mapping,
                            target: dataStructure,
                            value: 1
                        });

                        // handle data sets
                        const dataStructureDataSetUUID = ObjectTransformer.getDottedPropertyValue(dataStructure, "dataSet._uuid");
                        const matchedDataSet = targetDataSets.find(dataSet => dataSet._uuid === dataStructureDataSetUUID);
                        if (matchedDataSet) {
                            nodesTree.targetDataSets.push(matchedDataSet);
                            links.push({
                                source: dataStructure,
                                target: matchedDataSet,
                                value: 1
                            })
                        }
                    }
                });
            });

            nodes = nodes.concat(
                nodesTree.originDataSets,
                nodesTree.originDataStructures,
                nodesTree.originMappings,
                nodesTree.entities,
                nodesTree.targetMappings,
                nodesTree.targetDataStructures,
                nodesTree.targetDataSets
            );

            nodes = ObjectTransformer.removeDuplicitiesByUUID(nodes);
            links = ObjectTransformer.removeDuplicitiesBySourceAndTarget(links);

            _dispatcher.dispatch({
                type: "set-data-lineage-data",
                data: {
                    nodes: nodes,
                    links: links
                }
            });
            load.setActive(false);
        }
    }

    static getEntitiesFromMappings(mappings: []): [] {
        const entityProperty = "entity";
        const entities = [];

        for (let i = 0; i < mappings.length; i++) {
            const entity = ObjectTransformer.getDottedPropertyValue(mappings[i], entityProperty);
            if (entity) {
                entities.push(entity);
            }
        }
        return entities;
    }

    static createUniformRequest(objectType: string, relevantObjects: [] = null, filterCreationFunction: Function): [] {
        const requestArray = [];

        if (relevantObjects) {
            for (let i = 0; i < relevantObjects.length; i++) {
                const relevantObject = relevantObjects[i];
                const filters = filterCreationFunction(relevantObject);
                requestArray.push({
                    objectType: objectType,
                    filters: filters
                })
            }
        }
        return requestArray;
    }

    static intersect(a: [], b: []): [] {
        const setA = new Set(a);
        const setB = new Set(b.map(element => element._uuid));
        const intersection = new Set([...setA].filter(x => setB.has(x._uuid)));
        return Array.from(intersection);
    }

    static createDataStructureFilter(dataSet: {}): [] {
        return [{
            type: "REFERENCE",
            property: "dataSet",
            value: dataSet._uuid
        }]
    }

    static createMappingFilter(dataStructure: {}): [] {
        return [{
            type: "REFERENCE",
            property: "dataStructure",
            value: dataStructure._uuid
        }]
    }
}
export default FlowProcessor;