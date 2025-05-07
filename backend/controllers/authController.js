import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// ✅ User Registration
export const register = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with required fields
    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        hashedPassword,
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, fullName: user.fullName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ User Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
