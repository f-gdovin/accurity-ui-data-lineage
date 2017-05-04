import React from "react";
import axios from "axios-es6";
import {Redirect} from 'react-router-dom'
import ConnectionForm from "../others/ConnectionForm";
import DataStore from "../../utils/DataStore";

const _dispatcher = require('../../utils/DataDispatcher');

class ConnectionPage extends React.Component {

    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            redirect: false,
            errors: {},
            settings: {
                url: DataStore.getState().settings.baseUrl,
                username: DataStore.getState().settings.username,
                password: ''
            }
        };

        _dispatcher.dispatch({
            type: "set-settings",
            data: {
                "loggedIn": false
            }
        });

        this.processForm = this.processForm.bind(this);
        this.changeSettings = this.changeSettings.bind(this);
    }

    componentDidMount() {
        this.setState({redirect: false});
    }

    processForm(event) {
        // prevent default action. in this case, action is the form submission event
        event.preventDefault();

        const URL = this.state.settings.url;
        const token = "Basic " + btoa(this.state.settings.username + ":" + this.state.settings.password);

        this.tryToLogin(URL, token);
    }

    changeSettings(event) {
        const field = event.target.name;
        const settings = this.state.settings;
        settings[field] = event.target.value;

        this.setState({
            settings
        });
    }

    tryToLogin(baseUrl: string, token: string) {
        load.setText("Trying to connect to the specified Glossary, please wait...");

        const axiosGetter = axios.create({
            baseURL: baseUrl,
            timeout: 10000,
            headers: {
                authorization: token
            }
        });

        try {
            axiosGetter.get("user-info")
                .then((result) => {
                    if (result && result.status === 200) {
                        const username = result.data.login;
                        const fullName = result.data.fullName;

                        _dispatcher.dispatch({
                            type: "set-settings",
                            data: {
                                "loggedIn": true,
                                "baseUrl": baseUrl,
                                "username": username,
                                "fullName": fullName,
                                "token": token
                            }
                        });
                        msg.success('Connection success');
                        this.setState({redirect: true});
                    }
                    load.setActive(false);
                })
                .catch(err => {
                    console.log('Connection failure. Reason: ' + JSON.stringify(err));
                    msg.error('Connection to specified Glossary failed. Please check provided URL, credentials and server status.');

                    load.setActive(false);
                });
        } catch (err) {
            console.log('Connection failure. Reason: ' + JSON.stringify(err));
            msg.error('Connection to specified Glossary failed. Please check provided URL, credentials and server status.');

            load.setActive(false);
        }
    }

    render() {
        if (this.state.redirect === true) {
            return (
                <Redirect to="/"/>
            )
        }
        return (
            <ConnectionForm
                onSubmit={this.processForm}
                onChange={this.changeSettings}
                errors={this.state.errors}
                settings={this.state.settings}
            />
        );
    }
}

export default ConnectionPage;