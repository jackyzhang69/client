const yup = require('yup');

const isNumberWithStringFormat = (value) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof (value) != 'string') return false;
    const numberValue = parseFloat(value);
    return !isNaN(numberValue) && isFinite(numberValue);
}

const loginSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
});

const craSchema = yup.string().matches(/^\d{9}RP\d{4}$/, 'CRA number is invalid').required();

const employerContactsSchema = yup.array().min(1, 'Employer contacts must not be empty.').required();

const representativeSchema = yup.object().shape({
    name: yup.string().required(),
    paid: yup.boolean().required(),
    type: yup.number().integer().min(0).required(),
    member_id: yup.string().required(),
    province: yup.string().oneOf(['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'], 'Province must be a valid Canadian province abbreviation.').required(),
    explaination: yup.string(),
}).required();


const streamSchema = yup.object().shape({
    name: yup.string().oneOf(["GTSFull", "SAWPFull", "Agri", "PermRes", "Academs", "Wage", "Caregiver"], 'Stream name must be one of the valid values.').required(),
    category: yup.string().when('name', {
        is: (name) => ['GTSFull', 'Wage'].includes(name),
        then: () => yup.string().when('name', {
            is: 'GTSFull',
            then: () => yup.string().oneOf(['CatA', 'CatB'], 'Category must be "CatA", or "CatB".').required(),
            otherwise: () => yup.string().when('name', {
                is: 'Wage',
                then: () => yup.string().oneOf(['HWS', 'LWS'], 'Category must be "HWS" or "LWS".').required(),
                otherwise: () => yup.mixed().notRequired(),
            }),
        }),
    }),

}).required();



const wageSchema = yup.object().shape({
    amount: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    isConverted: yup.boolean().required(),
    explaination: yup.string().when('isConverted', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
}).required();


const locationSchema = yup.object().shape({
    business_op_name: yup.string().required(),
    business_activity: yup.string().required(),
    safety_concerns: yup.string().required(),
    address: yup.string().required(),
    province: yup
        .string()
        .oneOf(
            ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
            'Province must be a valid Canadian province abbreviation.'
        )
        .required(),
    is_primary: yup.boolean().required(),
});

const durationSchema = yup.object().shape({
    amount: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    unit: yup
        .string()
        .oneOf(['D', 'P', 'M', 'W', 'Y'], 'Unit must be "D(Days)","P(Permenant)","M(Month)","W(Week)", or "Y(Year)".')
        .required(),
    justification: yup.string().required(),
});

const workLocationDurationSchema = yup.object().shape({
    locations: yup.array().of(locationSchema).min(1).required(),
    duration: durationSchema.required(),
    number_of_workers: yup.number().integer().positive().required(),
});

// when HWS/LWS, the TFW info may not required, so it's optional here, but will be checked in logic check
const workerSchema = yup.object().shape({
    first_name: yup.string(),
    last_name: yup.string(),
    dob: yup.string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"'),
    current_country: yup.string(),
}).required();


const foreignWorkerSchema = yup.object().shape({
    names: yup.array().of(workerSchema)
}).required();



const hoursPaySchema = yup.object().shape({
    has_same_position: yup.boolean().required(),
    lowest: yup.string().when('has_same_position', {
        is: true,
        then: () => yup.number().moreThan(0, 'Must be greater than 0').required(),
        otherwise: () => yup.number().notRequired(),
    }),
    highest: yup.string().when('has_same_position', {
        is: true,
        then: () => yup.number().min(yup.ref('lowest'), 'Must be greater than or equal to the lowest').required(),
        otherwise: () => yup.number().notRequired(),
    }),
    without_standard_schedule: yup.boolean().required(),
    schedule_details: yup.string().when('without_standard_schedule', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    daily_hours: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    weekly_hours: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    not_full_time_position: yup.boolean().required(),
    not_ft_reason: yup.string().when('not_full_time_position', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    has_overtime_rate: yup.boolean().required(),
    ot_rate: yup.string().when('has_overtime_rate', {
        is: true,
        then: () => yup.number().moreThan(0, 'Must be greater than 0').required(),
        otherwise: () => yup.number().notRequired(),
    }),
    ot_determined_by: yup.number().when('has_overtime_rate', {
        is: true,
        then: () => yup.number().oneOf([0, 1, 2], 'Must be 0,1, or 2').required(),
        otherwise: () => yup.number().notRequired(),
    }),
    contingent_wage: yup.boolean().required(),
    contingent_wage_details: yup.string().when('contingent_wage', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
}).required();


const jobofferSchema = yup.object().shape({
    job_title: yup.string().required(),
    main_duties: yup.string().required(),
    position_requested_retional: yup.string().required(),
    job_start_date: yup.string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"')
        .required(),
    require_special_language: yup.number().positive().min(0).required(),
    oral_language: yup.string().when('require_special_language', {
        is: (require_special_language) => require_special_language === 0,
        then: () => yup.string().oneOf(["English", "French", "EngAndFren", "EngOrFren"], "Oral language must be in one of English, French,EngAndFren, or EngOrFren").required(),
    }),
    written_language: yup.string().when('require_special_language', {
        is: (require_special_language) => require_special_language === 0,
        then: () => yup.string().oneOf(["English", "French", "EngAndFren", "EngOrFren"], "Written language must be in one of English, French,EngAndFren, or EngOrFren").required(),
    }),
    reason_for_no: yup.string().when('require_special_language', {
        is: (require_special_language) => require_special_language === 2,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),

    require_other_language: yup.boolean().required(),
    other_language: yup.string().when('require_other_language', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    has_minimum_education_req: yup.boolean().required(),
    minimum_education_level: yup.number().when('has_minimum_education_req', {
        is: true,
        then: () => yup.number().required().oneOf([5, 3, 4, 11, 1, 2, 9, 10, 13, 12, 7, 6, 8], 'Must be 5,3,4,11,1,2,9,10,13,12,7,6,or 8'),
    }),
    minimum_education_details: yup.string().when('has_minimum_education_req', {
        is: true,
        then: () => yup.string().required(),
    }),
    minimum_skills_and_experience: yup.string().required(),
    has_license_req: yup.boolean().required(),
    license_req_details: yup.string().when('has_license_req', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    is_part_of_union: yup.boolean().required(),
    will_provide_benefits: yup.boolean().required(),
    has_disability_insurance: yup.boolean().required(),
    has_dental_insurance: yup.boolean().required(),
    has_pension: yup.boolean().required(),
    has_extended_medical_insurance: yup.boolean().required(),
    has_other_benefits: yup.boolean().required(),
    other_benefits_details: yup.string().when('has_other_benefits', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    vacation_days: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    vacation_pay_percentage: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
}).required();


const recruitmentSchema = yup.object().shape({
    job_ad_waivable: yup.boolean().required(),
    recruited_canadian: yup.boolean().required(),
    waivable_rationale: yup.string().when('job_ad_waivable', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    provide_recruitment_details: yup.boolean().when(
        'job_ad_waivable', {
        is: true,
        then: () => yup.boolean().required(),
        otherwise: () => yup.mixed().notRequired(),
    }
    ).required(),
    using_jobbank: yup.boolean().when(
        ['provide_recruitment_details', 'recruited_canadian'], {
        is: (provide_recruitment_details, recruited_canadian) => provide_recruitment_details === true || recruited_canadian === true,
        then: () => yup.boolean().required(),
        otherwise: () => yup.boolean().notRequired(),
    }
    ).required(),

    why_not_use_jobbank: yup.string().when('using_jobbank', {
        is: false,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    job_creation: yup.boolean().required(),
    job_creation_details: yup.string().when('job_creation', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    jobbank_posting_no: yup.string().when('using_jobbank', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    resumes_received: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    canadians_interviewed: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    canadians_offered: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    canadians_hired: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    canadians_declined_offers: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    resumes_not_interviewed_offered: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    why_not_recruit_canadians: yup.string().required(),
    employees_number: yup.string().required(),
    revenue_more_than_5m: yup.boolean().required(),
    why_not_attempted_to_recruit_canadians: yup.string().when(["job_ad_waivable", "recruited_canadian"], {
        is: (job_ad_waivable, recruited_canadian) => job_ad_waivable === false && recruited_canadian === false,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    transfer_skills: yup.boolean().required(),
    transfer_skills_details: yup.string().when('transfer_skills', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    fill_labour_shortage: yup.boolean().required(),
    fill_labour_shortage_details: yup.string().when('fill_labour_shortage', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    other_benefits: yup.string(),
    laid_off: yup.boolean().required(),
    laid_off_canadians: yup.string().when('laid_off', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    laid_off_tfw: yup.string().when('laid_off', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    laid_off_reason: yup.string().when('laid_off', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    lead_to_job_losss: yup.boolean().required(),
    lead_to_job_losss_details: yup.string().when('lead_to_job_losss', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    receive_support_from_esdc: yup.boolean().required(),
    receive_support_from_esdc_details: yup.string().when('receive_support_from_esdc', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    labour_dispute: yup.boolean().required(),
    labour_dispute_details: yup.string().when('labour_dispute', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
});


const seasonalInfoSchema = yup.object().shape({
    is_seasonal: yup.boolean().required(),
    start: yup.string().when('is_seasonal', {
        is: true,
        then: () => yup.string().oneOf(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']).required('Start month is required for seasonal work'),
        otherwise: () => yup.string(),
    }),
    end: yup.string().when('is_seasonal', {
        is: true,
        then: () => yup.string().oneOf(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']).required('End month is required for seasonal work'),
        otherwise: () => yup.string(),
    }),
    canadian_workers: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    foreign_workers: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
});


module.exports = {
    loginSchema,
    craSchema,
    employerContactsSchema,
    representativeSchema,
    streamSchema,
    wageSchema,
    locationSchema,
    durationSchema,
    workLocationDurationSchema,
    workerSchema,
    foreignWorkerSchema,
    hoursPaySchema,
    jobofferSchema,
    recruitmentSchema,
    seasonalInfoSchema,
    isNumberWithStringFormat
};
