const yup = require('yup');

const ee = [
    "Express Entry BC – Skilled Worker",
    "Express Entry BC – International Graduate"
];

const eeSchema = yup.object().shape({
    profile_number: yup.string().required(),
    expiry_date: yup.date().required(),
    validation_code: yup.string().required(),
    score: yup.number().required(),
    noc_code: yup.string().required(),
    job_title: yup.string().required(),
});

const registerSchema = yup.object().shape({
    data: yup.object().shape({
        stream: yup.string().required(),
        login: yup.object().shape({
            username: yup.string().required(),
            password: yup.string().required(),
        }),
        registrant: yup.object().shape({
            have_active_registration: yup.boolean().oneOf([false]).required(),
            applied_before: yup.boolean().required(),
            previous_file_number: yup.string().required(),
        }),
        ee: yup.object().when("stream", {
            is: (val) => ee.includes(val),
            then: () => eeSchema,
        }),
        education: yup.object().shape({
            highest_level: yup.string().required(),
            graduate_date: yup.date().required(),
            obtained_in_canada: yup.boolean().required(),
            obtained_in_bc: yup.boolean().required(),
            have_eca: yup.boolean().required(),
            qualified_supplier: yup.string().when('have_eca', {
                is: true,
                then: () => yup.string().required(),
                otherwise: () => yup.string().notRequired()
            }),
            certificate_number: yup.string().when('have_eca', {
                is: true,
                then: () => yup.string().required(),
                otherwise: () => yup.string().notRequired()
            }),
            meet_professional_designation_requirement: yup.boolean().required(),
            professional_designation: yup.string().required(),
        }),
        work_experience: yup.array().of(
            yup.object().shape({
                job_title: yup.string().required(),
                noc_code: yup.string().required(),
                job_hours: yup.string().required(),
                start_date: yup.string()
                    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"').required(),
                end_date: yup.string()
                    .nullable()
                    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"'),
                company_name: yup.string().required(),
                was_in_canada: yup.boolean().required(),
            })
        ).min(1),
        job_offer: yup.object().shape({
            legal_name: yup.string().required(),
            operating_name: yup.string().nullable(),
            unit_number: yup.string(),
            street_address: yup.string().required(),
            city: yup.string().required(),
            post_code: yup.string().required(),
            phone: yup.string().required(),
            job_title: yup.string().required(),
            noc_code: yup.string().required(),
            hours_per_week: yup.string().required(),
            hourly_rate: yup.string().required(),
            annual_wage: yup.string().required(),
            current_working_for_employer: yup.boolean().required(),
            working_full_time: yup.boolean().required(),
            meet_regional_requirements: yup.string().required(),
        }),
        language: yup.object().shape({
            english: yup.object().shape({
                test_type: yup.string().required(),
                date_sign: yup.date().required(),
                test_report_number: yup.string().when('test_type', {
                    is: 'IELTS',
                    then: () => yup.string().required(),
                    otherwise: () => yup.string().notRequired()
                }),
                registration_number: yup.string().when('test_type', {
                    is: 'IELTS',
                    then: () => yup.string().notRequired(),
                    otherwise: () => yup.string().required()
                }),
                pin: yup.string().nullable().when('test_type', {
                    is: 'IELTS',
                    then: () => yup.string().nullable(),
                    otherwise: () => yup.string()
                }),
                listening: yup.number().when('test_type', {
                    is: 'IELTS',
                    then: () => yup.number().min(0).max(9),
                    otherwise: () => yup.number().integer().min(0).max(12).required()
                }),
                reading: yup.number().when('test_type', {
                    is: 'IELTS',
                    then: () => yup.number().min(0).max(9),
                    otherwise: () => yup.number().integer().min(0).max(12).required()
                }),
                speaking: yup.number().when('test_type', {
                    is: 'IELTS',
                    then: () => yup.number().min(0).max(9),
                    otherwise: () => yup.number().integer().min(0).max(12).required()
                }),
                writting: yup.number().when('test_type', {
                    is: 'IELTS',
                    then: () => yup.number().min(0).max(9),
                    otherwise: () => yup.number().integer().min(0).max(12).required()
                })
            }).nullable(),
            french: yup.object().shape({
                test_type: yup.string().required(),
                date_session: yup.date().required(),
                attestation_number: yup.string().required(),
                listening: yup.number().when('test_type', {
                    is: 'TEF',
                    then: () => yup.number().min(0).max(360),
                    otherwise: () => yup.number().integer().min(0).max(699)
                }).required(),
                reading: yup.number().when('test_type', {
                    is: 'TEF',
                    then: () => yup.number().min(0).max(300),
                    otherwise: () => yup.number().integer().min(0).max(699)
                }).required(),
                speaking: yup.number().when('test_type', {
                    is: 'TEF',
                    then: () => yup.number().min(0).max(450),
                    otherwise: () => yup.number().integer().min(0).max(20)
                }).required(),
                writing: yup.number().when('test_type', {
                    is: 'TEF',
                    then: () => yup.number().min(0).max(450),
                    otherwise: () => yup.number().integer().min(0).max(20)
                }).required()
            }).nullable()
        }),
        submit: yup.object().shape({
            pa_name: yup.string().required(),
            has_rep: yup.boolean().required(),
            rep: yup.object().when('has_rep', {
                is: true,
                then: () => yup.object().shape({
                    first_name: yup.string().required(),
                    last_name: yup.string().required(),
                    phone: yup.string().required(),
                }),
                otherwise: () => yup.object().strip(),
            }),
        }),
        stream: yup.string().required(),
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
});


module.exports = {
    registerSchema
};

