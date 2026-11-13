<#
================================================================================
 Smart Canteen Management System - Native Windows HTTP & REST API Server
 Zero Dependencies - Runs natively in Windows PowerShell!
================================================================================
#>

param(
    [int]$Port = 5000
)

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

# MIME types map
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

# DB storage file
$dataFile = Join-Path $baseDir "db.json"
if (-not (Test-Path $dataFile)) {
    @{
        orders = @()
        wallets = @{}
    } | ConvertTo-Json -Depth 5 | Set-Content $dataFile -Encoding utf8
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   ⚡ SMART CANTEEN MANAGEMENT SYSTEM SERVER STARTED" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [Web URL]  $prefix" -ForegroundColor Yellow
    Write-Host " [API Base] $prefix" -NoNewline -ForegroundColor Gray; Write-Host "api/" -ForegroundColor Yellow
    Write-Host " Serving directory: $baseDir" -ForegroundColor DarkGray
    Write-Host " Press Ctrl+C in this terminal to stop the server" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""

    # Open default browser
    Start-Process $prefix

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $rawUrl = $request.Url.LocalPath
        $timestamp = (Get-Date).ToString("HH:mm:ss")
        Write-Host "[$timestamp] $($request.HttpMethod) $rawUrl" -ForegroundColor Gray

        # -------------------------------------------------------------
        # REST API Endpoints
        # -------------------------------------------------------------
        if ($rawUrl.StartsWith("/api/")) {
            $response.ContentType = "application/json; charset=utf-8"
            $endpoint = $rawUrl.Substring(5) # strip '/api/'

            if ($endpoint -eq "health") {
                $payload = @{ status = "online"; time = (Get-Date).ToString("o") }
                $buffer = [System.Text.Encoding]::UTF8.GetBytes(($payload | ConvertTo-Json))
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            elseif ($endpoint -eq "stats") {
                $payload = @{
                    status = "active"
                    canteen = "SmartBite University Canteen"
                    server = "PowerShell Native Microserver"
                    version = "1.0.0"
                }
                $buffer = [System.Text.Encoding]::UTF8.GetBytes(($payload | ConvertTo-Json))
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            else {
                $response.StatusCode = 404
                $err = @{ error = "API Endpoint not found" } | ConvertTo-Json
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($err)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }

            $response.Close()
            continue
        }

        # -------------------------------------------------------------
        # Static Files Serving
        # -------------------------------------------------------------
        $filePath = if ($rawUrl -eq "/" -or $rawUrl -eq "") {
            Join-Path $baseDir "index.html"
        } else {
            Join-Path $baseDir $rawUrl.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }

        $response.Close()
    }
}
catch {
    Write-Host "Server error: $_" -ForegroundColor Red
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
