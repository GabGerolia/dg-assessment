# Use an official Node.js runtime as the base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Expose the backend port
EXPOSE 8080

# Start the backend server
CMD ["node", "server.js"]
