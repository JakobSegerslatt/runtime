import React, { Component } from 'react';
import { RtToolbar} from './components/toolbar'
import './App.css';

interface GitHubUser {
  name: string;
}

interface IState {
  user: string;
}

class App extends Component {
  state: IState;

  constructor(props) {
    super(props);
    this.state = {
      user: 'hej',
    }
    this.fetchUser = this.fetchUser.bind(this);
  }

  fetchUser() {
    this.getGithubUser().then(u => {
      this.setState({
        user: u.name
      });
    });
  }

  async getGithubUser(): Promise<GitHubUser> {
    const user = await fetch('https://api.github.com/users/jakobsegerslatt')
    const userResponse: GitHubUser = await user.json();
    return userResponse;
  }

  render() {
    return (
      <div className="app">
      <RtToolbar title="Runtime" subTitle="- Check time, pace & distance"></RtToolbar>

        <div className="app-content">
          Calculations etc
          <button onClick={this.fetchUser}>Hämta användare</button>
          <pre>{this.state.user}</pre>
        </div>
      </div>
    );
  }
}

export default App;
