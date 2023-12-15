import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import express from 'express';
import { login, logout, refresh } from './controller/auth.js';
import { createUser, deleteUser, getAllUsers, getUserByEmail, getUserById, updateUser } from './controller/users.js';
import { authenticate } from './utils/auth.js';
import { getErrorMessage } from './utils/error.js';

export const prisma = new PrismaClient();
export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((_req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.get('/protected', authenticate, (req, res) => {
	res.send('Welcome to the protected route');
});

// test api
app.get('/test', authenticate, (req, res) => {
	try {
		res.status(200).json({ message: 'API is working!' + req.body.name });
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
});

// get all users
app.get('/users', authenticate, getAllUsers);

// get user by id
app.get('/users/:id', authenticate, getUserById);

// get user by email
app.get('/users/:id', authenticate, getUserByEmail);

// create user
app.post('/users', createUser);

// update user
app.put('/users/:id', authenticate, updateUser);

// delete user
app.delete('/users/:id', authenticate, deleteUser);

// login route
app.post('/auth/login', login);

// login route
app.post('/auth/logout', logout);

// refresh route
app.post('/auth/refresh', refresh);
// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
