const Document = require('../models/Document');
const { generatePdf } = require('../utils/pdfGenerator');
const { promisify } = require('util');
const fs = require('fs');
const writeFileAsync = promisify(fs.writeFile);

exports.createDocument = async (req, res, next) => {
  try {
    const { type, content, patientInfo } = req.body;

    const document = await Document.create({
      type,
      content,
      patientInfo,
      user: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        document
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        document
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.generateDocumentPdf = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID'
      });
    }

    const pdfBuffer = await generatePdf(document.content);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${document.type}-${document._id}.pdf`
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

exports.getAllDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user.id })
      .sort('-createdAt')
      .select('-content');

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        documents
      }
    });
  } catch (err) {
    next(err);
  }
};