This repository contains the code for a comprehensive social media platform replicating Twitter's core features. The project aims to provide a fully functional Twitter-like application, including secure user authentication, RESTful APIs for tweet management and social interactions, and integration with AWS services for media storage and email notifications.
Key Features

User authentication and authorization
Ability to create, read, update, and delete tweets
Media uploads (images, videos)
Bookmarking tweets
Follow system to connect with other users
Real-time chat 
Video streaming with HLS support

Technologies Used

Frontend: React.js, Tailwind CSS,typescript ....
Backend: Node.js, Express.js,typescript,..
Database: MongoDB
Authentication: jwtm Auth0
Media Storage: AWS S3
Email Notifications: AWS SES
Video Streaming: HLS

Getting Started
To get the project up and running, follow these steps:

Clone the repository:

Copygit clone https://github.com/your-username/twitter-clone.git

Install dependencies:

# twitter-clone
yarn install

Set up environment variables:

Create a .env file in the root directory
Add the necessary environment variables for your project, such as database connection, AWS credentials, and API keys.


Start the development servers:

# Start the client
cd client
yarn dev

# Start the server
cd server
yarn dev

The client will be available at http://localhost:3002, and the server will be running at http://localhost:5000.

Project Structure
The project is organized into the following directories:

client: Contains the frontend code built with React.js and Next.js.
server: Contains the backend code built with Node.js and Express.js.
shared: Contains any shared code or libraries used by both the client and server.

Deployment
The project is designed to be easily deployed to various cloud platforms, such as AWS, Heroku, or DigitalOcean. Detailed deployment instructions will be provided in the future.
Contributing
Contributions to this project are welcome. If you find any issues or have ideas for improvements, please feel free to open an issue or submit a pull request.
License
This project is licensed under the MIT License.
