import dotenv from 'dotenv';

dotenv.config();

/**
 * Super Admin Security Middleware
 * Implements multiple layers of security for super admin access
 */

// Get client IP address (handles proxies like Vercel/Render)
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
};

// Check if IP is in whitelist
const isIPAllowed = (clientIP) => {
  const allowedIPs = process.env.SUPER_ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    const devIPs = ['127.0.0.1', '::1', 'localhost'];
    return devIPs.some(ip => clientIP.includes(ip)) || checkIPInList(clientIP, allowedIPs);
  }
  
  return checkIPInList(clientIP, allowedIPs);
};

// Helper function to check IP against list (supports CIDR and wildcards)
const checkIPInList = (clientIP, allowedIPs) => {
  for (const allowedIP of allowedIPs) {
    // Allow wildcard
    if (allowedIP === '*') {
      return true;
    }
    
    // Exact match
    if (allowedIP === clientIP) {
      return true;
    }
    
    // CIDR notation (e.g., 27.4.0.0/16)
    if (allowedIP.includes('/')) {
      if (isIPInCIDR(clientIP, allowedIP)) {
        return true;
      }
    }
    
    // Simple pattern matching (e.g., 27.4.*)
    if (allowedIP.includes('*')) {
      const pattern = allowedIP.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(clientIP)) {
        return true;
      }
    }
  }
  
  return false;
};

// Helper function to check if IP is in CIDR range
const isIPInCIDR = (ip, cidr) => {
  try {
    const [network, prefixLength] = cidr.split('/');
    const networkParts = network.split('.').map(Number);
    const ipParts = ip.split('.').map(Number);
    
    if (networkParts.length !== 4 || ipParts.length !== 4) {
      return false;
    }
    
    const prefix = parseInt(prefixLength, 10);
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    
    const networkInt = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];
    const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    
    return (networkInt & mask) === (ipInt & mask);
  } catch (error) {
    console.error('CIDR validation error:', error);
    return false;
  }
};

// Check if domain is whitelisted
const isDomainAllowed = (req) => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedDomains = process.env.SUPER_ADMIN_DOMAIN_WHITELIST?.split(',').map(d => d.trim()) || [];
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  if (!origin) return false;
  
  return allowedDomains.some(domain => origin.includes(domain));
};

// Main security middleware
export const superAdminSecurityCheck = (req, res, next) => {
  try {
    // 1. Check if super admin is enabled
    if (process.env.SUPER_ADMIN_ENABLED !== 'true') {
      return res.status(404).json({ error: 'Not found' });
    }

    // 2. Check secret access key (if provided)
    const secretKey = req.headers['x-super-admin-key'] || req.query.key;
    const expectedKey = process.env.SUPER_ADMIN_SECRET_KEY;
    
    if (expectedKey && secretKey !== expectedKey) {
      console.log(`🚫 Super Admin Access Denied: Invalid secret key from ${getClientIP(req)}`);
      return res.status(404).json({ error: 'Not found' });
    }

    // 3. Check IP whitelist (only in production)
    if (process.env.NODE_ENV === 'production') {
      const clientIP = getClientIP(req);
      
      if (!isIPAllowed(clientIP)) {
        console.log(`🚫 Super Admin Access Denied: IP ${clientIP} not in whitelist`);
        return res.status(404).json({ error: 'Not found' });
      }
    }

    // 4. Check domain whitelist
    if (!isDomainAllowed(req)) {
      console.log(`🚫 Super Admin Access Denied: Domain not whitelisted - ${req.headers.origin}`);
      return res.status(404).json({ error: 'Not found' });
    }

    // 5. Rate limiting check (simple implementation)
    const clientIP = getClientIP(req);
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 100; // Increased for normal usage

    // Simple in-memory rate limiting (in production, use Redis)
    if (!global.superAdminAttempts) {
      global.superAdminAttempts = new Map();
    }

    const attempts = global.superAdminAttempts.get(clientIP) || { count: 0, resetTime: now + windowMs };
    
    if (now > attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = now + windowMs;
    }

    if (attempts.count >= maxAttempts) {
      console.log(`🚫 Super Admin Access Denied: Rate limit exceeded for ${clientIP}`);
      return res.status(429).json({ error: 'Too many requests' });
    }

    attempts.count++;
    global.superAdminAttempts.set(clientIP, attempts);

    // Log successful access
    console.log(`✅ Super Admin Access Granted: ${clientIP} - ${req.method} ${req.path}`);
    
    next();
  } catch (error) {
    console.error('Super Admin Security Check Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to hide super admin routes in production
export const hideSuperAdminRoutes = (req, res, next) => {
  // In production, return 404 for any super-admin routes without proper authentication
  if (process.env.NODE_ENV === 'production' && req.path.includes('super-admin')) {
    const secretKey = req.headers['x-super-admin-key'] || req.query.key;
    
    if (!secretKey || secretKey !== process.env.SUPER_ADMIN_SECRET_KEY) {
      return res.status(404).json({ error: 'Not found' });
    }
  }
  
  next();
};