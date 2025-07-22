## 🌍 Environment Configuration

The app supports multiple build environments with different configurations:

### Environment Files

- `.env.dev` - Development environment
- `.env.prod` - Production environment

### Environment Variables

bash
APP_CONFIG=development|production
BASE_URL=http://your-api-base-url


### Build Flavors

- Development: `dev` flavor with `.dev` app ID suffix
- Production: `prod` flavor with standard app ID

## 🚀 Getting Started

### Prerequisites

1. Node.js: Version 18 or higher
2. React Native CLI: Latest version
3. Android Studio: For Android development
4. Xcode: For iOS development (macOS only)
5. Java Development Kit (JDK): Version 11 or higher

### Installation

1. Clone the repository:

bash
git clone <repository-url>
cd IMIS-SMIS


2. Install dependencies:

```bash
# Using Yarn (recommended)
yarn install

# Using npm
npm install
```

3. Install iOS dependencies (iOS only):

bash
cd ios && pod install && cd ..


4. Configure environment:

```bash
# Copy environment files and configure
cp example.env.dev .env.dev
cp example.env.prod .env.prod

# Edit the files with your API endpoints
```

## 🔨 Building the Application

### Development Builds

#### Android Development

```bash
# Debug build with dev flavor
yarn android:dev
# or
npm run android:dev

# Release build with dev flavor
yarn android:dev-release
# or
npm run android:dev-release
```

#### iOS Development

bash
# Standard iOS build
yarn ios
# or
npm run ios


### Production Builds

#### Android Production

```bash
# Debug build with prod flavor
yarn android:prod
# or
npm run android:prod

# Release build with prod flavor
yarn android:prod-release
# or
npm run android:prod-release
```

### Metro Server

```bash
# Start Metro bundler
yarn start
# or
npm start

# Reset cache if needed
yarn start --reset-cache
```

## 📦 Build Variants & Flavors

### Android Build Configuration

The app uses Android product flavors for different environments:

#### Development Flavor (`dev`)

- App Name: "Base IMIS Dev"
- Application ID: `com.baseimis.dev`
- Environment: Development settings
- Debug: Enabled with debug keystore

#### Production Flavor (`prod`)

- App Name: "Base IMIS"
- Application ID: `com.baseimis`
- Environment: Production settings
- Release: Optimized build with ProGuard

### Build Types

- Debug: Development builds with debugging enabled
- Release: Optimized builds for distribution
