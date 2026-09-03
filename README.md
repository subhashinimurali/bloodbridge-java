Blood Link Connect (BloodBridge)
College Blood Donor Management and Tracking System
A full-stack web application engineered for educational institutions to streamline voluntary blood donations, track campus donor availability in real time, and coordinate emergency blood requests between students, faculty, and administrators.

Project Overview
On college campuses, emergency blood procurement is often fragmented across social media and group chats, leading to critical communication delays. Blood Link Connect centralizes donor records and urgent transfusion requests into a single, role-secured platform. It automates donor eligibility tracking (monitoring donation intervals and health criteria), enables students to log urgent blood requests, and provides administrators with analytical dashboards to monitor blood group availability across academic departments.

Core Features
Dual-Role Authentication & Security

Role-Based Access Control (RBAC): Distinct permission boundaries for Students and Admins.

Secure Authentication: Standard admin credentials and Student Register Number authentication using BCrypt password hashing.

Profile Management: Self-service profile updates for contact details, weight, medical conditions, and current donation willingness.

Admin Operations & Analytics

Interactive Dashboard: Live summary cards displaying total registered donors, active willing donors, available blood groups, and recent activity.

Data Visualizations: Visual analytics including Donors by Blood Group (Pie Chart), Willingness Ratio (Doughnut Chart), and Monthly Donation/Registration Trends (Line/Bar Charts).

Donor Management: Paginated donor directory with multi-parameter filtering (blood group, department, academic year, and willingness status).

Manual Donor Entry: Interface for administrators to record walk-in or offline donors directly.

Reporting Engine: Structured export utility to generate PDF, Excel, and CSV reports categorized by department, year, gender, and blood type.

Broadcast Notifications: System-wide notification dispatch for campus blood donation camps, urgent shortages, and eligibility reminders.

Student Portal

Eligibility Status Engine: Automatic calculation of donation eligibility based on health criteria and the last recorded donation date.

Emergency Blood Requests: Direct request logging specifying patient details, required blood units, hospital location, required date, and urgency level.

Donation History: Personal log of past donation records, camp participation, and active blood requests.

Camp Alerts & Notifications: In-app alert feed for campus drives and urgent matching requests.

System Architecture & Tech Stack
Layer	Technologies Used
Backend	Java 21, Spring Boot, Spring MVC, Spring Data JPA, Hibernate, Maven
Security	Spring Security 6, BCrypt Password Encryption, Session Management
Database	MySQL (Relational Schema with 8 core entities: admins, students, donors, blood_requests, notifications, donations, reports, settings)
Frontend	HTML5, CSS3 (Glassmorphism & Medical Theme), Bootstrap 5, Thymeleaf Templates, JavaScript (ES6+), AJAX
Visuals & Tables	Chart.js, DataTables, Bootstrap Icons
Database Entity Model
admins: Stores administrative credentials and profile configurations.

students: Student academic identifiers (Register No., Department, Year) and login data.

donors: Extended health parameters (blood group, weight, last donation date, willingness flag).

blood_requests: Emergency ticket tracking from request submission to fulfillment (PENDING, APPROVED, REJECTED, COMPLETED).

donations: Historical audit log of successful donations.

notifications: Targeted and broadcast campus announcements.

reports & settings: System audit logs, theme preferences, and scheduled backup records.
