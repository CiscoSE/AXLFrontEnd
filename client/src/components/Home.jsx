import React, { Component } from "react";
import TeacherPortal from "../TeacherPortal";
import Guardian from "../GuardianPortal";
// // TODO - add proptypes

class Home extends Component {

    render() {

		console.log("THIS IS MY STATE", this.props);
		
        return (
			<div>
			{this.props.isTeacher > 0 ? (
				<TeacherPortal/>
			) : (
				<Guardian/>
			)}
			</div>
		)
	}

}




// const Home = props => {
// 	if (props.user) {
// 		return (
// 			<div className="Home">
// 				<p>Current User:</p>
// 				<code>
// 					{JSON.stringify(props)}
// 				</code>
// 			</div>
// 		)
// 	} else {
// 		return (
// 			<div className="Home">
// 				<p>Current User:</p>
// 				<code>
// 					{JSON.stringify(props)}
// 				</code>
// 			</div>
// 		)
// 	}
// }

export default Home;

