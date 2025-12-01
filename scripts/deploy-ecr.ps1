# scripts/deploy-ecr.ps1
# Deploy geofence-be-nest to AWS ECR
# Usage: .\scripts\deploy-ecr.ps1 [tag]

param(
    [string]$Tag = ""
)

# Suppress native command errors being treated as terminating errors
$ErrorActionPreference = "Continue"

# Configuration
$AWS_REGION = "us-east-1"
$AWS_ACCOUNT_ID = "851725478821"
$ECR_REPOSITORY = "geofence-be"
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
$IMAGE_NAME = "$ECR_REGISTRY/$ECR_REPOSITORY"

# Default tag: date + short commit hash or 'local'
if (-not $Tag) {
    $DateTag = Get-Date -Format "yyyyMMdd"
    try {
        $GitHash = (git rev-parse --short HEAD 2>$null)
        $Tag = "$DateTag-$GitHash"
    } catch {
        $Tag = "$DateTag-local"
    }
}

Write-Host ""
Write-Host "Deploy geofence-be-nest to AWS ECR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Repository: $ECR_REPOSITORY" -ForegroundColor White
Write-Host "Tag: $Tag" -ForegroundColor Yellow
Write-Host "Region: $AWS_REGION" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify Docker is running
Write-Host "Checking Docker..." -ForegroundColor White
$dockerCheck = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "Docker OK" -ForegroundColor Green
Write-Host ""

# Verify AWS CLI is installed
Write-Host "Checking AWS CLI..." -ForegroundColor White
aws --version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: AWS CLI not installed" -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}
Write-Host "AWS CLI OK" -ForegroundColor Green
Write-Host ""

# 1. ECR Login
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1/5: Authenticating with AWS ECR" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
$LoginCommand = aws ecr get-login-password --region $AWS_REGION
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error getting ECR credentials" -ForegroundColor Red
    Write-Host "Verify AWS credentials with: aws configure" -ForegroundColor Yellow
    exit 1
}
$LoginCommand | docker login --username AWS --password-stdin $ECR_REGISTRY
if ($LASTEXITCODE -ne 0) {
    Write-Host "ECR login failed" -ForegroundColor Red
    exit 1
}
Write-Host "ECR login successful" -ForegroundColor Green
Write-Host ""

# 2. Build image
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2/5: Building Docker image" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

docker build -t "${ECR_REPOSITORY}:${Tag}" .
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Image build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Image built successfully" -ForegroundColor Green
Write-Host ""

# Tag image
Write-Host "Tagging image..." -ForegroundColor White
docker tag "${ECR_REPOSITORY}:${Tag}" "${IMAGE_NAME}:${Tag}"
docker tag "${ECR_REPOSITORY}:${Tag}" "${IMAGE_NAME}:latest"
Write-Host "Tags applied: ${Tag}, latest" -ForegroundColor Green
Write-Host ""

# 3. Push image with specific tag
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3/5: Pushing image ${Tag}" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker push "${IMAGE_NAME}:${Tag}"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Failed to push tagged image" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "Image ${Tag} pushed successfully" -ForegroundColor Green
Write-Host ""

# 4. Push latest
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4/5: Updating :latest tag" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker push "${IMAGE_NAME}:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Failed to push latest image" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "Latest tag updated successfully" -ForegroundColor Green
Write-Host ""

# 5. Cleanup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 5/5: Cleaning up old local images" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
docker image prune -f | Out-Null
Write-Host "Cleanup completed" -ForegroundColor Green
Write-Host ""

# Final summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOY COMPLETED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Images available in ECR:" -ForegroundColor Cyan
Write-Host "  ${IMAGE_NAME}:${Tag}" -ForegroundColor Yellow
Write-Host "  ${IMAGE_NAME}:latest" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Pull image:" -ForegroundColor White
Write-Host "  docker pull ${IMAGE_NAME}:${Tag}" -ForegroundColor Gray
Write-Host ""
Write-Host "  Run locally:" -ForegroundColor White
Write-Host "  docker run -p 3000:3000 --env-file .env ${IMAGE_NAME}:${Tag}" -ForegroundColor Gray
Write-Host ""
Write-Host "  View in AWS Console:" -ForegroundColor White
Write-Host "  https://console.aws.amazon.com/ecr/repositories/private/${AWS_ACCOUNT_ID}/${ECR_REPOSITORY}" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
