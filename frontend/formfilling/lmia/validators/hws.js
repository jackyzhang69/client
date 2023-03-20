const yup = require('yup');
const { getProvMedian } = require('../../libs/db');
const { isNumberWithStringFormat } = require("./common");

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
    recruitmentSchema,
    seasonalInfoSchema
} = require('./common');

const activitySchema = yup.object().shape({
    title: yup.string().required(),
    describe: yup.string().required(),
    outcome: yup.string().required(),
    comments: yup.string().notRequired(),
});

const transitionPlanSchema = yup.object().shape({
    current_number_of_canadian_workers: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    current_number_of_foreign_workers: yup.mixed().test('is-number-with-string-format', 'Must be a valid number but in string format', value => isNumberWithStringFormat(value)).required(),
    exempted_from_tp: yup.boolean().required(),
    exempted_crieria: yup.string().when('exempted_from_tp', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.string().notRequired()
    }),
    exemption_details: yup.string().when('exempted_from_tp', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.string().notRequired()
    }),
    have_completed_tp: yup.boolean().required(),
    previous_tp_results: yup.string().when('have_completed_tp', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.string().notRequired()
    }),
    activities: yup.array().of(activitySchema).min(1).required(),
}).required();


const hwsSchema = yup.object().shape({
    login: loginSchema,
    cra_number: craSchema,
    employer_contacts: employerContactsSchema,
    representative: representativeSchema,
    stream: streamSchema,
    wage: wageSchema,
    work_location_duration: workLocationDurationSchema,

    foreign_worker: foreignWorkerSchema,
    seasonal_info: seasonalInfoSchema,
    transition_plan: transitionPlanSchema,
    hours_pay: hoursPaySchema,
    job_offer: jobofferSchema,
    recruitment: recruitmentSchema,
}).test("check-logic", "Wage amount must be higher than provincial median wage for HWS", async function (data) {
    const prov = data.work_location_duration.locations[0].province;
    const provincial_median_wage = await getProvMedian(prov);
    return data.wage.amount >= provincial_median_wage;
}).test(
    "check-provide_name",
    "Please provide the TFW's name, dob, and current country of residence.",
    function (data) {
        if (!data.willProvideTFWName) return true;

        if (data.foreign_worker.names.length === 0) return false;

        const d = data.foreign_worker.names[0];
        const tfwInfo = [d.first_name, d.last_name, d.dob, d.current_country]
        if (
            tfwInfo.some((item) => item === "" || item === null || item === undefined)
        ) { return false; } else {
            return true;
        }
    }
);

module.exports = hwsSchema;


