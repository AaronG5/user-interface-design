// Degrees each education level can give. Levels not listed give no degree.
const DEGREES = {
   aukstasis_kolegijinis: [
      { value: "profesinis_bakalauras", text: "Profesinio bakalauro" },
   ],
   aukstasis_universitetinis: [
      { value: "bakalauras", text: "Bakalauro" },
      { value: "magistras", text: "Magistro" },
      { value: "daktaras", text: "Mokslų daktaro" },
   ],
};

// Education levels that give a qualification (specialybė)
const LEVELS_WITH_QUALIFICATION = [
   "profesinis",
   "aukstasis_kolegijinis",
   "aukstasis_universitetinis",
];

const educationSelect = document.getElementById("issilavinimas");
const degreeGroup = document.getElementById("mokslo_laipsnis_group");
const degreeSelect = document.getElementById("mokslo_laipsnis");
const qualificationGroup = document.getElementById("kvalifikacija_group");
const qualificationInput = document.getElementById("kvalifikacija");

function updateQualification() {
   const hasQualification = LEVELS_WITH_QUALIFICATION.includes(
      educationSelect.value,
   );
   qualificationGroup.hidden = !hasQualification;
   qualificationInput.disabled = !hasQualification;
}

function updateDegreeOptions() {
   const degrees = DEGREES[educationSelect.value] ?? [];

   // Keep only the "Pasirinkite..." placeholder, then add the matching degrees
   degreeSelect.length = 1;
   for (const degree of degrees) {
      degreeSelect.add(new Option(degree.text, degree.value));
   }

   // Only one possible degree: pick it for the user
   degreeSelect.selectedIndex = degrees.length === 1 ? 1 : 0;

   // Show the field only when the selected level gives a degree.
   // A disabled field is skipped by validation and not submitted.
   const hasDegrees = degrees.length > 0;
   degreeGroup.hidden = !hasDegrees;
   degreeSelect.disabled = !hasDegrees;
}

function updateEducationFields() {
   updateQualification();
   updateDegreeOptions();
}

educationSelect.addEventListener("change", updateEducationFields);
updateEducationFields();
