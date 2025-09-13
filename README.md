IoT Telemetry Platform – Interview Submission
________________________________________
A Note to the Reviewer
Thank you for taking the time to review my submission.
This project is fully containerized using Docker and Docker Compose to ensure a simple and reliable setup. The recommended way to run the application is with a single command, which will launch the entire stack—including the backend, frontend, database, MQTT broker, and the device simulator.
The core real-time functionality is implemented using Socket.IO, allowing the backend to push live updates directly to the frontend as soon as new data is received from the MQTT broker.
👉 Telemetry data is updated every 5 seconds, ensuring the dashboard reflects the latest device readings continuously.
________________________________________
Features Implemented
•	Real-time Dashboard: The main device list and the detailed modal view both update in real-time without needing a page refresh.
•	Correct Little-Endian Decoding: The backend correctly decodes the little-endian float values for temperature, humidity, and PM2.5.
•	Secure Authentication: API endpoints are secured using a JWT-based authentication strategy.
•	Robust API: A RESTful API provides endpoints for fetching device lists (with latest data) and historical readings.
•	Full Dockerization: The entire application stack is containerized for easy setup and consistent deployment.
•	Device Simulation: A simulator script runs automatically to publish telemetry data every 5 seconds, allowing for immediate testing and visualization.
________________________________________
Technology Stack
•	Backend: Node.js, Express.js, MongoDB, Mongoose, Socket.IO, MQTT.js, JWT
•	Frontend: Next.js, React, Tailwind CSS, Recharts
•	Environment: Docker, Docker Compose
________________________________________
Instructions to Run the Project
Prerequisites
•	Docker Desktop
________________________________________
Step 1: Unzip the Project Folder
Unzip the iot-project.zip file you received. This will create the project directory.
________________________________________
Step 2: Navigate to the Project Directory
Open your terminal or command prompt and navigate into the root of the unzipped project folder:
cd path/to/the/unzipped-project-folder
________________________________________
Step 3: Seed the Database
Before logging in, you need to seed the database with initial user data. Run the following command from the backend folder:
cd backend
node seed.js
This will create the default admin user required for login.
________________________________________
Step 4: Launch the Application with Docker
Go back to the root project folder and run the following command:
docker-compose up --build
This command will build the necessary Docker images and start all services.
Please allow a few moments for initialization—the device simulator will start automatically and begin sending telemetry data every 5 seconds.
________________________________________
Login Credentials
The first page is the login screen. Use the following credentials to log in:
•	Email: admin@example.com
•	Password: password123
________________________________________
Access the Application
•	Frontend Dashboard: http://localhost:3000


