import './calculator.css';
import React from 'react';
import { Checkbox, TextField, MenuItem } from '@material-ui/core';
import { Timer } from 'papilion';
// REDUX
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UPDATE } from '../actions/actions';
import { store } from '../store';

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

var lengthTypes = [
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

var paceTypes = [
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

interface IProps {
    distanceTraveled?: number;
}

type RowTypes = 'length' | 'pace' | 'time';

interface IState {
    /** Distance variables */
    length: number;
    lengthInMeters: number;
    lengthType: LenghtType;
    /** Pace variables */
    pace: number;
    paceMinutes: number;
    paceSeconds: number;
    paceType: PaceType;
    /** Time variables */
    hours: number;
    minutes: number;
    seconds: number;
    /** The last item in this array gets calculated everytime this.calculate gets called. */
    latestEdited: RowTypes[];
    itemToCalculate: RowTypes;
}

export class RtCalculator extends React.PureComponent<IProps, IState> {
    timerId: any;
    timerActive = false;
    timer!: Timer;

    constructor(props) {
        super(props);
        this.state = {
            length: 5,
            lengthInMeters: 5000,
            lengthType: LenghtType.Km,
            pace: 5,
            paceMinutes: 5,
            paceSeconds: 0,
            paceType: PaceType.MinutesPerKm,
            hours: 0,
            minutes: 0,
            seconds: 0,
            latestEdited: ['length', 'pace', 'time'],
            itemToCalculate: 'time',
        }
        this.calculate = this.calculate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getLengthInMeters = this.getLengthInMeters.bind(this);
        this.getPaceInMetersPerSecond = this.getPaceInMetersPerSecond.bind(this);
        this.getTimeInSeconds = this.getTimeInSeconds.bind(this);
        this.getTimeInSeconds = this.getTimeInSeconds.bind(this);
        this.countdownOneSecond = this.countdownOneSecond.bind(this);
    }

    componentDidMount() {
        this.calculate();
        store.subscribe(() => {
            var state = store.getState().info;

            // Start the countdown
            if (state.isTracking && !this.timerActive) {
                this.startTimer();
            } else if (!state.isTracking && this.timerActive) {
                this.stopTimer();
            }

            if (state.isTracking) {
                // Calculate the new distance
                // Add the distanceTravel to our distance and calulate again
                var distanceTraveled = state.distanceTraveled;
                var oldDistance = this.getLengthInMeters();
                var newDistance = Number(oldDistance - distanceTraveled);

                this.setLength(newDistance, () => {
                    this.setItemToCalculate('pace');
                    this.calculate();
                });
            } else {
                // Reset the calculated distances
                // this.setState({})
            }
        });
    }

    calculate() {
        // Check which is the property to calc
        var itemToCalculate = this.state.latestEdited[this.state.latestEdited.length - 1] as any;
        this.setState({ itemToCalculate: itemToCalculate });

        if (itemToCalculate === 'length') {
            var pace = this.getPaceInMetersPerSecond();
            var seconds = this.getTimeInSeconds();
            let length = Math.floor(pace * seconds);
            // Convert the length before setting the value (if nessesary)
            this.setLength(length);
        }
        else if (itemToCalculate === 'pace') {
            var meters = this.getLengthInMeters();
            var seconds = this.getTimeInSeconds();
            this.setPace(meters, seconds);
        }
        else if (itemToCalculate === 'time') {
            var meters = this.getLengthInMeters();
            var pace = this.getPaceInMetersPerSecond();
            var seconds = meters / pace;
            this.setTime(seconds);
        }
    }

    countdownOneSecond(this) {
        var seconds = this.getTimeInSeconds();
        seconds = seconds - 1;
        this.setTime(seconds);
    }

    /** @returns the users input for the distance as m */
    getLengthInMeters(): number {
        let length = Number(this.state.lengthInMeters);
        // Convert length (if nessesary to meters)
        return length;
    }

    /** @returns whatever pace/speed the user selected as m/s */
    getPaceInMetersPerSecond(): number {
        let pace = Number(this.state.pace);
        let paceMinutes = Number(this.state.paceMinutes);
        let paceSeconds = Number(this.state.paceSeconds);
        // Convert pace (if nessesary to m/s)
        switch (this.state.paceType) {
            case PaceType.MinutesPerKm:
                pace = 1000 / (paceMinutes * 60 + paceSeconds);
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
        return (Number(this.state.hours) * 3600)
            + (Number(this.state.minutes) * 60)
            + Number(this.state.seconds);
    }

    handleCheckboxChange = (name: string) => (event: any) => {
        this.setItemToCalculate(name);
    }

    /**
     * Set the value, 
     * mark the property as the latest edited one
     * and calculate the remaning number.
     */
    handleChange = (name: string) => (event: any) => {
        let value: any = event.target.value;
        let statePatch: Partial<IState> = {
            [name]: value
        };

        // Add length in meters if length changed
        if (name === 'length') {
            switch (this.state.lengthType) {
                case LenghtType.Km:
                    statePatch.lengthInMeters = value * 1000;
                    break;
                case LenghtType.miles:
                    statePatch.lengthInMeters = value * 1609.344;;
                    break;
                case LenghtType.m:
                    statePatch.lengthInMeters = value;
                    break;
            }
        }
        this.setState(statePatch as any, () => {

            if (name.match(/paceMinutes|paceSeconds/)) {
                name = 'pace';
            }

            if (name.match(/hours|minutes|seconds/)) {
                name = 'time';
            }

            /**
             * If the user edited the types (km/h, miles) 
             * the property being calculated should stay the same,
             * i.e. we dont edit the latestEdited array
             */
            if (name.match(/length|pace|time/)) {
                var latestEdited = this.state.latestEdited;
                var index = latestEdited.indexOf(name as RowTypes);
                if (index !== -1) {
                    latestEdited.splice(index, 1)
                }
                latestEdited.unshift(name as RowTypes);
                this.setState({ latestEdited: latestEdited }, () => this.calculate())
            } else {
                this.calculate();
            }
        });
    }

    /**
      * Remove the property and unshift it in so it is the first item in the array
      * then call this.calculate();
      */
    setItemToCalculate(name: string) {
        var latestEdited = this.state.latestEdited;
        var index = latestEdited.indexOf(name as RowTypes);
        if (index !== -1) {
            latestEdited.splice(index, 1)
        }
        latestEdited.push(name as RowTypes);
        this.setState({ latestEdited: latestEdited }, () => this.calculate())
    }

    /** Accepts the length in meters and formats it before setting to state */
    setLength(lengthInMeters: number, callback?: () => void): any {
        var displayLength = 0;
        // Convert the length before setting the value (if nessesary)
        switch (this.state.lengthType) {
            case LenghtType.Km:
                displayLength = lengthInMeters / 1000;
                // Convert to maximum 2 decimals
                displayLength = Number(displayLength.toFixed(2));
                break;
            case LenghtType.miles:
                displayLength = lengthInMeters / 1609.344;
                // Convert to maximum 2 decimals
                displayLength = Number(displayLength.toFixed(2));
                break;
        }
        this.setState({
            length: displayLength,
            lengthInMeters: lengthInMeters
        }, callback);
    }

    /** Convert the pace before setting the value (if nessesary) */
    setPace(meters: number, seconds: number, callback?: () => void): any {
        var minutes = seconds / 60;
        var km = meters / 1000;
        var miles = meters / 1609.344;
        var hours = seconds / 3600;
        var pace = 0;
        var paceMinutes = 0;
        var paceSeconds = 0;
        switch (this.state.paceType) {
            case PaceType.MinutesPerKm:
                pace = minutes / km;
                paceMinutes = Math.floor(minutes / km);
                paceSeconds = Math.floor((seconds / km) % 60);
                // TODO: Convert the decimal part to seconds for pace
                break;
            case PaceType.KmPerHour:
                pace = km / hours;
                break;
            case PaceType.MilesPerHour:
                pace = miles / hours;
                break;
            case PaceType.MetersPerSecond:
                pace = meters / seconds;
                break;
        }
        this.setState({
            pace: pace,
            paceMinutes: paceMinutes,
            paceSeconds: paceSeconds
        }, callback)
    }

    /** Convert the length before setting the value (if nessesary)  */
    setTime(timeInSeconds: number, callback?: () => void): any {
        var hours = Math.floor(timeInSeconds / 3600);
        timeInSeconds %= 3600;
        this.setState({
            hours: hours,
            minutes: Math.floor(timeInSeconds / 60),
            seconds: Math.floor(timeInSeconds % 60),
        }, callback);
    }

    startTimer() {
        this.timerActive = true;
        if (this.timer) {
            this.timer.stop();
        }
        this.timer = new Timer(this.countdownOneSecond, 1000);
    }

    stopTimer() {
        this.timer.stop();
        this.timer = null as any;
        this.timerActive = false;
    }

    render() {
        let paceFields;
        if (this.state.paceType === PaceType.MinutesPerKm) {
            paceFields = <span>
                <TextField
                    className="left-column-half minute-field"
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                    value={this.state.paceMinutes}
                    label="Minuter"
                    // className={classes.textField}
                    onChange={this.handleChange('paceMinutes')}
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    className="left-column-half"
                    type="number"
                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                    value={this.state.paceSeconds}
                    label="Sekunder"
                    // className={classes.textField}
                    onChange={this.handleChange('paceSeconds')}
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
                    <Checkbox
                        checked={this.state.itemToCalculate === 'length'}
                        onChange={this.handleCheckboxChange('length')}
                    ></Checkbox>
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
                    <Checkbox
                        checked={this.state.itemToCalculate === 'pace'}
                        onChange={this.handleCheckboxChange('pace')}
                    ></Checkbox>
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
                        InputProps={{ inputProps: { min: 0, max: 59 } }}
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
                        InputProps={{ inputProps: { min: 0, max: 59 } }}
                        value={this.state.seconds}
                        label="Sekunder"
                        // className={classes.textField}
                        onChange={this.handleChange('seconds')}
                        margin="normal"
                        variant="outlined"
                    />
                    <Checkbox
                        checked={this.state.itemToCalculate === 'time'}
                        onChange={this.handleCheckboxChange('time')}
                    ></Checkbox>
                </div>
            </div>
        );
    }
}


const mapStateToProps = (state: IProps) => {
    console.log('Calculator recieved state');
    return {
        distanceTraveled: state.distanceTraveled
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ UPDATE }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RtCalculator);
