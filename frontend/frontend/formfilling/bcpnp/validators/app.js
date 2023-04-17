/*
    * This file is part of the BCPNP application.
*/
const yup = require('yup');

const jobSchema = yup.object().shape({
    job_title: yup.string().required(),
    noc_code: yup.string().required(),
    start_date: yup.string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"').required(),
    end_date: yup.string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"')
        .nullable()
        .notRequired(),
    job_hours: yup.string().required(),
    company: yup.string().required(),
    phone: yup.string().required(),
    website: yup.string().nullable(),
    unit: yup.string().nullable(),
    street_address: yup.string().required(),
    city: yup.string().required(),
    province: yup.string().required(),
    country: yup.string().required(),
    postcode: yup.string().required(),
    duties: yup.string().required(),
});

const appSchema = yup.object().shape({
    data: yup.object().shape({
        stream: yup.string().required(),
        login: yup.object().shape({
            username: yup.string().required(),
            password: yup.string().required(),
        }),
        applicant: yup.object().shape({
            intended_city: yup.string().required(),
            about_application: yup.object().shape({
                q1: yup.boolean().required(),
                q2: yup.boolean().required(),
                q2_explaination: yup.string().when('q2', {
                    is: true,
                    then: () => yup.string().required(),
                    otherwise: () => yup.mixed().notRequired()
                }),
                q3: yup.boolean().required(),
                q4: yup.boolean().required(),
                q5: yup.boolean().required(),
                q5_explaination: yup.string().when('q5', {
                    is: true,
                    then: () => yup.string().required(),
                    otherwise: () => yup.mixed().notRequired()
                }),
                q6: yup.boolean().required(),
                q7: yup.boolean().required(),
            }).required(),
            ee: yup.object().shape({
                ee_profile_no: yup.string().required(),
                ee_expiry_date: yup.string().required(),
                ee_jsvc: yup.number().required(),
                ee_score: yup.number().required(),
                ee_noc: yup.number().required(),
                ee_job_title: yup.string().required(),
            }).required(),
            status: yup.object().shape({
                in_canada: yup.boolean().required(),
                current_country: yup.string().required(),
                current_country_status: yup.string().required(),
                current_workpermit_type: yup.string().required(),
                current_status_start_date: yup.string().required(),
                current_status_end_date: yup.string().required(),
                last_entry_date: yup.string().required(),
                last_entry_place: yup.string().required(),
            }).required(),
        }).required(),
        education: yup.object().shape({
            has_bc_post_secondary: yup.boolean().required(),
            has_canada_post_secondary: yup.boolean().required(),
            has_international_post_secondary: yup.boolean().required(),
            high_school: yup.array().of(yup.object().shape({
                from: yup.date().required(),
                to: yup.date().required(),
                school_name: yup.string().required(),
                city: yup.string().required(),
                country: yup.string().required(),
                completed: yup.boolean().required(),
            })).required(),
            bc_post_secondary: yup.mixed().when('has_bc_post_secondary', {
                is: true,
                then: () => yup.array().of(yup.object().shape({
                    from: yup.date().required(),
                    to: yup.date().required(),
                    school_name: yup.string().required(),
                    city: yup.string().required(),
                    level: yup.string().required(),
                    field_of_study: yup.string().required(),
                    original_field_of_study: yup.string().required(),
                })).required(),
                otherwise: () => yup.mixed().nullable()
            }),
            canada_post_secondary: yup.mixed().when('has_canada_post_secondary', {
                is: true,
                then: () => yup.array().of(yup.object().shape({
                    from: yup.date().required(),
                    to: yup.date().required(),
                    school_name: yup.string().required(),
                    city: yup.string().required(),
                    province: yup.string().required(),
                    level: yup.string().required(),
                    field_of_study: yup.string().required(),
                    original_field_of_study: yup.string().required(),
                })).required(),
                otherwise: () => yup.mixed().nullable()
            }),
            has_international_post_secondary: yup.boolean(),
            international_post_secondary: yup.mixed().when('has_international_post_secondary', {
                is: true,
                then: () => yup.array().of(yup.object().shape({
                    from: yup.date().required(),
                    to: yup.date().required(),
                    school_name: yup.string().required(),
                    city: yup.string().required(),
                    country: yup.string().required(),
                    level: yup.string().required(),
                    field_of_study: yup.string().required(),
                    original_field_of_study: yup.string().required(),
                })).required(),
                otherwise: () => yup.mixed().nullable()
            }).required(),
        }).required(),
        work_experience: yup.object().shape({
            has_work_experience: yup.boolean().required(),
            work_experience: yup.array().of(jobSchema).when('has_work_experience', {
                is: true,
                then: () => yup.array().of(jobSchema).required(),
                otherwise: () => yup.array().mixed().notRequired(),
            }),
        }),
        family: yup.object().shape({
            has_spouse: yup.boolean().required(),
            spouse: yup.object().when('has_spouse', {
                is: true,
                then: () => yup.object().shape({
                    first_name: yup.string().required(),
                    last_name: yup.string().required(),
                    gender: yup.string().oneOf(['Male', 'Female', 'Other']).required(),
                    date_of_birth: yup.date().required(),
                    country_of_birth: yup.string().required(),
                    country_of_citizenship: yup.string().required(),
                    address: yup.string().required(),
                    sp_in_canada: yup.string().oneOf(['Yes', 'No']).required(),
                    sp_canada_status: yup.string().required(),
                    sp_canada_status_end_date: yup.date().required(),
                    sp_canada_occupation: yup.string().nullable(),
                    sp_canada_employer: yup.string().nullable(),
                }),
                otherwise: () => yup.mixed().notRequired()
            }),
            mother: yup.object().shape({
                first_name: yup.string().required(),
                last_name: yup.string().required(),
                date_of_birth: yup.date().required(),
                country_of_birth: yup.string().required(),
                deceased: yup.boolean().required(),
                address: yup.string().required(),
            }).required(),
            father: yup.object().shape({
                first_name: yup.string().required(),
                last_name: yup.string().required(),
                date_of_birth: yup.date().required(),
                country_of_birth: yup.string().required(),
                deceased: yup.boolean().required(),
                address: yup.string().required(),
            }).required(),
            has_children: yup.boolean().required(),
            children: yup.array().when('has_children', {
                is: true,
                then: () => yup.array().of(yup.object().shape({
                    first_name: yup.string().required(),
                    last_name: yup.string().required(),
                    date_of_birth: yup.date().required(),
                    country_of_birth: yup.string().required(),
                    country_of_citizenship: yup.string().required(),
                    address: yup.string().required(),
                })).required(),
                otherwise: () => yup.mixed().notRequired()
            }),
            has_other_family_in_canada: yup.boolean().required(),
        }).required(),
        company_details: yup.object().shape({
            legal_name: yup.string().required(),
            operating_name: yup.string(),
            corporate_structure: yup.string().required(),
            registration_number: yup.string().required(),
            fulltime_equivalent: yup.string().required(),
            establish_year: yup.string().required(),
            website: yup.string().required(),
            address: yup.object().shape({
                street_address: yup.string().required(),
                city: yup.string().required(),
                province: yup.string().required(),
                post_code: yup.string().required(),
                country: yup.string().required(),
            }).required(),
            mailing_is_same_as_business: yup.boolean().required(),
            mailing_address: yup.object().when('mailing_is_same_as_business', {
                is: false,
                then: () => yup.object().shape({
                    street_address: yup.string().required(),
                    city: yup.string().required(),
                    province: yup.string().required(),
                    post_code: yup.string().required(),
                    country: yup.string().required(),
                }),
                otherwise: () => yup.mixed().notRequired(),
            }),
            employer_contact: yup.object().shape({
                last_name: yup.string().required(),
                first_name: yup.string().required(),
                job_title: yup.string().required(),
                phone: yup.string().required(),
                email: yup.string().email().required(),
            }).required(),
        }).required(),
        joboffer: yup.object().shape({
            has_fulltime_jo: yup.boolean().required(),
            is_indeterminate: yup.boolean().required(),
            end_date: yup.date().nullable().notRequired(),
            job_title: yup.string().required(),
            noc: yup.string().required(),
            require_license: yup.boolean().required(),
            hours: yup.number().required(),
            hourly_wage: yup.number().required(),
            annual_wage: yup.number().required(),
        }).required(),
        work_location: yup.array().of(yup.object().shape({
            street_address: yup.string().required(),
            city: yup.string().required(),
            phone: yup.string().required(),
        })).required(),
    }).required(),
    view_port_size: yup.object().shape({
        width: yup.number().min(0).required(),
        height: yup.number().min(0).required(),
    }),
    task: yup.string().oneOf(['PRO', 'REG', 'APP', 'REP']).required(),
    headless: yup.boolean().required(),
    defaultTimeOut: yup.number().min(0).required(),
    pdf: yup.boolean().required(),
    png: yup.boolean().required(),
});

module.exports = { appSchema };
