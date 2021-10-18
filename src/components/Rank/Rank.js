import React from "react"
import "./Rank.css"

const Rank = ({ name, entries }) => {
  return (
    <div className="center-rank">
      <div className="white f2">{`${name}, your current entry count is ..`}</div>
      <div className="white f1">{entries}</div>
    </div>
  )
}

export default Rank
