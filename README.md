# EchoGaze

> *Your gaze, echoed to those who care.*

**Repository:** [John-Varghese-EH/summer-of-codesfest-20-mystic-squad](https://github.com/John-Varghese-EH/summer-of-codesfest-20-mystic-squad)

---

## What is EchoGaze?

**EchoGaze** is an edge-first Augmentative and Alternative Communication (AAC) platform designed for individuals suffering from severe motor impairments, such as Amyotrophic Lateral Sclerosis (ALS) or Locked-In Syndrome (LIS). Built around an ESP32 microcontroller and a TCRT5000 infrared sensor mounted on a standard spectacle frame, EchoGaze enables hands-free communication via intentional eye blinks.

With a target Cost of Goods Sold (COGS) under $15, EchoGaze drastically lowers the financial barrier of AAC technology, making real-time assistive communication accessible to patients globally without reliance on expensive $5,000+ ocular tracking systems.

---

## Key Capabilities

- **Edge-First Reliability**: Core patient communication operates 100% offline on local hardware. A local WebSockets server hosted directly on the ESP32 ensures zero dependency on external internet access.
- **Radically Affordable**: Total component Cost of Goods Sold (COGS) is sub-$15, making high-impact assistive technology available to underserved communities.
- **Predictive Text Engine**: Features a Markov-chain predictive text system that anticipates user intent based on context and historical usage patterns.
- **Accessible (WCAG 2.1 AA Compliant)**: Designed with a high-contrast 3-card Flexbox carousel interface, ARIA live region support, native Web Speech API voice readback, and tactile/audible piezo feedback.
- **Cloud-Synced Caregiver Dashboard**: Real-time integration with Firebase Realtime Database pushes patient selections to a web dashboard hosted on Vercel for remote caregiver notification.

---

## System Architecture

```
+----------------+      +---------------------+      +----------------+
| Patient Blink  | ---> | TCRT5000 IR Sensor  | ---> | ESP32 Edge     |
| (Eye Gesture)  |      | or any input Sensor |      | Microcontroller|
+----------------+      +---------------------+      +-------+--------+
                                                          |
                                                          v
+----------------+      +---------------------+      +---------------+
| Caregiver      | <--- | Firebase            | <--- | Patient UI    |
| Dashboard      |      | Realtime DB         |      | (Local SPA)   |
+----------------+      +---------------------+      +---------------+
```

### Detailed Flow
`Patient Blink -> TCRT5000 -> ESP32 -> Patient UI -> Firebase -> Caregiver Dashboard`

1. **Detection**: The patient blinks intentionally, altering the light reflection on the TCRT5000 IR photodiode.
2. **Processing**: The ESP32 executes ambient noise demodulation and debouncing algorithms to isolate valid blinks.
3. **Local Action**: A WebSocket event is dispatched to the offline Patient UI, selecting the active carousel card and triggering speech synthesis.
4. **Cloud Notification**: The selection payload is synchronized to Firebase Realtime Database and displayed instantly on the remote Caregiver Dashboard.

---

## Repository Structure

| Path | Description |
|---|---|
| `frimware/` | ESP32 C++ firmware source code, hardware drivers, and SPIFFS/LittleFS UI assets. |
| `website/` | Web application source code for the Caregiver Dashboard (Firebase integration, Vercel deployment). |
| `docs/` | Comprehensive technical architecture specifications, hardware schematics, and setup documentation. |

---

## Hardware Requirements

To assemble an EchoGaze hardware unit, the following components are required:

- **ESP32 Development Board** (Dual-Core Microcontroller)
- **TCRT5000 IR Reflective Optical Sensor Module**
- **Resistors**: 100Ω (IR LED emitter circuit) and 5kΩ (Photodiode receiver circuit)
- **Piezo Buzzer** (Audio feedback signal)
- **Spectacle Frame** (For adjustable and stable sensor positioning)
- **Connecting Wires & Breadboard / Custom PCB**

---

## Getting Started

### 1. Firmware Setup (ESP32)

The firmware is built using **PlatformIO** (recommended) or the Arduino IDE.

```bash
# Navigate to the firmware folder
cd frimware

# Build firmware using PlatformIO CLI
pio run

# Upload firmware to connected ESP32 board
pio run --target upload

# Upload SPIFFS web assets to ESP32 flash memory
pio run --target uploadfs
```

### 2. Website Setup (Caregiver Dashboard)

The caregiver dashboard is built using standard web technologies and Firebase.

```bash
# Navigate to the website directory
cd website

# Install dependencies
npm install

# Start local development server
npm run dev
```

---

## Team & Hackathon Information

### Mystic Squad
- **John Varghese (J0X)**
- **Amit Kumar**
- **Rishabh Nirmalkar**

### Hackathon
- **HackIndia / GSSoC Summer of CodesFest 2025**

---

## License

This project is licensed under the **GPL-3.0 License**. See the `LICENSE` file for full terms and conditions.
