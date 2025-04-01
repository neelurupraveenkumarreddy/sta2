import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './index.css';
import Cookies from 'js-cookie';
import Header from '../Header';

class Login extends Component {
  state = {
    username: '',
    password: '',
    error: '',
    message: '',
    token: '',
    isLoggedIn: false
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    if (!username || !password) {
      this.setState({ error: 'Username and password are required.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok) {
        Cookies.set('jwt_token', data.token, { expires: 30 });
        this.setState({ isLoggedIn: true });
      } else {
        this.setState({ error: data.msg || 'Login failed.' });
      }
    } catch (err) {
      this.setState({ error: 'Server error. Please try again later.' });
    }
  };

  render() {
    const { username, password, error, isLoggedIn } = this.state;

    // Redirect after login
    if (isLoggedIn) {
      return <Navigate to="/" />;
    }

    return (
      <>
      <Header/>
      <div className="login-page">
        <h2>Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={this.handleSubmit}>
          <div className="loginform-group">
            <label htmlFor="username" className="loginlabel">Username:</label>
            <input 
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={this.handleChange}
              placeholder="Enter username"
              className="logininput"
            />
          </div>
          <div className="loginform-group">
            <label htmlFor="password" className="loginlabel">Password:</label>
            <input 
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              placeholder="Enter password"
              className="logininput"
            />
          </div>
          <button type="submit" className="loginbutton">Login</button>
        </form>
        <p className="login-p">
          Not registered? <Link to="/register">Register here</Link>
        </p>
      </div>
      </>
    );
  }
}

export default Login;
