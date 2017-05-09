import React from "react";
import {Card, CardTitle} from "material-ui/Card";
import {Link} from "react-router-dom";

const ERD = require('../../../../www/images/BIM_icon.png');
const sankey = require('../../../../www/images/DL_icon.png');

class HomePage extends React.Component {

    render() {
        return (
            <Card className="container">
                <CardTitle title="Glossary Visualisation Tool"/>

                <div className="sideBySide">
                    <div className="big-pic shadow">
                        <Link to="/graph/BIM">
                            <div className="image"/>
                            <img src={ERD} />
                        </Link>
                    </div>
                    <div className="big-pic shadow">
                        <Link to="/graph/DL">
                            <div className="big-pic shadow"/>
                            <img src={sankey} />
                        </Link>
                    </div>
                </div>
            </Card>
        );
    }
}
export default HomePage;