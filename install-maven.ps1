$mvnDir = "D:\FPT\ky7\Du-an_EXE\.maven"
New-Item -ItemType Directory -Path $mvnDir -Force | Out-Null
$zip = "$mvnDir\maven.zip"
Write-Host "Downloading Maven 3.9.9..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip" -OutFile $zip
Write-Host "Extracting..."
Expand-Archive $zip -DestinationPath $mvnDir -Force
Remove-Item $zip -Force
Write-Host "Maven installed at $mvnDir\apache-maven-3.9.9\bin\mvn"
