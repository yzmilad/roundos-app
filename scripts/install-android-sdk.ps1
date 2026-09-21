$ErrorActionPreference = "Stop"
$tools = Join-Path $env:USERPROFILE "tools"
New-Item -ItemType Directory -Force -Path $tools | Out-Null

$msJdk = Get-ChildItem "C:\Program Files\Microsoft" -Directory -ErrorAction SilentlyContinue |
  Where-Object { Test-Path (Join-Path $_.FullName "bin\java.exe") } |
  Select-Object -First 1 -ExpandProperty FullName

$jdkRoot = if ($msJdk) { $msJdk } else { Join-Path $tools "jdk-17" }
if (-not (Test-Path (Join-Path $jdkRoot "bin\java.exe"))) {
  Write-Host "Downloading Temurin JDK 17 (no admin)..."
  $zip = Join-Path $tools "jdk17.zip"
  & curl.exe -L --retry 3 --fail --ssl-no-revoke -o $zip "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk"
  if ($LASTEXITCODE -ne 0) { throw "JDK download failed" }
  $extract = Join-Path $tools "jdk-17-extract"
  if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
  Expand-Archive -Path $zip -DestinationPath $extract -Force
  $inner = Get-ChildItem $extract -Directory | Select-Object -First 1
  if (Test-Path $jdkRoot) { Remove-Item -Recurse -Force $jdkRoot }
  Move-Item $inner.FullName $jdkRoot
  Remove-Item $zip -Force
  Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue
} else {
  Write-Host "Using JDK at $jdkRoot"
}

$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$cmdLatest = Join-Path $sdk "cmdline-tools\latest"
$sdkmanager = Join-Path $cmdLatest "bin\sdkmanager.bat"
if (-not (Test-Path $sdkmanager)) {
  Write-Host "Downloading Android cmdline-tools..."
  New-Item -ItemType Directory -Force -Path $sdk | Out-Null
  $czip = Join-Path $tools "cmdline-tools.zip"
  & curl.exe -L --retry 3 --fail --ssl-no-revoke -o $czip "https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip"
  if ($LASTEXITCODE -ne 0) { throw "cmdline-tools download failed" }
  $tmp = Join-Path $tools "cmdline-tmp"
  if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
  Expand-Archive -Path $czip -DestinationPath $tmp -Force
  New-Item -ItemType Directory -Force -Path $cmdLatest | Out-Null
  $src = Join-Path $tmp "cmdline-tools"
  Copy-Item -Path (Join-Path $src "*") -Destination $cmdLatest -Recurse -Force
  Remove-Item $czip -Force
  Remove-Item $tmp -Recurse -Force
}

$env:JAVA_HOME = $jdkRoot
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:Path = "$(Join-Path $jdkRoot 'bin');$(Join-Path $cmdLatest 'bin');$(Join-Path $sdk 'platform-tools');$env:Path"

Write-Host "Accepting SDK licenses and installing platforms..."
$pkgs = @(
  "platform-tools",
  "platforms;android-36",
  "platforms;android-35",
  "build-tools;36.0.0",
  "ndk;27.1.12260208"
)
$yes = "y`ny`ny`ny`ny`ny`ny`ny`ny`ny`n"
$yes | & $sdkmanager --sdk_root=$sdk --licenses | Out-Host
& $sdkmanager --sdk_root=$sdk @pkgs
if ($LASTEXITCODE -ne 0) { throw "sdkmanager packages failed" }
[Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkRoot, "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdk, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdk, "User")
Write-Host "JDK + Android SDK ready."
& (Join-Path $PSScriptRoot "env.ps1")
