const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, cpf, crm, password, role } = req.body;

    // Validate CRM format (example: CRM/SP 123456)
    if (!/^CRM\/[A-Z]{2}\s\d+$/.test(crm)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid CRM format. Use CRM/UF XXXXXX'
      });
    }

    const newUser = await User.create({
      name,
      cpf,
      crm,
      password,
      role: role || 'healthcare-professional'
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          crm: newUser.crm,
          role: newUser.role
        }
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'CPF or CRM already registered'
      });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { cpf, password } = req.body;

    if (!cpf || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide CPF and password'
      });
    }

    const user = await User.findOne({ cpf }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect CPF or password'
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          crm: user.crm,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};