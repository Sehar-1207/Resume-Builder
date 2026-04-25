import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png";


const Navbar = () => {
    const user = {name:'Suman'}

    const navigate= useNavigate();
    const logoutUser =()=>{
        navigate('/');
    }
  return (
    <div className='shadow bg-white'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
        <Link to ='/'>
        <div className='flex items-center '>

         <span className="text-2xl font-bold text-slate-900">Resume</span>
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-3"
                                    />
                                    </div>
        </Link>
        <div className='flex items-center gap-4 texxt-sm'>
            <p className='max:sm:hidden'>
                Hi, {user?.name}
            </p>
            <button onClick={logoutUser} className='bg-white hover:bg-slate-50 border border-gray-300 px-7 py-1.5 rounded-full active:scale-95 transition-all'>Logout</button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
