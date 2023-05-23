/*
This is common part of adaptors for LMIA form filling.
*/

const { convertWage, bestMatch } = require("../../libs/utils");
const { Address } = require("../../libs/contact");
const countries = require("./countries.json");

const employerContacts = (data) => {
    // employer contacts
    let employer_contacts = [];
    data.contact.forEach((contact) => {
        employer_contacts.push(contact.first_name + ' ' + contact.last_name)
    })
    return employer_contacts;
}

const representativeData = (data) => {
    return {
        name: data.rcic.first_name + ' ' + data.rcic.last_name,
        paid: true,
        type: 0,
        member_id: data.rcic.rcic_number,
        province: data.rcic.province,
        explaination: data.rcic.explaination
    }
}

const streamData = (data) => {
    const stream_map = {
        "EE": "PermRes",
        "HWS": "Wage",
        "LWS": "Wage",
        "GTS": "GTSFull",
        "AC": "Academs",
        "AG": "Agri",
        "CG": "Caregiver"
    }
    let category = ""
    if (data.lmiacase.stream_of_lmia == "HWS" || data.lmiacase.stream_of_lmia == "LWS") {
        category = data.lmiacase.stream_of_lmia
    }
    if (data.lmiacase.stream_of_lmia == "GTS") {
        category = "CatB" //CatA is not supported since we don't have that business 
    }

    const stream = {
        name: stream_map[data.lmiacase.stream_of_lmia],
        category: category
    }
    return stream;
}

const wageData = (data) => {
    let wage = {}
    if (data.joboffer.wage_unit == "hourly") {
        wage = {
            amount: data.joboffer.wage_rate.toString(),
            isConverted: false,
            explaination: ""
        }
    } else {
        const hours_per_day = data.joboffer.hours / data.joboffer.days
        const hourlyRate = convertWage(data.joboffer.wage_rate, data.joboffer.wage_unit, "hourly", hours_per_day, data.joboffer.days)
        wage = {
            amount: parseFloat(hourlyRate.amount).toFixed(2).toString(),
            isConverted: true,
            explaination: hourlyRate.explaination
        }
    }
    return wage;
}

const locationData = (data) => {
    const locations = data.eraddress
        .filter((address) => address.variable_type === "working_address" && address.street_name)
        .map((address) => {
            const working_address = new Address(
                address.street_number,
                address.street_name,
                address.city,
                address.province,
                address.country,
                address.post_code,
                address.po_box,
                address.unit,
                address.district,
                address.identifier
            );

            const business_op_name = data.general.operating_name || data.general.legal_name;
            const business_activity = data.general.business_intro;
            const safety_concerns = data.lmi.safety_concerns;
            const addressStr = working_address.identifier ? working_address.identifier : working_address.getCityAddress();
            const province = address.province;

            return {
                business_op_name,
                business_activity,
                safety_concerns,
                address: addressStr,
                province,
            };
        });

    // set primary location
    for (let i = 0; i < locations.length; i++) {
        if (i == 0)
            locations[i].is_primary = true;
        else {
            locations[i].is_primary = false;
        }
    }

    return locations;
}

// work permit duration
const work_permit_duration_unit_map = {
    "year": "Y",
    "month": "M",
    "years": "Y",
    "months": "M"
}

const durationData = (data) => {
    return {
        amount: data.lmiacase.duration_number.toString(),
        unit: work_permit_duration_unit_map[data.lmiacase.duration_unit],
        justification: data.lmiacase.duration_reason
    }
}

// foreign worker data
const foreignWorkerData = (data) => {
    if (data.lmiacase.stream_of_lmia === "HWS" && data.emp5626.named === "No") return { names: [] }
    if (data.lmiacase.stream_of_lmia === "LWS" && data.emp5627.named === "No") return { names: [] }

    const the_country_abbr = data.personal.current_country ? countries[bestMatch(data.personal.current_country, Object.keys(countries), true)] : null;
    const foreign_worker = {
        names: [
            {
                first_name: data.personal.first_name,
                last_name: data.personal.last_name,
                dob: data.personal.dob.split(" ")[0],
                current_country: the_country_abbr,
            }
        ]
    }
    return foreign_worker;
}

// hours and pay

const hoursAndPayData = (data) => {
    const hours_per_day = data.joboffer.hours / data.joboffer.days
    const hourlyRate = convertWage(data.joboffer.wage_rate, data.joboffer.wage_unit, "hourly", hours_per_day, data.joboffer.days)
    wage = {
        amount: parseFloat(hourlyRate.amount).toFixed(2).toString(),
        isConverted: true,
        explaination: hourlyRate.explaination
    }

    const daily_hours = data.joboffer.hours / data.joboffer.days;
    const ot_rate = data.joboffer.ot_ratio * wage.amount;

    return {
        has_same_position: data.position.has_same == "Yes" ? true : false,
        lowest: data.position.lowest ? data.position.lowest.toString() : null,
        highest: data.position.highest ? data.position.highest.toString() : null,
        without_standard_schedule: data.joboffer.atypical_schedule == "Yes" ? true : false,
        schedule_details: data.joboffer.atypical_schedule_explain,
        daily_hours: daily_hours ? daily_hours.toString() : null,
        weekly_hours: data.joboffer.hours ? data.joboffer.hours.toString() : null,
        not_full_time_position: data.joboffer.hours < 30,
        not_ft_reason: data.joboffer.part_time_explain,
        has_overtime_rate: true,  // it's the must, or we can't submit the form
        ot_rate: ot_rate ? ot_rate.toString() : null,
        ot_determined_by: data.joboffer.ot_after_hours_unit == "day" ? 0 : 1,
        contingent_wage: false, // TODO: So far, we don't have this info
        contingent_wage_details: ""
    }
}

// job offer

const jobOfferData = (data) => {
    const jo = data.joboffer
    const provide_benefits = [jo.disability_insurance, jo.dental_insurance, jo.empolyer_provided_persion, jo.extended_medical_insurance, jo.extra_benefits].some(value => value == "Yes");
    const education_level_map = {
        "Doctor": 1,
        "Master": 2,
        "Post-graduate diploma": 4,
        "Bachelor": 3,
        "Associate": 4,
        "Diploma/Certificate": 4,
        "High school": 7,
        "Less than high school": 9,

    }

    // required language is not Yes/No but 0/1/2 with Exempt option
    const required_language = () => {
        if (data.joboffer.english_french == "Yes") {
            return 0;
        } else if (data.joboffer.english_french == "No") {
            return 2;
        } else if (data.joboffer.english_french == "Exempt") {
            return 1;
        }
    }

    const job_offer = {
        job_title: jo.job_title,
        main_duties: jo.duties,
        position_requested_retional: data.position.why_hire,
        job_start_date: jo.work_start_date.split(" ")[0],
        require_special_language: required_language(),
        oral_language: jo.oral,
        written_language: jo.writing,
        reason_for_no: jo.reason_for_no,
        require_other_language: jo.other_language_required == "Yes" ? true : false,
        other_language: jo.reason_for_other,
        has_minimum_education_req: true,
        minimum_education_level: education_level_map[jo.education_level],
        minimum_education_details: jo.specific_edu_requirement,
        minimum_skills_and_experience: jo.skill_experience_requirement,
        has_license_req: jo.license_request == "Yes" ? true : false,
        license_req_details: jo.license_description,
        is_part_of_union: data.position.under_cba == "Yes" ? true : false, // previously, it's in info-joboffer, but moved to info-position: under_cba
        will_provide_benefits: provide_benefits,
        has_disability_insurance: jo.disability_insurance == "Yes" ? true : false,
        has_dental_insurance: jo.dental_insurance == "Yes" ? true : false,
        has_pension: jo.empolyer_provided_persion == "Yes" ? true : false,
        has_extended_medical_insurance: jo.extended_medical_insurance == "Yes" ? true : false,
        has_other_benefits: jo.extra_benefits ? true : false,
        other_benefits_details: jo.extra_benefits,
        vacation_days: jo.vacation_pay_days ? jo.vacation_pay_days.toString() : null,
        vacation_pay_percentage: jo.vacation_pay_percentage ? jo.vacation_pay_percentage.toString() : null,
    }

    return job_offer;
}

// recruitment 
const recruitmentData = (data) => {
    const get_jobbank_id = () => {
        for (let adv of data.advertisement) {
            if (adv.media.toLowerCase() === "jobbank") {
                return adv.advertisement_id ? adv.advertisement_id.toString() : null;
            }
        }
    }

    // compute interview records
    function computeInterviewStatistics(interviewRecords) {
        let resumesReceived = interviewRecords.length;
        let canadiansInterviewed = 0;
        let canadiansOffered = 0;
        let canadiansHired = 0;
        let canadiansDeclinedOffers = 0;
        let resumesNotInterviewedOffered = 0;
        let why_canadian_not_hired = "";
        let canadian_records = [];
        let index = 0;

        for (const record of interviewRecords) {
            // Check if candidate is Canadian
            if (["Citizen", "PR", "Unknown"].includes(record.canadian_status)) {
                // Increment number of Canadians interviewed
                if (record.interviewed === "Yes")
                    canadiansInterviewed++;

                // Check if Canadian candidate was offered a job
                if (record.offered === "Yes") {
                    // Increment number of Canadians offered a job
                    canadiansOffered++;

                    // Check if Canadian candidate accepted the job offer
                    if (record.accepted === "Yes") {
                        // Increment number of Canadians hired
                        canadiansHired++;
                    } else if (record.accepted === "No") {
                        // Increment number of Canadians who declined job offers
                        canadiansDeclinedOffers++;
                    }
                }
                // Check if not interviewed and not offered
                if (record.offered === "No" && record.interviewed === "No") {
                    // Increment number of resumes not interviewed but offered a job
                    resumesNotInterviewedOffered++;
                }

                // assemble why Canadian not hired
                if (
                    (record.offered === "No" || (record.offered === "Yes" && record.accepted === "No"))
                ) {
                    canadian_records.push(`Applicant ${index + 1}: ${record.record}`);
                }
            }
            index += 1;
        }
        why_canadian_not_hired = canadian_records.join("\n");

        return {
            resumesReceived,
            canadiansInterviewed,
            canadiansOffered,
            canadiansHired,
            canadiansDeclinedOffers,
            resumesNotInterviewedOffered,
            why_canadian_not_hired
        };
    }

    const summary = computeInterviewStatistics(data.interviewrecord);

    const recruitment = {
        job_ad_waivable: data.lmiacase.is_waived_from_advertisement == "Yes" ? true : false,
        recruited_canadian: true,
        waivable_rationale: data.lmiacase.reason_for_waived,
        provide_recruitment_details: data.lmiacase.provide_details_even_waived,
        using_jobbank: data.lmiacase.use_jobbank == "Yes" ? true : false,
        why_not_use_jobbank: data.lmiacase.reason_not_use_jobbank,
        job_creation: data.lmi.job_creation_benefit ? true : false,
        job_creation_details: data.lmi.job_creation_benefit,
        jobbank_posting_no: get_jobbank_id(),
        resumes_received: summary.resumesReceived.toString(),
        canadians_interviewed: summary.canadiansInterviewed.toString(),
        canadians_offered: summary.canadiansOffered.toString(),
        canadians_hired: summary.canadiansHired.toString(),
        canadians_declined_offers: summary.canadiansDeclinedOffers.toString(),
        resumes_not_interviewed_offered: summary.resumesNotInterviewedOffered.toString(),
        why_not_recruit_canadians: summary.why_canadian_not_hired,
        employees_number: (Math.round(data.general.ft_employee_number + data.general.pt_employee_number)).toString(),
        revenue_more_than_5m: data.finance[0].revenue >= 5000000,
        why_not_attempted_to_recruit_canadians: null, //TODO: we have no such situation, so just leave it null
        transfer_skills: data.lmi.skill_transfer_benefit ? true : false,
        transfer_skills_details: data.lmi.skill_transfer_benefit,
        fill_labour_shortage: data.lmi.fill_shortage_benefit ? true : false,
        fill_labour_shortage_details: data.lmi.fill_shortage_benefit,
        other_benefits: data.lmi.other_benefit,
        laid_off: data.lmi.laid_off_in_12 == "Yes" ? true : false,
        laid_off_canadians: data.lmi.laid_off_canadians ? data.lmi.laid_off_canadians.toString() : null,
        laid_off_tfw: data.lmi.laid_off_tfw ? data.lmi.laid_off_tfw.toString() : null,
        laid_off_reason: data.lmi.laid_off_reason,
        lead_to_job_losss: false,
        lead_to_job_losss_details: "",  // Must don't be true, otherwise the application will be rejected
        receive_support_from_esdc: false,
        receive_support_from_esdc_details: "", // Must don't be true, otherwise the application will be rejected
        labour_dispute: data.lmi.labour_dispute == "Yes" ? true : false,
        labour_dispute_details: data.lmi.labour_dispute_info,
    }

    return recruitment;
}

const commonData = (data) => {
    // employer contacts
    const employer_contacts = employerContacts(data);

    // representative
    const representative = representativeData(data);

    // stream
    const stream = streamData(data);

    // wage
    const wage = wageData(data);

    // work location and duration
    const locations = locationData(data);

    // work permit duration
    const duration = durationData(data);

    // foreign worker
    const foreign_worker = foreignWorkerData(data);

    // hours and pay
    const hours_pay = hoursAndPayData(data);


    // job offer
    const job_offer = jobOfferData(data);

    // recruitment
    const recruitment = recruitmentData(data);

    return {
        cra_number: data.general.cra_number,
        employer_contacts,
        representative,
        stream,
        wage,
        work_location_duration: {
            locations,
            duration,
            number_of_workers: data.lmiacase.number_of_tfw.toString()
        },
        foreign_worker,
        hours_pay,
        job_offer,
        recruitment
    }

}

module.exports = {
    employerContacts,
    representativeData,
    streamData,
    wageData,
    locationData,
    durationData,
    foreignWorkerData,
    hoursAndPayData,
    jobOfferData,
    recruitmentData,
    commonData
}




