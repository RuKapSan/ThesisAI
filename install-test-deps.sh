#!/bin/bash

echo "📦 Installing test dependencies for ThesisAI..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend test dependencies
echo "Installing backend test dependencies..."
cd backend
npm install --save-dev @types/jest jest supertest ts-jest @types/supertest

# Install frontend test dependencies  
echo "Installing frontend test dependencies..."
cd ../frontend
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom cypress

echo "✅ Test dependencies installed successfully!"
echo ""
echo "You can now run tests with:"
echo "  npm run test          - Run all unit tests"
echo "  npm run test:e2e      - Run E2E tests"
echo "  npm run test:coverage - Run tests with coverage"
echo "  npm run test:all      - Run all tests including E2E"