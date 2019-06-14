function Find-Folders {
    [Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms") | Out-Null
    [System.Windows.Forms.Application]::EnableVisualStyles()
    $browse = New-Object System.Windows.Forms.FolderBrowserDialog
    $browse.SelectedPath = "$Env:HOMEDRIVE$Env:HOMEPATH"
    $browse.ShowNewFolderButton = $false
    $browse.Description = "Select or create a directory for NVMW HOME"

    $loop = $true
    while($loop)
    {
        if ($browse.ShowDialog() -eq "OK")
        {
            $loop = $false

		    #Insert your script here
            return $browse.SelectedPath
        } else
        {
            $res = [System.Windows.Forms.MessageBox]::Show("You clicked Cancel. Would you like to try again or exit?", "Select a location", [System.Windows.Forms.MessageBoxButtons]::RetryCancel)
            if($res -eq "Cancel")
            {
                #Ends script
                exit
            }
        }
    }
    $browse.SelectedPath
    $browse.Dispose()
}

function Get-NodeJS($version) {
    if ( -not (Test-Path $NVM_NODE_EXE) ) {
        Try {
            if ( -not (Test-Path $NVM_NODE )) {
                New-Item -Path "$NVM_NODE" -ItemType "directory" | Out-Null
            }

            if ( Test-Path Env:NVM_NODEJS_ORG_MIRROR ) {
                $nodejsMirror = $Env:NVM_NODEJS_ORG_MIRROR
                Write-Output "Using Env:NVM_NODEJS_ORG_MIRROR $nodejsMirror"
            } else {
                $nodejsMirror = "https://nodejs.org/dist"
            }
            $zipFile="node-$version-win-x64.zip"
            $nodejsBinUrl="$nodejsMirror/$version/$zipFile"
            $cacheDir="$NVM_CACHE\$version"
            if ( -not (Test-Path $cacheDir)) {
                New-Item -Path "$cacheDir" -ItemType "directory" | Out-Null
            }
            $destZipFile="$cacheDir\node.zip"
            "";"";"";"";"";"";
            Write-Output "Retrieving $nodejsBinUrl"
            Invoke-WebRequest $nodejsBinUrl -o $destZipFile

            Add-Type -Assembly System.IO.Compression.FileSystem
            $zip = [IO.Compression.ZipFile]::OpenRead($destZipFile)
            $zip.Entries | Where-Object {$_.Name -like 'node.exe'} | 
                ForEach-Object {[System.IO.Compression.ZipFileExtensions]::ExtractToFile($_, "$NVM_NODE_EXE", $true)}
            $zip.Dispose()

            # Expand-Archive "$destZipFile" $NVM_HOME\node
            # Remove-Item "$destZipFile"
        } Catch {
            Write-Error -Message "Retrieving node version $version binary failed  $_.Exception.Message"
            exit
        }
    }
}

function Add-Path {
    <#
      .SYNOPSIS
        Adds a Directory to the Current Path
      .DESCRIPTION
        Add a directory to the current path.  This is useful for 
        temporary changes to the path or, when run from your 
        profile, for adjusting the path within your powershell 
        prompt.
      .EXAMPLE
        Add-Path -Directory "C:\Program Files\Notepad++"
      .PARAMETER Directory
        The name of the directory to add to the current path.
    #>
  
    [CmdletBinding()]
    param (
      [Parameter(
        Mandatory=$True,
        ValueFromPipeline=$True,
        ValueFromPipelineByPropertyName=$True,
        HelpMessage='What directory would you like to add?')]
      [Alias('dir')]
      [string[]]$Directory
    )
  
    PROCESS {
      $Path = $env:PATH.Split(';').Where({ $_ -ne "" })

      foreach ($dir in $Directory) {
        if ($Path -contains $dir) {
            Write-Verbose "$dir is already present in PATH"
        } else {
            $Path += $dir
        }
      }
  
      $newPath = [String]::Join(';', $Path)
      $Env:Path="$newPath"
    }
  }

if ( Test-Path Env:NVM_HOME ) {
    $NVM_HOME = $Env:NVM_HOME
    Write-Output "Got NVM_HOME $NVM_HOME from Env"
} else {
    $NVM_HOME = Find-Folders "$Env:USERPROFILE"
    Write-Output "Selected folder for NVM_HOME $NVM_HOME"
}

$NVM_CACHE="$NVM_HOME\cache"
$NVM_NODE="$NVM_HOME\nodejs"
$NVM_BIN="$NVM_HOME\bin"
$NVM_NODE_EXE="$NVM_HOME\node.exe"

if ( -not (Test-Path $NVM_NODE_EXE ) ) {
    Get-NodeJS "v10.16.0"
}

Add-Path -Directory "$NVM_BIN"
$Env:NVM_LINK="$Env:USERPROFILE\nodejs"
$Env:NVM_HOME=$NVM_HOME
New-ItemProperty -Path "HKCU:\Environment" -Name "Path" -Value "$Env:Path" -Force | Out-Null
New-ItemProperty -Path "HKCU:\Environment" -Name "NVM_HOME" -Value "$NVM_HOME" -Force | Out-Null
# use setx once so it broadcasts WM_SETTINGCHANGE message
setx.exe NVM_LINK "$Env:USERPROFILE\nodejs" | Out-Null

# $NVM_NODE\node.exe setup.js
