const {
  users,
  mahasiswa,
  dosen,
  prodi,
  fakultas,
  lppm,
  admin,
  sequelize
} = require('../databases/models')
const Validator = require('fastest-validator')
const { validateUser, containsBadWords } = require('../validators/validator')
const v = new Validator()
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
require('dotenv').config()
const {
  generateAccessToken,
  clearToken,
  authData,
  isUserDeleted
} = require('../middlewares/auth')
const paginate = require('sequelize-paginate')
const { get } = require('../routes')

async function signUp (req, res) {
  console.log('Entire Request Body:', req.body)
  const { username, email, password } = req.body

  if (containsBadWords(username) || containsBadWords(email)) {
    return res.status(400).json({
      message: 'Input mengandung kata tidak sopan'
    })
  }

  const validation = await validateUser({ email, username, password })
  if (validation.error) {
    return res.status(400).json({ error: validation.error })
  }

  try {
    const existingUser = await users.findOne({ where: { email } })
    if (existingUser) {
      return res
        .status(404)
        .json({ error: 'users with this email already exists' })
    }
    const trimmedPassword = password.trim()
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10)
    const newUser = await users.create({
      username,
      email,
      role: 'admin',
      isActive: true,
      password: hashedPassword
    })

    const accessToken = generateAccessToken(newUser)

    return res.status(200).json({
      message: `Register users with username ${username} Success`,
      accessToken,
      data: newUser
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function signIn (req, res) {
  const { username, password } = req.body

  // Ensure username and password are present
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' })
  }

  try {
    const foundUser = await users.findOne({ where: { username } })

    if (!foundUser) {
      return res.status(404).json({ message: 'users not found' })
    }

    const userDeleted = await isUserDeleted(foundUser.user_id) // Assuming you have a function to check if users is deleted
    if (userDeleted) {
      return res
        .status(403)
        .json({ error: 'Forbidden: users account has been deleted' })
    }

    const passwordMatch = await bcrypt.compare(password, foundUser.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const accessToken = generateAccessToken(foundUser)
    const userResponse = {
      id: foundUser.user_id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role
    }

    return res.status(200).json({
      message: `Login users ID ${foundUser.user_id} Success`,
      accessToken,
      data: userResponse
    })
  } catch (error) {
    console.error('Error in signIn:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function signOut (req, res) {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Token not provided' })
    }
    if (authData.blacklistedTokens.includes(token)) {
      return res
        .status(401)
        .json({ error: 'Unauthorized: Token has been revoked' })
    }
    if (req.users && req.users.user_id && req.users.username) {
      const { user_id, username } = req.users
      clearToken(token)
      res.status(200).json({
        message: `Sign-out successful for users ID ${user_id} Username ${username}`,
        user_id,
        username
      })
    } else {
      res
        .status(401)
        .json({ error: 'Unauthorized: users information not available' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function createMahasiswa (req, res) {
  const {
    username,
    email,
    password,
    nama_mahasiswa,
    nim,
    nik,
    alamat,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    url_foto,
    fakultas_id,
    prodi_id,
    nomor_hp
  } = req.body

  // Validator instance dengan skema validasi
  const validator = new Validator()
  const schema = {
    username: { type: 'string', min: 3, max: 50 },
    email: { type: 'email' },
    password: { type: 'string', min: 6 },
    nama_mahasiswa: { type: 'string', min: 3, max: 50 },
    nim: { type: 'string', min: 3, max: 20 },
    nik: { type: 'string', min: 3, max: 20 },
    alamat: { type: 'string', min: 3, max: 255 },
    tempat_lahir: { type: 'string', min: 3, max: 50 },
    jenis_kelamin: { type: 'enum', values: ['Laki-laki', 'Perempuan'] },
    url_foto: { type: 'string', optional: true, max: 255 },
    nomor_hp: { type: 'string', optional: true, max: 20 },
    fakultas_id: { type: 'string', min: 3, max: 50 },
    prodi_id: { type: 'string', min: 3, max: 50 }
  }

  // Validasi input data
  const validate = validator.compile(schema)
  const validationResponse = validate(req.body)
  if (validationResponse !== true) {
    return res.status(400).json({ error: validationResponse })
  }

  // Start a transaction
  const t = await sequelize.transaction()

  try {
    // Check if the users already exists
    const existingUser = await users.findOne({
      where: { email },
      transaction: t
    })
    if (existingUser) {
      await t.rollback() // Rollback transaction if users already exists
      return res
        .status(400)
        .json({ error: 'users with this email already exists' })
    }

    // Create a new users record
    const hashedPassword = await bcrypt.hash(password.trim(), 10)
    const newUser = await users.create(
      {
        username,
        email,
        password: hashedPassword,
        role: 'mahasiswa',
        isActive: true
      },
      { transaction: t }
    )

    // Create a new mahasiswa record
    const newMahasiswa = await mahasiswa.create(
      {
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
        prodi_id,
        nomor_hp
      },
      { transaction: t }
    )

    // Commit the transaction
    await t.commit()

    return res.status(200).json({
      message: `Mahasiswa created successfully`,
      data: newMahasiswa
    })
  } catch (error) {
    console.error(error)
    await t.rollback() // Rollback transaction on error
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function createDosen (req, res) {
  const {
    username,
    email,
    password,
    nama_dosen,
    nik,
    nidn,
    alamat,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    fakultas_id,
    prodi_id,
    nomor_hp,
    url_foto
  } = req.body

  // Validator instance dengan skema validasi
  const validator = new Validator()
  const schema = {
    username: { type: 'string', min: 3, max: 50 },
    email: { type: 'email' },
    password: { type: 'string', min: 6 },
    nama_dosen: { type: 'string', min: 3, max: 50 },
    nik: { type: 'string', min: 3, max: 20 },
    nidn: { type: 'string', min: 3, max: 20 },
    alamat: { type: 'string', min: 3, max: 255 },
    tempat_lahir: { type: 'string', min: 3, max: 50 },
    jenis_kelamin: { type: 'enum', values: ['Laki-laki', 'Perempuan'] },
    url_foto: { type: 'string', optional: true, max: 255 },
    nomor_hp: { type: 'string', optional: true, max: 20 },
    fakultas_id: { type: 'string', min: 3, max: 50 },
    prodi_id: { type: 'string', min: 3, max: 50 }
  }

  // Validasi input data
  const validate = validator.compile(schema)
  const validationResponse = validate(req.body)
  if (validationResponse !== true) {
    return res.status(400).json({ error: validationResponse })
  }

  // Start a transaction
  const t = await sequelize.transaction()

  try {
    // Check if the users already exists
    const existingUser = await users.findOne({
      where: { email },
      transaction: t
    })
    if (existingUser) {
      await t.rollback() // Rollback transaction if users already exists
      return res
        .status(400)
        .json({ error: 'users with this email already exists' })
    }

    // Create a new users record
    const hashedPassword = await bcrypt.hash(password.trim(), 10)
    const newUser = await users.create(
      {
        username,
        email,
        password: hashedPassword,
        role: 'dosen',
        isActive: true
      },
      { transaction: t }
    )

    // Create a new dosen record
    const responseData = await dosen.create(
      {
        user_id: newUser.user_id,
        nama_dosen,
        nik,
        nidn,
        alamat,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        fakultas_id,
        prodi_id,
        nomor_hp,
        url_foto
      },
      { transaction: t }
    )

    // Commit the transaction
    await t.commit()

    return res.status(200).json({
      message: `Dosen created successfully`,
      data: responseData
    })
  } catch (error) {
    console.error(error)
    await t.rollback() // Rollback transaction on error
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function createProdi (req, res) {
  const { username, email, password, nama_prodi, fakultas_id } = req.body

  // Validator instance dengan skema validasi
  const validator = new Validator()
  const schema = {
    username: { type: 'string', min: 3, max: 50 },
    email: { type: 'email' },
    password: { type: 'string', min: 6 },
    nama_prodi: { type: 'string', min: 3, max: 50 },
    fakultas_id: { type: 'string', min: 3, max: 50 }
  }

  // Validasi input data
  const validate = validator.compile(schema)
  const validationResponse = validate(req.body)
  if (validationResponse !== true) {
    return res.status(400).json({ error: validationResponse })
  }

  // Start a transaction
  const t = await sequelize.transaction()

  try {
    // Check if the users already exists
    const existingUser = await users.findOne({
      where: { email },
      transaction: t
    })
    if (existingUser) {
      await t.rollback() // Rollback transaction if users already exists
      return res
        .status(400)
        .json({ error: 'users with this email already exists' })
    }

    // Create a new users record
    const hashedPassword = await bcrypt.hash(password.trim(), 10)
    const newUser = await users.create(
      {
        username,
        email,
        password: hashedPassword,
        role: 'prodi',
        isActive: true
      },
      { transaction: t }
    )

    // Create a new prodi record
    const newProdi = await prodi.create(
      {
        user_id: newUser.user_id,
        nama_prodi,
        fakultas_id
      },
      { transaction: t }
    )

    // Commit the transaction
    await t.commit()

    return res.status(200).json({
      message: `Prodi created successfully`,
      prodi_id: newProdi.prodi_id,
      data: newProdi
    })
  } catch (error) {
    console.error(error)
    await t.rollback() // Rollback transaction on error
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function createFakultas (req, res) {
  const { username, email, password, nama_fakultas } = req.body

  // Validator instance dengan skema validasi
  const validator = new Validator()
  const schema = {
    username: { type: 'string', min: 3, max: 50 },
    email: { type: 'email' },
    password: { type: 'string', min: 6 },
    nama_fakultas: { type: 'string', min: 3, max: 50 }
  }

  // Validasi input data
  const validate = validator.compile(schema)
  const validationResponse = validate(req.body)
  if (validationResponse !== true) {
    return res.status(400).json({ error: validationResponse })
  }

  // Start a transaction
  const t = await sequelize.transaction()

  try {
    // Check if the users already exists
    const existingUser = await users.findOne({
      where: { email },
      transaction: t
    })
    if (existingUser) {
      await t.rollback() // Rollback transaction if users already exists
      return res
        .status(400)
        .json({ error: 'users with this email already exists' })
    }

    // Create a new users record
    const hashedPassword = await bcrypt.hash(password.trim(), 10)
    const newUser = await users.create(
      {
        username,
        email,
        password: hashedPassword,
        role: 'fakultas',
        isActive: true
      },
      { transaction: t }
    )

    // Create a new fakultas record
    const newFakultas = await fakultas.create(
      {
        user_id: newUser.user_id,

        nama_fakultas
      },
      { transaction: t }
    )

    // Commit the transaction
    await t.commit()

    return res.status(200).json({
      message: `Fakultas created successfully`,
      fakultas_id: newFakultas.fakultas_id,
      data: newFakultas
    })
  } catch (error) {
    console.error(error)
    await t.rollback() // Rollback transaction on error
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function createLPPM (req, res) {
  const { username, email, password, nama_lppm } = req.body

  // Validator instance dengan skema validasi
  const validator = new Validator()
  const schema = {
    username: { type: 'string', min: 3, max: 50 },
    email: { type: 'email' },
    password: { type: 'string', min: 6 },
    nama_lppm: { type: 'string', min: 3, max: 50 }
  }

  // Validasi input data
  const validate = validator.compile(schema)
  const validationResponse = validate(req.body)
  if (validationResponse !== true) {
    return res.status(400).json({ error: validationResponse })
  }

  // Start a transaction
  const t = await sequelize.transaction()

  try {
    // Check if the users already exists
    const existingUser = await users.findOne({
      where: { email },
      transaction: t
    })
    if (existingUser) {
      await t.rollback() // Rollback transaction if users already exists
      return res
        .status(400)
        .json({ error: 'users with this email already exists' })
    }

    // Create a new users record
    const hashedPassword = await bcrypt.hash(password.trim(), 10)
    const newUser = await users.create(
      {
        username,
        email,
        password: hashedPassword,
        role: 'lppm',
        isActive: true
      },
      { transaction: t }
    )

    // Create a new lppm record
    const newLPPM = await lppm.create(
      {
        user_id: newUser.user_id,
        nama_lppm
      },
      { transaction: t }
    )

    // Commit the transaction
    await t.commit()

    return res.status(200).json({
      message: `LPPM created successfully`,
      data: newLPPM
    })
  } catch (error) {
    console.error(error)
    await t.rollback() // Rollback transaction on error
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function createAdmin (req, res) {
  const { username, email, password } = req.body

  try {
    const existingUser = await users.findOne({ where: { email } })
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'users with this email already exists' })
    }

    const newUser = await users.create({
      username,
      email,
      password: await bcrypt.hash(password.trim(), 10),
      role: 'admin',
      isActive: true
    })

    const newAdmin = await admin.create({
      user_id: newUser.user_id
    })

    return res.status(200).json({
      message: `Admin created successfully`,
      data: newAdmin
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getUsers (req, res) {
  try {
    const users = await users.findAll()
    res.status(200).json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getUserById (req, res) {
  const user_id = req.users.user_id
  const role = req.users.role

  try {
    const user = await users.findByPk(user_id)
    if (!user) {
      return res.status(404).json({ message: 'users not found', data: null })
    }

    let userData
    let fakultasData
    let prodiData

    switch (role) {
      case 'mahasiswa':
        userData = await mahasiswa.findOne({
          where: {
            user_id: user_id
          }
        })
        if (userData) {
          fakultasData = await fakultas.findByPk(userData.fakultas_id)
          prodiData = await prodi.findByPk(userData.prodi_id)
        }
        break
      case 'dosen':
        userData = await dosen.findOne({
          where: {
            user_id: user_id
          }
        })
        if (userData) {
          fakultasData = await fakultas.findByPk(userData.fakultas_id)
          prodiData = await prodi.findByPk(userData.prodi_id)
        }
        break
      case 'prodi':
        userData = await prodi.findOne({
          where: {
            user_id: user_id
          }
        })
        break
      case 'fakultas':
        userData = await fakultas.findOne({
          where: {
            user_id: user_id
          }
        })
        break
      case 'lppm':
        userData = await lppm.findOne({
          where: {
            user_id: user_id
          }
        })
        break
      case 'admin':
        userData = await admin.findOne({
          where: {
            user_id: user_id
          }
        })
        break
      default:
        userData = null
        break
    }

    // Siapkan respons dengan informasi pengguna dan data sesuai dengan peran
    const responseData = {
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      data: userData || null,
      fakultas: fakultasData || null,
      prodi: prodiData || null
    }

    res.status(200).json({
      message: `Get Detail ID ${user_id} Success`,
      data: responseData
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function deleteUser (req, res) {
  const { id } = req.params

  try {
    const foundUser = await users.findByPk(id) // Gunakan nama variabel yang berbeda
    if (!foundUser) {
      return res.status(404).json({ error: 'users not found' })
    }

    foundUser.isActive = false // Soft delete dengan mengatur isActive menjadi false
    await foundUser.save()

    res.status(200).json({ message: 'users soft deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
async function getUserCount (req, res) {
  try {
    const count = await users.count()
    res.status(200).json({ count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllFakultas (req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await fakultas.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: 'Success fetch faculties',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllProdi (req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await prodi.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: 'Success fetch study programs',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllMahasiswa (req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await mahasiswa.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: 'Success fetch students',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllMahasiswaByProdi (req, res) {
  const { nama_prodi } = req.params

  try {
    const prodi = await prodi.findOne({ where: { nama_prodi } })

    if (!prodi) {
      return res.status(404).json({ error: 'Study Program not found' })
    }

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await mahasiswa.findAndCountAll({
      where: { prodi_id: prodi.prodi_id },
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: `Success fetch students for study program ${nama_prodi}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllMahasiswaByFakultas (req, res) {
  const { nama_fakultas } = req.params

  try {
    const fakultasData = await fakultas.findOne({ where: { nama_fakultas } })

    if (!fakultasData) {
      return res.status(404).json({ error: 'Faculty not found' })
    }

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await mahasiswa.findAndCountAll({
      where: { fakultas_id: fakultasData.fakultas_id },
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: `Success fetch students for faculty ${nama_fakultas}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllDosenByProdi (req, res) {
  const { nama_prodi } = req.params

  try {
    const prodi = await prodi.findOne({ where: { nama_prodi } })

    if (!prodi) {
      return res.status(404).json({ error: 'Study Program not found' })
    }

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await dosen.findAndCountAll({
      where: { prodi_id: prodi.prodi_id },
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: `Success fetch lecturers for study program ${nama_prodi}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllDosenByFakultas (req, res) {
  const { nama_fakultas } = req.params

  try {
    const fakultasData = await fakultas.findOne({ where: { nama_fakultas } })

    if (!fakultasData) {
      return res.status(404).json({ error: 'Faculty not found' })
    }

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await dosen.findAndCountAll({
      where: { fakultas_id: fakultasData.fakultas_id },
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: `Success fetch lecturers for faculty ${nama_fakultas}`,
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllDosen (req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await dosen.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    const response = {
      message: 'Success fetch lecturers',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function updateUserMahasiswa (req, res) {
  const { user_id } = req.users // Mengambil user_id dari JWT

  const {
    username,
    email,
    password,
    nama_mahasiswa,
    nim,
    nik,
    alamat,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    url_foto,
    fakultas_id,
    prodi_id,
    nomor_hp
  } = req.body

  // Validator instance dengan skema validasi
  const validator = new Validator()
  const schema = {
    username: { type: 'string', min: 3, max: 50, optional: true },
    email: { type: 'email', optional: true },
    password: { type: 'string', min: 6, optional: true },
    nama_mahasiswa: { type: 'string', min: 3, max: 50, optional: true },
    nim: { type: 'string', min: 3, max: 20, optional: true },
    nik: { type: 'string', min: 16, max: 16, optional: true },
    alamat: { type: 'string', min: 3, max: 255, optional: true },
    tempat_lahir: { type: 'string', min: 3, max: 50, optional: true },
    tanggal_lahir: { type: 'date', optional: true },
    jenis_kelamin: {
      type: 'enum',
      values: ['Laki-laki', 'Perempuan'],
      optional: true
    },
    url_foto: { type: 'string', optional: true },
    fakultas_id: { type: 'string', min: 3, max: 50, optional: true },
    prodi_id: { type: 'string', min: 3, max: 50, optional: true },
    nomor_hp: { type: 'string', min: 10, max: 15, optional: true }
  }

  // Validasi input data
  const validate = validator.compile(schema)
  const validationResponse = validate(req.body)
  if (validationResponse !== true) {
    return res.status(400).json({ error: validationResponse })
  }

  try {
    // Start a transaction
    const t = await sequelize.transaction()

    // Find the existing users by user_id
    const existingUser = await users.findOne({
      where: { user_id },
      transaction: t
    })
    if (!existingUser) {
      await t.rollback() // Rollback transaction if users not found
      return res.status(404).json({ error: 'users not found' })
    }

    // Update the users data
    const updatedUser = await existingUser.update(
      {
        username,
        email,
        password: password
          ? await bcrypt.hash(password.trim(), 10)
          : existingUser.password
      },
      { transaction: t }
    )

    // Find the associated mahasiswa data by user_id
    const existingMahasiswa = await mahasiswa.findOne({
      where: { user_id },
      transaction: t
    })
    if (!existingMahasiswa) {
      await t.rollback() // Rollback transaction if mahasiswa not found
      return res.status(404).json({ error: 'Mahasiswa not found' })
    }

    // Update the mahasiswa data
    const updatedMahasiswa = await existingMahasiswa.update(
      {
        nama_mahasiswa,
        nim,
        nik,
        alamat,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        url_foto,
        fakultas_id,
        prodi_id,
        nomor_hp
      },
      { transaction: t }
    )

    // Commit the transaction
    await t.commit()

    return res.status(200).json({
      message: 'Mahasiswa updated successfully',
      data: updatedMahasiswa
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function updateUserDosen (req, res) {
  const { id } = req.params
  const {
    nama_dosen,
    nidn,
    alamat,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    fakultas_id,
    prodi_id,
    nomor_hp,
    url_foto
  } = req.body

  try {
    const dosen = await dosen.findByPk(id)
    if (!dosen) {
      return res.status(404).json({ error: 'Dosen not found' })
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
      url_foto
    })

    return res.status(200).json({
      message: `Dosen updated successfully`,
      data: updatedDosen
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function updateUserProdi (req, res) {
  const { id } = req.params
  const { nama_prodi, kode, fakultas_id } = req.body

  try {
    const prodi = await prodi.findByPk(id)
    if (!prodi) {
      return res.status(404).json({ error: 'Prodi not found' })
    }

    const updatedProdi = await prodi.update({
      nama_prodi,
      kode,
      fakultas_id
    })

    return res.status(200).json({
      message: `Prodi updated successfully`,
      data: updatedProdi
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function updateUserFakultas (req, res) {
  const { id } = req.params
  const { nama_fakultas, kode } = req.body

  try {
    const fakultasData = await fakultas.findByPk(id)
    if (!fakultasData) {
      return res.status(404).json({ error: 'Faculty not found' })
    }

    const updatedFakultas = await fakultasData.update({
      nama_fakultas,
      kode
    })

    return res.status(200).json({
      message: `Faculty updated successfully`,
      data: updatedFakultas
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

paginate.paginate(users)

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
}
