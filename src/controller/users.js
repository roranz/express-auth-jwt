import bcrypt from 'bcrypt';
import { prisma } from '../index.js';
import { getErrorMessage } from '../utils/error.js';

export const getAllUsers = async (req, res) => {
	try {
		let users = await prisma.user.findMany();
		//users = users.map(user => {return { id: user.id, name: user.name, email: user.email };});
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: getErrorMessage(error) });
	}
};

export const getUserById = async (req, res) => {
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
};

export const getUserByEmail = async (req, res) => {
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
};

export const createUser = async (req, res) => {
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
};

export const updateUser = async (req, res) => {
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
};

export const deleteUser = async (req, res) => {
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
};
