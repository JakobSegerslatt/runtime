import React, { Component, SyntheticEvent } from 'react';
import { RtToolbar } from './components/toolbar'
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import './App.css';
import { string } from 'prop-types';

enum LenghtType {
  Km = 'km',
  m = 'm',
  miles = 'miles'
}

enum PaceType {
  MinutesPerKm = 'min/km',
  KmPerHour = 'km/h',
  MetersPerSecond = 'm/s',
  MilesPerHour = 'miles/s',
}

const lengthTypes = [
  {
    value: LenghtType.Km,
    label: 'km',
  },
  {
    value: LenghtType.m,
    label: 'm',
  },
  {
    value: LenghtType.miles,
    label: 'miles',
  },
];

const paceTypes = [
  {
    value: PaceType.MinutesPerKm,
    label: 'min/km',
  },
  {
    value: PaceType.KmPerHour,
    label: 'km/h',
  },
  {
    value: PaceType.MetersPerSecond,
    label: 'm/s',
  },
  {
    value: PaceType.MilesPerHour,
    label: 'miles/h',
  },
];


interface IState {
  user: string;
  length: number;
  lengthType: LenghtType;
  pace: number;
  paceType: PaceType;
  hours: number;
  minutes: number;
  seconds: number;
  /** The last item in this array gets calculated everytime this.calculate gets called. */
  latestEdited: string[];
}

class App extends Component {
  state: IState;


  constructor(props) {
    super(props);
    this.state = {
      user: 'hej',
      length: 5,
      lengthType: LenghtType.Km,
      pace: 5,
      paceType: PaceType.MinutesPerKm,
      hours: 0,
      minutes: 0,
      seconds: 0,
      latestEdited: ['length', 'pace', 'time']
    }
    this.calculate = this.calculate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getLengthInMeters = this.getLengthInMeters.bind(this);
    this.getPaceInMetersPerSecond = this.getPaceInMetersPerSecond.bind(this);
    this.getTimeInSeconds = this.getTimeInSeconds.bind(this);
  }

  componentDidMount() {
    this.calculate();
  }

  calculate() {
    console.log(this.state);

    // Check which is the property to calc
    const itemToCalculate = this.state.latestEdited[this.state.latestEdited.length - 1]

    if (itemToCalculate === 'length') {
      const pace = this.getPaceInMetersPerSecond();
      const seconds = this.getTimeInSeconds();
      let length = pace * seconds;
      // Convert the length before setting the value (if nessesary)
      switch (this.state.lengthType) {
        case LenghtType.Km:
          length = length / 1000;
          break;
        case LenghtType.miles:
          length = length / 1609.344;
          break;
      }
      this.setState({
        length: length
      });
    }
    else if (itemToCalculate === 'pace') {
      const length = this.getLengthInMeters();
      const seconds = this.getTimeInSeconds();
      let pace = 0;
      // Convert the pace before setting the value (if nessesary)
      switch (this.state.paceType) {
        case PaceType.MinutesPerKm:
          pace = (seconds / 60) / (length / 1000);
          // Convert the decimal part to seconds
          // TODO
          break;
        case PaceType.KmPerHour:
          pace = (length / 1000) / (seconds / 3600);
          break;
        case PaceType.MilesPerHour:
          pace = (length / 1609.344) / (seconds / 3600);
          break;
        case PaceType.MetersPerSecond:
          pace = length / seconds;
          break;
      }
      this.setState({
        pace: pace
      })
    }
    else if (itemToCalculate === 'time') {
      const length = this.getLengthInMeters();
      const pace = this.getPaceInMetersPerSecond();
      let timeInSeconds = length / pace;
      const hours = Math.floor(timeInSeconds / 3600);
      timeInSeconds %= 3600;
      this.setState({
        hours: hours,
        minutes: Math.floor(timeInSeconds / 60),
        seconds: Math.floor(timeInSeconds % 60),
      });
    }
  }

  getLengthInMeters(): number {
    let length = this.state.length;
    // Convert length (if nessesary to meters)
    switch (this.state.lengthType) {
      case LenghtType.Km:
        length = length * 1000;
        break;
      case LenghtType.miles:
        length = length * 1609.344;
        break;
    }
    return length;
  }

  getPaceInMetersPerSecond(): number {
    let pace = this.state.pace;
    // Convert pace (if nessesary to m/s)
    switch (this.state.paceType) {
      case PaceType.MinutesPerKm:
        pace = 1 / (pace * 60 / 1000);
        break;
      case PaceType.KmPerHour:
        pace = pace * 1000 / 3600;
        break;
      case PaceType.MilesPerHour:
        pace = pace * 1609.344 / 3600;
        break;
      case PaceType.MetersPerSecond:
        pace = pace;
        break;
    }
    return pace;
  }

  /** Combines the hours, minutes and seconds into a single value */
  getTimeInSeconds(): number {
    return (this.state.hours * 3600) + (this.state.minutes * 60) + (this.state.seconds);
  }

  /**
   * Set the value, 
   * mark the property as the latest edited one
   * and calculate the remaning number.
   */
  handleChange = (name: string) => (event: any) => {
    let value: string = event.target.value;
    this.setState({ [name]: value }, () => {


      if (name.match(/hours|minutes|seconds/)) {
        name = 'time';
      }
      /**
       * If the user edited the types (km/h, miles) 
       * the property being calculated should stay the same,
       * i.e. we dont edit the latestEdited array
       */
      if (name.match(/length|pace|time/)) {
        // Remove the property and unshift it in so it is the first item in the array
        const latestEdited = this.state.latestEdited;
        const index = latestEdited.indexOf(name);
        if (index !== -1) {
          latestEdited.splice(index, 1)
        }
        latestEdited.unshift(name);
        this.setState({ latestEdited: latestEdited }, () => this.calculate())
      } else {
        this.calculate();
      }
    });
  }

  render() {
    let paceFields;
    if (this.state.paceType === PaceType.MinutesPerKm) {
      paceFields = <span>
        <TextField
          className="left-column-half minute-field"
          type="number"
          InputProps={{ inputProps: { min: 0 } }}
          value={this.state.pace}
          label="Minuter"
          // className={classes.textField}
          onChange={this.handleChange('pace')}
          margin="normal"
          variant="outlined"
        />
        <TextField
          className="left-column-half"
          type="number"
          InputProps={{ inputProps: { min: 0, max: 60 } }}
          value={this.state.pace}
          label="Sekunder"
          // className={classes.textField}
          onChange={this.handleChange('pace')}
          margin="normal"
          variant="outlined"
        />
      </span>;
    } else {
      paceFields =
        <TextField
          className="left-column"
          type="number"
          InputProps={{ inputProps: { min: 0 } }}
          value={this.state.pace}
          label={this.state.paceType}
          // className={classes.textField}
          onChange={this.handleChange('pace')}
          margin="normal"
          variant="outlined"
        />;
    }

    return (
      <div className="app">
        <RtToolbar title="🏃 Runtime" subTitle="- Check time, pace & distance"></RtToolbar>

        <div className="app-content">

          <div className="inputs">
            <b>🗺️ Sträcka</b>
            <div className="input-row">
              <TextField
                className="left-column"
                type="number"
                value={this.state.length}
                InputProps={{ inputProps: { min: 0 } }}
                // className={classes.textField}
                onChange={this.handleChange('length')}
                margin="normal"
                variant="outlined"
              />
              <TextField
                select
                className="right-column"
                label=""
                value={this.state.lengthType}
                onChange={this.handleChange('lengthType')}
                margin="normal"
                variant="outlined"
              >
                {lengthTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

            </div>
            <b>🏃 Hastighet</b>
            <div className="input-row">
              {paceFields}
              <TextField
                select
                className="right-column"
                label=""
                value={this.state.paceType}
                onChange={this.handleChange('paceType')}
                margin="normal"
                variant="outlined"
              >
                {paceTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <b>⏱️ Tid</b>
            <div className="input-row">
              <TextField
                className="time-column"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={this.state.hours}
                label="Timmar"
                // className={classes.textField}
                onChange={this.handleChange('hours')}
                margin="normal"
                variant="outlined"
              />
              <TextField
                className="time-column"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={this.state.minutes}
                label="Minuter"
                // className={classes.textField}
                onChange={this.handleChange('minutes')}
                margin="normal"
                variant="outlined"
              />
              <TextField
                className="time-column"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={this.state.seconds}
                label="Sekunder"
                // className={classes.textField}
                onChange={this.handleChange('seconds')}
                margin="normal"
                variant="outlined"
              />
            </div>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "center",
          }}>Run, run run!</div>

        </div>

      </div>
    );
  }
}

export default App;
