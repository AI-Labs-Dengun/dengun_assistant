# PowerShell script to test the sendEmail function locally or against the deployed endpoint

# If testing locally, make sure you have the Node.js dependencies installed:
# cd functions/sendEmail
# npm install

# Test configuration
$testLocal = $false  # Set to $true to test locally, $false to test deployed function
$functionUrl = "https://us-central1-dengun-assistant.cloudfunctions.net/sendEmail"  # URL of the deployed function

# Test data
$testData = @{
    to = "leandro.justino@dengun.com"  # Updated to match the address used in the application
    subject = "Test Email from Dengun Assistant"
    content = "This is a test email from the Dengun Assistant email function."
    userName = "Test User"
    userEmail = "testuser@example.com"
    userPhone = "+1234567890"
}

# Convert to JSON
$jsonData = $testData | ConvertTo-Json

if ($testLocal) {
    # Test locally using Node.js (requires the function to be exported properly)
    Write-Host "Testing email function locally..."
    
    # Create a temporary test file
    $testFile = [System.IO.Path]::GetTempFileName() + ".js"
    
    # Write test code to the file
    @"
const { sendEmail } = require('./index.js');

// Mock request and response objects
const req = {
    method: 'POST',
    body: $jsonData,
    headers: {
        'content-type': 'application/json'
    }
};

const res = {
    status: (code) => {
        console.log(`Status code: ${code}`);
        return {
            send: (data) => {
                console.log('Response data:', data);
            }
        };
    }
};

// Call the function
sendEmail(req, res);
"@ | Out-File -FilePath $testFile -Encoding utf8
    
    # Run the test
    node $testFile
    
    # Clean up
    Remove-Item $testFile
} else {
    # Test the deployed function
    Write-Host "Testing deployed email function at: $functionUrl"
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Body $jsonData -Headers $headers
        Write-Host "Success! Response:" -ForegroundColor Green
        $response | ConvertTo-Json | Write-Host
    } catch {
        Write-Host "Error testing function:" -ForegroundColor Red
        Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Message: $($_.Exception.Message)"
        try {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorContent.Position = 0
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody"
        } catch {
            Write-Host "Could not read error response body."
        }
    }
}

Write-Host "Test completed." 