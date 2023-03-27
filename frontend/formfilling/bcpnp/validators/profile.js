const yup = require('yup');

const profileSchema = yup.object().shape({
    data: yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().min(8).required(),
        user_id: yup.string().required(),
        question_answers: yup.array().of(
            yup.object().shape({
                question: yup.string().required(),
                answer: yup.string().required(),
            }),
        ).min(3).max(3).required(),
        person: yup.object().shape({
            last_name: yup.string().required(),
            first_name: yup.string().required(),
            has_used_name: yup.boolean().required(),
            used_last_name: yup.string().when('has_used_name', {
                is: true,
                then: () => yup.string().required(),
                otherwise: () => yup.mixed().notRequired(),
            }),
            used_first_name: yup.string().when('has_used_name', {
                is: true,
                then: () => yup.string().required(),
                otherwise: () => yup.mixed().notRequired(),
            }),
            dob: yup.string()
                .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"'),
            country_of_birth: yup.string().required(),
            place_of_birth: yup.string().required(),
            sex: yup.string().oneOf(['Male', 'Female', 'X']).required(),
        }),
        passport: yup.object().shape({
            number: yup.string().required(),
            country: yup.string().required(),
            issue_date: yup.string()
                .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"'),
            expiry_date: yup.string()
                .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"'),
        }),
        contact: yup.object().shape({
            PreferredPhone: yup.object().shape({
                country_code: yup.string().required(),
                number: yup.string().required(),
            }),
            business: yup.object().shape({
                country_code: yup.string().nullable(),
                number: yup.string().nullable(),
            }),
        }),
        address: yup.object().shape({
            country: yup.string().required(),
            street: yup.string().required(),
            city: yup.string().required(),
            province: yup.string().required(),
            postal_code: yup.string().required(),
        }),
        additional: yup.string().required(),
    }),
    view_port_size: yup.object().shape({
        width: yup.number().min(0).required(),
        height: yup.number().min(0).required(),
    }),
    task: yup.string().oneOf(['PRO', 'REG', 'APP', 'REP']).required(),
    headless: yup.boolean().required(),
    defaultTimeOut: yup.number().min(0).required(),
    pdf: yup.boolean().required(),
    png: yup.boolean().required(),
    update: yup.boolean()
});

module.exports = { profileSchema };
