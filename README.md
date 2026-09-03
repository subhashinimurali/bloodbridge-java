# Blood Link Connect

Build a complete full-stack Blood Donor Management and Tracking System for a college using Java technologies only.

IMPORTANT REQUIREMENTS:

- Do NOT use PHP.

- Do NOT use Laravel.

- Use Java throughout the backend.

- The project should be professional, modern, responsive, and suitable for a final year engineering project.

Technology Stack:

Backend:

- Java 21

- Spring Boot

- Spring MVC

- Spring Security

- Spring Data JPA

- Hibernate

- Maven

Frontend:

- HTML5

- CSS3

- Bootstrap 5

- JavaScript

- Thymeleaf Templates

Database:

- MySQL

Development Tools:

- IntelliJ IDEA or Eclipse

- MySQL Workbench

Authentication:

Implement role-based authentication.

Roles:

1. Admin

2. Student

Default Admin Credentials:

Username: subiveda

Password: $ub!ved@

Store passwords securely using BCrypt hashing.

======================================================

LOGIN PAGE

======================================================

The home page should display two login options:

Login as Admin

Login as Student

There should also be a Student Registration (Sign Up) option.

Admin login uses username and password.

Student login uses:

- Register Number

- Password

Student Sign Up should collect:

Student Name

Register Number

Department

Year

Gender

Phone Number

Email

Blood Group

Date of Birth

Weight

Last Blood Donation Date

Medical Conditions

Address

Password

Confirm Password

Students should be able to edit their profile after login.

======================================================

ADMIN DASHBOARD

======================================================

Create a professional admin dashboard with a collapsible sidebar.

Sidebar Menu:

Dashboard

Donors

Add Donor

Requests

Reports

Notifications

Settings

Logout

Dashboard should contain cards at the top showing:

Total Donors

Students Willing to Donate

Blood Groups Available

Recent Donations

Below the cards display:

Pie Chart:

Donors by Blood Group

Doughnut Chart:

Students Willing vs Not Willing

Bar Chart:

Monthly Registrations

Line Chart:

Monthly Blood Donations

Recent Registrations Table

Columns:

Student Name

Register Number

Blood Group

Department

Registration Date

Status

======================================================

DONORS MODULE

======================================================

Display all registered donors.

Include:

Search

Filter by Blood Group

Filter by Department

Filter by Year

Filter by Willing Status

Sort

Pagination

Each donor card/table should display:

Photo

Student Name

Blood Group

Department

Phone

Email

Last Donation

Willing Status

Actions:

View

Edit

Delete

======================================================

ADD DONOR MODULE

======================================================

Admin can manually add donor.

Fields:

Name

Register Number

Department

Year

Gender

Blood Group

Phone

Email

DOB

Weight

Address

Medical Conditions

Last Donation Date

Currently Willing to Donate (Yes/No)

Save data into MySQL.

======================================================

REQUESTS MODULE

======================================================

Students can request blood.

Form fields:

Patient Name

Hospital

Blood Group Needed

Units Required

Reason

Required Date

Contact Number

Urgency

Request Status

Admin can:

Approve

Reject

Mark Completed

Search requests

Filter requests

======================================================

REPORTS MODULE

======================================================

Generate reports:

Total Donors

Active Donors

Blood Group Wise Report

Monthly Registrations

Monthly Donations

Department Wise Donors

Year Wise Donors

Gender Wise Report

Export reports to:

PDF

Excel

CSV

Include charts in reports.

======================================================

NOTIFICATIONS MODULE

======================================================

Admin can send notifications to students.

Examples:

Blood donation camp

Urgent blood requirement

Reminder to eligible donors

Birthday wishes

Notifications appear on student dashboard.

======================================================

SETTINGS MODULE

======================================================

Admin can:

Change password

Update profile

Change dashboard theme

Backup database

Restore database

Manage system information

======================================================

STUDENT DASHBOARD

======================================================

Student sidebar:

Dashboard

My Profile

Update Profile

Blood Requests

Donation History

Notifications

Settings

Logout

Dashboard shows:

Profile Completion

Blood Group

Last Donation Date

Eligibility Status

Upcoming Blood Camps

Latest Notifications

Donation History

======================================================

DATABASE TABLES

======================================================

Create proper MySQL schema.

Tables:

admins

students

donors

blood_requests

notifications

donations

reports

settings

======================================================

SPRING BOOT FEATURES

======================================================

Use:

MVC Architecture

DTO

Entity

Repository

Service

Controller

Exception Handling

Validation

BCrypt Password Encryption

Spring Security

Role Based Authorization

Session Management

Proper Package Structure

======================================================

UI REQUIREMENTS

======================================================

Professional medical theme.

Use:

Red

White

Dark Gray

Bootstrap Icons

Responsive Sidebar

Animated Cards

Hover Effects

Chart.js

DataTables

Responsive Tables

Professional Login Page

Glassmorphism effects

Rounded Cards

Smooth animations

======================================================

EXTRA FEATURES

======================================================

Dashboard should auto-update statistics.

Search should work instantly.

Use AJAX where appropriate.

Display success/error alerts.

Validate all forms.

Prevent duplicate Register Numbers.

Display profile picture.

Use pagination.

Implement forgot password functionality.

Add dark mode.

Generate clean code with comments.

======================================================

PROJECT OUTPUT

======================================================

Generate the complete Spring Boot project including:

Folder Structure

pom.xml

application.properties

MySQL database script

All Java classes

Entities

Repositories

Services

Controllers

Security Configuration

HTML pages

CSS

JavaScript

Bootstrap integration

Chart.js integration

Thymeleaf templates

Validation

README explaining how to run the project

The application should run directly after importing into IntelliJ or Eclipse, configuring MySQL, and running the Spring Boot application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bloodbridge-java.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a6ce4dbf-652b-4ab1-8404-f6017c2fba97).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
