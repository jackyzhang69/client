const yup = require('yup');
const { getProvMedian } = require('../../libs/db');


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
const argsSchema = require('./args');

const accommodationSchema = yup.object().shape({
    provide_accommodation: yup.boolean().required(),
    rate: yup.number().when('provide_accommodation', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    unit: yup.string().oneOf(["Month", "Week", "Other"]).when('provide_accommodation', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    type: yup.string().oneOf(["Apartment", "DormRoom", "House", "Other"]).when('provide_accommodation', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    bedrooms: yup.number().when('provide_accommodation', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    occupants: yup.number().when('provide_accommodation', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    bathrooms: yup.number().when('provide_accommodation', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    description: yup.string().when('provide_accommodation', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    why_not_provide: yup.string().when('provide_accommodation', {
        is: false,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    })
}).required();

const locationCapSchema = yup.object().shape({
    A: yup.number().integer().positive().min(0).required(),
    B: yup.number().integer().positive().min(0).required(),
    C: yup.number().integer().positive().min(0).required(),
    D: yup.number().integer().positive().min(0).required(),
    E: yup.number().integer().positive().required(),
    F: yup.number().integer().positive().min(0).required(),
    G: yup.number().positive().min(0).required(),
    H: yup.number().integer().positive().min(0).required(),
}).required();

const capSchema = yup.object().shape({
    is_cap_exempted: yup.boolean().required(),
    which_exemption: yup.string().when('is_cap_exempted', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    exemption_details: yup.string().when('is_cap_exempted', {
        is: true,
        then: () => yup.string().required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    in_seasonal_industry: yup.boolean().when(
        'is_cap_exempted', {
        is: false,
        then: () => yup.boolean().required(),
        otherwise: () => yup.boolean().notRequired(),
    }).required(),
    start_date: yup.string().when(
        'is_cap_exempted', {
        is: false,
        then: (data) => data.matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"').required(),
        otherwise: () => yup.mixed().notRequired(),
    }),
    end_date: yup.string().when(
        'is_cap_exempted', {
        is: false,
        then: (data) => data.matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Must be "YYYY-MM-DD"').required(),
        otherwise: () => yup.mixed().notRequired(),
    }),

    location_caps: yup.array().of(locationCapSchema).when('is_cap_exempted', {
        is: false,
        then: () => yup.array().of(locationCapSchema).min(1).required(),
        otherwise: () => yup.array().of(locationCapSchema),
    }).notRequired(),

});

const lwsSchema = yup.object().shape({
    login: loginSchema,
    cra_number: craSchema,
    employer_contacts: employerContactsSchema,
    representative: representativeSchema,
    stream: streamSchema,
    wage: wageSchema,
    work_location_duration: workLocationDurationSchema,
    foreign_worker: foreignWorkerSchema,
    accommodation: accommodationSchema,
    cap: capSchema,
    hours_pay: hoursPaySchema,
    job_offer: jobofferSchema,
    recruitment: recruitmentSchema,
}).test("check-logic", "Wage amount must be less than provincial median wage for LWS", async function (data) {
    const province = data.work_location_duration.locations[0].province;
    const provincial_median_wage = await getProvMedian(province);
    return data.wage.amount < provincial_median_wage;
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

module.exports = lwsSchema;


