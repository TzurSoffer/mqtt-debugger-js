# MQTT Debugger Web

## A live demo can be found [here](http://mqtt.soffer.tech)
![image](https://github.com/user-attachments/assets/8c37beff-11b2-49b3-a479-d6d20c884484)

## If you found [this repository](https://github.com/TzurSoffer/mqtt-debugger-js) useful, please give it a ⭐!.

This project is a web-based MQTT debugger that lets you connect to an MQTT broker using WebSockets, subscribe to topics, and publish messages. It also supports several modes (Print, Timer, and Abbreviate) for processing received messages.

> **Note:** This version only supports WebSocket connections. You can specify whether to use a secure connection (wss) by checking the corresponding option.

## File Structure

- **index.html**  
  Contains the main UI layout with a header (including a GitHub icon) and two panels: the left panel for configuration/settings and the right panel for displaying messages.

- **index.js**  
  Implements the MQTT connection logic using [mqtt.min.js](https://github.com/mqttjs/MQTT.js). It loads default configuration from `config.json`, manages user inputs, connects to the broker, subscribes to topics, and publishes messages.

- **index.css**  
  Provides the styles for the application, including layout, header, input fields, and message display.

- **config.json**  
  Holds the default configuration settings such as broker address, port, path, secure connection option, username, password, and default modes. Update this file to change the default values without modifying the code.

- **mqtt.min.js**  
  The MQTT client library. (Place this file in the project root.)

## Settings

**brokerAddress:** The default IP or hostname of the MQTT broker.

**port:** The default port to connect to.

**path:** (Optional) The URL path to the WebSocket endpoint.

**secure:** Boolean indicating if the connection should use wss (true) or ws (false).

**username / password:** (Optional) Credentials for broker authentication.

# modes:

**print:** When enabled, received messages are printed.

**timer:** Displays the time elapsed since the last message.

**abbreviate:** Limits message length to 999 characters.

# Setup:

Place all files (index.html, index.js, index.css, config.json, and mqtt.min.js) in the same directory on your web server.

Adjust config.json with your preferred default settings.

# Running the App:

Open index.html in your browser via live server or other service.

The default configuration will be automatically loaded.

Fill in any custom fields if necessary, then click Connect to connect to your MQTT broker via WebSockets.

Use the Subscribe section to listen to topics and the Publish section to send messages.

# Modes:
Select one or more modes (Print, Timer, Abbreviate) to modify how incoming messages are processed.

For example, enable Timer to see the time elapsed between messages.

This project uses modern JavaScript (ES6) and standard HTML5/CSS3, so no additional libraries are required.

# License
This project is open source and available under the MIT License (see LICENSE file).

# Contributing
Feel free to fork the repository and submit pull requests if you have ideas or improvements.
