import React from "react";
import {Card, CardTitle} from "material-ui/Card";
import {Link} from "react-router-dom";
import DataStore from "../../utils/DataStore";

import ERD from 'file-loader!../../../../www/images/ERD.png'
import sankey from 'file-loader!../../../../www/images/sankey.png'

class HomePage extends React.Component {

    render() {
        const isUserLoggedIn = DataStore.getState().settings.loggedIn;
        return (
            <Card className="container">
                <CardTitle title="Glossary Visualisation Tool" subtitle="This is the home page."/>

                <div className="sideBySide">
                    <div className="big-pic">
                        <Link to="/graph/BIM" condition={isUserLoggedIn === true}>Business Information Model Graph</Link>
                        <img src={ERD} />
                    </div>
                    <div className="big-pic">
                        <Link to="/graph/DL" condition={isUserLoggedIn === true}>Data Lineage Graph</Link>
                        <img src={sankey} />
                    </div>
                </div>
            </Card>
        );
    }

}
export default HomePage;