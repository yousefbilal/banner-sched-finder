let subjects;
let courses;
let coursesWithInfo;
let schedules;
const timings = [
  "None",
  "08:00",
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
  "20:00",
  "20:15",
  "20:30",
  "20:45",
  "21:00",
  "21:15",
  "21:30",
  "21:45",
  "22:00",
];
const colors = [
  "#FF6B6B", // Red
  "#7D3C98", // Purple
  "#F9A825", // Yellow
  "#1E90FF", // Blue
  "#00B894", // Green
  "#D63031", // Dark Red
  "#6F1E51", // Dark Purple
  "#FBC02D", // Amber
  "#3498DB", // Dark Blue
  "#00A86B", // Dark Green
  "#E74C3C", // Light Red
  "#8E44AD", // Light Purple
  "#FDD835", // Light Yellow
  "#2980B9", // Light Blue
  "#27AE60", // Light Green
];

//Utility functions
const displayAlert = (message) => {
  const alertBox = document.getElementById("alertBox");
  alertBox.innerText = message;
  alertBox.style.backgroundColor = "#ccc";
  alertBox.style.color = "#1a1a1a";
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.innerHTML = "";
    alertBox.style.display = "none";
  }, 5000);
};

const createElement = (elementType, attributes, innerText = "") => {
  const element = document.createElement(elementType);
  Object.keys(attributes).forEach((key) => {
    element.setAttribute(key, attributes[key]);
  });
  if (innerText) element.innerText = innerText;
  return element;
};

const removeEditForm = (element) => {
  const formContainer = document.getElementById("form-container");
  const editForm = formContainer.querySelector(
    '.editForm[data-id="' + element.getAttribute("data-id") + '"]'
  );
  if (editForm) {
    editForm.remove();
  }
};

const fomratTime = (time) => {
  return (
    time.getUTCHours() +
    ":" +
    time.getUTCMinutes() +
    (time.getUTCMinutes() === 0 ? "0" : "")
  );
};

const createCourseOption = (course) => {
  const startTime = new Date(course.time[0]);
  const endTime = new Date(course.time[1]);
  const option = createElement(
    "option",
    { value: course.section },
    `${course.section} ${course.instructor} ${course.days} ${fomratTime(
      startTime
    )}-${fomratTime(endTime)}`
  );
  return option;
};

// --------------------------------------

const fillSubjects = async (subjects, element) => {
  try {
    if (!subjects) {
      element.parentNode.remove();
      throw new Error("Too fast!");
    }
    subjects.forEach((subject) => {
      const option = createElement(
        "option",
        { value: subject.subject },
        subject.subject
      );
      element.appendChild(option);
    });
  } catch (e) {
    console.log(e.message);
    displayAlert(e.message);
  }
};

const checkEditForm = (courses, element) => {
  const formContainer = document.getElementById("form-container");
  const form = document.getElementById("form");
  const editForm = formContainer.querySelector(
    '.editForm[data-id="' + element.getAttribute("data-id") + '"]'
  );
  if (editForm == null) {
    return;
  }
  removeEditForm(element);
  const subject = element.querySelector(".subject").value;
  const code = element.querySelector(".code").value;
  // add edit form
  const editFormNew = createElement("form", {
    class: "editForm",
    "data-id": element.getAttribute("data-id"),
    "data-entry-subject": subject,
    "data-entry-code": code,
  });

  const editEntry = document.createElement("div");
  editEntry.className = "editEntry";
  const editPanelSectionLabel = createElement(
    "label",
    { class: "formLabel" },
    "Section"
  );
  const editPanelSection = createElement("select", {
    name: "section",
    class: "input sectionSelect",
  });
  // any
  const optionAny = createElement("option", { value: "Any" }, "Any");
  editPanelSection.appendChild(optionAny);

  courses.forEach((course) => {
    if (course.subject === subject && course.code === code) {
      const option = createCourseOption(course);
      editPanelSection.appendChild(option);
    }
  });
  const addButton = createElement("input", {
    type: "button",
    value: "+",
    class: "inputBtn addBtn",
  });
  addButton.onclick = (event) => {
    addSection(event);
  };

  const deleteButton = createElement("input", {
    type: "button",
    value: "x",
    class: "inputBtn deleteBtn",
  });
  deleteButton.onclick = (event) => {
    deleteSection(event);
  };

  [editPanelSectionLabel, editPanelSection, deleteButton].forEach((element) => {
    editEntry.appendChild(element);
  });

  const editFormSave = createElement("input", {
    type: "button",
    value: "Back",
    class: "inputBtn deleteBtn",
  });
  editFormSave.onclick = (event) => {
    editFormNew.style.display = "none";
    form.style.display = "block";
  };
  [editEntry, addButton, editFormSave].forEach((element) => {
    editFormNew.appendChild(element);
  });
  formContainer.appendChild(editFormNew);
  editFormNew.style.display = "none";
};

const fillCodes = async (courses, element) => {
  try {
    if (!courses) {
      element.parentNode.remove();
      throw new Error("Too fast!");
    }
    //reset options
    element.innerHTML = "";
    // remove edit form for previous subject
    const entry = element.parentNode;
    removeEditForm(entry);
    //get selected subject
    const subject = element.parentNode.querySelector(".subject").value;
    const coursesWithSubject = courses.filter((course) => {
      return course.subject === subject;
    });
    const uniqueCoursesWithSubject = coursesWithSubject.filter(
      (course, index, self) =>
        index === self.findIndex((c) => c.code === course.code)
    ); //filter out duplicates
    uniqueCoursesWithSubject.forEach((course) => {
      const option = createElement(
        "option",
        { value: course.code, credits: course.credits },
        course.full_name.includes("(Take it with")
          ? course.code + " - " + course.full_name.split("(Take")[0]
          : course.code + " - " + course.full_name
      );
      element.appendChild(option);
    });
  } catch (e) {
    console.log(e.message);
    displayAlert(e.message);
  }
};

const updateTime = (time, semester = "") => {
  const lastUpdated = document.getElementById("last-updated");
  lastUpdated.innerHTML = `*Semester : ${semester} <br/> *Courses last updated on ${
    time.split("T")[0]
  } ${time.split("T")[1].split(".")[0]} `;
};

const initalDisplayOfCourses = async () => {
  try {
    let token = localStorage.getItem("token");
    if (!token || token == "undefined") {
      token = "null";
    } else {
      token = "Bearer " + token;
    }
    const response = await fetch("/getCourses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const data = await response.json();
    if (token == "null") {
      localStorage.setItem("token", data.token);
    }
    subjects = data.subjects;
    courses = data.courses;
    const dropdown = document.querySelector(".subject");
    fillSubjects(subjects, dropdown);
    fillCodes(courses, document.querySelector(".code"));
    updateTime(data.last_updated, data.semester);
    // add change event listener to code dropdown
    const firstDropdown = document.getElementById("inputTextTwo0");
    const creditsSpan = document.getElementById("credit-hours");
    creditsSpan.innerText =
      firstDropdown.options[firstDropdown.selectedIndex].getAttribute(
        "credits"
      );
    firstDropdown.addEventListener("change", (e) => {
      e.stopPropagation();
      checkEditForm(courses, e.target.parentNode);
      calculateCredits();
    });
  } catch (e) {
    console.log(e.message);
    displayAlert(e.message);
  }
};

document.addEventListener("DOMContentLoaded", initalDisplayOfCourses);
const calculateCredits = () => {
  const selectedCoursesEntries = Array.from(
    document.querySelectorAll(".entry")
  );
  const sum = selectedCoursesEntries.reduce((sum, course) => {
    const courseDropdown = course.querySelector(".code");
    const credits = Number(
      courseDropdown.options[courseDropdown.selectedIndex].getAttribute(
        "credits"
      )
    );
    return sum + credits;
  }, 0);
  const creditsSpan = document.getElementById("credit-hours");
  creditsSpan.innerText = sum;
};

// ------------------------------
const addEntry = (e) => {
  const entry = createElement("div", { class: "entry" });
  const dropdownlabel = createElement(
    "label",
    { class: "formLabel" },
    "Subject"
  );
  const dropdownselect = createElement("select", {
    name: "subject",
    class: "input subject",
    required: "true",
  });
  const dropdownlabelTwo = createElement(
    "label",
    { class: "formLabel" },
    "Code"
  );
  const dropdownselectTwo = createElement("select", {
    name: "code",
    class: "input code",
    required: "true",
  });
  const deleteButton = createElement("input", {
    type: "button",
    value: "x",
    class: "inputBtn deleteBtn",
  });
  deleteButton.onclick = (event) => {
    deleteEntry(event);
  };
  const editButton = createElement("input", {
    type: "button",
    value: "Ξ",
    class: "inputBtn deleteBtn",
  });
  editButton.onclick = (event) => {
    editEntry(event);
  };
  [
    dropdownlabel,
    dropdownselect,
    dropdownlabelTwo,
    dropdownselectTwo,
    editButton,
    deleteButton,
  ].forEach((element) => {
    entry.appendChild(element);
  });

  const entries = document.getElementById("entries");
  entries.appendChild(entry);
  dropdownselect.addEventListener("change", (e) => {
    e.stopPropagation();
    fillCodes(courses, e.target.parentNode.querySelector(".code"));
    calculateCredits();
  });
  dropdownselectTwo.addEventListener("change", (e) => {
    e.stopPropagation();
    checkEditForm(courses, e.target.parentNode);
    calculateCredits();
  });
  fillSubjects(subjects, dropdownselect);
  fillCodes(courses, dropdownselectTwo);
  calculateCredits();
};

const deleteEntry = (e) => {
  const entry = e.target.parentNode;
  removeEditForm(entry);
  entry.remove();
  calculateCredits();
};

const editEntry = (e) => {
  try {
    if (!subjects) {
      throw new Error("Too fast!");
    }
    const entry = e.target.parentNode;
    const subject = entry.querySelector(".subject").value;
    const code = entry.querySelector(".code").value;
    const formContainer = document.getElementById("form-container");
    const form = document.getElementById("form");
    if (
      formContainer.querySelector(
        '.editForm[data-id="' + entry.getAttribute("data-id") + '"]'
      )
    ) {
      // if edit form already exists show it
      formContainer.querySelector(
        '.editForm[data-id="' + entry.getAttribute("data-id") + '"]'
      ).style.display = "block";
      form.style.display = "none";
      return;
    }
    // create edit panel
    let randomid = Math.random().toString(36).substring(7);
    // make sure its unique
    while (
      formContainer.querySelector('.editForm[data-id="' + randomid + '"]')
    ) {
      randomid = Math.random().toString(36).substring(7);
    }
    const editForm = createElement("form", {
      class: "editForm",
      "data-entry-subject": subject,
      "data-entry-code": code,
      "data-id": randomid,
    });
    entry.setAttribute("data-id", randomid);
    form.style.display = "none";
    const editEntry = createElement("div", { class: "editEntry" });
    const editPanelSectionLabel = createElement(
      "label",
      { class: "formLabel" },
      "Section"
    );
    const editPanelSection = createElement("select", {
      name: "section",
      class: "input sectionSelect",
    });
    // any
    const optionAny = createElement("option", { value: "Any" }, "Any");
    editPanelSection.appendChild(optionAny);

    courses.forEach((course) => {
      if (course.subject === subject && course.code === code) {
        const option = createCourseOption(course);
        editPanelSection.appendChild(option);
      }
    });

    const addButton = createElement("input", {
      type: "button",
      value: "+",
      class: "inputBtn addBtn addBtnEditForm",
    });
    addButton.onclick = (event) => {
      addSection(event);
    };

    const deleteButton = createElement("input", {
      type: "button",
      value: "x",
      class: "inputBtn deleteBtn",
    });
    deleteButton.onclick = (event) => {
      deleteSection(event);
    };

    [editPanelSectionLabel, editPanelSection, deleteButton].forEach(
      (element) => {
        editEntry.appendChild(element);
      }
    );

    const editFormSave = createElement("input", {
      type: "button",
      value: "Back",
      class: "inputBtn deleteBtn backBtnEditForm",
    });
    editFormSave.onclick = (event) => {
      editForm.style.display = "none";
      form.style.display = "block";
    };

    [editEntry, addButton, editFormSave].forEach((element) => {
      editForm.appendChild(element);
    });
    formContainer.appendChild(editForm);
  } catch (e) {
    console.log(e.message);
    displayAlert(e.message);
  }
};

const addSection = (e) => {
  const formContainer = e.target.parentNode;
  const subject = formContainer.getAttribute("data-entry-subject");
  const code = formContainer.getAttribute("data-entry-code");
  // add section entry
  const editEntry = createElement("div", { class: "editEntry" });
  const editPanelSectionLabel = createElement(
    "label",
    { class: "formLabel" },
    "Section"
  );
  const editPanelSection = createElement("select", {
    name: "section",
    class: "input sectionSelect",
  });
  // any
  const optionAny = createElement("option", { value: "Any" }, "Any");
  editPanelSection.appendChild(optionAny);
  courses.forEach((course) => {
    if (course.subject === subject && course.code === code) {
      const option = createCourseOption(course);
      editPanelSection.appendChild(option);
    }
  });
  const deleteButton = createElement("input", {
    type: "button",
    value: "x",
    class: "inputBtn deleteBtn",
  });
  deleteButton.onclick = (event) => {
    deleteSection(event);
  };
  [editPanelSectionLabel, editPanelSection, deleteButton].forEach((element) => {
    editEntry.appendChild(element);
  });
  // add it third to last child
  formContainer.insertBefore(
    editEntry,
    formContainer.childNodes[formContainer.childNodes.length - 2]
  );
};
const deleteSection = (e) => {
  const sectionEntry = e.target.parentNode;
  sectionEntry.remove();
};
const displayAdvancedOptions = () => {
  const formContainer = document.getElementById("form-container");
  const form = document.getElementById("form");
  const advancedOptions = document.getElementById("advancedOptions");
  if (advancedOptions != null) {
    advancedOptions.style.display = "block";
    form.style.display = "none";
    return;
  }
  const advancedOptionsForm = createElement("form", {
    class: "advancedOptions",
    id: "advancedOptions",
  });
  const advancedEntry = createElement("div", { class: "advancedEntry" });
  const advancedOptionsFormLabel = createElement(
    "label",
    { class: "formLabel" },
    "No 8 AM Classes"
  );
  const advancedOptionsFormInput = createElement("input", {
    type: "checkbox",
    name: "no8AM",
    class: "input no8AM",
    id: "no8AM",
  });
  advancedEntry.appendChild(advancedOptionsFormLabel);
  advancedEntry.appendChild(advancedOptionsFormInput);
  const advancedEntryTwo = createElement("div", { class: "advancedEntry" });
  const advancedOptionsFormLabelTwo = createElement(
    "label",
    { class: "formLabel" },
    "Only Open Sections"
  );
  const advancedOptionsFormInputTwo = createElement("input", {
    type: "checkbox",
    name: "noClosedCourses",
    class: "input noClosedCourses",
    id: "noClosedCourses",
  });
  advancedEntryTwo.appendChild(advancedOptionsFormLabelTwo);
  advancedEntryTwo.appendChild(advancedOptionsFormInputTwo);
  const advancedEntryFour = createElement("div", { class: "advancedEntry" });
  const advancedOptionsFormLabelFour = createElement(
    "label",
    {
      class: "formLabel",
    },
    "No Classes after 5 PM"
  );
  const advancedOptionsFormInputFour = createElement("input", {
    type: "checkbox",
    name: "noClassesAfter5PM",
    class: "input noClassesAfter5PM",
    id: "noClassesAfter5PM",
  });
  advancedEntryFour.appendChild(advancedOptionsFormLabelFour);
  advancedEntryFour.appendChild(advancedOptionsFormInputFour);
  const advancedEntryThree = createElement("div", { class: "advancedEntry" });
  const advancedOptionsFormLabelThree = createElement(
    "label",
    { class: "formLabel" },
    "Break"
  );
  const advancedOptionsFormInputThree = createElement("select", {
    name: "breakBetween",
    class: "input breakBetween",
  });
  const advancedOptionsFormInputThreeExtra = createElement("select", {
    name: "breakBetween",
    class: "input breakBetween",
  });
  timings.forEach((time) => {
    const option = createElement("option", { value: time }, time);
    advancedOptionsFormInputThree.appendChild(option);
    advancedOptionsFormInputThreeExtra.appendChild(option.cloneNode(true));
  });
  const addBreakButton = createElement("input", {
    type: "button",
    value: "+",
    class: "inputBtn deleteBtn addBtnBreak",
  });
  addBreakButton.onclick = (event) => {
    addBreakEntry(event);
  };
  const deleteBreakButton = createElement("input", {
    type: "button",
    value: "x",
    class: "inputBtn deleteBtn deleteBtnBreak",
  });
  deleteBreakButton.onclick = (event) => {
    deleteBreakEntry(event);
  };
  // days of break
  const daysOfBreak = createElement("div", { class: "daysOfBreak" });
  const daysOfBreakLabel = createElement("label", { class: "formLabel" });
  daysOfBreak.appendChild(daysOfBreakLabel);
  // add checkboxes for days
  const days = ["M", "T", "W", "R" /*, 'F'*/];
  days.forEach((day) => {
    const dayLabel = createElement("label", { class: "formLabel" }, day);
    const dayInput = createElement("input", {
      type: "checkbox",
      name: "day",
      class: "input day " + day,
      value: day,
    });
    const singleDayContainer = createElement("div", {
      class: "singleDayContainer",
    });
    singleDayContainer.appendChild(dayLabel);
    singleDayContainer.appendChild(dayInput);
    daysOfBreak.appendChild(singleDayContainer);
  });

  const backButton = createElement("input", {
    type: "button",
    value: "Back",
    class: "inputBtn backBtn",
    id: "backBtnAdvancedForm",
  });
  backButton.onclick = (event) => {
    advancedOptionsForm.style.display = "none";
    form.style.display = "block";
  };
  daysOfBreak.appendChild(addBreakButton);
  daysOfBreak.appendChild(deleteBreakButton);
  [
    advancedOptionsFormLabelThree,
    advancedOptionsFormInputThree,
    advancedOptionsFormInputThreeExtra,
    daysOfBreak,
  ].forEach((element) => {
    advancedEntryThree.appendChild(element);
  });

  [
    advancedEntry,
    advancedEntryTwo,
    advancedEntryFour,
    advancedEntryThree,
    backButton,
  ].forEach((element) => {
    advancedOptionsForm.appendChild(element);
  });
  formContainer.appendChild(advancedOptionsForm);
  form.style.display = "none";
};
const addBreakEntry = (e) => {
  const advancedOptionsForm = e.target.parentNode.parentNode.parentNode;
  const advancedEntryThree = createElement("div", { class: "advancedEntry" });
  const advancedOptionsFormLabelThree = createElement(
    "label",
    {
      class: "formLabel",
    },
    "Break "
  );
  const advancedOptionsFormInputThree = createElement("select", {
    name: "breakBetween",
    class: "input breakBetween",
  });
  const advancedOptionsFormInputThreeExtra = createElement("select", {
    name: "breakBetween",
    class: "input breakBetween",
  });
  timings.forEach((time) => {
    const option = createElement("option", { value: time }, time);
    advancedOptionsFormInputThree.appendChild(option);
    advancedOptionsFormInputThreeExtra.appendChild(option.cloneNode(true));
  });
  const addBreakButton = createElement("input", {
    type: "button",
    value: "+",
    class: "inputBtn deleteBtn",
  });
  addBreakButton.onclick = (event) => {
    addBreakEntry(event);
  };
  const deleteBreakButton = createElement("input", {
    type: "button",
    value: "x",
    class: "inputBtn deleteBtn",
  });
  deleteBreakButton.onclick = (event) => {
    deleteBreakEntry(event);
  };
  // days of break
  const daysOfBreak = createElement("div", { class: "daysOfBreak" });
  const daysOfBreakLabel = createElement("label", { class: "formLabel" });
  daysOfBreak.appendChild(daysOfBreakLabel);
  // add checkboxes for days
  const days = ["M", "T", "W", "R" /*, 'F'*/];
  days.forEach((day) => {
    const dayLabel = createElement("label", { class: "formLabel" }, day);
    const dayInput = createElement("input", {
      type: "checkbox",
      name: "day",
      class: "input day " + day,
      value: day,
    });
    const singleDayContainer = createElement("div", {
      class: "singleDayContainer",
    });
    singleDayContainer.appendChild(dayLabel);
    singleDayContainer.appendChild(dayInput);
    daysOfBreak.appendChild(singleDayContainer);
  });

  daysOfBreak.appendChild(addBreakButton);
  daysOfBreak.appendChild(deleteBreakButton);
  [
    advancedOptionsFormLabelThree,
    advancedOptionsFormInputThree,
    advancedOptionsFormInputThreeExtra,
    daysOfBreak,
  ].forEach((element) => {
    advancedEntryThree.appendChild(element);
  });
  advancedOptionsForm.insertBefore(
    advancedEntryThree,
    advancedOptionsForm.childNodes[advancedOptionsForm.childNodes.length - 1]
  );
};

const deleteBreakEntry = (e) => {
  const breakEntry = e.target.parentNode.parentNode;
  const advancedOptionsForm = breakEntry.parentNode;
  // const daysOfBreak = breakEntry.nextSibling
  // if its the last breakEntry then just reset it

  if (advancedOptionsForm.querySelectorAll(".advancedEntry").length === 4) {
    const options = breakEntry.querySelectorAll(".breakBetween");
    options.forEach((option) => {
      option.value = "None";
    });
    const days = breakEntry.querySelectorAll(".day");
    days.forEach((day) => {
      day.checked = false;
    });
    return;
  }
  breakEntry.remove();
};

const renderSchedule = (scheduleIndex) => {
  //remove current schedule
  const schedulediv = document.getElementById("schedule-body");
  schedulediv.innerHTML = "";
  // add next schedule
  // show relevant time items
  const timeItems = document.querySelectorAll(".schedule-time-item");
  let heightOfOneHourTimeSlot = 48;
  timeItems.forEach((timeItem) => {
    if (
      Number(timeItem.getAttribute("data-time").split(":")[0]) >=
        Number(schedules[scheduleIndex].min_hour.split(":")[0]) &&
      Number(timeItem.getAttribute("data-time").split(":")[0]) <=
        Number(schedules[scheduleIndex].max_hour.split(":")[0])
    ) {
      timeItem.style.display = "block";
      if (
        Number(timeItem.getAttribute("data-time").split(":")[0]) ==
        Number(schedules[scheduleIndex].min_hour.split(":")[0]) + 1
      ) {
        heightOfOneHourTimeSlot =
          timeItem.offsetTop - timeItem.previousElementSibling.offsetTop;
      }
    } else {
      timeItem.style.display = "none";
    }
  });
  let colorCount = 0;
  schedules[scheduleIndex].courses_list.forEach((scheduleEntry) => {
    if (scheduleEntry.course_code === "BREAK") {
    } else {
      createScheduleEntry(
        scheduleEntry,
        scheduleEntry.days.length,
        colorCount++,
        heightOfOneHourTimeSlot
      );
    }
  });
  const scheduleTotalSpan = document.getElementById("schedule-total-span");
  scheduleTotalSpan.innerText = ` ${scheduleIndex + 1} of ${schedules.length}`;
  // const scheduleContainer = document.getElementById("schedule-container");
  // scheduleContainer.style.visibility = "visible";
  // const scheduleExtra = document.getElementById("schedule-extra");
  // scheduleExtra.style.visibility = "visible";
};

const generateScheduleDOM = async (e) => {
  const submitBtn = document.getElementById("submitBtn");
  const historyBtn = document.getElementById("historyBtn");

  try {
    e.preventDefault();
    submitBtn.disabled = true;
    historyBtn.disabled = true;
    displayAlert("Generating schedules...");
    const selectedCourses = document.querySelectorAll(".entry");
    const selectedCoursesArray = [];
    selectedCourses.forEach((course) => {
      const subject = course.querySelector(".subject").value;
      const code = course.querySelector(".code").value;
      if (
        selectedCoursesArray.find(
          (c) => c.code === code && c.subject === subject
        )
      ) {
        throw new Error("Please remove duplicate courses");
      }
      let sections = [];
      const formContainer = document.getElementById("form-container");
      const editForm = formContainer.querySelector(
        '.editForm[data-id="' + course.getAttribute("data-id") + '"]'
      );
      if (editForm) {
        const sectionsSelect = editForm.querySelectorAll(".sectionSelect");
        sectionsSelect.forEach((section) => {
          if (section.value === "Any") {
            sections = ["Any"];
            return;
          }
          sections.push(section.value);
        });
      }
      if (sections.length === 0) {
        sections = ["Any"];
      }
      selectedCoursesArray.push({ subject, code, sections });
    });
    const advancedOptionsForm = document.getElementById("advancedOptions");
    const breaks = [];
    let noClosedCourses = false;
    if (advancedOptionsForm) {
      const no8AM = advancedOptionsForm.querySelector(".no8AM").checked;
      noClosedCourses =
        advancedOptionsForm.querySelector(".noClosedCourses").checked;
      const noClassesAfter5PM =
        advancedOptionsForm.querySelector(".noClassesAfter5PM").checked;
      const breakBetweenSelect =
        advancedOptionsForm.querySelectorAll(".breakBetween");
      for (let i = 0; i < breakBetweenSelect.length; i += 2) {
        if (
          breakBetweenSelect[i].value === "None" ||
          breakBetweenSelect[i + 1].value === "None" ||
          breakBetweenSelect[i].value === breakBetweenSelect[i + 1].value ||
          breakBetweenSelect[i].value > breakBetweenSelect[i + 1].value
        ) {
          continue;
        }
        const days =
          breakBetweenSelect[i].parentNode.parentNode.querySelector(
            ".daysOfBreak"
          );
        let daysString = "";
        const daysInput = days.querySelectorAll(".day");
        daysInput.forEach((day) => {
          if (day.checked) {
            daysString += day.value;
          }
        });
        if (daysString === "") {
          continue;
        }
        breaks.push({
          startTime: breakBetweenSelect[i].value,
          endTime: breakBetweenSelect[i + 1].value,
          days: daysString,
        });
      }
      if (no8AM) {
        breaks.push({
          startTime: "08:00",
          endTime: "09:00",
        });
      }
      if (noClassesAfter5PM) {
        breaks.push({
          startTime: "17:00",
          endTime: "22:00",
        });
      }
    }
    if (selectedCoursesArray.length === 0) {
      throw new Error("Please add at least one course");
    }
    const response = await fetch("/generateScheduleDOM", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        selectedCoursesArray,
        breaks,
        noClosedCourses: noClosedCourses,
      }),
    });
    const data = await response.json();
    schedules = data.schedules;
    if (!schedules || schedules.length === 0) {
      throw new Error("No schedules found");
    }
    renderSchedule(0);
    const scheduleContainer = document.getElementById("schedule-container");
    scheduleContainer.style.visibility = "visible";
    const scheduleExtra = document.getElementById("schedule-extra");
    scheduleExtra.style.visibility = "visible";
    const formContainer = document.getElementById("form-container");
    formContainer.style.display = "none";
    const scheduleTotalHeader = document.getElementById(
      "schedule-total-header"
    );
    scheduleTotalHeader.style.display = "flex";
    historyBtn.style.display = "none";
    displayAlert("Schedules generated");
  } catch (e) {
    console.log(e.message);
    displayAlert(e.message);
    historyBtn.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    historyBtn.disabled = false;
  }
};

const createScheduleEntry = (entry, count, color, heightOfOneHourTimeSlot) => {
  for (let i = 0; i < count; i++) {
    const scheduleEntry = createElement("div", { class: "schedule-entry" });
    scheduleEntry.style.display = "none";
    scheduleEntry.style.backgroundColor = colors[color];
    const startTimeFormatted = fomratTime(new Date(entry.time[0]));
    const endTimeFormatted = fomratTime(new Date(entry.time[1]));
    const scheduleEntryInfo = createElement("div", {
      class: "schedule-entry-info",
      "data-day": entry.days[i],
      "data-start-time": startTimeFormatted,
      "data-end-time": endTimeFormatted,
    });
    const scheduleEntryInfoSubject = createElement(
      "h1",
      { class: "schedule-name" },
      entry.course_code + " " + entry.section
    );
    const scheduleEntryInfoCode = createElement(
      "h1",
      { class: "schedule-crn" },
      entry.crn
    );
    const scheduleEntryInfoInstructor = createElement(
      "h1",
      {
        class: "schedule-professor",
      },
      entry.instructor
    );
    const scheduleEntryInfoTime = createElement(
      "h1",
      { class: "schedule-time" },
      startTimeFormatted + " - " + endTimeFormatted
    );
    [
      scheduleEntryInfoSubject,
      scheduleEntryInfoCode,
      scheduleEntryInfoInstructor,
      scheduleEntryInfoTime,
    ].forEach((element) => {
      scheduleEntryInfo.appendChild(element);
    });
    scheduleEntry.appendChild(scheduleEntryInfo);
    positionScheduleEntry(scheduleEntry, heightOfOneHourTimeSlot);
    if (
      scheduleEntry.scrollHeight > scheduleEntry.clientHeight &&
      entry.instructor != "TBA"
    ) {
      const instructorArray = entry.instructor.split(" ");
      scheduleEntryInfoInstructor.innerText =
        instructorArray[0] + " " + instructorArray[instructorArray.length - 1];
    }
  }
};
// schedule
const positionScheduleEntry = (element, heightOfOneHourTimeSlot) => {
  try {
    const scheduleEntry = element;
    const startTime = scheduleEntry
      .querySelector(".schedule-entry-info")
      .getAttribute("data-start-time");
    const endTime = scheduleEntry
      .querySelector(".schedule-entry-info")
      .getAttribute("data-end-time");
    let day = scheduleEntry
      .querySelector(".schedule-entry-info")
      .getAttribute("data-day");
    // position the schedule entry (y axis)
    let scheduleEntryTopElement = document.querySelector(
      '.schedule-time-item[data-time="' + startTime + '"]'
    );
    let scheduleEntryBottomElement = document.querySelector(
      '.schedule-time-item[data-time="' + endTime + '"]'
    );
    let startMinutes = 0;
    let endMinutes = 0;
    if (scheduleEntryTopElement == null) {
      startMinutes = Number(startTime.slice(-2));
      startMinutes = startMinutes / 60;
      const newTime = startTime.slice(0, -2) + "00";
      scheduleEntryTopElement = document.querySelector(
        '.schedule-time-item[data-time="' + newTime + '"]'
      );
    }
    if (scheduleEntryBottomElement == null) {
      endMinutes = Number(endTime.slice(-2));
      endMinutes = endMinutes / 60;
      const newTime = endTime.slice(0, -2) + "00";
      scheduleEntryBottomElement = document.querySelector(
        '.schedule-time-item[data-time="' + newTime + '"]'
      );
    }
    //calculations
    const scheduleEntryTop = scheduleEntryTopElement.offsetTop;
    const scheduleEntryBottom = scheduleEntryBottomElement.offsetTop;
    const scheduleEntryHeight = //calculate height based on start and end time
      scheduleEntryBottom -
      scheduleEntryTop +
      endMinutes * heightOfOneHourTimeSlot -
      startMinutes * heightOfOneHourTimeSlot;
    // endMinutes * scheduleEntryBottom -
    // endMinutes * scheduleEntryTop -
    // (startMinutes * scheduleEntryBottom - startMinutes * scheduleEntryTop)
    scheduleEntry.style.height = scheduleEntryHeight + "px";
    scheduleEntry.style.top =
      scheduleEntryTop +
      1 +
      heightOfOneHourTimeSlot * startMinutes + //calculate top based on start and end time
      "px"; // 1 is to compensate for the border
    // position the schedule entry (x axis)
    const scheduleEntryLeft = document.querySelector(
      '.schedule-header-item[data-day="' + day + '"]'
    ).offsetLeft;
    const margin = 32; //to compensate for margin left/right
    const scheduleEntryWidth = document.querySelector(
      '.schedule-header-item[data-day="' + day + '"]'
    ).offsetWidth;
    scheduleEntry.style.left = scheduleEntryLeft - margin / 2 + "px";
    scheduleEntry.style.width = scheduleEntryWidth + margin + "px";
    element.style.display = "flex";
    const schedulediv = document.getElementById("schedule-body");
    schedulediv.appendChild(scheduleEntry);
  } catch (e) {
    console.log(e.message);
  }
};
const goPreviousSchedule = () => {
  //current schedule
  const scheduleTotalSpan = document.getElementById("schedule-total-span");
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(" ")[1]);
  let previousSchedule = currentSchedule - 2;
  if (previousSchedule < 0) {
    previousSchedule = totalSchedules - 1;
  }
  renderSchedule(previousSchedule);

  // scheduleTotalSpan.innerHTML =
  //   " " + previousSchedule + " of " + totalSchedules;
  // const scheduleContainer = document.getElementById("schedule-container");
  // scheduleContainer.style.visibility = "visible";
  // const scheduleExtra = document.getElementById("schedule-extra");
  // scheduleExtra.style.visibility = "visible";
};
const goNextSchedule = () => {
  //current schedule
  const scheduleTotalSpan = document.getElementById("schedule-total-span");
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(" ")[1]);
  let nextSchedule = currentSchedule; //zero indexing
  if (currentSchedule >= schedules.length) {
    nextSchedule = 0;
  }
  //remove current schedule
  renderSchedule(nextSchedule);
  // const scheduleContainer = document.getElementById("schedule-container");
  // scheduleContainer.style.visibility = "visible";
  // const scheduleExtra = document.getElementById("schedule-extra");
  // scheduleExtra.style.visibility = "visible";
};
const backToForm = () => {
  const schedulediv = document.getElementById("schedule-body");
  schedulediv.innerHTML = "";
  const formContainer = document.getElementById("form-container");
  formContainer.style.display = "block";
  const timeItems = document.querySelectorAll(".schedule-time-item");
  timeItems.forEach((timeItem) => {
    timeItem.style.display = "none";
  });
  const scheduleContainer = document.getElementById("schedule-container");
  scheduleContainer.style.visibility = "hidden";
  const scheduleExtra = document.getElementById("schedule-extra");
  scheduleExtra.style.visibility = "hidden";
  const scheduleTotalHeader = document.getElementById("schedule-total-header");
  scheduleTotalHeader.style.display = "none";
  const historyBtn = document.getElementById("historyBtn");
  historyBtn.style.display = "block";
};

const downloadSchedule = async () => {
  try {
    const canvas = await html2canvas(
      document.getElementById("schedule-container"),
      { scale: 3.5, backgroundColor: "#1a1a1a" }
    );

    const scheduleTotalSpan = document.getElementById("schedule-total-span");
    const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(" ")[1]);
    const b64img = canvas.toDataURL("image/png");
    const anchor = createElement("a", {
      href: b64img,
      download: `schedule-${currentSchedule}.png`,
    });
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(b64img);
    displayAlert("Schedule downloaded");
  } catch (err) {
    displayAlert("Downloading failed, please try again later");
  }
};
const copyCRNs = () => {
  const scheduleTotalSpan = document.getElementById("schedule-total-span");
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(" ")[1]);
  const crns = [];
  schedules[currentSchedule - 1].courses_list.forEach((scheduleEntry) => {
    if (scheduleEntry.course_code === "BREAK") {
    } else {
      crns.push(scheduleEntry.crn);
    }
  });
  const crnsString = crns.join(", ");
  navigator.clipboard.writeText(crnsString);
  displayAlert("CRNs copied to clipboard");
};

window.addEventListener("resize", () => {
  const schedulediv = document.getElementById("schedule-body");
  if (schedulediv == null) {
    return;
  }
  const timeItems = document.querySelectorAll(".schedule-time-item");
  if (timeItems.length === 0) {
    return;
  }
  const scheduleTotalHeader = document.getElementById("schedule-total-header");
  if (!scheduleTotalHeader.checkVisibility()) {
    return;
  }

  const scheduleTotalSpan = document.getElementById("schedule-total-span");
  if (scheduleTotalSpan == null) {
    return;
  }
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(" ")[1]);
  renderSchedule(currentSchedule - 1);
});

const subjectsElements = document.querySelectorAll(".subject");
subjectsElements.forEach((element) => {
  element.addEventListener("change", (e) => {
    e.stopPropagation();
    fillCodes(courses, e.target.parentNode.querySelector(".code"));
    calculateCredits();
  });
});
