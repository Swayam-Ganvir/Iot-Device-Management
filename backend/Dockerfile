# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's source code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# This is the default command, overridden by docker-compose for other services
CMD ["node", "server.js"]