/**
 * This file will contain the middlewares for valdiating the userId and email
 */
const User = require("../../../models/mongoDB/userManagement/user/user.model");
const constants = require("../../../utils/constants");
const UserDbOperations = require('../../../dbOperations/mongoDB/userManagement/user/user.dbOperations');
const apiResponseHandler = require("../../../utils/objectHandlers/apiResponseHandler");
const TeamDbOperations = require("../../../dbOperations/mongoDB/organizationManagement/team/team.dbOperations");


validateUserRequest = async (req, res, next) => {
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

    //Validating the buUserId 
    const existingBuUserId = await UserDbOperations.getUser({ buUserId: req.body.buUserId });
    if (existingBuUserId != null) {
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




validateCreateUserRequest = async (req, res, next) => {
    // Validate request
    let isValid = true;
    let message = "";
    if (!req.businessUnit){
        isValid = false;
        message = "Failed! BusinessUnit Id must be a non-empty string";
    }
    if (!req.body.department || typeof req.body.department !== 'string') {
        isValid = false;
        message = "Failed! Department must be a non-empty string";
    }

    if (!req.body.userType || typeof req.body.userType !== 'string') {
        isValid = false;
        message = "Failed! UserType must be a non-empty string";
    }

    if (!req.body.designation || typeof req.body.designation !== 'string') {
        isValid = false;
        message = "Failed! Designation must be a non-empty string";
    }

    if (!req.body.firstName || typeof req.body.firstName !== 'string') {
        isValid = false;
        message = "Failed! First name must be a non empty string !";
    }

    if (!req.body.lastName || typeof req.body.lastName !== 'string') {
        isValid = false;
        message = "Failed! Last name must be a non empty string !";
    }
    if (!req.body.countryCode || typeof req.body.countryCode !== 'string' || req.body.countryCode.length > 4) {
        isValid = false;
        message = "Failed! Country code must be a non-empty number with a maximum length of 4 characters";
    }
    if (!req.body.contactNumber || typeof req.body.contactNumber !== 'number') {
        isValid = false;
        message = "Failed! Contact number must be a non-empty number";
    }

    // if (!req.body.buUserId || typeof req.body.buUserId !== 'string' ) {
    //
    //     res.status(400).send({
    //         message: "Failed! buUserId must be a non empty string !"
    //     });
    //     return;
    // }
    //Validating the buUserId
    // const existingBuUserId = await UserDbOperations.getUser({ buUserId: req.body.buUserId });
    // if (existingBuUserId != null) {
    //     res.status(400).send({
    //         message: "Failed! BuUserId  already exists!"
    //     });
    //     return;
    // }

    if (!req.body.employeeId || typeof req.body.employeeId !== 'string'){
        isValid = false;
        message = "Failed! EmployeeId must be a non-empty string";
    }

    // Check if the provided name already exists in the database
    const existingEmployeeIdUser = await UserDbOperations.checkExistingEmployeeIdForBusinessUnit(req.body.employeeId, req.businessUnit);
    if (existingEmployeeIdUser) {
        isValid = false;
        message = "Failed! User employeeId already exists for the business unit";
    }
    //Validating the email Id
    if (!isValidEmail(req.body.email)) {
        isValid = false;
        message = "Failed! Email is not valid!";
    }
    // Check if the provided name already exists in the database
    const existingEmailUser = await UserDbOperations.checkExistingEmailForBusinessUnit(req.body.email, req.businessUnit);
    if (existingEmailUser) {
        isValid = false;
        message = "Failed! User email already exists for the business unit";
    }

    if (req.body.isEnabled !== undefined) {
        if (typeof req.body.isEnabled !== 'boolean') {
            isValid = false;
            message = "Failed! User isEnabled should be a boolean";
        }
    }
    if (isValid) {
        next();
    }
    else {
        return apiResponseHandler.errorResponse(
            res,
            message,
            400,
            null
        );
    }
}

validatePreUpdateUserRequest = async (req, res, next) => {
    // Validate request

    if (req.body.firstName) {
        if(typeof req.body.firstName !== 'string'){
        return apiResponseHandler.errorResponse(
            res,
            "Failed! First name must be a non empty string !",
            400,
            null
        );
        }
    }
    if (req.body.lastName) {
        if(typeof req.body.lastName !== 'string'){
            return apiResponseHandler.errorResponse(
                res,
                "Failed! Last name must be a non empty string !",
                400,
                null
            );
        }
    }

    if (req.body.employeeId){
        const existingEmployeeIdUser = await UserDbOperations.checkExistingEmployeeIdForBusinessUnit(req.body.employeeId, req.businessUnit);
        if (existingEmployeeIdUser) {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! User employeeId already exists for the business unit",
                400,
                null
            );
        }
    }

    if(req.body.countryCode){
        if (typeof req.body.countryCode !== 'string' || req.body.countryCode.length > 4) {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! Country code must be a non-empty number with a maximum length of 4 characters",
                400,
                null
            );
        }
    }

    if (req.body.contactNumber){
        if (typeof req.body.contactNumber !== 'number') {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! Contact number must be a non-empty number",
                400,
                null
            );
        }
    }
    if (req.params.department || req.query.department || req.params.userType || req.query.userType || req.params.designation || req.query.designation || req.params.team || req.query.team){
    // delete department, userType, designation, and team from the request query, params
        delete req.query.department;
        delete req.params.department;
        delete req.query.userType;
        delete req.params.userType;
        delete req.query.designation;
        delete req.params.designation;
        delete req.query.team;
        delete req.params.team;
    }
    if (req.body.department) {
        if(!req.body.userType){
            return apiResponseHandler.errorResponse(
                res,
                "UserType is required and must be a non-empty string, while updating department",
                400,
                null
            );
        }
        if(!req.body.designation){
            return apiResponseHandler.errorResponse(
                res,
                "Designation is required and must be a non-empty string, while updating department",
                400,
                null
            );
        }
    }

    if (req.body.userType) {
        if(!req.body.designation){
            return apiResponseHandler.errorResponse(
                res,
                "Designation is required and must be a non-empty string, while updating userType",
                400,
                null
            );
        }
    }

    next();
}

validateUser = async (req, res, next) => {

    // Check if userId is in req.params
    if (req.params.user && typeof req.params.user === 'string') {
        req.user = req.params.user;
    }
    // If not, check if userId is in req.body
    else if (req.body.user && typeof req.body.user === 'string') {
        req.user = req.body.user;
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
    let checkExistingUser = await UserDbOperations.checkExistingUser(req.user, req.businessUnit);

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

validateUserAndReturnObj = async (req, res, next) => {

    // Check if userId is in req.params
    if (req.params.user && typeof req.params.user === 'string') {
        req.userId = req.params.user;
    }
    // If not, check if userId is in req.body
    else if (req.body.user && typeof req.body.user === 'string') {
        req.userId = req.body.user;
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

    let selectFields = ['name', '_id', 'team', 'department'];

    // Check if the user with the given ID exists
    let checkExistingUser = await UserDbOperations.getUser({_id:req.userId, businessUnit: req.businessUnit}, selectFields);

    if (checkExistingUser) {
        console.log('checkExistingUser', checkExistingUser)
        req.userObj = checkExistingUser;
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

rejectUpdatingUserBySameUser = async (req, res, next) => {

    if (req.userId === req.user) {
        return apiResponseHandler.errorResponse(
            res,
            "Failed! Cant update the same user",
            400,
            null
        );
    } else {
        next();
    }
}

rejectUpdatingUsersBySameUser = async (req, res, next) => {

    if (req.body.users.includes(req.userId)){
        return apiResponseHandler.errorResponse(
            res,
            "Failed! Cant update the same user",
            400,
            null
        );
    }
    else {
        next();
    }
}

validateUsers = async (req, res, next) => {

    if(req.body.users ){
        if (!req.body.users || !Array.isArray(req.body.users) || req.body.users.length === 0) {
            return apiResponseHandler.errorResponse(
                res,
                "User ids must be a non-empty array of strings",
                400,
                null
            );
        }
        for (let i = 0; i < req.body.users.length; i++) {
            if (typeof req.body.users[i] !== 'string') {
                return apiResponseHandler.errorResponse(
                    res,
                    "User ids must be a non-empty array of strings",
                    400,
                    null
                );
            }
        }

        let invalidUserIds = await UserDbOperations.returnInvalidUserIds(req.body.users, req.businessUnit, req.department);
        if (invalidUserIds.length > 0) {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! Invalid User ids",
                400,
                {invalidUserIds}
            );
        }
        else{
            next()
        }

    }
    else{
        next();
    }
}

validateUsersWithoutTeam = async (req, res, next) => {

    if(req.body.users){
        if (!req.body.users || !Array.isArray(req.body.users) || req.body.users.length === 0) {
            return apiResponseHandler.errorResponse(
                res,
                "User ids must be a non-empty array of strings",
                400,
                null
            );
        }
        for (let i = 0; i < req.body.users.length; i++) {
            if (typeof req.body.users[i] !== 'string') {
                return apiResponseHandler.errorResponse(
                    res,
                    "User ids must be a non-empty array of strings",
                    400,
                    null
                );
            }
        }

        let usersWithoutTeam = await UserDbOperations.returnUsersWithoutTeam(req.body.users, req.businessUnit);
        if (req.body.users.length !== usersWithoutTeam.length) {

            let usersWithTeam = req.body.appendUsers.filter(user => !usersWithoutTeam.includes(user));
            return apiResponseHandler.errorResponse(
                res,
                "Failed! Users already have team",
                400,
                {usersWithTeam}
            );
        }
        else{
            next()
        }
    }
    else {
        next();
    }
}

validateReportsTo = async (req, res, next) => {

    if(req.params.reportsTo || req.body.reportsTo){ // Check if reportsTo is in req.params
        if (req.params.reportsTo && typeof req.params.reportsTo === 'string') {
            req.reportsTo = req.params.reportsTo;
        }
        // If not, check if reportsTo is in req.body
        else if (req.body.reportsTo && typeof req.body.reportsTo === 'string') {
            req.reportsTo = req.body.reportsTo;
        }
        // If reportsTo is not in req.params or req.body, return an error response
        else {
            return apiResponseHandler.errorResponse(
                res,
                "reportsTo must be a non-empty string in req.params or req.body",
                400,
                null
            );
        }

        // Check if the user with the given ID exists
        let checkExistingUser = await UserDbOperations.checkExistingUser(req.userId, req.businessUnit);

        if (checkExistingUser) {
            next();
        } else {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! ReportsTo user does not exist",
                400,
                null
            );
        }
    }
    else{
        next();
    }
}

validateReportsTosFromQuery = async (req, res, next) => {

    if(req.query.reportsTos){
        //convert the string to array

        let reportsTos = req.query.reportsTos.split(",");

        if (!reportsTos || !Array.isArray(reportsTos) || reportsTos.length === 0) {
            return apiResponseHandler.errorResponse(
                res,
                "ReportsTo ids must be a non-empty string with comma separated values",
                400,
                null
            );
        }

        let invalidReportsTos = await UserDbOperations.returnInvalidUserIds(reportsTos, req.businessUnit);
        if (invalidReportsTos.length > 0) {
            return apiResponseHandler.errorResponse(
                res,
                "Failed! Invalid ReportsTo ids",
                400,
                { invalidReportsTos }
            );
        }

        req.reportsTos = reportsTos;
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



const verifyUserRequest = {
    validateUserRequest: validateUserRequest,
    validateCreateUserRequest: validateCreateUserRequest,
    validatePreUpdateUserRequest: validatePreUpdateUserRequest,
    validateUser: validateUser,
    validateUserAndReturnObj: validateUserAndReturnObj,
    validateUsers: validateUsers,
    validateReportsTo: validateReportsTo,
    validateReportsTosFromQuery: validateReportsTosFromQuery,
    validateUsersWithoutTeam: validateUsersWithoutTeam,
    rejectUpdatingUserBySameUser: rejectUpdatingUserBySameUser,
    rejectUpdatingUsersBySameUser: rejectUpdatingUsersBySameUser

};
module.exports = verifyUserRequest








