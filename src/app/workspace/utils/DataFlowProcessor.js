import React from "react";
import PropTypes from "prop-types";
import _ from "underscore";
import Multiselect from "react-bootstrap-multiselect";
import DataGetter from "./DataGetter";
import DataStore from "../utils/DataStore";

const _dispatcher = require('./DataDispatcher');

class DataFlowProcessor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: props.options,
            options1: props.options,
            options2: props.options,
            selectedItems1: {},
            selectedItems2: {}
        };
    }

    getSelectedValues1(): [] {
        const selected = [];
        for (const key of Object.keys(this.state.selectedItems1)) {
            const value = this.state.selectedItems1[key];
            if (value === true) {
                const selectedObject = this.state.options.find(option => option.label === key);
                selected.push(selectedObject.object);
            }
        }
        return selected;
    }

    getSelectedValues2(): [] {
        const selected = [];
        for (const key of Object.keys(this.state.selectedItems2)) {
            const value = this.state.selectedItems2[key];
            if (value === true) {
                const selectedObject = this.state.options.find(option => option.label === key);
                selected.push(selectedObject.object);
            }
        }
        return selected;
    }

    setOptions(options: []) {
        this.setState({
            options: options,
            options1: options,
            options2: options
        });
    }

    handleChange1(element, checked) {
        const currSelected = this.state.selectedItems1;
        const newSelected = this.computeSelected(currSelected, element, checked);

        const newOtherOptions = this.computeUnusedOptions(newSelected);

        const currOtherSelected = this.state.selectedItems2;
        const newOtherSelected = this.handleOtherSelected(currOtherSelected, newOtherOptions);

        const newOptions = this.computeUnusedOptions(newOtherSelected);

        this.enableAccordingToSelected(newSelected, newOptions);
        this.enableAccordingToSelected(newOtherSelected, newOtherOptions);

        this.setState({
            selectedItems1: newSelected,
            selectedItems2: newOtherSelected,
            options1: newOptions,
            options2: newOtherOptions
        });
    }

    handleChange2(element, checked) {
        const currSelected = this.state.selectedItems2;
        const newSelected = this.computeSelected(currSelected, element, checked);

        const newOtherOptions = this.computeUnusedOptions(newSelected);

        const currOtherSelected = this.state.selectedItems1;
        const newOtherSelected = this.handleOtherSelected(currOtherSelected, newOtherOptions);

        const newOptions = this.computeUnusedOptions(newOtherSelected);

        this.enableAccordingToSelected(newSelected, newOptions);
        this.enableAccordingToSelected(newOtherSelected, newOtherOptions);

        this.setState({
            selectedItems2: newSelected,
            selectedItems1: newOtherSelected,
            options2: newOptions,
            options1: newOtherOptions
        });
    }

    enableAccordingToSelected(selected: {}, options: []) {
        const selectedLabels = Object.keys(selected);
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (selectedLabels.includes(option.label)) {
                option.selected = selected[option.label];
            } else {
                option.selected = false;
            }
        }
    }

    computeUnusedOptions(usedInOtherSelect: {}): [] {
        const selectedLabels = Object.keys(usedInOtherSelect);
        return this.state.options.filter(option => {
            return !selectedLabels.includes(option.label) ||
                usedInOtherSelect[option.label] === false;
        });
    }

    handleOtherSelected(oldState: {}, newOptions: []): {} {
        const oldSelected = Object.keys(oldState);
        const newSelected = {};
        for (let i = 0; i < oldSelected.length; i++) {
            const oldOption = oldSelected[i];
            if (newOptions.find(newOption => newOption.label === oldOption)) {
                newSelected[oldOption] = true;
            }
        }
        return newSelected;
    }

    computeSelected(items, element, checked) {
        const newSelectItems = _.extend({}, items);
        newSelectItems[element.val()] = checked;
        return newSelectItems;
    }

    verifyAndCompute() {
        load.setText("Computing flow from origins to the targets, please wait...");

        _dispatcher.dispatch({
            type: "set-additional-data",
            data: {
                originDataLoaded: false,
                targetDataLoaded: false
            }
        });

        const originNodes = this.getSelectedValues1();
        const targetNodes = this.getSelectedValues2();

        if (originNodes.length < 1) {
            msg.error('You must specify at least one origin, aborting computation of data lineage...');
            return;
        }
        if (targetNodes.length < 1) {
            msg.error('You must specify at least one target, aborting computation of data lineage...');
            return;
        }

        _dispatcher.dispatch({
            type: "set-data-lineage-data",
            data: {
                originNodes: originNodes,
                targetNodes: targetNodes
            }
        });

        this.computeDataStructures(originNodes, true);
        this.computeDataStructures(targetNodes, false);
    }

    computeDataStructures(dataSets: [], isOriginData: boolean) {
        load.setText("Fetching required data structures, please wait...");
        const storeProperty = (isOriginData ? "origin" : "target") + "DataStructures";
        const searchRequest = this.createHomoRequest("dataStructure", dataSets, this.createDataStructureFilter);

        DataGetter.loadMultipleSpecificData(searchRequest, storeProperty, this.computeMappings.bind(this, isOriginData));
    }

    computeMappings(isOriginData: boolean) {
        load.setText("Fetching required mappings, please wait...");
        let dataStructures;
        if (isOriginData) {
            dataStructures = DataStore.getState().additionalData.originDataStructures;
        } else {
            dataStructures = DataStore.getState().additionalData.targetDataStructures;
        }

        const storeProperty = (isOriginData ? "origin" : "target") + "Mappings";
        const searchRequest = this.createHomoRequest("mapping", dataStructures, this.createMappingFilter);

        DataGetter.loadMultipleSpecificData(searchRequest, storeProperty, this.computeFlow.bind(this, isOriginData));
    }

    computeFlow(isOriginData: boolean) {
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
            const originNodes = DataStore.getState().dataLineageData.originNodes;
            const targetNodes = DataStore.getState().dataLineageData.targetNodes;

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
                entities: matchedEntities,
                originMappings: [],
                targetMappings: [],
                originDataStructures: [],
                targetDataStructures: [],
                originNodes: [],
                targetNodes: []
            };

            load.setText("Computing flow from origins to entities...");
            originMappings.forEach(mapping => {
                // handle entities
                const mappingEntityUUID = DataGetter.getDottedProp(mapping, "entity._uuid");
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
                const mappingMappingSection = JSON.stringify(DataGetter.getDottedProp(mapping, "mappingSection"));
                const mappingSelectionSection = JSON.stringify(DataGetter.getDottedProp(mapping, "selectionSection"));
                const mappingJoinSection = JSON.stringify(DataGetter.getDottedProp(mapping, "joinSection"));

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
                        const dataStructureDataSetUUID = DataGetter.getDottedProp(dataStructure, "dataSet._uuid");
                        const matchedDataSet = originNodes.find(dataSet => dataSet._uuid === dataStructureDataSetUUID);
                        if (matchedDataSet) {
                            nodesTree.originNodes.push(matchedDataSet);
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
                const mappingEntityUUID = DataGetter.getDottedProp(mapping, "entity._uuid");
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
                const mappingMappingSection = JSON.stringify(DataGetter.getDottedProp(mapping, "mappingSection"));
                const mappingSelectionSection = JSON.stringify(DataGetter.getDottedProp(mapping, "selectionSection"));
                const mappingJoinSection = JSON.stringify(DataGetter.getDottedProp(mapping, "joinSection"));

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
                        const dataStructureDataSetUUID = DataGetter.getDottedProp(dataStructure, "dataSet._uuid");
                        const matchedDataSet = targetNodes.find(dataSet => dataSet._uuid === dataStructureDataSetUUID);
                        if (matchedDataSet) {
                            nodesTree.targetNodes.push(matchedDataSet);
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
                nodesTree.originNodes,
                nodesTree.originDataStructures,
                nodesTree.originMappings,
                nodesTree.entities,
                nodesTree.targetMappings,
                nodesTree.targetDataStructures,
                nodesTree.targetNodes
            );

            nodes = DataGetter.removeDuplicitiesByUUID(nodes);
            links = DataGetter.removeDuplicitiesBySourceAndTarget(links);

            _dispatcher.dispatch({
                type: "set-data-lineage-data",
                data: {
                    originNodes: originNodes,
                    targetNodes: targetNodes,
                    nodes: nodes,
                    links: links
                }
            });
            load.setActive(false);
        }
        return {
            links: links,
            nodes: nodes
        };
    }

    getEntitiesFromMappings(mappings: []): [] {
        const entityProperty = "entity";
        const entities = [];

        for (let i = 0; i < mappings.length; i++) {
            const entity = DataGetter.getDottedProp(mappings[i], entityProperty);
            if (entity) {
                entities.push(entity);
            }
        }
        return entities;
    }

    createHomoRequest(objectType: string, relevantObjects: [] = null, filterCreationFunction: Function): [] {
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

    intersect(a: [], b: []): [] {
        const setA = new Set(a);
        const setB = new Set(b.map(element => element._uuid));
        const intersection = new Set([...setA].filter(x => setB.has(x._uuid)));
        return Array.from(intersection);
    }

    createDataStructureFilter(dataSet: {}): [] {
        return [{
            type: "REFERENCE",
            property: "dataSet",
            value: dataSet._uuid
        }]
    }

    createMappingFilter(dataStructure: {}): [] {
        return [{
            type: "REFERENCE",
            property: "dataStructure",
            value: dataStructure._uuid
        }]
    }

    render() {
        return <div className="dataPicker">
            <Multiselect style={{float: 'left'}}
                         buttonClass="btn btn-danger"
                         data={this.state.options1}
                         onChange={this.handleChange1.bind(this)}
                         multiple/>
            <Multiselect style={{float: 'left'}}
                         buttonClass="btn btn-danger"
                         data={this.state.options2}
                         onChange={this.handleChange2.bind(this)}
                         multiple/>
            <button className="btn btn-warning" style={{float: 'left'}} onClick={this.verifyAndCompute.bind(this)}>
                Compute flow
            </button>
        </div>
    }
}
DataFlowProcessor.propTypes = {
    options: PropTypes.array
};

export default DataFlowProcessor;