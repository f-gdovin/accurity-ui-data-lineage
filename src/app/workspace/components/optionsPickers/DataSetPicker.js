import React from "react";
import PropTypes from "prop-types";
import _ from "underscore";
import Multiselect from "react-bootstrap-multiselect";
import FlowProcessor from "../../utils/FlowProcessor";

class DataSetPicker extends React.Component {

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

    prepareToCompute() {
        const originDataSets = this.getSelectedValues1();
        const targetDataSets = this.getSelectedValues2();

        FlowProcessor.verifyAndCompute(originDataSets, targetDataSets);
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
            <button className="btn btn-warning" style={{float: 'left'}} onClick={this.prepareToCompute.bind(this)}>
                Compute flow
            </button>
        </div>
    }
}
DataSetPicker.propTypes = {
    options: PropTypes.array
};

export default DataSetPicker;