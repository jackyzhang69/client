const yup = require('yup');


const pre_marriage_data = yup.object().shape({
    pre_sp_last_name: yup.string().required(),
    pre_sp_first_name: yup.string().required(),
    pre_sp_dob: yup.string().required(),
    pre_relationship_type: yup.string().required(),
    pre_start_date: yup.string().required(),
    pre_end_date: yup.string().required(),
});


const personalDetailsSchema = yup.object().shape({
    role: yup.string().required(),
    relationship_to_pa: yup.string().when('role', {
        is: (role) => role !== 'PA',
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    accompany_to_canada: yup.string().when('role', {
        is: (role) => role !== 'PA',
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    why_not: yup.string().when(['role', 'accompany_to_canada'], {
        is: (role, accompany_to_canada) => role !== 'PA' && !accompany_to_canada,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    dependant_type: yup.string().when('role', {
        is: 'DP',
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    last_name: yup.string().required(),
    first_name: yup.string().required(),
    full_name: yup.string().required(),
    used_another_name: yup.boolean().required(),
    uci: yup.string(),
    sex: yup.string().required(),
    eye_color: yup.string().required(),
    height: yup.string().required(),
    dob: yup.string()
        .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in personal details. Must be "YYYY/MM/DD"'),
    country_of_birth: yup.string().required(),
    place_of_birth: yup.string().required(),
    citizen: yup.string().required(),
    citizen2: yup.string().nullable(),
    cor: yup.object().shape({
        start_date: yup.string()
            .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in personal details cor start date. Must be "YYYY/MM/DD"'),
        end_date: yup.string()
            .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in personal details cor end date. Must be "YYYY/MM/DD"')
            .test('is-future', 'COR end date must be greater than today', (value) => {
                const now = new Date();
                const end_date = new Date(value.replace(/-/g, "/"));
                return end_date >= now;
            }),
        country: yup.string().required(),
        status: yup.string().required(),
        status_text: yup.string().required(),
        entry_date: yup.string().when('country', {
            is: 'Canada',
            then: () => yup.string().required()
                .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in personal details cor entry date. Must be "YYYY/MM/DD"')
        }),
        entry_place: yup.string().when('country', {
            is: 'Canada',
            then: () => yup.string().required()
                .matches(/^[a-zA-Z\s]+$/, 'Invalid entry place in personal details cor. Must only contain letters and spaces.')
        })
    }).required(),
    has_previous_cor: yup.boolean().required(),
    previous_cor: yup.array().when('has_previous_cor', {
        is: true,
        then: () => yup.array().of(yup.object().shape({
            start_date: yup.string().matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in previous cor start date. Must be "YYYY/MM/DD"').required(),
            end_date: yup.string().matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in previous cor end date. Must be "YYYY/MM/DD"'),
            country: yup.string().required(),
            status: yup.string().required(),
        })).required(),
        otherwise: () => yup.array().notRequired(),
    }),
    marital_status: yup.string().required(),
    marital_status_index: yup.string().required(),
    previous_married: yup.boolean().required(),
    should_check_previous_married: yup.boolean().required(),
    marriage_data: yup.object().shape({
        date: yup.string().when('marital_status', {
            is: (value) => ['Married', 'Common-law'].includes(value),
            then: () => yup.string().matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in marriage date. Must be "YYYY/MM/DD"').required(),
            otherwise: () => yup.string().notRequired()
        }),
        sp_last_name: yup.string().when('marital_status', {
            is: (value) => ['Married', 'Common-law'].includes(value),
            then: () => yup.string().required(),
            otherwise: () => yup.string().notRequired()
        }),
        sp_first_name: yup.string().when('marital_status', {
            is: (value) => ['Married', 'Common-law'].includes(value),
            then: () => yup.string().required(),
            otherwise: () => yup.string().notRequired()
        }),
        pre_marriage_data: yup.string().when('previous_married', {
            is: true,
            then: () => pre_marriage_data,
            otherwise: () => yup.mixed().nullable(),
        }),
    }).required()

});

const applicationDetailsSchema = yup.object().shape({
    communication_language: yup.string().required(),
    interview_language: yup.string().required(),
    need_translator: yup.string()
        .oneOf(['Yes', 'No'])
        .required(),
    province: yup.string().required(),
    intended_city: yup.string().required(),
});

const phoneSchema = yup.object().shape({
    country_code: yup.string().required(),
    number: yup.string().required(),
    type: yup.string().required(),
});

const addressSchema = yup.object().shape({
    variable_type: yup.string().required(),
    display_type: yup.string().required(),
    unit: yup.string(),
    street_number: yup.string().required(),
    street_name: yup.string().required(),
    city: yup.string().required(),
    province: yup.string().when('country', {
        is: (val) => val === '124: CA',
        then: () => yup.string().oneOf(['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']).required(),
        otherwise: () => yup.mixed().notRequired(),
    }),

    country: yup.string().required(),
    post_code: yup.string().required(),
});

const contactInfoSchema = yup.object().shape({
    mail_address: addressSchema.required(),
    residential_address: addressSchema.required(),
    same_address: yup.boolean().required(),
    phone: yup.object().shape({
        preferredPhone: phoneSchema.required(),
        alternatePhone: phoneSchema.nullable(),
        businessPhone: phoneSchema.nullable(),
    }).required(),
    use_account_email: yup.boolean().required(),
});

const IdSchema = yup.object().shape({
    number: yup.string().required(),
    country: yup.string().required(),
    expiry: yup.string().required(),
    issued: yup.string().required(),
});

const educationSchema = yup.object().shape({
    highest_education: yup.string().required(),
    number_of_years: yup
        .string()
        .matches(/^\d+$/, 'Number of years must only include numbers, check in info-personal sheet, and make sure all level education years are filled in.')
        .required('Number of years is required'),
    current_occupation: yup.string().required(),
    intended_occupation: yup.string().required(),
});

const languageSchema = yup.object().shape({
    native_language: yup.string().required(),
    english_french: yup.string().required(),
    language_test: yup.boolean().required(),
    preferred_language: yup.string().when('english_french', {
        is: 'Both',
        then: () => yup.string().required(),
        otherwise: () => yup.string().nullable(),
    }),
});

const imm0008Schema = yup.object().shape({
    pa: yup.object().shape({
        personal_details: personalDetailsSchema.required(),
        application_details: applicationDetailsSchema.required(),
        contact_info: contactInfoSchema.required(),
        passport: IdSchema.required(),
        national_id: IdSchema.nullable(),
        education: educationSchema.required(),
        language: languageSchema.required(),
    }).required(),
    sp: yup.object().shape({
        personal_details: personalDetailsSchema.required(),
        passport: IdSchema.required(),
        national_id: IdSchema.nullable(),
        education: educationSchema.required(),
        language: languageSchema.required(),
    }).nullable(),
    dp: yup.array().of(
        yup.object().shape({
            personal_details: personalDetailsSchema.required(),
            passport: IdSchema.required(),
            national_id: IdSchema.nullable(),
            education: educationSchema.required(),
            language: languageSchema.required(),
        }).required()
    ).nullable(),
}).required();


module.exports = { imm0008Schema };



