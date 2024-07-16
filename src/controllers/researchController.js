const {
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

// Create a new research
async function createResearch (req, res, next) {
  try {
    const dosen = await dosens.findOne({ where: { user_id: req.user.user_id } })
    if (!dosen) {
      return res.status(404).json({
        message: 'Mahasiswa data not found for the current user'
      })
    }
    const data = {
      user_id: req.user.user_id,
      dosen_id: dosen.dosen_id,
      title: req.body.title,
      title_eng: req.body.title_eng,
      abstract: req.body.abstract,
      abstract_eng: req.body.abstract_eng,
      kontributor: req.body.kontributor,
      fakultas_id: dosen.fakultas_id,
      prodi_id: dosen.prodi_id,
      url_research: req.body.url_research,
      berkas_research: req.body.berkas_research,
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
      url_research: { type: 'string', optional: true },
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
    const result = await research.create(data)
    res.status(201).json({
      message: 'researchs Created Successfully',
      data: result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Create researchs Failed',
      data: err
    })
  }
}

async function getAllResearch (req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await research.paginate({
      page: page,
      paginate: pageSize,
      include: [
        { model: dosens, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    const response = {
      message: 'Success fetch research',
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs
    }

    res.send(response)
  } catch (err) {
    res.status(500).send(err)
  }
}
async function getAllResearchByUserId (req, res, next) {
  try {
    const userIdFromToken = req.user.user_id

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await research.findAndCountAll({
      where: { user_id: userIdFromToken },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: dosens, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
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
async function getResearchById (req, res, next) {
  try {
    const research_id = req.params.id

    const research = await research.findByPk(research_id, {
      include: [
        { model: dosens, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    if (!research) {
      res.status(404).json({
        message: 'Research not found',
        data: null
      })
    } else {
      res.status(200).json({
        message: 'Success',
        data: research
      })
    }
  } catch (err) {
    res.status(500).json({
      message: 'Read Research Failed',
      data: err.toString()
    })
  }
}

async function getResearchById (req, res, next) {
  try {
    const researchId = req.params.id

    const researchs = await research.findByPk(researchId, {
      include: [
        { model: dosens, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    if (!research) {
      res.status(404).json({
        message: 'Final Project not found',
        data: null
      })
    } else {
      res.status(200).json({
        message: 'Success',
        data: researchs
      })
    }
  } catch (err) {
    res.status(500).json({
      message: 'Read Final Project Failed',
      data: err.toString()
    })
  }
}

async function updateResearch (req, res, next) {
  try {
    const { research_id } = req.params

    // Periksa apakah final project dengan project_id yang diberikan ada di database
    const existingProject = await research.findByPk(research_id)
    if (!existingProject) {
      return res.status(404).json({
        message: 'Researchs not found'
      })
    }

    // Dapatkan data dosen dari database berdasarkan user_id dari JWT
    const dosen = await dosens.findOne({ where: { user_id: req.user.user_id } })

    if (!dosen) {
      return res.status(404).json({
        message: 'Dosen data not found for the current user'
      })
    }

    // Konfigurasi data yang akan diupdate
    const dataToUpdate = {
      title: req.body.title || existingProject.title,
      title_eng: req.body.title_eng || existingProject.title_eng,
      abstract: req.body.abstract || existingProject.abstract,
      abstract_eng: req.body.abstract_eng || existingProject.abstract_eng,
      kontributor: req.body.kontributor || existingProject.kontributor,
      fakultas_id: req.body.fakultas_id || mahasiswa.fakultas_id,
      prodi_id: req.body.prodi_id || mahasiswa.prodi_id,
      ulr_research: req.body.ulr_research || existingProject.ulr_research,
      berkas_research:
        req.body.berkas_research || existingProject.berkas_research,
      submissiondate: req.body.submissiondate || existingProject.submissiondate,
      aprovaldate: req.body.aprovaldate || existingProject.aprovaldate,
      updatedAt: new Date()
    }

    // Validasi data yang akan diupdate
    const schema = {
      title: { type: 'string', min: 5, max: 255, optional: true },
      abstract: { type: 'string', optional: true },
      kontributor: { type: 'string', optional: true },
      fakultas_id: { type: 'string', optional: true },
      prodi_id: { type: 'string', optional: true },
      ulr_research: { type: 'string', optional: true },
      berkas_research: { type: 'string', optional: true },
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
    await research.update(dataToUpdate, {
      where: { project_id: project_id }
    })

    // Ambil data final project yang telah diupdate
    const updatedProject = await research.findByPk(research_id)

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

async function deleteResearch (req, res, next) {
  try {
    const research_id = req.params.id

    const existingResearch = await research.findByPk(research_id)

    if (!existingResearch) {
      res.status(404).json({
        message: 'Research not found',
        data: null
      })
      return
    }

    const result = await research.destroy({
      where: { research_id: research_id }
    })

    res.status(200).json({
      message: 'Success Delete Data',
      data: result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Delete Research Failed',
      data: err.toString()
    })
  }
}

async function validatedResearch (req, res, next) {
  try {
    const research_id = req.params.id

    const existingResearch = await research.findByPk(research_id)

    if (!existingResearch) {
      res.status(404).json({
        message: 'Research not found',
        data: null
      })
      return
    }

    const result = await research.update(
      { is_validated: true },
      { where: { research_id: research_id } }
    )

    res.status(200).json({
      message: 'Success Validated Research',
      data: result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Validated Research Failed',
      data: err.toString()
    })
  }
}
async function getAllResearchPublic (req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10
    const result = await research.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: dosens, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodis, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })
    const researchData = result.rows.map(research => {
      const { berkas_research, ...researchData } = research.toJSON()
      return researchData
    })

    const response = {
      message: 'Success fetch final projects',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: researchData
    }

    res.send(response)
  } catch (err) {
    res.status(500).send({
      message: 'Fetch Final Projects Failed',
      data: err.toString()
    })
  }
}

async function getDetailProjectsPublicById (req, res, next) {
  try {
    const researchId = req.params.id

    const project = await research.findByPk(researchId, {
      include: [
        { model: dosens, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
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
    const { berkas_research, ...filteredData } = project.toJSON()

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

const getAllFakultasTotalCount = async (req, res) => {
  try {
    // Ambil semua fakultas_id yang unik
    const uniqueFakultasIds = await research.findAll({
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

        const total_project = await research.count({
          where: { fakultas_id }
        })

        return {
          fakultas_id,
          nama_fakultas: fakultasInfo.nama_fakultas, 
          total_project
        }
      })
    )
    const response = {
      message: 'Success fetch',
      data: fakultasWithTotalProjects
    }
    res.json(response)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getAllResearchStatusCount = async (req, res) => {
  try {
    const pendingCount = await research.count({ where: { status: 'pending' } })
    const approvedCount = await research.count({
      where: { status: 'approved' }
    })
    const rejectedCount = await research.count({
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
  const project_id = req.params.id

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
    const project = await research.findByPk(project_id)

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

paginate.paginate(research)

module.exports = {
  createResearch,
  getAllResearch,
  getResearchById,
  updateResearch,
  deleteResearch,
  validatedResearch,
  getAllResearchByUserId,
  getAllFakultasTotalCount,
  getAllResearchPublic,
  getDetailProjectsPublicById,
  getAllResearchStatusCount,
  updateStatusProject
}
