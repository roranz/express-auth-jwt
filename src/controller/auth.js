import bcrypt from 'bcrypt';
import { prisma } from '../index.js';

import ms from 'ms';
import { token, verify } from '../utils/auth.js';

const refreshTokenDuration = process.env.REFRESH_TOKEN_DURATION;
const accessTokenDuration = process.env.ACCESS_TOKEN_DURATION;
const saltRounds = process.env.BCRYPT_SALT_ROUNDS;

export async function login(req, res) {
	const email = req.body.email;
	const password = req.body.password;
	const accessToken = req.headers ? req.headers['authorization'] : null;
	if (!email || !password) {
		return res.status(400).send('Missing Email or Password');
	}
	if (accessToken) {
		try {
			const decoded = await verify(accessToken);
			const userId = decoded.userId;
			const userToVerify = await prisma.user.findUnique({ where: { email: email } });
			if (userId == userToVerify.id) {
				console.log('User already logged in with a valid Token!', userToVerify.id);
				return res.status(200).send('');
			}
		} catch {
			console.error('Db error!');
		}
	}

	const user = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (!user) {
		return res.status(401).send('Invalid Email or Password');
	}

	const correctPassword = await bcrypt.compare(password, user.password);

	if (!correctPassword) {
		return res.status(401).send('Invalid Email or Password');
	}

	const generatedToken = token(user.id, accessTokenDuration);
	const refreshToken = await createRefreshToken(user.id);
	console.log(refreshToken);
	res
		.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: ms('refreshTokenDuration'), path: '/auth' })
		.header('Authorization', generatedToken)
		.send({ id: user.id, name: user.name, email: user.email });
}

export async function refresh(req, res) {
	const refreshToken = req.cookies['refreshToken'];

	if (!refreshToken) {
		return res.status(401).send('Access Denied. No refresh token provided.');
	}

	try {
		const decoded = verify(refreshToken);

		const dbToken = await prisma.refreshToken.findUnique({
			where: {
				token: refreshToken,
			},
		});

		if (dbToken) {
			await prisma.refreshToken.deleteMany({
				where: {
					id: dbToken.id,
				},
			});
			console.log('Refresh token deleted!');
		} else {
			return res.status(400).send('Invalid refresh token.');
		}

		let newRefreshToken;
		try {
			newRefreshToken = await createRefreshToken(decoded.userId);
			console.log('Refresh token generated and pushed on db!');
		} catch {
			return res.status(500);
		}
		const accessToken = token(decoded.userId, accessTokenDuration);
		res
			.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict', maxAge: ms('refreshTokenDuration'), path: '/auth' })
			.header('Authorization', accessToken)
			.send(decoded.user);
	} catch (error) {
		return res.status(400).send('Invalid refresh token.');
	}
}

export async function logout(req, res) {
	const refreshToken = req.cookies['refreshToken'];

	if (!refreshToken) {
		return res.status(401).send('Access Denied. No refresh token provided.');
	}

	try {
		await verify(refreshToken);

		const dbToken = await prisma.refreshToken.findUnique({
			where: {
				token: refreshToken,
			},
		});

		if (dbToken) {
			await prisma.refreshToken.deleteMany({
				where: {
					id: dbToken.id,
				},
			});
			console.log('Refresh token deleted!');
		} else {
			return res.status(400).send('Invalid refresh token.');
		}

		return res.clearCookie('refreshToken').send('Logout successful!').end();
	} catch (error) {
		return res.status(400).send('Invalid refresh token.');
	}
}

async function createRefreshToken(userId) {
	const rftoken = token(userId, refreshTokenDuration);
	const encryptedToken = await bcrypt.hash(rftoken, Number(saltRounds));
	const validUntil = new Date(new Date().getTime() + ms(refreshTokenDuration));

	await prisma.refreshToken.create({
		data: {
			token: encryptedToken,
			userId: userId,
			isValid: true,
			createdAt: new Date(),
			validUntil: validUntil,
		},
	});
	return rftoken;
}
