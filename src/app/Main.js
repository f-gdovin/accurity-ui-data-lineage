import React from "react";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {HashRouter, Link, Route} from "react-router-dom";

import Extras from "./workspace/components/others/Extras";
import HomePage from "./workspace/components/screens/HomePage";
import ConnectionPage from "./workspace/components/screens/ConnectionPage";
import BusinessModelGraphPage from "./workspace/components/screens/BusinessModelGraphPage";
import DataLineageGraphPage from "./workspace/components/screens/DataLineageGraphPage";
import DataStore from "./workspace/utils/DataStore";

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {settings: DataStore.getState().settings};
    }

    render() {
        return (
            <div>
                <Extras/>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                    <HashRouter>
                        <div>
                            <div className="top-bar">
                                <div className="top-bar-left">
                                    <Link to="/">Home</Link>
                                </div>

                                <div className="top-bar-right">
                                    <Link to="/connect">Connect to Glossary</Link>
                                </div>

                            </div>
                            <div className="content">
                                <Route exact path="/" component={HomePage}/>
                                <Route path="/connect" component={ConnectionPage}/>

                                <div className="graph">
                                    <Route path="/graph/BIM" component={BusinessModelGraphPage}/>
                                    <Route path="/graph/DL" component={DataLineageGraphPage}/>
                                </div>
                            </div>
                        </div>
                    </HashRouter>
                </MuiThemeProvider>
            </div>
        );
    }
}
export default Main;