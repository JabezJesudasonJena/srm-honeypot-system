# Use a lightweight Node.js alpine image for a secure and minimal footprint
FROM node:22-alpine

# Security: Create a non-root user for running the application
RUN addgroup -g 1001 -S labyrinth && \
    adduser -S labyrinth -u 1001 -G labyrinth

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install application dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Security: Change ownership to non-root user
RUN chown -R labyrinth:labyrinth /usr/src/app

# Security: Run as non-root user
USER labyrinth

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
