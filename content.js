// content.js
const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const parseIfJson = (str) => {
  if (isJson(str)) return JSON.parse(str);
  return str;
};

const components = {
  messageBubble: () => {
    const messageBubble = document.createElement("div");
    messageBubble.classList.add("chat-bubble");
    messageBubble.style = `display: flex; flex-direction: row; padding-left: 12px;`;
    return messageBubble;
  },
  buttons: (message) => {
    const messageBubble = components.messageBubble();
    message.buttons.forEach((button) => {
      const buttonElement = document.createElement("button");
      buttonElement.classList.add("chat-button");
      buttonElement.innerHTML = button.key;
      buttonElement.title = button.value;
      buttonElement.disabled = true;
      buttonElement.style = `background-color: #0F92FF; padding: 4px 12px; color: white; border-radius: 100px; border: none; font-weight: bold; margin-right: 4px; margin-bottom: 4px;`;
      messageBubble.appendChild(buttonElement);
    });
    return messageBubble;
  },
  fixedButtons: (message) => {
    const messageBubble = components.messageBubble();
    message.fixedButtons.forEach((button) => {
      const buttonElement = document.createElement("button");
      buttonElement.classList.add("chat-fixedButton");
      buttonElement.innerHTML = button.key;
      buttonElement.title = button.value;
      buttonElement.disabled = true;
      buttonElement.style = `border: 2px solid #0F92FF; padding: 4px 12px; color: #0F92FF; border-radius: 99px; font-weight: bold; margin-right: 4px; background-color: transparent; margin-bottom: 4px;`;
      messageBubble.appendChild(buttonElement);
    });
    return messageBubble;
  },
  attachment: (message) => {
    const messageBubble = components.messageBubble();
    const imageElement = document.createElement("img");
    imageElement.classList.add("chat-image");
    imageElement.src = message.tempUrl;
    imageElement.style = `width: 400px; height: 400px;`;
    messageBubble.appendChild(imageElement);
    return messageBubble;
  },
  component: (message) => {
    const messageBubble = components.messageBubble();
    const componentTypes = {
      textArea: ({ value }) => {
        const textArea = document.createElement("p");
        textArea.classList.add("chat-p");
        textArea.style = `text-align: left; font-size: 14px;`;
        textArea.innerHTML = value;
        messageBubble.appendChild(textArea);
      },
    };
    componentTypes[message.component]({ value: message.value });
    return messageBubble;
  },
  defaultText: (message) => {
    const messageBubble = components.messageBubble();
    const textElement = document.createElement("p");
    textElement.classList.add("chat-paragraph");
    textElement.style = `text-align: left; font-size: 14px;`;
    textElement.innerHTML = message;
    messageBubble.appendChild(textElement);
    return messageBubble;
  },
  tooltip: (message) => {
    const messageBubble = components.messageBubble();
    messageBubble.style = `display: flex; flex-direction: column; align-items: center;`;
    message.forEach((tooltip) => {
      const textElement = document.createElement("p");
      textElement.classList.add("chat-paragraph");
      textElement.style = `text-align: left; font-size: 14px; background-color: #e4e9f0; padding: 8px; border-radius: 4px; font-weight: bold;`;
      textElement.innerHTML = tooltip.innerText;
      messageBubble.appendChild(textElement);
    });
    return messageBubble;
  },
};

const action = {
  history: {
    createTooltip: (message) => {
      const tooltip = message.querySelectorAll(
        ".transcript---scroller---action-tooltip"
      );
      const tooltipContainer = document.createElement("div");
      tooltipContainer.style = `display: flex; flex-direction: column; align-items: center;`;
      tooltip.forEach((tooltip) => {
        const textElement = document.createElement("p");
        textElement.classList.add("chat-paragraph");
        textElement.style = `text-align: left; font-size: 14px; background-color: #e4e9f0; padding: 8px; border-radius: 4px; font-weight: bold;`;
        textElement.innerHTML = tooltip.innerText;
        tooltipContainer.appendChild(textElement);
      });
      return tooltipContainer;
    },
    createHour: (message) => {
      const hour = message.querySelector(".timestampWrapper span").innerText;
      const hourContainer = document.createElement("p");
      hourContainer.style = `min-width: 80px`;
      hourContainer.innerHTML = hour;
      return hourContainer;
    },
    createIcon: (message) => {
      const icon =
        message
          .querySelector(".avatar__gux__icon")
          .shadowRoot.querySelector(".gux-icon-container").innerHTML || "";
      const iconContainer = document.createElement("div");
      iconContainer.style = `min-width: 20px; min-height: 20px; margin: 10px;`;
      iconContainer.innerHTML = icon;
      return iconContainer;
    },
    createMessageContainer: ({
      hourContainer,
      iconContainer,
      messageBubble,
    }) => {
      const messageContainer = document.createElement("div");
      messageContainer.style = `display: flex; flex-direction: row; align-items: center;`;
      messageContainer.appendChild(hourContainer);
      messageContainer.appendChild(iconContainer);
      messageContainer.appendChild(messageBubble);
      return messageContainer;
    },
  },
};

function transformHistoryData(message, joinedSpans) {
  const parsedData = parseIfJson(joinedSpans);

  const messageBubbleTooltip = action.history.createTooltip(message);
  const hourContainer = action.history.createHour(message);
  const iconContainer = action.history.createIcon(message);

  if (Array.isArray(parsedData)) {
    // componentes do tipo Array
  } else if (typeof parsedData === "object") {
    const componentKey = Object.keys(parsedData)[0];
    const messageBubble = components[componentKey](JSON.parse(joinedSpans));
    const messageContainer = action.history.createMessageContainer({
      hourContainer,
      iconContainer,
      messageBubble,
    });
    message.replaceWith(messageBubbleTooltip, messageContainer);
  } else {
    const messageBubble = components.defaultText(joinedSpans);
    const messageContainer = action.history.createMessageContainer({
      hourContainer,
      iconContainer,
      messageBubble,
    });
    message.replaceWith(messageBubbleTooltip, messageContainer);
  }
}

function transformRealTimeChatData(message, joinedSpans) {
  const parsedData = parseIfJson(joinedSpans);

  if (Array.isArray(parsedData)) {
    // componentes do tipo Array
  } else if (typeof parsedData === "object") {
    const componentKey = Object.keys(parsedData)[0];
    const messageBubble = components[componentKey](JSON.parse(joinedSpans));
    message.replaceWith(messageBubble);
  } else {
    const messageBubble = components.defaultText(joinedSpans);
    message.replaceWith(messageBubble);
  }
}

function replaceHistoryContent(message) {
  const chatMessages = message.querySelectorAll(
    ".transcript---phrase.messagewrapper"
  );

  if (chatMessages?.length <= 0) return;

  chatMessages.forEach((messageData) => {
    let joinedSpans = "";
    const spans = messageData.querySelectorAll(".transcript---phrase---word");

    spans.forEach((span) => (joinedSpans += span.textContent));

    joinedSpans = joinedSpans.replace(/\s+/g, " ");

    if (joinedSpans.length <= 0) return;

    transformHistoryData(message, joinedSpans);
  });
}

function findAndPaintMessagesInFrames(frame) {
  // Verifica se o frame é válido e se ele tem um documento
  if (frame && frame.contentDocument) {
    // Seleciona todos os elementos com a classe ".vue-recycle-scroller__item-view" no documento do iframe
    var messages = frame.contentDocument.querySelectorAll(
      ".vue-recycle-scroller__item-view"
    );
    // Transforma cada mensagem para o novo padrão
    messages.forEach((message) => replaceHistoryContent(message));
    // Percorre todos os iframes filhos recursivamente
    var iframes = frame.contentDocument.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i++) {
      findAndPaintMessagesInFrames(iframes[i]);
    }
  }
}

// Chama a função recursiva para percorrer todos os iframes na página
const checkIframes = () => {
  var iframes = document.getElementsByTagName("iframe");
  for (var i = 0; i < iframes.length; i++) {
    findAndPaintMessagesInFrames(iframes[i]);
  }
};

function replaceContent() {
  const chatMessages = document.querySelectorAll(".acd-chat-message-body");

  if (chatMessages.length <= 0) return;

  chatMessages.forEach((message) => {
    let joinedSpans = "";
    const spans = message.querySelectorAll("span");
    spans.forEach((span) => (joinedSpans += span.textContent));

    if (joinedSpans.length <= 0) return;

    transformRealTimeChatData(message, joinedSpans);
  });
}

setInterval(() => {
  replaceContent();
  checkIframes();
}, 2000);
