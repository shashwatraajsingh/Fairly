#!/bin/bash

# Fairly - Quick Start Script
# This script helps you get started with the Fairly expense-sharing app

echo "🎉 Welcome to Fairly - Expense Sharing PWA"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and set:"
    echo "   - DATABASE_URL (your PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo ""
    read -p "Press Enter after you've configured .env..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🗄️  Setting up database..."
npm run db:push

echo ""
echo "🎨 Generating placeholder icons..."
node scripts/generate-icons.js

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "📱 Then visit: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full documentation"
echo "   - SETUP.md - Quick setup guide"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - PROJECT_SUMMARY.md - Project overview"
echo ""
echo "Happy coding! 🎉"
