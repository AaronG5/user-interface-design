// IŠSILAVINIMAS
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

// VEDYBINĖ PADĖTIS

const MARRIAGE_AGE = 18;

const birthDateInput = document.getElementById("gimimo_data");
const maritalFieldset = document.getElementById("vedybine_fieldset");

function parseBirthDate(text) {
   const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(text);
   if (!match) return null;

   const year = Number(match[1]);
   const month = Number(match[2]) - 1; // JS date month [0-11]
   const day = Number(match[3]);
   const date = new Date(year, month, day);

   if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
   ) {
      return null;
   }
   return date;
}

function getAge(birthDate) {
   const today = new Date();
   let age = today.getFullYear() - birthDate.getFullYear();

   // Not had a birthday yet this year: one year younger
   const birthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
         today.getDate() >= birthDate.getDate());
   if (!birthdayPassed) age--;

   return age;
}

function updateMaritalStatus() {
   const birthDate = parseBirthDate(birthDateInput.value);
   const isAdult = birthDate !== null && getAge(birthDate) >= MARRIAGE_AGE;

   // A disabled fieldset disables every field inside it
   maritalFieldset.hidden = !isAdult;
   maritalFieldset.disabled = !isAdult;
}

birthDateInput.addEventListener("input", updateMaritalStatus);
updateMaritalStatus();

const maritalSelect = document.getElementById("vedybine");
const spouseGroup = document.getElementById("sutuoktinis_group");

function updateSpouseFields() {
   const isMarried = maritalSelect.value === "vedes";

   spouseGroup.hidden = !isMarried;
   for (const input of spouseGroup.querySelectorAll("input")) {
      input.disabled = !isMarried;
   }
}

maritalSelect.addEventListener("change", updateSpouseFields);
updateSpouseFields();
