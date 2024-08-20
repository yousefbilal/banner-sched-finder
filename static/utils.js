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

const setKeyHoldEvent = (key, initDelay, minDelay, decrement, eventHandler) => {
  let valid = false;
  let delay = initDelay;
  let timer;
  window.addEventListener("keydown", (e) => {
    if (e.key == key) {
      if (e.repeat && valid) {
        eventHandler();
        valid = false;
        setTimeout(() => {
          valid = true;
          if (delay > minDelay) delay -= decrement;
        }, delay);
      } else if (!e.repeat) {
        eventHandler();
        clearTimeout(timer);
        timer = setTimeout(() => {
          valid = true;
        }, delay);
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key == key) {
      clearTimeout(timer);
      valid = false;
      delay = initDelay;
    }
  });
};
