const { finalprojects } = require("../databases/models");
const { nanoid } = require("nanoid");
const { Op } = require("sequelize");
const Validator = require("fastest-validator");
const v = new Validator();
const paginate = require("sequelize-paginate");

// Create a new final project
async function createFinalProject(req, res, next) {
  try {
    const data = {
      projectId: nanoid(20),
      title: req.body.title,
      studentName: req.body.studentName,
      supervisor: req.body.supervisor,
      submissionDate: req.body.submissionDate,
      grade: req.body.grade,
      summary: req.body.summary,
      createdAt: new Date(),
    };

    const schema = {
      title: { type: "string", min: 5, max: 100, optional: false },
      studentName: { type: "string", min: 5, max: 50, optional: false },
      supervisor: { type: "string", min: 5, max: 50, optional: false },
      submissionDate: { type: "date", optional: false },
      grade: { type: "string", optional: true },
      summary: { type: "string", optional: true },
    };

    // VALIDATE DATA
    const validationResult = v.validate(data, schema);

    if (validationResult !== true) {
      return res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
      });
    }

    const result = await finalProject.create(data);

    res.status(201).json({
      message: "Final Project Created Successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Create Final Project Failed",
      data: err,
    });
  }
}
// Get all final projects
async function getAllFinalProjects(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = await finalProject.paginate({
      page: page,
      paginate: pageSize,
    });

    const response = {
      message: "Success fetch final projects",
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
// Get a single final project by ID
async function getFinalProjectById(req, res, next) {
  try {
    const finalProjectId = req.params.id;

    const finalProject = await finalProject.findByPk(finalProjectId);

    if (!finalProject) {
      res.status(404).json({
        message: "Final Project not found",
        data: null,
      });
    } else {
      res.status(200).json({
        message: "Success",
        data: finalProject,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Read Final Project Failed",
      data: err.toString(),
    });
  }
}
// Update a final project by ID
function updateFinalProject(req, res, next) {
  const data = {
    title: req.body.title,
    studentName: req.body.studentName,
    supervisor: req.body.supervisor,
    submissionDate: req.body.submissionDate,
    grade: req.body.grade,
    summary: req.body.summary,
    updatedAt: new Date(),
  };

  const schema = {
    title: { type: "string", min: 5, max: 100, optional: false },
    studentName: { type: "string", min: 5, max: 50, optional: false },
    supervisor: { type: "string", min: 5, max: 50, optional: false },
    submissionDate: { type: "date", optional: false },
    grade: { type: "string", optional: true },
    summary: { type: "string", optional: true },
  };

  const validationResult = v.validate(data, schema);

  if (validationResult !== true) {
    res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  } else {
    FinalProject.update(data, { where: { projectId: req.params.id } })
      .then((result) => {
        res.status(200).json({
          message: "Success update data",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Update Final Project Failed",
          data: err,
        });
      });
  }
}
// Delete a final project by ID
async function deleteFinalProject(req, res, next) {
  try {
    const finalProjectId = req.params.id;

    const existingFinalProject = await finalProject.findByPk(finalProjectId);

    if (!existingFinalProject) {
      res.status(404).json({
        message: "Final Project not found",
        data: null,
      });
      return;
    }

    const result = await finalProject.destroy({ where: { projectId: finalProjectId } });

    res.status(200).json({
      message: "Success Delete Data",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Delete Final Project Failed",
      data: err.toString(),
    });
  }
}

paginate.paginate(finalprojects);

module.exports = {
  createFinalProject,
  getAllFinalProjects,
  getFinalProjectById,
  updateFinalProject,
  deleteFinalProject,
};
