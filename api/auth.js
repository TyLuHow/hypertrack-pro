// User Authentication System with Guest Mode Fallback
import { createClient } from '@supabase/supabase-js';
import { sign, verify } from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'hypertrack-pro-secret-key';

export default async function handler(req, res) {
  // Enable CORS with optional allowlist
  const allowlist = (process.env.CORS_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.origin;
  const allowOrigin = allowlist.length > 0 ? (allowlist.includes(origin) ? origin : allowlist[0] || '*') : '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, body, headers } = req;
  const { action } = req.query;

  try {
    switch (method) {
      case 'POST':
        switch (action) {
          case 'signup':
            return handleSignup(res, body);
          case 'login':
            return handleLogin(res, body);
          case 'guest':
            return handleGuestLogin(res);
          case 'refresh':
            return handleRefreshToken(res, headers.authorization);
          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
      case 'GET':
        switch (action) {
          case 'verify':
            return handleVerifyToken(res, headers.authorization);
          case 'user':
            return handleGetUser(res, headers.authorization);
          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
      case 'DELETE':
        return handleLogout(res, headers.authorization);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleSignup(res, { email, password, name }) {
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0] }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
        name: name || email.split('@')[0],
        created_at: new Date().toISOString(),
        preferences: {
          units: 'lbs',
          defaultRestTime: 120,
          theme: 'auto'
        }
      }])
      .select();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue even if profile creation fails
    }

    // Generate custom JWT
    const token = generateJWT({
      userId: authData.user.id,
      email: authData.user.email,
      name: name || email.split('@')[0]
    });

    return res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name || email.split('@')[0],
        isGuest: false
      },
      token,
      message: 'User created successfully'
    });

  } catch (error) {
    throw error;
  }
}

async function handleLogin(res, { email, password }) {
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Generate custom JWT
    const token = generateJWT({
      userId: data.user.id,
      email: data.user.email,
      name: profile?.name || data.user.email.split('@')[0]
    });

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.email.split('@')[0],
        preferences: profile?.preferences || {},
        isGuest: false
      },
      token,
      message: 'Login successful'
    });

  } catch (error) {
    throw error;
  }
}

async function handleGuestLogin(res) {
  try {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const token = generateJWT({
      userId: guestId,
      email: null,
      name: 'Guest User',
      isGuest: true
    });

    return res.status(200).json({
      user: {
        id: guestId,
        email: null,
        name: 'Guest User',
        isGuest: true,
        preferences: {
          units: 'lbs',
          defaultRestTime: 120,
          theme: 'auto'
        }
      },
      token,
      message: 'Guest session created'
    });

  } catch (error) {
    throw error;
  }
}

async function handleVerifyToken(res, authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET);

    return res.status(200).json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        isGuest: decoded.isGuest || false
      }
    });

  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function handleGetUser(res, authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET);

    if (decoded.isGuest) {
      return res.status(200).json({
        user: {
          id: decoded.userId,
          email: null,
          name: 'Guest User',
          isGuest: true,
          preferences: {
            units: 'lbs',
            defaultRestTime: 120,
            theme: 'auto'
          }
        }
      });
    }

    // Get full user profile for authenticated users
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
    }

    return res.status(200).json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: profile?.name || decoded.name,
        preferences: profile?.preferences || {},
        isGuest: false,
        createdAt: profile?.created_at,
        lastLogin: profile?.last_login
      }
    });

  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function handleRefreshToken(res, authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET);

    // Generate new token
    const newToken = generateJWT({
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      isGuest: decoded.isGuest || false
    });

    return res.status(200).json({
      token: newToken,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function handleLogout(res, authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET);

    // For authenticated users, update last login
    if (!decoded.isGuest) {
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', decoded.userId);
    }

    return res.status(200).json({ message: 'Logout successful' });

  } catch (error) {
    return res.status(200).json({ message: 'Logout completed' });
  }
}

function generateJWT(payload) {
  return sign(payload, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'hypertrack-pro',
    audience: 'hypertrack-pro-users'
  });
}

// Middleware function for protecting routes
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.substring(7);
      const decoded = verify(token, JWT_SECRET);
      
      req.user = decoded;
      return handler(req, res);
      
    } catch (error) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  };
}