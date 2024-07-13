const { research , user, dosens } = require("../databases/models");
const { nanoid } = require("nanoid");
const { Op } = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();
const paginate = require("sequelize-paginate");

// Create a new research
async function createResearch(req, res, next) {
  try {
    // Dapatkan data Mahasiswa dari database berdasarkan user_id dari JWT
    const dosen = await dosens.findOne({ where: { user_id: req.user.user_id } });

    if (!dosen) {
      return res.status(404).json({
        message: "Mahasiswa data not found for the current user",
      });
    }

    const data = {
      user_id: req.user.user_id,
      title: req.body.title,
      title_eng: req.body.title_eng,
      abstract: req.body.abstract,
      abstract_eng: req.body.abstract_eng,
      penulis: dosen.nama_dosen, // Ambil dari JWT name
      nidn: dosen.nidn,
      kontributor: req.body.kontributor,
      fakultas_id: dosen.fakultas_id, // Ambil dari Mahasiswa berdasarkan user_id
      nama_fakultas: dosen.nama_fakultas,
      prodi_id: dosen.prodi_id, // Ambil dari Mahasiswa berdasarkan user_id
      nama_prodi: dosen.nama_prodi,
      url_research: req.body.url_research,
      berkas_research: req.body.berkas_research,
      aprovaldate: req.body.aprovaldate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const schema = {
      title: { type: "string", min: 5, max: 255, optional: false },
      abstract: { type: "string", optional: false },
      penulis: { type: "string", min: 5, max: 50, optional: false },
      kontributor: { type: "string", optional: true },
      fakultas_id: { type: "string", optional: false },
      nama_fakultas: { type: "string", optional: false },
      prodi_id: { type: "string", optional: false },
      nama_prodi: { type: "string", optional: false },
      url_research: { type: "string", optional: true },
      berkas_finalprojects: { type: "string", optional: true },
      submissionDate: { type: "date", optional: true }
    };

    // VALIDATE DATA
    const validationResult = v.validate(data, schema);

    if (validationResult !== true) {
      return res.status(400).json({
        message: "Validation Failed",
        data: validationResult
      });
    }

    const result = await research.create(data);

    res.status(201).json({
      message: "researchs Created Successfully",
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Create researchs Failed",
      data: err
    });
  }
}

async function getAllResearch(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await research.paginate({
      page: page,
      paginate: pageSize,
    });

    const response = {
      message: "Success fetch research",
      total_count: result.total,
      total_pages: result.pages,
      current_page: result.page,
      data: result.docs,
    };

    res.send(response);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function getResearchById(req, res, next) {
  try {
    const research_id = req.params.id;

    const research = await research.findByPk(research_id);

    if (!research) {
      res.status(404).json({
        message: "Research not found",
        data: null,
      });
    } else {
      res.status(200).json({
        message: "Success",
        data: research,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Read Research Failed",
      data: err.toString(),
    });
  }
}

async function getResearchById(req, res, next) {
  try {
    const researchId = req.params.id;

    const researchs = await research.findByPk(researchId);

    if (!research) {
      res.status(404).json({
        message: "Final Project not found",
        data: null,
      });
    } else {
      res.status(200).json({
        message: "Success",
        data: researchs,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Read Final Project Failed",
      data: err.toString(),
    });
  }
}

async function updateResearch(req, res, next) {
  const data = {
    title: req.body.title,
    abstract: req.body.abstract,
    penulis: req.body.penulis,
    kontributor: req.body.kontributor,
    fakultas_id: req.body.fakultas_id,
    nama_fakultas: req.body.nama_fakultas,
    prodi_id: req.body.prodi_id,
    nama_prodi: req.body.nama_prodi,
    ulr_research: req.body.ulr_research,
    berkas_research: req.body.berkas_research,
    updatedAt: new Date(),
  };

  const schema = {
    title: { type: "string", min: 5, max: 100, optional: false },
    abstract: { type: "string", min: 10, max: 500, optional: false },
    penulis: { type: "string", min: 5, max: 50, optional: false },
    kontributor: { type: "string", min: 5, max: 50, optional: false },
    fakultas_id: { type: "string", min: 5, max: 50, optional: false },
    nama_fakultas: { type: "string", min: 5, max: 50, optional: false },
    prodi_id: { type: "string", min: 5, max: 50, optional: false },
    nama_prodi: { type: "string", min: 5, max: 50, optional: false },
    ulr_research: { type: "string", max: 100, optional: false },
    berkas_research: { type: "string", max: 100, optional: false },
  };

  const validationResult = v.validate(data, schema);

  if (validationResult !== true) {
    res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  } else {
    try {
      const result = await research.update(data, { where: { research_id: req.params.id } });
      res.status(200).json({
        message: "Success update data",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        message: "Update Research Failed",
        data: err,
      });
    }
  }
}

async function deleteResearch(req, res, next) {
  try {
    const research_id = req.params.id;

    const existingResearch = await research.findByPk(research_id);

    if (!existingResearch) {
      res.status(404).json({
        message: "Research not found",
        data: null,
      });
      return;
    }

    const result = await research.destroy({ where: { research_id: research_id } });

    res.status(200).json({
      message: "Success Delete Data",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Delete Research Failed",
      data: err.toString(),
    });
  }
}

async function validatedResearch(req, res, next) {
  try {
    const research_id = req.params.id;

    const existingResearch = await research.findByPk(research_id);

    if (!existingResearch) {
      res.status(404).json({
        message: "Research not found",
        data: null,
      });
      return;
    }

    const result = await research.update(
      { is_validated: true },
      { where: { research_id: research_id } }
    );

    res.status(200).json({
      message: "Success Validated Research",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Validated Research Failed",
      data: err.toString(),
    });
  }

}

async function getAllResearchByUserId(req, res, next) {
  try {
    const userIdFromToken = req.user.user_id; // Mengambil user_id dari JWT

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await research.findAndCountAll({
      where: { user_id: userIdFromToken },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Final Project not found",
        data: null,
      });
    }

    const response = {
      message: "Success fetching final projects by user ID",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: result.rows,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch final projects",
      error: err.message,
    });
  }
}

async function getAllResearchPublic(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await research.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    const researchData = result.rows.map((research) => {
      const { berkas_research, ...researchData } = research.toJSON();
      return researchData;
    });

    const response = {
      message: "Success fetch final projects",
      total_count: result.count,
      total_pages: Math.ceil(result.count / pageSize),
      current_page: page,
      data: researchData,
    };

    res.send(response);
  } catch (err) {
    res.status(500).send({
      message: "Fetch Final Projects Failed",
      data: err.toString(),
    });
  }
}

const getAllFakultasTotalCount = async (req, res) => {
  try {
    // Ambil semua nama fakultas yang unik
    const uniqueFakultasNames = await research.findAll({
      attributes: ['nama_fakultas'],
      group: ['nama_fakultas'],
      raw: true,
    });

    // Hitung total proyek untuk setiap nama fakultas
    const fakultasWithTotalProjects = await Promise.all(
      uniqueFakultasNames.map(async (fakultas) => {
        const total_project = await research.count({
          where: { nama_fakultas: fakultas.nama_fakultas },
        });
        return {
          nama_fakultas: fakultas.nama_fakultas,
          total_project,
        };
      })
    );

    // Siapkan data untuk dikirim sebagai response
    const response = {
      message: "Success fetch",
      data: fakultasWithTotalProjects,
    };

    // Kirim response
    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllResearchStatusCount = async (req, res) => {
  try {
      const pendingCount = await research.count({ where: { status: 'pending' } });
      const approvedCount = await research.count({ where: { status: 'approved' } });
      const rejectedCount = await research.count({ where: { status: 'rejected' } });

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


const updateStatusProject = async (req, res) => {
  const project_id = req.params.id;

  const { status,catatan } = req.body;



  // Validasi status
  const validStatuses = ['Pending', 'Approved', 'Rejected'];
  if (!validStatuses.includes(status)) {
      return res.status(400).json({
          message: 'Invalid status. Status must be one of: Pending, Approved, Rejected.'
      });
  }

  try {
      // Cari project berdasarkan ID
      const project = await research.findByPk(project_id);

      // Jika project tidak ditemukan
      if (!project) {
          return res.status(404).json({
              message: 'Project not found.'
          });
      }

      // Update status project
      project.status = status;
      project.catatan = catatan;
      await project.save();

      res.status(200).json({
          message: 'Project status updated successfully.',
          data: project
      });
  } catch (error) {
      console.error('Error updating project status:', error);
      res.status(500).json({
          message: 'Error updating project status.',
          error: error.message
      });
  }
};

paginate.paginate(research);

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
  getAllResearchStatusCount,
  updateStatusProject,
};
