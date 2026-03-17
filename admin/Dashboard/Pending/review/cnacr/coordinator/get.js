document.addEventListener("DOMContentLoaded", loadReport);

async function loadReport(){

    try{

        const response = await fetch("get_cnacr.php");
        const result = await response.json();

        if(!result.success){
            console.error(result.error);
            return;
        }

        if(result.data.length === 0){
            console.log("No report found");
            return;
        }

        const report = result.data[0];

        document.querySelector('[name="date_conduct"]').value = report.date_conduct;
        document.querySelector('[name="participants"]').value = report.participants;
        document.querySelector('[name="location"]').value = report.location;
        document.querySelector('[name="family_profile"]').value = report.family_profile;
        document.querySelector('[name="community_concern"]').value = report.community_concern;
        document.querySelector('[name="other_identified_needs"]').value = report.other_identified_needs;

        document.querySelector('[name="kabayani_ng_panginoon"]').value = report.kabayani_ng_panginoon;
        document.querySelector('[name="kabayani_ng_kalikasan"]').value = report.kabayani_ng_kalikasan;
        document.querySelector('[name="kabayani_ng_buhay"]').value = report.kabayani_ng_buhay;
        document.querySelector('[name="kabayani_ng_turismo"]').value = report.kabayani_ng_turismo;
        document.querySelector('[name="kabayani_ng_kultura"]').value = report.kabayani_ng_kultura;

        document.querySelector('[name="title_of_program"]').value = report.title_of_program;
        document.querySelector('[name="objectives"]').value = report.objectives;
        document.querySelector('[name="beneficiaries"]').value = report.beneficiaries;

        document.querySelector('[name="from_school"]').value = report.from_school;
        document.querySelector('[name="from_community"]').value = report.from_community;

    }
    catch(error){
        console.error("Fetch error:", error);
    }

}