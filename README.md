Carpooling Platform 
1. Introduction
Problem Statement 
Daily commuting is a significant challenge for employees, often 
leading to increased transportation costs, traffic congestion, fuel 
consumption, and environmental impact. Many employees travel along 
similar routes and schedules but lack an efficient way to coordinate 
shared transportation. 
The objective of this hackathon is to develop an Enterprise 
Carpooling Platform that enables employees from registered 
organizations to discover and share rides. The platform should provide 
a seamless experience for finding rides, offering rides, managing trips, 
tracking journeys in real time, and handling payments while promoting 
cost-effective and sustainable commuting. 
2. Solution Overview
The platform provides a complete ecosystem for ride sharing between 
employees. 
Employees can use the application in two ways: 
Find a Ride 
Search for available rides by providing travel details such as pickup 
location, destination, date, and time. The system recommends 
matching rides that can be booked instantly. 
Offer a Ride 
Employees travelling in their own vehicles can publish rides by 
specifying their travel route, available seats, and fare. 
Apart from ride matching, the platform also includes: 
● Vehicle Management 
● Trip Management 
● Live Trip Tracking 
● Wallet & Payments 
● Ride History 
● Reports & Analytics 
● Company Administration 
3. User Roles
Company Administrator 
The Company Administrator is responsible for managing 
organization-wide carpooling information and ensuring employee and 
vehicle records remain accurate. 
Responsibilities 
● Manage employee records. 
● Manage registered vehicles and driver information. 
● Configure organization-specific carpooling settings. 
● Maintain fuel cost, travel cost, and other operational 
configurations. 
● Monitor employee participation. 
● Provide employees access to the carpooling platform. 
Note: The administrator is responsible for platform 
configuration only and is not involved in day-to-day ride 
operations. 
Employee 
Employees are the primary users of the platform. 
A single employee can offer a ride while driving or find a ride when 
travelling as a passenger. These are activities performed by the same 
user rather than separate user roles. 
Employees can: 
● Register and manage their profile. 
● Register and manage vehicles. 
● Search available rides. 
● Publish rides. 
● Book rides. 
● View and manage trips. 
● Track rides in real time. 
● Communicate with other participants. 
● Complete payments. 
● View ride history and reports. 
4. Application Workflow
The application follows the workflow below: 
1. User launches the application. 
2. User logs in or creates a new account. 
3. User chooses to either Find a Ride or Offer a Ride. 
4. The system displays the calculated route for confirmation. 
5. Depending on the selected option: 
○ Search and book an available ride. 
○ Publish a new ride. 
6. Booked rides appear under My Trips. 
7. During the journey, both participants can track the trip in real 
time and communicate through chat or call. 
8. After the trip is completed, payment is made. 
9. The completed ride is stored in Ride History and contributes to 
the reporting dashboard. 
5. Functional Modules
5.1 Authentication 
The application starts with a splash screen followed by employee 
authentication. 
Features 
● Employee Login 
● New User Registration 
● Profile Creation 
After successful authentication, users are redirected to the dashboard. 
Screens 
● Splash Screen 
● Login 
● Sign Up 
5.2 Find a Ride 
This module enables employees to search for rides that match their 
travel requirements. 
Required Information 
● Pickup Location 
● Destination 
● Travel Date 
● Travel Time 
● Number of Seats 
● Recurring Ride 
The application calculates and displays the route for confirmation 
before searching for matching rides. 
Each ride displays: 
● Driver Details 
● Route 
● Departure Time 
● Available Seats 
● Fare Per Seat 
Screens 
● Find Ride 
● Route Confirmation 
● Available Rides 
5.3 Offer a Ride 
Employees travelling in their own vehicles can publish rides. 
Before publishing a ride, users must register at least one vehicle. 
Required Information 
● Pickup Location 
● Destination 
● Travel Date & Time 
● Available Seats 
● Fare Per Seat 
Once the route is confirmed, the ride becomes available for booking. 
Screens 
● Offer Ride 
● Route Confirmation 
● My Vehicle 
5.4 Trip Management 
After booking, rides appear in My Trips. 
Trip Information 
● Driver Details 
● Passenger Details (Driver View) 
● Vehicle Information 
● Pickup & Drop Locations 
● Trip Schedule 
● Fare Details 
● Current Trip Status 
Trip Lifecycle 
● Ride Booked 
● Trip Started 
● Trip In Progress 
● Trip Completed 
● Payment Pending 
● Payment Completed 
Communication 
Passengers and drivers can communicate throughout the trip using: 
● Chat 
● Voice Call 
These features help coordinate pickup locations, delays, and other 
trip-related updates. 
5.5 Live Trip Tracking 
Live Trip Tracking is a mandatory feature of the application. 
Once the driver starts the trip, both participants can monitor the 
journey using an interactive map. 
Tracking Information 
● Live Vehicle Location 
● Current Route 
● Estimated Arrival Time (ETA) 
● Pickup Marker 
● Destination Marker 
● Current Trip Status 
Live tracking remains active until the trip is completed. 
5.6 Payments & Wallet 
Once a trip is completed, passengers can make payments using one 
of the supported methods. 
Payment Methods 
● Cash 
● Card 
● UPI 
● Wallet 
Wallet Features 
● View Balance 
● Recharge Wallet 
● Pay Using Wallet Balance 
Screens 
● Payment 
● Wallet 
5.7 Ride History 
Ride History maintains a record of all completed trips. 
Each entry contains: 
● Ride Participants 
● Route 
● Vehicle Information 
● Date & Time 
● Trip Status 
5.8 Vehicle Management 
Drivers can register and manage multiple vehicles. 
Vehicle Information 
● Vehicle Model 
● Registration Number 
● Seating Capacity 
Only registered vehicles can be selected while publishing rides. 
5.9 Reports & Analytics 
The reporting dashboard provides insights into travel activity and 
transportation costs. 
Reports 
● Total Trips 
● Total Distance Travelled 
● Fuel Consumption 
● Cost Per Kilometer 
● Vehicle-wise Cost Analysis 
● Fuel Efficiency Trends 
5.10 Settings 
The Settings module provides quick access to commonly used 
features. 
Available Options 
● My Trips 
● My Vehicle 
● Payment Methods 
● Ride History 
● Saved Places 
● Help & Support 
● Chat 
Saved Places 
Users can save frequently used pickup and destination locations, such 
as Home, Office, or other preferred locations, making future ride 
searches and ride publishing faster. 
6. Functional Requirements
The solution should implement the following capabilities. 
User Management 
● Employee Registration 
● Employee Login 
● Profile Management 
● Company Administration 
Ride Management 
● Search Ride 
● Publish Ride 
● Route Confirmation 
● Ride Matching 
● Ride Booking 
● Trip Management 
● Live Trip Tracking 
Vehicle Management 
● Register Vehicle 
● Update Vehicle Information 
● Manage Seat Availability 
Payment Management 
● Cash Payment 
● Card Payment 
● UPI Payment 
● Wallet Payment 
Wallet Management 
● Recharge Wallet 
● View Wallet Balance 
● Wallet-based Ride Payments 
Reports & Analytics 
● Ride History 
● Travel Reports 
● Cost Analysis 
● Fuel Consumption Reports 
7. Assumptions
The following assumptions apply to the hackathon implementation: 
● The platform supports multiple organizations, each with its own 
registered users and administrator. 
● Only authenticated users belonging to a registered organization 
can access the platform. 
● Every ride has one driver and one or more passengers based on 
the available seating capacity. 
● Drivers must register at least one vehicle before publishing a 
ride. 
● Route generation and live trip tracking will use a mapping service 
(Google Maps, OpenStreetMap, or equivalent). 
● Live location sharing is enabled only while a trip is active. 
● Payments should be implemented using Razorpay Test Mode or 
an equivalent sandbox environment. Real money transactions are 
not required for the hackathon. 
● Reports are generated from trip, vehicle, and travel data 
collected by the application. 
8. Evaluation Expectations
Participants are free to choose any technology stack. 
The solution should demonstrate the complete end-to-end business 
workflow described in this document. 
Mandatory Features 
● Authentication 
● Ride Discovery 
● Ride Publishing 
● Route Confirmation 
● Ride Booking 
● Trip Management 
● Live Trip Tracking 
● Vehicle Management 
● Payments & Wallet 
● Ride History 
● Reports Dashboard 
Bonus Features 
Participants are encouraged to implement additional capabilities such 
as: 
● Ride Notifications 
● Ride Cancellation 
● Intelligent Ride Matching 
● Route Optimization 
● Enhanced Analytics 
● Real-time Push Notifications 
What Participants Will Learn 
● Design and develop a real-world enterprise application. 
● Build intuitive UI/UX and end-to-end business workflows. 
● Implement secure authentication and role-based access control. 
● Integrate third-party services like Maps and payment gateways. 
● Develop real-time features, dashboards, and analytical reports. 
● Design scalable system architecture and business logic. 
● Gain hands-on experience in full-stack application development. 
● Strengthen problem-solving, collaboration, and software 
engineering practices.