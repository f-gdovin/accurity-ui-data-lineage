import React from "react";
import PropTypes from "prop-types";
import _ from "underscore";
import Multiselect from "react-bootstrap-multiselect";
import JSONConfigurer from "../../utils/JSONConfigProvider";
import DataGetter from "../../utils/DataGetter";

class ObjectTypePicker extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: JSONConfigurer.generateOptionsFromObjectTypes(this.props.isModelData),
            selectedItems: {}
        };
    }

    getSelectedValues() {
        const selected = [];
        for (const key of Object.keys(this.state.selectedItems)) {
            const value = this.state.selectedItems[key];
            if (value === true) {
                selected.push(key);
            }
        }
        return selected;
    }

    handleChange(element, checked) {
        let currSelected = this.state["selectedItems"];
        this.setState({selectedItems: this.computeSelected(currSelected, element, checked)});
    }

    computeSelected(items, element, checked) {
        const newSelectItems = _.extend({}, items);
        newSelectItems[element.val()] = checked;
        return newSelectItems;
    }

    render() {
        return <div className="dataPicker">
            <Multiselect style={{float: 'left'}}
                         buttonClass="btn btn-danger"
                         data={this.state.options}
                         onChange={this.handleChange.bind(this)}
                         multiple/>
            <button className="btn btn-warning" style={{float: 'left'}} onClick={() => {
                        DataGetter.loadDataForObjectTypes(this.props.isModelData, this.getSelectedValues())
                    }}>Load data
            </button>
        </div>
    }
}
ObjectTypePicker.propTypes = {
    isModelData: PropTypes.bool.isRequired
};
export default ObjectTypePicker;