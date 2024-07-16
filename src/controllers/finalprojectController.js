const {
  finalprojects,
  research,
  mahasiswas,
  dosens,
  prodis,
  fakultas,
  lppms,
  admin,
  sequelize
} = require('../databases/models')
const { nanoid } = require('nanoid')
const { Op } = require('sequelize')
const Validator = require('fastest-validator')
const v = new Validator()
const paginate = require('sequelize-paginate')

async function createFinalProjects (req, res, next) {
  try {
    const mahasiswa = await mahasiswas.findOne({
      where: { user_id: req.user.user_id }
    })

    if (!mahasiswa) {
      return res.status(404).json({
        message: 'Mahasiswa data not found for the current user'
      })
    }
    const data = {
      user_id: req.user.user_id,
      mahasiswa_id: mahasiswa.mahasiswa_id,
      title: req.body.title,
      title_eng: req.body.title_eng,
      abstract: req.body.abstract,
      abstract_eng: req.body.abstract_eng,
      kontributor: req.body.kontributor,
      fakultas_id: mahasiswa.fakultas_id,
      prodi_id: mahasiswa.prodi_id,
      url_finalprojects: req.body.url_finalprojects,
      berkas_finalprojects: req.body.berkas_finalprojects,
      submissionDate: req.body.submissionDate,
      aprovaldate: req.body.aprovaldate,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const schema = {
      title: { type: 'string', min: 5, max: 255, optional: false },
      abstract: { type: 'string', optional: false },
      kontributor: { type: 'string', optional: true },
      fakultas_id: { type: 'string', optional: false },
      prodi_id: { type: 'string', optional: false },
      url_finalprnpojects: { type: 'string', optional: true },
      berkas_finalprojects: { type: 'string', optional: true },
      submissionDate: { type: 'date', optional: true }
    }
    const validationResult = v.validate(data, schema)
    if (validationResult !== true) {
      return res.status(400).json({
        message: 'Validation Failed',
        data: validationResult
      })
    }
    const result = await finalprojects.create(data)
    res.status(201).json({
      message: 'Final Project Created Successfully',
      data: result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Create Final Project Failed',
      data: err
    })
  }
}

async function getAllFinalProjects (req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await finalprojects.paginate({
      page: page,
      paginate: pageSize,
      include: [
        {
          model: mahasiswas,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    const response = {
      message: 'Success fetch final projects',
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs
    }

    res.send(response)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).send({ message: 'Internal server error' })
  }
}

async function getAllFinalProjectsByUserId (req, res, next) {
  try {
    const userIdFromToken = req.user.user_id // Mengambil user_id dari JWT

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await finalprojects.findAndCountAll({
      where: { user_id: userIdFromToken },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: mahasiswas,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    if (result.count === 0) {
      return res.status(404).json({
        message: 'Final Project not found',
        data: null
      })
    }

    const response = {
      message: 'Success fetching final projects by user ID',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch final projects',
      error: err.message
    })
  }
}

async function getFinalProjectsById (req, res, next) {
  try {
    const finalProjectId = req.params.id

    const finalProject = await finalprojects.findByPk(finalProjectId, {
      include: [
        {
          model: mahasiswas,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    if (!finalProject) {
      res.status(404).json({
        message: 'Final Project not found',
        data: null
      })
    } else {
      res.status(200).json({
        message: 'Success',
        data: finalProject
      })
    }
  } catch (err) {
    res.status(500).json({
      message: 'Read Final Project Failed',
      error: err.message
    })
  }
}

async function updateFinalProjects (req, res, next) {
  try {
    const { project_id } = req.params

    // Periksa apakah final project dengan project_id yang diberikan ada di database
    const existingProject = await finalprojects.findByPk(project_id)
    if (!existingProject) {
      return res.status(404).json({
        message: 'Final Project not found'
      })
    }

    // Dapatkan data Mahasiswa dari database berdasarkan user_id dari JWT
    const mahasiswa = await mahasiswas.findOne({
      where: { user_id: req.user.user_id }
    })

    if (!mahasiswa) {
      return res.status(404).json({
        message: 'Mahasiswa data not found for the current user'
      })
    }

    // Konfigurasi data yang akan diupdate
    const dataToUpdate = {
      title: req.body.title || existingProject.title,
      title_eng: req.body.title_eng || existingProject.title_eng,
      abstract: req.body.abstract || existingProject.abstract,
      abstract_eng: req.body.abstract_eng || existingProject.abstract_eng,
      penulis: req.body.penulis || mahasiswa.nama_mahasiswa,
      nim: req.body.nim || mahasiswa.nim,
      kontributor: req.body.kontributor || existingProject.kontributor,
      fakultas_id: req.body.fakultas_id || mahasiswa.fakultas_id,
      prodi_id: req.body.prodi_id || mahasiswa.prodi_id,
      url_finalprojects:
        req.body.url_finalprojects || existingProject.url_finalprojects,
      berkas_finalprojects:
        req.body.berkas_finalprojects || existingProject.berkas_finalprojects,
      submissionDate: req.body.submissionDate || existingProject.submissionDate,
      aprovaldate: req.body.aprovaldate || existingProject.aprovaldate,
      updatedAt: new Date()
    }

    // Validasi data yang akan diupdate
    const schema = {
      title: { type: 'string', min: 5, max: 255, optional: true },
      abstract: { type: 'string', optional: true },
      penulis: { type: 'string', min: 5, max: 50, optional: true },
      kontributor: { type: 'string', optional: true },
      fakultas_id: { type: 'string', optional: true },
      prodi_id: { type: 'string', optional: true },
      url_finalprojects: { type: 'string', optional: true },
      berkas_finalprojects: { type: 'string', optional: true },
      submissionDate: { type: 'date', optional: true }
    }

    const validationResult = v.validate(dataToUpdate, schema)

    if (validationResult !== true) {
      return res.status(400).json({
        message: 'Validation Failed',
        data: validationResult
      })
    }

    // Lakukan update data final project
    await finalprojects.update(dataToUpdate, {
      where: { project_id: project_id }
    })

    // Ambil data final project yang telah diupdate
    const updatedProject = await finalprojects.findByPk(project_id)

    res.status(200).json({
      message: 'Final Project Updated Successfully',
      data: updatedProject
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Update Final Project Failed',
      error: err.message
    })
  }
}

async function deleteFinalProjects (req, res, next) {
  try {
    const finalProjectId = req.params.id

    const existingFinalProject = await finalprojects.findByPk(finalProjectId)

    if (!existingFinalProject) {
      res.status(404).json({
        message: 'Final Project not found',
        data: null
      })
      return
    }

    const result = await finalprojects.destroy({
      where: { project_id: finalProjectId }
    })

    res.status(200).json({
      message: 'Success Delete Data',
      data: result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Delete Final Project Failed',
      data: err.toString()
    })
  }
}

async function getDetailProjectsPublicById (req, res, next) {
  try {
    const projectId = req.params.id

    const project = await finalprojects.findByPk(projectId, {
      include: [
        {
          model: mahasiswas,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        data: null
      })
    }

    // Tingkatkan total_views
    project.total_views = (project.total_views || 0) + 1
    await project.save()

    // Filter atribut berkas_finalprojects tergantung tipe data
    const { berkas_finalprojects, ...filteredData } = project.toJSON()

    res.status(200).json({
      message: 'Success',
      data: filteredData
    })
  } catch (err) {
    res.status(500).json({
      message: 'Read Project Failed',
      error: err.toString()
    })
  }
}

async function getAllFinalProjectsPublic (req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await finalprojects.findAndCountAll({
      include: [
        {
          model: mahasiswas,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['total_views', 'DESC']]
    })

    // Exclude the 'berkas_finalprojects' attribute from each final project
    const finalProjectsData = result.rows.map(finalProject => {
      const { berkas_finalprojects, ...finalProjectData } =
        finalProject.toJSON()
      return finalProjectData
    })

    const response = {
      message: 'Success fetch final projects',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: finalProjectsData
    }

    res.send(response)
  } catch (err) {
    res.status(500).send({
      message: 'Fetch Final Projects Failed',
      error: err.toString()
    })
  }
}

async function searchProjectPublic (req, res, next) {
  const searchTerm = req.query.q
  const page = parseInt(req.query.page, 10) || 1
  const pageSize = 5

  try {
    let finalProjectQuery = {}
    let researchQuery = {}

    // Query for finalprojects model
    if (searchTerm) {
      finalProjectQuery = {
        [Op.or]: [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { abstract: { [Op.like]: `%${searchTerm}%` } },
          { title_eng: { [Op.like]: `%${searchTerm}%` } },
          { abstract_eng: { [Op.like]: `%${searchTerm}%` } }
        ]
      }
    }

    // Query for research model
    if (searchTerm) {
      researchQuery = {
        [Op.or]: [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { abstract: { [Op.like]: `%${searchTerm}%` } }
        ]
      }
    }

    // Fetch data from both models
    const [finalProjectsResult, researchResult] = await Promise.all([
      finalprojects.findAndCountAll({
        where: finalProjectQuery,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['title', 'ASC']],
        include: [
          {
            model: mahasiswas,
            attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
          },
          { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
          { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
        ]
      }),
      research.findAndCountAll({
        where: researchQuery,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['title', 'ASC']],
        include: [
          { model: dosens, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
          { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
          { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
        ]
      })
    ])

    // Exclude 'berkas_finalprojects' attribute from each final project
    const finalProjectsData = finalProjectsResult.rows.map(finalProject => {
      const { berkas_finalprojects, ...finalProjectData } =
        finalProject.toJSON()
      return finalProjectData
    })

    // Combine data from both models
    const combinedData = [...finalProjectsData, ...researchResult.rows]

    const response = {
      message: 'Success fetch final projects and research by name',
      total_count: finalProjectsResult.count + researchResult.count,
      total_pages: Math.ceil(
        (finalProjectsResult.count + researchResult.count) / pageSize
      ),
      current_page: page,
      data: combinedData
    }

    res.status(200).json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch final projects and research by name',
      error: err.toString()
    })
  }
}
async function advancedSearchProjectsPublic (req, res, next) {
  const {
    q: searchTerm,
    jenisDokumen,
    title,
    penulis,
    contributor,
    kataKunci,
    tahunMulai,
    tahunSelesai,
    page = 1,
    pageSize = 10
  } = req.query

  try {
    let searchQuery = {}
    if (
      searchTerm ||
      title ||
      penulis ||
      contributor ||
      kataKunci ||
      tahunMulai ||
      tahunSelesai
    ) {
      searchQuery = {
        [Op.and]: [
          searchTerm
            ? {
                [Op.or]: [
                  { title: { [Op.like]: `%${searchTerm}%` } },
                  { abstract: { [Op.like]: `%${searchTerm}%` } },
                  { title_eng: { [Op.like]: `%${searchTerm}%` } },
                  { abstract_eng: { [Op.like]: `%${searchTerm}%` } }
                ]
              }
            : {},
          title ? { title: { [Op.like]: `%${title}%` } } : {},
          penulis ? { penulis: { [Op.like]: `%${penulis}%` } } : {},
          contributor ? { kontributor: { [Op.like]: `%${contributor}%` } } : {},
          kataKunci
            ? {
                [Op.or]: [
                  { title: { [Op.like]: `%${kataKunci}%` } },
                  { abstract: { [Op.like]: `%${kataKunci}%` } },
                  { title_eng: { [Op.like]: `%${kataKunci}%` } },
                  { abstract_eng: { [Op.like]: `%${kataKunci}%` } }
                ]
              }
            : {},
          tahunMulai && tahunSelesai
            ? {
                createdAt: {
                  [Op.between]: [
                    new Date(`${tahunMulai}-01-01`),
                    new Date(`${tahunSelesai}-12-31`)
                  ]
                }
              }
            : {}
        ]
      }
    }

    let finalProjectsResult = { count: 0, rows: [] }
    let finalprojectsResult = { count: 0, rows: [] }

    if (!jenisDokumen || jenisDokumen === 'finalproject') {
      finalProjectsResult = await finalprojects.findAndCountAll({
        where: searchQuery,
        limit: parseInt(pageSize, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(pageSize, 10),
        order: [['title', 'ASC']],
        include: [
          {
            model: mahasiswas,
            attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
          },
          { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
          { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
        ]
      })
    }

    if (!jenisDokumen || jenisDokumen === 'finalprojects') {
      finalprojectsResult = await finalprojects.findAndCountAll({
        where: searchQuery,
        limit: parseInt(pageSize, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(pageSize, 10),
        order: [['title', 'ASC']],
        include: [
          {
            model: mahasiswas,
            attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
          },
          { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
          { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
        ]
      })
    }

    const finalProjectsData = finalProjectsResult.rows.map(finalProject => {
      const { berkas_finalprojects, ...finalProjectData } =
        finalProject.toJSON()
      return finalProjectData
    })

    const finalprojectsData = finalprojectsResult.rows.map(finalprojects => {
      const { berkas_finalprojects, ...finalprojectsData } =
        finalprojects.toJSON()
      return finalprojectsData
    })

    const combinedData = [...finalProjectsData, ...finalprojectsData]
    const totalCount = finalProjectsResult.count + finalprojectsResult.count
    const totalPages = Math.ceil(totalCount / pageSize)

    const response = {
      message: 'Success fetch final projects and finalprojectss by name',
      total_count: totalCount,
      total_pages: totalPages,
      current_page: parseInt(page, 10),
      data: combinedData
    }

    res.status(200).json(response)
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch final projects and finalprojectss by name',
      error: err.toString()
    })
  }
}

async function getAllSameProjectPublic (req, res, next) {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        message: "Missing search query parameter 'q'",
        data: []
      })
    }

    // Membuat pola pencarian untuk LIKE query
    const searchPattern = `%${q}%`

    // Cari di finalprojects berdasarkan judul
    const finalProjects = await finalprojects.findAll({
      where: {
        title: {
          [Op.like]: searchPattern
        }
      }
    })

    // Cari di finalprojectss berdasarkan judul
    const finalprojectsProjects = await finalprojects.findAll({
      where: {
        title: {
          [Op.like]: searchPattern
        }
      }
    })

    // Gabungkan hasil dari finalprojects dan finalprojectss
    const allProjects = [
      ...finalProjects.map(project => ({
        ...project.toJSON(),
        dataType: 'finalprojects'
      })),
      ...finalprojectsProjects.map(project => ({
        ...project.toJSON(),
        dataType: 'finalprojects'
      }))
    ]

    if (allProjects.length === 0) {
      return res.status(404).json({
        message: `No projects found with similar titles for query '${q}'`,
        data: []
      })
    }

    res.status(200).json({
      message: 'Success',
      data: allProjects
    })
  } catch (err) {
    console.error('Error fetching projects:', err)
    res.status(500).json({
      message: 'Failed to fetch projects',
      error: err.toString()
    })
  }
}

const getAllFakultasTotalCount = async (req, res) => {
  try {
    // Ambil semua fakultas_id yang unik
    const uniqueFakultasIds = await finalprojects.findAll({
      attributes: ['fakultas_id'],
      group: ['fakultas_id'],
      raw: true
    })

    // Ambil nama_fakultas dari model fakultas berdasarkan fakultas_id
    const fakultasWithTotalProjects = await Promise.all(
      uniqueFakultasIds.map(async fakultasData => {
        const { fakultas_id } = fakultasData
        const fakultasInfo = await fakultas.findOne({
          where: { fakultas_id },
          attributes: ['nama_fakultas']
        })

        const total_project = await finalprojects.count({
          where: { fakultas_id }
        })

        return {
          fakultas_id,
          nama_fakultas: fakultasInfo.nama_fakultas, // Ambil nama_fakultas dari hasil query
          total_project
        }
      })
    )

    // Siapkan data untuk dikirim sebagai response
    const response = {
      message: 'Success fetch',
      data: fakultasWithTotalProjects
    }

    // Kirim response
    res.json(response)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getAllFinalProjectsStatusCount = async (req, res) => {
  try {
    const pendingCount = await finalprojects.count({
      where: { status: 'pending' }
    })
    const approvedCount = await finalprojects.count({
      where: { status: 'approved' }
    })
    const rejectedCount = await finalprojects.count({
      where: { status: 'rejected' }
    })

    const data = {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    }

    res.status(200).json({
      message: 'Success fetch data',
      data: [data]
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({
      message: 'Error fetching data',
      error: error.message
    })
  }
}

const updateStatusProject = async (req, res) => {
  const finalProjectId = req.params.id

  const { status, catatan } = req.body

  // Validasi status
  const validStatuses = ['Pending', 'Approved', 'Rejected']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message:
        'Invalid status. Status must be one of: Pending, Approved, Rejected.'
    })
  }

  try {
    // Cari project berdasarkan ID
    const project = await finalprojects.findByPk(finalProjectId)

    // Jika project tidak ditemukan
    if (!project) {
      return res.status(404).json({
        message: 'Project not found.'
      })
    }

    // Update status project
    project.status = status
    project.catatan = catatan
    await project.save()

    res.status(200).json({
      message: 'Project status updated successfully.',
      data: project
    })
  } catch (error) {
    console.error('Error updating project status:', error)
    res.status(500).json({
      message: 'Error updating project status.',
      error: error.message
    })
  }
}

paginate.paginate(finalprojects)

module.exports = {
  createFinalProjects,
  getAllFinalProjects,
  getFinalProjectsById,
  getAllFinalProjectsByUserId,
  getDetailProjectsPublicById,
  getAllFinalProjectsPublic,
  updateFinalProjects,
  deleteFinalProjects,
  advancedSearchProjectsPublic,
  searchProjectPublic,
  getAllSameProjectPublic,
  getAllFakultasTotalCount,
  getAllFinalProjectsStatusCount,
  updateStatusProject
}
