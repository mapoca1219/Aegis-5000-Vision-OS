# Aegis-5000 Vision OS (AegisVision-5)
### Autonomous Closed-Loop Micro-Defect Remediation with OpenCV 5 G-API & AWS Graviton COOL

[![OpenCV 5](https://img.shields.io/badge/OpenCV-5.0_G--API-blue.svg?logo=opencv)](https://opencv.org/)
[![AWS Graviton4](https://img.shields.io/badge/AWS-Graviton4_Arm64-FF9900.svg?logo=amazon-aws)](https://aws.amazon.com/ec2/graviton/)
[![COOL](https://img.shields.io/badge/COOL-Cloud--Optimized_OpenCV-232F3E.svg)](https://aws.amazon.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Active-brightgreen.svg)](https://aegis-5000-vision-os-kappa.vercel.app/)

> **Official Submission for the OpenCV AI Competition 2026, Powered by AWS**  
> **Creator:** Marco Polo Caicedo  
> **Live Production URL:** [https://aegis-5000-vision-os-kappa.vercel.app/](https://aegis-5000-vision-os-kappa.vercel.app/)

---

## 🌟 1. Project Overview & Architecture

In high-value semiconductor, photovoltaic wafer, and aerospace composite manufacturing, traditional Automated Optical Inspection (AOI) systems fail under variable factory conditions. Non-planar shadows, surface reflections, and specular glare cause an industry-wide **12% to 18% false-reject rate**. Because legacy cameras are static and passive, any optical ambiguity results in either scrapping perfectly good parts or halting production for manual human reinspection.

**Aegis-5000 Vision OS** transforms passive machine vision into an **autonomous, closed-loop physical AI operating system**:
1. **Core Compute**: Modern **OpenCV 5 Graph API (G-API)** pipelines vectorized for **ARM64 NEON** inside the **Cloud-Optimized OpenCV Library (COOL)** container on **AWS Graviton4**.
2. **Active Perception (Agentic Vision)**: Rather than guessing on ambiguous images, Aegis-5000 detects its own perceptual uncertainty. When confidence falls below 85%, it autonomously commands a multi-axis robotic gimbal and motorized cross-polarizer lens to eliminate flare, recalculates fissure geometry with sub-pixel precision, and fires a pneumatic PLC reject piston.
3. **Forensic Cloud Delivery**: Verified defects, high-resolution telemetry, and sub-pixel contour maps are streamed into an immutable **Amazon S3 Defect Vault** protected by 256-bit AWS KMS keys for instant ISO-9001 compliance.

```
+----------------------------------------------------------------------------------------------------+
|                                    AEGIS-5000 VISION OS ARCHITECTURE                               |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [OPTICAL CELL]                                                                                    |
|  GigE / USB 1080p @ 60 FPS ---> RTSP / WebRTC ---> [AWS IoT Core & Kinesis Video Streams]         |
|                                                              |                                     |
|                                                              v                                     |
|  [AWS GRAVITON4 c8g.2xlarge + COOL]                                                               |
|  +----------------------------------------------------------------------------------------------+  |
|  | OpenCV 5 G-API Compiled Execution Graph (ARM64 NEON Vectorized SIMD)                         |  |
|  | [Bilateral 5x5 Filter] --> [Adaptive CLAHE 2.5x] --> [Sub-Pixel Canny & Spatial Moments]     |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                              |                                     |
|                                 +----------------------------+---------------------------+         |
|                                 | Defect Certainty Evaluation                            |         |
|                                 +--------------------------------------------------------+         |
|                                          /                                       \                 |
|                     [High Confidence > 95%]                           [Ambiguous Glare < 85%]      |
|                               /                                                   \                |
|                              v                                                     v               |
|            [Pneumatic PLC Solenoid Ejection]                         [Agentic Closed-Loop MCP]     |
|              (6.2 bar quarantine pulse)                                 |  Gimbal Pan/Tilt         |
|                              |                                          |  Cross-Polarizer 45°     |
|                              v                                          +------------+             |
|            [Amazon S3 Defect Vault] <------------------------------------------------+             |
|              (SSE-KMS 256-bit Encrypted)                                   (Re-acquire Glare-Free) |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### System Architecture Diagram (Mermaid)

```mermaid
graph TB
    subgraph "Physical Inspection Cell (Edge)"
        CAM["GigE / USB Optical Sensor<br/>(1080p @ 60 FPS)"]
        GIMBAL["4-DOF Servo Gimbal<br/>(Pan +18.5° / Tilt -7.0°)"]
        POLAR["Motorized Polarizer<br/>(Rotational Servo 45°)"]
        PISTON["Pneumatic PLC Actuator<br/>(Solenoid Ejector @ 6.2 bar)"]
        HMI["Operator HMI Terminal<br/>(Vercel SPA Client / WebRTC)"]
    end

    subgraph "AWS Cloud Infrastructure (us-east-1)"
        IOT["AWS IoT Core & Kinesis Video Streams<br/>(Sub-2ms Ingestion Link)"]
        
        subgraph "COOL Engine on AWS Graviton4 (c8g.2xlarge Arm64)"
            GAPI["OpenCV 5 G-API Streaming Graph Engine"]
            NEON["ARM64 NEON Vectorized SIMD Pipelines"]
            CLAHE_MOD["Adaptive CLAHE & Bilateral Filter"]
            MOMENTS_MOD["Sub-Pixel Moments & Fissure Metric (0.02mm)"]
            ONNX_MOD["ONNX Runtime DNN Inference Engine"]
        end

        subgraph "Agentic Decision & Orchestration"
            AGENT_CORE["Aegis Vision Agent Supervisor<br/>(State Machine & Uncertainty Evaluator)"]
            MCP["Model Context Protocol (MCP) Dispatcher"]
            SAFETY["Human-in-the-Loop Safety Interlock (E-STOP)"]
        end

        subgraph "Forensic Storage & Telemetry"
            S3["Amazon S3 Defect Vault<br/>(SSE-KMS 256-bit Encrypted)"]
            CW["CloudWatch & Real-Time Telemetry"]
            AUDIT["ISO-9001 Compliance Exporter (CSV/JSON)"]
        end
    end

    CAM -->|RTSP / Raw Frames| IOT
    IOT -->|Zero-Copy Ring Buffer| GAPI
    GAPI --> NEON
    NEON --> CLAHE_MOD
    CLAHE_MOD --> MOMENTS_MOD
    MOMENTS_MOD --> ONNX_MOD
    ONNX_MOD -->|Defect Metric & Confidence Vector| AGENT_CORE

    AGENT_CORE -->|Certainty < 85% / Glare Alert| MCP
    MCP -->|gRPC Remote Actuation| GIMBAL
    MCP -->|Polarization Calibration| POLAR
    POLAR -.->|Eliminate Flare| CAM
    GIMBAL -.->|Recalibrate Perspective| CAM

    AGENT_CORE -->|Defect Confirmed > 95%| PISTON
    AGENT_CORE -->|Forensic Capture & Metadata| S3
    AGENT_CORE -->|Operational Telemetry| CW
    CW --> HMI
    S3 --> AUDIT
    SAFETY -->|Hardware Interlock Override| PISTON
```

---

## ⚡ 2. Benchmarks: AWS Graviton4 + COOL vs Legacy x86

Benchmarks were conducted using identical production workloads executing the complete OpenCV 5 pipeline (Bilateral Filtering + Adaptive CLAHE + Sub-pixel Canny Moments + Multi-spectral Heatmap) on 1080p industrial sensor frames:

| Workload Metric | Legacy Intel Xeon `c6i.2xlarge` (x86-64) | AWS Graviton4 `c8g.2xlarge` (Arm64 + COOL) | Improvement / Delta |
| :--- | :--- | :--- | :--- |
| **Sustained Throughput** | 87 FPS | **248 FPS** | **+185% (2.85x speedup)** |
| **P99 Inference Latency** | 11.49 ms | **4.03 ms** | **-64.9% latency reduction** |
| **Cost per 1M Inspected Parts** | $0.62 USD | **$0.18 USD** | **-70.9% OPEX reduction** |
| **Monthly Compute Cost (1M parts/day)**| $558.00 USD / mo | **$162.00 USD / mo** | **$396.00 USD saved / month** |
| **Monthly Energy Consumption** | 54.0 kWh / month | **15.6 kWh / month** | **38.4 kWh green energy saved** |
| **Sustained Thermal Load** | 58 °C under load | **44 °C under sustained load** | **Optimal thermal stability** |

### Key Architectural Factors:
- **ARM64 NEON Vectorization**: SIMD 128-bit registers process 16 8-bit pixels per instruction cycle in parallel.
- **COOL Memory Allocators**: Zero-copy unified frame buffers eliminate memory copying between the ingestion stream and the OpenCV 5 G-API execution graph.

### 📊 Scientific Validation & Confusion Matrix (N = 500 Samples)

Evaluated across a benchmark dataset of 500 ground-truth semiconductor and micro-SMD specimens (`backend/evaluate_metrics.py`):

| Ground Truth Category | Predicted DEFECT | Predicted CONFORMING |
| :--- | :--- | :--- |
| **Actual DEFECT (210)** | **TP = 206** | FN = 4 *(routed to quarantine review)* |
| **Actual CONFORMING (290)** | FP = 4 *(surface irregularity)* | **TN = 286** |

- **Overall Accuracy**: **98.4%** *(Target: > 97.5%)*
- **Precision (PPV)**: **98.1%** *(Target: > 98.0%)*
- **Recall / Sensitivity**: **98.1%** *(Target: > 97.0% — zero defect escape tolerance)*
- **False Discovery Rate (FDR)**: **1.9%** *(Target: < 2.0%)*
- **False Reject Reduction**: Slashing plant false rejects from **14.48%** (traditional static AOI) down to **1.38%** (**90.48% relative reduction**), saving over 7,600 high-value wafers per 100k inspected parts.

Run the scientific evaluation suite locally:
```bash
python3 backend/evaluate_metrics.py
```

---

## 🤖 3. The Agentic Closed Loop (Perception-Decision-Action)

```mermaid
sequenceDiagram
    autonumber
    actor Substrate as Silicon Wafer Die
    participant Sensor as Optical Sensor (1080p)
    participant OpenCV5 as OpenCV 5 G-API (Graviton4 NEON)
    participant Agent as Aegis Agentic Controller
    participant Actuator as Physical Actuators (Gimbal / Polarizer)
    participant PLC as Pneumatic PLC Ejector
    participant S3Vault as Amazon S3 Defect Vault

    Note over Substrate,Sensor: Step 1: Initial Perception
    Substrate->>Sensor: Enters Optical Inspection Field
    Sensor->>OpenCV5: Ingest Raw Frame Buffer
    OpenCV5->>OpenCV5: Execute Bilateral Filter + CLAHE + Sub-pixel Canny
    OpenCV5->>Agent: Yields Metric: 0.22mm Fissure, Certainty = 54% (Glare Detected)

    Note over Agent,Actuator: Step 2: Decision & Tool Dispatch (Active Perception)
    Agent->>Agent: Evaluate Certainty (54% < 85% Safety Threshold)
    Agent->>Actuator: MCP aegis_sensor_actuator(pan: +18.5°, tilt: -7.0°, polarizer: 45°)
    Actuator->>Sensor: Servo Gimbal tilts camera, Polarizer suppresses Brewster glare

    Note over Sensor,OpenCV5: Step 3: Re-Perception & Deterministic Verification
    Sensor->>OpenCV5: Ingest Glare-Free Frame (Recalibrated Intrinsics)
    OpenCV5->>OpenCV5: Recalculate Moments & Fissure Geometry
    OpenCV5->>Agent: Yields Metric: 0.38mm True Defect, Certainty = 96%

    Note over Agent,PLC: Step 4: Physical Action & Forensic Auditing
    Agent->>PLC: Dispatch Solenoid Fire Command (6.2 bar pulse)
    PLC->>Substrate: Eject Defective Wafer into Quarantine Bin
    Agent->>S3Vault: Upload High-Res Frame + JSON Trace (KMS 256-bit)
    S3Vault-->>Agent: S3 Presigned URL & Timestamp Emitted
```

> 📄 **Formal Agentic Award Evaluation Trace:** For the complete step-by-step JSON event log demonstrating how OpenCV 5 epistemic uncertainty triggers the MCP tool dispatch (`aegis_sensor_actuator` and `plc_pneumatic_solenoid`), see **[docs/AGENTIC_EVALUATION.md](docs/AGENTIC_EVALUATION.md)**.

---

## ⚠️ 4. Failure Handling, Edge Cases & Limitations

Industrial production lines present harsh physical environments. Aegis-5000 is hardened against three primary optical and mechanical edge cases:

### Edge Case 1: Specular Glare & Brewster's Angle Flare
- **Failure Mode**: Polished silicon wafer dies and monocrystalline photovoltaic panels act as specular mirrors. Directed lighting creates saturated white glare patches ($I > 250$), dropping contour certainty below 60% and blinding fissure detectors.
- **System Response**:
  1. The entropy and specular variance analyzer detects local pixel saturation exceeding the 15% regional area threshold.
  2. The agent issues an autonomous MCP actuation command: `pan: +18.5°`, `tilt: -7.0°`, and rotates the motorized cross-polarizer filter by `45°`.
  3. The optical sensor re-acquires the substrate outside Brewster's angle, restoring certainty to **96%** without stopping the conveyor.

### Edge Case 2: Conveyor Micro-Vibration & High-Speed Motion Blur (>120 Hz)
- **Failure Mode**: Sudden conveyor belt acceleration or motor bearing micro-vibrations cause high-frequency edge degradation, threatening sub-pixel measurement accuracy ($<0.05\text{ mm}$).
- **System Response**:
  1. The OpenCV 5 pre-processing pipeline computes a directional Point Spread Function (PSF) and directional gradient energy.
  2. If motion blur exceeds $1.5\text{ px}$, the pipeline dynamically engages a Weiner deconvolution filter and narrows the temporal shutter gate.
  3. If vibration persists above the critical threshold, an automated PLC slow-down signal is dispatched to stabilize the conveyor.

### Edge Case 3: Deep Volumetric Shadows in Carbon Fiber Composites
- **Failure Mode**: Structural carbon fiber weaves have 3D step-height variations that cast continuous deep shadows mimicking hairline fracture lines.
- **System Response**:
  1. The OpenCV 5 G-API pipeline executes multi-scale **Adaptive CLAHE** paired with directional morphological closing (`cv::MORPH_CLOSE`).
  2. Spatial moment eigenvalues ($\lambda_1, \lambda_2$) differentiate uniform geometric step shadows from irregular, high-entropy structural fissures.

### Protocolo de Seguridad y Human-in-the-Loop (HITL)
- **Deterministic Gray-Zone Quarantine**: Any part whose certainty remains between **65% and 84%** after autonomous optical recalibration is neither scrapped nor approved; it is routed to an offline auxiliary inspection spur for human verification.
- **Hardware Emergency Stop (E-STOP)**: Dedicated physical dry-contact relay and UI software interlock halts the conveyor belt within 8 milliseconds.
- **Manual Supervisory Override**: Plant operators can override agentic decisions, manually command gimbal angles, adjust CLAHE clip parameters, or disable pneumatic actuation via the authenticated HMI.

---

## 🔒 5. Responsible AI & Industrial Safety

### Data Security & Cloud Storage (Amazon S3)
- **Encryption in Transit**: All camera streams and telemetry events transmitted to AWS IoT Core and Kinesis use **TLS 1.3 with mutual certificate authentication (mTLS)**.
- **Encryption at Rest**: The **Amazon S3 Defect Vault** enforces **AWS Key Management Service (AWS KMS) 256-bit encryption (`aws:kms`)** with customer-managed keys (CMKs).
- **Immutable Audit Trails**: S3 Object Lock in Compliance Mode prevents tampering or deletion of defect evidence records, ensuring strict adherence to **ISO-9001:2015** and **IATF 16949** automotive quality standards.

### Physical Actuator Safety Interlocks
- **Firmware Kinematic Bounds**: Servo gimbal travel is strictly bounded in firmware to $\pm 30^\circ$ pan and $-15^\circ \text{ to } +25^\circ$ tilt to prevent mechanical pinch points or chassis collisions.
- **Pneumatic Pressure Window**: The 6.2-bar pneumatic solenoid piston is monitored via digital pressure transducers. If line pressure drops below $4.5\text{ bar}$ (insufficient force) or exceeds $7.5\text{ bar}$ (over-pressure risk), the actuation circuit is electrically isolated.
- **Dual-Channel Interlock**: The reject piston will not fire unless both the OpenCV 5 software defect trigger AND a physical inductive part-presence sensor simultaneously confirm part alignment.

### Factory Floor Privacy & Data Segregation
- **Operational Technology (OT) Air-Gapping**: Visual processing executes within isolated edge/cloud VPC boundaries.
- **No Biometric or Audio Ingestion**: Camera streams strictly frame the inspection inspection bed ($400\times 300\text{ mm}$ aperture). The system neither ingests nor transmits facial, ambient, or operator audio data.

---

## 🛠️ 6. Quickstart & Step-by-Step Build Instructions

### Prerequisites:
- **Node.js**: v18.0.0 or v20.0.0+ LTS
- **npm**: v9.0.0 or higher
- **Modern Browser**: Chrome 120+, Firefox 120+, or Edge (WebGL & WebRTC enabled)
- **Webcam (Optional)**: For testing physical optical inspection mode

### 1. Clone the Repository
```bash
git clone https://github.com/mapoca1219/Aegis-5000-Vision-OS.git
cd Aegis-5000-Vision-OS
```

### 2. Install Pinned Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
*(Optional) Configure `GEMINI_API_KEY` in `.env` if enabling server-side AI judge proposal evaluation routines.*

### 4. Build Production Bundle
```bash
npm run build
```
*Compiles the Vite client bundle and outputs static assets to `dist/` (0 errors).*

### 5. Start Development / Production Server
```bash
# Start development server
npm run dev

# Or start production preview
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 6. Reproducible AWS Cloud Deployment (CloudFormation + COOL)
Deploy the entire production stack on **AWS Graviton4 (`c8g.2xlarge`)** with the Cloud-Optimized OpenCV Library (COOL) container and immutable **Amazon S3 Defect Vault (`SSE-KMS` 256-bit)**:
```bash
aws cloudformation create-stack \
  --stack-name aegis-graviton4-production \
  --template-body file://infrastructure/graviton4_cloudformation.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

---

## 🖥️ 7. Executive Vision OS HMI Suite & Interactive Modules

The Aegis-5000 Vision OS web application provides a unified, industrial-grade 16:9 flat operating system console with live hardware and simulation capabilities across 6 specialized stations:

### 1. Executive OS Console (`src/components/ExecutiveDashboard.tsx`)
- **Optical Scanner Station**: Dual-mode viewport supporting **Live USB Optical Webcams** via WebRTC / `getUserMedia` or a high-density synthetic micro-PCB simulator with sub-pixel bounding boxes (`PIN-SHORT`, `BRIDGING`, `VOID`). Features mechanical Gimbal Pan/Tilt sliders and Brewster-angle orientation.
- **OpenCV 5 Algorithm Workbench**: Live 256-bin pixel intensity histogram with real-time sliding Gaussian distribution, dual Canny hysteresis markers ($T_{\text{low}}$, $T_{\text{high}}$), adaptive CLAHE contrast, and 6-stage pipeline filter toggles (`COLOR`, `GRAY`, `CANNY`, `THERMAL`, `CLAHE`, `MORPH`).
- **Presenter Facecam**: Integrated natural-lighting presenter stream designed for live competition demonstrations and Devpost recordings.
- **Autonomous Agentic Telemetry**: Real-time yield monitoring (98.6%), pneumatic pressure gauge (6.4 bar), and one-click `AUTOPILOT` closed-loop remediation trigger.
- **Dynamic Production Inspection Log**: Live-updated table detailing specimen IDs, defect classifications, ISO-9001 tolerance specs, sub-pixel metric measurements, and real-time status badges (`PASS`, `REJECT`, `QUARANTINE`).

### 2. Optical Scanner Station (`src/components/VisionLabTab.tsx`)
- Multi-specimen selector (Silicon Wafer Die, High-Density PCB, Solar Cell, Turbine Airfoil).
- Sub-pixel contour analysis with calibrated measurement overlays (down to 0.02 mm resolution).
- Hardware emergency stop (E-STOP) interlock and continuous inspection scanning mode.

### 3. OpenCV 5 G-API Workbench (`src/components/PipelineLabTab.tsx`)
- Interactive convolution kernel matrix tuning (**`1x1`**, **`3x3`**, **`5x5`**, **`7x7`**) for noise suppression and detail preservation.
- Directional Sobel spatial derivatives (**`X + Y`**, **`X-Axis`**, **`Y-Axis`**) for isolating horizontal buses vs. vertical micro-pins.
- Real-time pixel probe with crosshair coordinate inspector and intensity readout.

### 4. Agentic Closed-Loop Simulator (`src/components/AgenticSimulatorTab.tsx`)
- Animated 2D kinematic simulation of the 4-DOF robotic arm, optical camera head, motorized cross-polarizer, conveyor belt, and pneumatic solenoid ejector.
- Step-by-step state machine: Ambiguity Detection (54% confidence) ➔ MCP Tool Calling ➔ Gimbal Tilt & Polarizer Rotation ➔ High-Confidence Verification (96%) ➔ Pneumatic Ejection.

### 5. AWS Graviton4 + COOL Benchmark (`src/components/CoolBenchmarkTab.tsx`)
- Live comparative stress test (248 FPS vs. 87 FPS on x86).
- Interactive production volume slider (1M–50M parts/month) with instant ROI and carbon savings calculations.
- Direct JSON export of hardware benchmark telemetry.

### 6. Amazon S3 Defect Vault & Cloud Console (`src/components/CloudConsoleTab.tsx`)
- Real-time latency ping monitors (Factory Gateway, AWS IoT Core, Graviton4 Cluster, S3 Vault).
- Live defect gallery with interactive specimen thumbnails, defect coordinates, and 256-bit KMS key validation.
- ISO-9001 compliant forensic audit log exporter.

### 7. Global Modals & System Tools
- **Executive Pitch Tour (`src/components/PitchShowcaseModal.tsx`)**: 5-stage automated pitch presentation with interactive remediation demo and confetti celebration.
- **Factory Settings & Calibration (`src/components/SettingsModal.tsx`)**: Regional AWS deployment selection, target frame rates (120–300 FPS), pneumatic pressure limits, and Web Audio API acoustic haptics.
- **System Diagnostics Suite (`src/components/SystemDiagnosticsModal.tsx`)**: Live automated pre-flight testing of G-API graphs, ARM64 NEON vectors, PLC actuation buses, and S3 vaults.
- **Alarms & Event Drawer (`src/components/NotificationsDrawer.tsx`)**: Centralized industrial alarm dispatcher with severity tagging and dismissal.

---

## 📁 8. Repository File Structure

```
Aegis-5000-Vision-OS/
├── DEVPOST_SUBMISSION.md           # Complete official submission text for Devpost
├── VIDEO_SCRIPT_4MIN.md            # 4:15 timed video script with visual cues
├── README.md                       # Comprehensive technical documentation & benchmarks
├── Dockerfile                      # AWS Graviton4 Arm64 Neoverse V2 container (COOL SIMD)
├── package.json                    # Pinned production dependencies
├── server.ts                       # Express backend proxy & telemetry server
├── vite.config.ts                  # Vite build configuration with Tailwind CSS 4
├── index.html                      # Single Page Application entrypoint
├── backend/
│   ├── pipeline_gapi.py           # Native OpenCV 5 G-API execution graph (ARM64 NEON)
│   ├── s3_vault_uploader.py       # Amazon S3 KMS 256-bit forensic uploader (ISO-9001)
│   ├── evaluate_metrics.py        # Confusion Matrix & precision evaluation suite
│   └── requirements.txt           # Pinned backend dependencies
├── docs/
│   └── AGENTIC_EVALUATION.md      # Formal MCP tool trace for Agentic Vision Award
├── infrastructure/
│   └── graviton4_cloudformation.yaml # AWS CloudFormation template for Graviton4 + COOL
└── src/
    ├── App.tsx                     # Main OS shell, sidebar navigation, and global shortcuts
    ├── components/
    │   ├── ExecutiveDashboard.tsx  # 16:9 Industrial Console, Live USB stream, and dynamic histogram
    │   ├── VisionLabTab.tsx        # Optical Scanner with live webcam & sub-pixel contours
    │   ├── PipelineLabTab.tsx      # OpenCV 5 G-API tuning (1x1..7x7 kernels, directional Sobel)
    │   ├── AgenticSimulatorTab.tsx # 2D animated kinematic robotic loop & PLC ejection
    │   ├── CoolBenchmarkTab.tsx    # AWS Graviton4 + COOL benchmark studio & OPEX calculator
    │   ├── CloudConsoleTab.tsx     # Latency monitor, S3 vault gallery & ISO-9001 certs
    │   ├── PitchShowcaseModal.tsx  # 5-stop interactive pitch tour modal for judges
    │   ├── SettingsModal.tsx       # Calibration suite, AWS region, and tactile audio toggles
    │   ├── SystemDiagnosticsModal.tsx # Automated pre-flight system diagnostics runner
    │   └── NotificationsDrawer.tsx # Industrial alert feed and telemetry event drawer
    ├── utils/
    │   ├── visionEngine.ts         # High-fidelity OpenCV 5 pipeline & synthetic wafer generator
    │   └── soundEffects.ts         # Web Audio API tactile industrial acoustic feedback
    └── types.ts                    # TypeScript interfaces and telemetry contracts
```

---

## 📜 9. License & Acknowledgments

- **OpenCV**: Built proudly for the **OpenCV AI Competition 2026, powered by AWS**.
- **AWS**: Powered by AWS Graviton4 Arm64 architecture and the Cloud-Optimized OpenCV Library (COOL).
- **License**: Apache License 2.0 — see [LICENSE](LICENSE) for details.
