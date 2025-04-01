import { Component } from 'react'
import Cookies from 'js-cookie'
import {Link} from 'react-router-dom'
import logo from '../../images/jntuaceatp.webp'

class Header extends Component{
    state={jwtToken:Cookies.get("jwt_token")}
    render (){ 
        const {jwtToken}=this.state
    if(jwtToken!==undefined){
    return (<div className="homeNavBar">
        <img src={logo} alt="jntua-img" className='navLogo'/>
        <ul type="none" className='navElements'>
            <Link to="/" className='custom-link'><li>Home</li></Link>
            <Link to="/rooms" className='custom-link'><li>Rooms</li></Link>
            <Link to="/examseating" className='custom-link'><li>Allotment</li></Link>
            <Link to="/printallotments" className='custom-link'><li>Print Allotment</li></Link>
            <Link to="/register" className='custom-link'><li>Create New Admin</li></Link>
            <Link to="/logout" className='custom-link'><li>Logout</li></Link>
        </ul>
    </div>)}
    else{
        return (<div className="homeNavBar">
            <img src={logo} alt="jntua-img" className='navLogo'/>
            <ul type="none" className='navElements'>
                <Link to="/" className='custom-link'><li>Home</li></Link>
                <Link to="/login" className='custom-link'><li>Login</li></Link>
            </ul>
        </div>)}}
}
export default Header