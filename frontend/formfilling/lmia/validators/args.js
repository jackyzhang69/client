const yup = require('yup');

const argsSchema = yup.object().shape({
    lmiaNumber: yup.string().nullable().notRequired(),
    is_part_of_union: yup.bool().required(),
    skipToPage: yup
        .number()
        // if only print, then skipToPage is not required
        .when(['lmiaNumber', 'print'], {
            is: (lmiaNumber, print) => lmiaNumber !== null && lmiaNumber !== undefined && lmiaNumber !== '' && !print,
            then: () => yup.number().integer().positive().required('The page number to be skipped to is required'),
            otherwise: () => yup.number().notRequired()
        }),
    pdf: yup.boolean().default(false),
    png: yup.boolean().default(false),
    screen_snap_folder: yup
        .string()
        .trim()
        .required('Screen snap folder is required')
        .matches(/^\/.*\/[a-zA-Z]*$/, 'Screen snap folder must be a valid path'),
    upload_folder: yup.string().notRequired(),
    compensation_justification_doc: yup.string()
        .when("is_part_of_union", {
            is: true,
            then: () => yup.string().required("Compensation justification document is required since the job is in unionized industry"),
            otherwise: () => yup.string().notRequired()
        }),
    headless: yup.boolean().default(false),
    slow_mo: yup.number().integer().min(0).default(0),
    view_port_size: yup
        .object()
        .when('headless', {
            is: true,
            then: () => yup
                .object()
                .shape({
                    width: yup.number().integer().positive().required(),
                    height: yup.number().integer().positive().required()
                })
                .required('View port size is required')
        }),
    defaultTimeOut: yup.number().integer().positive()
});




module.exports = argsSchema;