import React from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router';
import {Card} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

class ConnectionForm extends React.Component {

    render() {
        const onSubmit = this.props.onSubmit;
        const onChange = this.props.onChange;
        const errors = this.props.errors;
        const settings = this.props.settings;

        return (
            <Card className="container">
                <form action="/" onSubmit={onSubmit}>
                    <h2 className="card-heading">Connect to Glossary</h2>

                    {errors.summary && <p className="error-message">{errors.summary}</p>}

                    <div className="field-line">
                        <TextField
                            floatingLabelText="Glossary URL"
                            name="url"
                            errorText={errors.url}
                            onChange={onChange}
                            value={settings.url}
                        />
                    </div>

                    <div className="field-line">
                        <TextField
                            floatingLabelText="Username"
                            name="username"
                            errorText={errors.username}
                            onChange={onChange}
                            value={settings.username}
                        />
                    </div>

                    <div className="field-line">
                        <TextField
                            floatingLabelText="Password"
                            type="password"
                            name="password"
                            onChange={onChange}
                            errorText={errors.password}
                            value={settings.password}
                        />
                    </div>

                    <div className="button-line">
                        <RaisedButton type="submit" label="Log in" primary/>
                    </div>
                </form>
            </Card>
        )
    }
}
ConnectionForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
};
export default ConnectionForm;