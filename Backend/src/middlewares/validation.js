import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map((err) => err.msg);
        throw new ApiError(400, extractedErrors.join(', '));
    };
};

export const registerValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
];

export const loginValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
];

export const passwordResetValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('otp').notEmpty().withMessage('OTP is required'),
];
