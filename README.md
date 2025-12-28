# Challenge 2048

TypeScript implementation of the classic puzzle game **2048**.

## 📂 Project Structure

- **src/** – Core game logic and components
- **tests/** – Unit tests written with Jest
- **index.html** – Entry point for running the game in the browser
- **.env.example** – Example environment variables file

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 16.x recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/miloshevmitko/challenge-2048.git

# Navigate into the project
cd challenge-2048

# Install dependencies
npm install
```

### Running the Game

Copy the **.env.example** file to **.env.development** and update the variable values.

```bash
npm run dev
```

The game can be accessed at http://localhost:5173/.

### Building the Game

Copy the **.env.example** file to **.env.production** and update the variable values.

```bash
# Build the game ready for deployment
npm run build

# Runs the game from the dist folder
npm run preview
```

The game can be accessed at http://localhost:4173/.

### Running Tests

```bash
npm run test:unit

# OR

npm run test:integration
```
