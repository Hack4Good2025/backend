# Use the official Node.js image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Ensure bcrypt is built for the current environment
RUN npm rebuild bcrypt --update-binary

# Expose the port your app runs on
EXPOSE 3000

# Specify the command to run your app
CMD ["node", "server.js"]
