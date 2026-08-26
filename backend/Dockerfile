# Use a lightweight Node.js alpine image for a secure and minimal footprint
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) first to leverage Docker cache
COPY package*.json ./

# Install application dependencies securely
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose port 5000 as defined by the application requirements
EXPOSE 5000

# Start the application as a non-root user (optional but recommended for security, here sticking to default node user if specified or just starting)
CMD ["node", "server.js"]
