import React from 'react';
import GraphScreen from './workspace/screens/GraphScreen';

class Main extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
          <GraphScreen width={1280} height={640} />
    );
  }
}
export default Main;
