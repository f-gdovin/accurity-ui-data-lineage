import React from "react";
import {Card, CardTitle} from "material-ui/Card";
import {Link} from "react-router-dom";

import ERD from 'file-loader!../../../../www/images/ERD.png'
import sankey from 'file-loader!../../../../www/images/sankey.png'

class HomePage extends React.Component {

    render() {
        return (
            <Card className="container">
                <CardTitle title="Glossary Visualisation Tool" subtitle="This is the home page."/>

                <div className="sideBySide">
                    <div className="big-pic shadow">
                        <Link to="/graph/BIM">Business Information Model Graph</Link>
                        <img src={ERD} />
                    </div>
                    <div className="big-pic shadow">
                        <Link to="/graph/DL">Data Lineage Graph</Link>
                        <img src={sankey} />
                    </div>
                </div>
            </Card>
        );
    }

}
export default HomePage;