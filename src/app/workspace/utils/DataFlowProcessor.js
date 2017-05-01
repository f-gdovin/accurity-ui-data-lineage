import React from "react";
import PropTypes from "prop-types";
import _ from "underscore";
import Multiselect from "react-bootstrap-multiselect";
import DataGetter from "./DataGetter";

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

        DataGetter.loadSpecificData("dataStructure", "originDataStructures", this.computeMappings.bind(this), this.createDataStructureFilter(originNodes));
        DataGetter.loadSpecificData("dataStructure", "targetDataStructures", this.computeMappings.bind(this), this.createDataStructureFilter(targetNodes));

        const flow = this.computeFlow({
            originNodes: originNodes,
            targetNodes: targetNodes,
        });

        _dispatcher.dispatch({
            type: "set-data-lineage-data",
            data: {
                "originNodes": originNodes,
                "targetNodes": targetNodes,
                "nodes": flow.nodes,
                "links": flow.links
            }
        }, () => {
            msg.success('Flow computed');
        });
    }

    computeFlow(initData: {}): {} {
        const links = [];

        const originNodes = initData.originNodes;
        const targetNodes = initData.targetNodes;

        DataGetter.loadSpecificData("dataStructure", "originDataStructures", this.computeMappings.bind(this), createDataStructureFilter(originNodes));

        const originDataStructures = [];
        const targetDataStructures = [];

        const attributeMappings = [];

        let originIndex = 0;
        let targetIndex = originNodes.length;

        for (let i = 0; i < originNodes.length; i++) {
            const originNode = originNodes[i];

            for (let j = 0; j < targetNodes.length; j++) {
                const targetNode = targetNodes[j];
                links.push({
                    source: originIndex,
                    target: targetIndex,
                    value: 50 + 5 * originIndex + 5 * targetIndex
                });
                targetIndex++;
            }
            originIndex++;
        }

        return {
            links: links,
            nodes: []
        };
    }

    computeMappings() {

    }

    createDataStructureFilter(dataSets: []): [] {

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