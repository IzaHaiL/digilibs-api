/* eslint-disable radix */
/* eslint-disable consistent-return */
const jwt = require("jsonwebtoken");
const { users, donation } = require("../databases/models");
const dotenv = require("dotenv");

dotenv.config();

// Array untuk menyimpan token yang telah di-blacklist
const authData = {
  blacklistedTokens: [],
};

// Function to generate access token
function generateAccessToken(users) {
  return jwt.sign(
    {
      user_id: users.user_id, // corrected to users.user_id
      username: users.username,
      email: users.email,
      role: users.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "60d",
    }
  );
}

// Function to generate refresh token
function generateRefreshToken(users) {
  return jwt.sign(
    {
      user_id: users.user_id, // corrected to users.user_id
      username: users.username,
      email: users.email,
      role: users.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// Middleware to authenticate access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Access token not provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, users) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid access token" });
    }

    if (users.isDeleted) {
      return res
        .status(403)
        .json({ error: "Forbidden: users account has been deleted" });
    }

    req.users = users;
    next();
  });
}

// Middleware to authenticate refresh token
function authenticateRefreshToken(req, res, next) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next();
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, users) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Forbidden: Invalid refresh token" });
    }

    req.users = users;
    next();
  });
}

// Middleware to check if the users is an admin
function isAdmin(req, res, next) {
  if (req.users && req.users.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have admin privileges" });
  }
}

// Middleware to check if the users is a mahasiswa
function isMahasiswa(req, res, next) {
  if (req.users && req.users.role === "mahasiswa") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have mahasiswa privileges" });
  }
}

// Middleware to check if the users is a fakultas
function isFakultas(req, res, next) {
  if (req.users && req.users.role === "fakultas") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have fakultas privileges" });
  }
}

// Middleware to check if the users is a prodi
function isProdi(req, res, next) {
  // corrected function name
  if (req.users && req.users.role === "prodi") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have prodi privileges" });
  }
}

// Middleware to check if the users is an lppm
function isLppm(req, res, next) {
  if (req.users && req.users.role === "lppm") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have lppm privileges" });
  }
}

// Middleware to check if the users is a dosen
function isDosen(req, res, next) {
  if (req.users && req.users.role === "dosen") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have dosen privileges" });
  }
}

// Middleware to check if the users is the owner of the requested resource or an admin
async function isUserOwner(modelName, idColumn, req, res, next) {
  try {
    const entityId = req.params[idColumn];
    const authenticatedUserId = req.users.user_id;

    // Ambil model berdasarkan nama model yang diberikan
    const Model = require(`../models/${modelName}`); // Pastikan model Anda terdapat di folder models

    // Bangun kueri untuk mencari entitas berdasarkan idColumn
    const entity = await Model.findOne({ where: { [idColumn]: entityId } });

    if (!entity) {
      return res.status(404).json({
        error: `${modelName} not found`,
      });
    }

    const requestedUserId = entity.user_id;

    // Periksa izin
    if (req.users.role === "admin" || requestedUserId === authenticatedUserId) {
      next();
    } else {
      res.status(403).json({
        error: "Forbidden: You do not have permission to access this resource",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

function isUserOwnerNoRequest(req, res, next) {
  const authenticatedUserId = req.users.user_id;
  console.log("Authenticated users ID:", authenticatedUserId);
  if (req.users.role === "admin" || authenticatedUserId) {
    next();
  } else {
    res.status(403).json({
      error: "Forbidden: You do not have permission to access this resource",
    });
  }
}

async function isDonationOwner(req, res, next) {
  const requestedDonationId = req.params.id;
  const authenticatedUserId = req.users.user_id;

  try {
    const donationObj = await donation.findByPk(requestedDonationId);

    if (!donationObj) {
      return res.status(404).json({
        error: "Donation not found",
      });
    }

    // Check if the authenticated users is the owner of the donation or an admin
    if (
      req.users.role === "admin" ||
      donationObj.idUser === authenticatedUserId
    ) {
      req.donationObj = donationObj; // Attach the donation object to the request for later use
      next();
    } else {
      res.status(403).json({
        error: "Forbidden: You do not have permission to delete this donation",
      });
    }
  } catch (error) {
    console.error("Error checking donation ownership:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

// Middleware to check if the users is deleted
async function isUserDeleted(userId) {
  try {
    const foundUser = await users.findByPk(userId);

    if (!foundUser) {
      return true;
    }

    return foundUser.isDeleted;
  } catch (error) {
    console.error("Error checking users deletion status:", error);
    return true;
  }
}

async function checkUserDeletedBeforeLogin(req, res, next) {
  const { username, password } = req.body;
  try {
    if (!username) {
      return res
        .status(400)
        .json({ error: "Bad Request: Username is required" });
    }
    const foundUser = await users.findOne({ where: { username } });
    if (!foundUser) {
      return res.status(404).json({ error: "users not found" });
    }
    const userDeleted = await isUserDeleted(foundUser.user_id); // corrected to foundUser.user_id
    if (userDeleted) {
      return res
        .status(403)
        .json({ error: "Forbidden: users account has been deleted" });
    }
    next();
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Middleware to check if the token is in the blacklist
function checkBlacklist(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (token && authData.blacklistedTokens.includes(token)) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Token has been revoked" });
  }
  next();
}

// Function to add a token to the blacklist
function clearToken(token) {
  authData.blacklistedTokens.push(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  authenticateRefreshToken,
  isAdmin,
  isMahasiswa,
  isFakultas,
  isProdi, // corrected export name
  isLppm,
  isDosen,
  isUserOwner,
  isUserDeleted,
  checkUserDeletedBeforeLogin,
  checkBlacklist,
  clearToken,
  authData,
  isDonationOwner,
  isUserOwnerNoRequest,
};
