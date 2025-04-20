import { Component } from 'react';
import {Link} from 'react-router-dom';
import Cookies from 'js-cookie'
import './CreateRooms.css';
import Header from '../Header';

class CreateRooms extends Component {
  state = {
    availableRooms: [],
    apiRoomStatus: 'inpro',
    apiUploadRoomStatus: '',
    error: '',
    room_number: "",
    rows: 0,
    columns: 0,
    building_name: "",
    unavailable_positions: [
      { row: 0, column: 0 },
      { row: 0, column: 0 },
    ],
  };

  componentDidMount() {
    this.fetchRooms();
  }

  fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      if (response.ok) {
        this.setState({ availableRooms: data.data, apiRoomStatus: 'suc' });
      } else {
        throw new Error(data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handlePositionChange = (index, field, value) => {
    const updatedPositions = this.state.unavailable_positions.map((pos, i) =>
      i === index ? { ...pos, [field]: value } : pos
    );
    this.setState({ unavailable_positions: updatedPositions });
  };

  addPosition = () => {
    this.setState((prevState) => ({
      unavailable_positions: [...prevState.unavailable_positions, { row: "", column: "" }],
    }));
  };

  removePosition = (index) => {
    this.setState((prevState) => ({
      unavailable_positions: prevState.unavailable_positions.filter((_, i) => i !== index),
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { room_number, rows, columns, building_name, unavailable_positions } = this.state;
    const payload = { room_number, rows, columns, building_name, unavailable_positions };

    try {
        const token = Cookies.get("jwt_token"); // Retrieve token from cookies
        console.log(token)
        const response = await fetch("/api/rooms", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "", // Add JWT token to Authorization header
            },
            body: JSON.stringify(payload),
        });

        console.log(response);
        if (response.ok) {
            alert("Room data submitted successfully!");
            this.setState({
                availableRooms: [],
                apiRoomStatus: "inpro",
                apiUploadRoomStatus: "",
                error: "",
                room_number: "",
                rows: 0,
                columns: 0,
                building_name: "",
                unavailable_positions: [
                    { row: 0, column: 0 },
                    { row: 0, column: 0 },
                ],
            });
        } else {
            alert("Failed to submit data");
        }
    } catch (error) {
        console.error("Error submitting data:", error);
    }
};
  renderFormCreateRooms = () => {
    const { room_number, rows, columns, building_name, unavailable_positions } = this.state;
    return (
        <>
        <h1 className='RoomsHead'>Create Room:</h1>
      <form onSubmit={this.handleSubmit} className="room-form">
        <label>Room Number</label>
        <input name="room_number" value={room_number} onChange={this.handleChange} required />

        <label>Rows</label>
        <input type="number" name="rows" value={rows} onChange={this.handleChange} required />

        <label>Columns</label>
        <input type="number" name="columns" value={columns} onChange={this.handleChange} required />

        <label>Building Name</label>
        <input name="building_name" value={building_name} onChange={this.handleChange} required />

        <label>Unavailable Positions</label>
        {unavailable_positions.map((pos, index) => (
          <div key={index} className="position-container">
            <input type="number" value={pos.row} onChange={(e) => this.handlePositionChange(index, "row", e.target.value)} placeholder="Row" required />
            <input type="number" value={pos.column} onChange={(e) => this.handlePositionChange(index, "column", e.target.value)} placeholder="Column" required />
            <button type="button" onClick={() => this.removePosition(index)} className="remove-button">Remove</button>
          </div>
        ))}
        <button type="button" onClick={this.addPosition} className="add-button">Add Position</button>

        <button type="submit" className="submit-button">Submit</button>
      </form></>
    );
  };

  renderRooms = () => {
    const { availableRooms } = this.state;
    return (
      <div className="room-container">
        <h1 className='RoomsHead'>Available Rooms:</h1>
        <ul className="room-list">
        <li className="room-item">
              <p className='room-item-p'>roomNo & Building:</p>
              <p>Number of Rows:</p>
              <p>Number of columns:</p>
              <p>Total Seats: </p>
            </li>
          {availableRooms.map((room) => (
            <li key={room._id} className="room-item">
              <p className='room-item-p'>{room.room_number} ({room.building_name})</p>
              <p>{room.rows}</p>
              <p>{room.columns}</p>
              <p>{room.rows * room.columns}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  render() {
    return (
        <div className='ForBgImg2'><Header/>
      <div className="main-container">
        {this.renderFormCreateRooms()}
        {this.renderRooms()}
      </div>
      <Link to="/" className="room-item-p"><button>Back</button></Link>
      </div>
    );
  }
}

export default CreateRooms;
