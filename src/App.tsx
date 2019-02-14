import React, { Component, SyntheticEvent } from 'react';
// MATERIAL
import Checkbox from '@material-ui/core/Checkbox';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { theme as runtimeTheme } from './theme';
import { RtToolbar } from './components/toolbar'
import { RtCalculator } from './components/calculator';
import { RtPositioning } from './components/positioning';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="app">
        <MuiThemeProvider theme={runtimeTheme}>

          <RtToolbar title="Runtime" subTitle="- Check time, pace & distance"></RtToolbar>

          <div className="app-content">

            <RtCalculator></RtCalculator>

            <RtPositioning></RtPositioning>

            <span className="hint-text">Raden markerad med
            <Checkbox
                classes={{
                  root: 'footer-checkbox'
                }}
                disableRipple
                disableTouchRipple
                checked={true}>
              </Checkbox>
              kommer att räknas ut.</span>

          </div>
        </MuiThemeProvider>

      </div>
    );
  }
}

export default App
