# Fliqpay Test RESTful API with Node.js, Express, MongoDB/Mongoose and Typescript

A simple API that simulates a customer support ticket system.

The following assumptions have been made on the business logic.

- There are customers and users
- Users are basically system admins and support agents, and each has access levels, and based on that are restricted to performing certain tasks.
- Users are required to be authenticated to perform tasks that require authentication.
- Customers are not authenticated, but emails are unique and as a result, tasks performed by them require email validation to confirm customer status.

Endpoints exposed to customers include:

- Create support requests (tickets)
- View status of previous requests (tickets)
- Comment on a support request (only when an agent|admin has commented on that ticket)
- View a ticket with comments

Endpoints exposed to Users (Admin|Agent) include:

- Login for authentication purpose and to generate access token
- View current logged in profile based on token
- View all Users (Admin only)
- Create User (Admin only)
- Create Customer (Admin only)
- View all Requests (Tickets) on system
- Get a particular support request (Ticket)
- Generate report on tickets closed within the last one month
- Close Ticket
- Add comments on a Ticket
- View all comments on the system

## Requirements

[NodeJS](https://nodejs.org/en/)

Install global TypeScript and TypeScript Node

```
npm install -g typescript ts-node
```

## Getting Started

Install [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) on your local machine, and manage collections via MongoDB Compass GUI.

After that go into the project directory and find _.env file._ Replace the _MONGO_PORT_, _MONGO_URL_, and other environment variables inside the file to enable the app to run well.

## Clone this repository

```
git clone git@github.com:phalconVee/fliqpay.git .
```

Then install the dependencies

```
npm install
```

## Start the server

Run in development mode

```
npm run dev
```

Run in production mode

```
npm run prod
```

Note that after starting the server and ensuring mongod is up and running, the database and it’s collections are automatically created based on the schemas defined inside the _src/model_ directory when you start calling the endpoints. So there’s no special script to create the database and collections.

## Consideration for Testing

The default URL is: _http://localhost:4000_

Also, the postman collection is available publicly via [POSTMAN](https://documenter.getpostman.com/view/3832128/T1Dqfwmt?version=latest#intro)

The project has been setup to use Jest for unit testing and supertest for integration testing (not so familiar with cypress), and MongoDB-memory-server that allows us to start a mongod process that stores data in memory.

The MongoDB-in Memory Server was used to simulate how to test dummy data will be saved into your real database. Basically providing a layer to store data in memory only during tests.

Exported collection data can be found inside the _seed_ directory in the root folder.

## Things I didn’t do

Mostly because of time constraint and other factors, I would have loved to;

- Implement a helper module/middleware to handle generic responses.
- Enforced transactions on every database insert/update operations.
