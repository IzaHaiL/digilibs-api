const {
  researchs,
  mahasiswa,
  dosen,
  prodi,
  fakultas,
  kategori,
  berkas,
} = require('../databases/models')
const { nanoid } = require('nanoid')
const { Op } = require('sequelize')
const Validator = require('fastest-validator')
const v = new Validator()
const paginate = require('sequelize-paginate')
const { uploadFileToSpace , deleteFileFromSpace } = require('../middlewares/multer')
// Create a new researchs
async function createResearch(req, res, next) {
  try {
    console.log('Received kontributor:', req.body.kontributor);
    console.log('Received kategori:', req.body.kategori);

    const Dosen = await dosen.findOne({ where: { user_id: req.users.user_id } });
    if (!Dosen) {
      return res.status(404).json({
        message: 'Dosen data not found for the current users'
      });
    }

    const data = {
      user_id: req.users.user_id,
      dosen_id: Dosen.dosen_id,
      title: req.body.title,
      title_eng: req.body.title_eng,
      abstract: req.body.abstract,
      abstract_eng: req.body.abstract_eng,
      fakultas_id: Dosen.fakultas_id,
      prodi_id: Dosen.prodi_id,
      url_research: req.body.url_research,
      berkas_research: req.body.berkas_research,
      submissionDate: req.body.submissionDate,
      aprovaldate: req.body.aprovaldate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const schema = {
      title: { type: 'string', min: 5, max: 255, optional: false },
      abstract: { type: 'string', optional: false },
      fakultas_id: { type: 'string', optional: false },
      prodi_id: { type: 'string', optional: false },
      url_research: { type: 'string', optional: true },
      submissionDate: { type: 'date', optional: true },
      kontributor: { type: 'array', optional: true },
      kategori: { type: 'array', optional: true }
    };

    const validationResult = v.validate(data, schema);
    if (validationResult !== true) {
      return res.status(400).json({
        message: 'Validation Failed',
        data: validationResult
      });
    }

    const result = await researchs.create(data);

    const files = req.files;
    if (files && files.length > 0) {
      const fileRecords = await Promise.all(
        files.map(async (file) => {
          const fileLocation = await uploadFileToSpace(file.buffer, file.originalname, 'researchs');
          return await berkas.create({
            url_berkas: fileLocation,
            research_id: result.research_id
          });
        })
      );
      result.files = fileRecords;
    }

    if (req.body.kategori && Array.isArray(req.body.kategori)) {
      const categories = req.body.kategori;
      const categoryRecords = await kategori.findAll({
        where: {
          kategori_id: categories
        }
      });
      await result.addKategori(categoryRecords);
    }

    if (req.body.kontributor && Array.isArray(req.body.kontributor)) {
      const kontributors = req.body.kontributor;
      const kontributorRecords = await dosen.findAll({
        where: {
          dosen_id: kontributors
        }
      });
      await result.addKontributor(kontributorRecords);
    }

    res.status(201).json({
      message: 'Research Created Successfully',
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Create Research Failed',
      data: err
    });
  }
}
async function getAllResearch (req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10
    const year = req.query.year ? parseInt(req.query.year, 10) : null

    // Prepare conditions for where clause
    let whereCondition = {}

    if (year) {
      whereCondition.createdAt = {
        [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
        [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`)
      }
    }

    const result = await researchs.paginate({
      page: page,
      paginate: pageSize,
      where: whereCondition, // Include the where condition for filtering by year
      include: [
        { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodi, attributes: ['prodi_id', 'nama_prodi'] },
        {
          model: berkas,
          attributes: ['berkas_id', 'url_berkas'],
          as: 'berkas'
        },
        {
          model: kategori,
          attributes: ['kategori_id', 'nama_kategori'],
          through: {attributes: [] },
          as: 'kategori'
        },
        {
          model: dosen,
          attributes: ['dosen_id', 'nama_dosen', 'nidn'],
          through: {attributes: [] },
          as: 'kontributor'
        }
      ]
    })

    const response = {
      message: 'Success fetch researchs',
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs
    }

    res.send(response)
  } catch (err) {
    console.error('Error fetching researchs:', err)
    res.status(500).send({ error: 'Internal Server Error' })
  }
}
async function getAllResearchByUserId (req, res, next) {
  try {
    const userIdFromToken = req.users.user_id

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await researchs.findAndCountAll({
      where: { user_id: userIdFromToken },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodi, attributes: ['prodi_id', 'nama_prodi'] },
        {
          model: berkas,
          attributes: ['berkas_id', 'url_berkas'],
          as: 'berkas'
        },
        {
          model: kategori,
          attributes: ['kategori_id', 'nama_kategori'],
          through: {attributes: [] },
          as: 'kategori'
        },
        {
          model: dosen,
          attributes: ['dosen_id', 'nama_dosen', 'nidn'],
          through: {attributes: [] },
          as: 'kontributor'
        }
      ]
    })
    if (result.count === 0) {
      return res.status(404).json({
        message: 'researchs Project not found',
        data: null
      })
    }

    const response = {
      message: 'Success fetching researchs projects by users ID',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    }

    res.status(200).json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch researchs projects',
      error: err.message
    })
  }
}


async function getResearchById (req, res, next) {
  try {
    const researchId = req.params.id

    const research = await researchs.findByPk(researchId, {
      include: [
        { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodi, attributes: ['prodi_id', 'nama_prodi'] },
        {
          model: berkas,
          attributes: ['berkas_id', 'url_berkas'],
          as: 'berkas'
        },
        {
          model: kategori,
          attributes: ['kategori_id', 'nama_kategori'],
          through: {attributes: [] },
          as: 'kategori'
        },
        {
          model: dosen,
          attributes: ['dosen_id', 'nama_dosen', 'nidn'],
          through: {attributes: [] },
          as: 'kontributor'
        }
      ]
    })

    if (!research) {
      res.status(404).json({
        message: 'researchs Project not found',
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
      message: 'Read researchs Project Failed',
      data: err.toString()
    })
  }
}

async function updateResearch(req, res, next) {
  console.log('files:', req.files);
  try {
    const research = await researchs.findByPk(req.params.research_id);

    if (!research) {
      return res.status(404).json({
        message: 'Research not found'
      });
    }

    // Prepare data for update
    const data = {};
    if (req.body.title) data.title = req.body.title;
    if (req.body.title_eng) data.title_eng = req.body.title_eng;
    if (req.body.abstract) data.abstract = req.body.abstract;
    if (req.body.abstract_eng) data.abstract_eng = req.body.abstract_eng;
    if (req.body.url_research) data.url_research = req.body.url_research;
    if (req.body.submissionDate) data.submissionDate = req.body.submissionDate;
    if (req.body.aprovaldate) data.aprovaldate = req.body.aprovaldate;
    data.updatedAt = new Date();

    // Update the research only if there are changes
    if (Object.keys(data).length > 1) {
      await research.update(data);
    }

    // Handle file uploads to cloud storage
    if (req.files && req.files.length > 0) {
      // Add new files
      const fileRecords = await Promise.all(
        req.files.map(async (file) => {
          const fileLocation = await uploadFileToSpace(file.buffer, file.originalname, 'researchs');
          return await berkas.create({
            url_berkas: fileLocation,
            research_id: research.research_id
          });
        })
      );
      research.files = research.files ? [...research.files, ...fileRecords] : fileRecords; // Ensure research.files is an array
    }

    // Handle file deletions
    if (req.body.deletedFileIds && req.body.deletedFileIds.length > 0) {
      const deletedFileIds = req.body.deletedFileIds.split(',');

      console.log('Files to be deleted:', deletedFileIds); // Log files to be deleted

      // Find and delete files from cloud storage and database
      const oldFiles = await berkas.findAll({
        where: { research_id: research.research_id, berkas_id: deletedFileIds }
      });

      oldFiles.forEach(async (file) => {
        try {
          await deleteFileFromSpace(file.url_berkas);
          await file.destroy();
          console.log(`Deleted file: ${file.url_berkas}`); // Log each deleted file
        } catch (err) {
          console.error(`Error deleting file ${file.url_berkas}:`, err);
        }
      });
    }

    // Handle categories association
    let categories = req.body.kategori;
    if (categories && !Array.isArray(categories)) {
      categories = categories.split(',');
    }

    if (categories && Array.isArray(categories)) {
      const categoryRecords = await kategori.findAll({
        where: {
          kategori_id: categories
        }
      });

      await research.setKategori(categoryRecords);
    }

    // Handle kontributors association
    let kontributors = req.body.kontributor;
    if (kontributors && !Array.isArray(kontributors)) {
      kontributors = kontributors.split(',');
    }

    if (kontributors && Array.isArray(kontributors)) {
      const kontributorRecords = await dosen.findAll({
        where: {
          dosen_id: kontributors
        }
      });

      await research.setKontributor(kontributorRecords);
    }

    res.status(200).json({
      message: 'Research Updated Successfully',
      data: research
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Update Research Failed',
      data: err
    });
  }
}

async function deleteResearch (req, res, next) {
  try {
    const researchId = req.params.id

    const existingResearch = await researchs.findByPk(researchId)

    if (!existingResearch) {
      const error = new Error('researchs not found');
      error.status = 404;
      throw error;
    }

    // Hapus file yang terkait di cloud storage
    const relatedFiles = await berkas.findAll({
      where: { research_id: researchId }
    });

    let failedToDeleteFiles = [];

    for (const file of relatedFiles) {
      try {
        await deleteFileFromSpace(file.url_berkas);
        await file.destroy();
        console.log(`Deleted file: ${file.url_berkas}`);
      } catch (err) {
        console.error(`Error deleting file ${file.url_berkas}:`, err);
        failedToDeleteFiles.push(file.url_berkas);
      }
    }

    const result = await researchs.destroy({
      where: { research_id: researchId }
    })

    if (failedToDeleteFiles.length > 0) {
      return res.status(500).json({
        message: 'Delete researchs Failed. Some files in cloud storage were not deleted.',
        data: {
          deletedResearch: result,
          failedToDeleteFiles: failedToDeleteFiles
        }
      });
    }

    res.status(200).json({
      message: 'Success Delete Data',
      data: result
    })
  } catch (err) {
    console.error(err)
    if (err.status === 404) {
      res.status(404).json({
        message: err.message,
        data: null
      })
    } else {
      res.status(500).json({
        message: 'Delete researchs Failed',
        data: err.toString()
      })
    }
  }
}

async function validatedResearch (req, res, next) {
  try {
    const research_id = req.params.id

    const existingResearch = await researchs.findByPk(research_id)

    if (!existingResearch) {
      res.status(404).json({
        message: 'researchs not found',
        data: null
      })
      return
    }

    const result = await researchs.update(
      { is_validated: true },
      { where: { research_id: research_id } }
    )

    res.status(200).json({
      message: 'Success Validated researchs',
      data: result
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Validated researchs Failed',
      data: err.toString()
    })
  }
}
async function getAllResearchPublic (req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10
    const result = await researchs.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodi, attributes: ['prodi_id', 'nama_prodi'] },
        {
          model: kategori,
          attributes: ['kategori_id', 'nama_kategori'],
          through: {attributes: [] },
          as: 'kategori'
        },
        {
          model: dosen,
          attributes: ['dosen_id', 'nama_dosen', 'nidn'],
          through: {attributes: [] },
          as: 'kontributor'
        }
      ]
    })
    const researchData = result.rows.map(researchs => {
      const { berkas_research, ...researchData } = researchs.toJSON()
      return researchData
    })

    const response = {
      message: 'Success fetch researchs projects',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: researchData
    }

    res.send(response)
  } catch (err) {
    res.status(500).send({
      message: 'Fetch researchs Projects Failed',
      data: err.toString()
    })
  }
}

async function getDetailProjectsPublicById (req, res, next) {
  try {
    const researchId = req.params.id

    const project = await researchs.findByPk(researchId, {
      include: [
        { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodi, attributes: ['prodi_id', 'nama_prodi'] },
        {
          model: kategori,
          attributes: ['kategori_id', 'nama_kategori'],
          through: {attributes: [] },
          as: 'kategori'
        },
        {
          model: dosen,
          attributes: ['dosen_id', 'nama_dosen', 'nidn'],
          through: {attributes: [] },
          as: 'kontributor'
        }
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
    const uniqueFakultasIds = await researchs.findAll({
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

        const total_project = await researchs.count({
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
    const pendingCount = await researchs.count({ where: { status: 'pending' } })
    const approvedCount = await researchs.count({
      where: { status: 'approved' }
    })
    const rejectedCount = await researchs.count({
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
    const project = await researchs.findByPk(project_id)

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

async function getAllResearchByFakultasName (req, res) {
  const user_id = req.users.user_id
  const role = req.users.role

  try {
    // Check if the role is 'fakultas'
    if (role !== 'fakultas') {
      return res.status(403).json({ message: 'Access denied', data: null })
    }

    // Fetch users details to get fakultas_id
    const fakultasUser = await fakultas.findOne({ where: { user_id: user_id } })

    if (!fakultasUser) {
      return res
        .status(404)
        .json({ message: 'Fakultas users not found', data: null })
    }

    const fakultasId = fakultasUser.fakultas_id

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10
    const year = req.query.year ? parseInt(req.query.year) : null

    // Prepare conditions for where clause
    let whereCondition = { fakultas_id: fakultasId }

    if (year) {
      whereCondition.createdAt = {
        [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
        [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`)
      }
    }

    // Fetch researchs based on fakultas_id and optional year filter
    const { count, rows: research } = await researchs.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']], // Optional: default sorting
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodi, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    res.status(200).json({
      message: `research for Fakultas ${fakultasId} retrieved successfully`,
      total_count: count,
      total_pages: Math.ceil(count / pageSize),
      current_page: page,
      data: research
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function getAllResearchByProdiName (req, res) {
  const user_id = req.users.user_id
  const role = req.users.role

  try {
    // Check if the role is 'fakultas'
    if (role !== 'prodi') {
      return res.status(403).json({ message: 'Access denied', data: null })
    }

    // Fetch users details to get fakultas_id
    const prodiUser = await prodi.findOne({ where: { user_id: user_id } })

    if (!prodiUser) {
      return res
        .status(404)
        .json({ message: 'Fakultas users not found', data: null })
    }

    const prodiId = prodiUser.prodi_id

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10
    const year = req.query.year ? parseInt(req.query.year) : null
    const prodiName = req.query.prodiName ? req.query.prodiName.trim() : null

    // Prepare conditions for where clause
    let whereCondition = { '$prodi.prodi_id$': prodiId } // Note the use of aliasing for include model

    if (prodiName) {
      whereCondition['$prodi.nama_prodi$'] = prodiName // Using alias to reference the included model
    }

    if (year) {
      whereCondition.createdAt = {
        [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
        [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`)
      }
    }

    const { count, rows: research } = await researchs.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']], // Optional: default sorting
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
        { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
        { model: prodi, attributes: ['prodi_id', 'nama_prodi'] }
      ]
    })

    res.status(200).json({
      message: `research for Prodi ${prodiId} retrieved successfully`,
      total_count: count,
      total_pages: Math.ceil(count / pageSize),
      current_page: page,
      data: research
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getResearchStatusCountByProdi = async (req, res) => {
  try {
    const user_id = req.users.user_id
    const role = req.users.role

    // Pastikan role users adalah 'prodi'
    if (role !== 'prodi') {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Ambil data prodi berdasarkan user_id
    const prodiUser = await prodi.findOne({ where: { user_id: user_id } })
    if (!prodiUser) {
      return res.status(404).json({ message: 'Prodi users not found' })
    }

    const prodiId = prodiUser.prodi_id

    // Hitung jumlah final projects berdasarkan status dan prodi_id
    const pendingCount = await researchs.count({
      where: { status: 'pending', prodi_id: prodiId }
    })
    const approvedCount = await researchs.count({
      where: { status: 'approved', prodi_id: prodiId }
    })
    const rejectedCount = await researchs.count({
      where: { status: 'rejected', prodi_id: prodiId }
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

async function getAllResearchsTotal (req, res) {
  try {
    // Fetch all unique fakultas_id from finalprojects
    const uniqueFakultasIds = await researchs.findAll({
      attributes: ['fakultas_id'],
      group: ['fakultas_id'],
      raw: true
    })

    // Fetch final projects for each unique fakultas_id
    const fakultasProjects = await Promise.all(
      uniqueFakultasIds.map(async fakultasData => {
        const { fakultas_id } = fakultasData

        // Prepare pagination parameters
        const page = parseInt(req.query.page, 10) || 1
        const pageSize = parseInt(req.query.pageSize, 10) || 10
        const year = req.query.year ? parseInt(req.query.year) : null

        // Prepare conditions for where clause
        let whereCondition = { fakultas_id }

        if (year) {
          whereCondition.createdAt = {
            [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
            [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`)
          }
        }

        // Fetch final projects based on fakultas_id and optional year filter
        const { count, rows: research } = await researchs.findAndCountAll({
          where: whereCondition,
          order: [['createdAt', 'DESC']], // Optional: default sorting
          limit: pageSize,
          offset: (page - 1) * pageSize,
          include: [
            { model: dosen, attributes: ['dosen_id', 'nama_dosen', 'nidn'] },
            { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
            { model: prodi, attributes: ['prodi_id', 'nama_prodi'] }
          ]
        })

        return {
          fakultas_id,
          total_count: count,
          total_pages: Math.ceil(count / pageSize),
          current_page: page,
          data: research
        }
      })
    )

    // Respond with all projects data for each fakultas_id
    res.status(200).json({
      message: 'Final Projects retrieved successfully',
      data: fakultasProjects
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

paginate.paginate(researchs)

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
  getAllResearchByFakultasName,
  getAllResearchByProdiName,
  getResearchStatusCountByProdi,
  getAllResearchsTotal,
  updateStatusProject
}
