const {
  finalprojects,
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


async function createFinalProjects(req, res, next) {
  try {
    console.log('Received kontributor:', req.body.kontributor);
    console.log('Received kategori:', req.body.kategori);


    const Mahasiswa = await mahasiswa.findOne({
      where: { user_id: req.users.user_id }
    });

    if (!Mahasiswa) {
      return res.status(404).json({
        message: 'Mahasiswa data not found for the current user'
      });
    }

    // Data for the FinalProjects model
    const data = {
      user_id: req.users.user_id,
      mahasiswa_id: Mahasiswa.mahasiswa_id,
      title: req.body.title,
      title_eng: req.body.title_eng,
      abstract: req.body.abstract,
      abstract_eng: req.body.abstract_eng,
      fakultas_id: Mahasiswa.fakultas_id,
      prodi_id: Mahasiswa.prodi_id,
      url_finalprojects: req.body.url_finalprojects,
      submissionDate: req.body.submissionDate,
      approvalDate: req.body.approvalDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Schema for validation
    const schema = {
      title: { type: 'string', min: 1, max: 255, optional: false },
      title_eng: { type: 'string', min: 1, max: 255, optional: false },
      abstract: { type: 'string', min: 1, max: 2000, optional: false },
      abstract_eng: { type: 'string', min: 1, max: 2000, optional: false },
      kategori: { type: 'array', optional: true },
      url_finalprojects: { type: 'string', max: 500, optional: true },
      submissionDate: { type: 'date', optional: true }, 
      approvalDate: { type: 'date', optional: true },
      user_id: { type: 'string', min: 1, max: 20, optional: true },
      mahasiswa_id: { type: 'string', min: 1, max: 20, optional: true },
      prodi_id: { type: 'string', min: 1, max: 50, optional: true },
      fakultas_id: { type: 'string', min: 1, max: 50, optional: true },
      kontributor: { type: 'array', optional: true }, // Updated to kontributor
      kategori: { type: 'array', optional: true } // Updated to kategori
    };

    // Validate the data
    const validationResult = v.validate(data, schema);
    if (validationResult !== true) {
      return res.status(400).json({
        message: 'Validation Failed',
        data: validationResult
      });
    }

    // Create the FinalProjects entry
    const finalProject = await finalprojects.create(data);

    // Handle file uploads to cloud storage
    const files = req.files; // Assuming you have configured multer to handle multiple files
    if (files && files.length > 0) {
      const fileRecords = await Promise.all(
        files.map(async (file) => {
          const fileLocation = await uploadFileToSpace(file.buffer, file.originalname, 'finalprojects');
          return await berkas.create({
            url_berkas: fileLocation,
            project_id: finalProject.project_id
          });
        })
      );
      finalProject.files = fileRecords; // Attach file records to the final project
    }

    // Handle categories association
    if (req.body.kategori && Array.isArray(req.body.kategori)) {
      const categories = req.body.kategori;

      // Find all category records
      const categoryRecords = await kategori.findAll({
        where: {
          kategori_id: categories
        }
      });

      // Associate the FinalProject with the categories
      await finalProject.addKategori(categoryRecords);
    }

    // Handle kontributors association
    if (req.body.kontributor && Array.isArray(req.body.kontributor)) {
      const kontributors = req.body.kontributor;

      // Find all kontributor records
      const kontributorRecords = await dosen.findAll({
        where: {
          dosen_id: kontributors
        }
      });

      // Associate the FinalProject with the kontributors
      await finalProject.addKontributor(kontributorRecords); // Use the updated alias
    }

    res.status(201).json({
      message: 'Final Project Created Successfully',
      data: finalProject
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Create Final Project Failed',
      data: err
    });
  }
}

async function getAllFinalProjects(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const year = req.query.year ? parseInt(req.query.year, 10) : null;

    // Prepare conditions for the where clause
    let whereCondition = {};

    if (year) {
      whereCondition.createdAt = {
        [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
        [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`),
      };
    }

    // Paginate and include related models
    const result = await finalprojects.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: mahasiswa,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        {
          model: fakultas,
          attributes: ['fakultas_id', 'nama_fakultas']
        },
        {
          model: prodi,
          attributes: ['prodi_id', 'nama_prodi']
        },
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
      ],
      order: [['createdAt', 'DESC']]
    });

    const response = {
      message: 'Success fetch final projects',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows
    };

    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
}

async function getAllFinalProjectsByUserId (req, res, next) {
  try {
    const userIdFromToken = req.users.user_id // Mengambil user_id dari JWT

    const page = parseInt(req.query.page, 10) || 1
    const pageSize = parseInt(req.query.pageSize, 10) || 10

    const result = await finalprojects.findAndCountAll({
      where: { user_id: userIdFromToken },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: mahasiswa,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        {
          model: fakultas,
          attributes: ['fakultas_id', 'nama_fakultas']
        },
        {
          model: prodi,
          attributes: ['prodi_id', 'nama_prodi']
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
      ],
    })

    if (result.count === 0) {
      return res.status(404).json({
        message: 'Final Project not found',
        data: null
      })
    }

    const response = {
      message: 'Success fetching final projects by users ID',
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
          model: mahasiswa,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
        {
          model: fakultas,
          attributes: ['fakultas_id', 'nama_fakultas']
        },
        {
          model: prodi,
          attributes: ['prodi_id', 'nama_prodi']
        },
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
      ],
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

async function updateFinalProjects(req, res, next) {
  console.log('files:', req.files);
  try {
    const finalProject = await finalprojects.findByPk(req.params.project_id);

    if (!finalProject) {
      return res.status(404).json({
        message: 'Final Project not found'
      });
    }

    // Prepare data for update
    const data = {};
    if (req.body.title) data.title = req.body.title;
    if (req.body.title_eng) data.title_eng = req.body.title_eng;
    if (req.body.abstract) data.abstract = req.body.abstract;
    if (req.body.abstract_eng) data.abstract_eng = req.body.abstract_eng;
    if (req.body.url_finalprojects) data.url_finalprojects = req.body.url_finalprojects;
    if (req.body.submissionDate) data.submissionDate = req.body.submissionDate;
    if (req.body.approvalDate) data.approvalDate = req.body.approvalDate;
    data.updatedAt = new Date();

    // Update the project only if there are changes
    if (Object.keys(data).length > 1) {
      await finalProject.update(data);
    }

    // Handle file uploads to cloud storage
    if (req.files && req.files.length > 0) {
      // Add new files
      const fileRecords = await Promise.all(
        req.files.map(async (file) => {
          const fileLocation = await uploadFileToSpace(file.buffer, file.originalname, 'finalprojects');
          return await berkas.create({
            url_berkas: fileLocation,
            project_id: finalProject.project_id
          });
        })
      );
      finalProject.files = finalProject.files ? [...finalProject.files, ...fileRecords] : fileRecords; // Ensure finalProject.files is an array
    }

    // Handle file deletions
    if (req.body.deletedFileIds && req.body.deletedFileIds.length > 0) {
      const deletedFileIds = req.body.deletedFileIds.split(',');

      console.log('Files to be deleted:', deletedFileIds); // Log files to be deleted

      // Find and delete files from cloud storage and database
      const oldFiles = await berkas.findAll({
        where: { project_id: finalProject.project_id, berkas_id: deletedFileIds }
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

      await finalProject.setKategori(categoryRecords);
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

      await finalProject.setKontributor(kontributorRecords);
    }

    res.status(200).json({
      message: 'Final Project Updated Successfully',
      data: finalProject
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Update Final Project Failed',
      data: err
    });
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
          model: mahasiswa,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
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
          model: mahasiswa,
          attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
        },
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
        
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['total_views', 'DESC']]
    })

    const finalProjectsData = result.rows.map(finalProject => {
      // Convert the finalProject instance to JSON
      const finalProjectData = finalProject.toJSON();
      // Return the full data including related entities
      return finalProjectData;
    });
    
    const response = {
      message: 'Success fetch final projects',
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: finalProjectsData
    };

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

    // Query for researchs model
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
            model: mahasiswa,
            attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
          },
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
      }),
      researchs.findAndCountAll({
        where: researchQuery,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['title', 'ASC']],
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
      message: 'Success fetch final projects and researchs by name',
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
      message: 'Failed to fetch final projects and researchs by name',
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
            model: mahasiswa,
            attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
          },
          { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
          { model: prodi, attributes: ['prodi_id', 'nama_prodi'] }
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
            model: mahasiswa,
            attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim']
          },
          { model: fakultas, attributes: ['fakultas_id', 'nama_fakultas'] },
          { model: prodi, attributes: ['prodi_id', 'nama_prodi'] }
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

async function getAllFinalProjectsByFakultasName(req, res) {
  const user_id = req.users.user_id;
  const role = req.users.role;

  try {
    // Check if the role is 'fakultas'
    if (role !== 'fakultas') {
      return res.status(403).json({ message: 'Access denied', data: null });
    }

    // Fetch users details to get fakultas_id
    const fakultasUser = await fakultas.findOne({ where: { user_id: user_id } });

    if (!fakultasUser) {
      return res.status(404).json({ message: 'Fakultas users not found', data: null });
    }

    const fakultasId = fakultasUser.fakultas_id;

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const year = req.query.year ? parseInt(req.query.year) : null;

    // Prepare conditions for where clause
    let whereCondition = { fakultas_id: fakultasId };

    if (year) {
      whereCondition.createdAt = {
        [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
        [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`),
      };
    }

    // Fetch final projects based on fakultas_id and optional year filter
    const { count, rows: finalProjects } = await finalprojects.findAndCountAll({ 
      where: whereCondition,
      order: [['createdAt', 'DESC']], // Optional: default sorting
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: mahasiswa, attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim'] },
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
    });

    res.status(200).json({
      message: `Final Projects for Fakultas ${fakultasId} retrieved successfully`,
      total_count: count,
      total_pages: Math.ceil(count / pageSize),
      current_page: page,
      data: finalProjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllFinalProjectsByProdiName(req, res) {
  const user_id = req.users.user_id;
  const role = req.users.role;

  try {
    // Check if the role is 'fakultas'
    if (role !== 'prodi') {
      return res.status(403).json({ message: 'Access denied', data: null });
    }

    // Fetch users details to get fakultas_id
    const prodiUser = await prodi.findOne({ where: { user_id: user_id } });

    if (!prodiUser) {
      return res.status(404).json({ message: 'Fakultas users not found', data: null });
    }

    const prodiId = prodiUser.prodi_id;

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const year = req.query.year ? parseInt(req.query.year) : null;
    const prodiName = req.query.prodiName ? req.query.prodiName.trim() : null;

    // Prepare conditions for where clause
    let whereCondition = { '$prodi.prodi_id$': prodiId }; // Note the use of aliasing for include model

    if (prodiName) {
      whereCondition['$prodi.nama_prodi$'] = prodiName; // Using alias to reference the included model
    }

    if (year) {
      whereCondition.createdAt = {
        [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
        [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`),
      };
    }

    // Fetch final projects based on fakultas_id, optional prodiName filter, and optional year filter
    const { count, rows: finalProjects } = await finalprojects.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']], // Optional: default sorting
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        { model: mahasiswa, attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim'] },
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
    });

    res.status(200).json({
      message: `Final Projects for Prodi ${prodiId} retrieved successfully`,
      total_count: count,
      total_pages: Math.ceil(count / pageSize),
      current_page: page,
      data: finalProjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getFinalProjectStatusCountByProdi = async (req, res) => {
  try {
    const user_id = req.users.user_id;
    const role = req.users.role;

    // Pastikan role users adalah 'prodi'
    if (role !== 'prodi') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Ambil data prodi berdasarkan user_id
    const prodiUser = await prodi.findOne({ where: { user_id: user_id } });
    if (!prodiUser) {
      return res.status(404).json({ message: 'Prodi users not found' });
    }

    const prodiId = prodiUser.prodi_id;

    // Hitung jumlah final projects berdasarkan status dan prodi_id
    const pendingCount = await finalprojects.count({
      where: { status: 'pending', prodi_id: prodiId }
    });
    const approvedCount = await finalprojects.count({
      where: { status: 'approved', prodi_id: prodiId }
    });
    const rejectedCount = await finalprojects.count({
      where: { status: 'rejected', prodi_id: prodiId }
    });

    const data = {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    };

    res.status(200).json({
      message: 'Success fetch data',
      data: [data]
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      message: 'Error fetching data',
      error: error.message
    });
  }
};

async function getAllFinalProjectsTotal(req, res) {
  try {
    // Fetch all unique fakultas_id from finalprojects
    const uniqueFakultasIds = await finalprojects.findAll({
      attributes: ['fakultas_id'],
      group: ['fakultas_id'],
      raw: true
    });

    // Fetch final projects for each unique fakultas_id
    const fakultasProjects = await Promise.all(
      uniqueFakultasIds.map(async fakultasData => {
        const { fakultas_id } = fakultasData;

        // Prepare pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const year = req.query.year ? parseInt(req.query.year) : null;

        // Prepare conditions for where clause
        let whereCondition = { fakultas_id };

        if (year) {
          whereCondition.createdAt = {
            [Op.gte]: new Date(`${year}-01-01T00:00:00Z`),
            [Op.lt]: new Date(`${year + 1}-01-01T00:00:00Z`),
          };
        }

        // Fetch final projects based on fakultas_id and optional year filter
        const { count, rows: finalProjects } = await finalprojects.findAndCountAll({
          where: whereCondition,
          order: [['createdAt', 'DESC']], // Optional: default sorting
          limit: pageSize,
          offset: (page - 1) * pageSize,
          include: [
            { model: mahasiswa, attributes: ['mahasiswa_id', 'nama_mahasiswa', 'nim'] },
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
        });

        return {
          fakultas_id,
          total_count: count,
          total_pages: Math.ceil(count / pageSize),
          current_page: page,
          data: finalProjects
        };
      })
    );

    // Respond with all projects data for each fakultas_id
    res.status(200).json({
      message: 'Final Projects retrieved successfully',
      data: fakultasProjects
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
  getAllFinalProjectsByFakultasName,
  getAllFinalProjectsByProdiName,
  getFinalProjectStatusCountByProdi,
  getAllFinalProjectsTotal,
  updateStatusProject
}
