const yup = require('yup');

const travelSchema = yup.object().shape({
    start_date: yup.string()
        .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
    end_date: yup.string()
        .matches(/^\d{4}\/\d{2}$/, 'Invalid date format in DOB. Must be "YYYY/MM"'),
    length: yup.string().required().max(16),
    destination: yup.string().required().max(31),
    purpose: yup.string().required().max(31),
}).nullable();

const personSchema = yup.object().shape({
    family_name: yup.string().required().max(100),
    given_name: yup.string().required().max(100),
    travels: yup.array().of(travelSchema).nullable(),
});


const imm5562Schema = yup.object().shape({
    pa: personSchema,
    sp: personSchema.nullable(),
    dp: yup.object().shape({
        dps: yup.array().of(personSchema).nullable(),
        has_travel: yup.boolean().required()
    }).nullable()
});

module.exports = { imm5562Schema };

