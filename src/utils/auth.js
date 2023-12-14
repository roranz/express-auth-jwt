import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_KEY;

export function authenticate(req, res, next) {
	const accessToken = req.headers ? req.headers['authorization'] : null;
	const refreshToken = req.cookies ? req.cookies['refreshToken'] : null;

	if (!accessToken) {
		return res.status(401).send('Access Denied. No token provided.');
	}

	try {
		const decoded = jwt.verify(accessToken, secretKey);
		req.id = decoded.id;
		next();
	} catch (error) {
		if (!refreshToken) {
			return res.status(401).send('Access Denied. No refresh token provided.');
		}

		try {
			const decoded = jwt.verify(refreshToken, secretKey);
			const accessToken = jwt.sign({ user: decoded.user }, secretKey, { expiresIn: '1h' });

			res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' }).header('Authorization', accessToken).send(decoded.user);
		} catch (error) {
			return res.status(400).send('Invalid Token.');
		}
	}
}

export function token(userId, expiresIn) {
	return jwt.sign({ userId }, secretKey, { expiresIn: expiresIn });
}

export function verify(refreshToken) {
	return jwt.verify(refreshToken, secretKey);
}
