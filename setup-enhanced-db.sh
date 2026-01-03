#!/bin/bash

# Enhanced Database Setup Script
# This script automates the migration to the enhanced schema

set -e  # Exit on error

echo "🚀 Enhanced Database Setup Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Docker is running
echo -e "${BLUE}📦 Step 1: Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Stop existing containers
echo -e "${BLUE}🛑 Step 2: Stopping existing containers...${NC}"
docker-compose down
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 3: Remove old database volume (fresh start)
echo -e "${BLUE}🗑️  Step 3: Removing old database volume for fresh start...${NC}"
docker volume rm hdse-ddi-database-design-and-implementation_mysql_data 2>/dev/null || true
echo -e "${GREEN}✅ Old volume removed (if it existed)${NC}"
echo ""

# Step 4: Start containers
echo -e "${BLUE}🚀 Step 4: Starting containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Containers started${NC}"
echo ""

# Step 5: Wait for MySQL to be ready
echo -e "${BLUE}⏳ Step 5: Waiting for MySQL to be ready...${NC}"
sleep 10
MAX_TRIES=30
TRIES=0
until docker exec helpdesk_mysql mysqladmin ping -h localhost -u root -prootpassword > /dev/null 2>&1 || [ $TRIES -eq $MAX_TRIES ]; do
    echo "   Waiting for MySQL... ($TRIES/$MAX_TRIES)"
    sleep 2
    TRIES=$((TRIES+1))
done

if [ $TRIES -eq $MAX_TRIES ]; then
    echo -e "${RED}❌ MySQL failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MySQL is ready${NC}"
echo ""

# Step 6: Install dependencies
echo -e "${BLUE}📦 Step 6: Installing dependencies...${NC}"
docker exec helpdesk_nextjs npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 7: Generate Prisma Client
echo -e "${BLUE}🔧 Step 7: Generating Prisma Client...${NC}"
docker exec helpdesk_nextjs npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 8: Push schema to database
echo -e "${BLUE}💾 Step 8: Pushing schema to database (with force reset)...${NC}"
docker exec helpdesk_nextjs npx prisma db push --force-reset --accept-data-loss
echo -e "${GREEN}✅ Schema pushed to database${NC}"
echo ""

# Step 9: Seed database
echo -e "${BLUE}🌱 Step 9: Seeding database...${NC}"
docker exec helpdesk_nextjs npm run prisma:seed
echo -e "${GREEN}✅ Database seeded${NC}"
echo ""

# Step 10: Success!
echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📊 Access your application:${NC}"
echo "  🌐 Next.js App:    http://localhost:3000"
echo "  🗄️  phpMyAdmin:     http://localhost:8080"
echo "  ✅ API Health:      http://localhost:3000/api/health"
echo ""
echo -e "${BLUE}🔑 Test Login Credentials:${NC}"
echo "  Email:    admin@manzaneque.com"
echo "  Password: password123"
echo ""
echo -e "${YELLOW}💡 Tip: Run 'docker exec -it helpdesk_nextjs npx prisma studio' to browse data${NC}"
echo ""
