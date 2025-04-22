import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import './index.css';
import Header from '../Header';
import Cookies from "js-cookie";

class ExamSeating extends Component {
  state = {
    numberOfFiles: 2,                 // Number of CSV file inputs
    files: Array(2).fill(null),        // Array to hold file objects
    fileUploadResponses: Array(2).fill(''),
    studentsList: Array(2).fill([]),   // Parsed students per file
    combinedStudents: [],              // Combined student array (for non-checkerboard modes)
    branches: Array(2).fill(""),       // Branch for each file
    rooms: [],
    selectedRooms: [],
    roomsTotalSeats: 0,
    examDatetime: '',
    allotment: {},
    unallottedStudents: [],            // List of students not allocated
    error: '',
    apiRoomStatus: 'inpro',
    allotmentDirection: 'row',         // Options: "row", "column", "checkerboard-row", "checkerboard-column"
    fillRoomFirst: false,
    allotmentSuccess: false,
    exam_name:'',
  };

  componentDidMount() {
    this.fetchRooms();
  }

  fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      if (response.ok) {
        this.setState({ rooms: data.data, apiRoomStatus: 'suc' });
      } else {
        throw new Error(data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  // Update the number of files and initialize related arrays
  handleNumberOfFilesChange = (e) => {
    const num = parseInt(e.target.value, 10) || 0;
    this.setState({
      numberOfFiles: num,
      files: Array(num).fill(null),
      fileUploadResponses: Array(num).fill(''),
      studentsList: Array(num).fill([]),
      combinedStudents: [],
      branches: Array(num).fill(""),
      unallottedStudents: [],
    });
  };

  // Handle individual file change based on index
  handleFileChange = (index, e) => {
    const files = [...this.state.files];
    files[index] = e.target.files[0];
    this.setState({ files });
  };

  // Handle branch input change for each file
  handleBranchChange = (index, e) => {
    const branches = [...this.state.branches];
    branches[index] = e.target.value;
    this.setState({ branches });
  };

  // Parse a single file based on index
  handleFileUpload = (index) => {
    const file = this.state.files[index];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const parsedStudents = result.data
            .map(row => row.rollno)
            .filter(roll => roll && roll.trim() !== '');
          const studentsList = [...this.state.studentsList];
          studentsList[index] = parsedStudents;
          // For non-checkerboard modes, combine all students into one list.
          const combinedStudents = studentsList.flat();
          const fileUploadResponses = [...this.state.fileUploadResponses];
          fileUploadResponses[index] = `File ${index + 1} uploaded and parsed successfully.`;
          this.setState({ studentsList, combinedStudents, fileUploadResponses });
        },
        error: (error) => {
          this.setState({ error: error.message });
        }
      });
    }
  };

  handleRoomSelect = (e) => {
    const { rooms, selectedRooms } = this.state;
    const selectedRoomNo = e.target.value;
    const selectedRoom = rooms.find(room => room.room_number === selectedRoomNo);
    if (!selectedRoom) return;
    const seatsAvailable = selectedRoom.rows * selectedRoom.columns;
    if (!e.target.checked) {
      const updatedRooms = selectedRooms.filter(rm => rm.room_number !== selectedRoomNo);
      this.setState(prevState => ({
        selectedRooms: updatedRooms,
        roomsTotalSeats: prevState.roomsTotalSeats - seatsAvailable,
      }));
    } else {
      this.setState(prevState => ({
        selectedRooms: [...prevState.selectedRooms, selectedRoom],
        roomsTotalSeats: prevState.roomsTotalSeats + seatsAvailable,
      }));
    }
  };

  createAllotment = () => {
    const { selectedRooms, allotmentDirection, combinedStudents, studentsList } = this.state;
    let newAllotment = {};

    if (
      allotmentDirection === "checkerboard-row" ||
      allotmentDirection === "checkerboard-column"
    ) {
      // Group student arrays in pairs (each pair from two files)
      const pairs = [];
      for (let i = 0; i < studentsList.length; i += 2) {
        let arr1 = studentsList[i] || [];
        let arr2 = studentsList[i + 1] || [];
        pairs.push({ arr1: [...arr1], arr2: [...arr2] });
      }
      let pairIndex = 0;
      let currentPair = pairs[pairIndex];

      selectedRooms.forEach(room => {
        const { rows, columns, room_number, unavialable_positions = [] } = room;
        let roomSeats = Array.from({ length: rows }, () => Array(columns).fill(null));

        if (allotmentDirection === "checkerboard-row") {
          // Row-wise traversal
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              if (unavialable_positions.some(pos => pos.row === i + 1 && pos.column === j + 1)) {
                roomSeats[i][j] = null;
              } else {
                // Advance pair if current one is exhausted
                while (currentPair && currentPair.arr1.length === 0 && currentPair.arr2.length === 0) {
                  pairIndex++;
                  currentPair = pairs[pairIndex];
                  if (!currentPair) break;
                }
                if (!currentPair) break;
                if ((i + j) % 2 === 0) {
                  if (currentPair.arr1.length > 0) {
                    roomSeats[i][j] = currentPair.arr1.shift();
                  } else if (currentPair.arr2.length > 0) {
                    roomSeats[i][j] = currentPair.arr2.shift();
                  }
                } else {
                  if (currentPair.arr2.length > 0) {
                    roomSeats[i][j] = currentPair.arr2.shift();
                  } else if (currentPair.arr1.length > 0) {
                    roomSeats[i][j] = currentPair.arr1.shift();
                  }
                }
              }
            }
          }
        } else if (allotmentDirection === "checkerboard-column") {
          // Column-wise traversal
          for (let j = 0; j < columns; j++) {
            for (let i = 0; i < rows; i++) {
              if (unavialable_positions.some(pos => pos.row === i + 1 && pos.column === j + 1)) {
                roomSeats[i][j] = null;
              } else {
                while (currentPair && currentPair.arr1.length === 0 && currentPair.arr2.length === 0) {
                  pairIndex++;
                  currentPair = pairs[pairIndex];
                  if (!currentPair) break;
                }
                if (!currentPair) break;
                if ((i + j) % 2 === 0) {
                  if (currentPair.arr1.length > 0) {
                    roomSeats[i][j] = currentPair.arr1.shift();
                  } else if (currentPair.arr2.length > 0) {
                    roomSeats[i][j] = currentPair.arr2.shift();
                  }
                } else {
                  if (currentPair.arr2.length > 0) {
                    roomSeats[i][j] = currentPair.arr2.shift();
                  } else if (currentPair.arr1.length > 0) {
                    roomSeats[i][j] = currentPair.arr1.shift();
                  }
                }
              }
            }
          }
        }
        newAllotment[room_number] = roomSeats;
      });
    } else {
      // Standard row or column allotment using combinedStudents
      let globalIndex = 0;
      selectedRooms.forEach(room => {
        const { rows, columns, room_number, unavialable_positions = [] } = room;
        let roomSeats = Array.from({ length: rows }, () => Array(columns).fill(null));
        if (allotmentDirection === "row") {
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              if (unavialable_positions.some(pos => pos.row === i + 1 && pos.column === j + 1)) {
                roomSeats[i][j] = null;
              } else if (globalIndex < combinedStudents.length) {
                roomSeats[i][j] = combinedStudents[globalIndex++];
              }
            }
          }
        } else if (allotmentDirection === "column") {
          for (let j = 0; j < columns; j++) {
            for (let i = 0; i < rows; i++) {
              if (unavialable_positions.some(pos => pos.row === i + 1 && pos.column === j + 1)) {
                roomSeats[i][j] = null;
              } else if (globalIndex < combinedStudents.length) {
                roomSeats[i][j] = combinedStudents[globalIndex++];
              }
            }
          }
        }
        newAllotment[room_number] = roomSeats;
      });
    }

    // Cross-check: Find students that have not been allotted
    const allocated = [];
    Object.values(newAllotment).forEach(room => {
      room.forEach(row => {
        row.forEach(seat => {
          if (seat !== null) allocated.push(seat);
        });
      });
    });
    const allStudents = this.state.studentsList.flat();
    const missingStudents = allStudents.filter(student => !allocated.includes(student));
    
    console.log("Generated Allotment:", newAllotment);
    console.log("Unallotted Students:", missingStudents);
    this.setState({ allotment: newAllotment, unallottedStudents: missingStudents });
  };

  handleSubmit = async () => {
    const { examDatetime, selectedRooms, allotment, branches ,exam_name} = this.state;
    if (!examDatetime || selectedRooms.length === 0 || Object.keys(allotment).length === 0) {
      this.setState({ error: "Missing required fields." });
      return;
    }
    const roomNumbers = selectedRooms.map(room => room.room_number);
    const localDate = new Date(examDatetime);
    const correctedDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    const buildingName = selectedRooms[0]?.building_name || '';
    const payload = {
      exam_name:exam_name,
      exam_datetime: correctedDate,
      room_no: roomNumbers,
      building_name:buildingName,
      students_branches: branches.map(b => b.trim()),
      allotment: {},
      unavialable_positions: {},
    };
    selectedRooms.forEach(room => {
      const rn = room.room_number;
      payload.allotment[rn] = allotment[rn] || [];
      payload.unavialable_positions[rn] = room.unavialable_positions || [];
    });
    try {
      const token = Cookies.get("jwt_token");
      const response = await fetch("/api/allotments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to submit allotment");
      const resData = await response.json();
      console.log("Allotment successful:", resData);
      alert("Successfully created allotment!");
      this.setState({ 
        files: Array(this.state.numberOfFiles).fill(null),
        fileUploadResponses: Array(this.state.numberOfFiles).fill(''),
        studentsList: Array(this.state.numberOfFiles).fill([]),
        combinedStudents: [],
        branches: Array(this.state.numberOfFiles).fill(""),
        selectedRooms: [],
        roomsTotalSeats: 0,
        examDatetime: "",
        allotment: {},
        unallottedStudents: [],
        error: "",
        allotmentDirection: "row",
        fillRoomFirst: false,
      });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  renderRooms = () => {
    const { rooms } = this.state;
    return (
      <div>
        <h1>Select Room:</h1>
        <ul className="room-list">
          {rooms.map(room => (
            <li key={room._id} className="room-item">
              <input id={room._id} value={room.room_number} type="checkbox" onChange={this.handleRoomSelect} />
              <label htmlFor={room._id}>
                {room.room_number} ({room.building_name})
              </label>
              <p>Total Seats: {room.rows * room.columns}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  renderOut = () => {
    const { allotment } = this.state;
    return (
      <div>
        {Object.keys(allotment).map(roomNumber => (
          <div key={roomNumber} className="room-allotment">
            <h3>Room: {roomNumber}</h3>
            <table className="seating-table">
              <tbody>
                {allotment[roomNumber].map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((seat, seatIndex) => (
                      <td key={seatIndex} className="allotment-seat-cell">{seat}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  render() {
    const { numberOfFiles, fileUploadResponses,exam_name, examDatetime, allotment, error, allotmentDirection, unallottedStudents, branches } = this.state;
    return (
      <div className='ForBgImg2'>
        <Header />
        <div className="AllotmentCon">
          <h2 className="header">Exam Seating Arrangement</h2>
          {error && <p className="error">{error}</p>}
          <div className="section">
            <label className="input-field">
              Number of CSV Files:
              <input type="number" min="1" value={numberOfFiles} onChange={this.handleNumberOfFilesChange} />
            </label>
          </div>
          <div className="section file-upload">
            <h3>Upload CSV Files</h3>
            {Array.from({ length: numberOfFiles }, (_, index) => (
              <div key={index}>
                <input type="file" accept=".csv" onChange={e => this.handleFileChange(index, e)} />
                <button className="btn" onClick={() => this.handleFileUpload(index)}>Upload File {index + 1}</button>
                {fileUploadResponses[index] && <p>{fileUploadResponses[index]}</p>}
              </div>
            ))}
          </div>
          <div className="section">
            <h3>Enter Branch for Each File</h3>
            {Array.from({ length: numberOfFiles }, (_, index) => (
              <div key={index}>
                <label className="input-field">
                  Branch for File {index + 1}:
                  <input
                    type="text"
                    value={branches[index] || ""}
                    onChange={e => this.handleBranchChange(index, e)}
                    placeholder="e.g. CSE, ECE, etc."
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="section">
            <label className="input-field">
              Exam Date & Time:
              <input type="datetime-local" value={examDatetime} onChange={e => this.setState({ examDatetime: e.target.value })} />
            </label>
          </div>
          <div className="section allotment-type">
            <h3>Select Allotment Direction:</h3>
            <label>
              <input type="radio" name="allotmentDirection" value="row" checked={allotmentDirection === "row"} onChange={e => this.setState({ allotmentDirection: e.target.value })} /> Row-wise
            </label>
            <label>
              <input type="radio" name="allotmentDirection" value="column" checked={allotmentDirection === "column"} onChange={e => this.setState({ allotmentDirection: e.target.value })} /> Column-wise
            </label>
            <label>
              <input type="radio" name="allotmentDirection" value="checkerboard-row" checked={allotmentDirection === "checkerboard-row"} onChange={e => this.setState({ allotmentDirection: e.target.value })} /> Checkerboard Alternate (Row-wise)
            </label>
            <label>
              <input type="radio" name="allotmentDirection" value="checkerboard-column" checked={allotmentDirection === "checkerboard-column"} onChange={e => this.setState({ allotmentDirection: e.target.value })} /> Checkerboard Alternate (Column-wise)
            </label>
          </div>
          <div className='examName'>
            <label className='input-field'>
              Exam Name
              <input type="exam_name" value={exam_name} onChange={e => this.setState({ exam_name: e.target.value })} />
            </label>
          </div>
          {this.renderRooms()}
          <div className="section">
            <button className="btn generate" onClick={this.createAllotment}>Generate Allotment</button>
          </div>
          <div className="section allotment-preview">
            <h3>Allotment Preview</h3>
            <pre>{JSON.stringify(allotment, null, 2)}</pre>
            <div>{this.renderOut()}</div>
          </div>
          {unallottedStudents.length > 0 && (
            <div className="section">
              <h4>Unallotted Students:</h4>
              <p>{unallottedStudents.join(", ")}</p>
            </div>
          )}
          <div className="section">
            <button className="btn submit" onClick={this.handleSubmit}>Submit Allotment</button>
          </div>
        </div>
        <Link to="/" className="room-item-p">
          <button>Back</button>
        </Link>
      </div>
    );
  }
}

export default ExamSeating;
