import React from 'react'
import styles from './Button.module.css'


const Button = (text:string) => {
  return (
    <button className={styles.buttonstyle}>{text}</button>
  )
}

export default Button