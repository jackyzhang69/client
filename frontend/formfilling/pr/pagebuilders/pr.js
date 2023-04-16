/* PR IMM5562 pages builder. */

const WebPages = require('../../models/pages');
const { Dashboard5562, Brief5562, Pa5562, Sp5562, Dp5562 } = require('../poms/imm5562');
const { Dashboard5669, Hub5669, PersonalDetails, Questionanaire, Education, PersonalHistory, Membership, Government, Military, Address, BackToDashboard5669 } = require('../poms/imm5669');
const { Dashboard5406, Hub5406, SectionA, SectionB, SectionC, BackToDashboard5406 } = require('../poms/imm5406');
const { Dashboard0008, Imm0008Intro, ApplicationDetail, ContactInformation, PersonalDetails0008, Education0008, Language, Passport, Id, Hub0008, BackToDashboard0008 } = require('../poms/imm0008');
const { Login, ViewApplication, ApplicationPicker, DashBoard } = require('../poms/start');
const gotoDashboard = [Login, ViewApplication, ApplicationPicker, DashBoard]
const Imm5562Pages = [Dashboard5562, Brief5562, Pa5562, Sp5562, Dp5562];
const Imm5669Pages = [Hub5669, PersonalDetails, Questionanaire, Education, PersonalHistory, Membership, Government, Military, Address];
const Imm5406Pages = [Hub5406, SectionA, SectionB, SectionC];

function buildPages(page, args) {
    let webPages = [];
    const forms = args.forms;
    // goto dashboard
    for (const p of gotoDashboard) webPages.push(new p(page, args));

    // build pages imm0008
    // 1. pa
    if (forms.includes("0008")) {
        webPages.push(new Dashboard0008(page, args));
        webPages.push(new Imm0008Intro(page, args));
        const pa_pages = [ApplicationDetail, PersonalDetails0008, ContactInformation, Passport, Id, Education0008, Language];
        const sp_dp_pages = [PersonalDetails0008, Education0008, Language, Passport, Id];
        for (const p of pa_pages) webPages.push(new p(page, args.data.imm0008.pa, 'PA'));

        // check if have dependants
        const sp = args.data.imm0008.sp;
        const dp = args.data.imm0008.dp;
        if (sp || dp && dp.length > 0) {
            // if have dependants, go to hub
            if (sp) {
                webPages.push(new Hub0008(page, args.data.imm0008.sp, "SP"));
                // fill sp
                for (const p of sp_dp_pages) webPages.push(new p(page, args.data.imm0008.sp, 'SP'));

            }
            // fill dp if exist
            fillDP(dp, sp_dp_pages);
        }
        // back to dashboard
        const last_role = dp && dp.length > 0 ? "DP" : sp ? "SP" : "PA";
        webPages.push(new BackToDashboard0008(page, null, last_role));

    }

    if (forms.includes("5669")) {
        // enter 5669 hub
        webPages.push(new Dashboard5669(page, args));
        // fill pa 5669
        for (const p of Imm5669Pages) webPages.push(new p(page, args.data.imm5669.pa, 'PA'));
        // fill sp 5669
        if (args.data.imm5669.sp) for (const p of Imm5669Pages) webPages.push(new p(page, args.data.imm5669.sp, 'SP'));
        // fill dp 5669
        if (args.data.imm5669.dp && args.data.imm5669.dp.length > 0) {
            for (let i = 0; i < args.data.imm5669.dp.length; i++) {
                for (const p of Imm5669Pages) webPages.push(new p(page, args.data.imm5669.dp[i], 'DP', i + 1));
            }
        }

        // back to dashboard
        webPages.push(new BackToDashboard5669(page, null, "DP"));
    }


    if (forms.includes("5406")) {
        webPages.push(new Dashboard5406(page, args));
        for (const p of Imm5406Pages) webPages.push(new p(page, args.data.imm5406.pa, 'PA'));

        if (args.data.imm5406.sp) for (const p of Imm5406Pages) webPages.push(new p(page, args.data.imm5406.sp, 'SP'));
        if (args.data.imm5406.dp && args.data.imm5406.dp.length > 0) {
            for (let i = 0; i < args.data.imm5406.dp.length; i++) {
                for (const p of Imm5406Pages) webPages.push(new p(page, args.data.imm5406.dp[i], 'DP', i + 1));
            }
        }
        webPages.push(new BackToDashboard5406(page, null, "DP"));
    }

    if (forms.includes("5562")) {
        for (const p of Imm5562Pages) webPages.push(new p(page, args));
    }

    return new WebPages(webPages);

    function fillDP(dp, sp_dp_pages) {
        if (!dp || dp.length <= 0) return;
        for (let i = 0; i < dp.length; i++) {
            webPages.push(new Hub0008(page, dp[i], "DP", i + 1));
            for (const p of sp_dp_pages)
                webPages.push(new p(page, dp[i], 'DP', i + 1));
        }
    }
}

module.exports = { buildPages };