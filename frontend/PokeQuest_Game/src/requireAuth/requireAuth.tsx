import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const requireAuth = (ComposedComponent:React.ComponentType<any>) => {
  return ()=>{
    const navigate = useNavigate()
    const {isAuthenticated} = useAuth()

    useEffect(()=>{
        if(!isAuthenticated){
            navigate('/')
        }
    },[isAuthenticated,navigate])
    if(!isAuthenticated){
        return null
    }

    return <ComposedComponent/>
    }
}

export default requireAuth