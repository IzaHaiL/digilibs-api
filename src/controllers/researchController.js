const { research } = require("../databases/models");
const { nanoid } = require("nanoid");
const { Op } = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();
const paginate = require("sequelize-paginate");

// Create a new research
async function createResearch(req, res, next) {
  try {
    const data = {
      research_id: nanoid(20),
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
      createdAt: new Date(),
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

    // VALIDATE DATA
    const validationResult = v.validate(data, schema);

    if (validationResult !== true) {
      return res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
      });
    }

    const result = await research.create(data);

    res.status(201).json({
      message: "Research Created Successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Create Research Failed",
      data: err,
    });
  }
}

// Get all research
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

// Get a single research by ID
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

// Update a research by ID
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

// Delete a research by ID
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

paginate.paginate(research);

module.exports = {
  createResearch,
  getAllResearch,
  getResearchById,
  updateResearch,
  deleteResearch,
  validatedResearch,
};
