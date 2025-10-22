import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../db.js";
import { superAdminSecurityCheck } from "../middleware/superAdminSecurity.js";

const router = Router();

// Apply security checks to all super admin auth routes
router.use(superAdminSecurityCheck);

// Super Admin Login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: "Username and password are required" 
      });
    }

    // Get super admin
    const { data: superAdmin, error } = await supabase
      .from("super_admins")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (error || !superAdmin) {
      return res.status(401).json({ 
        error: "Invalid credentials or account disabled" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, superAdmin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        superAdminId: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        role: 'super_admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' } // Shorter session for security
    );

    res.json({
      token,
      superAdmin: {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
        fullName: superAdmin.full_name
      }
    });

  } catch (err) {
    next(err);
  }
});

// Verify Super Admin Token (middleware)
export const authenticateSuperAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Super admin access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Ensure this is a super admin token
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    req.superAdmin = decoded;
    next();
  });
};

// Get current super admin info
router.get("/me", authenticateSuperAdmin, async (req, res, next) => {
  try {
    const { data: superAdmin, error } = await supabase
      .from("super_admins")
      .select("id, username, email, full_name, created_at")
      .eq("id", req.superAdmin.superAdminId)
      .eq("is_active", true)
      .single();

    if (error || !superAdmin) {
      return res.status(404).json({ error: "Super admin not found" });
    }

    res.json(superAdmin);

  } catch (err) {
    next(err);
  }
});

// Change super admin password
router.post("/change-password", authenticateSuperAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: "New password must be at least 8 characters long" 
      });
    }

    // Get current super admin
    const { data: superAdmin, error } = await supabase
      .from("super_admins")
      .select("password_hash")
      .eq("id", req.superAdmin.superAdminId)
      .single();

    if (error || !superAdmin) {
      return res.status(404).json({ error: "Super admin not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, superAdmin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error: updateError } = await supabase
      .from("super_admins")
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq("id", req.superAdmin.superAdminId);

    if (updateError) throw updateError;

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    next(err);
  }
});

export default router;