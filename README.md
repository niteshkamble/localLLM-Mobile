# LocalLLM - React Native App

**Status: 🚧 In Progress / Test Repository**

A React Native application for downloading Llama models from Hugging Face and running them locally on mobile devices using **llama.rn**. This project enables on-device AI inference without requiring internet connectivity after model download.

## About

This app allows users to:
- Download Llama models in GGUF format directly from Hugging Face
- Use downloaded models with **llama.rn** library for local inference
- Load and run models locally on Android/iOS devices
- Chat with AI models with full conversation context
- Manage multiple models and chat sessions

## Tech Stack

### Core Framework
- **React Native** `0.82.1` - Mobile app framework
- **React** `19.1.1` - UI library
- **TypeScript** `5.8.3` - Type safety

### State Management
- **Redux Toolkit** `2.10.1` - State management
- **React Redux** `9.2.0` - React bindings for Redux

### LLM Integration
- **llama.rn** `0.9.0-rc.2` - React Native binding for llama.cpp
- Downloads Llama models from Hugging Face
- Uses llama.rn to load and run GGUF format models
- CPU and GPU inference (with fallback to CPU)

### Navigation
- **@react-navigation/native** `7.1.19` - Navigation library
- **@react-navigation/drawer** `7.7.2` - Drawer navigation

### UI Components
- **@shopify/flash-list** `2.2.0` - High-performance list component
- **react-native-gesture-handler** `2.28.0` - Gesture handling
- **react-native-reanimated** `4.1.3` - Animations
- **react-native-safe-area-context** `5.6.2` - Safe area handling

### File System & Storage
- **react-native-fs** `2.20.0` - File system operations
- **react-native-sqlite-storage** `6.0.1` - SQLite database

### Utilities
- **axios** `1.13.2` - HTTP client for Hugging Face API
- **patch-package** `8.0.1` - Patch npm packages

## Prerequisites

- **Node.js** >= 20
- **React Native** development environment set up
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Yarn** package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd localLLM
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Running the App

### Start Metro Bundler
```bash
yarn start
```

### Run on Android
```bash
yarn android
```

### Run on iOS
```bash
yarn ios
```

## How to Use

### 1. Download Models
- Open the app (starts on download screen)
- Select a model format (Llama-3.2-1B-Instruct, Qwen2-0.5B-Instruct, etc.)
- Browse available GGUF files
- Download the desired model

### 2. Select Model
- Tap on a downloaded model to select it
- Selected model will be highlighted
- Model path is stored in Redux state

### 3. Load Model
- Navigate to Home screen
- Model automatically loads when selected
- Wait for "Model Loaded" confirmation

### 4. Chat
- Type your message in the input field
- Send message to start conversation
- View progress indicator during generation
- Conversation history is maintained in Redux

## Project Structure

```
localLLM/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── app/
│   │   ├── database/        # SQLite database operations
│   │   ├── reducers/        # Redux slices
│   │   │   ├── chat/        # Chat state management
│   │   │   └── model/       # Model state management
│   │   ├── services/        # API services
│   │   └── store/           # Redux store configuration
│   ├── components/          # Reusable components
│   ├── screens/             # Screen components
│   └── utils/               # Utility functions and types
├── spec/                    # Native module specifications
└── package.json
```

## Model Format

- **Format**: GGUF (GPT-Generated Unified Format)
- **Source**: Hugging Face repositories
- **Integration**: Models downloaded from Hugging Face are used with **llama.rn** for local inference
- **Supported Models**:
  - Llama-3.2-1B-Instruct
  - Qwen2-0.5B-Instruct
  - DeepSeek-R1-Distill-Qwen-1.5B
  - SmolLM2-1.7B-Instruct

## Features

- ✅ Model download from Hugging Face
- ✅ Model selection and loading
- ✅ Chat interface with conversation history
- ✅ Progress tracking during generation
- ✅ Redux state management
- ✅ SQLite database for model metadata
- 🚧 Streaming responses (in progress)
- 🚧 Multiple chat sessions (in progress)
- 🚧 Context window management (in progress)

## Known Limitations

- **GPU Support**: OpenCL/Hexagon backends not enabled (runs on CPU)
- **Context Window**: Fixed at 2048 tokens (no dynamic management)
- **Streaming**: Not yet implemented (uses batch completion)
- **Model Persistence**: Models stored in app documents directory

## Development Notes

- This is a **test repository** and **work in progress**
- Native module implementations are stubbed (TODO)
- Some features may be incomplete or experimental
- Model loading uses `llama.rn` library (check their docs for API changes)

## Troubleshooting

### Model Loading Issues
- Ensure model file exists in device storage
- Check file permissions
- Verify GGUF format compatibility

### Performance
- Models run on CPU (slower than GPU)
- Use quantized models (Q4_K_M, Q5_K_M) for better performance
- Larger models require more RAM

### Build Issues
- Run `yarn install` after pulling changes
- For iOS: `cd ios && pod install`
- Clear Metro cache: `yarn start --reset-cache`

## Contributing

This is a test repository. Contributions and feedback welcome!
