const yup = require('yup');

const commonSchema = yup.object().shape({
    full_name: yup.string().required(),
    dob: yup.string()
        .matches(/^\d{4}\/\d{2}\/\d{2}$/, 'Invalid date format in dob. Must be "YYYY/MM/DD"'),
    country_of_birth: yup.string().required(),
    marital_status: yup
        .string()
        .required(),
    email: yup.string().notRequired(),
    address: yup.string().required(),
    relationship: yup.string().required(),
});

const personSchema = yup.object().shape({
    ...commonSchema.fields,
    spouse: commonSchema.notRequired(),
    father: commonSchema.notRequired(),
    mother: commonSchema.notRequired(),
    children: yup
        .array()
        .of(commonSchema)
        .notRequired(),
    siblings: yup
        .array()
        .of(commonSchema)
        .notRequired(),
});

const imm5406Schema = yup.object().shape({
    pa: personSchema.required(),
    sp: personSchema.nullable(),
    dp: yup.array().of(personSchema).nullable(),
});

module.exports = { imm5406Schema };