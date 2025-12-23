# Security Enhancement Installation Script

Write-Host "🔒 Installing Security Packages..." -ForegroundColor Cyan

cd backend

# Install security packages
npm install helmet express-mongo-sanitize express-rate-limit express-validator

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Security packages installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Review SECURITY_FIXES.md for critical actions" -ForegroundColor White
    Write-Host "2. Change your MongoDB password IMMEDIATELY" -ForegroundColor Red
    Write-Host "3. Generate new JWT_SECRET and SESSION_SECRET" -ForegroundColor Red
    Write-Host "4. Update your .env file with new credentials" -ForegroundColor White
    Write-Host "5. Restart your backend server" -ForegroundColor White
} else {
    Write-Host "❌ Installation failed. Please check the error messages above." -ForegroundColor Red
}
