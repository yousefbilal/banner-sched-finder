const historyBtn = document.getElementById("historyBtn");
historyBtn.addEventListener("click", () => {
  if (historyBtn.value === "Search History") {
    goToHistory(historyBtn);
  } else {
    goToHome(historyBtn);
  }
});

const goToHistory = async (button) => {
  try {
    if (!courses) {
      throw new Error("Too fast!");
    }
    button.value = "Back to Search";
    const historyContainer = document.getElementById("history-container");
    const formContainer = document.getElementById("form-container");
    const formContainerOffsetHeight = formContainer.offsetHeight;
    historyContainer.style.display = "block";
    formContainer.style.display = "none";
    if (historyContainer.offsetHeight < formContainerOffsetHeight) {
      historyContainer.style.height = formContainerOffsetHeight + "px";
    }

    const historyBody = document.getElementById("history-body");
    historyBody.innerHTML = "No history found";
    const data = await getHistoryService();
    if (data.history.length === 0) {
      historyBody.innerHTML = "No history found";
      return;
    }
    historyBody.innerHTML = "";
    data.history.forEach((element) => {
      const row = createElement("tr", { class: "history-entry" });
      const datetime = createElement("td", { class: "history-datetime" });
      const courses = createElement("td", { class: "history-courses" });
      const date = new Date(element.datetime);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      const hour = date.getHours();
      const minute = date.getMinutes();
      datetime.innerText =
        month +
        "/" +
        day +
        "/" +
        year +
        " \n" +
        hour +
        ":" +
        minute +
        " " +
        (hour > 12 ? "PM" : "AM");
      let coursesData =
        "Courses: " +
        element.courses
          .map((course) => {
            return (
              course.subject +
              " " +
              course.code +
              " ( " +
              course.sections.join(", ") +
              " )"
            );
          })
          .join(", ");
      if (
        element.constraints.breaks.length > 0 ||
        element.constraints.noClosedCourses
      ) {
        coursesData +=
          "\n" +
          "Constraints: " +
          element.constraints.breaks
            .map((br) => {
              return (
                "Break " +
                br.startTime +
                " - " +
                br.endTime +
                " " +
                (br.days ? br.days : "MTWR")
              );
            })
            .join("\n");
        if (element.constraints.noClosedCourses) {
          coursesData += "\n" + "Only Open Courses";
        }
      } else {
        coursesData += "\n" + "Constraints: None";
      }
      courses.innerText = coursesData;
      row.appendChild(courses);
      row.appendChild(datetime);
      row.addEventListener("click", () => {
        buildScheduleFromHistory(element);
      });
      historyBody.appendChild(row);
      if (historyContainer.offsetHeight < formContainerOffsetHeight) {
        historyContainer.style.height = formContainerOffsetHeight + "px";
      } else {
        historyContainer.style.height = "auto";
      }
    });
  } catch (e) {
    console.log(e.message);
    displayAlert(e.message);
  }
};

const goToHome = (button) => {
  button.value = "Search History";
  const historyContainer = document.getElementById("history-container");
  const formContainer = document.getElementById("form-container");
  formContainer.style.display = "block";
  if (historyContainer.style.height === "auto") {
    historyContainer.style.height = formContainer.offsetHeight + "px";
  }
  historyContainer.style.display = "none";
};

const buildScheduleFromHistory = async (element) => {
  const historyContainer = document.getElementById("history-container");
  const formContainer = document.getElementById("form-container");
  formContainer.style.display = "block";
  historyContainer.style.display = "none";
  const historyBtn = document.getElementById("historyBtn");
  historyBtn.value = "Search History";
  const courses = element.courses;
  const breaks = element.constraints.breaks;
  const noClosedCoursesF = element.constraints.noClosedCourses;
  const entries = document.getElementById("entries");
  entries.innerHTML = "";
  const editForms = document.querySelectorAll(".editForm");
  editForms.forEach((form) => {
    form.remove();
  });
  const addBtn = document.getElementById("addBtn");
  courses.forEach((course) => {
    addBtn.click();
    let lastEntry = document.querySelectorAll(".entry");
    lastEntry = lastEntry[lastEntry.length - 1];
    const subject = lastEntry.getElementsByClassName("subject")[0];
    const code = lastEntry.getElementsByClassName("code")[0];
    subject.value = course.subject;
    subject.dispatchEvent(new Event("change"));
    code.value = course.code;
    code.dispatchEvent(new Event("change"));
    if (course.sections[0] != "Any") {
      const editBtn = lastEntry.querySelector('input[type="button"]');
      editBtn.click();
      for (let i = 0; i < course.sections.length; i++) {
        if (i != 0) {
          const addBtnAll = document.querySelectorAll(".addBtnEditForm");
          const addBtn = addBtnAll[addBtnAll.length - 1];
          addBtn.click();
        }
        const sectionInputAll = document.querySelectorAll(".sectionSelect");
        const sectionInput = sectionInputAll[sectionInputAll.length - 1];
        sectionInput.value = course.sections[i];
      }
      const closeBtnAll = document.querySelectorAll(".backBtnEditForm");
      const closeBtn = closeBtnAll[closeBtnAll.length - 1];
      closeBtn.click();
    }
  });
  const advancedBtn = document.getElementById("advancedBtn");
  advancedBtn.click();
  // reset advanced form
  const deleteBtns = document.querySelectorAll(".deleteBtnBreak");
  deleteBtns.forEach((btn) => {
    btn.click();
  });
  const no8AM = document.getElementById("no8AM");
  no8AM.checked = false;
  const noClosedCourses = document.getElementById("noClosedCourses"); //changed to noClosedCourses
  noClosedCourses.checked = noClosedCoursesF;
  const noClassesAfter5PM = document.getElementById("noClassesAfter5PM");
  noClassesAfter5PM.checked = false;
  let j = 0;
  breaks.forEach((breakTime) => {
    let breakEntry;
    if (j != 0) {
      const addBtn = document.querySelector(".addBtnBreak");
      addBtn.click();
    }
    breakEntry = document.querySelectorAll(".advancedEntry");
    breakEntry = breakEntry[breakEntry.length - 1];
    const breakFromInput = breakEntry.getElementsByClassName("breakBetween")[0];
    const breakToInput = breakEntry.getElementsByClassName("breakBetween")[1];
    breakFromInput.value = breakTime.startTime;
    breakToInput.value = breakTime.endTime;
    if (!breakTime.days) {
      breakTime.days = "MTWR";
    }
    breakTime.days.split("").forEach((day) => {
      const dayInput = breakEntry.querySelector(`.${day}`);
      dayInput.checked = true;
    });
    j++;
  });
  const closeBtn = document.getElementById("backBtnAdvancedForm");
  closeBtn.click();
};
const clearHistory = async () => {
  if (
    document.getElementById("history-body").innerHTML === "No history found"
  ) {
    return;
  }
  const response = clearHistoryService();
  //   const data = await response.json()
  const historyBody = document.getElementById("history-body");
  historyBody.innerHTML = "No history found";
  displayAlert(response.message);
};
