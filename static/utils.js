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
