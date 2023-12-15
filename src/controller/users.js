import bcrypt from 'bcrypt';
import { prisma } from '../index.js';
import { getErrorMessage } from '../utils/error.js';

export async function getAllUsers(req, res) {
	try {
		let users = await prisma.user.findMany();
		let refreshTokens = await prisma.refreshToken.findMany();
		//users = users.map(user{return { id: user.id, name: user.name, email: user.email };});
		res.status(200).json(users, refreshTokens);
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
}

export async function getUserById(req, res) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.params.id,
			},
		});
		res.status(200).json({ id: user.id, name: user.name, email: user.email });
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
}

export async function getUserByEmail(req, res) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				email: req.params.email,
			},
		});
		res.status(200).json({ id: user.id, name: user.name, email: user.email });
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
}

export async function createUser(req, res) {
	const password = await bcrypt.hash(req.body.password, 10);
	try {
		const user = await prisma.user.create({
			data: {
				name: req.body.name,
				email: req.body.email,
				password: password,
			},
		});
		res.status(201).json({ id: user.id, name: user.name, email: user.email });
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
}

export async function updateUser(req, res) {
	const password = await bcrypt.hash(req.body.password, 10);
	try {
		const user = await prisma.user.update({
			where: {
				id: req.params.id,
			},
			data: {
				name: req.body.name,
				email: req.body.email,
				password: password,
			},
		});
		res.status(200).json({ id: user.id, name: user.name, email: user.email });
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
}

export async function deleteUser(req, res) {
	try {
		const user = await prisma.user.delete({
			where: {
				id: req.params.id,
			},
		});
		res.status(200).json({ id: user.id, name: user.name, email: user.email });
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
}
