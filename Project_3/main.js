// IŠSILAVINIMAS
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
const institutionGroup = document.getElementById("istaiga_group");

// Institution and graduation year apply to every level, so they appear
// as soon as any level is selected
function updateInstitution() {
   const hasLevel = educationSelect.value !== "";

   institutionGroup.hidden = !hasLevel;
   for (const input of institutionGroup.querySelectorAll("input")) {
      input.disabled = !hasLevel;
   }
}

function updateQualification() {
   const hasQualification = LEVELS_WITH_QUALIFICATION.includes(
      educationSelect.value,
   );
   qualificationGroup.hidden = !hasQualification;
   qualificationInput.disabled = !hasQualification;
}

function updateDegreeOptions() {
   const degrees = DEGREES[educationSelect.value] ?? [];

   degreeSelect.length = 1;
   for (const degree of degrees) {
      degreeSelect.add(new Option(degree.text, degree.value));
   }

   degreeSelect.selectedIndex = degrees.length === 1 ? 1 : 0;

   // Show the field only when the selected level gives a degree.
   // A disabled field is skipped by validation and not submitted.
   const hasDegrees = degrees.length > 0;
   degreeGroup.hidden = !hasDegrees;
   degreeSelect.disabled = !hasDegrees;
}

function updateEducationFields() {
   updateInstitution();
   updateQualification();
   updateDegreeOptions();
}

educationSelect.addEventListener("change", updateEducationFields);
updateEducationFields();

// VEDYBINĖ PADĖTIS

const MARRIAGE_AGE = 18;

const birthDateInput = document.getElementById("gimimo_data");
const maritalCard = document.getElementById("vedybine_card");
const maritalFieldset = document.getElementById("vedybine_fieldset");

function parseDate(text) {
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

   const birthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
         today.getDate() >= birthDate.getDate());
   if (!birthdayPassed) age--;

   return age;
}

function updateMaritalStatus() {
   const birthDate = parseDate(birthDateInput.value);
   const isAdult = birthDate !== null && getAge(birthDate) >= MARRIAGE_AGE;

   maritalCard.hidden = !isAdult;
   maritalFieldset.disabled = !isAdult;
}

birthDateInput.addEventListener("input", updateMaritalStatus);
updateMaritalStatus();

// GIMIMO DATA

function startOfToday() {
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   return today;
}

function validateBirthDate() {
   const text = birthDateInput.value;
   const birthDate = parseDate(text);

   let message = "";
   if (/^\d{4}\/\d{2}\/\d{2}$/.test(text) && birthDate === null) {
      message = "Tokios datos nėra";
   } else if (birthDate !== null && birthDate > startOfToday()) {
      message = "Gimimo data negali būti ateityje";
   }
   birthDateInput.setCustomValidity(message);
}

birthDateInput.addEventListener("input", validateBirthDate);
validateBirthDate();

function formatDateDigits(digits, addTrailingSlash) {
   let text = digits.slice(0, 4);

   if (digits.length > 4 || (addTrailingSlash && digits.length === 4)) {
      text += "/" + digits.slice(4, 6);
   }
   if (digits.length > 6 || (addTrailingSlash && digits.length === 6)) {
      text += "/" + digits.slice(6, 8);
   }
   return text;
}

function maskDateInput(event) {
   const input = event.target;
   const digits = input.value.replace(/\D/g, "").slice(0, 8);

   const isDeleting = event.inputType?.startsWith("delete") ?? false;
   input.value = formatDateDigits(digits, !isDeleting);
}

document.addEventListener(
   "input",
   (event) => {
      if (event.target === birthDateInput) maskDateInput(event);
   },
   true,
);

// ASMENS KODAS
// Format GAABBCCxxxx: AA = year, BB = month, CC = day of birth.

const personalCodeInput = document.getElementById("asmens_kodas");

function twoDigits(number) {
   return String(number).padStart(2, "0");
}

function centuryIndexFromDigit(digit) {
   return Math.floor((digit - 1) / 2);
}

function centuryIndexFromYear(year) {
   return Math.floor((year - 1800) / 100);
}

function sexFromDigit(digit) {
   return digit % 2 === 1 ? "vyras" : "moteris";
}

// Minimal filling: the birth date and sex are read from the code, so the

function fillFromPersonalCode() {
   const code = personalCodeInput.value;
   if (!/^[1-6]\d{6}/.test(code)) return;

   const firstDigit = Number(code[0]);
   const year =
      1800 + centuryIndexFromDigit(firstDigit) * 100 + Number(code.slice(1, 3));
   const dateText = `${year}/${code.slice(3, 5)}/${code.slice(5, 7)}`;

   if (parseDate(dateText) !== null && birthDateInput.value !== dateText) {
      birthDateInput.value = dateText;
      birthDateInput.dispatchEvent(new Event("input", { bubbles: true }));
   }

   const sexRadio = document.querySelector(
      `input[name="lytis"][value="${sexFromDigit(firstDigit)}"]`,
   );
   if (!sexRadio.checked) {
      sexRadio.checked = true;
      sexRadio.dispatchEvent(new Event("change", { bubbles: true }));
   }
}

function validatePersonalCode() {
   const code = personalCodeInput.value;
   const birthDate = parseDate(birthDateInput.value);

   if (!/^\d{11}$/.test(code) || birthDate === null) {
      personalCodeInput.setCustomValidity("");
      return;
   }

   const expected =
      twoDigits(birthDate.getFullYear() % 100) +
      twoDigits(birthDate.getMonth() + 1) +
      twoDigits(birthDate.getDate());
   const firstDigit = Number(code[0]);
   const checkedSex = document.querySelector('input[name="lytis"]:checked');

   let message = "";
   if (code.slice(1, 7) !== expected) {
      message = `Asmens kodo 2-7 skaitmenys turi sutapti su gimimo data (${expected})`;
   } else if (
      centuryIndexFromDigit(firstDigit) !==
      centuryIndexFromYear(birthDate.getFullYear())
   ) {
      message = "Asmens kodo pirmas skaitmuo neatitinka gimimo šimtmečio";
   } else if (checkedSex && checkedSex.value !== sexFromDigit(firstDigit)) {
      message = "Asmens kodo pirmas skaitmuo neatitinka pasirinktos lyties";
   }
   personalCodeInput.setCustomValidity(message);
}

personalCodeInput.addEventListener("input", fillFromPersonalCode);
personalCodeInput.addEventListener("input", validatePersonalCode);
birthDateInput.addEventListener("input", validatePersonalCode);
for (const radio of document.querySelectorAll('input[name="lytis"]')) {
   radio.addEventListener("change", validatePersonalCode);
}
validatePersonalCode();

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

// PROFESINĖ PADĖTIS

const jobStatusSelect = document.getElementById("prof_padetis");
const jobStatusGroups = document.querySelectorAll("[data-shown-for]");

function updateJobStatusFields() {
   for (const group of jobStatusGroups) {
      const isSelected = group.dataset.shownFor === jobStatusSelect.value;

      group.hidden = !isSelected;
      for (const field of group.querySelectorAll("input, select")) {
         field.disabled = !isSelected;
      }
   }
}

jobStatusSelect.addEventListener("change", updateJobStatusFields);
updateJobStatusFields();

// DARBO PATIRTIS

const experienceRadios = document.querySelectorAll(
   'input[name="turi_darbo_patirties"]',
);
const experienceGroup = document.getElementById("darbo_patirtis_group");

function updateExperienceFields() {
   const checked = document.querySelector(
      'input[name="turi_darbo_patirties"]:checked',
   );
   const hasExperience = checked !== null && checked.value === "taip";

   experienceGroup.hidden = !hasExperience;
   for (const field of experienceGroup.querySelectorAll("input, select")) {
      field.disabled = !hasExperience;
   }
}

for (const radio of experienceRadios) {
   radio.addEventListener("change", updateExperienceFields);
}
updateExperienceFields();

// YEAR AND DATE LIMITS

const currentYear = new Date().getFullYear();
const graduationYearInput = document.getElementById("baigimo_metai");
const expectedGraduationInput = document.getElementById(
   "tiketini_baigimo_metai",
);
const experienceYearsInput = document.getElementById("darbo_patirtis");
const leaveEndInput = document.getElementById("atostogu_pabaiga");

expectedGraduationInput.min = currentYear;
expectedGraduationInput.max = currentYear + 10;

function updateYearLimits() {
   const birthDate = parseDate(birthDateInput.value);

   graduationYearInput.min = birthDate ? birthDate.getFullYear() : 1900;
   graduationYearInput.max = currentYear;

   if (birthDate) {
      experienceYearsInput.max = getAge(birthDate);
   } else {
      experienceYearsInput.removeAttribute("max");
   }
}

birthDateInput.addEventListener("input", updateYearLimits);
updateYearLimits();

function validateLeaveEnd() {
   const text = leaveEndInput.value;
   const leaveEnd = parseDate(text);

   let message = "";
   if (/^\d{4}\/\d{2}\/\d{2}$/.test(text) && leaveEnd === null) {
      message = "Tokios datos nėra";
   } else if (leaveEnd !== null && leaveEnd < startOfToday()) {
      message = "Atostogų pabaiga negali būti praeityje";
   }
   leaveEndInput.setCustomValidity(message);
}

leaveEndInput.addEventListener("input", validateLeaveEnd);
validateLeaveEnd();

// PROGRESS BAR

const progressBar = document.getElementById("progress_bar");
const progressFill = document.getElementById("progress_fill");
const progressText = document.getElementById("progress_text");

function updateProgress() {
   const fields = document.querySelectorAll(
      "input:required:enabled, select:required:enabled",
   );

   const countedRadioGroups = new Set();
   let total = 0;
   let completed = 0;

   for (const field of fields) {
      if (field.type === "radio") {
         if (countedRadioGroups.has(field.name)) continue;
         countedRadioGroups.add(field.name);
      }

      total++;
      if (field.validity.valid) completed++;
   }

   const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

   progressFill.style.width = `${percent}%`;
   progressBar.setAttribute("aria-valuenow", percent);
   progressText.textContent = `${percent} %`;
}

document.addEventListener("input", updateProgress);
document.addEventListener("change", updateProgress);
updateProgress();

// INVALID STATE

const form = document.getElementById("personal-data-form");

function markValidity(field) {
   const isInvalid = !field.validity.valid;

   field.setAttribute("aria-invalid", isInvalid);
   field.closest(".field")?.toggleAttribute("data-invalid", isInvalid);

   const radioGroup = field.closest('[role="radiogroup"]');
   if (field.type === "radio" && radioGroup) {
      radioGroup.setAttribute("aria-invalid", isInvalid);
   }
}

function clearValidityMarks() {
   for (const element of form.querySelectorAll("[aria-invalid]")) {
      element.removeAttribute("aria-invalid");
   }
   for (const element of form.querySelectorAll("[data-invalid]")) {
      element.removeAttribute("data-invalid");
   }
}

form.addEventListener(
   "invalid",
   (event) => {
      form.dataset.submitted = "";
      markValidity(event.target);
   },
   true,
);

function refreshValidityMarks() {
   if (!("submitted" in form.dataset)) return;

   clearValidityMarks();
   for (const field of form.querySelectorAll("input:enabled, select:enabled")) {
      if (!field.validity.valid) markValidity(field);
   }
}

form.addEventListener("input", refreshValidityMarks);
form.addEventListener("change", refreshValidityMarks);

// SUBMIT

form.addEventListener("submit", (event) => {
   event.preventDefault();

   const answers = Object.fromEntries(new FormData(form));
   console.log("Anketos duomenys:", answers);
   alert("Anketa pateikta. Duomenys išvesti į naršyklės konsolę.");
});

// RESET

form.addEventListener("reset", (event) => {
   if (!confirm("Ar tikrai norite išvalyti visus laukus?")) {
      event.preventDefault();
      return;
   }

   setTimeout(() => {
      delete form.dataset.submitted;
      clearValidityMarks();

      updateEducationFields();
      updateMaritalStatus();
      validateBirthDate();
      validatePersonalCode();
      updateSpouseFields();
      updateJobStatusFields();
      updateExperienceFields();
      updateYearLimits();
      validateLeaveEnd();
      updateProgress();
   });
});
