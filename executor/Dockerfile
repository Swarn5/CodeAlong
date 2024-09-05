# Use a suitable base image with Node.js and necessary build tools
FROM node:14-alpine

# Install necessary packages and dependencies for compiling and running code
RUN apk update && \
    apk add --no-cache gcc g++ openjdk11 python3 python3-dev && \
    npm install -g nodemon

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the application port (if needed)
EXPOSE 5002

# Start the application with nodemon
CMD ["nodemon", "execute.js"]
