import React from "react";
import Form, {TextField} from "react-form-js";
import DataStore from "./DataStore";

const _dispatcher = require('./DataDispatcher');

class SettingsSetter extends Form {

    constructor(props) {
        super(props);
        this.state = {
            baseUrl: "",
            timeout: 0,
            username: "",
            password: "",

            show: false
        }
    }

    componentDidMount() {
        const settings = DataStore.getSettings();
        this.setState({
            baseUrl: settings.baseUrl,
            timeout: settings.timeout
        })
    }

    saveSettings() {
        const token = "Basic " + btoa(this.state.username + ":" + this.state.password);

        _dispatcher.dispatch({
            type: "set-settings",
            data: {
                "baseUrl": this.state.baseUrl,
                "timeout": this.state.timeout,
                "token": token
            }
        });

        this.setState({
            show: false
        })
    }

    render() {
        return (
            <span className="multiselect-native-select float-right">
                <div ref={"settingsGroup"} className={"btn-group" + (this.state.show ? " open" : "")}>
                    <button ref={"settings"}
                            className="multiselect dropdown-toggle btn btn-danger"
                            style={{float: 'right'}}
                            onClick={() => {
                                this.setState({show: !this.state.show})
                            }}>Settings</button>
                    {this.state.show ?
                        <div className="dropdown-menu right-zero">
                            <TextField className="listItem" value={this.state.baseUrl}  onChange={(value) => this.setState({baseUrl: value})}  label='Base URL'/>
                            <TextField className="listItem" value={this.state.timeout}  onChange={(value) => this.setState({timeout: value})}  label='Timeout'/>
                            <TextField className="listItem" value={this.state.username} onChange={(value) => this.setState({username: value})} label='Username'/>
                            <TextField className="listItem" value={this.state.password} onChange={(value) => this.setState({password: value})} label='Password' type="password"
                                      />

                            <button className="confirm-button" onClick={() => {this.saveSettings()}}>Change settings</button>
                        </div> : null }
                </div>
            </span>
        )
    }
}
export default SettingsSetter;