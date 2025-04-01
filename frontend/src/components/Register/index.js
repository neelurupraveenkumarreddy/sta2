import React, { Component } from 'react';
import './index.css'
import Header from '../Header';
import Cookies from "js-cookie"; 

class Register extends Component {
  state = {
    username: '',
    password: '',
    message: '',
    error: ''
  };

  // Handle input field changes
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // Handle form submission
// Ensure js-cookie is installed

handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;

    // Simple validation
    if (!username || !password) {
        this.setState({ error: "Username and password are required." });
        return;
    }

    try {
        const token = Cookies.get("jwt_token"); // Retrieve JWT token

        const response = await fetch("/api/admin/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "", // Include JWT token if available
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            this.setState({ message: data.msg, error: "", username: "", password: "" });
        } else {
            this.setState({ error: data.msg || "Registration failed.", message: "" });
        }
    } catch (err) {
        this.setState({ error: "Server error. Please try again later.", message: "" });
    }
};

  render() {
    const { username, password, message, error } = this.state;
    return (
      <>
      <Header/>
      <div className="register-page">
        <h2>Admin Register</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={this.handleSubmit}>
          <div className="Register-form-group">
            <label htmlFor="username" className='Register-label'>Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={username}
              onChange={this.handleChange}
              placeholder="Enter username"
              className='Register-input'
            />
          </div>
          <div className="Register-form-group">
            <label htmlFor="password" className='Register-label'>Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password}
              onChange={this.handleChange}
              placeholder="Enter password"
              className='Register-input'
            />
          </div>
          <button type="submit" className='Register-button'>Register</button>
        </form>
      </div>
      </>
    );
  }
}

export default Register;
