const yup = require('yup');
const {
    loginSchema,
    craSchema,
    employerContactsSchema,
    representativeSchema,
    streamSchema,
    wageSchema,
    foreignWorkerSchema,
    workLocationDurationSchema,
    hoursPaySchema,
    jobofferSchema,
    recruitmentSchema
} = require('./common');

const prSchema = yup.object().shape({
    support_pr_only: yup.boolean().required(),
    joined_with_another_employer: yup.boolean().required(),
    who_currently_filling_the_duties: yup.string().required(),
    how_did_you_find_the_tfw: yup.string().required(),
    previously_employed: yup.boolean().required(),
    previous_employment_desc: yup.string().when('previously_employed', {
        is: true,
        then: () => () => yup.string().required(),
        otherwise: () => yup.string().notRequired(),
    }),
    how_did_you_determine_the_tfw: yup.string().required(),
    how_when_offered: yup.string().required(),
}).required();

const eeSchema = yup.object().shape({
    login: loginSchema,
    cra_number: craSchema,
    employer_contacts: employerContactsSchema,
    representative: representativeSchema,
    stream: streamSchema,
    wage: wageSchema,
    work_location_duration: workLocationDurationSchema,
    foreign_worker: foreignWorkerSchema,
    pr: prSchema,
    hours_pay: hoursPaySchema,
    job_offer: jobofferSchema,
    recruitment: recruitmentSchema,
});



module.exports = eeSchema;
