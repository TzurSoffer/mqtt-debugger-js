document.addEventListener("DOMContentLoaded", function () {
  let client = null;
  let callbacks = [];
  let autoScroll = true;
  let lastMessageTime = null;

  // Get DOM elements
  const brokerInput = document.getElementById("brokerAddress");
  const portInput = document.getElementById("port");
  const pathInput = document.getElementById("path");
  const isSecureConnect = document.getElementById("secureConnect");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const modePrint = document.getElementById("modePrint");
  const modeTimer = document.getElementById("modeTimer");
  const modeAbbreviate = document.getElementById("modeAbbreviate");
  const connectBtn = document.getElementById("connectBtn");
  const subscribeTopicInput = document.getElementById("subscribeTopic");
  const subscribeBtn = document.getElementById("subscribeBtn");
  const publishTopicInput = document.getElementById("publishTopic");
  const publishMsgInput = document.getElementById("publishMsg");
  const publishBtn = document.getElementById("publishBtn");
  const messageDisplay = document.getElementById("messageDisplay");
  const toggleThemeBtn = document.getElementById("toggle-theme");
  const themeIconPath = document.getElementById("theme-icon-path");

  // Load default configuration from config.json
  fetch('config.json')
    .then(response => response.json())
    .then(config => {
      brokerInput.value = config.brokerAddress || brokerInput.value;
      portInput.value = config.port || portInput.value;
      pathInput.value = config.path || pathInput.value;
      isSecureConnect.checked = config.secure || false
      usernameInput.value = config.username || "";
      passwordInput.value = config.password || "";
      if (config.modes) {
        modePrint.checked = config.modes.print || false;
        modeTimer.checked = config.modes.timer || false;
        modeAbbreviate.checked = config.modes.abbreviate || false;
      }
      updateModes();
    })
    .catch(error => console.error("Failed to load config.json", error));

  // Update mode callbacks on checkbox change
  [modePrint, modeTimer, modeAbbreviate].forEach(box => {
    box.addEventListener("change", updateModes);
  });

  // Button event listeners
  connectBtn.addEventListener("click", connectToBroker);
  subscribeBtn.addEventListener("click", subscribeTopic);
  publishBtn.addEventListener("click", publishMessage);

  // Auto-scroll handling on message display
  messageDisplay.addEventListener("scroll", onScroll);
  toggleThemeBtn.addEventListener("click", updateTheme);

  // Load theme from local storage
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    updateTheme();
  }

  // --- Functions ---

  function updateTheme() {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Change SVG icon
    themeIconPath.setAttribute(
      "d",
      isDark
        ? "M10 8C10 9.104 9.104 10 8 10C6.896 10 6 9.104 6 8C6 6.896 6.896 6 8 6C9.104 6 10 6.896 10 8Z M5.0964 3.459L5.0447 4.070C5.018 4.389 5.0047 4.549 4.9357 4.674C4.8751 4.784 4.784 4.8751 4.674 4.9357C4.549 5.0047 4.389 5.018 4.070 5.0447L3.459 5.0964C2.775 5.1528 2.4327 5.181 2.2642 5.337C2.1175 5.464 2.0396 5.668 2.0521 5.867C2.0664 6.097 2.2946 6.354 2.7507 6.867L3.1276 7.291C3.3508 7.522 3.4623 7.6108 3.5043 7.809C3.5417 7.933 3.5417 8.067 3.5043 8.191C3.4623 8.3892 3.3508 8.478 3.1276 8.709L2.7507 9.133C2.2946 9.646 2.0664 9.903 2.0521 10.133C2.0396 10.332 2.1175 10.536 2.2642 10.663C2.4327 10.819 2.775 10.8472 3.459 10.9036L4.070 10.9553C4.389 10.982 4.549 10.9953 4.674 11.0643C4.784 11.1249 4.8751 11.216 4.9357 11.326C5.0047 11.451 5.018 11.611 5.0447 11.93L5.0964 12.541C5.1528 13.225 5.181 13.5673 5.337 13.7358C5.464 13.8825 5.668 13.9604 5.867 13.9479C6.097 13.9336 6.354 13.7054 6.867 13.2493L7.291 12.8724C7.522 12.6492 7.6108 12.5377 7.809 12.4957C7.933 12.4583 8.067 12.4583 8.191 12.4957C8.3892 12.5377 8.478 12.6492 8.709 12.8724L9.133 13.2493C9.646 13.7054 9.903 13.9336 10.133 13.9479C10.332 13.9604 10.536 13.8825 10.663 13.7358C10.819 13.5673 10.8472 13.225 10.9036 12.541L10.9553 11.93C10.982 11.611 10.9953 11.451 11.0643 11.326C11.1249 11.216 11.216 11.1249 11.326 11.0643C11.451 10.9953 11.611 10.982 11.93 10.9553L12.541 10.9036C13.225 10.8472 13.5673 10.819 13.7358 10.663C13.8825 10.536 13.9604 10.332 13.9479 10.133C13.9336 9.903 13.7054 9.646 13.2493 9.133L12.8724 8.709C12.6492 8.478 12.5377 8.3892 12.4957 8.191C12.4583 8.067 12.4583 7.933 12.4957 7.809C12.5377 7.6108 12.6492 7.522 12.8724 7.291L13.2493 6.867C13.7054 6.354 13.9336 6.097 13.9479 5.867C13.9604 5.668 13.8825 5.464 13.7358 5.337C13.5673 5.181 13.225 5.1528 12.541 5.0964L11.93 5.0447C11.611 5.018 11.451 5.0047 11.326 4.9357C11.216 4.8751 11.1249 4.784 11.0643 4.674C10.9953 4.549 10.982 4.389 10.9553 4.070L10.9036 3.459C10.8472 2.775 10.819 2.4327 10.663 2.2642C10.536 2.1175 10.332 2.0396 10.133 2.0521C9.903 2.0664 9.646 2.2946 9.133 2.7507L8.709 3.1276C8.478 3.3508 8.3892 3.4623 8.191 3.5043C8.067 3.5417 7.933 3.5417 7.809 3.5043C7.6108 3.4623 7.522 3.3508 7.291 3.1276L6.867 2.7507C6.354 2.2946 6.097 2.0664 5.867 2.0521C5.668 2.0396 5.464 2.1175 5.337 2.2642C5.181 2.4327 5.1528 2.775 5.0964 3.459Z"
        : "M8 1.333a6.667 6.667 0 1 0 6.667 6.667A6.667 6.667 0 0 1 8 1.333z" // Moon
    );
  }

  function updateModes() {
    callbacks = [];
    if (modePrint.checked) {
      callbacks.push(printf);
    }
    if (modeTimer.checked) {
      callbacks.push(timer);
    }
    if (modeAbbreviate.checked) {
      callbacks.push(abbreviate);
    }
  }

  // Connect to the MQTT broker using WebSockets
  function connectToBroker() {
    const brokerAddress = brokerInput.value;
    const port = parseInt(portInput.value);
    const path = pathInput.value;
    const username = usernameInput.value || null;
    const password = passwordInput.value || null;

    // Always use WebSocket connection
    connectionType = "ws"
    if (isSecureConnect.checked) {
      connectionType = "wss"
    }

    const brokerUrl = `${connectionType}://${brokerAddress}:${port}/${path}`;

    const options = {};
    if (username && password) {
      options.username = username;
      options.password = password;
    }

    client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
      updateTextArea(`Connection Successful to ${brokerUrl} using WebSockets\n`);
    });

    client.on("error", (error) => {
      updateTextArea(`Connection Error: ${error.message}\n`);
    });

    client.on("disconnect", () => {
      updateTextArea("Disconnected from broker.\n");
    });

    client.on("message", (topic, message) => {
      // Apply all selected callbacks to the received message
      callbacks.forEach(callback => {
        callback(topic, message);
      });
    });

    updateTextArea(`Attempting to connect to broker ${brokerUrl} using WebSockets...\n`);
  }

  // Subscribe to a topic
  function subscribeTopic() {
    const topic = subscribeTopicInput.value;
    if (!topic) {
      alert("Please enter a topic to subscribe.");
      return;
    }
    if (client) {
      client.subscribe(topic, (err) => {
        if (err) {
          alert("Failed to subscribe to topic: " + err);
        } else {
          updateTextArea(`Subscribed to ${topic}\n`);
        }
      });
    } else {
      alert("Please connect to a broker first.");
    }
  }

  // Publish a message to a topic
  function publishMessage() {
    const topic = publishTopicInput.value;
    const message = publishMsgInput.value;
    if (!topic || !message) {
      alert("Please enter both topic and message.");
      return;
    }
    if (client) {
      client.publish(topic, message, {}, (err) => {
        if (err) {
          alert("Failed to publish message: " + err);
        } else {
          updateTextArea(`Published to ${topic}: ${message}\n`);
        }
      });
    } else {
      alert("Please connect to a broker first.");
    }
  }

  // Callback: simply prints the received message
  function printf(topic, message) {
    const data = message.toString();
    updateTextArea(`${topic}: ${data}\n`);
  }

  // Callback: shows time since the last message
  function timer(topic, message) {
    const currentTime = Date.now() / 1000; // seconds
    let timeDiff = 0;
    if (lastMessageTime !== null) {
      timeDiff = currentTime - lastMessageTime;
    }
    lastMessageTime = currentTime;
    updateTextArea(`Time since last message: ${timeDiff.toFixed(2)} seconds\n`);
  }

  // Callback: abbreviates long messages to 999 characters
  function abbreviate(topic, message) {
    let data = message.toString();
    if (data.length > 999) {
      data = data.substring(0, 999) + "...";
    }
    updateTextArea(`${topic}: ${data}\n`);
  }

  // Append text to the message display area and auto-scroll if enabled
  function updateTextArea(text) {
    messageDisplay.innerText += text;
    if (autoScroll) {
      messageDisplay.scrollTop = messageDisplay.scrollHeight;
    }
  }

  // Check scroll position to determine auto-scroll behavior
  function onScroll() {
    const threshold = 5;
    if (messageDisplay.scrollTop + messageDisplay.clientHeight < messageDisplay.scrollHeight - threshold) {
      autoScroll = false;
    } else {
      autoScroll = true;
    }
  }
});
