$ErrorActionPreference = "Stop"
$jdkCandidates = @(
  (Join-Path $env:USERPROFILE "tools\jdk-17"),
  "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
)
$jdk = $jdkCandidates | Where-Object { Test-Path (Join-Path $_ "bin\java.exe") } | Select-Object -First 1
$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
if ($jdk) { $env:JAVA_HOME = $jdk }
if (Test-Path $sdk) { $env:ANDROID_HOME = $sdk; $env:ANDROID_SDK_ROOT = $sdk }
$bits = @()
if ($env:JAVA_HOME) { $bits += Join-Path $env:JAVA_HOME "bin" }
if ($env:ANDROID_HOME) {
  $bits += Join-Path $env:ANDROID_HOME "platform-tools"
  $bits += Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin"
  $bits += Join-Path $env:ANDROID_HOME "emulator"
}
$env:Path = ($bits + $env:Path) -join ";"
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
if (Get-Command java -ErrorAction SilentlyContinue) { java -version 2>&1 | Select-Object -First 1 }
if (Get-Command adb -ErrorAction SilentlyContinue) { adb version | Select-Object -First 1 }
