const yup = require('yup');

const parent = yup.object().shape({
    family_name: yup.string().required(),
    given_name: yup.string().required(),
    dob: yup.string()
        .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in dob. Must be "YYYY/MM/DD"'),
    date_of_death: yup.string()
        .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in date of death. Must be "YYYY/MM/DD"')
        .nullable(),
    place_of_birth: yup.string().required(),
    birth_country: yup.string().required(),
}).required();

const person_validator = yup.object().shape({
    personal_details: yup.object().shape({
        last_name: yup.string().required(),
        first_name: yup.string().required(),
        full_name: yup.string().required(),
        full_name_in_native: yup.string().required(),
        dob: yup.string()
            .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in person. Must be "YYYY/MM/DD"'),
        father: parent,
        mother: parent,
    }),
    education: yup.object({
        primary_school_years: yup.number().required(),
        secondary_school_years: yup.number().required(),
        post_secondary_school_years: yup.number().required(),
        other_school_years: yup.number().required(),
        educations: yup.array().of(
            yup.object({
                start_date: yup.string()
                    .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in education start date. Must be "YYYY/MM"'),
                end_date: yup.string()
                    .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in education start date. Must be "YYYY/MM"'),
                school_name: yup.string().required(),
                education_level: yup.string().required(),
                field_of_study: yup.string().required(),
                city_country: yup.string().required(),
            })
        ).min(1).required(),
    }),
    questionanaire: yup.object().shape({
        q1: yup.boolean().required(),
        q2: yup.boolean().required(),
        q3: yup.boolean().required(),
        q4: yup.boolean().required(),
        q5: yup.boolean().required(),
        q6: yup.boolean().required(),
        q7: yup.boolean().required(),
        q8: yup.boolean().required(),
        q9: yup.boolean().required(),
        q10: yup.boolean().required(),
        q11: yup.boolean().required(),
        has_details: yup.boolean().required(),
        details: yup.mixed().nullable(),
    }),
    personal_history: yup.array().of(
        yup.object().shape({
            start_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in personal history start date. Must be "YYYY/MM"'),
            end_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in personal history end date. Must be "YYYY/MM"'),
            activity: yup.string().required(),
            city_and_country: yup.string().required(),
            status: yup.string().required(),
            name_of_company_or_school: yup.string().required(),
        })
    ),
    membership: yup.array().of(
        yup.object().shape({
            start_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in membership. Must be "YYYY/MM"'),
            end_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in membership. Must be "YYYY/MM"'),
            organization_name: yup.string().required(),
            organization_type: yup.string().required(),
            position: yup.string().required(),
            city_country: yup.string().required(),
        }).nullable()
    ),
    government_posotion: yup.array().of(
        yup.object().shape({
            start_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
            end_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
            country: yup.string().required(),
            department: yup.string().required(),
            position: yup.string().required(),
        })
    ),
    military_service: yup.array().of(
        yup.object().shape({
            start_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
            end_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
            country: yup.string().required(),
            service_detail: yup.string().required(),
            rank: yup.string().required(),
            combat_detail: yup.string().required(),
            reason_for_end: yup.string().required(),
        })
    ),
    addresses: yup.array().of(
        yup.object().shape({
            start_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
            end_date: yup.string()
                .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
            street_and_number: yup.string().required(),
            city: yup.string().required(),
            province: yup.string().required(),
            country: yup.string().required(),
            post_code: yup.number().required(),
        })
    ),
})

const imm5669Schema = yup.object().shape({
    pa: person_validator.required(),
    sp: person_validator.nullable(),
    dp: yup.array().of(person_validator).nullable(),
});

module.exports = { imm5669Schema };
