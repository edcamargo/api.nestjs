#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 NestJS API - Development Setup${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) detected${NC}\n"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Generate Prisma Client
echo -e "\n${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

# Run migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate dev --name init

# Seed database
echo -e "\n${YELLOW}🌱 Seeding database...${NC}"
npx prisma db seed

echo -e "\n${GREEN}✅ Setup completed!${NC}\n"

# Display credentials
echo -e "${BLUE}📋 Default Credentials:${NC}"
echo -e "   Email: ${GREEN}rambo@rambo.com${NC}"
echo -e "   Password: ${GREEN}secret123${NC}\n"

# Display commands
echo -e "${BLUE}📝 Available Commands:${NC}"
echo -e "   ${GREEN}npm run start:dev${NC}       - Start development server"
echo -e "   ${GREEN}npm run test:unit${NC}       - Run unit tests"
echo -e "   ${GREEN}npm run test:e2e${NC}        - Run E2E tests"
echo -e "   ${GREEN}npm run lint${NC}            - Run linter"
echo -e "   ${GREEN}npm run format${NC}          - Format code"
echo -e "   ${GREEN}npm run prisma:studio${NC}   - Open Prisma Studio\n"

echo -e "${BLUE}🐳 Docker Commands:${NC}"
echo -e "   ${GREEN}docker-compose up -d${NC}    - Start all services"
echo -e "   ${GREEN}docker-compose logs -f${NC}  - View logs"
echo -e "   ${GREEN}docker-compose down${NC}     - Stop all services\n"

echo -e "${YELLOW}Ready to start? Run:${NC} ${GREEN}npm run start:dev${NC}\n"
