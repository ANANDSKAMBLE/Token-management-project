const crypto = require('crypto');

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    return password.length >= 5;
}



function hashPassword(password) {
    return crypto.createHash('sha512').update(password).digest('hex');
}


function verifyOTP_validation(emailID, OTP) {
    const errors = [];

    if (!isValidEmail(emailID)) {
        errors.push('invalid email id');
    }
    if (OTP.length != 4) {
        errors.push('invalid OTP');
    }
    return errors;

}


function signup_validation({ first_name, emailID, mobile_number, password, user_type, organization_name, organization_profile, time_zone_id, idRequired }) {
    let errors = [];

    if (first_name.length < 3) {
        errors.push("First name must be at least 3 characters long.");
    }
    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (mobile_number.length !== 10) {
        errors.push("Mobile number must be exactly 10 digits long.");
    }
    if (!isValidPassword(password)) {
        errors.push("Password must be at least 5 characters long.");
    }
    if (![0, 1].includes(user_type)) {
        errors.push("User type must be either 0 or 1.");
    }
    if (organization_name !== null && organization_name.length <= 3) {
        errors.push("Organization name must be more than 3 characters long.");
    }
    if (organization_profile !== null && organization_profile.length <= 5) {
        errors.push("Organization profile must be more than 5 characters long.");
    }
    if (time_zone_id.length < 5) {
        errors.push("Time zone ID must be at least 5 characters long.");
    }
    if (![0, 1, null].includes(idRequired)) {
        errors.push("ID required must be either 0, 1, or null.");
    }

    return errors;
}


function login_validation({ emailID, password, user_type }) {
    const errors = [];

    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (!isValidPassword(password)) {
        errors.push("Password must be at least 5 characters long.");
    }
    if (![0, 1].includes(user_type)) {
        errors.push("User type must be either 0 or 1.");
    }
    return errors;

}



function resetpasswordSendOTP_validation(emailID) {
    let errors = [];

    if (!(isValidEmail(emailID))) {
        errors.push("Invalid email format.");
    }
    console.log(errors);
    return errors;

}



function resetpasswordVerifyOTP_validation({ emailID, OTP }) {

    let errors = [];

    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (OTP.length !== 4) {
        errors.push("Invalid OTP!");
    }
    return errors;

}



function resetpassword_validation({ emailID, password, reEnterPassword }) {
    let errors = [];

    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (!isValidPassword(password)) {
        errors.push("Password must be at least 5 characters long.");
    }
    if (password !== reEnterPassword) {
        errors.push("password not matched");
    }
    return errors;
}

























function createServices_validation(uuid, title, description, image, status,
    token_prefix, token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot,
    reset_every_day, service_id, working_hours, addHolidays) {

    const errors = [];


    if (uuid == null || uuid.length < 4) {
        errors.push('Invalid uuid');
    }

    if (title == null || title.length <= 2) {
        errors.push('Invalid title');
    }


    if (![0, 1].includes(status)) {
        errors.push('Invalid status');
    }


    if (token_prefix == null || token_prefix.length < 3) {
        errors.push('token_prefix cannot be null & has atleast 2 charector');
    }

    if (token_suffix == null || token_suffix.length < 3) {
        errors.push('token_suffix cannot be null & has atleast 2 charector');
    }


    if (!/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(slot_timing)) {
        errors.push('Invalid slot_timing');
    }

    if (no_of_slots == null || no_of_slots <= 0) {
        errors.push('Invalid no_of_slots');
    }
    if (max_seats_for_each_slot == null || max_seats_for_each_slot <= 0) {
        errors.push(' Invalid max_seats_for_each_slot');
    }


    if (![0, 1].includes(reset_every_day)) {
        errors.push('Invalid reset_every_day');
    }

    if (service_id != null && service_id <= 0) {
        errors.push('service id must ge greater than 0');
    }

    if (working_hours != null) {

        for (let i = 0; i < working_hours.length; i++) {
            if (!(working_hours[i].week_day >= 0 && working_hours[i].week_day <= 6)) {
                errors.push('invalid week day ' + working_hours[i].week_day);
                break;
            }
            if (!(working_hours[i].start_time == null || /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(working_hours[i].start_time))) {
                errors.push('invalid start time ' + working_hours[i].start_time);
                break;
            }
            if (!(working_hours[i].end_time == null || /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(working_hours[i].end_time))) {
                errors.push('invalid end time ' + working_hours[i].end_time);
                break;
            }

        }

    }
    else {
        errors.push('working hours cant be null');
    }

    if (addHolidays != null) {

        for (let i = 0; i < addHolidays.length; i++) {
            if (!(/^\d{4}-\d{2}-\d{2}$/.test(addHolidays[i].holiday_Date))) {
                errors.push('invalid holiday date');
                break;
            }

        }
    }
    else {
        console.log(addHolidays);
        errors.push('add Holidays cant be null');
    }






    return errors;
}



function ServiceDetails_validation(service_id, uuid) {

    const errors = []
    if (service_id <= 0 || service_id == null) {
        errors.push("invalid service ID");
    }

    if (uuid.length < 4) {
        errors.push("invalid UUID");
    }
    return errors;
}
















function getServicesDetails_validation(service_id, organizationId) {

    const errors = []
    if (service_id <= 0 || service_id == null) {
        errors.push("invalid service ID");
    }

    if (organizationId <= 0) {
        errors.push("invalid organizationId");
    }
    return errors;
}






function slotGeneration_validation(uuid, organizationId, service_id, slot_date_time) {
    const errors = [];
    if (uuid == null || uuid.length < 4) {
        errors.push('invalid UUID');
    }

    if (organizationId == null || organizationId <= 0) {
        errors.push('invalid organizationId');
    }

    if (service_id == null || service_id <= 0) {
        errors.push('invalid serviceID');
    }

    if (!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(slot_date_time))) {
        errors.push('invalid date selected');
    }
    

    return errors;
}




function bookslot_validation(uuid, first_name, last_name, emailID, mobile_isd, mobile_number,
    organization_id, service_id, slot_date_time, idnumber) {
    const errors = [];
    if (uuid == null || uuid.length < 4) {
        errors.push('invalid uuid');
    }

    if (first_name.length < 3) {
        errors.push('firstName contains atleast 2 charactor');
    }

    if (!(isValidEmail(emailID))) {
        errors.push('invalid emailID');
    }

    if (mobile_isd.length < 3) {
        errors.push('invalid mobileISD');
    }

    if (mobile_number.length != 10) {
        errors.push('invalid mobileNumber');
    }

    if (organization_id <= 0 || service_id <= 0) {
        errors.push('invalid organizationId or serviceId');
    }

    if (!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(slot_date_time))) {
        errors.push('invalid slot date and time');
    }

    return errors;
}






function bookslotSendOTP_validation(emailID, idnumber) {
    const errors = [];

    if (!isValidEmail(emailID)) {
        errors.push('envalid emailID');
    }
    return errors;
}





function bookslotverifyOTP_validation(emailID, OTP) {
    const errors = [];

    if (!isValidEmail(emailID)) {
        errors.push('invalid email id');
    }

    if (OTP.length != 4) {
        errors.push('invalid OTP');
    }

    return errors;
}






module.exports = {
    verifyOTP_validation,
    hashPassword,
    signup_validation,
    login_validation,
    resetpasswordSendOTP_validation,
    resetpasswordVerifyOTP_validation,
    resetpassword_validation,
    createServices_validation,
    ServiceDetails_validation,
    getServicesDetails_validation,
    slotGeneration_validation,
    bookslot_validation,
    bookslotSendOTP_validation,
    bookslotverifyOTP_validation
};





