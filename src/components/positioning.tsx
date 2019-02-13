import React, { CSSProperties } from "react";
import IconButton from "@material-ui/core/IconButton";
import PlayArrow from '@material-ui/icons/PlayArrow';
// REDUX
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UPDATE } from '../actions/actions';

// Third party
import { getDistance } from 'geolib';

import './positioning.css';
import { store } from "../store";

interface IState {
  prevPosition?: Position;
  currentPosition?: Position;
  isTracking?: boolean;
  distanceTraveled: number; // Distance in meters
  totalDistanceTraveled: number; // Distance in meters
}

export class RtPositioning extends React.PureComponent<{}, IState> {
  state: IState;

  constructor(props) {
    super(props);
    this.state = {
      ...this.props,
      distanceTraveled: 0,
      totalDistanceTraveled: 0,
    };
    this.startGps = this.startGps.bind(this);
    this.startTracking = this.startTracking.bind(this);
  }

  parseCords(coords: Coordinates): geolib.PositionAsDecimal | geolib.PositionAsSexadecimal {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    }
  }

  /** This method should not be run if the geolocation api is not available */
  startGps() {
    this.setState({ isTracking: true })
    store.dispatch({
      type: 'UPDATE',
      payload: {
        isTracking: true
      }
    });
    var position = navigator.geolocation.watchPosition((position) => {
      console.log('Position updated');
      console.log(position);
      var prevPosition = this.state.prevPosition;
      if (prevPosition) {
        var distanceTraveled = getDistance(
          this.parseCords(prevPosition.coords),
          this.parseCords(position.coords),
          1, // Accuracy in meters (we set accuracy of 1 meter)
          1, // Precision of 1, round to closest meterä
        );

        store.dispatch({
          type: 'UPDATE',
          payload: {
            distanceTraveled: distanceTraveled
          }
        });

        // store.dispatch({ type: 'UPDATE', payload: payload });
      }

      this.setState({
        prevPosition: position,
      });

    }, error => {
      console.log('Gps error');
      console.log(error);
    });
  }

  startTracking() {
    console.log('Tracking starting')
    if (!this.state.isTracking) {
      this.startGps();
    }
  };

  stopTracking() {

  }

  render() {
    let button;
    if ("geolocation" in navigator && !this.state.isTracking) {
      /* geolocation is available */
      button = <IconButton aria-label="Play" color="primary"
        onClick={this.startTracking}>
        <PlayArrow
          style={{
            fontSize: '86px'
          }} />
      </IconButton >
    } else if (this.state.isTracking) {
      /* geolocation IS NOT available */
      button = <span>Spårar position</span>
    }
    return <div>
      {button}
      <div>
        Distance: {this.state.distanceTraveled}
      </div>
    </div>
  }

}

const mapStateToProps = (state) => {
  return {
    distanceTraveled: state.distanceTraveled
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ UPDATE }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RtPositioning);