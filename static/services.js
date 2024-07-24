const getCoursesService = (token) => {
  return fetch("/getCourses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then((response) => response.json());
};

const generateSchedulesStream = (
  selectedCourses,
  breaks,
  noClosedCourses,
  signal
) => {
  return fetch("/generateSchedules", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      selectedCourses,
      breaks,
      noClosedCourses,
    }),
    signal: signal,
  }).then((response) => {
    if (response.ok) return response.body.getReader();
    if (response.status === 404) throw new Error("No schedules found");
    else throw new Error("Error: ", response.status);
  });
};

const clearHistoryService = () => {
  return fetch("/clearHistory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  }).then((response) => response.json());
};

const getHistoryService = () => {
  return fetch("/getHistory", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  }).then((response) => response.json());
};
