import React from "react";
import PropTypes from "prop-types";
import _ from "underscore";
import Multiselect from "react-bootstrap-multiselect";
import JSONConfigurer from "./JSONConfigurer";

const _dispatcher = require('./DataDispatcher');

class DataFlowProcessor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: props.options,
            options2: props.options2,
            selectedItems: {},
            selectedItems2: {}
        };
    }

    //TODO: refactor to avoid code duplicity
    getSelectedValues(): [] {
        const selected = [];
        for (const key of Object.keys(this.state.selectedItems)) {
            const value = this.state.selectedItems[key];
            if (value === true) {
                selected.push(key);
            }
        }
        return selected;
    }

    getSelectedValues2(): [] {
        const selected = [];
        for (const key of Object.keys(this.state.selectedItems2)) {
            const value = this.state.selectedItems2[key];
            if (value === true) {
                selected.push(key);
            }
        }
        return selected;
    }

    setOptions(options: []) {
        this.setState({options: options});
    }

    setOptions2(options2: []) {
        this.setState({options2: options2});
    }

    handleChange(element, checked) {
        let currSelected = this.state["selectedItems"];
        this.setState({selectedItems: this.computeSelected(currSelected, element, checked)});
    }

    handleChange2(element, checked) {
        let currSelected = this.state["selectedItems2"];
        this.setState({selectedItems2: this.computeSelected(currSelected, element, checked)});
    }

    computeSelected(items, element, checked) {
        const newSelectItems = _.extend({}, items);
        newSelectItems[element.val()] = checked;
        return newSelectItems;
    }

    verifyAndCompute() {
        const originNodes = this.getSelectedValues();
        const targetNodes = this.getSelectedValues2();

        if (originNodes.length < 1) {
            msg.error('You must specify at least one origin, aborting computation of data lineage...');
            return;
        }
        if (targetNodes.length < 1) {
            msg.error('You must specify at least one target, aborting computation of data lineage...');
            return;
        }

        const flow = JSONConfigurer.computeFlow({
            originNodes: originNodes,
            targetNodes: targetNodes,
        });

        _dispatcher.dispatch({
            type: "set-data-lineage-data",
            data: {
                "originNodes": JSONConfigurer.wrapAsNamedObjects(originNodes),
                "targetNodes": JSONConfigurer.wrapAsNamedObjects(targetNodes),
                "nodes": flow.nodes,
                "links": flow.links
            }
        }, () => {
            msg.success('Flow computed');
        });
    }

    render() {
        return <div className="dataPicker">
            <Multiselect style={{float: 'left'}}
                         buttonClass="btn btn-danger"
                         data={this.state.options}
                         onChange={this.handleChange.bind(this)}
                         multiple/>
            <Multiselect style={{float: 'left'}}
                         buttonClass="btn btn-danger"
                         data={this.state.options2}
                         onChange={this.handleChange2.bind(this)}
                         multiple/>
            <button className="btn btn-warning" style={{float: 'left'}} onClick={this.verifyAndCompute.bind(this)}>Compute flow
            </button>
        </div>
    }
}
DataFlowProcessor.propTypes = {
    options: PropTypes.array,
    options2: PropTypes.array
};

export default DataFlowProcessor;