New-Item -Path $Env:NVM_HOME\bin -ItemType "directory" -Force | Out-Null
New-Item -Path $Env:NVM_HOME\dist -ItemType "directory" -Force | Out-Null
Copy-Item -Path .\bin\nvm.* -Destination $Env:NVM_HOME\bin
Copy-Item -Path .\dist\nvm.* -Destination $Env:NVM_HOME\dist
