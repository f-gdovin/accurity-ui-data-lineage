import React from "react";
import axios from "axios-es6";
import _ from "underscore";
import Multiselect from "react-bootstrap-multiselect";
import JSONConfigurer from "./JSONConfigurer";
import LoadingOverlay from "../ui/LoadingOverlay";

const _dispatcher = require('./DataDispatcher');

const axiosGetter = axios.create(JSONConfigurer.createMetaInformation());

class DataLoader extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            options: JSONConfigurer.generateOptions(),
            selectedItems: {},
            dataLoaded: true
        };
    }

    loadData() {
        this.setState({dataLoaded: false});
        let nodes = [];
        let promiseArray = JSONConfigurer.generateRequest(this.getSelectedValues()).map(url => axiosGetter.get(url));
        axios.all(promiseArray)
            .then((results) => {
                for (let i = 0; i < results.length; i++) {
                    let result = results[i];
                    if (result && result.data) {
                        nodes = nodes.concat(result.data.rows);
                    }
                }
                _dispatcher.dispatch({
                    type: "set-" + (this.props.isModelData ? "model" : "data-lineage") + "-data",
                    data: {
                        "nodes": nodes,
                        "selectedItems": this.getSelectedValues()
                    }
                });
                console.log("Nodes loaded");
                this.setState({dataLoaded: true});
            })
            .catch(error => console.log(error));
    }

    getSelectedValues() {
        return Object.keys(this.state.selectedItems);
    }

    handleChange(element, checked) {
        const newSelectItems = _.extend({}, this.state.selectedItems);
        newSelectItems[element.val()] = checked;
        this.setState({selectedItems: newSelectItems})
    }

    render() {
        return <div className="dataLoader">
            <LoadingOverlay spinnerSize={"320px"} text={"Fetching requested data, please wait..."} show={!this.state.dataLoaded}/>
            <Multiselect style={{float: 'left'}}
                         buttonClass="btn btn-danger"
                         data={this.state.options}
                         onChange={this.handleChange.bind(this)}
                         multiple/>
            <button className="btn btn-warning" disabled={!this.state.dataLoaded} style={{float: 'left'}} onClick={() => {
                this.loadData()
            }}>Load data
            </button>
        </div>
    }
}
DataLoader.propTypes = {
    isModelData: React.PropTypes.bool.isRequired
};

export default DataLoader;