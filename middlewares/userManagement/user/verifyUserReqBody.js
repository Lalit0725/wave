/**
 * This file will contain the middlewares for valdiating the userId and email
 */
const User = require("../../../models/mongoDB/userManagement/user/user.model");
const constants = require("../../../utils/constants");
const UserDbOperations = require('../../../dbOperations/mongoDB/userManagement/user/user.dbOperations');
const apiResponseHandler = require("../../../utils/objectHandlers/apiResponseHandler");


validateUserRequestBody = async (req, res, next) => {
    // Validate request

    //Validating the userName
    if (!req.body.firstName || typeof req.body.firstName !== 'string') {
        res.status(400).send({
            message: "Failed! First name must be a non empty string !"
        });
        return;
    }
    if (!req.body.lastName || typeof req.body.lastName !== 'string') {
        res.status(400).send({
            message: "Failed! Last name must be a non empty string !"
        });
        return;
    }
    if (!req.body.countryCode || typeof req.body.countryCode !== 'string' || req.body.countryCode.length > 4) {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! Country code must be a non-empty number with a maximum length of 4 characters",
            400,
            null
        );
    }
    if (!req.body.contactNumber || typeof req.body.contactNumber !== 'number') {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! Contact number must be a non-empty number",
            400,
            null
        );
    }
    if (!req.body.userId) {

        res.status(400).send({
            message: "Failed! UserId is not provided !"
        });
        return;
    }
    //Validating the userId 
    const existingUserId = await UserDbOperations.getUser({ userId: req.body.userId });
    if (existingUserId != null) {
        res.status(400).send({
            message: "Failed! Userid  already exists!"
        });
        return;
    }
    //Validating the email Id
    if (!isValidEmail(req.body.email)) {
        res.status(400).send({
            message: "Failed! Email is not valid!"
        });
        return;
    }
    //Validating the userId
    const existingEmployeeId = await UserDbOperations.getUser({ employeeId: req.body.employeeId });
    if (existingEmployeeId != null) {
        res.status(400).send({
            message: "Failed! Userid  already exists!"
        });
        return;
    }

    const existingEmail = await UserDbOperations.getUser({ email: req.body.email });
    if (existingEmail != null) {
        res.status(400).send({
            message: "Failed! Email already exists!"
        });
        return;
    }


    next();


};




validateCreateUserRequestBody = async (req, res, next) => {
    // Validate request

    if (!req.businessUnitId){
        return apiResponseHandler.errorResponse(
            res,
            "BusinessUnit Id must be a non-empty string",
            400,
            null
        );
    }

    if (!req.body.firstName || typeof req.body.firstName !== 'string') {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! First name must be a non empty string !",
            400,
            null
        );
    }

    if (!req.body.lastName || typeof req.body.lastName !== 'string') {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! Last name must be a non empty string !",
            400,
            null
        );
    }

    // Check if the provided name already exists in the database
    const existingEmployeeIdUser = await UserDbOperations.checkExistingEmployeeIdForBusinessUnit(req.body.employeeId, req.businessUnitId);
    if (existingEmployeeIdUser) {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! User employeeId already exists for the business unit",
            400,
            null
        );
    }
    //Validating the email Id
    if (!isValidEmail(req.body.email)) {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! Email is not valid!",
            400,
            null
        )
    }
    // Check if the provided name already exists in the database
    const existingEmailUser = await UserDbOperations.checkExistingEmailForBusinessUnit(req.body.email, req.businessUnitId);
    if (existingEmailUser) {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! User email already exists for the business unit",
            400,
            null
        );
    }

    if (req.body.isEnabled !== undefined) {
        if (typeof req.body.isEnabled !== 'boolean') {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! User isEnabled should be a boolean",
                400,
                null
            );
        }
    }
    next();
}

validateUpdateUserRequestBody = async (req, res, next) => {
    // Validate request

    if (!req.businessUnitId){
        return apiResponseHandler.errorResponse(
            res,
            "BusinessUnit Id must be a non-empty string",
            400,
            null
        );
    }


    if (req.body.name){
        if (typeof req.body.name !== 'string') {
            return apiResponseHandler.errorResponse(
                res,
                "BusinessUnit name must be a non-empty string",
                400,
                null
            );
        }

        const existingNameUser = await UserDbOperations.checkExistingNameForBusinessUnit(req.body.name, req.businessUnitId);
        if (existingNameUser) {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! User name already exists for the business unit",
                400,
                null
            );
        }
        if (req.body.isEnabled !== undefined) {
            if (typeof req.body.isEnabled !== 'boolean') {
                return apiResponseHandler.errorResponse(
                    res,
                    "Failed! BusinessUnit isEnabled should be a boolean",
                    400,
                    null
                );
            }
        }
    }
    next();
}

validateUserId = async (req, res, next) => {

    // Check if userId is in req.params
    if (req.params.userId && typeof req.params.userId === 'string') {
        req.userId = req.params.userId;
    }
    // If not, check if userId is in req.body
    else if (req.body.userId && typeof req.body.userId === 'string') {
        req.userId = req.body.userId;
    }
    // If userId is not in req.params or req.body, return an error response
    else {
        return apiResponseHandler.errorResponse(
            res,
            "User id must be a non-empty string in req.params or req.body",
            400,
            null
        );
    }

    // Check if the user with the given ID exists
    let checkExistingUser = await UserDbOperations.checkExistingUserId(req.userId, req.businessUnitId);

    if (checkExistingUser) {
        next();
    } else {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! User does not exist",
            400,
            null
        );
    }
}

validateUserIds = async (req, res, next) => {

    if (!req.body.userIds || !Array.isArray(req.body.userIds) || req.body.userIds.length === 0) {
        return apiResponseHandler.errorResponse(
            res,
            "User ids must be a non-empty array of strings",
            400,
            null
        );
    }
    for (let i = 0; i < req.body.userIds.length; i++) {
        if (typeof req.body.userIds[i] !== 'string') {
            return apiResponseHandler.errorResponse(
                res,
                "User ids must be a non-empty array of strings",
                400,
                null
            );
        }
    }

    let invalidUserIds = await UserDbOperations.returnInvalidUserIds(req.body.userIds, req.businessUnitId);
    if (invalidUserIds.length > 0) {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! Invalid User ids",
            400,
            { invalidUserIds }
        );
    }
    next();
}
const isValidEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};



const verifyUserRequestBody = {
    validateUserRequestBody: validateUserRequestBody,
    validateCreateUserRequestBody: validateCreateUserRequestBody,
    validateUpdateUserRequestBody: validateUpdateUserRequestBody,
    validateUserId: validateUserId,
    validateUserIds: validateUserIds

};
module.exports = verifyUserRequestBody








