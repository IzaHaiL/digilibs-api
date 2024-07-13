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
    // Check if the user already exists
    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Create a new user record
    const newUser = await user.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: "dosen",
      isActive: true,
    });

    // Retrieve nama_fakultas and nama_prodi based on fakultas_id and prodi_id
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

    // Create a new Dosen record
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

    // Construct the response with nama_fakultas and nama_prodi included
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
  const user_id = req.user.user_id; // Ambil user_id dari objek request, asumsikan telah di-decode dari JWT
  const role = req.user.role; // Ambil role dari objek request

  try {
    const users = await user.findByPk(user_id);
    if (!users) {
      return res.status(404).json({ message: "User not found", data: null });
    }

    let userData;

    // Pilih model yang sesuai berdasarkan role
    switch (role) {
      case 'mahasiswa':
        userData = await mahasiswas.findOne({
          where: {
            user_id: user_id
          }
        });
        break;
      case 'dosen':
        userData = await dosens.findOne({
          where: {
            user_id: user_id
          }
        });
        break;
      case 'prodi':
        userData = await prodis.findOne({
          where: {
            user_id: user_id
          }
        });
        break;
      case 'fakultas':
        userData = await fakultas.findOne({
          where: {
            user_id: user_id
          }
        });
        break;
      case 'lppm':
        userData = await lppms.findOne({
          where: {
            user_id: user_id
          }
        });
        break;
      case 'admin':
        userData = await admin.findOne({
          where: {
            user_id: user_id
          }
        });
        break;
      default:
        userData = null;
        break;
    }

    // Siapkan respons dengan informasi pengguna dan data sesuai dengan peran
    const responseData = {
      user_id: users.user_id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      data: userData || null // Jika data tidak ditemukan, kembalikan null
    };

    res.status(200).json({
      message: `Get Detail ID ${user_id} Success`,
      data: responseData
    });
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
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await fakultas.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Success fetch faculties",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllProdi(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await prodis.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Success fetch study programs",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllMahasiswa(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await mahasiswas.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Success fetch students",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllMahasiswaByProdi(req, res) {
  const { nama_prodi } = req.params;

  try {
    const prodi = await prodis.findOne({ where: { nama_prodi } });

    if (!prodi) {
      return res.status(404).json({ error: "Study Program not found" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await mahasiswas.findAndCountAll({
      where: { prodi_id: prodi.prodi_id },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: `Success fetch students for study program ${nama_prodi}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllMahasiswaByFakultas(req, res) {
  const { nama_fakultas } = req.params;

  try {
    const fakultasData = await fakultas.findOne({ where: { nama_fakultas } });

    if (!fakultasData) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await mahasiswas.findAndCountAll({
      where: { fakultas_id: fakultasData.fakultas_id },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: `Success fetch students for faculty ${nama_fakultas}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllDosenByProdi(req, res) {
  const { nama_prodi } = req.params;

  try {
    const prodi = await prodis.findOne({ where: { nama_prodi } });

    if (!prodi) {
      return res.status(404).json({ error: "Study Program not found" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await dosens.findAndCountAll({
      where: { prodi_id: prodi.prodi_id },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: `Success fetch lecturers for study program ${nama_prodi}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllDosenByFakultas(req, res) {
  const { nama_fakultas } = req.params;

  try {
    const fakultasData = await fakultas.findOne({ where: { nama_fakultas } });

    if (!fakultasData) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await dosens.findAndCountAll({
      where: { fakultas_id: fakultasData.fakultas_id },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: `Success fetch lecturers for faculty ${nama_fakultas}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllDosen(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await dosens.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response = {
      message: "Success fetch lecturers",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUserMahasiswa(req, res) {
  const { user_id } = req.user;
  
  const { username, email, password, nama_mahasiswa, nim, nik, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, url_foto, fakultas_id, prodi_id, nomor_hp } = req.body;

  try {
    // Find the existing user by user_id
    const existingUser = await user.findOne({ where: { user_id } });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user data
    const updatedUser = await existingUser.update({
      username,
      email,
      password: password ? await bcrypt.hash(password.trim(), 10) : existingUser.password,
    });

    // Find the associated mahasiswa data by user_id
    const existingMahasiswa = await mahasiswas.findOne({ where: { user_id } });
    if (!existingMahasiswa) {
      return res.status(404).json({ error: "Mahasiswa not found" });
    }

    // Retrieve prodi and fakultas names if IDs are provided
    let namaProdi = existingMahasiswa.nama_prodi;
    let namaFakultas = existingMahasiswa.nama_fakultas;

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

    // Update the mahasiswa data
    const updatedMahasiswa = await existingMahasiswa.update({
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
      message: "Mahasiswa updated successfully",
      data: updatedMahasiswa,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



async function updateUserDosen (req, res){
  const {id} = req.params;
  const {nama_dosen, nidn, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin, fakultas_id, prodi_id, nomor_hp, url_foto} = req.body;

  try {
    const dosen = await dosens.findByPk(id);
    if (!dosen) {
      return res.status(404).json({ error: "Dosen not found" });
    }

    const updatedDosen = await dosen.update({
      nama_dosen,
      nidn,
      alamat,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      fakultas_id,
      prodi_id,
      nomor_hp,
      url_foto,
    });

    return res.status(200).json({
      message: `Dosen updated successfully`,
      data: updatedDosen,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

}

async function updateUserProdi (req, res){
  const {id} = req.params;
  const {nama_prodi, kode, fakultas_id} = req.body;

  try {
    const prodi = await prodis.findByPk(id);
    if (!prodi) {
      return res.status(404).json({ error: "Prodi not found" });
    }

    const updatedProdi = await prodi.update({
      nama_prodi,
      kode,
      fakultas_id,
    });

    return res.status(200).json({
      message: `Prodi updated successfully`,
      data: updatedProdi,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUserFakultas (req, res){
  const {id} = req.params;
  const {nama_fakultas, kode} = req.body;

  try {
    const fakultasData = await fakultas.findByPk(id);
    if (!fakultasData) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const updatedFakultas = await fakultasData.update({
      nama_fakultas,
      kode,
    });

    return res.status(200).json({
      message: `Faculty updated successfully`,
      data: updatedFakultas,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
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
  deleteUser,
  getUserCount,
  getAllFakultas,
  getAllProdi,
  getAllMahasiswa,
  getAllDosen,
  getAllMahasiswaByProdi,
  getAllMahasiswaByFakultas,
  getAllDosenByProdi,
  getAllDosenByFakultas,
  updateUserMahasiswa,
  updateUserDosen,
  updateUserProdi,
  updateUserFakultas
  

};
