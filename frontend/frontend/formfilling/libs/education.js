const education_level = {
    "None": 0,
    "Less than high school": 0,
    "High school": 1,
    "Certificate/Diploma(Trade)": 2,
    "Diploma/Certificate": 3,
    "Associate": 4,
    "Bachelor": 5,
    "Post-graduate diploma": 6,
    "Master": 7,
    "Doctor": 8,
};

class EducationHistory {
    constructor(edu_list) {
        this.edu_list = edu_list;
    }


    get highest() {
        const edu_indeies = this.edu_list.map(edu => education_level[edu.education_level]);
        if (edu_indeies.length > 0) {
            const highest_num = Math.max(...edu_indeies);
            for (const [k, v] of Object.entries(education_level)) {
                if (v === highest_num) {
                    return k;
                }
            }
        } else {
            return null;
        }
    }

    get highest_obj() {
        const edu_indeies = this.edu_list.map(edu => education_level[edu.education_level]);
        if (edu_indeies.length > 0) {
            const highest_num = Math.max(...edu_indeies);
            for (const [k, v] of Object.entries(education_level)) {
                if (v === highest_num) {
                    return this.edu_list.find(edu => edu.education_level === k);
                }
            }
        } else {
            return null;
        }
    }

}

module.exports = { EducationHistory };