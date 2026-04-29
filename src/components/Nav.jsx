import { NavLink  } from "react-router-dom"
import "../index.css"

export default function Nav() {
  return (
    <div className="navigation-bar">
        <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/create">Create</NavLink></li>
        </ul>
    </div>
  );
}