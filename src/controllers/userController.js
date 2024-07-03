const { user, mahasiswas, dosens, prodis, fakultas, lppms, admin } = require("../databases/models");
const Validator = require("fastest-validator");
const { validateUser, containsBadWords } = require("../validators/validator");
const v = new Validator();
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
require("dotenv").config();
const {
  generateAccessToken,
  clearToken,
  authData,
  isUserDeleted,
} = require("../middlewares/auth");
const paginate = require("sequelize-paginate");
const { get } = require("../routes");

async function signUp(req, res) {
  console.log("Entire Request Body:", req.body);
  const { username, email, password } = req.body;

  if (containsBadWords(username) || containsBadWords(email)) {
    return res.status(400).json({
      message: "Input mengandung kata tidak sopan",
    });
  }

  const validation = await validateUser({ email, username, password });
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(404).json({ error: "User with this email already exists" });
    }
    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const newUser = await user.create({
      username,
      email,
      role: "mahasiswa",
      isActive: true,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(newUser);

    return res.status(200).json({
      message: `Register user with username ${username} Success`,
      accessToken,
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function signIn(req, res) {
  const { username, password } = req.body;

  // Ensure username and password are present
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const foundUser = await user.findOne({ where: { username } });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDeleted = await isUserDeleted(foundUser.user_id); // Assuming you have a function to check if user is deleted
    if (userDeleted) {
      return res.status(403).json({ error: "Forbidden: User account has been deleted" });
    }

    const passwordMatch = await bcrypt.compare(password, foundUser.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = generateAccessToken(foundUser);
    const userResponse = {
      id: foundUser.user_id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
    };

    return res.status(200).json({
      message: `Login User ID ${foundUser.user_id} Success`,
      accessToken,
      data: userResponse,
    });

  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { signIn };
async function signOut(req, res) {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not provided" });
    }
    if (authData.blacklistedTokens.includes(token)) {
      return res.status(401).json({ error: "Unauthorized: Token has been revoked" });
    }
    if (req.user && req.user.user_id && req.user.username) {
      const { user_id, username } = req.user;
      clearToken(token);
      res.status(200).json({
        message: `Sign-out successful for user ID ${user_id} Username ${username}`,
        user_id,
        username,
      });
    } else {
      res.status(401).json({ error: "Unauthorized: User information not available" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUserData(req, res) {
  const { user_id } = req.user;
  const { username, email, password } = req.body;

  try {
    const foundUser = await user.findByPk(user_id);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) {
      const existingUser = await user.findOne({ where: { email } });
      if (existingUser && existingUser.user_id !== user_id) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    if (username) foundUser.username = username;
    if (email) foundUser.email = email;
    if (password) {
      const trimmedPassword = password.trim();
      foundUser.password = await bcrypt.hash(trimmedPassword, 10);
    }

    await foundUser.save();

    res.status(200).json({ message: "User updated successfully", data: foundUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  
 }} 

 async function createMahasiswa(req, res) {
  const { username, email, password, nama_mahasiswa, nim, nik, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, url_foto, fakultas_id, prodi_id, nomor_hp } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = await user.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: "mahasiswa",
      isActive: true,
    });

    // Ambil nama prodi dan nama fakultas berdasarkan prodi_id dan fakultas_id
    let namaProdi = "";
    let namaFakultas = "";

    if (prodi_id) {
      const prodiData = await prodis.findOne({ where: { prodi_id } });
      if (prodiData) {
        namaProdi = prodiData.nama_prodi;
      }
    }

    if (fakultas_id) {
      const fakultasData = await fakultas.findOne({ where: { fakultas_id } });
      if (fakultasData) {
        namaFakultas = fakultasData.nama_fakultas;
      }
    }

    const newMahasiswa = await mahasiswas.create({
      user_id: newUser.user_id,
      nama_mahasiswa,
      nim,
      nik,
      alamat,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      url_foto,
      fakultas_id,
      nama_fakultas: namaFakultas,
      prodi_id,
      nama_prodi: namaProdi,
      nomor_hp,
    });

    return res.status(200).json({
      message: `Mahasiswa created successfully`,
      data: newMahasiswa,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


async function createDosen(req, res) {
  const { username, email, password, nama_dosen, nidn, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, fakultas_id, prodi_id, nomor_hp, url_foto } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = await user.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: "dosen",
      isActive: true,
    });

    // Ambil nama prodi dan nama fakultas berdasarkan prodi_id dan fakultas_id
    let namaProdi = "";
    let namaFakultas = "";

    if (prodi_id) {
      const prodiData = await prodis.findOne({ where: { prodi_id } });
      if (prodiData) {
        namaProdi = prodiData.nama_prodi;
      }
    }

    if (fakultas_id) {
      const fakultasData = await fakultas.findOne({ where: { fakultas_id } });
      if (fakultasData) {
        namaFakultas = fakultasData.nama_fakultas;
      }
    }

    const newDosen = await dosens.create({
      user_id: newUser.user_id,
      nama_dosen,
      nidn,
      alamat,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      fakultas_id,
      nama_fakultas: namaFakultas,
      prodi_id,
      nama_prodi: namaProdi,
      nomor_hp,
      url_foto,
    });

    // Mengatur respons dengan tambahan nama_fakultas dan nama_prodi
    const responseData = {
      ...newDosen.toJSON(),
      nama_fakultas: namaFakultas,
      nama_prodi: namaProdi,
    };

    return res.status(200).json({
      message: `Dosen created successfully`,
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
async function createProdi(req, res) {
  const { username, email, password, nama_prodi, kode, fakultas_id } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = await user.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: "prodi",
      isActive: true,
    });

    // Ambil nama fakultas berdasarkan fakultas_id
    let namaFakultas = "";

    if (fakultas_id) {
      const fakultasData = await fakultas.findOne({ where: { fakultas_id } });
      if (fakultasData) {
        namaFakultas = fakultasData.nama_fakultas;
      }
    }

    const newProdi = await prodis.create({
      user_id: newUser.user_id,
      nama_prodi,
      kode,
      fakultas_id,
      nama_fakultas: namaFakultas,
    });

    return res.status(200).json({
      message: `Prodi created successfully`,
      data: newProdi,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
async function createFakultas(req, res) {
  const { username, email, password, nama_fakultas, kode } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = await user.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: "fakultas",
      isActive: true,
    });

    const newFakultas = await fakultas.create({
      user_id: newUser.user_id,
      nama_fakultas,
      kode,
    });

    return res.status(200).json({
      message: `Fakultas created successfully`,
      data: newFakultas,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createLPPM(req, res) {
  const { username, email, password, nama_lppm } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = await user.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: "lppm",
      isActive: true,
    });

    const newLPPM = await lppms.create({
      user_id: newUser.user_id,
      nama_lppm,
    });

    return res.status(200).json({
      message: `LPPM created successfully`,
      data: newLPPM,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createAdmin(req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser = await user.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: "admin",
      isActive: true,
    });

    const newAdmin = await admin.create({
      user_id: newUser.user_id,
    });

    return res.status(200).json({
      message: `Admin created successfully`,
      data: newAdmin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await user.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const user = await user.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    const user = await user.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email) {
      const existingUser = await user.findOne({ where: { email } });
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const trimmedPassword = password.trim();
      user.password = await bcrypt.hash(trimmedPassword, 10);
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    const user = await user.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUserCount(req, res) {
  try {
    const count = await user.count();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllFakultas(req, res) {
  try {
    const allFakultas = await fakultas.findAll();
    res.status(200).json(allFakultas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllProdi(req, res) {
  try {
    const allProdi = await prodis.findAll();
    res.status(200).json(allProdi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllMahasiswa(req, res) {
  try {
    const allMahasiswa = await mahasiswas.findAll();
    res.status(200).json(allMahasiswa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }

}

async function getAllMahasiswaByProdi(req, res) {
  const { nama_prodi } = req.params;

  try {
    // Cari id prodi berdasarkan nama_prodi
    const prodi = await prodis.findOne({ where: { nama_prodi } });

    if (!prodi) {
      return res.status(404).json({ error: "Program Studi not found" });
    }

    // Ambil semua mahasiswa dengan prodi_id yang sesuai
    const mahasiswa = await mahasiswas.findAll({ where: { prodi_id: prodi.prodi_id } });

    res.status(200).json(mahasiswa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllMahasiswaByFakultas(req, res) {
  const { nama_fakultas } = req.params;

  try {
    // Cari fakultas_id berdasarkan nama_fakultas
    const fakultasData = await fakultas.findOne({ where: { nama_fakultas } });

    if (!fakultasData) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const fakultas_id = fakultasData.fakultas_id;

    // Cari mahasiswa berdasarkan fakultas_id
    const mahasiswa = await mahasiswas.findAll({ where: { fakultas_id } });

    res.status(200).json(mahasiswa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



async function getAllDosen(req, res) { 
  try {
    const allDosen = await dosens.findAll();
    res.status(200).json(allDosen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }

}

async function getAllDosenByProdi(req, res) {
  try {
    const { prodi_id } = req.params;
    const dosen = await dosens.findAll({ where: { prodi_id } });
    res.status(200).json(dosen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllDosenByFakultas(req, res) {
  try {
    const { fakultas_id } = req.params;
    const dosen = await dosens.findAll({ where: { fakultas_id } });
    res.status(200).json(dosen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


paginate.paginate(user);

module.exports = {
  signUp,
  signIn,
  signOut,
  createMahasiswa,
  createDosen,
  createProdi,
  createFakultas,
  createLPPM,
  createAdmin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserCount,
  updateUserData,
  getAllFakultas,
  getAllProdi,
  getAllMahasiswa,
  getAllDosen,
  getAllMahasiswaByProdi,
  getAllMahasiswaByFakultas,
  getAllDosenByProdi,
  getAllDosenByFakultas,

};
