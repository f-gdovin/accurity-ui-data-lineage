import React from "react";
import axios from "axios-es6";
import _ from "underscore";
import Multiselect from "react-bootstrap-multiselect";
import JSONConfigurer from "./JSONConfigurer";
import LoadingOverlay from "../ui/LoadingOverlay";

const _dispatcher = require('./DataDispatcher');

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
        const axiosGetter = axios.create(JSONConfigurer.createMetaInformation());

        this.setState({dataLoaded: false});
        let nodes = [];
        let promiseArray = JSONConfigurer.generateRequest(this.getSelectedValues()).map(url => axiosGetter.get(url));
        try {
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
                    msg.success('Nodes loaded');
                    this.setState({dataLoaded: true});
                })
                .catch(error => {
                    console.log('Loading of nodes failed. Reason: ' + error);
                    msg.error('Loading of nodes failed. Please check provided URL, credentials and server status.');
                    this.setState({dataLoaded: true});
                });
        } catch (err) {
            console.log('Loading of nodes failed. Reason: ' + JSON.stringify(err));
            msg.error('Loading of nodes failed. Please check provided URL, credentials and server status.');
            this.setState({dataLoaded: true});
        }

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
        const newSelectItems = _.extend({}, this.state.selectedItems);
        newSelectItems[element.val()] = checked;
        this.setState({selectedItems: newSelectItems})
    }

    render() {
        return <div className="dataLoader">
            <LoadingOverlay spinnerSize={"320px"} text={"Fetching requested data, please wait..."}
                            show={!this.state.dataLoaded}/>
            <Multiselect style={{float: 'left'}}
                         buttonClass="btn btn-danger"
                         data={this.state.options}
                         onChange={this.handleChange.bind(this)}
                         multiple/>
            <button className="btn btn-warning" disabled={!this.state.dataLoaded} style={{float: 'left'}}
                    onClick={() => {
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