import {Component} from 'react'
import {Link} from 'react-router-dom'
import './index.css'
import Cookies from 'js-cookie'
import Header from '../Header'
class Home extends Component{
    state={
        rollno:"",
        date: new Date().toISOString().slice(0, 16),
        apiResp:{},
        apiStatus:'inpro',
        allAllotments:[],
        apiAllStatus:"inpro",
        jwtToken:Cookies.get('jwt_token')
    }
    componentDidMount(){
        this.fetchAllAllotments();
    }
    fetchAllAllotments=async ()=>{
        const url='/api/allotments'
        const options={
            method:"GET",
        };
        try{
        const response=await fetch(url,options)
        if(response.ok){
        const rspjs=await response.json()
        this.setState({apiAllStatus:"suc",allAllotments:rspjs.data})
        }
        else{
            console.log("Erroe")
        }}
        catch(e){
            console.log("Error ocuured",e)
        }
    }
    getApiResp=async (event)=>{
        event.preventDefault()
        const {date}=this.state
        const url='/api/allotments'
        const options={
            method:"GET",
        };
        try{
        const response=await fetch(url,options)
        if(response.ok){
        const rspjs=await response.json()
        console.log(rspjs)
        const requiredAllotmentroom=rspjs.data.filter(each=>new Date(each.exam_datetime).toISOString().slice(0, 16)===date)
        console.log(requiredAllotmentroom)
        if(requiredAllotmentroom){
        this.setState({apiResp:requiredAllotmentroom[0],apiStatus:'suc',allAllotments:rspjs.data})}
        else{
            console.log("You have entered Wrong EXam date aand time.")
        }
        }
        else{
            console.log("Erroe")
        }}
        catch(e){
            console.log("Error ocuured",e)
        }
    }
    renderOut=()=>{
        const {apiResp,rollno}=this.state
        const {allotment}=apiResp
        return (
            <>
            <div>
                <ul>
                <table className="seating-table">
                    <tbody>
                        {Object.keys(allotment).map((roomNumber) => (
                            <div key={roomNumber} className="room-allotment">
                              <h3>Room: {roomNumber}</h3>
                              <table>
                                <tbody>
                                  {allotment[roomNumber].map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      {row.map((seat, seatIndex) => {
                                        const seatClass = rollno === seat ? "your-seat-cell" : "seat-cell";
                                        return (
                                          <td key={seatIndex} className={seatClass}>
                                            {seat}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                    </tbody>
                    </table>
                </ul>
            </div>
            </>
        )
    }
    changeRollNo=(event)=>{
        this.setState({rollno:event.target.value})
    }
    changeDate=(event)=>{
        this.setState({date:event.target.value})
    }
    renderHomeBody=()=>{
        const {apiStatus,rollno}=this.state
        return (
            <div className="homeBody">
                <h1>Find Your Seat</h1>
                <p>in Exams</p>
                <form className='studentForm' onSubmit={this.getApiResp}>
                    <div className='inputs'>
                        <label htmlFor="rollno" >Roll No</label>
                        <input id="rollno" type="text" placeholder='ROLL NO' onChange={this.changeRollNo}/>
                    </div>
                    <div className='inputs'>
                        <label htmlFor="examdate">Exam Date</label>
                        <input id="examdate" type="datetime-local" onChange={this.changeDate}/>
                    </div>
                    <button type="submit" >Submit</button>
                </form>
                
                {apiStatus==='suc' && <>{this.renderOut()}</>}
            </div>
        )
    }
    renderHomeFooter=()=>{
        const {allAllotments}=this.state
        console.log(allAllotments)
        return (
            <div className="homeFooter">
                <h1>upcoming Exam Dates:</h1>
                <ul>
                    {
                        allAllotments.map(each=>(
                            <li>{each.exam_datetime} {each.exam_name}</li>
                        ))
                    }
                </ul>
            </div>
        )
    }
    render (){
        const {apiAllStatus}=this.state
        return (
            <>
            <Header/>
            {this.renderHomeBody()}
            {apiAllStatus==='suc' && <>{this.renderHomeFooter()}</>}
            </>
        )
    }

}
export default Home