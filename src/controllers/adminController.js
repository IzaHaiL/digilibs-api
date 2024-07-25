'use strict';

const {
  finalprojects,
  research,
  mahasiswas,
  dosens,
  prodis,
  fakultas,
  kategori, // Ensure this is the correct model name
  lppms,
  admin,
  sequelize
} = require('../databases/models');
const { nanoid } = require('nanoid');
const { Op } = require('sequelize');
const Validator = require('fastest-validator');
const v = new Validator();

// Controller function to create a category
async function createCategory(req, res, next) {
  try {
    // Generate a unique kategori_id using nanoid
    const kategori_id = nanoid(20);

    // Data to be validated and inserted
    const data = {
      kategori_id, // Use the generated ID
      nama_kategori: req.body.nama_kategori,
    };

    // Validation schema
    const schema = {
      kategori_id: { type: 'string', min: 1, max: 20, optional: false },
      nama_kategori: { type: 'string', min: 1, max: 100, optional: false },
    };

    // Validate the data
    const validationResult = v.validate(data, schema);
    if (validationResult !== true) {
      return res.status(400).json({
        message: 'Validation Failed',
        data: validationResult
      });
    }

    // Create the category
    const newCategory = await kategori.create(data);

    // Respond with success
    res.status(201).json({
      message: 'Category Created Successfully',
      data: newCategory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Create Category Failed',
      data: err
    });
  }
}
async function getAllCategories(req, res, next) {
    try {
      // Retrieve all categories from the database
      const categories = await kategori.findAll();
  
      // Respond with the retrieved categories
      res.status(200).json({
        message: 'Categories Retrieved Successfully',
        data: categories
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Retrieve Categories Failed',
        data: err
      });
    }
  }

module.exports = {
  createCategory,
  getAllCategories,
  
};
