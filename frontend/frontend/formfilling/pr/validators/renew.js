const yup = require('yup');


const renewSchema = yup.object().shape({
    data: yup.object().shape({
        application: yup.object().shape({
            is_urgent: yup.boolean().required(),
            situation: yup.string().required(),
            uci: yup.string().min(8, 'UCI must be at least 8 characters').required(),
            language: yup.string().required(),
            date_became_pr: yup.string()
                .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in application. Must be "YYYY/MM/DD"'),
            place_became_pr: yup.string().required(),
            province_became_pr: yup.string().required()
        }),
        personal: yup.object().shape({
            first_name_on_landing_paper: yup.string().required(),
            last_name_on_landing_paper: yup.string().required(),
            name_changed: yup.boolean().required(),
            current_first_name: yup.string().required(),
            current_last_name: yup.string().required(),
            gender: yup.string().required(),
            eye_color: yup.string().required(),
            height: yup.string().required(),
            dob: yup.string()
                .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM/DD"'),
            country_of_birth: yup.string().required(),
            country_of_citizenship: yup.string().required(),
            more_than_one_citizenship: yup.boolean().required(),
            other_citizenships: yup.string().nullable(),
            residential_address: yup.object().shape({
                po_box: yup.string().nullable(),
                unit: yup.string().nullable(),
                street_number: yup.string().required(),
                street_name: yup.string().required(),
                city: yup.string().required(),
                province: yup.string().required(),
                post_code: yup.string().required()
            }),
            mailing_address_is_same: yup.boolean().required(),
            mailing_address: yup.object().shape({
                po_box: yup.string().nullable(),
                unit: yup.string().nullable(),
                street_number: yup.string().required(),
                street_name: yup.string().required(),
                city: yup.string().required(),
                province: yup.string().required(),
                post_code: yup.string().required()
            }),
            phone: yup.object().shape({
                country_code: yup.string().required(),
                number: yup.string().required().when('country_code', {
                    is: '1',
                    then: () => yup.string().length(10, 'Phone number must be 10 digits for North America format'),
                    otherwise: () => yup.string()
                })
            }),
            has_alternate_phone: yup.boolean().required(),
            alternate_phone: yup.object().shape({
                country_code: yup.string().nullable(),
                number: yup.string().required().when('country_code', {
                    is: '1',
                    then: () => yup.string().length(10, 'Alternative phone number must be 10 digits for North America format'),
                    otherwise: () => yup.string()
                })
            }).nullable(),
            marital_status: yup.string().required(),
            married_date: yup.string()
                .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in married date. Must be "YYYY/MM/DD"'),
        }),
        immigration_history: yup.object().shape({
            had_removal_order: yup.boolean().required(),
            had_inadmissibility_report: yup.boolean().required(),
            had_lost_pr_status: yup.boolean().required(),
            submitted_appeal: yup.boolean().required(),
            has_PRTD: yup.boolean().required(),
            PRTD: yup.string().nullable(),
            explaination: yup.string().nullable(),
        }),
        personal_history: yup.object().shape({
            address: yup.array().of(yup.object().shape({
                from: yup.string()
                    .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in personal history date from. Must be "YYYY/MM/DD"'),
                to: yup.string()
                    .nullable()
                    .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in personal history date to. Must be "YYYY/MM/DD"'),
                address: yup.string().required(),
                city: yup.string().required(),
                province: yup.string().required(),
                country: yup.string().required()
            })),
            work_education: yup.array().of(yup.object().shape({
                from: yup.string()
                    .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in work education date from. Must be "YYYY/MM/DD"'),
                to: yup.string()
                    .nullable()
                    .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in work education date to. Must be "YYYY/MM/DD"'),
                name: yup.string().required(),
                activity: yup.string().required(),
                city: yup.string().required(),
                country: yup.string().required()
            }))
        }),
        residency_obligation: yup.object().shape({
            traveled_outside_canada: yup.boolean().nullable(),
            employed_outside_canada: yup.boolean().nullable(),
            accompanied_canadian_citizen: yup.boolean().nullable(),
            accompanied_pr: yup.boolean().nullable(),
            absences: yup.array().of(yup.object().shape({
                from: yup.string()
                    .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in residence obligation date from. Must be "YYYY/MM/DD"'),
                to: yup.string()
                    .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in residence obligation date to. Must be "YYYY/MM/DD"'),
                city_country: yup.string().required(),
                reason: yup.string().oneOf(["1: A", "2: B", "3: C", "4: Other"]).required(),
                other_explaination: yup.string().nullable()
            }))
        })
    }).required(),
    account: yup.string().required(),
    password: yup.string().required(),
    view_port_size: yup.object().shape({
        width: yup.number().min(0).required(),
        height: yup.number().min(0).required(),
    }),
    headless: yup.boolean().required(),
    defaultTimeOut: yup.number().min(0).required(),
    pdf: yup.boolean().required(),
    png: yup.boolean().required(),
});

module.exports = { renewSchema };


