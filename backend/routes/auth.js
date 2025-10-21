import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../db.js";

const router = Router();

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Club Registration
router.post("/register-club", async (req, res, next) => {
  try {
    const { clubName, adminName } = req.body;

    if (!clubName || !adminName) {
      return res.status(400).json({ 
        error: "Club name and admin name are required" 
      });
    }

    // Check if club already exists
    const { data: existingClub } = await supabase
      .from("clubs")
      .select("id")
      .eq("name", clubName)
      .single();

    if (existingClub) {
      return res.status(409).json({ 
        error: "Club name already exists" 
      });
    }

    // Generate username and password
    const username = adminName.toLowerCase().replace(/\s+/g, '.');
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if username already exists
    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("username", username)
      .single();

    if (existingAdmin) {
      return res.status(409).json({ 
        error: "Admin username already exists. Please use a different admin name." 
      });
    }

    // Create club
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .insert({ 
        id: uuidv4(),
        name: clubName 
      })
      .select()
      .single();

    if (clubError) throw clubError;

    // Create admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .insert({
        id: uuidv4(),
        club_id: club.id,
        username,
        admin_name: adminName,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (adminError) throw adminError;

    res.status(201).json({
      message: "Club registered successfully",
      clubId: club.id,
      clubName: club.name,
      username,
      password, // Send password only once during registration
      adminName
    });

  } catch (err) {
    next(err);
  }
});

// Admin Login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: "Username and password are required" 
      });
    }

    // Get admin with club info
    const { data: admin, error } = await supabase
      .from("admins")
      .select(`
        id,
        username,
        admin_name,
        password_hash,
        club_id,
        clubs (
          id,
          name
        )
      `)
      .eq("username", username)
      .single();

    if (error || !admin) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Invalid username or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id,
        clubId: admin.club_id,
        username: admin.username,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        adminName: admin.admin_name,
        clubId: admin.club_id,
        clubName: admin.clubs.name
      }
    });

  } catch (err) {
    next(err);
  }
});

// Verify Token (middleware for protected routes)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  });
};

// Reset admin password (for club admins who forgot their password)
router.post("/reset-password", async (req, res, next) => {
  try {
    const { clubName, adminName } = req.body;

    if (!clubName || !adminName) {
      return res.status(400).json({ 
        error: "Club name and admin name are required" 
      });
    }

    // Find the admin by club name and admin name
    const { data: admin, error } = await supabase
      .from("admins")
      .select(`
        id,
        username,
        admin_name,
        clubs (
          name
        )
      `)
      .eq("admin_name", adminName)
      .single();

    if (error || !admin || admin.clubs.name !== clubName) {
      return res.status(404).json({ 
        error: "Club or admin not found. Please check the club name and admin name." 
      });
    }

    // Generate new password
    const newPassword = generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("admins")
      .update({ password_hash: passwordHash })
      .eq("id", admin.id);

    if (updateError) throw updateError;

    res.json({
      message: "Password reset successfully",
      username: admin.username,
      newPassword,
      adminName: admin.admin_name,
      clubName
    });

  } catch (err) {
    next(err);
  }
});

// Get current admin info
router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const { data: admin, error } = await supabase
      .from("admins")
      .select(`
        id,
        username,
        admin_name,
        club_id,
        clubs (
          id,
          name
        )
      `)
      .eq("id", req.user.adminId)
      .single();

    if (error || !admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      id: admin.id,
      username: admin.username,
      adminName: admin.admin_name,
      clubId: admin.club_id,
      clubName: admin.clubs.name
    });

  } catch (err) {
    next(err);
  }
});

export default router;