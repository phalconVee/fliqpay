# Fliqpay Payment Service

A lightweight payment and reconciliation service.

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

