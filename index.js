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

  // --- Functions ---

  // Update the callback functions based on selected modes
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
