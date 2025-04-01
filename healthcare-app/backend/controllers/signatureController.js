const Document = require('../models/Document');
const axios = require('axios');
const { generatePdf } = require('../utils/pdfGenerator');

exports.requestSignature = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: { $in: ['draft', 'pending-signature'] }
    });

    if (!document) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found or document already signed'
      });
    }

    // Generate PDF for signing
    const pdfBuffer = await generatePdf(document.content);

    // Call Gov.br API to request signature
    const response = await axios.post(
      `${process.env.GOVBR_API_URL}/signatures`,
      {
        document: pdfBuffer.toString('base64'),
        signer: {
          cpf: req.user.cpf,
          name: req.user.name
        },
        callbackUrl: `${process.env.APP_URL}/api/signature/callback`
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOVBR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update document with signature token
    document.signatureToken = response.data.token;
    document.status = 'pending-signature';
    await document.save();

    res.status(200).json({
      status: 'success',
      data: {
        qrCode: response.data.qrCode,
        signatureUrl: response.data.signatureUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifySignature = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'pending-signature'
    });

    if (!document) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with pending signature'
      });
    }

    // Verify signature with Gov.br API
    const response = await axios.get(
      `${process.env.GOVBR_API_URL}/signatures/verify?token=${document.signatureToken}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOVBR_API_KEY}`
        }
      }
    );

    if (response.data.status === 'signed') {
      document.status = 'signed';
      document.signedAt = new Date();
      await document.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        documentStatus: response.data.status
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.signatureCallback = async (req, res, next) => {
  try {
    const { token, status } = req.body;

    const document = await Document.findOne({
      signatureToken: token
    });

    if (!document) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with this signature token'
      });
    }

    if (status === 'signed') {
      document.status = 'signed';
      document.signedAt = new Date();
      await document.save();
    }

    res.status(200).json({
      status: 'success'
    });
  } catch (err) {
    next(err);
  }
};