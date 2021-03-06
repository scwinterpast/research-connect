import React, {Component} from 'react';
import axios from 'axios';
import './ApplicationList.scss';
import ApplicationBox from './ApplicationBox/ApplicationBox';
import * as Utils from '../Utils.js'

class ApplicationList extends Component {
	constructor(props) {
		super(props);
		this.state = {data: [], role: ""};
	}

	componentDidMount() {
		axios.get('/api/applications?id=' + sessionStorage.getItem('token_id'))
			.then((response) => {
				this.setState({data: response.data});
			})
			.catch(function (error) {
				Utils.handleTokenError(error);
			});
	}

	coursesSatisfied(studentCourses, filterCourses) {
		studentCourses = studentCourses.map(course => course.split(' ').join('').toUpperCase());
		return filterCourses.every(course => studentCourses.includes(course));
	}

	skillsSatisfied(studentSkills, filterSkills) {
		studentSkills = studentSkills.map(skill => skill.toUpperCase());
		filterSkills = filterSkills.map(skill => skill.toUpperCase());
		return filterSkills.every(skill => studentSkills.includes(skill));
	}

	shouldShow(application) {
		const filter = this.props.filter;

		if (filter.opportunity.toLowerCase() !== 'all' && 
				filter.opportunity !== application.opportunity) return false;

		let froshSelected = filter.yearSelect.Freshman;
		let sophSelected = filter.yearSelect.Sophomore;
		let juniorSelected = filter.yearSelect.Junior;
		let seniorSelected = filter.yearSelect.Senior;
		let gradYear = application.gradYear;

		if ((froshSelected && Utils.gradYearToString(gradYear) === 'Freshman') ||
			(sophSelected && Utils.gradYearToString(gradYear) === 'Sophomore') ||
			(juniorSelected && Utils.gradYearToString(gradYear) === 'Junior') ||
			(seniorSelected && Utils.gradYearToString(gradYear) === 'Senior') ||
			(!froshSelected && !sophSelected && !juniorSelected && !seniorSelected)) {

			let csSelected = filter.majorSelect.cs;
			let bioSelected = filter.majorSelect.biology;
			let major = application.major;

			if ((csSelected && major === 'CS') ||
				(bioSelected && major === 'Biology') ||
				(!csSelected && !bioSelected)) {

				let minGPA = filter.gpaSelect.val;

				if (minGPA === undefined ||minGPA <= application.gpa) {
					return this.coursesSatisfied(application.courses, filter.courses) &&
						  	 this.skillsSatisfied(application.skills, filter.skills);
				}
			}
		}

		return false;
	}

	render() {
		const data = this.state.data;

		if (data.length === 0 || data === {} || Object.keys(data).length === 0) {
			return (
				<div>There are currently no applications.</div>
			);
		}

		let apps = [];
		let k = 0;

		Object.entries(data).forEach(oppAppPair => {
			oppAppPair[1].applications.forEach(app => {
				if (app.gpa == 5.0) app.gpa = "No GPA";
				if (app !== undefined) {
					apps.push(
						<ApplicationBox 
							key={ k++ } 
							data={ app } 
							opportunity={ oppAppPair[1].opportunity }
							show={ this.shouldShow(app) } />
					);
				}
			})
		});

		return (
			<div>{ apps }</div>
		);
	}
}

export default ApplicationList
