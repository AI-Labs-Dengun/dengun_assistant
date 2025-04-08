# PowerShell script to deploy the sendEmail function to Google Cloud Functions

# Load environment variables from .env file
$envFile = Join-Path -Path (Get-Location) -ChildPath "../../.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Set as environment variable
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Loaded $key from .env file"
        }
    }
} else {
    Write-Host "Warning: .env file not found at $envFile"
}

# Set deployment parameters
$projectId = "dengun-assistant"  # Update this to your Google Cloud project ID
$region = "us-central1"
$functionName = "sendEmail"

# Build the environment variables string for deployment
$envVars = @(
    "SMTP_HOST=$env:SMTP_HOST",
    "SMTP_PORT=$env:SMTP_PORT",
    "SMTP_SECURE=$env:SMTP_SECURE",
    "SMTP_USER=$env:SMTP_USER", 
    "SMTP_PASS=$env:SMTP_PASS",
    "EMAIL_FROM=$env:EMAIL_FROM"
) -join ","

Write-Host "Deploying sendEmail function with the following configuration:"
Write-Host "  - SMTP_HOST: $env:SMTP_HOST"
Write-Host "  - SMTP_PORT: $env:SMTP_PORT"
Write-Host "  - SMTP_USER: $env:SMTP_USER"
Write-Host "  - EMAIL_FROM: $env:EMAIL_FROM"

# Ask for confirmation before deploying
$confirmation = Read-Host "Do you want to deploy the function now? (y/n)"
if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "Deploying function..."
    
    # Check if gcloud is installed
    try {
        $gcloudVersion = gcloud --version
        Write-Host "Using gcloud: $gcloudVersion"
    } catch {
        Write-Host "Error: gcloud CLI not found. Please install the Google Cloud SDK first."
        Write-Host "Download at: https://cloud.google.com/sdk/docs/install"
        exit 1
    }
    
    # Deploy the function
    $deployCmd = "gcloud functions deploy $functionName --runtime nodejs18 --trigger-http --allow-unauthenticated --region=$region --set-env-vars $envVars"
    Write-Host "Running: $deployCmd"
    
    try {
        Invoke-Expression $deployCmd
        Write-Host "Deployment completed successfully." -ForegroundColor Green
        Write-Host "Your function URL is: https://$region-$projectId.cloudfunctions.net/$functionName"
    } catch {
        Write-Host "Error deploying function: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Deployment cancelled."
}

Write-Host "Script completed." 