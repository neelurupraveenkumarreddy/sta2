import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import collegeLogo from '../../images/collegeLogo.png'; // Import your JPG logo
import './index.css';
import Header from '../Header';

class PrintAllotments extends Component {
  state = {
    allotments: [],
    selected: {}
  };

  componentDidMount() {
    this.fetchAllotments();
  }

  fetchAllotments = async () => {
    try {
      const response = await fetch('/api/allotments', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('jwt_token')}`
        }
      });
      const rspdata = await response.json();
      this.setState({ allotments: rspdata.data });
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  };

  handleSelect = (id) => {
    this.setState((prevState) => ({
      selected: {
        ...prevState.selected,
        [id]: !prevState.selected[id]
      }
    }));
  };

  // Utility: load an image from a URL (or imported file) and convert to a Base64 string
  loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // To avoid CORS issues if the image is hosted on a different origin
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
        // Get the data URL in JPEG format
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      };
      img.onerror = function (err) {
        reject(err);
      };
      img.src = url;
    });
  };

  // Helper function to draw a border on the current page.
  drawBorder = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  };
  formatDateTime=(isoDateStr)=> {
    const [datePart, timePart] = isoDateStr.split('T');
const [year, month, day] = datePart.split('-').map(Number);
const [hour, minute] = timePart.split(':').map(Number);

const date = new Date(year, month - 1, day, hour, minute);

const options = {
day: '2-digit',
month: 'long',
year: 'numeric',
hour: '2-digit',
minute: '2-digit',
hour12: true,
};

const formattedDate = date.toLocaleString('en-IN', options);

// Split date and time cleanly to add "at"
const [dateStr, timeStr] = formattedDate.split(', ');
return `${dateStr}`;    
}
  // Make generatePDF asynchronous so we can await the image conversion.
  generatePDF = async () => {
    const { allotments, selected } = this.state;
    const doc = new jsPDF();
  
    // Convert the imported PNG logo to Base64
    const logoBase64 = await this.loadImageAsBase64(collegeLogo);
  
    // Calculate available width based on border margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 5; // as used in drawBorder
    const availableWidth = pageWidth - margin * 2;
  
    // Get image properties to maintain aspect ratio
    const imgProps = doc.getImageProperties(logoBase64);
    const logoHeight = (imgProps.height * availableWidth) / imgProps.width;
  
    // Add logo spanning the full available width
    doc.addImage(logoBase64, 'PNG', margin, 5, availableWidth, logoHeight);
  
    // Draw border around the page
    this.drawBorder(doc);
  
    const selectedAllotments = allotments.filter((allot) => selected[allot._id]);
    if (selectedAllotments.length === 0) {
      alert('No allotments selected!');
      return;
    }
  
    selectedAllotments.forEach((allot, allotIndex) => {
      if (allotIndex > 0) {
        doc.addPage();
        // Add the logo and border on new pages as well
        doc.addImage(logoBase64, 'PNG', margin, 5, availableWidth, logoHeight);
        this.drawBorder(doc);
      }
  
      let y = logoHeight + 10; // Start below the logo
      doc.setFontSize(16);
      doc.text(`Exam DateTime: ${this.formatDateTime(allot.exam_datetime)}`, 14, y);
      y += 10;
      doc.text(`Branches: ${allot.students_branches.join(', ')}`, 14, y);
      y += 10;
  
      allot.room_no.forEach((room) => {
        doc.setFontSize(14);
        doc.text(`Room No: ${room}`, 14, y);
        y += 10;
  
        const roomData = allot.allotment[room];
        if (roomData && roomData.length > 0) {
          let tableHead = [];
          if (typeof roomData[0] === 'object' && roomData[0] !== null) {
            tableHead = [Object.keys(roomData[0])];
          } else {
            tableHead = [['Detail']];
          }
  
          const tableBody = roomData.map((item) => {
            if (typeof item === 'object' && item !== null) {
              return Object.values(item);
            }
            return [item];
          });
  
          autoTable(doc, {
            head: tableHead,
            body: tableBody,
            startY: y,
            margin: { left: 14, right: 14 },
            didDrawPage: () => {
              this.drawBorder(doc);
            }
          });
          y = doc.lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(12);
          doc.text('No allotment details available.', 14, y);
          y += 10;
        }
      });
    });
  
    doc.save('allotments.pdf');
  };
  

  render() {
    const { allotments, selected } = this.state;
    return (
        <div className='ForBgImg'>
        <Header/>
      <div className="print-allotment__container">
        <h1 className="print-allotment__title">Allotments</h1>
        <table className="print-allotment__table" cellPadding="8" cellSpacing="0">
          <thead className="print-allotment__thead">
            <tr>
              <th className="print-allotment__th">Select</th>
              <th className="print-allotment__th">Room No</th>
              <th className="print-allotment__th">Exam DateTime</th>
              <th className="print-allotment__th">Branches</th>
            </tr>
          </thead>
          <tbody className="print-allotment__tbody">
            {allotments.map((allot) => (
              <tr key={allot._id} className="print-allotment__tr">
                <td className="print-allotment__td">
                  <input
                    type="checkbox"
                    className="print-allotment__checkbox"
                    checked={!!selected[allot._id]}
                    onChange={() => this.handleSelect(allot._id)}
                  />
                </td>
                <td className="print-allotment__td">{allot.room_no.join(', ')}</td>
                <td className="print-allotment__td">
                  {this.formatDateTime(allot.exam_datetime)}
                </td>
                <td className="print-allotment__td">{allot.students_branches.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="print-allotment__btn" onClick={this.generatePDF}>
          Generate PDF
        </button>
      </div>
      </div>
    );
  }
}

export default PrintAllotments;
