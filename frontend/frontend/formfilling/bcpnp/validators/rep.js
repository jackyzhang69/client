const yup = require('yup');

const repSchema = yup.object().shape({
    data: yup.object().shape({
        login: yup.object().shape({
            password: yup.string().required(),
            username: yup.string().required(),
        }),
        rep: yup.object().shape({
            member_id: yup.string().required(),
            last_name: yup.string().required(),
            first_name: yup.string().required(),
            orgnization: yup.string().required(),
            phone: yup.string().required(),
            phone_secondary: yup.string().nullable(),
            email: yup.string().email().required(),
            country: yup.string().required(),
            address_line: yup.string().required(),
            city: yup.string().required(),
            state: yup.string().required(),
            postal_code: yup.string().required(),
        }),
    }),
    rep_auth_applicant: yup.string().required(),
    rep_auth_employer: yup.string().required(),
    view_port_size: yup.object().shape({
        width: yup.number().required(),
        height: yup.number().required(),
    }),
    headless: yup.boolean().required(),
    defaultTimeOut: yup.number().required(),
    pdf: yup.boolean().required(),
    png: yup.boolean().required(),
    update: yup.boolean()
});

module.exports = {
    repSchema
};
